# Creative Release 7: the two final refinements (R7-VIS-01, R7-VIS-02), 2026-10-23

**Result: both corrections land, verified locally. Nothing pushed, merged or deployed.**

| | |
|---|---|
| Baseline | `f0dec85b8990772a1f280a0975ab27a7b9c87002` (unchanged) |
| Product commit | `refine(home): keep the flagship status off a lone "2026" and centre the detail tag when stacked` (parent `f0dec85`) |
| Branch | `r7-final-two-css-fixes` (local) |
| Source of the findings | Independent visual acceptance of `f0dec85`, verdict REFINEMENTS REQUIRED (minor, CSS-only). Owner approved both corrections 2026-10-23. The owner states that review ran on Claude Opus; its own receipts name Claude Fable 5.1. Both are recorded here as given. |
| Implemented and verified by | Claude Opus 5.5 (the session began on Claude Fable 5.1 for read-only evidence intake and moved to Opus 5.5 before any write) |

## The two changes (product diff: 4 files, +21 / -2)

- **R7-VIS-01, status orphan.** `app/page.tsx`, the flagship status paragraph, adds `text-pretty` (the existing `globals.css` utility, already used across the file). Engines without `text-wrap: pretty` keep the f0dec85 rendering.
- **R7-VIS-02, stacked label alignment.** `components/exhibitDetail.module.css` adds `.tag { text-align: center }` beside `.caption`, and `.tag { text-align: start }` inside the side-by-side `@media (min-width: 1024px) { @container (min-width: 20em) }` block. `components/ExhibitDetail.tsx` applies `styles.tag` to the detail tag.
- **Tests.** `app/__tests__/flagship-exhibit.test.tsx` gains three assertions: the status class and the two `.tag` rules. With the source fixes reverted, all three fail; with them, they pass.

Built CSS against f0dec85, rule by rule: the only differences are the two `.exhibitDetail_tag` rules. No image, token, colour, motion or copy changed.

## Measured (Chromium unless marked; before = the preserved f0dec85 `out/`, after = this commit's build)

| Width | Status lines, before | Status lines, after |
|---|---|---|
| 1440 | 1 | 1 (unchanged) |
| 1280 (light, dark, reduced motion, no JS) | "…Sept" / **"2026"** | "…US and Canada ·" / "Sept 2026" |
| 1280 WebKit | "…Sept" / **"2026"** | "…US and Canada" / "· Sept 2026" |
| 1180 | "…Canada ·" / "Sept 2026" | unchanged |
| 1024 | "…US" / "and Canada · Sept 2026" | unchanged |
| 768 | 1 | unchanged |
| 393 | "…Canada ·" / "Sept 2026" | unchanged (WebKit: "…US and" / "Canada · Sept 2026") |
| 320 | "…US and" / "Canada · Sept 2026" | unchanged |

Detail tag, text extent against the plate (caption against the screen for comparison):

| Width | Before: tag centre minus plate centre | After | Caption centre minus screen centre |
|---|---|---|---|
| 768 | -46.3 px (left-aligned) | 0.0 px | 0.0 px |
| 393 | -21.3 px | 0.0 px | 0.0 px |
| 320 | -25.5 px | 0.0 px | 0.0 px |
| 1024 to 1440 | flush with plate left edge | unchanged | caption stays right-aligned |

Unchanged in every frame (14 width and theme frames, 3 reduced-motion, 2 no-JS, 2 focus, 2 WebKit): room height, plate, frame, screen, heading and CTA boxes, every other copy line's wrap, no horizontal overflow, no page errors. Leader visible side by side and hidden stacked, as before.

Accessibility (the candidate's own instruments, `creative-release7-flagship-detail-2026-10-22/tools/a11y-room.mjs` and `creative-release7-refinement-2026-10-23/tools/contrast-scroll.mjs`): axe 0 violations page and room, one keyboard stop, 0 hidden focusables, at 1440 / 1280 / 768 / 393 in both themes, identical before and after. Contrast over scroll: all 12 rows (6 widths × 2 themes) identical before and after; minimum 4.88:1 light, 4.91:1 dark. Keyboard focus on "View project": `:focus-visible`, 2 px solid ember outline, 2 px offset, both themes.

Pixel diffs and their limits: at 1440 and 1180 before and after are pixel-identical; at 1280 the only change is the status row; at 768 light and 320 the only change is the tag row. Whole-room diffs in some phone frames are capture noise (f0dec85 against itself differs by the same amount, from fixed chrome caught mid-scroll). The WebKit 1280 diff also covers the two capture images, whose files are byte-identical across builds: rasterisation, not content.

## Checks run

`npm run typecheck` pass · `npm run lint` pass (0 warnings) · `npm run build` pass · `npm test` after the build: 127 files, 1,176 passed, 2 skipped (the two permanent placeholder skips, unchanged).

## Not verified here

- CI on GitHub (runs on push; nothing pushed).
- Native Safari and VoiceOver on a real iPhone, iPad and Mac: GitHub issue #38 stays open. Playwright WebKit is not Safari.
- Firefox (ignores `text-wrap: pretty`, so it keeps the f0dec85 status break at 1280).

## Evidence

`creative-release7-final-refinements-2026-10-23/`: `frames/` (before / after crops at 1280 copy column, light and dark; 768, 393 and 320 stage), `data/measurements.json` (every frame, word-per-line), `data/investigation.json` (text-extent alignment, determinism, no-JS boxes), `data/pixel-diff.json`, `data/a11y-*.json`, `data/contrast-scroll-*.json`, `tools/` (the capture scripts; they read Playwright from an existing install and serve both exports on loopback). The complete frame set, logs and the archive recovery receipt are preserved off-repo on the Lexar drive (`Task Outputs/SkyPi-R7-Final-Refinements-v1-20261023/`).
