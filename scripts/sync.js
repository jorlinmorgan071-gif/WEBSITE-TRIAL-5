// ForkFeed online sync layer — talks to the backend when served by server.js, pure-local otherwise.
const SYNC = {
  online: false, base: '', token: '', me: null, lastErr: null,
  probe() {
    // When opened as file:// (no server) or a non-backend host, stay in local mode.
    if (location.protocol === 'file:') return Promise.resolve(false);
    return fetch('/api/health', { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(j => {
      SYNC.online = !!j; SYNC.serverInfo = j;
      if (j) { try { SYNC.token = localStorage.getItem('ff_token') || ''; } catch {} }
      return !!j;
    }).catch(() => false);
  },
  req(method, path, body) {
    const headers = { 'Content-Type': 'application/json' };
    if (SYNC.token) headers['Authorization'] = 'Bearer ' + SYNC.token;
    return fetch(path, { method, headers, body: body ? JSON.stringify(body) : undefined })
      .then(async r => { const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || r.status); return j; });
  },
  register(username, password) {
    return SYNC.req('POST', '/api/auth/register', { username, password }).then(j => { SYNC.token = j.token; SYNC.me = j.user; try { localStorage.setItem('ff_token', j.token); } catch {} return j; });
  },
  login(username, password) {
    return SYNC.req('POST', '/api/auth/login', { username, password }).then(j => { SYNC.token = j.token; SYNC.me = j.user; try { localStorage.setItem('ff_token', j.token); } catch {} return j; });
  },
  logout() {
    const p = SYNC.req('POST', '/api/auth/logout', {}).catch(() => {});
    SYNC.token = ''; SYNC.me = null; try { localStorage.removeItem('ff_token'); } catch {}
    return p;
  },
  // ---- data hydration ----
  pullAll() {
    return Promise.all([
      SYNC.req('GET', '/api/recipes'),
      SYNC.req('GET', '/api/notifications'),
      SYNC.req('GET', '/api/mealplan'),
      SYNC.req('GET', '/api/auth/me')
    ]).then(([recs, noti, plan, me]) => {
      S.recipes = recs.recipes.map(normalizeServerRecipe);
      S.notifications = noti.notifications;
      S.mealPlan = plan.plan;
      S.user = { name: me.user.username, handle: me.user.handle, bio: me.user.bio, followers: me.user.stats.followers, following: me.user.stats.following, scynRecipes: me.user.stats.recipes };
      S.saved = recs.recipes.filter(r => r.savedByMe).map(r => r.id).concat(
        S.recipes.filter(r => r.savedByMe).map(r => r.id)).filter((v, i, a) => a.indexOf(v) === i);
      S.liked = {}; S.recipes.forEach(r => { if (r.likedByMe) S.liked[r.id] = 1; });
      S.onboarded = true; // server users skip local onboarding; taste prefs stay local
      save();
      return true;
    });
  },
  // ---- write-through ----
  like(id) { if (!SYNC.online || !SYNC.token) return Promise.resolve(null); return SYNC.req('POST', '/api/recipes/' + id + '/like', {}).then(j => { const r = S.recipes.find(x => x.id === id); if (r && j.likes !== undefined) r.likes = j.likes; save(); return j; }).catch(e => { SYNC.lastErr = e.message; return null; }); },
  rate(id, stars) { if (!SYNC.online || !SYNC.token) return Promise.resolve(null); return SYNC.req('POST', '/api/recipes/' + id + '/rate', { stars }).then(j => { const r = S.recipes.find(x => x.id === id); if (r && j.rating !== undefined) { r.rating = j.rating; r.ratingsCount = j.ratingsCount; } save(); return j; }).catch(e => { SYNC.lastErr = e.message; return null; }); },
  saveRecipe(id) { if (!SYNC.online || !SYNC.token) return Promise.resolve(null); return SYNC.req('POST', '/api/recipes/' + id + '/save', {}).then(j => { const r = S.recipes.find(x => x.id === id); if (r && j.saves !== undefined) r.saves = j.saves; return j; }).catch(e => { SYNC.lastErr = e.message; return null; }); },
  follow(handle) { if (!SYNC.online || !SYNC.token) return Promise.resolve(null); return SYNC.req('POST', '/api/users/' + encodeURIComponent(handle) + '/follow', {}).catch(e => { SYNC.lastErr = e.message; return null; }); },
  comment(id, text) { if (!SYNC.online || !SYNC.token) return Promise.resolve(null); return SYNC.req('POST', '/api/recipes/' + id + '/comments', { text }).then(j => j.comment).catch(e => { SYNC.lastErr = e.message; return null; }); },
  recipeComments(id) { if (!SYNC.online || !SYNC.token) return Promise.resolve([]); return SYNC.req('GET', '/api/recipes/' + id).then(j => j.comments).catch(() => []); },
  createRecipe(rec) {
    if (!SYNC.online || !SYNC.token) return Promise.resolve(null);
    return SYNC.req('POST', '/api/recipes', rec).then(j => { S.recipes.unshift(normalizeServerRecipe(j.recipe)); save(); renderFeed(); return j.recipe; }).catch(e => { SYNC.lastErr = e.message; return null; });
  },
  deleteRecipe(id) { if (!SYNC.online || !SYNC.token) return Promise.resolve(null); return SYNC.req('DELETE', '/api/recipes/' + id, {}).then(() => { S.recipes = S.recipes.filter(r => r.id !== id); save(); }).catch(e => { SYNC.lastErr = e.message; return null; }); },
  setPlanSlot(dayKey, slot, recipeId) { if (!SYNC.online || !SYNC.token) return Promise.resolve(null); return SYNC.req('PUT', '/api/mealplan', { dayKey, slot, recipeId }).catch(e => { SYNC.lastErr = e.message; return null; }); },
  updateProfile(patch) { if (!SYNC.online || !SYNC.token) return Promise.resolve(null); return SYNC.req('PATCH', '/api/auth/me', patch).then(j => { SYNC.me = j.user; return j; }).catch(e => { SYNC.lastErr = e.message; return null; }); },
  markNotiRead() { if (!SYNC.online || !SYNC.token) return Promise.resolve(null); return SYNC.req('POST', '/api/notifications/read', {}).catch(() => null); },
  // ---- AI / extraction / youtube through server ----
  ai(message, ctx) {
    if (!SYNC.online) return Promise.resolve(null);
    return SYNC.req('POST', '/api/ai/chat', { message, provider: S.ai.provider, model: S.ai.model, tone: S.ai.tone, recipeId: ctx && ctx.id }).then(j => j.reply).catch(e => { SYNC.lastErr = e.message; return null; });
  },
  extract(url) { if (!SYNC.online) return Promise.resolve(null); return SYNC.req('POST', '/api/ai/extract', { url }).then(j => j.recipe).catch(e => { SYNC.lastErr = e.message; return null; }); },
  ytSearch(q) { if (!SYNC.online) return Promise.resolve(null); return SYNC.req('GET', '/api/youtube/search?q=' + encodeURIComponent(q)).then(j => j.videos).catch(e => { SYNC.lastErr = e.message; return null; }); },
  serverKeysHint() {
    // which providers have server-side keys (admin-configured) — shown in UI
    if (!SYNC.online || !SYNC.serverInfo) return [];
    return (SYNC.serverInfo.providerKeys || []).map(k => ({ openai: 'OpenAI', openrouter: 'OpenRouter', gemini: 'Gemini', ollamaModel: 'Ollama', youtube: 'YouTube' }[k] || k));
  }
};
function normalizeServerRecipe(r) {
  return {
    id: r.id, title: r.title, creator: r.creator, creatorHandle: r.creatorHandle, cuisine: r.cuisine,
    time: r.time, difficulty: r.difficulty, servings: r.servings, likes: r.likes, commentsCount: r.commentsCount,
    saves: r.saves, rating: r.rating || 0, ratingsCount: r.ratingsCount || 0, myRating: r.myRating || 0,
    image: r.image || IMG.ramen, hashtags: r.hashtags || [], desc: r.desc || '',
    ingredients: r.ingredients || [], steps: r.steps || [], nutrition: r.nutrition || {},
    ytId: r.ytId || '', live: !!r.live, viewers: r.viewers || 0, userMade: !!r.userMade,
    scynCurated: !!r.scynCurated, created: r.created || 0
  };
}

// ---------- login / register overlay ----------
function renderAuthOverlay() {
  const w = document.createElement('div');
  w.id = 'authwrap';
  w.style.cssText = 'position:absolute;inset:0;z-index:650;background:linear-gradient(175deg,#16100e,#0a0808 60%,#0d0708);display:flex;flex-direction:column;';
  w.innerHTML = `
  <div style="flex:1;overflow-y:auto;padding:74px 26px 20px;display:flex;flex-direction:column">
    <div style="font-size:42px">🍳</div>
    <div style="font-size:26px;font-weight:800;margin:6px 0 4px">ForkFeed <span style="font-size:13px;font-weight:700;color:var(--amber);vertical-align:middle">server</span></div>
    <div style="font-size:13px;color:var(--muted);line-height:1.6;margin-bottom:18px">Connected to the ForkFeed backend — accounts, recipes, likes and meal plans are stored on the server. ${SYNC.serverInfo ? 'Server v' + SYNC.serverInfo.version + ' · ' + SYNC.serverInfo.recipes + ' recipes · ' + SYNC.serverInfo.users + ' users.' : ''}</div>
    <div class="seg" id="auth-tabs"><button class="active" data-m="login">Login</button><button data-m="register">Register</button></div>
    <div class="field"><label>Username</label><input id="auth-user" autocomplete="username" placeholder="chef_amara"></div>
    <div class="field"><label>Password</label><input id="auth-pass" type="password" autocomplete="current-password" placeholder="6+ characters"></div>
    <div id="auth-err" style="font-size:12px;color:var(--red);min-height:16px;margin-bottom:8px"></div>
    <button class="btn block" id="auth-go">Login</button>
    <button class="btn ghost block" style="margin-top:10px" id="auth-guest">Continue as guest (local only)</button>
    <div style="font-size:11px;color:var(--faint);margin-top:14px;line-height:1.5">Guest mode works exactly like the offline file: everything stored in this browser only. Register to sync across devices.</div>
  </div>`;
  document.getElementById('phone').appendChild(w);
  let mode = 'login';
  w.querySelectorAll('#auth-tabs button').forEach(b => b.addEventListener('click', () => {
    mode = b.dataset.m;
    w.querySelectorAll('#auth-tabs button').forEach(x => x.classList.toggle('active', x === b));
    document.getElementById('auth-go').textContent = mode === 'login' ? 'Login' : 'Create account';
  }));
  const go = async () => {
    const u = document.getElementById('auth-user').value.trim();
    const p = document.getElementById('auth-pass').value;
    const err = document.getElementById('auth-err');
    err.textContent = '';
    if (!u || !p) { err.textContent = 'Username and password, please.'; return; }
    document.getElementById('auth-go').textContent = '⏳';
    try {
      await (mode === 'login' ? SYNC.login(u, p) : SYNC.register(u, p));
      await SYNC.pullAll();
      w.remove();
      renderFeed(); renderProfile(); updateNotiBadge();
      toast('🤝', 'Welcome, ' + SYNC.me.username, 'Your kitchen now syncs to the server.', 3600, '#5ad48a');
    } catch (e) { err.textContent = e.message; document.getElementById('auth-go').textContent = mode === 'login' ? 'Login' : 'Create account'; }
  };
  document.getElementById('auth-go').addEventListener('click', go);
  document.getElementById('auth-pass').addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
  document.getElementById('auth-guest').addEventListener('click', () => { w.remove(); toast('👤', 'Guest mode', 'Local data only — register anytime from Profile.'); });
}
function ensureAuthUI() {
  if (!SYNC.online || !SYNC.token || !SYNC.me) return false;
  return true;
}
function logoutFlow() {
  SYNC.logout().then(() => {
    // reset local state, return to auth overlay
    localStorage.removeItem('ff_token');
    resetAllSoft();
    renderAuthOverlay();
  });
}
function resetAllSoft() {
  const keep = { ai: S.ai, taste: S.taste };
  S = freshState(); S.ai = keep.ai; S.taste = keep.taste;
  save(); renderFeed(); renderProfile(); updateNotiBadge();
}
