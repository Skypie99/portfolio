#!/bin/zsh
# Release 3 final: every-frame focus sweep, after (as built) then before (previous ring re-applied on the same export).
set -u
P="$HOME/SkyPi_Portfolio_Execution_Review/2026-10-19_release3-final-r1"
export REVIEW_WT="$HOME/Portfolio-codex/claude-release3-final-20261019" REVIEW_RV="$P/data/focus-v2" FIT_ONCE=1 REVIEW_BASE="http://127.0.0.1:3151"
cd "$REVIEW_WT"
PLAN="chromium:light:1440x900,chromium:dark:1440x900,webkit:light:393x852,webkit:dark:393x852" node "$P/rig/focus-dense.mjs"
PLAN="chromium:light:1440x900,chromium:dark:1440x900,webkit:light:393x852,webkit:dark:393x852" node "$P/rig/focus-play.mjs"
OLD='.proof-row [data-themed-motion] > button:focus-visible { outline-color: var(--focus-ring-color, var(--color-accent-primary)); } html.dark .proof-row [data-themed-motion] > button:focus-visible { outline-color: rgb(var(--rgb-accent-ink)); }'
FOCUS_CSS="$OLD" TAG_SUFFIX="_BEFORE" PLAN="chromium:light:1440x900,chromium:dark:1440x900,webkit:light:393x852,webkit:dark:393x852" node "$P/rig/focus-dense.mjs"
