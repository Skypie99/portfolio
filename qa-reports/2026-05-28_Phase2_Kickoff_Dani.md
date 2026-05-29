---
phase: 2
role: dani
date: 2026-05-28
kickoff: true
due: 2026-06-01
approval: sky-2026-05-28
---

# Phase 2 Kickoff — Dani (Component Design Tokens + Mockups)

**Status:** KICKOFF — Sky approved Phase 2. You're unblocked to start now.

**Due:** ~2026-06-01 (design tokens + mockups ready for Shamus build)

**Effort estimate:** 3–4 days design work

---

## Phase 2 Design Scope

### 1. Project Card Elevation System

**Current state:** Phase 1 cards are flat, minimal.

**Phase 2 enhancement:**
- Hover state: soft shadow increase + peach-cream background shift + 2px Y-translate
- Motion: 280ms ease-out
- Constraint: maintain warm minimalism, no heavy shadows, no scale shifts
- Deliverable: mockup + updated component token specs (shadow token, peach-cream usage, Y-translate value)

**Files to update:**
- `docs/DESIGN_TOKEN_SYSTEM.md` — add/refine motion token for card hover (280ms ease-out)
- `tailwind.config.ts` — ensure peach-cream color available as bg token
- `designs/` folder — mockup showing before/after hover states

---

### 2. Interactive Filtering UI

**Current state:** Phase 1 has filter pill structure; no active state styling yet.

**Phase 2 enhancement:**
- Active-state pill: stroke (stone-strong border, 1px) + weight change (no color change)
- Content swap: fade-in/fade-out 280ms, no scale
- Constraint: no color change (preserves minimal aesthetic)
- Deliverable: mockup + pill component token specs (border width, stroke color reference)

**Files to update:**
- `designs/` — mockup of filter pills in active/inactive states
- Component spec: pill height (must hit 44px minimum touch target), border values

---

### 3. Case Study Card Variant

**New component:** A card layout for deep-dive projects (image + headline + description).

**Design requirements:**
- Hero image with muted backdrop (peach-cream tint, ~20% opacity)
- Type legible over image (charcoal text, no drop shadow needed if backdrop handles contrast)
- Card hover: same elevation lift as project cards (soft shadow + Y-translate)
- Constraint: WCAG 2.2 AA contrast on all text
- Deliverable: mockup + new component token set (image backdrop color, opacity values)

**Files to update:**
- `designs/case-study-card-variant.sketch` (or mockup format of choice)
- Token spec for image backdrop tint

---

### 4. Badge/Credential Micro-component

**Current state:** Phase 1 shows basic cert cards.

**Phase 2 polish:**
- Issuer logo: 20px × 20px, top-right of cert card, umber tint as fallback
- Verified checkmark: 12px icon, umber, sits next to issuer name in card header
- Hover: soft shadow increase + 2px lift + background shift to blush (matching project card pattern)
- Deliverable: mockup + icon specs + color tokens

**Files to update:**
- `designs/` — mockup of badge arrangement on cert cards
- Icon size + color tokens (12px checkmark, umber reference)

---

### 5. Motion Additions

**Scroll-Triggered Section Reveals:**
- Hero headline (display-l): fade-in + 12px Y-translate, 300ms ease-out on scroll-into-view
- Section headlines + first paragraph: fade-in + Y-translate 12px, 900ms ease-out (staggered per element)
- Constraint: reduce-motion fallback (no translate, instant opacity)
- Deliverable: token spec for new reveal motion (if needed), confirmation that existing dur-reveal token works

**Token review:**
- Confirm `ease-out` + `dur-reveal` (900ms) are sufficient
- If `ease-entry` needed for entrance vs. exit distinction, add it now
- All motion must respect `prefers-reduced-motion: reduce` (validate with Alex)

---

## Deliverables Checklist

- [ ] Mockup: project card hover states (shadow, peach-cream, Y-translate)
- [ ] Mockup: filter pills in active/inactive states (border, no color)
- [ ] Mockup: case study card variant (image + muted backdrop + type)
- [ ] Mockup: badge arrangement on cert cards (logo + checkmark)
- [ ] Mockup: hero scroll reveal + section reveals (fade-in timing)
- [ ] Updated `docs/DESIGN_TOKEN_SYSTEM.md` with any new/refined tokens
- [ ] Updated `tailwind.config.ts` if new token values added
- [ ] Confirmation: all motion respects prefers-reduced-motion (Alex validation pending)
- [ ] Accessibility checkpoints: WCAG 2.2 AA on all new color pairs (image backdrop + text, peach-cream + text)

---

## Blocking Next Steps

Once you complete design tokens + mockups (~2026-06-01):
- **Shamus** starts Phase 2 UI build (blocked on your tokens + Sky's case study drafts)
- **Will** can start case study template structure in parallel
- **Gary + Peter** prep testing/profiling setup

---

## Reference Docs

- **Roadmap:** `qa-reports/2026-05-28_Morgan_Phase2-4_Roadmap.md`
- **Design Vision:** `qa-reports/2026-05-28_Dani_Vision_Input.md` (your own input, expanded here)
- **Token System:** `docs/DESIGN_TOKEN_SYSTEM.md`
- **Luxury Scorecard:** `docs/LUXURY_UI_SCORECARD.md` (will be used to validate Phase 2 UI)

---

## Go!

Phase 2 is live. Design tokens are the critical path — everything downstream waits for your tokens + mockups. You've got this.

Questions? Ping Morgan or Sky.
