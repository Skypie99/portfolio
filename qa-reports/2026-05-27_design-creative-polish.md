# Portfolio — Creative Polish Pass

**Date:** 2026-05-27
**Branch:** `design/portfolio-creative-polish-2026-05-27`
**Builder:** Claude (Opus 4.7 1M, acting as senior creative UI designer)
**Status:** Build green · 45/45 tests · lint clean

## Why this pass

The portfolio was already a well-crafted ffern.co-inspired editorial site, but a few moments undersold what Sky has actually shipped. This pass pushes from "very good" to "genuinely impressive" — without breaking the existing token system, the accessibility floor, or any of the Cycle-2-to-29 work baked in.

## Most impactful changes

### Hero — now lands in the first second
- **Tagline rewrite.** `"Building thoughtful AI work, one careful deliverable at a time."` → **`"AI tools, built slowly. Documented honestly."`** Punchier, sets the tone in 7 words.
- **Subhead rewrite.** Now leads with what's shipped: four live products, a multi-agent system that ships real commits, an accessibility map. Concrete, not generic.
- **"Available for work · 2026" pill** with a pulsing terracotta dot — sits above the eyebrow as a quiet recruiter signal.
- **Decorative radial wash** in the upper-right corner (pure CSS, zero perf cost) — adds warmth that the hero lacked before.
- **Display headline pushed to clamp(2.5–4.5rem), -0.025em tracking, text-balance** so multi-line breaks land editorially instead of widows.
- **Meta cluster below CTA**: "Vancouver, BC · 4 live projects · All open source" with bullet separators.

### Page rhythm — broke the cream monotony
- **Alternating section backgrounds**: cream → warm-white → cream → warm-white. The page now reads with editorial paragraphing instead of a single cream wash.
- **Section eyebrows** all carry a small terracotta dot for consistent signal.
- **Showcase stat strip** redesigned with `gap-px` vertical-rule treatment — the 4 chips now share a single inset border and pop on hover (cream → blush). Stat numerals upgraded to font-serif 2.75rem terracotta for editorial weight.

### Sidebar — now a proper brand mark
- Wordmark + role subtitle ("AI engineer · Accessibility")
- Pulsing "Available for work" status
- Featured callout preserved
- © year + location pinned to the bottom under the CTA

### Project cards — more refined elevation
- Hover state: 1px lift + soft shadow + border darkening, no scale
- Wide (featured) card lays out mockup + content side-by-side on md+
- New **"Live"** pill on cards that have a demo link (pulsing dot)
- Featured badge gets a soft shadow and a leading dot

### Footer — proper editorial close
- Brand block row above the 3 columns (wordmark · availability · location)
- 3-column nav grid preserved (Site / About / Elsewhere headings unchanged → Gary's Cycle 11 test still passes)
- Closing strip: "© 2026 Sky Halisky · All rights reserved" + "Made with care, in Canada"

### Hamburger nav — bigger and more confident
- Menu items scaled up to clamp(2.25–4rem) serif with -0.02em tracking
- "MENU" eyebrow at top, "Available for work · 2026" anchored at the bottom
- Numbered list (01–05) translates 1px right on hover

### Typography system additions
- `.text-balance` and `.text-pretty` utilities (native `text-wrap`) added to globals.css
- Applied across all h1/h2/h3 + all body paragraphs in marketing copy
- Body copy bumped from 16px → 17px in marketing sections (more legible at the column widths used)

## Token discipline

Every change uses the existing Tailwind tokens or CSS variables (`var(--color-*)`, `--space-*`, `--dur-*`). No magic numbers introduced. Two new keyframes added to globals.css with the existing reduced-motion gating pattern (`@media (prefers-reduced-motion: no-preference)`).

## What didn't change

- AccessibilityFloor (Alex §§): focus-visible, skip link, hamburger ARIA, alt text, sr-only cues, escape-to-close — all preserved
- The Cormorant + DM Sans + DM Mono type stack
- The terracotta / umber / cream / blush / peach-cream palette
- All 45 tests still pass
- `next build` clean, First Load JS 109 kB on `/` (within envelope)
- GitHub Pages static export still works (output: 'export', basePath, trailingSlash all untouched)

## Commits

```
9ef4607 design: page rhythm — alternating section bg, balanced headlines, dotted eyebrows
ac6a4f9 design: component polish — sidebar brand block, card hover, footer, nav
64eaa60 design: typography foundation — sharper tagline, hero ornaments, text-balance
```

## Verification

- `npm run typecheck` ✓
- `npm run lint` ✓ ("No ESLint warnings or errors")
- `npm run test` ✓ (45/45)
- `npm run build` ✓ (12 static pages exported)
- Hero verified visually at desktop (1440px) and mobile (375px) via preview screenshots
- Hamburger overlay verified open/close

## Open for Sky

The site is ready for Sky to merge. Once merged to `main`, the GitHub Pages deploy will pick up automatically.
