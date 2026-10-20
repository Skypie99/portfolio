# Release 6 · Editorial flow and signature finish · owner review

**Date:** 2026-10-20 · **Branch:** `claude/stoic-fermat-r3s6vx` · **Baseline:** main `f29ce93b781372418cfe9d0e01ac17850a34b70e` (the latest successful Deploy, run 187) · **Final source commit:** `9198291` (the review folder follows it as the branch head) · **Deployed:** no

| Package | Surfaces | Status |
|---|---|---|
| R6-A · project browsing | `/work/` wall · home `#work` index | PROTOTYPED · BUILD_VERIFIED · RENDERED · OWNER_VISUAL_REVIEW_PENDING · FINAL_INTEGRATION_PENDING · NOT_DEPLOYED |
| R6-B · reading rhythm and motion | the same two surfaces, plus one Record line | PROTOTYPED · BUILD_VERIFIED · RENDERED · OWNER_VISUAL_REVIEW_PENDING · FINAL_INTEGRATION_PENDING · NOT_DEPLOYED |
| R6-C · day/night turn | the dusk-turn | BASELINE RETAINED (compared, documented, no commit) |

This is a working candidate on an isolated branch for the owner's visual review. It is not acceptance, not a release, and nothing here calls its own review independent. No pull request was opened; nothing was merged or deployed; main and every other branch are untouched.

## 1. Start here

| What | Where |
|---|---|
| Before/after boards, matched viewport, theme, scroll state and DPR (eight) | `boards/*.jpg` (before = main `f29ce93`, after = this branch at the final commit) |
| Normal-speed recordings: the home index arrival before and after, the wall arrival before and after, the phone index arrival, and the dusk-turn both ways | `motion/before/*.mp4`, `motion/after/*.mp4`, `motion/theme-turn/*.mp4` |
| Dense contact sheets cut from those recordings at matched times (read the motion frame by frame) | `motion/sheets/*.jpg` |
| Reduced-motion first paint vs settled, and no-JavaScript, for both surfaces, both themes, desktop and phone | `modes/*.jpg`, `modes/report.json` |
| axe-core, rendered-pixel contrast of every touched text, and the keyboard/pointer journey log with focus screenshots | `a11y/axe.json`, `a11y/contrast.json`, `a11y/journey/journey.json` + `*.jpg` |
| Boundary probes: 320, 375, 768, 1280x800, 720x450 at DPR 2 (1440 at 200% zoom), 852x393 landscape and 1920x1200 at DPR 2 in both themes, and text-only 200% enlargement | `after/boundaries/*.jpg`, `after/zoom-text/*.jpg` |
| The raw primary captures the boards are cut from | `baseline/`, `after/` |
| Scope note written before implementation, and the per-commit checkpoint record | `SCOPE.md`, `CHECKPOINTS.md` |
| The instruments (each documents its command line), and the one script that rebuilds all of this | `tools/*.mjs`, `tools/run-all.sh` |

Every capture is a genuine headless-Chromium render of the built export served over loopback. Nothing in this folder is a mockup. The only annotated images are the boards (a label strip) and the contact sheets (time stamps). The time-dilated dusk-turn sheets are instrumentation and say so in their title.

## 2. Baseline and isolation

- `origin/main` was fetched at the start of the session and read `f29ce93b781372418cfe9d0e01ac17850a34b70e`; the GitHub Actions Deploy history shows run 187 published that exact commit. The session branch started at it with no divergence.
- Release 5 (`origin/claude/inspiring-pascal-p12cfr` at `dfddbdd916eb43f4cc266774df03257aea69b228`) was re-checked at the start and again at handoff: it is **not on main** (its merge-base with main is `f08c327`, before Release 4) and no PR for it exists. It was read only. Nothing from it is imported, re-implemented or merged here, and none of its files are edited (section 8).
- Protected surfaces listed in the brief were not edited: the cinematic, Hero/ContentReveal, Skip Intro, the flagship room, support lanes, the Record's facts and order, How-the-work-gets-made, About, Contact, Flagstone's case study, Release 5's chapters and heroes, the Release 4 buttons and pressed dots, Float, Tokyo, `/runway/`, `/archive/`, global tokens, dependencies, workflows.

## 3. The three most noticeable improvements

**1. The wall plate reads in catalogue order** (`/work/`). Before, the copy column read numeral, two meta lines, then the title; the title was the third thing a reader met, the status wrapped `Sept / 2026` on a phone, and the one-line description ran to about 84 characters a line on the Flagstone row. Now it reads title, the one line (held to the index's 460 px measure), then the facts (status, verified), then the invitation row, with the numeral as the title's label in legible ink. The status breaks only at its interpuncts. Boards: `work-light-1440x900@1-plate-01`, `-plate-02`, `work-dark-1440x900@1-plate-01`, `work-light-393x852@2-plate-01`.

**2. The home index has a phone stack authored for its width.** At `lg` the three columns are unchanged except that the status column no longer breaks a clause (`PRIVATE OPERATOR APP ·` now breaks before `PUBLIC SYNTHETIC DEMO`, where it used to break after `PUBLIC`). Below `lg` the same DOM is laid over a two-column grid: the year sits on the title line at the right edge, where it already lives at `lg`; the facts read before the doorway; the doorway closes the entry. Before, the year trailed a wrapping status and landed alone on its own line on three of five phone rows. No word, size, colour or control changed; the Release 4 pill is the same component with no new props. Boards: `home-work-light-1440x900@1-section`, `home-work-dark-1440x900@1-section`, `home-work-light-393x852@2-section`, `home-work-dark-393x852@2-section`.

**3. The heading and its rows arrive as one reading group.** Measured at 1440x900 with the same scripted glide on both builds (probe times in `motion/*/home-work-light-1440x900.json`), before: the index heading ran the 1200 ms scene clock and completed at 1673 ms, 102 ms *after* its first row (1571 ms); the last row in view completed at 2395 ms. After: heading and rows share the existing 560 ms settle rung and the existing settle easing, the heading leads and completes at 1224 ms, 228 ms *before* its first row (1452 ms); every row completes 120 to 220 ms sooner (1615, 1871, 2173 ms); nothing pops (16 px of travel instead of 22 to 28). On the wall the first plate reaches rest about 0.36 s after it starts instead of 0.65 s (891 − 528 ms vs 1025 − 379 ms, `motion/*/work-arrival-light-1440x900.json`), inside the title band's own settle, and later plates no longer wait up to 240 ms after entering view. The phone (`motion/after/home-work-light-393x852.*`) shows the same group at 393: heading 1288 ms, then the rows as they enter. A keyboard reader who Tabs into a still-armed row now sees it at rest at once. Recordings: `motion/before` vs `motion/after`; sheets: `motion/sheets/home-before.jpg` vs `home-after.jpg`, `work-arrival-before.jpg` vs `work-arrival-after.jpg`.

Grouped craft fixes, not signature moments: the Record's open-round counts no longer split `axe 0 / violations` on a phone; the home index's decorative gold wash runs at half strength in dark mode so every index text clears 4.5:1 at its worst pixel (section 7.4); the wall numeral carries /65 ink instead of /30 (1.8:1 before, never 3:1 in either theme). Two defects of my own first candidate, found by the text-only 200% probe and fixed before handoff: the clause hold now releases by width (a container query in em of the line) instead of trusting a character count, and a title word wider than its cell breaks instead of running under the year.

## 4. What changed

Source, eight files; the review folder is the rest.

| File | Change |
|---|---|
| `components/CaseStudyCard.tsx` | New opt-in `editorial` prop: catalogue order (title, line, facts, actions), the 460 px description measure, ClauseBound status on a width-aware line, /65 numeral. The default path renders class for class as before for the case-study and blog "Other work" cards. |
| `components/GalleryWall.tsx` | Passes `editorial`; the reading-group class on its root; plates after the first pair arrive on their own clock (`index={Math.min(i, 1)}`, was `Math.min(i, 3)`). |
| `app/page.tsx` | The `#work` rows: grid below `lg` through the house `contents` idiom (DOM order unchanged), ClauseBound on status, note and the Record's open-round counts (each line a size container), `break-words` on the row title, the reading-group class on the band, rows start one stagger step behind the heading, the band's wash at `dark:opacity-50`. No other section touched. |
| `components/readingGroup.module.css` (new, 61 lines) | The scoped clock, travel and keyboard-focus floor for exactly two consumers. Consumes existing tokens only; adds none. |
| `lib/clauses.ts` (new) + `components/ClauseBound.tsx` (new) + `components/clauseBound.module.css` (new) | Splits an interpunct status into clauses and holds each clause of 24 characters or fewer on one line; longer clauses wrap normally (UP-14's overflow finding is the reason for the cap). The hold is released by a container query once the line is narrower than 17.5em of its own font-size, so text-only enlargement and tiny viewports fall back to word wrapping instead of overflowing. Visible characters byte-identical. |
| `lib/__tests__/clauses.test.ts` (new) | Round-trip, guard, "every shipped status holds its year", and the module's release-by-width shape. |

Not changed: `app/globals.css`, `tailwind.config.ts`, `lib/motion.ts`, `components/Reveal.tsx`, `components/ThemeToggle.tsx`, `components/ProjectDoorwayButton.tsx`, `components/ProductReveal.tsx`, `lib/schema.ts`, every `app/work/[slug]/*`, `CaseShowcase*`, content and media files, dependencies, workflows.

### Separately reviewable commits

| Commit | Package |
|---|---|
| `280de42` | R6-A: catalogue order on the wall and a phone-authored work index |
| `3d5ea10` | R6-B: the work heading and its rows arrive as one reading group |
| `c4c3041` | R6-A/B floors: keyboard focus floor, numeral ink, dark wash, all measured |
| `9198291` | R6-A: the clause hold releases by width; a title word wider than its cell breaks (both found by the text-only 200% probe) |
| `branch head` | this review folder |

Each commit was typechecked, linted on its files and run against the guards that pin its surfaces before it was recorded (`CHECKPOINTS.md`).

## 5. R6-C · the dusk-turn: compared and retained

Both legs were recorded on `/work/` with the first plate's text in view, real time and, as instrumentation, with the pseudo-element animations dilated ten times so the keyframe structure can be read (`motion/theme-turn/`, `motion/sheets/turn-*.jpg`). What the recordings show: the room you leave thins, the site's own dusk (indigo, wine, ember, night) or dawn (cream, sun, peach, sandstone) ramp is uncovered, and the destination room resolves over it. The mechanics all hold on this branch: the marker is written inside the callback and released after both legs and after a rapid double toggle; the choice persists; `color-scheme` follows; focus stays on the control; the scroll position and the route do not move; the themed showcase twins swap.

Two honest limits. First, headless software rendering stretches the sky-only hold and lands the incoming room abruptly (in the real-time clips the hold reads as roughly 250 to 350 ms rather than the authored 68 ms); I cannot separate that from the environment, so I make no claim about how the turn times on a Mac. Second, the authored hold is pinned by `lib/__tests__/dusk-turn.test.ts` ("the room you leave is fully gone before the room you enter begins", a window of at least 10%), so a hold-free alternative would require changing a protected guard, which this release does not do. The historical 360 ms candidate would also need a theme-only duration, and `duration-ramp.test.ts` pins the ramp to exactly its named rungs. With no demonstrable improvement available inside those bounds, the baseline is the stronger result and is retained unchanged. Owner decision 2 records the one real alternative.

## 6. Accessibility and reading-order notes

- DOM order is unchanged on both surfaces. On the phone index the visual order (title, year, summary, facts, doorway) now differs from the DOM order (title, summary, doorway, facts, year) in two places: the year is drawn beside the title, and the facts are drawn above the doorway. The doorway is `tabIndex={-1}`, so keyboard order is title, then the row's facts link where one exists, exactly as drawn. Screen-reader order is the same as today's.
- The `Featured: above` link keeps its stretched 44 px target; the pill keeps its 44 px height, dot, press and focus states; the wall's action row keeps its one-sided 44 px extensions (TapTargets guard green).
- Real `<time>` elements, aria-labels and the "View project" vocabulary are untouched; the clause spans add no characters and no roles.
- Wording review by destination: every index and wall invitation to a case study is the locked "View project →" with an aria-label that says "case study"; every external link carries ↗ and opens in a new tab. No label was changed and none is proposed.

## 7. Checks

Environment: Linux 6.18 container, 4 vCPU, Node 22.22, Next 15, Playwright Chromium 141 (`playwright-core` 1.62.1, headless, software rendering, video at about 25 fps), sharp, ffmpeg 6.1, axe-core 4.11.4. No WebKit build is installed in this container, so WebKit was not run.

### 7.1 Build, tests, lint

| Check | Result |
|---|---|
| `npm run typecheck` | clean |
| `npm run lint` (next lint + jsx-a11y) | no warnings or errors |
| `npm run build` (static export, prebuild asset validation, postbuild prune/alias) | clean; First Load JS unchanged at 173 kB for `/` and 125 kB for `/work` (route chunk 3.88 kB → 4.17 kB); built CSS +849 bytes (the scoped module); home HTML +4.8 kB and `/work/` +0.8 kB (clause spans, grid classes) |
| `npm test` with `out/` present (the build-dependent static-integrity and section-nav guards run, as in CI) | 121 files, 1087 tests passed, 2 skipped (the same two skips as main), 0 failed, on the final commit |
| Focused guards re-run after each package: GalleryWall (DOM + SSR floor), CaseStudyCard, TapTargets, returnFocus wiring, homepage project links / numeral contrast / featured link / dates, Flagstone CTA parity, support-first hierarchy, recruiter copy truth, duration ramp, token parity, print reveal visibility, dusk-turn, ThemeToggle, clauses | all green |
| House overflow census (`npm run check:overflow -- --widths 320,375,414`; 27 routes × 2 themes × 3 widths = 162 frames; `a11y/overflow-census.txt`) | no element crosses the viewport edge; the non-vacuity plant was caught on 162/162 frames. Needs `PLAYWRIGHT_CHROMIUM_EXECUTABLE` pointed at the container's Chromium build, since the script's version-matched lookup does not find it here. |

### 7.2 Reduced motion and no JavaScript (`modes/report.json`)

| Surface | Theme | Size | Differing pixels, 120 ms vs 1600 ms | Reveals off rest | Running animations | No-JS: reveals hidden |
|---|---|---|---|---|---|---|
| `/work/` wall | light | 1440x900 | 0 | 0 / 5 | 0 | 0 / 5 |
| `/work/` wall | light | 393x852 @2 | 0 | 0 / 5 | 0 | 0 / 5 |
| `/work/` wall | dark | 1440x900 | 0 | 0 / 5 | 0 | 0 / 5 |
| `/work/` wall | dark | 393x852 @2 | 0 | 0 / 5 | 0 | 0 / 5 |
| home `#work` | light | 1440x900 | 0 (an earlier run on the previous build read 201 pixels here, all in the sidebar rail's current-section marker at x 57 to 124, y 441 to 455, none inside `#work`) | 0 / 6 | 0 | 0 / 6 |
| home `#work` | light | 393x852 @2 | 0 | 0 / 6 | 0 | 0 / 6 |
| home `#work` | dark | 1440x900 | 0 | 0 / 6 | 0 | 0 / 6 |
| home `#work` | dark | 393x852 @2 | 0 | 0 / 6 | 0 | 0 / 6 |

In an earlier run on the previous build the dark wall at 1440 differed by 74,616 pixels between the two reduced-motion captures; the diff image (`modes/work-dark-1440x900@1-rm-diff-previous-build.jpg`, red = differing) places every one of them inside the first plate's image well (x 312 to 857, y 492 to 880): the capture decoding from its blur placeholder, not motion. Under no JavaScript the `html.js` class is absent and every reveal rests visible at first paint on both surfaces.

### 7.3 axe-core (`a11y/axe.json`)

| Surface | Theme | Size | Violations (page) | Violations (surface) | Needs review |
|---|---|---|---|---|---|
| `/work/` | light | 1440x900 | 0 | 0 | color-contrast × 79 nodes |
| `/work/` | light | 393x852 @2 | 0 | 0 | color-contrast × 78 |
| `/work/` | dark | 1440x900 | 0 | 0 | color-contrast × 79 |
| `/work/` | dark | 393x852 @2 | 0 | 0 | color-contrast × 78 |
| `/` (`#work` scoped) | light | 1440x900 | 0 | 0 | color-contrast × 159 |
| `/` (`#work` scoped) | light | 393x852 @2 | 0 | 0 | color-contrast × 161 |
| `/` (`#work` scoped) | dark | 1440x900 | 0 | 0 | color-contrast × 159 |
| `/` (`#work` scoped) | dark | 393x852 @2 | 0 | 0 | color-contrast × 161 |

"Needs review" is axe declining to compute contrast over gradients, translucent panels and backdrop filters, which is most of this site; that is exactly the gap the rendered-pixel probe below closes for the touched text.

### 7.4 Rendered contrast (`a11y/contrast.json`)

Each probe reads the element's computed colour, hides its glyphs, screenshots its box and reports the ratio against the worst backdrop pixel under the text (so gradients, glass and washes count), with the median for context. Thresholds: 4.5:1 for text under 24 px, 3:1 for larger text.

**Final build: 64 probes (16 texts × both themes × desktop and phone), 0 below threshold.** The tightest passes: index status row 03 at 393 dark 4.67:1; index numeral at 393 light 4.70:1; wall facts at 1440 dark 4.70:1; index summary at 393 dark 4.70:1; the `Featured: above` link at 393 dark 4.74:1. Everything in light mode on the wall reads 4.9:1 or better for small text and 10.7:1 or better for titles.

How the candidate compares with the baseline on the same probes, dark theme (the light theme passed everywhere on both):

| Probe | Baseline (main) | Candidate |
|---|---|---|
| Wall status, plate 01, 1440 | 4.70 | 4.70 |
| Wall status, plate 03 (right-hung), 1440 | **2.62** | 5.21 |
| Wall status, plate 01, 393 | **3.65** | 4.85 |
| Wall verified line, 393 | **3.94** | 4.88 |
| Wall status, plate 03, 393 | **2.03** | 4.79 |
| Wall numeral (large text, 3:1 bar), 1440 / 393 | **2.09 / 1.89** | 4.69 / 3.81 |
| Index summary, 1440 / 393 | **3.94 / 3.90** | 5.12 / 4.94 |
| Index status, 393 | **4.17** | 5.85 |
| Index numeral, 393 | 4.36 (same markup, same dip) | 5.11 |
| Index `Featured: above` link, 393 | passed in its old position | 5.00 (it moved into the wash's brightest spot, 3.81, before the wash was halved) |

Why the baseline dips: the wall's facts sat under the glass card's warm caustic (its brightest corner), and the home index's gold wash lifts the night world under row 01 to about rgb(100 85 72), brighter than the plain panels the ink tokens are pinned against in `ink-contrast.test.ts`. Moving the facts below the description and halving that wash in dark mode are what close them. `a11y/contrast.json` holds the candidate's rows; `a11y/contrast-baseline-dark.json` holds the baseline's dark rows, measured with the same tool on the main export.

### 7.5 The journey (`a11y/journey/journey.json`)

Keyboard and pointer, 1440x900, light, on the final build; nothing was sent.

- **Direct entry at `/#work`** (the hero CTA's destination): the section opens seated with the heading and rows 01 to 04 visible; row 05 sits at 1153 px, below the 1080 px seating band, and reveals on scroll as designed (same as main).
- **Tab walk from row 01:** five titles plus the `Featured: above` link, each with a visible ring, each at full opacity when focus lands. Row 05 was faint under focus on main and on the first candidate build; the focus floor closes it. The next three stops (the Record's `the record`, `the account`, `the statement`) are still faint when focus lands: outside this release's surfaces, pre-existing, and owner decision 1.
- **Enter on row 02 → `/work/claude-corp/` → Back:** scroll restored to the same position (6316 → 6316) and focus reseated on the row 02 title at opacity 1 with its ring (on main the reseated row was still at 0.99 opacity when focus landed).
- **Pointer on the wall:** plate 03's title opens `/work/dashboard/`; Back restores the same position (1177 → 1177), holds it for 3 s with no input, the wall shows `data-wall-seen` and no plate replays (0 hidden).
- **Theme while scrolled on `/work/`:** both legs keep the URL and the scroll position (1177), persist the choice, release the marker. A rapid double toggle leaves no marker. Note: a second real click inside the 420 ms turn is taken by the view-transition pseudo tree and does not register (platform behaviour, identical on main); the dedicated theme tool, which waits for the control to be hittable, registers both clicks of its rapid pair and ends where it started.
- **Keyboard to the contact action from the top of the document:** six stops (skip link, name, theme toggle, featured link, notes link, `Write to me.`), the last focus-visible and at full opacity.
- **Page errors:** 0 throughout.

An earlier journey run reported a scroll jump after a second theme toggle. It was reproduced as a harness artifact (Playwright's click retried with `scrollIntoView` on the sticky sidebar after the first attempt found the control covered by the still-open view-transition pseudo tree) and does not occur with a paced or coordinate click on either build; the back-toggle probe sampled the scroll position at 50 ms through three toggles after a Back navigation and it never moved.

### 7.6 Boundary probes

All captured on the final build (`after/boundaries`, `after/zoom-text`), light theme unless noted; nothing overflows or truncates.

| Probe | What the capture shows |
|---|---|
| 320x568 @2 phone | Index: year on the title line; `Claude Corp Dashboard` wraps to two lines with the year on the first; statuses break only at interpuncts. Wall: title, line, facts (`On the App Store ·` / `US and Canada · Sept 2026`), actions wrap to two lines as before. |
| 375x667 @2 short phone | As 320 with every title on one line. |
| 768x1024 @2 tablet (the `md` band) | Wall: media 2/5 left, copy right in catalogue order; actions wrap to two lines as on main. Index: the phone grid (below `lg`). |
| 852x393 @2 landscape phone | Index: phone grid at a wider measure, year on the title line. Wall: phone stack. |
| 1280x800 laptop | Index: three columns; status column breaks at clauses only. Wall as 1440. |
| 1920x1200 @2, both themes | Crisp at DPR 2; the /65 numeral reads as the title's label; no rendering artefact on the glass, rules or hairlines. |
| 720x450 @2 (1440x900 at 200% browser zoom) | The `sm` layout: readable, no horizontal scroll. |
| Text-only 200% (root font-size doubled), 1440 and 393 | Type scales, boxes follow. This probe caught two defects in the first candidate at 393: a held clause ran past the page edge (`PUBLIC SYNTHETI|`) and the year was drawn over a title word that could not break. On the final build the hold releases (the status wraps word by word) and the word breaks; nothing clips or overlaps (`after/zoom-text`). The equivalent viewport is about 196 CSS px, below the 320 px floor the layout is designed for, so the result is readable rather than composed. |

### 7.7 Performance and bundle

Measured in this container only, relative between the two builds (`a11y/perf-before.json`, `a11y/perf-after.json`):

| | Baseline | Candidate |
|---|---|---|
| CLS through load + scroll-through, `/work/` | 0 (one 0.00001 shift from the theme toggle label mounting) | 0 (same single shift) |
| CLS through load + scroll-through, `/` to `#work` | 0 (same) | 0 (same) |
| Elements with a transform/opacity transition inside the surface | 25 wall · 6 index | 25 wall · 6 index |
| `will-change` declarations inside the surface | 0 · 0 | 0 · 0 |
| `backdrop-filter` surfaces | 5 wall (the glass cards) · 0 index | 5 · 0 |
| DOM nodes inside the surface | 275 wall · 92 index | 285 · 107 (clause spans, the pill's grid wrapper) |
| First Load JS | 173 kB `/` · 125 kB `/work` | unchanged |

No new animated property, no new blurred or transformed full-viewport surface, no persistent `will-change`. Long-task counts varied with the container's load between runs and are not reported as a result. Frame rate, INP and device smoothness were not measured: headless software rendering cannot speak for them.

### 7.8 Not verified here

Real Safari and Firefox, VoiceOver, a physical phone's touch and scroll feel, GPU compositing of the dusk-turn, and the recordings' frame timing beyond what a software-rendered headless Chromium produces. A Linux headless run cannot close those gates; they are the owner's and MiMo's device pass.

## 8. Release 5 reconciliation (for MiMo)

- **Files:** zero overlap. Release 5 touches `app/work/[slug]/page.tsx`, `components/CaseShowcase.tsx`, `components/ShowcaseHero.tsx`, `components/caseShowcase.module.css`, `lib/caseShowcase.ts`, `lib/schema.ts` (one export), its test and its images. Release 6 touches none of those; Release 5 touches none of Release 6's seven files. A merge in either order applies cleanly by diff (checked with `git merge-tree` at handoff: the only conflicting path is the generated `qa-reports/INDEX.md`, which both branches regenerate; resolve it by running `npm run qa:index` after the merge).
- **Runtime seam to re-verify after both land:** Release 5's four case studies render `CaseStudyCard` in their "Other work" band without the new `editorial` prop, so they keep today's card order by construction; open one of the four and confirm the "Other work" cards still read status above title with the /30 ghost numeral, and that `/work/` reads title first. Also confirm `lib/__tests__/clauses.test.ts` still passes once Release 5's `lib/schema.ts` export lands (it reads deliverables through `getDeliverables()` only).
- **Order:** no dependency either way. If Release 5 integrates first, rebase or merge this branch onto the new main and re-run `npm run build && npm test`; nothing in this folder needs regenerating for that, but `tools/run-all.sh` rebuilds it in one command if a fresh board is wanted.
- **Not done here on purpose:** no combined acceptance is claimed; Release 5 remains pending its own owner review.

## 9. Proposed visible copy changes

None. Every visible string on both surfaces is byte-identical to main. The destination-truth review found the locked vocabulary already consistent.

## 10. Owner decisions (three)

1. **Keyboard focus floor: scoped or site-wide?** This release applies it to the two reading groups only. The journey log shows the same pre-existing behaviour on the Record band's three links (focus lands while the row is still fading). A one-rule global version in `globals.css` would extend it to every Reveal; it is a shared-primitive change, so it is yours to call.
2. **The dusk-turn.** Keep as shipped (recommended here; it is approved work and the environment cannot time it fairly), or commission a hold-free variant where the incoming room begins before the outgoing one is fully gone. The latter changes the choreography Sky reviewed in Phase G and requires amending `dusk-turn.test.ts`'s window invariant.
3. **The wall numeral's weight.** /65 ink (recommended; 3.5:1 or better at the worst pixel in both themes) or a lighter ghost. Anything under about /55 fails 3:1 on the dark phone plate by measurement; /30 never passed.

## 11. Status

PROTOTYPED · BUILD_VERIFIED · RENDERED · OWNER_VISUAL_REVIEW_PENDING · FINAL_INTEGRATION_PENDING · NOT_DEPLOYED. Release 5 remains pending its own integration; this folder makes no claim about the combined result beyond section 8.
