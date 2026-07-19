# Work-of-Art Pass — 2026-07-19

**Branch:** `polish/work-of-art-2026-07-19` (4 commits on main `35c9693`).
**Sky's ratifications (in-chat):** full cinematic craft · D4 · "AI Builder" everywhere.
D7 stays device-gated; D6 stays declined. Design record: `MOTION_SYSTEM.md` §15.

## Commits
1. `95e8505` D4-A1 — phase2 per-property split, defaults 'none' (proven identical)
2. `a7150c0` D4-A2 — `scaleEase: 'power2.out'` (the one-line glide flip)
3. `008cf93` identity — AI Builder across badge/OG/JSON-LD/descriptions (10 edits, 7 files)
4. `1393d40` the gold lands — rim-glow, vignette arc, gilded title, warmed chrome

## Verification evidence
- **Gate:** tsc clean · 405 tests/44 files (incl. new data-text ghost-guard + landed-glow
  assertions) · build + export clean · OG regenerated (87,879→87,402 bytes, tagline row
  only; accessibility OG byte-identical control PASS).
- **D4 sampler (node, GSAP unit timeline):** A1 ≡ old single tween to machine precision
  (max |Δ| = 0.0e0); A2 value-continuous at p0.62 (Δ 1.6e-4); slopes 0.8065 in → 0.7687
  out (band [0.75,0.83]; old cliff was 0.2632 = the 3.06× gear-shift); endpoints exact
  (1.600000 / 8.000000).
- **Beat matrix (54 shots × before/after, breathe-neutralized, deterministic settle):**
  beats ≤062: chip-bbox only (iPhone 0.11%, desktop <0.05%); 066–088: D4+glow onset
  0.05–0.25%; the 090 art beat ~5.4% BY DESIGN in both themes (title mid-crystallize +
  gilding + glow — eyeballed, gorgeous); beat 100 floor endpoints match; page beats:
  content identical (two flags were document-height framing offsets, verified by eye).
- **Rig notes for future passes:** the D5 breathe contaminates beat captures (walk.mjs
  now injects a `.cdesert-scene{transform:none!important}` neutralizer — breathe is
  verified separately by breathe.mjs) and scrub catch-up requires the transform-stability
  poll (fixed-wait captures land on variable effective p).
- **Title contrast (comparative gate, same probe both sides):** desktop light 1.26→1.27,
  dark 1.27→1.27, iPhone 1.28→1.84 (vignette-arc darkens the surround) — **no context
  regresses**. Absolute through-grain screenshot ratios are NOT comparable to the R2-P4
  specified-color methodology; by specified colors the darkest gilded stop (#FFE9C4,
  L 0.836) over the re-sunk halation band computes ≥4.7:1 (design math in §15).
- **Breathe regression:** breathes at rest (1.0046), eases home on input (1.0001),
  re-breathes (1.005). **Jank:** no regression (desktop dropped% 52.9→46.1 / 54.8→50.0,
  iPhone equal).

## Adversarial verify outcome (4 lenses + arbiter)

SHIP_WITH_FIXES → both catches fixed pre-deploy, re-gated, runtime-verified:
1. **Gilded ink double-announce** (all 4 lenses; CDP AX-tree-proven): `content:
   attr(data-text)` joined the accessibility tree → "SkyPi Studio" ×2. Fixed with the
   alt-text syntax `content: attr(data-text) / ''` + the @supports gate widened to
   require it (unsupporting browsers now fail the whole gate → solid-ink single
   announcement — the exact pre-pass treatment).
2. **Chip hairline silent no-op**: `.runway-identity-chip::after` merged into
   `.glass-card::after`'s cursor specular (opacity .18 + soft-light → ~2% effective).
   Re-vehicled as `outline: 1px solid` at `-1px` offset (collision-free; the chip is
   never focusable; outline follows border-radius on the 2026 baseline).
3. Tidy: the static frame's landed glow moved out of `<picture>` (invalid content
   model) to a keyed sibling — geometry/paint identical, validator-clean.
Everything else: VERIFIED across lenses (transform sync from plate data, cull hook
write-guard, D4 math + overwrite semantics, breathe×glow composition, mask cache-hit +
@supports containment, screen-blend isolation, static-frame sub-pixel registration,
records integrity a–f incl. zero residual "AI developer" in out/).

## Rollback
Single revert of the merge commit; per-commit reverts also clean (D4 has the one-line
data rollback: delete `scaleEase`). OG regenerates from source at build.
