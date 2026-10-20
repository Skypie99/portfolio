#!/usr/bin/env bash
# run-all.sh — rebuild the Release 6 review evidence from a clean checkout.
#
#   npm ci && npm run build
#   bash qa-reports/release6-editorial-finish-2026-10-20/tools/run-all.sh <baseline export dir>
#
# <baseline export dir> is a build of main f29ce93 (the "before"); `out/` is the
# candidate. Needs only the pre-installed Playwright Chromium, sharp, ffmpeg and
# the repository's axe-core devDependency. Nothing is installed; nothing leaves
# loopback. Every step is one of the documented tools beside this script.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
T="$ROOT/qa-reports/release6-editorial-finish-2026-10-20/tools"
R="$ROOT/qa-reports/release6-editorial-finish-2026-10-20"
BASE="${1:?baseline export dir}"
cd "$ROOT"

# 1. Primary captures, both builds, both themes, desktop + phone.
node "$T/capture.mjs" --dir "$BASE" --out "$R/baseline" --targets work,home-work --themes light,dark --sizes 1440x900@1,393x852@2 --modes normal --port 3401
node "$T/capture.mjs" --dir out --out "$R/after" --targets work,home-work --themes light,dark --sizes 1440x900@1,393x852@2 --modes normal --port 3402
# 2. Boundary probes (candidate): narrow and short phones, landscape phone, tablet, laptop, 1920 at DPR 2, and 200% zoom (720x450@2 == 1440x900 at 200%).
node "$T/capture.mjs" --dir out --out "$R/after/boundaries" --targets work,home-work --themes light --sizes 320x568@2,375x667@2,768x1024@2,1280x800@1,720x450@2 --modes normal --port 3403
node "$T/capture.mjs" --dir out --out "$R/after/boundaries" --targets work,home-work --themes light,dark --sizes 852x393@2,1920x1200@2 --modes normal --port 3404
# 3. Text-only 200% enlargement (root font-size doubled) on the changed layouts.
node "$T/capture.mjs" --dir out --out "$R/after/zoom-text" --targets work,home-work --themes light --sizes 1440x900@1,393x852@2 --modes zoomtext --port 3405
# 4. Boards: before vs after, matched viewport, theme, scroll state and DPR.
node "$T/boards.mjs" --before "$R/baseline" --after "$R/after" --out "$R/boards" \
  --names work-light-1440x900@1-plate-01,work-light-1440x900@1-plate-02,work-dark-1440x900@1-plate-01,work-light-393x852@2-plate-01,home-work-light-1440x900@1-section,home-work-dark-1440x900@1-section,home-work-light-393x852@2-section,home-work-dark-393x852@2-section \
  --label-before "BEFORE · main f29ce93" --label-after "AFTER · Release 6 candidate"
# 5. Floors: reduced motion first paint vs settled, no-JS; axe; rendered contrast; the journey.
node "$T/rm-check.mjs" --dir out --out "$R/modes" --themes light,dark --sizes 1440x900@1,393x852@2 --port 3406
node "$T/axe-check.mjs" --dir out --out "$R/a11y" --themes light,dark --sizes 1440x900@1,393x852@2 --port 3407
node "$T/contrast-probe.mjs" --dir out --out "$R/a11y" --themes light,dark --sizes 1440x900@1,393x852@2 --port 3408
node "$T/journey.mjs" --dir out --out "$R/a11y/journey" --size 1440x900@1 --theme light --port 3409
# 6. Motion: the same scripted scrolls on both builds, with timing probes, then dense contact sheets.
node "$T/record.mjs" --dir "$BASE" --out "$R/motion/before" --name home-work-light-1440x900 --route / --start "#support-work" --to "#work" --offset 0 --glide 1400 --hold 2600 --probe "#work .reveal" --port 3410
node "$T/record.mjs" --dir out --out "$R/motion/after" --name home-work-light-1440x900 --route / --start "#support-work" --to "#work" --offset 0 --glide 1400 --hold 2600 --probe "#work .reveal" --port 3411
node "$T/record.mjs" --dir "$BASE" --out "$R/motion/before" --name work-arrival-light-1440x900 --route /work/ --to "ul > li:nth-child(2)" --offset 48 --glide 1400 --hold 1600 --probe-load "h1, ul > li > .reveal" --port 3412
node "$T/record.mjs" --dir out --out "$R/motion/after" --name work-arrival-light-1440x900 --route /work/ --to "ul > li:nth-child(2)" --offset 48 --glide 1400 --hold 1600 --probe-load "h1, ul > li > .reveal" --port 3413
node "$T/record.mjs" --dir out --out "$R/motion/after" --name home-work-light-393x852 --route / --start "#support-work" --to "#work" --offset 0 --glide 1400 --hold 2600 --probe "#work .reveal" --size 393x852 --port 3414
# 7. The dusk-turn, both legs, real time and time-dilated (diagnostic).
node "$T/theme-turn.mjs" --dir out --out "$R/motion/theme-turn" --route /work/ --size 1440x900 --dilate 10 --port 3415
echo "[run-all] done"
