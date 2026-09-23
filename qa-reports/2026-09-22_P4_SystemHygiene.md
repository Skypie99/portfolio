# Portfolio 4.0 P4 — System hygiene

**P4_STATUS: PASS**

**P4_REGRESSION_GATE: PASS_WITH_INHERITED_LIMITS**

**Branch / worktree:** `perf/p4-system-hygiene` / `/Users/skypie/Portfolio-codex/p4-hygiene`

**BASE_COMMIT:** `b91c6ab619c32e2f873c2867ad37379e214a1bcc`

**BASE_TREE:** `f992e9c2f60abedd94ecdacbd67e365390630b80`

**P4_SOURCE_COMMIT:** `f5ded00d96bde8f4a3236548d942b735db0c8f39`

**CANDIDATE_ID:** `P4-SOURCE-TREE-abb1f1d57f71`

**CANDIDATE_TREE:** `abb1f1d57f7104d6973a84f1a35a6c3c6d605c58` (exact tree of the source commit; receipt, evidence, and `work/` excluded)

**IMPLEMENTATION_PERFORMED:** YES

**LOCAL SOURCE / RECEIPT COMMITS:** YES / YES (separate consecutive commits)

**PUSH / MERGE / DEPLOY:** NO / NO / NO

The requested branch and worktree did not exist. The worktree was created from the exact accepted P3 receipt commit; tracked status was clean before editing. No dependency was installed. The primary checkout was read only. Git also corrected a stale sentence in the primary `AGENTS.md`: at session start `main...origin/main` was `0 65` (local main behind), while that document says local main is ahead. No action was taken on either main.

Sky approved the exact candidate tree for local closure. The staged source contained only the 11 reviewed source/test paths; `git write-tree` equaled the approved candidate tree before the source commit. Protected cinematic, Runway, content, and showcase paths had no staged diff. The final QA below applies to that identical source tree, so it was not rerun for the receipt-only change. Scratch harnesses, raw profiling evidence, and unrelated QA artifacts were not staged.

## FILES_CHANGED

| File | P4 change |
| --- | --- |
| `app/globals.css` | Native sidebar scroll-timeline rule; remove only the inert sun's `will-change` declaration. |
| `app/page.tsx` | Render the identical contact glow markup through `AmbientDrift`. No editorial copy or project-index geometry changed. |
| `components/AmbientDrift.tsx` | Pause the contact glow and release its compositing hint outside a 400px viewport margin; resume its existing animation phase before re-entry. |
| `components/SidebarProgress.tsx`, `lib/motion.ts` | Use native root scroll progress where supported; retain the shared-frame custom-property writer as fallback. |
| `components/IntroSkip.tsx` | Move only the phone retirement observer's bottom margin by 80px; rebuild it when the viewport crosses 767px. |
| `components/ProjectDoorwayButton.tsx` | Remove the redundant 1px lift and make the existing terracotta dot contract during a real press. The shared row/flagship pill remains one component. |
| `components/SidebarSectionNav.tsx`, `components/HamburgerNav.tsx` | Distinguish two home-section destinations from same-worded full-page links in accessible names; visible wording unchanged. |
| `components/__tests__/IntroSkip.test.tsx`, `components/__tests__/SidebarSectionNav.test.tsx` | Assert the mobile-only observer margin and updated accessible names. |
| `qa-reports/2026-09-22_P4_SystemHygiene.md` | This receipt. |

`qa-reports/P4-SystemHygiene-evidence/` contains the raw measurements, compressed traces, targeted captures, asset inventory, and SHA-256 evidence index. `work/` contains local harnesses. Both directories remain untracked and were not included in the candidate source tree. The source tree and exact 11 source/test paths are recorded in `candidate-source-tree.json`.

## CURRENT_STATE_REVALIDATION — COMPLETE

The exact P4 baseline was built and measured **before source edits**. The baseline 70-step profile used Chrome 153.0.8010.54, 390×844, DPR 3, CDP CPU throttle 4×, scrollY 0→2532, and 84ms per step. Three fresh-page trials were collected. Browser `Performance.getMetrics` supplied `RecalcStyleDuration`, `ScriptDuration`, `LayoutDuration`, and `TaskDuration`; it does not emit `PaintDuration`, now recorded as `null` rather than zero. A separate matching before/after Chrome trace supplied Paint events and compositor observations. These headless measurements support a local architectural result, not a claim that visitors previously saw jank.

### Exact ownership discovery

| Requested owner | Current files / symbols |
| --- | --- |
| INTRO_SCROLL_WRITER_FILES | `lib/motion.ts` `useScrollProgress`, `useDayNight`, shared `motionFrame`; protected `components/cinematic/CinematicDesert.tsx` owns the GSAP/ScrollTrigger film timeline. |
| DAY_NIGHT_WRITER_FILES | `lib/motion.ts` `useDayNight` writes `--day-night` on `<html>`; `components/WorldBackdrop.tsx` mounts it; `app/globals.css` consumes it. Left unchanged after the measured target was met. |
| CDESERT_VARIABLE_WRITER_FILES | Protected `components/cinematic/CinematicDesert.tsx` writes `--cdesert-grade-mix` and `--cdesert-expose`; `app/globals.css` supplies their scene defaults and consumers. No source edit there. |
| CDESERT_SUN_OWNER | Protected `components/cinematic/CinematicDesert.tsx` retains the three nodes and `sunRefs`; `app/globals.css` owns their inert rule. |
| SIDEBAR_PROGRESS_OWNER | `components/SidebarProgress.tsx`, `lib/motion.ts`, and now the fallback/native rules in `app/globals.css`. |
| AMBIENT_LOOP_OWNER | `app/page.tsx` contact section and `app/globals.css` `ambient-drift`; its phase-preserving observer now lives in `components/AmbientDrift.tsx`. |

No `@property` registration existed or was added. The current sun was `opacity: 0`, `background: none`, 70vmax square, with `will-change: transform, opacity`. Its element remains load-bearing for existing scene references and positional data, so it was not removed. The P2 candidate inventory confirmed five inactive factory scenes, each with four files. The baseline project doorway pill had a 6px dot at rest, 8px on hover and press, and a -1px hover/press lift. The stripped desktop link list had two pairs of identical names with distinct home-section versus full-page destinations. The settled mobile Skip sweep reproduced opacity 1 overlap at scrollY 2220, 2240, 2260, and 2280.

## M056 — intro scroll budget

**M056_DISPOSITION: PASS.** The changing root `--scroll-progress` value materially reproduced the invalidation concern. The native timeline replaces that writer on supporting browsers; the JS fallback remains for others. The `--day-night` writer, cinematic variables, and cinematic source were not changed. Chromium and WebKit both measured progress transforms of 0, approximately 0.5, and 1 at root scroll fractions 0, 0.5, and 1, with no root `--scroll-progress` write. Under reduced motion the line stays at scale 0.

| 70-step 4× CPU profile | RecalcStyleDuration trials | Median total | Median per step | Median ScriptDuration | Median LayoutDuration | Median TaskDuration |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| M056_BASELINE | 0.962283 / 1.014289 / 0.997018 s | 0.997018 s | 0.014243 s | 0.059040 s | 0.000939 s | 1.547938 s |
| Native-progress intermediate | 0.130665 / 0.104158 / 0.094933 s | 0.104158 s | 0.001488 s | 0.050710 s | 0.001320 s | 0.524971 s |
| M056_AFTER, all P4 changes | 0.105181 / 0.146806 / 0.135518 s | 0.135518 s | 0.001936 s | 0.066714 s | 0.000958 s | 0.629148 s |

**M056_NORMALIZED_DELTA / M056_RECALC_REDUCTION:** 86.41% lower median total and per-step style-recalculation duration, above the 40% target. Script duration did not improve in the final three-run median; this receipt does not claim that it did. The trace's single matching run recorded Paint event duration 68.386→49.911ms and `Layerize` 142.616→102.507ms; these are supporting observations, not acceptance percentages. Trace instrumentation adds overhead. Headless `LayerTree` emitted no layer list, so layer count and specific GPU promotion were not directly measured.

## M025 — inert compositing hint

**M025_DISPOSITION: PASS.** Only the sun's static `will-change` declaration was removed, outside `components/cinematic/**`. The three nodes, selectors, geometry, opacity, stacking position, and scripted references remain. Computed `will-change` changed from `transform, opacity` to `auto`, while computed opacity remained 0 and background remained none. No unnecessary promotion can now be requested by that hint. Direct GPU-layer attribution was unavailable in headless CDP; this is an instrumentation limit, not a measured layer-count reduction. **PROTECTED_CINEMATIC_EXCEPTION_REQUIRED: NO.**

## M052 / M057 — ambient scope

**M052_M057_IDLE_ARMS / AMBIENT_REENTRY_RESULT: PASS.** At 390×844 DPR 3 with no CPU throttle, eight-second baseline idle arms were: shipped 480 style recalculations / 0.051258s recalc / 0.468042s task; ambient paused 110 / 0.016478s / 0.301754s; all paused 110 / 0.039989s / 0.334977s; reduced motion 0 / 0s / 0.164407s. After the observer, shipped off-screen idle measured 112 / 0.014455s / 0.278029s, near its paused arm's 111 recalculations. Task duration varies between these short runs; no CPU-percent claim is made.

The glow is not deleted. The observer pauses it only when the contact section is more than 400px away and restores `animation-play-state: running` before re-entry. A nearby leave/re-enter test recorded animation `currentTime` 1033.17ms while paused and 1033.17ms again 700ms later; immediate re-entry advanced to 1083.26ms, not zero. The transform continued from scale 1.04014 to 1.04015. The targeted immediate and settled re-entry captures show no glow pop, flash, or phase reset. The existing CSS reduced-motion bypass remains.

## M032 / M027 — tactile language

**M032_M027_TACTILE_RESULT: PASS.** The shared homepage/flagship `View project` pill keeps the existing dot, border, background, radius, and 44px target. Its redundant 1px lift is gone. On both 390px and 1440px Chromium pointer runs, the dot measured 6px at rest, 8px on hover, and 6px during an actual `mouse.down()` press; the pill's transform stayed `none`. Baseline press held at 8px with transform `translateY(-1px)`. A keyboard focus run still matched `:focus-visible` with a 2px outline. The project index remains editorial rows; no extra dot was forced onto title links, sidebar navigation, or the featured slot. `components/Button.tsx`, including the Contact button, is byte-identical to base. Easing and other press languages were not changed.

## M026 — owner-scoped mobile Skip retirement

**M026_BASELINE:** four settled 20px samples at scrollY 2220–2280 had Skip opacity 1 while its rect intersected `[data-hero-identity]`.

**M026_AFTER / M026_MOBILE_SWEEP: PASS:** the mobile observer's bottom root margin is 80px larger; its first retired sample is scrollY 2220. In the complete 2020–2460 sweep at 20px resolution, no settled sample had opacity >0.05 and overlap. At first retirement the remaining film stage is about 312px of an 844px viewport, less than half. The sweep records every scrollY, settled opacity, Skip and identity rect, intersection, and retirement attribute.

**M026_DESKTOP_PRESERVE: PASS:** desktop observer margin is unchanged. Eight of eight Chromium/WebKit × mobile/desktop × standard/reduced Skip journeys passed. Desktop `#hero` lands at top 0; mobile lands with `#hero` top -360px and identity in frame. The `scroll-margin-top: -360px` rule remains. Pin duration and cinematic code were not touched.

## M050 / M051 — minor accessibility polish

**M050_M051_RESULT: PARTIAL.** The duplicate stripped-link names were reproduced before editing: `A Brief Account` linked to both `/#about` and `/about/`; `Let’s talk` linked to both `/#contact` and `/contact/`. The in-page sidebar and mobile-menu links now announce “home page section,” while visible wording and full-page link names remain unchanged. Their accessible names retain the visible labels. The 32-route/theme axe sweep found no new issue.

The optional border comfort adjustment was left alone. Current shared doorway-pill border/background contrast measured 2.956:1 light and 2.314:1 dark; the identifying text/dot and unchanged focus ring remain the cues. Changing the shared border token would also change protected button appearances across the site, including Contact. This is not reported as an accessibility compliance repair. The established focus-ring check passed four light/dark × 393/1440 samples with a minimum sampled ratio of 4.088:1, above the 3.09:1 prior floor.

## PR34_ASSERTION_BEFORE / PR34_ASSERTION_AFTER and preservation

| Invariant | Before | After | Result |
| --- | --- | --- | --- |
| Desktop `.pin-spacer` padding bottom / `#hero` offset | 2520px / 3420px | 2520px / 3420px | PASS |
| Mobile `.pin-spacer` padding bottom / `#hero` offset | 1688px / 2532px | 1688px / 2532px | PASS |
| Accepted stage duration expression | 380vh desktop / 300vh mobile | Same; `components/cinematic/**` byte-unchanged | PASS |
| P1 hero heading at 1440 / 1920 / 2560 | 3 lines, 1007.422px width, 264px height at each | Same at each | PASS |
| First frame / sampled film | Five same offsets (0/600/1200/1800/2400) before and after on mobile and desktop | First mobile frame pixel-identical; other captures visually retain composition, with small trace/scrub timing pixel variance | PASS, no visible cinematic change |

**P1_HERO_WRAP_REGRESSION: PASS. REDUCED_MOTION_RESULT: PASS. P1_REGRESSION_RESULT / P1_CORE_REGRESSION: PASS. P2_REGRESSION_RESULT / P2_REGRESSION: PASS. P3_REGRESSION_RESULT / P3_REGRESSION: PASS.** The accepted P1 source repairs remain; the separate cinematic LCP issue remains `DEFERRED_TO_CONTROLLED_EXPERIMENT`. P2 active illustrations, Ghost Code media, Dashboard media, factory registry, and manifest have no diff. P3 case-study content, narrative order, gallery dating, `#how-i-work` text, and the documented proof-distance exceptions are unchanged. No attempt was made to alter those closed exceptions. `/runway/` remained HTTP 200 with one `Hi, Runway.` H1 and zero console/page errors.

## Factory candidate hygiene

**SHOWCASE_TREE_BEFORE / SHOWCASE_TREE_AFTER:** 8,656,372 bytes / 8.25536 MiB, unchanged; below the 10 MiB hard cap. **INACTIVE_ASSET_CLASSIFICATION:** `assets.json` classifies all 20 suspected P2 outputs (five scenes × two themes × AVIF/WebP) as `FACTORY_REFERENCED_INACTIVE`: every file appears in the generated manifest, every scene appears in `scripts/showcase/registry.mjs`, none is an active `content/deliverables.json` application asset, and the P2 receipt records their source relationship and inactive status. No output met `UNREFERENCED_GENERATED_CANDIDATE`. Their total is 239,443 bytes; even deleting all 20 alone would leave 8,416,929 bytes / 8.027 MiB. **SHOWCASE_SOFT_TARGET_RESULT: DEFERRED_SAFE.** No file or manifest was deleted or hand-edited; factory-scene deletion would be a separate P2 decision and still would not meet 8 MiB by itself.

## Gates and evidence

| Command | Actual result |
| --- | --- |
| `npm run lint` | Exit 0; `✔ No ESLint warnings or errors`. Existing Next lint deprecation and static-export header notices printed. |
| `npm run typecheck` | Exit 0; `tsc --noEmit`. |
| `npm test` | First run exited 1: seven `Sidebar.test.tsx` cases failed with `TypeError: CSS.supports is not a function` in jsdom. A function-availability guard fixed that. Final run exit 0: 101/101 files, 905 passed, 2 skipped. Existing `fetchPriority` React test warning remained. |
| `npm run build` | Exit 0; Next 15.5.25 compiled and exported 26 static pages; postbuild prune/OG steps completed. Existing export-header notice printed. |
| `npm run test:static` | Exit 0; rebuild complete, 2/2 files, 55 passed, 1 skipped. |
| `node work/p4-measure.mjs before`, `node work/p4-measure.mjs native-progress scroll-only`, `node work/p4-measure.mjs after` | Exit 0; three identical 70-step trials per source state, idle arms and targeted visuals for before/after. |
| `node work/p4-trace.mjs` | Exit 0; matching 70-step Chrome traces, compressed raw traces and event summary saved. |
| `node work/p4-interaction.mjs`, `node work/p4-ambient-near.mjs` | Exit 0; Chromium/WebKit progress, pointer press and focus styles, ambient phase continuity and re-entry captures saved. |
| `node work/p4-skip.mjs` | Exit 0; 8/8 engine × width × motion Skip journeys. |
| `node work/p4-focus-ring.mjs` | Exit 0; 4/4 focus samples, minimum 4.088:1. |
| `node work/p4-smoke.mjs` | Exit 0; Skip in first three keyboard stops and viewport on 10/10 width/theme frames; `/runway/` HTTP 200, one H1, zero errors. |
| `node work/p4-sweep.mjs` | Exit 0; 32/32 axe runs across 16 routes × two themes, zero violations; one H1 in all 48 route/theme/motion cases; max CLS 0.001812; reduced-motion animations 0. Only inherited `/archive/` console errors and `/accessibility/` motion-text difference. |
| `node work/p4-overflow.mjs --widths 320,393,768,1440,2560` | Exit 0, twice; final harness verified that the served homepage bytes equal this worktree's built `out/index.html`. 160/160 frames: no visible element overhang; non-vacuity plant caught 160/160. The root `scrollWidth` reading remains vacuous under `overflow-x: clip` and was not used as proof. |
| `git diff --check`; `git diff --quiet HEAD -- components/cinematic public/cinematic content/deliverables.json content/showcase.manifest.json scripts/showcase/registry.mjs app/runway public/runway` | Both exit 0; no whitespace errors and no protected-path diff. |

**VISUAL_EVIDENCE_INDEX:** `qa-reports/P4-SystemHygiene-evidence/evidence-index.json` lists 39 targeted PNGs, the measurements, traces, asset classifications, and SHA-256 hashes. The 20 film images are the required five identical offsets × desktop/mobile × before/after; six hero captures cover 1440/1920/2560 before/after; the rest cover doorway states, focus rings, and nearby ambient re-entry. The film mid-scroll PNGs are not byte-identical because time-based GSAP scrub and capture settlement introduce small pixel variation; the visible scene composition and accepted geometry were inspected and preserved.

## BLOCKED_ITEMS / UNASSESSED_ITEMS / inherited limits

**BLOCKED_ITEMS:** none.

**UNASSESSED_ITEMS:** direct physical GPU-layer promotion (headless CDP `LayerTree` returned no layers); native Safari/VoiceOver and physical-device acceptance; the separate P1 cinematic LCP controlled experiment. The single-run paint trace is not a statistical paint-performance acceptance claim.

**INHERITED_UNASSESSED_LIMITS:** `/archive/` console limitation; `/accessibility/` motion-text difference. Neither was introduced or reclassified as a P4 failure.

## DECISIONS FOR SKY

No decision remains for P4 closure. Sky approved the 11-file source candidate and accepted these deferrals: the optional M050/M051 border comfort adjustment, the 8 MiB showcase soft target (`DEFERRED_SAFE`), and P1 cinematic performance (`DEFERRED_TO_CONTROLLED_EXPERIMENT`). The inherited `/archive/` console and `/accessibility/` motion-text limits remain unassessed. Any future push, merge, deployment, or P5 work requires a separate owner decision. P4 stops with the local receipt commit.
