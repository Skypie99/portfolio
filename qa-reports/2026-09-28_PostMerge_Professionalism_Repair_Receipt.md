# Post-merge professionalism repair receipt (2026-09-28)

> **Status: `COMPLETE`** (2026-09-28, local commit only; no push, merge, deploy, tag, PR, or issue). This receipt records the bounded repair of the safe, low-risk findings from `PORTFOLIO-FINAL-POSTMERGE-AUDIT-20260928-V2`. The F-003 evidence mass was deliberately deferred and untouched.

| Field | Value |
|---|---|
| PROMPT_ID | `PORTFOLIO-POSTMERGE-PROFESSIONALISM-REPAIR-20260928` |
| SOURCE_AUDIT | `/Users/skypie/Portfolio-codex/portfolio-final-postmerge-audit-20260928` (8 artifacts, read only) |
| BASE_SHA | `694b31c74024fed1a3a956b6dae2f6bd5449c154` (= `origin/main`; the audit's audited revision) |
| BRANCH | `codex/portfolio-postmerge-professionalism-repair-20260928` |
| CANDIDATE_SHA | this commit (the single local candidate; no remote action) |
| SCOPE | documentation and layout only: no application behavior, content, test logic, workflow, or protected cinematic source changed |
| REMOTE_ACTIONS | NONE |
| MAIN_MUTATED | NO |

## Findings addressed

| Finding | Severity | Disposition | What changed |
|---|---|---|---|
| F-001 Root history debt | MEDIUM | RESOLVED | 14 dated root documents moved to `docs/history/`; `PROJECT_STATE.md.bak` and `.context-bundle.md` removed; `docs/INDEX.md` register updated; current references repointed. |
| F-002 PR #23 post-merge truth | MEDIUM | RESOLVED | Top lifecycle status banner (`MERGED`, 2026-09-28) plus a dated post-merge addendum appended to the GSAP receipt; body preserved unchanged. |
| F-004 `.gitignore` guidance drift | LOW | RESOLVED | Comment reworded: `design-reviews/` is tracked evidence; only `design-reviews/showcase-refresh/masters/` is excluded. |
| F-005 Owner-path exposure | LOW | PARTIAL (forward) | One-line "paths are as-recorded" disclosure added to `docs/IDENTITY_AND_CLAIM_CONTRACT.md`, matching the truth-manifest disclosure. Regeneration of `content/showcase.manifest.json` is deferred to the next capture-factory run (owner-scoped). |
| F-006 Incomplete test-directory list | LOW | RESOLVED | `test-utils/__tests__/` added to `CLAUDE.md`, with a note that it holds the GSAP timer owner. |
| F-007 Stale placeholder comments | LOW | RESOLVED (2 of 3) | `components/ProjectCard.tsx` and `components/Footer.tsx` comments corrected. `components/CertCard.tsx` left unchanged: its NEEDS-SKY-ASSET note appears still accurate (UP-18 badge art) and already carries its tracking ID. |
| F-008 Tracked `.bak` at root | LOW | RESOLVED | `PROJECT_STATE.md.bak` deleted (git history preserves it). |
| F-003 Committed evidence mass | MEDIUM | DEFERRED_UNTOUCHED | No qa-reports / design-reviews / cinematic-masters evidence was deleted, moved, compressed, or pruned. Owner decision. |
| F-009..F-012 | NOTE | DEFERRED / no action | Local-main housekeeping, LICENSE, verified-clean privacy claim, and the dated a11y figure are outside this bounded repair. |

## Files changed

Moved (git records each as a rename; banners and bodies byte-identical except the banner's own relative link targets, adjusted for the new depth):

- `CONTINUOUS_WORLD_PLAN.md`, `COWORK_PROMPT.md`, `FEATURES.md`, `FINAL_POLISH_PLAN.md`, `FINAL_SWEEP_PLAN.md`, `FIX_PLAN.md`, `PLAN.md`, `PROJECT_STATE.md`, `REFINEMENT_PLAN.md`, `REFINE_WOW_PLAN.md`, `SHOW_WORK_PLAN.md`, `STRUCTURAL_PASS_PLAN.md`, `TASK_T_GARY_GAPS.md`, `VOICE_PASS_PLAN.md` to `docs/history/<name>`.

Deleted:

- `PROJECT_STATE.md.bak`, `.context-bundle.md` (both captured by the audit as obsolete; git history preserves both).

Edited:

- `docs/INDEX.md` - historical register rows repointed to `docs/history/`; deleted-file rows removed; the "physical moves deferred" note replaced with the new location and a note that pre-2026-09-28 receipts keep their then-root citations.
- `qa-reports/2026-09-27_Codex_GSAP_Timer_Race_Repair.md` - added a top `Status: MERGED` lifecycle banner (2026-09-28, body unchanged) and appended `## Addendum: merged` recording the merge SHA, scoping the body to 2026-09-27.
- `.gitignore` - F-004 comment.
- `CLAUDE.md` - F-006 test-directory list; current-history location note.
- `components/ProjectCard.tsx`, `components/Footer.tsx` - F-007 comment corrections.
- `docs/IDENTITY_AND_CLAIM_CONTRACT.md` - F-005 as-recorded path disclosure.
- `MOTION_SYSTEM.md`, `UI_SYSTEM.md`, `components/WorldBackdrop.tsx` - current references to moved files repointed to `docs/history/`.

New:

- `qa-reports/2026-09-28_PostMerge_Professionalism_Repair_Receipt.md` (this receipt).

Regenerated:

- `qa-reports/INDEX.md` (generator output only).

## Validation evidence

| Check | Result |
|---|---|
| `node scripts/generate-qa-index.mjs --check` | `qa-reports/INDEX.md is up to date.` exit 0 |
| `node scripts/validate-assets.mjs` | Exit 0; all certificate badges, cinematic plates, deliverable proofs, and blog figures found. |
| Root first-impression clutter | Root now holds only `README.md`, `CLAUDE.md`, `DECISIONS_LOG.md`, `MOTION_SYSTEM.md`, `UI_SYSTEM.md` as Markdown; no `.bak`, no agent bundle. |
| `docs/INDEX.md` coherence | Every listed historical path exists at the listed location; deleted files no longer listed. |
| Stale PR #23 pending/unmerged language | Only the dated 2026-09-27 receipt body contains pre-merge wording; it is explicitly superseded by the appended 2026-09-28 addendum. No current document frames PR #23 as pending. |
| Authoritative evidence preserved | Full `git diff --stat` is limited to the paths above; no `qa-reports/` evidence file was deleted or altered except the F-002 addendum and the regenerated index. |
| Link targets in moved banners | `../INDEX.md`, `../../README.md`, `../showcase-factory.md` all resolve from `docs/history/`. |
| Dependency-backed gates (`lint`, `typecheck`, `build`, `test`) | Not run: `node_modules` is absent and the task forbids installing dependencies for a documentation repair. The same environmental limit applied to the source audit. |

## Intentionally deferred

- **F-003** - the 961-file evidence estate (521 PNGs, 187 files over 500 KB) is untouched; retro-pruning is a separate owner decision and permanent in git history.
- **F-005 forward fix** - repo-relative provenance in `content/showcase.manifest.json` waits for the next capture-factory regeneration.
- **F-009** - local `main` ref still trails `origin/main`; a machine artifact, not repository content.
- **F-010** - LICENSE / SECURITY.md / CONTRIBUTING remain an owner call.
- **F-012** - the dated 763-test figure is refreshed only on the next accessibility measurement run.

## Remaining findings after this repair

- MEDIUM: 0 (F-001, F-002 addressed; F-003 deferred by design).
- LOW: 0 open in this batch (F-004, F-006, F-007, F-008 resolved; F-005 partially, forward-only).
- NOTE: F-009, F-010, F-012 unchanged owner calls; F-011 verified clean.
