# Motion System — skypistudio.com

**Single source of truth for all site motion below the locked cinematic landing.**
Created 2026-06-03 (motion-polish pass). Tokens live in `app/globals.css :root`
and are mirrored in `tailwind.config.ts`. This doc explains the *why* and the
reduced-motion contract for every pattern.

---

## 0. The one rule

The intro (`components/cinematic/**`, `CinematicIntro.tsx`, `cinematic-masters/**`,
`app/globals.css` lines ~799–EOF, and the `--ease-cinematic` / `--dur-cinematic-scroll`
/ `--font-cormorant` / `--sidebar-w` tokens) is **locked**. We *study* it and build a
**calm sibling** language for the rest of the site. We never reuse `--ease-cinematic`
itself, and we never touch the hero / `<ContentReveal>` opening handoff.

---

## 1. What we learned from the intro (the vocabulary we echo)

| Intro trait | Value | How we echo it (calmly) |
|---|---|---|
| Signature easing | quint S-curve `cubic-bezier(0.83,0,0.17,1)` | `--ease-gh-glide` — same family, gentler |
| Weighted "buttery" feel | GSAP `scrub: 1.0` (1s catch-up lag) | slow durations + soft-landing easings |
| Layered parallax depth | far slow (scale→1.08) / near fast (scale→1.52) | `--parallax-far/mid/near` depth tiers |
| Golden-hour light | grade 0.35→1.0 over scroll | scroll-linked warm washes (decorative only) |
| "Crystallise / settle" | letter-spacing tighten + `power2.out` | `--ease-gh-settle` for arrivals |
| "Camera lands, keeps moving" | motion settles then drifts | enter transitions + ambient drift continuity |

**Register: cinematic depth, calm.** Perceptible on first scroll, but every move is
slow, soft, and weighted — never poppy, bouncy, or kinetic. ("Expensive" = craft and
choreography, not flash.)

---

## 2. Easing system

A small named set so the whole site feels related. Use Tailwind utilities
(`ease-gh-glide`, `ease-gh-settle`, `ease-entrance`, `ease-out`) or the `var(--…)`.

| Token | Curve | Use for |
|---|---|---|
| `--ease-gh-glide` | `cubic-bezier(0.5, 0, 0.1, 1)` | **Scene moves** — page transitions, parallax, anything that should feel like a slow camera glide. Weighted in *and* out. |
| `--ease-gh-settle` | `cubic-bezier(0.22, 0.9, 0.26, 1)` | **Arrivals** — large section reveals that drift in and settle. Soft landing, long tail. |
| `--ease-entrance` *(existing)* | `cubic-bezier(0.16, 1, 0.3, 1)` | Standard reveals / micro-entrances (expo-out). |
| `--ease-out` *(existing)* | `cubic-bezier(0.22, 1, 0.36, 1)` | Hover / interactive micro-transitions. |
| `--ease-snap` *(existing, RM-gated)* | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Tiny overshoot pops only. Use sparingly; never on scene motion. |

`--ease-cinematic` is **off-limits** (intro-only).

---

## 3. Duration scale

| Tier | Token | Value | Use for |
|---|---|---|---|
| micro | `--dur-fast` | 180ms | hover, link draw, color shifts |
| micro | `--dur-base` | 280ms | card lift, pill activate |
| standard | `--dur-slow` | 520ms | image scale, overlay |
| standard | `--dur-reveal` | 900ms | default scroll reveal |
| **scene** | `--dur-transition` | **420ms** | route-change crossfade |
| **scene** | `--dur-scene` | **1200ms** | large section-header reveal (slower = more cinematic) |
| ambient | `--dur-ambient` | 26s | autonomous golden drift |

Tailwind: `duration-transition`, `duration-scene` (plus existing `duration-fast/base/slow/reveal`).

---

## 4. Stagger rules

- `--stagger-step: 80ms` — default per-item delay (matches `<Reveal index>` today).
  Use for lists/grids of small items (cards, chips, credentials).
- `--stagger-scene: 120ms` — larger, more deliberate sequences (a few big blocks).
- Cap total stagger so the last item isn't perceptibly late: aim ≤ ~6 items at
  `step`, ≤ ~4 at `scene`. Beyond that, reveal as a group.

---

## 5. Parallax / depth

Depth = fraction of an element's scroll travel offered as counter-movement. Far
layers move least (feel distant); near layers move most (feel close) — the intro's
slow-far / fast-near logic.

| Token | Value | Layer |
|---|---|---|
| `--parallax-far` | 0.04 | background washes, distant decorative glows |
| `--parallax-mid` | 0.08 | section accents, mid imagery |
| `--parallax-near` | 0.14 | hero imagery on detail pages (case-study / blog) |

**Two implementations (pick by need):**
1. **CSS scroll-timeline** (`animation-timeline: view()`) for purely decorative,
   `aria-hidden` washes — zero JS, off-main-thread. Use new `.gh-parallax-*` class
   names (never the hero's existing scroll-timeline classes at `globals.css:719`).
2. **`useParallax(depth)`** in `lib/motion.ts` — one shared rAF loop + one
   IntersectionObserver, batched `translate3d` writes. For content imagery where CSS
   scroll-timeline support is uncertain. SSR-safe.

Apply only to decorative layers and detail-page hero imagery. **Never** the cinematic
or the homepage hero.

---

## 6. Reduced-motion contract (the floor — defined up front for every pattern)

`prefers-reduced-motion: reduce` → the **final, resting state** with no movement.
Content is always present in the DOM (opacity, not `display`) so it stays in the a11y
tree and is crawlable. Two gates, matching existing site patterns:

- **CSS patterns** (`@media (prefers-reduced-motion: reduce)`): set `animation: none`,
  `transition: none`, `transform: none`, `opacity: 1`. Also gate decorative motion
  behind `@media (prefers-reduced-motion: no-preference)` so it never starts.
- **JS hooks**: `usePrefersReducedMotion()` (from `lib/motion.ts`) → early-return the
  resting state; `useParallax` writes **no transform** under RM.

| Pattern | Normal | Reduced motion |
|---|---|---|
| Page transition | fade + 8px rise, 420ms | appears at final state instantly |
| Scroll reveal | fade + rise (travel/easing per variant) | visible, no transform |
| Parallax | scroll-linked `translate3d` | no transform (static) |
| Decorative wash drift | slow autonomous loop | static glow |
| Hover micro | transform/color | unchanged (hover intent is fine) |

Also honor `@media (scripting: none)` for JS-driven reveals (show final state).

---

## 7. Performance contract

- Animate **only** `transform` and `opacity` (compositor-only → 60fps).
- One shared rAF loop + one IntersectionObserver for all parallax (no per-element
  scroll listeners). `will-change` only while a layer is in view.
- New motion must not meaningfully grow First Load JS (baseline: home `/` = 206 kB).
  Prefer vanilla IO/CSS; reach for framer-motion only where it already lives.

---

## 8. Files

- Tokens: `app/globals.css :root` (motion-polish block) + `tailwind.config.ts`.
- Primitives: `lib/motion.ts` (`useInViewOnce`, `usePrefersReducedMotion`, `useParallax`),
  `components/Reveal.tsx`, `app/template.tsx` (route transition).
- Guard: `lib/__tests__/token-parity.test.ts` (new tokens are additive — they don't
  touch the asserted `step-*` / `entrance|exit|snap` / `sm|md|lg|xl` sets).

---

## 9. High-end polish round (2026-06-03) — additions

Site-wide refinement + richer motion on the flat sections. No GSAP below the landing
(GSAP is intro-only); all new motion is CSS + `lib/motion.ts`. The cinematic intro is
LOCKED and was not touched.

**New primitives (`lib/motion.ts`):**
- `useScrollProgress()` — sets `--scroll-progress` (0→1 page-scroll fraction) on `<html>`
  via one rAF-throttled scroll listener; consumers drive a compositor-only
  `transform: scaleY(var(--scroll-progress))`. Zero React re-renders.
  **Reduced motion → no-op** (the var stays unset → `scaleY(0)` → indicator collapsed).
- `useActiveSection(ids)` — IntersectionObserver scroll-spy returning the id of the
  section crossing the viewport's middle band (for nav active-state). Updates only on
  change. Not motion → runs under reduced motion too. Pass a stable ids array.

**New patterns + reduced-motion contract:**
| Pattern | Where | Motion | Reduced motion |
|---|---|---|---|
| Layered parallax wash | Showcase, Process (+ existing About/Contact) | `ParallaxWash` far tier drifts on scroll | static glow |
| Depth reveals | Showcase cells, Process steps, About block, Certificates rows | `Reveal variant="depth"` (scale-settle + rise, staggered) | final state, instant |
| Sidebar progress hairline | `SidebarProgress` (desktop rail) | `scaleY(var(--scroll-progress))` fill | collapsed (var 0) |
| Row hover slide | Certificates | `group-hover:translate-x-1` on content | instant (hover, not scroll) |
| Footer threshold glow | Footer | static warm hairline-gradient | unchanged |

All animate transform/opacity only; the parallax reuses the single shared rAF; AA holds
in both modes over every wash. `useActiveSection` is wired for the mobile nav active-state
(follow-up).
