> **SHIPPED a64809d — merged + live as of 2026-06-19.** This report's "SKY-ONLY / Nothing merged or pushed" status below is stale: sweep-1 `df4f6f7` and sweep-2 `a64809d` are on origin/main and live at https://skypistudio.com. Body unchanged for the record.

# Deep UI Polish Sweep #2 — Editorial Voice + Cohesion ("well-rounded")

**Date:** 2026-06-19
**Surface:** Portfolio — `~/Portfolio`, live https://skypistudio.com
**Branch:** `design/editorial-cohesion-2026-06-19` (stacked on sweep-1 `df4f6f7`)
**Merge:** SKY-ONLY (Portfolio is not an Art.17 repo). Nothing merged or pushed.
**Lenses (Sky's pick):** 1 — Cohesion & completeness · 3 — Editorial type voice

---

## Why / context

Sweep #1 (`df4f6f7`, unmerged) was surgical (focus parity, tokens, micro-motion). Sky asked for
"a different creative approach for a more well-rounded feel" and chose lenses 1 + 3. After reading
the code, the honest finding was that the site is *already very polished* — many audit "issues" were
already solved or deliberate (blog header→prose `border-t` exists; contact spacing is an intentional
optical fix; colophon dual closer links are a real hierarchy; standfirst summaries already use
`text-step-1`). So this sweep is precise, not churny. The real, well-rounded wins were the renderer's
incompleteness (the "reads like a CMS" tell) and a golden-hour-light parity gap.

---

## What changed (before → after)

### Movement 1 — Editorial renderer completeness + content showcase (centerpiece)
- **`components/MarkdownProse.tsx`** previously parsed only `**bold**` / `*italic*` / `` `code` ``.
  Added, purely additively: **unordered lists** (`- `/`* `), **ordered lists** (`1. `), **pull-quotes**
  (`> ` → `<blockquote class="pull-quote">`, which unlocks the previously **dead** `.pull-quote` CSS),
  and **inline links** (`[text](url)`).
  - Links are AA-correct: external (`https?:`) open in a new tab with `rel="noopener noreferrer"` + an
    sr-only "(opens in new tab)" cue; internal use `next/link` (basePath-safe); **all** prose links
    carry a *persistent* underline (`.link-draw` was unsafe for body copy — it only draws on hover).
  - Conservative list detection (every line must be a marker line) → mixed blocks render literally;
    **no false positives**. Drop-cap + reveal choreography preserved exactly.
- **`app/globals.css`** — added a block-`blockquote.pull-quote` frame (Cormorant, lifted size,
  breathing room) and `.prose-list` / `.prose-list-ordered` styling (terracotta `::marker`, indent,
  item rhythm). Inserted in the editorial-luxury block; **no** cinematic/world ranges touched.
- **Content showcase (Sky chose Blog + case studies)** — structure-only reformatting, *words verbatim*:
  - `content/blog.json` — the "What shipped" bold-led paragraphs → a real 7-item list; the closing
    line lifted into a pull-quote. (char delta +11 = markers/structure only.)
  - `content/deliverables.json` — one earned pull-quote per case body (6/6), each an existing complete
    sentence split into its own `> ` block (epigraph on the Reflection, or the closing line). No words
    altered.

### Movement 2 — Long-form micro-typography (pure CSS)
- `serif-display` (discretionary ligatures) added to prose `h2`/`h3`.
- `[hanging-punctuation:first allow-end]` on prose paragraphs/lists (progressive — **Safari** bonus,
  degrades to nothing elsewhere).
- `tabular-nums` on the blog post + blog index date / "min read" meta.
- Heading line-heights/tracking left untouched (already deliberate — no manufactured churn).

### Movement 3 — Cohesion & completeness
- **3a (visible):** `ParallaxWash depth="far"` added to the **blog index** + **contact** headers
  (the only entry points missing it) — golden-hour parity with work/certificates. Reuses the existing
  component; transform-only; RM → static; zero CLS.
- **3b:** new `components/EmptyState.tsx` (ember rule + serif line + calm note, echoing the 404's
  care), wired into the Work / Notes / Credentials empty states. *Note: these never render on the live
  site today (lists are populated) — completeness only.*
- **3c:** colophon closer `world-surface` → `world-surface-alt` (fixes the surface→surface seam after
  the specimens section).

**Files:** 10 modified + 2 new (`components/EmptyState.tsx`, `components/__tests__/MarkdownProse.test.tsx`).

---

## Acceptance criteria — results (built-output proof)

| Criterion | Result |
|---|---|
| Renderer emits ul / ol / blockquote.pull-quote / `<a>` | ✅ verified in `out/` HTML + 8 vitest cases |
| Unchanged constructs byte-identical (regression lock) | ✅ vitest regression test (headings/bold/italic/code/drop-cap; no ul/ol/blockquote leak) |
| Blog "What shipped" → real list; closing line → pull-quote | ✅ `out/blog/building-accessmap/` — 7-item disc list + Cormorant-italic pull-quote with faded mark |
| Pull-quote on every case body | ✅ 6/6 `out/work/*/index.html` |
| Prose links persistent underline + new-tab safety | ✅ vitest (target/rel/sr-only + `underline` class) |
| serif-display on prose headings | ✅ computed `font-feature-settings` includes `dlig` |
| tabular-nums on dates | ✅ computed `font-variant-numeric: tabular-nums` |
| Golden-hour wash parity (blog + contact) | ✅ wash present (absolute/gradient/aria-hidden), headers isolate+overflow-hidden |
| Layout integrity — no overflow @320px, both themes | ✅ scrollWidth == clientWidth (320); list + pull-quote fit |
| AA floor not regressed | ✅ links non-color-affordance + focus; list semantics; sr-only headings kept; contrast tokens reused |
| Console clean | ✅ no errors across blog post / contact / blog index |
| typecheck / lint / tests / build | ✅ clean · clean · 293 pass · build OK |

## Locks — proof
`git diff main -- components/cinematic/ components/CinematicIntro.tsx app/tokens-phase2.css` → **0 bytes**.
`globals.css` diff touches **no** `.cinematic-*` / `.cdesert-*` / `.world-*` lines.

---

## Engine-sensitive — for Sky's real iPhone (look-for, NOT a blocker)
- **`hanging-punctuation`** on prose is a progressive **Safari** enhancement (others ignore it). It
  cannot regress Chromium (verified no change). On iPhone Safari, opening quotes / line-end
  punctuation will hang slightly into the margin — a subtle bonus to confirm reads nicely. Everything
  else (lists, links, pull-quote, ligatures, tabular-nums, ParallaxWash) is Chromium-verified.

## Sky review + merge checklist
1. Review branch `design/editorial-cohesion-2026-06-19` (stacked on `df4f6f7`).
2. Read the live blog post + a case page locally (`portfolio-out` preview serves `out/`): confirm the
   list + pull-quotes read in your voice and you're happy with the lifted sentences.
3. Optional: glance at the iPhone-Safari hanging-punctuation bonus.
4. Merge order: merging this branch ships **both** sweeps; or merge `df4f6f7` alone first, then this.
   Push to `main` = live in ~2 min (no staging).
