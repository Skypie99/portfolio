# Repository index: what is current, what is history

This repository keeps its history instead of deleting it, so most of its Markdown
is dated record, not instruction. This page says which files describe the present,
which are contracts, runbooks, or evidence, and which are preserved history. It
lists consequential surfaces only, not every file.

It is not a status page. It names no release, commit, or test count; those live
in GitHub Actions and in dated receipts.

## Where current truth lives

| Question | Authority |
|---|---|
| What is deployed, and did it pass its gates? | [GitHub Actions](https://github.com/Skypie99/portfolio/actions): the latest successful `Deploy` run and the `CI` run for the same commit |
| How are releases gated? | `.github/workflows/ci.yml`, `.github/workflows/deploy.yml` (executable), summarized in the README's "Release model" |
| What does the site do? | Source (`app/`, `components/`, `lib/`, `content/`, `public/`) and the tests beside it |
| Which commands exist? | `package.json` `scripts` |
| What may public copy claim? | `docs/IDENTITY_AND_CLAIM_CONTRACT.md`, enforced by `lib/__tests__/recruiter-copy-truth.test.ts` and related guards |
| Where is the QA evidence? | [`qa-reports/INDEX.md`](../qa-reports/INDEX.md) (generated) |
| What does each script do? | [`scripts/README.md`](../scripts/README.md) |

### Authority order

When two sources disagree, the higher one wins, and the lower one is the thing to fix or label.

1. Remote current state and executable configuration: GitHub Actions history, `.github/workflows/`, `package.json`, `next.config.mjs`.
2. Current source, including the tests that guard it.
3. Current contracts.
4. Current documentation.
5. Dated release and QA evidence (true for its own date).
6. Historical plans and reports.

## Lifecycle labels

| Label | Meaning |
|---|---|
| `ACTIVE_SOURCE` | Code, content, or masters the site or its pipelines are built from. |
| `ACTIVE_CONFIG` | Executable configuration: workflows, package scripts, build and test config. |
| `CURRENT_DOC` | Maintained documentation that describes the present. |
| `CURRENT_CONTRACT` | Maintained rules that current work must satisfy. Source and tests win on conflict. |
| `CURRENT_RUNBOOK` | Maintained operating procedure for a live system or tool. |
| `RELEASE_EVIDENCE` | Dated receipts, candidate SHA/tree records, and gate evidence. Never rewritten. |
| `HISTORICAL_PLAN` | A plan, spec, or prompt for past work. Kept for provenance, not instruction. |
| `HISTORICAL_RECEIPT` | A dated report of completed work. |
| `HISTORICAL_STATE` | A status snapshot that was current on its own date. |
| `REFERENCE` | Background that is still useful but not binding. |
| `GENERATED` | Machine-written; regenerate it rather than editing by hand. |
| `GENERATED_EXPIRED` | Generated output past its stated validity window. |
| `SUPERSEDED` | Replaced by a named successor. |
| `PARTIALLY_CURRENT_REFERENCE` | Mostly historical, with a named part that still applies. |

Historical does not mean disposable, and superseded does not mean false: dated
counts and claims stay true for their dates.

## Register

### Current

| Path | Label | Notes |
|---|---|---|
| `README.md` | `CURRENT_DOC` | Orientation. Dated history sits below its "Historical record" boundary. |
| `CLAUDE.md` | `CURRENT_DOC` | Contributor and agent guidance: stack, conventions, gotchas. |
| `content/README.md` | `CURRENT_DOC` | How the content JSON drives the site. |
| `scripts/README.md` | `CURRENT_DOC` | Script lifecycle and how to run each tool. |
| `proof-masters/README.md` | `CURRENT_DOC` | Where raw proof media goes (never shipped). |
| `docs/INDEX.md` | `CURRENT_DOC` | This page. |
| `package.json`, `next.config.mjs`, `tailwind.config.ts`, `tsconfig.json`, `vitest.config.ts`, `.eslintrc.json` | `ACTIVE_CONFIG` | `next.config.mjs` `headers()` is documentation only on GitHub Pages. |
| `.github/workflows/ci.yml`, `.github/workflows/deploy.yml` | `ACTIVE_CONFIG` | The release gate. |
| `.github/workflows/supabase-keepalive.yml` | `ACTIVE_CONFIG` | Daily read that keeps the `/archive` Supabase project active. |
| `UI_SYSTEM.md` | `CURRENT_CONTRACT` | Visual rules. Tokens in `app/globals.css` and `tailwind.config.ts` win on conflict. |
| `MOTION_SYSTEM.md` | `CURRENT_CONTRACT` | Motion rules and the reduced-motion contract. `lib/motion.ts` and `app/globals.css` win on conflict. |
| `docs/IDENTITY_AND_CLAIM_CONTRACT.md` | `CURRENT_CONTRACT` | Identity vocabulary and public-claim rules (approved 2026-09-03, maintained since). |
| `docs/PORTFOLIO_TRUTH_MANIFEST.md` | `CURRENT_CONTRACT` | Evidence base behind the recruiter-copy truth guards. Its machine paths are as-recorded. |
| `docs/ARCHIVE_RUNBOOK.md` | `CURRENT_RUNBOOK` | Deploy, unpause, SMTP, and second-user procedures for `/archive`. |
| `docs/showcase-factory.md` | `CURRENT_RUNBOOK` | The capture factory, including how to configure project locations. |
| `content/*.json` | `ACTIVE_SOURCE` | Validated at build time. `content/showcase.manifest.json` is `GENERATED` by the capture factory. |
| `supabase/migrations/` | `ACTIVE_SOURCE` | The archive schema, append-only. |
| `cinematic-masters/` | `ACTIVE_SOURCE` | Regeneration masters for the protected cinematic scene. Never shipped. |

### Evidence and reference

| Path | Label | Notes |
|---|---|---|
| `qa-reports/INDEX.md` | `GENERATED` | The evidence entry point. Regenerate with `npm run qa:index`. |
| `qa-reports/` dated receipts and phase evidence | `RELEASE_EVIDENCE` | Receipts, candidate SHA/tree records, accessibility proof. Never rewritten. |
| `qa-reports/` May 2026 role and cycle reports | `HISTORICAL_RECEIPT` | Cycle briefings and per-role reports. |
| `design-reviews/` | `HISTORICAL_RECEIPT` | Dated review programs (`<program>/<date>/`) and their raw evidence. |
| `summaries/` | `HISTORICAL_RECEIPT` | June 2026 pass reports and their emails. |
| `DECISIONS_LOG.md` | `REFERENCE` | Dated decision ledger. Each row is provenance for its date; later rows and current source override. |
| `docs/LEARNINGS.md` | `REFERENCE` | Dated gotcha log. |
| `docs/showcase-tokens.md` | `REFERENCE` | Showcase token map. Token names still resolve; its line numbers are as-written. |
| `designs/AESTHETIC_LOCKFILE.md` | `REFERENCE` | Aesthetic record for the protected cinematic scene. |
| `docs/DEPLOY_PLAN.md` | `PARTIALLY_CURRENT_REFERENCE` | Day-0 deploy plan. Only the §6 rollback approach still applies. |

### Historical

| Path | Label | Notes |
|---|---|---|
| `PROJECT_STATE.md` | `HISTORICAL_STATE` | Status snapshots, the newest dated 2026-09-04. |
| `PROJECT_STATE.md.bak` | `HISTORICAL_STATE` | Backup of a 2026-05-28 snapshot. Left byte-identical. |
| `FEATURES.md` | `HISTORICAL_STATE` | Backlog snapshot from 2026-05-29. |
| `PLAN.md` | `HISTORICAL_PLAN` | Day-0 cycle plan, 2026-05-23. |
| `CONTINUOUS_WORLD_PLAN.md`, `FINAL_POLISH_PLAN.md`, `FINAL_SWEEP_PLAN.md`, `FIX_PLAN.md`, `REFINEMENT_PLAN.md`, `REFINE_WOW_PLAN.md`, `SHOW_WORK_PLAN.md`, `STRUCTURAL_PASS_PLAN.md`, `VOICE_PASS_PLAN.md` | `HISTORICAL_PLAN` | Branch work plans from June 2026. |
| `COWORK_PROMPT.md`, `docs/COWORK_GITHUB_URLS.md` | `HISTORICAL_PLAN` | One-off prompts from May 2026. |
| `docs/FEATURES.md`, `docs/PERSONAS.md`, `docs/PROJECT_DESIGN.md`, `docs/DATA_SHAPE.md`, `docs/SCAFFOLDING_PLAN.md` | `HISTORICAL_PLAN` | Day-0 specs (2026-05-23 to 2026-05-28). |
| `designs/CINEMATIC_INTRO.md`, `designs/home-hero-mockup.md`, `designs/phase2-design-spec.md` | `HISTORICAL_PLAN` | Design specs for past passes. |
| `docs/ACCESSIBILITY.md` | `SUPERSEDED` | Day-0 audit. Its own banner names the current contrast guard and `/accessibility` statement. |
| `TASK_T_GARY_GAPS.md` | `SUPERSEDED` | 2026-05-27 test task, since covered by `lib/__tests__/static-integrity.test.ts`. |
| `.context-bundle.md` | `GENERATED_EXPIRED` | Agent boot bundle generated 2026-05-29, valid for about seven days. |

## Keeping this legible

- When a document stops describing the present, add a one-line lifecycle banner
  (label, date, where current truth lives) instead of rewriting its body, and
  update its row here.
- Date new plans and receipts in their first lines; dated receipts belong under `qa-reports/`.
- Physical moves of historical files are deliberately deferred: many are cited by
  path from receipts and evidence manifests.
