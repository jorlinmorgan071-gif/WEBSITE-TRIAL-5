#!/usr/bin/env python3
"""Assemble ForkFeed single-file app from modular sources."""
import os, re

SRC = '/home/z/my-project/scripts'
OUT = '/home/z/my-project/download/ForkFeed.html'

def read(name):
    with open(os.path.join(SRC, name), encoding='utf-8') as f:
        return f.read()

css = read('style.css')
data = read('data.js')
core = read('core.js')
screens = read('screens.js')
ui = read('ui.js')

html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no">
<meta name="theme-color" content="#0a0808">
<title>ForkFeed — TikTok for your kitchen</title>
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='0.9em' font-size='90'>🍳</text></svg>">
<style>
{css}
</style>
</head>
<body>
<div id="root"></div>
<script>
{data}
{core}
{screens}
{ui}
</script>
</body>
</html>
"""

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, 'w', encoding='utf-8') as f:
    f.write(html)

print('WROTE', OUT, os.path.getsize(OUT), 'bytes')
