# SkyPi Release 4: approved interaction integration (2026-10-19)

**Status: CANDIDATE_PREPARED / INDEPENDENT_REVIEW_COMPLETE / FINDINGS_OPEN / INTEGRATION_PENDING / NOT_OWNER_RELEASE_ACCEPTED / NOT_DEPLOYED.**

The approved press language is implemented on an isolated candidate. Typecheck, lint, production build, build-backed full tests and all four GitHub CI jobs pass. Independent browser review also found inherited defects and validation limits. This receipt does **not** grant release readiness or certify WCAG conformance.

**Draft PR:** [#28](https://github.com/Skypie99/portfolio/pull/28). Design approval is already granted by Sky's assignment. The historical `OWNER_REVIEW_PENDING` wording in the retained Fable receipt is superseded for design approval only.

## Exact provenance and isolation

| Item | Verified value |
|---|---|
| Repository | `Skypie99/portfolio` |
| Fresh remote main and candidate base | `78169e94c9f2b9810d3c9cdb18c54b0cacb7e297`, Release 2 PR #27 merge |
| Immutable source | `ae15dd1f65cec036dab2c534c9cec88f915209ca` |
| Source implementation commit | `ec85a07`, followed by receipt commit `ae15dd1` |
| Source common ancestor | `b3e992bddf31daa86a4d471b1c38ad47f45802e7`, before Release 2 |
| Isolated branch | `codex/skypi-release4-interactions-20261019` |
| Exact final application candidate tested and published | `fbb84c6fb0b8a607da7297d04bd99c9c94fa28d2` |
| Candidate tree at that SHA | `677ef3ebf925a4947fa9d3cc7cee126489085faf` |
| Cloud checkout | `/workspace/scratch/1b1252c73ace/skypi-release4-interactions-20261019` |

The initial local integration commits were `1ebe240d10ef931e82af03b2a1e6c268603c6313` and `c33dbff31fb0dace6a32468a6720d0a62749408f`. Direct `git push` failed because this public clone has no CLI credentials. The connected GitHub Git Data API published an identical tree as `5f433a0b46559f7f4d0712c4ae796ce1a1105d47`, then the shadow correction as `fbb84c6`. Remote tree equality was verified before updating only the authorized candidate ref. The checkout was aligned to that remote SHA before its final build and full suite. Later receipt/evidence commits change documentation and QA artifacts only; the tested application SHA above remains the precise application snapshot.

`AGENTS.md` was requested before reading `CLAUDE.md`; it is not tracked on remote main. The cloud checkout cannot read the Mac's untracked file, so the explicit assignment floor and tracked `CLAUDE.md` apply. No primary Mac checkout, Release 3 worktree, hotfix worktree, Claude memory, career files or other branch was edited. Builds ran sequentially in the cloud, independently of the owner's Mac.

## What changed and why

Only these application/test files differ from the verified base:

- `components/Button.tsx`: 8px to 6px pressed dot, deeper default accent, important terracotta border and 10% tint, 90ms press-in, gated hover, distinct keyboard invitation, transparent native tap highlight. The press transform remains non-important so an inline magnetic transform wins.
- `components/ProjectDoorwayButton.tsx`: 6px to 4px pressed dot, the same tint/border/timing grammar, gated hover and retained keyboard ring. No new caller styling escape hatch.
- `components/HamburgerNav.tsx`: the approved trigger/close/item press grammar. Independent measurement additionally required `min-h-11` on menu links: the source and main rendered 33.6px targets on phones; the candidate now measures at least 44px.
- `components/SidebarRailLinks.tsx`: consequential hover-gate alignment, plus an important shadow withdrawal on the current Contact route. The custom `shadow-soft` class survived class merging and won the compiled cascade without that correction. The transform withdrawal remains non-important.
- The three associated Button, ProjectDoorwayButton and HamburgerNav test files from the immutable source.

The source patch applied without conflicts because Release 2 had not changed these target files. No historical tree replacement, unrelated cherry-pick, global CSS edit, token/config/content edit or additional dependency was imported. The source receipt and 64 evidence files were retained byte-for-byte. `preservation.json` records all 65 blob matches and protected object IDs. `qa-reports/INDEX.md` is generated with the real repository generator.

## Source claims versus independent findings

| Source claim | Independent result |
|---|---|
| Build, typecheck, lint pass | Repeated on final application SHA `fbb84c6`; pass |
| 109 files / 974 passed / 2 skipped | Historical source count. Fresh-main composition: **114 files / 1,027 passed / 2 skipped** |
| 14 meaningful baseline-failing new regressions | Reproduced exactly: **14 failed / 19 passed** against fresh-main components; all 33 pass after integration |
| 39 comparison sheets | All 39 files present and retained; representative desktop/phone, light/dark, focus, hold, release and cancel images inspected with raw measurements and sequence strips |
| Zero axe violations on source surfaces | Source raw files contain 10 scans per build with zero reported violations. Expanded independent candidate coverage has **106 scans: 104 clean, two scans with the same inherited table violation** |
| Touch controls return fully to rest | True for tested Button and flagship doorway surfaces. **Work-row dot restoration is incomplete:** source raw `after.measurements.json` itself records 6px at rest and 8px after release at 393 light. Independent candidate testing reproduces it |
| Cancellation behavior follows CSS | Native/automation distinctions matter. The standard CDP touch path scrolls and emits touch `pointercancel`, but never held `:active`; the touch-from-mouse path holds the pressed style but did not scroll in the independent probe. These cannot be combined into proof of a physical held-press-to-scroll cancellation |

## Commands and results

Commands ran from the isolated checkout. Exact timestamps, durations, exit codes and logs are in the evidence archive and `summary.json`.

```bash
cd /workspace/scratch/1b1252c73ace/skypi-release4-interactions-20261019
export PLAYWRIGHT_CHROMIUM_EXECUTABLE=/workspace/scratch/1b1252c73ace/browser-runtime/chromium
npm ci
npm test -- components/__tests__/Button.test.tsx components/__tests__/ProjectDoorwayButton.test.tsx components/__tests__/HamburgerNav.test.tsx components/__tests__/Sidebar.test.tsx components/__tests__/TapTargets.test.tsx app/__tests__/flagstone-cta-parity.test.tsx lib/__tests__/ember-large-text.test.ts --maxWorkers=2
npm run typecheck
npm run lint
npm run build
npm test -- --maxWorkers=2
npm run check:overflow -- --widths 320,393,1440
npm run qa:index
npm run qa:index:check
```

| Check on final application snapshot | Result |
|---|---|
| Focused regressions | 7 files / 52 passed |
| Typecheck | Exit 0 |
| Lint | Exit 0, no ESLint warnings/errors; existing Next deprecation/static-header notices retained |
| Production export | Exit 0; postbuild pruning and OG aliases completed |
| Full suite, **after** build | 114 files / 1,027 passed / 2 skipped / 0 failed |
| Build-dependent guards | Executed against `out/`; the two skip counts are inactive missing-build marker tests, not omitted built-output guard suites |
| Overflow census | **162 frames / 27 routes / two themes / three widths; zero overhanging elements** |
| Overflow instrument negative control | Planted overflow caught in 162/162 frames; the scrollWidth shortcut was correctly labelled vacuous in 132 frames |
| Export route presence | All 27 built index routes served HTTP 200, including existing redirect stubs; redirects followed for scans |
| Axe | 26 route entries excluding the archive auth island, two themes, two widths, plus two open-menu scans = **106**. One violation ID on one inherited page in two phone scans |
| Candidate page console/hydration errors | Zero recorded in the 14 interaction profiles and expanded Chromium scan |
| GitHub CI | Lint, Typecheck, Test and Build all successful for `fbb84c6`; [run 39246329484](https://github.com/Skypie99/portfolio/actions/runs/39246329484) |

The public-repository workflows were inspected before opening the authorized draft PR. Only existing CI was triggered. Deploy is restricted to successful main push CI or a manual dispatch; neither was performed here.

## Actual browser/input matrix

Host: **Ubuntu 24.04.3, Linux 6.18.55, x86_64**, Node 24.19.0, Playwright Core 1.61.1. All browser sessions were headless. The WebKit user agent advertises a Mac/Safari identity, but its actual host is Linux.

| Engine | Viewports, themes | Input and motion actually exercised |
|---|---|---|
| Chromium **153.0.8010.0** | 1440x900, 393x852, 320x568; light/dark | Mouse/keyboard at 1440; CDP touch-from-mouse held-state ladder under hover:none/coarse at phone widths; normal motion. Six candidate profiles and six fresh-main reference profiles |
| Firefox **153.0** | 1440x900 and 393x852; light/dark | Mouse/keyboard, hover:hover/fine at both widths. The 393 viewport is responsive layout, **not touch emulation**. Four candidate profiles |
| Playwright WebKit **26.5** | 1440x900 and 393x852; light/dark | Mouse/keyboard held-state ladder; phone context reports hover:none/coarse. Four candidate profiles. No held physical touch claim |
| All three engines | 393x852; light/dark | Reduced-motion held press and native disabled-control CSS fixture |
| All three engines | 393x852, default light | JavaScript disabled: native doorway navigation and browser Back |
| Chromium and WebKit | 393x852 | Playwright touchscreen taps through doorway and menu navigation, then Back; normal motion |
| All three engines | 1440x900 | Keyboard Enter from a work title, route arrival, Back and focus restoration check |

Firefox required disabling its content/RDD/GMP/socket subprocess sandboxes for this constrained container and setting `security.sandbox.content.level=0` in the temporary test profile. No owner browser or deployed security setting changed. Chromium used a packaged headless binary after standard browser downloads failed. WebKit runtime libraries were installed in the cloud only. These environment details limit extrapolation to normal desktop installations.

No real Mac Safari, iOS Safari, Android Chrome, physical phone or real hybrid laptop was tested. Hybrid devices reporting hover:hover can still keep touch-induced hover; the approved CSS gate does not discriminate input source on those devices.

## Independent review and unresolved findings

**R4-F01, fixed: phone menu targets.** Main/source Home link measured 33.59375px high. The added minimum height now measures 44px or more for all eight links, in both themes across all three engines (48 individual link measurements at 393px). The 320px Chromium ladder also measures its tested menu item at 44px. Labels, links, semantic controls and dialog behavior are unchanged.

**R4-F02, fixed: Contact self-link shadow withdrawal.** Before correction the computed Contact CTA shadow remained the custom soft shadow despite `shadow-none`. Final candidate all-engine desktop checks confirm the withdrawal, with the transform still at zero. This was a computed-style finding that class-string tests alone missed.

**R4-F03, open/inherited: work-row touch hover residue.** Four Chromium phone/theme profiles fail the explicit dot-restoration assertion: 6px rest, 4px held, **8px after release**. Pill fill/border restore. The existing `#work ol > li:has(a:hover)` dot rule in `app/globals.css` bypasses the component hover gate. It is also present in the source's own raw measurements. The unapplied `proposed-row-hover-followup.patch` gates only global hover cues, retaining focus/press cues. This changes a file outside the assignment's integration allowlist, so it is review material only.

**R4-F04, open/inherited: keyboard access to a horizontally scrolling table.** Axe `scrollable-region-focusable` on `.table-wrap` at `/flagstone/accessibility/`, width 320, light and dark. The standalone HTML has SHA-256 `facbedf889f73d8a9ee3bcf9711ea2f77585f50bd2a021b70c3995b6dca81a32` in both fresh-main and candidate exports; the entire public tree is unchanged. `proposed-table-keyboard-followup.patch` is an unapplied, labelled focusable-region correction. Zero violations on the interaction surfaces is not site-wide accessibility certification.

**R4-F05, open/inherited: Firefox keyboard return focus.** Navigation and Back reach the correct route and scroll area, but the activated work-title link does not regain focus in headless Firefox. Reproduced in separate fresh-main and candidate contexts after allowing route arrival and return to settle. Chromium and WebKit pass the settled sequence. Return-focus code is unchanged and outside this integration. It needs a focused navigation investigation and normal Firefox confirmation before claiming complete cross-engine focus restoration.

**Cancellation limitation, not closed:** 18 Firefox ladder assertions retain `:active` after an automated native link drag and release. A separate baseline/candidate probe records `dragstart`, `pointercancel`, `dragend`, no pointerup/mouseup, and the retained state even after Escape in both builds. Ordinary held-press release clears in the ladder. This may involve Juggler's native-drag input path; the evidence does not establish physical Firefox drag behavior. No assertion was removed or reported as passed.

The primary ladder contains **772 candidate assertions, with 28 raw failures**: four row restoration findings, 18 Firefox drag-release observations, four Firefox close-focus helper failures, and two WebKit menu-exit timing checks. The latter six were checked again using real keyboard sequence and completion of the existing exit animation: native Shift+Tab to Close visibly focuses in all engines, and every menu exits after navigation. They are harness-sequencing observations, with the original failures retained. Separate held reduced-motion sampling confirms 6px dot and 0.00001s transitions in all engine/theme pairs; early pre-paint readings are retained rather than silently relabelled. Detailed results and supplemental assertions are in the archive.

The standard touch probe scrolled from 4416 to 4521 and emitted touch pointercancel, but never held `:active`. The alternate path held a 4px dot but did not scroll and only cleared on release. **Physical immediate feedback and held-touch-to-scroll cancellation remain unverified.** Mouse drag-away may keep the press until release. No JavaScript listeners were added to change native interaction ownership.

## Evidence and preservation

- [`2026-10-19_InteractionRefinement.md`](2026-10-19_InteractionRefinement.md) and its immutable `2026-10-19_InteractionRefinement-evidence/`: 39 source sheets, five strips, three recordings, before/after measurements, source axe scans and harnesses. Their historical baseline is `b3e992b`, not the Release 2 base.
- [`2026-10-19_Codex_Release4Interactions-evidence/summary.json`](2026-10-19_Codex_Release4Interactions-evidence/summary.json): exact commands, independent counts, assertions, findings and browser profiles.
- Four `comparison-1440-{light,dark}.png` / `comparison-393-{light,dark}.png` boards in that directory: **actual independently captured fresh-main versus candidate frames**, including the unresolved row state. Images arrange captures; they are not generated mockups.
- `raw-evidence.zip` in that directory: retained independent JSON, logs and frame bank, including failed/early numerical diagnostics. It contains **624 files**, verified against `raw-manifest.json` by SHA-256. The final candidate matrices contain **438 state readings across 14 profiles**. Extract beside the archive to resolve internal `frames/` links.
- `harness/independent-browser.mjs`, `harness/audit-production.mjs`, `harness/resolve-observations.mjs`: reproducible production-output instruments. They spawn the tracked **Node** static server on ephemeral loopback ports. No Python HTTP server was used.
- `preservation.json`: protected path/tree equality and all retained immutable source blobs.
- Two `proposed-*-followup.patch` files: review-only proposals. `git apply --check` passes for both; neither was applied.

Protected object equality covers `app/`, `components/cinematic/`, `IntroSkip`, `MagneticButton`, `lib/`, `content/`, `public/`, workflows, Next/Tailwind configuration and dependency manifests. This preserves Release 2 homepage/About/Contact/cinematic, Float, Tokyo Through Time, Flagstone, existing aliases and other routes. No auth, archive, database, artwork or privacy code changed. No secret values were handled or printed. The live desktop rectangular rendering dropout remains owned by the cinematic hotfix investigation; these headless checks do not resolve that GPU/compositor defect.

## DECISIONS FOR SKY

1. **Scope of inherited follow-ups.** Recommend authorizing the two prepared global-row-hover and table-keyboard patches as a separate bounded follow-up, plus a focused Firefox return-focus investigation. Reason: these files/behaviors lie outside the explicitly approved component integration scope, and the current evidence cannot support complete touch restoration or a clean AA claim. Alternative: keep Release 4 draft while another assignment resolves them. Impact: the interaction candidate stays reviewable without silently extending this assignment into global styles or utility/navigation code. The proposals are concrete and check cleanly; their actual application still requires independent verification.
2. **Publication remains Sky's decision after final composition.** Recommend retaining draft status until inherited findings and real-device gaps are resolved or explicitly adjudicated, the hotfix and Release 3 have actually published, and the final rebase/retest succeeds. Alternative: defer Release 4. No decision is requested about the already-approved 4px doorway dot, accent-hover, 10% tint or press timing.

## Release sequence and concrete continuation

Remote main was re-read during preparation and still identified the Release 2 merge. The cinematic hotfix and Release 3 were not yet on main. Their local chat/worktree state is not treated as publication evidence.

1. Retain this isolated branch and draft PR #28. Do not merge, auto-merge or deploy it.
2. Adjudicate/resolve R4-F03 through F05 and confirm real Safari/iOS/Android press, release, touch scroll cancellation, Back and keyboard focus. Track Firefox native-drag limits honestly.
3. After both the cinematic hotfix and Release 3 have actually published, read their merged/main and deployment evidence, then fetch fresh remote main in **this isolated checkout**. Record exact dependency and base SHAs. No work on their branches or worktrees.
4. Rebase only this candidate, preserving a recovery ref first. Resolve only interaction-scope conflicts; review overlap in HamburgerNav/Sidebar and the shared doorway. Re-run the real QA index generator after staging regenerated receipts and evidence.
5. Run focused regressions, typecheck, lint, a fresh production build, then full tests against that output. Re-run meaningful full interaction, axe, overflow, native keyboard, no-JS, reduced-motion, route and device checks against the **resulting exact SHA**, including any separately authorized fixes. Earlier green CI or this candidate's evidence does not accept that later composition.
6. Record the new source/base/SHA, CI state and remaining findings, then return the concrete release decision to Sky. Only Sky controls publication.

Lifecycle distinction: **design approved; candidate prepared and independently reviewed with findings; integration not accepted; final owner release approval outstanding; no deployment performed.**
