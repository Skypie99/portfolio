# Creative Direction A — "The Gold Lands, the Paper Rises"

**Status:** `DESIGN_EXPLORED` · `PROTOTYPE_IMPLEMENTED` · `VISUALLY_RENDERED` · `TESTS_PASSED` · `OWNER_REVIEW_PENDING` · `INTEGRATION_PENDING` · `NOT_DEPLOYED`
**This is the implemented direction.** Branch `claude/eloquent-planck-6yegy8`, based on `main` at `b3e992bddf31daa86a4d471b1c38ad47f45802e7`.
**Boards:** `boards/00-side-by-side-board.jpg` (the one-page view), then `01`–`07`. Direction B is on `08`.

---

## 1. Creative rationale

The film already does the hard thing well: one continuous camera push through one place, the light climbing from warm morning to golden hour, a fluted wall rising out of the valley floor, and a wordmark that condenses late and holds. Nothing in the body of that film needed rescuing, and this direction leaves it alone.

What it does not do, measured against the brief's four questions (who made this, what do they do, where is the work, and does it feel like one film), is **finish**. Three specific moments were weaker than the rest:

1. **The first frame is painted, not lit.** The eager planes decode and the valley simply appears. Every other move in the film is a settle; the opening was a switch.
2. **The frame you are left on says only "SkyPi Studio."** The Phase 03 blinded test found 3 of 3 reviewers unable to tell whether that was a person or an agency, and the fix lives one viewport later in the hero. The final frame of the film, the one a recruiter holds for a beat before scrolling on, carried no name and no role.
3. **The seam.** The instant the pin releases, the film's dark terracotta floor meets the page on a straight line: teal rail on the left, cream canvas on the right (see `boards/01…`, row "THE SEAM"). In light mode that is the single biggest luminance jump on the entire site, and it happens at the one moment the brief calls "a particularly important opportunity."

Direction A treats the film as a title sequence that needs a proper **arrival**, a proper **credit**, and a proper **dissolve into the next scene**. Three moves, all transform and opacity, all inside the existing GSAP master timeline or a single one-shot CSS keyframe.

## 2. What changes (the three moves)

| # | Move | Where | Mechanism |
|---|---|---|---|
| 1 | **The opening light-up.** The frame settles in from the pin's own warm dawn wash: opacity 0→1 with a 4.5% scale ease (1.045→1) over `--dur-scene` (1200 ms). | `.cdesert-frame` (new inner wrapper around everything the pin holds) | One CSS keyframe (`cdesert-arrive`), gated by `prefers-reduced-motion: no-preference`. Runs from first paint, before hydration. GSAP never writes to this element. |
| 2 | **The credit.** A 1 px rule draws from its centre under the wordmark (p 0.925→0.985), then `SKYLER HALISKY · SENIOR TECHNICAL SUPPORT` rises and fades up (p 0.94→1.0) in the mono eyebrow voice, bone over the darker floor band with the title's own halation recipe. Holds to p = 1 with the mark. | `.cdesert-credit` inside `.cdesert-title` | Two GSAP tweens on the existing master timeline. On phones (≤480 px) the line stacks as two lines, name over role, a film credit's own grammar. |
| 3 | **The veil (the handoff).** From p 0.88 the bottom of the frame melts into the page colour (`rgb(var(--rgb-canvas))`), so by p = 1 the frame's last pixels *are* the page. The page side answers with a short canvas→transparent fade over the hero's landing pad, so the hero wash resolves in rather than starting on a line. | `.cdesert-veil` (film side) · `.cinematic-content-reveal::before` (page side) | One GSAP opacity tween; a theme-aware gradient. In dark mode the same tokens sink the floor into the night canvas instead of paper. Sits above the grain/vignette so the bottom corners end clean. |

Copy added: exactly one line, `Skyler Halisky · Senior technical support`, the formal name the identity contract reserves for formal contexts and the primary role family it names. It is `aria-hidden`: the same string is already in the accessibility tree at first paint (runway chip) and one viewport later (hero nameplate).

## 3. What is preserved

- Every plate, every plane transform, the 380vh / 300vh scroll budgets, the one dissolve, the rise-to-fill cliff, the exposure and grade ramps, the rim-glow, the vignette arc, the D5 breathe, the title's position (58%), face, size, carve window and gilded ink. The body of the film is byte-identical in behaviour.
- The identity chip, the Scroll cue, the Skip intro control, their retirement geometry, the `#hero` anchor and its focus handling.
- The reduced-motion static frame renders the same destination shot, now with the credit resolved and the veil landed, so the RM seam is as soft as the live one.
- No new assets, no new dependency, no new listener, no second timeline. Homepage First Load JS is unchanged (172 kB); the route chunk grows 0.2 kB; the stylesheet grows 1.9 kB uncompressed.

## 4. Desktop treatment (1440×900)

`boards/01-desktop-light-film-and-handoff.jpg`, `boards/02-desktop-dark-film-and-handoff.jpg`.

- Opening: the chip and the Skip control are present instantly on the warm wash; the valley lights up under them over 1.2 s and the Scroll cue arrives inside that window (its existing 700 ms delay + 600 ms rise), so the three read as one settle.
- Landing: wordmark at 58% over the base of the wall, credit on the floor band beneath it, the bottom ~25% of the frame already paper (light) or night (dark). The Skip control now sits on the page colour rather than on dark rock.
- Seam: canvas meets canvas across the main column. Over the 280 px rail the page is the rail's soft teal, so a faint step remains there (documented in `BEFORE_AFTER_VISUAL_REVIEW.md` §Residuals). It is a fraction of the original's jump.

## 5. Mobile treatment (393×852, 360×740)

`boards/03-mobile-393-light.jpg`, `04-mobile-393-dark.jpg`, `05-small-phone-360.jpg`.

- The phone film is 300vh and uses the mobile plate tier; the three moves ride the same timeline, so the phone sees the same choreography at phone pacing.
- The credit stacks as two lines centred under the mark (11 px mono, 0.22 em tracking). Both lines clear the Skip control and the hamburger button by design: the title block sits at 58%, the controls at the frame's edges.
- The veil melts the bottom third of the portrait frame; the page-side fade covers the hero's 500 px landing pad, never text.

## 6. Motion sequence (desktop, p = progress through the pinned film)

| p / t | What happens |
|---|---|
| t = 0 → 1.2 s (no scroll) | `.cdesert-frame` settles in: opacity 0→1, scale 1.045→1, `cubic-bezier(0.22, 0.9, 0.26, 1)`. The cue rises at 0.7→1.3 s. |
| p 0.00 → 0.845 | Unchanged: dolly, rise, dissolve, exposure ramp, rim-glow (0.70→0.97), vignette arc (0.70→1.0). |
| p 0.845 → 0.975 | Unchanged: the wordmark carves (blur 7→0, rise 5%, scaleX 1.03→1). |
| **p 0.88 → 1.00** | **Veil opacity 0→1** (`sine.inOut`): the floor melts into the page colour. |
| **p 0.925 → 0.985** | **Credit rule scaleX 0→1** (`power2.out`). |
| **p 0.94 → 1.00** | **Credit line opacity 0→1, yPercent 40→0** (`power2.out`). |
| p 1.00 + release | The film scrolls up as a page element. Its last pixels are canvas; the content wrapper's first 120–200 px fade from canvas into the hero wash; the hero wash blooms as before. |

`MOTION_REVIEW.md` has the frame-by-frame reading.

## 7. Recruiter-facing benefit

- **Who / what, inside the signature frame.** The frame a visitor is most likely to pause on now carries the name and the primary role, in the same hierarchy the hero and the identity contract use (support first).
- **No dead stop between film and portfolio.** The hard cut at the seam was the moment the experience stopped feeling directed. It now reads as the gold sinking into the page the work sits on.
- **Nothing slower.** Skip intro is unchanged and visible at every point, including over the veil. The scroll budget is unchanged. The light-up delays no control: chip and Skip are present at t = 0.

## 8. Technical complexity

Low. Three files touched in the engine (`CinematicDesert.tsx`, `StaticDesertFrame.tsx`, `globals.css`) plus one test file. ~60 lines of CSS, ~40 lines of TSX. No new primitives. The one non-obvious engineering fact is recorded in the CSS: the promoted plane layers paint one device row past the pin's clip at the release edge, so the veil overshoots its box by 2 px to own that row (measured by probe, see `IMPLEMENTATION_REPORT.md`).

## 9. Performance and accessibility implications

- **Compositor only.** Two new full-frame layers (the frame wrapper and the veil); opacity/transform only; no layout or paint in the scroll path. The light-up is CSS and ends after 1.2 s.
- **LCP.** The light-up starts at opacity 0, so the largest plane's first non-zero paint is one animation frame later than before; the asset decode path is unchanged. Measured in this container, both builds show the pin's dawn wash for the first ~0.5–1 s while the planes decode, so most of the 1200 ms overlaps a window that was never image anyway (board 06, last rows).
- **Reduced motion.** The light-up is media-gated off; the live path never mounts under RM anyway. The static frame shows credit + veil at rest.
- **No JS.** The light-up still runs (CSS); the credit does not show without JS on the live markup (the mark does not either, as before); the hero below is rest-visible.
- **Contrast.** The credit uses the title's halation recipe; measured values are in `TEST_RESULTS.md` (sampled background inside the credit box at p = 1, both viewports).
- **Screen readers.** No new announcements; the credit is decorative by declaration because its text already exists twice in the tree.

## 10. Where the original is stronger

- The original's last frame is purer: a single mark over gold. The credit trades a little of that purity for the two facts a recruiter needs.
- The original's hard seam is honest in its way: a cut, not a dissolve. Someone who prefers cuts will prefer it.
- The original paints the first frame ~1 s sooner in perceived terms. The light-up is a deliberate trade of instant-image for intention.
