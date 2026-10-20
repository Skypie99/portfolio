#!/bin/zsh
# Release 3 final: browser matrix, overflow, cinematic preservation — strictly one after another.
set -u
P="$HOME/SkyPi_Portfolio_Execution_Review/2026-10-19_release3-final-r1"
WT="$HOME/Portfolio-codex/claude-release3-final-20261019"
T="$WT/qa-reports/release3-flagstone-20261019/tools"
B="http://127.0.0.1:3151"
cd "$WT"
rc=0
echo "== verify-release3 chromium"; node "$T/verify-release3.mjs" "$B" "$P/data/browser-chromium" chromium || rc=1
echo "== verify-release3 webkit";   node "$T/verify-release3.mjs" "$B" "$P/data/browser-webkit" webkit || rc=1
echo "== overflow no-JS";           node "$T/overflow-nojs.mjs" "$B" "$P/data/overflow-nojs.json" || rc=1
echo "== cinematic preservation";   node "$P/rig/cinematic-preserve.mjs" "$B" "$P/data/cinematic-preserve.json" || rc=1
echo "== repository overflow census (npm run check:overflow)"; npm run -s check:overflow || rc=1
echo "MATRIX_DONE rc=$rc"; exit $rc
