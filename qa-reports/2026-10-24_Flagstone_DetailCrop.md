# Creative Release 7: Flagstone detail crop ends above the report's description, 2026-10-24

## DECISIONS FOR SKY

- [ ] **Review and merge the refined crop.**
  - **Recommendation:** Open a small PR from `refine/flagstone-detail-crop-20261024` (commit `6ef2405` and this receipt's docs commit) after you review the boards below.
  - **Why:** The enlarged detail no longer magnifies the reporter's sentence; the capture is untouched; every gate is green.
  - **Alternative:** Leave main as it is; the live detail keeps enlarging the sentence.
  - **Impact:** One crop rectangle changes on the homepage flagship room. No image, copy, alt text or other page changes.
- [ ] **The optional editorial line "Steep stairs with no ramp."** Not added. See "The caption" below for the reasons. Say so if you want it anyway, and where.

## BLOCKERS / FAIL_FAST

None.

## What changed

| | Before (main `43788b2`) | After |
|---|---|---|
| Detail box, capture px | x 236, y 414, 774 × 910 | x 236, y 414, 774 × 600 |
| Subject, capture px | whole card, 714 × 852 | heading, severity, report age, photograph, 714 × 555 |
| Plate shows | title, severity, age, photograph, **the description**, Open details button | title, severity, age, photograph; ends on blank card face |

Measured on the shipped file (`data/capture-row-bands.txt`). The photograph's last anti-aliased row is y 998. Card face is pure white (every channel ≥ 252) from y 999 to 1023. The description's first ink is y 1024. The box's last row is y 1013, which leaves 10 rows of clearance.

Source (`6ef2405`):
- `lib/captureDetail.ts`: the box and subject numbers, and the measurement note.
- `lib/__tests__/captureDetail.test.ts`: a new pixel guard, read back from the file. The box's rows below the subject must be blank card face, and the description's ink must start within 16 rows below the box. The existing stripe, card-face and map checks pass unchanged against the new subject. One small `pixels()` helper is shared by both pixel tests.
- `app/page.tsx` and `components/exhibitDetail.module.css`: comments only. They claimed the leader meets the card's mid-height "within 2px at every width". That is no longer true, so they now say where it lands. Comments are stripped from the build output.

## What did not change

- Every image file. `git diff 43788b2 --stat -- public/` is empty. `explore-current.phone.webp` is SHA-256 `b133ba6ca2e46f5bdf2bd064141d7cff79d83579cf2c7c53ea990eaf4834579e`; `.avif` is `b127961c54e3866785fca873c381e220a1433f80dbf9b48089288855a986e9fe`.
- `ExhibitDetail.tsx`, the stage CSS rules, the leader, the tag, the captions, `content/deliverables.json`, the alt text and the museum plate.
- The truth rules: the detail is still the shipped file's own URLs at the same size. One request serves both views (`data/measurements.json`, `captureRequests` = 1 per frame).

## Verification

Same browser, viewport, theme and scroll walk for before (main's `out/`) and after. Results from `tools/probe.mjs`:

| Width | Plate, CSS px (before → after) | Capture rows shown (after) | Image distortion | Leader lands on capture row (before → after) |
|---|---|---|---|---|
| 1440 | 314 × 370 → 314 × 244 | 410.7 to 1014.6 | ≤ 0.00002 | 879 → 565 |
| 1280 | 266 × 313 → 266 × 207 | 410.2 to 1014.7 | 0 | 883 → 565 |
| 1024 | 190 × 223 → 190 × 147 | 408.6 to 1014.9 | ≤ 0.00002 | 892 → 563 |
| 768 | 300 × 353 → 300 × 233 | 410.5 to 1014.6 | ≤ 0.00002 | stacked, no leader |
| 393 | 250 × 294 → 250 × 194 | 409.9 to 1014.7 | ≤ 0.00002 | stacked, no leader |

Notes on the table:
- **Rows shown:** the outer edges include the plate's 1px border. The visible bottom edge stays at or above row 1015, nine or more rows clear of the description.
- **The leader:** row 565 lies between the severity line (y 537 to 559) and the report age (y 582 to 608). That is inside the region the plate enlarges, on the card's own heading.
- **Overflow:** none at any width; `scrollWidth` equals the viewport.
- **The phone:** the screen keeps its exact size at every width. Stacked, the stage is about 100 px (393) to 120 px (768) shorter.
- **Coverage:** Chromium in light and dark at all five widths, plus WebKit at 1440 light and 393 dark.
- **Console errors:** none. One `ERR_CONNECTION_RESET` from the single-threaded local test server re-ran clean three times (`tools/recheck.mjs`).

**Accessibility** (`data/a11y-*.json`, R7's own `a11y-room.mjs`; 1440 and 393, light and dark):
- No axe violations on the page or in the room.
- One keyboard stop (View project), with no hidden focusables.
- The plate is still one `aria-hidden` subtree. The capture stays the room's single accessible image, and its alt text is accurate unchanged: it describes the whole screen.
- Worst text-line contrast after: 5.15, 5.02, 5.25 and 5.26:1. Before: 5.21, 5.02, 5.25 and 5.31:1. The plate's tag sits higher on the stage light; it still clears 4.5:1.

**Gates** (worktree at `6ef2405`, Next 15.5.25, Vitest 3.2.7):
- Typecheck, lint (no warnings) and `npm run build` pass.
- `npm test` (build-backed): 127 files; 1177 passed, 2 skipped.
- Focused tests: 7 files, 68 passed. The files are `captureDetail`, `ExhibitDetail`, `flagship-exhibit`, `flagstone-first-impression`, `flagstone-first-proof`, `ProductReveal` and `media`.
- Mutation check: the new guard fails on the old 774 × 910 box, on a 774 × 611 box (one row into the sentence's anti-aliasing) and on a 774 × 560 box (cut 40 px short, unmeasured).

## Boards

These are before/after pairs, labelled outside the screenshots:
- `boards/stage-light-1440.jpg`, `stage-dark-1440.jpg`, `stage-light-1280.jpg`, `stage-dark-1280.jpg`
- `boards/stage-light-1024.jpg`, `stage-light-768.jpg`, `stage-dark-393.jpg`, `stage-webkit-dark-393.jpg`
- `boards/room-light-1440.jpg`, `room-dark-1280.jpg`

The two crops cut losslessly from the shipped file are in `crop/`.

## The caption

The brief allowed one editorial line, "Steep stairs with no ramp.", outside the screenshot. I did not add it, for three reasons:
1. **It would read as the report's own words.** Set beside a crop that has just left out the reporter's sentence, a sentence-case barrier description takes that sentence's place: a reader would see it as what the reporter wrote. That is the confusion the owner wants to avoid.
2. **The room already names the plate.** "Detail of the same capture" names it, and the museum plate ("Steep grade: a real barrier report expanded on the map.") names the report. A fourth line in the exhibit adds no information that the heading and the photograph don't already show.
3. **It is outside this scope.** It would be new public copy in Sky's protected wording, beyond a geometry refinement.

If Sky still wants it, the honest place is the museum plate's caption in `content/deliverables.json` (`heroPlate.caption`), written in the room's editorial voice. Do not put it on or under the plate.

## Tools

The tools in `tools/` read the built exports over loopback and the shipped file:
- `probe.mjs` and `pair.mjs` produce the measurements and the boards.
- `row-bands.mjs` and `gap-rows.mjs` produce the capture row bands.

`a11y-room.mjs` is R7's own instrument, at `creative-release7-flagship-detail-2026-10-22/tools/`.
