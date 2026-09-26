# Repository professionalization receipt (2026-09-26)

| Field | Value |
|---|---|
| PROMPT_ID | `SKYPI-PORTFOLIO-REPOSITORY-PROFESSIONALIZATION-IMPLEMENT-V2` |
| SOURCE_AUDIT | `SKYPI-REPO-PROFESSIONALISM-AUDIT-V2`; frozen pre-implementation score 78 / 100 (not re-scored here) |
| STATUS | COMPLETE_WITH_GAPS (dependency-backed gates were environment-blocked; see VALIDATION_RESULTS) |
| BASE_SHA | `129988b88bb6717aa65311bb7af12af8e4aa22ad` |
| BASE_TREE | `4bccb76ab813970992e85bb4604a744b6d7f8dc8` |
| CANDIDATE_SHA | `9c2862ee96d0aeea6ec98e55dee8882e5f7cefa5` (C3, the last source commit) |
| CANDIDATE_TREE | `97bf6ec3519c4c0a74000cf4e9810cb3ecf8dce4` (exact tree of C3; this receipt excluded) |
| BASELINE_DRIFT | NO: `git fetch origin main` gave `origin/main` = `129988b8…`, tree `4bccb76a…`, identical to the audit reference |
| WORKTREE | `/home/user/portfolio`: a fresh, session-dedicated cloud clone already on the branch below (see KNOWN_LIMITS) |
| BRANCH | `claude/portfolio-repo-professionalization-lbtdfr` |
| EXECUTION | Claude Code cloud session, 2026-09-26 UTC. Local commits only: no push, merge, deploy, tag, PR, or issue. |

## Commits

| # | SHA | Tree | Subject |
|---|---|---|---|
| C1 | `5e4525fda411bcff5af08bdc15f4890923a55503` | `7d4a8ff37e83cf69684216f5c5e60aa0cd29c23f` | chore(tooling): make capture tooling portable across machines |
| C2 | `b097fedd964797d825300181bb7e028eaae4285f` | `221104af31db0c5be642c257afb29e4a50b65a71` | docs(qa): restore evidence discovery with a generated QA index |
| C3 | `9c2862ee96d0aeea6ec98e55dee8882e5f7cefa5` | `97bf6ec3519c4c0a74000cf4e9810cb3ecf8dce4` | docs(repo): clarify current truth and document lifecycle |
| C4 | this commit | | docs(qa): record repository professionalization closure (this receipt, the checkpoint, the regenerated index) |

The commits were ordered so each one's claims hold when it lands: tooling first, then the index, then the
documents that reference both. The only forward reference is C2's index linking to `docs/INDEX.md`, which
arrives in C3.

## Finding dispositions

| Finding | Disposition | Summary |
|---|---|---|
| F-001 README production truth self-stales | RESOLVED | No hand-written production SHA or test total in the current orientation; the release record is GitHub Actions. |
| F-002 No document lifecycle boundary | RESOLVED | `docs/INDEX.md` (authority order, 14 labels, register) plus 17 one-line banners. No file moved. |
| F-003 QA index stopped indexing | RESOLVED | Deterministic generator with `--check`; the index covers every tracked QA file. |
| F-004 Workflow comments contradict behavior | RESOLVED | Comment-only edits; parsed YAML identical to base. |
| F-005 Contributor guidance drift | RESOLVED | Bounded `CLAUDE.md` corrections; `content/README.md` rewritten. |
| F-006 Owner-machine path coupling | RESOLVED | 7 literal `/Users/skypie` paths removed from active scripts; env overrides with identical defaults on Sky's machine. |
| F-007 Evidence duplication (forward only) | RESOLVED (forward rule only) | Rule added to the generated QA index. No historical evidence touched or deduplicated. |
| F-008 Browser verifier has no status | RESOLVED | `scripts/README.md` classifies every script; `verify-intro-focus.cjs` is `UNKNOWN` on the evidence. |
| F-009 Public git author email | OWNER_DECISION | No identity change, amend, or history rewrite. C1 to C4 carry the container's configured identity (`Claude <noreply@anthropic.com>`). |

## Files changed (34 paths, BASE to C4)

| Path | Phase | Finding | Why required |
|---|---|---|---|
| `README.md` | A | F-001, F-002 | Durable current orientation; dated layers below the guarded boundary. |
| `docs/INDEX.md` (new) | B | F-002 | Authority and lifecycle index. |
| `FEATURES.md`, `PROJECT_STATE.md`, `PLAN.md`, `COWORK_PROMPT.md`, `TASK_T_GARY_GAPS.md`, `CONTINUOUS_WORLD_PLAN.md`, `FINAL_POLISH_PLAN.md`, `FINAL_SWEEP_PLAN.md`, `FIX_PLAN.md`, `REFINEMENT_PLAN.md`, `REFINE_WOW_PLAN.md`, `SHOW_WORK_PLAN.md`, `STRUCTURAL_PASS_PLAN.md`, `VOICE_PASS_PLAN.md`, `.context-bundle.md`, `docs/DEPLOY_PLAN.md`, `docs/COWORK_GITHUB_URLS.md` (17) | C | F-002 | One banner each, inserted after the H1: `+2/-0` lines per file, bodies unchanged. |
| `scripts/generate-qa-index.mjs` (new), `package.json` (+2 scripts) | D | F-003 | Generator plus `qa:index` / `qa:index:check`. No dependency change. |
| `qa-reports/INDEX.md` | D, I | F-003, F-007 | Generated index, including the forward evidence rule. |
| `qa-reports/2026-05-28_INDEX_handcurated.md` | D | F-003 | The hand-curated index, preserved byte-identical (blob `8ac4d04`; git records a 100% rename). |
| `.github/workflows/ci.yml`, `.github/workflows/deploy.yml` | E | F-004 | Comment-only truth repair. |
| `CLAUDE.md`, `content/README.md` | F | F-005 | Current contributor and content guidance. |
| `scripts/showcase/registry.mjs`, `scripts/capture-showcase.mjs`, `scripts/archive/extract-seed.mjs`, `docs/showcase-factory.md` | G | F-006 | Portability layer, clear failures, configuration docs. |
| `scripts/README.md` (new) | H | F-008 | Script lifecycle index. |
| `qa-reports/repository-professionalization/IMPLEMENTATION_CHECKPOINT.md`, this receipt | §8, §27 | all | Resume aid and closure record. |

No deletions and no binary changes. Nothing changed under `app/`, `components/`, `lib/`, `public/`, `supabase/`,
`cinematic-masters/`, `proof-masters/`, `pages/`, or `content/*.json`, nor in `tailwind.config.ts`,
`next.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `vitest.setup.ts`, or `package-lock.json`.

## Current-truth changes (F-001)

- Evidence of the defect: Deploy run #177 (`36105395646`, event `workflow_run`, success, `head_sha` `129988b8…`,
  2026-09-25T06:59:18Z) published `129988b8…` while the README still named `88075547…` from Deploy run #176
  (2026-09-23). This was a read-only Actions query.
- The current orientation states the release model (main as source, CI on push and PR, Deploy only after a green
  CI run, exact-SHA checkout, ungated `workflow_dispatch`, no staging, Sky-only merge and release) and points to
  the Deploy run list as the record. It keeps the positioning, SkyPi Studio, the five-project set, Flagstone's
  release, the synthetic Dashboard demo, the human/AI boundary, links, routes (verified against `app/`,
  `app/sitemap.ts`, and `public/`), architecture, and quick start.
- The 2026-09-24 block moved below the boundary. Its first sentence was recast to past tense and noted in place;
  zero "Production is commit" sentences remain. All 190 historical lines were carried over in order (verified by
  script), with only their heading levels nested.
- `lib/__tests__/recruiter-copy-truth.test.ts` (P10-R-COPY-001) logic, replicated exactly: the boundary appears
  once, and there is no em dash and no prose `--` above it. PASS.

## Lifecycle changes (F-002)

`docs/INDEX.md` defines `ACTIVE_SOURCE`, `ACTIVE_CONFIG`, `CURRENT_DOC`, `CURRENT_CONTRACT`, `CURRENT_RUNBOOK`,
`RELEASE_EVIDENCE`, `HISTORICAL_PLAN`, `HISTORICAL_RECEIPT`, `HISTORICAL_STATE`, `REFERENCE`, `GENERATED`,
`GENERATED_EXPIRED`, `SUPERSEDED`, and `PARTIALLY_CURRENT_REFERENCE`, an authority order (remote state and
executable config, then source and tests, contracts, docs, dated evidence, historical plans), and a register of
consequential surfaces. Banners assigned: `HISTORICAL_STATE` (`PROJECT_STATE.md`, `FEATURES.md`),
`HISTORICAL_PLAN` (`PLAN.md`, nine root `*_PLAN.md`, `COWORK_PROMPT.md`, `docs/COWORK_GITHUB_URLS.md`),
`SUPERSEDED` (`TASK_T_GARY_GAPS.md`), `GENERATED_EXPIRED` (`.context-bundle.md`), and
`PARTIALLY_CURRENT_REFERENCE` (`docs/DEPLOY_PLAN.md`; only the §6 rollback still applies). Each banner states
facts taken from the document itself (dates, branches) and was checked against source: `next.config.mjs` has no
`basePath`, `public/CNAME` is `skypistudio.com`, and CI and Deploy use Node 24.

### Active-looking stale document register

Definition: a tracked document outside dated evidence areas that, at base, carried no lifecycle banner or history
boundary around the claim, and either asserted a present-tense operational claim that was false at base or gave
paste-ready or current-tense instructions that would now mislead. Self-dated plans and specs are excluded from
the count (the root ones were bannered anyway). This register is this implementation's definition; the re-audit
may count differently.

| # | Document (base evidence) | After |
|---|---|---|
| 1 | `README.md:5-7` "Current state: 2026-09-24 … Production is commit `88075547…`" | Corrected |
| 2 | `CLAUDE.md:18` auto-deploy "on push to `main`"; `:98` "live within ~2 minutes"; `:130` "No theme system yet" | Corrected |
| 3 | `content/README.md:6` "future `/work` page"; `:9` "placeholder paths … before launch" | Rewritten |
| 4 | `qa-reports/INDEX.md:3-5` last updated 2026-05-28, 71 reports; `:211` "EXECUTING NOW" | Generated |
| 5 | `.github/workflows/ci.yml:3` "Dormant until Sky pushes"; `:11-12` "does NOT gate the deploy" | Corrected |
| 6 | `.github/workflows/deploy.yml:3-4` "DORMANT until Sky pushes the repo to GitHub" | Corrected |
| 7 | `PROJECT_STATE.md:3-27` current block with Flagstone "Waiting for Review" | Bannered |
| 8 | `FEATURES.md:4-8` "source of truth for what to do next"; push deploys "with no staging gate" | Bannered |
| 9 | `TASK_T_GARY_GAPS.md:1,43` "(In Progress)", "START NOW" | Bannered |
| 10 | `COWORK_PROMPT.md:3` "Paste everything below this line into Cowork" | Bannered |
| 11 | `docs/COWORK_GITHUB_URLS.md:3` "Paste everything between the dashed lines" | Bannered |
| 12 | `.context-bundle.md:3-5` agent-boot bundle, "valid for ~7 days", generated 2026-05-29 | Bannered |
| 13 | `docs/DEPLOY_PLAN.md:301` "Workflow: DORMANT", `/portfolio` basePath, Node 20; cited by `deploy.yml` | Bannered |

## QA index changes (F-003, F-007)

- `scripts/generate-qa-index.mjs` builds the index from `git ls-files -z -- qa-reports`: totals and file types,
  the newest dated reports, all 14 PHASE gate receipts, every evidence directory with the top-level receipts that
  cite it (16 directories at closure), receipts filed inside evidence directories, a by-month table, and earlier
  hand-maintained indexes. Built-ins only, no network, byte-order sorting, no timestamps.
- Verified: a rerun writes nothing; `--check` exits 0 when current, 1 on drift (reporting the first differing
  line), and 2 on a bad argument; output is identical under `LC_ALL=C`, `tr_TR.UTF-8`, and shifted time zones,
  and from another working directory; the check writes nothing even when the index is missing.
- Forward evidence rule (F-007), in the generated index: cite an existing byte-identical artifact by path with its
  SHA-256 or a manifest entry instead of committing another copy, unless a self-contained package or before/after
  comparison genuinely needs the copy. `CLAUDE.md` points to it. Not wired into CI; that is an owner decision.

## Workflow comment changes (F-004)

`ci.yml`: removed "Dormant until Sky pushes", the independent-deploy paragraph, and the stale
`CI-DEPLOY-UNGATED` pointer; corrected `cycle/*` to `cycle/**` (as executed) and the concurrency rationale
(different refs, not event type). `deploy.yml`: removed "DORMANT"; the separation note now covers PR and push
runs; `workflow_run` is described precisely (CI runs whose head branch is `main`, success-gated);
`workflow_dispatch` is described as a manual, ungated deploy of the dispatched branch tip; and rollback now says
revert on `main`, or re-run an earlier successful Deploy run (a re-run replays its original event).

## Contributor doc changes (F-005)

`CLAUDE.md`: scope line (all route families), local path, stack (GSAP, next-themes, CI-gated hosting), file
map, `status` required, optional media paths, `appstore` link type, "at most one" featured, other content files,
push-to-live timing without a stale number (Actions shows about four minutes from push to live), the "no SHA in
docs" rule, commands (lint, qa:index), the styling convention as practised (inline `style=` only for
runtime-computed values and OG routes), themes, all three test directories, the QA evidence pointer, Gotcha 8
(the README guard), and Gotcha 9 (the generated index). `content/README.md`: which file drives which surface
(from the loader consumers), enforced rules, where assets live, and how to change content safely.

## Script portability changes (F-006)

- `registry.mjs`: `SHOWCASE_REPO_<SLUG>` override (absolute or `~/`), home-relative defaults, `repoEnvVar`, and
  `requireRepo()`. With `HOME=/Users/skypie`, `PROJECTS`, `VIEWPORTS`, `BUDGETS`, `FORBIDDEN_TARGETS`, and
  `NETWORK_FENCES` deep-equal base, all six repo paths are identical, and so the manifest's `repo` values stay
  stable on Sky's machine.
- `capture-showcase.mjs`: `requireRepo(project)` is called only before a dry-run `resolveSha` and before
  `resolveSource`; the approved-master path, which never opens a checkout, is unchanged. The `--dry` usage
  comment is corrected.
- `extract-seed.mjs`: `ARCHIVE_PROTOTYPE` kept; the fallback is now `homedir()/Downloads/studio_archive.html`
  (identical on Sky's machine); a missing file fails with one actionable line before any write, instead of a
  raw ENOENT stack.
- Exercised: absolute override, `~` expansion, a non-git directory, and a missing default each fail naming the
  project and its variable; a real checkout passes. Before: 7 literal `/Users/skypie` paths in active scripts.
  After: 0.

## Script lifecycle changes (F-008)

`scripts/README.md`: `ACTIVE_BUILD` (validate-assets, prune-500, og-png-alias), `ACTIVE_MAINTENANCE`
(generate-qa-index), `ACTIVE_QA` (overflow-census, owner machine only), `MEDIA_PIPELINE` (the capture factory
and its modules, wire-showcase, og-cards, encode-proof, encode-video), `REGENERATION` (separate-scene,
fix-arrival-sky, build-arrival-cliff, encode-planes, encode-planes-mobile), `MIGRATION` (archive/extract-seed),
and `UNKNOWN` (verify-intro-focus). Discovery for `verify-intro-focus.cjs`: it was added in `7ce2467`
(2026-09-07) and is referenced by no package script, workflow, document, or tracked output (no `evidence.json`
with its keys exists). It is documented from source (interface, assertions, exit codes, local-only fence) and
not deleted.

## Reference check results

| Target | Tracked inbound references | Finding |
|---|---|---|
| `PROJECT_STATE.md.bak` | 3 phase-09 source inventories | Historical inventories only |
| `TASK_T_GARY_GAPS.md` | 1 historical report mention + 3 inventories | Historical only |
| `COWORK_PROMPT.md` | 1 historical summary mention + 3 inventories | Historical only |
| `.context-bundle.md` | self + 3 inventories; written by an external script (`~/ClaudeCorp/scripts/regen-context-bundle.sh`) | External writer may exist |
| `FEATURES.md`, `PROJECT_STATE.md`, `PLAN.md`, `docs/DEPLOY_PLAN.md` | tens of mentions across `docs/`, `design-reviews/`, `qa-reports/`, `summaries/`; `docs/DEPLOY_PLAN.md` also from `deploy.yml` comments and a protected `next.config.mjs` comment | Too dense to move safely now |
| `qa-reports/INDEX.md` | no anchors or content dependencies | Regenerating in place is safe |

No test, script, workflow, or build step reads any bannered document. The one test that reads a changed document
is the README guard. The phase-09 inventories are bound to head `34cdd66` and already differed from base for
`README.md` and `package.json`, so they are dated snapshots, not live manifests, and banners do not weaken them.

## Root debris classifications (nothing moved or deleted)

| File | Classification | Future disposition |
|---|---|---|
| `PROJECT_STATE.md.bak` | LIKELY_SAFE | ARCHIVE_LATER. This shallow clone cannot confirm the backup's content survives elsewhere in history, so it is not a delete candidate. Left byte-identical, without a banner. |
| `TASK_T_GARY_GAPS.md` | LIKELY_SAFE | MOVE_LATER (bannered `SUPERSEDED`) |
| `COWORK_PROMPT.md` | LIKELY_SAFE | ARCHIVE_LATER (bannered `HISTORICAL_PLAN`) |
| `.context-bundle.md` | NEEDS_REVIEW | GENERATED_EXPIRED. The owner decides whether to delete it or regenerate it, because an external generator may still write it on Sky's machine; a regeneration there would drop the banner. |

## Protected path verification

The BASE to C3 diff over the protected pathset is empty. The `package-lock.json` blob `46e68f6` is identical;
there are 0 deletions and 0 binary changes. The only changes inside `qa-reports/` are additions plus the
regenerated `INDEX.md`; the prior index content is preserved byte-identical.

## Workflow semantic verification

| Workflow | Parsed YAML vs base | Non-comment lines vs base | Result |
|---|---|---|---|
| `ci.yml` | identical | identical | CI_WORKFLOW_EXECUTABLE_CHANGE: NONE |
| `deploy.yml` | identical | identical | DEPLOY_WORKFLOW_EXECUTABLE_CHANGE: NONE |
| `supabase-keepalive.yml` | identical | identical (bytes identical) | untouched |

## Script safety verification

| Check | Result | Basis |
|---|---|---|
| NO CROSS-REPO WRITE | PASS | `requireRepo` only calls `existsSync`; no sibling repository exists in this container, and none was touched. |
| NO STASH | PASS | No stash code in `scripts/` (comment mentions only). |
| NO PRIMARY CHECKOUT MUTATION | PASS | `worktree.mjs` byte-identical; in-place projects are only served. |
| DISPOSABLE WORKTREE ISOLATION PRESERVED | PASS | `worktree.mjs` and its call sites unchanged. |
| SUPABASE NON-GET FENCE PRESERVED | PASS | `driver.mjs` byte-identical; `NETWORK_FENCES` deep-equal. |
| MUTATING CONTROL FENCE PRESERVED | PASS | `FORBIDDEN_TARGETS` deep-equal; `driver.mjs` unchanged. |
| NOMINATIM BUDGET PRESERVED | PASS | `nominatimMaxPerRun: 1` unchanged. |
| ENV CONTENT NOT LOGGED | PASS | `copyEnv` unchanged; new messages print only slug, path, and variable name. |
| MEDIA BUDGETS PRESERVED | PASS | `BUDGETS` deep-equal; the encoders are byte-identical. |
| OVER-BUDGET SHIPPED-ASSET REFUSAL PRESERVED | PASS | `encode-video.mjs`, `encode-proof.mjs`, and the MASTERS-ONLY logic are unchanged. |
| REAPER / CLEANUP BEHAVIOR PRESERVED | PASS | `servers.mjs` unchanged; a `requireRepo` throw lands in `runProject`'s existing try/finally. |
| DRY-RUN SAFETY VERIFIED BEFORE EXECUTION | PASS | Inspected first: read-only git, preflight, and `mkdir` of two bank directories. Executed only with `SHOWCASE_BANK_ROOT` and `SHOWCASE_WT_ROOT` in scratch; blocked at import with no effects. |

## Validation results

| Gate | Result |
|---|---|
| `npm run typecheck` | VALIDATION_ENVIRONMENT_BLOCKED. No `node_modules`, and installs are prohibited. A global `tsc` ran and reported 3,027 diagnostics, all from missing modules and types (TS7026, TS2307, TS2591, …). No `.ts`/`.tsx` file or tsconfig input changed. Its `tsconfig.tsbuildinfo` was this session's own artifact and was removed. |
| `npm run lint` | VALIDATION_ENVIRONMENT_BLOCKED (`next: not found`). The lint scope (`app/`, `pages/`, `components/`, `lib/`) is unchanged. |
| `npm run build` | VALIDATION_ENVIRONMENT_BLOCKED. No build input changed; the prebuild step `npm run validate:assets` ran (built-ins only) and PASSED. |
| `npm test` | VALIDATION_ENVIRONMENT_BLOCKED (`vitest: not found`). The only test coupled to a changed file (the README guard) passes under exact replication. |
| `npm run test:static` | VALIDATION_ENVIRONMENT_BLOCKED (requires a build). |
| `npm run qa:index:check` | PASS at C2, C3, and C4. |
| `git diff --check` | PASS for authored changes. `git diff -C --check` is clean; plain `--check` flags only Markdown hard-break spaces inside the byte-identical preserved index. |
| `node --check` (4 changed or new `.mjs`) | PASS |
| Markdown links (all 27 changed Markdown files, this receipt included) | 139 relative links and anchors checked; 1 broken, pre-existing in the historical body of `FINAL_POLISH_PLAN.md` (`components/WorkFilterGrid.tsx`). |
| Capture `--dry` | VALIDATION_ENVIRONMENT_BLOCKED (`playwright-core` absent; sibling repos absent). The configuration layer was validated statically and by harness. |

## Acceptance

README_CURRENT_TRUTH PASS · README_SELF_STALING_SHA_REMOVED PASS · CURRENT_HISTORY_SEPARATION PASS ·
DOCS_AUTHORITY_INDEX PASS · QA_INDEX_CURRENT PASS · QA_INDEX_DETERMINISTIC PASS · QA_RAW_EVIDENCE_PRESERVED PASS ·
WORKFLOW_COMMENTS_CURRENT PASS · WORKFLOW_SEMANTICS_PRESERVED PASS · CLAUDE_MD_CURRENT PASS ·
CONTENT_README_CURRENT PASS · SCRIPT_INDEX_PRESENT PASS · ACTIVE_SCRIPT_PERSONAL_USER_PATHS ZERO ·
SHOWCASE_SAFETY_FENCES_PRESERVED PASS · PRODUCT_SOURCE_PRESERVED PASS · PACKAGE_LOCK_UNCHANGED PASS ·
NO_REMOTE_MUTATION PASS (one bounded `git fetch origin main` plus read-only GitHub Actions queries).

## Before and after metrics

| Metric | Before | After |
|---|---|---|
| Baseline audit score | 78 / 100 | not re-scored (the re-audit decides) |
| Root tracked files | 32 | 32 |
| Root Markdown-like files | 21 | 21 |
| Tracked `qa-reports/` files | 957 | 960 (+ preserved index, checkpoint, receipt) |
| QA index last updated | 2026-05-28 (hand-maintained) | generated from the tracked tree; `qa:index:check` PASS |
| QA index coverage | 71 reports, through 2026-05-28 | all 960 tracked files, dated paths through 2026-09-26 |
| Active-looking stale documents (register above) | 13 | 0 |
| Literal `/Users/skypie` paths in active scripts | 7 | 0 |
| Test files | 105 | 105 (unchanged; pass and skip counts not rerun, since the environment is blocked) |

## Self-review (§31)

- **Recruiter:** the README opens with who Sky is and what the repository is, says explicitly what is current and
  where release status lives, and shows the gated release path and validated content model.
- **Senior engineer:** stack, commands, deployment, tests, current and historical documents, the evidence entry
  point, and the script entry point are each one link from the README.
- **Future Sky:** release status is in GitHub Actions; `docs/INDEX.md` and the banners say which plans are
  history; `npm run qa:index` keeps evidence findable; `scripts/README.md` says which scripts matter;
  `docs/showcase-factory.md` covers another machine.

## Follow-ups (observed, not implemented)

1. **Security, potential; owner to verify.** `deploy.yml` filters `workflow_run` with `branches: [main]`, which
   matches the triggering CI run's head branch. A fork pull request from a branch named `main` that passes CI
   might therefore trigger Deploy, which checks out `workflow_run.head_sha` with `pages: write`. A candidate
   hardening is adding `github.event.workflow_run.event == 'push'` and a same-repository check on
   `head_repository` to the build job's `if:`. That is an executable change, out of scope here.
2. `npm run check:overflow` needs the untracked `design-reviews/showcase-refresh/tools/static-serve.mjs` and a
   macOS Playwright cache, so it cannot run from a fresh clone.
3. `capture-showcase.mjs --dry` passes `project.source.ref` to `git rev-parse`; that value is `undefined` for the
   live-captured Dashboard, so that project's dry-run line fails. Pre-existing.
4. The `lib/schema.ts` header says the schemas "mirror DATA_SHAPE.md §2 verbatim"; they have diverged. Protected
   path, not changed.
5. `MOTION_SYSTEM.md` §12 (dated 2026-06-04) says product media is "placeholder now"; all five projects now ship
   real captures. An optional annotation is the owner's call, since the file is treated as locked.
6. The Flagstone Expo capture is proven on macOS only; elsewhere `node_modules` is symlinked, which Metro rejects.
7. `verify-intro-focus.cjs`: wire it into a package script, keep it as is, or retire it.
8. Whether to run `qa:index:check` in CI (it would fail any evidence push that skips regeneration).
9. Physical moves of root debris, after the re-audit.
10. `FINAL_POLISH_PLAN.md` body links a component deleted since June. Historical, left unchanged.

## Known limits

- Validation: dependency-backed gates were not run (no `node_modules`; installs prohibited). Coverage rests on
  the structural argument that no build, type, lint, or test input changed except `README.md`, plus exact
  replication of the one coupled guard.
- Execution environment: a cloud Claude Code session, not local. The session clone was treated as the dedicated
  worktree. Sky's `~/Portfolio` is not present here and was untouched by construction.
- The container is ephemeral: C1 to C4 exist only in this session until the owner authorizes a push of the
  branch. Nothing was pushed.
- The clone is shallow (50 commits, grafted at `2c89a8e`), so pre-2026-09-04 history is not visible. Documents
  were dated by their own text.
- The generated index reads report titles and citations from working-tree files, so it matches a clean checkout.
- This receipt cannot contain its own commit SHA; C4 is reported in the handoff.

## Owner decisions remaining

F-009 (public author email); authorizing a push of this branch; follow-up 1 (deploy hardening); root debris
dispositions; the future of `verify-intro-focus.cjs`; whether to wire `qa:index:check` into CI.

## POST_WORK_REAUDIT_READY

YES, once the owner has reviewed, pushed, merged, and deployed, as appropriate. The re-audit should run against
the resulting remote state and may disagree with this receipt.
