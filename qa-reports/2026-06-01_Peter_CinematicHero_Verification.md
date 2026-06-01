# Peter — Cinematic Hero pre-merge verification

**Branch:** `feat/auto-2026-06-01-cinematic-hero`
**Commits in scope:** `097924a` (spec) → `779b084` (build) → `f545608` (Dani compile) → `df8bb4a` (Shamus polish)
**Build:** clean. Homepage `8.2 kB` / `155 kB` First Load JS. Total `out/` = **3.1 MB** (`_next/static/` = 1.2 MB).
**Dev verification stack:** Headless Chrome 148 via CDP, 1440×900 desktop + 375×812 mobile, hydration polled until `.cinematic-wrapper-200vh` mounted (`docH=10024`, `wrapH=1800` on desktop).

---

## Desktop scroll-keyframe verdicts (1440×900)

Scroll positions computed as `Math.round(vh × factor)` over a 1800px cinematic budget.

| Keyframe | scrollY | Verdict | What the screenshot shows vs Dani §4 spec |
|---|---|---|---|
| **t=0.00** (Pre-dawn night) | 0 | **PASS** | Crescent moon top-center, deep-indigo→purple sky, road stripes receding to vanishing point, twilight mesa silhouettes right-side, "Scroll to begin" hint. Left rail static (Sky Halisky / Eyebrow / Available / AccessMap / Dispatches / Write to me / © 2026). Matches spec Act 1 opening. |
| **t=0.25** (Dawn breaking) | 450 | **PASS** | Sun cresting horizon dead-center, sky warming through beige to soft terracotta, mesa silhouettes warming to umber, road in deep umber descent, power-line poles emerging mid-right, skip link "Skip to the work ↓" visible bottom-right (skip-link reveal at t≥0.18 confirmed). Matches Act 1 → Act 2 transition. |
| **t=0.50** (Mid-glide, mesas growing) | 900 | **FAIL — BLOCKER** | Right pane is **entirely cream (empty)** — the cinematic scene has detached and scrolled off the viewport. Left rail remains, but the scene has vanished. Spec expects: warm dawn sky, mid-mesa emerging at full opacity, road expanding through center. **None visible.** |
| **t=0.75** (Rock face approaching, road sliding off) | 1350 | **FAIL — BLOCKER** | Hero copy ("PORTFOLIO — 2026" eyebrow + "An accessibility map. A multi-" heading) is partially visible. A faint warm gradient blob bleeds top-right (residual sky background). The rock face that should be approaching/dominating is absent — Hero has taken over the viewport prematurely. |
| **t=0.97** (Rock face dominant, title resolved) | 1755 | **FAIL — BLOCKER** | Hero fully resolved ("An accessibility map. A multi-agent system. A Pac-Man trainer. Built in public. Documented from the first commit. Four products live. All open source. SEE THE WORK"). **The cinematic title card "SkyPi Studio" is never displayed at any scroll position.** Title resolve at t=0.82–0.95 never appears on screen. |

### Root-cause analysis of the BLOCKER

The 200vh wrapper (`<div className="cinematic-wrapper cinematic-wrapper-200vh">`) has both classes:
- `.cinematic-wrapper` → `height: calc(100vh + 500px); overflow: hidden;`
- `.cinematic-wrapper-200vh` → `height: 200vh;` (overrides height, **inherits `overflow: hidden`**)

Inside it: `<div className="cinematic-scene">` with `position: sticky; top: 0; height: 100vh;`.

With sticky child = 100vh inside a 200vh wrapper, **the sticky releases at scrollY = wrapperHeight − stickyHeight = 1800 − 900 = 900px** (CSS sticky semantics — child sticks while there is room to slide; once the bottom of the child reaches the bottom of the wrapper, it detaches). Verified live via CDP: at scrollY=900, `cinematic-scene` had `getBoundingClientRect().top = -900` (i.e., already scrolled off the top).

But the `useScroll` target is the wrapper with offset `['start start', 'end end']` — so the scroll budget (`t ∈ [0,1]`) maps to the full 1800px of scroll. **The title-card resolve at eased-t 0.82→0.86 lives in the second half of the wrapper, after the sticky has detached.** It animates correctly in motion values, but on a scene that has already scrolled off-screen.

Net effect: the cinematic plays from `t=0` (raw 0) through roughly `t=0.5` (raw 900) — half the spec'd budget — then the scene detaches and the body content (Hero) scrolls up underneath. The title card "SkyPi Studio" never lands in the viewport.

**Fix options for Shamus:**
1. Make the sticky child a single inner `<div>` of 200vh (matching wrapper), and re-anchor the visible viewport region inside it. Each layer's transforms still drive against `t`; only the layout container needs to grow.
2. Change wrapper height to `100vh` and sticky child to `100vh` — but then the scroll budget collapses to 0 and the scene never animates. (Not viable on this geometry.)
3. Pin the wrapper with `position: sticky` itself (not just the inner scene), with sticky height `100vh` and total ancestor scroll-area `200vh`. This is the standard "sticky pin-and-play" pattern used by GSAP ScrollTrigger and matches what Dani's spec implies. **Recommended.**

Either (1) or (3) restores the design intent. (1) is the smallest diff.

---

## Mobile scroll-keyframe verdicts (375×812)

| Keyframe | scrollY | Verdict | Notes |
|---|---|---|---|
| **t=0.00** | 0 | **CONCERN** | Mobile renders the AnimatedScene (`useReducedMotion()` is false on iPhone-size headless Chrome), but with the mobile CSS rule `.cinematic-wrapper-200vh { height: 100vh; }`, the wrapper is 812px = vh, so useScroll's `scrollYProgress` is 0/0 = NaN, which Framer Motion clamps to 1.0 — every layer's `useTransform` lands at its END frame instantly. The screenshot shows a fully-resolved rock face, terracotta + sky-blue palette, vertical fluting — but **no title card** (text width=0, height=0 — wordmark element exists but is hidden by the mobile CSS layout collapse). Not the night-sky opening; users see the final frame immediately. |
| **t=0.97** | 1583 | PASS-by-design | Hero passed, "Built, shipped, and open. Everything here is live." live-product section visible. Expected for mobile scrollY this deep. |

The mobile path needs a separate look: either StaticArrivalFrame should also kick in by viewport width (not just reduced-motion), or the title card needs to land somewhere usable on mobile. Filing under "polish before next round" rather than BLOCKER — the page is still functional and the rest of the journey works.

---

## Console errors

**0 errors** captured across desktop + mobile passes (CDP `Runtime.consoleAPICalled` + `Runtime.exceptionThrown` listeners attached throughout). Clean runtime.

---

## Reduced-motion code path

**Verified yes.** `components/CinematicIntro.tsx:293` invokes `useReducedMotion()` and at `:294` returns `<StaticArrivalFrame />` when true. The static frame uses a hand-painted t=0.85 snapshot of the rock face with the title card centered over the lit sediment band (lines 137–195). Code path is wired correctly; full validation requires an OS-level `prefers-reduced-motion: reduce` toggle which is outside MCP/headless reach.

---

## Build size delta

Current branch `out/` = **3.1 MB** total, `_next/static/` = **1.2 MB**. Homepage chunk `8.2 kB`, First Load JS `155 kB`. No new dependencies (verified via build output). Bundle is within the Phase 5 baseline; the cinematic SVG is hand-authored geometry, no asset cost beyond JS-inlined paths.

A direct delta vs `main` was not measured to avoid destabilizing the working tree mid-verification — Sky can compare via:
```
git checkout main -- . && npm run build && du -sh out/
# then git checkout feat/auto-2026-06-01-cinematic-hero -- .
```

---

## VERDICT — **NEEDS-WORK**

The cinematic plays beautifully through Act 1 (t=0.0–0.25 verified perfect against Dani's spec keyframes), but **the sticky-positioning math drops the scene off-screen at t=0.5**, hiding Act 2 (mid-mesa growth) and Act 3 (rock face arrival + title card resolve) entirely. The title card "SkyPi Studio" — the payoff of the whole 200vh budget — is never visible on the desktop reference viewport.

This is a single-file, single-rule CSS fix (or a small JSX restructure in `CinematicIntro.tsx`) — not a redesign. But it is load-bearing and must land before Sky merges. Two passing screenshots out of five is not a ship.

**Recommendation:** route back to Shamus with the root-cause analysis above. Fix option (3) is the smallest behavioral change; fix option (1) is the smallest DOM change. Either restores the intended scroll choreography.

Once fixed: re-run this same 5-keyframe pass (`/tmp/peter-snap.mjs` is reusable; pass `NODE_PATH=/Users/skypie/Portfolio/node_modules`) — expected outcome is all five desktop frames PASS with the title card resolving by t=0.97.

— Peter, Performance Engineer
