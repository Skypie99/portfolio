# Filmic Transitions — skypistudio.com (Direction D)

**Date:** 2026-06-05
**Branch:** `feature/portfolio-filmic-transitions-2026-06-05` (NOT merged — main is your gate)
**Scope:** Page-to-page navigation + the sidebar, site-wide, **excluding the locked intro scene.**
**Status:** Build green · 178 tests pass · static export verified · intro + B reveals untouched.

---

## DECISIONS FOR SKY

None block the build. All four were taken on the "safest reversible path" and are reversible.

1. **No new dependency, no experimental flag.** Built on the **native** View Transitions API. Next's
   `experimental.viewTransition` was **rejected** — it requires React 19 and the site is pinned to
   React 18.3.1 (a major upgrade is out of scope and risky against the GSAP cinematic). The popular
   `next-view-transitions` package was **declined** — it would add a dependency *and* wouldn't cover
   the plain `<a>` links (`Button`), which my single interceptor handles for free. **Nothing added to
   `package.json`.**
2. **Confirmed with you in planning:** cross-dissolve (with a faint golden breath) over a wipe; the
   sidebar section index is **persistent across pages**, with the active marker lighting up **only on
   the homepage.**
3. **Retired the old `.page-enter` fade.** It was *enter-only* (the old page vanished, then the new
   one faded in) — strictly superseded by the true old→new cross-dissolve. Removed cleanly (only
   `template.tsx` + one CSS block referenced it).
4. **Hard-reload-onto-home (minor, flagged).** Client navigation **to `/` is an instant cut** to keep
   the GSAP cinematic pristine. A rare *hard reload that lands on `/` from another same-origin page*
   could still play the free cross-document fade-in before the cinematic. It's low-risk (fresh
   document, no live scroll-pin during the fade). If you dislike it once you see it live, suppressing
   it is a small follow-up — flagging, not blocking.

> **Email note:** I can only *draft* mail with the tools I have, so the report is sitting as a Gmail
> **draft to skylerhalisky@gmail.com**, ready for you to send. It's also saved here in `summaries/`.

---

## BEFORE → AFTER

**Page navigation**
- **Before:** Clicking between Home, /work, a case study, and back was an instant hard cut (and the
  `Button` CTAs did full-page reloads). A short-lived "enter-only" fade existed but showed a flash —
  the old page disappeared before the new one arrived. It broke the cinematic continuity.
- **After:** Same-origin navigations play a **true golden cross-dissolve** — the outgoing view dissolves
  into the incoming one through a faint breath of golden-hour light, **420 ms**, on the site's
  `--ease-gh-glide` curve. It reads like a cut in a film, not a page load. One interceptor upgrades
  **every** internal link (Next `<Link>` *and* the plain-`<a>` `Button` CTAs) consistently. Arrivals at
  the homepage stay an instant cut so the cinematic intro is never disturbed.

**Sidebar**
- **Before:** The persistent identity rail was static — it never told you where you were. It had **no
  section anchors at all.**
- **After:** A quiet **"On this page"** index (The Work · Method · A Brief Account · Credentials ·
  Correspond). As you scroll the homepage, the current section is gently emphasized — an **ink-weight
  shift** plus a **2 px terracotta marker** that scales in from center. It's wayfinding, not a
  highlight. The block stays in the rail on every page (links still jump to sections from anywhere);
  the active marker only lights up on the homepage.

---

## TRANSITION + SCROLL-SPY SPEC (tokens)

**Page transition — native View Transitions, two layers sharing one set of pseudo-element styles:**
- **Same-document** (hydrated client nav, the common case): `components/ViewTransitions.tsx` — one
  document-level, capture-phase click interceptor. For an eligible plain left-click on an in-app `<a>`,
  it `preventDefault`s (so Next `<Link>` bails on `defaultPrevented` — no double navigation) and runs
  `document.startViewTransition(() => router.push(dest))`, resolving on a double-`requestAnimationFrame`
  so the statically pre-rendered route commits before the new snapshot is captured.
- **Cross-document** (no-JS + hard loads): `@view-transition { navigation: auto; }` in `globals.css` —
  pure CSS, zero JS, ignored by browsers without support.
- **Look:** `::view-transition-old/new(root)` retimed to `--dur-transition` (**420 ms**) /
  `--ease-gh-glide` (`cubic-bezier(0.5, 0, 0.1, 1)`). Opacity-only → compositor-only, 60 fps, **zero
  CLS**. A golden breath on `::view-transition-image-pair(root)` using `--rgb-gold` at **0.10 alpha**
  (flips with the theme automatically). The intro's signature quint curve is **never reused.**
- **No new tokens** — reused `--ease-gh-glide`, `--dur-transition`, `--rgb-gold` (so `token-parity`
  stays green).

**Sidebar scroll-spy — `components/SidebarSectionNav.tsx` (client island in the server Sidebar):**
- Driven by the **existing, unchanged** `useActiveSection()` hook (one IntersectionObserver,
  `rootMargin: -45% 0 -45% 0`, state updates only when the active section *changes* — no scroll
  thrash). Observes `work · process · about · certificates · contact`.
- **Active treatment:** inactive `text-text-meta` → active `text-near-black` (ink-weight), plus a
  `bg-terracotta` 2 px × 14 px marker, `scaleY(0 → 1)` from center (transform-only).
- Two independent guards make it inert off-home: `pathname === '/'`, *and* the hook no-ops when the
  ids don't resolve.

---

## ACCESSIBILITY FLOOR — held (and measured)

- **Reduced motion → instant everything.** Page transition: the interceptor reads `matchMedia` live at
  click time and skips `startViewTransition` (instant cut); CSS also zeroes the `::view-transition-*`
  pseudos under `prefers-reduced-motion: reduce` (which also neutralizes the cross-document path). The
  scroll-spy still updates (it's IntersectionObserver-driven, not motion); the marker's scale snaps via
  the global reduced-motion rule.
- **`aria-current` correct, no SR spam.** The active link carries `aria-current="true"` inside a plain
  `<nav>/<ul>/<a>` with **no** `aria-live` / `role=status` — so a screen reader is **not** announced on
  every scroll (AT announces `aria-current` on focus/navigation, not on silent attribute mutation).
  Verified there is no visually-hidden "current section" live text.
- **Focus.** View Transitions are purely visual — they don't touch the focus model or the a11y tree, so
  there's **no focus regression** vs. today. The interceptor never calls `.focus()`/`.blur()` and adds
  no live region. Section-link clicks use native fragment navigation, which lands keyboard/SR users at
  the section. The `::view-transition` overlay is `pointer-events: none`, so the live page stays
  interactive during the fade.
- **WCAG AA contrast — measured in both themes (on the rail):**

  | State | Light | Dark | Threshold | Result |
  |---|---|---|---|---|
  | Active text (ink) | **11.93:1** | **13.69:1** | 4.5 (text) | ✅ AAA |
  | Inactive text (ink-meta) | **4.87:1** | **7.28:1** | 4.5 (text) | ✅ AA |
  | Terracotta marker | **3.68:1** | **5.15:1** | 3.0 (UI graphic) | ✅ |

  (Active/inactive reuse the locked, already-AA-verified ink tokens; the new marker clears the 3:1
  UI-component bar in both modes. The state is never signaled by color alone — ink-weight is the
  primary cue.)
- **`(scripting: none)` / no-JS fallback intact.** The sidebar + all five links are server-rendered and
  navigate as plain anchors; the interceptor simply never mounts; links hard-navigate as before. The
  existing `(scripting: none)` CSS floor was **not touched.**

---

## INTRO + B REVEALS — untouched / intact

- **Cinematic intro (PROTECTED, read-only):** zero edits to `components/cinematic/**`, its assets, or
  the cinematic CSS range. The homepage-arrival instant-cut exemption exists specifically so the
  GSAP/ScrollTrigger mount is never measured against a transitioning root. `CinematicDesert.test.tsx`
  still passes. The cinematic is still present and mounted exactly as before.
- **B "show the work" reveals intact:** `Reveal` / `ContentReveal` / `ProductReveal` untouched; their
  tests still pass. The new work adds; it removed only the superseded `.page-enter`.

---

## PERFORMANCE / CLS

- Transition is **opacity-only on root snapshots** → runs on the compositor, **60 fps, zero CLS** (the
  fade is over images layered above the live page; layout never reflows).
- The interceptor is a single passive client effect (one capture-phase listener), `null`-rendering, in
  the shared layout — negligible JS, no per-link wrappers. The scroll-spy reuses one existing
  IntersectionObserver. **No measurable First-Load-JS change** (static export rebuilt cleanly; homepage
  First Load JS unchanged at ~208 kB).
- The minifier preserved `@view-transition{navigation:auto}` and all three pseudo-element rules in the
  built CSS; the old `.page-enter` is fully gone (0 references).

---

## HOW TO REVIEW

**Diff:**
```
git diff main..feature/portfolio-filmic-transitions-2026-06-05
```
8 files: `components/ViewTransitions.tsx` (new), `components/SidebarSectionNav.tsx` (new), their two
tests (new), and edits to `app/globals.css`, `app/layout.tsx`, `app/template.tsx`, `components/Sidebar.tsx`.

**Live checklist (`npm run dev`, desktop ≥ 960 px):**
- [ ] **Cross-dissolve:** navigate work ↔ about ↔ certificates ↔ contact via the sidebar and in-page
  links — one calm golden fade (~420 ms), old and new overlapping (a true dissolve, not a flash).
  Check **both light and dark.**
- [ ] **Home is an instant cut:** work → Home cuts straight in, then the desert intro plays exactly as
  before (scrub the descent — the pin shouldn't jump).
- [ ] **Sidebar tracks position:** scroll the homepage top→bottom — the marker + ink-weight move through
  The Work → Method → A Brief Account → Credentials → Correspond.
- [ ] **Reduced motion on** (System Settings → Accessibility → Display → Reduce motion): navigations go
  **instant and clean**, no fade/gold; the sidebar active state still updates, marker snaps.
- [ ] **Skips behave:** the contact `mailto:`, external GitHub/LinkedIn links, and Cmd/middle-click all
  behave exactly as before (no transition hijack).

---

## Verification — what was checked, and how

**Automated (fully green):**
- `npm run typecheck` ✅ · `npm test` → **178 passed** (incl. ViewTransitions skip-logic ×10,
  SidebarSectionNav active-state ×4, **token-parity ×39, cinematic ×2, Sidebar ×4** all still green) ✅ ·
  `npm run build` (static export) ✅ · `npm run test:static` ✅.
- Built CSS inspected: `@view-transition` + all pseudos present; `.page-enter` removed.

**Live (dev server, via DOM/CSS inspection):**
- View Transitions API supported; interceptor **live & mounted** — an eligible internal link click was
  intercepted (`defaultPrevented`) and called `startViewTransition` exactly once; a **home navigation
  was intercepted but did *not* call `startViewTransition`** (instant cut, cinematic protected).
- Sidebar nav renders 5 correct links; marker computed as terracotta, 2 px × 14 px, `scaleY(0)` when
  inactive; AA contrast measured in both themes (table above). No console errors.

**Honest limitation:** this run's headless preview does not tick `requestAnimationFrame` or composite
the GSAP-pinned homepage (screenshots come back blank, IntersectionObserver stays idle). So the
*animation frames* of the dissolve and the *live* scroll-spy marker couldn't be frame-grabbed here —
those are confirmed at the mechanism level (API support + correct interceptor behavior + the built CSS +
unit tests + measured tokens) and are best eyeballed via the live checklist above. Nothing indicated a
defect; it's purely an environment limit of the preview, not the code.
