# ACCESSIBILITY.md — AI Portfolio Website

**Author:** Alex (Accessibility Engineer)
**Cycle:** `cycle/auto-2026-05-23` (Day-0)
**Standard:** WCAG 2.2 Level AA (Constitution v1.3 Art. 7 — accessibility is a non-negotiable pillar).
**Status:** Contrast audit complete. **3 blockers identified for Dani.** **2 decisions escalated to Sky.**
**Companion docs:** `docs/PROJECT_DESIGN.md` (Dani), `docs/PERSONAS.md` (Riley).

---

## 0. How to read this document

The headline output is §1 — the contrast audit of every color pair Dani proposed in `PROJECT_DESIGN.md` §7. Anything marked **FAIL** is a hard blocker: Shamus cannot scaffold the token block until Dani replaces or aliases it per §1.3.

Sections §2–§7 are binding patterns: Dana, Shamus, and Dani must implement them. Section §8 is the consolidated blocker list for Dani. Section §9 is what needs Sky's call.

Method (so reviewers can verify): contrast ratios computed using the canonical WCAG formula —
1. sRGB hex → 0–1 channel values
2. per-channel: `c ≤ 0.03928 ? c/12.92 : ((c+0.055)/1.055)^2.4`
3. relative luminance: `L = 0.2126·R + 0.7152·G + 0.0722·B`
4. contrast: `(L_lighter + 0.05) / (L_darker + 0.05)`

Thresholds applied:
- **4.5:1** — normal text (body, captions, metadata, labels)
- **3:1** — large text (≥24px regular; ≥18.66px bold, but Dani forbids bold so the 24px threshold governs) AND non-text UI components / focus rings / interactive borders (WCAG 1.4.11)

A note on personas: every persona Riley wrote (Maya the recruiter, Daniel the prospective client, Priya the peer, Jordan the curious visitor) benefits from this audit, not just disabled visitors. Maya scans in dim laptop light at 2pm; Jordan is on a phone in sunlight; Daniel reads long-form prose for two minutes straight; Priya tabs through with the keyboard to inspect craft. Failing contrast hurts all four — it just hurts disabled users *worst*.

---

## 1. Contrast audit (the headline output)

### 1.1 Text-on-background pairs (Dani §7.1, threshold 4.5:1 for normal text)

| # | Foreground | Background | Ratio | Normal text (4.5:1) | Large/UI (3:1) | Verdict |
|---|---|---|---|---|---|---|
| 1 | `#232420` Near Black | `#FAF9F5` Cream | **14.82:1** | PASS | PASS | PASS — primary body, headings |
| 2 | `#232420` Near Black | `#F0F0EA` Warm White | **13.65:1** | PASS | PASS | PASS — body on alt sections |
| 3 | `#232420` Near Black | `#FCF3ED` Blush | **14.27:1** | PASS | PASS | PASS — body on cards |
| 4 | `#232420` Near Black | `#FDE9D7` Peach Cream | **13.25:1** | PASS | PASS | PASS — body in numbered-step blocks |
| 5 | `#484A43` Charcoal | `#FAF9F5` Cream | **8.53:1** | PASS | PASS | PASS — secondary body |
| 6 | `#484A43` Charcoal | `#F0F0EA` Warm White | **7.86:1** | PASS | PASS | PASS — secondary body alt |
| 7 | `#484A43` Charcoal | `#FCF3ED` Blush | **8.21:1** | PASS | PASS | PASS — secondary body on cards |
| 8 | `#717267` Sage | `#FAF9F5` Cream | **4.63:1** | PASS (just) | PASS | PASS — metadata, eyebrow labels |
| 9 | `#717267` Sage | `#FCF3ED` Blush | **4.46:1** | **FAIL** | PASS | **BLOCKER — see §1.3 BLK-1** |
| 10 | `#B8B8AA` Pebble | `#FAF9F5` Cream | **1.90:1** | FAIL | FAIL | Acceptable ONLY for disabled-text (WCAG 1.4.3 exempts disabled). Must not be repurposed as live body text or as an interactive border — see §1.3 BLK-2 |
| 11 | `#B35F32` Terracotta | `#FAF9F5` Cream | **4.33:1** | **FAIL** | PASS | **BLOCKER — see §1.3 BLK-3** (used as link color per Dani §1.1 `--color-accent` mapping) |
| 12 | `#B35F32` Terracotta | `#FCF3ED` Blush | **4.17:1** | **FAIL** | PASS | **BLOCKER — see §1.3 BLK-3** |
| 13 | `#7F4323` Umber | `#FBCFAC` Sand | **5.36:1** | PASS | PASS | PASS — tag pill text |
| 14 | `#7F4323` Umber | `#FAF9F5` Cream | **7.30:1** | PASS | PASS | PASS — accent text alternative |

**Additional pair not in Dani's §7 but used in Dani §3.6 (numbered-step block):**

| # | Foreground | Background | Ratio | At 19px (normal text rule) | Verdict |
|---|---|---|---|---|---|
| 15 | `#B35F32` Terracotta | `#FDE9D7` Peach Cream (numbered-step number `01` at `--fs-display-s` = 19px) | **3.87:1** | **FAIL** | **BLOCKER — see §1.3 BLK-3.b**. 19px < 24px ⇒ "normal text" threshold applies. |

**Additional pair I noticed (not in Dani's §7) — footer secondary text:**

| # | Foreground | Background | Ratio | Verdict |
|---|---|---|---|---|
| 16 | `#717267` Sage | `#F0F0EA` Warm White (footer body uses Charcoal, but ANY use of Sage as footer caption would land here) | **4.26:1** | **FAIL for normal text**. If Sage is ever placed on Warm White as label/caption text, replace per §1.3 BLK-1. |

**Pair counts:**
- Pairs audited (Dani's §7 + my supplements): **16**
- PASS at normal-text threshold (4.5:1): **9**
- FAIL at normal-text threshold: **5** (rows 9, 10, 11, 12, 15, 16 — though row 10 Pebble is allowed *only* for disabled-state styling)
- PASS at non-text UI threshold (3:1, see §1.2): **3 of 5**

### 1.2 Non-text UI pairs (Dani §7.2, threshold 3:1)

| # | Element | Foreground | Background | Ratio | 3:1 | Verdict |
|---|---|---|---|---|---|---|
| 17 | Hairline border (decorative) | `#DCDCD6` Stone | `#FAF9F5` Cream | **1.31:1** | FAIL | **ACCEPTABLE as purely decorative divider only** (WCAG 1.4.11 exempts purely decorative elements). Must NOT be used as input border, ghost-button border, card-clickable border, or any interactive separator. See §1.3 BLK-2. |
| 18 | Input border | `#B8B8AA` Pebble | `#FAF9F5` Cream | **1.90:1** | FAIL | **BLOCKER — see §1.3 BLK-2** |
| 19 | Focus ring | `#B35F32` Terracotta | `#FAF9F5` Cream | **4.33:1** | PASS | PASS — primary focus indicator |
| 20 | Ghost button border | `#DCDCD6` Stone | `#FAF9F5` Cream | **1.31:1** | FAIL | **BLOCKER — see §1.3 BLK-2** (the ghost button IS interactive; its border IS its affordance) |
| 21 | Terracotta dot (8px CTA signature) | `#B35F32` | `#FAF9F5` Cream | **4.33:1** | PASS | PASS — meaningful icon |

**Bonus focus-ring viability check** (every page surface Shamus will place focusable elements on):

| Focus ring on… | Ratio | 3:1 |
|---|---|---|
| Cream `#FAF9F5` | 4.33:1 | PASS |
| Warm White `#F0F0EA` | 3.99:1 | PASS |
| Blush `#FCF3ED` | 4.17:1 | PASS |
| Peach Cream `#FDE9D7` | 3.87:1 | PASS |
| Sand `#FBCFAC` (tag pill bg) | 3.18:1 | PASS (thin margin) |

Terracotta focus ring at 2px width with 2px offset works on every Dani surface. Confirmed.

### 1.3 Blockers — colors that MUST change or be aliased before Shamus scaffolds

#### BLK-1 — Sage `#717267` fails as body/metadata text on Blush (and on Warm White, which Dani didn't list)

- Sage on Cream is 4.63:1 — passes 4.5:1 by a hair (0.13).
- Sage on Blush is **4.46:1 FAIL**.
- Sage on Warm White is **4.26:1 FAIL** (footer territory).
- Sage on Peach Cream is **4.14:1 FAIL** (any caption inside a numbered-step block).

The token is fragile — it sits on the wrong side of the threshold on three of four warm surfaces. **Replace token-wide with a tuned-darker sage.**

**Recommended replacement:** `--color-sage: #5C5D54;`

| Sage replacement | on Cream | on Warm White | on Blush | on Peach Cream | Verdict |
|---|---|---|---|---|---|
| `#5C5D54` (recommended) | **6.33:1** | **5.83:1** | **6.09:1** | **5.66:1** | PASS on all four — comfortable headroom |
| `#6B6C61` (lighter — minimal change) | 5.06:1 | 4.66:1 | 4.87:1 | 4.52:1 | PASS but thin on Peach Cream |

Dani's §7.3.2 already proposed `#5C5D54` as the fallback. I confirm it's the right call — it preserves the soft editorial feel, stays within the warm-neutral family, and passes on every page surface with at least 1 full ratio point of headroom (resilient to monitor calibration, eye fatigue, low-light).

#### BLK-2 — Stone `#DCDCD6` (1.31:1) cannot serve as the ghost-button or input border

Dani specs Stone as a `--border-hairline` used *both* for purely decorative dividers (fine — exempt) AND for the ghost button (`PROJECT_DESIGN.md` §3.2) and likely future form input borders. The ghost-button border IS the button's only visible affordance — it's an interactive UI component subject to WCAG 1.4.11.

I tried Dani's proposed `#C4C4BD` (§7.3.3): **1.66:1** — still fails. Pebble `#B8B8AA` as input border: **1.90:1** — still fails. The Stone family stops failing only around **`#888879`** (3.41:1).

**Recommended split** — keep the decorative hairline intact, introduce a new interactive border token:

```css
/* Decorative hairlines — UNCHANGED, exempt from 1.4.11 */
--color-border: #DCDCD6;          /* purely decorative dividers, section separators */

/* Interactive borders — NEW token, REQUIRED for buttons, inputs, focus surrounds */
--color-border-interactive: #888879;  /* ghost-button border, input border (3.41:1 on cream) */
```

Then `PROJECT_DESIGN.md` §3.2 ghost button uses `--color-border-interactive`, not `--color-border`. The decorative `--border-hairline` token stays — but Dani needs to add a parallel `--border-interactive: 1px solid var(--color-border-interactive);` and Shamus must use it for any clickable surface.

**Important:** if Sky later approves the contact form, the form input border MUST use `--color-border-interactive`. Document this in `FEATURES.md`.

#### BLK-3 — Terracotta `#B35F32` fails as text/link color on every cream surface

This is the most consequential finding. Dani's `--color-accent` (Terracotta) is mapped semantically to "CTA bg, **links**, key labels" (§1.1 comment). But:

- Terracotta on Cream: **4.33:1 FAIL** (0.17 below 4.5:1)
- Terracotta on Blush: **4.17:1 FAIL**
- Terracotta on Peach Cream: **3.87:1 FAIL**

Terracotta passes 3:1 as a non-text UI element (the 8px dot, the 2px focus ring) — so it survives as a *graphical* accent. It also passes 3:1 as **large display text only** (≥24px). What fails is its use as inline body link text and as the 19px numbered-step number.

**Solution — split the token into two semantic roles:**

```css
/* GRAPHICAL accent — dot, focus ring, button bg (text-on-button colored separately).
   Stays Terracotta. Brand is preserved. */
--color-accent:       #B35F32;  /* Terracotta — graphical use only */

/* TEXT accent — links, link hover, numbered-step numbers at 19px, any prose-level orange.
   New token. Matches Dani's existing Umber (already in palette). */
--color-accent-text:  #7F4323;  /* Umber — 7.30:1 on cream, 7.03:1 on blush, 6.53:1 on peach cream */
```

The Umber color is **already in Dani's palette** (`--color-umber`, §1.1) — I'm not introducing a new hue, just elevating Umber to be the canonical text-accent and binding Terracotta to graphical-only use. The brand reads identically because:
- The CTA button bg can still be Terracotta (a button's text contrast is governed by text-on-button-bg, not by button-bg-on-page).
- The 8px brand dot stays Terracotta.
- The link underline can stay Terracotta (3:1 for graphics).
- Only the *link text characters* shift to Umber.

For a visitor with normal vision, the visual difference between Terracotta and Umber on cream is small and reads as "deeper orange." For a low-vision visitor it's the difference between legible and invisible.

**a) Numbered-step number `01` at 19px** (Dani §3.6) — this MUST use `--color-accent-text` (Umber), not Terracotta. 3.87:1 fails the normal-text threshold and 19px is below the 24px large-text bar.

**b) Cormorant Garamond Light 300 considerations** — Dani's `--fw-display-light: 300` for display headings means stroke weight is *thinner* than regular weight. WCAG doesn't define a "light text" threshold, but a thin 300-weight stroke effectively reads as smaller than its rendered px. For display headings rendered at ≥36px (`--fs-display-m`, `--fs-display-l`), light-300 is fine even in Terracotta-as-large-text (≥24px, 3:1 threshold met). For `--fs-display-s` at 19px (already below 24px), use only `--color-text` (Near Black) or `--color-accent-text` (Umber) — never Terracotta.

#### BLK-3 summary — required token changes

| Action | Before | After |
|---|---|---|
| Sage replacement | `--color-sage: #717267` | `--color-sage: #5C5D54` |
| Add interactive-border token | (none — Stone used for both) | `--color-border-interactive: #888879` |
| Add accent-text token | `--color-accent: #B35F32` does both graphical + text | `--color-accent: #B35F32` (graphical only); `--color-accent-text: #7F4323` (link/text Umber) |
| Update semantic comment in §1.1 | "PRIMARY accent — CTA bg, **links**, key labels" | "PRIMARY accent — CTA bg, graphical signature only (dot, focus ring). Link text uses `--color-accent-text`." |

---

## 2. Sidebar (persistent left, F-02) accessibility patterns

Binding on Shamus when implementing `PROJECT_DESIGN.md` §3.4.

### 2.1 Landmark

Use `<nav aria-label="Site navigation">`, not `<aside>`. Reasoning: the sidebar's primary purpose is navigation (wordmark link to home, featured item link, CTA). `<aside>` is for tangentially-related content; `<nav>` is the correct landmark and produces a screen-reader navigation rotor entry. The `aria-label` distinguishes it from other `<nav>` regions (the hamburger menu becomes its own `<nav aria-label="Primary menu">`).

```html
<nav aria-label="Site navigation" class="sidebar">
  <a href="/" class="wordmark" aria-label="Sky Halisky — home">SKY HALISKY</a>
  <!-- featured item, CTA, etc. -->
</nav>
```

### 2.2 Skip link

First child of `<body>`. Visually hidden until keyboard focus lands on it, then becomes visible and links to the main content region. Required to let keyboard users bypass the sidebar.

```html
<body>
  <a href="#main" class="skip-link">Skip to main content</a>
  <nav aria-label="Site navigation">…</nav>
  <main id="main" tabindex="-1">…</main>
</body>
```

```css
.skip-link {
  position: absolute;
  left: -9999px;
  top: 0;
}
.skip-link:focus {
  position: fixed;
  left: var(--space-4);
  top: var(--space-4);
  z-index: 9999;
  padding: var(--space-3) var(--space-4);
  background: var(--color-cream);
  color: var(--color-text);
  border: 2px solid var(--color-accent);  /* 4.33:1 — passes */
  border-radius: var(--radius-md);
  font: var(--fw-mono-reg) var(--fs-label) var(--font-mono);
  text-decoration: none;
}
```

The `main` region needs `tabindex="-1"` so the skip-link's `href="#main"` actually moves focus there (without it, Safari and Firefox set scroll but not focus).

### 2.3 Wordmark accessible name

The sidebar wordmark "SKY HALISKY" must be an `<a href="/">`. Its accessible name should be the visible text (avoid `aria-label` that diverges from visible text — WCAG 2.5.3 Label in Name). Acceptable:

```html
<a href="/" class="wordmark">SKY HALISKY</a>
```

If the design wants the wordmark visually only without the word "home," that's fine — but voice-control users say what they see, so the accessible name MUST start with "Sky Halisky."

### 2.4 Focus management when sidebar collapses to hamburger (<960px)

When the viewport shrinks below 960px, the sidebar contents move into the hamburger overlay (Dani §3.4 "mobile"). Focus management:

1. If the sidebar held focus when it collapsed (rare — usually triggered by resize, not user action), move focus to the hamburger button.
2. If focus was inside `<main>`, leave it where it is.
3. Never let focus get trapped inside an invisible (collapsed) sidebar.

This is automatic if the sidebar is rendered conditionally via `display: none` at the breakpoint AND a `useEffect` (or framework equivalent) checks `document.activeElement` after the layout change.

### 2.5 No `aria-current` overload

If the sidebar's "Featured item" link is the same destination as the page the user is currently on, mark it `aria-current="page"`. Don't use `aria-current="true"` (the screen-reader announcement is louder and less informative). Do not put `aria-current` on the wordmark — the wordmark always points home; that's its job.

---

## 3. Hamburger nav (F-03) accessibility patterns

Binding on Shamus when implementing `PROJECT_DESIGN.md` §3.5.

### 3.1 Button markup

```html
<button
  type="button"
  aria-expanded="false"
  aria-controls="primary-menu"
  aria-label="Open menu"
  class="hamburger">
  <span class="hamburger-glyph" aria-hidden="true">
    <span></span><span></span><span></span>
  </span>
</button>
```

When the menu opens:
- `aria-expanded="true"`
- `aria-label="Close menu"`
- Glyph swaps to X (purely visual — keep `aria-hidden="true"` on the glyph)

The button itself is the announcement; the glyph never needs a name.

### 3.2 Overlay markup and focus trap

```html
<div id="primary-menu" role="dialog" aria-modal="true" aria-label="Primary menu" hidden>
  <nav aria-label="Primary menu">
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/work">Work</a></li>
      <li><a href="/about">About</a></li>
      <li><a href="/contact">Contact</a></li>
    </ul>
  </nav>
</div>
```

Behavior:

1. **Open:** `hidden` attribute removed; `aria-expanded="true"` on the trigger; the first menu link receives focus; the rest of the page is set `aria-hidden="true"` (or `inert` if browser support allows) so screen-reader virtual cursor can't reach behind the overlay.
2. **Focus trap:** Tab / Shift+Tab cycle within the overlay. The last link wraps to the first; Shift+Tab from the first wraps to the last.
3. **Escape:** closes the overlay, restores focus to the hamburger trigger, removes `aria-hidden` from the rest of the page.
4. **Click outside / on close-X:** same close behavior as Escape.
5. **Page navigation:** when the user clicks a link inside the overlay, the overlay closes and the new page's `<main>` receives focus on load.

### 3.3 No `tabindex` hacks

Use the natural document order. The menu links inherit `tabindex="0"` from `<a>` — never override with explicit `tabindex` values. The dialog itself does NOT need `tabindex` (focus moves to a child link on open).

### 3.4 Reduced motion

The overlay fade-in must check `prefers-reduced-motion`. With reduced motion, **no fade, no clip-path animation — just appear**. Dani's §5.2 global rule technically handles this, but the overlay's `clip-path` (Dani §5.3) is a transformation that *must* render its end state immediately. Confirm in CSS:

```css
.overlay { transition: opacity var(--dur-base) var(--ease-soft), clip-path var(--dur-base) var(--ease-soft); }

@media (prefers-reduced-motion: reduce) {
  .overlay { transition: none; clip-path: none; }
}
```

### 3.5 Touch target

Dani's spec is 40×40px (§3.5). **WCAG 2.5.5 (AAA) and 2.5.8 (AA) require minimum 24×24px for target size, with 2.5.8 strongly recommending 44×44px**. iOS HIG says 44pt, Android Material says 48dp. 40×40px PASSES WCAG 2.5.8 minimum but is below platform recommendations. Two acceptable resolutions:

1. **Keep 40×40 visual; expand the hit area to 44×44** via padding (visual glyph stays 22px wide, hit area expands invisibly). Recommended — preserves Dani's restraint.
2. **Bump visual to 44×44.** Slightly less elegant; would expand the X glyph too.

I recommend option 1. Confirm with Dani before Shamus implements.

### 3.6 Active-route indicator

Dani specs "a single `--color-terracotta` dot beside the active route." Required additions:

- The active link gets `aria-current="page"`.
- The dot is `aria-hidden="true"` (it's redundant with the `aria-current` announcement).
- The dot itself meets 3:1 vs. its background (4.33:1 on cream — PASS).

---

## 4. Content layer accessibility rules (binding on Dana + Shamus)

These rules apply to every page Shamus scaffolds and every record Dana proposes in `DATA_SHAPE.md`.

### 4.1 Alt text

Every image — deliverable hero, gallery, certificate badge, profile photo, editorial card image — must have meaningful alt text:

- **Deliverable hero:** describe what the image shows AND the deliverable name. E.g., `alt="Screenshot of the Pac-Man Code Trainer flashcard interface showing a JavaScript loop question."`
- **Profile photo:** `alt="Sky Halisky, smiling, standing in front of a cream wall."` (description, not "Photo of Sky").
- **Certificate badge:** `alt="Anthropic Claude Engineer certification badge, issued 2026-04."`
- **Decorative-only images** (background textures, hairline ornaments, the terracotta dot SVG): `alt=""` *explicitly* — NOT missing, NOT a space, NOT "decorative image."

Dana's `DATA_SHAPE.md` MUST include an `alt` field on every image-bearing record. If Sky doesn't provide alt text for a placeholder image, the placeholder alt should be `alt="Placeholder — Sky to provide image and description"` (so the missing-content state is itself accessible and obviously fixable).

### 4.2 Heading hierarchy

- One `<h1>` per page, period.
- `<h1>` is the page topic (e.g., "Work" on the deliverables index; the deliverable name on a detail page; "About" on About).
- The sidebar wordmark is NOT an h1 (it's site identity).
- No skipped levels: don't go h1 → h3.
- Visual styling and semantic level are independent — Dani's `--fs-display-l` can be applied to an `<h2>` if the layout calls for it. Don't bump headings up for visual size; use CSS.

### 4.3 List semantics

Any list of deliverables, certificates, tags, footer links, or sidebar items uses real `<ul>`/`<ol>` + `<li>` markup, not divs styled as lists. Screen readers announce "List, 5 items" — visitors using assistive tech rely on it.

### 4.4 Link text — meaningful out of context

Bad: "Click here." "Read more." "GitHub."
Good: "Read the case study: Pac-Man Code Trainer." "View the source on GitHub for Pac-Man Code Trainer."

Screen-reader users often pull all links on a page into a flat list (rotor). "Read more" 12 times in a row is useless.

For card-as-link patterns (entire card is clickable), set `aria-label` on the wrapper `<a>` that summarizes the destination: `aria-label="Read the case study: Pac-Man Code Trainer"`. The inner heading + meta become visible but the accessible name comes from the wrapper label.

### 4.5 External links

Every external link (GitHub, LinkedIn, live demo, talk recording, social) gets:

- `rel="noopener noreferrer"` — security (prevents `window.opener` access; Steve will hammer this next cycle).
- `target="_blank"` for outbound links per persona Priya's expectations (Riley PERSONAS §3).
- An icon AND an accessible "opens in new tab" cue — either visible text "(opens in new tab)" or an icon with `aria-label="(opens in new tab)"`. Sighted users get the icon; screen-reader users get the announcement. Maya the recruiter does not want to lose her tab; tell her in advance.

```html
<a href="https://github.com/Skypie99/pacman-code-trainer"
   target="_blank"
   rel="noopener noreferrer">
  View source on GitHub
  <span class="external-icon" aria-hidden="true">↗</span>
  <span class="visually-hidden">(opens in new tab)</span>
</a>
```

---

## 5. Motion / reduced-motion

Dani's `PROJECT_DESIGN.md` §5.2 already includes the global reduced-motion CSS reset, which is correct. Additional binding rules:

### 5.1 Reset coverage is comprehensive but verify per-component

The `*, *::before, *::after` reset in §5.2 covers `animation-duration`, `animation-iteration-count`, `transition-duration`, and `scroll-behavior`. It does NOT cover JS-driven animation (Framer Motion, GSAP, etc.). Any JS animation library Shamus pulls in must read `window.matchMedia('(prefers-reduced-motion: reduce)').matches` and skip animation when true. For Framer Motion specifically: use `useReducedMotion()` and pass `false` to animation props.

### 5.2 Scroll-triggered reveals

Dani §5.3 specifies `fade + translateY` reveals at `--dur-reveal` (900ms). With reduced motion: render the end state immediately (no fade, no translation), but DO keep the element visible. Never hide content behind a reveal that doesn't fire — the IntersectionObserver pattern Shamus will use must check `prefers-reduced-motion` and resolve all reveals on mount when true.

### 5.3 No autoplay video / no parallax

I'm not aware Dani has specced either, but in case Sky asks for a hero video or parallax background later: WCAG 2.2.2 forbids autoplay > 5 seconds without controls, and parallax is a known vestibular trigger. Default policy: any video is user-initiated; no parallax. If Sky asks for one, escalate.

### 5.4 Hover transitions

Dani §5.3 standard interactions table lists hover transitions on link / button / card. All wrap in the global reset already — PASS. Confirm no `animation` (vs. `transition`) is used for hover (animations don't get the global reset's `transition-duration` override).

---

## 6. Keyboard & focus

### 6.1 Visible focus ring on every interactive element

Required per WCAG 2.4.7 and 2.4.13. Recommended style:

```css
*:focus-visible {
  outline: 2px solid var(--color-accent);  /* Terracotta — 4.33:1 PASS on cream */
  outline-offset: 2px;
  border-radius: 2px;  /* slightly soften the ring on rectangular elements */
}
```

Why `:focus-visible` not `:focus` — we don't want the ring to flash on mouse click (which would conflict with Dani's "we don't bounce" §3.1). `:focus-visible` activates only for keyboard / programmatic focus. The button hover already has its own focus-visible spec in Dani §3.1 — that one (3px offset) takes precedence for buttons; this is the fallback for everything else.

### 6.2 Card-as-link focus

Dani §3.3 cards are link-wrapped. Focus styles from §6.1 automatically apply when a keyboard user tabs through. The card hover (image scale, border deepen) MUST also fire on focus:

```css
.card:hover .card-image,
.card:focus-visible .card-image {
  transform: scale(1.02);
}
.card:hover,
.card:focus-visible {
  border-color: var(--color-pebble);
}
```

Without the `:focus-visible` mirror, keyboard users get the visual identity of a focused-but-not-hovered card, which is half the story.

### 6.3 No keyboard traps

Outside the hamburger overlay (which intentionally traps), nothing on the page may trap focus. Test by tabbing through the entire page; focus should always be able to reach the URL bar via the next document position. Common culprits to watch: third-party widgets, embedded iframes, modals.

### 6.4 Tab order matches visual order

Dani's two-column layout (sidebar left, main right) at ≥960px must tab sidebar → main, in that order. The DOM order should match: `<nav>` first, `<main>` second. Do not use CSS `order` or absolute positioning to flip them, because tab order follows the DOM. The skip link (§2.2) bypasses sidebar for users who want to skip it.

### 6.5 Keyboard shortcuts (none yet)

Dani's spec doesn't propose keyboard shortcuts. If Sky later adds them (e.g., `?` to open a help overlay): they MUST be remappable / disable-able per WCAG 2.1.4, and they MUST NOT conflict with screen-reader shortcuts (avoid single-letter shortcuts unless paired with a modifier).

---

## 7. Typography concerns

### 7.1 Body type minimum size — confirmed PASS

Dani's body is DM Sans 300 at `--fs-body: 16px` (1rem). 16px is the WCAG 1.4.4 minimum for resizable body text. With the +0.25px letter-spacing, the rendered character density is slightly looser, which actually *helps* legibility (per typographic research on minimum letter-spacing for sans-serifs). **PASS, no change needed.**

The 19px Cormorant heading (`--fs-display-s`) is fine for headings — readers process headings as gestalt shapes more than letterforms.

### 7.2 Cormorant Garamond Light 300 at small sizes — FLAG

Cormorant Garamond is a high-contrast serif (thick verticals, hairline thins). At Light 300, the hairlines render as 1-1.5px on standard density displays. **At display sizes (`--fs-display-m` 36px, `--fs-display-l` 52px) this is gorgeous and legible.** At `--fs-display-s` 19px (cards titles, sidebar wordmark, ffern's signature heading), the Light 300 hairlines start to dissolve on low-density screens, low-contrast monitors, or when the visitor has reduced visual acuity.

**Recommendation:** at `--fs-display-s` and below, use Cormorant Garamond **Regular 400** instead of Light 300. Dani's §1.1 already includes weight 400 in the font load (`--fw-display-reg: 400`), and §2.2 already specifies "Card titles, ffern signature heading" should use weight 400. So this is consistent with Dani's existing rule — just ensure Shamus actually implements §2.2 correctly and doesn't accidentally apply `--fw-display-light` at 19px.

**Confirm in code:** the CSS class for `.card-title` and `.wordmark` MUST set `font-weight: 400`, not 300.

### 7.3 Line-height

Body line-height `--lh-body: 1.65` exceeds WCAG 1.4.12 (1.5× minimum for body) — PASS. Heading line-height 1.15 is fine for display headings (large text doesn't need the 1.5× cushion).

### 7.4 Resize to 200%

WCAG 1.4.4 requires text to remain readable when zoomed to 200%. With Dani's relative units (`rem`-based), this works as long as Shamus doesn't override the root `font-size` in pixels OR use `px` for any text size. Confirm in code review next cycle that no text uses absolute px units (the spec is fine — implementation must follow).

### 7.5 Reflow at 320 CSS pixels

WCAG 1.4.10. The sidebar is 280px wide — on a 320px viewport that leaves 40px for content, which is unusable. Dani's spec already collapses sidebar to hamburger at <960px (well above 320px). PASS. Confirm no horizontal scroll appears at 320px width.

---

## 8. Blocking findings for Dani (consolidated)

These tokens MUST change in `PROJECT_DESIGN.md` §1.1 before Shamus scaffolds. Each has the failing pair, the WCAG criterion, the recommended fix, and the resulting passing ratio.

| ID | Token / pair | Failing ratio | WCAG criterion | Required fix | Resulting ratio |
|---|---|---|---|---|---|
| **BLK-1** | `#717267` Sage as body/metadata text on Blush, Warm White, Peach Cream | 4.46 / 4.26 / 4.14 | 1.4.3 contrast (minimum) | Replace `--color-sage` with `#5C5D54` | 6.33 / 5.83 / 5.66 |
| **BLK-2a** | `#DCDCD6` Stone as ghost-button border (interactive UI) | 1.31 | 1.4.11 non-text contrast | Add `--color-border-interactive: #888879`; use for ghost button and any future input/clickable border | 3.41 |
| **BLK-2b** | `#B8B8AA` Pebble as input border | 1.90 | 1.4.11 non-text contrast | Use `--color-border-interactive: #888879` for any input border | 3.41 |
| **BLK-3a** | `#B35F32` Terracotta as inline link text on cream/blush/peach cream | 4.33 / 4.17 / 3.87 | 1.4.3 contrast (minimum) | Add `--color-accent-text: #7F4323` (Umber — already in palette); change `--color-accent` semantic comment to "graphical use only"; use `--color-accent-text` for all link text | 7.30 / 7.03 / 6.53 |
| **BLK-3b** | `#B35F32` Terracotta as numbered-step number `01` at 19px on Peach Cream | 3.87 | 1.4.3 contrast (minimum) — 19px < 24px ⇒ normal text rule | Use `--color-accent-text` (Umber) for the number | 6.53 |

Dani: please update `PROJECT_DESIGN.md` §1.1, §3.2, §3.6, and §1.5 to reflect these tokens. Then this audit can be reverified and Shamus unblocked.

I am not asking Dani to change the visual character — Terracotta stays the brand color for graphics, the brand dot, the focus ring, the CTA button background. What changes is *how the token is used*. The brand reads identically; the failure modes are eliminated.

---

## 9. Decisions for Sky

Things I cannot resolve at the role level. Morgan will surface these in the cycle briefing.

### 9.1 SKY-1 — Brand-color split: are you OK with Terracotta as graphics-only and Umber as link text?

**The trade-off.** Terracotta `#B35F32` is your brand accent color (Dani's `--color-accent`). It fails WCAG 4.5:1 for inline link text on every cream surface (4.33 / 4.17 / 3.87). The accessibility-compliant alternatives:

| Option | Brand impact | Accessibility |
|---|---|---|
| A. Keep Terracotta as link text. | Brand preserved literally. | **FAILS WCAG 2.2 AA — Constitution Art. 7 violation. Not on the table.** |
| B. (Recommended) Use Terracotta for graphics (dot, focus ring, button bg) AND use Umber `#7F4323` (already in your palette) for link text. | Brand reads identically; low-vision users get legible links. | PASS |
| C. Darken the master Terracotta token to `#9F4F23` (passes 4.5:1 on all surfaces). | Subtle hue shift — slightly more brown, less orange. | PASS |
| D. Keep Terracotta master; add `--color-link: #9F4F23` for link text only. | Brand preserved; links are slightly darker orange than the dot. | PASS |

My recommendation is **B**. Umber is already in your palette, and the visual difference reads as "deeper orange" rather than "different color." Dani gets to keep every existing component spec; only the link-color binding changes.

If you prefer **C** or **D**, both are accessibility-compliant. Pure preservation (option A) is not available.

### 9.2 SKY-2 — Hairline borders: dual token (decorative + interactive) acceptable?

Dani's `--color-border: #DCDCD6` Stone is gorgeous as a decorative section divider but fails 3:1 as an interactive border. My fix is to **keep** the decorative Stone token AND **add** a parallel `--color-border-interactive: #888879` for ghost buttons, input borders, and any interactive separator.

This means there are now **two** hairline colors in the palette. Visually, on cream, they read as "very faint" (Stone) vs. "faint" (interactive). The eye barely registers the distinction.

**Sky, please confirm:** OK to ship two hairline tokens, or do you prefer to standardize on the darker `#888879` for ALL borders (decorative included)? Standardizing makes the palette simpler but slightly muddies the editorial minimalism Dani built around the lighter Stone.

My vote: **two tokens**. The decorative-vs-interactive split is honest about what each border *does*.

---

## 10. Out of scope (deferred)

- **Dark mode** — Dani §8 says out of scope for v1. No audit performed. If Sky adds dark mode later, the entire palette inverts and the audit re-runs from scratch.
- **Form fields** — Dani §8 defers form components until Quinn confirms contact form. If contact form is approved, the form input border MUST use `--color-border-interactive` (§1.3 BLK-2). I'll re-audit form components when they're specced.
- **Lucide icons** — Dani §8 proposes Lucide. Line-style icons need 3:1 contrast (WCAG 1.4.11). Lucide stroke at currentColor inheriting from text colors will inherit the text PASS/FAIL of whatever color sets it. Confirm decorative-only icons get `aria-hidden="true"`; meaningful icons get `aria-label`.
- **Brand Extensions (Petal Pink, Moss, Earth, Wildflower)** — Dani §1.5 holds these. If Sky later approves them, each new token needs contrast audit against every page surface. I cannot pre-audit because I don't know which surfaces will host them.
- **Animation library** — Dani §8 defers. Whichever library Shamus picks must support `prefers-reduced-motion`.
- **Real content & images** — Dani §6 (photography), Dana (data shape). Once Sky's actual deliverable / certificate images load, every image needs an alt-text review (§4.1). Placeholder review happens before content review.

---

## 11. Sign-off

I (Alex) cannot mark this PASS until Dani updates `PROJECT_DESIGN.md` §1.1 with BLK-1, BLK-2, and BLK-3 fixes and Sky resolves SKY-1 and SKY-2.

Once those happen:
- Re-run the contrast audit (the math is in §0, the test cases are §1.1 + §1.2 + replacements).
- Confirm Dani's §3.2, §3.6 updated to use `--color-accent-text` not `--color-accent` for text.
- Mark this doc PASS and remove the blocker section.

Until then: **this audit blocks Shamus from scaffolding the token CSS verbatim from Dani's spec.** Shamus may scaffold the layout shell, semantic markup, and JS — but the token block in `app/globals.css` waits.

---

**Authority chain:** Constitution v1.3 Art. 7 (accessibility non-negotiable) > role file (`commands/alex.md`) > skill (`accessibility-ux`). No external sends. Docs only. No code modified. No live surface touched.
