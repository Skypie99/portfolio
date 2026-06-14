# Continuous World — build plan (Direction A, "One continuous world")

_Created 2026-06-05. Flagship build: make the golden-hour desert a PERSISTENT, EVOLVING
backdrop the whole post-intro page travels through. As you scroll, the sun lowers and the
grade shifts golden → dusk → night; that day→night arc IS the light→dark transition.
Content keeps sitting on (now-translucent) frosted panels + scrim. The locked intro is
untouched; B (show-the-work) and D (filmic transitions + scroll-spy) stay intact._

Branch: `feature/portfolio-continuous-world-2026-06-05` (off `main` @ 88ab9f8, which
already contains B PR#1 + C + D PR#7 — verified).

---

## 0. PROTECTED — the locked intro (read-only; never edit/rename/move/re-time)

HARD RULE #1. These are studied for their golden-hour language only. **Auto-fail if touched.**
Where ambiguous I protect the broader set (per the brief):

- `components/cinematic/**` — `CinematicDesert.tsx`, `FilmGrain.tsx`, `Layer.tsx`,
  `StaticDesertFrame.tsx`, `plates.ts`, `useReducedMotion.ts`, `__tests__/CinematicDesert.test.tsx`
- `components/CinematicIntro.tsx` (Framer title card; `.cinematic-*` + `--ease-cinematic`)
- `app/globals.css` — the **`.cinematic-*` range (~1225–1775)** and the **`.cdesert-*` range
  (~1777–EOF)**, plus `--font-cormorant` / `--sidebar-w` consumers. I append world CSS only
  in the SITE-UI region, well above 1225, in a clearly-marked additive block.
- `app/tokens-phase2.css` — `--ease-cinematic`, `--dur-cinematic-scroll` (scope-isolated, append-only)
- `cinematic-masters/**`, `public/images/cinematic/**` — intro source + shipped plates
- `designs/AESTHETIC_LOCKFILE.md`, `designs/CINEMATIC_INTRO.md` — the visual authority docs
- `app/page.tsx` lines 73–74 (the `<CinematicDesert/>` mount) + the `<ContentReveal>` wrapper —
  left byte-identical. I only edit the section `bg-*` classes BELOW the handoff.

Verification gate (run before declaring done): `git diff main -- components/cinematic app/tokens-phase2.css cinematic-masters` must be **empty**, and the `.cdesert-*`/`.cinematic-*` ranges of globals.css unchanged.

## 0b. LOCKED FLOOR — don't regress (layer onto these)

Type/colour system; measured WCAG AA in both themes; `prefers-reduced-motion`; `(scripting:none)`
fallback; existing motion; **B** `ProductReveal`/`DeviceFrame`; **C** WOW continuity washes
(`ParallaxWash`, `.hero-wash`, `ambient-drift`, carve-in); **D** `ViewTransitions` cross-dissolve +
`SidebarSectionNav` scroll-spy. The backdrop sits BEHIND all of these and must never cover them.

---

## 1. The handoff (where the intro leaves off → where the world begins)

The intro is a 680vh pinned GSAP push that **ends FULL GOLDEN**: `--cdesert-grade-mix:1`
(stops `245 196 138` → `224 154 94` → `176 104 58`) + `--cdesert-expose:1` (`255 224 182` …)
on the golden fluted cliff, wordmark carved + held. `StaticDesertFrame` (reduced-motion) freezes
that same golden end.

The world's **golden state must match that** so the seam is light-continuous: warm golds over
sandstone earth (`--rgb-earth`/`--rgb-earth-deep`), echoing the approved `.pr-world`. The imagery
changes (photographic cliff → atmospheric world) but the LIGHT is unbroken — which is what carries
the "one world" read. Anchor: the arc's `day-night = 0` (golden) is pinned to the moment the
post-intro content (`.cinematic-content-reveal`, homepage-only) reaches the viewport top — i.e. the
instant the intro hands off.

---

## 2. The scroll map + day→night arc

**Homepage** (the flagship scroll). `day-night` is remapped to begin at content top:

| Scroll region | Section | Sun / grade (`day-night`) |
|---|---|---|
| intro (0–680vh) | `<CinematicDesert/>` (LOCKED) | — (world occluded by opaque intro) |
| handoff | `#hero` | **0.00 — full golden hour** (matches intro end) |
| ~0.12 | `#showcase` (Live) | golden, sun high-right |
| ~0.30 | `#work` | warm gold → first warmth of dusk |
| ~0.48 | `#process` | **dusk** — sun at the horizon |
| ~0.62 | `#about` | deepening dusk |
| ~0.78 | `#certificates` | twilight, sun set |
| ~0.92 | `#contact` | deepening toward night |
| 1.00 | footer threshold enters viewport bottom | **full night + peak ember** — held through `<Footer/>` |

> **Z5/SE-2 (2026-06-14):** the arc END re-anchored from the document bottom to the **footer threshold**
> (`footerTop − innerHeight`), so `--day-night` hits 1.0 the instant the footer's top hairline crests the
> viewport bottom — the ending is witnessed at the door, not behind the opaque footer. dn then holds at 1.0
> through the footer. Same linear, theme-invariant mapping; only the end moved. See `lib/motion.ts useDayNight`.

**Sub-pages** (`/work`, `/work/[slug]`, `/about`, `/certificates`, `/contact`, `/blog`): no intro,
so the arc runs top(0, golden) → footer threshold(1, night). Each page is its own short day→night "scene";
the View-Transitions cross-dissolve smooths the reset to golden on entry. Documented as intentional.

Mapping is **linear** and **theme-invariant** (protected — Z5 moved only the end anchor, not the curve).

---

## 3. Architecture (additive; compositor-only)

- **`components/WorldBackdrop.tsx`** (new client component, mounted ONCE in `app/layout.tsx`
  inside `<ThemeProvider>`). Renders a `position:fixed; inset:0; z-index:-1; pointer-events:none;
  aria-hidden` stage with: a base **dusk** sky, a **day** sky (fades out 0→0.5), a **night** sky
  (fades in 0.5→1), a **sun** glow (lowers + dims via transform/opacity), and a soft **dune/horizon**
  read. All driven by ONE CSS var `--day-night`.
- **`lib/motion.ts → useDayNight()`** (new): one rAF-throttled scroll listener sets `--day-night`
  (0→1) on `<html>`, remapped to start at `.cinematic-content-reveal` offsetTop (homepage) or 0
  (sub-pages). Mirrors `useScrollProgress` exactly (SSR-safe; **reduced-motion → no-op**, var stays
  unset). Recomputes on resize.
- **Translucent surfaces**: new plain CSS classes `.world-surface` / `-alt` / `-cool` / `-cool-pale`
  (canvas / canvas-alt / wash-cool / panel-cool at a **static** safe alpha) replace the opaque
  `bg-*` on every post-intro section + footer, so the fixed world shows through as content scrolls
  over it. Static paint (no per-scroll repaint). Glass CARDS keep their own backdrop-blur.
- **Z-stacking**: body keeps `bg-canvas` as the ultimate backstop BEHIND the world; world at z-index
  −1; in-flow content (incl. the pinned intro at z 50) paints above it; `body::after` grain (z 100)
  stays on top. No transforms added to `<main>`/ancestors (so the intro's GSAP `position:fixed` pin
  is unaffected).

New CSS lives in the SITE-UI region of globals.css (outside the locked ranges), consuming tokens
only — `token-parity` stays green. No new dependency. No new image asset (the world is CSS; a
photographic AVIF horizon plane is offered as a future option in DECISIONS).

---

## 4. Theme ↔ scroll reconciliation rule (CHOSEN — flagged for Sky)

**Two inputs, two layers, they never fight:**
- **Theme toggle / system pref → the BASE theme** (light or dark). Owns every *readable* surface
  (panels, text, chrome). Persistent, announced, the user's explicit choice. Guarantees stable AA.
- **Scroll → the backdrop's TIME-OF-DAY** (golden→dusk→night) behind the frosted panels only.

Framing that honours "the day→night arc IS the light→dark transition":
**light theme = the daylight half of the world; dark theme = the night half.** Scroll moves the sun
WITHIN each; toggling steps between the day-world and the night-world. So light theme runs
golden→**twilight** (stays light enough for cream panels + dark ink AA); dark theme runs
deep-amber→**true night**. A light-mode reader who wants full night-drama toggles to dark.

Reduced-motion / no-JS rest at a theme-appropriate static world: light→golden, dark→night
(`--day-night-rest` = 0 / 1). Alternative considered + NOT chosen: scroll flips the actual content
theme (a11y risk — text contrast would depend on scroll position). Logged in DECISIONS.

---

## 5. Readability floor (pass/fail) — "readability over spectacle"

- Panels are **translucent at a STATIC alpha chosen so body text clears WCAG AA over the WORST
  world state** in each theme (light-twilight / dark-night). Measured at golden / dusk / night in
  both themes before sign-off; alpha raised until it passes (target ≥7:1 body where the system
  already sits, ≥4.5:1 minimum for small meta/links).
- Light-theme "night" is deliberately a **twilight** (not black) so 0.8-ish cream panels never drop
  ink below AA. Dark theme can go truly dark (light ink stays AA).
- A `.world-scrim` helper is available if any single surface needs extra guard; the panel alpha is
  the primary guarantee.
- Decorative washes/world are always `aria-hidden`, behind content; nothing the day/night shift
  conveys is information-only (it's atmosphere; all content is textual + theme-toggle-controlled).

## 6. Reduced-motion / no-JS / mobile

- `prefers-reduced-motion: reduce` AND `(scripting: none)`: `useDayNight` no-ops → world rests at
  the static theme-appropriate state (premium, intentional, zero scroll-linked motion). Sun doesn't
  move. Sections are already static translucent paint.
- Mobile: the effect is lightweight (opacity/transform on ~4 fixed layers). Keep it on (intro
  already animates on phones), VERIFY 60fps; documented fallback = serve the static world on
  coarse-pointer/low-power if testing shows jank.

## 7. Performance budget

- Animate **transform + opacity only**; world = 1 fixed stage + ≤4 promoted layers (`will-change`
  on the day/night/sun layers only). No `background-color`/gradient animation on scroll (no paint
  storms). Sections are static paint; translucency composites over the fixed world on the GPU.
- One added rAF-throttled scroll listener (`useDayNight`), same shape as the existing
  `useScrollProgress`. No measurable First-Load-JS growth (tiny component + hook; no new deps).
- Must hold 60fps on the post-intro scroll and not regress cold-start or the intro's smoothness.

## 8. Also — project URL / subdomain cleanup (separate workstream)

Audit every project link (work cards front/back, `/work/[slug]`, LIVE/GITHUB/VIEW, footer, nav).
Update only **clearly-finished** subdomains; never invent one; flag ambiguous/half-migrated in
DECISIONS. Note interaction with the pending `feature/canonical-apex-domain` PR (apex
`skypistudio.com`; `www` has no DNS) — do not collide with its layout/sitemap/work canonical edits;
propose the canonical strategy rather than force it.

## 9. Order of work

1. `useDayNight()` → 2. `WorldBackdrop.tsx` → 3. globals.css world block (tokens + layers +
surfaces) → 4. mount in layout → 5. frost homepage sections → 6. frost sub-pages + footer →
7. build/typecheck/test → 8. preview verify (FPS + screenshots, both themes) → 9. URL audit →
10. contrast audit (Alex) at golden/dusk/night × light/dark → 11. second sweep → 12. report + email.
