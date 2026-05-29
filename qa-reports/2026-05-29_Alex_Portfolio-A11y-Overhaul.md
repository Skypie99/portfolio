# Alex — WCAG 2.2 AA Audit: Portfolio
**Date:** 2026-05-29
**Branch:** `a11y/portfolio-overhaul-2026-05-29`
**Commit:** 8c34861
**Role:** Alex (Accessibility Specialist)
**Verdict:** NEEDS_CHANGES → fixed in this branch

---

## Scope

Comprehensive WCAG 2.2 AA audit of the full Portfolio site (Next.js 15, static export):
- `app/layout.tsx` — root shell, skip link, lang attribute
- `app/page.tsx` — single-scroll homepage
- `app/about/page.tsx`
- `app/contact/page.tsx`
- `app/work/page.tsx`
- `app/work/[slug]/page.tsx`
- `app/certificates/page.tsx`
- `app/not-found.tsx`
- All components in `components/`
- `app/globals.css` — motion system, focus rules, reduced-motion gate

---

## Audit Results by Criterion

### 1. Keyboard Navigation
**PASS.** All interactive elements are reachable via Tab. Focus order follows DOM order (Sidebar → Main on desktop). The HamburgerNav focus trap is correctly implemented via a manual keydown handler. Tab cycling is enforced between the first and last focusable elements inside the dialog overlay. Escape returns focus to the trigger.

### 2. Focus Visible
**PASS.** Global `*:focus-visible` rule in `app/globals.css` applies a 2px solid terracotta outline with 2px offset to every focusable element. Contrast of terracotta (#B35F32) against cream (#FAF9F5): 4.33:1 — passes the 3:1 minimum for UI components (WCAG 1.4.11). No `outline: none` found in the codebase.

Focus-visible styles are also explicitly set on:
- `components/ProjectCard.tsx` — inline links and card CTA row
- `components/HamburgerNav.tsx` — nav link hover/focus-visible color
- `components/Sidebar.tsx` — link-draw class

### 3. Screen Reader — Images and Decorative Elements
**PASS.** All `<img>` elements have meaningful `alt` text sourced from CMS data (`deliverables.json`, `certificates.json`). Decorative status dots, arrows, dividers, and the AppMockup component are correctly marked `aria-hidden="true"`. The AppMockup is wrapped in an `aria-hidden="true"` container in ProjectCard.

### 4. Heading Hierarchy
**PASS.** Correct h1 → h2 → h3 hierarchy across all pages:
- Homepage: h1 in Hero → h2 per section → h3 for certificate titles
- /about: h1 page title → h2 section headers
- /work: h1 page title → h2 (sr-only "Deliverables") → h3 card titles
- /work/[slug]: h1 deliverable title → h2 section headers
- /certificates: h1 page title → h2 (sr-only "Credentials") → h3 card titles
- /contact: h1 page title → h2 section header
- /not-found: h1 only (appropriate single-heading page)
No skipped levels found.

### 5. Colour Contrast
**1 FAILURE — FIXED.** See Finding A below.

All other checked pairs pass:
- `sage-text` (#5C5D54) on all background variants: 4.64:1 (sand) to 6.33:1 (cream) — PASS
- `umber` (#7F4323) on all backgrounds: 5.36:1 (sand) to 7.30:1 (cream) — PASS
- `near-black` (#232420) on cream: 14.82:1 — PASS
- `charcoal` (#484A43) on cream: 8.53:1 — PASS
- `terracotta` on cream at display sizes (≥24px): 4.33:1 — PASS (large text 3:1 threshold)
- Focus ring (terracotta) vs cream background: 4.33:1 — PASS (3:1 UI component threshold)
- TagPill: umber on sand: 5.36:1 — PASS
- Disabled button (charcoal at 50% opacity): ~2.46:1 — noted below in Finding C

### 6. Link Purpose
**PASS.** All links have descriptive text or aria-label overrides. No bare "click here" or "read more" found. External links include aria-label clarifying the destination. Certificate and deliverable links include title + issuer/role + year in their accessible names. Back links show "Back to home" not just "Back."

### 7. Motion
**PASS.** All motion is properly gated:
- `globals.css` has a blanket `@media (prefers-reduced-motion: reduce)` block that forces `animation-duration: 0.01ms !important` and `transition-duration: 0.01ms !important` on all elements.
- CSS scroll-reveal animations (`@supports animation-timeline: view()`) are double-gated behind both `@supports` and `prefers-reduced-motion: no-preference`.
- Framer Motion (HamburgerNav): `useReducedMotion()` disables all `motion.div` animations when the user prefers reduced motion.
- AppMockup float animation is also gated behind `prefers-reduced-motion: no-preference`.
- Hero entrance CSS animations have their own `@media (prefers-reduced-motion: reduce)` gate.

### 8. Forms
**PASS (N/A).** No form elements exist anywhere on the site. Contact is entirely mailto-based. No `<form>`, `<input>`, `<textarea>`, or `<select>` elements found.

### 9. Skip Nav
**PASS.** `<SkipLink />` is the first child of `<body>` in `layout.tsx`, links to `#main`, becomes visually visible on focus (removes `sr-only` via `focus-visible:not-sr-only`), and has correct contrast. The `<main>` element has `id="main"` and `tabIndex={-1}` so programmatic focus works.

### 10. Language
**PASS.** `<html lang="en">` is set in `app/layout.tsx`.

---

## Findings

### Finding A — WCAG 1.4.3 FAIL: Hero scroll indicator contrast (FIXED)
**Severity:** Medium
**Criterion:** WCAG 2.1 / 2.2 §1.4.3 Contrast (Minimum) — Level AA
**File:** `components/Hero.tsx`

The "Scroll" text label on the scroll affordance link below the hero CTA was rendered at `opacity-60`. At that opacity, the effective `sage-text` (#5C5D54) colour blended against the cream background produced a contrast ratio of **2.65:1**, below the required **4.5:1** for normal-sized text (11px DM Mono).

**Fix applied:** Changed `opacity-60` to `opacity-90`, yielding **5.04:1** — PASS. The subtle visual character of the affordance is preserved; the arrow glyph below the text is `aria-hidden` and decorative.

```tsx
// Before
'opacity-60 hover:opacity-100',
// After
'opacity-90 hover:opacity-100',
```

### Finding B — WCAG 2.1.2: HamburgerNav dialog missing in-trap close button (FIXED)
**Severity:** Medium
**Criterion:** WCAG 2.1 §2.1.2 No Keyboard Trap — Level A
**File:** `components/HamburgerNav.tsx`

The `role="dialog" aria-modal="true"` overlay had no close button inside the focus-trapped region. The only way to dismiss the dialog was (1) the Escape key, or (2) clicking a nav item. The hamburger trigger button that visually closes the menu sits outside the dialog in the DOM and at z-index 50 — but screen readers honouring `aria-modal="true"` may hide elements outside the dialog, leaving the trigger unreachable via AT.

**Fix applied:** Added an explicit "×" close button (`aria-label="Close navigation menu"`, `type="button"`, 44×44px hit area) inside the overlay div. This gives AT users a clear, keyboard-reachable way to dismiss the dialog without relying on a key shortcut. Escape still works for keyboard users who know it.

```tsx
<button
  type="button"
  onClick={close}
  aria-label="Close navigation menu"
  className="absolute top-4 right-4 h-11 w-11 ..."
>
  <span aria-hidden="true">×</span>
</button>
```

**Test update:** Two HamburgerNav unit tests were updated to distinguish the outer trigger from the new in-dialog close button (both carry the accessible name "Close navigation menu" when the overlay is open). Tests use `aria-controls` presence to identify the trigger. All 88 tests pass.

### Finding C — Disabled Button Contrast (Informational, Not Fixed)
**Severity:** Low / Informational
**Criterion:** WCAG 1.4.3 — disabled states are explicitly exempt
**File:** `components/Button.tsx`

The disabled button state uses `disabled:text-charcoal disabled:opacity-50`. Simulating the effective colour at 50% opacity on cream yields ~2.46:1. WCAG 1.4.3 explicitly exempts inactive UI components from contrast requirements ("text or images of text that are part of an inactive user interface component … have no contrast requirement"). No fix required; noted for transparency.

### Finding D — ProjectCard Duplicate Links (Informational)
**Severity:** Low / Informational
**Criterion:** WCAG 2.4.9 Link Purpose (Link Only) — Level AAA (not AA)
**File:** `components/ProjectCard.tsx`

Each card renders two `<a>` elements pointing to the same `/work/{id}/` URL: the title link and the "Case study →" link. Both have distinct `aria-label` values (`"{title} — {role}, {year}"` vs `"Read case study for {title}"`). WCAG 2.4.4 (Link Purpose in Context, AA) is satisfied. WCAG 2.4.9 (AAA) would prefer a single link. Not fixed — fixing this would require layout restructuring and is an AAA-only concern.

---

## Passes Summary

| Check | Result | Notes |
|-------|--------|-------|
| `<html lang="en">` | PASS | Set in root layout |
| Skip nav | PASS | First in DOM, focuses `#main` |
| Focus ring visible | PASS | Global terracotta 2px outline, 4.33:1 on cream |
| No `outline:none` | PASS | Not found anywhere |
| All images have alt text | PASS | Sourced from deliverables.json and certificates.json |
| Decorative elements aria-hidden | PASS | Dots, arrows, AppMockup, stat numerals, dividers |
| Heading hierarchy | PASS | h1→h2→h3 on all pages, no skipped levels |
| Contrast (body text) | PASS | All body colours 4.5:1+ on all backgrounds |
| Contrast (large/display text) | PASS | All display sizes at or above 3:1 |
| Link purpose | PASS | All links descriptive; no "click here" |
| External links | PASS | All have `target="_blank" rel="noopener noreferrer"` + sr-only "(opens in new tab)" |
| Keyboard navigation | PASS | All interactive elements Tab-reachable |
| Focus order | PASS | Matches visual / reading order |
| HamburgerNav focus trap | PASS | Escape + Tab cycling + focus return |
| Motion (CSS) | PASS | All gated with `prefers-reduced-motion: reduce` |
| Motion (Framer Motion) | PASS | `useReducedMotion()` disables all animations |
| Forms | PASS (N/A) | No forms on this site |
| Landmarks | PASS | `<nav>`, `<main>`, `<footer>` all present with accessible names |
| `aria-current="page"` | PASS | HamburgerNav and breadcrumbs use it correctly |
| Hit areas ≥ 44px | PASS | Button component 56px tall; hamburger 44×44 |
| CSP (security/transport) | Out of scope for a11y | Reviewed in Steve's report |

---

## Files Changed

| File | Change |
|------|--------|
| `components/Hero.tsx` | `opacity-60` → `opacity-90` on scroll link |
| `components/HamburgerNav.tsx` | Added in-dialog close button |
| `components/__tests__/HamburgerNav.test.tsx` | Updated 2 tests to handle dual close buttons |

## Verification

- `npm run typecheck` — PASS (exit 0)
- `npm test -- --run` — 88/88 PASS
