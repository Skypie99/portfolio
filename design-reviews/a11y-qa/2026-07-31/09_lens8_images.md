# LENS 8 — IMAGES + MEDIA (banked 2026-07-31)

Method: full rendered-corpus extraction (55 `<img>` across 17 routes) + content-JSON media walk + quality judgment against the "would it serve a blind user" bar (presence/shape already schema-enforced: 4–200 chars, no "image of" prefix — Alex §4.1 law, build-failing).

## Verdicts

| Check | SC | Result |
|---|---|---|
| Alt presence | 1.1.1 | **PASS** — 0 missing of 55; 13 decorative correctly `alt=""` (glass/caustic/atmosphere layers all `aria-hidden` besides) |
| **Alt QUALITY** (the real bar) | 1.1.1 | **PASS — genuinely excellent.** Scene-specific, purpose-carrying, distinct per variant: "AccessMap's map with a verified 'No ramp' barrier flagged at a downtown Kelowna corner…", "Prompt Library V2 landing — 'Your prompts, one keystroke away', a prompt search box, and category filters". Zero filename slop. The hand-drawn certificate badge descriptions are individually authored ("A hand-drawn apple resting on a closed book"). 20 unique non-empty alts, no lazy duplication across distinct scenes |
| SVG semantics | 1.1.1 | **PASS** — every inline SVG is `aria-hidden` decorative (icons carry names on their parent controls); 0 unnamed informational SVGs (Lens 2 sweep) |
| OG/share images | — | **PASS** — both file-convention OG images export `alt` ("Sky Halisky — AI builder · accessible, privacy-first tools"; the accessibility receipt card its own) |
| ProofVideo (ghost-code loop) | 1.2.1 | **PASS with note** — silent-by-design demo loop: poster-first, descriptive `aria-label` ("A Ghost Code round in play — the Phantom hovering among four command tokens as the round timer runs."), RM-gated autoplay, native controls; the case-study body describes the gameplay the loop shows. The component already supports a `captions` track for any future video WITH audio |
| Video poster + showcase laws | — | **PASS** — poster AVIF present, LQIP fallback, `preload="none"` |

## Findings

**L8-1 · LOW · SC 1.2.1 completeness · `content/deliverables.json` (ghost-code shots[0])** — the silent loop's equivalence rides the aria-label + surrounding prose; a visible one-line figcaption ("What you're seeing: a round of…") would make the text alternative first-class for sighted-AT-partial users too, and is the pattern the showcase laws already anticipate. Cosmetic-adjacent; Sky words it if taken.

**Verdict: FINISHED.** One Low polish note. This corpus is what the alt-text law was written to produce.
