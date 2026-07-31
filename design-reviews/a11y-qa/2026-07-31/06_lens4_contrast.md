# LENS 4 — CONTRAST + COLOR, MEASURED (banked 2026-07-31)

Method — two instruments, zero eyeballing (scratchpad `contrast.json` + `glass-contrast.json`):
1. **Computed census**: every visible text node on 9 routes × 2 themes; effective background composited up the ancestor chain (rgba stacking to opaque anchor). Elements over glass/gradients/backdrop-filter/WorldBackdrop deferred to (2).
2. **Pixel-sampling at measured coordinates** (the receipts' own method): scroll-settled element screenshots, 3px outer-ring background estimate vs computed text color; ember gradient text judged per-stop, worst stop reported. Engine: chromium-1228.

Spec-precision exemptions honored: decorative/aria-hidden text skipped; disabled states N/A (no disabled controls rendered); logotype glyphs exempt.

## Results

| Surface class | Light | Dark | Floor | Verdict |
|---|---|---|---|---|
| Body/statement/blog text on panels | 6.58–6.88 | 6.18–6.53 | 4.5 | **PASS** |
| Card inscription on liquid glass: summary · role-meta · title | 7.06 · 5.00 · ≥11 (computed vs sampled bg) | 7.41 · 5.92 · 11.18 | 4.5 / 3 | **PASS** |
| Gallery wall title links | 11.52 | 9.68 | 3 (large) | **PASS** |
| Ember gradient display headings (large only) | worst-stop **3.30** | worst-stop **3.18** | 3 | **PASS — thin margin** (see guard note) |
| Footer meta text | **4.58** | 6.96 | 4.5 | **PASS — thin margin** |
| Contact eyebrow "Let's talk" (12px mono, accent-ink) | **4.17 ✗** | 4.72 | 4.5 | **FAIL light — the round's one contrast defect** |
| Focus indicator (2px terracotta ring, 5 stop kinds sampled) | **3.68–4.02** | **5.15–5.52** | 3 (1.4.11) | **PASS both themes** |
| Whole-site computed census (non-glass) | 1 fail (the same eyebrow) | 0 fails | — | corroborates |

1.4.1 Use of Color: links in prose carry underline/`link-draw` affordances; active states pair color with markers (terracotta dot + aria-current); status never color-only. **PASS** (programmatic).

## Findings

**L4-1 · MEDIUM (mechanical) / BLOCKER-CLASS (claims coupling) · SC 1.4.3 · `app/page.tsx:538`** — the homepage contact-section eyebrow (`text-accent-ink`, 12px mono uppercase) measures **4.17:1 pixel-sampled** (4.22 computed) against the cool contact panel + gold ambient drift in **light** theme; 4.72 dark passes. accent-ink is specced "≥4.5:1" *on canvas* (4.9 there) — this panel is darker/cooler than canvas. Because `/accessibility/` publishes "every text role meets AA in both themes," this single element falsifies a published claim until fixed → claims row C4.
**Fix shape (Phase B):** surface-scoped ink swap on this eyebrow (e.g. `text-cool-deep` 47,87,77 ≈ 6.4:1 on this bg, or ink-muted) — **never a global accent-ink token change** (it passes on canvas contexts; the shared-token law: re-verify EVERY theme + every accent-ink call-site after). Guard: extend the receipts harness with this coordinate.
Evidence: rendered-measured (pixel).

**L4-2 · LOW (guard-worthy invariant, no defect)** — ember gradient text passes only because it is confined to large display sizes (worst stop 3.18 vs the 3.0 large floor; it would fail body-size 4.5 everywhere). Today every `ember`/`ember-*` call-site is display-scale. Worth a cheap test asserting ember classes never appear below the large-text threshold, so a future small-size reuse can't silently ship 3.2:1 body text. Evidence: rendered-measured.

**L4-3 · LOW (margin note)** — footer meta at 4.58:1 light sits 0.08 above the floor; any future warm-tinting of the footer surface eats it. No action needed; noted for the token ledger + receipts coordinates. Evidence: rendered-measured.

**Verdict: FINISHED.** One real defect (L4-1, light-theme eyebrow), two margin/guard notes. The prior "AA in both modes" pass otherwise HOLDS at HEAD — including through the R4 gold/film work.
