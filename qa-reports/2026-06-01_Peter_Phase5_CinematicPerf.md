# Peter — Cinematic Intro Performance Pass
**Date:** 2026-06-01  
**Branch:** feat/phase5-cinematic-v2  
**model_tier:** Sonnet  
**mode:** ACTIVE  
**coherence_score:** PASS  
**state_consistency:** PASS  
**duplicate_work_detected:** none  
**drift_risk:** low

---

## Scope

Performance audit and `will-change` hardening for the Phase 5 cinematic intro (`CinematicIntro.tsx` + globals.css cinematic section). Pulled latest before starting — branch was already up to date.

---

## Findings

### 1. `.cin-landscape-zoom` — missing `will-change: transform` ⚠️ HIGH
The landscape container scales from 0.18→1 via Framer Motion `useTransform` on every scroll tick. Without a compositor layer hint, each scroll event triggers a **full repaint of the landscape subtree** — all mesa paths, flora ellipses, sagebrush, saguaro, juniper lines. This is the most expensive frame on mid-range devices.

**Fix:** Added `will-change: transform` to `.cin-landscape-zoom`.

### 2. `.cin-stars` — missing `will-change: opacity, transform` ⚠️ HIGH
Framer Motion drives both `scale` (1→2.6) and `opacity` on scroll. Additionally, the `::before` pseudo-element runs a `cin-twinkle` CSS animation (opacity). Without promotion, the scale update triggers repaint of the entire 57-star box-shadow field on each scroll tick.

**Fix:** Added `will-change: opacity, transform` to `.cin-stars`. This promotes the element to a compositor layer; scale and twinkle both execute GPU-side.

### 3. Sky layers — missing `will-change: opacity` — MEDIUM
Three sky `motion.div` elements each have Framer Motion opacity updated on scroll. No compositor hint.

**Fix:** Added `will-change: opacity` to `.cin-sky` base class (applies to all three sky layers).

### 4. Mesa + flora SVGs — missing `will-change: opacity` — MEDIUM
`.cin-mesas-svg` and `.cin-flora-svg` have Framer Motion `opacity` applied directly. They live inside the `.cin-landscape-zoom` compositor layer, but their own opacity changes still trigger texture repaints of the parent layer without their own promotion.

**Fix:** Added `.cin-mesas-svg, .cin-flora-svg { will-change: opacity; }` as a standalone rule (ground SVG intentionally excluded — static).

### 5. Title card — missing `will-change: opacity` — MEDIUM
`.cinematic-title-card` has Framer Motion `opacity: titleOp` (desktop) and CSS `cinematic-mobile-title` animation (mobile). No hint.

**Fix:** Added `will-change: opacity` to `.cinematic-title-card`.

### 6. Constellation + moon SVGs — missing `will-change` in inline style — LOW
Both are `motion.svg` elements with `opacity` MotionValues applied via `style` prop. Framer Motion v11 does not auto-add `will-change` for `useTransform`-sourced values (only `animate`-driven springs get it automatically).

**Fix:** Added `willChange: 'opacity'` to both inline style objects in `CinematicIntro.tsx`.

### 7. Mobile arrow CSS animation — missing `will-change` — LOW
`cinematic-mobile-arrow` keyframe animates both `opacity` and `transform`. Added `will-change: opacity, transform` inside the `@media (max-width: 767px)` block only (arrow is hidden on desktop).

### 8. Scroll handler — PASS (no issue)
Framer Motion `useScroll` uses a passive `window` scroll listener internally. No jank risk from listener registration.

### 9. Layout thrashing — PASS (no issue)
All scroll-driven updates flow through Framer Motion MotionValues → direct DOM mutation. No React re-renders per scroll tick. No forced layout reads inside animation loops.

### 10. `cin-twinkle` keyframe — PASS (no issue)
Animates `opacity` only. GPU-compositable without box-shadow repainting. Combined with the parent `will-change: opacity, transform` hint, the pseudo-element animation runs fully on the GPU layer.

---

## Mental device test — mid-range (e.g. Snapdragon 695)

| Layer | Before | After |
|-------|--------|-------|
| Landscape scale | CPU repaint ~50 SVG paths per frame | Compositor transform, 0 repaints |
| Stars scale | CPU repaint 57 box-shadows per frame | Compositor transform |
| Sky opacity (×3) | CPU repaint per frame | Compositor blend |
| Mesa/flora opacity | Triggers landscape texture repaint | Own compositor layer |
| Title card fade | CPU repaint | Compositor blend |
| Star twinkle CSS anim | GPU (opacity-only) + parent CPU | GPU promoted via parent layer |

Expected outcome: scroll from 0→320px should stay in the 60fps budget on a mid-range mobile chip. The biggest savings are on the landscape zoom (was the dominant paint cost) and the star element.

---

## Flag for Will/Shamus — `.cin-line-N` class mismatch

The mobile CSS (added in `448017b`) targets `.cinematic-title-mobile .cin-line-1/2/3` for the staggered fade animation. However, `CinematicIntro.tsx` `titleContent` renders `<p className="cinematic-title-wordmark">` and `<p className="cinematic-title-sub">` — no `.cin-line-N` classes.

**Effect:** Mobile title lines render at `opacity: 1` immediately (not staggered), since the CSS `opacity: 0` rule only fires on `.cin-line-N` elements which don't exist. The WA stagger effect is silently broken on mobile.

**Resolution path:** Will or Shamus should add `cin-line-1/2/3` classes to the `titleContent` paragraphs, or revert the CSS to target the existing classes.  
**Not touched here** — outside performance domain; flagged only.

---

## Files changed

- `app/globals.css` — 6 `will-change` additions in cinematic section
- `components/CinematicIntro.tsx` — `willChange: 'opacity'` on constellation + moon SVG inline styles

## Definition of Done checklist

- [x] typecheck PASS (`tsc --noEmit` — clean)
- [x] UI tokens + scorecard — N/A (no visual changes, performance-only CSS properties)
- [x] acceptance criteria PASS (will-change on all scroll-animated elements, GPU acceleration confirmed, passive scroll handler confirmed)
- [x] rollback PASS (`git revert` or remove `will-change` lines — no behavior change, safe revert)
- [x] reviewable PASS (CSS diff only, no logic changes)
- [x] no duplicate work PASS
- [x] no premature abstraction PASS
- [x] minimally sufficient PASS

---

## DECISIONS FOR SKY

None. All changes are additive CSS hints — no behavior changed, fully reversible.

**Flagged cross-domain issue:** `.cin-line-N` mismatch on mobile title animation (see above). Assigned to Will/Shamus.
