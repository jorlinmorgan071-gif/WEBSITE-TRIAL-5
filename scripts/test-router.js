// unit test: route pattern matcher used by server.js
'use strict';
function buildRegex(pattern) {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\*]/g, '\\$&');
  const exact = escaped.replace(/\\?:[a-zA-Z]+/g, '([^/]+)').replace(/\\\//g, '\\/');
  return new RegExp('^' + exact + '/?$');
}
const cases = [
  ['/api/health', '/api/health', true],
  ['/api/health', '/api/healthx', false],
  ['/api/recipes/:id/like', '/api/recipes/r1/like', true],
  ['/api/recipes/:id/like', '/api/recipes/r1/like/', true],
  ['/api/recipes/:id/like', '/api/recipes/r1/save', false],
  ['/api/recipes/:id/comments', '/api/recipes/r2/comments', true],
  ['/api/recipes/:id/rate', '/api/recipes/r13/rate', true],
  ['/api/recipes/:id/rate', '/api/recipes/r13/save', false],
  ['/api/users/:handle/follow', '/api/users/@chef_dex/follow', true],
  ['/api/recipes/:id', '/api/recipes/abc123', true],
  ['/api/recipes/:id', '/api/recipes', false],
  ['/api/recipes', '/api/recipes', true],
  ['/admin/keys', '/admin/keys', true],
  ['/api/recipes/:id', '/api/recipes/r1/like', false],
];
let pass = 0;
for (const [pat, path, want] of cases) {
  const got = buildRegex(pat).test(path);
  const ok = got === want;
  if (ok) pass++;
  console.log(ok ? 'PASS' : 'FAIL', pat, path, '=>', got);
}
console.log(pass + '/' + cases.length + ' matcher tests pass');
process.exit(pass === cases.length ? 0 : 1);
