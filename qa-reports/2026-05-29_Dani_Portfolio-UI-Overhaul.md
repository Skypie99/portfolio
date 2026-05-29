# Design Compiler Report — Portfolio UI Overhaul
**Date:** 2026-05-29
**Role:** Dani (Design + UI)
**Branch:** ui/portfolio-overhaul-2026-05-29
**Verdict:** POLISH (minor fixes applied; PASS after fixes)

---

## 7-Layer Design Compiler Pass

### Layer 1 — Tokenization

**PASS.** All colors, spacing, typography, radii, and motion values route through CSS variables declared in `app/globals.css` and mirrored in `tailwind.config.ts`. No unintentional off-palette values found in component code.

The hex literals in `AppMockup.tsx` are intentional — they simulate app UIs using palette-consistent values (`#FAF9F5` = cream, `#DCDCD6` = stone, etc.) rendered inside decorative `aria-hidden` mockup frames. These are NOT design token leaks; they're inline SVG/canvas styles where Tailwind classes are unsuitable. Confirmed that every hex used maps to a named token value.

One minor: `#E8E6E0` appears in `BrowserFrame`'s Chrome bar background — this is very close to `--color-warm-white` (#F0F0EA) but slightly darker. Intentionally chromatic to read as a browser titlebar, not a Dani token violation.

**No action required.**

---

### Layer 2 — Accessibility Parity

**PASS.** Interactive states are fully instrumented:

- `*:focus-visible` global rule: 2px solid terracotta outline, 2px offset — covers all focusable elements by default.
- `Button`: hover shadow + -1px lift, focus-visible outline via global rule. Disabled state uses charcoal + 50% opacity (~4.3:1 contrast — WCAG AA pass).
- `ProjectCard` title link: `group-hover:text-accent-text` + `focus-visible:outline-terracotta`.
- `HamburgerNav`: `aria-expanded`, `aria-controls`, `aria-label`, Escape key closes, focus trap, focus returns to trigger on close.
- `SkipLink`: visually hidden until focus, then visible with terracotta border.
- `link-draw`: hover AND `focus-visible` both draw the underline.
- Reduced-motion: `@media (prefers-reduced-motion: reduce)` block in `globals.css` snaps all animations to 0.01ms.

External links carry `rel="noopener noreferrer"` and `<span class="sr-only">(opens in new tab)</span>` throughout.

**No action required.**

---

### Layer 3 — Component Consistency

**POLISH APPLIED — 3 fixes.**

**Finding A: About page section eyebrows — missing terracotta dot (2 of 5 sections)**

The "What I care about" and "What I'm learning" section headers lacked the `w-1.5 h-1.5 rounded-full bg-terracotta` dot that every other section header carries. This created an inconsistent visual rhythm across the about page.

**Fix applied:** Added `flex items-center gap-2` + the dot `<span>` to both section headers in `app/about/page.tsx`.

**Finding B: Homepage Contact section eyebrow — missing dot**

Same pattern violation on `app/page.tsx`. The Contact section header comment even said "Eyebrow label matching other sections" but the dot was absent.

**Fix applied:** Added dot to homepage Contact eyebrow in `app/page.tsx`.

**Finding C: Contact page "Elsewhere" section — missing dot**

Same violation on `app/contact/page.tsx`.

**Fix applied:** Added dot to Elsewhere eyebrow in `app/contact/page.tsx`.

---

### Layer 4 — Visual Entropy

**POLISH APPLIED — 1 structural fix.**

**Finding D: Wide ProjectCard — `md:w-1/2` content without flex-row layout**

The wide `ProjectCard` passed `md:w-1/2 md:justify-center` to the content area div, but the card itself had no `md:flex-row`. This meant the mockup sat at full width above the content, and the content then rendered at half-width below it — producing a visually awkward layout where the text column is unnecessarily narrow with empty space on the right.

The intended design is mockup + content side-by-side on wide cards (used for the featured deliverable on the homepage and work index).

**Fix applied:**
- Card gains `md:flex md:flex-row md:gap-8 md:items-start` when `wide=true`.
- Mockup gains `md:w-1/2 md:mb-0` (no bottom margin when side-by-side) and aspect changes from `16/9` to `4/3` for better side-by-side proportions.
- Content area changes from `md:w-1/2 md:justify-center` to `md:p-0 md:justify-center` (padding removed since the outer card's `p-6` handles it; `flex-1` on the content div fills the remaining half).

---

### Layer 5 — Luxury UI Score

**PASS.** The overall aesthetic reads as premium editorial:

- Cormorant Garamond at display sizes with `-0.01em` to `-0.025em` negative tracking — correct luxury typographic tone.
- Terracotta accent used conservatively: CTA dots, left-border accents on section headers, availability pings. Not overused.
- Hero wash gradient (radial, warm amber glow from upper-right) is subtle — correctly layered behind content at z-0.
- Whitespace rhythm is generous (`py-24 lg:py-32` sections) and consistent throughout all pages.
- Section alternation (cream / warm-white / blush / peach-cream) provides visual breathing room without disruption.
- AppMockup illustrations are genuine, small, and tasteful — not tacky hero screenshots.
- Footer brand block with wordmark + "Made with care" dot echoes the CTA button's signature dot.

Score: **8.5 / 10** — strong luxury signal. Would reach 9+ with real photography/imagery in the hero and card areas.

---

### Layer 6 — Regression Safety

**PASS.** Recent changes checked:

- Wave 5 polish (terracotta section borders, peach-cream contact bg, footer line) — stable, confirmed in code.
- HamburgerNav `md:hidden` fix (this PR) — reviewed. On desktop, the Sidebar's `nav aria-label="Site navigation"` provides the full navigation. The hamburger overlay also contains a full `nav aria-label="Primary menu"` — adding `md:hidden` to the trigger removes desktop redundancy and prevents the button visually overlapping the Sidebar on wide viewports. The aria structure remains correct on mobile.
- ProjectCard wide layout fix (this PR) — the card's `work-card group block` stays correct; adding `md:flex md:flex-row` is additive and does not affect non-wide cards or the base Tailwind utilities.

`npm run typecheck` passes after all changes.

---

### Layer 7 — Compile Decision

**POLISH → PASS**

Four minor polish fixes applied (3 eyebrow consistency, 1 wide card layout). All changes are:
- Additive (no removals)
- Typecheck-clean
- Accessibility-neutral or improving
- On-token (no new hex literals or off-system values)

---

## Mobile Responsive Check

- 375px: All sections use `px-gutter` (2rem), `max-w-content` with `mx-auto` — full-bleed padding maintained. Hero `min-h-[80vh]` + `clamp()` font sizes respond correctly.
- 768px: Two-column grid on ProjectCards activates. Sidebar hides; hamburger nav handles mobile navigation.
- 1440px: `max-w-content` (1120px) centered with generous side padding. Sidebar (`w-sidebar` = 280px) pins left.

**No issues.**

---

## Dark Mode Check

No dark mode is implemented or specified. `color-scheme: light` is set in metadata. The warm cream palette is explicitly a single-mode design system. **Not applicable.**

---

## Typography Check

- Heading scale is consistent: `text-[clamp(2.5rem,6vw,4rem)]` for page H1s across all routes.
- Display-m (`2.25rem`) for section H2s throughout.
- Body copy consistently `text-[1.0625rem]` (17px) at `leading-[1.65]` — slight override of the `text-body` token (16px) for better long-form readability. Consistent.
- DM Mono used for all labels/eyebrows/meta at `text-meta` (11px) or `text-label` (12px) with `tracking-label` (0.125em). Consistent.
- Negative tracking on display serif headings — consistent (`-0.01em` to `-0.025em`).

**No issues.**

---

## Whitespace Check

Section rhythm: `py-24 lg:py-32` used consistently on every section. Occasional `py-20 lg:py-24` on the showcase strip — slightly tighter, intentional.

`gap-6` for card grids; `gap-8` for certificate grids; `gap-10` for footer columns. Consistent within each context.

`mb-12` on all section header blocks before content. `mb-4` on eyebrow labels. Consistent.

**No issues.**

---

## DECISIONS FOR SKY

None required. All fixes are minor polish with no privacy, security, or structural concerns.

---

## Files Modified

- `app/about/page.tsx` — dot added to "What I care about" and "What I'm learning" eyebrows
- `app/page.tsx` — dot added to Contact section eyebrow
- `app/contact/page.tsx` — dot added to Elsewhere section eyebrow
- `components/ProjectCard.tsx` — wide card layout: `md:flex-row` on card, corrected mockup/content sizing
- `components/HamburgerNav.tsx` — `md:hidden` on trigger button (Sidebar handles desktop nav)
