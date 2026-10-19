# Creative Direction B — "The Plate" (editorial exit)

**Status:** `DESIGN_EXPLORED` · `VISUALLY_RENDERED` (prototype) · **NOT implemented** · `OWNER_REVIEW_PENDING`
**Evidence:** `boards/08-direction-b-the-plate-prototype.jpg` and `direction-b/<viewport>/*.png`. These are real Chromium renders of the real original build with prototype CSS/DOM injected at settled scroll positions (`harness/proto-b.mjs`). They prove composition, type and colour; the *motion between* the states is described here, not recorded.

---

## 1. Creative rationale

Direction A keeps the film cinematic to the last pixel and dissolves it into the page. Direction B makes the opposite bet: the film is a **photograph the page owns**. It opens full-bleed exactly as today, but as the gold lands the world contracts into a framed plate sitting on the page's own paper, with the credit set beneath it as a figure caption in the mono voice. When the pin releases, the plate simply scrolls up into the page as the first figure of a magazine spread. There is no seam because there is no edge: paper is on both sides.

It is the print logic the rest of the site already speaks (plates, ledgers, receipts, "prints like a book") applied to the one surface that has never used it.

## 2. What changes

| Beat | Treatment |
|---|---|
| **Opening** (two variants rendered) | *B1 "plate opener":* the valley opens as a plate at 90% with paper margins and a caption (`Fig. 00 · Monument valley, late light · SkyPi Studio · portfolio 2026`), then expands to full-bleed over the first ~15% of scroll as the dolly begins: the photograph becomes the world. *B2 "slate opener":* full-bleed as today, with a film-leader slate bottom-left (`SKYPI STUDIO · PORTFOLIO 2026 / SKYLER HALISKY · SENIOR TECHNICAL SUPPORT`) replacing the glass chip. |
| **The push** | Unchanged. |
| **The landing** | The wordmark carves as today. From p ≈ 0.92 the whole frame contracts (scale 1→0.86, origin 50% 46%) onto the page canvas with a hairline keyline; the caption resolves beneath: `Fig. 01 · The arrival wall, golden hour · SkyPi Studio is Skyler Halisky, senior technical support`. |
| **The release** | The plate scrolls up into the page as a figure. The hero follows as the next spread. |

## 3. What is preserved

All imagery, the timeline, the scroll budget, the chip (B1) or its replacement (B2), Skip intro, the cue. The wordmark still lands at the end and holds, but *as a plate*, not as the whole viewport.

## 4. Desktop treatment

See board 08, rows `land-plate` and `handoff`: the gold wall as an 86% plate on cream with a 1 px ink keyline, caption centred beneath in 11.5 px tracked mono, ink at 78% with the names at full ink. The handoff row shows the plate half-scrolled with the hero nameplate entering below: no seam exists.

## 5. Mobile treatment

The portrait plate at 86% leaves ~27 px side margins and ~60 px top/bottom; it reads correctly as a photo on a page. **The prototype's caption collides with the Skip intro control at 393 px** (visible on board 08, phone column): a real implementation would set the caption *above* the plate on phones, or stack it in two short lines left-aligned clear of the control. This is a solved layout problem, but it is unsolved in the prototype and is recorded as such.

## 6. Motion sequence

| p | What happens |
|---|---|
| 0.00 → 0.15 (B1 only) | Plate scale 0.90→1.00, margins close, caption fades out; the dolly is already running underneath. |
| 0.15 → 0.92 | Unchanged film. |
| 0.845 → 0.975 | Wordmark carves (unchanged). |
| 0.92 → 1.00 | Frame scale 1.00→0.86 (`power2.inOut`), pin background becomes canvas, keyline fades in, caption rises + fades in. |
| release | Gravity only; the plate is page content. |

Scrolling budget: the contraction overlaps the title carve, which is the one real choreography cost. Either the carve moves earlier (0.80→0.90) or the stage grows ~8% to give the exit its own beat. The owner's history on scroll length ("still too much scroll", r10) argues for moving the carve.

## 7. Recruiter-facing benefit

The caption states the relationship in a full sentence (`SkyPi Studio is Skyler Halisky, senior technical support`), which is stronger copy than Direction A's credit line and sits in the page's own typographic voice. The plate also makes the film feel *collected* rather than *played*: a reader who skips the motion still meets a finished object.

## 8. Technical complexity

Medium. A frame wrapper (as in A), a second scrubbed tween for the contraction, a pin-background swap keyed to progress, a caption element with its own show window, a phone-specific caption placement, and a retune of the title carve window. The identity contract requires that any body copy introducing SkyPi Studio make the Skyler relationship explicit in the same section: the caption does, so it is compliant, but it duplicates the hero's protected `SkyPi Studio is one person.` role and the support-first guard would need a ruling on a second relationship sentence.

## 9. Performance and accessibility implications

- Compositor only (scale + opacity), one more promoted layer than A during the last 8% of scroll.
- The caption is real text and *should* be in the accessibility tree (it is a figure caption, not a duplicate), which means the name is announced a third time on the homepage unless the chip retires from the tree too.
- Reduced motion: the static frame would simply be the plate with its caption, a very good RM destination.
- The scaled plate shrinks the wordmark by 14% on phones; it stays above 30 px at 393.

## 10. Why it was not chosen for implementation

1. It changes the owner-ratified ending (the wordmark as the *whole* frame you are left on) into a different kind of ending. That is a taste decision the owner should make from the renders, not one to pre-empt in code.
2. The mobile caption placement and the carve retime are two open design questions; A has none.
3. A fixes the same seam with a fraction of the surface area, keeps full-bleed immersion, and leaves every ratified number in the film untouched, which also keeps it compatible with the parallel reduced-motion engineering fix.

If the owner prefers B, it is a day's work on top of A's branch: the frame wrapper and the credit markup already exist, and the veil would be replaced by the contraction + caption.
