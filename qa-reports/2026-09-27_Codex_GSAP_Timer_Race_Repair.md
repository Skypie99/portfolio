# Portfolio GSAP timer race repair — 2026-09-27

## DECISIONS FOR SKY

- **Independently review draft PR #23 before merge.** Recommendation: review the scoped test-clock ownership and its negative proof, then decide whether to merge the branch. Why: local checks cover the known CI race, but bounded repeated runs cannot prove it impossible under every scheduler or platform. Alternative: leave the draft open and retain the known flaky CI risk. Impact: merging this test-only branch changes CI lifecycle ownership; it does not repair GSAP's production dependency defect.
- **Track the GSAP 3.15.0 handle-loss defect separately.** Recommendation: investigate an upstream version or a separately scoped production fix. Alternative: retain the current runtime dependency. Impact: this repair contains the test race only and does not authorize protected cinematic production edits.

## Result and source binding

IMPLEMENTATION: PASS. ROOT_CAUSE: MULTI-CAUSE. The GSAP 3.15.0 `ScrollTrigger.config({ ignoreMobileResize: true })` path loses the 250 ms sync-interval handle without clearing the interval. Component context cleanup does not own this plugin-global work, and the affected test files had no independent timer owner. The old `disable()` guard is insufficient after the handle is lost. A surviving callback can fire after Vitest removes `requestAnimationFrame`.

Repository: Skypie99/portfolio (`https://github.com/Skypie99/portfolio.git`). Default branch: `main`. The canonical primary checkout was read only; its local `main` SHA was `7dc04ff2be3d8754516cb218bc4f4a08079dfcd3`, behind cached and live `origin/main` `129988b88bb6717aa65311bb7af12af8e4aa22ad` by 74 commits. The primary checkout's dirty status hash stayed unchanged. The repository floor's assertion that local main is ahead is stale; Git wins. The isolated worktree started clean at remote main. The pre-write inventory had 49 registered worktrees, no existing repair branch, and no relevant Git lock. The concurrent public-estate cleanup session explicitly deferred Portfolio writes.

Branch: `codex/portfolio-gsap-timer-race-20260926`. Base SHA: `129988b88bb6717aa65311bb7af12af8e4aa22ad`. Code commit: `1275024846ae9bf76713b328ba8b22c1b140a98f`. Draft PR: https://github.com/Skypie99/portfolio/pull/23. The report commit follows this code commit; use the branch tip as the final SHA. The branch was pushed; main was not merged or pushed, and nothing was deployed.

## What changed

- `test-utils/gsap-teardown.ts`: one shared owner installs a file-scoped fake clock before GSAP module evaluation; its `afterAll` unmounts React, disables ScrollTrigger, sleeps the GSAP ticker, cancels pending timers, asserts zero pending timers, and restores real timers in `finally`. Cleanup is idempotent. It does not mock GSAP or alter application behavior.
- Five homepage suites: `app/__tests__/homepage-dates.test.tsx`, `homepage-featured-link.test.tsx`, `homepage-numeral-contrast.test.tsx`, `homepage-project-links.test.tsx`, and `flagstone-cta-parity.test.tsx` install the shared owner before importing the page. The dates suite's insufficient local `disable()` guard moved into the shared shutdown. Its useful explanation of first-render registration was corrected.
- `vitest.setup.ts`: the same owner is selected only for the sixth affected suite, `components/cinematic/__tests__/CinematicDesert.test.tsx`, before that suite imports the protected component. This additional file is necessary to close the same leak without editing protected `components/cinematic/**`.
- Two tests under `test-utils/__tests__/`: one exercises real GSAP's lost-handle path, multiple interval generations, repeated shutdown, and restoration; the other confirms unrelated suites keep real timers.

No production code, lockfile, package script, animation timing, or protected cinematic source changed. The two new tests explain the full-suite count rising from 105 files / 947 passes to 107 files / 949 passes. The same two historical skips remain.

## Gates and evidence

| Command or bounded check | Actual result |
|---|---|
| `node work/real-timer-probe.cjs config_then_disable` (scratch diagnostic before repair) | Exit 0 because the reproduction assertion succeeded: 1 interval remained after `disable()` and `ReferenceError: requestAnimationFrame is not defined` was observed after browser teardown. This is a negative control, not a repaired pass. |
| Pre-repair `npx vitest run` on the five homepage suites | 5 files, 13 tests passed; the flaky symptom did not appear in that single baseline run. |
| Repaired grouped `npx vitest run` on five suites plus lifecycle regression | 6 files, 14 tests passed; exit 0. |
| 28 bounded repeated `npx vitest run` processes: each homepage suite alone 3 times, five together 10 times, five with serial shuffled-file seeds 101/202/303 | 28/28 exit 0; zero post-teardown or rAF errors. |
| 3 serial shuffled-file processes with all six affected suites and both regressions, seeds 401/502/603 | 3/3 exit 0; zero post-teardown or rAF errors. Total targeted repaired processes including the initial grouped run: 32. |
| Negative mutation: temporarily omit `vi.clearAllTimers()` before the zero-count assertion | Expected failure observed: `expected 5 to be +0`; exit 1. Correct source restored before final validation and committed. |
| `npm run typecheck` | Exit 0, no diagnostics. |
| `npm run lint` | Exit 0, `✔ No ESLint warnings or errors`; existing Next.js deprecation/header notices. |
| `npm test` | Exit 0; 107 files passed; 949 passed, 2 skipped. Zero post-teardown errors and zero rAF ReferenceErrors. One nonfatal React `fetchPriority` console warning appeared outside this change. |
| `npm run build` | Exit 0, static export and postbuild scripts completed. |
| `npm run test:static` | Exit 0; 2 files passed, 55 passed, 1 existing skip, after its own build. |
| `git diff --cached --check` before code commit | Exit 0. |

The 31 repeated processes ran with normal Vitest file isolation; the grouped serial runs used explicit shuffle seeds. Every repeated process was checked for exit status and error signatures after termination. These results are bounded evidence, not a mathematical proof. The two existing skips are in recruiter-copy-truth and static-integrity tests; no new skip was added.

## Preservation and what remains

PR #21 remained draft/open at head `892e7844bb7d6d0b14d01d3526029b1305b0dc51` with its original 34-file set at the last pre-publication readback. This task did not write to its branch or files. Local `main`, cached `origin/main`, and the primary checkout's status were unchanged during implementation. AccessMap and ClaudeCorp primary HEAD/status hashes matched pre-write snapshots. This task made no writes to Agent OS, Flagstone, ClaudeCorp, scheduled jobs, or other cleanup branches. Concurrent activity outside those checked surfaces is not attributed to this task.

Independent PR review remains. The underlying GSAP production dependency behavior remains a separate decision. No merge or deployment was performed. GitHub CI on the draft PR is separate from the local gates above; this report does not claim a remote CI result.
