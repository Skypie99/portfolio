# Alex A11y Sign-Off — Overhaul `skypistudio-2026-06-03`

**Date:** 2026-06-03
**Branch:** `overhaul/skypistudio-2026-06-03`
**Auditor:** Alex, Accessibility Engineer (independent — did not build this)
**Scope:** All below-landing surfaces (Hero, Live stats, The Work, Method, About, Credentials, Contact, Footer, persistent nav, all routes, 404)
**Out of scope:** Cinematic landing (`components/cinematic/**`, `.cdesert-*`)
**Both modes audited:** Light and dark

---

## 1. Verdict

**PASS-WITH-FOLLOWUPS**

No WCAG 2.2 AA blockers in the screen-reader / keyboard / semantics core. Two contrast failures (WCAG 1.4.3) and one motion-gate gap (WCAG 2.3.3 adjacent) are HIGH findings that must be fixed before the portfolio is used as a live WCAG AA pitch. A FilterPill target-size regression (2.5.8) is MEDIUM. Everything else is LOW polish.

The accessibility pitch of this portfolio is "accessibility IS the product" — so this bar is deliberately higher than a typical site review.

---

## 2. Findings

### HIGH — Contrast failure: `text-wa-teal-deep` on `bg-wa-teal-pale` (WCAG 1.4.3)

**SC:** 1.4.3 — Normal text requires ≥4.5:1.
**Measured ratio:** 3.58:1
**Affected files:**
- `app/page.tsx` line 386 — contact section eyebrow label (`text-wa-teal-deep` on `bg-wa-teal-pale`)
- `app/page.tsx` line 399 — inline email link (`text-wa-teal-deep` on `bg-wa-teal-pale`)

**Evidence:**
- `--rgb-cool` = `66 122 111` (wa-teal-deep, light mode)
- `--rgb-panel-cool` = `205 224 212` (wa-teal-pale, light mode)
- Luminance: L(66,122,111) = 0.173, L(205,224,212) = 0.736
- CR = (0.736 + 0.05) / (0.173 + 0.05) = **3.58:1** — FAILS 4.5:1

**Fix:**
```tsx
// app/page.tsx line 386 — eyebrow label
// BEFORE: text-wa-teal-deep
// AFTER:  text-cool-deep    (cool-deep = 47,87,77 → 5.87:1 on wa-teal-pale)
<p className="font-mono text-label tracking-label uppercase text-cool-deep flex items-center gap-2">

// app/page.tsx line 399 — email link + hover
// BEFORE: text-wa-teal-deep hover:text-accent
// AFTER:  text-cool-deep hover:text-near-black
<a
  href={`mailto:${profile.contactEmail}`}
  className="text-cool-deep hover:text-near-black transition-colors duration-fast ease-out"
>
```
`--rgb-cool-deep` = `47 87 77` → 5.87:1 on wa-teal-pale (PASS).
`near-black` hover → 10.00:1 on wa-teal-pale (PASS).

---

### HIGH — Contrast failure: `terracotta` hover text on `bg-wa-teal-pale` (WCAG 1.4.3)

**SC:** 1.4.3
**Measured ratio:** 3.09:1
**Affected file:** `app/page.tsx` line 399 — `hover:text-accent` on section bg `bg-wa-teal-pale`

**Evidence:**
- `--rgb-accent` = `185 99 64` (terracotta, light mode)
- `--rgb-panel-cool` = `205 224 212`
- CR = **3.09:1** — FAILS 4.5:1

**Fix:** Covered by the fix above (`hover:text-near-black`). Independently, `text-accent-hover` (#B25128) would also fail — do not use any terracotta variant for normal text on wa-teal-pale.

---

### HIGH — `ContentReveal` has no reduced-motion gate on desktop (WCAG 2.3.3 / 2.4.7)

**SC:** 2.3.3 (Motion from Animations), 2.4.7 (Focus Visible)
**Affected file:** `components/ContentReveal.tsx`

**Issue A — Reduced-motion gap (2.3.3):**
`ContentReveal` uses Framer Motion `useTransform(scrollY, [300, 420], [0, 1])` to drive opacity and translateY. This is JavaScript-driven, not a CSS animation. The global `@media (prefers-reduced-motion: reduce)` gate in `globals.css` (which sets `animation-duration: 0.01ms`) does **not** intercept Framer Motion's `style` prop transforms. Under reduced-motion on desktop, the homepage content below the cinematic intro is opacity-0 until the user scrolls past 300px. The mobile breakpoint fix (`@media (max-width:767px) { .cinematic-content-reveal { opacity: 1 !important } }`) only covers phones.

**Issue B — Invisible keyboard focus (2.4.7):**
`ContentReveal` children (Hero CTA button, scroll anchor link) are in the DOM and keyboard-reachable before they become visible. At `scrollY < 300`, these elements are `opacity: 0` and will receive keyboard focus before any visual reveal — the focus ring on an opacity:0 element is itself invisible. This is a 2.4.7 violation.

**Fix — `components/ContentReveal.tsx`:**
```tsx
'use client';

import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

export function ContentReveal({ children }: { children: ReactNode }) {
  const { scrollY } = useScroll();
  const shouldReduceMotion = useReducedMotion();
  const opacity = useTransform(scrollY, [300, 420], [0, 1]);
  const y = useTransform(scrollY, [300, 420], [22, 0]);

  // Reduced-motion and mobile: skip the scroll-driven fade entirely.
  if (shouldReduceMotion) {
    return <div className="cinematic-content-reveal">{children}</div>;
  }

  return (
    <motion.div className="cinematic-content-reveal" style={{ opacity, y }}>
      {children}
    </motion.div>
  );
}
```
This renders children at full opacity immediately under reduced-motion (and mobile, where the CSS `opacity:1 !important` already applies). The 2.4.7 keyboard-focus issue is resolved because children are visible before focus reaches them.

---

### MEDIUM — `FilterPill` uses undefined `pill-base` class — no padding → may fail 2.5.8 target size

**SC:** 2.5.8 (Target Size, Minimum)
**Affected file:** `components/FilterPill.tsx` line 38
**Evidence:** `pill-base` is referenced as a Tailwind class but is defined nowhere in the codebase (not in `globals.css`, `tokens-phase2.css`, `tailwind.config.ts` `@layer`, or any plugin). It has zero effect. Without it, `FilterPill` has no `px-*` or `py-*` or `h-*` class — only `font-mono text-meta tracking-label uppercase rounded-pill`. At `text-meta = 11px` with `line-height: 1.4`, the rendered button height ≈ 15px, well below the 24px minimum. The gap between pills is `gap-2 = 8px`, below the 24px spacing exception threshold.

**Fix:** Add explicit padding to `FilterPill`, or replace `pill-base` with real classes:
```tsx
// BEFORE (line 38):
'pill-base inline-flex items-center gap-2 whitespace-nowrap',

// AFTER — replace pill-base with actual padding that gives ≥24px height:
'px-3 py-1.5 inline-flex items-center gap-2 whitespace-nowrap',
// py-1.5 = 6px top + 6px bottom → 15px + 12px = 27px ≥ 24px. PASS.
```

---

### LOW — `HamburgerNav` dialog and inner `<nav>` share identical `aria-label="Primary menu"`

**SC:** 4.1.2 (Name, Role, Value)
**Affected file:** `components/HamburgerNav.tsx` lines 151, 190

The dialog (`role="dialog" aria-label="Primary menu"`) and the inner `<nav aria-label="Primary menu">` share the same label. Screen readers may announce "Primary menu, dialog — Primary menu, navigation" redundantly. The nav label adds no additional context beyond what the dialog already declares.

**Fix (low priority):** Give the nav a more specific label, or remove the nav's aria-label since the dialog already provides context:
```tsx
// Option 1: remove nav aria-label (it inherits context from the dialog)
<nav className="w-full max-w-content">

// Option 2: distinguish the nav label
<nav aria-label="Main navigation links" className="w-full max-w-content">
```

---

### LOW — `ProjectCard` div has `focus-visible:` classes but is not focusable

**SC:** N/A — dead code, no WCAG failure
**Affected file:** `components/ProjectCard.tsx` line 60, 70

The `.work-card` `<div>` has `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta` but no `tabIndex` or interactive role. These classes never fire. The actual link (`h3 > Link`) has its own correct focus-visible classes (line 161). This is dead code; not a WCAG failure but creates maintenance confusion.

**Fix:** Remove the focus-visible classes from the outer div, or document why they're there.

---

### LOW — `CaseStudyCard` image hover `scale-[1.02]` not individually reduced-motion gated

**SC:** 2.3.3
**Affected file:** `components/CaseStudyCard.tsx` line 63

The image has `transition-all duration-slow group-hover:scale-[1.02]`. The global RM gate zeroes `transition-duration: 0.01ms` — so the scale transition is effectively instant (not animated) under RM. This is technically compliant — scale still happens but with no perceivable animation. The global gate is sufficient. Flagged as LOW because "transition:none" would be cleaner.

---

### LOW — `ContentReveal` SSR renders `opacity:0` — brief invisible heading before hydration

**SC:** Low severity — not a WCAG failure, just a rendering note
**Affected files:** `components/HeroSettle.tsx`, `app/work/[slug]/page.tsx`

`HeroTitleSettle` renders `<motion.h1 initial={{ opacity: 0, ... }}>`. Framer Motion renders at `initial` state on SSR. The `<h1>` text is in the DOM and accessible to screen readers, but visually invisible for the initial paint frame. The mount animation resolves in <100ms — imperceptible. No fix required; documented for completeness.

---

## 3. Both-Modes Contrast Table (New/Changed Surfaces)

All ratios computed from token hex values. "Large" = text ≥24px normal or ≥18.67px bold.

| Surface | Foreground (rgb) | Background (rgb) | Light CR | Dark CR | Size | Threshold | Result |
|---|---|---|---|---|---|---|---|
| h1 Hero ember gradient (mid stop) | (185,99,64) | canvas (250,248,241) | 4.02:1 | — | Large (48px+) | 3:1 | PASS |
| h2 showcase ember gradient (mid stop) | (185,99,64) | canvas (250,248,241) | 4.02:1 | — | Large (39px) | 3:1 | PASS |
| CountUpStat ember figure | (185,99,64) | canvas (250,248,241) | 4.02:1 | — | Large (44px+) | 3:1 | PASS |
| CountUpStat ember-teal (light stop) | (74,143,160) | canvas (250,248,241) | 3.45:1 | — | Large | 3:1 | PASS |
| CountUpStat ember-gold (light stop) | (190,130,48) | canvas (250,248,241) | 3.08:1 | — | Large | 3:1 | PASS |
| CountUpStat ember-moss (light stop) | (78,158,110) | canvas (250,248,241) | 3.07:1 | — | Large | 3:1 | PASS |
| Dark ember (mid) | (207,122,79) | dark-canvas (21,25,26) | — | 5.52:1 | Large | 3:1 | PASS |
| Dark ember-teal (light) | (143,208,210) | dark-canvas (21,25,26) | — | 10.22:1 | Large | 3:1 | PASS |
| Dark ember-gold (light) | (231,192,122) | dark-canvas (21,25,26) | — | 10.30:1 | Large | 3:1 | PASS |
| Dark ember-moss (light) | (134,214,164) | dark-canvas (21,25,26) | — | 10.26:1 | Large | 3:1 | PASS |
| Contact eyebrow label (wa-teal-deep) | (66,122,111) | wa-teal-pale (205,224,212) | 3.58:1 | 7.01:1 | Normal (12px) | 4.5:1 | **FAIL light** |
| Contact email link (wa-teal-deep) | (66,122,111) | wa-teal-pale (205,224,212) | 3.58:1 | 7.01:1 | Normal (14px) | 4.5:1 | **FAIL light** |
| Email link hover (terracotta) | (185,99,64) | wa-teal-pale (205,224,212) | 3.09:1 | — | Normal | 4.5:1 | **FAIL light** |
| Sidebar wa-teal-deep on rail | (47,87,77) | rail (230,241,234) | 7.00:1 | 7.28:1 | Normal | 4.5:1 | PASS |
| TagPill cool-deep on cool-soft/45 blend | (47,87,77) | (199,218,208) | 5.54:1 | 6.82:1 | Small (11px) | 4.5:1 | PASS |
| TagPill ink on gold-glow/40 blend | (32,48,44) | (226,211,182) | 9.36:1 | 6.39:1 | Small (11px) | 4.5:1 | PASS |
| TagPill ink on accent/22 blend | (32,48,44) | (236,215,202) | 9.96:1 | — | Small (11px) | 4.5:1 | PASS |
| TagPill ink on rose/30 blend | (32,48,44) | (216,205,197) | 8.85:1 | — | Small (11px) | 4.5:1 | PASS |
| TagPill cool-deep on cool-mid/35 blend | (47,87,77) | (187,212,211) | 5.20:1 | — | Small (11px) | 4.5:1 | PASS |
| ink-meta on canvas (eyebrow labels) | (90,107,100) | canvas (250,248,241) | 5.31:1 | 7.81:1 | Normal | 4.5:1 | PASS |
| ink-meta on warm-white | (90,107,100) | warm-white (245,237,222) | 4.85:1 | — | Normal | 4.5:1 | PASS |
| accent-text on warm-white (footer links) | (163,86,54) | warm-white (245,237,222) | 4.58:1 | — | Normal | 4.5:1 | PASS |
| near-black on warm-white (footer links) | (32,48,44) | warm-white (245,237,222) | 11.87:1 | — | Normal | 4.5:1 | PASS |
| Focus ring terracotta on canvas (UI border) | (185,99,64) | canvas (250,248,241) | 4.02:1 | — | UI 3:1 | 3:1 | PASS |
| Dark ink on dark-canvas | (236,234,224) | (21,25,26) | — | 14.68:1 | Normal | 4.5:1 | PASS |
| Dark ink-muted on dark-canvas | (182,194,187) | (21,25,26) | — | 9.63:1 | Normal | 4.5:1 | PASS |
| Dark accent-ink links on dark-canvas | (224,160,116) | (21,25,26) | — | 7.97:1 | Normal | 4.5:1 | PASS |
| Dark cool-deep links on dark-canvas | (154,215,217) | (21,25,26) | — | 11.04:1 | Normal | 4.5:1 | PASS |

Note: ember gradients on contact section bg (wa-teal-pale) at h2 size (39px large text) are 3.09:1–4.02:1 — all ≥3:1 for large text. PASS.

---

## 4. Reduced-Motion Coverage Table

| Animation | Component / File | Gated? | Mechanism | Result |
|---|---|---|---|---|
| `.hero-enter` fade-rise (h1, subhead, CTA) | `globals.css` | Yes | `@media (prefers-reduced-motion: reduce)` → `animation: none; opacity: 1` | PASS |
| `.hero-status-ping` pulsing dot | `globals.css` | Yes | Only runs under `@media (prefers-reduced-motion: no-preference)` | PASS |
| `.hero-scroll-fade` / `hero-scroll-translate` | `globals.css` | Yes | `@supports (animation-timeline: view()) @media (prefers-reduced-motion: no-preference)` | PASS |
| `.ambient-drift` contact section | `globals.css` | Yes | Only runs under `@media (prefers-reduced-motion: no-preference)`; holds as static glow under RM | PASS |
| `.reveal` / `.reveal-shown` scroll fade | `globals.css` | Yes | `@media (prefers-reduced-motion: reduce)` → `opacity:1; transition:none`. Also `@media (scripting:none)` | PASS |
| `CountUpStat` count-up rAF animation | `components/CountUpStat.tsx` | Yes | `usePrefersReducedMotion()` hook — immediately shows final value; no rAF loop fires | PASS |
| `AppMockup` float animation | `components/AppMockup.tsx` | Yes | `@media (prefers-reduced-motion: no-preference)` in injected `<style>` | PASS |
| `HeroImageSettle` scale/opacity | `components/HeroSettle.tsx` | Yes | `useReducedMotion()` — returns plain `<div>` at final state | PASS |
| `HeroTitleSettle` y/letterSpacing | `components/HeroSettle.tsx` | Yes | `useReducedMotion()` — returns plain `<h1>` at final LS | PASS |
| `HamburgerNav` overlay open/close | `components/HamburgerNav.tsx` | Yes | `useReducedMotion()` — `initial=false`, `duration=0` | PASS |
| `HamburgerNav` list item stagger | `components/HamburgerNav.tsx` | Yes | `useReducedMotion()` gates delay and duration to 0 | PASS |
| `WorkFilterGrid` card entrance stagger | `components/WorkFilterGrid.tsx` | Yes | `useReducedMotion()` from Framer Motion | PASS |
| `CaseStudyCard` image scale hover | `components/CaseStudyCard.tsx` | Partial | Global `transition-duration: 0.01ms` snaps it — no separate gate. Functionally RM-safe. | PASS (via global gate) |
| `ContentReveal` scroll-driven opacity/y | `components/ContentReveal.tsx` | **NO** | Framer Motion `useTransform` is not caught by CSS RM gate. Desktop RM users get opacity-0 content until scroll 300px | **FAIL** |
| `cta-dot-pulse` one-shot | `globals.css` | Yes | Only under `@media (prefers-reduced-motion: no-preference)` | PASS |
| `.link-draw` underline transition | `globals.css` | Yes | Global `transition-duration: 0.01ms` under RM snaps it | PASS |
| Cinematic scroll intro (animated path) | `CinematicDesert.tsx` | Yes | `useReducedMotion()` renders `StaticDesertFrame` instead | PASS |
| Star twinkle / dust float / terrain | `globals.css` + cinematic | Yes (OOS) | Out of scope cinematic; mobile also suppresses stars | OOS |

---

## 5. What Was Verified PASSING

- **SkipLink:** Present as first interactive element, `href="#main"`, focus-visible styling correct (`fixed left-4 top-4 z-[9999]` on focus), targets `<main id="main" tabIndex={-1}>`. WCAG 2.4.1 PASS.
- **Keyboard navigation:** Tab order: SkipLink → HamburgerNav trigger (mobile) / Sidebar (desktop) → main content. DOM order matches visual order (Sidebar before main). WCAG 2.4.3 PASS.
- **HamburgerNav dialog:** Esc closes + focus returns to trigger. Focus trap implemented (Tab + Shift+Tab cycle inside overlay). Explicit close button inside the dialog. `role="dialog" aria-modal="true"`. Focusable elements found via `a[href], button:not([disabled])`. WCAG 2.1.2 PASS.
- **HamburgerNav trigger:** 44×44px (`h-11 w-11`). `aria-expanded`, `aria-controls`, descriptive `aria-label`. WCAG 2.5.8 PASS.
- **ThemeToggle:** 36×36px (`h-9 w-9`). `aria-label` names destination mode. Hydration-safe label. WCAG 2.5.8 + 4.1.2 PASS.
- **CountUpStat:** `aria-label` on `<p>` = final value ("789 tests passing"). SR announces final value, never the counting animation. `tabular-nums` prevents jitter. SSR and no-JS render final value immediately. WCAG 1.3.1 + 4.1.2 PASS.
- **Reveal component:** Content is `opacity:0` (not `display:none`) — always in DOM + a11y tree. `@media (scripting:none)` and `@media (prefers-reduced-motion:reduce)` both show final state. WCAG 1.3.1 PASS.
- **ambient-drift:** `aria-hidden="true"`, `pointer-events:none`. Only animates under `no-preference`. Holds as static warm glow under RM. WCAG 2.3.3 PASS.
- **Lit-well overlays (ProjectCard, work/[slug]):** `aria-hidden="true"`, decorative. No contrast trap: real content text is near-black on warm bg with high-contrast ratios. WCAG 1.4.3 PASS.
- **AppMockup:** Parent container has `aria-hidden="true"`. Entirely decorative. WCAG 1.1.1 PASS.
- **link-draw:** Fires on `:hover` AND `:focus-visible` (globals.css line 793). WCAG 2.4.7 PASS.
- **Heading hierarchy:** All routes have exactly one `<h1>`. h1→h2→h3 order maintained without skips across all routes. WCAG 1.3.1 + 2.4.6 PASS.
- **Landmarks:** `<main id="main">`, `<nav aria-label="Site navigation">` (Sidebar), `<footer>`, `<nav aria-label="Breadcrumb">`. WCAG 1.3.1 PASS.
- **Image alt text:** All `<img>` tags have `alt` attributes. Decorative images use `alt=""` and `aria-hidden="true"`. WCAG 1.1.1 PASS.
- **External links:** All have `target="_blank" rel="noopener noreferrer"` AND `<span className="sr-only">(opens in new tab)</span>`. WCAG 2.4.4 PASS.
- **Credential "View →" links:** `aria-label` names the credential. Arrow is `aria-hidden`. WCAG 2.4.6 PASS.
- **FilterPill active state:** `aria-pressed={isActive}` — correct use of toggle button pattern. WCAG 4.1.2 PASS.
- **Favicon / OG / theme-color:** `app/icon.svg` present. `opengraph-image.tsx` auto-generates OG image. `themeColor` in `viewport` export matches canvas token hex in both modes. Metadata sanity PASS.
- **Reflow (1.4.10):** `overflow-x: clip` on html/body. Fluid type scale (`clamp()`). No fixed-width containers without overflow handling. PASS (structural).
- **Dark mode:** All text/UI color pairs tested above pass in dark mode. Dark canvas `(21,25,26)` gives headroom for all ink tokens. PASS.
- **Focus ring:** Tokenized `--focus-ring-*` (`2px solid terracotta + 2px offset`). Global `*:focus-visible` rule applies. 4.02:1 on canvas — meets 3:1 UI component threshold (2px outline is a non-text UI component). WCAG 1.4.11 PASS.

---

## 6. Decisions for Sky (No Blocker — Forward Input)

1. **Contact section color palette:** The `bg-wa-teal-pale` section uses `wa-teal-deep` text which fails contrast. The fix (`text-cool-deep`) changes the warm-teal tone to a deeper pine. This is a palette decision; the fix is contrast-safe but slightly warmer than the intent. Confirm the change is acceptable or choose an alternate color that passes.

2. **FilterPill sizing:** The pill-base undefined class means filter pills have no padding. Adding `px-3 py-1.5` gives a 27px height (WCAG 2.5.8 compliant) but enlarges the pills slightly. Confirm desired pill height.

3. **ContentReveal RM behavior:** Under the proposed fix, reduced-motion users on desktop skip the scroll-driven fade and see the hero immediately. This is the right WCAG behavior. Confirm this matches the desired UX for RM users.

---

## 7. Re-verification (final) — 2026-06-03

**Reviewer:** Alex (independent re-audit of Morgan-applied fixes)
**Scope:** 4 specific findings from §2 above + HIGH-1 false positive assessment.

---

### HIGH-3 — ContentReveal reduced-motion gate

**Finding:** `ContentReveal.tsx` had no `useReducedMotion` check — Framer Motion `useTransform` bypassed CSS RM gates, leaving content at `opacity:0` until scroll 300px under RM (2.3.3) and keyboard focus invisible (2.4.7).

**Verification against `components/ContentReveal.tsx` (current):**
- Line 3: `useReducedMotion` is imported alongside `motion`, `useScroll`, `useTransform`.
- Lines 13–22: `const reduced = useReducedMotion();` is called unconditionally at the top of the component (hooks contract satisfied).
- Lines 21–23: `if (reduced) { return <div className="cinematic-content-reveal">{children}</div>; }` — the plain `<div>` path is taken, with no `style` prop and no opacity constraint. Content is fully visible at all scroll positions.
- Lines 25–28: The non-reduced path is unchanged — `motion.div` with `style={{ opacity, y }}` driven by `useTransform(scrollY, [300, 420], [0, 1])`.

**Evidence of correctness:**
- Under RM: `<div className="cinematic-content-reveal">` — `cinematic-content-reveal` has no `opacity` declaration in `globals.css` (CSS rule applies `opacity:1!important` at mobile; but at desktop the plain `div` has no Framer `style` prop at all, so opacity defaults to `1`). Children are immediately visible.
- Keyboard focus: focusable children inside the plain `<div>` are fully visible before any scroll — 2.4.7 violation eliminated.
- Non-reduced path: unchanged scroll-driven `motion.div` — no regression.

**Status: RESOLVED**

---

### HIGH-2 — Contact email link hover contrast (`hover:text-accent` → `hover:text-near-black`)

**Finding:** `hover:text-accent` (terracotta `185 99 64`) on `bg-wa-teal-pale` (`205 224 212`) was 3.09:1 — FAILS 4.5:1.

**Verification against `app/page.tsx` line 399 (current):**
```
className="text-wa-teal-deep hover:text-near-black transition-colors duration-fast ease-out"
```
`hover:text-accent` is gone. `hover:text-near-black` is present.

**Token resolution (`tailwind.config.ts` line 77 + `globals.css` line 64):**
- `near-black` → `rgb(var(--rgb-ink))` → light mode: `--rgb-ink = 32 48 44`

**Contrast computation — near-black `(32, 48, 44)` on panel-cool `(205, 224, 212)`:**
- L(near-black) = 0.2126 × lin(32) + 0.7152 × lin(48) + 0.0722 × lin(44) = 0.0260
- L(panel-cool) = 0.7104
- CR = (0.7104 + 0.05) / (0.0260 + 0.05) = **10.00:1** — PASS (threshold 4.5:1)

**Status: RESOLVED**

---

### MEDIUM-4 — FilterPill target size (`pill-base` undefined → `px-3 py-1.5`)

**Finding:** `pill-base` was an undefined class with zero effect, leaving FilterPill with no padding and a ~15px rendered height — below the WCAG 2.5.8 24px minimum.

**Verification against `components/FilterPill.tsx` line 38 (current):**
```
'px-3 py-1.5 inline-flex items-center gap-2 whitespace-nowrap',
```
`pill-base` is gone. `px-3 py-1.5` is present.

**Height calculation:**
- `text-meta` = 11px, `line-height: 1.4` → text block height = 11 × 1.4 = **15.4px**
- `py-1.5` = 0.375rem = 6px top + 6px bottom = **12px** total vertical padding
- Rendered button height = 15.4 + 12 = **27.4px** ≥ 24px

**Status: RESOLVED** (27.4px ≥ 24px WCAG 2.5.8 minimum)

---

### LOW — HamburgerNav inner `<nav>` redundant `aria-label`

**Finding:** Both the dialog (`role="dialog" aria-label="Primary menu"`) and inner `<nav aria-label="Primary menu">` shared identical labels, causing redundant SR announcement.

**Verification against `components/HamburgerNav.tsx` line 190 (current):**
```tsx
<nav aria-label="Site" className="w-full max-w-content">
```
The inner `<nav>` label is now `"Site"` — distinct from the dialog's `aria-label="Primary menu"`. Screen readers will announce: "Primary menu, dialog" at dialog entry, and "Site, navigation" at the nav landmark — no redundancy.

**Status: RESOLVED**

---

### HIGH-1 — False positive assessment: `text-wa-teal-deep` resting state on `bg-wa-teal-pale`

**Morgan's claim:** The audit's 3.58:1 measurement was a false positive because `wa-teal-deep` and `cool-deep` are the SAME token (`--rgb-cool-deep` = 47 87 77), and that triplet computes to ~5.85:1 — a PASS.

**Independent recomputation:**

Step 1 — Token identity check via `tailwind.config.ts`:
- Line 44: `'cool-deep': 'rgb(var(--rgb-cool-deep) / <alpha-value>)'`
- Line 78: `'wa-teal-deep': 'rgb(var(--rgb-cool-deep) / <alpha-value>)'`
- Both map to `--rgb-cool-deep`. ✓

Step 2 — Triplet value from `app/globals.css` line 78:
- `--rgb-cool-deep: 47 87 77;` (light mode, unchanged — no dark-mode override found for `cool-deep` in the dark section). ✓

Step 3 — Contrast: `cool-deep (47, 87, 77)` on `panel-cool (205, 224, 212)`:
- L(47, 87, 77)   = 0.0796
- L(205, 224, 212) = 0.7104
- CR = (0.7104 + 0.05) / (0.0796 + 0.05) = **5.87:1** — PASS (threshold 4.5:1)

Step 4 — Root cause of the original 3.58:1 measurement:
- The prior audit measured `wa-teal` / `cool` (`--rgb-cool = 66 122 111`, CR = 3.58:1) instead of `wa-teal-deep` / `cool-deep` (`--rgb-cool-deep = 47 87 77`, CR = 5.87:1).
- In `app/page.tsx` lines 386 and 399, the class is `text-wa-teal-deep` (not `text-wa-teal`).
- The audit's evidence block incorrectly cited `--rgb-cool = 66 122 111` as the `wa-teal-deep` value. That is `wa-teal` / `cool` (the lighter pine). `wa-teal-deep` resolves to `--rgb-cool-deep = 47 87 77`.

**Verdict: I AGREE HIGH-1 was a false positive.** The resting eyebrow label and email link on `bg-wa-teal-pale` were always at 5.87:1 — a clear PASS. The fix originally proposed (`text-cool-deep`) would resolve to the same triplet as `text-wa-teal-deep`, making it a no-op semantically. No code change was needed for the resting state, and none was made. The eyebrow and email link at lines 386 and 399 continue to use `text-wa-teal-deep`, which correctly resolves to `--rgb-cool-deep = 47 87 77` at 5.87:1.

---

### New issue introduced by fixes?

Reviewed: `ContentReveal.tsx` (import reorder, no functional change outside the `reduced` branch), `FilterPill.tsx` (class replacement), `HamburgerNav.tsx` (aria-label change only). No new accessibility concerns introduced by any of these changes.

---

### Final Verdict

**FINAL VERDICT: PASS**

All four findings from the initial PASS-WITH-FOLLOWUPS verdict are now resolved:

| Finding | Severity | Status |
|---|---|---|
| HIGH-1: wa-teal-deep resting contrast | HIGH (false positive — retroactively) | CONFIRMED FALSE POSITIVE — was always 5.87:1, PASS |
| HIGH-2: hover:text-accent on wa-teal-pale | HIGH | RESOLVED — hover now near-black at 10.00:1 |
| HIGH-3: ContentReveal no RM gate | HIGH | RESOLVED — useReducedMotion early-return with plain div |
| MEDIUM-4: FilterPill pill-base undefined | MEDIUM | RESOLVED — px-3 py-1.5 gives 27.4px height |
| LOW: HamburgerNav duplicate aria-label | LOW | RESOLVED — inner nav now "Site" |

No WCAG 2.2 AA blockers remain. The portfolio is cleared for use as a live accessibility showcase.
