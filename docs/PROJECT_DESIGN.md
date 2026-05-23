# PROJECT_DESIGN.md — AI Portfolio Website

**Author:** Dani (Creative Director)
**Cycle:** `cycle/auto-2026-05-23` (Day-0)
**Status:** PROPOSED — pending Alex's WCAG 2.2 AA contrast validation and Sky's ratification.
**Influences:** ffern.co warm minimalism (Sky-directed: "ignore the pet care context — memorise the styling, fonts, feel, vibe").

---

## 0. Design philosophy

Warm minimalism. Cream is the new white. The page itself is the canvas — type, whitespace, and a single terracotta accent do all the talking. Sky asked for "really bright and interactive" — we interpret that as **warm-bright** (cream backgrounds read as luminous, not stark) plus **tasteful motion** (slow easings, soft fades, scroll-triggered reveals — never bouncy, never loud).

Three rules everything else descends from:

1. **Restraint scales.** ffern's headings are 19px. Whitespace and editorial typography do the heavy lifting. We will not over-size or over-bold our way out of a layout problem.
2. **One accent does one job.** Terracotta `#B35F32` is the only chromatic accent in v1. Sand/Amber are tints of it for texture. No blues, no greens, no purples in primary surfaces (those live in the Brand Extensions reserve, see §1.5).
3. **The cream IS the brand.** Backgrounds shift between Cream / Warm White / Blush / Peach Cream to create rhythm without ever introducing a competing hue.

---

## Changelog
- **2026-05-23 (Day-0 revision)** — Applied Alex's WCAG 2.2 AA fixes (ACCESSIBILITY.md BLK-1/2/3): split Sage into text-passing #5C5D54 + decorative #717267; added interactive border token #888879 (Stone now decorative-only); added Umber accent-text token #7F4323 for links + 19px numerals (Terracotta retained for graphics + CTAs + ≥24px). Cormorant Light 300 restricted to ≥24px; Regular 400 below.

---

## 1. Tokens

### 1.1 CSS variable block (paste into `:root` when Shamus scaffolds)

```css
:root {
  /* Foundations (backgrounds) */
  --color-cream:        #FAF9F5;  /* default page bg */
  --color-warm-white:   #F0F0EA;  /* alt section bg, subtle contrast */
  --color-blush:        #FCF3ED;  /* cards, callouts, hover surfaces */
  --color-peach-cream:  #FDE9D7;  /* feature blocks, numbered-step bg */

  /* Terracotta accent scale */
  --color-sand:         #FBCFAC;  /* softest accent — tag pill bg, icon tint */
  --color-amber:        #E2976E;  /* mid accent — dots, icons, secondary CTAs */
  --color-terracotta:   #B35F32;  /* PRIMARY accent — CTA bg, links, key labels */
  --color-umber:        #7F4323;  /* deep accent — accent text on cream, hover */
  --color-bark:         #48230F;  /* darkest accent — large display accent only */

  /* Neutrals (borders, dividers, text) */
  --color-stone:        #DCDCD6;  /* decorative hairlines ONLY — fails 3:1, not for interactive borders */
  --color-stone-strong: #888879;  /* interactive border (3.41:1 on cream) — buttons, inputs */
  --color-pebble:       #B8B8AA;  /* disabled text, faint metadata (disabled-state exempt) */
  --color-sage-text:    #5C5D54;  /* metadata, captions, timestamps — WCAG-passing (was Sage #717267) */
  --color-sage:         #717267;  /* DECORATIVE ONLY — icon stroke, divider tint; never for text */
  --color-charcoal:     #484A43;  /* secondary body text */
  --color-near-black:   #232420;  /* primary body + heading text */

  /* Semantic aliases (used by components — never the raw token) */
  --color-bg:                var(--color-cream);
  --color-bg-alt:            var(--color-warm-white);
  --color-surface:           var(--color-blush);
  --color-surface-warm:      var(--color-peach-cream);
  --color-text:              var(--color-near-black);
  --color-text-muted:        var(--color-charcoal);
  --color-text-meta:         var(--color-sage-text);     /* #5C5D54 — was Sage, now passes 4.5:1 on all warm bgs */
  --color-decorative-sage:   var(--color-sage);          /* #717267 — decorative ONLY, never text */
  --color-border-decorative: var(--color-stone);         /* #DCDCD6 — hairlines that carry no interaction */
  --color-border-interactive: var(--color-stone-strong); /* #888879 — ghost-button + input borders (3:1) */
  --color-border:            var(--color-border-decorative); /* legacy alias — defaults to decorative */
  --color-accent:            var(--color-terracotta);    /* graphical: dot, focus ring, CTA bg */
  --color-accent-primary:    var(--color-terracotta);    /* CTA bg, decorative dots, ≥24px large text, hover */
  --color-accent-text:       var(--color-umber);         /* #7F4323 — links + 19px numerals (7.30:1 on cream) */
  --color-accent-soft:       var(--color-amber);
  --color-accent-deep:       var(--color-umber);
  --color-link:              var(--color-umber);         /* #7F4323 — inline link text */
  --color-link-hover:        var(--color-terracotta);    /* #B35F32 — hover shifts to graphical+motion context */

  /* Typography */
  --font-display: "Cormorant Garamond", "Garamond", "Georgia", serif;
  --font-body:    "DM Sans", "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono:    "DM Mono", "JetBrains Mono", ui-monospace, monospace;

  --fw-display-light: 300;
  --fw-display-reg:   400;
  --fw-body-light:    300;
  --fw-mono-reg:      400;

  /* Type scale (px / rem at 16px base) */
  --fs-display-l: 3.25rem;   /* 52px — single hero word, sparingly */
  --fs-display-m: 2.25rem;   /* 36px — section openers */
  --fs-display-s: 1.1875rem; /* 19px — ffern's signature heading */
  --fs-body:      1rem;      /* 16px */
  --fs-body-sm:   0.875rem;  /* 14px */
  --fs-label:     0.75rem;   /* 12px — DM Mono, UPPERCASE, tracked +1.5px */
  --fs-meta:      0.6875rem; /* 11px — captions */

  --lh-display: 1.15;
  --lh-body:    1.65;
  --lh-label:   1.4;

  --ls-body:    0.0156em;    /* +0.25px @ 16px */
  --ls-label:   0.125em;     /* +2px wide tracking */

  /* Spacing scale (4px base) */
  --space-1:  0.25rem;   /*  4px */
  --space-2:  0.5rem;    /*  8px */
  --space-3:  0.75rem;   /* 12px */
  --space-4:  1rem;      /* 16px */
  --space-5:  1.5rem;    /* 24px */
  --space-6:  2rem;      /* 32px */
  --space-8:  3rem;      /* 48px */
  --space-10: 4rem;      /* 64px */
  --space-12: 6rem;      /* 96px — minimum section padding */
  --space-16: 8rem;      /* 128px — comfortable section padding */
  --space-20: 12.5rem;   /* 200px — maximum section padding (hero) */

  /* Radii */
  --radius-sm:  4px;     /* hairline elements */
  --radius-md:  8px;     /* cards, inputs */
  --radius-lg:  16px;    /* feature cards */
  --radius-pill: 999px;  /* tags, buttons */

  /* Borders */
  --border-hairline:    1px solid var(--color-border-decorative);   /* decorative dividers only */
  --border-interactive: 1px solid var(--color-border-interactive);  /* ghost button, inputs, focus surrounds */

  /* Shadows (extremely subtle — almost never used) */
  --shadow-soft: 0 1px 2px rgba(35, 36, 32, 0.04),
                 0 4px 12px rgba(35, 36, 32, 0.03);

  /* Motion */
  --ease-out:    cubic-bezier(0.22, 1, 0.36, 1);   /* gentle ease-out */
  --ease-soft:   cubic-bezier(0.4, 0, 0.2, 1);     /* standard soft */
  --dur-fast:    180ms;
  --dur-base:    280ms;
  --dur-slow:    520ms;
  --dur-reveal:  900ms;  /* scroll-triggered reveals */

  /* Layout */
  --sidebar-w:   280px;          /* persistent left sidebar */
  --content-max: 1120px;         /* main content max width */
  --gutter:      var(--space-6); /* 32px gutter */
}
```

### 1.2 Token count summary

| Group         | Count |
|---------------|-------|
| Colors (raw)  | 17    |
| Colors (semantic aliases) | 11 |
| Type families | 3     |
| Font weights  | 4     |
| Type sizes    | 7     |
| Spacing steps | 10    |
| Radii         | 4     |
| Motion (ease + duration) | 6 |
| Layout        | 3     |
| **Total tokens** | **65** |

### 1.5 Brand Extensions — held in reserve

`Petal Pink #E8C4B8`, `Moss #6B7C5E`, `Earth #8B7355`, `Wildflower #9B7EA6` are documented but **NOT included in v1**. We hold them for future use in tagging categories (e.g., color-coded project tags once Sky's deliverables are loaded). Introducing them in v1 dilutes the single-accent restraint. Decision deferred to Sky.

---

## 2. Typography stack

### 2.1 Google Fonts `<link>` snippet

Drop this in the HTML `<head>` (or Next.js `<Head>`). Three families, four weights total, with `display=swap` to avoid FOIT.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link
  href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=DM+Sans:wght@300&family=DM+Mono:wght@400&display=swap"
  rel="stylesheet">
```

Self-hosting via `next/font/google` is preferred when Shamus scaffolds — same families, same weights — to remove the third-party request.

### 2.2 Type scale

| Token             | Family              | Weight | Size       | Line-height | Letter-spacing | Case      | Usage |
|-------------------|---------------------|--------|------------|-------------|----------------|-----------|-------|
| `--fs-display-l`  | Cormorant Garamond  | 300    | 52px/3.25rem | 1.15      | 0              | Title     | Hero one-word statement (`Portfolio.`) |
| `--fs-display-m`  | Cormorant Garamond  | 300    | 36px/2.25rem | 1.15      | 0              | Title     | Section openers |
| `--fs-display-s`  | Cormorant Garamond  | 400    | 19px/1.1875rem | 1.2     | 0              | Title     | Card titles, ffern signature heading |
| `--fs-body`       | DM Sans             | 300    | 16px/1rem  | 1.65        | +0.25px        | Sentence  | Paragraph body |
| `--fs-body-sm`    | DM Sans             | 300    | 14px/0.875rem | 1.6      | +0.25px        | Sentence  | Secondary body, footer |
| `--fs-label`      | DM Mono             | 400    | 12px/0.75rem | 1.4       | +2px           | UPPERCASE | Section labels, button text, numbered steps |
| `--fs-meta`       | DM Mono             | 400    | 11px/0.6875rem | 1.4     | +2px           | UPPERCASE | Metadata, timestamps |

**Rules:**
- Never bold a Cormorant headline (300 or 400 only).
- **Cormorant Light 300 is restricted to display tiers ≥24px** (`--fs-display-l` 52px, `--fs-display-m` 36px). Per Alex §7.2, at smaller sizes the hairline strokes dissolve on low-density screens and for low-vision visitors. Any Cormorant text at ≤18px MUST use Regular 400 (`--fs-display-s` at 19px is already 400 — Shamus must enforce in CSS for `.card-title`, `.wordmark`, and any tier ≤18px).
- Body is always 300-weight DM Sans. We do not use DM Sans 400+ for paragraphs.
- DM Mono is ALWAYS uppercase with wide tracking. Never use it for sentence-case prose.
- Numbers in process steps (`01`, `02`) are DM Mono `--fs-display-s` or `--fs-label`, color `--color-accent-text` (Umber) — never raw Terracotta at these sizes (Alex BLK-3.b).

---

## 3. Component primitives

Visual rules only — no code, no component implementations. Shamus implements; Dani specs.

### 3.1 Button — primary

- Shape: full-width within its container, rounded `--radius-pill`, height 56px.
- Background: `--color-cream`. Border: `--border-interactive` (uses `--color-border-interactive` `#888879` — passes 3:1 per Alex BLK-2).
- Text: `--font-mono` `--fs-label` UPPERCASE tracked `--ls-label`, color `--color-near-black` (label sits on cream-tinted bg, NOT on Terracotta — no change from contrast standpoint).
- **Terracotta signature dot:** an 8px circle filled `--color-accent-primary` (Terracotta) sits immediately left of the label with 12px gap. This is the brand signature — graphical use, stays Terracotta.
- Hover: bg shifts to `--color-blush`, dot grows to 10px, transition `--dur-base --ease-out`.
- Focus-visible: 2px outline `--color-accent-primary` (Terracotta), offset 3px.
- Active: bg `--color-peach-cream`, no scale change (we don't bounce).
- Disabled: text `--color-pebble`, dot `--color-stone`, no hover.

### 3.2 Button — ghost

- Same shape and type as primary.
- Background: transparent. Border: `--border-interactive` (Stone `#DCDCD6` fails 3:1 — must use `--color-border-interactive` `#888879`).
- Hover: bg `--color-warm-white`, border darkens further to `--color-charcoal`.

### 3.3 Card — project/deliverable

- Background: `--color-cream` (default) or `--color-blush` (featured).
- Border: `--border-interactive` (cards are clickable surfaces — their border is an affordance, so it must meet 3:1 per Alex BLK-2). Radius: `--radius-lg`.
- Padding: `--space-6` (32px).
- Internal layout: editorial image top (16:10 ratio), then `--space-5` gap, then meta label (`--fs-label`), title (`--fs-display-s`), 1–2 line description (`--fs-body-sm`).
- Hover: image scales 1.02 over `--dur-slow --ease-out`, border deepens to `--color-pebble`. No card lift, no shadow.

### 3.4 Sidebar — persistent left rail

- Width `--sidebar-w` (280px), full viewport height, sticky.
- Background: `--color-cream` (matches body — visually it's a quiet column, not a panel).
- No border (whitespace separates it from the main column).
- Contents, top to bottom with `--space-12` between groups:
  1. **Wordmark** — "SKY HALISKY" or chosen wordmark in `--font-display` 400, `--fs-display-s` (19px), color `--color-near-black`.
  2. **Featured item** — small editorial thumbnail (1:1 ratio, 64px), `--fs-label` "FEATURED", and a 19px Cormorant title linking to it.
  3. **CTA button** (primary variant), full-width.
- Padding: `--space-8` (48px) all sides.
- Mobile (<960px): sidebar collapses behind the hamburger; wordmark moves to top-left of header.

### 3.5 Hamburger nav — top-right

- 40×40px hit area in top-right of viewport, fixed.
- Glyph: three 1px lines, 22px wide, `--color-near-black`, 6px vertical gap.
- Hover: lines shift to `--color-terracotta`, transition `--dur-fast --ease-out`.
- Tap → full-screen overlay: `--color-cream` background, large `--fs-display-m` link list left-aligned with `--space-6` vertical rhythm, single `--color-terracotta` dot beside the active route.
- Close: same hit area becomes an X glyph.

### 3.6 Numbered-step block

- Used for process / "how I work" sections.
- Background: `--color-peach-cream` panel, `--radius-lg`, padding `--space-8`.
- Each step is a horizontal row, `--space-6` gap:
  - Left: `01` in `--font-mono` `--fs-display-s` (19px), color `--color-accent-text` (Umber `#7F4323`). 19px is below the 24px large-text threshold, so Terracotta `#B35F32` fails 4.5:1 here — per Alex BLK-3.b, numerals use Umber.
  - Right: step title in `--font-display` 400 `--fs-display-s` + 1-line description in `--fs-body-sm`.
- Vertical hairline `--color-border-decorative` (Stone) between steps — purely decorative, no interaction, exempt from 3:1.

### 3.7 Hero block

- Full viewport height (min-height 80vh), centered content.
- Background: `--color-cream`.
- Top-left of main column: `--fs-label` `--color-text-meta` UPPERCASE eyebrow text (e.g., "AI PORTFOLIO — 2026"). Uses the text-passing `#5C5D54` per Alex BLK-1, never raw Sage `#717267`.
- Below: `--fs-display-l` Cormorant 300 statement (max 6 words).
- Below: `--fs-body` paragraph (max 2 lines, max-width 540px).
- Bottom: primary button.
- Padding: `--space-20` top (200px), `--space-16` bottom.
- Editorial photo OR negative space to the right of the main column — never both.

### 3.8 Tag pill

- Shape: `--radius-pill`, padding `0 --space-3` vertical `--space-1`.
- Background: `--color-sand`. Text: `--color-umber`, `--font-mono` `--fs-meta` UPPERCASE.
- Used for project category, tech stack, certification type.

### 3.9 Footer column

- Background: `--color-warm-white` (subtle handoff from `--color-cream` body).
- Three columns at desktop: brand wordmark + tagline · sitemap links · contact/social.
- Type: `--fs-body-sm` for links (DM Sans 300), `--fs-label` for column headers.
- Top padding `--space-12`, bottom `--space-8`.
- Hairline divider `--color-border-decorative` (Stone) at top — purely decorative section separator.

---

## 4. Layout primitives

### 4.1 Page shell

```
┌──────────────────────────────────────────────────┐
│ SIDEBAR (280px sticky)  │  MAIN (flex, max 1120) │
│                         │                        │
└──────────────────────────────────────────────────┘
```

- Two-column at ≥960px (sidebar + main).
- One-column at <960px (sidebar contents move into hamburger overlay; wordmark to top-left of main).
- Body bg `--color-cream`; sidebar bg matches (no visible divider).

### 4.2 Section block

- Every major section honors the radical-whitespace rule: vertical padding between `--space-12` (96px, dense) and `--space-20` (200px, hero/breathing). Default `--space-16` (128px).
- Inner max-width `--content-max` (1120px).
- Inner gutter `--gutter` (32px) left + right.
- Optional `--fs-label` `--color-text-meta` eyebrow above section heading; `--space-4` (16px) between eyebrow and heading. (Eyebrow is text — uses the text-passing token, not raw Sage.)

### 4.3 Editorial 12-column grid

- 12 columns, `--gutter` (32px) gap.
- Used for editorial pairings (image left 7 cols + copy right 5 cols, or vice versa).
- Product/deliverable page pattern: image takes cols 1–7, details cols 8–12.
- Mobile collapses to single column with `--space-6` (32px) vertical rhythm.

---

## 5. Motion

### 5.1 Principles

1. **Slow easings beat fast ones.** Default duration `--dur-base` (280ms). Reveals at `--dur-reveal` (900ms).
2. **Fade + translate, not scale + spring.** Elements rise 12-16px while fading in. No bouncy springs, no overshoots.
3. **One motion per interaction.** A hover changes ONE property visibly (bg color, dot size, opacity) — not three at once.
4. **Scroll reveals are stagger-friendly.** Children of a section can fade up with 60-100ms stagger; the parent triggers when its top crosses 80% of viewport.
5. **Cursor follows the eye.** Link hover: 180ms color shift `--color-near-black → --color-terracotta`, underline draws in left-to-right.

### 5.2 Reduced-motion respect

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

All reveal animations must check `prefers-reduced-motion` and render the end state immediately when reduced. No exceptions.

### 5.3 Standard interactions catalogue

| Element            | Trigger     | Property            | Duration       | Easing       |
|--------------------|-------------|---------------------|----------------|--------------|
| Link               | hover       | color + underline   | `--dur-fast`   | `--ease-out` |
| Button             | hover       | bg + dot size       | `--dur-base`   | `--ease-out` |
| Card               | hover       | image scale + border| `--dur-slow`   | `--ease-out` |
| Section            | scroll-in   | fade + translateY   | `--dur-reveal` | `--ease-out` |
| Hamburger overlay  | open        | fade + clip-path    | `--dur-base`   | `--ease-soft`|

---

## 6. Photography direction

Sky needs to source / generate / commission imagery. Bullet rules so the brief is unambiguous:

- **Soft natural light, not studio.** Window-light, golden-hour, overcast diffusion. Avoid hard shadows and ring-light gloss.
- **Earthy, tactile surfaces.** Linen, wood grain, terracotta, raw paper, ceramic. No glass, no chrome, no glossy plastic backgrounds.
- **Muted, warm palette.** Cream, beige, oat, faded terracotta, sage, dusty blush. If a photo's dominant hue is bright blue/green/red, it doesn't fit.
- **Negative space matters.** Subjects should occupy 40–60% of the frame; the rest is breathing room. Aspect ratios: 1:1 (thumbnails), 16:10 (cards), 4:5 (editorial features).
- **Human-scale, not corporate.** Hands, in-progress work, a sketchbook, a screen mid-task — over polished hero shots of finished products.
- **For AI deliverable thumbnails:** abstract typographic compositions on cream backgrounds work better than literal screenshots. Or one-color editorial illustrations.
- **NEVER:** stock-photo handshakes, gradient backgrounds, AI-generated faces, harsh-flash product shots, anything with a watermark or visible logo.

---

## 7. Open questions for Alex — WCAG 2.2 AA contrast pairs to validate

Alex: please run contrast on EVERY pair below at the body/large-text threshold appropriate (normal text needs 4.5:1, large text ≥18.66px regular or ≥14px bold needs 3:1, UI components need 3:1). All values are sRGB. Flag any that fall short and propose the smallest token adjustment.

### 7.1 Text on background pairs (target 4.5:1 for normal text)

| Foreground         | Background           | Used where                              | Expected risk |
|--------------------|----------------------|-----------------------------------------|---------------|
| `#232420` Near Black | `#FAF9F5` Cream     | Primary body text, headings             | Should pass comfortably |
| `#232420` Near Black | `#F0F0EA` Warm White| Body on alt sections                    | Should pass |
| `#232420` Near Black | `#FCF3ED` Blush     | Body on cards                           | Should pass |
| `#232420` Near Black | `#FDE9D7` Peach Cream | Body in numbered-step blocks          | Should pass |
| `#484A43` Charcoal | `#FAF9F5` Cream      | Secondary body, captions                | **Borderline — please verify** |
| `#484A43` Charcoal | `#F0F0EA` Warm White | Secondary body alt                      | **Borderline — please verify** |
| `#484A43` Charcoal | `#FCF3ED` Blush      | Secondary body on cards                 | **Borderline — please verify** |
| `#717267` Sage     | `#FAF9F5` Cream      | Metadata, eyebrow labels                | **HIGH RISK — likely fails 4.5:1, may pass 3:1 large only** |
| `#717267` Sage     | `#FCF3ED` Blush      | Metadata on cards                       | **HIGH RISK** |
| `#B8B8AA` Pebble   | `#FAF9F5` Cream      | Disabled text                           | Disabled exempt from 4.5:1 but flag if egregious |
| `#B35F32` Terracotta | `#FAF9F5` Cream    | Link color, CTA dot                     | Should pass for links; verify |
| `#B35F32` Terracotta | `#FCF3ED` Blush    | Links on cards                          | Verify |
| `#7F4323` Umber    | `#FBCFAC` Sand       | Tag pill text on tag pill bg            | Should pass |
| `#7F4323` Umber    | `#FAF9F5` Cream      | Accent text alternative                 | Should pass |

### 7.2 Non-text UI contrast (target 3:1)

| Element              | Foreground         | Background         | Pair                 |
|----------------------|--------------------|--------------------|----------------------|
| Hairline border      | `#DCDCD6` Stone    | `#FAF9F5` Cream    | **HIGH RISK — likely fails 3:1; may be acceptable as decorative divider but NOT for input borders** |
| Input border (TBD)   | `#B8B8AA` Pebble   | `#FAF9F5` Cream    | Verify for form inputs |
| Focus ring           | `#B35F32` Terracotta | `#FAF9F5` Cream  | Should pass |
| Button border (ghost)| `#DCDCD6` Stone    | `#FAF9F5` Cream    | **Same risk as hairline** |
| Terracotta dot (8px) | `#B35F32`          | `#FAF9F5` Cream    | Should pass |

### 7.3 Decisions Dani is escalating to Sky

1. **Brand Extensions (Petal Pink, Moss, Earth, Wildflower) — include in v1 or hold?**
   Recommendation: HOLD. Single-accent restraint is core to ffern's read. Add only if v2 needs categorical color coding.
2. **Sage `#717267` for metadata at 11–12px is the biggest accessibility risk.**
   If Alex confirms it fails 4.5:1 on cream, Dani's fallback is to darken metadata to `#5C5D54` (a tuned-darker sage) or fall back to Charcoal `#484A43`. Dani prefers tuned-darker sage to preserve the soft editorial feel — Sky to confirm if a one-token adjustment is OK.
3. **Hairline borders (`#DCDCD6` Stone on Cream) are aesthetically intentional but likely below 3:1.**
   Pure-decorative dividers are exempt from WCAG, but ANY input border, focus indicator, or interactive separator must meet 3:1. Dani proposes a darker hairline `#C4C4BD` (a tuned Stone) ONLY for form inputs and interactive borders. Sky to confirm.
4. **Brand-color split: confirm Terracotta = graphics + CTAs + hover; Umber = links + 19px numerals.** Per Alex's recommended Option B (ACCESSIBILITY.md §9.1, BLK-3): keep Terracotta `#B35F32` as the brand accent for the CTA dot, focus ring, CTA backgrounds, hover indicators, and any large-text accent ≥24px. Promote Umber `#7F4323` (already in the palette) to canonical text-accent for inline links and the 19px numbered-step numerals. The visual difference reads as "deeper orange," not a new hue — brand reads identically. Dani has applied this in §1.1 semantic aliases and §3.6; needs Sky's ratification.
5. **Cormorant Garamond Light 300 restricted to ≥24px display tiers.** Per Alex §7.2: Light 300 hairlines dissolve at smaller sizes on low-density screens. Dani's §2.2 type scale now mandates Regular 400 for any Cormorant tier ≤18px (in practice this means `--fs-display-s` 19px card titles and the sidebar wordmark — both already specced as 400, but Shamus must enforce). Visible aesthetic shift on cards: the title strokes will read slightly heavier than ffern's reference. Sky to confirm this is acceptable.

Alex returns findings to `docs/ACCESSIBILITY.md`. Any failing pair becomes a BLOCKER until resolved.

---

## 8. What this spec deliberately does NOT cover

- Component code / JSX implementations (Shamus's job).
- Iconography library choice (deferred — propose Lucide as a quiet, line-style fit, but no commitment).
- Dark mode (out of scope for v1; ffern itself is light-only and the warm palette doesn't have an obvious dark inversion).
- Form field components beyond noting border requirements (deferred until Quinn confirms a contact form).
- Animation library (Framer Motion is a likely fit but Shamus chooses).

---

## 9. Sign-off chain

1. **Alex** — validate every pair in §7. Block on any failure.
2. **Sky** — ratify color extension hold (§1.5), sage darkening (§7.3.2), hairline darkening (§7.3.3).
3. **Shamus** — only then implement tokens in `app/globals.css` (or equivalent) verbatim from §1.1.

This spec is PROPOSED until those three steps complete.
