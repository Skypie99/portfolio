# LENS 2 — TYPOGRAPHY (banked 2026-08-07)

**Method:** computed-style census (every text-bearing element) on home + /about/ + /work/accessmap/ + /blog/building-accessmap/ + /colophon/ + /certificates/ + /contact/ at 1280×800; @font-face + preload inspection; canvas-measured chars-per-line; text-node punctuation walk. Live `45f6632`, Chromium.

## Verdict

**The loudest expensive tell mostly holds.** Three families (Cormorant Garamond display serif · DM Sans body · DM Mono meta), a real fluid scale with named utilities (`text-step-*`, `text-body`, `text-label`, `text-meta`), proportional optical tracking at display sizes, and disciplined per-page tuple counts (13–32 per page — low for pages this rich). The system is genuinely built, not accreted. The tells that remain are punctuation-level, not scale-level — exactly the altitude a luxe pass should now be working at.

## The scale as shipped (desktop, measured)

| Voice | Size/leading/tracking | Where |
|---|---|---|
| Film title | 83.2/124.8 serif, +4.99px tracking (spaced caps) | carve moment |
| H1 hero | 88/88 serif −2.2px | home |
| Display | 68 (colophon) · 57.6 (showcase serif) · 48.8 (stat serif) | fluid clamps |
| H2 section | 39.056 serif −0.586, **lh 42.96 (single-line) & 48.82 (multi-line)** | both = deliberate multi-line leading, verified not drift |
| H3 card | 33.28/34.94 serif −0.732 | wall titles |
| H3 sub | 24/27.6 & 24/30 serif | steps, cert cards |
| Pull-quote | 28/39.76 italic serif | about |
| Body | sans 20/31 · 17/29.75 (blog 1.75!) · 16/26.4 · 14/22.4 | reading rooms |
| Mono | 24/24 numerals +3px · 16 · 12/16.8 +1.5 · 11/15.4 +1.375 (dominant, 132×) · 11/17.9 (colophon ledger) · 10 (identity role) | meta everywhere |

- **Tracking discipline:** display negatives scale proportionally (≈ −0.022 to −0.025em at every step) — optical, consistent, correct. Mono meta tracked +12.5% — the house signature voice.
- **Ratio:** major display steps run ≈1.45–1.53; functional steps are Tailwind-quantized. Not a strict modular scale, but named, few, and coherent — passes as a system, reads intentional.
- Off-scale strays: the unmerged stack already normalized them (UP-03/04, and `f653fbd` moves the last 3 glyphs onto the scale) → **ALREADY-FIXED-UNMERGED**; nothing new found beyond it at 1280.

## Measure / rag / leading (reading rooms)

- Blog post: 652px @ 17px ≈ **73cpl**, leading 1.75 — proper book measure. About: 61–72cpl at 20/17px. Process/about long-line worst case: **76–79cpl @16–17px** (process steps, one about run) — one notch over the 66–75 luxury band. Marginal; candidate only if bundled into an existing pass (Restraint-list otherwise).
- Rag/widow spot-checks on painted pages: clean; the known orphan ("this?" at 375, UP-12) is cured in the unmerged stack (AFU).
- Section-head leading pairs on one size = multi-line care (see table) — verified deliberate, **no defect**.

## Font loading (verified, not assumed)

- next/font self-hosted woff2, **`font-display: swap` on all three families**, with **per-family preload** (`-s.p.woff2` = one primary weight each) and **metric-adjusted local fallbacks** ("Cormorant Garamond Fallback" = size-adjusted Times; DM Sans/Mono Fallback = adjusted Arial). CLS-safe by construction; visible swap only on slow networks, and the film's arrival (~2.5s of atmosphere before any content text matters) conceals the swap window on the home route entirely. **Strategy: sound. No finding.**
- Chip/cue text (DM Mono, preloaded weight) painted styled in every first-frame capture taken this run.

## Punctuation craft (the finding of this lens)

**The estate ships typewriter apostrophes in its prose — inconsistently.** Measured sightings (prose/text nodes, scripts excluded):
- /about/: "weren't", "The user's data is their…", "no one's left out", "Let's talk"
- /work/accessmap/: "I've always been…" + the sitewide footer strings
- /contact/: the "LET'S TALK" eyebrow itself
- home: 5 sightings
- Meanwhile the blog h2 "What's next" uses a **proper ’** — the estate is MIXED, which reads worse than uniformly wrong: it looks unnoticed rather than chosen.
- Zero straight double-quotes, zero `...`, zero double spaces, zero spaced-hyphen-as-dash — everything else is already clean, which makes the apostrophes stand out more.

**→ ELEVATION LEDGER CANDIDATE (strong): a render-time smart-punctuation pass** (apostrophes + any future quotes/ellipses) applied where content strings meet the page — zero content-JSON bytes changed, zero voice touched (safe under the no-copy convention; UP-44/truth wording queue unaffected — those are *what the words say*, this is *which glyph the apostrophe is*).

## Small notes (carried to later lenses)

- Colophon runs two 11px mono leadings (15.4 label vs 17.9 ledger) — reads as a deliberate reading-mono; consistency lens will confirm it stays page-local.
- The DM Mono specimen ink (UP-42) and calibration-ledger setting (UP-43) defects exist on live; both AFU (`b98e85f`, `fc35d93`).
- Type tuple counts per page: home 32 · about 22 · flagship 23 · colophon 13 — discipline confirmed everywhere sampled.
