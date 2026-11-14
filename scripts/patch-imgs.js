#!/usr/bin/env node
// Patches scripts/data.js IMG entries with the first result URL from scripts/imgs/*.json
'use strict';
const fs = require('node:fs');
const DIR = '/home/z/my-project/scripts/imgs';
const DATA = '/home/z/my-project/scripts/data.js';
const map = {
  pad_thai: 'pad_thai', bibimbap: 'bibimbap', shakshuka: 'shakshuka', pho: 'pho',
  moussaka: 'moussaka', mapo: 'mapo_tofu', paella: 'paella', doro: 'doro_wat',
  curry: 'green_curry', croissant: 'croissant'
};
let src = fs.readFileSync(DATA, 'utf8');
let ok = 0;
for (const [key, file] of Object.entries(map)) {
  const j = JSON.parse(fs.readFileSync(`${DIR}/${file}.json`, 'utf8'));
  const url = (j.results || [])[0] && j.results[0].original_url;
  if (!url) { console.error(`FAIL ${file}: no url`); continue; }
  const before = src;
  src = src.replace(`${key}:'TBD-${file}'`, `${key}:'${url}'`);
  if (src === before) { console.error(`FAIL ${key}: TBD marker not found`); continue; }
  ok++;
}
fs.writeFileSync(DATA, src);
console.log(`OK: patched ${ok}/10 image URLs into data.js`);
