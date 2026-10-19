# Test Results — cinematic signature candidate

**Status:** `TESTS_PASSED` (project gates) · browser checks recorded · accessibility probe recorded (not a compliance claim) · `NOT_DEPLOYED`
**Build under test:** branch `claude/eloquent-planck-6yegy8`, working tree as committed; base `main` `b3e992b`. Node 22.22 in the cloud container (CI runs Node 24; nothing here is version-sensitive).

---

## 1. Project gates (the CI order: build first, so the build-dependent guards run)

| Gate | Command | Result |
|---|---|---|
| Lint | `npm run lint` | ✔ No ESLint warnings or errors (the `headers` export notice is pre-existing and expected under `output: 'export'`) |
| Typecheck | `npm run typecheck` | ✔ clean |
| Build | `npm run build` (prebuild asset validation, postbuild prune + OG alias) | ✔ 28 static pages, exported |
| Tests | `npm test` after the build | ✔ **108 files · 957 passed · 2 skipped · 0 failed** |

The two skips are pre-existing, environment-gated cases inside `static-integrity.test.ts` and `recruiter-copy-truth.test.ts` (they skip identically on `main`; nothing in this branch added a skip, disabled a test or changed an assertion). One test was **added**: `CinematicDesert.test.tsx` › "static frame carries the signature candidate: the credit under the mark and the landed veil".

Guards specifically exercised by this change, all green: `duration-ramp` (the light-up uses `--dur-scene`, no new literal), `token-parity`, `print-layer` (the page-side fade's print rule lives inside the single print block), `recruiter-copy-truth`, `support-first-hierarchy`, `smart-punctuation`, `static-integrity` (reveal-floor, links, images against the candidate `out/`), `section-nav-anchors`, `ContentReveal`, `IntroScrollCue`, `RunwayIdentityRelease`, `RailInert`, `ViewTransitions`.

During development one regression was caught and fixed before commit: a second `@media print` block (my first draft of the page-side fade's print rule) failed `print-layer.test.ts`'s "single print rule" contract; the rule was folded into the existing block.

## 2. Bundle and asset weight

| Measure | `main` | candidate |
|---|---|---|
| `/` First Load JS | 172 kB | 172 kB |
| `/` route chunk | 51.4 kB | 51.6 kB |
| Stylesheet (uncompressed) | 98,661 B | +1.9 kB |
| New images / fonts / dependencies | — | none |

## 3. Browser checks (headless Chromium 1194, static export served locally; `harness/capture.mjs`)

Six viewport/theme configurations: 1440×900 light + dark (DPR 1), 393×852 light + dark (DPR 2, mobile emulation), 360×740 light + dark (DPR 2). Per configuration: 9 settled frames through the film (p = 0 … 1, scrub catch-up waited out) + 4 past the release, plus a 12 s recorded scroll-through at 1440 and 393.

| Check | Result |
|---|---|
| Console errors / warnings | **0** in all 6 configurations and both recordings |
| Page errors (uncaught exceptions, hydration) | **0** |
| Failed requests | 1 transient `requestfailed` on a Next.js router prefetch (`/work/flagstone/index.txt?_rsc=…`) in one configuration of one run; the file exists in the export and the same prefetch succeeded in every other run and configuration. Not reproducible, unrelated to the change. |
| Element-level horizontal overflow (non-hidden boxes crossing the viewport edge) | **0** in all frames |
| Hydration | production React logs no minified hydration errors (#418/#423) in any run |

## 4. Accessibility probe (`harness/a11y.mjs`; output in `a11y/` and `manifests/a11y-report.json`)

This is an instrument reading, not a conformance statement. Human review of the renders is in `BEFORE_AFTER_VISUAL_REVIEW.md`.

| Check | Desktop 1440 | Phone 393 |
|---|---|---|
| Keyboard path from the top (Tab ×6) | Skip to main → **Skip intro** → See the work → Explore projects → method → evidence. Focus ring visible on every stop (`solid 2px rgb(185,99,64)`). | Skip to main → menu button → **Skip intro** → See the work → Explore projects → method. Rings visible. |
| Skip intro (pointer) | visible at the top; click lands with the hero identity block fully in view (top 202 px), focus moved to `#hero`, control retired | same (identity top 135 px) |
| Reduced motion (`prefers-reduced-motion: reduce`) | static frame rendered, no pin; credit resolved (`opacity 1`, text `Skyler Halisky · Senior technical support`); veil landed (`opacity 1`); no light-up animation exists on that path | same |
| No JavaScript | hero identity visible (`opacity 1`), Skip intro visible, light-up runs (CSS). The wordmark/credit stay at opacity 0 on the live markup without JS, exactly as the wordmark did before this change (it is GSAP-driven). | same |
| axe-core 4.11 (WCAG 2.x A/AA tags) at the opening frame and at p = 1 | **0 violations** | **0 violations** |
| Credit line contrast at p = 1 (bone `#FFF6EC` vs sampled background luminance inside the credit's box; p90 = brightest non-glyph ground, worst case) | median **7.12:1**, worst-case **5.03:1** | median **7.56:1**, worst-case **4.88:1** |

Both worst-case readings clear 4.5:1 for the 11–12.5 px mono line. The measurement samples the rendered halation, which is the same recipe the wordmark's AA case relies on.

## 5. Reduced-motion and the parallel engineering fix

Not tested here: the reduced-motion **first-paint** behaviour that the separate Opus assignment is repairing. This branch does not change `useReducedMotion`, `FORCE_STATIC`/`animate`, or the static/live selection, and the light-up is media-gated off under `reduce`, so the candidate adds no new first-paint path. `IMPLEMENTATION_REPORT.md` §4 lists the expected merge surface.

## 6. What could not be run

- No real-device or GPU-accelerated run: the container's Chromium is software-rendered, so scroll smoothness and frame pacing are not measured (the choreography and layer discipline are; see `MOTION_REVIEW.md`). The repo's own `check:overflow` instrument needs the version-matched Playwright browser and was not run; the harness's element-level overflow probe (same principle) ran in its place.
- No Lighthouse / CWV measurement (the brief flagged it as a pre-existing UNVERIFIED carry-forward; nothing here changes the asset path).
- Safari and Firefox were not available. The one browser-specific finding (the compositor's one-row plane bleed at the release edge) is handled in a way that is inert where the bleed does not occur.

## 7. Reproduce

```
npm ci && npm run build
node design-reviews/cinematic-signature/2026-10-19/harness/serve.mjs ./out 3101
node design-reviews/cinematic-signature/2026-10-19/harness/capture.mjs --base http://localhost:3101 --out /tmp/cs/candidate --video
node design-reviews/cinematic-signature/2026-10-19/harness/opening.mjs --base http://localhost:3101 --out /tmp/cs/candidate/opening-desktop
node design-reviews/cinematic-signature/2026-10-19/harness/a11y.mjs    --base http://localhost:3101 --out /tmp/cs/a11y
# the original: check out main, build, serve on 3100, repeat with --out /tmp/cs/baseline
node design-reviews/cinematic-signature/2026-10-19/harness/frames.mjs  --video <webm> --out <dir> --mp4 <file>
node design-reviews/cinematic-signature/2026-10-19/harness/make-boards.mjs --evidence /tmp/cs --out /tmp/cs/boards/spec.json
node design-reviews/cinematic-signature/2026-10-19/harness/boards.mjs  --spec /tmp/cs/boards/spec.json --out /tmp/cs/boards
```
The harness uses `playwright-core` (a devDependency) with the container's Chromium at `/opt/pw-browsers/chromium`; set `executablePath` for another machine.
