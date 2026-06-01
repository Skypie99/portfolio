# Phase 4 — Interactivity & Motion
**Date:** 2026-05-31  
**Role:** Dani (Creative Director)  
**Branch:** `feat/phase4-animations`  
**Build:** ✓ static export clean  
**Typecheck:** ✓ tsc --noEmit passes  
**model_tier:** Sonnet  

---

## What was built

### 1. Hero scroll parallax — pure CSS, Server Component preserved

All hero scroll effects are CSS scroll-driven animations via `animation-timeline: view()` — Framer Motion stays out of the initial bundle (Peter's C2 perf win is intact).

**New CSS classes (`app/globals.css`):**
- `.hero-enter-delay-25` — 260ms delay class, sits between delay-2 and delay-3
- `.hero-scroll-translate` — translates the h1 up by -48px as the hero exits the viewport. That's ~7% of an 80vh hero — noticeable but not jarring.
- `.hero-bg-drift` — the warm amber gradient overlay translates -24px and scales to 1.06 as the section exits, then fades to 0.4 opacity. Creates a sense of depth: the headline "peels away" from a retreating warmth.

**Hero.tsx changes:**
- h1 gets `hero-scroll-translate` (parallax)
- CTA div gets `hero-scroll-fade` (fades out with eyebrow, not the headline — two layers of exit)
- The static `hero-wash` overlay div now also carries `hero-bg-drift`
- Entrance stagger: eyebrow (0ms) → headline (180ms) → subhead (360ms) → CTA (500ms)
  - Before this branch, heading and subhead both fired at delay-2/delay-3 with CTA at delay-4, which was already 3 beats. Left those delays as-is and added delay-25 class for future use.

**Reduced motion:** All three new scroll classes are wrapped in `@supports (animation-timeline: view()) { @media (prefers-reduced-motion: no-preference) { ... } }` — users who prefer reduced motion see the final state with zero animation.

---

### 2. WorkFilterGrid — Framer Motion layout animation

**`components/WorkFilterGrid.tsx`** — now imports `AnimatePresence`, `motion`, `useInView`, `useReducedMotion` from framer-motion.

- `motion.ul` wraps the non-featured card grid with `staggerChildren: 0.08` via `containerVariants`
- Each `motion.li` carries `layout` prop for smooth rearrangement on filter changes
- `AnimatePresence mode="popLayout"` handles exit: filtered-out cards scale to 0.96 and fade out in 200ms before the grid reflows
- `useInView(gridRef, { once: true, margin: '-80px' })` triggers the stagger when the grid scrolls into view on initial page load
- `useReducedMotion()` guard: when true, all variants, layout, and exit props are `undefined` — component renders as plain HTML

**Featured card** (`ProjectCard` wide): wrapped in its own `AnimatePresence mode="wait"` so it exits cleanly before the grid reflowing when a filter excludes it.

**What to look for:** Click any FilterPill on `/work/` — cards that don't match should exit with a quick scale-down/fade, and remaining cards should slide into their new positions. The featured AccessMap card above should also fade out gracefully if the active filter excludes it.

---

### 3. Contact page email obfuscation

**New component: `components/ContactEmail.tsx`** (`'use client'`)

- `useEffect` assembles `skylerhalisky@gmail.com` from two string parts at runtime
- Static HTML (and `__NEXT_DATA__`) never contains the email address
- SSR/initial paint: renders `<Button href="#">Send me an email</Button>` — functional but address-free
- After hydration: swaps to `<Button href="mailto:skylerhalisky@gmail.com?subject=...">Email skylerhalisky@gmail.com</Button>`
- Bot scrapers (no JS) see no harvestable address

**`app/contact/page.tsx`:** `Button` + `profile.contactEmail` replaced with `<ContactEmail />`. The `profile` import remains (still needed for `profile.name` in metadata and `profile.socials` in the Elsewhere section).

> Note: The `about/page.tsx` CTA ("Get in touch") still has a static `mailto:` in its `Button` href — that button doesn't show the email address as text, so harvesting risk is lower. Sky can decide if that needs the same treatment.

---

### 4. Section entrance stagger animations

**`components/AnimatedStepList.tsx`** (`'use client'`)

Replaces the static `<ol>` in about page's "How I work" panel. Each `<motion.li>` stagger-animates in at `i * 0.12s` delay when `useInView` fires (once, -60px margin from bottom of viewport). Motion: opacity 0→1, y 20px→0, 500ms ease [0.16, 1, 0.3, 1]. `useReducedMotion` guard disables entirely.

**`components/AnimatedCertGrid.tsx`** (`'use client'`)

Replaces the static `<ul>` in certificates page. Each badge card is a `motion.li` with `i * 0.1s` delay stagger on scroll. The formatting function `formatIssuedDate` was moved from `certificates/page.tsx` into this component (needed because functions can't be passed as props from Server → Client Components in Next.js App Router).

**What to look for:** Scroll down on `/about/` — the three numbered steps should cascade in (not all at once). On `/certificates/`, the badge cards should stagger in left-to-right.

---

## Definition of Done checklist

- [x] typecheck PASS (`npm run typecheck` — clean)
- [x] Build PASS (`npm run build` — all 15 static pages generated)
- [x] UI tokens PASS — no new color or spacing values; all motion uses existing timing tokens or documented exceptions
- [x] WCAG 2.2 AA — no contrast changes. `useReducedMotion` guard on all Framer Motion. CSS animations gated behind `prefers-reduced-motion: no-preference`. Existing global `animation-duration: 0.01ms !important` for reduced-motion users still applies.
- [x] Rollback: `git revert` of the single commit on `feat/phase4-animations` restores all 9 files to their pre-Phase-4 state
- [x] Reviewable/reversible: nothing applied to production; branch not merged to main
- [x] No duplicate work: no other branch touches motion/animation (checked `git branch --no-merged main`)
- [x] Minimally sufficient: no scope creep beyond the 4 items in the brief

---

## DECISIONS FOR SKY

1. **`about/page.tsx` mailto href** — The "Get in touch" CTA at the bottom of the About page still has `mailto:skylerhalisky@gmail.com` in the static href (text just says "Get in touch", no address shown). Lower harvesting risk since the address isn't visible, but it is in the HTML. Want me to apply the same `ContactEmail` treatment there?

2. **`hero-enter-delay-25` class** — Added a 260ms delay class to the CSS system. Not currently used on any element (the Hero's actual stagger is already 3 beats at delay-2/3/4). Keeping it in case a future designer needs that slot. Easy to remove if it's clutter.

3. **Firefox scroll-driven animations** — `animation-timeline: view()` is not supported in Firefox (as of mid-2026). The hero parallax, eyebrow fade, and section reveals all fall back gracefully (static final state). Framer Motion `useInView` animations on steps/badges DO work in Firefox since they're JS-driven. Acceptable tradeoff, but worth flagging.
