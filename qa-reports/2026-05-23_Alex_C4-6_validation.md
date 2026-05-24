# Alex C4/C5/C6 Validation — Portfolio Site

**Author:** Alex (Accessibility Engineer)
**Date:** 2026-05-23
**Cycle:** C4 (/work index) + C5 (/work/[slug] + /certificates) + C6 (/about + /contact)
**Standard:** WCAG 2.2 Level AA (Constitution v1.3 Art. 7 — non-negotiable)
**Scope:** Read-only validation against `docs/ACCESSIBILITY.md` and Shamus's new routes.
**Verdict:** **PASS WITH FINDINGS** — 0 BLOCKING · 3 non-blocking · 0 new contrast pairs failed.

---

## TL;DR

All five new routes (/work, /work/[slug], /certificates, /about, /contact) and the new `ProjectCard.tsx` primitive correctly inherit the token discipline established in C2/C3. **No new blockers.** Every external link uses the `target=_blank` + `rel=noopener noreferrer` + sr-only "(opens in new tab)" pattern from my §4.5. The detail-page hero image carries meaningful alt from `d.heroImage.alt` (Alex §4.1). Definition-list `<dl>/<dt>/<dd>` markup on /work/[slug] for Role/Year is exactly right (semantic, not divs-with-role). `/about` NumberedSteps continue to use Umber numerals at 19px (BLK-3.b honored) with `<h3>` step titles in correct order under the section `<h2>`. ProjectCard is a single `<a>` (no nested anchors), has an `aria-label` summarizing destination, and its `.work-card` hover-lift class mirrors `:focus-visible` in `globals.css:191-194` so keyboard users get the lift too.

Three non-blocking polish items (below). Two new color pairs Shamus introduced — both PASS.

- **BLOCKING:** 0
- **Non-blocking:** 3 (F-C4-1, F-C4-2, F-C4-3)
- **Decisions for Sky:** 0 new (D-1 disabled-button + D-2 overlay `inert` still open from C2/C3 report — no urgency)

Shamus is unblocked to keep building.

---

## Per-route validation

### /work (C4) — `app/work/page.tsx`
- One `<h1>` "Selected Work" (l.49); section `<h2>` not used at index level (cards carry their own); ProjectCard renders one `<h2>` per card (flat sibling rotor — fine). ✓
- Cards in real `<ul>`/`<li>` (l.75-88). ✓
- ProjectCard is a single `<a>` wrapper (`ProjectCard.tsx:40-48`) — no nested anchors. `aria-label="${title} — ${role}, ${year}"` summarizes destination per Alex §4.4. ✓
- Hover lift via `.work-card` class; `globals.css:191-194` mirrors hover on `:focus-visible` — keyboard parity achieved (Alex §6.2). ✓
- Empty-state copy renders when no deliverables (l.69-73). ✓

### /work/[slug] (C5) — `app/work/[slug]/page.tsx`
- One `<h1>` (l.107) for deliverable title; section `<h2>` "A closer look." (gallery, l.210), "Keep reading." (other-work, l.254), "Have a project like this?" (CTA, l.295). Heading order h1 → h2 → h3 (other-work card titles, l.269). ✓
- Hero image (l.82-86) carries `alt={d.heroImage.alt}` from data — meaningful per Alex §4.1. Decorative title overlay (l.87-92) is explicit `aria-hidden="true"`. ✓
- Role/Year uses real `<dl>/<dt>/<dd>` (l.116-133) — semantic definition list, not divs with role. ✓
- Tech pills in `<ul>/<li>` (l.140-149); Umber on Sand = 5.36:1 PASS.
- Link list (l.158-176): each external link `target="_blank" rel="noopener noreferrer"` + `aria-hidden="true"` icon + `sr-only "(opens in new tab)"`. ✓
- "Other work" cards (l.258-282) — entire card is a single `<Link>` with `aria-label` summary. No nested anchors. ✓

### /certificates (C5) — `app/certificates/page.tsx`
- One `<h1>` (l.50); each certificate is a `<li>` containing an `<article>` with `<h2>` for the title (l.103). Flat sibling `<h2>` list — acceptable; matches card pattern from /work. ✓
- Badge image (l.83-88) carries `alt={c.badgeImage.alt}`. Decorative issuer-name overlay is `aria-hidden`. ✓
- Credential URL link (l.114-123): text "View credential" — meaningful per Alex §4.4 (not "verify here" or bare URL). `target=_blank` + `rel=noopener noreferrer` + sr-only "(opens in new tab)". ✓
- Issuer + ISSUED date use `text-sage-text` (#5C5D54) at 11px on Blush = **6.09:1 PASS** (BLK-1 fix honored).

### /about (C6) — `app/about/page.tsx`
- One `<h1>` (l.47); section `<h2>` "Three quiet steps…" (l.84), "A handful of recent things." (l.128), "Want to work together?" (l.183). NumberedStep `<h3>` titles (l.33 of NumberedStep.tsx) sit correctly under the section `<h2>` — heading order PASS. ✓
- Numerals 01/02/03 in DM Mono at 19px use `text-accent-text` (Umber on Peach Cream = 6.53:1) — BLK-3.b binding satisfied. ✓ (already validated C2/C3 — re-confirmed in this code path.)
- "What I'm working on" cards (l.134-159) — entire card is single `<Link>` with `aria-label`. No nested anchors. ✓

### /contact (C6) — `app/contact/page.tsx`
- One `<h1>` "Get in touch." (l.37); section `<h2>` "Find me in other quiet corners." (l.68). ✓
- Mailto Button (l.48-52) labeled `"Email ${profile.contactEmail}"` — the visible email IS the accessible name; the preceding paragraph "Best for AI engineering…" gives context. PASS Alex §4.4. ✓
- Socials in real `<ul>/<li>` (l.72-90). Each link `target=_blank` + `rel=noopener noreferrer` + `aria-hidden` icon + sr-only "(opens in new tab)". ✓

---

## New color pairs Shamus introduced (both PASS)

| Pair | Foreground | Background | Ratio | Threshold | Verdict |
|---|---|---|---|---|---|
| `text-sage-text` (#5C5D54) on Blush (#FCF3ED) — used at 11px in cert "ISSUED…" metadata | sage-text | blush | **6.09:1** | 4.5:1 normal text | PASS |
| Umber (#7F4323) on Blush (#FCF3ED) — used at 19px aria-hidden decorative title overlay on detail-page hero | umber | blush | **7.03:1** | 4.5:1 (decorative — moot, but PASS anyway) | PASS |

No regressions. Token discipline holds across all C4-6 surfaces.

---

## Non-blocking findings

### F-C4-1 — ProjectCard sets `focus:outline-none` and relies on `.work-card:focus-visible` lift as the *only* focus affordance
**File:** `components/ProjectCard.tsx:44` (`'focus:outline-none'`).
**Issue:** The class strips the global `*:focus-visible` 2px Terracotta outline (`globals.css:132-136`) — and replaces it ONLY with the 4px translateY lift. WCAG 2.4.7 (Focus Visible) and 2.4.13 (Focus Appearance, new in 2.2) require a *visible* focus indicator with sufficient contrast against the unfocused state. A 4px upward shift IS perceivable, but it's a position change rather than a contrast change, and 2.4.13 specifically calls for an indicator that "encloses the visual presentation of the focused control" or meets a 3:1 contrast change. The translateY alone is borderline — a low-vision user without spatial-tracking acuity may not detect a 4px shift.
**Recommended fix:** drop `focus:outline-none` and let the global Terracotta outline fire alongside the lift — they're complementary, not competing. Or, add a component-level `focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-4` to keep the affordance explicit.
**Severity:** non-blocking. The lift is visible and the card is large, so most users will see focus. WCAG 2.4.7 minimum-pass is debatable; 2.4.13 (AAA-ish enhancement) is not strictly required for AA but is the direction WCAG is moving. Fix in next polish cycle.

### F-C4-2 — /certificates renders flat sibling `<h2>` list (up to N certificates)
**File:** `app/certificates/page.tsx:103`.
**Issue:** Each cert card title is `<h2>`. With 5-10 certs the heading rotor in a screen reader becomes a long flat list of card titles — readable, but harder to scan by structure. Same pattern is used on /work via ProjectCard (`ProjectCard.tsx:86`).
**Recommended fix:** demote card titles to `<h3>` and add a single visually-hidden section `<h2>` like `<h2 className="sr-only">Certificate list</h2>` above the `<ul>`. Same fix on /work via ProjectCard refactor. Alternatively keep `<h2>` — the flat list IS valid; the trade-off is rotor density vs. semantic equivalence between cards.
**Severity:** non-blocking. WCAG 1.3.1 satisfied either way. Polish item.

### F-C4-3 — Detail page hero `<img>` has `loading="lazy"` missing (above-the-fold image)
**File:** `app/work/[slug]/page.tsx:82-86`.
**Issue:** The detail-page hero is above-the-fold on most viewports. `loading="lazy"` is correctly omitted here (the gallery images at l.221 use lazy, which is right). But there's no explicit `width`/`height` or `aspect-ratio` attr on the img — the wrapper has `aspect-[4/5]` which preserves layout, so CLS is contained. No a11y impact; flagging only as adjacent perf-a11y polish (visitors with slow connections benefit from explicit dimensions when text loads first).
**Recommended fix:** none required for a11y; Peter can advise on perf.
**Severity:** noted, not an a11y blocker.

---

## What was NOT changed since C2/C3
- D-1 (Button disabled state) — still undefined, still no caller needs it.
- D-2 (Overlay `inert`) — still deferred per Sky's call.
- F-1 through F-6 (C2/C3 findings) — out of scope for this validation; no regressions noted.

---

## Sign-off

**This audit PASSES.** No blockers. C4/C5/C6 routes correctly extend the C2/C3 a11y foundation: dual-border tokens, Umber for link text, semantic landmarks (`<nav>`, `<main>`, `<article>`, `<ul>`, `<dl>`), meaningful link text, external-link cues, focus-visible parity on `.work-card`, single `<h1>` per page, no nested anchors. ProjectCard is the new heaviest a11y surface and was built clean. Three non-blocking polish items, none urgent.

Shamus is unblocked to keep building. Sky has no new decisions to make.

---

**Authority chain:** Constitution v1.3 Art. 7 (accessibility non-negotiable) > role file (`commands/alex.md`) > skill (`accessibility-ux`). No external sends. Read-only on code. No live surface touched. Report written to `/Users/skypie/Portfolio/qa-reports/` per per-project convention.
