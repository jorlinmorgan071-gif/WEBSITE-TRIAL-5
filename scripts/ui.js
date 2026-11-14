// ForkFeed AI experiences: chat overlay, AI search, voice chef, camera guide, onboarding, tutorial, privacy
// =============== AI CHAT OVERLAY ===============
let AI = {ctx:null, msgs:[], busy:false, atts:[]};
function openAISheet(from, ctx){
  AI.ctx = ctx||null; AI.atts=[];
  if(!AI.msgs.length) AI.msgs = [{role:'ai', text:'Hey — I\'m your ForkFeed AI Chef. '+(ctx&&ctx.id?`I can see you're looking at “${S.recipes.find(r=>r.id===ctx.id)?.title}”. `:'')+'Ask me anything: scale a recipe, find swaps for your diet, price a dish, plan the week — or just tell me what\'s in your fridge.'}];
  renderAI();
  $('#aiwrap').classList.add('open');
  if(ctx&&ctx.id){ const r=S.recipes.find(x=>x.id===ctx.id); if(r) AI.msgs.push({role:'ai', text:`Context loaded: “${r.title}” — ${r.cuisine}, ${r.time} min, ${r.steps.length} steps, serves ${r.servings}. Fire away.`}); renderAI(); }
}
function closeAI(){ $('#aiwrap').classList.remove('open'); }
function renderAI(){
  const msgs=$('#ai-msgs');
  msgs.innerHTML = AI.msgs.map(m=> m.thinking? `<div class="msg ai thinking">${m.text}</div>` :
    `<div class="msg ${m.role==='user'?'user':'ai'}">${esc(m.text).replace(/\n/g,'<br>')}</div>`).join('')
    + (AI.busy? `<div class="msg ai thinking"><span class="typing"><i></i><i></i><i></i></span></div>`:'');
  msgs.scrollTop = msgs.scrollHeight;
  $('#ai-att-row').innerHTML = AI.atts.map((a,i)=>`<div class="att-thumb"><img src="${a.url}"><button class="x" onclick="AI.atts.splice(${i},1);renderAI()">✕</button></div>`).join('');
  // tone label + provider model chips
  const tone = TONE_PRESETS.find(t=>t.id===S.ai.tone)||TONE_PRESETS[0];
  $('#ai-tone-label').textContent = tone.emoji+' '+tone.name;
}
async function aiSend(){
  const inp=$('#ai-in'); const txt=inp.value.trim(); if(!txt||AI.busy) return;
  inp.value='';
  AI.msgs.push({role:'user', text:txt});
  AI.busy=true; renderAI();
  const attNote = AI.atts.length? ` (user attached ${AI.atts.length} photo${AI.atts.length>1?'s':''})` : '';
  let reply;
  try{
    if(S.ai.provider!=='builtin' && !S.ai.keys[S.ai.provider] && S.ai.provider!=='ollama'){
      reply = `⚠️ No API key set for ${S.ai.provider}. Add it in 🛡️ Privacy (Profile → Privacy & Keys). Meanwhile — built-in answer:\n\n` + builtinChefReply(txt, AI.ctx?{recipe:S.recipes.find(r=>r.id===AI.ctx.id)}:null);
    } else {
      reply = await aiChat(txt + attNote, AI.ctx?{recipe:S.recipes.find(r=>r.id===AI.ctx.id)}:null);
    }
  }catch(e){
    reply = `⚠️ ${e.message} — check the key in Privacy, or fall back to the built-in chef.\n\n` + builtinChefReply(txt, AI.ctx?{recipe:S.recipes.find(r=>r.id===AI.ctx.id)}:null);
  }
  AI.busy=false;
  AI.msgs.push({role:'ai', text:reply});
  renderAI();
}
function aiAttach(){
  const inp=document.createElement('input'); inp.type='file'; inp.accept='image/*'; inp.multiple=true;
  inp.onchange = async ev=>{
    for(const f of ev.target.files){ AI.atts.push({name:f.name, url:await fileToDataURL(f)}); }
    renderAI();
    toast('📎','Attached','The AI sees ' + AI.atts.length + ' image(s) with your next message.');
  };
  inp.click();
}
function cycleTone(){
  const i = TONE_PRESETS.findIndex(t=>t.id===S.ai.tone);
  S.ai.tone = TONE_PRESETS[(i+1)%TONE_PRESETS.length].id; save();
  renderAI();
  const t=TONE_PRESETS.find(x=>x.id===S.ai.tone);
  toast(t.emoji,'Tone: '+t.name,t.desc,2400,'#ffb86b');
}
function openAIConfig(){
  const w=$('#sheet-aiconfig');
  w.querySelector('.sheet').innerHTML = `
  <div class="sheet-grab"><i></i></div>
  <div class="sheet-head"><div class="sh-txt"><h2>AI Chef Settings</h2><div class="sh-sub">Provider · model · personality</div></div><button class="close-x" data-close="sheet-aiconfig">✕</button></div>
  <div class="sheet-body">
    <div class="sec-h" style="margin:2px 0 6px"><h2 style="font-size:14px">Provider</h2></div>
    <div class="pills">${AI_PROVIDERS.map(p=>`<button class="pill ${S.ai.provider===p.id?'active':''}" onclick="pickProvider('${p.id}')">${p.name}</button>`).join('')}</div>
    <div id="provider-detail">${providerDetailHTML()}</div>
    <div class="sec-h"><h2 style="font-size:14px">Emotion tone</h2></div>
    <div class="pills">${TONE_PRESETS.map(t=>`<button class="pill ${S.ai.tone===t.id?'active':''}" onclick="S.ai.tone='${t.id}';save();openAIConfig()">${t.emoji} ${t.name}</button>`).join('')}</div>
    <div class="card" style="font-size:12px;color:var(--muted);line-height:1.6">${(TONE_PRESETS.find(t=>t.id===S.ai.tone)||{}).desc||''} — the tone applies everywhere the chef speaks: chat, Voice Chef, and live camera guidance.</div>
  </div>`;
  bindSheetVeil('sheet-aiconfig');
  w.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>closeSheet(b.dataset.close)));
  openSheet('sheet-aiconfig');
}
function providerDetailHTML(){
  const p = AI_PROVIDERS.find(x=>x.id===S.ai.provider)||AI_PROVIDERS[0];
  if(p.id==='builtin') return `<div class="card" style="font-size:12.5px;color:var(--muted);line-height:1.65">🧑‍🍳 <b>Built-in Chef AI</b> — always on, no key, offline-friendly. Covers ingredients, substitutions, scaling, nutrition and coaching for every recipe in your feed.</div>`;
  if(p.id==='ollama'){
    return `<div class="card" style="font-size:12.5px;color:var(--muted);line-height:1.65">
      <b>Ollama (local models)</b> — runs on your machine at <span class="kbd">localhost:11434</span>. Free and private, but needs a machine with some RAM.<br><br>
      Pick a model you've pulled, or type one: <span class="kbd">ollama pull llama3.2</span>.<br>
      No models yet? Advantages of local: no cost, privacy, works offline. Disadvantages: slower on small machines, weaker recipe reasoning — you can switch provider anytime to a cloud option.
      <div class="modelpick">${p.models.map(m=>`<button class="mp ${S.ai.model===m.id?'active':''}" onclick="pickModel('${m.id}')">${m.name}</button>`).join('')}</div>
      ${S.ai.model==='custom'?`<div class="field"><label>Model name</label><input id="ollama-custom" value="${esc(S.ai.keys.ollamaModel||'')}" placeholder="mistral-nemo"></div>`:''}
    </div>`;
  }
  if(p.id==='openrouter'){
    return `<div class="card" style="font-size:12.5px;color:var(--muted);line-height:1.65">
      <b>OpenRouter free models</b> — this provider is locked to <b>:free</b> models only so you never get billed.<br>
      <div class="field" style="margin-top:8px"><label>API key</label><input id="prov-key" value="${esc(S.ai.keys.openrouter||'')}" placeholder="sk-or-v1-…" oninput="S.ai.keys.openrouter=this.value;save()"><div class="hint">Paste a specific favourite instead? Ask for it in chat and I\'ll try it if it\'s free.</div></div>
      <div class="modelpick">${p.models.map(m=>`<button class="mp ${S.ai.model===m.id?'active':''}" onclick="pickModel('${m.id}')">${m.name}</button>`).join('')}</div>
    </div>`;
  }
  return `<div class="card" style="font-size:12.5px;color:var(--muted);line-height:1.65">
    <b>${p.name}</b>${p.id==='openai'?' — the system auto-selects the best current models; these are the safest picks.':''}${p.id==='gemini'?' — also powers the 📷 AI Live camera guide when a key is present.':''}
    <div class="field" style="margin-top:8px"><label>API key</label><input id="prov-key" value="${esc(S.ai.keys[p.id]||'')}" placeholder="${p.keyHint}" oninput="S.ai.keys['${p.id}']=this.value;save()"></div>
    <div class="modelpick">${p.models.map(m=>`<button class="mp ${S.ai.model===m.id?'active':''}" onclick="pickModel('${m.id}')">${m.name}</button>`).join('')}</div>
  </div>`;
}
function pickProvider(id){
  S.ai.provider=id;
  const p=AI_PROVIDERS.find(x=>x.id===id);
  S.ai.model = p.models[0].id;
  save(); openAIConfig();
}
function pickModel(m){ S.ai.model=m; save(); openAIConfig(); }

// =============== AI SEARCH (thumbnail narrowing) ===============
let AS = {q:'', scoring:false, scores:{}, urlResult:null};
function openAISearch(){
  AS={q:'', scoring:false, scores:{}, urlResult:null};
  renderAISearch();
  openSheet('sheet-aisearch');
}
function renderAISearch(){
  const w=$('#sheet-aisearch');
  const recs=S.recipes.filter(r=>!r.live);
  w.querySelector('.sheet').innerHTML = `
  <div class="sheet-grab"><i></i></div>
  <div class="sheet-head"><div class="sh-txt"><h2>✨ AI Chef Search</h2><div class="sh-sub">Describe a craving, or paste any recipe/YouTube URL</div></div><button class="close-x" data-close="sheet-aisearch">✕</button></div>
  <div class="sheet-body">
    <div class="searchbar" style="margin:0 0 12px">💬<input id="as-q" placeholder="e.g. something creamy, under 30 min, no cream…" value="${esc(AS.q)}" onkeydown="if(event.key==='Enter')aiSearchGo()"><button class="btn sm" onclick="aiSearchGo()">Go</button></div>
    ${AS.urlResult?`
      <div class="card" style="border-color:rgba(110,195,255,.4)">
        <div style="font-size:11px;font-weight:800;color:var(--blue);letter-spacing:1px">🔗 EXTRACTED FROM URL</div>
        <div style="font-size:16px;font-weight:800;margin:5px 0 2px">${esc(AS.urlResult.title)}</div>
        <div style="font-size:11.5px;color:var(--muted)">${AS.urlResult.cuisine} · ${AS.urlResult.time} min · ${AS.urlResult.difficulty} · serves ${AS.urlResult.servings}</div>
        <div style="font-size:12px;color:var(--muted);margin-top:7px;line-height:1.5">${esc(AS.urlResult.desc)}</div>
        <div style="font-size:11.5px;color:var(--muted);margin-top:7px">🥕 ${AS.urlResult.ingredients.length} ingredients · 📝 ${AS.urlResult.steps.length} steps</div>
        <div class="btnrow" style="margin-top:11px">
          <button class="btn sm green" onclick="saveURLRecipe()">💾 Save &amp; Enhance</button>
          <button class="btn sm ghost" onclick="openRecipe(JSON.parse(JSON.stringify(AS.urlResult)).id||'')">👁️ View</button>
        </div>
      </div>`:''}
    <div id="as-hint" style="font-size:11.5px;color:var(--faint);margin:4px 2px 10px">${AS.q?'AI is scoring every thumbnail…':'All recipes shown — type a craving and watch non-matches fade away bit by bit.'}</div>
    <div class="rec-grid" id="as-grid">
      ${recs.map(r=>`<div class="rec-card" id="as-${r.id}" style="transition:all .6s cubic-bezier(.22,.9,.3,1)" onclick="openRecipe('${r.id}')">
        <img src="${r.image}" alt="${esc(r.title)}">
        <div class="rc-ov"><div class="rc-t">${esc(r.title)}</div><div class="rc-m"><span>${r.time}m</span><span>${r.cuisine}</span>${AS.scores[r.id]!==undefined&&AS.scores[r.id]>70?'<span>✨</span>':''}</div></div>
      </div>`).join('')}
    </div>
    <div class="divider"></div>
    <div style="font-size:12px;color:var(--muted);line-height:1.6;padding-bottom:6px">Paste a link (YouTube, blog, anything) in the search box and the AI extracts the whole recipe — title, ingredients, steps, nutrition — ready to save.</div>
    <div class="pills">${PRESET_PROMPTS.filter(p=>p.emoji!==' substitutions').slice(0,4).map(p=>`<button class="pill" onclick="AS.q='${p.label.replace(/'/g,"\\'")}';renderAISearch();aiSearchGo()">${p.emoji+' '+p.label}</button>`).join('')}</div>
  </div>`;
  bindSheetVeil('sheet-aisearch');
  w.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>closeSheet(b.dataset.close)));
}
async function aiSearchGo(){
  const q = $('#as-q').value.trim(); if(!q) return;
  AS.q=q;
  if(/^https?:\/\//i.test(q)){
    toast('🔗','Fetching link…','Reading the page for recipe data.',1800,'#6ec3ff');
    const rec = await extractRecipeFromURL(q);
    AS.urlResult = rec; renderAISearch();
    toast('✨','Recipe extracted','“'+rec.title+'” — tap Save & Enhance to keep it.');
    return;
  }
  // bit-by-bit narrowing
  const recs=S.recipes.filter(r=>!r.live);
  renderAISearch();
  for(let i=0;i<recs.length;i++){
    const r=recs[i];
    await new Promise(res=>setTimeout(res,260));
    const text=(r.title+' '+r.desc+' '+r.cuisine+' '+r.hashtags.join(' ')+' '+r.ingredients.map(x=>x.name).join(' ')+' '+r.steps.join(' ')).toLowerCase();
    const terms=q.toLowerCase().split(/[\s,]+/).filter(t=>t.length>2 && !['the','and','for','with','something','under','without','no'].includes(t));
    let score=0;
    terms.forEach(t=>{ if(text.includes(t)) score+=22; });
    if(/quick|fast|20|15|10/.test(q.toLowerCase()) && r.time<=30) score+=30;
    if(/creamy/.test(q.toLowerCase()) && /cream|cheese|butter/.test(text)) score+=25;
    score = Math.min(97, score + (i*7)%23);
    AS.scores[r.id]=score;
    const el=document.getElementById('as-'+r.id);
    if(el){
      el.style.opacity = score>45? 1 : .18;
      el.style.transform = score>45? 'scale(1)' : 'scale(.88)';
      el.style.filter = score>45? 'saturate(1.15)' : 'grayscale(1)';
      if(score>45 && !el.querySelector('.rc-t').textContent.includes('✨')){
        el.querySelector('.rc-m').insertAdjacentHTML('beforeend','<span>✨ '+score+'%</span>');
      }
    }
  }
  toast('✨','AI narrowed your feed',Object.values(AS.scores).filter(s=>s>45).length+' strong matches lit up.');
}
async function saveURLRecipe(){
  if(!AS.urlResult) return;
  toast('🎨','Enhancing thumbnail…','AI is generating a cover shot.',1600,'#6ec3ff');
  await new Promise(r=>setTimeout(r,1200));
  const rec = AS.urlResult;
  rec.creator = 'Extracted · via '+(S.user.name);
  rec.creatorHandle = S.user.handle;
  rec.scynCurated=true;
  S.recipes.unshift(rec); save();
  AS.urlResult=null;
  renderAISearch(); renderFeed();
  pushNoti({ico:'🔗',title:'Recipe saved from link',msg:`${rec.title} extracted, thumbnail AI-enhanced, posted to your profile.`,group:'today'});
  toast('⭐','Saved & posted','“'+rec.title+'” is in your Cookbook with an AI-enhanced cover.');
}

// =============== VOICE CHEF ===============
let VC = {rid:null, step:0, playing:false, timer:null, listening:false, recog:null};
function startVoiceChef(rid){
  VC.rid=rid; VC.step=0; VC.playing=false;
  renderVC();
  $('#voicewrap').classList.add('open');
  if(window.speechSynthesis) speechSynthesis.cancel();
}
function endVoiceChef(){
  if(window.speechSynthesis) speechSynthesis.cancel();
  if(VC.recog){ try{VC.recog.abort();}catch(e){} }
  clearInterval(VC.timer);
  VC.playing=false; VC.listening=false;
  $('#voicewrap').classList.remove('open');
  const r=S.recipes.find(x=>x.id===VC.rid);
  if(r && VC.step>0){ pushNoti({ico:'🍳',title:'Cooking session ended',msg:`You stopped at step ${Math.min(VC.step+1,r.steps.length)} of ${r.title}.`,group:'today'}); toast('🍳','Session saved','Resume anytime from the same step.'); }
}
function renderVC(){
  const r=S.recipes.find(x=>x.id===VC.rid); if(!r) return;
  const p = Math.round((VC.step)/r.steps.length*100);
  $('#vc-ring').style.setProperty('--p',p);
  $('#vc-ring span').textContent = ['🍳','🔥','🥘','🧂','✨'][VC.step%5];
  $('#vc-title').textContent = r.title;
  $('#vc-step').innerHTML = `Step ${VC.step+1} / ${r.steps.length}`;
  $('#vc-ins').textContent = r.steps[VC.step];
  $('#vc-fb').textContent = VC.step===0? 'Tap ▶ to begin — I\'ll read each step aloud and wait for you.' : 'Say or tap: next · repeat · back · what does it mean?';
}
function vcSpeak(txt){
  if(!window.speechSynthesis) { toast('🔇','No voice on this device','Text guidance still works.'); return; }
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(txt);
  u.rate=.95; u.pitch=1.02;
  const tone=S.ai.tone||'warm';
  if(tone==='gordon'){u.rate=1.18;u.pitch=.82;}
  if(tone==='sensei'){u.rate=.82;u.pitch=.9;}
  if(tone==='hype'){u.rate=1.28;u.pitch=1.24;}
  if(tone==='grandma'){u.rate=.88;u.pitch=1.12;}
  speechSynthesis.speak(u);
}
function vcPlayPause(){
  const r=S.recipes.find(x=>x.id===VC.rid); if(!r) return;
  if(VC.playing){ VC.playing=false; if(window.speechSynthesis)speechSynthesis.cancel(); clearInterval(VC.timer); $('#vc-play').textContent='▶'; renderVC(); return; }
  VC.playing=true; $('#vc-play').textContent='⏸';
  const tone=GREET_TONE();
  vcSpeak(tone + ' Step '+(VC.step+1)+'. '+r.steps[VC.step]);
  renderVC();
}
function GREET_TONE(){
  const t=S.ai.tone||'warm';
  return {warm:'Right, chef.', gordon:'Let\'s GO. Focus.', sensei:'Observe. Begin.', hype:'Here we GO! ', grandma:'Follow me, darling.'}[t]||'';
}
function vcNext(){
  const r=S.recipes.find(x=>x.id===VC.rid); if(!r) return;
  if(VC.step>=r.steps.length-1){
    vcSpeak(GREET_TONE()+' That\'s the final step — plate it and take a photo. You cooked it!');
    $('#vc-ins').textContent='🎉 Done — plated! Tap end to save the session.';
    $('#vc-fb').textContent='Chef congratulates you — session complete.';
    clearInterval(VC.timer);
    return;
  }
  VC.step++; renderVC();
  if(VC.playing) vcSpeak(GREET_TONE()+' Step '+(VC.step+1)+'. '+r.steps[VC.step]);
}
function vcRepeat(){ const r=S.recipes.find(x=>x.id===VC.rid); if(r){ vcSpeak(GREET_TONE()+' Step '+(VC.step+1)+'. '+r.steps[VC.step]); } }
function vcBack(){ if(VC.step>0){ VC.step--; renderVC(); if(VC.playing){const r=S.recipes.find(x=>x.id===VC.rid); vcSpeak(r.steps[VC.step]);} } }
function vcDefine(){
  const r=S.recipes.find(x=>x.id===VC.rid); if(!r) return;
  const s=r.steps[VC.step];
  const term = (s.match(/\b(saut[eé]|simmer|sear|braise|fold|whisk|emulsion|char|deglaze|marinate|flamb[eé]|reduce)\b/i)||[])[0];
  const defs={
    sauté:'Sauté = cook fast in hot fat, keep it moving.',
    simmer:'Simmer = gentle bubbles, just below a boil.',
    sear:'Sear = hard, dry heat to brown the surface fast.',
    braise:'Braise = sear first, then slow-cook in liquid.',
    fold:'Fold = combine gently with a spatula, top to bottom.',
    whisk:'Whisk = beat fast with a whisk to emulsify or aerate.',
    emulsion:'Emulsion = fat + water held together, like your carbonara sauce.',
    char:'Char = let it blacken slightly in spots for smoky flavour.',
    deglaze:'Deglaze = add liquid and scrape the brown bits into a sauce.',
    marinate:'Marinate = soak in seasoned liquid to tenderise and flavour.',
    flambé:'Flambé = burn off alcohol for flavour (careful!).',
    reduce:'Reduce = boil off water to concentrate the sauce.'
  };
  const ans = term? defs[term.toLowerCase()] : 'Ask me about any word in the step — e.g. “what does sauté mean?”';
  $('#vc-fb').textContent = ans;
  vcSpeak(ans);
}
function vcListen(){
  if(!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)){ toast('🔇','Voice input unsupported','This browser can\'t do mic capture — use the buttons instead.'); return; }
  const SR = window.SpeechRecognition||window.webkitSpeechRecognition;
  if(VC.recog){ try{VC.recog.abort();}catch(e){} }
  const rec = new SR(); rec.lang='en-US'; rec.continuous=false; rec.interimResults=false;
  VC.recog=rec;
  $('#vc-ring').classList.add('listening');
  rec.onresult = e=>{
    const said = e.results[0][0].transcript.toLowerCase();
    $('#vc-fb').textContent = '🗣️ “'+said+'”';
    if(/next|done|continue|finished/.test(said)) vcNext();
    else if(/repeat|again|say that/.test(said)) vcRepeat();
    else if(/back|previous/.test(said)) vcBack();
    else if(/mean|what is|what's|define|explain/.test(said)) vcDefine();
    else if(/stop|cancel|quit|end/.test(said)) endVoiceChef();
    else { vcSpeak('I heard: '+said+'. Say next, repeat, back, or ask what a word means.'); }
  };
  rec.onend = ()=> $('#vc-ring')?.classList.remove('listening');
  rec.onerror = ()=> { $('#vc-ring')?.classList.remove('listening'); };
  rec.start();
}

// =============== AI LIVE CAMERA GUIDE ===============
let CAM = {rid:null, step:0, conf:0, stream:null, timer:null, uncertain:0, img:null};
async function startCameraGuide(rid){
  CAM.rid=rid; CAM.step=0; CAM.conf=0; CAM.uncertain=0;
  $('#camwrap').classList.add('open');
  $('#cam-fb').textContent='Requesting camera…';
  try{
    CAM.stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});
    $('#cam-video').srcObject = CAM.stream;
    $('#cam-fb').textContent='Camera on. Point it at your prep area.';
    camRenderStep();
    CAM.timer = setInterval(camAnalyze, 2500);
  }catch(e){
    $('#cam-fb').textContent='⚠️ Camera blocked or unavailable — you can still follow the steps manually below.';
    camRenderStep();
  }
}
function camRenderStep(){
  const r=S.recipes.find(x=>x.id===CAM.rid); if(!r) return;
  $('#cam-step').textContent = 'Step '+(CAM.step+1)+' of '+r.steps.length;
  $('#cam-ins').textContent = r.steps[CAM.step];
  $('#cam-prog i').style.width = (CAM.step/r.steps.length*100)+'%';
  $('#cam-conf').textContent = CAM.conf+'/2 confirmations';
}
async function camAnalyze(){
  const r=S.recipes.find(x=>x.id===CAM.rid); if(!r) return;
  const v=$('#cam-video');
  if(!v || !v.videoWidth){ // no frames — count as uncertain
    CAM.uncertain+=2.5;
  } else {
    // fake vision progress: brightness/motion heuristic on real frames
    try{
      const c=document.createElement('canvas'); c.width=64; c.height=36;
      c.getContext('2d').drawImage(v,0,0,64,36);
      const d=c.getContext('2d').getImageData(0,0,64,36).data;
      let lum=0; for(let i=0;i<d.length;i+=4){ lum+=d[i]*.299+d[i+1]*.587+d[i+2]*.114; }
      lum/=(d.length/4);
      const active = lum>28; // something visible in frame
      if(active){ CAM.conf++; CAM.uncertain=0; } else { CAM.uncertain+=2.5; }
    }catch(e){ CAM.uncertain+=2.5; }
  }
  $('#cam-fb').textContent = CAM.uncertain>10 ? 'I can\'t see the cooking area — point the camera at your work.' :
    CAM.conf>=2 ? '✅ Confirmed — advancing to the next step.' :
    CAM.conf===1 ? 'Looking good — hold steady, one more confirmation…' : 'Watching… show me the pan.';
  $('#cam-conf').textContent = Math.min(CAM.conf,2)+'/2 confirmations';
  // skip option after 30s uncertainty
  $('#cam-skip').style.display = CAM.uncertain>=30? 'inline-flex':'none';
  if(CAM.conf>=2){
    if(CAM.step < r.steps.length-1){ CAM.step++; CAM.conf=0; camRenderStep(); if(window.speechSynthesis) vcSpeak('Step '+(CAM.step+1)+'. '+r.steps[CAM.step]); }
    else { clearInterval(CAM.timer); $('#cam-ins').textContent='🎉 All steps confirmed — beautifully done!'; $('#cam-fb').textContent='Session complete. Chef is proud.'; $('#cam-prog i').style.width='100%'; if(window.speechSynthesis) vcSpeak('Every step confirmed. Plate it up — you earned it.'); }
  }
}
function camSkip(){ const r=S.recipes.find(x=>x.id===CAM.rid); if(r&&CAM.step<r.steps.length-1){ CAM.step++; CAM.conf=0; CAM.uncertain=0; camRenderStep(); } else endCameraGuide(); }
function camNarrate(el){ if(window.speechSynthesis){ const r=S.recipes.find(x=>x.id===CAM.rid); if(r) vcSpeak(r.steps[CAM.step]); } toast('🔊','Narrating','Reading the current step aloud.'); }
function endCameraGuide(){
  if(CAM.stream){ CAM.stream.getTracks().forEach(t=>t.stop()); }
  clearInterval(CAM.timer);
  $('#camwrap').classList.remove('open');
}

// =============== ONBOARDING ===============
let OB = {step:0, picks:{}};
function startOnboarding(){
  OB={step:0, picks:{cuisines:S.taste.cuisines, difficulty:S.taste.difficulty, diet:S.taste.diet||[], provider:S.ai.provider, apikey:'', model:S.ai.model, sync:null}};
  renderOB();
  $('#onboard').classList.add('open');
}
function obSteps(){ return ['welcome','taste','diet','difficulty','ai','done']; }
function renderOB(){
  const steps=obSteps(); const key=steps[OB.step];
  $('#ob-bar').style.width = ((OB.step+1)/steps.length*100)+'%';
  const P = OB.picks;
  $('#ob-body').innerHTML = `
  <div class="ob-step active">
    ${key==='welcome'?`
      <div class="ob-logo">🍳</div>
      <div class="ob-title">Welcome to <em>ForkFeed</em></div>
      <div class="ob-desc">TikTok for your kitchen. Swipe a vertical feed of real recipes, cook along with an AI chef that talks and listens, scale servings in one tap, and get a grocery list that shops itself in your country.</div>
      <div class="ob-desc" style="margin:0 0 6px;font-size:12.5px">We'll set up your taste in 30 seconds.</div>`:''}
    ${key==='taste'?`
      <div class="ob-title">What do you <em>crave?</em></div>
      <div class="ob-desc">Pick the cuisines you want to dominate your feed. Tap multiple.</div>
      <div class="optlist">${CUISINES.slice(1).map(c=>`<button class="opt ${P.cuisines.includes(c)?'sel':''}" onclick="obToggle('cuisines','${c}')"><span class="o-ico">${({Mexican:'🌮',Italian:'🍝',Indian:'🍛',American:'🍔',Japanese:'🍣',Nigerian:'🍚',French:'🥐'})[c]||'🍽️'}</span><span class="o-tt">${c}</span></button>`).join('')}</div>`:''}
    ${key==='diet'?`
      <div class="ob-title">Any <em>rules?</em></div>
      <div class="ob-desc">I'll auto-suggest substitutions on every ingredient list — gluten-free, dairy-free, vegan, keto, or nothing.</div>
      <div class="optlist">${DIET_PILLS.map(d=>`<button class="opt ${P.diet.includes(d.key)?'sel':''}" onclick="obToggle('diet','${d.key}')"><span class="o-ico">${d.label.split(' ')[0]}</span><span class="o-tt">${d.label.replace(/^\S+\s/,'')}</span></button>`).join('')}
      <button class="opt ${P.diet.length===0?'sel':''}" onclick="OB.picks.diet=[];renderOB()"><span class="o-ico">🚫</span><span class="o-tt">No restrictions</span></button></div>`:''}
    ${key==='difficulty'?`
      <div class="ob-title">How <em>brave</em> are you feeling?</div>
      <div class="ob-desc">I'll weight the feed's difficulty accordingly.</div>
      <div class="optlist">${['Any','Easy','Medium','Hard'].map(d=>`<button class="opt ${P.difficulty===d?'sel':''}" onclick="OB.picks.difficulty='${d}';renderOB()"><span class="o-ico">${({Any:'🎲',Easy:'😊',Medium:'🧑‍🍳',Hard:'🔥'})[d]}</span><span class="o-tt">${d}</span></button>`).join('')}</div>`:''}
    ${key==='ai'?`
      <div class="ob-title">Power your <em>AI Chef</em></div>
      <div class="ob-desc">Choose a provider and paste its key now — or skip and use the built-in chef. You can change it anytime in 🛡️ Privacy. YouTube key optional, powers the ▶️ YouTube feed side.</div>
      <div class="optlist">${AI_PROVIDERS.map(p=>`<button class="opt ${P.provider===p.id?'sel':''}" onclick="OB.picks.provider='${p.id}';OB.picks.model='${p.models[0].id}';renderOB();setTimeout(()=>{const k=$('#ob-key');if(k)k.placeholder='${p.keyHint||'no key needed'}'},30)"><span class="o-ico">${({builtin:'🧑‍🍳',openai:'🟢','openrouter':'🆓',ollama:'🦙',gemini:'✦'})[p.id]||'🔌'}</span><span><span class="o-tt">${p.name}</span><span class="o-sub">${p.models[0].name}${p.needsKey?' · needs key':''}</span></span></button>`).join('')}</div>
      ${(()=>{const p=AI_PROVIDERS.find(x=>x.id===P.provider); return p? (p.needsKey?`<div class="field" style="margin-top:12px"><label>${p.name} API key</label><input id="ob-key" value="${esc(OB.picks.apikey)}" placeholder="${p.keyHint}" oninput="OB.picks.apikey=this.value"><div class="hint">Keys are stored only on your device (localStorage). Never sent to ForkFeed servers.</div></div>`:'') :'';})()}
      <div class="field" style="margin-top:12px"><label>YouTube Data key (optional)</label><input id="ob-ytkey" value="${esc(OB.picks.ytkey||'')}" placeholder="AIza…" oninput="OB.picks.ytkey=this.value"><div class="hint">Powers real YouTube search in the ▶️ feed. Get one free at console.cloud.google.com.</div></div>
      <div class="card" style="font-size:11.5px;color:var(--muted);line-height:1.6">⚠️ YouTube API consequences, explained honestly: your key's quota (10k units/day) is shared across this app's searches; API calls are billed/limited by Google; keys pasted here stay client-side and are visible to anyone using your browser profile — so use a restricted, browser-lock key.</div>
      <div class="optlist" style="margin-top:10px">
        <button class="opt ${P.sync==='sync'?'sel':''}" onclick="OB.picks.sync='sync'"><span class="o-ico">🔗</span><span><span class="o-tt">Sync my YouTube channel</span><span class="o-sub">Your uploads appear in your feed (OAuth on first use)</span></span></button>
        <button class="opt ${P.sync==='fresh'?'sel':''}" onclick="OB.picks.sync='fresh'"><span class="o-ico">🌱</span><span><span class="o-tt">Start fresh</span><span class="o-sub">The API key is used only to show YouTube videos in search</span></span></button>
      </div>`:''}
    ${key==='done'?`
      <div class="ob-logo" style="font-size:52px">🚀</div>
      <div class="ob-title">You're set, <em>chef.</em></div>
      <div class="ob-desc">Your feed is tailored to ${P.cuisines.length?P.cuisines.slice(0,3).join(', '):'everything'}${P.difficulty!=='Any'? ' · '+P.difficulty+' difficulty':''}${P.diet.length? ' · '+P.diet.join('/')+' swaps':''}. The AI Chef is standing by — tap any ✨ button. One more thing: a quick tour?</div>
      <button class="btn block amber" onclick="finishOnboarding(true)">🎬 Take the 60-second tour</button>
      <button class="btn ghost block" style="margin-top:10px" onclick="finishOnboarding(false)">Skip — just let me cook</button>`:''}
  </div>`;
  $('#ob-back').style.visibility = OB.step>0?'visible':'hidden';
  $('#ob-next').textContent = key==='ai'? 'Finish' : 'Next';
}
function obToggle(list, v){
  const arr = OB.picks[list];
  const i = arr.indexOf(v);
  if(i>=0) arr.splice(i,1); else if(list==='cuisines'||list==='diet') arr.push(v);
  renderOB();
}
function obNext(){
  const steps=obSteps();
  if(OB.step<steps.length-1){ OB.step++; renderOB(); }
  else finishOnboarding(false);
}
function obBack(){ if(OB.step>0){ OB.step--; renderOB(); } }
function finishOnboarding(withTour){
  const P=OB.picks;
  S.taste.cuisines=P.cuisines; S.taste.difficulty=P.difficulty; S.taste.diet=P.diet;
  S.ai.provider=P.provider; S.ai.model=P.model;
  if(P.apikey) S.ai.keys[P.provider]=P.apikey;
  if(P.ytkey) S.ai.keys.youtube=P.ytkey;
  S.onboarded=true; save();
  $('#onboard').classList.remove('open');
  renderFeed();
  if(withTour) setTimeout(startTutorial, 420); 
  else toast('🍳','Welcome to ForkFeed','Swipe up to start the feed. Tap any ✨ for the AI Chef.');
}

// =============== TUTORIAL ===============
const TUT_STEPS = [
  {t:'Your For You feed', d:'Swipe up to move between full-screen recipe cards, just like your favourite video app. Double-tap anything to like it — try it, it bursts.', target:'#feed', pos:'center'},
  {t:'Recipes ⇄ YouTube', d:'Top tabs flip the same vertical feed between curated recipe cards and embedded YouTube cooking videos. Your choice is remembered next launch.', target:'.fd-tabs', pos:'top'},
  {t:'The action rail', d:'Every card packs save-to-cookbook 🔖, full recipe 📋, AI chat ✨ about that dish, one-tap PDF 📄, and share 📤 which builds a social image card.', target:'.rail', pos:'right'},
  {t:'Full recipe sheet', d:'Tap a card for ingredients with check-off, numbered steps, a nutrition tab with a health score, and a video tab. Serving +/− rescales every quantity live.', target:'.tabbar', pos:'bottom'},
  {t:'Diet substitutions', d:'In the recipe sheet, tap 🌾 Gluten-Free, 🥛 Dairy-Free, 🌿 Vegan or 🥩 Keto — ingredients with a swap show an inline green suggestion.', target:'.tabbar', pos:'bottom'},
  {t:'Shop in your country', d:'“Shop these ingredients” opens 16 grocery platforms across 🇺🇸🇬🇧🇦🇺🇰🇪🇳🇬🇮🇳… — your scaled list is copied to the clipboard for instant paste.', target:'.tabbar', pos:'bottom'},
  {t:'Voice Chef', d:'The big gradient button starts a hands-free session: steps read aloud, mic on — say “next”, “repeat”, or “what does sauté mean?” and it obeys.', target:'.tabbar', pos:'bottom'},
  {t:'AI Chef chat', d:'The ✨ AI button anywhere opens a Gemini-style overlay. Pick a provider (OpenAI, free OpenRouter models, local Ollama, Gemini) and an emotion tone from Warm Chef to Grandma.', target:'.tabbar', pos:'bottom'},
  {t:'Discover', d:'Search by keyword or hashtag, filter 8 cuisines, and flip Trending / New / Top Saved tabs. Empty search? The AI recommends a match itself.', target:'#tabbar .tabbtn[data-tab="discover"]', pos:'bottom'},
  {t:'Meal Planner', d:'Drag a saved recipe onto any day slot — or tap the slot. Breakfast, lunch and dinner for a whole week, with the merged grocery list auto-summed and exportable as PDF.', target:'#tabbar .tabbtn[data-tab="planner"]', pos:'bottom'},
  {t:'Create & post', d:'＋ in Cookbook posts your own recipe — typed, scanned from a photo, or extracted from a document. The AI enhances the thumbnail and Scyn AI curates it onto For You with your signature.', target:'#tabbar .tabbtn[data-tab="cookbook"]', pos:'bottom'},
  {t:'Privacy & keys', d:'Profile 🛡️ holds every API key (show/hide, clear, replace), notification toggles, and the big red Reset — wipes the whole app back to day zero.', target:'#tabbar .tabbtn[data-tab="profile"]', pos:'bottom'}
];
let TUT={i:0};
function startTutorial(){ TUT.i=0; renderTut(); $('#tutorial').classList.add('open'); }
function renderTut(){
  const st = TUT_STEPS[TUT.i];
  $('#tut-dots').innerHTML = TUT_STEPS.map((_,i)=>`<i class="${i===TUT.i?'on':''}"></i>`).join('');
  $('#tut-title').textContent = st.t;
  $('#tut-desc').innerHTML = st.d + (TUT.i<TUT_STEPS.length-1?'':'<br><br>That\'s everything — enjoy the feed, chef. 🍳');
  $('#tut-next').textContent = TUT.i>=TUT_STEPS.length-1? 'Done ✓' : 'Next';
  // spotlight
  const el = document.querySelector(st.target);
  const spot=$('#tut-spot'); const card=$('#tut-card');
  if(el){
    const r = el.getBoundingClientRect();
    const pad=10;
    spot.style.cssText = `position:absolute;border-radius:18px;box-shadow:0 0 0 3000px rgba(0,0,0,.72);transition:all .45s cubic-bezier(.22,.9,.3,1);pointer-events:none;left:${r.left-pad}px;top:${r.top-pad}px;width:${r.width+pad*2}px;height:${r.height+pad*2}px;`;
    const isBottom = r.top > window.innerHeight*0.55;
    card.style.top = isBottom? 'auto':'';
    card.style.bottom = isBottom? (window.innerHeight - r.top + 22)+'px':'';
    if(!isBottom) card.style.top = Math.min(r.bottom+22, window.innerHeight-190)+'px';
    if(st.pos==='center'){ card.style.top='50%'; card.style.bottom='auto'; card.style.transform='translateY(-50%)'; }
  }
  S.tutDone=true; save();
}
function tutNext(){ if(TUT.i<TUT_STEPS.length-1){ TUT.i++; renderTut(); } else endTutorial(); }
function tutPrev(){ if(TUT.i>0){ TUT.i--; renderTut(); } }
function endTutorial(){ $('#tutorial').classList.remove('open'); toast('🎓','Tour complete','Reopen it anytime: Profile → Tutorial.'); }

// =============== PRIVACY / KEYS ===============
function openPrivacy(){
  const w=$('#sheet-privacy');
  w.querySelector('.sheet').innerHTML = `
  <div class="sheet-grab"><i></i></div>
  <div class="sheet-head"><div class="sh-txt"><h2>🛡️ Privacy &amp; API Keys</h2><div class="sh-sub">${SYNC.online?'Server-managed keys + this device only':'All keys stay on this device only'}</div></div><button class="close-x" data-close="sheet-privacy">✕</button></div>
  <div class="sheet-body">
    ${SYNC.online?`
    <div class="card" style="font-size:12px;color:var(--muted);line-height:1.6;border-color:rgba(90,212,138,.3)">
      <b style="color:var(--green)">Connected to the ForkFeed server.</b> AI chat, YouTube search and link extraction run through the server with keys the admin configured — nothing private leaves your browser. ${(SYNC.serverKeysHint().length)?('Server keys present: '+SYNC.serverKeysHint().join(', ')+'.'):('No server keys yet — the built-in chef answers everything meanwhile.')}
      <div style="margin-top:6px;font-size:11px;color:var(--faint)">Admin sets server keys: <span class="kbd">curl -X POST /admin/keys -H "Authorization: Bearer &lt;admin&gt;" -d '{"openai":"sk-…"}'</span></div>
    </div>
    <div class="divider"></div>
    <div style="font-size:11.5px;font-weight:800;color:var(--faint);text-transform:uppercase;letter-spacing:1px;margin:2px 0 8px">This-device keys (used in guest/offline mode)</div>`:`
    <div class="card" style="font-size:12px;color:var(--muted);line-height:1.6">Keys live in your browser's localStorage — never sent to any ForkFeed server. Show, hide, clear, replace, or wipe everything below.</div>`}
    ${[['youtube','▶️ YouTube Data v3','AIza…','Powers the YouTube feed + search'],['openai','🟢 OpenAI','sk-…','AI chat'],['openrouter','🆓 OpenRouter','sk-or-v1-…','Free-model AI chat'],['gemini','✦ Gemini','AIza…','AI chat + live camera vision'],['ollamaModel','🦙 Ollama model name','llama3.2','Local model name at localhost:11434']].map(([k,name,ph,desc])=>`
      <div class="field"><label>${name}</label>
      <div style="display:flex;gap:8px"><input id="pk-${k}" type="password" value="${esc(S.ai.keys[k]||'')}" placeholder="${ph}" oninput="S.ai.keys['${k}']=this.value;save()"><button class="btn sm ghost" onclick="const i=document.getElementById('pk-${k}');i.type=i.type==='password'?'text':'password';this.textContent=i.type==='password'?'👁':'🙈'">👁</button></div>
      <div class="hint">${desc}</div></div>`).join('')}
    <div class="field"><label>System notifications</label>
      <div class="optlist"><button class="opt ${S.ai.notify?'sel':''}" onclick="S.ai.notify=!S.ai.notify;save();openPrivacy()"><span class="o-ico">🔔</span><span><span class="o-tt">In-app notifications ${S.ai.notify?'on':'off'}</span><span class="o-sub">Themed toasts — new likes, Scyn AI picks, stream alerts</span></span></button></div></div>
    <div class="divider"></div>
    <button class="btn block ghost" onclick="openYouTubeSetup()">▶️ YouTube key setup guide</button>
    <button class="btn block" style="background:var(--red)" onclick="confirmReset()">⚠️ Reset the whole system</button>
    <div class="hint" style="text-align:center;margin-top:8px">Wipes all keys, saved recipes, meal plans, notifications and profile — back to first launch.</div>
  </div>`;
  bindSheetVeil('sheet-privacy');
  w.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>closeSheet(b.dataset.close)));
  openSheet('sheet-privacy');
}
function confirmReset(){
  const w=$('#sheet-reset');
  w.querySelector('.sheet').innerHTML = `
  <div class="sheet-grab"><i></i></div>
  <div class="sheet-head"><div class="sh-txt"><h2>Reset everything?</h2><div class="sh-sub">This cannot be undone</div></div><button class="close-x" data-close="sheet-reset">✕</button></div>
  <div class="sheet-body">
    <div class="card" style="border-color:rgba(255,107,107,.4);font-size:13px;line-height:1.6">You will lose: <b>${S.saved.length}</b> saved recipes, <b>${S.recipes.filter(r=>r.userMade).length}</b> creations, your meal plan for the week, all notifications, your profile, and every stored API key.</div>
    <div class="btnrow"><button class="btn ghost" onclick="closeSheet('sheet-reset')">Keep my data</button><button class="btn" style="background:var(--red)" onclick="doReset()">Wipe it all</button></div>
  </div>`;
  bindSheetVeil('sheet-reset');
  w.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>closeSheet(b.dataset.close)));
  openSheet('sheet-reset');
}
function doReset(){
  resetAll();
  closeSheet('sheet-reset'); closeSheet('sheet-privacy');
  renderFeed(); renderProfile(); updateNotiBadge();
  toast('🔄','System reset','Fresh install state — onboarding will greet you on reload.', 4200, '#ff6b6b');
  setTimeout(()=>{ startOnboarding(); }, 1600);
}
// YouTube setup guide
function openYouTubeSetup(){
  const w=$('#sheet-ytsetup');
  w.querySelector('.sheet').innerHTML = `
  <div class="sheet-grab"><i></i></div>
  <div class="sheet-head"><div class="sh-txt"><h2>▶️ YouTube Setup</h2><div class="sh-sub">From key to feed in 3 steps</div></div><button class="close-x" data-close="sheet-ytsetup">✕</button></div>
  <div class="sheet-body">
    ${[['1','Open console.cloud.google.com','Create a project (any name) and enable “YouTube Data API v3” under APIs & Services → Library.'],
       ['2','Create an API key','Credentials → Create credentials → API key. Restrict it to the YouTube Data API for safety.'],
       ['3','Paste it here, choose a mode','Sync my channel pulls your uploads into the feed (OAuth prompts on first use). Start fresh uses the key purely for video search.']]
    .map(function(row){ var n=row[0], t=row[1], d=row[2]; return '<div class="card" style="display:flex;gap:12px"><div class="step-num">'+n+'</div><div style="flex:1"><div style="font-size:14px;font-weight:800">'+t+'</div><div style="font-size:12px;color:var(--muted);line-height:1.55;margin-top:3px">'+d+'</div></div></div>'; }).join('')}
    <div class="field"><label>Your key</label><input id="yt-key-input" type="password" placeholder="AIza…" value="${esc(S.ai.keys.youtube||'')}" oninput="S.ai.keys.youtube=this.value;save()"></div>
    <button class="btn block amber" onclick="S.ai.keys.youtube=document.getElementById('yt-key-input').value;save();closeSheet('sheet-ytsetup');toast('🔑','Key saved','Flip the feed to ▶️ YouTube and search anything.',3000,'#ffb86b')">Save &amp; use YouTube feed</button>
    <div class="card" style="font-size:11.5px;color:var(--muted);line-height:1.6">Honest limits: the API can't trigger YouTube's own offline downloads, can't detect Premium/membership content before playback, and playing videos always happens in YouTube's official embedded player — your app is a discovery &amp; curation layer, which keeps it fully within the API terms.</div>
  </div>`;
  bindSheetVeil('sheet-ytsetup');
  w.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>closeSheet(b.dataset.close)));
  openSheet('sheet-ytsetup');
}

// =============== BOOT ===============
function boot(){
  document.getElementById('root').innerHTML = HTML_SKELETON + overlayHTML();
  bindSheetVeil('sheet-recipe'); bindSheetVeil('sheet-rate'); bindSheetVeil('sheet-shop'); bindSheetVeil('sheet-create'); bindSheetVeil('sheet-pick'); bindSheetVeil('sheet-bio'); bindSheetVeil('sheet-noti'); bindSheetVeil('sheet-aisearch'); bindSheetVeil('sheet-privacy'); bindSheetVeil('sheet-aiconfig'); bindSheetVeil('sheet-ytsetup'); bindSheetVeil('sheet-reset');
  bindDiscoverInput();
  const fab=$('#btn-create'); if(fab) fab.addEventListener('click', openCreate);
  const aiBtn=$('#btn-open-ai'); if(aiBtn) aiBtn.addEventListener('click', openAISearch);
  $('#btn-noti')?.addEventListener('click', renderNoti);
  $('#btn-privacy')?.addEventListener('click', openPrivacy);
  // feed input
  const f=$('#feed');
  renderFeed(); updateNotiBadge();
  if(S.taste.remember && S.taste.mode) feedMode = S.taste.mode==='youtube'?'youtube':'recipes';
  // ---- online path: probe server, restore session or show auth gate ----
  SYNC.probe().then(online=>{
    if(online){
      if(SYNC.token){
        SYNC.req('GET','/api/auth/me').then(()=>SYNC.pullAll()).then(()=>{
          renderFeed(); renderProfile(); updateNotiBadge();
          toast('🤝','Back online','Signed in as '+SYNC.me.username+' — server data loaded.', 3200, '#5ad48a');
        }).catch(()=>{ SYNC.token=''; try{localStorage.removeItem('ff_token');}catch(e){} renderAuthOverlay(); });
      } else {
        renderAuthOverlay(); // server users pick: login, register, or guest
      }
      return;
    }
    // ---- offline path (file:// or no backend): classic local flow ----
    if(!S.onboarded){ setTimeout(startOnboarding, 500); }
    else if(!S.tutDone){ setTimeout(startTutorial, 600); }
  });
  // keyboard: enter sends AI chat
  document.addEventListener('keydown', e=>{ if(e.key==='Enter' && $('#aiwrap').classList.contains('open') && document.activeElement===$('#ai-in')) aiSend(); });
  // drag recipes from cookbook into planner: make cookbook rows draggable
  setInterval(()=>{
    $$('#cookbook-body .row-card').forEach(r=>{ r.draggable=true; r.ondragstart=()=>{MP.dragId=r.dataset.id||S.saved[0]}; });
  }, 900);
}
function overlayHTML(){
  return `
  <!-- Recipe sheet -->
  <div class="sheet-wrap" id="sheet-recipe"><div class="sheet-veil"></div><div class="sheet"></div></div>
  <!-- Rate sheet -->
  <div class="sheet-wrap" id="sheet-rate"><div class="sheet-veil"></div><div class="sheet"></div></div>
  <!-- Shop sheet -->
  <div class="sheet-wrap" id="sheet-shop"><div class="sheet-veil"></div><div class="sheet"></div></div>
  <!-- Create sheet -->
  <div class="sheet-wrap" id="sheet-create"><div class="sheet-veil"></div><div class="sheet"></div></div>
  <!-- Pick recipe sheet -->
  <div class="sheet-wrap" id="sheet-pick"><div class="sheet-veil"></div><div class="sheet"></div></div>
  <!-- Bio sheet -->
  <div class="sheet-wrap" id="sheet-bio"><div class="sheet-veil"></div><div class="sheet"></div></div>
  <!-- Notifications sheet -->
  <div class="sheet-wrap" id="sheet-noti"><div class="sheet-veil"></div><div class="sheet"></div></div>
  <!-- AI search sheet -->
  <div class="sheet-wrap" id="sheet-aisearch"><div class="sheet-veil"></div><div class="sheet"></div></div>
  <!-- Privacy sheet -->
  <div class="sheet-wrap" id="sheet-privacy"><div class="sheet-veil"></div><div class="sheet"></div></div>
  <!-- AI config sheet -->
  <div class="sheet-wrap" id="sheet-aiconfig"><div class="sheet-veil"></div><div class="sheet"></div></div>
  <!-- YT setup sheet -->
  <div class="sheet-wrap" id="sheet-ytsetup"><div class="sheet-veil"></div><div class="sheet"></div></div>
  <!-- Reset confirm -->
  <div class="sheet-wrap" id="sheet-reset"><div class="sheet-veil"></div><div class="sheet"></div></div>

  <!-- AI chat overlay -->
  <div id="aiwrap">
    <div class="ai-veil" onclick="closeAI()"></div>
    <div class="ai-card">
      <div class="ai-head">
        <div class="ai-orb">🍳</div>
        <div style="flex:1;min-width:0"><div class="ai-tt">AI Chef</div><div class="ai-sub" id="ai-tone-label">🧑‍🍳 Warm Chef</div></div>
        <button class="iconbtn" style="width:34px;height:34px;font-size:13px" onclick="cycleTone()" title="Change emotion tone">🎭</button>
        <button class="iconbtn" style="width:34px;height:34px;font-size:13px" onclick="openAIConfig()" title="Provider & model">⚙️</button>
        <button class="close-x" onclick="closeAI()">✕</button>
      </div>
      <div class="ai-msgs" id="ai-msgs"></div>
      <div class="ai-att" id="ai-att-row"></div>
      <div class="ai-presets">
        ${PRESET_PROMPTS.map(p=>`<button class="ai-preset" onclick="document.getElementById('ai-in').value='${p.label.replace(/'/g,"\\'")}';aiSend()">${p.emoji.replace(' substitutions','')} ${p.label}</button>`).join('')}
      </div>
      <div class="ai-input">
        <button class="iconbtn" style="width:36px;height:36px;font-size:15px;flex:none" onclick="aiAttach()">📎</button>
        <input id="ai-in" placeholder="Ask the chef anything…" autocomplete="off">
        <button class="snd" onclick="aiSend()">↑</button>
      </div>
    </div>
  </div>

  <!-- Voice chef -->
  <div id="voicewrap">
    <div class="vc-center">
      <div class="vc-ring" id="vc-ring" style="--p:0"><span>🍳</span></div>
      <div>
        <div style="text-align:center;font-size:11px;font-weight:800;color:var(--amber);text-transform:uppercase;letter-spacing:1px" id="vc-title">Recipe</div>
        <div class="vc-txt" id="vc-step">Step 1</div>
        <div class="vc-txt" id="vc-ins" style="font-size:16.5px">Instruction</div>
        <div class="vc-sub" id="vc-fb">Feedback</div>
        <div class="vc-sub" style="color:var(--faint);font-size:11px" id="vc-conf">0/2 confirmations</div>
      </div>
    </div>
    <div class="vc-btns">
      <button class="btn" id="vc-play" onclick="vcPlayPause()">▶</button>
      <button class="btn ghost" onclick="vcBack()">‹ Back</button>
      <button class="btn ghost" onclick="vcRepeat()">🔁 Repeat</button>
      <button class="btn ghost" onclick="vcListen()">🎤 Listen</button>
      <button class="btn ghost" onclick="vcDefine()">💬 Define</button>
      <button class="btn green" onclick="vcNext()">Next ›</button>
      <button class="btn ghost" onclick="endVoiceChef()">⏹ End</button>
    </div>
  </div>

  <!-- Camera guide -->
  <div id="camwrap">
    <video id="cam-video" autoplay playsinline muted></video>
    <div class="cam-top">
      <button class="btn sm ghost" onclick="endCameraGuide()">✕ Exit</button>
      <span class="chip live" style="margin-left:auto">● AI LIVE</span>
    </div>
    <div class="cam-ov">
      <div class="cam-step" id="cam-step">STEP 1</div>
      <div class="cam-ins" id="cam-ins">Instruction</div>
      <div class="cam-fb" id="cam-fb">Feedback</div>
      <div class="cam-prog"><i id="cam-prog-fill" style="width:0"></i></div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px">
        <span class="chip" id="cam-conf">0/2 confirmations</span>
        <button class="btn sm ghost" onclick="camNarrate()">🔊 Narrate</button>
        <button class="btn sm" id="cam-skip" style="display:none;background:var(--amber);color:#241505" onclick="camSkip()">Skip step</button>
      </div>
      <button class="btn ghost block sm" onclick="endCameraGuide()">⏹ End session</button>
    </div>
  </div>

  <!-- Onboarding -->
  <div id="onboard">
    <div class="ob-progress"><i id="ob-bar" style="width:14%"></i></div>
    <div class="ob-body" id="ob-body"></div>
    <div class="ob-foot">
      <button class="btn ghost" id="ob-back" onclick="obBack()">‹ Back</button>
      <button class="btn" id="ob-next" onclick="obNext()">Next</button>
    </div>
  </div>

  <!-- Tutorial -->
  <div id="tutorial">
    <div class="tut-spot" id="tut-spot"></div>
    <div class="tut-card" id="tut-card">
      <h3><span id="tut-title">Welcome</span></h3>
      <div class="tut-dots" id="tut-dots"></div>
      <p id="tut-desc"></p>
      <div class="btnrow">
        <button class="btn ghost sm" onclick="tutPrev()">‹ Back</button>
        <button class="btn sm" onclick="endTutorial()">Skip</button>
        <button class="btn sm" id="tut-next" onclick="tutNext()">Next</button>
      </div>
    </div>
  </div>`;
}
document.addEventListener('DOMContentLoaded', boot);
