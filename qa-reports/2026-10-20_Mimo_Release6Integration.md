# SkyPi Release 6: final integration onto the Release 5 baseline (2026-10-20)

**Status: IMPLEMENTATION_COMPLETE / INTEGRATED / VERIFIED / RELEASE6_READY_FOR_OWNER_REVIEW.**

Take Fable's completed Release 6 (editorial flow and signature finish) exactly as it was built, bring
it onto current production main after Release 5, re-verify the combined tree, honour the owner's
three creative directions, and prepare one draft pull request for owner review. No design was
reopened, no implementation was replaced, no presentation copy was rewritten. Nothing is merged or
deployed: final owner publication approval is required.

## Provenance

| Item | Value |
|---|---|
| Production main (reverified before any change) | `b51c742b31dd519018d927e20af452327e0c7f53` (Release 5 integration, PR #32) |
| Fable Release 6 source branch, never modified | `claude/stoic-fermat-r3s6vx` @ `6e86f00fc2090d6c84d54f486528db0211f6f55a` |
| Fable's integration of main | `e83c7fd` (merged `b51c742` into their branch at handoff; no redundant merge performed here) |
| Merge base | `b51c742` itself — Fable's branch is strictly ahead of main; Release 5 and Release 6 have zero source-file overlap (only the generated `qa-reports/INDEX.md` is shared) |
| Integration branch | `mimo/skypi-release6-integration-20261020` in `~/Portfolio-codex/mimo-release6-20261020` (isolated worktree; `~/Portfolio` and Fable's branch untouched) |
| Recovery checkpoint taken before the merge | local tag `recovery/mimo-release6-start-20261020` at `b51c742` |
| Merge | `--no-ff` merge of `6e86f00` into the integration branch (`0c433c9`); Fable's seven commits preserved in history |
| Merged tree vs Fable's tree | **byte-identical** (both `47e8b083bf96ca9a6528c18c4a60636a706ff805`) before this receipt was added |

## Merge and content verification

`git merge --no-ff` produced **zero conflicts** (Fable had already reconciled `qa-reports/INDEX.md`
when merging main at `e83c7fd`). The merge commit's tree is byte-identical to Fable's final tree:
nothing of Fable's work was dropped, reshaped or re-authored.

**Source delta vs production main is exactly Fable's eight files** — `app/page.tsx`,
`components/CaseStudyCard.tsx`, `components/GalleryWall.tsx`, `components/ClauseBound.tsx` (new),
`components/clauseBound.module.css` (new), `components/readingGroup.module.css` (new),
`lib/clauses.ts` (new), `lib/__tests__/clauses.test.ts` (new) — plus Fable's QA evidence folder and
the regenerated `qa-reports/INDEX.md`. Every protected surface shows **zero changes** against
`b51c742`: `components/cinematic/**` (the GPU hotfix), `app/globals.css`, `tailwind.config.ts`,
`lib/motion.ts`, `Reveal.tsx`, `ThemeToggle.tsx`, `ProjectDoorwayButton.tsx`, `ProductReveal.tsx`,
`Button.tsx`, `HamburgerNav.tsx`, `SidebarRailLinks.tsx`, `ViewTransitions.tsx`, `lib/returnFocus.ts`
(Release 4 buttons and navigation), `lib/schema.ts`, `app/work/[slug]/**`, `CaseShowcase.tsx`,
`ShowcaseHero.tsx`, `lib/caseShowcase.ts` (Release 5 chapters and heroes), Flagstone/About/Contact
routes, `content/`, `public/`, workflows, dependencies.

Every changed source file was inspected line by line against Fable's section 4 table:

- `CaseStudyCard.tsx` — opt-in `editorial` prop (catalogue order, 460px measure, ClauseBound status,
  /65 numeral). The default path renders class for class as before; the facts block is the same
  markup relocated, and the seam check confirms the case-study and blog "Other work" cards render
  the default variant.
- `GalleryWall.tsx` — passes `editorial`, the reading-group class on the root, plates after the
  first pair arrive on their own clock (`Math.min(i, 1)`).
- `app/page.tsx` — only the `#work` band and one Record line changed: phone grid via the house
  `contents` idiom (DOM order unchanged), ClauseBound on status/note/Record counts, `break-words`
  on the row title, the scoped reading-group class, rows one stagger step behind the heading,
  `dark:opacity-50` on the band's decorative wash.
- `readingGroup.module.css` — the scoped 560ms clock, 16px travel and the keyboard-focus floor for
  exactly two consumers; existing tokens only; hidden-state rules scoped to `:not(.reveal-shown)`.
- `lib/clauses.ts` + `ClauseBound.tsx` + `clauseBound.module.css` — interpunct splitting with the
  24-character guard and the width-aware release (container query in `em`); visible characters
  byte-identical (round-trip test pins it).
- `lib/__tests__/clauses.test.ts` — round-trip, guard, "every shipped status holds its year",
  release-by-width shape.

## Owner creative directions (D1–D3), as implemented

1. **D1 — keyboard-focus repairs stay scoped to Release 6's reading groups.** The focus floor in
   `readingGroup.module.css` reaches exactly the home `#work` band and the `/work/` wall. The
   Record band's three links (`the record`, `the account`, `the statement`) still land focus while
   their row is faint — reproduced in both journeys (1440 and 393). Per D1 this is **not** repaired
   here; it is recorded below for the next accessibility campaign.
2. **D2 — the dusk-turn is unchanged.** No commit touches the turn; Fable's comparison retained the
   baseline and this integration re-runs it untouched (`lib/__tests__/dusk-turn.test.ts` green in
   the suite; the theme legs keep URL and scroll in both journeys; a rapid double toggle leaves no
   marker).
3. **D3 — the /65 wall numeral is kept.** Verified in the built DOM in both engines (computed ink
   `rgba(…, 0.65)` on all five plates, both themes) and in the rendered contrast probe (3.40:1 at
   the worst pixel of the dark 393 plate against the 3:1 large-text bar; /30 measured 1.8–2.1:1).

Fable's typography, the Work gallery hierarchy, the mobile project-index layout, the corrected
wrapping, the contrast changes and the reveal timing are preserved byte for byte (tree identity,
and the runtime checks below read them on the built export).

## Verification on the integrated tree (Release 5 + Release 6)

Environment: macOS, Node 24.15, Next 15, `playwright-core` 1.62.1 with the pre-installed Chromium
1234 and WebKit 2336, axe-core 4.11.4. Heavy runs executed sequentially. Headless browser runs are
rendering signals, not physical-device testing.

| Check | Result |
|---|---|
| `npm run typecheck` | clean |
| `npm run lint` (next lint + jsx-a11y) | clean (only the standing `headers`/`output: export` notice) |
| `npm run build` (static export + prebuild asset validation + postbuild prune/alias) | clean; `/work` First Load JS 125 kB (unchanged), route chunk 4.21 kB |
| Full build-backed suite (`vitest run` with `out/` present, as in CI) | **122 files, 1111 tests passed, 2 skipped (the same two labelled skips as main), 0 failed** — identical to Fable's merged-tree result |
| Responsive overflow census (`npm run check:overflow -- --widths 320,375,414`; 27 routes × 2 themes × 3 widths = 162 frames) | **no element crosses the viewport edge**; non-vacuity plant caught 162/162 |
| axe-core (2 surfaces × 2 themes × 1440×900 and 393×852@2) | **0 violations** page and scoped on all 8 frames (`integrated/a11y/axe.json`) |
| Rendered-pixel contrast of every touched text (same 64 probes as Fable) | **64 probes, 0 below threshold**; tightest passes: index summary 393 dark 4.57:1, index status row 03 393 dark 4.60:1, wall numeral 393 dark 3.40:1 (3:1 bar) (`integrated/a11y/contrast.json`) |
| Reduced motion and no-JS floors (2 surfaces × 2 themes × 2 sizes) | 0 reveals off rest, 0 running animations, 0 no-JS hidden on all 8 frames (`integrated/modes/report.json`) |
| Keyboard/pointer journey at 1440 (`integrated/journey/`) | hash arrival unchanged; five rows + `Featured: above` focus at full opacity with rings; Enter row 02 → Back restores scroll 6316→6316 and reseats focus at opacity 1; wall Back restores 1177, `data-wall-seen`, 0 plates replay; both theme legs keep URL + scroll and release the marker; contact path 6 stops, focus-visible; **0 page errors** |
| Keyboard/pointer journey at 393 (`integrated/journey-393/`) | same focus results (Back restores 6255→6255 on home, 1954 on the wall; 0 hidden plates); the harness's theme-toggle step cannot find the control inside the hamburger menu (tool limitation, not a product failure) |
| Phone theme toggle (separate targeted check) | found inside the hamburger menu at a 44×44 target, flips to dark, persists (`localStorage: dark`), leaves no turn marker, 0 page errors |
| Release 5 / Release 6 runtime seam (`integrated/seam-check.txt`) | **PASS** — all four Release 5 chapters render with their "Other work" cards on CaseStudyCard's default variant (/30 numeral, no facts block), while `/work/` renders all five plates in catalogue order with the /65 numeral |
| WebKit spot check (`integrated/webkit/`, 6 routes × 2 themes × 1440 and 393@2) | **24 frames, 0 failing**: no console errors, every laid-out image resolves, no overflow (plant caught 24/24). Wall assertions hold in WebKit: 5 plates, title above facts, numeral ink 0.65; index: 5 rows, 10 clause spans. Flagstone, About, Contact and a Release 5 chapter clean |
| Text-only 200% enlargement (`integrated/zoom-text/`, 2 surfaces × 1440 and 393) | 0 page errors; at 393 the clause hold releases to word wrapping and over-wide title words break instead of running under the year; nothing clips or overlaps (the ~196px equivalent viewport is below the 320px design floor, so the result is readable rather than composed) |

Independent regression review, stated explicitly: mobile visual/DOM reading order (DOM order
unchanged on both surfaces; the phone index's visual order is title, year, summary, facts, doorway
with the doorway `tabIndex={-1}`, so keyboard order matches the drawn order), keyboard focus (the
floor holds inside both groups at 1440 and 393), dark-theme contrast (64/64 probes pass, the wash
halved only in dark), text enlargement (the release-by-width guard works), Back navigation
(position and focus restored on both surfaces at both sizes), responsive wrapping (162-frame census
plus the boundary captures), and the scoped Reveal timing (reading-group clock confined to the two
groups; reduced-motion, print, seat, rearm and failsafe floors still `!important` and green).

### One benign, pre-existing artifact, recorded not hidden

Three reduced-motion frames show a small pixel difference between the 120ms and 1600ms captures
(4,159 / 1,681 / 18 px). Pixel bounding boxes place all of it in the **header hamburger button's
glyph mount** (top-right corner) plus 18 scattered hairline pixels: the icon paints after 120ms,
not an animation (0 running animations in the same probe). The header code is untouched by Release
6. Fable's final run read 0 on the same frames; the mount timing races between runs. Outside both
Release 6 surfaces on every frame.

## Evidence added by this integration

Everything under `qa-reports/release6-editorial-finish-2026-10-20/integrated/` is new, produced on
the integrated build on this machine: `a11y/` (axe, rendered contrast, both journeys), `modes/`
(reduced-motion and no-JS floors), `webkit/` (the cross-engine spot check and its tool),
`zoom-text/` (text-only 200%), `seam-check.txt`, and the WebKit instrument itself. Fable's
evidence folder is otherwise untouched — their captures, boards, motion recordings and tools are
byte-identical to their branch (tree identity proves it). `qa-reports/INDEX.md` was regenerated
from the staged tree (`npm run qa:index`).

## Known limitations (stated plainly)

- **This is not physical-device testing.** Headless Chromium 1234 and headless WebKit 2336 are not
  physical Safari, VoiceOver, an iPhone, a real 2× display or a real-device GPU session. The
  remaining device gates are the owner's: physical Safari and VoiceOver, real touch and scroll
  feel, GPU compositing of the dusk-turn, and the frame timing of the recorded motion.
- Real Firefox was not run (a Firefox build is present in the cache but the house instruments are
  Chromium/WebKit; the CSS used is baseline 2023 container queries with an explicit fallback).
- MP4 transcodes of any new motion runs do not exist (no libx264 ffmpeg on this machine); Fable's
  MP4s from the candidate remain the motion evidence and the motion code is byte-identical.
- The three faint Record-band focus stops (see below) remain open by owner direction D1.
- The text-only 200% phone result is readable, not composed (~196px equivalent, below the 320px
  design floor) — same as Fable reported.

## Carried to the next accessibility campaign (owner direction D1)

**Record band keyboard-focus floor.** The Record's three links (`the record`, `the account`, `the
statement`, home `#record`-band rows) receive focus while their row is still fading in; the
reading-group floor does not reach them because it is scoped to the two Release 6 groups per D1.
Fable's owner decision 1 proposed the alternative (one global `:focus-within` rule in `globals.css`
extending the floor to every Reveal) — that is a shared-primitive change and is deferred, not
rejected, to the accessibility-wide remediation campaign planned after Release 6. No factual-
accuracy or accessibility-wide remediation was started inside this release, per the brief.

## Owner decisions required

1. **Visual + copy acceptance** of Fable's Release 6 (D1 scoped focus floor as implemented, D2
   dusk-turn retained unchanged, D3 /65 numeral as implemented; no visible copy changed anywhere).
2. **Publication authorization** for the draft PR to merge into production main and deploy through
   the normal CI and GitHub Pages workflow.

No merge or deploy has been performed. No force push, no admin bypass.
