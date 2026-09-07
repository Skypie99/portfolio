# P09-B — Warning ownership and correction receipt

## Lead adjudication — 2026-09-07

Warning criterion: PASS within the bounded evidence, with the existing fetchPriority package-React18 warning visible. Final integrated post-build suite:98 files,874 passed,2 existing no-out sentinel skips (one additional sitemap contract since the first873-test rerun), no unhandled error and no SSR useLayoutEffect warning. Final production Chromium sweep:24 public HTML documents, zero console/page errors or warnings. Product image priority and motion source remain unchanged.

The later P09-B-WARN-01 request for approval to retain a visible bounded warning is superseded: the supplied prompt requires owner approval for **warning suppression**, not for documenting a precisely bounded warning without behavior regression. No suppression or renderer alignment occurred. Dependency residual approval remains outstanding in the separate receipt. The initial intermittent GSAP observation remains retained; both lead full suites passed without recurrence, not proof that recurrence is impossible.

Historical lane record follows unchanged.

Prompt: SKYPI-PORTFOLIO-3.0-P09-B-DEPENDENCY-WARNINGS. T-136 / F-033 / RC-010. Warning lane status: bounded remaining warnings; final integrated verification and owner decision pending. No parent-gate authority.

Base, branch, repository and authority are recorded in `2026-09-07_Codex_Phase09Dependencies.md`. Only test files changed. ProductReveal, ThemedShowcase, Reveal, global rendering, manifests, lockfile, and the entire protected cinematic subtree remain byte-identical to base.

## Reproduction and actual ownership

Initial `npm test` at 2026-09-07 04:00 Vancouver time is preserved in `phase-09-b/warnings-before.log`: 95 files passed, 1 failed, 1 skipped; 803 tests passed / 55 skipped; 1 unhandled error. This was a diagnostic reproduction without an out/ artifact, not a final gate. Recruiter-copy suite failed because out/ was absent; built integrity tests skipped. No test was disabled to hide this failure.

1. SSR `useLayoutEffect` warnings come from real `Reveal` renderToString tests in AnimatedCertGrid, GalleryWall and A11yReceipts. Reveal already selects useEffect when `window` is absent. Vitest's global jsdom environment creates window *before module import*, selecting the browser hook while the test calls the server renderer. Production motion code is not the defect.
2. `fetchPriority` warning originates at native images in ProductReveal under **package React 18.3.1 used by Vitest**. Next15 App Router aliases React/DOM to its **bundled 19.2.0-canary-0bdb9206-20250818** renderer, whose native-property map recognizes camelCase fetchPriority. Exact local ownership in `phase-09-b/runtime-ownership.json`. Replacing source with lowercase would appease the package renderer while contradicting the production renderer. An initial uncommitted lowercase experiment passed focused tests, but was rejected and fully reverted after this ownership check. `warnings-after-focused.log` is that abandoned experiment, not final candidate evidence.
3. One GSAP ScrollTrigger timer fired after jsdom teardown (`requestAnimationFrame is not defined`) in the initial suite, attributed to homepage-dates. That test already calls ScrollTrigger.disable in afterAll. Focused rerun passed 2/2 with no unhandled error (`gsap-focused.log`). No production/cinematic code or global error interception was added. This sporadic full-suite error requires the lead's final suite check; the focused pass does not erase it.

## Safe correction

- AnimatedCertGrid tests explicitly run in Node, representing the real SSR branch.
- A11yReceipts tests explicitly run in Node; a locally scoped JSDOM document parses emitted HTML for its existing containment checks without installing a global window. Existing real component/server assertions remain intact.
- GalleryWall's server-floor case moved into `GalleryWall.ssr.test.tsx` under Node using real deliverables. Browser interaction/order/session-storage tests stay in jsdom. No assertion count is removed: 8 original GalleryWall tests become 7 browser + 1 server.

No console suppression, mock of the motion primitive, production effect changes, altered hydration, motion, reduced-motion, image priority, accessibility, or first frame. All preserved behavior is established by the absence of product-source diff plus focused tests; no broader runtime certification claimed.

## Final verification

`phase-09-b/ssr-final.log`: real Node/server + GalleryWall browser tests, 4 files / 19 tests passed, zero skips, no warning. `phase-09-b/fetchpriority-final.log`: ProductReveal/ThemedShowcase, 2 files / 26 tests passed, existing package-React18 fetchPriority warning retained visibly. `typecheck-final.log`: `npm run typecheck`, exit 0. `lint-final.log`: `npm run lint`, exit 0; no ESLint issues. Next CLI emits its existing next-lint deprecation and static-export/header-boundary notice. Neither warrants an unapproved modernization or cosmetic suppression. Lead owns final integrated build, full suite and output/runtime evidence; not run as a final lane gate here.

## DECISIONS FOR SKY

P09-B-WARN-01: retain the explicitly bounded package-React18 fetchPriority test warning, or authorize a separately validated test-runtime alignment to Next's bundled renderer. Recommendation: retain the warning visibly for this phase; the product spelling is correct for its actual App Router renderer. Alternative: align Vitest's React/ReactDOM resolution with Next, which changes the test renderer major/runtime and needs full compatibility validation; no such patch was applied or claimed tested. Impact: no production regression or suppression is introduced; lead must carry this known harness limitation in acceptance. No approval received.

The intermittent GSAP teardown error remains an evidence limitation until the final suite; if it recurs, gate stays HOLD and its actual test-resource ownership must be repaired or explicitly deferred. No owner decision is inferred from silence.

## Commit/rollback and handoff

Safe test corrections and additive evidence can be integrated independently of dependency/warning-risk acceptance. Candidate commit is returned in the lane handoff (this receipt cannot name its own hash). Reverting the lane commit restores test organization; no migration/production rollback exists. No push, merge, deploy, external send, or remote mutation. No Phase10 work. Parent lead alone issues final gate.
