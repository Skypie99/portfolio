#!/usr/bin/env bash
# run-refinement.sh — rebuild the refinement round's evidence from two built exports.
#
#   bash qa-reports/creative-release7-refinement-2026-10-23/tools/run-refinement.sh <before-export> <after-export>
#
# <before-export>: `npm run build` of main 2fb857b (the live site on 2026-10-23).
# <after-export>:  `npm run build` of this branch after the refinements.
# The v1 comparison boards read the 2026-10-22 folder's after/ captures (v1, ed5b25b).
set -euo pipefail
BEFORE="$1"; AFTER="$2"
R="qa-reports/creative-release7-refinement-2026-10-23"
OLD="qa-reports/creative-release7-flagship-detail-2026-10-22"
T1="$OLD/tools"; T2="$R/tools"
SIZES="1440x900@1,1280x800@1,1024x768@1,834x1194@2,768x1024@1,393x852@2,375x667@2,320x568@2"
TMP="$(mktemp -d)"

node "$T1/room-capture.mjs" --dir "$BEFORE" --out "$R/before" --tag before --sizes "$SIZES" --port 3611
node "$T1/room-capture.mjs" --dir "$AFTER"  --out "$R/after"  --tag after  --sizes "$SIZES" --port 3612
node "$T1/boards.mjs" --before "$R/before" --after "$R/after" --out "$R/boards" --before-label "main 2fb857b" --after-label "refined candidate"

# v1 (ed5b25b) against the refined candidate, where the refinements show: tablet and dark.
mkdir -p "$TMP/v1"
for f in light-768x1024@1-room dark-768x1024@1-room dark-1440x900@1-room dark-393x852@2-room light-1024x768@1-room; do
  cp "$OLD/after/after-$f.jpg" "$TMP/v1/before-$f.jpg"
done
mkdir -p "$TMP/v2"; for f in "$TMP"/v1/before-*.jpg; do b="$(basename "$f")"; cp "$R/after/after-${b#before-}" "$TMP/v2/after-${b#before-}"; done
node "$T1/boards.mjs" --before "$TMP/v1" --after "$TMP/v2" --out "$R/refinement-boards" --before-label "v1 ed5b25b" --after-label "refined candidate"

node "$T1/room-capture.mjs" --dir "$AFTER" --out "$R/modes" --tag after --sizes 1440x900@1,768x1024@1,393x852@2 --modes rm1600 --port 3613
mv "$R/modes/geometry-after.json" "$R/modes/geometry-after-rm1600.json"
node "$T1/room-capture.mjs" --dir "$AFTER" --out "$R/modes" --tag after --sizes 1440x900@1,768x1024@1,393x852@2 --modes rm,nojs --port 3614

for tag in before after; do
  dir="$BEFORE"; [ "$tag" = after ] && dir="$AFTER"
  node "$T1/a11y-room.mjs" --dir "$dir" --out "$R/a11y" --tag "$tag" --sizes 1440x900@1,768x1024@1,393x852@2 --port 3615
  node "$T2/contrast-scroll.mjs" --dir "$dir" --out "$R/contrast-scroll" --tag "$tag" --sizes 1440x900@1,1024x768@1,834x1194@2,768x1024@1,393x852@2,320x568@2 --port 3616
  node "$T1/perf-room.mjs" --dir "$dir" --out "$R/perf" --tag "$tag" --sizes 1440x900@1,768x1024@1,393x852@2 --port 3617
  node "$T2/zoomtext-room.mjs" --dir "$dir" --out "$R/boundaries" --tag "$tag" --port 3618
done
node "$T2/webkit-room.mjs" --dir "$AFTER" --out "$R/webkit" --tag after --port 3619
for sz in 1440x900@1 768x1024@1; do
  node "$T1/room-motion.mjs" --dir "$AFTER" --out "$TMP/motion" --tag after --size "$sz" --theme light --port 3620
done
mkdir -p "$R/motion"; cp "$TMP"/motion/*.json "$R/motion/"
FF="$(node -e "console.log(require('ffmpeg-static'))")"
"$FF" -y -loglevel error -sseof -4.6 -i "$TMP/motion/motion-after-light-768x1024.webm" -an -c:v libx264 -pix_fmt yuv420p -crf 26 -preset slow -movflags +faststart "$R/motion/motion-after-light-768x1024.mp4"
echo "done: $R"
