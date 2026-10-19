# Before / After Visual Review

**How to read this.** Every image in `boards/` is a real headless-Chromium render of the static export: the original (`main` `b3e992b`) on the left, the candidate on the right, at the same scroll position, after the scrub's 1 s catch-up had settled. `p` is progress through the pinned film (0 = top, 1 = pin release); `+N px` is distance past the release. Boards are JPEG (q86) of PNG captures; the curated PNG-derived frames are in `frames/`.

| Board | What it shows |
|---|---|
| `00-side-by-side-board.jpg` | The one-page view: opening, landing, seam (light and dark), phone landing + seam. |
| `01-desktop-light-film-and-handoff.jpg` | 1440×900 light: p = 0, 0.55, 0.82, 0.90, 1.00, then +160, +420, +720. |
| `02-desktop-dark-film-and-handoff.jpg` | 1440×900 dark: p = 0, 1.00, +160, +420. |
| `03-mobile-393-light.jpg` · `04-mobile-393-dark.jpg` | 393×852 @2×: p = 0, 0.55, 0.90, 1.00, +160, +420. |
| `05-small-phone-360.jpg` | 360×740 @2×, light and dark, four cells per row. |
| `06-opening-light-up.jpg` | Burst captures of the first ~1.5 s after navigation. |
| `07-motion-sequence-desktop-light.jpg` · `07-…-mobile-light.jpg` | One frame per second of the 12 s recordings, original beside candidate. |
| `08-direction-b-the-plate-prototype.jpg` | Direction B renders (prototype, not implemented). |

---

## 1. The opening (board 06, board 00 row 1, board 07 t = 0 s)

**Both builds, first.** The five planes decode asynchronously and paint when ready, so for the first ~0.5–1 s after navigation (warm cache, this container) *both* builds show the pin's warm dawn gradient under the chip and the Skip control; that gradient was designed as exactly this decode fallback. The wall-clock burst at the foot of board 06 shows it: sample 1 is the gradient on both sides. Headless screenshots cost ~0.7 s each here, so the burst cannot resolve the move itself; it is kept only for that finding.
**Original.** When the planes land they appear at full exposure in one frame: a switch.
**Candidate.** The frame runs a 1200 ms settle from first paint, so the planes arrive inside a fade already under way. Board 06's deterministic frames (the CSS animation paused at exact times after decode) show the valley at ≈61% exposure and 1.7% larger at 200 ms, ≈95% at 600 ms, and at rest at 1200 ms, identical to the original's painted frame: the curve is front-loaded, so the picture is *there* within ~0.3 s and spends the rest of the window settling. The live recording caught the same mid-fade frame in real time (board 07, t = 0 s). The Scroll cue arrives inside the window.
**Reading.** The candidate's first second has intention; the original's has speed, though less of it than the stills suggest, because its own first frame is the gradient until decode. Perceived cost of the light-up: well under the nominal 1.2 s, since the first part overlaps the decode. This is the most subjective of the three moves and the easiest to remove (one CSS rule) if the owner prefers the pop.

## 2. The body of the film (boards 01, 03, 07)

p = 0.12 → 0.82 are the same frames on both sides to the pixel-scale of a JPEG: dolly, rise, dissolve, light ramp, rim-glow and vignette arc are untouched. Board 07's seconds 1–8 match beat for beat. Nothing to review here, which is the point.

## 3. The landing (boards 01/02 row "THE LANDING", 03/04, 05)

**Original.** `SkyPi Studio` alone at 58%, gilded bone over the gold wall; dark terracotta floor below it to the frame's edge; vignetted corners.
**Candidate.** The mark is unchanged in position, size, face and ink. Beneath it a 1 px hairline and `SKYLER HALISKY · SENIOR TECHNICAL SUPPORT` in tracked mono, bone with the title's halation, sitting on the darker floor band. From ~72% of the frame down, the floor melts into the page colour: cream in light, the warm near-black canvas in dark. The Skip control now sits on page colour. The bottom corners are no longer vignetted (the veil sits above the finish layer), which matters a scroll later.
**Phone (393, 360).** The credit stacks as two lines; both clear the Skip control and the menu button. The melt takes the bottom third of the portrait frame. On 360×740 the composition holds; the credit is 11 px and the two lines are 115 px and 200 px wide.
**Dark.** The melt reads as the floor falling into night; the credit's contrast rises (measured worst case 5.0:1 light desktop, 4.9:1 light phone; dark is higher because the floor is darker before the veil begins).
**Reading.** The candidate frame answers *who* and *what* without touching the mark's purity; the melt makes the frame feel like the end of a sequence rather than a paused slide. The cost is real: the floor's rocks, previously fully present at the bottom, are now half-dissolved at p = 1. The owner may want the veil to start lower (one number, `72%`).

## 4. The seam (boards 01/02 row "THE SEAM", 03/04, 05; board 07 seconds 9–11)

**Original.** The single worst moment of the site in light mode: the film's dark floor meets the page on a straight line, teal rail on the left, cream and the hero wash on the right. In dark mode the jump is smaller but it is still orange-to-near-black on a line.
**Candidate.** The film's last pixels are the page colour; the content wrapper's first 120–200 px fade from that colour into the hero wash. Across the main column the edge is gone: there is no line to find at +160, +420 or +720. The hero's landing pad then reads as paper that the film dissolved into, and the hero wash still blooms as before.
**Measured.** The pixel rows at the release edge were read directly (`harness` probes). An earlier candidate build showed a 1 px line of floor colour across the whole width at the edge, caused by the plane layers painting one device row past the pin's clip; it is fixed in the committed build by giving the veil a transform of its own (see `IMPLEMENTATION_REPORT.md` §2.3). The final frames are clean at 1440 light and dark and at 393 light and dark; verify on your own display, since compositor rounding is the one thing a headless capture cannot promise for every GPU.

## 5. Residuals, honestly

1. **The rail step.** Over the desktop rail (left 280 px) the page below the film is the rail's soft teal, not canvas, so the candidate still shows a faint tonal step there at release (cream above, teal below). It is a small fraction of the original's jump and only exists on the rail column. Fixing it means touching the rail's own surface, which is shared navigation and out of this brief's scope. Two honest options for later: a canvas-coloured cap on the rail's top at the homepage only, or ending the veil in a horizontal split (rail colour under the rail, canvas under main) at the cost of a visible vertical boundary inside the frame at p = 1 (rejected here for that reason).
2. **Less floor at the landing.** The veil trades the lower quarter of the destination shot for the seamless release. If the owner prefers more rock, start the veil at 78% instead of 72%; the seam stays solid because the last 3 px are always full canvas.
3. **A third reading of the name is now visual.** Chip, credit, nameplate. The credit is `aria-hidden`, so assistive technology hears it twice as before; sighted visitors see it three times across two viewports. In a title sequence that repetition is conventional (slate, credit, byline); on a web page it is a choice the owner should make deliberately.
4. **Instant image vs lit image.** The light-up delays the perceived first image by roughly 0.6 s. The data is on screen at the same moment; only the exposure is late.

## 6. Where the original is stronger

- Its last frame is purer, and purity is a legitimate taste.
- Its seam is a cut, and a cut is honest; some directors would keep it.
- It shows the picture 0.6 s sooner.

## 7. Direction B, for comparison (board 08)

The plate renders are strong on desktop: the gold wall as an 86% plate on paper with a caption beneath, and the handoff frame where the plate scrolls into the page beside the hero nameplate shows the seam problem simply not existing. The slate opener (bottom-left mono leader replacing the glass chip) is a credible alternative identity treatment. The phone render exposes the prototype's one real defect: the caption collides with the Skip control at 393 px and would have to move above the plate. B is a different register (editorial, collected) from A (cinematic, dissolved); both are shown so the choice is the owner's.
