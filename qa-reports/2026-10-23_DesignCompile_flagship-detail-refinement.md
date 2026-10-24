# Design Compile Result — flagship-detail refinement (Creative Release 7) — 2026-10-23

**Surface:** homepage `#flagship` room · **Branch:** `claude/skypi-creative-r7-flagship-detail-20261022` (local only) · **Refinement source commit:** `6e76696` · **Refines:** v1 `ed5b25b` · **Compared against:** main `2fb857b` (live) · **Status:** refined candidate for independent visual review. Not pushed, not merged, not deployed; nothing sent to anyone. Native Safari + VoiceOver acceptance stays OPEN under issue #38.
`mode: active · model_tier: opus (Sky-initiated session) · state_consistency: verified against remote main 2fb857b · duplicate_work_detected: none · drift_risk: low`

The review packet is the entry point: [`creative-release7-refinement-2026-10-23/README.md`](creative-release7-refinement-2026-10-23/README.md).

## 1. DECISIONS FOR SKY

- [x] Accept direction A (freestanding phone, enlarged proof detail): Sky, 2026-10-23.
- [x] Tablets stack, desktop composition preserved: Sky, 2026-10-23. Applied.
- [x] Stronger caption ink: Sky, 2026-10-23. Applied (kept from v1).
- [x] Fix the dark-mode contrast failures within the feature, ≥4.5:1 both themes: Sky, 2026-10-23. Applied.
- [ ] Independent visual review, then push / pull request / merge: Sky's.
- Rollback: before a merge, reset the branch to `ed5b25b` (v1) or delete it; after a merge, `git revert -m 1 <merge-sha>`.

## 2. BLOCKERS / FAIL_FAST

None. Two instrument findings were corrected along the way, and both are recorded in the packet. The page needed no change for either:
- A single-frame contrast read missed the scroll-dependent backdrop. The probe now takes the minimum over scroll offsets covering the whole room.
- A light-mode "4.33:1" came from the phone menu button's shadow passing over the end of a line's box. Floating chrome is now excluded and named.

## 3. Summary

On tablets the plate now stands above a screen at main's size (232px at 768, where v1 drew 169px); the desktop composition is untouched. In dark mode the room takes one panel step (0.68 → 0.80) and runs its wash at half strength. Every text line in the room then holds 4.91:1 or better at its worst pixel, at every width and scroll offset; on main they fall to 3.70:1. Light holds 4.88:1 or better. No token, text colour, shared component, cinematic file or Motion-page file changed.

## 4. Verification

| Check | Result |
|---|---|
| typecheck · lint · build | clean · clean · clean (`/` 174 kB First Load, `/motion` present) |
| Tests (after build) | 127 files, 1175 passed, 2 skipped (main: 1148 passed, same skips) |
| Overflow census | 168 + 336 frames (28 routes, 9 widths 320 to 1440, both themes): clean; plant caught on every frame |
| axe 4.11.4 | 0 violations, page and room, 1440 / 768 / 393, both themes |
| ARIA snapshot | identical to main in all six combinations |
| Keyboard | one stop ("View project"), ring visible |
| Reduced motion · no JS | 0px difference 120ms vs 1600ms at three widths, both themes · complete composition |
| Contrast (min over scroll offsets) | refined: light ≥4.88, dark ≥4.91 · main: dark down to 3.70 |
| WebKit · text 200% | geometry matches Chromium · no overflow |
| Performance | capture requested once; image bytes identical; CLS 0; +810 B HTML, +457 B CSS gzipped |
| Protected surfaces | cinematic and Motion page: no diff against main |

## 5. LAYER BREAKDOWN

| Layer | Result | Score | Evidence |
|---|---|---|---|
| 1. Tokenization | PASS | — | The dark floor reuses the documented `--surface-alpha-alt` knob, scoped to `#flagship`; the wash uses the existing `opacity-50` utility; no new token, colour or duration |
| 2. Accessibility Parity | PASS | — | Every room line ≥4.5:1 in both themes at every width and scroll offset (min 4.88 / 4.91); ARIA and keyboard identical to main; RM / no-JS complete |
| 3. Component Consistency | PASS | Cohesion 18/20 | Same components as v1; the dark fix is the Release 6 `#work` wash precedent plus the system's own alpha knob |
| 4. Visual Entropy | PASS | ~86/100 (judgment) | Tablets now read as one calm vertical exhibit instead of two small objects side by side |
| 5. Luxury UI Score | PASS | ~88/100 (judgment) | The darker dark room lets the lit exhibit carry the light, the exhibit-lamp idea the room already had |
| 6. Regression Safety | PASS | — | Suite, censuses, WebKit, RM / no-JS green; the screen within 2.5px of main everywhere; protected surfaces untouched |
| 7. Compile Decision | **COMMIT to the candidate branch** · release: Sky's review | — | Nothing applied live |
