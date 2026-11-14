// ForkFeed server — zero-dependency Node.js backend (node:sqlite + node:http)
// Serves the app, provides auth, recipes, social, meal plans, AI proxy, YouTube, URL extraction.
'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const APP_FILE = path.join(ROOT, 'public', 'ForkFeed.html');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
const DB_FILE = path.join(DATA_DIR, 'forkfeed.db');
for (const d of [DATA_DIR, path.join(ROOT, 'public')]) fs.mkdirSync(d, { recursive: true });

const VERSION = '1.0.0';
const PORT = Number(process.env.PORT || 3000);

// ---------------- config ----------------
let CONFIG = { keys: {} };
function loadConfig() { try { CONFIG = Object.assign({ adminToken: null }, CONFIG, JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'))); } catch {} }
function saveConfig(patch) { CONFIG = Object.assign(CONFIG, patch); fs.writeFileSync(CONFIG_FILE, JSON.stringify(CONFIG, null, 2)); }
loadConfig();
if (!CONFIG.adminToken) { CONFIG.adminToken = crypto.randomBytes(24).toString('hex'); saveConfig({}); }
const ADMIN_TOKEN = CONFIG.adminToken;

// ---------------- db ----------------
const db = new DatabaseSync(DB_FILE);
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  handle TEXT UNIQUE NOT NULL,
  pass_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  bio TEXT DEFAULT '',
  avatar TEXT DEFAULT '',
  created_at INTEGER DEFAULT (unixepoch())
);
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  created_at INTEGER DEFAULT (unixepoch()),
  expires_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS recipes (
  id TEXT PRIMARY KEY,
  user_id INTEGER,
  title TEXT NOT NULL,
  creator TEXT,
  creator_handle TEXT,
  cuisine TEXT,
  time INTEGER,
  difficulty TEXT,
  servings INTEGER,
  likes INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  rating REAL DEFAULT 0,
  ratings_count INTEGER DEFAULT 0,
  image TEXT,
  hashtags TEXT DEFAULT '[]',
  desc TEXT DEFAULT '',
  ingredients TEXT DEFAULT '[]',
  steps TEXT DEFAULT '[]',
  nutrition TEXT DEFAULT '{}',
  yt_id TEXT DEFAULT '',
  live INTEGER DEFAULT 0,
  viewers INTEGER DEFAULT 0,
  user_made INTEGER DEFAULT 0,
  scyn_curated INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch())
);
CREATE TABLE IF NOT EXISTS likes (
  user_id INTEGER NOT NULL,
  recipe_id TEXT NOT NULL,
  created_at INTEGER DEFAULT (unixepoch()),
  PRIMARY KEY (user_id, recipe_id)
);
CREATE TABLE IF NOT EXISTS ratings (
  user_id INTEGER NOT NULL,
  recipe_id TEXT NOT NULL,
  stars INTEGER NOT NULL CHECK(stars BETWEEN 1 AND 5),
  created_at INTEGER DEFAULT (unixepoch()),
  PRIMARY KEY (user_id, recipe_id)
);
CREATE TABLE IF NOT EXISTS saves (
  user_id INTEGER NOT NULL,
  recipe_id TEXT NOT NULL,
  PRIMARY KEY (user_id, recipe_id)
);
CREATE TABLE IF NOT EXISTS follows (
  follower_id INTEGER NOT NULL,
  followee_id INTEGER NOT NULL,
  PRIMARY KEY (follower_id, followee_id)
);
CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipe_id TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  text TEXT NOT NULL,
  created_at INTEGER DEFAULT (unixepoch())
);
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  ico TEXT DEFAULT '🔔',
  title TEXT NOT NULL,
  msg TEXT DEFAULT '',
  read INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch())
);
CREATE TABLE IF NOT EXISTS mealplans (
  user_id INTEGER NOT NULL,
  day_key TEXT NOT NULL,
  slot TEXT NOT NULL,
  recipe_id TEXT NOT NULL,
  PRIMARY KEY (user_id, day_key, slot)
);
CREATE TABLE IF NOT EXISTS cooked_steps (
  user_id INTEGER NOT NULL,
  recipe_id TEXT NOT NULL,
  step INTEGER NOT NULL,
  PRIMARY KEY (user_id, recipe_id, step)
);
`);

// ---------------- helpers ----------------
const J = obj => JSON.stringify(obj);
function send(res, code, body, headers) {
  const h = Object.assign({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }, headers || {});
  res.writeHead(code, h); res.end(typeof body === 'string' ? body : JSON.stringify(body));
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let b = ''; req.on('data', c => { b += c; if (b.length > 25e6) reject(new Error('body too large')); });
    req.on('end', () => { try { resolve(b ? JSON.parse(b) : {}); } catch (e) { reject(new Error('invalid JSON')); } });
    req.on('error', reject);
  });
}
function hashPassword(pw, salt) { return crypto.scryptSync(pw, salt, 32).toString('hex'); }
function newSalt() { return crypto.randomBytes(16).toString('hex'); }
function authUser(req) {
  const h = req.headers['authorization'] || '';
  const m = h.match(/^Bearer (.+)$/);
  if (!m) return null;
  const row = db.prepare('SELECT s.user_id AS id, u.username, u.handle, u.bio, u.avatar FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=? AND s.expires_at > unixepoch()').get(m[1]);
  return row ? { ...row, token: m[1] } : null;
}
function requireAuth(req, res) { const u = authUser(req); if (!u) { send(res, 401, { error: 'auth required' }); return null; } return u; }
function notify(userId, ico, title, msg) {
  db.prepare('INSERT INTO notifications (user_id, ico, title, msg) VALUES (?,?,?,?)').run(userId, ico, title, msg || '');
}
function recipeRow(r) {
  if (!r) return null;
  return {
    id: r.id, title: r.title, creator: r.creator || 'ForkFeed', creatorHandle: r.creator_handle || '@forkfeed',
    cuisine: r.cuisine || 'American', time: r.time || 30, difficulty: r.difficulty || 'Easy',
    servings: r.servings || 4, likes: r.likes || 0, commentsCount: r.comments_count || 0, saves: r.saves || 0,
    rating: r.rating || 0, ratingsCount: r.ratings_count || 0, myRating: 0,
    image: r.image || '', hashtags: JSON.parse(r.hashtags || '[]'), desc: r.desc || '',
    ingredients: JSON.parse(r.ingredients || '[]'), steps: JSON.parse(r.steps || '[]'),
    nutrition: JSON.parse(r.nutrition || '{}'), ytId: r.yt_id || '', live: !!r.live,
    viewers: r.viewers || 0, userMade: !!r.user_made, scynCurated: !!r.scyn_curated,
    created: (r.created_at || 0) * 1000
  };
}
function myRecipeJSON(r, uid) {
  const base = recipeRow(r);
  if (uid && base) {
    base.likedByMe = !!db.prepare('SELECT 1 FROM likes WHERE user_id=? AND recipe_id=?').get(uid, r.id);
    base.savedByMe = !!db.prepare('SELECT 1 FROM saves WHERE user_id=? AND recipe_id=?').get(uid, r.id);
    const mr = db.prepare('SELECT stars FROM ratings WHERE user_id=? AND recipe_id=?').get(uid, r.id);
    base.myRating = mr ? mr.stars : 0;
  } else { base.likedByMe = false; base.savedByMe = false; base.myRating = 0; }
  return base;
}
function publicUser(u) { return { id: u.id, username: u.username, handle: u.handle, bio: u.bio || '', avatar: u.avatar || '' }; }

// ---------------- static ----------------
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };
function serveApp(res) {
  fs.readFile(APP_FILE, (err, buf) => {
    if (err) { send(res, 500, { error: 'app not built — run scripts/build.py first' }); return; }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(buf);
  });
}

// ---------------- AI engine (server-side) ----------------
const TONE_PRESETS = {
  warm: { name: 'Warm Chef', style: 'Speak warmly like a mentor chef who believes in the home cook.' },
  gordon: { name: 'Gordon Mode', style: 'Be a fiery intense chef. Blunt, dramatic, but never actually insulting. Push standards high.' },
  sensei: { name: 'Calm Sensei', style: 'Speak slowly and calmly like a tea master. Short precise sentences. One wisdom per answer.' },
  hype: { name: 'Hype Friend', style: 'You are the user\'s hype friend. High energy, exclamation marks, celebrate every step.' },
  grandma: { name: 'Grandma', style: 'You are a loving grandmother chef. Nostalgic, tender, mention smells and family memories. Pinch of this, fistful of that.' }
};
const AI_SYS = 'You are ForkFeed\'s AI Chef inside a cooking app. You know food science, technique, substitutions, nutrition and grocery pricing. Answer helpfully, practically, and with warmth. Keep answers compact (under 130 words) unless asked for a full recipe. Use metric-friendly quantities. If asked about a dish in context, reference its actual ingredients.';

function builtinChefReply(msg, ctx) {
  const m = (msg || '').toLowerCase();
  const rec = ctx && ctx.recipe;
  const tone = (ctx && ctx.tone) || 'warm';
  const tonePrefix = { warm: 'Of course — ', gordon: 'Right, LISTEN. ', sensei: '', hype: 'YESSS! ', grandma: 'Ah, sweetheart — ' }[tone] || '';
  const joke = 'Why did the chef quit? They just couldn\'t take the heat... but you can. 🍳';
  if (rec) {
    if (m.includes('ingredient') || m.includes('need')) return `${tonePrefix}for ${rec.title} you'll need: ${rec.ingredients.slice(0, 6).map(i => `${i.qty} ${i.unit ? i.unit + ' ' : ''}${i.name.split(',')[0]}`).join('; ')}${rec.ingredients.length > 6 ? `, and ${rec.ingredients.length - 6} more (see the Ingredients tab)` : ''}. Tap Shop Ingredients and I'll route you to a grocer in your country.`;
    if (m.includes('step') || m.includes('how')) return `${tonePrefix}the flow is: ${rec.steps.slice(0, 3).map((s, i) => `(${i + 1}) ${s.split('.')[0].toLowerCase()}`).join(' → ')} … full ${rec.steps.length}-step guide is in the Steps tab. Want me to guide you live on camera? Tap Chef → AI Live.`;
    if (m.includes('calor') || m.includes('nutrition') || m.includes('healthy')) { const n = rec.nutrition; return `${tonePrefix}${rec.title} lands at ~${n.cal} kcal per serving — ${n.protein}g protein, ${n.carbs}g carbs, ${n.fat}g fat, ${n.fiber}g fiber. Watch ${n.sodium > 1000 ? 'the sodium — season at the table instead of the pan.' : 'nothing; solid, balanced plate.'}`; }
    if (m.includes('joke')) return joke;
    if (m.includes('cost') || m.includes('price') || m.includes('estimat')) return `${tonePrefix}rough estimate: ${rec.ingredients.length} ingredients ≈ $${(rec.ingredients.length * 3.2).toFixed(0)}–${(rec.ingredients.length * 4.5).toFixed(0)} total, about $${(rec.ingredients.length * 3.7 / rec.servings).toFixed(1)} per serving depending on your market. Tap "Shop Ingredients" for live prices at a grocer near you.`;
  }
  if (m.includes('joke')) return joke;
  if (m.includes('20-minute') || m.includes('quick')) return `${tonePrefix}try a 20-minute one-pan dinner: sear protein hard, add aromatics, deglaze with stock, finish with butter and lemon. Or tell me what's in your fridge and I'll match something faster.`;
  if (m.includes('have') || m.includes('fridge') || m.includes('leftover')) return `${tonePrefix}list what's in your fridge (even messy: "eggs, old bread, half an onion") and I'll match it against the recipes in your feed and scale servings to what you have.`;
  if (m.includes('hello') || m.includes('hi ') || m === 'hi' || m.includes('hey')) return `${tonePrefix}I'm your ForkFeed chef. Ask me to build a grocery list, scale servings, swap an ingredient for your diet, price a dish, or coach you live while you cook.`;
  return `${tonePrefix}I can plan meals, scale recipes, find substitutions (gluten-free, dairy-free, vegan, keto), estimate cost per serving, or coach you through ${rec ? rec.title : 'any recipe'} step by step with the Voice Chef. What are we cooking?`;
}

async function callOpenAICompatible(url, key, model, messages) {
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key }, body: JSON.stringify({ model, messages, max_tokens: 400 }) });
  if (!r.ok) throw new Error(`${new URL(url).host} ${r.status}`);
  const j = await r.json();
  return j.choices[0].message.content;
}
async function callGemini(key, model, text) {
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text }] }] }) });
  if (!r.ok) throw new Error('Gemini ' + r.status);
  const j = await r.json();
  return j.candidates[0].content.parts.map(p => p.text || '').join('');
}
async function callOllama(model, messages) {
  const r = await fetch('http://localhost:11434/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model, messages, stream: false }) });
  if (!r.ok) throw new Error('Ollama ' + r.status);
  const j = await r.json();
  return j.message.content;
}
async function serverAI(msg, ctx, provider, model, tone, keyOverride) {
  const keys = keyOverride || CONFIG.keys || {};
  const style = (TONE_PRESETS[tone] || TONE_PRESETS.warm).style;
  const sys = AI_SYS + ' TONE: ' + style;
  const ctxLine = ctx && ctx.recipe ? `\n[Context: user is viewing "${ctx.recipe.title}" — ${ctx.recipe.cuisine}, ${ctx.recipe.time} min, ingredients: ${ctx.recipe.ingredients.map(i => i.name).slice(0, 6).join(', ')}]` : '';
  const messages = [{ role: 'system', content: sys + ctxLine }, { role: 'user', content: msg }];
  if (provider === 'openai' && keys.openai) return callOpenAICompatible('https://api.openai.com/v1/chat/completions', keys.openai, model || 'gpt-4o-mini', messages);
  if (provider === 'openrouter' && keys.openrouter) {
    const m = model && model.includes(':free') ? model : 'meta-llama/llama-3.1-8b-instruct:free';
    return callOpenAICompatible('https://openrouter.ai/api/v1/chat/completions', keys.openrouter, m, messages);
  }
  if (provider === 'gemini' && keys.gemini) return callGemini(keys.gemini, model || 'gemini-1.5-flash', sys + ctxLine + '\nUser: ' + msg);
  if (provider === 'ollama') {
    try { return await callOllama(model || 'llama3.2', messages); }
    catch (e) { return '⚠️ Could not reach Ollama at localhost:11434 (' + e.message + '). Start it with `ollama serve` and pull a model, e.g. `ollama pull llama3.2`. Meanwhile, here is my built-in take:\n\n' + builtinChefReply(msg, ctx); }
  }
  if ((provider === 'openai' || provider === 'openrouter' || provider === 'gemini') && !keys[provider]) {
    return `⚠️ No ${provider} key configured on the server. Admin: set it with \`curl -X POST localhost:${PORT}/admin/keys -H "Authorization: Bearer <admin>" -d '{"openai":"sk-…"}'\`. Meanwhile — built-in answer:\n\n` + builtinChefReply(msg, ctx);
  }
  await new Promise(r => setTimeout(r, 400));
  return builtinChefReply(msg, ctx);
}

// ---------------- URL extraction (real JSON-LD Recipe parsing) ----------------
async function extractRecipeFromURL(url) {
  if (!/^https?:\/\//i.test(url)) throw new Error('invalid URL');
  const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ForkFeed/1.0)' }, redirect: 'follow', signal: AbortSignal.timeout(12000) });
  if (!r.ok) throw new Error('fetch failed: ' + r.status);
  const html = await r.text();
  const de = s => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&nbsp;/g, ' ');
  let recipe = null;
  // 1) JSON-LD
  const ldRe = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi; let m;
  while ((m = ldRe.exec(html)) && !recipe) {
    try {
      const parsed = JSON.parse(m[1]);
      const nodes = Array.isArray(parsed) ? parsed : [parsed, ...(parsed['@graph'] || [])];
      for (const n of nodes) {
        const types = Array.isArray(n['@type']) ? n['@type'] : [n['@type']];
        if (types && types.some(t => String(t).toLowerCase() === 'recipe')) { recipe = n; break; }
      }
    } catch {}
  }
  // 2) OpenGraph fallback
  if (!recipe) {
    const og = k => { const mm = html.match(new RegExp(`<meta[^>]+property=["']og:${k}["'][^>]+content=["']([^"']*)["']`, 'i')) || html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:${k}["']`, 'i')); return mm ? de(mm[1]) : ''; };
    if (og('title')) recipe = { name: de(og('title')), image: [og('image')], description: og('description') || '' };
  }
  if (!recipe) throw new Error('no recipe data found on that page');
  const title = de(String(recipe.name || recipe.headline || 'Extracted Recipe'));
  const image = (Array.isArray(recipe.image) ? recipe.image[0] : recipe.image) || (Array.isArray(recipe.thumbnailUrl) ? recipe.thumbnailUrl[0] : recipe.thumbnailUrl) || '';
  const ingRaw = recipe.recipeIngredient || recipe.ingredients || [];
  const ingredients = ingRaw.map(s => {
    const t = de(String(s));
    const qm = t.match(/^([\d.,\/\s-]+\s*(?:[a-z]+\.?\s+)?)?(.*)$/i);
    const qty = parseFloat(String((qm && qm[1]) || '').replace(/[^\d.\/]/g, '')) || 1;
    return { qty, unit: '', name: t };
  });
  const steps = (recipe.recipeInstructions || []).map(s => typeof s === 'string' ? de(s) : de(String((s.text || '')).replace(/<[^>]+>/g, ' ')));
  // ISO 8601 duration (PT1H30M / PT10M) → minutes
  const isoDur = d => {
    if (!d) return 0;
    const s = String(d).match(/^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?/i);
    if (!s) return parseInt(String(d).replace(/[^\d]/g, '')) || 0;
    return (Number(s[1]) || 0) * 1440 + (Number(s[2]) || 0) * 60 + (Number(s[3]) || 0);
  };
  const time = isoDur(recipe.totalTime) || isoDur(recipe.cookTime) || parseInt(recipe.totalTime) || 30;
  // nutrition normalized to app schema
  const nutrition = {};
  try {
    const n = recipe.nutrition || recipe.nutritionInfo || {};
    const grab = (src, dst) => { const v = n[src]; if (v !== undefined) { const num = parseFloat(String(v).replace(/[^\d.]/g, '')); if (!isNaN(num)) nutrition[dst] = Math.round(num); } };
    grab('calories', 'cal'); grab('proteinContent', 'protein'); grab('fatContent', 'fat');
    grab('carbohydrateContent', 'carbs'); grab('fiberContent', 'fiber'); grab('sugarContent', 'sugar'); grab('sodiumContent', 'sodium');
  } catch {}
  return {
    title, image: String(image), desc: de(String(recipe.description || '').replace(/<[^>]+>/g, ' ')).slice(0, 300),
    cuisine: de(String(recipe.recipeCuisine || 'American')), time: time || 30,
    difficulty: 'Medium', servings: (recipe.recipeYield && parseInt(String(recipe.recipeYield))) || 4,
    ingredients: ingredients.length ? ingredients : [{ qty: 1, unit: '', name: 'see source' }],
    steps: steps.length ? steps : ['See the original recipe at ' + url],
    nutrition: Object.keys(nutrition).length ? nutrition : { cal: 450, protein: 20, carbs: 40, fat: 20, fiber: 3, sugar: 5, sodium: 600 },
    sourceUrl: url
  };
}

// ---------------- router ----------------
const routes = [];
function route(method, pattern, handler, opts) { routes.push({ method, pattern, handler, admin: opts && opts.admin }); }

// health
route('GET', '/api/health', async (req, res) => {
  send(res, 200, { ok: true, version: VERSION, uptime: process.uptime(), users: db.prepare('SELECT COUNT(*) c FROM users').get().c, recipes: db.prepare('SELECT COUNT(*) c FROM recipes').get().c, providerKeys: Object.keys(CONFIG.keys || {}) });
});

// auth
route('POST', '/api/auth/register', async (req, res) => {
  const b = await readBody(req);
  const username = String(b.username || '').trim(), password = String(b.password || '');
  if (!username || !password) return send(res, 400, { error: 'username and password required' });
  if (password.length < 6) return send(res, 400, { error: 'password must be 6+ characters' });
  const handle = '@' + username.toLowerCase().replace(/[^a-z0-9_.]/g, '');
  if (db.prepare('SELECT 1 FROM users WHERE username=? OR handle=?').get(username, handle)) return send(res, 409, { error: 'username taken' });
  const salt = newSalt();
  const info = db.prepare('INSERT INTO users (username, handle, pass_hash, salt, bio) VALUES (?,?,?,?,?)').run(username, handle, hashPassword(password, salt), salt, 'Cooking my way through the feed. 🍳');
  const uid = Number(info.lastInsertRowid);
  const token = crypto.randomBytes(32).toString('hex');
  db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?,?,?)').run(token, uid, Math.floor(Date.now() / 1000) + 30 * 86400);
  notify(uid, '🍳', 'Welcome to ForkFeed!', 'Your account is live — likes, saves and meal plans now sync to the server.');
  send(res, 201, { token, user: publicUser(db.prepare('SELECT * FROM users WHERE id=?').get(uid)) });
});
route('POST', '/api/auth/login', async (req, res) => {
  const b = await readBody(req);
  const u = db.prepare('SELECT * FROM users WHERE username=?').get(String(b.username || ''));
  if (!u || hashPassword(String(b.password || ''), u.salt) !== u.pass_hash) return send(res, 401, { error: 'wrong username or password' });
  const token = crypto.randomBytes(32).toString('hex');
  db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?,?,?)').run(token, u.id, Math.floor(Date.now() / 1000) + 30 * 86400);
  send(res, 200, { token, user: publicUser(u) });
});
route('POST', '/api/auth/logout', async (req, res) => {
  const u = authUser(req); if (u) db.prepare('DELETE FROM sessions WHERE token=?').run(u.token);
  send(res, 200, { ok: true });
});
route('GET', '/api/auth/me', async (req, res) => {
  const u = requireAuth(req, res); if (!u) return;
  const stats = {
    followers: db.prepare('SELECT COUNT(*) c FROM follows WHERE followee_id=?').get(u.id).c,
    following: db.prepare('SELECT COUNT(*) c FROM follows WHERE follower_id=?').get(u.id).c,
    recipes: db.prepare('SELECT COUNT(*) c FROM recipes WHERE user_id=?').get(u.id).c,
    saves: db.prepare('SELECT COUNT(*) c FROM saves WHERE user_id=?').get(u.id).c
  };
  send(res, 200, { user: { ...publicUser(u), stats } });
});
route('PATCH', '/api/auth/me', async (req, res) => {
  const u = requireAuth(req, res); if (!u) return;
  const b = await readBody(req);
  db.prepare('UPDATE users SET username=?, handle=?, bio=?, avatar=? WHERE id=?').run(
    String(b.username || u.username).slice(0, 40), String(b.handle || u.handle).slice(0, 40), String(b.bio || u.bio || '').slice(0, 300), String(b.avatar || u.avatar || '').slice(0, 500), u.id);
  send(res, 200, { user: publicUser(db.prepare('SELECT * FROM users WHERE id=?').get(u.id)) });
});

// recipes
route('GET', '/api/recipes', async (req, res) => {
  const u = authUser(req);
  const url = new URL(req.url, 'http://x');
  let rows = db.prepare('SELECT * FROM recipes ORDER BY live DESC, (likes+saves*3) DESC, created_at DESC').all();
  const cuisine = url.searchParams.get('cuisine'); const q = url.searchParams.get('q'); const sort = url.searchParams.get('sort');
  if (cuisine && cuisine !== 'All') rows = rows.filter(r => r.cuisine === cuisine);
  if (q) { const ql = q.toLowerCase().replace('#', ''); rows = rows.filter(r => (r.title + ' ' + r.cuisine + ' ' + r.hashtags + ' ' + r.creator + ' ' + r.desc).toLowerCase().includes(ql)); }
  if (sort === 'new') rows = rows.sort((a, b) => b.created_at - a.created_at);
  if (sort === 'top') rows = rows.sort((a, b) => b.saves - a.saves);
  if (sort === 'rating') rows = rows.sort((a, b) => (b.rating || 0) - (a.rating || 0) || (b.ratings_count || 0) - (a.ratings_count || 0));
  const mine = url.searchParams.get('mine');
  if (mine === '1' && u) rows = rows.filter(r => r.user_id === u.id);
  send(res, 200, { recipes: rows.map(r => myRecipeJSON(r, u && u.id)) });
});
route('GET', '/api/recipes/:id', async (req, res, params) => {
  const u = authUser(req);
  const r = db.prepare('SELECT * FROM recipes WHERE id=?').get(params.id);
  if (!r) return send(res, 404, { error: 'not found' });
  const comments = db.prepare('SELECT c.id, c.text, c.created_at, u.username, u.handle FROM comments c JOIN users u ON u.id=c.user_id WHERE c.recipe_id=? ORDER BY c.created_at DESC LIMIT 50').all(params.id)
    .map(c => ({ id: c.id, text: c.text, who: c.username, handle: c.handle, ts: c.created_at * 1000 }));
  send(res, 200, { recipe: myRecipeJSON(r, u && u.id), comments });
});
route('POST', '/api/recipes', async (req, res) => {
  const u = requireAuth(req, res); if (!u) return;
  const b = await readBody(req);
  if (!b.title) return send(res, 400, { error: 'title required' });
  const id = 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  db.prepare(`INSERT INTO recipes (id,user_id,title,creator,creator_handle,cuisine,time,difficulty,servings,likes,comments_count,saves,rating,ratings_count,image,hashtags,desc,ingredients,steps,nutrition,yt_id,user_made,scyn_curated,live)
    VALUES (?,?,?,?,?,?,?,?,?,0,0,0,0,0,?,?,?,?,?,?,?,0,1,0)`).run(
    id, u.id, String(b.title).slice(0, 120), u.username, u.handle, String(b.cuisine || 'American'), Number(b.time) || 30, String(b.difficulty || 'Medium'),
    Number(b.servings) || 4, String(b.image || ''), JSON.stringify(b.hashtags || ['#homecook']), String(b.desc || '').slice(0, 500),
    JSON.stringify(b.ingredients || []), JSON.stringify(b.steps || []), JSON.stringify(b.nutrition || {}),
    String(b.ytId || ''), b.userMade ? 1 : 0);
  notify(u.id, '⭐', 'Recipe published', `“${String(b.title).slice(0, 40)}” went live with Scyn AI curation and your creator signature.`);
  send(res, 201, { recipe: myRecipeJSON(db.prepare('SELECT * FROM recipes WHERE id=?').get(id), u.id) });
});
route('DELETE', '/api/recipes/:id', async (req, res, params) => {
  const u = requireAuth(req, res); if (!u) return;
  const r = db.prepare('SELECT * FROM recipes WHERE id=?').get(params.id);
  if (!r) return send(res, 404, { error: 'not found' });
  if (r.user_id !== u.id) return send(res, 403, { error: 'not yours' });
  db.prepare('DELETE FROM recipes WHERE id=?').run(params.id);
  db.prepare('DELETE FROM likes WHERE recipe_id=?').run(params.id);
  db.prepare('DELETE FROM saves WHERE recipe_id=?').run(params.id);
  db.prepare('DELETE FROM ratings WHERE recipe_id=?').run(params.id);
  db.prepare('DELETE FROM comments WHERE recipe_id=?').run(params.id);
  send(res, 200, { ok: true });
});

// like / save toggles
route('POST', '/api/recipes/:id/like', async (req, res, params) => {
  const u = requireAuth(req, res); if (!u) return;
  const r = db.prepare('SELECT * FROM recipes WHERE id=?').get(params.id);
  if (!r) return send(res, 404, { error: 'not found' });
  const has = db.prepare('SELECT 1 FROM likes WHERE user_id=? AND recipe_id=?').get(u.id, params.id);
  if (has) { db.prepare('DELETE FROM likes WHERE user_id=? AND recipe_id=?').run(u.id, params.id); db.prepare('UPDATE recipes SET likes=likes-1 WHERE id=?').run(params.id); }
  else {
    db.prepare('INSERT INTO likes (user_id, recipe_id) VALUES (?,?)').run(u.id, params.id);
    db.prepare('UPDATE recipes SET likes=likes+1 WHERE id=?').run(params.id);
    if (r.user_id && r.user_id !== u.id) notify(r.user_id, '❤️', `${u.username} liked your recipe`, `“${r.title}” just got some love.`);
  }
  send(res, 200, { liked: !has, likes: db.prepare('SELECT likes FROM recipes WHERE id=?').get(params.id).likes });
});
route('POST', '/api/recipes/:id/save', async (req, res, params) => {
  const u = requireAuth(req, res); if (!u) return;
  const r = db.prepare('SELECT * FROM recipes WHERE id=?').get(params.id);
  if (!r) return send(res, 404, { error: 'not found' });
  const has = db.prepare('SELECT 1 FROM saves WHERE user_id=? AND recipe_id=?').get(u.id, params.id);
  if (has) { db.prepare('DELETE FROM saves WHERE user_id=? AND recipe_id=?').run(u.id, params.id); db.prepare('UPDATE recipes SET saves=saves-1 WHERE id=?').run(params.id); }
  else { db.prepare('INSERT INTO saves (user_id, recipe_id) VALUES (?,?)').run(u.id, params.id); db.prepare('UPDATE recipes SET saves=saves+1 WHERE id=?').run(params.id); }
  send(res, 200, { saved: !has, saves: db.prepare('SELECT saves FROM recipes WHERE id=?').get(params.id).saves });
});
route('POST', '/api/recipes/:id/rate', async (req, res, params) => {
  const u = requireAuth(req, res); if (!u) return;
  const r = db.prepare('SELECT * FROM recipes WHERE id=?').get(params.id);
  if (!r) return send(res, 404, { error: 'not found' });
  const b = await readBody(req);
  const stars = Number(b.stars);
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) return send(res, 400, { error: 'stars must be an integer 1-5' });
  const prev = db.prepare('SELECT stars FROM ratings WHERE user_id=? AND recipe_id=?').get(u.id, params.id);
  // blended aggregate: prior mass (rating × ratings_count) adjusted by this user's rating
  let total = (r.rating || 0) * (r.ratings_count || 0);
  if (prev) { total = total - prev.stars + stars; db.prepare('UPDATE ratings SET stars=? WHERE user_id=? AND recipe_id=?').run(stars, u.id, params.id); }
  else { total += stars; db.prepare('INSERT INTO ratings (user_id, recipe_id, stars) VALUES (?,?,?)').run(u.id, params.id, stars); db.prepare('UPDATE recipes SET ratings_count=ratings_count+1 WHERE id=?').run(params.id); }
  const count = Math.max((r.ratings_count || 0) + (prev ? 0 : 1), 1);
  const avg = Math.round(total / count * 100) / 100;
  db.prepare('UPDATE recipes SET rating=? WHERE id=?').run(avg, params.id);
  if (r.user_id && r.user_id !== u.id) notify(r.user_id, '⭐', `${u.username} rated your recipe ${stars}★`, `"${r.title}" now averages ${avg.toFixed(1)}★.`);
  send(res, 200, { rating: avg, ratingsCount: count, myRating: stars });
});
route('POST', '/api/recipes/:id/comments', async (req, res, params) => {
  const u = requireAuth(req, res); if (!u) return;
  const b = await readBody(req);
  const text = String(b.text || '').trim().slice(0, 500);
  if (!text) return send(res, 400, { error: 'text required' });
  const r = db.prepare('SELECT * FROM recipes WHERE id=?').get(params.id);
  if (!r) return send(res, 404, { error: 'not found' });
  const info = db.prepare('INSERT INTO comments (recipe_id, user_id, text) VALUES (?,?,?)').run(params.id, u.id, text);
  db.prepare('UPDATE recipes SET comments_count=comments_count+1 WHERE id=?').run(params.id);
  if (r.user_id && r.user_id !== u.id) notify(r.user_id, '💬', `${u.username} commented`, text.slice(0, 80));
  send(res, 201, { comment: { id: Number(info.lastInsertRowid), text, who: u.username, handle: u.handle, ts: Date.now() } });
});

// follows
route('POST', '/api/users/:handle/follow', async (req, res, params) => {
  const u = requireAuth(req, res); if (!u) return;
  const target = db.prepare('SELECT * FROM users WHERE handle=?').get(params.handle);
  if (!target) return send(res, 404, { error: 'user not found' });
  if (target.id === u.id) return send(res, 400, { error: 'cannot follow yourself' });
  const has = db.prepare('SELECT 1 FROM follows WHERE follower_id=? AND followee_id=?').get(u.id, target.id);
  if (has) db.prepare('DELETE FROM follows WHERE follower_id=? AND followee_id=?').run(u.id, target.id);
  else { db.prepare('INSERT INTO follows (follower_id, followee_id) VALUES (?,?)').run(u.id, target.id); notify(target.id, '👤', `${u.username} started following you`, 'Welcome them to your kitchen.'); }
  send(res, 200, { following: !has });
});

// cookbook (saved)
route('GET', '/api/cookbook', async (req, res) => {
  const u = requireAuth(req, res); if (!u) return;
  const rows = db.prepare('SELECT r.* FROM saves s JOIN recipes r ON r.id=s.recipe_id WHERE s.user_id=? ORDER BY s.rowid DESC').all(u.id);
  send(res, 200, { recipes: rows.map(r => myRecipeJSON(r, u.id)) });
});

// notifications
route('GET', '/api/notifications', async (req, res) => {
  const u = requireAuth(req, res); if (!u) return;
  const rows = db.prepare('SELECT * FROM notifications WHERE user_id=? ORDER BY id DESC LIMIT 60').all(u.id);
  send(res, 200, { notifications: rows.map(n => ({ id: n.id, ico: n.ico, title: n.title, msg: n.msg, read: !!n.read, ts: n.created_at * 1000 })), unread: rows.filter(n => !n.read).length });
});
route('POST', '/api/notifications/read', async (req, res) => {
  const u = requireAuth(req, res); if (!u) return;
  db.prepare('UPDATE notifications SET read=1 WHERE user_id=?').run(u.id);
  send(res, 200, { ok: true });
});

// meal plan
route('GET', '/api/mealplan', async (req, res) => {
  const u = requireAuth(req, res); if (!u) return;
  const rows = db.prepare('SELECT day_key, slot, recipe_id FROM mealplans WHERE user_id=?').all(u.id);
  const plan = {}; rows.forEach(r => { (plan[r.day_key] = plan[r.day_key] || {})[r.slot] = r.recipe_id; });
  send(res, 200, { plan });
});
route('PUT', '/api/mealplan', async (req, res) => {
  const u = requireAuth(req, res); if (!u) return;
  const b = await readBody(req); // { dayKey, slot, recipeId|null }
  if (!b.dayKey || !b.slot) return send(res, 400, { error: 'dayKey and slot required' });
  if (b.recipeId) db.prepare('INSERT OR REPLACE INTO mealplans (user_id, day_key, slot, recipe_id) VALUES (?,?,?,?)').run(u.id, String(b.dayKey).slice(0, 12), String(b.slot), String(b.recipeId));
  else db.prepare('DELETE FROM mealplans WHERE user_id=? AND day_key=? AND slot=?').run(u.id, b.dayKey, b.slot);
  send(res, 200, { ok: true });
});

// AI
route('POST', '/api/ai/chat', async (req, res) => {
  const b = await readBody(req);
  const provider = String(b.provider || 'builtin'); const model = b.model || ''; const tone = b.tone || 'warm';
  let ctx = null;
  if (b.recipeId) { const r = db.prepare('SELECT * FROM recipes WHERE id=?').get(b.recipeId); if (r) ctx = { recipe: recipeRow(r) }; }
  try { const reply = await serverAI(String(b.message || ''), ctx, provider, model, tone); send(res, 200, { reply, provider }); }
  catch (e) { send(res, 200, { reply: '⚠️ ' + e.message + '\n\n' + builtinChefReply(String(b.message || ''), ctx), provider: 'builtin-fallback' }); }
});
route('POST', '/api/ai/extract', async (req, res) => {
  const b = await readBody(req);
  try { send(res, 200, { recipe: await extractRecipeFromURL(String(b.url || '')) }); }
  catch (e) { send(res, 400, { error: e.message }); }
});

// youtube
route('GET', '/api/youtube/search', async (req, res) => {
  const key = CONFIG.keys && CONFIG.keys.youtube;
  if (!key) return send(res, 400, { error: 'no youtube key on server' });
  const url = new URL(req.url, 'http://x'); const q = url.searchParams.get('q') || 'cooking';
  try {
    const r = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=12&type=video&q=${encodeURIComponent(q)}&key=${key}`);
    const j = await r.json();
    if (j.error) throw new Error(j.error.message);
    send(res, 200, { videos: (j.items || []).map(it => ({ id: it.id.videoId, title: it.snippet.title, ch: it.snippet.channelTitle, thumb: it.snippet.thumbnails && it.snippet.thumbnails.high && it.snippet.thumbnails.high.url })) });
  } catch (e) { send(res, 400, { error: e.message }); }
});

// admin
function requireAdmin(req, res) {
  const h = req.headers['authorization'] || '';
  const m = h.match(/^Bearer (.+)$/);
  if (!m || m[1] !== CONFIG.adminToken) { send(res, 403, { error: 'admin token required' }); return false; }
  return true;
}
route('GET', '/admin/stats', async (req, res) => { if (!requireAdmin(req, res)) return; send(res, 200, { users: db.prepare('SELECT COUNT(*) c FROM users').get().c, recipes: db.prepare('SELECT COUNT(*) c FROM recipes').get().c, comments: db.prepare('SELECT COUNT(*) c FROM comments').get().c, likes: db.prepare('SELECT COUNT(*) c FROM likes').get().c, sessions: db.prepare('SELECT COUNT(*) c FROM sessions').get().c, keys: Object.keys(CONFIG.keys || {}), version: VERSION }); }, { admin: true });
route('POST', '/admin/keys', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const b = await readBody(req);
  const keys = Object.assign({}, CONFIG.keys);
  for (const k of ['openai', 'openrouter', 'gemini', 'ollamaModel', 'youtube']) if (b[k] !== undefined) keys[k] = String(b[k]);
  saveConfig({ keys });
  send(res, 200, { ok: true, keys: Object.keys(keys) });
});
route('POST', '/admin/seed', async (req, res) => { if (!requireAdmin(req, res)) return; seed(); send(res, 200, { ok: true }); }, { admin: true });

// ---------------- seeding ----------------
function seed() {
  const seedFile = path.join(ROOT, 'seed.js');
  if (!fs.existsSync(seedFile)) return;
  delete require.cache[require.resolve(seedFile)];
  const { SEED_RECIPES } = require(seedFile);
  const ins = db.prepare(`INSERT OR REPLACE INTO recipes (id,user_id,title,creator,creator_handle,cuisine,time,difficulty,servings,likes,comments_count,saves,rating,ratings_count,image,hashtags,desc,ingredients,steps,nutrition,yt_id,live,viewers,user_made,scyn_curated,created_at)
    VALUES (@id,0,@title,@creator,@creator_handle,@cuisine,@time,@difficulty,@servings,@likes,@commentsCount,@saves,@rating,@ratingsCount,@image,@hashtags,@desc,@ingredients,@steps,@nutrition,@ytId,@live,@viewers,0,1,unixepoch())`);
  for (const r of SEED_RECIPES) {
    ins.run({ id: r.id, title: r.title, creator: r.creator, creator_handle: r.creatorHandle, cuisine: r.cuisine, time: r.time, difficulty: r.difficulty, servings: r.servings, likes: r.likes, commentsCount: r.commentsCount, saves: r.saves, rating: r.rating || 0, ratingsCount: r.ratingsCount || 0, image: r.image, hashtags: JSON.stringify(r.hashtags), desc: r.desc, ingredients: JSON.stringify(r.ingredients), steps: JSON.stringify(r.steps), nutrition: JSON.stringify(r.nutrition), ytId: r.ytId || '', live: r.live ? 1 : 0, viewers: r.viewers || 0 });
  }
}

// ---------------- request handler ----------------
async function handle(req, res) {
  try {
    const u = new URL(req.url, 'http://localhost');
    const pathname = decodeURIComponent(u.pathname);
    if (req.method === 'OPTIONS') { res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE', 'Access-Control-Allow-Headers': 'Content-Type,Authorization' }); return res.end(); }
    if (pathname === '/' || pathname === '/index.html' || pathname === '/ForkFeed.html') return serveApp(res);
    if (pathname.startsWith('/api/') || pathname.startsWith('/admin/')) {
      for (const r of routes) {
        if (r.method !== req.method) continue;
        const pm = (r.pattern.match(/:[a-zA-Z]+/g) || []);
        // escape regex specials in the literal parts FIRST, then substitute capture groups
        const escaped = r.pattern.replace(/[.+?^${}()|[\]\\*]/g, '\\$&');
        const exact = escaped.replace(/\\?:[a-zA-Z]+/g, '([^/]+)').replace(/\\\//g, '\\/');
        const m = pathname.match(new RegExp('^' + exact + '/?$'));
        if (!m) continue;
        const params = {};
        if (pm && pm.length) pm.forEach((p, i) => { params[p.slice(1)] = m[i + 1]; });
        await r.handler(req, res, params);
        return;
      }
      return send(res, 404, { error: 'no such endpoint', path: pathname });
    }
    // static
    const file = path.join(ROOT, 'public', pathname.replace(/\.\./g, ''));
    if (fs.existsSync(file) && fs.statSync(file).isFile()) {
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' }); return fs.createReadStream(file).pipe(res);
    }
    send(res, 404, { error: 'not found' });
  } catch (e) { send(res, 500, { error: e.message }); }
}

// ---------------- boot ----------------
const already = db.prepare('SELECT COUNT(*) c FROM recipes').get().c;
if (!already) { try { seed(); } catch (e) { console.error('seed failed:', e.message); } }

http.createServer((req, res) => { handle(req, res).catch(e => send(res, 500, { error: e.message })); }).listen(PORT, '0.0.0.0', () => {
  console.log('ForkFeed server v' + VERSION);
  console.log('  app:     http://localhost:' + PORT);
  console.log('  health:  http://localhost:' + PORT + '/api/health');
  console.log('  admin token (keep private): ' + ADMIN_TOKEN);
  if (CONFIG_FILE && fs.existsSync(CONFIG_FILE)) { /* token already on disk */ }
});
