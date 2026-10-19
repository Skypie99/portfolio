# Motion Review — the candidate film, frame by frame

**Scope:** normal-motion choreography of the implemented direction (A). Reduced motion is covered in `TEST_RESULTS.md`.
**Evidence:** `motion/candidate-desktop-1440.mp4`, `motion/candidate-phone-393.mp4`, `motion/original-desktop-1440.mp4` (12 s human-paced scroll-throughs, same curve on both builds), `boards/07-motion-sequence-desktop-light.jpg` and `…-mobile-light.jpg` (one frame per second, original beside candidate), `boards/06-opening-light-up.jpg` (burst captures of the first 1.5 s), and the settled frames on boards 01–05 at p = 0, 0.12, 0.25, 0.40, 0.55, 0.70, 0.82, 0.90, 1.00 and at +160 / +420 / +720 / +1100 px past the release.

The recordings were driven by a time-based eased `scrollTo` (1.2 s hold, 12 s scroll through the film and 1.2 viewport past it, 2 s settle) so the two builds receive identical input. Headless Chromium in this container has no GPU; frame pacing in the videos is therefore conservative, not representative of a laptop, but the choreography and its order are exact.

---

## 1. The grammar (unchanged)

The film is a single GSAP timeline of unit length scrubbed to scroll with a 1 s catch-up (`scrub: 1.0`). Plane depth rides `ease: 'none'`; crossfades and light ride `sine.inOut`; the title's carve rides `power2.out`. Every move in the candidate uses one of those three eases and sits on that one timeline. There is still no second timeline, no per-frame listener, and no scroll-linked layout work.

## 2. Beat sheet

| Beat | Window | Original | Candidate | Reading |
|---|---|---|---|---|
| Arrival | t = 0 → 1.2 s, no scroll | The pin's dawn wash until the planes decode (~0.5–1 s warm cache here), then the valley at full exposure in one frame. Chip visible; cue rises 0.7→1.3 s. | `.cdesert-frame` settles from that same dawn wash: opacity 0→1, scale 1.045→1 on `cubic-bezier(0.22, 0.9, 0.26, 1)`, 1200 ms (`--dur-scene`); the planes arrive inside the fade. Chip and Skip present at t = 0. | The first frame now *lands* with the same settle grammar the rest of the film uses, and the decode pop is gone. The cue's rise sits inside the light-up, so the two read as one gesture. Board 06 (animation paused at exact times): ≈61% at 200 ms, ≈95% at 600 ms, at rest at 1200 ms, a front-loaded settle, not a slow fade; board 07 t = 0 s caught the mid-fade live. |
| Dolly + rise | p 0.00 → 0.845 | — | identical | Nothing was touched; the frame sequences on board 07 match beat for beat through second 8. |
| Gold lands | p 0.70 → 0.97 | rim-glow 0→0.85, vignette arc 0→1 | identical | — |
| Title carves | p 0.845 → 0.975 | blur 7→0, rise 5%, scaleX 1.03→1, opacity 0→1 | identical | — |
| **Floor melts** | **p 0.88 → 1.00** | — | veil opacity 0→1, `sine.inOut` | Starts under the carve, so the paper rises while the gold is still landing; by p = 1 the bottom ~25% (desktop) / ~30% (phone) of the frame is the page colour. The vignette's bottom corners are covered (the veil sits above the finish layer), which is why the release edge reads clean rather than darker at the corners. |
| **Credit rule** | **p 0.925 → 0.985** | — | scaleX 0→1 from centre, `power2.out` | A 48–88 px hairline draws under the mark after the mark has condensed (the carve's `power2.out` is ~90% complete at 0.925). |
| **Credit line** | **p 0.94 → 1.00** | — | opacity 0→1, yPercent 40→0, `power2.out` | Rises 40% of its own height (≈ 7 px) and fades up; lands with the timeline's end. Because it lives inside `.cdesert-title`, the parent's carve multiplies over it: it cannot appear before the mark. |
| Hold | p = 1.00 | mark holds | mark + credit hold; frame bottom is paper | The frame you are left on. |
| Release | +0 → +200 px | hard edge: dark floor against rail/canvas | canvas against canvas; a 120–200 px page-side fade carries into the hero wash | Board 07 seconds 9–11, and the +160 / +420 settled frames. |
| Landing pad | +200 → +900 px | hero wash blooms 0.5→1 (unchanged) | identical | The handoff bloom still "follows you in"; it now starts from paper instead of from a cut. |

## 3. Timing rationale

- **Why the veil starts at 0.88 and not later.** The carve runs 0.845→0.975. Starting the melt at 0.88 lets the paper rise *during* the title's condensation, so the landing is one composite gesture (gold up, paper up, mark in) instead of three sequential ones. Starting at 0.95 reads as an afterthought; starting at 0.80 competes with the rim-glow.
- **Why the credit waits until 0.925 / 0.94.** The mark must be legible and still before the credit speaks. At 0.925 the carve's blur is < 1 px and its rise is < 0.5%. The rule leads the line by 0.015 (≈ 38 px of scroll on desktop) so the eye is drawn to the spot before the words arrive.
- **Why 1200 ms for the light-up.** The film's own scene duration token. 900 ms (`--dur-reveal`) read as a web fade; 1200 ms reads as a projector reaching temperature. The cue's existing 700 ms delay was left exactly as is (PROTECT-66) and happens to land inside the window.
- **Why this curve.** `cubic-bezier(0.22, 0.9, 0.26, 1)` reaches ≈61% at 200 ms and ≈95% at 600 ms: the picture is present almost at once and the second half of the window is pure settle (the last 5% of opacity, the last 0.2% of scale). A symmetric or linear curve of the same length read as a slow web fade.
- **Why 4.5% scale, not more.** The frame's `transform-origin` is 50% 56% (just below centre, on the valley floor), so the settle reads as the camera dropping into its mark. 8% read as a zoom; 2% was invisible.

## 4. What the videos show that the stills do not

- The veil's rise is imperceptible as a *move*: the floor simply has less and less contrast with the page until there is no edge. That is the intended register (calm, weighted, never poppy).
- The credit's arrival is the one new *event* in the film, and it is small: a hairline, then two words of mono. It reads as a credit, not as UI.
- The release is the biggest difference between the two recordings. In the original the viewport snaps from film to page across a line; in the candidate the film's foot is already page, so the scroll-up reads as the same scene continuing.

## 5. Interaction with the surrounding choreography

- **Scroll cue:** retires one viewport before the release for motion users (existing geometry), i.e. around p ≈ 0.64 on desktop, so it is gone before the veil begins.
- **Skip intro:** persists until the hero identity is 75% visible; at p = 1 it sits on the page colour, which is a legibility improvement over dark rock.
- **Identity chip:** unchanged; retires when the content wrapper intersects.
- **Hero wash bloom:** unchanged; the page-side fade sits above it only within the first 120–200 px of the wrapper (the landing pad, never text).
- **Day→night world arc:** unchanged; still anchored to the content wrapper's top edge.
- **D5 breathe:** unchanged; the frame wrapper is a parent of the breathing groups and is never written by GSAP, so the two transforms compose and never fight.

## 6. Known motion residuals

- Over the desktop rail (left 280 px) the page is the rail's soft teal, so the release still shows a faint tonal step there; the main column is seamless. A rail-side treatment would touch shared navigation and was out of scope.
- The light-up means the largest plane's first non-zero paint is one animation frame after it decodes (opacity 0 → first non-zero frame). Perceived "image present" moves by at most ~0.3 s (≈61% at 200 ms) and often less, because the first part of the window overlaps the decode; the image *data* is on screen at the same moment, and the original's own first frames are the dawn wash too.
