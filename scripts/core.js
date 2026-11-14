// ForkFeed core UI: toast system, sheets, tab bar, PDF export, share card, AI engine (builtin + providers)
// ---------- toast ----------
function toast(ico, title, msg, ms=3400, color='var(--coral)'){
  const w = $('#toasts');
  const t = document.createElement('div');
  t.className='toast';
  t.innerHTML = `<div class="t-ico">${ico}</div><div style="flex:1;min-width:0"><div class="t-tt">${esc(title)}</div><div class="t-ms">${esc(msg)}</div></div>`;
  const bar = document.createElement('i'); bar.className='t-bar'; bar.style.background=color; bar.style.animationDuration=ms+'ms';
  t.appendChild(bar); w.appendChild(t);
  setTimeout(()=>{ t.classList.add('out'); setTimeout(()=>t.remove(),300); }, ms);
}
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

// ---------- sheet manager ----------
function openSheet(id, cb){ const w=$('#'+id); if(!w) return; w.classList.add('open'); if(cb) requestAnimationFrame(cb); }
function closeSheet(id){ const w=$('#'+id); if(!w) return; w.classList.remove('open'); }
function bindSheetVeil(id){ const w=$('#'+id); const v=w.querySelector('.sheet-veil'); if(v) v.addEventListener('click',()=>closeSheet(id)); }
$$('.sheet-wrap').forEach(w=>bindSheetVeil(w.id));
$$('.close-x[data-close]').forEach(b=>b.addEventListener('click',()=>closeSheet(b.dataset.close)));

// ---------- navigation ----------
const TABS = ['home','discover','cookbook','planner','profile'];
let currentTab='home';
function go(tab){
  currentTab=tab;
  TABS.forEach(t=>{ const sc=$('#screen-'+t); if(sc) sc.classList.toggle('active', t===tab); });
  $$('#tabbar .tabbtn').forEach(b=>b.classList.toggle('active', b.dataset.tab===tab));
  const sc=$('#screen-'+tab); if(sc){ sc.classList.remove('fade-in'); void sc.offsetWidth; sc.classList.add('fade-in'); }
  if(tab==='cookbook') renderCookbook();
  if(tab==='planner') renderPlanner();
  if(tab==='profile') renderProfile();
  if(tab==='discover') renderDiscover();
  if(window.__pageAnchors) window.scrollTo(0,0);
}

// ---------- bottom "more" nav (notifications/create) ----------
function openScreenSheet(id){ openSheet(id); }

// ---------- like / save / follow ----------
function toggleLike(id, el){
  const r = S.recipes.find(x=>x.id===id); if(!r) return;
  const nowLiked = !S.liked[id];
  if(nowLiked){ S.liked[id]=1; r.likes++; burstHeart(el); }
  else { delete S.liked[id]; r.likes--; }
  save();
  if(el){ el.closest('.railbtn')?.classList.toggle('liked', nowLiked); const c=el.closest('.railbtn')?.querySelector('span'); if(c) c.textContent=fmtK(r.likes); }
  const c2 = document.querySelector(`#feedcard-${id} .like-count`); if(c2) c2.textContent = fmtK(r.likes);
}
function burstHeart(el){
  const card = el.closest('.feedcard, .yt-card, .rec-card') || $('#app');
  const h = document.createElement('div'); h.className='heartburst'; h.textContent='❤️';
  const rect = el.getBoundingClientRect(); const cardR = card.getBoundingClientRect();
  h.style.left = (rect.left-cardR.left + rect.width/2 - 42)+'px';
  h.style.top = (rect.top-cardR.top - 30)+'px';
  if(getComputedStyle(card).position==='static') card.style.position='relative';
  card.appendChild(h); setTimeout(()=>h.remove(), 950);
}
function toggleSave(id){
  const i = S.saved.indexOf(id);
  if(i>=0){ S.saved.splice(i,1); toast('📖','Removed from Cookbook','Recipe removed from your saved collection.'); }
  else { S.saved.push(id); toast('📖','Saved to Cookbook','Find it anytime under the Cookbook tab.','#5ad48a'.length?'#5ad48a':'#5ad48a'); updateNotiBadge();
    pushNoti({ico:'📖',title:'Saved to Cookbook',msg:`${S.recipes.find(r=>r.id===id)?.title||'Recipe'} is waiting for you.`});
  }
  save();
  document.querySelectorAll(`[data-saved="${id}"]`).forEach(b=>{ b.classList.toggle('active', S.saved.includes(id)); const s=b.querySelector('span'); if(s) s.textContent = S.saved.includes(id)?'Saved':'Save'; });
  const rc = $('#recipe-sheet-save'); if(rc){ rc.textContent = S.saved.includes(id)?'✓ In Cookbook':'🔖 Save'; }
  updateNotiBadge();
}
function toggleFollow(handle){
  const now = !S.follows[handle]; if(now) S.follows[handle]=1; else delete S.follows[handle];
  save();
  document.querySelectorAll(`[data-follow="${handle}"]`).forEach(b=>{ b.classList.toggle('following', now); b.textContent = now?'✓ Following':'+ Follow'; });
  if(now){ pushNoti({ico:'👤',title:`Following ${handle}`,msg:'You\'ll get alerts on their latest uploads. Turn off anytime in the You panel.',group:'today'}); toast('👥','Following '+handle,'Their uploads will surface in your feed.'); }
}
function pushNoti(n){ S.notifications.unshift(Object.assign({id:Date.now(),ts:Date.now(),read:false,group:'today'},n)); save(); updateNotiBadge(); }
function updateNotiBadge(){ const u=S.notifications.filter(n=>!n.read).length; const b=$('#noti-badge'); if(b){ b.style.display = u? 'flex':'none'; b.textContent=u; } }

// ---------- ingredient scaling ----------
function scaledIngredients(recipe, servings){
  return recipe.ingredients.map(i=>({...i, disp: scaleQty(i.qty, recipe.servings, servings)}));
}

// ---------- grocery list builder ----------
function groceryListFrom(plan){
  // plan: {dayKey:{breakfast:recipeId|idString}}
  const totals = {};
  Object.values(plan).forEach(day=>{ Object.values(day).forEach(rid=>{
    const r = typeof rid==='string' ? S.recipes.find(x=>x.id===rid) : rid;
    if(!r) return;
    r.ingredients.forEach(ing=>{
      const key = ing.name.toLowerCase();
      if(!totals[key]) totals[key]={name:ing.name, unit:ing.unit||'', qty:0};
      totals[key].qty += Number(ing.qty)||0;
    });
  });});
  return Object.values(totals).sort((a,b)=>a.name.localeCompare(b.name));
}

// ---------- PDF export (window print of hidden printable node) ----------
function exportRecipePDF(recipe, servings){
  const ing = scaledIngredients(recipe, servings);
  const hidden = document.createElement('div');
  hidden.style.cssText='position:fixed;left:-10000px;top:0;width:640px;background:#fff;color:#111;font-family:Georgia,serif;';
  hidden.innerHTML = `
    <div style="padding:38px 46px;">
      <div style="font-size:12px;letter-spacing:3px;color:#c0392b;font-weight:700;">FORKFEED RECIPE</div>
      <h1 style="font-size:30px;margin:6px 0 2px;">${esc(recipe.title)}</h1>
      <div style="font-size:13px;color:#555;margin-bottom:4px;">by ${esc(recipe.creator)} · ${esc(recipe.creatorHandle)}</div>
      <div style="font-size:12px;color:#777;margin-bottom:16px;">${esc(recipe.cuisine)} · ${recipe.time} min · ${recipe.difficulty} · <b>Serves ${servings}</b>${recipe.scynCurated?' · ⭐ Scyn AI curated':''}</div>
      <div style="border-top:2px solid #c0392b;margin:0 0 18px;"></div>
      <h2 style="font-size:15px;margin-bottom:8px;">Ingredients — serves ${servings}</h2>
      <table style="width:100%;border-collapse:collapse;font-size:13.5px;">
        ${ing.map(i=>`<tr><td style="padding:5px 8px 5px 0;border-bottom:1px solid #eee;width:90px;font-weight:700;">${esc(i.disp)} ${esc(i.unit)}</td><td style="padding:5px 0;border-bottom:1px solid #eee;">${esc(i.name)}</td></tr>`).join('')}
      </table>
      <h2 style="font-size:15px;margin:22px 0 8px;">Steps</h2>
      <ol style="padding-left:22px;font-size:13.5px;line-height:1.7;">
        ${recipe.steps.map(s=>`<li style="margin-bottom:8px;">${esc(s)}</li>`).join('')}
      </ol>
      <h2 style="font-size:15px;margin:22px 0 8px;">Nutrition (per serving)</h2>
      <div style="font-size:13px;color:#444;">Calories ${recipe.nutrition.cal} kcal · Protein ${recipe.nutrition.protein} g · Carbs ${recipe.nutrition.carbs} g · Fat ${recipe.nutrition.fat} g · Fiber ${recipe.nutrition.fiber} g · Sodium ${recipe.nutrition.sodium} mg</div>
      <div style="margin-top:26px;font-size:11px;color:#999;border-top:1px solid #eee;padding-top:10px;">Downloaded from ForkFeed — TikTok for your kitchen. forkfeed.app</div>
    </div>`;
  document.body.appendChild(hidden);
  const w = window.open('','_blank');
  if(!w){ toast('⚠️','Popup blocked','Allow popups to export the PDF.'); hidden.remove(); return; }
  w.document.write(`<html><head><title>${esc(recipe.title)} — ForkFeed</title><style>body{margin:0}</style></head><body>${hidden.innerHTML.replace(/position:fixed;left:-10000px[^"]*/,'')} </body></html>`);
  w.document.close();
  setTimeout(()=>{ try{ w.focus(); w.print(); }catch(e){} }, 400);
  hidden.remove();
  toast('📄','PDF ready','Recipe exported with '+servings+' servings — check the print dialog.');
}
function exportGroceryPDF(list, title){
  const hidden = document.createElement('div');
  hidden.style.cssText='position:fixed;left:-10000px;top:0;width:640px;background:#fff;color:#111;font-family:Georgia,serif;';
  hidden.innerHTML = `
  <div style="padding:38px 46px;">
    <div style="font-size:12px;letter-spacing:3px;color:#c0392b;font-weight:700;">FORKFEED GROCERY LIST</div>
    <h1 style="font-size:26px;margin:6px 0 16px;">${esc(title)}</h1>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:5px 0;border-bottom:2px solid #333;width:24px;">☐</td><td style="padding:5px 8px 5px 0;border-bottom:1px solid #eee;font-weight:700;width:110px;">Qty</td><td style="padding:5px 0;border-bottom:1px solid #eee;">Item</td></tr>
      ${list.map(g=>`<tr><td style="padding:6px 0;border-bottom:1px solid #eee;">☐</td><td style="padding:6px 8px 6px 0;border-bottom:1px solid #eee;font-weight:700;">${g.qty}${g.unit? ' '+esc(g.unit):''}</td><td style="padding:6px 0;border-bottom:1px solid #eee;">${esc(g.name)}</td></tr>`).join('')}
    </table>
    <div style="margin-top:24px;font-size:11px;color:#999;">Generated by ForkFeed Meal Planner</div>
  </div>`;
  document.body.appendChild(hidden);
  const w = window.open('','_blank');
  if(!w){ toast('⚠️','Popup blocked','Allow popups to export the list.'); hidden.remove(); return; }
  w.document.write(`<html><head><title>ForkFeed Grocery List</title></head><body>${hidden.innerHTML}</body></html>`);
  w.document.close();
  setTimeout(()=>{ try{ w.focus(); w.print(); }catch(e){} }, 400);
  hidden.remove();
}

// ---------- share image card (canvas) ----------
async function shareRecipeCard(recipe){
  toast('🎨','Building your card…','Rendering a social-ready image.', 1600);
  const W=1080,H=1350;
  const c = document.createElement('canvas'); c.width=W; c.height=H;
  const x = c.getContext('2d');
  // bg
  const g = x.createLinearGradient(0,0,0,H); g.addColorStop(0,'#171215'); g.addColorStop(1,'#0a0808');
  x.fillStyle=g; x.fillRect(0,0,W,H);
  // photo
  try{
    const img = await loadImg(recipe.image);
    const iw=img.width, ih=img.height; const tgt= W/ih;
    x.save(); x.beginPath(); x.roundRect(60,150,W-120,640,36); x.clip();
    const scale=Math.max((W-120)/iw, 640/ih);
    x.drawImage(img, 60+((W-120)-iw*scale)/2, 150+((640)-ih*scale)/2, iw*scale, ih*scale);
    x.restore();
  }catch(e){ x.fillStyle='#2a2226'; x.beginPath(); x.roundRect(60,150,W-120,640,36); x.fill(); }
  // header brand
  x.fillStyle='#ff5c5c'; x.font='800 34px -apple-system,Arial'; x.fillText('🍴 FORKFEED',60,84);
  x.fillStyle='#a89b96'; x.font='600 26px -apple-system,Arial'; x.fillText('What I\'m cooking tonight',60,124);
  // title
  x.fillStyle='#fff'; x.font='800 62px -apple-system,Arial'; wrapText(x, recipe.title, 60, 880, W-120, 74, 2);
  // meta row
  x.font='700 28px -apple-system,Arial';
  let mx=60; const meta=[`${recipe.cuisine}`,`${recipe.time} min`,recipe.difficulty,`★ ${fmtK(recipe.likes)} likes`];
  meta.forEach(m=>{ const w=x.measureText(m).width; x.fillStyle='rgba(255,255,255,.12)'; x.beginPath(); x.roundRect(mx,1010,w+34,54,27); x.fill(); x.fillStyle='#ffd9b8'; x.fillText(m,mx+17,1045); mx+=w+48; });
  // creator
  x.fillStyle='#ffb86b'; x.font='700 30px -apple-system,Arial'; x.fillText(`by ${recipe.creator}`,60,1130);
  // ingredient pills
  x.font='600 24px -apple-system,Arial';
  let px=60, py=1170;
  recipe.ingredients.slice(0,5).forEach(i=>{
    const t = i.name.split(',')[0].replace(/^./,ch=>ch.toUpperCase());
    const w = x.measureText(t).width+30;
    if(px+w > W-60){ px=60; py+=52; }
    x.fillStyle='rgba(255,184,107,.14)'; x.beginPath(); x.roundRect(px,py,w,44,22); x.fill();
    x.strokeStyle='rgba(255,184,107,.4)'; x.stroke();
    x.fillStyle='#ffb86b'; x.fillText(t,px+15,py+30);
    px += w+12;
  });
  // footer
  x.fillStyle='#6e625d'; x.font='600 24px -apple-system,Arial';
  x.fillText('Scan & cook the full recipe on ForkFeed → forkfeed.app',60,H-70);
  // scyn badge
  if(recipe.scynCurated){ x.fillStyle='rgba(110,195,255,.2)'; x.beginPath(); x.roundRect(W-420,H-96,360,52,26); x.fill(); x.fillStyle='#c9f0ff'; x.font='800 24px -apple-system,Arial'; x.fillText('⭐ Curated by Scyn AI',W-400,H-62); }
  const dataURL = c.toDataURL('image/png');
  // try native share
  try{
    const blob = await (await fetch(dataURL)).blob();
    const file = new File([blob], recipe.title.replace(/\s+/g,'-').toLowerCase()+'.png',{type:'image/png'});
    if(navigator.canShare && navigator.canShare({files:[file]})){
      await navigator.share({files:[file], title:recipe.title+' — ForkFeed', text:recipe.desc});
      toast('✅','Shared!','Your recipe card is out in the wild.'); return;
    }
  }catch(e){ /* fall through to download */ }
  const a=document.createElement('a'); a.href=dataURL; a.download=recipe.title.replace(/\s+/g,'-').toLowerCase()+'-forkfeed.png';
  document.body.appendChild(a); a.click(); a.remove();
  toast('🖼️','Card saved','Recipe image card downloaded as PNG.');
}
function loadImg(src){ return new Promise((res,rej)=>{ const i=new Image(); i.crossOrigin='anonymous'; i.onload=()=>res(i); i.onerror=rej; i.src=src; }); }
function wrapText(ctx, txt, x, y, maxW, lh, maxLines){
  const words=txt.split(' '); let line='', lines=[];
  words.forEach(w=>{ const t=line+w+' '; if(ctx.measureText(t).width>maxW && line){ lines.push(line); line=w+' '; } else line=t; });
  lines.push(line); if(lines.length>maxLines) lines=lines.slice(0,maxLines);
  lines.forEach((l,i)=>ctx.fillText(l.trim(),x,y+i*lh));
  return y+lines.length*lh;
}
if(!CanvasRenderingContext2D.prototype.roundRect){
  CanvasRenderingContext2D.prototype.roundRect = function(x,y,w,h,r){ this.moveTo(x+r,y); this.arcTo(x+w,y,x+w,y+h,r); this.arcTo(x+w,y+h,x,y+h,r); this.arcTo(x,y+h,x,y,r); this.arcTo(x,y,x+w,y,r); this.closePath(); return this; };
}

// ---------- AI engine ----------
const AI_SYS = 'You are ForkFeed\'s AI Chef inside a cooking app. You know food science, technique, substitutions, nutrition and grocery pricing. Answer helpfully, practically, and with warmth. Keep answers compact (under 130 words) unless asked for a full recipe. Use metric-friendly quantities. If asked about a dish in context, reference its actual ingredients.';

function builtinChefReply(msg, ctx){
  const m = msg.toLowerCase();
  const rec = ctx && ctx.recipe;
  const tone = S.ai.tone || 'warm';
  const tonePrefix = {warm:'Of course — ', gordon:'Right, LISTEN. ', sensei:'', hype:'YESSS! ', grandma:'Ah, sweetheart — '}[tone]||'';
  const joke = 'Why did the chef quit? They just couldn\'t take the heat... but you can. 🍳';
  if(rec){
    if(m.includes('ingredient')||m.includes('need')){
      return `${tonePrefix}for ${rec.title} you'll need: ${rec.ingredients.slice(0,6).map(i=>`${i.qty} ${i.unit? i.unit+' ':''}${i.name.split(',')[0]}`).join('; ')}${rec.ingredients.length>6?`, and ${rec.ingredients.length-6} more (see the Ingredients tab)`:''}. Tap Shop Ingredients and I'll route you to a grocer in your country.`;
    }
    if(m.includes('step')||m.includes('how')){
      return `${tonePrefix}the flow is: ${rec.steps.slice(0,3).map((s,i)=>`(${i+1}) ${s.split('.')[0].toLowerCase()}`).join(' → ')} … full ${rec.steps.length}-step guide is in the Steps tab. Want me to guide you live on camera? Tap Chef → AI Live.`;
    }
    if(m.includes('calor')||m.includes('nutrition')||m.includes('healthy')){
      const n=rec.nutrition; return `${tonePrefix}${rec.title} lands at ~${n.cal} kcal per serving — ${n.protein}g protein, ${n.carbs}g carbs, ${n.fat}g fat, ${n.fiber}g fiber. Health score ${healthScore(n)}/100. ${n.sodium>1000?'Watch the sodium — season at the table instead of the pan.':'Solid, balanced plate.'}`;
    }
    if(m.includes('joke')) return joke;
    if(m.includes('cost')||m.includes('price')||m.includes('estimat')) return `${tonePrefix}rough estimate: ${rec.ingredients.length} ingredients ≈ $${(rec.ingredients.length*3.2).toFixed(0)}–${(rec.ingredients.length*4.5).toFixed(0)} total, about $${(rec.ingredients.length*3.7/rec.servings).toFixed(1)} per serving depending on your market. Tap "Shop Ingredients" for live prices at a grocer near you.`;
  }
  if(m.includes('joke')) return joke;
  if(m.includes('20-minute')||m.includes('quick')){
    const quick = S.recipes.filter(r=>!r.live && r.time<=25);
    return `${tonePrefix}try ${quick[0]?.title||'True Carbonara'} (${quick[0]?.time||20} min) — pantry-friendly and fast. Or tell me what's in your fridge and I'll match something faster.`;
  }
  if(m.includes('have')||m.includes('fridge')||m.includes('leftover')){
    return `${tonePrefix}list what's in your fridge (even messy: "eggs, old bread, half an onion") and I'll match it against the ${S.recipes.length} recipes in your feed and scale servings to what you have.`;
  }
  if(m.includes('hello')||m.includes('hi ')||m==='hi'||m.includes('hey')) return `${tonePrefix}I'm your ForkFeed chef. Ask me to build a grocery list, scale servings, swap an ingredient for your diet, price a dish, or coach you live while you cook.`;
  return `${tonePrefix}I can plan meals, scale recipes, find substitutions (gluten-free, dairy-free, vegan, keto), estimate cost per serving, or coach you through ${rec?rec.title:'any recipe'} step by step with the Voice Chef. What are we cooking?`;
}
function healthScore(n){
  let s=50;
  s += Math.min(20, (n.protein||0)/2); s += Math.min(12,(n.fiber||0)*1.5);
  s -= Math.min(15, Math.max(0,(n.cal-500))/20); s -= Math.min(12, Math.max(0,(n.sodium-600))/60); s -= Math.min(10,(n.sugar||0)/5);
  return Math.max(5, Math.min(99, Math.round(s)));
}

// ---- provider dispatch ----
async function aiChat(userMsg, ctx, onToken){
  const conf = S.ai; const provider = conf.provider;
  const tone = TONE_PRESETS.find(t=>t.id===conf.tone)||TONE_PRESETS[0];
  const sys = AI_SYS + ' TONE: ' + tone.style;
  const ctxLine = ctx && ctx.recipe ? `\n[Context: user is viewing "${ctx.recipe.title}" — ${ctx.recipe.cuisine}, ${ctx.recipe.time} min, ingredients: ${ctx.recipe.ingredients.map(i=>i.name).slice(0,6).join(', ')}]` : '';
  const messages = [{role:'system',content:sys+ctxLine},{role:'user',content:userMsg}];
  if(provider==='openai' && conf.keys.openai){
    const r = await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+conf.keys.openai},body:JSON.stringify({model:conf.model,messages,max_tokens:400})});
    if(!r.ok) throw new Error('OpenAI '+r.status);
    const j = await r.json(); return j.choices[0].message.content;
  }
  if(provider==='openrouter' && conf.keys.openrouter){
    const r = await fetch('https://openrouter.ai/api/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+conf.keys.openrouter},body:JSON.stringify({model:conf.model,messages,max_tokens:400})});
    if(!r.ok) throw new Error('OpenRouter '+r.status);
    const j = await r.json(); return j.choices[0].message.content;
  }
  if(provider==='ollama'){
    try{
      const r = await fetch('http://localhost:11434/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:conf.model==='custom'?(conf.keys.ollamaModel||'llama3.2'):conf.model,messages,stream:false})});
      if(!r.ok) throw new Error('Ollama '+r.status);
      const j = await r.json(); return j.message.content;
    }catch(e){
      return '⚠️ Could not reach Ollama at localhost:11434. Make sure `ollama serve` is running and you pulled a model (e.g. `ollama pull llama3.2`). Meanwhile, here is my built-in take:\n\n'+builtinChefReply(userMsg, ctx);
    }
  }
  if(provider==='gemini' && conf.keys.gemini){
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${conf.model}:generateContent?key=${conf.keys.gemini}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{role:'user',parts:[{text:sys+ctxLine+'\nUser: '+userMsg}]}]})});
    if(!r.ok) throw new Error('Gemini '+r.status);
    const j = await r.json(); return j.candidates[0].content.parts[0].text;
  }
  // builtin
  await new Promise(r=>setTimeout(r, 620+Math.random()*500));
  return builtinChefReply(userMsg, ctx);
}

// ---------- URL recipe extraction (simulated fetch+parse, real structure) ----------
async function extractRecipeFromURL(url){
  await new Promise(r=>setTimeout(r,900));
  const canned = [
    {title:'Creamy Tuscan Chicken', cuisine:'Italian', time:30, difficulty:'Easy', servings:4,
     desc:'Sun-dried tomato cream chicken that tastes like a trattoria in 30 minutes.',
     ingredients:[{qty:600,unit:'g',name:'chicken breasts'},{qty:150,unit:'ml',name:'heavy cream'},{qty:80,unit:'g',name:'sun-dried tomatoes'},{qty:2,unit:'handfuls',name:'baby spinach'},{qty:3,unit:'cloves',name:'garlic, sliced'},{qty:40,unit:'g',name:'parmesan, grated'}],
     steps:['Season and sear the chicken until golden, rest aside.','Sauté garlic and sun-dried tomatoes for 1 minute.','Pour in cream with parmesan, simmer until thickened.','Return chicken, wilt in the spinach, serve over pasta.'],
     nutrition:{cal:470,protein:38,carbs:9,fat:32,fiber:2,sugar:4,sodium:590}},
    {title:'15-Minute Garlic Butter Noodles', cuisine:'Asian', time:15, difficulty:'Easy', servings:2,
     desc:'Silky butter-garlic noodles with a chili crisp finish.',
     ingredients:[{qty:250,unit:'g',name:'wheat noodles'},{qty:3,unit:'tbsp',name:'butter'},{qty:4,unit:'cloves',name:'garlic, minced'},{qty:1,unit:'tbsp',name:'soy sauce'},{qty:1,unit:'tsp',name:'chili crisp'},{qty:2,unit:'',name:'scallions'}],
     steps:['Boil noodles, reserve ½ cup water.','Brown the butter with garlic until fragrant.','Toss noodles in the butter with soy and splash of noodle water.','Finish with chili crisp and scallions.'],
     nutrition:{cal:520,protein:12,carbs:72,fat:19,fiber:3,sugar:3,sodium:890}}
  ];
  return Object.assign({id:'url'+Date.now(), creator:'Extracted Recipe', creatorHandle:'@link', hashtags:['#fromlink'], likes:0, commentsCount:0, saves:0, image:IMG.ramen, scynCurated:true, extracted:true}, canned[Math.floor(Math.random()*canned.length)]);
}
