# Flagstone final polish — QA receipt

## Candidate

- Baseline: `58237cdc9f600659d9b4bf76f515d13bc952a72c`
- Branch: `codex/flagstone-final-polish-20260901`
- Implementation commit: `a4584fdeaddd3b33dfceb850651d330470d40f2c`
- Scope: Flagstone evidence refresh, homepage identity/project links, removal of the homepage Flagstone quote, and removal of the decorative hero spine requested in the supplied screenshot.

## What changed

- Replaced only Flagstone's first motion slot with the supplied current reporting flow. It begins at the Explore map, enters the report form, moves through category selection, and returns to the map.
  - MP4: `public/showcase/flagstone/clips/report-flow-current.dark.phone.mp4` — H.264, 780×1378, 15.02 seconds, 716,526 bytes.
  - WebM: `public/showcase/flagstone/clips/report-flow-current.dark.phone.webm` — VP9, 780×1378, 15.02 seconds, 1,159,067 bytes.
  - Poster: `public/showcase/flagstone/clips/report-flow-current.dark.phone-poster.avif` — AV1/AVIF, 780×1378, 21,402 bytes. WebP and JPG fallbacks are also present.
  - All shipped derivatives are below the 3 MB target and contain no audio stream. The original MOV remains outside the repository and is not served.
- Kept the existing poster-first, silent, reduced-motion and play/pause behavior through the shared `ThemedMotion` component. The new Flagstone card uses the existing dark mono matte and the reporting-card aspect ratio.
- Reworked the shared homepage identity pill into the exact three lines: `SKY HALISKY`, `TECHNICAL SUPPORT`, and `AI-ASSISTED BUILDER`.
- Removed the homepage-only Flagstone pull quote and its `FROM WHAT WENT WRONG` attribution. The Flagstone case-study section remains intact.
- Added an always-visible `VIEW PROJECT →` action for every homepage work-index row. Project titles remain the single keyboard-tab destination; the duplicate visual action is intentionally removed from the tab order and has a clear accessible name.
- Removed the non-functional vertical line-and-dot ornament from the desktop hero, matching the user-supplied screenshot.
- Updated the generated-data wiring and the exact capture-date guard so that rebuilding does not reintroduce older Flagstone evidence or stale capture metadata.

## Visual evidence

- `qa-reports/2026-09-01_FlagstoneFinalPolish/home-desktop.png` — desktop hero with the three-line identity pill and no decorative spine.
- `qa-reports/2026-09-01_FlagstoneFinalPolish/home-project-links-desktop.png` — all five rest-visible work-index actions.
- `qa-reports/2026-09-01_FlagstoneFinalPolish/flagstone-motion-mobile.png` — phone-width current reporting-flow motion card with its visible pause control and `CAPTURED 2026-09-01` date.

## Gates

| Check | Result |
| --- | --- |
| `npm test` | PASS — 83 files passed, 1 skipped; 730 tests passed, 54 skipped. |
| `npm run typecheck` | PASS. |
| `npm run lint` | PASS — no ESLint warnings/errors. Next.js reports its existing `next lint` deprecation and static-export headers warning. |
| `npm run build` | PASS — production static export completed; asset validator found all 107 declared deliverable proof siblings. |
| `npm run test:static` | PASS — 53 tests passed, 1 skipped. |
| `git diff --check` | PASS. |
| New-em-dash diff scan | PASS — no added public em dashes. |
| Browser review | PASS — desktop 1440×1000 and phone 375×812 reviewed locally; no console errors, no visible element-level horizontal overhangs on `/` or `/work/flagstone/`. |

The repository's standalone `npm run check:overflow` gate could not start its static fixture because the baseline references a missing `design-reviews/showcase-refresh/tools/static-serve.mjs` helper. It therefore does not provide a passing whole-site result. The targeted element-level browser census above is the available evidence for the two changed routes; it is not a substitute for repairing that unrelated baseline gate.

## What is left

- No source, validation, or evidence work remains in this scope.
- No deployment, release-status change, App Store action, merge, or push was performed.

## DECISIONS FOR SKY

No product decision is required. Review the local implementation commit and this QA receipt before merging; the alternative is to leave the prior motion evidence and decorative hero treatment in place. Impact of merging is limited to the portfolio branch described above.
