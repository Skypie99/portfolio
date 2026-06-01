# Peter — Cinematic Desert 2.5D Camera-Push: Motion-Mechanics Verification

**Date:** 2026-06-01
**Branch:** `feat/cinematic-desert-2.5d` @ `3937f3c` (main untouched, nothing pushed)
**Scope:** MOTION MECHANICS ONLY, against placeholder plates. Not judging the grey-box art.
**Method:** Self-launched headless Chrome (system Chrome `--headless=new`, 1440×900, DSR=1) driven raw over CDP (`ws` from node_modules, no puppeteer). Per keyframe: `window.scrollTo(0,Y)` → poll computed transforms until `scrub:1.1` settles → probe per-layer `opacity`/`transform`/pin rect → screenshot. Console via `Runtime.consoleAPICalled` + `exceptionThrown`. Pin geometry at 900px viewport: stage 500vh=4500px, pin 100vh=900px → **pinned range y=0→3600**.

---

## VERDICT: MECHANICS-SOLID

The GSAP camera-push is empirically correct end to end: monotonic depth-parallax, a continuous (no-dip) dawn→day crossfade, a clean near-rockface arrival, foreground pass-and-exit, smooth cool→warm grade, a late title that resolves and holds, and a pin that stays attached across the **entire** range with a clean release. **0 console errors, 0 exceptions.** Reduced-motion/narrow path renders the static frame. One **non-mechanics** layout observation for Sky/Dani (the scene is boxed beside the global sidebar) is flagged below — it is a site-shell decision, not an engine defect, and out of this pass's scope.

---

## 5-keyframe table (1440×900, settled after scrub)

| Scroll | y | What's on screen (measured) | Pin fills? | PASS/FAIL |
|---|---|---|---|---|
| **0%** | 0 | sky-dawn op 1.00 / sky-day 0.00; far+mid+fg at scaleFrom; near-rockface hidden (op 0); title op 0; grade-mix 0; sun 0 | ✅ fixed, 0–900 | **PASS** |
| **25%** | 900 | dawn 0.97 / day 0.03 (crossfade opening); plates growing (mid 1.02, fg 1.15); near still 0; grade-mix 0.15; sun 0.12; title 0 | ✅ fixed, 0–900 | **PASS** |
| **50%** | 1800 | **dawn 0.25 / day 0.75 — pair sums ≈1.0 (no luminance dip)**; near-rockface revealing (op 0.345, scale 1.6); fg 0.90 starting exit; grade-mix 0.50; sun 0.48 | ✅ fixed, 0–900 | **PASS** |
| **75%** | 2700 | day 1.00 (dawn 0); **near-rockface op 1.0 scale 2.12 fills lower frame (arrival)**; fg faded out (op 0); grade-mix 0.85; sun 0.83; title still 0 | ✅ fixed, 0–900 | **PASS** |
| **100%** | 3600 | near-rockface op 1.0 scale 2.15; fg 0; **title "SkyPi Studio" op 1.0 (1160×132, on-screen, centred)**; grade-mix 1.0; sun 0.90 | ✅ fixed, 0–900 | **PASS** |

Screenshots: `/tmp/peter-shots/desktop_{0,25,50,75,100}pct_*.png`, `mobile_375x812_y0.png`, raw probe `/tmp/peter-shots/probe.json`.

---

## Findings against the brief

**Forward-dolly parallax — CONVINCING.** Scale Δ is strictly monotonic by depth (at p=1.0): sky **1.06** → far-ridge **1.25** → mid-mesa **1.6** → near-rockface **2.15** → foreground **2.6**. Downward drift scales the same way (sky −9px vs foreground +306px yPercent-translate). Nearer = faster = reads as the camera pushing in. In the pixels the placeholder tonal separation (indigo sky / dusty-rose ridge / ochre mesa / terracotta cliff / umber floor) makes the depth unmistakable.

**Scene visibility across the whole pin — NO DETACH / NO BLANK.** Seam check at y = 1, 200, 450, 1350, 2250, 3150, 3590: pin `position:fixed`, `top:0 bottom:900`, fills viewport, ≥1 plate visible at **every** position (not just keyframes). At y=3601 it hands off to `position:relative` still filling (clean release point); at 3800/4200 it scrolls up naturally and the Hero flows in below (pinSpacing spacer correct). The old sticky-detach bug (d9865fb) is confirmed fixed.

**Dawn→day crossfade — SMOOTH, no dip.** At the 50% midpoint dawn 0.25 + day 0.75 = ~1.0; the sine.inOut ramp (p0.20→0.65) carries luminance continuously through the seam. No pop.

**Title resolves + holds — YES.** Opacity 0 through p0–75, then 1.0 at p100, rect 1160×132 on-screen and centred (top ~522). Carve-in window p0.80→0.96 then explicit hold to p1.0.

**Console — CLEAN.** 0 `console.error`, 0 exceptions across the full desktop run + mobile reload. No ScrollTrigger NaN.

**Mobile 375×812 — CORRECT FALLBACK.** `hasStaticFrame:true, hasAnimatedStage:false`; StaticDesertFrame paints the arrival composite (terracotta + sun bloom + resolved title 207×54 op 1.0), no pinned scroll-hijack, no NaN/crash. **Reduced-motion:** code-path verified by inspection — `animate = !(reduce || narrow)`; `useReducedMotion()` gates to `<StaticDesertFrame/>` (covered by the 2 passing vitest cases). Full OS reduced-motion toggle is out of headless reach (noted).

**Grain / vignette / motes — PRESENT THROUGHOUT.** grain op 0.07, vignette present, 16 motes at all 5 positions.

---

## Gates
- `npm run build` — prebuild asset gate green ("all 6 cinematic placeholder svg(s) found"), ✓ Compiled, ✓ Exporting (3/3). **Static export OK.**
- **Bundle:** home route `/` = **50.3 kB route / 197 kB First Load JS**. (No prior Peter baseline on this branch to delta against; gsap+@gsap/react are the new deps, already counted.)

---

## Non-mechanics note for Sky / Dani (NOT a blocker, out of scope)

The cinematic is **not full-bleed on desktop**. `app/layout.tsx:137` wraps every page in `<div class="flex md:flex-row min-h-screen">` with `<Sidebar>` (280px sticky `w-sidebar` nav, hidden on mobile) as the first flex child and `<main>` second. `<CinematicDesert>` lives in `{children}` inside `<main>`, so the pin renders at `left:280 width:1160` — the global site sidebar (name, role, featured project, "Write to me", Work/Career) flanks the IMAX scene the whole time (visible in every desktop screenshot). On mobile the sidebar is `hidden`, so the static frame goes correctly full-bleed.

This is a **site-shell layout decision**, not an engine defect — the motion is correct inside its box. Whether the title sequence should break out to true full-viewport is a design call for Sky/Dani; if yes, the fix is a layout/escape-the-column concern (e.g. render the stage outside the sidebar flex, or full-bleed it with `w-screen` + negative margin), **not** a change to `plates.ts` or the timeline. Left for a decision, not silently applied.

---

## Bottom line
The engine is data-driven and the swap to real plates (`USE_PLACEHOLDERS=false`) changes none of what was verified here — every measured value is a pure function of master progress `p`, exactly as designed. **Ship the mechanics.** The only open question is the full-bleed-vs-boxed framing, which is Sky/Dani's to decide.
