# Implementation Report — cinematic signature candidate

**Status:** `DESIGN_EXPLORED` · `PROTOTYPE_IMPLEMENTED` · `VISUALLY_RENDERED` · `TESTS_PASSED` · `OWNER_REVIEW_PENDING` · `INTEGRATION_PENDING` · `NOT_DEPLOYED`

| | |
|---|---|
| **Candidate branch** | `claude/eloquent-planck-6yegy8` (the branch this cloud session was assigned; the brief's suggested name was taken as a suggestion, and no other branch was touched) |
| **Base** | `main` at `b3e992bddf31daa86a4d471b1c38ad47f45802e7`, verified against `origin/main` at session start |
| **Candidate commit** | the branch tip (recorded in the follow-up commit that writes this line; see `git log -2` on the branch) |
| **Implemented direction** | A, "The Gold Lands, the Paper Rises" (`CREATIVE_DIRECTION_A.md`) |
| **Alternative** | B, "The Plate", visual prototype only (`CREATIVE_DIRECTION_B.md`) |
| **Pull request** | none, by instruction. Nothing merged, nothing deployed. |

---

## 1. Exact modified files

| File | Change | Lines |
|---|---|---|
| `components/cinematic/CinematicDesert.tsx` | three refs (`veilRef`, `creditRuleRef`, `creditRef`); three tweens on the existing master timeline (credit rule, credit line, veil); the pin's children wrapped in `.cdesert-frame`; the veil element; the credit markup inside `.cdesert-title` | +73 / −2 |
| `components/cinematic/StaticDesertFrame.tsx` | the veil (rests landed via CSS) and the credit (rests resolved via `--resolved`) on the reduced-motion frame | +17 / −1 |
| `app/globals.css` | `.cdesert-title` becomes a column; a new block in the `.cdesert-*` range: `.cdesert-frame` + `cdesert-arrive`, `.cdesert-credit*`, `.cdesert-veil`, `.cinematic-content-reveal` + `::before`; one selector added to the existing print layer's chrome list | +140 |
| `components/cinematic/__tests__/CinematicDesert.test.tsx` | one new test: the static frame carries the credit (text, `aria-hidden`) and the landed veil | +19 |
| `design-reviews/cinematic-signature/2026-10-19/**` | this evidence package (reports, boards, frames, motion, prototype, probe output, harness) | new |

Not touched, per the brief: `app/work/[slug]/page.tsx`, `components/Hero.tsx`, `components/Receipt.tsx`, `content/deliverables.json`, `app/about/page.tsx`, `app/contact/page.tsx`, `app/float/page.tsx`, the homepage composition in `app/page.tsx`, global tokens, navigation, deployment config, `README.md`, `qa-reports/**`, `MOTION_SYSTEM.md`, `UI_SYSTEM.md` (a ready-to-paste §17 for `MOTION_SYSTEM.md` is in §6 below).

## 2. How it works

### 2.1 The opening light-up (`.cdesert-frame`)
Everything the pin holds (scene groups, grade, exposure, veil, title, grain) now sits in one absolutely-positioned wrapper. On the live path and only under `prefers-reduced-motion: no-preference`, the wrapper runs one keyframe, `cdesert-arrive`: opacity 0→1, scale 1.045→1, origin 50% 56%, `var(--dur-scene)` (1200 ms), `cubic-bezier(0.22, 0.9, 0.26, 1)`, fill both. At opacity 0 the pin's own warm dawn gradient shows (it already existed as the decode-flash fallback), so the frame lights up from a warm haze rather than from black. GSAP never targets the wrapper: the D5 breathe writes `scale` on the scene *groups*, which are its children, so the two transforms compose and cannot overwrite each other. The duration is a ramp token, so `duration-ramp.test.ts` stays green without a new survivor.

### 2.2 The credit (`.cdesert-credit`)
Inside `.cdesert-title`, after the mark: a rule `<span>` and a line `<p>` with `Skyler Halisky · Senior technical support`. The title container is now a flex column, so the mark keeps its exact position and the block grows downward onto the floor band. Two tweens on the master timeline: the rule `scaleX 0→1` at p 0.925 for 0.06 (`power2.out`), the line `opacity 0→1, yPercent 40→0` at p 0.94 for 0.06. The parent title's carve (opacity + blur) multiplies over both, so nothing can appear before the mark. Under 480 px the separator hides and name/role stack as two lines. The block is `aria-hidden` because the identical string is already in the accessibility tree twice on this screen (runway chip, hero nameplate). The static frame renders the same markup and `.cdesert-title--resolved` shows it at rest.

### 2.3 The veil (`.cdesert-veil` + `.cinematic-content-reveal::before`)
A full-frame layer at z 75 (above the finish layer's grain and vignette, so the bottom corners end clean), `background: linear-gradient(180deg, canvas/0 72%, canvas/0.18 82%, canvas/0.55 91%, canvas/0.92 98%, canvas calc(100% - 3px))` with `rgb(var(--rgb-canvas))`, so it melts into cream in light and into the night canvas in dark. GSAP scrubs its opacity 0→1 over p 0.88→1.0 (`sine.inOut`); `will-change: opacity` promotes it once. On the page side the content wrapper gets `position: relative` (no transform, so it stays a non-containing block for the fixed cues) and a `::before` of height `clamp(120px, 18vh, 200px)` fading canvas→transparent over the hero's landing pad. Its print rule lives in the existing single print block.

**The measured 1 px fact.** The promoted plane layers paint one device row past the pin's `overflow: hidden` clip at the release edge (probe: hiding the planes cleared the row; `clip-path: inset(0)` on the pin did not; extending the veil 2 px did). The veil therefore overshoots its box by `bottom: -2px` and reaches full canvas 3 px early, so the row the planes bleed into is owned by the veil at the page colour. Without this the seam carried a hairline of floor across the whole width (visible in the first candidate capture, fixed in the second).

## 3. Verification (summary; full detail in `TEST_RESULTS.md`)

- `npm run lint` clean · `npm run typecheck` clean · `npm test` after `npm run build` (the CI order, so the build-dependent guards ran) green, including the duration-ramp, token-parity, print-layer, recruiter-copy-truth, support-first-hierarchy and static-integrity guards · `npm run build` green.
- Headless Chromium checks on the static export at 1440×900, 393×852 (DPR 2) and 360×740 (DPR 2), light and dark: zero console errors or warnings, zero page errors, zero failed requests, zero element-level horizontal overflow across every captured frame; keyboard path, Skip intro, reduced motion, no-JS and an axe scan recorded in `a11y/report.json`.
- Bundle: homepage First Load JS unchanged at 172 kB; route chunk 51.4→51.6 kB; stylesheet +1.9 kB uncompressed; no new assets.

## 4. Integration notes and conflicts

- **Reduced-motion first-paint fix (parallel Opus work).** This branch does not touch `useReducedMotion`, the `animate`/`FORCE_STATIC` decision, or the static/live branch selection in `CinematicDesert.tsx`. The light-up is media-gated off under RM, and both frames carry the credit and veil, so whichever first-paint strategy the fix adopts (CSS-gating the live markup, rendering the static frame first, or a `data-` hook) will find the same visual in both. Expected merge surface: the JSX of `CinematicDesert.tsx` (the wrapper + two new blocks) and `StaticDesertFrame.tsx` (two blocks before the title). If the fix also wraps the pin's children, keep one wrapper and give it the `cdesert-frame` class.
- **Homepage / Flagstone / About / Contact trains.** No shared file is touched except `app/globals.css`, where every addition is inside the cinematic block or the single print block. A textual merge should be conflict-free unless another branch edits the lines immediately around `.cdesert-title` or the print chrome list.
- **Governance.** `MOTION_SYSTEM.md` §0 declares the intro locked and `designs/AESTHETIC_LOCKFILE.md` §6 says "no subtitle". This candidate deliberately reinterprets both, as the brief permits inside the isolated branch. If approved, the lock should be amended rather than silently broken; the §17 text below is written for that.
- **Static-integrity guards** read `./out/`; they ran against the candidate build and passed. The `reveal-floor` checks were unaffected because the veil and credit never set an inline `opacity: 0` on content; they are decorative, `aria-hidden` layers.

## 5. Performance considerations

- Two new composited layers (frame wrapper, veil), both opacity/transform only. The frame's animation ends after 1.2 s and holds `scale(1)`.
- The veil is promoted with `will-change: opacity` from mount; it is one full-frame buffer, the same cost the title already pays. If GPU memory on low-end phones is ever a concern, it can be promoted only inside its window by the existing `applyCull` pattern.
- LCP: the largest plane's first non-zero paint moves by one animation frame (opacity 0 at the first frame). Decode scheduling (`img.decode()` on mount) is unchanged.
- No new network requests; no font weights added (DM Mono 400 and the loaded Cormorant 300 are reused).

## 6. Ready-to-paste contract amendment (`MOTION_SYSTEM.md` §17, if approved)

> ## §17 — Cinematic signature (2026-10-19, Fable candidate) — the film finishes
>
> Three additions inside the locked film, all on its one timeline or one one-shot keyframe, all transform/opacity: **(1) the opening light-up** — `.cdesert-frame` settles opacity 0→1 / scale 1.045→1 on `--dur-scene`, CSS, `no-preference`-gated, never a GSAP target; **(2) the credit** — rule `scaleX` p[0.925,0.985] then `Skyler Halisky · Senior technical support` opacity/yPercent p[0.94,1.0] inside `.cdesert-title`, `aria-hidden` (the string is in the tree twice already), two lines ≤480 px; **(3) the handoff veil** — `.cdesert-veil` (canvas gradient, z 75, `bottom:-2px` for the measured one-row plane bleed) opacity p[0.88,1.0], answered by `.cinematic-content-reveal::before` (canvas→transparent over the landing pad). Reduced motion: (1) off; (2)+(3) at rest on the static frame. The seam is no longer gravity-only; it is gravity plus the same colour on both sides.

## 7. Recommendation

Approve **Direction A** for integration after the reduced-motion engineering fix lands, in this order: merge the RM fix to `main`, rebase this branch, re-run `npm run typecheck && npm test && npm run build`, re-capture the four seam frames (boards 01–04, row "THE SEAM") to confirm the 1 px row is still owned by the veil, then merge. If the owner prefers the editorial register of Direction B, say so before any of that; B is a day's work on top of this branch and replaces the veil with the plate contraction and caption.

## 8. Next step for the owner

Open `boards/00-side-by-side-board.jpg`, then boards 01, 03 and 07 for the full sequences and 08 for the alternative. Decide: **A as built**, **A with changes** (the three knobs are the veil's start p, the credit's copy, and the light-up's duration), or **B**. The branch is pushed and preserved; nothing reaches production until that decision and the integration steps in §7.
