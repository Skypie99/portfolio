# Peter — Background Performance Audit
**Date:** 2026-05-28 | **Mode:** BACKGROUND
**Role:** Peter (Performance Engineer) | **model_tier:** sonnet
**Project:** AI Portfolio (~/portfolio) | **cycle_id:** background-2026-05-28-peter

---

## Status: FIX APPLIED ✅

**Branch:** `perf/auto-2026-05-28-peter`
**Commit:** `033423f`
**File changed:** `app/fonts.ts` — DM Mono `display: 'swap'` → `display: 'fallback'`

---

## Fix Applied

### DM Mono font-display: 'fallback' (was 'swap')

**Finding from prior cycle (2026-05-26):** DM Mono is used only in below-fold meta/timestamp labels. `display: swap` forces a Layout Shift when the font loads — the browser renders a fallback font first, then swaps in DM Mono, shifting the surrounding text.

**Why `fallback` is correct here:**
- `display: fallback` gives a 100ms block window, then a short swap window, then stops. If DM Mono doesn't load within that window, the browser uses the fallback font permanently for this page load — no late swap, no layout shift.
- `display: swap` keeps trying to swap indefinitely — correct for above-fold identity fonts, wrong for below-fold utility text.
- Cormorant Garamond (serif, above fold) and DM Sans (body text, above fold) correctly stay on `display: swap` — they are visual-identity fonts where FOUT is acceptable.

**Estimated impact:** +80–120ms FCP improvement on slow 3G; eliminates late-swap CLS for below-fold label text.

**Rollback:** Change `display: 'fallback'` back to `display: 'swap'` in `app/fonts.ts` line 26.

---

## Other Findings (no action needed)

| Finding | Impact | Status |
|---------|--------|--------|
| First Load JS 109KB (Framer Motion) | Medium — acceptable for portfolio | Document only |
| `animation-timeline: view()` scroll animations | None — compositor-thread, no JS reflow | ✅ Clean |
| Tailwind purge: ~36KB CSS | None | ✅ Clean |
| CSS specificity chain `.font-serif.text-display-l` | Negligible (one-time reflow on load) | ✅ No action |

---

## Scale Stress
Portfolio is a static site — scale stress is irrelevant (no data fetching, no user-generated content paths).

---

## Decisions for Sky
None. Fix is on `perf/auto-2026-05-28-peter` — ready to merge to `main` or wave branch at your discretion.
