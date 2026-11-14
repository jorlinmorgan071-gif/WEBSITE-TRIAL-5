#!/usr/bin/env python3
"""Insert rating + ratingsCount after each recipe's saves: value in scripts/data.js."""
import re

DATA = '/home/z/my-project/scripts/data.js'
# id -> (avg rating 1-5, number of ratings) — plausible values correlated with engagement
RATINGS = {
    'r1': (4.8, 5230), 'r2': (4.9, 6812), 'r3': (4.7, 9104), 'r4': (4.6, 12844),
    'r5': (4.5, 3117), 'r6': (4.8, 8206), 'r7': (4.7, 2944), 'r8': (4.6, 6390),
    'r9': (4.9, 388), 'r10': (4.7, 4218), 'r11': (4.8, 3562), 'r12': (4.5, 2249),
    'r13': (4.9, 5867), 'r14': (4.6, 1891), 'r15': (4.7, 4026), 'r16': (4.4, 2871),
    'r17': (4.9, 1633), 'r18': (4.6, 3810), 'r19': (4.8, 5018),
}

with open(DATA, encoding='utf-8') as f:
    src = f.read()

# map each recipe id block -> locate its "saves:NNNN," and append rating fields
count = 0
for rid, (avg, n) in RATINGS.items():
    # find the block starting at id:'rX' then the first saves: within it
    # ([^\]] allows newlines but stops at the first bracket, i.e. the ingredients array)
    m = re.search(r"(id:'%s',[^\]]*?\bsaves:(\d+),)" % re.escape(rid), src)
    if not m:
        raise SystemExit(f'FAIL: could not locate saves: for {rid}')
    block = m.group(1)
    new_block = block + f" rating:{avg}, ratingsCount:{n},"
    src = src.replace(block, new_block, 1)
    count += 1

with open(DATA, 'w', encoding='utf-8') as f:
    f.write(src)
print(f'OK: inserted rating/ratingsCount into {count}/19 recipes')
