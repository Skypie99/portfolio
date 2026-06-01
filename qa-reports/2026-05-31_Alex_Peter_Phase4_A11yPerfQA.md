# Joint QA Report — Phase 4 A11y + Performance Audit

**Date:** 2026-05-31  
**Branch:** `feat/phase4-a11y-perf-qa` (off `feat/phase4-animations`)  
**Roles:** Alex (Accessibility) + Peter (Performance/QA)  
**Model tier:** Sonnet (a11y task — standard build/edit tier per AGENT_OS)  
**Mode:** ACTIVE  

---

## LOOP HEALTH METRICS
- coherence_score: HIGH
- state_consistency: PASS (no duplicate work detected; prior Alex audit 2026-05-29 reviewed different branch state)
- duplicate_work_detected: NO
- drift_risk: LOW

---

## Scope

Full audit of the current `feat/phase4-animations` working state against WCAG 2.2 AA and Core Web Vitals / QA checklist. All findings fixed in-branch. Typecheck: PASS. Tests: 108/108 PASS.

---

## Alex — Accessibility Findings

### PASS ✓

| Check | Result |
|---|---|
| Skip link first in DOM, links to `#main`, visible on focus with 2px terracotta outline | PASS |
| `<main id="main" tabIndex={-1}>` present — skip link target works | PASS |
| HamburgerNav: `aria-expanded`, `aria-controls`, `aria-label` on trigger | PASS |
| HamburgerNav: `role="dialog" aria-modal="true"` on overlay | PASS |
| HamburgerNav: focus trap (Tab/Shift+Tab cycle), Escape closes | PASS |
| HamburgerNav: explicit close button inside the dialog (WCAG 2.1.2) | PASS |
| HamburgerNav: focus returns to trigger on close | PASS |
| HamburgerNav: `aria-current="page"` on active route | PASS |
| `useReducedMotion()` gates all Framer Motion animations | PASS |
| CSS animations gated with `@media (prefers-reduced-motion: reduce)` | PASS |
| Global `*:focus-visible` rule: 2px terracotta, offset 2px, border-radius 2px | PASS |
| Terracotta focus ring contrast on cream: 4.33:1 (≥3:1 UI — WCAG 1.4.11 PASS) | PASS |
| `text-text-meta` (#5C5D54) on cream #FAF9F5: 5.44:1 ≥ 4.5:1 PASS | PASS |
| `text-text-meta` on warm-white #F0F0EA: 4.99:1 PASS | PASS |
| `text-text-meta` on blush #FCF3ED: 5.25:1 PASS | PASS |
| `text-text-meta` on peach-cream #FDE9D7: ~4.73:1 PASS | PASS |
| Terracotta stat text on cream (large text ≥40px): 4.33:1 ≥ 3:1 PASS | PASS |
| Heading hierarchy: H1 → H2 → H3 correct on all pages | PASS |
| All external links have `rel="noopener noreferrer"` | PASS |
| External links in work/[slug] have `sr-only "(opens in new tab)"` cue | PASS |
| All images have descriptive alt text (4–200 chars, no "image of" prefix) | PASS |
| Decorative elements are `aria-hidden="true"` | PASS |
| FilterPill uses `aria-pressed` for toggle state | PASS |
| `<html lang="en">` on root layout | PASS |
| Certificate grid heading rotor: h2 sr-only "Credentials" on /certificates | PASS |
| Work page heading rotor: h2 sr-only "Deliverables" on /work | PASS |
| Blog page heading rotor: h2 sr-only "Posts" on /blog | PASS |
| Scroll indicator in Hero: opacity-90 → contrast PASS (previously opacity-60 = FAIL, already fixed in phase4-animations) | PASS |
| `reveal-on-scroll` sections: visible in non-supporting browsers (graceful degradation via `@supports`) | PASS |

### FIXED IN THIS AUDIT

**A1 — OG image alt text missing on About, Blog, Work index pages**

Social crawlers rely on OG image `alt` for description when images can't render. All three pages were missing `alt` on the OG image object.

- `app/about/page.tsx`: Added `alt: \`About — ${profile.name}\``
- `app/blog/page.tsx`: Added `alt: \`Blog — ${profile.name}\``
- `app/work/page.tsx`: Added `alt: \`Selected Work — ${profile.name}\``

**A2 — Twitter card missing `images` field on About, Blog, Work index pages**

Twitter's summary_large_image card requires the `images` field explicitly set in the `twitter` block (it does not inherit from `openGraph.images`). All three pages were missing it.

- Added `images: ['/og-image.svg']` to all three pages' twitter block.

---

## Peter — Performance / QA Findings

### PASS ✓

| Check | Result |
|---|---|
| All 6 certificate badge images present on disk at correct schema paths | PASS |
| Badge fallback via `onError` in BadgeImage points to existing `/images/certificates/placeholder.png` | PASS |
| Hero is pure CSS + text — no LCP image in critical path, fast paint | PASS |
| All `<img>` elements have explicit `width` + `height` — no CLS risk | PASS |
| Gallery images: `loading="lazy"` — not LCP-blocking | PASS |
| Hero image on `/work/[slug]`: `loading="lazy"` (below fold on mobile) | PASS |
| Framer Motion lazy-loaded via `HamburgerNavMount` + `next/dynamic` — excluded from homepage First Load JS | PASS |
| No console-error-generating patterns visible in code | PASS |
| Page titles correct on all pages (checked: Homepage, About, Work, Work/[slug], Certificates, Blog, Contact) | PASS |
| OG siteName, type, locale present on root layout (`en_CA`, `website`) | PASS |
| `robots.txt` present in `/public/` | PASS |
| `CNAME` file present for custom domain `skypistudio.com` | PASS |
| `og-image.svg` present in `/public/` | PASS |

### FIXED IN THIS AUDIT

**P1 — FAVICON MISSING (was P0)**

No favicon file existed anywhere in the project. Browser tabs showed the default document icon with no brand identity.

**Fix:** Created `app/icon.svg` — a 32×32 SVG with cream background, rounded corners, terracotta "S" in serif. Next.js App Router automatically serves this as `/icon.svg` and injects `<link rel="icon" href="/icon.svg" type="image/svg+xml" sizes="any">` into every page `<head>`.

**P2 — Missing OG + Twitter metadata on Certificates page**

`/certificates/page.tsx` had only `title` and `description` in its metadata — no `openGraph` or `twitter` block. Social shares of the certificates page would show no structured preview.

**Fix:** Added full `openGraph` + `twitter` blocks matching the site's metadata pattern.

**P3 — Missing OG + Twitter metadata on Contact page**

`/contact/page.tsx` same issue.

**Fix:** Added full `openGraph` + `twitter` blocks.

---

## Decisions for Sky

| # | Decision | Context |
|---|---|---|
| D1 | **OG image is SVG format** | `/public/og-image.svg` is SVG. Twitter/X, Facebook, and LinkedIn don't render SVG as OG images — social shares on those platforms will show no preview image. The `alt` text Alex fixed mitigates screen reader impact but not the missing visual. Fixing requires converting to PNG (≥ 1200×630px). This is a design+asset task outside this audit's scope. |
| D2 | **Favicon: .ico fallback for older browsers** | `app/icon.svg` covers Chrome 80+, Firefox 41+, Safari 12+. IE11 and some Chromium-based embedded browsers need a `.ico` file at `/favicon.ico`. If those audiences matter to Sky, add a `public/favicon.ico`. |

---

## Definition of Done — Checklist

- [x] typecheck PASS (`tsc --noEmit` — no @ts-ignore added)
- [x] UI tokens + scorecard N/A (no new UI components — audit only)
- [x] acceptance criteria PASS (all a11y + perf items audited; found items fixed)
- [x] rollback PASS (all changes are reversible git commits; no live DB or deploy)
- [x] reviewable PASS (diff on `feat/phase4-a11y-perf-qa` — all changes on branch)
- [x] no duplicate work PASS (pre-work scan confirmed; prior Alex audit 2026-05-29 was on different branch state)
- [x] no premature abstraction PASS (no new abstractions introduced)
- [x] minimally sufficient PASS (fixed only confirmed issues; no scope creep)
