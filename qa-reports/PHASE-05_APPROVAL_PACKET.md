# Phase 05 bounded approval packet

**Prepared for Sky; no approvals inferred, no application-source edits or commits performed.**

The full Phase 05 receipt is `PHASE-05_SUPPORTING_PROOF_GATE_RECEIPT.md`. P04 has not passed, so none of these decisions authorizes Portfolio integration, production changes, push, deploy, main merge, or Phase 06.

## 1. Dashboard CI and fictional snapshot

Repository: Skypie99/Dashboard, base `66f3def891bd7a7ec0440e03fae88448d3d61731`.

Exact patches: [CI](/Users/skypie/Documents/Codex/2026-09-04/files-pasted-by-the-user-skypi-2/outputs/p05-a/ci-candidate.patch), [generator](/Users/skypie/Documents/Codex/2026-09-04/files-pasted-by-the-user-skypi-2/outputs/p05-a/synthetic-generator-candidate.patch), [snapshot](/Users/skypie/Documents/Codex/2026-09-04/files-pasted-by-the-user-skypi-2/outputs/p05-a/synthetic-snapshot-candidate.patch), [matching browser test](/Users/skypie/Documents/Codex/2026-09-04/files-pasted-by-the-user-skypi-2/outputs/p05-a/synthetic-e2e-candidate.patch). Files: `.github/workflows/ci.yml`, `scripts/gen-demo-snapshot.mjs`, `dashboard-app/data/snapshot.demo.json`, and `dashboard-app/e2e/smoke.spec.ts`. No auth or real-data-path source change.

CI: the positive guard explicitly sets public demo mode. A separate all-demo-off lane must exit with the exact refusal message. The current guard implementation is unchanged. Remote main CI remains red; local command checks are not hosted-CI acceptance.

Synthetic story: fixed fictional date 2026-09-04; 15 existing AI roles; public project names Flagstone, Portfolio, Ghost Code, Prompt Library and Dashboard; 60 invented reports, 10 decisions, 10 blockers. Topics are invented triage, reproduction, handoff and scope exercises. No real project status, private task import, release blockers or personnel claims. Old project names were removed from hidden IDs as well as visible labels.

Evidence: source/planning SHA match; 263 native tests and 21 E2E tests pass on both unchanged baseline and the full draft preview; unchanged guard accepts draft data and rejects six negative scenarios; deterministic regeneration and strict names/marker checks pass. Lead independently reran positive/negative guard commands, scanned the final JSON, checked actual repository tracking and checked all patches apply. The final snapshot SHA-256 is `917598924c4ab5f7f8cbd491d4a143b2f33d4317112b4c9f6b7c656d39a0f009`.

Risk: CI mode semantics and public fictional narrative change. Positive checks must never replace the negative fail-closed test. Proposed commit: only the exact approved patches plus local receipt after final verification. No dependency remediation is included in this commit.

**Decision requested:** approve local application and verification of these exact four patches, including local-only synthetic guest sign-in/sign-out using the repository E2E harness’s existing disposable test secret in a fresh loopback preview with external requests blocked; and a local branch commit only if unchanged scope passes final checks. No real credential, external provider login or private auth flow is included. Alternatively revise/hold.

## 2. Claude Corp governance wording

Repository: Skypie99/Claude_Corp, base `9612389bdfdb6cab1613f266c207ebfb8eb00c70`.

Exact [two-file patch](/Users/skypie/Documents/Codex/2026-09-04/files-pasted-by-the-user-skypi-2/outputs/p05-b/claude-governance-candidate.patch), [before/after inventory](/Users/skypie/Documents/Codex/2026-09-04/files-pasted-by-the-user-skypi-2/outputs/p05-b/exact-wording-changes.json), and [detailed approval packet](/Users/skypie/Documents/Codex/2026-09-04/files-pasted-by-the-user-skypi-2/outputs/p05-b/CLAUDE_GOVERNANCE_APPROVAL_PACKET.md). Files: `README.md`, `index.html`.

21 substitutions distinguish written rules, prompts/runtime instructions, tests/reviews, configured repository controls, platform permissions and human authority. Remove unsupported instant-stop/universal-enforcement claims and the undated 900+ count. Preserve 15 roles, bounded delegation, stop/block rights, the one documented narrow release exception, all links and styles. No new side-effect permission.

Evidence: current live HTML equals fetched source. Patch applies; five candidate scripts pass syntax checks; names/styles/links/exception references preserved; 375px preview has no overflow; role dialog and Escape close pass. Lead rechecked 15 role names, 30 hrefs, style byte equality and removed claim markers, and inspected the mobile candidate capture.

Risk: strategic public interpretation changes and longer explanatory blocks. Proposed commit: exact approved two-file patch after final verification; receipt inclusion must respect existing ignored qa-reports policy, with no force-add assumed.

**Decision requested:** approve this wording and a local branch commit after final verification; or revise/hold.

## 3. Dashboard dependency/auth decision

[Full disposition](/Users/skypie/Documents/Codex/2026-09-04/files-pasted-by-the-user-skypi-2/outputs/p05-a/DEPENDENCY_AUTH_DISPOSITION.md). Current registry audits report seven affected package entries across 23 advisory URLs; package totals are not exploit counts. Four Auth.js advisories have documented preconditions; the inspected main-line source does not establish those preconditions, and the private deployment was not tested. Publisher/npm severity discrepancies are recorded explicitly.

**Recommendation:** authorize a bounded isolated auth-chain remediation trial starting with exact `next-auth@5.0.0-beta.32`, verifying compatible resolved `@auth/core` is patched, then rerun synthetic/auth-boundary checks. This is a proposed next action, not a tested dependency patch, not authorization to redesign auth, and not approval to commit an unknown lockfile diff. Keep non-auth dependency items tracked for separate bounded disposition. Alternative: explicit deferral with an owner and review date. No blanket audit fix or major framework migration.

**Decision requested:** authorize that bounded trial, or provide a dated deferral. Any resulting commit awaits a concrete verified dependency diff.

## 4. Ghost Code metadata disposition

Source/live identity and links pass. Public GitHub About still says “Retro 80s arcade flashcard game for Claude Code + Mac terminal commands.” Recommended replacement: **“A calm terminal-command trainer for Claude Code, the macOS terminal, and Git.”**

Recommendation: Sky updates that single repository description, or explicitly defers it with an owner/date. This is remote metadata, outside this prompt’s no-network-write authority; no remote change or source commit is proposed here.

## Why approval is required

Your Phase 05 brief §12 and T-074/T-075/T-079 require owner approval for strategic synthetic scenarios, governance wording, dependency/auth remediation and every external repository commit. These are explicit prompt checkpoints, not a newly invented approval flow.

Automatic approval review also rejected the Dashboard CI workflow edit: it characterized the action as a persistent privacy/security guard-workflow change requiring human decision under the estate rules. No workflow edit occurred. The rejected action is now the exact CI patch linked in item 1; its risk and preservation mechanism are described above.

Automatic approval review separately rejected that local guest test before execution because it exercises authentication and supplies a test auth secret. The exact quoted reason is recorded in the Dashboard receipt. Authenticated guest behavior is therefore unrun; anonymous synthetic approval/reset checks and the native E2E suite do not substitute for it.

Canonical companion evidence directory: /Users/skypie/Documents/Codex/2026-09-04/files-pasted-by-the-user-skypi-2/outputs
