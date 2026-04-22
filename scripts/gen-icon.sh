#!/usr/bin/env bash
# Generate macOS .icns + PNG set from assets/icon.svg
set -euo pipefail
cd "$(dirname "$0")/.."

SVG="assets/icon.svg"
OUT="build/icon.iconset"
ICNS="build/icon.icns"
PNG="build/icon.png"

if ! command -v rsvg-convert >/dev/null 2>&1; then
  echo "rsvg-convert missing - install with: brew install librsvg"
  exit 1
fi

mkdir -p "$OUT" build

# master 1024
rsvg-convert -w 1024 -h 1024 "$SVG" -o "$PNG"
cp "$PNG" "$OUT/icon_512x512@2x.png"

# all required sizes
declare -a SIZES=(16 32 64 128 256 512 1024)
for s in "${SIZES[@]}"; do
  rsvg-convert -w "$s" -h "$s" "$SVG" -o "$OUT/icon_${s}x${s}.png"
done
# retina pairs
cp "$OUT/icon_32x32.png"   "$OUT/icon_16x16@2x.png"
cp "$OUT/icon_64x64.png"   "$OUT/icon_32x32@2x.png"
cp "$OUT/icon_256x256.png" "$OUT/icon_128x128@2x.png"
cp "$OUT/icon_512x512.png" "$OUT/icon_256x256@2x.png"

iconutil -c icns "$OUT" -o "$ICNS"
echo "Wrote $ICNS and $PNG"
