# Shamus Implementation Note — Phase 2 UI Design Compiler Fixes
**Date:** 2026-05-29
**Branch:** feat/shamus-phase2-ui-2026-05-29
**Responding to:** qa-reports/2026-05-29_DesignCompile_phase2-ui.md (Dani BLOCK)
**Commit:** c2bb546

---

## Fixes Applied

### Fix A — Duration token names (V1 + V2) — DONE
Replaced all `duration-280` with `duration-base` and `duration-520` with `duration-slow` across:
- `components/FilterPill.tsx` — 2 occurrences (`duration-280` × 2)
- `components/CaseStudyCard.tsx` — 4 occurrences (`duration-280` × 2, `duration-520` × 2 in image wrapper + img + overlay div)
- `components/CredentialBadge.tsx` — 1 occurrence (`duration-280` × 1)

Total: 7 token name corrections. All now reference registered Tailwind `transitionDuration` token names.

### Fix B — Overlay hover implementation (V3 — broken class) — DONE
- Removed `group-hover:opacity-change` from overlay `<div>` in `CaseStudyCard.tsx`
- Added `case-study-overlay` class to the overlay `<div>` so the CSS selector can target it
- Added to `app/tokens-phase2.css`:
  ```css
  .case-study-card:hover .case-study-overlay,
  .case-study-card:focus-visible .case-study-overlay {
    background-color: var(--case-study-overlay-hover);
  }
  ```
  This implements the intended 15% → 25% tint deepen on hover via a real CSS rule.

### Fix C — Raw rgba() fallback removal (V4) — DONE
Combined with Fix B edit. `CaseStudyCard.tsx` overlay inline style changed from:
```
style={{ backgroundColor: `var(--case-study-overlay, rgba(179, 95, 50, 0.15))` }}
```
to:
```
style={{ backgroundColor: 'var(--case-study-overlay)' }}
```
Token `--case-study-overlay` is always defined in tokens-phase2.css; fallback was unnecessary and introduced an untracked color literal.

### Fix D — Badge border token (V-badge + functional bug) — DONE
In `app/tokens-phase2.css`:
- Renamed `--badge-border: 1px solid var(--color-accent-deep)` to `--badge-border-color: var(--color-accent-deep)` — stores color only.

In `components/CredentialBadge.tsx`:
- Updated `border-[var(--badge-border)]` to `border-[var(--badge-border-color)]`

The `border` Tailwind utility already applies `border-width: 1px; border-style: solid`. The variable now correctly stores only the color value, so `border-[var(--badge-border-color)]` is a valid `border-color` arbitrary value. Umber border color will now render correctly.

### Fix E — Image height raw dimension exception (V5) — DONE
Selected Dani's Option 2 (acceptable interim): added the Dani-approved exception comment above `--case-study-image-height: 240px` in `tokens-phase2.css` per Const. 6.2. The 240px value is a legitimate image-specific dimension outside the typographic spacing scale.

---

## Verification

**`npm run typecheck`:** PASS — clean, no errors.

**`npm test`:** PASS — 108 tests passed, 1 todo (badge asset guard pending real PNGs — pre-existing, not related to this fix). No failures.

---

## Branch Status

Branch `feat/shamus-phase2-ui-2026-05-29` is **NOT yet merged**. Commit `c2bb546` is on the feature branch only.

**Ready for Dani re-compile.** All 5 Layer 1 violations from the BLOCK decision are resolved. Layers 2–6 were already passing. Expected re-compile result: COMMIT or POLISH.

**Not pushed to origin** — branch does not track a remote. Committed locally only per instructions.
