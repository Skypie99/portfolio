# Phase 5 — Cinematic Scroll Intro
**Date:** 2026-05-31  
**Role:** Shamus (frontend)  
**Branch:** `feat/phase5-cinematic-intro`  
**Build:** ✅ 15/15 pages, exit 0  
**TypeScript:** ✅ clean  

---

## What was built

A full-viewport sticky intro scene sits above the fold on the homepage. The user sees a New Mexico / Okanagan desert night sky. Four animated beats play out over ~350px of scroll, after which the portfolio content fades up.

### Files changed / created

| File | Change |
|---|---|
| `components/CinematicIntro.tsx` | New — client component, entire scene |
| `components/ContentReveal.tsx` | New — Framer Motion fade-up wrapper for page content |
| `app/globals.css` | +310 lines — sky/star/landscape keyframes + scroll-driven animation rules |
| `app/page.tsx` | Wraps homepage content in `<CinematicIntro />` + `<ContentReveal>` |
| `app/about/page.tsx` | Fixed unescaped apostrophe ESLint error (pre-existing, surfaced by build) |

---

## Animation sequence (desktop, scroll-driven CSS + Framer Motion)

| Scroll | Event |
|---|---|
| 0px | Night sky `#1B1F3A → #4a2040`. Stars twinkling. Crescent moon visible. Two constellation outlines. Landscape layers hidden (translateY offsets). "Scroll to begin." prompt at bottom centre. |
| 0–60px | Night sky starts fading |
| 60–260px | Night fades out, dawn gradient (`#2C1654 → #E8895C`) pulses through |
| 80–250px | Moon fades |
| 100–270px | Stars + constellations fade |
| 100–300px | Landscape layers rise: bg ridge +120px → 0, mid mesas +80px → 0, fg rocks/cacti +40px → 0 |
| 120–160px | Skip link fades in (bottom right) |
| 220–350px | Golden hour gradient arrives |
| 250–290px | Title card fades in (Framer Motion) |
| 310–365px | Title card fades out |
| 300–420px | Portfolio content (ContentReveal) fades up from 22px below |

---

## Title card (correct text — confirmed by Sky)
```
SkyPi Studio
Est. 2026
Okanagan Valley, British Columbia
```
Cormorant italic, centred, white with text-shadow, `aria-hidden="true"`.

---

## Technical decisions

**CSS scroll-driven vs Framer Motion split:** Sky, stars, moon, constellations, and landscape layers all use `animation-timeline: scroll(root)` inside `@supports (animation-timeline: scroll())`. Title card and skip link use Framer Motion `useScroll`/`useTransform` because they need multi-point keyframing (fade in, hold, fade out) that CSS `@keyframes` with a single `animation-range` can't express cleanly.

**Fallback (no scroll-driven support / Firefox):** Default CSS state is golden hour static — `sky-night` and `sky-dawn` default to `opacity: 0`, `sky-golden` to `opacity: 1`, landscape layers at `translateY(0)`, stars/moon hidden. The scene looks like late afternoon Okanagan.

**Mobile fallback (<768px):** Container height is `100vh` (no scroll budget), desktop Framer title card hidden, CSS-only mobile title card shown immediately, scroll prompt and skip link hidden.

**Reduced motion:** The global `0.01ms !important` rule in `globals.css` already gates all animations. The `@supports` block is additionally gated inside `@media (prefers-reduced-motion: no-preference)` so the scroll-driven animations never register.

**ContentReveal SSR:** Server renders `opacity: 0, y: 22px`. Framer Motion reads `scrollY` on hydration and corrects immediately — no visible flash in practice since the intro scene covers the content until ~400px scroll.

**SVG landscape:** Three `preserveAspectRatio="none"` layers. Cacti are dark green `#1C3D2A` rectangles (classic Saul Bass simplification). Juniper is a stroked branch group. Intentional asymmetry: right-side cactus has its arm joint slightly higher.

**Branch auto-stash issue (operational note):** A Claude hook auto-stashes working-tree changes on branch switch. If returning to this branch, run `git stash list` first and `git stash pop stash@{0}` if needed before editing.

---

## DECISIONS FOR SKY

1. **`ContentReveal` initial opacity:** The hero section briefly renders invisible before JS hydrates. On a fast connection this is imperceptible (< 100ms). If you want guaranteed no-flash, the alternative is a CSS-only fade using scroll-driven animation on `#hero` directly — no Framer Motion needed, but loses the translateY rise.

2. **Skip link is mouse-only:** It has `tabIndex={-1}` and sits inside `aria-hidden="true"`. Keyboard users already bypass the intro via the existing global SkipLink. If you want the skip link keyboard-accessible, it needs to be moved outside the `aria-hidden` container.

3. **`animation-timeline: scroll(root)` on Safari:** Works in Safari 17.4+. Users on Safari < 17.4 get the golden-hour static fallback. Safari 17.4 shipped September 2023 — coverage is good but not universal.
