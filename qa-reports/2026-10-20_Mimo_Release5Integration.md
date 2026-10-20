# SkyPi Release 5: final integration onto the Release 4 baseline (2026-10-20)

**Status: IMPLEMENTATION_COMPLETE / INTEGRATED / VERIFIED / RELEASE5_READY_FOR_OWNER_REVIEW.**

Take Fable's completed Release 5 creative work (the four project evidence chapters) exactly as it
was built, bring it onto current production main after Release 4, re-cut the soft detail crops from
the verified 2880×1800 masters, re-verify the combined tree, and prepare one draft pull request for
owner review. No design was reopened, no implementation was replaced, no presentation copy was
rewritten.

## Provenance

| Item | Value |
|---|---|
| Production main (verified before any change) | `f29ce93b781372418cfe9d0e01ac17850a34b70e` (merge of Release 4, PR #31) |
| Fable Release 5 source branch, never modified | `claude/inspiring-pascal-p12cfr` @ `dfddbdd916eb43f4cc266774df03257aea69b228` |
| Fable's base | `f08c327` (main after Release 3) — merge base with production main, so the two releases have no file overlap in source |
| Integration branch | `mimo/skypi-release5-integration-20261020` in `~/Portfolio-codex/mimo-release5-20261020` |
| Recovery checkpoint taken before the merge | local tag `recovery/mimo-release5-start-20261020` at `f29ce93` |
| Merge | `--no-ff` merge of `dfddbdd` into the integration branch; Fable's six source commits preserved in history |
| Recut tool (new) | `qa-reports/release5-showcases-20261020/tools/recut-details-masters.mjs` |

## Merge and conflict verification

`git merge --no-ff dfddbdd` produced exactly **one** conflicted path: `qa-reports/INDEX.md`, the
generated evidence index. It was resolved the way the repository intends: `node
scripts/generate-qa-index.mjs` (the same generator `npm run qa:index` runs), which derives the list
from the merged git index, so both releases' evidence survives. The regenerated index lists 1639
tracked files and 25 evidence directories including `release5-showcases-20261020/`.

**Nothing of Fable's work was dropped:** every one of the 257 files changed on `dfddbdd` against its
base is present in the integrated tree (`git diff --name-only` comparison, 0 missing), and the seven
source files carry Fable's exact line counts (`lib/caseShowcase.ts` 471, `components/CaseShowcase.tsx`
317, `components/ShowcaseHero.tsx` 88, `components/caseShowcase.module.css` 87,
`app/work/[slug]/page.tsx` +110/−22, `app/__tests__/case-showcase.test.tsx` 412, `lib/schema.ts` 1
word). Release 4's files (`app/globals.css`, `components/Button.tsx`, `HamburgerNav.tsx`,
`ProjectDoorwayButton.tsx`, `SidebarRailLinks.tsx`, `ViewTransitions.tsx`, `lib/returnFocus.ts` and
their tests) are intact and untouched by the integration commit.

## High-resolution detail crops (D3, FACTORY_RECUTS.md handoff completed)

Fable cut the detail exhibits from the shipped captures (1290 or 1600 px wide) because the masters
were believed to live only in the owner's gitignored bank. They were found, in two places, both
**without modifying either source**:

- `design-reviews/showcase-refresh/masters/` in the main checkout (Prompt Library;
  `masters/<project>/<scene>.<theme>.<viewport>.png`, the manifest's relative paths), and
- the registered project workspaces recorded in `content/showcase.manifest.json` under
  `~/Documents/Codex/2026-09-04/.../approved-execution/media-masters/final/` (Claude Corp
  `hero-pipeline`, Dashboard `command-center` / `think-tank` / `dispatch`).

**The bank's older Claude Corp and Dashboard master copies are NOT the sources of the shipped
captures** (a Sep-2 capture run; pixel comparison MAE 17–20 against the shipped files). The
manifest-recorded masters are. Every master used was verified three ways before any cut: byte-level
SHA-256 against the manifest record (12/12 MATCH), 2880×1800 as recorded, and content pairing with
its shipped capture (greyscale MAE 0.57–1.53, 0.00% of pixels differing by more than 32). The crops
are therefore truthful details of the exact captures the site ships.

Re-cut per FACTORY_RECUTS.md (same regions, same output names, AVIF q56 / WebP q84 as Fable's
tool): 14 outputs (7 cuts × light/dark) now at master resolution — `r5-prompt-open` 1843×979,
`r5-prompt-variables` 936×720, `r5-featured-card` 737×460, `r5-pipeline` 2210×665, `r5-disclosure`
2433×982, `r5-think-tank` 2434×1357, `r5-dispatch` 2448×1395. The three phone-native cuts
(`r5-team-phone`, `r5-think-tank-phone`, `r5-dispatch-phone`) were already at capture resolution and
stand unchanged. `lib/caseShowcase.ts` width/height entries track the real file pixels (the test at
`app/__tests__/case-showcase.test.tsx:127` pins spec dimensions to the WebP header); aspect ratios
are preserved, so the compositions are pixel-for-pixel the same regions Fable laid out.
`details.json` records, per output, the master source, its manifest SHA-256, the master-space box,
the pairing MAE and the new byte counts.

Weights: 40 files total, 625 KB AVIF / 1077 KB WebP (was 954 KB combined at shipped resolution).
Heaviest single AVIF 76 KB; a route fetches only its own exhibits (Prompt Library ≈ 52 KB AVIF,
Claude Corp ≈ 51 KB, Dashboard ≈ 210 KB). **Not used, on purpose:** the inactive P2 candidate
images under `public/showcase/*/p2-*`, which await owner approval.

## Presentation truth and copy review (D5)

Fable's presentation copy is preserved verbatim. Targeted factual review against source evidence:
every date and commit in the provenance lines matches `content/showcase.manifest.json`
(Prompt Library `2026-09-02 · 78b961e` and `2026-07-31 · 052b37a`; Claude Corp `2026-09-05 · 4a03980
· local build`; Dashboard `2026-09-05 · 00cc915 · local build`; Ghost Code `2026-07-31 · 1e6b963`),
and the `local build` wording honestly carries the manifest flag `local-approved-candidate; not
deployed`. Every substantive claim condenses approved prose in `content/deliverables.json` (the
Claude Corp ledger rows and the quarterly exception; the seven-layer gate; "the names are role
names, not people"; the Dashboard "short-circuits to a synthetic snapshot … persists nothing"
sentences; Prompt Library's "no account and no backend" and "each run goes straight to Anthropic
with your key"). The retired "never leave your browser" wording appears nowhere. The four truth
distinctions in the brief hold: Prompt Library runs send prompt + the user's key to Anthropic and no
copy claims otherwise; Claude Corp roles are AI roles and the pipeline is labelled a diagram, not
telemetry; Ghost Code keeps its controls and click-to-play clip; Dashboard names synthetic data on
every provenance line. No substantive editorial change was needed; no case-study prose, status,
role, date or claim was altered.

## Verification on the combined tree (Release 4 + Release 5)

| Check | Result |
|---|---|
| Typecheck (`npm run typecheck`) | clean |
| Lint (`npm run lint`) | clean (the existing `headers`/`output: export` notice only) |
| Production build (`npm run build`) | static export completes; prebuild asset validation and postbuild pruning run |
| Full build-backed suite (`vitest run`, final build) | **121 files, 1104 tests passed, 2 skipped** (the same two labelled build-dependent skips) |
| Case-study guard tests (`app/__tests__/case-showcase.test.tsx`) | 24 passing on the final build, including the built-output dimension pin against the re-cut WebPs |
| Responsive overflow (`npm run check:overflow`, the element-level census) | 108 frames · 27 routes × 2 themes × 2 widths (320, 375) · non-vacuity plant caught 108/108 · **zero elements cross the viewport edge** |
| Capture pass on the integrated build (4 routes × 2 themes × 1440×900, 393×852@2, 1920×1200@2, 320×568@2) | 32 folds: no overflow, zero hidden reveals, zero console errors; the 1920×1200@2 folds show the showcase heroes filling the content column (`integrated/captures/`) |
| Reduced-motion and no-JavaScript frames (4 routes × 2 themes × 2 sizes × both modes) | 32 frames, all complete, zero errors, zero hidden reveals (`integrated/modes/`) |
| Reduced-motion first paint (record-motion `--rm-check`, 120 ms vs 1620 ms byte comparison) | 4 routes: **0 differing bytes, 0 running animations, 0 chapter reveals off rest** |
| axe-core + keyboard walk (4 routes × 2 themes × 1440 and 393) | **zero violations** on the whole page and in the showcase subtree; Prompt Library doorway reached after 18 (desktop) / 6 (phone) tabs, Ghost Code Play after 18 / 6, both measured 44 px tall; focus ring solid 2px `rgb(185, 99, 64)` light / `rgb(207, 122, 79)` dark — identical to Fable's baseline (`integrated/a11y/`) |
| Rendered contrast of chapter text over the plinth glow (pixel-sampled) | every line ≥ 4.5:1; worst 5.74:1 light (Dashboard caption), 5.89:1 dark (Ghost Code label), matching Fable's 5.68 / 5.89 (`integrated/contrast/`) |
| WebKit spot check (Playwright WebKit, 4 routes × 2 themes × 1440 and 393@2) | 16 frames: zero broken laid-out images, zero console errors, no overflow, non-vacuity plant caught (`integrated/webkit/`) |
| Image loading and dimensions | every laid-out image resolves in both engines (stepwise-scroll check); spec dimensions match the WebP headers (test-pinned); heaviest AVIF 76 KB |
| Normal-speed motion | four real-time recordings of the integrated build + six-frame strips (`integrated/motion/`); the chapter sequence, plinth bloom and still-first Ghost Code clip behave as recorded |
| Cinematic desktop GPU hotfix and Release 4 interactions | protected by diff: `components/cinematic/**`, `app/globals.css`, `Button.tsx`, `HamburgerNav.tsx`, `ProjectDoorwayButton.tsx`, `SidebarRailLinks.tsx`, `ViewTransitions.tsx`, `lib/returnFocus.ts` show **zero changes** against `f29ce93`; their tests pass in the suite |
| Routes and internal links | all routes build; static-integrity and link guards pass in the suite; the census exercised 27 routes |

## What was deliberately not done

No merge or deployment (owner's publication gate). No change to dependencies, workflows, deployment
configuration, authentication, privacy, archive or backend code. No change to
`content/deliverables.json`, `content/showcase.manifest.json`, anything under `public/showcase/`, or
the published Flagstone, homepage, About, Contact, Float and Tokyo Through Time work. Fable's branch,
its evidence folders and the Release 4 worktrees were not modified.

## Limitations, stated plainly

- **MP4 transcodes of the integrated motion runs do not exist.** This Mac has no ffmpeg with
  libx264 (Playwright's bundled ffmpeg is a minimal VP8 build; `avconvert` cannot read WebM). The
  integrated motion evidence is the real-time WebM recordings, the six-frame strips and the
  reduced-motion report; `motion/report.json` retains the tool's mp4 paths, which are unproduced
  here. Fable's MP4 recordings from the candidate remain valid and unchanged (the motion code is
  byte-identical to their branch).
- Headless Chromium and headless WebKit are not physical Safari, VoiceOver, an iPhone, or a
  real-device GPU session. The real-device list from Fable's report stands: physical Safari and
  VoiceOver, real-device graphics performance of the plinth bloom and the clip, and the retina
  sharpness of the new crops on an actual 2× display.
- The sharpness improvement is verified at the pixel level (2448-px sources for ~900-px displays)
  and in headless DPR-2 captures; the owner's eye on a real retina display is the final word.

## Owner decision required

One approval covering both halves, per the publication gate:

1. **Visual + copy acceptance** of Fable's Release 5 design and presentation copy (decisions D1–D5
   as implemented: D1 showcase heroes on Ghost Code and Dashboard, D2 artwork heroes on Prompt
   Library and Claude Corp, D3 now completed in its recommended direction with the master re-cuts
   above, D4 Ghost Code's phone gameplay hero, D5 copy approved as written or with edits).
2. **Publication authorization** for the draft PR to merge into production main and deploy through
   the normal CI and GitHub Pages workflow.

No force merge, no admin bypass, no emergency deploy.
