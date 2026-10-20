# Release 5 · Distinctive project showcases · owner review

**Date:** 2026-10-20 · **Branch:** `claude/inspiring-pascal-p12cfr` · **Base:** main `f08c327` · **Deployed:** no

| Route | Status |
|---|---|
| `/work/prompt-library/` | PROTOTYPED · BUILD_VERIFIED · RENDERED · OWNER_VISUAL_REVIEW_PENDING · FINAL_INTEGRATION_PENDING · NOT_DEPLOYED |
| `/work/claude-corp/` | PROTOTYPED · BUILD_VERIFIED · RENDERED · OWNER_VISUAL_REVIEW_PENDING · FINAL_INTEGRATION_PENDING · NOT_DEPLOYED |
| `/work/ghost-code/` | PROTOTYPED · BUILD_VERIFIED · RENDERED · OWNER_VISUAL_REVIEW_PENDING · FINAL_INTEGRATION_PENDING · NOT_DEPLOYED |
| `/work/dashboard/` | PROTOTYPED · BUILD_VERIFIED · RENDERED · OWNER_VISUAL_REVIEW_PENDING · FINAL_INTEGRATION_PENDING · NOT_DEPLOYED |

This is a working design prototype on an isolated branch. It is not owner acceptance, not a release, and nothing here claims independent acceptance of its own work. No pull request has been opened for this branch; nothing has been merged or deployed.

> **Integration update (2026-10-20, MiMo).** This candidate is integrated onto production main
> (`f29ce93`) on `mimo/skypi-release5-integration-20261020` and verified there
> ([`2026-10-20_Mimo_Release5Integration.md`](../../2026-10-20_Mimo_Release5Integration.md));
> `FINAL_INTEGRATION_PENDING` is satisfied on that branch and the detail crops are re-cut at master
> resolution (sections 6 and 10.3). `OWNER_VISUAL_REVIEW_PENDING` and `NOT_DEPLOYED` stand.

## 1. Start here

Open the boards and the recordings; everything else in this folder is the receipt behind them.

| What | Where |
|---|---|
| Before/after boards, one per route × theme × size (fold and full page) | `boards/<route>-<theme>-<size>-<fold\|full>.jpg` (before = main `f08c327`, after = this branch) |
| Normal-speed recordings of the strongest motion, plus a six-frame strip of each | `motion/<route>-light-1440x900.mp4`, `motion/<route>-light-1440x900-frames.jpg` |
| Reduced-motion first paint of each chapter | `motion/<route>-light-1440x900-rm-120ms.jpg` and `motion/report.json` |
| Responsive folds, both themes: 320×568, 375×667, 768×1024, 1280×800, 1920×1200 at device pixel ratio 2 where supported | `responsive/<route>/r-<theme>-<size>-fold.jpg` |
| No-JavaScript and reduced-motion captures (1440 and 393, fold and full page) | `modes/<route>/light-<size>-nojs-*.jpg`, `modes/<route>/light-<size>-rm-*.jpg` |
| axe-core and keyboard pass, and the contrast of the chapter text over the plinth glow | `a11y/axe.json`, `a11y/focus-*.jpg`, `a11y/plinth-contrast.txt` |
| The raw captures the boards are cut from | `baseline/` (main) and `after/` (this branch) |
| Every detail crop, with its source box and bytes | `details.json`, cut by `tools/cut-details.mjs` |
| Per-project checkpoints with commit SHAs and the checks run at each | `CHECKPOINTS.md` |

To rebuild the evidence from a clean checkout: `npm ci`, `npm run build`, then the tools under `tools/` (each documents its own command line). They need only the pre-installed Playwright Chromium, sharp, ffmpeg and the repository's own axe-core devDependency; nothing is installed and nothing leaves loopback.

## 2. Baseline and isolation

- `origin/main` was fetched at the start of the session and read `f08c327f0f84ac3cef9e00086ac79e93f125a8d4`, the same commit the assignment names as the last known main after Release 3.
- The session-assigned branch `claude/inspiring-pascal-p12cfr` started at exactly that commit with no divergence in either direction, so it is isolated and carries nothing unrelated.
- Release 4 (`claude/skypi-release4-final-20261019`, PR #31) was read only to plan reconciliation (section 9). Its branch was never edited, and none of its fixes were duplicated.
- Commits on this branch, oldest first: `a61194a` (the chapter system, Prompt Library rendered), `e9ef17c` (Claude Corp rendered), `b6857a4` (checkpoints), `77baf35` (Ghost Code rendered, the showcase hero), `08bdb30` (Dashboard rendered), `4cd2019` (review draft, responsive sweep and mode captures). The commit that adds the recordings, the axe and keyboard pass and this README's final text follows them, and `CHECKPOINTS.md` names it in its last row.

## 3. What changed

Source, 47 files on the branch; the five that matter:

| File | Change |
|---|---|
| `lib/caseShowcase.ts` (new, 471 lines) | The presentation spec for the four routes: which captures each exhibits, at what size, with which label, caption and provenance, and how the phone composition differs. Validated with zod the first time it is read, so a bad alt, a missing file or an em dash fails the build like a content error. |
| `components/CaseShowcase.tsx` (new) | The evidence chapter: kicker, h2, standfirst, a numbered sequence of exhibits (capture, labelled detail, still-first clip, or a typeset ledger), one laid-out variant per width, caption and provenance, an optional doorway. Server Component. |
| `components/ShowcaseHero.tsx` (new) | The capture-true hero media and its caption line for the two routes whose first impression is a desktop screen. |
| `components/caseShowcase.module.css` (new, 87 lines) | The one new motion beat (the plinth bloom) and its reduced-motion, no-JS, dead-JS, hash-arrival and print floors. Route-scoped module, the same idiom as the approved About/Contact work. No global token or stylesheet changed. |
| `app/work/[slug]/page.tsx` (+90/−22) | Narrow, conditional: `caseShowcaseFor(d.id)` mounts the chapter between the title band and the essay and retires the in-essay proof block for those four routes; `showcase.hero` reshapes the title band on Ghost Code and Dashboard only. Every Flagstone literal the existing guards pin is intact; every other consumer renders byte-identically. |

Also: `lib/schema.ts` exports the existing alt-text schema (one word); `app/__tests__/case-showcase.test.tsx` (new, 412 lines) guards the spec, the DOM, the page scoping, the floors, click-to-play and the built output; 40 new image files under `public/images/deliverables/<slug>/r5-*` (about 1 MB, AVIF and WebP, light and dark); and this review folder.

Not changed: `components/cinematic/**`, the cinematic CSS and hotfix tests, Skip Intro and reduced-motion first-paint logic, the homepage, About, Contact, the published Flagstone case study and its utility pages, Float, Tokyo Through Time, the Release 4 button, menu and navigation behaviour, authentication, archive, privacy or backend code, dependencies, workflows, deployment configuration, global design tokens, `app/globals.css`, `content/deliverables.json`, `content/showcase.manifest.json`, every file under `public/showcase/`.

## 4. The shared system

The four pages share one grammar and differ in composition, so they belong together without becoming four copies of one card layout.

**The chapter.** A band between the title and the essay, `Inside the build`, then `A closer look.` (or `See it in motion.` where there is a clip), a one-line standfirst, and a numbered sequence of exhibits. Each exhibit is a whole capture, a detail cut from one, the deliverable's own still-first clip, or a ledger typeset from the case study's prose. Each has a mono label (`01 · The library, as it opens.`), the capture in the site's clean float chrome on a plinth of the project's signature light, a caption in the Release 3 contrast classes, and a provenance line: date, project commit, scene, and `synthetic data` or `local build` where that is the truth. A detail always says it is a detail and names the capture it came from. The chapter's h2 carries an id, so the rail's "On this page" index lists it ahead of the essay.

**Size.** The 1290-wide desktop captures were resting at about 420px in the old two-column hero and 652px in the essay, where their text was decoration. In the chapter the whole capture spans the content column (1096px at 1440), and details are cut so the product's own text reads at close to its native size on desktop and at a readable size on a phone.

**Phone as its own reading experience.** An exhibit may carry a desktop image and a phone-composed one (a real phone capture, or a tighter detail), each with its own label, caption and provenance when the scene differs. Exactly one is laid out per width; the other has no box, so its image is never fetched and its alt never reaches the accessibility tree. Numbering follows the sequence each width actually shows, so a desktop-only exhibit leaves no gap on a phone.

**The showcase hero (Ghost Code, Dashboard).** Where the first impression is a desktop screen, the hero well spans the content column at the capture's own 16:10 aspect under a compact title block (identity on seven columns, the hero caption and pills on five, seated to one baseline), with a mono caption line under the well and the status, role, year, tech, links and tags laid out in one ledger row beneath. Below md the same well turns portrait and the phone-composed capture stands on the golden-hour stage at Flagstone's measured phone proportions. Prompt Library and Claude Corp keep their approved artwork heroes and get the large overview in the chapter instead.

**Motion.** Nothing new on the hero: the existing world settle and frame lift. In the chapter, the shared Reveal depth variant steps the exhibits in, each caption's horizon rule draws when its Reveal arrives (the existing `HorizonRule`), and one new beat: the plinth light under each plane blooms over one scene duration after the plane lands. Opacity only, ramp tokens only, once. The resting composition is complete from first paint under reduced motion, without JavaScript, on a dead bundle and on a hash arrival; the recordings and the reduced-motion check in section 7 are the evidence.

**Accessibility built in.** Semantic figures with figcaptions, one h2 per chapter and h3s for ledger rows, real text for every claim (no information lives only in an image, on hover or during an animation), alt text that obeys the content rule, lazy images with one accessible name per laid-out variant, a 44px doorway and the shared 44px Play control, the global focus ring, and the Release 3 measured text classes on the same world surface (ink-muted in light, ink in dark; the kicker accent-ink in light, ink in dark). Captions and labels never use an em dash.

## 5. The four pages

### Prompt Library · recommended direction

What a visitor should understand first: a real, working library of prompts that lives in the browser, and the one workflow that matters: open a prompt, fill its variables, run it, with the only network call going straight to Anthropic.

- **Hero:** unchanged, the approved UI/UX Refinement Pass illustration, labelled `Card illustration`, with the stored prompt entry untouched.
- **01 · The library, as it opens.** The home capture of 2026-09-02 (`78b961e`) at content width: search, category and tag filters, the featured card and the grid. Its own text reads at about 0.85 scale.
- **02 · One prompt, opened.** A detail cut from the 2026-07-31 (`052b37a`) `prompt-detail` capture: the opened template with its two `{{variables}}` on the left, the fields, `Copy filled` and `Run with Claude` on the right, inset one column and shown at its native size.
- **Doorway:** `Explore Prompt Library`, the owner-approved wording, on `https://prompts.skypistudio.com`, the live library itself. The hero's `Live demo` pill is unchanged (its label is pinned by the truth guard) and no other link was repurposed.
- **Phone:** `01 · One prompt card, as the library opens.` is the featured card cut from the same current desktop capture; `02` is the variables panel alone, at a readable size. The 2026-07-31 phone capture of the home was deliberately not used: its privacy line predates the truth pass and still reads the retired wording (section 6).

### Claude Corp · recommended direction

What a visitor should understand first: Sky designed and operates a governed system of fifteen AI roles, the rules are the product, and the merge stays with a human.

- **Hero:** unchanged, the approved Branch Atlas, labelled `Concept diagram`.
- **01 · Who decides what.** Four rows typeset from the case study itself: Intent (Sky), Routing (a project manager role), Review (gates, not discretion), Release (Sky). Each row's sentence is grounded in the approved prose, the figcaption carries the authority order, and the provenance line reads `Typeset from this case study · not an application capture`. A ledger, not a diagram, so no recruiter has to decode one and nothing can be mistaken for telemetry.
- **02 · The pipeline, as the public site draws it.** A detail of the 2026-09-05 (`4a03980`, local build) front-door capture: the five-stage pipeline band at a size where its stage labels read, captioned as a diagram on the public site, not telemetry. Desktop only; on a phone the ledger carries the model.
- **03 · Fifteen roles, each with a domain.** The role grid capture at content width, captioned so the names are role names, not people; on a phone, the 2026-07-31 phone capture of the same grid, cropped to the section head, the filters and the first two role cards.

### Ghost Code · recommended direction

What a visitor should understand first: a real terminal-command training game, the Phantom, four command tokens, and that it was a first build made to practise with.

- **Hero (desktop):** the real title screen at content width, the deliverable's own heroShot (the test that pins its alt still holds): wordmark, the mastery counters, "Guide the Phantom", `Press Start`. Under it, `Current product capture · title screen · 2026-07-31 · 1e6b963`, then the ledger row.
- **Hero (phone):** a round in play on a phone, the 2026-07-31 phone capture of the board, standing on the stage at 72% / 53% width.
- **01 · A round, in play.** The board capture at content width; the prompt and the four tokens read at about 0.7 scale. Desktop only (the phone hero already shows a round).
- **02 · The round, in motion.** The authored still-first clip (`shots[0].video`, `autoplay: false`, light and dark twins) in a 390:844 plane beside its caption at lg. Click-to-play is preserved exactly: the test pins that nothing plays on hydration, on viewport entry or on a theme flip, that the shared 44px control is the only way to play, and that its accessible name tracks the state. No autoplay, no sound, no embedded game, no new functionality.
- The playful identity stays visible inside the restrained frame through the captures and the phantom-cyan signature light the site already assigns to this project.

### Dashboard · recommended direction

What a visitor should understand first: an operator console with a few useful workflows, private in use, and a public demo that runs on synthetic data and says so.

- **Hero (desktop):** the command center at content width (the deliverable's own heroShot); the `DEMO` badge and the `Demo · synthetic data` banner are legible in the hero itself. The caption line reads `Public demo capture · command center · synthetic data · 2026-09-05 · 00cc915 · local build`.
- **Hero (phone):** the 2026-07-31 phone capture of the command center, with the badge and the banner both visible.
- **01 · The demo seam, at reading size.** A detail of the command-center capture: the badge, the dated snapshot, the two top panels and the banner, inset one column, captioned with the case study's own sentences about the seam. Desktop only (the phone hero carries the disclosure).
- **02 · The Think Tank.** The board cut from its capture without the sidebar: triage header, project filters, the first idea with its Do it / Later / Skip controls. On a phone, one triaged idea from the 2026-07-31 phone capture.
- **03 · The Dispatch queue, with its receipts.** Four whole queue items with status, owner and a dependency; the caption says the relay controls stay off and nothing persists. On a phone, the Queue Work form, whose own text says no agent runs yet and nothing is written in demo mode.
- Every provenance line on this route names synthetic data; no counter is presented as adoption, operations, business results or performance, and no private operational data was accessed.

## 6. Authenticity and media

- Every exhibit is a file the site already ships under `public/showcase/<slug>/`, or a detail cut from one by `tools/cut-details.mjs` into `public/images/deliverables/<slug>/r5-*` (AVIF and WebP, light and dark). The originals are untouched; `details.json` records every source file, pixel box and byte count. Nothing was generated, reconstructed or recoloured; no app screenshot is presented as anything but what it is.
- Dates and commits come from `content/showcase.manifest.json`: the factory's `capturedAt` and `projectSha`. Where the manifest flags a capture as a locally approved candidate rather than the deployed site (Claude Corp and Dashboard desktop captures, 2026-09-05), the line says `local build`.
- **Not used, on purpose:** the 2026-07-31 Prompt Library phone capture of the home (its privacy line reads "your key and prompts never leave your browser", wording the truth pass retired and the guard bans in copy) and the project-filter chips of the 2026-07-31 Dashboard phone Think Tank capture (one chip names a project by its pre-rename name). Both are cropped out or replaced by a current capture, as noted in the spec.
- **Resolution, honestly:** the factory masters (2880×1800) were believed to live only in the owner's gitignored bank, so the details were first cut from the shipped files (1290 or 1600 wide), soft on a 2× display. The masters were then located (the bank for Prompt Library, the manifest-recorded project workspaces for Claude Corp and Dashboard) and the same boxes were re-cut at master resolution on the integration branch (2026-10-20): 14 outputs now 737 to 2448 px wide, each master SHA-256-verified and pixel-paired with its shipped capture before cutting. `details.json` carries the master provenance per output. On a 2× display the details now render at or above the display's own resolution.
- **Candidate files not used:** the inactive P2 candidates under `public/showcase/*/p2-*` (master-resolution region captures the P2 closure recorded as unapproved) were left alone. If the owner approves them, the featured-card and variables-panel details could be swapped to them in one line each (decision D3).

## 7. Motion evidence

Each recording (`motion/`, 1440×900, light theme, Playwright Chromium, real time, transcoded to MP4 with a six-frame strip beside it) runs the same script: the page arrives and the hero settles (the existing world settle and frame lift, unchanged), the viewport glides to the chapter at a reading pace and holds while the exhibits step in and their plinths bloom, then on to the second exhibit. What to look for: the exhibits arrive in reading order on the shared depth reveal; each caption's horizon rule draws once its figure is in; the plinth light under each plane blooms one scene beat after the plane lands; nothing loops, nothing replays on the scroll back, and the clip on Ghost Code stays on its poster until Play.

The reduced-motion check loads the same chapter with `prefers-reduced-motion: reduce`, screenshots it 120 ms after load and again at 1.6 s, and compares the two byte for byte; it also counts running animations and any chapter reveal whose computed opacity is not 1.

The raw WebM recordings were transcoded and not kept; `motion/report.json` records each run's timing marks and reduced-motion counts beside the MP4 and strip, and still names the raw path each came from.

| Route | Clip | Length | Reduced motion: differing pixels 120 ms vs 1.6 s | Running animations | Chapter reveals off rest |
|---|---|---|---|---|---|
| prompt-library | `prompt-library-light-1440x900.mp4` + `prompt-library-light-1440x900-frames.jpg` | 10.28 s | 0 | 0 | 0 |
| claude-corp | `claude-corp-light-1440x900.mp4` + `claude-corp-light-1440x900-frames.jpg` | 10.12 s | 0 | 0 | 0 |
| ghost-code | `ghost-code-light-1440x900.mp4` + `ghost-code-light-1440x900-frames.jpg` | 10.2 s | 0 | 0 | 0 |
| dashboard | `dashboard-light-1440x900.mp4` + `dashboard-light-1440x900-frames.jpg` | 10.56 s | 0 | 0 | 0 |

Reverse scrolling and repeated navigation were exercised in the capture pass (every page is scrolled to the bottom and back to the top before its full-page capture; no reveal re-performs, no image is lost, no layout jumps were seen in the before/after full pages). Playback was inspected at normal speed in headless Chromium only; real-device graphics performance is unverified (section 8).

## 8. Checks

Environment: a Linux container (6.18 kernel), Node 22.22, Playwright Chromium 1194 (`playwright-core` 1.61.1, headless, software rendering), sharp 0.35 and ffmpeg 6. Headless Chromium is not physical Safari, VoiceOver or a real device; the real-device checks are listed as unverified below.

| Check | Result |
|---|---|
| `npm run typecheck` | clean |
| `npm run lint` | clean (Next's existing `headers` export notice only) |
| `npm test` on the final build | 119 files, 1080 tests passed, 2 skipped (the two labelled build-dependent skips in other suites) |
| `npm run build` | static export completes; prebuild asset validation and postbuild pruning run |
| Bundle delta against main `f08c327` (both built here with the same toolchain) | the `/work/[slug]` page chunk 11,752 to 12,629 B raw (4,074 to 4,394 B gzip); all CSS 135,396 to 138,109 B raw (27,648 to 28,158 B gzip); each showcase route's HTML grows 12 to 21 KB raw, 1.7 to 2.9 KB gzip, for the chapter markup and its picture sources; the Flagstone route's HTML differs by 144 B of asset hashes only; the 40 new image files total 954 KB on disk across both formats and both themes, and a route requests only the files its own exhibits use |
| Build-backed guards (recruiter-copy truth, static integrity, Flagstone first proof and proof row, case-showcase built output) | 95 assertions passing on the final export; zero em dashes on every rendered route; every internal link and image resolves |
| Capture pass, 4 routes × 2 themes × 2 sizes (1440×900, 393×852 at 2×) | no horizontal overflow, no reveal left hidden after the scroll pass, zero console errors |
| Responsive sweep, 4 routes × 2 themes × 5 sizes | 40 frames, zero horizontal overflow, zero reveals left hidden after the scroll pass, zero console errors; the 1920×1200 at 2× folds of the two showcase heroes show the capture filling the 1120px content column, and the 320×568 folds stack cleanly |
| No-JavaScript and reduced-motion captures | 16 frames, all complete: with JavaScript off every chapter, capture, caption and the native video controls render from the markup; under reduced motion nothing is hidden and nothing moves (`modes/`, and the 120 ms check in section 7) |
| axe-core 4.11 (whole page and the showcase subtree), 4 routes × 2 themes × 2 sizes | 16 frames, zero violations on the whole page and zero in the showcase subtree. What axe could not decide (`incomplete`, recorded in `a11y/axe.json`, not failures): `color-contrast` on 1,248 page nodes across the 16 frames, 312 of them inside the chapters, wherever axe could not resolve the background behind the text (the page's washes and layered surfaces); the chapter text uses the Release 3 measured contrast classes and no new colour. `aria-prohibited-attr` on one element per frame: the title band's hero-caption `div` (`.border-l-2`), which carries an `aria-label` on main in exactly the same way on every non-Flagstone case study; outside the chapters and untouched by this branch. `video-caption` on the Ghost Code clip in its 4 frames: the deliverable's existing silent demonstration clip, described by its label, caption and accessible Play name, and captionless before this branch too. |
| Keyboard walk to the first showcase control, both themes, 1440×900 and 393×852 | From the top of each page, Tab reaches the chapter's first control at the same stop in both themes: the Prompt Library doorway (`Explore Prompt Library`) after 18 stops on desktop and 6 on the phone, measured at 193×44 px; the Ghost Code Play control after 18 and 6, measured at 44×44 px. Each shows the site's own ring (`:focus-visible`, solid 2px, offset 2px, `rgb(185, 99, 64)` light and `rgb(207, 122, 79)` dark); crops in `a11y/focus-*.jpg`. Claude Corp and Dashboard add no controls to their chapters (their links stay in the title band). A first run of the same tool matched the hero's `Live demo` pill, which shares the doorway's href (169×56 px after 16 stops on desktop, 329×56 px after 4 on the phone); the selector now names the chapter doorway, and `a11y/` holds the second run. |
| Chapter text nearest each plinth glow (the label above and the first caption line below every plane), both themes, 1440×900 and 393×852: the rendered background sampled pixel by pixel behind the hidden text with the bloom at rest, against the text's computed colour (`tools/plinth-contrast.mjs`) | every line clears 4.5:1 on every pixel; worst case 5.68:1 in light (the Dashboard first caption, `rgb(70, 84, 77)` over the glow's outer edge) and 5.98:1 in dark (the Ghost Code phone label, `rgb(236, 234, 224)`), against about 6.7:1 and 11.8:1 on the plain surface; the glow's box reaches at most 19 px into a label line and 6 px into a caption line, where the gradient is near its transparent edge; `a11y/plinth-contrast.txt` |

**Unverified, needs a device session:** physical Safari and VoiceOver; real-device graphics performance of the plinth bloom and the clip; WebKit rendering (only Chromium is installed in this container; the Release 3 WebKit instruments were not runnable here); the 2× softness of the shipped-resolution details on an actual retina display.

## 9. Reconciliation with Release 4

Release 4 (`claude/skypi-release4-final-20261019`, PR #31) branched from `1001624`, before Release 3 merged. Measured against that merge base, it changes `app/globals.css` (the `#work` hover gating), `components/Button.tsx`, `components/HamburgerNav.tsx`, `components/ProjectDoorwayButton.tsx`, `components/SidebarRailLinks.tsx`, `components/ViewTransitions.tsx`, `lib/returnFocus.ts` and their tests. Release 5 changes none of those files, and Release 4 changes none of Release 5's, so the two reconcile as a clean three-way merge in either order. (A plain `git diff main..release4` shows Release 3's work as removed only because of the older base; a merge does not revert it.)

What to re-check after both are on main: the `Live demo` pill on the two showcase heroes (Release 4 changes Button's press language, and the pill now sits in the title band's right column), the 44px targets around the chapter doorway, and one capture pass with the tools in this folder.

## 10. Engineering handoff (MiMo)

1. After the owner's visual review, merge this branch after Release 4 (or before; there is no overlap). Run `npm run typecheck && npm test && npm run build` as usual.
2. Stage this folder's evidence and run `npm run qa:index` (done in the final evidence commit on this branch; rerun after any addition).
3. ~~Capture factory, when the project checkouts are available: re-cut the same detail boxes from the 2880×1800 masters so the 2× display is crisp.~~ **Done 2026-10-20 on the integration branch** (`tools/recut-details-masters.mjs`, see `tools/FACTORY_RECUTS.md`): the same boxes re-cut from the manifest-recorded masters, same output names, spec dimensions updated to the real file pixels. Still open: optionally add the boxes as `captureRegion` scenes in `scripts/showcase/registry.mjs` so the factory banks them.
4. Optional, if the owner wants the spec to live beside the content: lift `lib/caseShowcase.ts` into an optional `showcase` block of `DeliverableSchema`. The component already reads a validated object; only the source of the object would move.
5. Known small debts, none blocking: on phones the themed hero preload still fetches the desktop hero AVIF (about 13 to 30 KB) that the phone hero does not show; the ledger row's `lg:` placements assume at most one non-demo links block (true for all five deliverables today).
6. Do not change `content/deliverables.json` for this release: the chapter deliberately reads the authored clip and shot data from it and keeps the authored captions where they are.

## 11. Owner decisions

Only these change what ships; everything else is implemented in the recommended direction.

- **D1 · The showcase hero on Ghost Code and Dashboard.** Recommended: keep it (the real screen in the first fold at a readable size). The alternative keeps the shared two-column hero and shows the capture only in the chapter; one spec line (`hero`) removes it per route.
- **D2 · Artwork heroes on Prompt Library and Claude Corp.** Recommended: keep the approved illustrations as the heroes and let the chapter carry the real product. The alternative makes the real capture the hero and moves the illustration into the chapter as a labelled exhibit; it is a code-path change (artwork precedence in `lib/media.ts`) and was not built.
- **D3 · Master-resolution detail sources.** Recommended: let the capture factory re-cut from the masters (handoff step 3). The alternative swaps two Prompt Library details to the inactive P2 candidate files that already exist at master resolution; one line each, but they were recorded as unapproved.
- **D4 · The phone hero scene on Ghost Code.** There is no phone capture of the title screen, so below md the hero shows a round in play (the 2026-07-31 phone board). Recommended: keep it. The alternative is the desktop title screen shrunk, which does not read.
- **D5 · Presentation copy.** Every label, caption, standfirst and ledger sentence introduced here is listed in section 12 for approval or edit. No approved case-study prose, status, role, date or factual claim was changed.

## 12. Presentation copy introduced (for approval)

All of it lives in `lib/caseShowcase.ts`; none of it is content data, and none of it carries an em dash. The captions quote or condense the approved prose; where a sentence adds a fact, it is one the capture itself shows.

### Prompt Library

- Chapter heading: `A closer look.` · standfirst: `The library as it opens, then one prompt opened and ready to run.`
- Exhibit 1 (capture) label: `The library, as it opens.` · phone label: `One prompt card, as the library opens.`
  - caption: Search, category and tag filters, and the featured prompt leading a grid of prompt cards. Everything on this screen lives in the browser; there is no account and no backend.
  - phone caption: The featured prompt as the library opens: its category, title, description and tags. The whole library, prompts, favorites, run history and settings, lives in the browser; there is no account and no backend.
  - alt (desktop): The Prompt Library home, with a search bar and category chips over a grid of prompt cards and the featured card leading.
  - alt (phone): Detail of the featured prompt card: the Learning category, the title Explain Like I’m Five, its one-line description and three tags.
- Exhibit 2 (detail) label: `One prompt, opened.`
  - caption: The template on the left carries two variables and the fields on the right fill them. Copy the filled prompt, or run it with Claude: the browser sends the prompt and the user’s own key directly to Anthropic over HTTPS.
  - alt (desktop): Detail of an opened prompt: the Explain Like I’m Five template with topic and audience variables, two fields to fill, Copy filled and Run with Claude.
  - alt (phone): Detail of the variables panel: Topic to explain and Audience fields, Copy filled, Run with Claude, and the model choice.
- Doorway: `Explore Prompt Library` → https://prompts.skypistudio.com

### Claude Corp

- Chapter heading: `A closer look.` · standfirst: `Who decides what, then the pipeline and the fifteen roles as the public site shows them.`
- Exhibit 1 (ledger) label: `Who decides what.`
  - caption: The authority order runs intent, then the Constitution, then each role’s own file, then its skills, and no agent may amend it.
  - ledger row · Intent · Sky: The brief and the acceptance gates a cycle is judged against are written before any role starts.
  - ledger row · Routing · A project manager role: Decisions are routed to the right lane. Fifteen roles each own a domain, and every role works on its own branch, never on main.
  - ledger row · Review · Gates, not discretion: A UI change passes a seven-layer design-compile gate before it counts as done. Exactly one role may message Sky; the other fourteen write reports.
  - ledger row · Release · Sky: Merging is Sky’s. One narrow exception, mechanically gated and reviewed quarterly, covers a single project.
- Exhibit 2 (detail) label: `The pipeline, as the public site draws it.`
  - caption: Five stages from intent to merge: Sky sets intent, Morgan plans and routes, fifteen roles build in parallel on scoped branches, Safety applies the seven-layer compiler, and main merges on human approval. A diagram on the public site, not telemetry.
  - alt (desktop): Detail of the orchestration pipeline diagram: five stages, Sky sets intent, Morgan plans and routes, 15 roles build in parallel, Safety runs the 7-layer compiler, main merges on human approval.
- Exhibit 3 (capture) label: `Fifteen roles, each with a domain.`
  - caption: The role grid on the public site. Each card is a purpose-built Claude agent with a scoped skill file and its own branch namespace, named for its craft: the names are role names, not people.
  - alt (desktop): The fifteen-role team grid, with each agent card naming its craft from Quinn on product through Morgan on reporting.
  - alt (phone): Detail of the role grid on a phone: the 15 specialized roles heading, the role filters, and the Morgan and Shamus role cards.

### Ghost Code

- Hero caption, desktop: `Current product capture · title screen`
- Hero caption, phone: `Current product capture · a round, on a phone`
- Chapter heading: `See it in motion.` · standfirst: `A round on the board, then the Phantom in motion when you press play.`
- Exhibit 1 (capture) label: `A round, in play.`
  - caption: A prompt appears, four command tokens surround the Phantom, and you steer it to the right one. Arcade mode keeps score and takes a spirit for every miss; Learn mode drops the pressure and escalates instead: a hint, a second try, then the answer.
  - alt (desktop): A Ghost Code round in play, with the Phantom at the centre of four command tokens, the prompt above, and score and streak counters keeping pace.
- Exhibit 2 (clip) label: `The round, in motion.`
  - caption: A seeded round of a few seconds: the Phantom moves between the four tokens while the prompt reads above, in whichever theme the page is in. Press play to run it; nothing plays on its own.

### Dashboard

- Hero caption, desktop: `Public demo capture · command center · synthetic data`
- Hero caption, phone: `Public demo capture · command center, phone · synthetic data`
- Chapter heading: `A closer look.` · standfirst: `The demo seam first, then two of the operator’s workflows, all on synthetic data.`
- Exhibit 1 (detail) label: `The demo seam, at reading size.`
  - caption: The public demo says it is a demo and dates the snapshot it was built from: the DEMO badge and the synthetic-data banner sit on every screen, so nobody mistakes the numbers for live operations. Every data reader short-circuits to a synthetic snapshot before it can reach a real file.
  - alt (desktop): Detail of the command center: the DEMO badge and dated snapshot in the top bar, the agents-working and what-needs-you panels, and the Demo, synthetic data banner beneath.
- Exhibit 2 (detail) label: `The Think Tank: ideas triaged into Do it, Later and Skip.` · phone label: `One idea, triaged on a phone.`
  - caption: Ideas arrive with a score and a catch, and the operator sorts each into Do it, Later or Skip; most are meant to land on Later or Skip. Synthetic ideas that reset each session.
  - phone caption: An idea on the phone board, already marked Do it: its description, its score note, its catch and who raised it. Synthetic ideas that reset each session.
  - alt (desktop): Detail of the Think Tank board: the idea-triage header, project filters, and the first idea with its Do it, Later and Skip controls.
  - alt (phone): Detail of one Think Tank idea on a phone, marked Do it: its description, its score note, its catch and who raised it.
- Exhibit 3 (detail) label: `The Dispatch queue, with its receipts.` · phone label: `Queueing work, on a phone.`
  - caption: Work items queued for a named role, each with a status, an owner and any dependency. The relay controls stay off in the demo: approving, cancelling or re-queueing returns a plausible answer and persists nothing.
  - phone caption: The queue form on a phone: a work item is addressed to a named role and project and recorded as approved work. The form itself says the rest: no agent runs yet, and in demo mode nothing is written.
  - alt (desktop): Detail of the Dispatch queue: status filters, then four queued items with their ids, statuses, owners, a dependency and Cancel controls.
  - alt (phone): Detail of the Queue Work form on a phone: the DEMO badge, the Queue Work header, the recorded-work note, and the role and project fields.

