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

---

## §10 — Organic + interactive pass (2026-06-03)

Natural physics, soft living detail, tactile response — extending the calm vocabulary above
(no new easings; no GSAP below the landing; the intro scene is untouched). Four signature moves
plus a coherence sweep. Every new motion is transform/opacity-only and reduced-motion safe.

**Hooks (`lib/motion.ts`, dependency-free, fine-pointer + RM gated):**
- `useSpotlight()` — now ALSO publishes a **lagged** caustic position `--cx`/`--cy` (0–100%) via a
  self-terminating rAF lerp (eases toward the pointer, home to 50/50 on leave) alongside the raw
  `--mx`/`--my`/`--hover` it already set. The specular tracks raw; the caustic trails. (A CSS
  transition can't animate a `var()`-driven transform, so the lag lives in JS.)
- `useMagnetic(strength = 0.22, max = 6)` — capped `translate3d` toward the cursor on a CTA; clears
  on leave so Button's own `transition: transform` springs it home. Mirrors `useSpotlight`'s shape.

**New patterns + reduced-motion contract:**
| Pattern | Where | Motion | Reduced motion / touch |
|---|---|---|---|
| Living caustic ("one sun") | `.cf-caustic` + `.cf-prism` in `CardField` (every glass card: work + certs) | warm pool damp-tracks `--cx/--cy`, cool prism counter-drifts → internal parallax under the cursor specular | `useSpotlight` never sets the vars → both hold centered (static) |
| Magnetic CTA | `MagneticButton` (closing "Write to me." + Contact) | faint capped pull toward cursor, eased spring-home | `useMagnetic` no-op → ordinary Button |
| Tactile work media | `TactileMedia` (detail hero + gallery) | hover scale 1→1.05 (group) + `useParallax` scroll-drift in an oversized clipped well | parallax static; hover is intent (fine under RM) |
| Settle on arrival | `SettleHeading` (every route h1: work, certs, about, contact, 404, blog) | mount carve-in: opacity/y + letter-spacing 0.10em→rest, echoing the cinematic wordmark | renders final state instantly |
| Weighted grid cascade | `WorkFilterGrid`, `AnimatedCertGrid`, featured card via `Reveal variant="depth"` | per-item rise + `scale(0.985)` settle on `gh-settle`, staggered | gated → final state |
| Tactile micro-feedback | card numerals, accent dividers (`scale-x`), CTA + back arrows, About/Contact rows, TagPill | `group-hover` color/transform on `gh-glide` | snap instant (hover intent; global RM block zeroes duration) |

No `width`/`border-width` animation (CLS); dividers grow via `scale-x` (compositor). The caustic and
magnetic both ride the existing fine-pointer + RM gates, so touch and reduced-motion get a calm,
static, fully-AA site. The intro scene (GSAP, `components/cinematic/**`, `globals.css` 1044→EOF) is
byte-identical — none of the above touches it.

---

## §11 — WOW continuity pass (2026-06-04) — "one cinematic piece"

The intro's golden light + signature *carve-in* now carry through the page, so the site reads as one
piece instead of a stunning intro on an ordinary page. The intro is studied read-only; its quint curve
`cubic-bezier(0.83,0,0.17,1)` is **never** reused below the landing — new motion uses the site easings.
The intro files are byte-identical (verified by fingerprint).

| Move | Where | Motion | Reduced motion / fallback |
|---|---|---|---|
| **Handoff bloom** ("sun follows you in") | `.hero-bg-drift` keyframe (`globals.css`) | the warm hero wash now lives over the hero's full pass: **blooms opacity 0.5→1 on ENTRY** (light resolves in as the intro releases), holds, then drifts up + fades on exit (original behaviour preserved). One scroll-linked animation (`animation-range: entry 0% exit 100%`); no two-animation opacity conflict | `@supports(view())` + RM gated → wash sits at full opacity (current behaviour). Headline also lands before the light deepens (readability) |
| **Light continuity** ("sun in every room") | `ParallaxWash depth="far"` added to the homepage Certificates section, `/work/` + `/certificates/` headers, and `/work/[slug]` gallery + "More work" | the warm golden field now persists across every major section, not just some | decorative `aria-hidden` behind content (`z-10`); RM → static glow |
| **Lit focal plane** | `CardField` `featured` prop (`ProjectCard` passes `d.featured`) | featured card's warm caustic alpha 0.20→0.28 — reads "closer to the sun", echoing the intro's focal-depth hierarchy | static; decorative (behind content) so no contrast impact |
| **Carve-in recurs** | `Reveal variant="carve"` (`.reveal-carve`), applied to case-study body `##` H2s; prose uses `depth` | a brief `filter: blur(5px)→0` + 18px rise on `--ease-gh-settle` — the intro title's focus-pull recurs as the editorial body reveals in reading order | **sharp at rest**; RM / no-JS → instantly sharp (`filter: none`), never blurred, never animates while unreadable |
| **CTA "sun at rest" echo** | `/work/[slug]` closing CTA | the homepage Contact `ambient-drift` warm field + `Reveal variant="scene"` recur on every CTA entry | `ambient-drift` is no-preference gated → static glow |

Plus craft: Process step dividers → `.rule-ember` gradient hairlines; About Principles/Currently body →
`variant="depth"`; Contact "Elsewhere" h2 → `.ember`; showcase stat figures gain a `group-hover` lean
(compositor, origin-left). All transform/opacity/filter-only, AA-preserved, RM-safe.

## §12 — Show the work, cinematically (2026-06-04) — `ProductReveal`

The reusable product-media component (`components/ProductReveal.tsx` + `DeviceFrame.tsx`) that shows
every product (placeholder now, real screenshot via a one-line swap later — see `SHOW_WORK_PLAN.md`).
It echoes the locked intro's film language with the SITE's own motion only; no GSAP, no new dependency.

| Move | Where | Motion | Reduced motion / fallback |
|---|---|---|---|
| **Golden-hour placeholder** | `.pr-world` / `.pr-frame-*` / `.pr-horizon` (`globals.css`, outside the `.cdesert-*` range) | **none — static paint.** The wow is the warm world + per-medium device frame, not animation | identical: it never animates, so RM / no-JS show the exact same placeholder |
| **Parallax drift** | the media layer reuses `TactileMedia` (`useParallax`, hero `.06` / card `.04` / shot `.08`) inside an `inset-[-12%]` clipped well | one compositor `translate3d` on scroll — the intro's slow-far/fast-near depth, reused | `useParallax` writes no transform under RM / no-JS → image sits centred |
| **Scroll/mount reveal** | owned by the CALL SITE, never nested: cards by their existing `<Reveal>`, the hero by `HeroImageSettle` | the band/hero cross-dissolves + settles as today | the existing `.reveal` + `HeroImageSettle` RM/no-JS final-state paths cover it |
| **Card hover** | `group-hover:scale-[1.05]` on the real screenshot (TactileMedia) + the glass card's own `:hover` | a quiet lean-in on the media; glass lift unchanged | hover intent only; touch never hovers; no RM concern |

Tokens consumed, never mutated: `--ease-gh-glide`/`--ease-gh-settle`, `--dur-slow`, `--rgb-*`,
`--shadow-lg`, `--scrim`. The intro's quint curve is **not** reused; the intro files stay byte-identical;
`token-parity` stays green (no `--fs-*`/`--ease-*`/`--shadow-*` mutated). New CSS classes: `.pr-world`,
`.pr-horizon`, `.pr-scrim`, `.pr-frame[-phone|-window|-plate]`, `.pr-screen[-phone|-plate]`, `.pr-notch`,
`.pr-titlebar`.

## §13 — Continuous world (2026-06-05) — "One continuous world" (Direction A)

The golden-hour desert is now a **persistent, scroll-evolving backdrop** behind the whole
post-intro site, so the page travels *through* one world golden → dusk → night. The intro is
studied read-only and stays byte-identical; **no GSAP below the landing** — the arc is one CSS var.

| Move | Where | Motion | Reduced motion / fallback |
|---|---|---|---|
| **Day→night arc** | `WorldBackdrop` (fixed, z:-1, `aria-hidden`), mounted in `app/layout.tsx` | `useDayNight()` sets `--day-night` (0→1) on `<html>` via ONE rAF-throttled scroll listener; a base **dusk** sky with **day** crossfading out (0→0.5) and **night** crossfading in (0.5→1) — compositor-only `opacity` | **no-op** → `var(--day-night, var(--day-night-rest))`; rests at golden (light) / night (dark). Static, premium |
| **Sun + horizon** | `.world-sun` / `.world-horizon` | sun lowers (`translateY`) + dims; horizon line fades with the light — transform/opacity only | hold at the rest state |
| **Content travels through** | `.world-surface[-alt|-cool|-cool-pale]` replace the opaque section `bg-*` | translucent panels (static paint) let the fixed world show as content scrolls over it | unchanged — static translucency |

**Arc origin:** remapped to begin at the post-intro handoff — `--day-night` is 0 (full golden) the
instant the locked 680vh intro finishes (anchored to `.cinematic-content-reveal` on the homepage; page
top on sub-pages). **Theme ↔ scroll rule:** the toggle owns the readable theme (light = the daylight
half of the world, dark = the night half); scroll only drives the backdrop's time-of-day. They never
fight (different layers). New tokens: `--day-night-rest`, `--sky-day/dusk/night-1..4`, `--sky-sun`,
`--surface-alpha[-alt|-cool]` — all additive (`token-parity` green; intro untouched). Readability:
panel alphas are tuned so ALL text clears WCAG AA over every world state in both themes (measured).
Hook: `useDayNight` in `lib/motion.ts`; component: `components/WorldBackdrop.tsx`. See
`CONTINUOUS_WORLD_PLAN.md`.
