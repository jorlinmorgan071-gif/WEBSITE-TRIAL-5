#!/usr/bin/env bash
# Retry missing recipe images sequentially (parallel bursts triggered rate limits).
set -u
OUT=/home/z/my-project/scripts/imgs
mkdir -p "$OUT"

declare -A QUERIES=(
  [bibimbap]="korean bibimbap in a hot stone bowl with egg and colorful vegetables"
  [shakshuka]="shakshuka eggs poached in tomato pepper sauce in a cast iron pan"
  [pho]="vietnamese pho beef noodle soup bowl with fresh herbs and lime"
  [moussaka]="greek moussaka baked eggplant casserole with bechamel topping on a plate"
  [mapo_tofu]="mapo tofu sichuan dish with chili oil and minced pork in a bowl"
  [doro_wat]="ethiopian doro wat chicken stew served on injera flatbread"
  [green_curry]="thai green curry with chicken, eggplant and thai basil in a bowl"
  [croissant]="baker laminating buttered croissant dough on a floured counter in a bakery"
)

for name in "${!QUERIES[@]}"; do
  if [ -s "$OUT/$name.json" ]; then
    echo "SKIP $name (exists)"
    continue
  fi
  echo "FETCH $name …"
  z-ai image-search --query "${QUERIES[$name]}" --count 3 --gl us --no-rank \
    --output "$OUT/$name.json" >/dev/null 2>&1
  if [ -s "$OUT/$name.json" ]; then
    echo "  OK ($(wc -c < "$OUT/$name.json") bytes)"
  else
    echo "  FAIL $name"
  fi
done
echo "DONE"
