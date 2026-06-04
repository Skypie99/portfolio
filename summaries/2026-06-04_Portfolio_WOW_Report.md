# Portfolio — WOW Elevation Report (one cinematic piece)

**Date:** 2026-06-04
**Branch:** `polish/portfolio-wow-2026-06-04` (stacked on `main`; **NOT merged** — main stays your gate)
**Build:** typecheck ✅ · build (static export) ✅ · `npm test` 160 passing ✅ · `test:static` ✅
**Dependencies added:** none.

---

## DECISIONS FOR SKY

### Honesty-gate verdict — proceed (focused), then stop
After three rounds the site is genuinely at a high bar. The one real remaining gap was **continuity**: it
read as "a stunning intro on top of a very good but *ordinary* page" because the desert's golden light and
the intro's signature *carve-in* went silent below the landing. This round closes exactly that — the wow is
**craft + continuity**, not new effects. **It's now at true diminishing returns; I recommend stopping.**

### You confirmed
- **Scope → "focused continuity wow"** + the small craft sweep. Delivered.
- **/work/ → "refine in place"** (no scroll-linked depth; the shipped cascade is untouched). Delivered.

### Intro — NEVER touched (your hard rule), proven mechanically
The intro was studied read-only only. Enforced by a guard after every step + a final fingerprint:
the protected-set content hash **matches the pre-flight baseline exactly** (`3a562ed3…`), and `git diff`
shows **zero** change in `components/cinematic/**`, `ContentReveal.tsx`, `CinematicIntro.tsx`,
`globals.css` 1071–2007, `tokens-phase2.css`, the cinematic assets/scripts, or the shared surfaces
(`overflow-x: clip`, `--sidebar-w`, `--font-cormorant`). New motion uses the site's easings only — the
intro's quint curve `cubic-bezier(0.83,0,0.17,1)` is never reused below the landing.

### Flag (out of scope — your call)
The homepage **hero heading still reads "…A Pac-Man trainer."** (`app/page.tsx:81`) — a lingering Pac-Man
reference after your Ghost Code trademark de-risk. I did **not** rewrite your headline voice; flagging it so
you can decide the wording (e.g. swap that third clause to reference Ghost Code / a retro arcade trainer).
One-line change whenever you want it.

### Open a11y items
None blocking. Every new state reuses AA-verified tokens; washes are decorative behind content; carve text
is sharp at rest; ember headings are large-text (≥3:1). Your live review is the final confirmation that the
wow lands AND text still reads effortlessly.

---

## The signature wow moments (BEFORE → AFTER) — the high-leverage bets

**SM1 — "The sun follows you in" (the headline move).**
- BEFORE: the hero's warm wash was full-opacity from mount, so as the locked desert scene released, its golden light *cut away* and a new page began.
- AFTER: the hero wash now **blooms `opacity 0.5→1` on its scroll `entry`** (then holds, then keeps its original exit drift+fade) — so the desert's light appears to **resolve into the hero** as one continuous sun. One scroll-linked animation folded into the existing `hero-bg-drift` keyframe (no two-animation conflict), `@supports(view())` + reduced-motion gated → graceful full-wash fallback. Bonus: the headline lands *before* the light deepens (a readability win). *Touches only `globals.css`'s hero block — no Hero.tsx, no ContentReveal, no intro.*

**SM2 — "The sun is in every room" (light continuity).**
- BEFORE: the warm `ParallaxWash` was on some sections, absent on others → the golden light dropped out room-to-room.
- AFTER: the wash is now on **every** major section it was missing from — homepage Certificates, the `/work/` and `/certificates/` headers, and the `/work/[slug]` gallery + "More work". The warm grade persists the whole scroll. Decorative, `aria-hidden`, content lifted to `z-10`, RM → static.

**SM3 — "Lit /work/ centerpiece" (focal plane).**
- BEFORE: the featured card had the same caustic as the grid cards → no focal hierarchy.
- AFTER: `CardField` gained a `featured` prop bumping the warm caustic alpha **0.20→0.28** (verified live: featured 0.28 vs grid 0.2) — the primary work reads "closer to the sun", echoing the intro's focal depth. Plus a warm wash behind the `/work/` header so arriving feels lit. The shipped cascade + glass material are untouched.

**SM4 — "The carve-in recurs" (the intro's signature as a through-line).**
- BEFORE: the case-study body was one undifferentiated `<Reveal>` fade — no internal choreography, and the intro's defining gesture appeared nowhere below the headings.
- AFTER: each body block reveals in reading order; the `##` sub-headings **carve in** (`filter: blur(5px)→0` + rise on the site's gh-settle curve — `Reveal variant="carve"`), so the intro title's focus-pull recurs through the editorial zone. Verified live: 4 carve H2s + 5 depth prose blocks per case study, correct initial state. **Text is sharp at rest; reduced-motion / no-JS render it instantly sharp** (never blurred, never animating while unreadable).

## Supporting craft sweep (cohesion)
C1 Process dividers → `.rule-ember` warm gradient hairlines (3 rule-embers on the homepage now). · C2 About
Principles/Currently body → `variant="depth"`. · C3 Contact "Elsewhere" h2 → `.ember` (every section h2 is
now ember). · C4 showcase stat figures lean in on hover (`group-hover:scale`, origin-left, compositor). ·
C5 `/work/[slug]` closing CTA → the homepage's `ambient-drift` "sun at rest" + `scene` reveal + ember h2.

## Extended system / tokens
`globals.css` (above the protected 1071): `.reveal-carve` (blur→sharp, RM/no-JS → sharp), and the
`hero-bg-drift` keyframe extended to bloom-in→hold→drift-out over `entry 0% exit 100%`. `Reveal` gained a
`carve` variant (backward-compatible). `CardField` gained a `featured` prop. `ParallaxWash` reused as-is. No
new colour primitives. Docs updated: `MOTION_SYSTEM.md` §11, `UI_SYSTEM.md`, `REFINE_WOW_PLAN.md`.

## Dark-mode parity
All new work uses mode-flipping `--rgb-*` tokens / the existing dark-aware components. The hero wash has a
dedicated `html.dark` variant (the bloom rides its opacity). ParallaxWash, ambient-drift, ember, and the
caustic all already flip. Verified the wiring in both; no light-only assumptions introduced.

## Accessibility result (Alex pass)
- **Contrast:** no new risk — washes/caustic/ambient are decorative layers *behind* content; text keeps its
  AA ink/ember tokens. New ember h2s are large display text (≥3:1 large-text AA, consistent with every other
  section h2). The carve never changes text colour and is sharp by the time it's read.
- **Keyboard/focus:** unchanged — all new motion is decorative or hover-driven; no focus order, tab path, or
  visible-focus change.
- **Reduced motion:** every new motion is gated — bloom (`@supports`+RM → full wash), washes (RM → static),
  carve (RM/no-JS → instantly sharp `filter: none`), stat scale (snaps), ambient-drift (no-preference gated).
- **CLS / 60fps:** transform/opacity/filter only; no width/layout animation; dividers grow via `scale-x`.

## What the second sweep caught
A fresh diff review confirmed: no intro easing leaked into site motion, no stray inline styles (heading
letter-spacing moved to a `tracking-` class), carve restrained to H2s only, and all hunks above the
protected globals range. Nothing meaningful remained — matching the honesty-gate call.

> Preview caveat: the headless preview throttles IntersectionObserver/scroll-timeline, so the scroll-driven
> bloom and the carve reveals don't animate there (they sit at their correct initial states; the mechanism
> is the shipped `Reveal`/`view()` pattern that runs in a real browser). I verified all wiring via DOM +
> computed styles + the green build/tests; your live walkthrough confirms the motion.

---

## How to review
**Diff:** `git diff main..polish/portfolio-wow-2026-06-04` — 11 files, +133/−35 (no intro files).

**Live (both light + dark, mobile + desktop):**
- Scroll **out of the intro into the hero** — the golden light should *carry through* and bloom in (sun follows you in), not cut.
- Scroll the whole homepage — warm light persists room-to-room (Certificates now lit), Process dividers are warm gradients, the stat figures lean in on hover.
- `/work/` — the header is lit; the **featured card glows a touch warmer** than the grid (focal plane).
- A `/work/[slug]` — the body **H2s carve in** (blur→sharp) like the intro title as you scroll; the closing CTA has the warm "sun at rest" drift.
- Tab through with the keyboard (focus visible, order intact); turn on **Reduce Motion** and re-walk — all calm/static, text instantly sharp.
- Confirm the **intro desert scene is unchanged** and existing motion is intact-or-better.
- **Confirm the wow lands AND the text still reads effortlessly.**

Report saved here; email text at `summaries/2026-06-04_Portfolio_WOW_Email.txt` (draft — see below).
