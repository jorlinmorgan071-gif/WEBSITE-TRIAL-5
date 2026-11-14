#!/usr/bin/env node
// Generates scripts/server/seed.js from the SEED_RECIPES in scripts/data.js
'use strict';
const fs = require('node:fs');
const src = fs.readFileSync('/home/z/my-project/scripts/data.js', 'utf8');
const m = src.match(/const SEED_RECIPES = (\[[\s\S]*?\n\]);/);
if (!m) { console.error('SEED_RECIPES not found'); process.exit(1); }
const im = src.match(/const IMG = (\{[\s\S]*?\n\});/);
if (!im) { console.error('IMG not found'); process.exit(1); }
const out = `// auto-generated from scripts/data.js — do not edit by hand\n'use strict';\nconst IMG = ${im[1]};\nconst SEED_RECIPES = ${m[1]};\nmodule.exports = { SEED_RECIPES, IMG };\n`;
fs.writeFileSync('/home/z/my-project/scripts/server/seed.js', out);
console.log('seed.js written:', out.length, 'bytes');
