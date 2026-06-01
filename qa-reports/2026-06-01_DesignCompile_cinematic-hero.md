# Design Compiler — Cinematic Hero (IMAX Desert Descent)

**Date:** 2026-06-01
**Branch:** `feat/auto-2026-06-01-cinematic-hero`
**Scope:** `components/CinematicIntro.tsx` (866 lines, rewrite hash `779b084`), `app/tokens-phase2.css` (cinematic scope tokens), `app/globals.css` (`.cinematic-wrapper-200vh`, `.cin-sky-dome`, `.cin-plane`, `.cinematic-static-frame`, `.cinematic-title-static` additions)
**Spec:** `designs/CINEMATIC_INTRO.md` (Dani 2026-06-01, hash `097924a`)
**Compiler:** Dani · 7-layer review (Const. Art. 2.4)

---

## Layer 1 · Tokenization — CONCERN

The motion easing is correctly anchored — `--ease-cinematic` lives in `tokens-phase2.css` and `easeInOutQuint(t)` in the component implements the same bezier `(0.83, 0, 0.17, 1)` as a pure JS function (necessary because Framer Motion's useTransform takes a function, not a CSS string). Defensible. **However**, every color stop in the component (`SKY_TOP`, `SKY_MID`, `SKY_HORIZON`, `FAR_MESA`, `MID_MESA`, `NEAR_UPPER`, `NEAR_LIT`, `NEAR_SHADOW`) is a literal hex array, completely bypassing the `--cinema-sky-*` and `--cinema-far/mid/near-*` tokens we just added. Shamus explicitly justified this ("literal hex here so the useTransform callback returns a primitive without reading the DOM") — technically true that `interpStops()` needs raw RGB inputs at JS evaluation time, but the token system loses authority: a future palette tweak requires editing both `tokens-phase2.css` AND the component arrays. Compromise: tokens should be **the source**, the component should **import them**. Plus three off-token hex strings hide inline: the sediment-break `rgba(80, 35, 18, 0.35)` highlight (line 201/822), the sky `linear-gradient(... 55% ...)` mid-position (lines 136, 306) is a magic number not in spec §6 table (spec implies 50%, Shamus deviated to 55%), and the moon's `#FDF6E3` cream is also literal. **CONCERN** — not a fail because the values match the spec table exactly, but token authority is meaningfully weakened.

## Layer 2 · Accessibility Parity — FAIL

Three issues, one of them blocking. **(a) Skip button is completely unreachable** — line 770-775 sets `tabIndex={-1}` AND `aria-hidden="true"` on the `<motion.button>`. A skip link the user cannot tab to is not a skip link. This is a WCAG 2.4.1 (Bypass Blocks) and 2.1.1 (Keyboard) regression vs the previous Phase 5 intro. **FAIL**. **(b) Title card is aria-hidden** (lines 156, 740, 760) — meaning a screen-reader user lands on the page, hears nothing about "SkyPi Studio," and the studio name is only spoken by the Hero `<h1>` below. Spec §9 reduced-motion fallback also marks the static title aria-hidden. Acceptable IF the Hero's `<h1>` carries the wordmark — but the Hero shows "Heading" content (eyebrow + headline + subhead + CTA), not the studio wordmark/Est. 2026/Okanagan attribution. The cinematic title is the brand mark; hiding it from AT is a brand-presence loss. **CONCERN**. **(c) Title contrast at t=0.92** — cream `#FAF9F5` on lit fill (which at t=0.92 sits between `NEAR_LIT t=0.85 #A04E2A` and `t=1.0 #B35F32`, roughly `#A85630`): WCAG ratio ≈ **4.55:1**. Passes 4.5:1 for normal text by a hair, passes 3:1 for large text comfortably. Spec said 4.7:1 at the lit `#B35F32`; at the resolve moment it's slightly darker. **PASS** but tighter than spec advertised.

## Layer 3 · Component Consistency — PASS

The Phase 5 + Peter perf patterns are preserved: `useScroll` + `useTransform` only, `will-change: transform, opacity` on the 9 plane wrappers (not on inner SVG paths), named export `CinematicIntro` unchanged, `motion.path` / `motion.rect` / `motion.g` for animated fills. The reduced-motion gate is implemented as a clean parent-component-vs-child-component split (`CinematicIntro` gate → `StaticArrivalFrame` or `AnimatedScene`) which is the React-legal way to do early-return-before-hooks. Hero.tsx is untouched, and because the title card holds at full opacity through t=1.0 and the wrapper completes before Hero enters the viewport, the existing `.hero-enter` stagger animations fire on Hero mount without competing with the cinematic resolve. **PASS**.

## Layer 4 · Visual Entropy — PASS

9 specified depth planes, 9 implemented. Star count: 36 (`STAR_POSITIONS` array) — under the 40 budget. Rock face SVG paths: 1 silhouette path + 1 lit rect + 2 break lines + 11 lower fluting rects + 11 upper fluting rects + 6 talus polys = **31 paths** (just over the ≤30 budget, marginal). No `filter: blur`, no `backdrop-filter`, no animated `box-shadow`. The sun radial gradient is a static SVG defs gradient, not an animated filter. Constellation lines (6 strokes) and 4 far-mesa sediment band rects are tasteful, low-cost. **PASS** (rock face path count nudges into "marginal" by one; cosmetic, not a blocker).

## Layer 5 · Luxury UI Score — 8.5 / 10

**(a) Camera unity — 7/10.** One `easeInOutQuint` is applied to `scrollYProgress` ONCE, and every downstream `useTransform` derives from that single curved `t`. The architecture is right. But Shamus correctly flagged that downstream input ranges like `[0.18, 0.30, 0.70, 0.90]` are written as if they were raw scroll positions, while the source `t` is already eased — meaning the keyframe alignments shift on screen vs what reading the code suggests. Result is still cohesive (everything moves to the same curve) but slightly desynchronized from the spec's act boundaries; Sky won't feel it but a designer reading the code will be momentarily confused. **(b) Title inevitability — 9/10.** The staggered resolve (wordmark → rule → sub1 → sub2 over t=0.78→0.93) feels carved, not popped, and the HOLD-to-end behavior is correctly wired. Wordmark tracking tightening 0.12em → 0.04em is the right luxury cue. **(c) Color story — 9/10.** RGB interpolation across one gradient (not stacked crossfades) is the editorial-clean choice, and the palette resolves into the existing WA teal-pale + rose-pale tokens at t=1.0 — the cinematic exits into Hero's color world seamlessly. **(d) Arrival as destination — 9/10.** The rock face at scale 0.4 → 1.0 emerging from t=0.55 specifically replaces the previous intro's generic mesa fade. With irregular ridgeline + sediment break + 12 fluted columns + 6 scree blocks, it reads as a *specific place*, not a generic backdrop. **Average: 8.5/10.** Verdict: feels inevitable, expensive, and physically continuous; the camera-unity nit is the one thing keeping it under 9.

## Layer 6 · Regression Safety — PASS

`npm run typecheck` clean (exit 0, no output). `npm run build` clean — `✓ Compiled successfully`, all 15 static pages generated, all 5 work-slug routes prerendered. Homepage chunk: `app/page-b881596ee865f40a.js = 20.7KB` (vs previous Phase 5 baseline around 8.2KB — but the build output line `8.2 kB` is the route-specific delta, not the chunk file size; First Load JS 155kB total). `out/_next/static/chunks/` total: 1.1M (unchanged at the megabyte level). **Bundle delta is within the 30KB budget.** **PASS**.

## Layer 7 · Compile Decision

**VERDICT: POLISH**

Layers 3, 4, 6 pass clean. Layer 5 hits an 8.5 which clears the ≥8 luxury bar. Layer 2 has a hard FAIL (skip-link unreachable) and a CONCERN (title aria-hidden for screen readers). Layer 1 has a token-authority CONCERN. None of these require a redesign — all are surgical fixes Shamus can execute in a phase-4 polish pass.

---

## POLISH BACKLOG FOR SHAMUS

1. **`components/CinematicIntro.tsx` lines 767-775 — restore skip-link keyboard accessibility.** Remove `tabIndex={-1}` and `aria-hidden="true"` from the `<motion.button className="cinematic-skip-link">`. Keep the existing `onClick={handleSkip}` and visible focus styling. Why: a skip-link the user cannot tab to violates WCAG 2.1.1 + 2.4.1; previous Phase 5 intro shipped it accessible and this is a regression. The button text "Skip to the work ↓" is appropriate as the accessible name.

2. **`components/CinematicIntro.tsx` lines 740 and 760 — make the title card text screen-reader accessible.** Remove `aria-hidden="true"` from `<div className="cinematic-title-card cinematic-title-desktop">` AND from the mobile twin. Wrap the wordmark in an `<h2>` (or `aria-level={2}` div) so AT announces the studio name. The visual presentation is unchanged; the change is purely a semantic surface for assistive tech. Why: the studio brand is the title card; hiding it from AT means a screen-reader user never hears "SkyPi Studio" until far down the page.

3. **`components/CinematicIntro.tsx` lines 64-113 — pull color stops from CSS tokens.** Add a helper at module top: `function tok(name: string) { if (typeof window === 'undefined') return ''; return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }` Then either (a) inside `AnimatedScene`, after the wrapperRef mounts (useEffect), resolve the tokens once and replace the local `SKY_TOP` etc with the resolved arrays; or (b) simpler — keep the literal arrays but add a top-of-file comment block linking each constant to the source token name in `tokens-phase2.css`, and add a runtime dev-mode assertion that the hex literals match the tokens. Pragmatic recommendation: do (b) for this commit (keep the SSR-safe primitive return) and file (a) as a Wave 3 task. Why: the token system has to remain authoritative; right now a palette tweak requires editing two places.

4. **`components/CinematicIntro.tsx` lines 136, 306 — restore spec sky-stop mid position to 50% OR amend the spec.** Shamus deviated to 55% with rationale ("horizon sky compresses lower as foreground rises"). The deviation is defensible but unannounced in the storyboard. Choose: (a) revert to `linear-gradient(... ${mid} 50% ...)` for spec alignment, or (b) leave at 55% and amend `designs/CINEMATIC_INTRO.md` §6 to record the deviation with the same rationale. Dani's call: leave at 55% (the visual reasoning is sound), but commit the spec edit so the two stay in sync.

5. **`components/CinematicIntro.tsx` lines 310-366 — annotate that input ranges are on eased-t, not raw scroll.** The unified-easing architecture is correct; the readability cost is that `[0.18, 0.30, 0.70, 0.90]` ranges suggest spec act-boundaries when they're actually being evaluated on a curved track. Add a single comment block above the first `useTransform` (around line 309): `/* NOTE: t is already easeInOutQuint(scrollYProgress). All downstream ranges below are interpreted on the EASED track. To map a t-value back to raw scroll position: scrollY = t^(1/5) for t<0.5, similar inverse for t>0.5. Spec keyframe alignments below match eased-t. */` Why: protects the next reader from a 20-minute "why doesn't t=0.30 happen at scroll 30%?" investigation.

6. **`app/globals.css` lines 989-991 — fix the mobile wrapper-200vh collision.** The existing `@media (max-width: 767px) .cinematic-wrapper { height: 100vh; }` has equal specificity to `.cinematic-wrapper-200vh` (single class) but comes LATER in source order, so on mobile the 200vh modifier loses. Change to `.cinematic-wrapper, .cinematic-wrapper-200vh { height: 100vh; }` in the mobile @media block. This is exactly the concern Shamus flagged. Why: without this, the IMAX scroll wrapper collapses correctly on phones (you want this — full scroll cinema on mobile would be punishing) but only by accident — making it explicit is honest.

7. **`components/CinematicIntro.tsx` line 350 — re-validate title contrast at t=0.92.** Current `NEAR_LIT` interpolates to roughly `#A85630` at the resolve moment (t=0.92), giving cream `#FAF9F5` text a ratio of ~4.55:1 — passes 4.5:1 for normal text but tight. Two safe options: (a) bump the cream to pure `#FFFFFF` for the wordmark (ratio jumps to ~4.7:1), or (b) shift the title resolve window slightly later — `wordmarkOp = useTransform(t, [0.82, 0.86], [0, 1])` and so on, so the title appears when the rock is fully lit at `#B35F32` (ratio 4.7:1, matches spec). Recommend (b) — protects the spec's contrast claim without touching the visual ink color. Why: the spec advertised 4.7:1; landing at 4.55:1 is technically AA-passing but undersells what we promised.

---

**Summary of action:** 7 polish items, all surgical. None require redesign. Estimated 60-90 minutes for Shamus to execute. After polish, this is ready to merge. Sky merges.

Dani — Design Compiler
