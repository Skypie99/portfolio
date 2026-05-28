# Alex + Quinn — Wave 5 Final Pass
**Date:** 2026-05-25
**Branch:** `fix/auto-2026-05-25-wave5-final` (based on `fix/auto-2026-05-25-portfolio-wave2`)
**Commit:** `efe3e4c`

---

## Quinn — Tagline Fix

**File:** `content/profile.json`

| | Value |
|---|---|
| **Before** | `"Building thoughtful AI work, one careful deliverable at a time."` |
| **After** | `"I build privacy-first apps with Claude Code — learning in public."` |

**Rationale:** The old tagline was reflective but vague — it didn't say who Sky is. The new tagline names three honest, specific things: privacy-first focus, the Claude Code toolchain, and the "learning in public" posture (beginner, shipping real work). First-person voice matches the About section. Length is similar. The hero subhead ("Built slowly. Documented honestly.") already covers the careful/deliberate angle, so the H1 can afford to be more direct.

The tagline flows into two additional surfaces:
- **Footer "About" column:** now reads "Sky Halisky is an AI builder based in Canada. I build privacy-first apps with Claude Code — learning in public." — slightly asymmetric voice (third-person intro, first-person tagline) but acceptable for a portfolio; no code change needed.
- **About page `<meta description>`:** picks up the new tagline automatically.

---

## Alex — Accessibility Re-Audit (Wave 4 surface)

### 1. `border-l-4` Terracotta Accent — PASS
No `border-l-4` class is used anywhere in Wave 4 components. The decorative accent appears as `border-t` dividers and colored `span` dots, all already carrying `aria-hidden="true"`. No action needed.

### 2. Scroll Indicator `href="#work"` — PASS
`<Button href="#work">View the work</Button>` in `app/page.tsx`. Link text "View the work" is meaningful out of context (WCAG 2.4.6). The `#work` anchor exists at `<section id="work">` on the same page. No `aria-label` needed.

### 3. Hover-Scale Animation on ProjectCard — PASS
`group-hover:scale-[1.02]` is a Tailwind CSS transition on the card image. The global `@media (prefers-reduced-motion: reduce)` block in `globals.css` (line 270) applies `transition-duration: 0.01ms !important` to all `*`, which collapses the scale transition to imperceptible. Correctly degraded. `HamburgerNav` additionally uses Framer Motion's `useReducedMotion()` hook for its animations.

### 4. SVG Images — PASS
No SVG `<title>` elements were found in any component. All images use `<img alt={d.heroImage.alt}>` with the deliverable's alt text. The decorative placeholder overlay in `ProjectCard` is `aria-hidden="true"`.

### 5. Footer Email Link — FIXED
**Issue:** `<a href="mailto:...">` rendered the email address as visible text but had no `aria-label`. Screen readers announce raw email addresses without indicating the mailto action context.

**Fix applied to `components/Footer.tsx`:**
```tsx
// Before
<a href={`mailto:${profile.contactEmail}`} className="...">
  {profile.contactEmail}
</a>

// After
<a
  href={`mailto:${profile.contactEmail}`}
  aria-label={`Send email to ${profile.contactEmail}`}
  className="..."
>
  {profile.contactEmail}
</a>
```

WCAG 2.4.6 (Level AA) — Link purpose is now explicit.

### 6. Social Links in Footer — PASS
Each social link includes `<span className="sr-only">(opens in new tab)</span>` alongside `target="_blank" rel="noopener noreferrer"`. WCAG 2.4.4 and 3.2.2 satisfied.

### 7. HamburgerNav Decorative Wordmark — FIXED
**Issue:** Inside the `role="dialog"` overlay, a `<p>Sky Halisky</p>` at line 161 was not `aria-hidden`. When a screen reader user opens the nav dialog, the dialog is announced as "Primary menu" (via `aria-label`), then the wordmark text would be read as a stray paragraph before the nav items. This adds noise without navigational value — the dialog's purpose is already named.

**Fix applied to `components/HamburgerNav.tsx`:**
```tsx
// Before
<p className="font-serif font-normal text-display-s text-near-black mb-10 select-none">
  Sky Halisky
</p>

// After
<p aria-hidden="true" className="font-serif font-normal text-display-s text-near-black mb-10 select-none">
  Sky Halisky
</p>
```

---

## Typecheck + Tests

| Check | Result |
|---|---|
| `npm run typecheck` | PASS — zero errors |
| `npm test` | PASS — 40/40 tests across 10 test files |

---

## Summary

| Item | Role | Status |
|---|---|---|
| profile.tagline | Quinn | FIXED |
| `border-l-4` accent aria | Alex | PASS (not present) |
| Scroll CTA `href="#work"` | Alex | PASS |
| ProjectCard hover-scale reduced-motion | Alex | PASS |
| SVG `<title>` / `<img alt>` | Alex | PASS |
| Footer email `aria-label` | Alex | FIXED |
| Footer social links SR copy | Alex | PASS |
| HamburgerNav wordmark `aria-hidden` | Alex | FIXED |
| Typecheck | — | PASS |
| Tests | — | PASS (40/40) |

**Branch does NOT merge to main** — ready for Sky's review.
