# QA reports index

> **Generated file. Do not edit by hand.** Written by `scripts/generate-qa-index.mjs` from the files git tracks under `qa-reports/`. After adding evidence, stage it (`git add`) and run `npm run qa:index`; `npm run qa:index:check` reports drift without writing.

## At a glance

| Measure | Value |
|---|---|
| Tracked files under `qa-reports/` | 960 |
| Top-level reports and receipts (Markdown) | 173 |
| Evidence directories | 16 |
| File types | png 521, md 192, json 122, log 63, mjs 21, cjs 15, txt 9, py 6, gz 5, stderr 4, html 1, patch 1 |
| Dates named in file paths | 2026-05-23 to 2026-09-26 |

## How the evidence is organized

- **Receipts and reports** are the Markdown files at the top of this directory. Dated ones start with `YYYY-MM-DD`; phase gate receipts and approval packets start with `PHASE-`. A receipt is true for its own date and is never rewritten: a later receipt supersedes it.
- **Raw evidence** (screenshots, logs, JSON inventories, harness scripts) lives in the subdirectories. Each directory is cited by relative path from the receipts listed beside it below, so start from the receipt and follow its paths.
- **Adding evidence.** Name a receipt `YYYY-MM-DD_<Topic>.md` and cite its raw evidence by relative path. When a new artifact would be byte-identical to one already tracked, cite the existing path with its SHA-256 (or a manifest entry) instead of committing another copy, unless a self-contained package or a before/after comparison genuinely needs the copy. Then stage the files and regenerate this index.
- **Evidence outside this directory:** `design-reviews/` (dated review programs) and `summaries/` (June 2026 pass reports). See [`docs/INDEX.md`](../docs/INDEX.md) for how every document in the repository is classified.

## Newest dated reports (15 of 141)

| Date | Report | Title |
|---|---|---|
| 2026-09-26 | [`repository-professionalization/2026-09-26_REPOSITORY_PROFESSIONALIZATION_RECEIPT.md`](repository-professionalization/2026-09-26_REPOSITORY_PROFESSIONALIZATION_RECEIPT.md) | Repository professionalization receipt (2026-09-26) |
| 2026-09-22 | [`2026-09-22_Codex_P1_CoreClosure.md`](2026-09-22_Codex_P1_CoreClosure.md) | P1 core closure receipt — cinematic finding deferred |
| 2026-09-22 | [`2026-09-22_Codex_P2Closure.md`](2026-09-22_Codex_P2Closure.md) | Portfolio 4.0 P2 closure — owner-approved evidence doctrine |
| 2026-09-22 | [`2026-09-22_P3_ProofProximity.md`](2026-09-22_P3_ProofProximity.md) | Portfolio 4.0 P3 — Story and proof proximity |
| 2026-09-22 | [`2026-09-22_P4_SystemHygiene.md`](2026-09-22_P4_SystemHygiene.md) | Portfolio 4.0 P4 — System hygiene |
| 2026-09-17 | [`2026-09-17_P1A_FlagstoneReleaseTruth.md`](2026-09-17_P1A_FlagstoneReleaseTruth.md) | P1.A — Flagstone Release-Truth Repair |
| 2026-09-07 | [`2026-09-07_Codex_Phase07DeviceRepair.md`](2026-09-07_Codex_Phase07DeviceRepair.md) | Phase 07 — iPhone Safari Device Repair |
| 2026-09-07 | [`2026-09-07_Codex_Phase07LocalIntegration.md`](2026-09-07_Codex_Phase07LocalIntegration.md) | Phase 07 — authorized local integration |
| 2026-09-07 | [`2026-09-07_Codex_Phase07OwnerAcceptance.md`](2026-09-07_Codex_Phase07OwnerAcceptance.md) | Phase 07 — owner visual acceptance |
| 2026-09-07 | [`2026-09-07_Codex_Phase07SeamAndIdentity.md`](2026-09-07_Codex_Phase07SeamAndIdentity.md) | Phase 07 — Safari seam repair and owner-requested identity update |
| 2026-09-07 | [`2026-09-07_Codex_Phase08Hardening.md`](2026-09-07_Codex_Phase08Hardening.md) | Phase08 hardening — pre-commit approval report |
| 2026-09-07 | [`2026-09-07_Codex_Phase09.md`](2026-09-07_Codex_Phase09.md) | Codex Phase09 — Technical Integrity |
| 2026-09-07 | [`2026-09-07_Codex_Phase09A.md`](2026-09-07_Codex_Phase09A.md) | Phase 09-A session report |
| 2026-09-07 | [`2026-09-07_Codex_Phase09Dependencies.md`](2026-09-07_Codex_Phase09Dependencies.md) | P09-B — Dependency advisory receipt |
| 2026-09-07 | [`2026-09-07_Codex_Phase09OwnerResolution.md`](2026-09-07_Codex_Phase09OwnerResolution.md) | Phase09 owner hold resolution — 2026-09-07 |

## Phase gate receipts and packets (14)

| Receipt | Title |
|---|---|
| [`PHASE-03_RECRUITER_PATH_GATE_RECEIPT.md`](PHASE-03_RECRUITER_PATH_GATE_RECEIPT.md) | PHASE-03_RECRUITER_PATH_GATE_RECEIPT |
| [`PHASE-04_FLAGSTONE_GATE_RECEIPT.md`](PHASE-04_FLAGSTONE_GATE_RECEIPT.md) | PHASE-04_FLAGSTONE_GATE_RECEIPT |
| [`PHASE-05_APPROVAL_PACKET.md`](PHASE-05_APPROVAL_PACKET.md) | Phase 05 bounded approval packet |
| [`PHASE-05_SUPPORTING_PROOF_GATE_RECEIPT.md`](PHASE-05_SUPPORTING_PROOF_GATE_RECEIPT.md) | PHASE-05_SUPPORTING_PROOF_GATE_RECEIPT |
| [`PHASE-06_APPROVAL_PACKET.md`](PHASE-06_APPROVAL_PACKET.md) | Phase 06 owner approval packet |
| [`PHASE-06_GITHUB_TRUTH_GATE_RECEIPT.md`](PHASE-06_GITHUB_TRUTH_GATE_RECEIPT.md) | Phase 06 GitHub truth gate receipt |
| [`PHASE-06_GITHUB_TRUTH_GATE_RECEIPT_FINAL.md`](PHASE-06_GITHUB_TRUTH_GATE_RECEIPT_FINAL.md) | Phase 06 GitHub truth gate receipt — final |
| [`PHASE-07_INTRO_HANDOFF_GATE_RECEIPT.md`](PHASE-07_INTRO_HANDOFF_GATE_RECEIPT.md) | Phase 07 — Intro Handoff Gate Receipt |
| [`PHASE-08_RESPONSIVE_A11Y_HARDENING_RECEIPT.md`](PHASE-08_RESPONSIVE_A11Y_HARDENING_RECEIPT.md) | PHASE-08 Responsive and Accessibility Hardening Receipt |
| [`PHASE-09A_SEO_HEADERS_RECEIPT.md`](PHASE-09A_SEO_HEADERS_RECEIPT.md) | Phase 09-A SEO / headers receipt |
| [`PHASE-09C_PERFORMANCE_INTEGRITY_RECEIPT.md`](PHASE-09C_PERFORMANCE_INTEGRITY_RECEIPT.md) | Current owner adjudication — 2026-09-07 |
| [`PHASE-09_DECISIONS_FOR_SKY.md`](PHASE-09_DECISIONS_FOR_SKY.md) | Current owner decision state — 2026-09-07 |
| [`PHASE-09_TECHNICAL_INTEGRITY_RECEIPT.md`](PHASE-09_TECHNICAL_INTEGRITY_RECEIPT.md) | Current owner adjudication — 2026-09-07 |
| [`PHASE-11_REMOTE_MUTATION_MANIFEST.md`](PHASE-11_REMOTE_MUTATION_MANIFEST.md) | Phase 11 remote mutation manifest — prepared by Phase 06 |

## Evidence directories (16)

| Directory | Files | Types | Cited by |
|---|---|---|---|
| [`2026-09-01_FlagstoneFinalPolish/`](2026-09-01_FlagstoneFinalPolish/) | 4 | png 4 | [`2026-09-01_Codex_FlagstoneFinalPolish.md`](2026-09-01_Codex_FlagstoneFinalPolish.md)<br>[`2026-09-01_Codex_ProjectLinkAffordance.md`](2026-09-01_Codex_ProjectLinkAffordance.md) |
| [`phase-07-captures/`](phase-07-captures/) | 47 | png 45, json 2 | [`2026-09-05_Codex_Phase07IntroHandoff_PreApproval.md`](2026-09-05_Codex_Phase07IntroHandoff_PreApproval.md)<br>[`PHASE-07_INTRO_HANDOFF_GATE_RECEIPT.md`](PHASE-07_INTRO_HANDOFF_GATE_RECEIPT.md) |
| [`phase-07-owner-acceptance/`](phase-07-owner-acceptance/) | 2 | json 1, mjs 1 | [`2026-09-07_Codex_Phase07OwnerAcceptance.md`](2026-09-07_Codex_Phase07OwnerAcceptance.md) |
| [`phase-07-repair3/`](phase-07-repair3/) | 46 | png 41, json 3, mjs 2 | [`2026-09-07_Codex_Phase07SeamAndIdentity.md`](2026-09-07_Codex_Phase07SeamAndIdentity.md)<br>[`PHASE-07_INTRO_HANDOFF_GATE_RECEIPT.md`](PHASE-07_INTRO_HANDOFF_GATE_RECEIPT.md) |
| [`phase-08-evidence/`](phase-08-evidence/) | 62 | json 27, mjs 17, log 12, png 5, md 1 | [`PHASE-08_RESPONSIVE_A11Y_HARDENING_RECEIPT.md`](PHASE-08_RESPONSIVE_A11Y_HARDENING_RECEIPT.md) |
| [`phase-09-a/`](phase-09-a/) | 14 | log 6, json 5, py 2, patch 1 | [`2026-09-07_Codex_Phase09.md`](2026-09-07_Codex_Phase09.md)<br>[`PHASE-09A_SEO_HEADERS_RECEIPT.md`](PHASE-09A_SEO_HEADERS_RECEIPT.md)<br>[`PHASE-09_TECHNICAL_INTEGRITY_RECEIPT.md`](PHASE-09_TECHNICAL_INTEGRITY_RECEIPT.md) |
| [`phase-09-b/`](phase-09-b/) | 21 | log 10, json 6, stderr 4, txt 1 | [`2026-09-07_Codex_Phase09.md`](2026-09-07_Codex_Phase09.md)<br>[`2026-09-07_Codex_Phase09Dependencies.md`](2026-09-07_Codex_Phase09Dependencies.md)<br>[`2026-09-07_Codex_Phase09Warnings.md`](2026-09-07_Codex_Phase09Warnings.md)<br>[`PHASE-09_TECHNICAL_INTEGRITY_RECEIPT.md`](PHASE-09_TECHNICAL_INTEGRITY_RECEIPT.md) |
| [`phase-09-evidence/`](phase-09-evidence/) | 63 | json 23, log 22, md 5, cjs 4, gz 4, png 2, py 2, txt 1 | [`2026-09-07_Codex_Phase09.md`](2026-09-07_Codex_Phase09.md)<br>[`PHASE-09_TECHNICAL_INTEGRITY_RECEIPT.md`](PHASE-09_TECHNICAL_INTEGRITY_RECEIPT.md) |
| [`phase-09-owner-resolution/`](phase-09-owner-resolution/) | 18 | json 9, md 5, cjs 1, gz 1, log 1, py 1 | [`2026-09-07_Codex_Phase09OwnerResolution.md`](2026-09-07_Codex_Phase09OwnerResolution.md)<br>[`PHASE-09C_PERFORMANCE_INTEGRITY_RECEIPT.md`](PHASE-09C_PERFORMANCE_INTEGRITY_RECEIPT.md)<br>[`PHASE-09_DECISIONS_FOR_SKY.md`](PHASE-09_DECISIONS_FOR_SKY.md)<br>[`PHASE-09_TECHNICAL_INTEGRITY_RECEIPT.md`](PHASE-09_TECHNICAL_INTEGRITY_RECEIPT.md) |
| [`phase04-evidence/`](phase04-evidence/) | 281 | png 252, json 17, log 6, cjs 5, mjs 1 | [`2026-09-04_Codex_Phase04Flagstone.md`](2026-09-04_Codex_Phase04Flagstone.md)<br>[`PHASE-04_FLAGSTONE_GATE_RECEIPT.md`](PHASE-04_FLAGSTONE_GATE_RECEIPT.md) |
| [`phase04-hold-resolution-evidence/`](phase04-hold-resolution-evidence/) | 176 | png 154, json 13, txt 7, cjs 2 | [`2026-09-04_Codex_Phase04HoldResolution.md`](2026-09-04_Codex_Phase04HoldResolution.md)<br>[`PHASE-04_FLAGSTONE_GATE_RECEIPT.md`](PHASE-04_FLAGSTONE_GATE_RECEIPT.md) |
| [`phase05-reconciliation-evidence/`](phase05-reconciliation-evidence/) | 26 | json 13, log 6, cjs 3, png 2, md 1, py 1 | [`PORTFOLIO_SUPPORTING_PROJECT_ACCEPTANCE_MATRIX.md`](PORTFOLIO_SUPPORTING_PROJECT_ACCEPTANCE_MATRIX.md) |
| [`phase06-candidates/`](phase06-candidates/) | 1 | md 1 | [`PHASE-06_GITHUB_TRUTH_GATE_RECEIPT_FINAL.md`](PHASE-06_GITHUB_TRUTH_GATE_RECEIPT_FINAL.md)<br>[`PHASE-11_REMOTE_MUTATION_MANIFEST.md`](PHASE-11_REMOTE_MUTATION_MANIFEST.md) |
| [`phase06-evidence/`](phase06-evidence/) | 6 | md 3, json 2, html 1 | [`PHASE-06_APPROVAL_PACKET.md`](PHASE-06_APPROVAL_PACKET.md)<br>[`PHASE-06_GITHUB_TRUTH_GATE_RECEIPT.md`](PHASE-06_GITHUB_TRUTH_GATE_RECEIPT.md) |
| [`repository-professionalization/`](repository-professionalization/) | 2 | md 2 | no top-level report |
| [`visual-evidence/`](visual-evidence/) | 16 | png 16 | [`2026-09-01_Codex_FlagstoneFirstImpression.md`](2026-09-01_Codex_FlagstoneFirstImpression.md) |

## Receipts filed inside evidence directories (3)

| Receipt | Title |
|---|---|
| [`phase-08-evidence/PREAPPROVAL_RECEIPT.md`](phase-08-evidence/PREAPPROVAL_RECEIPT.md) | PHASE-08 Responsive and Accessibility Hardening Receipt |
| [`phase06-evidence/profile-candidate-receipt.md`](phase06-evidence/profile-candidate-receipt.md) | Phase 06 profile candidate receipt |
| [`repository-professionalization/2026-09-26_REPOSITORY_PROFESSIONALIZATION_RECEIPT.md`](repository-professionalization/2026-09-26_REPOSITORY_PROFESSIONALIZATION_RECEIPT.md) | Repository professionalization receipt (2026-09-26) |

## Older material

Top-level files by the month named in their file name:

| Month | Top-level files |
|---|---|
| 2026-09 | 39 |
| 2026-08 | 2 |
| 2026-07 | 2 |
| 2026-06 | 19 |
| 2026-05 | 95 |
| undated | 18 |

To list a month, run `git ls-files 'qa-reports/*2026-05-*'` (substituting the month). The May 2026 role and cycle reports also embed their date mid-name, for example `cycle-2026-05-23.md`.

Earlier hand-maintained indexes, preserved as dated records: [`2026-05-28_INDEX_handcurated.md`](2026-05-28_INDEX_handcurated.md).
