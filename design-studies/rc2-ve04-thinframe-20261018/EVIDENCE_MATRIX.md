# Evidence matrix · RC2-VE04-COMP-01

Every row names a file in `captures/` or a record in `captures/manifest.json`. "Observed" means the value was read off a Chromium 141 render of the standalone prototype in this environment; "arithmetic" means computed from the token values; "pending" means not done in this study. Nothing here is a reading of the live site or a conformance claim.

Renderer: Chromium 141.0.7390.37 (pre-installed at `$PLAYWRIGHT_BROWSERS_PATH`), driven by the repository's own `playwright-core` devDependency; pixel reads via the repository's `sharp`; boards via system Pillow. Web fonts loaded in every render (Cormorant Garamond 300, DM Sans 300, DM Mono 400). No new browser or toolchain was installed.

## 1. Composition · settled state · study chrome hidden

| Viewport | Baseline (reconstruction) | Variant A | Variant B |
|---|---|---|---|
| 1440 × 900 light | `composition/comp_baseline_light_1440x900.jpg` | `composition/comp_A_light_1440x900.jpg` | `composition/comp_B_light_1440x900.jpg` |
| 1440 × 900 dark | `composition/comp_baseline_dark_1440x900.jpg` | `composition/comp_A_dark_1440x900.jpg` | `composition/comp_B_dark_1440x900.jpg` |
| 1920 × 1080 light | — | `composition/comp_A_light_1920x1080.jpg` | `composition/comp_B_light_1920x1080.jpg` |
| 1920 × 1080 dark | — | `composition/comp_A_dark_1920x1080.jpg` | `composition/comp_B_dark_1920x1080.jpg` |
| 393 × 852 light | `composition/comp_baseline_light_393x852.jpg` | `composition/comp_A_light_393x852.jpg` | `composition/comp_B_light_393x852.jpg` |
| 393 × 852 dark | `composition/comp_baseline_dark_393x852.jpg` | `composition/comp_A_dark_393x852.jpg` | `composition/comp_B_dark_393x852.jpg` |
| 375 × 667 light / dark | — | `composition/comp_A_{light,dark}_375x667.jpg` | `composition/comp_B_{light,dark}_375x667.jpg` |
| 320 × 568 light / dark | — | `composition/comp_A_{light,dark}_320x568.jpg` | `composition/comp_B_{light,dark}_320x568.jpg` |
| Matched A over B boards | | `composites/AvsB_light_1440.jpg` · `composites/AvsB_dark_1440.jpg` | |
| Phone boards (A and B at 393 / 375 / 320) | | `composites/phones_light.jpg` · `composites/phones_dark.jpg` | |
| Full documents with study chrome | `fullpage/fullpage_light_393x852.jpg`, `fullpage_light_375x667.jpg`, `fullpage_light_320x568.jpg`, `fullpage_dark_393x852.jpg` | | |

Observed geometry (manifest `geometry`): A frames at 312 / 676 / 1040 × 340 × 400 (1440), 540 / 904 / 1268 (1920); stacked widths 329 / 311 / 256 at 393 / 375 / 320; baseline plates 302 × 345 in a 652 px article. Observed overflow (manifest `overflow`): `scrollWidth` = `innerWidth` and zero elements past either edge at all ten theme × viewport combinations.

## 2. Window 01 detail · 1440 · device scale 2

| State | A light | A dark | B light | B dark | Baseline |
|---|---|---|---|---|---|
| Rest (settled) | `detail/w01_A_light_rest.png` | `detail/w01_A_dark_rest.png` | `detail/w01_B_light_rest.png` | `detail/w01_B_dark_rest.png` | `detail/w01_baseline_{light,dark}_rest.png` |
| Armed (prototype hold) | `detail/w01_A_light_armed.png` | `detail/w01_A_dark_armed.png` | `detail/w01_B_light_armed.png` | `detail/w01_B_dark_armed.png` | `detail/w01_baseline_{light,dark}_armed.png` |
| Full-bleed option | `detail/w01_A_light_bleed.png` | `detail/w01_A_dark_bleed.png` | `detail/w01_B_light_bleed.png` | `detail/w01_B_dark_bleed.png` | — |
| B2 warm caption rule | | | `detail/w01_B_light_rest_warm-rule.png` | `detail/w01_B_dark_rest_warm-rule.png` | |
| Edge specimen (corner, 4×) | `composites/edge-specimen_light.png` | `composites/edge-specimen_dark.png` | (same boards) | (same boards) | (same boards) |
| Play control at rest board | `composites/play-rest-board_light.png` | `composites/play-rest-board_dark.png` | | | |

Observed rest lines (pixel medians, `MEASUREMENTS.md` §Window 01): A light rgb(203 140 111) · B light rgb(220 179 156) · A dark rgb(103 65 45) · B dark rgb(86 56 39); the armed line is rgb(204 207 190) light / rgb(44 52 54) dark in all variants. The readings equal the token arithmetic in `colour-maths.md`. For the baseline crop the "surface beside" sample falls outside the crop and reads the line itself; its surface is the same token.

## 3. Play control and keyboard focus · 1440 · device scale 2

| Run | File | Observed |
|---|---|---|
| A light / dark, mat | `focus/focus_A_light.png`, `focus/focus_A_dark.png` | 2 Tabs to reach; `:focus-visible` true; ring 2 px solid accent, offset 2 px; ring : clip 2.33 light / 3.10 dark; Enter plays (webm), Enter pauses |
| B light / dark, mat | `focus/focus_B_light.png`, `focus/focus_B_dark.png` | same as A (the control is identical) |
| A light / dark, full-bleed | `focus/focus_A_light_bleed.png`, `focus/focus_A_dark_bleed.png` | pill 13 px from the frame edge; ring still distinct from the 1 px edge by weight; ring : clip as above |
| Baseline light / dark | `focus/focus_baseline_light.png`, `focus/focus_baseline_dark.png` | shipped placement (plate corner, over the mat edge): ring : clip 3.25 light / 4.32 dark |
| Boards | `composites/focus-board_light.png`, `composites/focus-board_dark.png` | |

Observed pill readings at rest: icon : pill 3.62 light / 6.65 dark (A, B), 4.05 / 6.81 (baseline); pill : clip 5.76 light / 1.52 dark (A, B), 8.98 / 1.12 (baseline).

## 4. Motion · prototype settle transition only

| Run | Trace (manifest `motion[].trace`) | Frames kept | Board |
|---|---|---|---|
| Baseline light / dark, 1440 | final value first reached ≈ 327 / 344 ms | `motion/beat_baseline_{light,dark}_1440x900_*.png` | `composites/beat-strip_baseline_{light,dark}.png` |
| A light / dark, 1440 | ≈ 333 / 348 ms | `motion/beat_A_{light,dark}_1440x900_*.png` | `composites/beat-strip_A_{light,dark}.png` |
| B light / dark, 1440 | ≈ 321 / 339 ms | `motion/beat_B_{light,dark}_1440x900_*.png` | `composites/beat-strip_B_{light,dark}.png` |
| A light, 393 (phone band) | ≈ 210 ms | `motion/beat_A_light_393x852_*.png` | (trace only) |

Method: from the armed state, `window.__study.triggerAndSample(id, 820)` flips the host to `settling` and records `getComputedStyle(frame).borderTopColor` on every animation frame; screenshots were taken concurrently and are time-stamped relative to the first screenshot (the trigger preceded it by one evaluate round-trip, typically under 20 ms; each capture window is 50–80 ms). "Final value first reached" is the first sample whose colour string equals the last. The lifecycle (consumption, hash, Back/Forward, reload, restored scroll, failsafe) was **not** exercised: MOTION_VERIFICATION_PENDING.

## 5. Modes

| Mode | Files | Observed |
|---|---|---|
| Reduced motion from first paint (A, B × light, dark) | `modes/rm_{A,B}_{light,dark}.png` | state `settled`, rest colour, `transition: none` |
| Reduced motion switched on mid-beat, then off (A, B light) | manifest `modes[]` sequences | at ~120 ms `settling` with an intermediate colour → RM on: `settled`, rest colour, no transition → RM off (+500 ms): still `settled`, rest colour, no replay |
| No JavaScript (A, B × light, dark; dark via injected class) | `modes/nojs_{A,B}_{light,dark}.png` | no `html.js`; rest colour painted although the markup still says `armed`; native `<video controls>`; no overlay button |
| `prefers-contrast: more` (A, B × light, dark) | `modes/contrast-more_{A,B}_{light,dark}.png` | neutral line token steps to `line-strong` (140 148 132 / 74 86 82); VE04 edge unchanged |

## 6. Arithmetic (no render involved)

`captures/colour-maths.md` and `colour-maths.json`: composited line colours, WCAG contrast ratios for lines, ring, text and the pill, CIEDE2000 distances (self-checked against the Sharma 2005 pairs: 2.0425 and 2.8615 reproduced exactly), and the dark B alpha candidates (0.24–0.40). Surface = `canvas-alt` token.

## 7. Pending

| Item | Status |
|---|---|
| Renders at the required viewports, themes, states | delivered (not RENDERED_PENDING) |
| Live-site baseline render | not possible from the environment; reconstruction labelled |
| VE04 lifecycle on the real component | MOTION_VERIFICATION_PENDING |
| Assistive-technology runs, human perceptibility of the beat | ACCESSIBILITY_REVIEW_PENDING |
| Adoption decision | OWNER_VERDICT_PENDING |

## 8. Reproduce

From the repository root after `npm ci` (the repository's declared dependencies; nothing else):

```
cd design-studies/rc2-ve04-thinframe-20261018
python3 -I tools/colour-maths.py captures/colour-maths.json > captures/colour-maths.md
node tools/capture.mjs            # or --only=comp,detail,...   (uses $PLAYWRIGHT_BROWSERS_PATH/chromium-1194 or $STUDY_CHROMIUM)
python3 -I tools/compose.py
```
