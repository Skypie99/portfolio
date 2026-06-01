# 2026-05-29 — Dani Design Critique Audit

**Role:** Dani (Creative Director)
**Scope:** Typography, spacing, hierarchy, and polish across homepage, blog listing, blog detail, work detail, about, and shared components.

---

## Summary

The portfolio has a well-reasoned token system (Cormorant serif + DM Sans + DM Mono, terracotta/cream palette, motion table), and the token-to-Tailwind mapping is disciplined. That said, a close read of the live pages reveals five concrete polish gaps: the section-header pattern overuses `mb-4` between the eyebrow dot and the h2 (creates visual crowding where a tighter `mb-2` would let the heading breathe under the label rather than feel stacked), the blog prose body uses `max-w-[720px]` against a `max-w-content: 1120px` container on the full-width column — acceptable, but mismatches the `max-w-[640px]` measure used everywhere else for body text, introducing an inconsistent line-length register. The hero h1 applies `style={{ letterSpacing: '-0.025em' }}` inline while the display-tier negative-tracking rule in globals.css covers `.font-serif.text-display-m` but not the hero's fluid clamp size class, meaning the hero's tracking is applied twice (both the inline style and the CSS rule selector match if Tailwind generates the matching class name). The `ProjectCard` content area has double padding — `p-6 md:p-8` on the content div plus `p-6` on the outer card — resulting in 48px of left indent on the inner content on desktop, which is generous but inconsistent with the card's `p-0` wide override. Finally the About page CTA section is missing the terracotta left-border accent that every other section heading on the page uses, breaking the visual rhythm established above it.

---

## Findings

| # | Title | Severity | File:line | Recommendation | Effort |
|---|-------|----------|-----------|----------------|--------|
| 1 | Section eyebrow `mb-4` creates visual crowding above h2 | medium | `app/page.tsx:147`, `app/about/page.tsx:99`, `app/work/[slug]/page.tsx:298` | Change `mb-4` to `mb-2` on every eyebrow `<p>` inside the `border-l-2 border-terracotta` header pattern. The h2 already has no margin-top; 16px gap between label and heading is too wide at this label size (12px mono caps). `mb-2` (8px) lands closer to the luxury spacing reference. | S |
| 2 | Blog prose measure inconsistency — `max-w-[720px]` vs site-wide `max-w-[640px]` | low | `app/blog/[slug]/page.tsx:198` | Change the `<article>` wrapper from `max-w-[720px]` to `max-w-[640px]` to match the body-text measure used on About, Work Index, and the homepage About section. 720px at 1.0625rem creates ~85 CPL at 1440px viewport — above the comfortable 66-72 CPL reading range for long-form prose. | S |
| 3 | Hero h1 inline `letterSpacing: -0.025em` conflicts with globals.css clamp selector | medium | `components/Hero.tsx:63`, `app/globals.css:200–205` | The globals.css rule matches `.font-serif.text-[clamp(2.25rem,...)]` shapes but the Hero uses `text-[clamp(2.5rem,7.5vw,4.5rem)]` — a different class name — so the CSS rule does NOT fire. The inline style is the sole tracking source, which is fine, but the value `-0.025em` is tighter than the `-0.01em` used everywhere else. Either align to `-0.02em` (matching About page h1 and work detail h1) or document explicitly why the hero gets a tighter value. Inline style is the right mechanism here; the CSS selector approach in globals.css is fragile (class-name-dependent). | low |
| 4 | `ProjectCard` content area has compounded padding (outer `p-6` + inner `p-6 md:p-8`) | medium | `components/ProjectCard.tsx:52,115` | The outer card div carries `p-6` in its class list, and the inner content div also carries `p-6 md:p-8`. On the non-wide variant this means the content sits at 48px indent from the card edge on desktop. The `wide` variant overrides with `md:p-0`, but the base card does not. Proposed fix: remove the `p-6` from the outer card wrapper (let the mockup area and content area own their own padding), or strip the inner content area padding and rely solely on the outer card `p-6`. Pick one source of truth. | M |
| 5 | About page CTA section missing terracotta left-border accent on h2 | low | `app/about/page.tsx:294–296` | Every other h2 section on the About page uses `<div class="mb-12 pl-4 border-l-2 border-terracotta">` with the eyebrow + heading pattern. The final CTA section (`Want to work together?`) renders the h2 directly with no wrapper accent and no eyebrow label. Add the `border-l-2 border-terracotta pl-4` wrapper div and an eyebrow `<p>` ("Contact") to close the rhythm. | S |
| 6 | Blog index listing has no dark-mode token on eyebrow or h1 | low | `app/blog/page.tsx:49,54` | The blog listing page header section uses `bg-cream` (not `dark:bg-dark-bg`), and the eyebrow `<p>` and h1 carry `text-text-meta` / `text-near-black` without corresponding `dark:` variants. Every other page's equivalent header carries `dark:text-dark-text-meta` and `dark:text-dark-text`. If dark mode is offered, this section will render cream-on-dark-bg without the proper text overrides. The prose body section below uses `bg-warm-white` also without `dark:bg-dark-card`. | low |
| 7 | Blog post prose lacks a distinct typographic treatment for `<h2>` vs `<h3>` at small viewports | low | `app/blog/[slug]/page.tsx:60–78` | At mobile (375px), the h2 `clamp(1.5rem, 3vw, 2.25rem)` resolves to `1.5rem` and the h3 `clamp(1.25rem, 2.5vw, 1.75rem)` resolves to `1.25rem` — a 4px difference. This is barely perceptible. Increase h2 minimum to `1.75rem` (matching the site's display-s scale, 19px → round up) so the hierarchy survives at narrow widths. | S |
| 8 | `TagPill` sand background (`#FBCFAC`) on blush surface (`#FCF3ED`) has low surface contrast | low | `components/TagPill.tsx:26`, `app/work/[slug]/page.tsx:107` | The blush background used on the work-detail hero area and gallery section has very low contrast against the sand TagPill background. Both are warm light tones; the difference is ~1.2:1. Per WCAG 1.4.11 (non-text contrast), UI component boundaries need 3:1 against adjacent colour. Propose swapping TagPill background on blush surfaces to `bg-peach-cream` or adding a `border border-sand` to lift the perceivable boundary. | low |

---

## DECISIONS FOR SKY

None of the above findings are privacy-sensitive or require a blocker decision. All are pure design/CSS changes with no auth, location, PII, or database surface. All can be proposed-and-merged by Shamus once Quinn and Alex give sign-off.

**No blockers to escalate.**
