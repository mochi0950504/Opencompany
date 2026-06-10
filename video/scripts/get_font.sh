#!/bin/sh
# Fetch Noto Sans TC (variable weight) and install it as a system font so the
# Remotion headless browser can use it via fontconfig. Re-run after a fresh
# container start; the font is intentionally not committed.
set -e
cd "$(dirname "$0")/.."
mkdir -p public/fonts
if [ ! -f public/fonts/NotoSansTC.ttf ]; then
  curl -sSL -o public/fonts/NotoSansTC.ttf \
    "https://github.com/google/fonts/raw/main/ofl/notosanstc/NotoSansTC%5Bwght%5D.ttf"
fi
mkdir -p /usr/local/share/fonts
cp public/fonts/NotoSansTC.ttf /usr/local/share/fonts/
fc-cache -f >/dev/null 2>&1 || true
echo "Noto Sans TC installed (public/fonts + system fontconfig)"
