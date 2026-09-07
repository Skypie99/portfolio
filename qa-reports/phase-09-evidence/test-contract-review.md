# T-142 test-contract review — 2026-09-07

Read-only review by P09 contract lane on exact eb677334 baseline; lead reruns same contracts after integration.

| Contract | Protection | Limit |
|---|---|---|
| Identity/claims | lib/__tests__/support-first-hierarchy.test.ts; recruiter-copy-truth.test.ts; flagstone-professional-bridge.test.ts | Protects sourced identity, support-first, no invented roles/metrics |
| CTA parity | app/__tests__/flagstone-cta-parity.test.tsx | Six shared doorways; identical classes, tab ownership, no style escape hatch |
| Flagstone freshness | app/__tests__/flagstone-release-status.test.ts; blog-dated-status.test.tsx; flagstone-first-impression.test.ts | Pins Aug31 verification and Sep1 capture; does not freshly query Apple or impose a freshness deadline |
| Support Operating Record | lib/__tests__/support-first-hierarchy.test.ts | Five lanes, no invented metrics/employment/scope; correct rail order |
| Intro history/focus | components/__tests__/IntroSkip.test.tsx; IntroHandoff.test.ts | Source regression complements accepted P07 bounded Safari runtime, not new AT certification |
| Accessibility/contrast | lib/__tests__/ink-contrast.test.ts; contrast-preferences.test.ts; flagstone-utility-contrast.test.ts; accessibility-statement-scope.test.ts; SkipLink/RailInert/HamburgerNav/TapTargets | Actual CSS and pre-fix rejection guards; not universal certification |
| Canonicals | lib/__tests__/metadata.test.ts; static-integrity.test.ts | Existing guard excludes utility microsite; banked approval patch extends it |
| Public/private | lib/__tests__/recruiter-copy-truth.test.ts | Synthetic Dashboard and Archive publication boundaries; not live auth certification |

No redundant tests recommended. Build-dependent guards are exercised only after a built artifact exists. P09-B SSR tests now use Node at server ownership and keep browser interaction cases in jsdom. Phase00 historical receipt contained only two desktop NavigationTiming samples; exact original artifact was subsequently recovered by lead and hashed for fresh retrospective same-harness comparison.
