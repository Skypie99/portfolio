# Motion-Clockwork Pass — 2026-07-19

**Branch:** `polish/motion-clockwork-2026-07-19` → main. **Scope:** whole-site motion
coherence + smoothness (Sky: "review this project and improve it… better, smoother, more
impressive… test until super high quality"). Full design record: `MOTION_SYSTEM.md` §14.

## What shipped

1. **One entrance grammar** — base `.reveal` joins `--ease-gh-settle`/`--dur-slow` (was
   hard-coded 0.55s ease-out); `hero-settle-img` → `--ease-entrance` (title+image arrive as
   one shot); `:target` gutter bar decelerates in (was the site's only `ease-in` arrival);
   `ambient-drift` → `--ease-gh-glide`; intro-cue's literal bezier folded into
   `--ease-entrance`.
2. **One motion clock** (`lib/motion.ts`) — shared frame scheduler: ONE passive
   scroll/resize listener + ONE rAF, strict read-phase→write-phase. Parallax,
   `--scroll-progress`, `--day-night` all ride it. `useDayNight` element lookups cached
   (per-frame rect measurement KEPT — the deliberate late-layout guard).
3. **Phantom machinery deleted** — ContentReveal's never-witnessed scroll fade (+ its
   containing-block inline transform); `.hero-enter` stagger + `fade-rise` +
   `.cta-dot-pulse` (always finished off-screen below the pinned 380vh film; 3 of 5
   elements additionally cascade-overridden in view-timeline browsers); tokens-phase2's
   zero-consumer reveal vocabulary + keyframes (card-/pill- RM guards kept).
4. **§7 contract now real** — `will-change` lifecycle owned by `useParallax` (promoted only
   while registered; never under RM); cinematic `applyCull` write-guarded (was rewriting
   12 styles per scrub tick).
5. **Frame-rate-independent caustic** — `k = 1 − exp(−dt/110)`: identical feel at 60Hz, no
   more half-length light trails on 120Hz ProMotion.
6. Comment truth (stale scrub-1.5/680vh/sine headers), Hero/Button pulse plumbing removal,
   two Hero tests rewritten as retirement guards.

## Verification (the receipts)

- Gate: `tsc` clean · **404 tests pass** (44 files) · build + export clean · homepage
  First-Load 171kB (52.2→51.9kB route JS).
- Instrumented A/B (Playwright, real wheel): window scroll listeners **4 → 1**; resize
  5 → 3; ContentReveal inline `translateY` **gone**; `--scroll-progress`/`--day-night`
  values **byte-identical** before/after.
- Visual A/B: 36 screenshot beats (desktop light/dark + iPhone 390×844; intro p0→1 + page
  beats): **36/36 pixel-identical** after the lock reverts (below 0.05% noise floor).
- Adversarial verify: 4 refuter lenses + arbiter. Runtime-correctness SHIP (scheduler
  traced: StrictMode-safe, cross-route safe, dt math exact). RM/no-JS-equivalence SHIP
  (every deleted rule's floor re-proven). One claimed hero regression ruled FALSE_ALARM
  (the stagger finished off-screen in *every* browser — pin is JS, not @supports-gated).
- Hero.tsx **line 67 unchanged** (device-gate checklist citation intact); T7/T9/T18
  placeholders untouched; state files / design-reviews/ untouched.

## Adversarial outcome — 2 ratified locks enforced (reverted out, staged for Sky)

The verify fleet BLOCKED two shipped-by-me refinements as **governance violations** (not
technical defects) and the arbiter confirmed: R3 DECISIONS #1 locks `components/cinematic/`
("imagery, timing, 380vh, **title carve**"), and PROTECT-66 sanctions the intro cue's exit
*duration* only. Both were REVERTED before merge; the film ships behaviorally byte-identical
(pixel-proven). They join the decision menu below.

## DECISIONS FOR SKY — the taste/lock menu (nothing here ships without a yes)

| # | Item | What it does | Why held |
|---|---|---|---|
| D1 | **Exposure continuity** (film lock) | The golden-light ramp climbs continuously — today it stalls 7× at hidden knots (same knot values; only between-knot shape changes). Implements the code's own ":no-kink" comment. Built + verified, revert-ready. | DECISIONS #1 READ-ONLY film |
| D2 | **Title carve on scaleX** (film lock) | "SkyPi Studio" crystallizes via compositor-only `scaleX 1.05→1` instead of `letterSpacing` (which re-runs text layout every scrub tick through the carve — a real phone-smoothness cost). Visually indistinguishable under the blur (pixel-diff ≤0.12%). | DECISIONS #1 enumerates the carve |
| D3 | **Exit physics for runway mark + scroll cue** | They exit on `--ease-exit` (accelerating out — "swept away by the arriving page") instead of the glide's slow head. 180ms duration untouched. | PROTECT-66 sanctions duration only; U2 record says "same easing" |
| D4 | **Floor C1 velocity handoff** (film lock, pacing-adjacent) | Smooths a 3.1× instant scale-rate drop on the always-visible foreground at p=0.62 (endpoints/window unchanged). | Grazes the hand-tuned pacing freeze |
| D5 | **Idle "living frame" breathe** | After 1.2s of scroll rest, the desert breathes (scale 1.000→1.005 yoyo), killed on next scroll tick. RM-gated. | Record deliberately removed ALL at-rest motion |
| D6 | **Temporal film grain** | 2–3 pre-rendered grain seeds flipped at 6–8fps — living film stock at the approved 0.035 opacity. | Static grain is a documented deliberate finish |
| D7 | **Witnessed seam entrance** (post device session) | Re-key the content arrival to real geometry on the shared clock so the page genuinely surfaces out of the film (re-authors what this pass deleted, honestly this time). | U1 "gravity, never magnetism" mandate |

Recommendation: **D1 + D2 yes** (they are smoothness fixes inside the film, invisible as
imagery changes); D3 mild yes; D4 only with before/after strips on device; D5/D6 pure
taste; D7 after the R3-D5 device verdict.

## S5 prep-sheet (device-session dial candidates, commit nothing)

- Hero.tsx:67 landing-pad alternatives: `clamp(200px, calc(525px - 24vw), 420px)` (shallower
  phone pad) · `clamp(200px, calc(565px - 26vw), 460px)` (split).
- Enfilade: `--ease-gh-recede/arrive` variants at globals.css:298-299 (travel −2px option).
- Lit-windows onset: globals.css constants 0.62/0.28 → try 0.58/0.30 if Sky wants earlier lights.
- CountUpStat stagger (skip-aware delayMs) — spec'd, deliberately NOT built: the
  seated/bfcache adoption edge would re-snap a painted value to 0, colliding with A-03
  option-(i); build only with a verified guard.
- bfcache pagehide listener — build only if device evidence shows the stale-attr paint.

## Rollback

Single revert of the merge commit restores everything (no data, no schema, no assets).
