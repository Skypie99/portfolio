# Phase 07 — Intro Handoff Gate Receipt

## Gate status

```text
PROMPT_ID: SKYPI-PORTFOLIO-3.0-P07
PHASE: 07 — Narrow-Screen Intro Handoff and Interaction Precision
OWNER_VISUAL_APPROVAL: YES — 2026-09-05, “approve Phase 07 visual”
INTRO_HANDOFF_GATE: HOLD — NOT ISSUED AS PASS
SAFE_TO_INTEGRATE: NO — evidence gaps listed below remain
NEXT_PHASE: NOT AUTHORIZED
REMOTE_MUTATIONS: NONE
PUSH: NO
MERGE: NO
DEPLOY: NO
```

Sky approved the final visual candidate before the local source commit. The candidate is locally committed and all available source/build/test gates below passed. This receipt deliberately does **not** issue `INTRO_HANDOFF_GATE: PASS`: mobile WebKit/iOS safe-area behavior was unavailable. A local commit does not turn that missing observation into proof.

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

`components/cinematic/**`, first-frame copy, support-first role sentence, tablet/desktop CSS layout, routes, dependencies, production configuration, and remote state are untouched.

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

1. **T-111:** mobile Safari/iOS safe-area and browser-chrome behavior was not run. `CoreSimulatorService` was unavailable and no physical device was supplied. A prior desktop-WebKit/local check is not evidence of the committed candidate’s narrow iOS behavior. The recorded Chromium `env(safe-area-inset-top)` fallback and desktop measurements do not establish real-device WebKit support.

The committed packet now includes paired first/arrival captures for every listed Phase 07 viewport, two stable narrow-width arrival runs per theme, touch, keyboard, reduced-motion, no-JavaScript, no-View-Transition, Back, Forward, reload, and deep-link evidence. These local observations do not eliminate the mobile-WebKit limitation.

## Rollback and side effects

```text
ROLLBACK_REFERENCE: ec82ece9b056688970c14805ed05290b986b4149
ROLLBACK_ACTION: revert the local candidate commit; do not reset or rewrite history
SOURCE_COMMIT_CREATED: d1c15f9cd33051edff3f053ad20c4b2ce0c1cfe4
REMOTE_SIDE_EFFECTS: NONE
PRODUCTION_SIDE_EFFECTS: NONE
```

## DECISIONS FOR SKY

### Complete mobile WebKit proof before allowing a PASS gate

**Decision:** provide a real iPhone/iOS Safari path or explicitly direct how to handle the unavailable-device evidence.

**Recommendation:** run the committed candidate on a real iPhone Safari, recording narrow-width Skip Intro arrival, safe-area/browser-chrome behavior, keyboard/VoiceOver focus continuity where available, and the history journey. Then retain the recording and measurements before issuing PASS.

**Why:** the Phase 07 change intentionally relies on native fragment geometry and `env(safe-area-inset-top)`. Chromium and source tests do not establish iOS WebKit behavior.

**Alternative:** retain `INTRO_HANDOFF_GATE: HOLD` and treat `d1c15f9` only as a local candidate.

**Impact:** no Phase 08 handoff or local integration is authorized until this decision is resolved and the WebKit evidence is retained.

### Restore or explicitly defer the official overflow wrapper

**Decision:** restore the missing static fixture helper or accept the current local browser-audit evidence as non-wrapper supplemental evidence.

**Recommendation:** restore the configured helper in a separately scoped task; it is outside Phase 07’s narrow source ownership.

**Why:** `npm run check:overflow` cannot exercise its intended fixture while the helper is absent.

**Alternative:** leave the wrapper unrun and preserve the exact failure plus supplemental audit in this receipt.

**Impact:** the source candidate remains unchanged, but a future final gate needs a clear overflow-wrapper disposition.
