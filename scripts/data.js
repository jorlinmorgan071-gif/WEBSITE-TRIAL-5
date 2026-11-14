// ForkFeed data layer — recipes, stores, grocery platforms, substitutions, nutrition
const IMG = {
  tacos:'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/983b8a40dd20.jpg',
  carbonara:'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/6a3cff955c6a.jpg',
  butter:'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/b397cbf0ce57.jpg',
  burger:'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/3765278b5f5f.jpeg',
  sushi:'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/f4ff3daf707b.jpg',
  jollof:'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/af8de17d77f6.jpg',
  tatin:'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/a36703ce5c2e.jpg',
  ramen:'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/b6121ebd35f5.jpg',
  live:'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/9bdd9782d26e.jpg'
};

const SEED_RECIPES = [
  {
    id:'r1', title:'Street Tacos al Pastor', creator:'Chef Marisol', creatorHandle:'@marisol.cooks',
    cuisine:'Mexican', time:35, difficulty:'Medium', servings:4, likes:128400, commentsCount:2103, saves:8421,
    image:IMG.tacos, hashtags:['#tacos','#mexican','#streetfood'],
    desc:'Charred pineapple, adobo-marinated pork, and charred tortillas — the Mexico City street classic.',
    ingredients:[
      {qty:600,unit:'g',name:'pork shoulder, thinly sliced'},
      {qty:3,unit:'tbsp',name:'achiote adobo paste'},
      {qty:120,unit:'ml',name:'pineapple juice'},
      {qty:1,unit:'',name:'pineapple, sliced into rounds'},
      {qty:12,unit:'',name:'corn tortillas'},
      {qty:1,unit:'',name:'white onion, finely diced'},
      {qty:15,unit:'g',name:'cilantro, chopped'},
      {qty:2,unit:'limes',name:'juiced'},
      {qty:1,unit:'tsp',name:'dried oregano'}
    ],
    steps:[
      'Blend adobo paste, pineapple juice, oregano and a splash of vinegar into a marinade.',
      'Marinate the pork slices for at least 1 hour (overnight is better).',
      'Sear the pork in a screaming-hot pan until edges caramelise, about 3 minutes per side.',
      'Char the pineapple rounds in the same pan until bruised and golden.',
      'Warm the tortillas directly over the flame for 15 seconds a side.',
      'Chop pork + pineapple together on the board, pile onto tortillas.',
      'Finish with onion, cilantro, and a big squeeze of lime.'
    ],
    nutrition:{cal:420,protein:26,carbs:38,fat:16,fiber:6,sugar:9,sodium:620},
    ytId:'' , live:false
  },
  {
    id:'r2', title:'True Carbonara', creator:'Nonna Lucia', creatorHandle:'@lucia.kitchen',
    cuisine:'Italian', time:20, difficulty:'Easy', servings:2, likes:98100, commentsCount:1490, saves:6650,
    image:IMG.carbonara, hashtags:['#carbonara','#pasta','#italian'],
    desc:'Four ingredients, zero cream, one silky emulsion. Rome\'s proudest pasta.',
    ingredients:[
      {qty:200,unit:'g',name:'spaghetti'},
      {qty:120,unit:'g',name:'guanciale, cut into lardons'},
      {qty:2,unit:'',name:'egg yolks (extra-large)'},
      {qty:40,unit:'g',name:'Pecorino Romano, finely grated'},
      {qty:1,unit:'tsp',name:'black pepper, coarsely ground'}
    ],
    steps:[
      'Boil the spaghetti in well-salted water.',
      'Crisp the guanciale slowly in a dry pan until glassy and golden; kill the heat.',
      'Whisk yolks, pecorino and pepper into a thick paste in a bowl.',
      'Toss the drained pasta (keep a cup of starchy water) into the guanciale fat off heat.',
      'Add the egg paste with a splash of pasta water and toss violently until glossy and creamy — never back on high heat.',
      'Serve immediately with more pecorino and pepper.'
    ],
    nutrition:{cal:560,protein:24,carbs:64,fat:24,fiber:2,sugar:2,sodium:780},
    ytId:'', live:false
  },
  {
    id:'r3', title:'Butter Chicken', creator:'Ravi Singh', creatorHandle:'@ravi.spices',
    cuisine:'Indian', time:50, difficulty:'Medium', servings:4, likes:156300, commentsCount:3210, saves:11002,
    image:IMG.butter, hashtags:['#indian','#curry','#butterchicken'],
    desc:'Velvet tomato gravy, charred tandoori chicken, and a finishing swirl of cream and kasuri methi.',
    ingredients:[
      {qty:700,unit:'g',name:'chicken thighs, boneless'},
      {qty:150,unit:'g',name:'plain yogurt'},
      {qty:2,unit:'tbsp',name:'tandoori masala'},
      {qty:400,unit:'g',name:'canned tomatoes'},
      {qty:60,unit:'g',name:'butter'},
      {qty:120,unit:'ml',name:'heavy cream'},
      {qty:1,unit:'tsp',name:'kasuri methi (dried fenugreek leaves)'},
      {qty:1,unit:'tbsp',name:'ghee'},
      {qty:2,unit:'',name:'onions, roughly chopped'}
    ],
    steps:[
      'Marinate the chicken in yogurt, tandoori masala and salt for 2 hours.',
      'Char the chicken under a hot grill until edges blacken slightly, about 8 minutes.',
      'Fry the onions in ghee until deep golden, add tomatoes and simmer 15 minutes.',
      'Blend the sauce silky smooth, then return to low heat with the butter.',
      'Add the chicken, simmer 10 minutes, finish with cream and crushed kasuri methi.',
      'Rest 5 minutes off heat, serve with naan or basmati rice.'
    ],
    nutrition:{cal:610,protein:38,carbs:14,fat:44,fiber:3,sugar:8,sodium:690},
    ytId:'', live:false
  },
  {
    id:'r4', title:'Smash Burgers', creator:'Dex Grillmaster', creatorHandle:'@dex.grills',
    cuisine:'American', time:15, difficulty:'Easy', servings:2, likes:204500, commentsCount:4402, saves:15800,
    image:IMG.burger, hashtags:['#burger','#smashburger','#american'],
    desc:'Paper-thin patties smashed on scorching steel, melted cheese, potato roll. Two minutes per side.',
    ingredients:[
      {qty:400,unit:'g',name:'ground beef (20% fat)'},
      {qty:4,unit:'',name:'American cheese slices'},
      {qty:2,unit:'',name:'potato rolls'},
      {qty:2,unit:'tbsp',name:'mayonnaise'},
      {qty:1,unit:'tbsp',name:'mustard'},
      {qty:0.5,unit:'',name:'onion, shaved paper-thin'},
      {qty:6,unit:'',name:'pickle slices'}
    ],
    steps:[
      'Roll the beef into 4 loose balls — do not compress.',
      'Toast the potato rolls cut-side down in butter.',
      'Smash each ball flat on a ripping-hot griddle with a stiff spatula; salt hard.',
      'After 90 seconds, flip once, cheese immediately, stack two patties.',
      'Mix mayo + mustard, spread on the rolls.',
      'Build: sauce, pickles, onion, double patty, crown.'
    ],
    nutrition:{cal:780,protein:42,carbs:38,fat:52,fiber:2,sugar:7,sodium:1120},
    ytId:'', live:false
  },
  {
    id:'r5', title:'Dragon Roll', creator:'Kenji Sato', creatorHandle:'@kenji.sushi',
    cuisine:'Japanese', time:45, difficulty:'Hard', servings:3, likes:88700, commentsCount:1120, saves:7304,
    image:IMG.sushi, hashtags:['#sushi','#japanese','#dragonroll'],
    desc:'Shrimp tempura and avocado rolled out, draped with eel, and lacquered with sweet soy.',
    ingredients:[
      {qty:300,unit:'g',name:'sushi rice, cooked'},
      {qty:4,unit:'tbsp',name:'rice vinegar'},
      {qty:6,unit:'',name:'large shrimp'},
      {qty:1,unit:'',name:'avocado, ripe'},
      {qty:4,unit:'sheets',name:'nori'},
      {qty:100,unit:'g',name:'tempura batter mix'},
      {qty:60,unit:'ml',name:'unagi sauce'},
      {qty:1,unit:'tsp',name:'wasabi'}
    ],
    steps:[
      'Season the warm rice with vinegar, sugar and salt; fold with a wooden paddle while cooling.',
      'Butterfly the shrimp, skewer, and fry in tempura batter until crisp.',
      'Lay rice on nori, flip, and place tempura + avocado strips on the seaweed side.',
      'Roll tight with the bamboo mat into an inside-out roll.',
      'Fan-slice the avocado and drape over the roll; top with tobiko.',
      'Cut into 8 pieces with a wet knife, glaze with unagi sauce.'
    ],
    nutrition:{cal:480,protein:18,carbs:58,fat:19,fiber:5,sugar:9,sodium:830},
    ytId:'', live:false
  },
  {
    id:'r6', title:'Party Jollof Rice', creator:'Amara Okafor', creatorHandle:'@amara.eats',
    cuisine:'Nigerian', time:70, difficulty:'Medium', servings:6, likes:142800, commentsCount:2608, saves:12450,
    image:IMG.jollof, hashtags:['#jollof','#nigerian','#partyfood'],
    desc:'Smoky, deeply-reduced party jollof with the crispy bottom everyone fights over.',
    ingredients:[
      {qty:4,unit:'cups',name:'long grain parboiled rice'},
      {qty:700,unit:'g',name:'blended tomatoes + red bell pepper + scotch bonnet'},
      {qty:1,unit:'',name:'onion, sliced'},
      {qty:3,unit:'tbsp',name:'groundnut oil'},
      {qty:2,unit:'',name:'stock cubes'},
      {qty:1,unit:'tsp',name:'thyme'},
      {qty:1,unit:'tsp',name:'curry powder'},
      {qty:100,unit:'ml',name:'chicken stock'}
    ],
    steps:[
      'Fry the sliced onion in groundnut oil until browned at the edges.',
      'Pour in the pepper blend and fry hard for 12 minutes until the rawness cooks out and it darkens.',
      'Add stock, cubes, thyme and curry powder; simmer 5 minutes.',
      'Stir in the washed rice, reduce heat, cover with foil.',
      'Cook 35 minutes without stirring — the bottom needs to catch slightly for that smoky party flavour.',
      'Fluff from the bottom up and let it steam off heat 10 minutes.'
    ],
    nutrition:{cal:520,protein:11,carbs:82,fat:14,fiber:4,sugar:6,sodium:540},
    ytId:'', live:false
  },
  {
    id:'r7', title:'Tarte Tatin', creator:'Claire Fontaine', creatorHandle:'@claire.patisserie',
    cuisine:'French', time:60, difficulty:'Medium', servings:8, likes:76200, commentsCount:980, saves:5210,
    image:IMG.tatin, hashtags:['#french','#dessert','#apple'],
    desc:'Caramelised apples, butter pastry, flipped in one dramatic move. Failure is impossible if the caramel is deep amber.',
    ingredients:[
      {qty:8,unit:'',name:'apples, halved and cored'},
      {qty:150,unit:'g',name:'sugar'},
      {qty:80,unit:'g',name:'butter'},
      {qty:1,unit:'sheet',name:'puff pastry'},
      {qty:1,unit:'',name:'vanilla bean, seeds scraped'}
    ],
    steps:[
      'Pack the apple halves tight, round-side down, in a buttered tatin mould.',
      'Sprinkle sugar and dot butter evenly, add vanilla seeds.',
      'Cook over medium heat until the caramel turns deep amber, 18 minutes.',
      'Cover with the pastry round, tuck the edges down with a spoon.',
      'Bake at 200°C for 28 minutes until the pastry is deep gold.',
      'Rest 10 minutes, then flip onto a plate with conviction.'
    ],
    nutrition:{cal:380,protein:3,carbs:56,fat:16,fiber:3,sugar:38,sodium:120},
    ytId:'', live:false
  },
  {
    id:'r8', title:'Midnight Ramen', creator:'Yuki Tanaka', creatorHandle:'@yuki.slurps',
    cuisine:'Japanese', time:40, difficulty:'Easy', servings:2, likes:112900, commentsCount:1840, saves:9120,
    image:IMG.ramen, hashtags:['#ramen','#noodles','#midnight'],
    desc:'A 40-minute shoyu broth that tastes like it simmered all day. Soft egg, charred pork, springy noodles.',
    ingredients:[
      {qty:800,unit:'ml',name:'chicken stock'},
      {qty:2,unit:'tbsp',name:'soy sauce'},
      {qty:1,unit:'tbsp',name:'mirin'},
      {qty:2,unit:'',name:'ramen noodles, fresh'},
      {qty:2,unit:'',name:'eggs'},
      {qty:150,unit:'g',name:'chashu pork, sliced'},
      {qty:2,unit:'',name:'scallions, sliced'},
      {qty:1,unit:'sheet',name:'nori'}
    ],
    steps:[
      'Soft-boil the eggs exactly 6½ minutes, ice bath, halve.',
      'Sear the chashu slices until the edges crisp.',
      'Simmer the stock with soy and mirin; keep it just below a boil.',
      'Cook the noodles 90 seconds; drain hard.',
      'Build the bowl: broth, noodles, pork, egg, scallions, nori.',
      'Slurp immediately — ramen waits for no one.'
    ],
    nutrition:{cal:490,protein:28,carbs:54,fat:17,fiber:3,sugar:5,sodium:1450},
    ytId:'', live:false
  },
  {
    id:'r9', title:'LIVE: Flambé Night — Beef Bourguignon', creator:'Chef Marisol', creatorHandle:'@marisol.cooks',
    cuisine:'French', time:120, difficulty:'Hard', servings:6, likes:23100, commentsCount:486, saves:1990,
    image:IMG.live, hashtags:['#livecooking','#french','#bourguignon'],
    desc:'Streaming the full two-hour build: wine, flame, and a very patient braise. Ask questions in the chat.',
    ingredients:[
      {qty:1.2,unit:'kg',name:'beef chuck, cubed'},
      {qty:750,unit:'ml',name:'red Burgundy'},
      {qty:150,unit:'g',name:'bacon lardons'},
      {qty:12,unit:'',name:'pearl onions'},
      {qty:400,unit:'g',name:'cremini mushrooms'},
      {qty:2,unit:'tbsp',name:'flour'},
      {qty:2,unit:'sprigs',name:'thyme'}
    ],
    steps:[
      'Render the bacon; brown the beef in batches — patience here decides everything.',
      'Flambé the wine, scraping every brown bit off the bottom.',
      'Add stock, thyme, and the garlic head; cover and braise low for 2 hours.',
      'Sauté the onions and mushrooms separately, add for the final 20 minutes.',
      'Thicken with a beurre manié and serve over potato purée.'
    ],
    nutrition:{cal:680,protein:52,carbs:18,fat:38,fiber:4,sugar:6,sodium:810},
    ytId:'', live:true, viewers:3412
  }
];

const CUISINES = ['All','Mexican','Italian','Indian','American','Japanese','Nigerian','French'];

const GROCERS = [
  {flag:'🇺🇸',name:'Instacart',country:'United States',url:'https://www.instacart.com/store'},
  {flag:'🇺🇸',name:'Walmart Grocery',country:'United States',url:'https://www.walmart.com/grocery'},
  {flag:'🇺🇸',name:'Amazon Fresh',country:'United States',url:'https://www.amazon.com/fresh'},
  {flag:'🇬🇧',name:'Tesco',country:'United Kingdom',url:'https://www.tesco.com/groceries'},
  {flag:'🇬🇧',name:'Sainsbury\'s',country:'United Kingdom',url:'https://www.sainsburys.co.uk/gol-ui/groceries'},
  {flag:'🇨🇦',name:'Loblaws',country:'Canada',url:'https://www.loblaws.ca'},
  {flag:'🇦🇺',name:'Woolworths',country:'Australia',url:'https://www.woolworths.com.au/shop'},
  {flag:'🇰🇪',name:'Jumia',country:'Kenya',url:'https://www.jumia.co.ke/groceries'},
  {flag:'🇳🇬',name:'Jumia',country:'Nigeria',url:'https://www.jumia.com.ng/groceries'},
  {flag:'🇮🇳',name:'BigBasket',country:'India',url:'https://www.bigbasket.com'},
  {flag:'🇮🇳',name:'Blinkit',country:'India',url:'https://blinkit.com'},
  {flag:'🇩🇪',name:'REWE',country:'Germany',url:'https://www.rewe.de'},
  {flag:'🇫🇷',name:'Carrefour',country:'France',url:'https://www.carrefour.fr'},
  {flag:'🇿🇦',name:'Checkers',country:'South Africa',url:'https://shop.checkers.co.za'},
  {flag:'🇧🇷',name:'Mercado Livre',country:'Brazil',url:'https://mercado.com.br'},
  {flag:'🇦🇪',name:'Carrefour UAE',country:'UAE',url:'https://www.carrefouruae.com'}
];

const SUBSTITUTIONS = {
  'spaghetti':['rice noodles','gluten-free pasta','zucchini noodles'],
  'guanciale':['smoked bacon','pancetta','turkey bacon'],
  'heavy cream':['coconut cream','cashew cream','oat cream'],
  'butter':['vegan butter','ghee','olive oil'],
  'ground beef (20% fat)':['ground turkey','plant-based mince','ground chicken'],
  'American cheese slices':['dairy-free cheddar','Swiss cheese','provolone'],
  'plain yogurt':['coconut yogurt','soy yogurt','cashew yogurt'],
  'chicken thighs, boneless':['firm tofu','cauliflower florets','chickpeas'],
  'eggs':['flax egg (1 tbsp flax + 3 tbsp water)','aquafaba','just egg'],
  'egg yolks (extra-large)':['1.5 tbsp cashew cream + ½ tsp black salt per yolk'],
  'puff pastry':['gluten-free puff pastry','filo dough'],
  'ramen noodles, fresh':['rice ramen','gluten-free ramen','kelp noodles'],
  'parboiled rice':['cauliflower rice','brown rice','quinoa'],
  'corn tortillas':['lettuce cups','grain-free tortillas'],
  'cheddar':['nutritional yeast blend','dairy-free cheddar'],
  'flour':['gluten-free flour blend','cornstarch','almond flour']
};

const DIET_PILLS = [
  {key:'gf',label:'🌾 Gluten-Free'},
  {key:'df',label:'🥛 Dairy-Free'},
  {key:'vegan',label:'🌿 Vegan'},
  {key:'keto',label:'🥩 Keto'}
];

const TONE_PRESETS = [
  {id:'warm',name:'Warm Chef',emoji:'🧑‍🍳',desc:'Friendly, encouraging',style:'Speak warmly like a mentor chef who believes in the home cook.'},
  {id:'gordon',name:'Gordon Mode',emoji:'🔥',desc:'Intense, no-nonsense',style:'Be a fiery intense chef. Blunt, dramatic, but never actually insulting. Push standards high.'},
  {id:'sensei',name:'Calm Sensei',emoji:'🥋',desc:'Zen, precise',style:'Speak slowly and calmly like a tea master. Short precise sentences. One wisdom per answer.'},
  {id:'hype',name:'Hype Friend',emoji:'🎉',desc:'Hype-man energy',style:'You are the user\'s hype friend. High energy, exclamation marks, celebrate every step.'},
  {id:'grandma',name:'Grandma',emoji:'👵',desc:'Loving, nostalgic',style:'You are a loving grandmother chef. Nostalgic, tender, mention smells and family memories. Pinch of this, fistful of that.'}
];

const AI_PROVIDERS = [
  {id:'builtin',name:'Built-in Chef AI',needsKey:false,models:[{id:'forkfeed-mini',name:'ForkFeed Mini (built-in)'}],free:true},
  {id:'openai',name:'OpenAI',needsKey:true,models:[
    {id:'gpt-4o-mini',name:'GPT-4o mini'},{id:'gpt-4o',name:'GPT-4o'},{id:'gpt-4.1-mini',name:'GPT-4.1 mini'}
  ],keyHint:'sk-...'},
  {id:'openrouter',name:'OpenRouter (free models)',needsKey:true,models:[
    {id:'meta-llama/llama-3.1-8b-instruct:free',name:'Llama 3.1 8B (free)'},
    {id:'meta-llama/llama-3.3-70b-instruct:free',name:'Llama 3.3 70B (free)'},
    {id:'google/gemma-2-9b-it:free',name:'Gemma 2 9B (free)'},
    {id:'qwen/qwen-2.5-72b-instruct:free',name:'Qwen 2.5 72B (free)'},
    {id:'mistralai/mistral-7b-instruct:free',name:'Mistral 7B (free)'}
  ],keyHint:'sk-or-v1-...'},
  {id:'ollama',name:'Ollama (local)',needsKey:false,models:[
    {id:'llama3.2',name:'llama3.2'},{id:'mistral',name:'mistral'},{id:'qwen2.5',name:'qwen2.5'},{id:'custom',name:'✍️ type your own…'}
  ],keyHint:''},
  {id:'gemini',name:'Google Gemini',needsKey:true,models:[
    {id:'gemini-1.5-flash',name:'Gemini 1.5 Flash'},{id:'gemini-1.5-pro',name:'Gemini 1.5 Pro (vision)'}
  ],keyHint:'AIza...'}
];

const PRESET_PROMPTS = [
  {emoji:'🥗',label:'What can I cook with what I have?'},
  {emoji:'⏱️',label:'Give me a 20-minute dinner'},
  {emoji:'🔥',label:'Is my pan hot enough?'},
  {emoji:' substitutions',label:'Swap this ingredient'},
  {emoji:'📊',label:'Explain this nutrition chart'},
  {emoji:'📍',label:'Where can I buy this near me?'},
  {emoji:'💰',label:'Estimate the cost of this dish'},
  {emoji:'😄',label:'Tell me a food joke'}
];

// ---------- persistence ----------
const LS = {
  get(k,f){ try{const v=localStorage.getItem(k); return v?JSON.parse(v):f;}catch(e){return f;} },
  set(k,v){ try{localStorage.setItem(k,JSON.stringify(v));}catch(e){} },
  del(k){ try{localStorage.removeItem(k);}catch(e){} }
};

const DEFAULT_USER = {
  name:'You', handle:'@you', bio:'Cooking my way through the feed. 🍳',
  followers:128, following:86, scynRecipes:0
};

function freshState(){
  return {
    recipes: JSON.parse(JSON.stringify(SEED_RECIPES)),
    liked:{}, saved:[], cookedSteps:{}, follows:{},
    mealPlan:{}, // dayKey -> {breakfast:{...},lunch:..,dinner:..}
    notifications:[
      {id:1,ico:'❤️',title:'Chef Marisol liked your comment',msg:'"Finally someone who respects the char on pineapple!"',ts:Date.now()-2*3600e3,read:false,group:'today'},
      {id:2,ico:'🔴',title:'LIVE: Flambé Night started',msg:'Chef Marisol is streaming Beef Bourguignon — 3.4k watching.',ts:Date.now()-5*3600e3,read:false,group:'today'},
      {id:3,ico:'🤖',title:'Scyn AI curated your upload',msg:'Your Street Tacos remix was featured on the For You page.',ts:Date.now()-26*3600e3,read:false,group:'week'},
      {id:4,ico:'👤',title:'Ravi Singh started following you',msg:'Welcome them to your kitchen.',ts:Date.now()-50*3600e3,read:true,group:'week'},
      {id:5,ico:'✨',title:'3 new recipes match your Taste Profile',msg:'Japanese + Easy + under 30 min — see Discover.',ts:Date.now()-3*86400e3,read:true,group:'older'}
    ],
    taste:{cuisines:[],difficulty:'Any',diet:[],mode:'recipes',remember:true},
    ai:{provider:'builtin',model:'forkfeed-mini',keys:{},tone:'warm',notify:true},
    user: JSON.parse(JSON.stringify(DEFAULT_USER)),
    bookmarks:[], // youtube mode
    onboarded:false, tutDone:false, feedIndex:0
  };
}

let S = load();
function load(){
  const stored = LS.get('forkfeed_state', null);
  if(stored && stored.recipes && stored.recipes.length){
    // merge seed recipes that user may have deleted? keep stored as source of truth
    return Object.assign(freshState(), stored);
  }
  return freshState();
}
function save(){ LS.set('forkfeed_state', S); }
function resetAll(){ LS.del('forkfeed_state'); S = freshState(); }

// helpers
const fmtK = n => n>=1e6 ? (n/1e6).toFixed(1)+'M' : n>=1e3 ? (n/1e3).toFixed(1)+'K' : String(n);
const esc = s => String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function timeAgo(ts){ const s=(Date.now()-ts)/1e3; if(s<60)return 'just now'; const m=s/60; if(m<60)return Math.floor(m)+'m ago'; const h=m/60; if(h<24)return Math.floor(h)+'h ago'; return Math.floor(h/24)+'d ago'; }
function scaleQty(q, base, target){ const r = target/base; const v = q*r; if(Number.isInteger(v)) return v+''; return (Math.round(v*100)/100)+''; }
