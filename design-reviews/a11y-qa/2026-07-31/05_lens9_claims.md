# LENS 9 — THE CLAIMS VERDICT (banked 2026-07-31)

Census sources: `/accessibility/` statement (+ its receipts strip + `public/receipts/a11y-2026-07-09.json`, live 200) · homepage showcase chips · `deliverables.json` bodies · humans.txt · colophon · README (no a11y claims found to census). Law: the page and the product must tell the same true story; any FALSE claim is Blocker-class.

## Verdict table

| # | Claim (where) | Verdict | Evidence |
|---|---|---|---|
| C1 | "Skip to main content… first thing… jumps past navigation" (/accessibility/) | **TRUE** | rendered (Lens 3 A1) |
| C2 | "Every control reachable by keyboard; mobile menu a proper dialog: trap, Escape, focus-return" | **TRUE** | rendered (journey2) |
| C3 | "2px terracotta focus ring… clears the contrast WCAG asks, both themes" | **TRUE** — measured: ring-vs-backdrop **3.68–4.02:1 light · 5.15–5.52:1 dark** (≥3:1 floor) across 5 sampled stop kinds | rendered-measured (Lens 4) |
| C4 | "Every text role meets WCAG AA contrast… light and dark alike" | **PARTIAL→BLOCKER-CLASS until fixed** — measured pass found exactly ONE failing element: the homepage contact eyebrow ("Let's talk", 12px) at **4.17:1 pixel-sampled in light** (4.72 dark passes) — accent-ink over the cool contact panel + gold drift. Every other sampled role passes with margin (cards on glass 5.0–11.2, body 6.2–7.4, ember worst-stop 3.18–3.3 vs 3.0 large floor, footer 4.58). The page's sentence becomes true again when Lens-4 finding **L4-1** ships — fix the product, keep the page | rendered-measured (Lens 4, pixel-sampled) |
| C5 | "Honest landmarks… heading hierarchy a screen reader can move through" | **TRUE** | programmatic (Lens 2) |
| C6 | "Links that open a new tab say so" | **TRUE for the rendered site** (133/133 labeled) · **PARTIAL in the no-JS fallback** — the 18 noscript-only ContactEmail GitHub/LinkedIn links (9 pages × 2) lack the wording → finding C9-1 | programmatic |
| C7 | "Motion respects settings… all of it holds still… a site-wide rule backs this up" | **TRUE** — Lens 6 verifies the 6-layer contract incl. the global 0.01ms rule + rendered RM states | rendered + programmatic (Lens 6) |
| C8 | The RM-only bracket line ("You're reading this because your system asked for less motion") shows ONLY under RM | **TRUE** — RM-gated via `motion-reduce:` display gate; rendered check in Lens 6 | rendered (Lens 6) |
| C9 | Receipts strip: "0 axe violations (16 routes × 2 themes)" · "6 reduced-motion layers" · "AA measured both themes" · "325 tests" · "100% focus stops" · "0.003 CLS", dated 2026-07-09, "not a live gate; a snapshot you can re-run" | **TRUE-AS-DATED** — honest dated framing is structural; artifact live (200) with method. Corroboration at today's HEAD: axe **0 across 17 routes** ✓, suite now **405 tests** ✓ (grew), focus stops sampled ✓. A receipts **re-run** would let the strip cite fresher numbers — Sky-owned, not a defect | programmatic + rendered |
| C10 | "No formal audit… not validated end-to-end with AT… no full manual screen-reader pass" (the honest-gaps section) | **TRUE** — and still true: the device pass (R3-D5) remains open; this train's DEVICE_SCRIPT.md is the instrument | — |
| C11 | "Moving background is decorative… hidden from screen readers… holds still under RM" | **TRUE** — WorldBackdrop aria-hidden (source), RM stillness in Lens 6 | programmatic |
| C12 | Homepage chip: **"1,680 tests passing — AccessMap"** (present tense, undated) | **STALE-UNDERCOUNT** — AccessMap's own ledgers put the suite at 2,040–2,826 today (BP15 / SHIP-READY runs). Conservative direction, but the site's own "measured, not claimed" register wants the number fresh or dated → finding C9-2 | programmatic (cross-ledger) |
| C13 | Chip tags on "Born accessible → /accessibility/": **"44PT TARGETS"** (with Screen-reader · Reduced-motion) | **AMBIGUOUS→PARTIAL** — the linked statement never claims target sizes for this site, and this site's own secondary links measure 21–41px (SC-clean via spacing; primaries ≥44). True as a statement of Sky's build practice / AccessMap's documented floor; falsifiable if read as "this site's targets are all 44pt" → finding C9-3, Sky words the resolution | rendered-measured |
| C14 | Mutual Mesh body: "WCAG 2.2 AA accessibility" · Ghost Code body: "WCAG AA-accessible: keyboard-navigable, sufficient contrast, no motion traps" | **VERIFIED-BY-PROJECT-LEDGER** (honest boundary: claims about OTHER products; both repos carry in-house audit close-outs per their ledgers. Not re-verified by this train — a per-project a11y train fire is the instrument if Sky wants site-grade proof) | ledger cross-ref |
| C15 | humans.txt | **T18 placeholder header still live** ("NEEDS-SKY COPY — not final" served in prod). Known Sky-owned queue item since R2 — recorded, not new | rendered |

## Findings

**C9-1 · LOW · SC 2.4.4-adjacent / claims-consistency · `components/ContactEmail.tsx:80-100`** — the noscript fallback GitHub/LinkedIn links lack the "(opens in new tab)" wording every rendered link carries, so the statement's C6 claim is imperfect for no-JS visitors. Fix: the same `sr-only` span the Footer uses (visible-text change: none). Guard: extend the static-integrity/new-tab test to include noscript content.

**C9-2 · MEDIUM · claims-freshness · `app/page.tsx` showcase chips** — "1,680 tests passing" undercounts AccessMap's current suite by ~40–70%. GATED-AWAITING-SKY: refresh the number (and consider a dated sub-line like the receipts strip uses) — copy is Sky-ratified surface; agents don't word it.

**C9-3 · MEDIUM · claims-precision · `app/page.tsx` "Born accessible" chip tags** — "44PT TARGETS" reads site-scoped next to a site whose secondary targets are 21–41px. Three Sky-choices: (a) scope the tag (e.g. it describes AccessMap's documented floor), (b) drop/replace the tag, (c) lift this site's secondaries to 44 (Phase B can do the mechanical part; the claim then becomes simply true). GATED-AWAITING-SKY for the wording; the F7-1/F7-3 lifts are the code-side half.

**Verdict: FINISHED.** No FALSE claim found — the statement page's honesty architecture (dated receipts, disclosed gaps, "measured not claimed") **holds under adversarial audit**. Two Medium precision/freshness items + one Low, all wording-gated to Sky.
