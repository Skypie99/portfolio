# Phase 07 — Intro Handoff Gate Receipt

## Gate status

```text
PROMPT_ID: SKYPI-PORTFOLIO-3.0-P07
PHASE: 07 — Narrow-Screen Intro Handoff and Interaction Precision
OWNER_VISUAL_APPROVAL: YES — 2026-09-05, “approve Phase 07 visual”
INTRO_HANDOFF_GATE: HOLD — THIRD DEVICE REPAIR AND OWNER COPY UPDATE AWAIT IPHONE SAFARI RETEST
SAFE_TO_INTEGRATE: NO — evidence gaps listed below remain
NEXT_PHASE: NOT AUTHORIZED
REMOTE_MUTATIONS: NONE
PUSH: NO
MERGE: NO
DEPLOY: NO
```

Sky approved the final visual candidate before the local source commit. The original candidate is locally committed and all available source/build/test gates below passed. This receipt deliberately does **not** issue `INTRO_HANDOFF_GATE: PASS`: owner-supplied mobile Safari evidence found a cinematic rendering defect and handoff-position defects. The first repair fixed landscape on the physical device but did not remove the portrait band and left the portrait landing lower than desired. The second repair must be rerun on the physical device; a local commit and non-iOS browser measurements do not establish a PASS.

## Identity, lineage, and worktree safety

| Field | Evidence |
| --- | --- |
| Repository | `Skypie99/portfolio` |
| Origin | `https://github.com/Skypie99/portfolio.git` |
| Phase 07 branch | `codex/portfolio-3.0-phase07-20260905` |
| Isolated worktree | `/Users/skypie/Portfolio-codex/portfolio-3.0-phase07-20260905` |
| Expected Phase 07 base SHA | `ec82ece9b056688970c14805ed05290b986b4149` |
| Actual Phase 07 base SHA | `ec82ece9b056688970c14805ed05290b986b4149` |
| Expected / actual base tree | `2b340e9b6b6cb0e95b17501f0ede6d94382d3cc9` |
| Candidate source commit | `d1c15f9cd33051edff3f053ad20c4b2ce0c1cfe4` — `fix(intro): complete narrow-screen handoff` |
| Candidate source tree | `22976504f4338ef500f2885f5f3ab6231ce8f2ed` |
| First device-repair source | `a53195326aae13adfabea07dbb6cddbfe7f428a1` — `fix(intro): repair iPhone Safari handoff` |
| Second device-repair source | `0679c4f79c52cd49b50ac85f4b93d6f136c63c0c` — `fix(intro): harden iPhone cinematic handoff` |
| Phase 06 predecessor worktree | remained on `ec82ece9b056688970c14805ed05290b986b4149`; not mutated |
| Initial phase-writer state | clean Phase 06 base; no source mutation before intake passed |
| Final candidate state before this receipt | clean after the source commit and committed-candidate verification |
| Interrupted Git operations | none observed in the Phase 07 writer |

The primary checkout and every other worktree were left untouched. No reset, rebase, merge, stash, cleanup, branch deletion, remote fetch, push, visibility change, deployment, or production action occurred in this phase.

## Approved local candidate

### Changed source and tests

- `app/globals.css`
  - Adds only a `max-width: 767px` native-fragment landing margin on `#hero`: `-220px`, with `env(safe-area-inset-top)` in the overriding declaration.
  - Adds a keyboard-only focus-visible outline to the existing visible hero identity block.
- `app/page.tsx`
  - Makes the existing `#hero` fragment destination programmatically focusable via `tabIndex={-1}` without making it a normal Tab stop.
- `components/Hero.tsx`
  - Marks the existing identity block as the visual focus-cue target. It changes no copy, hierarchy, or layout.
- `components/__tests__/IntroHandoff.test.ts`
  - Adds source-contract guards for the sub-768 CSS scope, native focusable fragment target, and visible focus cue.
- `components/__tests__/IntroSkip.test.tsx`
  - Guards the real native fragment link and rejects bespoke scroll/history/focus ownership.
- `components/__tests__/ViewTransitions.test.tsx`
  - Guards that the exact `/#hero` link is not intercepted by View Transitions.

In the original `d1c15f9` candidate, `components/cinematic/**`, first-frame copy, support-first role sentence, tablet/desktop CSS layout, routes, dependencies, production configuration, and remote state were untouched. The later second device repair is separately disclosed below.

## Owner-supplied iPhone Safari evidence and repair candidate — 2026-09-07

### Observations supplied by the owner

The owner supplied six physical-iPhone Safari captures after using the local site. They establish these real-device observations:

1. The initial portrait intro and the intended portrait handoff composition are visually understood and recorded.
2. During the portrait cinematic, a wide pale/beige strip exposed beneath the film. It should not be visible.
3. In short landscape, native Skip Intro landed at the top of `#hero`, leaving the identity block at or below the visible fold and the headline off-screen. The owner supplied the intended landscape composition: the identity block and headline must both arrive visibly.

The address bar shown in the captures is the bare local IP (`10.0.0.22`) rather than the previously issued numbered static-server URL. A later read-only attempt to reach that bare-IP endpoint failed after the temporary server was gone, so the capture's exact served HTML cannot be re-hashed retrospectively. This is a provenance limitation, not a reason to discard the owner's visual defect report or infer a PASS.

### Authorized, bounded repair

Source repair commit: `a53195326aae13adfabea07dbb6cddbfe7f428a1` — `fix(intro): repair iPhone Safari handoff`.

- `app/globals.css`
  - Keeps the approved portrait `#hero` native-fragment offset unchanged at `-220px` below 768px.
  - Adds a `-310px` offset only for short, coarse-pointer, no-hover landscape viewports. It does not change fine-pointer desktop geometry.
  - On narrow touch phones that support it, makes the pinned cinematic use `100dvh`, retaining `100svh` as the fallback. This is intended to keep Safari browser-chrome changes from exposing the page behind the film.
- `components/__tests__/IntroHandoff.test.ts`
  - Guards the new short touch-landscape offset and the `100dvh` fallback contract.

No file under `components/cinematic/**` was modified. This repair is intentionally not an adjudication that the physical Safari strip is fixed: only the owner can establish that by repeating the device journey on the rebuilt static artifact.

### Owner retest and second bounded repair

The owner supplied three further physical-iPhone Safari captures on 2026-09-07. They establish:

1. **Short landscape landing: PASS on the first repair.** The identity block and headline land in the intended composition. The second repair preserves the `-310px` landscape rule and its wider-viewport image path.
2. **Portrait landing: usable but lower than desired.** The identity block is visible, but moving it modestly upward would reveal more of the hero composition.
3. **Portrait cinematic band: still present.** The first repair's `100dvh` hypothesis was insufficient and no fix is claimed from that change.

Second source repair commit: `0679c4f79c52cd49b50ac85f4b93d6f136c63c0c` — `fix(intro): harden iPhone cinematic handoff`.

- `app/globals.css`
  - Moves only the sub-768px portrait native-fragment landing from `-220px` to `-300px`.
  - Leaves the physically accepted short-landscape `-310px` rule unchanged.
- `components/cinematic/plates.ts`, `Layer.tsx`, and `StaticDesertFrame.tsx`
  - Add a direct `(max-width: 767px)` WebP source using the already-shipped mobile plates.
  - This prevents high-DPR portrait Safari from selecting the full-width AVIF alpha layers. Wider landscape and desktop viewports retain the established AVIF/WebP source sets.
- Focused tests guard the updated portrait offset and the direct phone source on both animated and reduced-motion paths.

This is a bounded response to the physical defect. It does not alter animation choreography, assets, copy, routes, dependencies, production configuration, or the accepted landscape landing. Because the observed defect is Safari-specific, the band remains unresolved until the owner repeats the portrait journey on this exact static artifact.

### Second-repair local checks

| Surface | Result |
| --- | --- |
| High-DPR touch portrait, 440 × 844 | Selects all four `-mobile.webp` live layers; native arrival uses `-300px`; identity top `182px`; headline top `451px`. |
| High-DPR touch landscape, 956 × 440 | Preserves full AVIF path and `-310px`; identity top `27px`; headline top `243px`. |
| Fine-pointer desktop, 1440 × 900 | Preserves full AVIF path and `0px`; identity top `202px`; headline top `417px`. |
| Local runtime | Headless Chrome; no Safari/WebKit result is claimed. |

### Local repair-candidate checks

These are geometry and static-artifact checks only, not iPhone Safari acceptance evidence:

| Surface | Result |
| --- | --- |
| Built static CSS | Contains the `-310px` short touch-landscape offset and `100dvh` narrow-touch pin rule. |
| Touch 956 × 440 local browser | Native Skip Intro: identity top `27px`, headline top `243px`, `scroll-margin-top: -310px`. |
| Touch 440 × 844 local browser | Preserved portrait handoff: `scroll-margin-top: -220px`. |
| Fine-pointer 1440 × 900 local browser | Preserved desktop behavior: `scroll-margin-top: 0px`. |
| Available local WebKit runtime | Not installed; no WebKit result is claimed. |

### Findings and mechanism

| Item | Result |
| --- | --- |
| F-011 / RC-004 | Locally addressed with a narrow CSS-only fragment landing contract. At the required measured narrow widths, the role sentence begins in the upper half of the viewport after Skip Intro. |
| F-012 | Preserved locally: a real `#hero` fragment still owns navigation, history, and focus; no custom click, `scrollIntoView`, `window.scrollTo`, or imperative focus handler was added. |
| F-037 | Preserved locally in captured light, dark, and reduced-motion runs. |
| Chosen mechanism | Native fragment navigation plus breakpoint-scoped `scroll-margin-top`, with `tabIndex={-1}` on the existing destination so keyboard focus remains visible. This was narrower than custom JavaScript scroll/focus ownership and leaves no-JavaScript fallback meaningful. |

## Captured browser evidence

Evidence is retained on the Phase 07 branch under `qa-reports/phase-07-captures/`. The post-commit matrix was captured from the static export of `d1c15f9` served on loopback in a fresh Chromium profile. `metrics.json` records theme, viewport, hash, target position, focus state, horizontal-overflow audit, and capture filename; `journeys.json` records the history journey.

### Required narrow-width arrival measurements

| Viewport | Light role position | Dark role position | Native hero arrival | Result |
| --- | ---: | ---: | ---: | --- |
| 320 × 720 | 43.6% | 43.6% | -220px | local Chromium PASS |
| 360 × 800 | 39.3% | 39.3% | -220px | local Chromium PASS |
| 375 × 812 | 38.7% | 38.7% | -220px | local Chromium PASS |
| 393 × 852 | 36.3% | 36.3% | -220px | local Chromium PASS |
| 430 × 932 | 32.0% | 32.0% | -220px | local Chromium PASS |

All listed arrival frames reported `documentScrollWidth === viewport width`, zero visible overflow elements, and a deliberately injected 150%-width audit probe was detected before removal. At 768px, 1024px, 1280px, 1440px, and 1728px in both themes, computed `scroll-margin-top` is `0px` and native fragment arrival leaves `#hero` at `0px`. A second independent post-commit arrival measurement for each required narrow width and theme is retained as `*-arrival-postcommit-run2` in `metrics.json` and matches the first run.

### Interaction evidence

- Pointer/native fragment activation: local Chromium arrival captured at every listed narrow width and both themes.
- Keyboard: Tab reaches the real Skip Intro link; Enter uses the native fragment; focus arrives at `#hero`; `:focus-visible` is true; the visible identity block has a `2px` accent outline with `6px` offset; the next Tab reaches the visible `See the work.` CTA.
- Reduced motion: 375 × 812 local Chromium arrival reaches the same measured role position (38.7%) without decorative delay.
- Touch emulation: 375 × 812 local Chromium touch activation reaches `#hero` at `-220px`, shows the role at 38.7% of the viewport, and has no horizontal overflow.
- No JavaScript: 375 × 812 preserves `#hero` in the URL, focuses the native target, and reaches the same `-220px` local landing position.
- JavaScript enabled: the existing route logic clears the one-time `#hero` hash after navigation; focus remains at the destination.
- Browser journey at 375 × 812: Back returns to the initial intro position; Forward restores the settled arrival; reload retains the settled arrival; a direct `#hero` link settles at `-220px` and focuses the target; a no-View-Transition run reaches the same arrival. See `journeys.json` and `mobile-375-light-no-view-transition-arrival.png`.

## Preserves checked

| Preserve ID | Status | Evidence / limitation |
| --- | --- | --- |
| PR-001 — cinematic first frame | PASS (local Chromium) | Paired first/arrival captures at 320, 360, 375, 393, 430, 768, 1024, 1280, 1440, and 1728px in light and dark, plus source-diff proof that cinematic code is untouched. |
| PR-004 — support-first sentence | PASS | The exact role sentence is unchanged; all four required narrow arrival measurements place it in the upper half of the viewport. |
| PR-013 — theme-specific atmosphere | PASS (local Chromium) | Light and dark first/arrival captures cover 320, 360, 375, 393, 430, 768, 1024, 1280, 1440, and 1728. |
| PR-014 — reduced motion | PASS (local Chromium) | Dedicated 375px reduced-motion arrival capture; content and state communication are complete. |
| PR-015 — intentional negative space | PASS (local Chromium) | CSS affects fragment landing only below 768px; paired 768/1024/1280/1440/1728 captures retain `0px` margin. |
| PR-019 — navigation, focus, history | PASS (local Chromium); pending WebKit | Native-link source guards, 40 focused tests, no-JS, keyboard, touch, Back, Forward, reload, deep-link, and no-VT browser evidence all pass locally. Mobile WebKit/iOS remains unverified. |

## Verification run on candidate `d1c15f9`

| Command | Result |
| --- | --- |
| `npm run typecheck` | PASS — `tsc --noEmit` completed successfully. |
| `npm run lint` | PASS — no ESLint warnings or errors. Existing Next 16 `next lint` deprecation and export-header notices remain. |
| `npm test -- components/__tests__/IntroHandoff.test.ts components/__tests__/IntroSkip.test.tsx components/__tests__/ViewTransitions.test.tsx components/__tests__/Hero.test.tsx` | PASS — 4 files, 40 tests. |
| `npm run build` | PASS — static export generated. Existing export/header notices remain. |
| `npm test` | PASS — 96 files, 869 passed, 2 skipped. Existing React SSR `useLayoutEffect` and `fetchPriority` warnings remain. |
| `npm run test:static` | PASS — 2 files, 54 passed, 1 skipped; it rebuilt the static export before running. |
| `git diff --check` | PASS — no whitespace errors in the source candidate. |
| `npm run check:overflow` | NOT RUN TO COMPLETION — exits 2 with `[overflow] static fixture never came up.` Its configured helper `design-reviews/showcase-refresh/tools/static-serve.mjs` is absent. The committed browser-matrix audit is not a substitute for the repository wrapper, though it recorded zero visible overflow elements and a non-vacuity probe in every captured arrival frame. |

## Required QA coverage not complete

The following boundary prevents a PASS gate. It is documented rather than inferred.

1. **T-111:** the owner supplied mobile Safari/iOS evidence and confirmed the first repair's short-landscape landing, but the portrait cinematic band persisted through the second repair and the portrait landing needed further refinement. Third repair `d6e378a` needs a repeat physical-iPhone Safari run that specifically confirms: no pale strip through the cinematic; the portrait Skip Intro composition is improved and clear of Safari chrome/safe areas; the already accepted landscape landing remains intact; Back/Forward and reload remain sane. Local browser checks do not establish real-device WebKit support. See the appended third-repair record below; earlier candidate-specific measurements are retained as history, not current acceptance.

The committed packet includes paired first/arrival captures for every listed Phase 07 viewport, two stable narrow-width arrival runs per theme, touch, keyboard, reduced-motion, no-JavaScript, no-View-Transition, Back, Forward, reload, and deep-link evidence. These local observations do not eliminate the mobile-WebKit limitation or the owner-observed defects.

## Rollback and side effects

```text
ROLLBACK_REFERENCE: ec82ece9b056688970c14805ed05290b986b4149
ROLLBACK_ACTION: revert the local candidate commit; do not reset or rewrite history
SOURCE_COMMIT_CREATED: d1c15f9cd33051edff3f053ad20c4b2ce0c1cfe4
REPAIR_SOURCE_COMMIT_CREATED: a53195326aae13adfabea07dbb6cddbfe7f428a1
SECOND_REPAIR_SOURCE_COMMIT_CREATED: 0679c4f79c52cd49b50ac85f4b93d6f136c63c0c
THIRD_REPAIR_SOURCE_COMMIT_CREATED: d6e378a4f5b76682a3a9b821e7d90c12e255be76
REMOTE_SIDE_EFFECTS: NONE
PRODUCTION_SIDE_EFFECTS: NONE
```

## DECISIONS FOR SKY

### Repeat mobile WebKit proof for the repair candidate before allowing a PASS gate

**Decision:** provide a real iPhone/iOS Safari result for source commit `d6e378a` before changing this gate.

**Recommendation:** run the rebuilt static repair candidate on a real iPhone Safari, recording the cinematic with browser chrome visible, portrait and landscape Skip Intro arrival, safe-area behavior, keyboard/VoiceOver focus continuity where available, and the history journey. Then retain the observations before issuing PASS.

**Why:** the repair relies on native fragment geometry and the relationship between Safari's small viewport and ScrollTrigger's pin-release endpoint. Chromium and source tests do not establish iOS WebKit behavior.

**Alternative:** retain `INTRO_HANDOFF_GATE: HOLD` and treat `d6e378a` only as a local repair candidate.

**Impact:** no Phase 08 handoff or local integration is authorized until this decision is resolved and the WebKit evidence is retained.

### Restore or explicitly defer the official overflow wrapper

**Decision:** restore the missing static fixture helper or accept the current local browser-audit evidence as non-wrapper supplemental evidence.

**Recommendation:** restore the configured helper in a separately scoped task; it is outside Phase 07’s narrow source ownership.

**Why:** `npm run check:overflow` cannot exercise its intended fixture while the helper is absent.

**Alternative:** leave the wrapper unrun and preserve the exact failure plus supplemental audit in this receipt.

**Impact:** the source candidate remains unchanged, but a future final gate needs a clear overflow-wrapper disposition.

## Third owner retest, reproduced seam, and approved identity revision — 2026-09-07

Current source: `d6e378a4f5b76682a3a9b821e7d90c12e255be76` (`fix(intro): close Safari seam and simplify identity`). Source tree: `52c276e537fdd06603c5e91dbea48c4b4fef66c2`.

The owner supplied `IMG_8188.PNG` and `IMG_8189.PNG`: the beige strip still existed; the portrait identity was higher but could move up further. These are physical-device defect observations, not successful acceptance. The original images stay in the owner's Downloads folder; their hashes and provenance limitations are recorded in [the third-repair QA report](2026-09-07_Codex_Phase07SeamAndIdentity.md).

The owner also explicitly requested **Skyler Halisky** as the portfolio's primary name on mobile and desktop, removal of the Sky/Skyler explanation and agency phrase, a one-person studio credit, and less intense casing. This supersedes the earlier short-name/imprint copy contract for these surfaces; the support-first role sentence is unchanged. Final visual acceptance of this revised candidate is still pending.

### Reproduced mechanism and bounded source repair

- The phone pin is `100svh`, but the existing `end: 'bottom bottom'` is measured by ScrollTrigger against its `100vh` viewport. A controlled 40px small/large viewport mismatch exposed 40px of stage below the released pin; an 80px mismatch exposed 80px. The bright world backdrop in that unused stage is the strip, not a separate beige DOM bar. `elementsFromPoint` identified the exposed stage.
- Narrow-phone pin release now uses `bottom top+=${pin.offsetHeight}`, matching the pin's actual height. Wider layouts keep `bottom bottom`. The pin, native anchor/history/focus mechanism, imagery, and animation choreography remain in place.
- The earlier ineffective `100dvh` override is removed: the later base `100svh` declaration won the cascade. The unconfirmed phone-WebP workaround is also removed, restoring the previous responsive AVIF/WebP selection without changing asset bytes.
- Portrait landing changes from `-300px` to `-360px`, retaining the safe-area adjustment. The owner-accepted short-landscape rule remains `-310px`; fine-pointer desktop remains `0px`.
- The name is **Skyler Halisky** across displayed identity, page/share metadata, bylines, feeds, and fallback identity. The hero credit is exactly **SkyPi Studio is one person.** Hero credit/eyebrow and the intro identity badge no longer force uppercase. Other navigation typography is not redesigned.

### Evidence boundary

[The current evidence folder](phase-07-repair3/) contains a reproducible static-browser matrix, baseline seam screenshot, current screenshots, metrics, and artifact hash verification. The viewport mismatch is deliberately simulated in desktop Chromium; it is **not** represented as a physical Safari run. The built static HTML served over the LAN hashes identically to `out/index.html`, and its source matches the committed candidate.

Final local gates: lint and typecheck pass; 96 test files pass with 870 passed/2 skipped; rebuilt static integrity passes with 54 passed/1 skipped. The final post-commit browser matrix passes all 23 cells. All six simulated seam gaps are effectively zero. At 440px portrait, identity top is `121.80px`; landscape remains `27.31px` and desktop `201.80px`. Intermediate test-cleanup failures and background-prefetch timeouts are disclosed in the linked report, along with the successful final reruns.

`INTRO_HANDOFF_GATE: HOLD` remains in force. No push, merge, deploy, production change, Phase 08 work, or waiver of device evidence is authorized or performed.
