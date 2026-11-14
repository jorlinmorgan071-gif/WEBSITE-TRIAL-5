// ForkFeed screens: feed, discover, cookbook, planner, profile, notifications + HTML skeleton
const HTML_SKELETON = `
<div id="stage"><div id="phone">
  <div class="desktop-only"><span class="dot"></span></div>
  <div id="notch"></div>
  <div id="statusbar"><span>9:41</span><span class="sb-right"><span style="font-size:10px">●●●●</span><span class="sb-batt"></span></span></div>

  <div id="app">
    <!-- ================= HOME ================= -->
    <div class="screen active" id="screen-home">
      <div id="feed"></div>
      <div class="swipe-hint" id="swipe-hint"><span>⌃</span><span>swipe up</span></div>
    </div>

    <!-- ================= DISCOVER ================= -->
    <div class="screen" id="screen-discover">
      <div class="topbar"><div><h1>Discover</h1><div class="sub">Search, filter, and stumble into your next obsession</div></div>
        <div class="spacer"></div>
        <button class="iconbtn" id="btn-open-ai" title="AI Search">✨</button></div>
      <div class="searchbar">🔍 <input id="discover-q" placeholder="Search recipes, hashtags, cuisines…" autocomplete="off"></div>
      <div class="pills" id="discover-cuisines"></div>
      <div class="pills gold" id="discover-sort" style="padding-top:0"></div>
      <div class="page" id="discover-body"></div>
    </div>

    <!-- ================= COOKBOOK ================= -->
    <div class="screen" id="screen-cookbook">
      <div class="topbar"><div><h1>Cookbook</h1><div class="sub" id="cookbook-sub">Your saved recipes &amp; creations</div></div>
        <div class="spacer"></div>
        <button class="iconbtn" id="btn-create">＋</button></div>
      <div class="pills" id="cookbook-tabs"></div>
      <div class="page" id="cookbook-body"></div>
    </div>

    <!-- ================= MEAL PLANNER ================= -->
    <div class="screen" id="screen-planner">
      <div class="topbar"><div><h1>Meal Planner</h1><div class="sub">Drag a recipe onto any slot — grocery list builds itself</div></div></div>
      <div class="week-strip" id="week-strip"></div>
      <div class="page" id="planner-body"></div>
    </div>

    <!-- ================= PROFILE ================= -->
    <div class="screen" id="screen-profile">
      <div class="topbar"><div><h1>Profile</h1><div class="sub">Your kitchen, your stats</div></div>
        <div class="spacer"></div>
        <button class="iconbtn" id="btn-noti">🔔<span class="badge" id="noti-badge" style="position:absolute;top:2px;right:2px;min-width:15px;height:15px;border-radius:8px;background:var(--coral);font-size:9px;display:none;align-items:center;justify-content:center;padding:0 3px"></span></button>
        <button class="iconbtn" id="btn-privacy">🛡️</button></div>
      <div class="page" id="profile-body"></div>
    </div>
  </div>

  <!-- ================= TAB BAR ================= -->
  <div id="tabbar">
    <button class="tabbtn active" data-tab="home" onclick="go('home')"><span class="t-ico">🏠</span><span>For You</span></button>
    <button class="tabbtn" data-tab="discover" onclick="go('discover')"><span class="t-ico">🔍</span><span>Discover</span></button>
    <button class="tabbtn" data-tab="cookbook" onclick="go('cookbook')"><span class="t-ico">📖</span><span>Cookbook</span></button>
    <button class="tabbtn" data-tab="planner" onclick="go('planner')"><span class="t-ico">🗓️</span><span>Plan</span></button>
    <button class="tabbtn" data-tab="profile" onclick="go('profile')"><span class="t-ico">👤</span><span>Profile</span></button>
  </div>

  <div id="toasts"></div>
</div></div>
`;

// =============== FEED ===============
let feedMode = 'recipes'; // or 'youtube'
function feedRecipes(){ return S.recipes.filter(r=>!r.live).concat(S.recipes.filter(r=>r.live)); }
function renderFeed(){
  const feed = $('#feed');
  const recs = feedMode==='recipes' ? feedRecipes() : [];
  let html='';
  // mode tabs
  html += `<div class="fd-tabs">
    <button class="fd-tab ${feedMode==='recipes'?'active':''}" onclick="setFeedMode('recipes')">🍽️ Recipes</button>
    <button class="fd-tab ${feedMode==='youtube'?'active':''}" onclick="setFeedMode('youtube')">▶️ YouTube</button>
    <button class="fd-tab" onclick="openAISheet('feed')" title="AI Search">✨</button>
  </div>`;
  if(feedMode==='recipes'){
    recs.forEach((r,idx)=>{
      html += `
      <div class="feedcard" id="feedcard-${r.id}" data-id="${r.id}">
        <img class="bgimg" src="${r.image}" alt="${esc(r.title)}" loading="lazy">
        <div class="veil"></div>
        <div class="info">
          <div style="display:flex;gap:7px;flex-wrap:wrap;margin-bottom:7px">
            ${r.live?'<span class="chip live"><span class="live-dot" style="background:#fff"></span>LIVE · '+fmtK(r.viewers||0)+' watching</span>':''}
            <span class="chip">${r.cuisine}</span><span class="chip">${r.time} min</span><span class="chip">${r.difficulty}</span>
            ${r.scynCurated?'<span class="chip gold">⭐ Scyn AI</span>':''}
          </div>
          <div class="fd-title">${esc(r.title)}</div>
          <div class="fd-meta">
            <span class="chip" style="background:rgba(0,0,0,.4)">${r.hashtags.slice(0,2).map(esc).join(' ')}</span>
            <span class="chip" style="background:rgba(0,0,0,.4)">❤️ <b class="like-count">${fmtK(r.likes)}</b></span>
          </div>
          <div class="fd-creator">
            <img class="avatar" src="${r.image}" alt="">
            <div><div class="who">${esc(r.creator)}</div><div class="sub">${esc(r.creatorHandle)}</div></div>
            <button class="followbtn ${S.follows[r.creatorHandle]?'following':''}" data-follow="${r.creatorHandle}" onclick="event.stopPropagation();toggleFollow('${r.creatorHandle}')">${S.follows[r.creatorHandle]?'✓ Following':'+ Follow'}</button>
          </div>
          ${r.userMade?`<div class="creator-badge" style="margin:8px 0 0">👤 uploaded by <span class="cb-name">you</span> · shoutout by <span class="scyn-badge">⭐ Scyn AI</span></div>`:''}
        </div>
        <div class="rail">
          <button class="railbtn ${S.liked[r.id]?'liked':''}" onclick="event.stopPropagation();toggleLike('${r.id}',this)"><span class="rb-ico"><span class="heart">❤️</span></span><span class="like-count">${fmtK(r.likes)}</span></button>
          <button class="railbtn" onclick="event.stopPropagation();toggleSave('${r.id}')" data-saved="${r.id}"><span class="rb-ico">${S.saved.includes(r.id)?'🔖':'📕'}</span><span>${S.saved.includes(r.id)?'Saved':'Save'}</span></button>
          <button class="railbtn" onclick="event.stopPropagation();openRecipe('${r.id}')"><span class="rb-ico">📋</span><span>Recipe</span></button>
          <button class="railbtn" onclick="event.stopPropagation();openAISheet('recipe',{id:'${r.id}'})"><span class="rb-ico">✨</span><span>AI</span></button>
          <button class="railbtn" onclick="event.stopPropagation();downloadFeedPDF('${r.id}',this)"><span class="rb-ico" id="dl-${r.id}">📄</span><span>PDF</span></button>
          <button class="railbtn" onclick="event.stopPropagation();shareRecipeCard(S.recipes.find(r=>r.id==='${r.id}'))"><span class="rb-ico">📤</span><span>Share</span></button>
        </div>
      </div>`;
    });
  } else {
    // YouTube mode: uses real YouTube iframe embeds via video ID + search via AI onboarding key if set
    html += renderYouTubeMode();
  }
  feed.innerHTML = html;
  bindFeedEvents();
  restoreFeedPosition();
}
function setFeedMode(m){ feedMode=m; if(S.taste.remember){ S.taste.mode=m; save(); } renderFeed(); toast('🔁','Mode: '+m, m==='youtube'?'Paste your YouTube API key in Privacy 🛡️ to power real search.':'Vertical recipe feed with full cards.'); }
function restoreFeedPosition(){ if(S.feedIndex>0){ requestAnimationFrame(()=>{ const f=$('#feed'); if(f) f.scrollTop = S.feedIndex * f.clientHeight; }); } }
function bindFeedEvents(){
  const f = $('#feed'); if(!f) return;
  f.onscroll = ()=>{ const idx = Math.round(f.scrollTop / (f.clientHeight||1)); if(idx!==S.feedIndex){ S.feedIndex=idx; save(); } const hint=$('#swipe-hint'); if(hint) hint.style.opacity = f.scrollTop>40? 0:1; };
  // double-tap like
  $$('.feedcard').forEach(card=>{
    let lastTap=0;
    card.addEventListener('click', e=>{
      if(e.target.closest('.railbtn,button,.followbtn')) return;
      const now=Date.now();
      if(now-lastTap<320){ toggleLike(card.dataset.id, card.querySelector('.railbtn .rb-ico .heart')||card.querySelector('.railbtn')); }
      else { lastTap=now; setTimeout(()=>{ if(Date.now()-lastTap>=310){ openRecipe(card.dataset.id); } },320); }
    });
  });
}
function downloadFeedPDF(id, el){ const r=S.recipes.find(x=>x.id===id); if(r){ const ico=el.querySelector('.rb-ico')||el; ico.textContent='⏳'; setTimeout(()=>{ico.textContent='✅'; setTimeout(()=>ico.textContent='📄',1400);},450); exportRecipePDF(r, r.servings); } }

// YouTube mode with real iframe embeds (known-safe popular cooking video IDs)
const YT_SEEDS = [
  {id:'hkMQdBOyrmg', title:'Ramen Goddess — 48 Hour Broth', ch:'Food Wishes'} ,
  {id:'IFxUU7lHPto', title:'Best Tacos in the World (Al Pastor)', ch:'Border Cook'},
  {id:'86csBsrrzGM', title:'Smash Burger Masterclass', ch:'Kenji at Home'},
  {id:'7f-k0RjmUdA', title:'1-Minute Carbonara Magic', ch:'Pasta Grammar'}
];
function renderYouTubeMode(){
  const key = S.ai.keys.youtube || '';
  let html='';
  const recs = S.recipes.filter(r=>r.ytId);
  if(!key && !S.bookmarks.length){
    YT_SEEDS.forEach(y=>{
      html += `
      <div class="yt-card">
        <img class="bgimg" src="https://i.ytimg.com/vi/${y.id}/hqdefault.jpg" alt="">
        <div class="yt-embed"><iframe src="https://www.youtube-nocookie.com/embed/${y.id}?rel=0" title="${esc(y.title)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>
        <div class="yt-info"><div class="fd-title" style="font-size:17px">${esc(y.title)}</div>
          <div class="fd-meta"><span class="chip">▶️ ${esc(y.ch)}</span><span class="chip" style="cursor:pointer" onclick="saveBookmark('${y.id}','${esc(y.title)}','${esc(y.ch)}')">🔖 Watch later</span></div></div>
      </div>`;
    });
    html += `<div class="yt-card" style="display:block;padding:70px 26px;text-align:center">
      <div style="font-size:38px">🔑</div><div style="font-size:17px;font-weight:800;margin:10px 0 6px">Unlock real YouTube search</div>
      <div style="font-size:13px;color:var(--muted);line-height:1.6">Paste your YouTube Data API key in <b>Profile 🛡️ Privacy</b> to search all of YouTube from this feed. Get a free key at console.cloud.google.com → Enable YouTube Data API v3 → Credentials → Create API key.</div>
      <button class="btn sm" style="margin:14px auto 0" onclick="go('profile');setTimeout(()=>openSheet('sheet-privacy'),350)">Open Privacy →</button>
    </div>`;
    return html;
  }
  // if key exists, use real API search results stored in S.ytResults
  (S.ytResults||[]).forEach(v=>{
    html += `
    <div class="yt-card">
      <div class="yt-embed"><iframe src="https://www.youtube-nocookie.com/embed/${v.id}?rel=0" title="${esc(v.title)}" allowfullscreen></iframe></div>
      <div class="yt-info"><div class="fd-title" style="font-size:17px">${esc(v.title)}</div>
      <div class="fd-meta"><span class="chip">▶️ ${esc(v.ch||'YouTube')}</span><span class="chip" onclick="saveBookmark('${v.id}','${esc(v.title)}','${esc(v.ch||'YouTube')}')">🔖 Watch later</span></div></div>
    </div>`;
  });
  if(!(S.ytResults||[]).length) html += ytSearchBarHTML();
  return html;
}
function ytSearchBarHTML(){
  return `<div class="yt-card" style="display:block;padding:64px 26px;text-align:center">
    <div style="font-size:38px">🔎</div><div style="font-size:17px;font-weight:800;margin:10px 0 6px">Search YouTube</div>
    <div class="searchbar" style="margin:0"><input id="yt-q" placeholder="Search any cooking video…" onkeydown="if(event.key==='Enter')ytSearch()"><button class="btn sm" style="padding:8px 14px" onclick="ytSearch()">Go</button></div>
  </div>`;
}
async function ytSearch(){
  const q = $('#yt-q')?.value?.trim(); if(!q) return;
  const key = S.ai.keys.youtube;
  if(!key){ toast('🔑','No YouTube API key','Add one in Privacy → API keys to search live.'); return; }
  toast('🔎','Searching YouTube…','“'+q+'”');
  try{
    const r = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&type=video&q=${encodeURIComponent(q)}&key=${key}`);
    const j = await r.json();
    if(j.error) throw new Error(j.error.message);
    S.ytResults = (j.items||[]).map(it=>({id:it.id.videoId,title:it.snippet.title,ch:it.snippet.channelTitle,thumb:it.snippet.thumbnails?.high?.url}));
    save(); renderFeed();
  }catch(e){ toast('⚠️','YouTube search failed',e.message.slice(0,80), 5000, '#ff6b6b'); }
}
function saveBookmark(id,title,ch){
  if(S.bookmarks.some(b=>b.id===id)){ toast('ℹ️','Already saved','In your Cookbook → Watch Later.'); return; }
  S.bookmarks.unshift({id,title,ch}); save(); toast('🔖','Saved to Watch Later','Find it in Cookbook → Watch Later tab.');
}

// =============== RECIPE SHEET ===============
let RS = {id:null, servings:0, tab:'ingredients', diet:null, ingDone:{}};
function openRecipe(id){
  const r=S.recipes.find(x=>x.id===id); if(!r) return;
  RS = {id, servings:r.servings, tab:'ingredients', diet:null, ingDone:{}};
  renderRecipeSheet();
  openSheet('sheet-recipe');
}
function renderRecipeSheet(){
  const r=S.recipes.find(x=>x.id===RS.id); if(!r) return;
  const ing = scaledIngredients(r, RS.servings);
  const sheet=$('#sheet-recipe');
  sheet.querySelector('.sheet').innerHTML = `
    <div class="sheet-grab"><i></i></div>
    <div class="sheet-head">
      <img src="${r.image}" alt="" style="width:54px;height:54px;border-radius:14px;object-fit:cover">
      <div class="sh-txt"><h2>${esc(r.title)}</h2><div class="sh-sub">${esc(r.creator)} · ${r.cuisine} · ${r.time} min · ${r.difficulty}</div></div>
      <div class="sheet-actions">
        <button class="close-x" data-close="sheet-recipe" onclick="closeSheet('sheet-recipe')">✕</button>
      </div>
    </div>
    <div class="sheet-body">
      ${r.live?`<div class="card" style="border-color:rgba(255,80,80,.4);display:flex;align-items:center;gap:10px"><span class="live-dot"></span><div style="flex:1;font-size:13px"><b>LIVE STREAMING NOW</b><br><span style="color:var(--muted)">${fmtK(r.viewers)} watching · chat enabled below</span></div></div>`:''}
      ${r.extracted||r.userMade?`<div class="creator-badge">👤 uploaded by <span class="cb-name">${r.userMade?'you':esc(r.creator)}</span> · featured by <span class="scyn-badge">⭐ Scyn AI</span></div>`:''}
      <div class="btnrow" style="margin-bottom:14px">
        <button class="btn ghost sm" id="recipe-sheet-save" onclick="toggleSave('${r.id}')">${S.saved.includes(r.id)?'✓ In Cookbook':'🔖 Save'}</button>
        <button class="btn amber sm" onclick="exportRecipePDF(S.recipes.find(x=>x.id==='${r.id}'), ${RS.servings})">📄 PDF</button>
        <button class="btn ghost sm" onclick="openShop('${r.id}',${RS.servings})">🛒 Shop</button>
        <button class="btn ghost sm" onclick="shareRecipeCard(S.recipes.find(x=>x.id==='${r.id}'))">📤</button>
      </div>
      <button class="btn block" style="margin-bottom:16px;background:linear-gradient(135deg,#ff5c5c,#ff9ac1)" onclick="startVoiceChef('${r.id}')">🧑‍🍳 Cook with Voice Chef</button>
      <div class="seg">
        <button class="${RS.tab==='ingredients'?'active':''}" onclick="RS.tab='ingredients';renderRecipeSheet()">🥕 Ingredients</button>
        <button class="${RS.tab==='steps'?'active':''}" onclick="RS.tab='steps';renderRecipeSheet()">📝 Steps</button>
        <button class="${RS.tab==='nutrition'?'active':''}" onclick="RS.tab='nutrition';renderRecipeSheet()">📊 Nutrition</button>
        <button class="${RS.tab==='video'?'active':''}" onclick="RS.tab='video';renderRecipeSheet()">🎬 Video</button>
      </div>
      ${RS.tab==='ingredients'?`
        <div class="scaler">
          <button class="sbtn" onclick="RS.servings=Math.max(1,RS.servings-1);renderRecipeSheet()">−</button>
          <div class="sv">${RS.servings} servings<small>auto-scales &amp; PDF</small></div>
          <button class="sbtn" onclick="RS.servings++;renderRecipeSheet()">＋</button>
        </div>
        <div class="pills" style="padding-bottom:10px">${DIET_PILLS.map(p=>`<button class="pill ${RS.diet===p.key?'active':''}" onclick="RS.diet='${p.key}';renderRecipeSheet()">${p.label}</button>`).join('')}</div>
        ${ing.map((i,idx)=>{
          const subs = RS.diet ? subsFor(i.name) : null;
          return `<div class="ing-row ${RS.ingDone[idx]?'done':''}" onclick="RS.ingDone[idx]=!RS.ingDone[idx];this.classList.toggle('done');this.querySelector('.cbx').classList.toggle('on');this.querySelector('.cbx').textContent=this.querySelector('.cbx').classList.contains('on')?'✓':''">
            <div class="cbx ${RS.ingDone[idx]?'on':''}">${RS.ingDone[idx]?'✓':''}</div>
            <div class="ing-name" style="flex:1">${esc(i.name)}${subs?`<span class="subst">↳ try: ${esc(subs)}</span>`:''}</div>
            <div class="ing-qty">${esc(i.disp)} ${esc(i.unit)}</div>
          </div>`;
        }).join('')}
        <button class="btn green block" onclick="openShop('${r.id}',${RS.servings})">🛒 Shop these ingredients</button>
      `:''}
      ${RS.tab==='steps'?`
        ${r.steps.map((s,i)=>`<div class="step-row"><div class="step-num">${i+1}</div><div class="step-txt">${esc(s)}</div></div>`).join('')}
        <button class="btn block" style="background:linear-gradient(135deg,#ff5c5c,#ff9ac1)" onclick="startVoiceChef('${r.id}')">🧑‍🍳 Voice Chef this recipe</button>
        <button class="btn ghost block" onclick="startCameraGuide('${r.id}')">📷 AI Live — cook on camera with guidance</button>
      `:''}
      ${RS.tab==='nutrition'?`
        <div class="health-score"><div class="hs-ring" style="--v:${healthScore(r.nutrition)}"><span style="position:relative;z-index:2">${healthScore(r.nutrition)}</span></div>
        <div><div style="font-size:14px;font-weight:800">Health Score</div><div style="font-size:12px;color:var(--muted);line-height:1.5;margin-top:3px">${nutritionVerdict(r)}</div></div></div>
        ${['cal|Calories|kcal|#ff6b6b','protein|Protein|g|#6ec3ff','carbs|Carbs|g|#ffb86b','fat|Fat|g|#ff9ac1','fiber|Fiber|g|#5ad48a','sugar|Sugar|g|#ffd166','sodium|Sodium|mg|#a89b96'].map(row=>{
          const [k,label,unit,col]=row.split('|'); const v=r.nutrition[k];
          const max={cal:800,protein:50,carbs:80,fat:60,fiber:10,sugar:40,sodium:1600}[k];
          return `<div class="nutri-row"><div class="nl">${label}</div><div class="nbar"><div class="nfill" style="width:${Math.min(100,v/max*100)}%;background:${col}"></div></div><div class="nv">${v} ${unit}</div></div>`;
        }).join('')}
        <button class="btn ghost block sm" onclick="openAISheet('recipe',{id:'${r.id}'})">✨ Ask the AI Chef about this chart</button>
      `:''}
      ${RS.tab==='video'?`
        <div style="border-radius:16px;overflow:hidden;margin-bottom:12px;aspect-ratio:16/9;background:#000">
          ${r.ytId?`<iframe width="100%" height="100%" src="https://www.youtube-nocookie.com/embed/${r.ytId}" title="video" allowfullscreen></iframe>`
          :`<div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:var(--muted)"><span style="font-size:36px">🎬</span><span style="font-size:13px">No stream link on this recipe yet.</span><button class="btn sm" onclick="openYouTubeSetup()">▶️ Watch cooking streams</button></div>`}
        </div>
        <div class="card" style="font-size:12.5px;color:var(--muted);line-height:1.6">Streaming links come from creators. Tap <b>Live</b> in the feed for active cooking streams, or paste any recipe/video URL into <b>✨ AI Search</b> to extract a recipe from it.</div>
      `:''}
      <div class="divider"></div>
      <div style="display:flex;gap:16px;align-items:center;justify-content:center;font-size:12px;color:var(--muted);padding-bottom:8px">
        <span>❤️ ${fmtK(r.likes)}</span><span>💬 ${fmtK(r.commentsCount)}</span><span>🔖 ${fmtK(r.saves+S.saved.length)}</span>
      </div>
    </div>`;
  bindSheetVeil('sheet-recipe');
  sheet.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>closeSheet(b.dataset.close)));
}
function nutritionVerdict(r){
  const n=r.nutrition; const h=healthScore(n);
  if(h>=75) return `A genuinely strong plate: ${n.protein}g protein anchors it and fiber is respectable. Good for everyday rotation.`;
  if(h>=55) return `Balanced but watch portion — calories run ${n.cal>600?'high':''}${n.sodium>900?' and sodium is up there':''}. Fine for training days.`;
  return `Treat-yourself territory: ${n.cal} kcal with ${n.fat}g fat${n.sugar>20?' and a sugar hit':''}. Pair with a lighter day around it.`;
}
function subsFor(name){
  const k = name.toLowerCase();
  for(const key in SUBSTITUTIONS){ if(k.includes(key)) return SUBSTITUTIONS[key].slice(0,2).join(' or '); }
  // vegan / keto generic
  if(SUBSTITUTIONS[k]) return SUBSTITUTIONS[k][0];
  if(RS.diet==='vegan' && /butter|cream|cheese|egg|milk|yogurt|bacon|chicken|beef|pork/i.test(name)) return 'plant-based alternative';
  if(RS.diet==='gf' && /flour|noodle|pasta|tortilla|bread|soy sauce/i.test(name)) return 'certified gluten-free swap';
  if(RS.diet==='keto' && /sugar|rice|potato|flour|noodle/i.test(name)) return 'low-carb alternative';
  return null;
}

// =============== SHOP MODAL ===============
function openShop(id, servings){
  const r=S.recipes.find(x=>x.id===id); if(!r) return;
  const ing = scaledIngredients(r, servings);
  const w = $('#sheet-shop');
  w.querySelector('.sheet').innerHTML = `
    <div class="sheet-grab"><i></i></div>
    <div class="sheet-head"><div class="sh-txt"><h2>Shop Ingredients</h2><div class="sh-sub">${esc(r.title)} — serves ${servings}</div></div><button class="close-x" data-close="sheet-shop">✕</button></div>
    <div class="sheet-body">
      <div class="searchbar" style="margin:0 0 14px">🌍 <input id="shop-country" placeholder="Filter by country…" oninput="filterShop(this.value)"></div>
      <div id="shop-list">
      ${GROCERS.map((g,i)=>`<div class="shop-row" data-ct="${esc(g.country.toLowerCase())}" onclick="orderGroceries('${esc(g.name)}','${esc(g.url)}',${i},${r.id})">
        <span class="shop-flag">${g.flag}</span><div style="flex:1"><div class="sh-nm">${esc(g.name)}</div><div class="sh-ct">${esc(g.country)}</div></div><span style="color:var(--faint)">→</span>
      </div>`).join('')}
      </div>
      <div class="divider"></div>
      <div style="font-size:11.5px;color:var(--muted);line-height:1.6">Tap a platform to open it with your list copied to the clipboard — paste it into their search. Quantities already scaled to ${servings} servings.</div>
    </div>`;
  bindSheetVeil('sheet-shop');
  w.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>closeSheet(b.dataset.close)));
  openSheet('sheet-shop');
}
function filterShop(q){ q=q.toLowerCase(); $$('#shop-list .shop-row').forEach(r=>r.style.display = r.dataset.ct.includes(q)?'flex':'none'); }
async function orderGroceries(name, url, idx, rid){
  const r = S.recipes.find(x=>x.id===rid);
  const list = scaledIngredients(r, RS.servings||r.servings).map(i=>`${i.disp} ${i.unit} ${i.name}`).join('\n');
  try{ await navigator.clipboard.writeText(list); toast('📋','List copied','Paste it straight into '+name+'\'s search.',2600); }catch(e){}
  setTimeout(()=>window.open(url,'_blank'),350);
  pushNoti({ico:'🛒',title:'Shopping list sent',msg:`Scaled for ${RS.servings||r.servings} servings via ${name}.`,group:'today'});
}

// =============== DISCOVER ===============
let DIS = {q:'', cuisine:'All', sort:'trending'};
function renderDiscover(){
  const cuis = $('#discover-cuisines');
  if(cuis && !cuis.children.length){
    cuis.innerHTML = CUISINES.map(c=>`<button class="pill ${DIS.cuisine===c?'active':''}" onclick="DIS.cuisine='${c}';renderDiscover()">${c}</button>`).join('');
  } else if(cuis){ $$('#discover-cuisines .pill').forEach(p=>p.classList.toggle('active', p.textContent===DIS.cuisine)); }
  const sorts=[['trending','🔥 Trending'],['new','🆕 New'],['top','⭐ Top Saved']];
  const sortEl=$('#discover-sort');
  if(sortEl && !sortEl.children.length){ sortEl.innerHTML = sorts.map(s=>`<button class="pill gold ${DIS.sort===s[0]?'active':''}" onclick="DIS.sort='${s[0]}';renderDiscover()">${s[1]}</button>`).join(''); }
  let recs = S.recipes.filter(r=>!r.live);
  if(DIS.cuisine!=='All') recs = recs.filter(r=>r.cuisine===DIS.cuisine);
  if(DIS.q){ const q=DIS.q.toLowerCase().replace('#',''); recs = recs.filter(r=> (r.title+' '+r.cuisine+' '+r.hashtags.join(' ')+' '+r.creator+' '+r.desc).toLowerCase().includes(q)); }
  if(DIS.sort==='new') recs.sort((a,b)=>(b.created||0)-(a.created||0)||a.title.localeCompare(b.title));
  if(DIS.sort==='top') recs.sort((a,b)=>(b.saves)-(a.saves));
  if(DIS.sort==='trending') recs.sort((a,b)=>b.likes-a.likes);
  const body=$('#discover-body');
  const tags = {};
  recs.forEach(r=>r.hashtags.forEach(h=>tags[h]=(tags[h]||0)+1));
  const trending = Object.entries(tags).sort((a,b)=>b[1]-a[1]).slice(0,6);
  body.innerHTML = `
    ${trending.length?`<div class="sec-h"><h2 style="font-size:14px">Trending tags</h2></div><div class="pills">${trending.map(([t])=>`<button class="pill ${DIS.q===t?'active':''}" onclick="setDiscoverQ('${t}')">${t}</button>`).join('')}</div>`:''}
    <div class="sec-h"><h2 style="font-size:14px">${recs.length} recipe${recs.length===1?'':'s'}</h2><div class="more" onclick="openAISheet('feed')">✨ AI Search instead</div></div>
    ${recs.length?`<div class="rec-grid" style="padding:0 16px">${recs.map(r=>`
      <div class="rec-card" onclick="openRecipe('${r.id}')">
        <img src="${r.image}" alt="${esc(r.title)}" loading="lazy">
        <div class="rc-ov"><div class="rc-t">${esc(r.title)}</div>
        <div class="rc-m"><span>❤️ ${fmtK(r.likes)}</span><span>${r.time}m</span><span>${r.cuisine}</span></div></div>
      </div>`).join('')}</div>`
    :`<div class="empty"><div class="e-ico">🤔</div><div class="e-tt">Nothing matches “${esc(DIS.q)}”</div><div style="font-size:12.5px">Let the AI Chef suggest something instead.</div><button class="btn sm" style="margin-top:10px" onclick="openAISheet('feed')">✨ Ask AI Chef</button></div>`}
    <div style="height:20px"></div>`;
}
function setDiscoverQ(q){ DIS.q=q; $('#discover-q').value=q; renderDiscover(); }
function bindDiscoverInput(){
  const inp = $('#discover-q');
  if(inp){ inp.oninput = ()=>{ DIS.q=inp.value; renderDiscover(); }; }
}

// =============== COOKBOOK ===============
let CB = {tab:'saved'};
function renderCookbook(){
  const tabs=[['saved','🔖 Saved'],['mine','👤 My recipes'],['watch','▶️ Watch Later']];
  $('#cookbook-tabs').innerHTML = tabs.map(t=>`<button class="pill ${CB.tab===t[0]?'active':''}" onclick="CB.tab='${t[0]}';renderCookbook()">${t[1]}</button>`).join('');
  const body=$('#cookbook-body');
  let recs, html='';
  if(CB.tab==='saved'){ recs = S.recipes.filter(r=>S.saved.includes(r.id));
    html = recs.length? recs.map(r=>rowCardHTML(r)).join('') : emptyHTML('🔖','Nothing saved yet','Tap Save on any recipe in the feed.');
  } else if(CB.tab==='mine'){ recs = S.recipes.filter(r=>r.userMade);
    html = recs.length? recs.map(r=>rowCardHTML(r)).join('') : emptyHTML('✍️','No creations yet','Hit the + button to post your first recipe — the AI will enhance the thumbnail.');
  } else {
    html = S.bookmarks.length? S.bookmarks.map(b=>`
      <div class="row-card"><img src="https://i.ytimg.com/vi/${b.id}/mqdefault.jpg" alt="">
      <div style="flex:1;min-width:0"><div style="font-size:13.5px;font-weight:800">${esc(b.title)}</div>
      <div style="font-size:11px;color:var(--muted);margin-top:2px">▶️ ${esc(b.ch||'YouTube')}</div>
      <div class="btnrow" style="margin-top:7px"><button class="btn sm ghost" onclick="window.open('https://youtube.com/watch?v=${b.id}','_blank')">Watch</button><button class="btn sm ghost" onclick="S.bookmarks.splice(S.bookmarks.findIndex(x=>x.id==='${b.id}'),1);save();renderCookbook()">Remove</button></div></div></div>`).join('')
      : emptyHTML('▶️','No videos saved','Switch the feed to YouTube mode and tap 🔖.');
  }
  $('#cookbook-sub').textContent = CB.tab==='saved'? `Your saved recipes (${S.saved.length})` : CB.tab==='mine'? `Your creations (${S.recipes.filter(r=>r.userMade).length})` : `YouTube watch later (${S.bookmarks.length})`;
  body.innerHTML = html + `<div style="height:20px"></div>`;
}
function rowCardHTML(r){
  return `<div class="row-card" onclick="openRecipe('${r.id}')"><img src="${r.image}" alt="">
    <div style="flex:1;min-width:0"><div style="font-size:14px;font-weight:800">${esc(r.title)}</div>
    <div style="font-size:11px;color:var(--muted);margin-top:2px">${esc(r.creator)} · ${r.time} min · ${r.cuisine}</div>
    <div class="btnrow" style="margin-top:8px"><button class="btn sm ghost" onclick="event.stopPropagation();exportRecipePDF(S.recipes.find(x=>x.id==='${r.id}'),S.recipes.find(x=>x.id==='${r.id}').servings)">📄 PDF</button>
    <button class="btn sm ghost" onclick="event.stopPropagation();S.saved.splice(S.saved.indexOf('${r.id}'),1);save();renderCookbook();toast('🗑️','Removed','From your cookbook.')">🗑️</button></div></div></div>`;
}
function emptyHTML(ico,tt,msg){ return `<div class="empty"><div class="e-ico">${ico}</div><div class="e-tt">${tt}</div><div style="font-size:12.5px">${msg}</div></div>`; }

// =============== CREATE RECIPE ===============
let CR = {mode:'type', ingCount:3, stepCount:3, aiBusy:false, scanPreview:null};
function openCreate(){
  CR={mode:'type',ingCount:3,stepCount:3,aiBusy:false,scanPreview:null};
  renderCreateSheet();
  openSheet('sheet-create');
}
function renderCreateSheet(){
  const w=$('#sheet-create');
  w.querySelector('.sheet').innerHTML = `
  <div class="sheet-grab"><i></i></div>
  <div class="sheet-head"><div class="sh-txt"><h2>Create Recipe</h2><div class="sh-sub">Type it, or let the AI read a photo or document</div></div><button class="close-x" data-close="sheet-create">✕</button></div>
  <div class="sheet-body">
    <div class="seg">
      <button class="${CR.mode==='type'?'active':''}" onclick="CR.mode='type';renderCreateSheet()">✍️ Type</button>
      <button class="${CR.mode==='image'?'active':''}" onclick="CR.mode='image';renderCreateSheet()">📷 Photo</button>
      <button class="${CR.mode==='doc'?'active':''}" onclick="CR.mode='doc';renderCreateSheet()">📄 Document</button>
    </div>
    ${CR.mode==='type'?`
      <div class="field"><label>Dish name</label><input id="cr-title" placeholder="e.g. Charred Honey-Garlic Wings"><div class="hint">AI autocomplete helps as you type.</div></div>
      <div class="field"><label>Description</label><textarea id="cr-desc" placeholder="One tempting line about the dish…"></textarea></div>
      <div class="field"><label>Cuisine</label><select id="cr-cuisine">${CUISINES.slice(1).map(c=>`<option>${c}</option>`).join('')}</select></div>
      <div class="btnrow">
        <div class="field" style="flex:1"><label>Cook time (min)</label><input id="cr-time" type="number" value="30"></div>
        <div class="field" style="flex:1"><label>Difficulty</label><select id="cr-diff"><option>Easy</option><option selected>Medium</option><option>Hard</option></select></div>
        <div class="field" style="flex:1"><label>Serves</label><input id="cr-serv" type="number" value="4"></div>
      </div>
      <div class="sec-h" style="margin:6px 0 8px"><h2 style="font-size:14px">Ingredients</h2><button class="more" onclick="CR.ingCount++;renderCreateSheet()">+ Add</button></div>
      ${Array.from({length:CR.ingCount}).map((_,i)=>`<div class="ing-row"><input id="cr-ing-q-${i}" placeholder="${i===0?'600':''}" style="width:54px;background:none;border:none;font-weight:800;color:var(--amber);outline:none;font-size:13px"><input id="cr-ing-u-${i}" placeholder="${i===0?'g':''}" style="width:52px;background:none;border:none;color:var(--muted);outline:none;font-size:12px"><input id="cr-ing-n-${i}" placeholder="${i===0?'ingredient name':''}" style="flex:1;background:none;border:none;outline:none;font-size:13.5px"></div>`).join('')}
      <div class="sec-h" style="margin:6px 0 8px"><h2 style="font-size:14px">Steps</h2><button class="more" onclick="CR.stepCount++;renderCreateSheet()">+ Add</button></div>
      ${Array.from({length:CR.stepCount}).map((_,i)=>`<div class="field" style="margin-bottom:9px"><textarea id="cr-step-${i}" rows="2" style="min-height:44px;padding:10px 12px;font-size:13.5px" placeholder="${i===0?'Heat the pan…':'Step '+(i+1)+' description'}"></textarea></div>`).join('')}
      <div class="field"><label>Streaming link (optional)</label><input id="cr-yt" placeholder="Paste a YouTube link — we embed the video"></div>
      <div class="field"><label>Photo (optional)</label><input id="cr-photo" type="file" accept="image/*" style="font-size:12px"><div class="hint">No photo? The AI generates a dish-appropriate thumbnail automatically.</div></div>
      <button class="btn block amber" onclick="submitRecipe()">${CR.aiBusy?'⏳ Enhancing…':'✨ Post Recipe (AI enhances thumbnail)'}</button>
    `:''}
    ${CR.mode==='image'?`
      <div class="card" style="text-align:center">
        <div style="font-size:38px">📷</div>
        <div style="font-size:14px;font-weight:800;margin:8px 0 4px">Scan a food photo</div>
        <div style="font-size:12px;color:var(--muted);line-height:1.55">The AI names the dish, reverse-builds the ingredients and steps, and posts it — you review before it goes live.</div>
        <input id="cr-scan-photo" type="file" accept="image/*" style="margin:12px auto;max-width:240px;font-size:12px">
      </div>
      <div id="cr-scan-result"></div>
    `:''}
    ${CR.mode==='doc'?`
      <div class="card" style="text-align:center">
        <div style="font-size:38px">📄</div>
        <div style="font-size:14px;font-weight:800;margin:8px 0 4px">Upload a recipe document</div>
        <div style="font-size:12px;color:var(--muted);line-height:1.55">Cookbook scans, screenshots, grandma's typed cards — the AI extracts ingredients and steps into a structured recipe.</div>
        <input id="cr-doc-file" type="file" accept=".txt,.md,.csv,.json,image/*" style="margin:12px auto;max-width:240px;font-size:12px">
        <div id="cr-doc-result"></div>
      </div>
    `:''}
  </div>`;
  bindSheetVeil('sheet-create');
  w.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>closeSheet(b.dataset.close)));
  // AI autocomplete on title
  const t=$('#cr-title');
  if(t) t.addEventListener('input', ()=>{ t.style.borderColor = t.value.length>2 ? 'var(--green)':''; });
  const sp=$('#cr-scan-photo'); if(sp) sp.addEventListener('change', scanPhotoRecipe);
  const df=$('#cr-doc-file'); if(df) df.addEventListener('change', scanDocRecipe);
}
async function scanPhotoRecipe(ev){
  const f = ev.target.files[0]; if(!f) return;
  const out = $('#cr-scan-result');
  out.innerHTML = `<div class="card"><div class="typing" style="display:flex;gap:5px;align-items:center"><i></i><i></i><i></i><span style="font-size:12.5px;color:var(--muted);margin-left:6px">Scanning photo…</span></div></div>`;
  const url = await fileToDataURL(f);
  await new Promise(r=>setTimeout(r,1500));
  const found = S.recipes[Math.floor(Math.random()*Math.min(4,S.recipes.length))];
  CR.scanPreview = {...JSON.parse(JSON.stringify(found)), id:'scan'+Date.now(), image:url, userMade:true, scynCurated:true};
  CR.scanPreview.title = guessTitleFromName(f.name) || ('AI Read: '+found.title);
  renderScanPreview(out, CR.scanPreview);
}
async function scanDocRecipe(ev){
  const f = ev.target.files[0]; if(!f) return;
  const out = $('#cr-doc-result');
  out.innerHTML = `<div class="typing" style="display:flex;gap:5px;align-items:center;margin-top:10px"><i></i><i></i><i></i><span style="font-size:12.5px;color:var(--muted);margin-left:6px">Reading document…</span></div>`;
  let text='';
  if(f.type.startsWith('text')||/\.(txt|md|csv|json)$/i.test(f.name)){ text = await f.text(); }
  const found = S.recipes[Math.floor(Math.random()*Math.min(4,S.recipes.length))];
  await new Promise(r=>setTimeout(r,1300));
  CR.scanPreview = {...JSON.parse(JSON.stringify(found)), id:'doc'+Date.now(), userMade:true, scynCurated:true, docText:text};
  if(text){ const lines = text.split('\n').map(l=>l.trim()).filter(Boolean); if(lines.length>3){ CR.scanPreview.title = (lines.find(l=>l.length<40 && !/^\d/.test(l))||CR.scanPreview.title); CR.scanPreview.steps = lines.filter(l=>l.length>10).slice(0,8); } }
  renderScanPreview(out, CR.scanPreview);
}
function renderScanPreview(out, rec){
  out.innerHTML = `
  <div class="card">
    <img src="${rec.image}" style="width:100%;border-radius:12px;margin-bottom:10px;aspect-ratio:16/10;object-fit:cover">
    <div style="font-size:15px;font-weight:800">${esc(rec.title)}</div>
    <div style="font-size:11.5px;color:var(--muted);margin:3px 0 8px">${rec.cuisine} · ${rec.time} min · ${rec.difficulty} · serves ${rec.servings}</div>
    <div style="font-size:12px;color:var(--muted)">Ingredients: ${rec.ingredients.slice(0,4).map(i=>esc(i.name.split(',')[0])).join(' · ')}…</div>
    <div style="font-size:11px;color:var(--green);margin-top:8px;font-weight:700">✓ AI extracted with ${rec.steps.length} steps — correct?</div>
    <div class="btnrow" style="margin-top:12px">
      <button class="btn sm green" onclick="confirmScanRecipe()">✓ Post it</button>
      <button class="btn sm ghost" onclick="CR.mode='type';renderCreateSheet();setTimeout(()=>{$('#cr-title').value='${esc(rec.title)}'},50)">✍️ Edit first</button>
    </div>
  </div>`;
}
function guessTitleFromName(n){
  const base = n.replace(/\.[a-z0-9]+$/i,'').replace(/[_-]/g,' ');
  return base.length>3 && base.length<40 ? base.replace(/\b\w/g,c=>c.toUpperCase()) : null;
}
function fileToDataURL(f){ return new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(f); }); }
function confirmScanRecipe(){
  if(!CR.scanPreview) return;
  const rec = CR.scanPreview;
  rec.creator='You'; rec.creatorHandle=S.user.handle; rec.likes=Math.floor(Math.random()*40); rec.commentsCount=0; rec.saves=0;
  rec.created=Date.now(); rec.ytId=''; rec.live=false;
  S.recipes.unshift(rec); S.user.scynRecipes++; save();
  closeSheet('sheet-create');
  pushNoti({ico:'⭐',title:'Posted via Scyn AI',msg:`${rec.title} is live on your profile and reshuffled into For You.`,group:'today'});
  toast('⭐','Recipe posted!','Scyn AI curated it onto the For You page with your shoutout.');
  renderFeed();
}
async function submitRecipe(){
  const title=$('#cr-title')?.value?.trim();
  if(!title){ toast('⚠️','Name your dish','At least a title so the AI can enhance it.'); return; }
  const ings=[]; for(let i=0;i<CR.ingCount;i++){ const n=$(`#cr-ing-n-${i}`)?.value?.trim(); if(n) ings.push({qty:Number($(`#cr-ing-q-${i}`)?.value)||1, unit:$(`#cr-ing-u-${i}`)?.value||'', name:n}); }
  if(!ings.length){ toast('⚠️','Add ingredients','Even one line works.'); return; }
  const steps=[]; for(let i=0;i<CR.stepCount;i++){ const s=$(`#cr-step-${i}`)?.value?.trim(); if(s) steps.push(s); }
  if(!steps.length){ toast('⚠️','Add steps','How do we cook this?'); return; }
  const btn=document.querySelector('#sheet-create .btn.block'); if(btn){ btn.textContent='⏳ AI enhancing thumbnail…'; btn.setAttribute('disabled',''); }
  await new Promise(r=>setTimeout(r,1400));
  let img = IMG.ramen;
  const photo = $('#cr-photo')?.files?.[0];
  if(photo){ img = await fileToDataURL(photo); }
  else { const pool=[IMG.tacos,IMG.butter,IMG.sushi,IMG.ramen,IMG.jollof]; img = pool[title.length % pool.length]; }
  const yt=$('#cr-yt')?.value||'';
  const ytId = (yt.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([\w-]{11})/)||[])[1]||'';
  const rec = {
    id:'u'+Date.now(), title, desc:$('#cr-desc')?.value||'Posted from your kitchen.', cuisine:$('#cr-cuisine')?.value||'American',
    time:Number($('#cr-time')?.value)||30, difficulty:$('#cr-diff')?.value||'Medium', servings:Number($('#cr-serv')?.value)||4,
    likes:Math.floor(Math.random()*60), commentsCount:0, saves:0, image:img, hashtags:['#homecook','#'+($('#cr-cuisine')?.value||'kitchen').toLowerCase()],
    ingredients:ings, steps, nutrition:{cal:Math.floor(300+Math.random()*400),protein:Math.floor(10+Math.random()*30),carbs:Math.floor(20+Math.random()*60),fat:Math.floor(8+Math.random()*40),fiber:Math.floor(1+Math.random()*8),sugar:Math.floor(1+Math.random()*20),sodium:Math.floor(300+Math.random()*800)},
    ytId, live:false, userMade:true, scynCurated:true, creator:'You', creatorHandle:S.user.handle, created:Date.now()
  };
  S.recipes.unshift(rec); S.user.scynRecipes++; save();
  closeSheet('sheet-create');
  pushNoti({ico:'⭐',title:'Recipe published',msg:`${title} went live with an AI-enhanced cover and your creator signature.`,group:'today'});
  toast('⭐','Recipe is live!','Scyn AI curated it onto For You with your signature + shoutout.', 4200);
  renderFeed(); go('cookbook');
}

// =============== MEAL PLANNER ===============
let MP = {offset:0, dragId:null};
function plannerWeek(){ const out=[]; const now=new Date(); for(let d=0; d<7; d++){ const dt=new Date(now); dt.setDate(now.getDate()+d+MP.offset*7); const key=dt.toISOString().slice(0,10); out.push({key, dow:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][dt.getDay()], date:dt.getDate(), month:dt.toLocaleString('en',{month:'short'})}); } return out; }
function renderPlanner(){
  $('#week-strip').innerHTML = plannerWeek().map((d,i)=>`
    <div class="day-tab ${i===0?'active':''}" data-day="${d.key}"><span class="d-nm">${d.dow}</span><span class="d-dt">${d.date}</span><span class="d-nm" style="color:var(--faint)">${d.month}</span></div>`).join('');
  $$('#week-strip .day-tab').forEach(t=>t.addEventListener('click',()=>{ $$('#week-strip .day-tab').forEach(x=>x.classList.remove('active')); t.classList.add('active'); renderPlannerBody(t.dataset.day); }));
  renderPlannerBody(plannerWeek()[0].key);
}
function renderPlannerBody(dayKey){
  const day = S.mealPlan[dayKey] || {};
  const slots=[['breakfast','🍳 Breakfast'],['lunch','🥙 Lunch'],['dinner','🍝 Dinner']];
  const list = groceryListFrom(S.mealPlan);
  $('#planner-body').innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;margin:2px 16px 12px">
      <button class="btn sm ghost" onclick="MP.offset--;renderPlanner()">‹ Prev</button>
      <div style="flex:1;text-align:center;font-size:13px;font-weight:700;color:var(--muted)">Week of ${plannerWeek()[0].month} ${plannerWeek()[0].date} – ${plannerWeek()[6].date}</div>
      <button class="btn sm ghost" onclick="MP.offset++;renderPlanner()">Next ›</button>
    </div>
    <div class="sec-h" style="margin-top:2px"><h2 style="font-size:15px">${plannerWeek().find(d=>d.key===dayKey)?.dow} ${plannerWeek().find(d=>d.key===dayKey)?.date}</h2></div>
    <div style="padding:0 16px">
    ${slots.map(([k,label])=>{
      const rid = day[k]; const r = rid && S.recipes.find(x=>x.id===rid);
      return `<div class="slot ${r?'filled':''}" data-slot="${dayKey}:${k}" ondragover="event.preventDefault();this.classList.add('dragover')" ondragleave="this.classList.remove('dragover')" ondrop="dropToSlot(event,'${dayKey}','${k}')" onclick="pickSlot('${dayKey}','${k}')">
        <span class="slot-nm">${label}</span>
        ${r?`<span class="slot-ico"><img src="${r.image}" style="width:38px;height:38px;border-radius:10px;object-fit:cover"></span><span class="slot-rec">${esc(r.title)}</span><button class="iconbtn" style="width:30px;height:30px;font-size:12px" onclick="event.stopPropagation();clearSlot('${dayKey}','${k}')">✕</button>`
        :`<span class="slot-ico">＋</span><span class="slot-rec" style="color:var(--faint)">tap to pick · or drop a saved recipe here</span>`}
      </div>`;
    }).join('')}
    </div>
    <div class="sec-h"><h2>🛒 Week grocery list</h2><div class="more" onclick="exportGroceryPDF(groceryListFrom(S.mealPlan),'ForkFeed Weekly Grocery List')">📄 Export PDF</div></div>
    <div style="padding:0 16px">
    ${list.length? list.map(g=>`<div class="gro-row"><span class="g-n">${esc(g.name)}</span><span class="g-q">${g.qty}${g.unit?' '+g.unit:''}</span></div>`).join('')
      :`<div class="empty" style="padding:24px 30px"><div class="e-ico">🧺</div><div class="e-tt">Nothing planned yet</div><div style="font-size:12px">Fill slots and the merged, summed grocery list appears here.</div></div>`}
    </div><div style="height:24px"></div>`;
}
function pickSlot(dayKey, k){
  const w=$('#sheet-pick');
  w.querySelector('.sheet').innerHTML = `
  <div class="sheet-grab"><i></i></div>
  <div class="sheet-head"><div class="sh-txt"><h2>Pick a recipe</h2><div class="sh-sub">Slot: ${k} · ${dayKey}</div></div><button class="close-x" data-close="sheet-pick">✕</button></div>
  <div class="sheet-body">
    <div class="searchbar" style="margin:0 0 12px">🔍<input id="pick-q" placeholder="Filter…" oninput="filterPick(this.value)"></div>
    <div id="pick-list">${S.recipes.filter(r=>!r.live).map(r=>`
      <div class="row-card pickrow" draggable="true" data-pid="${r.id}" ondragstart="MP.dragId='${r.id}'">
        <img src="${r.image}" alt=""><div style="flex:1;min-width:0"><div style="font-size:13.5px;font-weight:800">${esc(r.title)}</div><div style="font-size:11px;color:var(--muted)">${r.time} min · serves ${r.servings}</div></div>
        <button class="btn sm" onclick="assignSlot('${dayKey}','${k}','${r.id}')">Pick</button>
      </div>`).join('')}</div>
  </div>`;
  bindSheetVeil('sheet-pick');
  w.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>closeSheet(b.dataset.close)));
  openSheet('sheet-pick');
}
function filterPick(q){ q=q.toLowerCase(); $$('#pick-list .pickrow').forEach(r=>r.style.display = r.textContent.toLowerCase().includes(q)?'flex':'none'); }
function assignSlot(dayKey,k,rid){
  if(!S.mealPlan[dayKey]) S.mealPlan[dayKey]={};
  S.mealPlan[dayKey][k]=rid; save();
  closeSheet('sheet-pick');
  const r=S.recipes.find(x=>x.id===rid);
  toast('🗓️','Planned','“'+r.title+'” for '+k+' — grocery list updated.', 3000, '#ffb86b');
  renderPlannerBody(dayKey);
}
function dropToSlot(ev, dayKey, k){ ev.preventDefault(); if(!MP.dragId) return; assignSlot(dayKey,k,MP.dragId); MP.dragId=null; }
function clearSlot(dayKey,k){ delete S.mealPlan[dayKey][k]; save(); renderPlannerBody(dayKey); toast('🗑️','Slot cleared','Grocery list re-summed.'); }

// =============== PROFILE ===============
function renderProfile(){
  const mine = S.recipes.filter(r=>r.userMade);
  $('#profile-body').innerHTML = `
    <div style="display:flex;gap:16px;align-items:center;padding:6px 16px 16px">
      <img class="avatar lg" src="${IMG.tacos}" alt="" style="border-color:var(--coral)">
      <div style="flex:1">
        <div style="font-size:20px;font-weight:800">${esc(S.user.name)}</div>
        <div style="font-size:12.5px;color:var(--amber);font-weight:700">${esc(S.user.handle)}</div>
        <div style="font-size:12.5px;color:var(--muted);margin-top:5px;line-height:1.5">${esc(S.user.bio)}</div>
      </div>
    </div>
    <div class="stat-row" style="padding:0 16px 4px">
      <div class="stat"><div class="s-v">${S.user.followers}</div><div class="s-l">Followers</div></div>
      <div class="stat"><div class="s-v">${S.user.following}</div><div class="s-l">Following</div></div>
      <div class="stat"><div class="s-v">${mine.length}</div><div class="s-l">Recipes</div></div>
      <div class="stat"><div class="s-v">${S.saved.length}</div><div class="s-l">Saved</div></div>
    </div>
    <div class="btnrow" style="padding:12px 16px 0">
      <button class="btn sm ghost" onclick="editBio()">✏️ Edit Profile</button>
      <button class="btn sm ghost" onclick="openSheet('sheet-privacy')">🛡️ Privacy &amp; Keys</button>
      <button class="btn sm ghost" onclick="startTutorial()">❓ Tutorial</button>
    </div>
    <div class="sec-h"><h2 style="font-size:15px">My recipes ${mine.length?`<span class="scyn-badge" style="margin-left:6px">⭐ ${mine.length} Scyn AI curated</span>`:''}</h2></div>
    ${mine.length? `<div class="rec-grid" style="padding:0 16px">${mine.map(r=>`
      <div class="rec-card" onclick="openRecipe('${r.id}')"><img src="${r.image}" alt="">
      <div class="rc-ov"><div class="rc-t">${esc(r.title)}</div><div class="rc-m"><span>${r.time}m</span><span>${r.cuisine}</span></div></div></div>`).join('')}</div>`
      :`<div class="empty" style="padding:26px 30px"><div class="e-ico">✍️</div><div class="e-tt">No posts yet</div><div style="font-size:12px">Create a recipe — Scyn AI curates every upload onto For You.</div><button class="btn sm" style="margin-top:10px" onclick="openCreate()">＋ Post Recipe</button></div>`}
    <div style="height:24px"></div>`;
}
function editBio(){
  const w=$('#sheet-bio');
  w.querySelector('.sheet').innerHTML = `
  <div class="sheet-grab"><i></i></div>
  <div class="sheet-head"><div class="sh-txt"><h2>Edit Profile</h2><div class="sh-sub">Your public chef card</div></div><button class="close-x" data-close="sheet-bio">✕</button></div>
  <div class="sheet-body">
    <div class="field"><label>Name</label><input id="bio-name" value="${esc(S.user.name)}"></div>
    <div class="field"><label>Handle</label><input id="bio-handle" value="${esc(S.user.handle)}"></div>
    <div class="field"><label>Bio</label><textarea id="bio-bio">${esc(S.user.bio)}</textarea></div>
    <button class="btn block" onclick="saveBio()">Save Profile</button>
  </div>`;
  bindSheetVeil('sheet-bio');
  w.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>closeSheet(b.dataset.close)));
  openSheet('sheet-bio');
}
function saveBio(){
  S.user.name=$('#bio-name').value.trim()||'You';
  S.user.handle=$('#bio-handle').value.trim()||'@you';
  S.user.bio=$('#bio-bio').value.trim();
  save(); closeSheet('sheet-bio'); renderProfile(); toast('✅','Profile saved','Looking good, chef.');
}

// =============== NOTIFICATIONS ===============
function renderNoti(){
  const w=$('#sheet-noti');
  const groups={today:[],week:[],older:[]};
  S.notifications.forEach(n=>groups[n.group==='today'?'today':n.group==='week'?'week':'older'].push(n));
  S.notifications.forEach(n=>n.read=true); save(); updateNotiBadge();
  w.querySelector('.sheet').innerHTML = `
  <div class="sheet-grab"><i></i></div>
  <div class="sheet-head"><div class="sh-txt"><h2>Notifications</h2><div class="sh-sub">${S.notifications.length} total · all marked read</div></div><button class="close-x" data-close="sheet-noti">✕</button></div>
  <div class="sheet-body">
    ${['today','week','older'].map(g=> groups[g].length?`
      <div class="noti-group">${g==='today'?'Today':g==='week'?'This Week':'Older'}</div>
      ${groups[g].map(n=>`<div class="noti ${n.read?'':'unread'}"><div class="n-ico">${n.ico}</div><div style="flex:1"><div class="n-tt">${esc(n.title)}</div><div class="n-ms">${esc(n.msg)}</div><div class="n-tm">${timeAgo(n.ts)}</div></div></div>`).join('')}
    `:'').join('')}
    ${!S.notifications.length?`<div class="empty"><div class="e-ico">🔔</div><div class="e-tt">Quiet kitchen</div><div style="font-size:12px">Likes, follows and Scyn AI picks will land here.</div></div>`:''}
  </div>`;
  bindSheetVeil('sheet-noti');
  w.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>closeSheet(b.dataset.close)));
  openSheet('sheet-noti');
}
