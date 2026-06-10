#!/bin/sh
# Fetch the Noto Sans TC variable font used by the composition (not committed).
set -e
cd "$(dirname "$0")/.."
mkdir -p public/fonts
curl -sSL -o public/fonts/NotoSansTC.ttf \
  "https://github.com/google/fonts/raw/main/ofl/notosanstc/NotoSansTC%5Bwght%5D.ttf"
echo "fonts ready: public/fonts/NotoSansTC.ttf"
