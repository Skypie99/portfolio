# Post-merge professionalism repair receipt (2026-09-28)

> **Status: `COMPLETE`** (2026-09-28, local commits only; no push, merge, deploy, tag, PR, or issue). The body below is unchanged from the first wave, which deferred F-003, F-005-forward, and F-012. Those deferrals are closed as far as is safe locally in the [continuation](#continuation-deferred-work-completion-2026-09-28). The fresh acceptance review's HOLD items are repaired in the [acceptance-HOLD follow-up](#acceptance-hold-follow-up-historical-link-repair-2026-09-28). No evidence was deleted.

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
| F-005 Owner-path exposure | LOW | PARTIAL (forward) | One-line "paths are as-recorded" disclosure added to `docs/IDENTITY_AND_CLAIM_CONTRACT.md`, matching the as-recorded note about the truth manifest in `docs/INDEX.md`. Regeneration of `content/showcase.manifest.json` is deferred to the next capture-factory run (owner-scoped). |
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

---

## Continuation: deferred-work completion (2026-09-28)

> **Status: `COMPLETE`** (continuation; local commit only; no push, merge, deploy, tag, PR, or issue). Starting SHA `50d1b76f03f65efc967fc4b548000c5d2bc751b5`. This closes the deferred items from the first wave as far as is safe locally. No evidence was deleted, moved, or pruned.

### Deferred findings considered

| Item | Classification | Disposition |
|---|---|---|
| F-003 committed evidence mass | `SAFE_TO_IMPLEMENT_NOW` (preparatory) + `OWNER_AUTHORIZATION_REQUIRED` (removal) | Policy `docs/EVIDENCE_RETENTION.md` added; reproducible candidate census committed at `qa-reports/evidence-retention/2026-09-28_EVIDENCE_RETENTION_CANDIDATES.md`; no deletion performed. Any removal is owner-gated. |
| F-005 owner-path exposure | `SAFE_TO_IMPLEMENT_NOW` (completed) | The audit's smallest repair accepts the manifest as an intentional as-recorded artifact and adds a disclosure note; that is done here and in the first wave. Disclosure now exists in `docs/IDENTITY_AND_CLAIM_CONTRACT.md` (its own machine paths) and in `docs/INDEX.md` (the register row about the truth manifest); the manifest document itself carries no as-recorded note and was not edited. The optional forward step (repo-relative provenance "when the capture factory next regenerates the manifest") is deferred to the next owner-run capture: `content/showcase.manifest.json` and the capture factory are declared **PROTECTED, read-only**, and `/Users/skypie/AccessMap` is a declared non-movable identifier (`design-reviews/flagstone-rename/2026-08-17/SLUG-MIGRATION-PROMPT.md`). No generator defect found; the manifest was not hand-edited. Re-verified against shipped truth: 160/160 shipped refs resolve, budget within hard cap. |
| F-009 stale local `main` ref | `OUT_OF_SCOPE` | Machine artifact in the shared gitdir; repairing it would move `main`, which the hard boundary forbids. |
| F-010 LICENSE / SECURITY / CONTRIBUTING | `OWNER_DECISION_REQUIRED` | Personal portfolio; default all-rights-reserved is defensible. No file added without the owner's call. |
| F-012 accessibility test figure (763, 2026-08-25) | `ENVIRONMENT_BLOCKED` / `UNAVAILABLE` | The refresh needs a real axe/CLS measurement run; `node_modules` is absent and installs are prohibited. Static consistency verified instead (values match the raw evidence; both dated 2026-08-25). Not converted to PASS. |

### Prior-cycle follow-ups reviewed

The 2026-09-26 repository-professionalization receipt's "Follow-ups (observed, not implemented)" were re-checked and dispositioned: #1 deploy hardening (implemented, confirmed by the post-merge audit), #5 `MOTION_SYSTEM.md` "placeholder now" and #9 physical root moves (closed in the first wave), #2 `check:overflow` and #6 Expo-macOS (environment-blocked), #3 `capture-showcase --dry` live-project and #4 `lib/schema.ts` header (protected surfaces), #7 `verify-intro-focus.cjs` and #8 `qa:index:check`-in-CI (owner decisions), #10 `FINAL_POLISH_PLAN.md` stale body link (historical, must not be rewritten). None is `SAFE_TO_IMPLEMENT_NOW` within this bounded repair.

### Files created

- `docs/EVIDENCE_RETENTION.md` - retention policy, forward rule, deletion prerequisites.
- `qa-reports/evidence-retention/2026-09-28_EVIDENCE_RETENTION_CANDIDATES.md` - point-in-time census; candidates only, no removal authorized.

### Files changed

- `docs/INDEX.md` - registered the retention policy (`CURRENT_DOC`) and the census (`REFERENCE`).
- `qa-reports/2026-09-28_PostMerge_Professionalism_Repair_Receipt.md` - this continuation section and the status-banner pointer.
- `qa-reports/INDEX.md` - regenerated (new evidence directory).

### Validation (continuation)

| Check | Result |
|---|---|
| `git diff --check` | Exit 0 (no whitespace errors). |
| `node scripts/validate-assets.mjs` | Exit 0; all certificate badges, cinematic plates, deliverable proofs, and blog figures found. |
| `node scripts/generate-qa-index.mjs --check` | `qa-reports/INDEX.md is up to date.` exit 0 (after regeneration). |
| Showcase manifest current-truth check | 86 captures, 6 projects, 160/160 shipped refs resolve; budget within hard cap (8.26 MB). |
| A11y receipt consistency check | 6 receipts, no value drift against `public/receipts/a11y-2026-08-25.json`, dates agree. |
| `docs/INDEX.md` path existence | Every registered path resolves. |
| Stale-reference search (`SHOW_WORK_PLAN.md`, `CONTINUOUS_WORLD_PLAN.md`) in current surfaces | None. |
| Dependency-backed gates (`lint`, `typecheck`, `build`, `test`) | Not run: `node_modules` absent; installs prohibited for this repair. |

### Irreversible work not performed

- No evidence deleted, moved, compressed, or pruned.
- No git history rewrite, force-push, or filter-branch.
- No remote action; `main` not mutated.

### Owner-gated items

- Any F-003 evidence removal (`OWNER_AUTHORIZATION_REQUIRED_FOR_IRREVERSIBLE_EVIDENCE_REMOVAL`).
- F-010 LICENSE / SECURITY / CONTRIBUTING.
- Professionalization follow-ups #7 (`verify-intro-focus.cjs`) and #8 (`qa:index:check` in CI).

### Environment-blocked items

- F-012 accessibility refresh (needs a real axe/CLS run and `node_modules`).
- `npm run check:overflow` and the macOS-only Flagstone Expo capture (prior-cycle follow-ups #2, #6).

### UltraSpeed escalations

0 - no ambiguity required escalation; every disposition was reachable with the on-disk evidence and the repository's own protected-surface declarations.

### Remaining findings after the continuation

- MEDIUM: 0 open (F-001, F-002 resolved; F-003 safe work complete, removal owner-gated).
- LOW: 0 open (F-004, F-006, F-007, F-008 resolved; F-005 accepted as-recorded with disclosures complete).
- NOTE: F-009, F-010, F-012 remain owner/environment items, unchanged by design.

---

## Acceptance-HOLD follow-up: historical-link repair (2026-09-28)

> **Status: `COMPLETE`** (acceptance-HOLD follow-up; local commit only; no push, merge, deploy, tag, PR, or issue). Starting SHA `ffe404dbabae2290a44b18655957dbeb71b31a9d`. This is a separate follow-up to the fresh Portfolio acceptance review; the two sections above are unchanged. No evidence was deleted, moved, or pruned.

The fresh acceptance review held the post-merge professionalism work on two documentation defects introduced by the 2026-09-28 root-to-`docs/history/` moves, plus one inaccurate provenance sentence in this receipt. All three are repaired here; nothing else was touched.

### HOLD items repaired

| Item | Disposition | What changed |
|---|---|---|
| Eight relative links in `docs/history/FINAL_POLISH_PLAN.md` | RESOLVED | Each resolved at repository root before the file moved, then broke under `docs/history/`. Only the destination paths were repointed one level deeper (`../../…`); the historical prose and link text are byte-identical. |
| The pre-existing `components/WorkFilterGrid.tsx` citation (same document, line 24) | RESOLVED | Already broken before the move: the file was removed at HEAD by the R4/BP9 gallery-wall rebuild, so no current target exists. Preserved as historical evidence and converted from a markdown link to inline code marked non-current; no target was fabricated. |
| F-005 provenance sentence in this receipt | CORRECTED | The as-recorded disclosure lives in `docs/INDEX.md` (the register row about the truth manifest) and in `docs/IDENTITY_AND_CLAIM_CONTRACT.md` (its own paths). It is not inside `docs/PORTFOLIO_TRUTH_MANIFEST.md`, which is unchanged. The earlier "truth-manifest disclosure" wording in the findings table is corrected to match. |

### Validation (follow-up)

| Check | Result |
|---|---|
| Link resolution, every moved historical doc (`docs/history/*.md`) | Zero newly broken links; each relative target resolves from its own file's directory. |
| Focused check, `docs/history/FINAL_POLISH_PLAN.md` | The 8 newly broken destinations were repointed; 0 newly broken remain. The `WorkFilterGrid.tsx` citation is no longer a link. |
| Pre-existing links elsewhere | Unchanged: 3 non-move-related, pre-existing targets (a truncated path in `design-reviews/truth-pass/2026-08-21/REPORT.md`, a root-absolute site route `/certificates`, and one placeholder hyperlink whose target is the literal `url`) are outside this repair and were not touched. |
| `docs/INDEX.md` path validation | Every registered repository path resolves. |
| `node scripts/generate-qa-index.mjs --check` | `qa-reports/INDEX.md is up to date.` exit 0. |
| `git diff --check` | Exit 0 (no whitespace errors). |
| Stale-reference search | No current surface cites a moved document at its former root path; remaining mentions are dated evidence, correct for their dates. |
| Dependency-backed gates (`lint`, `typecheck`, `build`, `test`) | Not run: `node_modules` absent; installs prohibited for this documentation repair. |

### Files changed

- `docs/history/FINAL_POLISH_PLAN.md` - eight link destinations repointed; the pre-existing `WorkFilterGrid.tsx` citation de-linked and marked historical.
- `qa-reports/2026-09-28_PostMerge_Professionalism_Repair_Receipt.md` - F-005 provenance sentence corrected and this follow-up section.

### Irreversible work not performed

- No evidence deleted, moved, compressed, or pruned.
- No application behavior, content, test logic, workflow, dependency, or protected cinematic source changed.
- No git history rewrite, force-push, or filter-branch.
- No remote action; `main` not mutated.
