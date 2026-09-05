# Phase 07 — Intro Handoff Pre-Approval Packet

**Status:** `WITHHELD — Sky visual approval and mobile WebKit proof required before commit`

**Candidate branch:** `codex/portfolio-3.0-phase07-20260905`
**Candidate base SHA:** `ec82ece9b056688970c14805ed05290b986b4149`
**Source line:** exact clean Phase 06 worktree, not the dirty primary checkout
**Remote mutations:** none
**Commit:** none — explicitly held for visual approval

## What changed

- `app/globals.css`
  - Adds a `max-width: 767px` `#hero` fragment landing margin of `-220px`, with an `env(safe-area-inset-top)` fallback expression. This changes only native `#hero` landing geometry below the 768px composition boundary.
  - Adds a keyboard-only visual cue for the fragment destination: when `#hero` receives native focus, its visible identity block is outlined with the existing accent token.
- `app/page.tsx`
  - Makes the existing `#hero` fragment destination `tabIndex={-1}`. It is focusable only when a browser navigates to it; it does not enter ordinary Tab order.
- `components/Hero.tsx`
  - Marks the existing identity block as the visual focus cue target. No content, hierarchy, or layout changes.
- Regression coverage
  - `components/__tests__/IntroHandoff.test.ts`
  - `components/__tests__/IntroSkip.test.tsx`
  - `components/__tests__/ViewTransitions.test.tsx`
- Captured built-export evidence is under `qa-reports/phase-07-captures/`.

`components/cinematic/**` is untouched.

## Built-export browser evidence

The evidence was captured from `out/`, served only on loopback, in a fresh Chromium profile. `metrics.json` records the screenshots and measurements.

| Viewport | Theme | Role sentence top / viewport | `#hero` landing | Result |
| --- | --- | ---: | ---: | --- |
| 320 × 720 | light | 43.6% | -220px | PASS |
| 375 × 812 | light | 38.7% | -220px | PASS |
| 393 × 852 | light | 36.3% | -220px | PASS |
| 430 × 932 | light | 32.0% | -220px | PASS |
| 320 × 720 | dark | 43.6% | -220px | PASS |
| 375 × 812 | dark | 38.7% | -220px | PASS |
| 393 × 852 | dark | 36.3% | -220px | PASS |
| 430 × 932 | dark | 32.0% | -220px | PASS |

- At exactly 768px and at 1024px/1440px, computed `scroll-margin-top` is `0px`, and native landing leaves `#hero` at `0px` in both themes.
- JavaScript-enabled navigation clears the one-time `#hero` hash through the existing route logic; JavaScript-disabled navigation preserves the native `#hero` hash and lands at the same measured `-220px` position.
- Reduced-motion at 375px lands correctly, with the role at 38.7% of viewport height.
- Keyboard trace: Tab reaches the real Skip Intro link; Enter uses the native fragment; browser focus arrives on `#hero`; the visible identity block has a `2px` accent outline; the next Tab reaches the visible `See the work.` CTA.
- The read-only visible-bounds audit found zero overflow elements in all 16 captured arrival frames. Its temporary 150%-viewport test probe was caught in all 16 frames, then removed before each screenshot.

## Gates

| Gate | Result |
| --- | --- |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS — no ESLint warnings/errors; existing Next deprecation/export-header notices only |
| `npm test` | PASS — 96 files; 869 passed, 2 skipped |
| `npm run build` | PASS — static export generated |
| `npm run test:static` | PASS — 54 passed, 1 skipped |
| Focused native-anchor suite | PASS — 40 tests across four files |
| `git diff --check` | PASS |
| Official `npm run check:overflow` wrapper | NOT RUN TO COMPLETION — its configured `design-reviews/showcase-refresh/tools/static-serve.mjs` file is absent, so its fixture cannot start. The same element-bound algorithm plus its non-vacuity probe ran in the captured built-export matrix above. |

The full suite was first run before `out/` existed and one static-only suite correctly failed on the missing directory. After the build, the same full suite passed as recorded above.

## Remaining limits

- **Mobile Safari / iOS safe-area:** not run. `CoreSimulatorService` was unavailable and no physical device was available. The desktop-WebKit/local check performed earlier does not prove narrow iOS safe-area behavior.
- **Visual approval:** required by the Phase 07 prompt before any commit. No commit has been created.
- The final `PHASE-07_INTRO_HANDOFF_GATE_RECEIPT.md` is intentionally not written yet; it must reflect the approval outcome rather than pre-approval inference.

## DECISIONS FOR SKY

### Approve the visual result before commit

**Decision:** approve or reject the captured mobile/desktop first-frame and arrival result.
**Recommendation:** approve if the attached review board reads as intended: unchanged cinematic first frame, support role immediately visible after Skip Intro, and a calm but unmistakable keyboard-focus outline around the identity block.
**Why:** all local behavioral, accessibility, build, and overflow gates pass; the explicit prompt still reserves visual judgment to Sky.
**Alternative:** request a visual adjustment; the branch remains uncommitted and isolated.
**Impact:** approval authorizes one local Phase 07 commit and the final gate receipt only. It does not authorize a push, merge, deployment, or production change.

### Resolve mobile WebKit/safe-area coverage separately

**Decision:** accept the recorded limitation for this local candidate, or provide a physical iPhone/Safari verification path before calling the final gate PASS.
**Recommendation:** preserve the limitation in the final receipt unless a real iPhone/Safari check can be supplied.
**Why:** Chromium's `env(safe-area-inset-top)` fallback is present and the desktop/Chromium behavior is proven, but that does not establish iOS safe-area rendering.
**Alternative:** claim universal mobile-browser coverage without a WebKit check.
**Impact:** the latter would overstate the evidence and is not recommended.
