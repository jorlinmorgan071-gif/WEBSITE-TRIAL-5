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
  live:'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/9bdd9782d26e.jpg',
  pad_thai:'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/c3aa234f59ad.jpg', bibimbap:'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/a126e406ffe3.jpg', shakshuka:'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/402b87024e92.jpg', pho:'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/ae932c2cffaa.jpg',
  moussaka:'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/666e13fa8a6d.jpg', mapo:'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/00ab19292629.jpg', paella:'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/2ce62774465f.jpg', doro:'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/017258f5625a.jpg',
  curry:'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/f9321fdd2986.jpg', croissant:'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/e1b6036a2526.jpg'
};

const SEED_RECIPES = [
  {
    id:'r1', title:'Street Tacos al Pastor', creator:'Chef Marisol', creatorHandle:'@marisol.cooks',
    cuisine:'Mexican', time:35, difficulty:'Medium', servings:4, likes:128400, commentsCount:2103, saves:8421, rating:4.8, ratingsCount:5230,
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
    cuisine:'Italian', time:20, difficulty:'Easy', servings:2, likes:98100, commentsCount:1490, saves:6650, rating:4.9, ratingsCount:6812,
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
    cuisine:'Indian', time:50, difficulty:'Medium', servings:4, likes:156300, commentsCount:3210, saves:11002, rating:4.7, ratingsCount:9104,
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
    cuisine:'American', time:15, difficulty:'Easy', servings:2, likes:204500, commentsCount:4402, saves:15800, rating:4.6, ratingsCount:12844,
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
    cuisine:'Japanese', time:45, difficulty:'Hard', servings:3, likes:88700, commentsCount:1120, saves:7304, rating:4.5, ratingsCount:3117,
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
    cuisine:'Nigerian', time:70, difficulty:'Medium', servings:6, likes:142800, commentsCount:2608, saves:12450, rating:4.8, ratingsCount:8206,
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
    cuisine:'French', time:60, difficulty:'Medium', servings:8, likes:76200, commentsCount:980, saves:5210, rating:4.7, ratingsCount:2944,
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
    cuisine:'Japanese', time:40, difficulty:'Easy', servings:2, likes:112900, commentsCount:1840, saves:9120, rating:4.6, ratingsCount:6390,
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
    cuisine:'French', time:120, difficulty:'Hard', servings:6, likes:23100, commentsCount:486, saves:1990, rating:4.9, ratingsCount:388,
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
  },
  {
    id:'r10', title:'Pad Thai Goong Sod', creator:'Ploy Chalermkit', creatorHandle:'@ploy.wok',
    cuisine:'Thai', time:25, difficulty:'Medium', servings:2, likes:76400, commentsCount:1204, saves:6930, rating:4.7, ratingsCount:4218,
    image:IMG.pad_thai, hashtags:['#padthai','#thai','#wok'],
    desc:'Sweet-sour-salty tamarind noodles fried in one wok, finished with crushed peanuts and lime.',
    ingredients:[
      {qty:150,unit:'g',name:'dried rice noodles, soaked'},
      {qty:200,unit:'g',name:'shrimp, peeled'},
      {qty:3,unit:'tbsp',name:'tamarind paste'},
      {qty:3,unit:'tbsp',name:'palm sugar'},
      {qty:2,unit:'tbsp',name:'fish sauce'},
      {qty:2,unit:'',name:'eggs'},
      {qty:1,unit:'',name:'firm tofu, diced'},
      {qty:60,unit:'g',name:'bean sprouts'},
      {qty:3,unit:'tbsp',name:'roasted peanuts, crushed'},
      {qty:2,unit:'',name:'garlic cloves, chives and lime wedges'}
    ],
    steps:[
      'Soak the noodles in warm water until pliable but still firm — never boil.',
      'Melt palm sugar with tamarind and fish sauce into a glossy sauce; set aside.',
      'Fry tofu and garlic in a screaming-hot wok, add shrimp until just pink.',
      'Push everything aside, crack the eggs in, scramble hard for 15 seconds.',
      'Noodles go in with a splash of water; toss until they drink the sauce.',
      'Off heat fold in bean sprouts and chives; plate with peanuts and lime.'
    ],
    nutrition:{cal:540,protein:28,carbs:68,fat:16,fiber:4,sugar:14,sodium:980},
    ytId:'', live:false
  },
  {
    id:'r11', title:'Dolsot Bibimbap', creator:'Jin-Ah Park', creatorHandle:'@jinah.bap',
    cuisine:'Korean', time:45, difficulty:'Medium', servings:2, likes:91200, commentsCount:1432, saves:8210, rating:4.8, ratingsCount:3562,
    image:IMG.bibimbap, hashtags:['#bibimbap','#korean','#stonebowl'],
    desc:'A sizzling stone bowl of rice, seasoned vegetables, gochujang and a crisped egg yolk — stir at the table.',
    ingredients:[
      {qty:300,unit:'g',name:'short-grain rice, cooked'},
      {qty:150,unit:'g',name:'spinach, blanched and seasoned'},
      {qty:100,unit:'g',name:'bean sprouts, blanched'},
      {qty:2,unit:'',name:'carrots, julienned'},
      {qty:150,unit:'g',name:'ground beef, marinated'},
      {qty:2,unit:'',name:'egg yolks'},
      {qty:2,unit:'tbsp',name:'gochujang'},
      {qty:1,unit:'tbsp',name:'toasted sesame oil'},
      {qty:1,unit:'tsp',name:'sesame seeds'},
      {qty:2,unit:'tsp',name:'soy sauce'}
    ],
    steps:[
      'Cook the rice while you season each vegetable separately with sesame oil, salt and garlic.',
      'Sear the marinated beef until browned and glossy.',
      'Oil the heated dolsot stone bowls until they smoke.',
      'Pack rice in, arrange the vegetables and beef in colour-blocked wedges.',
      'Slide a raw yolk into the centre, drizzle gochujang thinned with vinegar.',
      'Serve immediately — the rice crackles and builds a golden crust while they stir.'
    ],
    nutrition:{cal:520,protein:24,carbs:74,fat:17,fiber:6,sugar:7,sodium:890},
    ytId:'', live:false
  },
  {
    id:'r12', title:'Shakshuka for Two', creator:'Yara Cohen', creatorHandle:'@yara.breakfast',
    cuisine:'Middle Eastern', time:30, difficulty:'Easy', servings:2, likes:64800, commentsCount:897, saves:4860, rating:4.5, ratingsCount:2249,
    image:IMG.shakshuka, hashtags:['#shakshuka','#brunch','#eggs'],
    desc:'Eggs poached in a smoky pepper-tomato gravy, straight from the pan with bread for mopping.',
    ingredients:[
      {qty:6,unit:'',name:'eggs'},
      {qty:400,unit:'g',name:'canned tomatoes'},
      {qty:2,unit:'',name:'red bell peppers, roasted and sliced'},
      {qty:1,unit:'',name:'onion, sliced'},
      {qty:4,unit:'cloves',name:'garlic, sliced'},
      {qty:2,unit:'tsp',name:'sweet paprika'},
      {qty:1,unit:'tsp',name:'cumin'},
      {qty:1,unit:'tbsp',name:'olive oil'},
      {qty:30,unit:'g',name:'feta, crumbled'},
      {qty:4,unit:'tbsp',name:'parsley, chopped'}
    ],
    steps:[
      'Sweat the onion and garlic in olive oil until silky, not browned.',
      'Add paprika and cumin for 30 seconds until they bloom fragrant.',
      'Pour in tomatoes and peppers; simmer until thickened and split with oil, 12 minutes.',
      'Season hard, then make wells with the back of a spoon.',
      'Crack in the eggs, cover, and cook until whites set but yolks stay molten.',
      'Crumble feta, shower parsley, and bring the pan to the table with bread.'
    ],
    nutrition:{cal:330,protein:18,carbs:22,fat:19,fiber:5,sugar:11,sodium:720},
    ytId:'', live:false
  },
  {
    id:'r13', title:'Pho Bo Tai (Beef Pho)', creator:'Linh Tran', creatorHandle:'@linh.pho',
    cuisine:'Vietnamese', time:90, difficulty:'Hard', servings:4, likes:118000, commentsCount:2012, saves:10400, rating:4.9, ratingsCount:5867,
    image:IMG.pho, hashtags:['#pho','#vietnamese','#noodlesoup'],
    desc:'A clear-spiced beef broth over rice noodles and rare beef — herbs, lime and chili on the side.',
    ingredients:[
      {qty:1.5,unit:'kg',name:'beef bones, knuckle and marrow'},
      {qty:500,unit:'g',name:'beef sirloin, thinly sliced'},
      {qty:2,unit:'',name:'onions, halved and charred'},
      {qty:80,unit:'g',name:'ginger, bruised'},
      {qty:3,unit:'',name:'star anise'},
      {qty:1,unit:'',name:'cinnamon stick'},
      {qty:4,unit:'tbsp',name:'fish sauce'},
      {qty:2,unit:'tsp',name:'rock sugar'},
      {qty:400,unit:'g',name:'flat rice noodles'},
      {qty:1,unit:'bunch',name:'Thai basil, cilantro and sawtooth herb'}
    ],
    steps:[
      'Blanch the bones 5 minutes, scrub the pot, then simmer them in fresh water — skim relentlessly.',
      'Char onion and ginger under the broiler until blackened; toast the spices dry.',
      'Add everything to the broth and keep it at the barest simmer for 3 hours — never boiling.',
      'Strain; season with fish sauce and rock sugar until it tastes simultaneously deep and bright.',
      'Rinse rice noodles under hot water until they slump.',
      'Ladle broth over noodles and raw beef — it cooks in the bowl — with herbs, lime and chili at the table.'
    ],
    nutrition:{cal:410,protein:32,carbs:48,fat:11,fiber:3,sugar:4,sodium:1240},
    ytId:'', live:false
  },
  {
    id:'r14', title:'Moussaka', creator:'Dimitra Alexiou', creatorHandle:'@dimitra.taverna',
    cuisine:'Greek', time:90, difficulty:'Hard', servings:6, likes:58900, commentsCount:742, saves:4120, rating:4.6, ratingsCount:1891,
    image:IMG.moussaka, hashtags:['#greek','#moussaka','#casserole'],
    desc:'Layered fried eggplant, cinnamon beef, and a nutmeg bechamel that bron\u00e9s under the broiler.',
    ingredients:[
      {qty:2,unit:'',name:'large eggplants, sliced'},
      {qty:600,unit:'g',name:'ground lamb'},
      {qty:400,unit:'g',name:'canned tomatoes'},
      {qty:1,unit:'',name:'onion, diced'},
      {qty:120,unit:'ml',name:'milk'},
      {qty:40,unit:'g',name:'butter'},
      {qty:40,unit:'g',name:'flour'},
      {qty:1,unit:'tsp',name:'cinnamon'},
      {qty:1,unit:'',name:'bay leaf'},
      {qty:50,unit:'g',name:'kefalotyri or pecorino, grated'}
    ],
    steps:[
      'Salt the eggplant slices 30 minutes; pat dry and fry until amber.',
      'Brown the lamb with onion; add cinnamon, tomatoes and bay; cook to a thick ragù.',
      'Build a blond roux with butter and flour, whisk in milk, season with nutmeg.',
      'Layer: eggplant, meat, eggplant, meat — ending with bechamel over everything.',
      'Top with cheese and bake at 190°C for 45 minutes until the top trembles gold.',
      'Rest 20 minutes before cutting — moussaka forgives nobody who slices early.'
    ],
    nutrition:{cal:640,protein:34,carbs:28,fat:44,fiber:6,sugar:9,sodium:760},
    ytId:'', live:false
  },
  {
    id:'r15', title:'Mapo Tofu', creator:'Zhang Wei', creatorHandle:'@zhangwei.chili',
    cuisine:'Chinese', time:20, difficulty:'Easy', servings:3, likes:84300, commentsCount:1188, saves:7720, rating:4.7, ratingsCount:4026,
    image:IMG.mapo, hashtags:['#sichuan','#mapo','#wok'],
    desc:'Trembling tofu in a fire-colored sauce — mala numbing, beef crisp, scallion green over white.',
    ingredients:[
      {qty:400,unit:'g',name:'soft tofu, cut in cubes'},
      {qty:150,unit:'g',name:'ground beef'},
      {qty:2,unit:'tbsp',name:'doubanjiang (chili bean paste)'},
      {qty:1,unit:'tbsp',name:'fermented black beans, rinsed'},
      {qty:1,unit:'tsp',name:'ground Sichuan peppercorn'},
      {qty:2,unit:'tsp',name:'cornstarch slurry'},
      {qty:3,unit:'',name:'scallions, sliced'},
      {qty:2,unit:'tsp',name:'Chinkiang vinegar'},
      {qty:250,unit:'ml',name:'chicken stock'}
    ],
    steps:[
      'Fry the beef in oil until deeply crisp and dark — this texture is the soul of the dish.',
      'Add doubanjiang and black beans; fry until the oil runs red.',
      'Pour in stock, slide in the tofu, and simmer gently — never stir, only push.',
      'Thicken with the slurry in two passes until the sauce clings.',
      'Finish with scallions and a heavy snow of Sichuan peppercorn.',
      'Serve with rice — the numbing heat builds bite by bite.'
    ],
    nutrition:{cal:360,protein:26,carbs:16,fat:22,fiber:3,sugar:3,sodium:880},
    ytId:'', live:false
  },
  {
    id:'r16', title:'Seafood Paella Valenciana-ish', creator:'Tato Bello', creatorHandle:'@tato.arroz',
    cuisine:'Spanish', time:55, difficulty:'Medium', servings:4, likes:69700, commentsCount:931, saves:5240, rating:4.4, ratingsCount:2871,
    image:IMG.paella, hashtags:['#paella','#spanish','#rice'],
    desc:'Saffron rice with shrimp, mussels and squid, cooked open in a wide pan until the socarrat forms.',
    ingredients:[
      {qty:320,unit:'g',name:'bomba rice'},
      {qty:12,unit:'',name:'shrimp'},
      {qty:12,unit:'',name:'mussels, scrubbed'},
      {qty:200,unit:'g',name:'squid, rings'},
      {qty:1,unit:'',name:'red bell pepper, sliced'},
      {qty:1,unit:'',name:'onion, minced'},
      {qty:3,unit:'cloves',name:'garlic'},
      {qty:1,unit:'g',name:'saffron threads'},
      {qty:1,unit:'tsp',name:'sweet paprika'},
      {qty:900,unit:'ml',name:'fish stock, hot'}
    ],
    steps:[
      'Grate the tomato into the soffrito base; fry squid 1 minute only and remove.',
      'Bloom saffron in hot stock; keep it simmering beside the pan.',
      'Stir paprika for seconds only — it burns fast and turns bitter.',
      'Rice in, stock in, spread level — from now on do not stir, not once.',
      'Arrange seafood and peppers on top at the 10-minute mark.',
      'Crank the heat the last 2 minutes for the crackling socarrat; rest 5 under a cloth.'
    ],
    nutrition:{cal:510,protein:32,carbs:62,fat:14,fiber:4,sugar:5,sodium:740},
    ytId:'', live:false
  },
  {
    id:'r17', title:'Doro Wat', creator:'Selam Bekele', creatorHandle:'@selam.injera',
    cuisine:'Ethiopian', time:120, difficulty:'Hard', servings:4, likes:47300, commentsCount:588, saves:3810, rating:4.9, ratingsCount:1633,
    image:IMG.doro, hashtags:['#ethiopian','#dorowat','#stew'],
    desc:'A deep-red berbere chicken stew finished with hard-cooked eggs, scooped up with tear-off injera.',
    ingredients:[
      {qty:1.5,unit:'kg',name:'chicken thighs, skin-on'},
      {qty:3,unit:'',name:'onions, finely minced'},
      {qty:100,unit:'ml',name:'niter kibbeh (spiced clarified butter)'},
      {qty:3,unit:'tbsp',name:'berbere'},
      {qty:4,unit:'',name:'eggs, hard-cooked and peeled'},
      {qty:1,unit:'tbsp',name:'tomato paste'},
      {qty:2,unit:'tsp',name:'garlic, minced'},
      {qty:1,unit:'tsp',name:'ginger, grated'},
      {qty:250,unit:'ml',name:'chicken stock'},
      {qty:2,unit:'tsp',name:'mekelesha spice blend'}
    ],
    steps:[
      'Cook the minced onions dry in a wide pan, stirring, until they melt into paste — no oil yet.',
      'Add niter kibbeh, garlic and ginger; fry 5 minutes.',
      'Toast the berbere in the fat until it turns brick-red and aromatic.',
      'Brown the chicken in the spice base; coat every piece.',
      'Add stock and tomato paste; simmer covered for 45 minutes, then eggs go in for the last 15.',
      'Finish with mekelesha and serve on injera — no forks, use the bread.'
    ],
    nutrition:{cal:580,protein:42,carbs:18,fat:38,fiber:4,sugar:6,sodium:690},
    ytId:'', live:false
  },
  {
    id:'r18', title:'Green Curry Gaeng Keow Wan', creator:'Nan Suwan', creatorHandle:'@nan.curry',
    cuisine:'Thai', time:35, difficulty:'Easy', servings:3, likes:71600, commentsCount:1024, saves:6290, rating:4.6, ratingsCount:3810,
    image:IMG.curry, hashtags:['#thai','#greencurry','#coconut'],
    desc:'Coconut cream broken with green curry paste, Thai basil, and fish sauce balance — hot, sweet, salty.',
    ingredients:[
      {qty:400,unit:'ml',name:'coconut milk'},
      {qty:3,unit:'tbsp',name:'green curry paste'},
      {qty:500,unit:'g',name:'chicken thigh, sliced'},
      {qty:150,unit:'g',name:'Thai eggplant, quartered'},
      {qty:4,unit:'tbsp',name:'fish sauce'},
      {qty:2,unit:'tbsp',name:'palm sugar'},
      {qty:1,unit:'handful',name:'Thai basil'},
      {qty:4,unit:'',name:'makrut lime leaves, torn'},
      {qty:2,unit:'',name:"bird's eye chilies, slit"}
    ],
    steps:[
      'Crack the thick coconut cream in a wok until the oil separates and glosses.',
      'Fry the paste in that oil until it turns intensely fragrant and darkens a shade.',
      'Return the thinner coconut milk; bring to a gentle simmer.',
      'Chicken in first, then eggplant — cook until the eggplant is just tender, not slumped.',
      'Season off-heat balance: fish sauce, palm sugar, torn lime leaves.',
      'Kill the heat, fold Thai basil in last so it stays green and loud.'
    ],
    nutrition:{cal:460,protein:30,carbs:16,fat:32,fiber:3,sugar:8,sodium:920},
    ytId:'', live:false
  },
  {
    id:'r19', title:'Laminated Croissants', creator:'Olivier Duchamps', creatorHandle:'@olivier.lamination',
    cuisine:'French', time:240, difficulty:'Hard', servings:12, likes:88200, commentsCount:1355, saves:9340, rating:4.8, ratingsCount:5018,
    image:IMG.croissant, hashtags:['#baking','#croissant','#french'],
    desc:'Three letter-folds, one butter block, and patience — shatter-crisp outside, honeycomb within.',
    ingredients:[
      {qty:500,unit:'g',name:'bread flour'},
      {qty:280,unit:'g',name:'cold unsalted butter, in a block'},
      {qty:60,unit:'g',name:'sugar'},
      {qty:12,unit:'g',name:'salt'},
      {qty:10,unit:'g',name:'instant yeast'},
      {qty:280,unit:'ml',name:'cold milk'},
      {qty:1,unit:'',name:'egg, for egg wash'}
    ],
    steps:[
      'Mix a soft dough — 3 minutes only, so it barely develops; chill overnight.',
      'Beat the butter block between parchment into a neat 15 cm square; keep it cold but pliable.',
      'Lock the butter in: fold the dough over it and press the seal shut.',
      'Give three letter-folds, resting the dough 45 minutes in the fridge between each.',
      'Roll to 4 mm, cut triangles, stretch, and roll with zero pressure so the layers inflate.',
      'Proof at 24°C until they wobble like jelly; bake at 200°C dropping to 170°C for the last 10.'
    ],
    nutrition:{cal:310,protein:6,carbs:29,fat:18,fiber:1,sugar:4,sodium:320},
    ytId:'', live:false
  }
];

const CUISINES = ['All','Mexican','Italian','Indian','American','Japanese','Nigerian','French','Thai','Korean','Middle Eastern','Vietnamese','Greek','Chinese','Spanish','Ethiopian'];

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
  'flour':['gluten-free flour blend','cornstarch','almond flour'],
  'dried rice noodles':['rice sticks wider-cut','glass noodles','zucchini noodles'],
  'gochujang':['sriracha + miso','harissa','sambal oelek'],
  'tamarind paste':['lime + brown sugar + soy','pomegranate molasses','rice vinegar + sugar'],
  'fish sauce':['soy sauce + lime','vegan fish sauce','light soy + seaweed'],
  'coconut milk':['cashew cream','oat cream','light coconut cream'],
  'palm sugar':['brown sugar','maple syrup','coconut sugar'],
  'ground lamb':['ground beef','plant-based mince','ground turkey'],
  'berbere':['cayenne + paprika + allspice','harissa + ginger','chili powder + cinnamon'],
  'bomba rice':['arborio','Calrose','short-grain rice'],
  'saffron threads':['turmeric pinch','annatto','safflower'],
  'soft tofu':['silken tofu','firm tofu cubed small'],
  'doubanjiang':['sriracha + miso','gochujang','sambal oelek'],
  'bean sprouts':['shredded cabbage','julienned zucchini'],
  'shrimp':['tofu puffs','king oyster mushrooms','hearts of palm']
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
