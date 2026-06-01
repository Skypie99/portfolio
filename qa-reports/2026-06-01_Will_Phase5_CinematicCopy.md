# Phase 5 — Cinematic Intro: Copy & Micro-Motion Pass
**Date:** 2026-06-01  
**Role:** Will (UX writing)  
**Branch:** `feat/phase5-cinematic-v2`  
**TypeScript:** ✅ clean (`npm run typecheck` exit 0)

---

## Scope

Refined the cinematic intro title card reveal and all micro-copy on `feat/phase5-cinematic-v2` — pulled from Shamus's latest motion pass before making any changes. No content changes, no structural changes to Shamus's animation architecture.

---

## Files changed

| File | Change |
|---|---|
| `components/CinematicIntro.tsx` | Split `titleOp` → three per-line transforms; refactored title card markup (desktop `motion.p`, mobile `cin-line-*`) |
| `app/globals.css` | Scroll prompt opacity + letter-spacing; skip link opacity/hover/padding; mobile per-line stagger animations |

---

## Title card stagger (desktop)

**Before:** single `motion.div` with one `titleOp` transform — all three lines faded in and out as a block.

**After:** three independent `useTransform` values, each lagging the previous by ~15px of scroll travel:

| Line | Fade-in range | Note |
|---|---|---|
| SkyPi Studio | 255 → 278 | leads |
| Est. 2026 | 270 → 293 | +15px lag |
| Okanagan Valley, British Columbia | 285 → 308 | +15px lag |
| all three | 325 → 365 | exit together |

15px at a casual scroll pace ≈ 0.3–0.4s between beats. Deliberate without being theatrical.

**Mobile:** replaced the single `.cinematic-title-mobile` parent animation with per-line CSS `animation-delay` (0s / 0.55s / 1.1s) on `.cin-line-1/2/3`. Reduced-motion path updated to target the new selectors.

---

## Scroll prompt

`color: rgba(255,255,255,0.55)` → `rgba(255,255,255,0.34)`  
`letter-spacing: 0.04em` → `0.08em`

Reads as a stage direction now — slightly spaced out, barely there. Recedes behind the landscape.

---

## Skip link

`color: rgba(255,255,255,0.60)` → `rgba(255,255,255,0.44)`  
hover: `0.92` → `0.70`  
`padding: 0.5rem 0` → `0.25rem 0`  
added `letter-spacing: 0.06em`

Sits in the corner like it was always there. Hover shifts from "reveals" to "confirms."

---

## Verified in preview (localhost:3001)

| Scroll | Observed |
|---|---|
| 0 | Night sky, "Scroll to begin." faintly italic at bottom, no title lines |
| 270 | "SkyPi Studio" partially revealed; Est. 2026 and Okanagan Valley not yet present |
| 312 | All three lines fully visible against golden-hour sky |
| — | Skip link: passive weight, bottom-right corner |
| — | Console: no errors |

---

## DECISIONS FOR SKY

None. All changes are reversible and within UX writing scope.
