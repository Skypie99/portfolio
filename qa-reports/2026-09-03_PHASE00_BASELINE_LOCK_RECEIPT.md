# PHASE-00_BASELINE_LOCK_RECEIPT

**Prompt ID:** SKYPI-PORTFOLIO-3.0-P00-LEAD
**Phase:** PHASE-00 — Baseline, Local Truth and Rollback Lock
**Sub-phases folded into this lead run:** P00-A (local truth) and P00-B (deployment/artifact/QA evidence) were executed directly by the lead session plus two background evidence-capture agents, rather than as separate sub-prompt invocations — no sub-prompt orchestration mechanism was available, so the lead performed/verified the work itself per the prompt's "or execute their work yourself if subagent orchestration is unavailable" fallback.
**Date:** 2026-09-03

---

## 1. Repository and remote identity

- Canonical checkout identified by `remote.origin.url`, not folder name: `/Users/skypie/Portfolio` → `https://github.com/Skypie99/portfolio.git`.
- `gh repo view`: public, default branch `main`.
- See manifest [`BASE-GIT-01..06`](2026-09-03_PHASE00_BaselineManifest.md#git--worktree-identity).

## 2. Planning baseline vs. actual base SHA/tree

| | Planning reference | Actual |
|---|---|---|
| SHA | `19d946c9c48b325bce5d3a9f292d2cb48450cf01` | `origin/main` = `19d946c9c48b325bce5d3a9f292d2cb48450cf01` — **exact match** |
| Tree | `ee0be9130c2b4f9de5de956c6cdc33b9d151c682` | Integration worktree tree = `ee0be9130c2b4f9de5de956c6cdc33b9d151c682` — **exact match** |
| Deployment artifact | `9870638981` | Confirmed as the artifact **id** (not a run id, as initially mis-queried) of the current `Deploy` run `33692666996`; content matches a fresh build of the same SHA (route-for-route identical) |

**No divergence between the plan and current remote/deployment truth.** The only reconciled discrepancy: the original `/Users/skypie/Portfolio` checkout's local `main` was 3 commits behind `origin/main` — resolved by basing the new integration worktree on verified `origin/main` rather than the stale local branch, per explicit owner direction.

## 3. Branch and worktree path

- New: `/Users/skypie/Portfolio-3.0-baseline`, branch `claude/portfolio-3.0-phase00-baseline-20260903`, tracking `origin/main`, created via `git worktree add ... -b ... origin/main`.
- Immediately after creation: `git status --short` empty (clean), HEAD/tree match the planning reference exactly (table above).

## 4. Initial clean/dirty/untracked/interrupted-operation state

- `/Users/skypie/Portfolio` (pre-existing checkout): tracked files clean (no staged/modified); ~100+ untracked paths under `design-reviews/`, `qa-reports/`, `summaries/`, `specs/`, plus `AGENTS.md`, `TASK_GRAPH.json` — pre-existing historical QA/design artifacts from prior work, left untouched. No `.git/MERGE_HEAD`, `.git/CHERRY_PICK_HEAD`, `.git/rebase-merge`, `.git/rebase-apply`, or lock files found. 14 other pre-existing worktrees found, none locked or disturbed.
- New integration worktree: clean from creation (see §3).

## 5. Final SHA/tree

**NO SOURCE CHANGE.** The integration worktree remains at `19d946c9c48b325bce5d3a9f292d2cb48450cf01` / `ee0be9130c2b4f9de5de956c6cdc33b9d151c682` throughout this phase. Files changed by this phase are evidence-only, listed in §6.

## 6. Files changed and exact changes

All changes are new evidence files under `qa-reports/` in the new integration worktree (`/Users/skypie/Portfolio-3.0-baseline`) — **no Portfolio source, config, content, or dependency file was created, edited, or deleted.**

- `qa-reports/2026-09-03_PHASE00_VisualBaseline.md` (new)
- `qa-reports/2026-09-03_PHASE00_TechnicalClaimsBaseline.md` (new)
- `qa-reports/2026-09-03_PHASE00_BaselineManifest.md` (new)
- `qa-reports/2026-09-03_PHASE00_BASELINE_LOCK_RECEIPT.md` (this file, new)

None of these are staged/committed — they exist as untracked files in the integration worktree pending Sky's own review/commit decision (this phase has no commit authority — see §14).

## 7. Task IDs, findings, and root causes addressed

- **T-001 – T-004** (local truth, worktree creation): done, §1–§4.
- **T-005** (deployment artifact): done — downloaded with explicit owner approval, hash-verified, route-diffed against a fresh local build (identical). See manifest `BASE-ART-01/02`.
- **T-006** (route inventory): done — 26 routes enumerated from `./out/`, cross-checked against the artifact and against live 200s. See manifest `BASE-ROUTE-01`.
- **T-007** (baseline screenshots): done at **narrow representative scope** (3 viewports × 2 themes × 6 key routes = 36 combinations), per the prompt's own instruction not to run "Phase 10's entire final matrix" here. Full grid in the visual baseline report.
- **T-008** (repo-native gates): done — lint/typecheck/test/build/asset-validate/overflow all run and receipted, including a documented ordering correction (test/overflow must follow build). See manifest gate table.
- **T-009** (dependency audit, perf, metadata, link, accessibility): done. Lighthouse specifically substituted with a clearly-labeled Navigation Timing baseline (no Lighthouse CLI available, install not pre-approved for this phase).
- **T-010** (claims/boundary reverification): done — F-025 (Flagstone status) reverified clean; Dashboard/Studio Archive/robots/sitemap boundaries checked.
- **T-011** (truth manifest): done — [`2026-09-03_PHASE00_BaselineManifest.md`](2026-09-03_PHASE00_BaselineManifest.md).
- **T-012** (this receipt): done.

**Findings closed/reverified:**
- **F-025** (Flagstone status freshness) — reverified clean, no overclaiming found anywhere on `/work/flagstone` or its 4 legal pages.
- **F-035** (perf baseline) — partially closed: a real baseline now exists (Navigation Timing), but true Lighthouse figures remain unmeasured (see §12 unresolved).
- **F-036** (local git/worktree/lock state) — closed: full state recorded, integration worktree established.

**Root causes touched:** RC-010 (maintenance/verification debt) — the dependency audit (16 vulnerabilities, dev-chain only) and the un-run-Lighthouse gap both feed this systemic root cause and are recorded, not remediated, per this phase's read-only mandate.

## 8. Preserve IDs checked, with pass/fail evidence

| Preserve ID | Result | Evidence |
|---|---|---|
| PR-001 (cinematic first frame) | **PASS** | manifest `BASE-PRESERVE-001` |
| PR-004 (hero sentence) | **PASS** (verbatim match) | manifest `BASE-PRESERVE-002` |
| PR-006 (Flagstone hierarchy) | **PASS** | manifest `BASE-PRESERVE-003` |
| PR-007 (Flagstone conservative status) | **PASS** | manifest `BASE-CLAIM-01` |
| PR-012 (public/private/synthetic boundaries) | **PASS** | manifest `BASE-BOUND-01..03` |
| PR-009 (dated, method-specific evidence) | **PASS (this receipt itself follows the rule)** | every figure above is dated, method-cited, and scoped |
| PR-019 (navigation/focus/history) | **NOT specifically exercised this phase** — no keyboard/Back/reload journey matrix was run (out of Phase 00's narrow scope); deferred |
| PR-002, PR-003, PR-005, PR-008, PR-010, PR-011, PR-013 – PR-020 (remaining) | **Not independently re-verified this phase** — no evidence contradicting them was observed; Phase 00 did not target them directly |
| Reduced-motion (invariant #8) | **UNVERIFIABLE** — manifest `BASE-PRESERVE-004` |

## 9. Commands/tests run with exact results, counts, skips, warnings, unrun checks

See manifest, "Repo-native gates" table (`BASE-GATE-01..07`) for exact exit codes and counts. Summary:
- `npm ci`: 539 packages, 0 errors, 16 audit findings (dev-chain only)
- `lint`: 0 warnings/errors
- `typecheck`: clean
- `test` (full suite, post-build): 758 passed / 54 skipped / 0 failed (90 files)
- `test:static`-equivalent (4 build-dependent suites, post-build): 79 passed / 2 skipped / 0 failed
- `validate:assets`: clean (9+5+107+3 assets found)
- `check:overflow`: clean (post-build)
- `build`: success, 26 routes, clean export
- **Unrun:** Lighthouse (no CLI, not pre-approved to install this phase); `npm audit fix` (remediation is out of scope — Phase 00 is read-only); a full PR-019 navigation/keyboard/Back journey matrix (deferred, narrow-scope phase).

## 10. Screenshots, recordings, browser/viewport/theme/motion/AT coverage

36/36 planned combinations captured (6 routes × 3 viewports [375×812, 768×1024, 1440×900] × 2 themes [light, dark]) against live production. Reduced-motion: UNVERIFIABLE (no emulation available). No screen-reader/AT pass was run this phase (axe-core automated scan only — see §11); a manual AT pass is out of this phase's narrow scope. Full detail: [`2026-09-03_PHASE00_VisualBaseline.md`](2026-09-03_PHASE00_VisualBaseline.md).

## 11. Truth/status and privacy/security evidence

- Flagstone status (F-025): reverified clean, quotes in manifest `BASE-CLAIM-01`.
- Dashboard repo: confirmed **PRIVATE** (`BASE-BOUND-03`).
- Studio Archive (`archive.skypistudio.com`): confirmed public, self-describes as "a view-only public archive" (`BASE-BOUND-02`).
- `/archive` (main-domain path, distinct from the above): confirmed noindexed + auth-gated app shell, not a data leak.
- axe-core (real local v4.11.4 build, not a stub — confirmed via `axe.version`): **0 violations** across 6 pages (`BASE-TECH-03`).
- No secrets, credentials, or `service_role` keys were observed, transmitted, or logged during this phase.

## 12. Unresolved issues, approved deferrals, blocker evidence

**No blockers.** Deferred/unresolved (all explicitly non-blocking per objective acceptance criteria):
1. Reduced-motion emulation — tooling gap, not a code defect.
2. True Lighthouse lab baseline — CLI unavailable, install not pre-approved this phase.
3. `/` cold-cache transfer size — current figure is cache-warmed, needs a fresh-profile re-measurement.
4. Canonical `<link>` tags — missing site-wide; new finding, needs Sky/Will decision, not a Phase 00 blocker.
5. Sitemap exhaustiveness — a few public pages omitted without `noindex`; new finding, needs a decision.
6. GSAP ScrollTrigger pin-spacer bug (desktop/tablet, post-"Skip Intro") — new, reproducible, real defect; **not fixed** (Phase 00 has no write authority on source) — recommend a ticket for Phase 01+.
7. Dependency audit: 16 vulnerabilities, dev-chain only — not remediated this phase (RC-010 maintenance program territory).
8. PR-019 and the remaining unlisted preserve items — not independently re-verified this phase (see §8).

## 13. Rollback reference

`origin/main` at `19d946c9c48b325bce5d3a9f292d2cb48450cf01` (tree `ee0be9130c2b4f9de5de956c6cdc33b9d151c682`) **is** the rollback point — it received no writes this phase. The pre-existing `/Users/skypie/Portfolio` checkout was also not written to. No migration, deploy, or config change occurred that would require an active rollback plan.

## 14. Side effects performed (full list — nothing else occurred)

1. Created git worktree `/Users/skypie/Portfolio-3.0-baseline` + branch `claude/portfolio-3.0-phase00-baseline-20260903` (local only, not pushed).
2. Ran `npm ci` in that worktree (installs into worktree-local `node_modules`, not committed).
3. Ran `npm run build` in that worktree (writes to worktree-local `out/`, not committed, gitignored).
4. Downloaded one file with explicit owner approval: GitHub Actions artifact `9870638981` (`github-pages.zip`, 30,848,225 bytes) from `Skypie99/portfolio` run `33692666996`, saved to the local scratchpad (outside any git worktree) and extracted there for comparison.
5. Made read-only `gh api` / `gh repo view` / `curl` calls against `github.com` and `skypistudio.com` (no writes, no auth mutations).
6. Wrote 4 new evidence files under `qa-reports/` in the new worktree (§6) — untracked, uncommitted.
7. Two background agents browsed the live production site read-only (screenshots, DOM reads, axe-core scans via local Playwright) — no forms submitted, no state changed on the live site.

**No commits. No pushes. No merges. No deploys. No visibility changes. No Portfolio source/content/config/dependency file was modified.**

## 15. Safe-to-integrate verdict and next-phase readiness

**Safe to integrate: YES**, with the deferrals in §12 carried forward explicitly (not silently dropped) into Phase 01 planning. The integration worktree/branch is clean, exactly matches verified `origin/main`, and is ready to receive Phase 01 work under its own authority.

---

## BASELINE_LOCK: PASS
