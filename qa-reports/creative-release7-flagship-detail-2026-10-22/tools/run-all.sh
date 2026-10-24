#!/usr/bin/env bash
# run-all.sh — rebuild every artifact in this review folder from two built exports.
#
#   bash qa-reports/creative-release7-flagship-detail-2026-10-22/tools/run-all.sh <before-export> <after-export>
#
# <before-export>: `npm run build` output of the baseline (main 0933245), copied aside.
# <after-export>:  `npm run build` output of this branch.
# Example, from the repo root:
#   git worktree add ../portfolio-main-0933245 0933245 && (cd ../portfolio-main-0933245 && ln -s ../portfolio/node_modules . && npm run build)
#   npm run build
#   bash qa-reports/creative-release7-flagship-detail-2026-10-22/tools/run-all.sh ../portfolio-main-0933245/out out
#
# Needs: node, the repo's devDependencies (playwright-core, sharp, ffmpeg-static,
# axe-core) and Playwright's Chromium + WebKit builds. Loopback only, apart from
# live-journey.mjs, which is not run here (it reads the live site).
set -euo pipefail
BEFORE="$1"; AFTER="$2"
E="qa-reports/creative-release7-flagship-detail-2026-10-22"
T="$E/tools"
SIZES="1440x900@1,1280x800@1,1024x768@1,768x1024@1,393x852@2,375x667@2,320x568@2"
TMP="$(mktemp -d)"

node "$T/room-capture.mjs" --dir "$BEFORE" --out "$E/before" --tag before --sizes "$SIZES" --port 3501
node "$T/room-capture.mjs" --dir "$AFTER"  --out "$E/after"  --tag after  --sizes "$SIZES" --port 3502
node "$T/boards.mjs" --before "$E/before" --after "$E/after" --out "$E/boards" --before-label "main 0933245" --after-label "candidate"

node "$T/room-capture.mjs" --dir "$AFTER" --out "$E/modes" --tag after --sizes 1440x900@1,393x852@2 --modes rm1600 --port 3503
mv "$E/modes/geometry-after.json" "$E/modes/geometry-after-rm1600.json"
node "$T/room-capture.mjs" --dir "$AFTER" --out "$E/modes" --tag after --sizes 1440x900@1,393x852@2 --modes rm,nojs --port 3504

for tag in before after; do
  dir="$BEFORE"; [ "$tag" = after ] && dir="$AFTER"
  node "$T/a11y-room.mjs"  --dir "$dir" --out "$E/a11y"       --tag "$tag" --port 3505
  node "$T/perf-room.mjs"  --dir "$dir" --out "$E/perf"       --tag "$tag" --port 3506
  node "$T/zoomtext-room.mjs" --dir "$dir" --out "$E/boundaries" --tag "$tag" --port 3507
  for sz in 1440x900@1 393x852@2; do
    node "$T/room-motion.mjs" --dir "$dir" --out "$TMP" --tag "$tag" --size "$sz" --theme light --port 3508
  done
done
node "$T/webkit-room.mjs" --dir "$AFTER" --out "$E/webkit" --tag after --port 3509

# Motion: keep the arrival (the clip's last 4.6s), encode H.264, cut 200ms frames, sheet them.
FF="$(node -e "console.log(require('ffmpeg-static'))")"
mkdir -p "$E/motion/sheets" "$TMP/frames"
for f in "$TMP"/motion-*.webm; do
  b="$(basename "$f" .webm)"
  "$FF" -y -loglevel error -sseof -4.6 -i "$f" -an -c:v libx264 -pix_fmt yuv420p -crf 26 -preset slow -movflags +faststart "$E/motion/$b.mp4"
  mkdir -p "$TMP/frames/$b" && "$FF" -y -loglevel error -i "$E/motion/$b.mp4" -vf fps=5 "$TMP/frames/$b/f%03d.png"
done
cp "$TMP"/motion-*.json "$E/motion/"
node "$T/sheets.mjs" --frames "$TMP/frames" --out "$E/motion/sheets" --every 1 --cols 8
echo "done: $E"
