# LENS 1 — AUTOMATED BASELINE (banked 2026-07-31)

**Verdict: FINISHED — zero automated violations.** Automation is the start line, never the verdict; Lenses 2–9 carry the real audit.

## Project gates (all floors GREEN at `38b94db`, tree == HEAD for code)

| Gate | Result | Evidence |
|---|---|---|
| `npm run lint` (incl. eslint-plugin-jsx-a11y) | **0 errors, 0 warnings** | programmatic — scratchpad gates.log |
| `npm run typecheck` (tsc strict) | **0** | programmatic |
| `npm test` (vitest) | **405 passed · 1 skipped · 1 todo · 44 files** | programmatic — incl. dedicated a11y suites (SkipLink, RailInert, HamburgerNav, A11yReceipts, TagPill, Hero single-h1, ViewTransitions) |
| `npm run build` + postbuild prune-500 | clean · 17 HTML routes exported | programmatic |

Note for the claims lens: vitest count here is **405/44** — homepage chip says "1,680 tests passing" for *AccessMap* (different repo, verified in Lens 9 against its ledger), not this repo.

## axe-core sweep — full static export, every route

Rig: axe-core (from node_modules, v4.x) in jsdom over all 17 `out/**/*.html` routes, tags `wcag2a wcag2aa wcag21a wcag21aa wcag22aa`, results in scratchpad `axe-results.json`.

**Result: 0 violation nodes across all 17 routes** (`/` · `/about/` · `/accessibility/` · `/blog/` · `/blog/building-accessmap/` · `/certificates/` · `/colophon/` · `/contact/` · `/work/` · 6 work pages · `/404/` + `404.html`).

Incomplete (axe couldn't judge — honest scope):
- `color-contrast` ×17 routes — jsdom has no layout/CSSOM; **covered by Lens 4's measured pass** (tokens + live computed styles, both themes).
- `video-caption` ×1 (`/work/ghost-code/`) — the ProofVideo proof loop. Silent-by-design (poster-first, muted, RM-gated autoplay, native controls, aria-label, captions `<track>` slot in the component). Disposition → **Lens 8** (1.2.1 video-only alternative check), not a 1.2.2 captions failure on a silent video.

## The law, restated

axe + jsdom cannot see: rendered contrast, focus visibility/obscurement, keyboard traps, live-region *firing*, reflow, motion behavior, alt *quality*, claims truth. Zero-violations here is the floor the manual lenses stand on, nothing more.

**Evidence tags:** all findings this lens = `programmatic`.
**Findings:** none (baseline clean).
