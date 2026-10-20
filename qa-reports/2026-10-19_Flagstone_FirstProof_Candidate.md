# Flagstone first proof candidate: the capture-fitted hero exhibit (2026-10-19)

The first product screenshot on `/work/flagstone/` (the Explore map inside the phone frame at the top of the case study) is re-presented as a deliberately sized exhibit. One Claude Code cloud session, no subagents. Production-intended implementation on an isolated candidate branch; **not** merged, not published, not deployed, and no pull request opened (per the brief).

| | |
|---|---|
| Branch | `claude/ecstatic-galileo-6nkhsx` (the session-assigned branch; created from `main`, verified to carry no unrelated changes before work began) |
| Starting commit | `b3e992bddf31daa86a4d471b1c38ad47f45802e7` (remote `main` at session start, the brief's "last verified main"; untouched) |
| Design inputs | The brief's summary of the earlier concepts (M-CON-003 A r2 at about 240px, B r2 at about 220px, a synthesis suggesting about 200px) and the independent mobile audit reading of about 156px inside a 329px figure at 393. None of those documents live in this repository; nothing was copied from them. |
| Parallel branches read, never merged | `claude/cloud-flagstone-version-a-20261018` (Release 1), `claude/cloud-rc2-home-landing-20261017` (Release 2), `claude/cloud-rc2-ve04-designstudy-20261018`; fetched read-only to document overlap (section 10) |
| Statuses | IMPLEMENTED · LINT_PASS · TYPECHECK_PASS · BUILD_PASS · TESTS_PASS (build-backed) · RENDERED · ACCESSIBILITY_CHECKED · OWNER_VISUAL_REVIEW_PENDING · INTEGRATION_PENDING · PUBLICATION_NOT_AUTHORIZED |
| Evidence | `flagstone-first-proof-20261019/` (baseline, candidates, selected renders, boards, measurements, recordings, the instruments) |

Every image under `flagstone-first-proof-20261019/` is a real Chromium render of the real page (Playwright, the pre-installed Chromium build). Baseline renders come from a production build of `main`; the selected renders come from this branch's production build (`npm run build`, `out/` served over loopback); the candidate comparisons were rendered on the same DOM with only the sizing values injected, so the three treatments differ in nothing but size. Every number quoted below is copied from `flagstone-first-proof-20261019/MEASUREMENTS.md`, which `tools/curate.py` wrote from the same runs.

---

## 1. The problem, measured

At 393 × 852 the shared hero mechanism (a 9/19 phone frame taking 90% of a 4/5 well's height) rendered the 1290 × 2803 Explore capture at **156.4 CSS px wide** inside the **329 px** figure: the phone was 53% of the column with 77 px of empty stage on each side, and because the frame's 9/19 proportion does not match the capture's 19.5:9 display, a 5.2 px "screen off" sliver showed above and below the screenshot. One point of the app's own interface rendered at 0.36 CSS px, so a 17pt label was 6.2 px tall. At 1280 × 800 the desktop column is narrow (sidebar plus the 200 px grid gutter) and the capture was only 177 px wide; at 1440 it was 220 px.

Baseline: `flagstone-first-proof-20261019/baseline/light_393x852_figure.jpg`, `.../baseline/light_393x852_frame.png`, `.../baseline/light_1440x900_section.jpg`.

## 2. Three treatments on the real page

| Treatment (393 × 852) | Screenshot width | Scale | px per UI pt | Phone frame | Well height | Figure height cost vs baseline | Document height |
|---|---|---|---|---|---|---|---|
| BASELINE (main) | 156.4 px | 0.121 | 0.36 | 174.4 × 368.3 | 411.2 px | 0 | 14717 |
| 200PX CANDIDATE (66% frame, 2/3 well) | 197.8 px | 0.153 | 0.46 | 215.8 × 447.8 | 493.5 px | +82 px | 14799 |
| 220PX CANDIDATE (72% frame, 5/8 well) | 217.4 px | 0.169 | 0.51 | 235.4 × 490.5 | 526.4 px | +115 px | 14832 |
| 240PX REFERENCE (78% frame, 4/7 well) | 237.0 px | 0.184 | 0.55 | 255.1 × 533.1 | 575.8 px | +165 px | 14881 |

Boards (whole figure, well plus plate, both themes): `boards/board_phone_light.jpg`, `boards/board_phone_dark.jpg`. The same report card at identical pixel scale, no resampling: `boards/legibility_light.png`, `boards/legibility_dark.png` (card 92 → 117 → 128 CSS px wide).

**Judgment, against the brief's criteria.**

- Recognition: all three read as the product immediately; the baseline reads as a map in a phone, the detail only on inspection.
- Interface detail: at 200 the card's title and button become legible as words; at 220 the severity line ("SEVERITY 3 OF 5 · MODERATE · VERIFIED"), the pin glyphs and the bottom nav labels also resolve; 240 adds little over 220 (one more 9% step) at 50 px more height.
- Breathing room: 220 keeps 47 px of golden-hour stage on each side and 18 px above and below the frame, so the phone still rests in the world; 240 leaves 37 px and the stage reads as a border rather than a room.
- Page height: 200 costs 82 px, 220 costs 115 px, 240 costs 165 px on a 14.7k px document; the hero section grows 5.1% at the selected size.
- Caption: all three keep the plate directly beneath; the selected build also tightens that gap (section 3).
- Consistency with the site: at 220 the phone is 235 px wide, the same size the desktop composition already presents at 1440 (238 px), so phone and desktop now share one proportion family; 240 would make the phone render larger than the desktop exhibit.

**Selected: the 220 treatment**, which is the earlier review's preferred B r2 direction, now confirmed on the actual layout. It is a noticeable step (the screenshot is 39% wider and 93% larger in area at 393) without being the largest option.

## 3. The selected implementation

The mechanism is scoped to the Flagstone hero at the call site; every other case study renders byte-identical markup (section 9).

- **Capture-fitted frame.** `ProductReveal` gains one hero-only prop, `frameWidth`, carrying Tailwind width utilities. When set, the device frame is sized by width instead of the well's height, its centring is unchanged, and its screen holds the capture's own aspect through one scoped stylesheet rule (`.pr-frame--fit-capture > .pr-screen-phone { flex: 0 0 auto; aspect-ratio: var(--pr-screen-aspect, 9 / 19.5) }`). The aspect comes from the capture's declared pixel size in `content/deliverables.json` (`heroShot.width` 1290, `heroShot.height` 2803, verified against the WebP header by a test), threaded through `heroMedia` and set inline as `--pr-screen-aspect`. The frame's height follows the image, so the letterbox slivers are gone at every width (0.0 px, from 3.2 to 6.4 px before).
- **Sizes.** `frameWidth="w-[72%] sm:w-[53%] lg:w-[58%]"`: 72% of the well below 640px (phones), today's 53% proportion from 640 to 1023 (large phones in landscape, tablets), 58% from 1024. The well reserves the height each needs: `aspect-[5/8] sm:aspect-[4/5] lg:aspect-[3/4]`. At lg the details column is the taller one, so the 3/4 well adds no page height on desktop; the section heights at 1280 and 1440 are unchanged (1477.66 and 1386.88 px).
- **The caption is the figure's caption.** When a deliverable carries a `heroPlate` (today only Flagstone) the well and the museum plate render as one `<figure>` with the plate as its `<figcaption>` (the `Plate` component gains an `as` prop; the homepage keeps its `<div>`). Below lg the plate sits 28 px under the frame (`gap-7`) instead of the 48 px grid gap that had left it equidistant from the frame and from the metadata hairline; at lg it stays at the measured 48 px, so the desktop composition is unchanged. The figure retires the UP-31 two-row grid machinery that existed only to seat a detached plate; the other five deliverables emit the same grid as before.
- **Nothing else moves.** Same capture file, same alt text, same eager `fetchpriority="high"` image with its AVIF source, same plinth glow, lamp, frame chrome and notch, same arrival settle (`.hero-settle-img`, `.pr-stone-settle`), same order of sections. No new motion, no new duration, no token changed (`duration-ramp` and `token-parity` guards pass).

Per viewport, selected build (light and dark are identical in geometry):

| Viewport | Screenshot | Scale (px per UI pt) | Phone frame | Well | Frame to plate | Section height (was) | Document (was) |
|---|---|---|---|---|---|---|---|
| 1440 × 900 | 240.7 × 522.9 (was 219.9) | 0.187 (0.56) | 258.7 × 540.9 | 448 × 597.3 | 48 | 1386.88 (1386.88) | 9851 (9851) |
| 1280 × 800 | 194.3 × 422.1 (was 177.2) | 0.151 (0.45) | 212.3 × 440.1 | 368 × 490.7 | 48 | 1477.66 (1477.66) | 9911 (9911) |
| 768 × 1024 | 205.7 × 446.9 (was 207.1) | 0.159 (0.48) | 223.7 × 464.9 | 424 × 530 | 28 | 1861.56 (1881.56) | 12796 (12816) |
| 393 × 852 | 217.4 × 472.5 (was 156.4) | 0.169 (0.51) | 235.4 × 490.5 | 329 × 526.4 | 28 | 1974.95 (1879.81) | 14812 (14717) |
| 375 × 667 | 204.5 × 444.3 (was 146.9) | 0.159 (0.48) | 222.5 × 462.3 | 311 × 497.6 | 28 | 1968.50 (1879.66) | 15070 (14981) |
| 320 × 568 | 164.9 × 358.3 (was 117.6) | 0.128 (0.38) | 182.9 × 376.3 | 256 × 409.6 | 28 | 2006.28 (1936.69) | 16179 (16109) |

Desktop before and after: `boards/board_desktop_light.jpg`, `boards/board_desktop_dark.jpg`. The three phone widths: `boards/board_widths_light.jpg`, `boards/board_widths_dark.jpg`.

## 4. Renders

For each of 1440 × 900, 1280 × 800, 768 × 1024, 393 × 852, 375 × 667 and 320 × 568, in both themes, `final/<theme>_<w>x<h>_*`:

- `_section.jpg`: the whole hero section (breadcrumb to tags), rendered with a viewport as tall as the section so the fixed world backdrop paints behind all of it, as it does while scrolling.
- `_arrival.jpg`: the true viewport at scroll 0, what a visitor first sees.
- `_figure.jpg`: the exhibit, well plus plate, at device scale 2.
- `_frame.png` / `_frame.jpg`: the framed phone close-up at device scale 2 (lossless at 393 in both themes).
- `_focus-appstore.jpg` (393 light, 393 dark, 1440 light): the keyboard focus ring on the pill directly above the figure.

Reduced motion: `final-rm/rm_<theme>_<viewport>_{figure,section}.jpg` (393 and 1440, both themes). No JavaScript: `final-nojs/nojs_<theme>_<viewport>_{figure,section}.jpg` (393 and 1440, both themes; `html.js` absent, image complete, plate present, geometry identical).

## 5. Legibility observations (honest)

- The capture is 1290 device px for a 430 pt screen, so one UI point renders at 3 × scale CSS px. At 393 that moves from 0.36 to 0.51 CSS px per point: a 17pt iOS label goes from about 6.2 to about 8.6 CSS px, a 20pt card title from about 7.3 to about 10.1 CSS px. At 320 the figure is still small (0.38 px per point) but 40% wider than before.
- What becomes legible at 393 on a device-scale-2 render: the card title, the severity line, the "Open details" button label, the "Explore" header and its "12 flags" chip, the bottom nav labels, and the photograph reads as a photograph of a sloped path with a railing. The description line inside the card is recognisable as two lines of text but not comfortably readable at 393; body copy in the app stays below the size a visitor would read on the site. No in-well treatment at phone width changes that, which is why the 240 option was not taken for legibility alone.
- Nothing is sharpened, cropped or regenerated. The site still serves the same 1290-px-wide AVIF/WebP, which the browser scales down; the screenshot is edge to edge inside the screen with no letterbox.

## 6. Accessibility checks

| Check | Result |
|---|---|
| Alt text | Unchanged: the real `<img>` carries the capture's alt ("Flagstone's Explore map with an expanded verified Steep grade report, …"), `loading="eager"`, `fetchpriority="high"`, AVIF source chosen by the browser (`final/measurements.json`, `imgContent`). |
| Semantics | The well and the plate are one `<figure>`; the plate is its `<figcaption>` (claim, caption, provenance, word-identical to before). Verified in the built HTML by `app/__tests__/flagstone-first-proof.test.ts`. |
| Reading order | Section order unchanged. The existing DOM order of the hero (well before the title block on phones, re-ordered visually by `order-*`) is pre-existing and not changed here; noted in section 11. |
| Keyboard | 393: Skip link → menu → The Work → Live demo → App Store → GitHub; the figure holds nothing focusable, so Tab passes straight from the pill above it to the links below. 1440: the sidebar rail, then the same sequence. Every stop matched `:focus-visible`. |
| Visible focus | The site ring (solid 2px rgb(185, 99, 64), 2px offset) on every stop; see `final/light_393x852_focus-appstore.jpg`. |
| Reduced motion | Geometry identical; the arrival keyframes are gated to `prefers-reduced-motion: no-preference` as before, so the figure renders at rest. |
| No JavaScript | Server HTML only (every `<script>` stripped, script requests aborted): same figure, same plate, same image. |
| axe-core (hero section, WCAG 2.x A/AA + best practice) | 0 violations in all 12 theme × viewport runs. 3 to 8 `color-contrast` checks per run return "incomplete" (axe cannot resolve text over the translucent world surface and gradients); that text is unchanged by this candidate. |
| Both themes | Rendered and measured for every viewport; the dark lamp pool and sig-tinted bezel carry over to the larger frame (`final/dark_393x852_figure.jpg`, `final/dark_1440x900_section.jpg`). |
| Horizontal overflow | `npm run check:overflow -- --widths 320,375,393,1280,1440` on the built branch: 270 frames (27 routes × 2 themes × 5 widths), non-vacuity plant caught on 270/270, no element crosses the viewport edge. The capture instrument's own element census also read 0 on every run. |

## 7. Motion

The hero's existing arrival (world fades and scales in over 900 ms; the flagship's 180 ms "stone laid" settle) runs on mount and does not affect the resting design, which is what every still above shows. Two normal-speed recordings of the built page: `final-video/light_1440x900.webm` (the figure is in the first viewport, so the settle is witnessed) and `final-video/light_393x852.webm` (the figure sits below the first screen; the recording scrolls to it at a human pace from 2.6 s). Real frames sampled from each: `final-video/light_1440x900_frames.jpg`, `final-video/light_393x852_frames.jpg`. No motion was added or retimed.

## 8. Test results

| Gate | Result |
|---|---|
| `npm run lint` | No ESLint warnings or errors |
| `npm run typecheck` | Pass |
| `npm run build` | Pass (28 static pages; prebuild asset validation and postbuild steps clean) |
| `npm test` after the build (as CI runs it) | 109 files, 971 passed, 2 skipped, 0 failed |
| New tests (15) | `components/__tests__/ProductReveal.test.tsx` (4: default placement untouched; `frameWidth` placement, no height/aspect class, capture aspect var, image contract; no dimensions → no var; inert on cards/shots). `components/__tests__/Plate.test.tsx` (2: `<div>` default, `<figcaption>` on request). `lib/__tests__/media.test.ts` (3: size threading, absent sizes, never for artwork). `app/__tests__/flagstone-first-proof.test.ts` (6: declared size equals the WebP header; Flagstone-only declaration; page scoping and figure; scoped stylesheet rule; built HTML: one capture-fitted frame inside the figure with the plate as figcaption; every other case study ships no capture-fitted frame and no hero figure). |
| Existing guards | None weakened. `flagstone-first-impression`, `recruiter-copy-truth` (source and rendered routes), `duration-ramp`, `token-parity`, `shot-dark-forwarding`, `shot-matte-forwarding`, `exhibitLamp`, `case-study-arrival-top`, `static-integrity` all pass. |

## 9. Regression proof for everything else

`tools/html-diff.py` compares this branch's `out/` with a production build of `main` at the starting commit, normalising only build ids, hashed asset paths and bundle module ids. Result: the rendered markup of `/`, `/work/`, `/about/`, `/work/claude-corp/`, `/work/dashboard/`, `/work/ghost-code/` and `/work/prompt-library/` is **identical**; only bundle plumbing inside `<script>` and `<link>` differs, as it does on every rebuild. `/work/flagstone/` differs in exactly the intended places: the grid class, the `<figure>`, the well's aspect classes, the frame's placement classes and `--pr-screen-aspect`, and the `<figcaption>`.

## 10. Parallel release safety and integration

Nothing from Releases 1 to 3 was merged, cherry-picked or copied, and `main` was not touched.

**Release 1, Flagstone Version A (`claude/cloud-flagstone-version-a-20261018`).** Different surface (the three-panel proof row inside the body) but three shared files:

| File | Version A touches | This candidate touches | Expected merge |
|---|---|---|---|
| `app/work/[slug]/page.tsx` | `CaseProof` (about lines 221 to 370) and the body column class (about line 1006) | the `heroWell` const before the return (about lines 520 to 580) and the hero grid (about lines 653 to 720) | separate hunks, no overlap; the first-impression guard strings are kept verbatim |
| `app/globals.css` | a new block after the VE04 rules (about line 1468) | one rule after `.pr-screen-phone` (about line 1782) | separate regions |
| `content/deliverables.json` | `shots[0].video.autoplay: false` | `heroShot.width` / `heroShot.height` | same object, different lines; verify both survive |
| `qa-reports/INDEX.md` | regenerated | regenerated | conflict expected: take either side, stage, run `npm run qa:index` |

`components/ProductReveal.tsx`, `components/Plate.tsx`, `lib/media.ts` and the new tests are not touched by Version A. The proof row's `ShotProductReveal` call site and its arrival edge are untouched here.

**Release 2, homepage (`claude/cloud-rc2-home-landing-20261017`)** touches `app/page.tsx`, `components/Hero.tsx`, `components/Receipt.tsx` and their tests; none are touched here. `Plate` and `ProductReveal` gained optional props with unchanged defaults, and the homepage markup is identical (section 9).

**Release 3, cinematic:** `components/cinematic/**` and the `.cdesert-*` rules are untouched.

**Suggested integration order:** land Releases 1 to 3, then merge this branch (one commit); resolve `qa-reports/INDEX.md` by regenerating; confirm `content/deliverables.json` carries both Version A's `autoplay` and this branch's `width`/`height`; run `npm run typecheck && npm run lint && npm run build && npm test`, then `PLAYWRIGHT_CHROMIUM_EXECUTABLE=<chromium> npm run check:overflow -- --widths 320,375,393,1280,1440`; optionally re-run `flagstone-first-proof-20261019/tools/capture.mjs` against the merged build for a final receipt.

**Homepage flagship treatment, prepared but not applied** (the brief does not authorise homepage changes; `app/page.tsx` is unmodified). The Flagship Room renders the same `HeroProductReveal`, so the same exhibit is one call-site change there: pass `frameWidth` on the homepage `HeroProductReveal` (about line 622) and give its `HeroImageSettle` well a matching aspect, then retire `#flagship .pr-frame-phone { height: 100% }` (`app/globals.css`, about line 4146), whose job the width-driven frame takes over. The capture size already flows through `heroMedia`, so no data change is needed.

## 11. Remaining limitations

- Phone-width legibility is better, not solved: app body copy stays under about 9 CSS px at 393 and under about 7 at 320. A larger in-well phone would not fix that and would crowd the stage; a real fix would be a different exhibit (a close-up detail), which is outside this brief.
- The exhibit's well is taller on phones (+115 px at 393, +109 at 375, +90 at 320).
- Between 480 and 639 px the 72% frame applies to a wider column (a 580-px-wide portrait tablet would render a 414-px frame in a 920-px well). Such widths are rare in portrait and the layout does not break (overflow census clean), but it is the one band where the treatment is generous rather than tuned.
- At 640 to 1023 the phone keeps today's proportion; only the letterbox removal and the 28 px caption gap apply there.
- The hero's DOM order on phones (image before the title, re-ordered visually) is pre-existing and unchanged.
- Rendering was Chromium only, at device scale 2 and simulated viewports; no WebKit/Safari or physical device run was possible in this environment.
- The candidate comparisons were rendered on `next dev` with injected sizing (same DOM, same CSS mechanism); the baseline and the selected implementation are production builds.
- axe's `color-contrast` checks over the gradient surfaces remain "incomplete", as they were before.

## 12. Recommended next action

Owner visual review of the built branch on a real phone (a 393-class iPhone in Safari, both themes) using the renders in `flagstone-first-proof-20261019/` as the reference, with particular attention to the 393 and 320 figures and the 28 px caption gap. If approved: integrate after Releases 1 to 3 as described in section 10 and re-receipt; consider the homepage opt-in as a separate, authorised homepage change.
