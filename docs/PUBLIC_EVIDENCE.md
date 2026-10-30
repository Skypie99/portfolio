# Portfolio: public evidence

A short route through the strongest evidence in this repository, for anyone who would rather check
[skypistudio.com](https://skypistudio.com)'s claims than take them on trust. This repository keeps
its history, so most of its 2,400-plus QA files are dated records. Start here rather than in
[`qa-reports/`](../qa-reports/).

This page routes; it does not restate. If a linked record and this page ever disagree, the record
wins. For which documents are current and which are historical, see [`docs/INDEX.md`](INDEX.md).
Current as of **2026-10-28**.

## What is live, and how it got there

| Evidence | What it shows | Currency |
|---|---|---|
| [Deploy workflow runs](https://github.com/Skypie99/portfolio/actions/workflows/deploy.yml) | Each production publish, and the commit it published | Live record |
| [`ci.yml`](../.github/workflows/ci.yml), [`deploy.yml`](../.github/workflows/deploy.yml) | Every push to `main` runs lint, typecheck, a build-backed test run and a final build. An automatic Deploy publishes only the exact commit CI verified, and only when that run came from a push to this repository; a manual Deploy run is the one deliberate exception and is not gated on CI | Current |
| [Release model](../README.md#release-model) | The same gates in plain language, and who controls merges and releases | Current |

## Claims and corrections

| Evidence | What it shows | Currency |
|---|---|---|
| [Flagstone release-truth repair](../qa-reports/2026-09-17_P1A_FlagstoneReleaseTruth.md) | When Flagstone went live on the App Store, the site still said the iOS app had not shipped, and three test files pinned that claim. The receipt records the store check, the corrected copy and the inverted guards | 2026-09-17 |

## Accessibility

| Evidence | What it shows | Currency |
|---|---|---|
| [Responsive and accessibility hardening](../qa-reports/PHASE-08_RESPONSIVE_A11Y_HARDENING_RECEIPT.md) | A 246-cell affected-route matrix with zero overflow, 200% zoom checks, and an owner-approved defect-fix commit | 2026-09-07 |
| [Heading fix before release](../qa-reports/2026-10-24_AstraUltra01_ReleaseHeadingFix.md) | Final acceptance caught a heading that clipped at 320px with larger text. The receipt has the measurements, the fix and the rejected alternatives | 2026-10-24 |
| [Accessibility statement](https://skypistudio.com/accessibility/) | The published statement and the dated figures it reports | Dated per figure |

## Defects, found and fixed

| Evidence | What it shows | Currency |
|---|---|---|
| [GSAP timer race repair](../qa-reports/2026-09-27_Codex_GSAP_Timer_Race_Repair.md) | A flaky CI failure traced to animation timers that outlived their tests: the root cause, the scoped repair, and tests that exercise the lost-timer path | 2026-09-27, merged 2026-09-28 |
| [Node 24 Actions upgrade](../qa-reports/2026-06-12_Node24_Actions_Upgrade.md) | A workflow deprecation handled before its deadline, with a green CI run on the upgraded actions | 2026-06-12 |

## Known open items

- Physical Safari, VoiceOver and device acceptance is still to do for the October releases. Two
  are tracked in public, [#38](https://github.com/Skypie99/portfolio/issues/38) and
  [#41](https://github.com/Skypie99/portfolio/issues/41); the releases after them record no device
  testing either.
- The scheduled Supabase keepalive for the private `/archive` has failed on every run since
  2026-09-30 (the last success was 2026-09-29). It is visible in
  [Actions](https://github.com/Skypie99/portfolio/actions/workflows/supabase-keepalive.yml). The
  public pages are static and do not depend on it.

## Reading older files

- Files dated May to August 2026 come from earlier build cycles. Names such as Morgan, Rory, Gary,
  Quinn, Dani and Alex are roles in the project's multi-agent AI workflow, not additional people.
- Report filenames often name the AI tool or the release cycle that produced them.
- A receipt is true for its own date; its findings are never rewritten, and a later receipt supersedes it.
