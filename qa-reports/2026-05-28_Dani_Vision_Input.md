---
report: dani-phase-2-4-vision-input
date: 2026-05-28
role: dani
---

# Portfolio Phase 2-4 Design Vision — Dani Input

**Context:** Phase 1 (warm-minimal foundation + luxury token system) ships Monday. This doc outlines design priorities for the next 3 phases.

---

## 1. Design System Evolution (Phase 2 primary)

**New component classes to author:**
- **Project Card Elevation System:** Introduce 2–3 subtle hover states (soft shadow increase, peach-cream background shift, 2px Y-translate) that respect the `ease-out` motion token. Cards should feel "liftable" without breaking minimalism.
- **Interactive Filtering Components:** Category filter pills with active-state stroke (stone-strong border) + smooth content swap (fade-in 280ms). No color change—just weight + border signal.
- **Case Study Card Variant:** A new card layout for deep-dive projects (image + headline + description). Introduce a muted image backdrop (peach-cream tint over image) to keep type legible without compromising photography.
- **Badge/Credential Micro-component:** Small issuer logos + checkmark icon, sitting in top-right of cert cards. Consistent 24px container, icon in umber accent-text.

**Motion additions:**
- Extend `--dur-reveal` (900ms) to scroll-triggered section reveals (fade-in + 12px Y-translate for headlines).
- Add `--ease-entry` (softer ease for entrance) if distinct from exit motion; validate with Alex for reduced-motion.

---

## 2. Theme & Brand Direction (Phase 3–4)

**Color System Expansion (non-breaking):**
- **Project Category Tints:** Introduce 4–5 category-specific *decorative* accent tints (not new colors—descendants of existing terracotta scale):
  - AccessMap: Amber (natural/location feel)
  - Claude Corp / Dashboards: Terracotta base (professional)
  - Prompt Library: Sand (lighter, knowledge-focused)
  - Games: Umber (playful depth)
  - Certificates: Terracotta (credentialing authority)
- These live in component backgrounds only (20% opacity), never in primary text or interactive states. Keeps the "one accent" rule intact.
- **Long-form Content Mode:** If Will adds blog/case studies (Phase 3), author a "reading mode" variant:
  - Background shifts to warm-white for reduced eye strain.
  - Text to charcoal for better contrast.
  - Blockquotes in peach-cream with left umber border.
  - No new token—pure combination of existing palette.

**Theme Decision deferred to Phase 4:**
- Sky decides if dark mode is in scope (requires full token duplication + reduced-motion fallbacks). Not Phase 2–3; flagged as Phase 4 exploratory.

---

## 3. Homepage Restructure (Phase 2–3)

**Phase 2 (minimal change):**
- Add anchor-jump nav (small labeled dots or "scroll to section" footer) to orient users on single-scroll experience.
- Introduce "featured projects" grid (4–6 top projects) between hero + "how I work" section; keeps narrative flow but shows more work upfront.

**Phase 3 (optional interactive layer):**
- Project filter bar (category pills, instant fade-swap content) in the featured grid. Smooth 280ms content transitions.
- Optional: section carousel (if Will's vision for case studies demands it)—allow swipe/arrow nav between featured projects.

---

## 4. Certificate/Credential Display (Phase 2–3)

**Phase 2 Luxury Polish:**
- Add issuer logo (20px × 20px, top-right of cert card, umber tint as fallback if logo unavailable).
- Introduce a small verified checkmark (✓ icon, 12px, umber, sits next to issuer name in card header).
- Certificate cards transition on hover: soft shadow increase + 2px lift + background to blush (matching project card pattern for consistency).

**Phase 3 (optional):**
- Certificate timeline view (cards arranged chronologically with vertical line + dot markers, Amber accent on dots).
- Badge "unlock" reveal animation (staggered fade-in as user scrolls past each cert).

---

## 5. Interactive Moments — High-Impact Animations (Phase 2–3)

**Priority order (Phase 2 — ship these):**
1. **Hero Scroll-Reveal:** Hero headline (display-l) fades in + 12px Y-translate over first 300ms of scroll (ease-out). Grounds the page.
2. **Project Card Hover Lift:** All project cards gain soft shadow increase + 2px Y-translate + peach-cream background on :hover (280ms ease-out).
3. **Section Reveals (on scroll):** Headlines + first paragraph of each section fade-in + Y-translate 12px when entering viewport (900ms ease-out, staggered per element).
4. **Category Filter Transitions:** Content swap with fade-in/fade-out (280ms, no scale—just opacity + stroke weight on pills).

**Phase 3 (if scope allows):**
5. Badge counter animation (e.g., "42 certificates earned" — number counts from 0 to 42 over 1s on scroll-into-view).
6. Parallax light effect (subtle parallax on hero background image if added, max 20px Y offset to avoid distraction).

---

## 6. Component Debt & Polish Flags (Phase 2 audit)

**Immediate review needed (pre-Phase-2 merge):**
- ✅ **Token Drift Detector:** Scan all `.tsx` files for hardcoded hex values, `px` sizes, motion durations, or raw `box-shadow`. Current state: pending Gary's automated lint (q: does Lint v9 catch hardcoded shadows?)
- ⚠️ **Touch Targets:** All interactive elements (buttons, links, filter pills) should hit 44px minimum height. Audit current CTA + filter pill heights in Phase 1 build.
- ⚠️ **Dark Mode Support:** Phase 1 ships light-only. Ensure all color tokens support CSS `prefers-color-scheme: dark` queries as a Phase 2 prep task (no implementation yet, just structure).
- ⚠️ **Reduced Motion:** Validate all motion tokens respect `prefers-reduced-motion: reduce`. Current setup (ease-out + durations) should degrade gracefully, but confirm with Alex before Phase 2 ships.
- ✅ **Component Inventory:** Document Phase 1 components (Hero, ProjectCard, CertCard, FilterPills, etc.) in a new `docs/COMPONENT_LIBRARY.md` for Phase 2-4 reference.

---

## Checkpoint Notes

- **Tone:** All Phase 2 changes maintain the "warm, bright, restrained" aesthetic. No loud gradients, no heavy shadows, no oversize type.
- **Performance:** Scroll-triggered animations defer to Intersection Observer (Peter to validate in Phase 2 perf audit). Staggered reveals should not cause paint thrashing.
- **Accessibility:** Category tints and animations flag to Alex for Phase 2 WCAG re-check. Reduced-motion fallback required for all animations.
- **Decisions for Sky:**
  - Dark mode scope (Phase 3 or Phase 4 or never)?
  - Blog/long-form content in scope? (Affects reading-mode token set in Phase 3.)
  - Category accent tints approved for decorative backgrounds?

---

## Deliverable Summary

| Phase | Scope | Effort | Lead |
|-------|-------|--------|------|
| **Phase 2** | Project card elevation + filtering UI + cert badge polish + hero/section scroll reveals | 4–5 days design (mockups + tokens) | Dani |
| **Phase 3** | Optional cert timeline + filter carousel + long-form reading mode | 3–4 days (conditional) | Dani |
| **Phase 4** | Dark mode exploration (if approved) | 5–7 days (full token duplication + testing) | Dani + Alex |

