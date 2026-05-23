# Homepage Wireframe — Hero + First Fold

**Author:** Dani · **Cycle:** `cycle/auto-2026-05-23`
**Pairs with:** `/Users/skypie/Portfolio/docs/PROJECT_DESIGN.md`
**For:** Shamus (scaffolding), Alex (a11y review), Sky (ratification)

All token references resolve to the CSS variables in `PROJECT_DESIGN.md` §1.1.

---

## Desktop layout (≥960px)

```
╔════════════════════════════════════════════════════════════════════════════════╗
║                                                                              ☰ ║   ← hamburger top-right, fixed
║                                                                                ║       40×40 hit area, 1px lines
║  ┌─────────────────────┐  ┌───────────────────────────────────────────────┐  ║
║  │                     │  │                                               │  ║
║  │                     │  │                                               │  ║
║  │   SKY HALISKY       │  │   AI PORTFOLIO — 2026                         │  ║   ← eyebrow label
║  │                     │  │                                               │  ║       (--fs-label, --color-sage)
║  │                     │  │                                               │  ║
║  │                     │  │   Practical AI work,                          │  ║   ← display heading
║  │                     │  │   thoughtfully made.                          │  ║       (--fs-display-l,
║  │                     │  │                                               │  ║        Cormorant 300)
║  │   FEATURED          │  │                                               │  ║
║  │   ┌──────┐          │  │   A small studio of AI-assisted tools,        │  ║   ← body paragraph
║  │   │ img  │          │  │   audits, and reference materials. Built      │  ║       (--fs-body, DM Sans 300
║  │   └──────┘          │  │   slowly. Documented honestly.                │  ║        max-width 540px)
║  │                     │  │                                               │  ║
║  │   Latest:           │  │                                               │  ║
║  │   Mutual Mesh →     │  │   ┌─────────────────────────────────────┐    │  ║
║  │                     │  │   │  ●  VIEW THE WORK                   │    │  ║   ← primary button
║  │                     │  │   └─────────────────────────────────────┘    │  ║       (terracotta dot + label,
║  │   ┌─────────────┐   │  │                                               │  ║        cream bg + hairline,
║  │   │ ●  CONTACT  │   │  │                                               │  ║        pill radius)
║  │   └─────────────┘   │  │                                               │  ║
║  │                     │  │                                               │  ║
║  └─────────────────────┘  └───────────────────────────────────────────────┘  ║
║                                                                                ║
║  ◀── 280px ──────────────▶  ◀──── flexible up to 1120px ──────────────────▶   ║
║      sidebar                  main content column                              ║
║                                                                                ║
║                                                                                ║
║                       ↓  --space-20 (200px) vertical padding  ↓                ║
║                                                                                ║
║                                                                                ║
║                          ──── SECTION 2 BEGINS BELOW ────                      ║
║                                                                                ║
╚════════════════════════════════════════════════════════════════════════════════╝

Page bg: --color-cream (#FAF9F5)
Sidebar bg: --color-cream (same — invisible column)
No visible divider between sidebar and main — whitespace separates.
```

### Desktop region-by-region annotations

| Region                       | Tokens                                              | Notes |
|------------------------------|-----------------------------------------------------|-------|
| Page background              | `--color-bg` (Cream `#FAF9F5`)                      | Default. Never breaks. |
| Sidebar wrapper              | width `--sidebar-w` (280px), padding `--space-8` (48px), bg `--color-cream`, sticky | One quiet column. |
| Wordmark "SKY HALISKY"       | `--font-display` 400, `--fs-display-s` (19px), `--color-near-black` | ffern signature 19px heading. |
| Featured thumb               | 64×64 1:1, `--radius-md`                            | Editorial photo per §6. |
| Featured label "FEATURED"    | `--font-mono`, `--fs-label`, `--ls-label`, `--color-sage` | UPPERCASE. |
| Featured title "Mutual Mesh →" | `--font-display` 400, `--fs-display-s` (19px), `--color-near-black` | Link color `--color-terracotta` on hover. |
| Sidebar CTA button "CONTACT" | Primary button per §3.1 (full-width within sidebar) | Terracotta dot + label. |
| Hamburger glyph              | 40×40, three 1px lines `--color-near-black`         | Fixed top-right. |
| Eyebrow "AI PORTFOLIO — 2026"| `--font-mono`, `--fs-label`, `--ls-label`, `--color-sage` | Above hero heading, gap `--space-4` (16px). |
| Hero heading                 | `--font-display` 300, `--fs-display-l` (52px), `--color-near-black`, `--lh-display` (1.15) | Max 6 words. Two-line break OK. |
| Hero body                    | `--font-body` 300, `--fs-body` (16px), `--color-text-muted` (Charcoal), max-width 540px, `--lh-body` (1.65) | 1–2 sentences. |
| Primary CTA "VIEW THE WORK"  | Primary button per §3.1, width auto (NOT full main column width — sits ~320px wide), `--space-8` (48px) gap above | Pill, cream bg, hairline border, terracotta dot. |
| Vertical rhythm in hero      | eyebrow → `--space-4` → heading → `--space-6` → body → `--space-8` → button | |
| Hero outer padding           | top `--space-20` (200px), bottom `--space-16` (128px), horizontal `--gutter` (32px) | Honors radical-whitespace rule. |

---

## Mobile layout (<960px)

```
╔══════════════════════════════════════╗
║                                    ☰ ║   ← hamburger fixed top-right
║                                      ║
║  SKY HALISKY                         ║   ← wordmark moves to top-left
║                                      ║       of main, --fs-display-s
║                                      ║
║                                      ║
║                                      ║
║                                      ║
║  AI PORTFOLIO — 2026                 ║   ← eyebrow label
║                                      ║
║                                      ║
║  Practical AI                        ║   ← hero heading
║  work, thoughtfully                  ║       (--fs-display-m at mobile,
║  made.                               ║        steps down from 52→36px)
║                                      ║
║                                      ║
║  A small studio of AI-assisted       ║   ← body paragraph
║  tools, audits, and reference        ║       (--fs-body, full width
║  materials. Built slowly.            ║        within page gutter)
║  Documented honestly.                ║
║                                      ║
║                                      ║
║  ┌────────────────────────────────┐  ║
║  │  ●  VIEW THE WORK              │  ║   ← primary button
║  └────────────────────────────────┘  ║       (full-width within gutter)
║                                      ║
║                                      ║
║                                      ║
║                                      ║
║  ↓ --space-12 (96px) padding ↓       ║
║                                      ║
║  ──── FEATURED ITEM CARD BELOW ────  ║   ← sidebar's "featured" content
║                                      ║       relocates into main flow
║                                      ║       as the first card after hero
╚══════════════════════════════════════╝

Page bg: --color-cream
Page gutter: --space-5 (24px) at narrow widths, --space-6 (32px) at ≥600px
Wordmark gap from top: --space-6 (32px)
Hero heading drops one step: --fs-display-m (36px) on mobile
Button stretches full gutter-to-gutter width
Sidebar content (featured + CTA) merges into main flow below the hero
Hamburger overlay reveals sitemap nav at full-screen
```

### Mobile region-by-region annotations

| Region                       | Tokens                                              | Notes |
|------------------------------|-----------------------------------------------------|-------|
| Page padding (horizontal)    | `--space-5` (24px) <600px, `--space-6` (32px) ≥600px | |
| Wordmark                     | Top-left of main, `--font-display` 400, `--fs-display-s` (19px) | Hamburger remains top-right. |
| Hero heading downscale       | `--fs-display-m` (36px) on mobile                  | 52px is too aggressive on a narrow column. |
| Hero outer padding           | top `--space-12` (96px), bottom `--space-10` (64px) | Vertical rhythm stays generous but mobile-appropriate. |
| Primary button width         | 100% of gutter-bound width                          | Honors the "full-width rounded-corner" pattern from brief. |
| Sidebar content              | Featured card and Contact CTA reflow into main column below hero, separated by `--space-12` (96px) | One-column shell. |
| Hamburger overlay            | Full-screen `--color-cream` bg, link list `--fs-display-m` left-aligned with `--space-6` between items, terracotta dot beside active route | Per §3.5. |

---

## Interaction notes (Sky's "bright and interactive" twist)

- **Hero scroll-in:** eyebrow → heading → body → button fade up 12px with 100ms stagger on initial load, `--dur-reveal` (900ms), `--ease-out`. Respects `prefers-reduced-motion`.
- **Heading hover:** no interaction (display text isn't a link).
- **"VIEW THE WORK" button:** hover transitions bg `--color-cream → --color-blush`, terracotta dot grows from 8px to 10px, `--dur-base --ease-out`. Focus-visible: 2px terracotta outline at 3px offset.
- **Sidebar "Mutual Mesh →" link:** color shifts `--color-near-black → --color-terracotta` and the arrow translates +4px right on hover, `--dur-fast --ease-out`.
- **Hamburger glyph hover:** three lines shift to `--color-terracotta`, `--dur-fast --ease-out`.
- **Cursor parallax (optional, defer to Shamus):** very subtle (max 8px translate) parallax on the featured-item thumbnail when cursor moves across the sidebar. Skip on touch and on reduced-motion.

---

## What's deliberately NOT in this mockup

- Sections below the hero (project grid, numbered "how I work" steps, contact footer) — those are next-cycle work once Sky ratifies the system.
- An actual editorial photo to the right of the hero copy — Dani proposes negative space for v1 launch; a photo can be slotted in once Sky sources imagery per §6.
- Theme switcher — single warm-light theme only.
- Localization — English-only for v1.

---

## Ratification checklist before Shamus scaffolds

- [ ] Sky confirms the hero copy direction ("Practical AI work, thoughtfully made." is Dani's strawman — replace with Sky's actual statement).
- [ ] Sky confirms the wordmark text ("SKY HALISKY" used here as placeholder).
- [ ] Alex returns WCAG findings on the pairs in `PROJECT_DESIGN.md` §7 — all pairs in this mockup must clear.
- [ ] Sky ratifies the v1 hold on Brand Extensions (§1.5) and any sage/hairline darkening Alex requires.
