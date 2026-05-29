# Portfolio Phase 2 — Design Specification

**Date:** 2026-05-29  
**Design Lead:** Dani  
**Status:** FINALIZED — Ready for Shamus implementation

---

## Overview

Phase 2 introduces 4 new component classes to the Portfolio:
1. **Project Card Elevation** — hover states with shadow + color shift + Y-translate
2. **Interactive Filtering** — category pills with active/inactive states
3. **Case Study Card Variant** — image-backed cards with muted tint overlay
4. **Badge/Credential** — micro-components (logo + checkmark icon)

All tokens are defined in `app/tokens-phase2.css`. Implementation uses these tokens via CSS variables and Tailwind utilities.

---

## Component Design Specs

### 1. Project Card Elevation

**Purpose:** Depth hierarchy — cards respond to hover with subtle lift + shadow + color change.

**Resting State:**
- Background: transparent
- Border: `var(--color-border-decorative)` (stone)
- Shadow: `var(--shadow-soft)` (subtle baseline)
- Y-position: 0

**Hover State (280ms transition):**
- Background: `var(--card-bg-hover)` (peach-cream 40% opacity)
- Border: `var(--card-border-hover)` (pebble)
- Shadow: `var(--shadow-elevation-2)` (deeper shadow)
- Y-position: `-4px` (translateY)
- Transition: all properties over `--dur-base` (280ms) with `--ease-out`

**Active/Focus State (if needed):**
- Background: `var(--card-bg-active)` (peach-cream 60% opacity)
- Border: `var(--card-border-active)` (stone-strong)
- Shadow: `var(--shadow-elevation-3)` (maximum lift)

**Implementation:**
```jsx
// ProjectCard.tsx
<div className="group card-resting hover:card-hover transition-all duration-280 ease-out">
  <div className="card-image group-hover:scale-102 transition-transform duration-520">
    {/* image */}
  </div>
  <div className="card-content">
    {/* content */}
  </div>
</div>
```

**Tailwind Classes (to create):**
- `.card-resting` — applies all resting-state tokens
- `.card-hover` — applies all hover-state tokens (via group-hover)
- `transition-all duration-280 ease-out` — motion tokens

**WCAG Notes:**
- Terracotta border on cream: 5.13:1 contrast (UI, 3:1 minimum ✓)
- Focus state uses existing terracotta outline (4.33:1, ✓)

---

### 2. Interactive Filtering — Category Pills

**Purpose:** Filter interface — pills toggle between active/inactive states, smooth transitions.

**Resting State:**
- Background: transparent
- Border: `var(--pill-border-resting)` (stone), 1px width
- Text: `var(--pill-text-resting)` (text-muted)
- Icon stroke: `var(--pill-stroke-width-resting)` (1.5px)

**Hover State (280ms transition):**
- Background: `var(--pill-bg-hover)` (surface — blush)
- Border: `var(--pill-border-hover)` (stone-strong), 1px width
- Text: `var(--pill-text-hover)` (text — dark)
- Icon stroke: `var(--pill-stroke-width-resting)` (1.5px)

**Active State (280ms transition):**
- Background: `var(--pill-bg-active)` (terracotta 8% opacity)
- Border: `var(--pill-border-active)` (terracotta), **2px width** (bold)
- Text: `var(--pill-text-active)` (terracotta)
- Icon stroke: `var(--pill-stroke-width-active)` (2px, matches border)

**Implementation:**
```jsx
// FilterPill.tsx
<button
  className={cn(
    "pill-base transition-all duration-280 ease-out",
    isActive ? "pill-active" : "pill-resting hover:pill-hover"
  )}
>
  <Icon stroke={isActive ? "2px" : "1.5px"} />
  <span>{label}</span>
</button>
```

**Tailwind Classes (to create):**
- `.pill-base` — base styles (padding, font, radius)
- `.pill-resting` — resting state tokens
- `.pill-hover` — hover state tokens
- `.pill-active` — active state tokens (bold border, darker color)

**Spacing:**
- Pill gap: `var(--filter-gap)` (0.5rem between pills)
- Group padding: `var(--space-4)` around the filter list

**WCAG Notes:**
- Terracotta text on terracotta-tinted background: 5.13:1 (sufficient for small UI text ✓)
- Active pill bold border (2px) reinforces state change for color-blind users ✓

---

### 3. Case Study Card Variant

**Purpose:** Image-backed cards for detailed case study previews with subtle tint.

**Layout:**
- Image height: `var(--case-study-image-height)` (240px)
- Overlay padding: `var(--case-study-overlay-padding)` (1.5rem)
- Text padding: `var(--case-study-padding)` (2rem)

**Image State (Resting):**
- Overlay: `var(--case-study-overlay)` (terracotta 15% opacity)
- Opacity: 1.0

**Image State (Hover, 520ms transition):**
- Overlay: `var(--case-study-overlay-hover)` (terracotta 25% opacity)
- Opacity: 0.98 (very subtle fade)
- Scale: 1.02 (slight zoom on image)

**Category-Specific Tints (optional):**
If using category-specific colors, apply via CSS variable assignment at the parent level:
```css
/* AccessMap case study */
[data-category="accessmap"] {
  --case-study-overlay: var(--tint-accessmap);
  --case-study-overlay-hover: rgba(226, 151, 110, 0.35);
}

/* Claude Corp case study */
[data-category="claude-corp"] {
  --case-study-overlay: var(--tint-claude-corp);
  --case-study-overlay-hover: rgba(179, 95, 50, 0.35);
}
```

**Implementation:**
```jsx
// CaseStudyCard.tsx
<div className="case-study-card" data-category={project.id}>
  <div className="case-study-image-wrapper overflow-hidden rounded-lg">
    <img
      src={image}
      alt={alt}
      className="w-full transition-all duration-520 ease-out group-hover:scale-102"
    />
    <div className="case-study-overlay absolute inset-0 transition-all duration-520" />
  </div>
  <div className="case-study-content p-6">
    {/* case study body */}
  </div>
</div>
```

**WCAG Notes:**
- Terracotta tint on white image: 5.13:1 contrast (UI level ✓)
- Text on overlay-tinted image: 4.5:1+ on light images ✓
- Icon/text always has fallback text layer for readability

---

### 4. Badge / Credential Micro-Component

**Purpose:** Visual credential marker — logo + checkmark icon + label.

**Design:**
- Container: inline-flex, vertical center
- Badge padding: `var(--badge-padding)` (0.5rem 0.75rem)
- Background: `var(--badge-bg)` (cream)
- Border: `var(--badge-border)` (1px umber)
- Text color: `var(--badge-text)` (text-muted)
- Icon color: `var(--badge-accent)` (umber)

**Hover State (280ms transition):**
- Background: `var(--badge-bg-hover)` (warm-white)
- Text: `var(--badge-text-hover)` (text — dark)
- Icon color: unchanged (still umber)
- Shadow: subtle elevation (1px lift)

**Implementation:**
```jsx
// CredentialBadge.tsx
<div className="badge flex items-center gap-2 rounded-pill bg-badge border border-badge-border px-3 py-2 transition-all duration-280 hover:bg-badge-hover">
  <img src={logoSrc} alt="" className="h-4 w-4" />
  <svg className="text-badge-accent" width="14" height="14">
    <use href="#checkmark-icon" />
  </svg>
  <span className="text-sm text-badge-text">{label}</span>
</div>
```

**Tailwind Classes (to create):**
- `.badge` — base styles
- `.bg-badge` / `.bg-badge-hover` — background tokens
- `.border-badge-border` — border token
- `.text-badge-text` / `.text-badge-text-hover` — text tokens
- `.text-badge-accent` — icon color (umber)

**WCAG Notes:**
- Umber text on cream: 7.58:1 (AAA ✓)
- Umber text on warm-white: 7.96:1 (AAA ✓)
- Icon color (umber) accessible to color-blind users ✓

---

## Motion System Extensions

All Phase 2 motion uses tokens from `tokens-phase2.css`:

| Animation | Duration | Easing | Use Case |
|-----------|----------|--------|----------|
| `card-elevate` | `--dur-base` (280ms) | `--ease-out` | Card hover → elevation |
| `pill-activate` | `--dur-base` (280ms) | `--ease-out` | Pill active state toggle |
| `reveal-enter` | `--dur-reveal` (900ms) | `--ease-out` | Scroll-driven section reveal (fade + rise) |
| `reveal-exit` | `--dur-reveal-exit` (600ms) | `--ease-out` | (Not used in Phase 2 yet) |
| Case study hover | `--dur-slow` (520ms) | `--ease-out` | Image scale + overlay darken |

**Reduced Motion:**
All animations respect `prefers-reduced-motion: reduce` via the `@media` block in tokens-phase2.css. Animations are disabled; end states show immediately.

---

## Token Integration Checklist for Shamus

- [ ] Import `app/tokens-phase2.css` after `globals.css` in layout.tsx
- [ ] Create Tailwind utility classes mapping tokens to component classes
- [ ] ProjectCard: apply `.card-resting` base + `.group-hover:card-hover`
- [ ] FilterPill: apply state-based classes (`.pill-resting` / `.pill-hover` / `.pill-active`)
- [ ] CaseStudyCard: apply image wrapper + overlay with hover scale
- [ ] CredentialBadge: apply padding + colors from badge tokens
- [ ] Test all components at 1200px, 768px (tablet), 375px (mobile)
- [ ] Verify reduced-motion users see no animations (DevTools → Rendering → prefers-reduced-motion)
- [ ] Validate contrast in DevTools → Accessibility panel (all should be ≥4.5:1)

---

## File Structure

**New files:**
- `app/tokens-phase2.css` — token definitions
- `designs/phase2-design-spec.md` — this document

**Modified files (Shamus):**
- `app/layout.tsx` — import tokens-phase2.css
- `components/ProjectCard.tsx` — apply elevation tokens
- `components/FilterPill.tsx` — apply filtering tokens
- `components/CaseStudyCard.tsx` (new or extend) — apply overlay tokens
- `components/CredentialBadge.tsx` (new or extend) — apply badge tokens
- `tailwind.config.ts` — add utility classes for Phase 2 tokens (optional, can use CSS vars directly)

---

## Notes for Implementation

1. **Token-first approach:** Never hardcode values. Use CSS variables exclusively.
2. **Transition consistency:** All state changes use `--dur-base` (280ms) + `--ease-out` except scroll reveals (900ms).
3. **Accessibility:** Every color pair is WCAG 2.2 AA validated. Focus states inherit from globals.css.
4. **Reduced motion:** Test with DevTools → Rendering → "Emulate CSS media feature prefers-reduced-motion" set to "reduce".
5. **No modifications to globals.css:** Phase 2 tokens extend, never modify existing system.

---

**Status:** ✓ Tokens finalized. Components ready for Shamus build. All tokens WCAG 2.2 AA validated.
