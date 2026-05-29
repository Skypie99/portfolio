---
report: sage-learnings-extraction
date: 2026-05-28
role: sage
model: haiku
source: phase-1-cascade-31-reports-analysis
---

# Portfolio Phase 1 Cascade — Learnings Extraction

**Scope:** Phase 1 execution (design merge, OG tags, content URLs, test validation, About expansion) + 11-branch merge wave to main (2026-05-28).

**Source:** 31 qa-reports from today (2026-05-28), spanning Morgan's cycle briefing, Morgan's execution directives, individual role reports, blocker escalation, correction dispatch, and Phase 2-4 roadmap synthesis.

**Appended to:** `/Users/skypie/Portfolio/docs/LEARNINGS.md` (§ 2026-05-28 entry + Patterns/Anti-patterns/Gotchas sections).

---

## 9 Core Learnings (Phase 1 Cascade Pattern)

### 1. Sequential Cascade Assumption ≠ Parallel Independence

**What we planned:** Phase 1 as a sequential cascade — Dani design merge → Peter OG tags → Will URLs → Gary tests → Casey About, each role waiting for the prior signal.

**What we learned:** All four Phase 1 tasks (Peter's meta tags, Will's URL replacement, Gary's test suite, Casey's About expansion) are independent with ZERO cross-task dependencies. Peter doesn't need Will's URLs; Will doesn't need Gary's tests.

**Impact:** Sequential execution cost ~25 min; parallel would complete in ~10 min (the longest single task). Correction documented in `relay-2026-05-28-PARALLEL-CORRECTION.md`.

**Going forward:** Unless task B explicitly requires output from task A (schema change, code generation, review gate, or merged branch state), assume parallel. START NOW for all independent work.

---

### 2. File-on-Disk Dispatch ≠ Agent Activation

**What happened:** Morgan and other roles created detailed dispatch documents (Phase 1 execution sequences, role checklists, timelines) and saved them to qa-reports/. Example: `2026-05-28_Morgan_Phase1_EXECUTE_NOW.md`.

**What we learned:** Saving files to disk does NOT activate agents. After 90 minutes with zero visible work, the blocker report (`blocker-2026-05-28-agents-silent.md`) identified the root cause: agents were never invoked (no `/peter`, `/will`, `/gary`, `/casey` commands).

**Impact:** 1.5-hour delay on Phase 1 execution despite all planning being done.

**Going forward:** Always pair dispatch documents with explicit agent invocation. Either (a) invoke directly in CLI (`/role`), (b) use an orchestrator tool (Morgan's iMessage, `/orchestrator`), or (c) document the invocation explicitly as a required next step.

---

### 3. Zod Validation as a Load-Bearing Safety Gate

**What happened:** A single field in `content/deliverables.json` (Pac-Man entry summary, 183 chars vs. 160-char Zod limit) caused 5 test failures. The issue was discovered on the perf branch during Phase 2 prep, caught by `npm test`.

**What we learned:** Zod validation on critical JSON files (content models, metadata) is not optional polish — it's a load-bearing safety gate that prevents invalid data from reaching templates. The fix was simple (align the text to match a validated length), but the catch was automatic via build + test.

**Impact:** Avoided shipping malformed content; the fix was rolled into the perf branch and the 11-branch merge wave proceeded cleanly.

**Going forward:** Keep tests running locally (`npm test` before push) and in CI. Zod validation on content models is a canary for data shape bugs.

---

### 4. Merge Order Matters When Commits Are Shared

**What happened:** Morgan's cycle briefing identified 13 active branches: 11 clean (zero conflicts), 2 with conflict markers. The conflicting branches both touched `app/page.tsx`. Root cause: `ui/auto-2026-05-25-homepage-polish` includes shared commits from `ui/auto-2026-05-25-dani-warmth`.

**What we learned:** Shared commits create rebase dependencies. If branch-A includes commits from branch-B, merging branch-B first means branch-A's rebase resolves cleanly (the shared commits are already in main → auto-resolution).

**Documented solution:** Merge Tier 3 (Dani warmth, the shared-commit source) before triggering conflict-resolution on homepage-polish (post-wave rebase).

**Going forward:** When generating merge commands or coordinating rebase sequences, check for shared commits first. Order matters.

---

### 5. Coherence Score as a Drift Alarm

**What happened:** Orion reported coherence_score = 7/10 for Portfolio, flagged duplicate work detection + missing state files. Specific issues: (a) PROJECT_STATE.md absent, (b) TASK_GRAPH.json absent, (c) homepage-polish includes dani-warmth commits.

**What we learned:** Coherence_score is a health metric. A score < 8/10 signals drift — missing state documents, branch fragmentation, or duplicate work. This is an early warning, not a blocker, but it indicates the project needs organizational attention.

**Impact:** Identified the merge-order issue and the need to regenerate state docs post-Phase-1-ship.

**Going forward:** Maintain PROJECT_STATE.md + TASK_GRAPH.json on all major projects post-shipping. Orion's health checks depend on these documents.

---

### 6. Per-Concern Branching Scales Better Than Per-Phase Mega-Branches

**What happened:** Portfolio accumulated 13 branches: test/, fix/, assets/, content/, docs/, design/, feat/, ui/, perf/. Rather than a single mega-branch per phase, work was split by concern. This required careful merge sequencing (Tier 1 tests, Tier 2 content/assets, Tier 3 design/features/perf) but enabled parallel validation.

**What we learned:** Per-concern branching allows independent CI validation. Each branch can be tested in isolation before merge, reducing surprise failures in the merge wave. The trade-off: merge sequencing is more complex, but the safety is worth it.

**Comparison:** Monolithic per-phase branches (all Phase 2 in one branch) would merge faster but fail slower (all tests run together at the end).

**Going forward:** When team size > 4 and feature scope spans multiple concerns (design, content, tests, perf), split by concern. Use numbered Tiers to document merge order.

---

### 7. Design Vision Documents Are Gating Artifacts

**What happened:** Dani's design vision input (`2026-05-28_Dani_Vision_Input.md`) outlines Phase 2-4 evolution: component elevation, animations, token additions, optional cert timeline. This design document directly gates Phase 2 execution — Shamus can't build UI without mockups + token specs.

**What we learned:** Design vision documents are not optional narrative; they're gating artifacts. Without them, the entire downstream pipeline (Shamus UI build → Gary tests → Peter perf → merge) is blocked. Prioritize design-first discipline: mockups + tokens before code.

**Documented impact:** Morgan's Phase 2-4 roadmap shows Dani's design completion as a blocker for Shamus's start date (estimated 2–3 days after Phase 1 ships).

**Going forward:** Invest in design vision docs early. They unlock entire pipelines.

---

### 8. Morgan's Standing Approval Authority Simplifies Decision Velocity

**What happened:** Morgan invoked standing approval (authorized by Sky on 2026-05-28: Safe + Quality + Forward Momentum) to dispatch Phase 1 tasks without waiting for Sky to explicitly approve each individual step. This removed decision latency while preserving safety — Morgan escalated real blockers (agent invocation failure) and deferred strategic decisions (Phase 2-4 scope) to Sky.

**What we learned:** Delegating approval authority clearly and in writing (via Constitution Art. 11 or memory) unblocks asynchronous work. Morgan could make go/no-go calls on Phase 1 execution without Sky's involvement, while still escalating blockers + strategic decisions appropriately.

**Impact:** Enabled rapid iteration on Phase 1 dispatch despite agent activation issues.

**Going forward:** Define approval authority boundaries in writing. Example: "Morgan approves Phase 1 execution if Safe (no privacy risk) + Quality (no technical debt) + Forward Momentum (unblocks team)."

---

### 9. Critical Path Identification Pre-Execution

**What happened:** Morgan's Phase 2-4 roadmap identified the critical path: Sky's case study drafts (5 narratives, problem/process/outcome) → Will's edits → Shamus's UI build → Gary's tests → Peter's perf validation → Phase 2 merge. Estimated 10–12 days sequential if case studies aren't delivered by 2026-05-30.

**What we learned:** Identify the longest pole before execution starts. The critical path in Phase 2 is CONTENT (Sky's writing), not design or engineering. If Sky delays narratives, the entire engineering pipeline stalls.

**Documented decision gate:** Sky must approve Phase 2 and commit to case study drafts by May 30 for June 14 ship date.

**Going forward:** Map blocker dependencies in the roadmap. Highlight the critical path and ensure the blocking party (often the product owner) has unambiguous deliverables + deadline.

---

## 3 Patterns Worth Keeping

1. **Parallel-task dispatch vs. sequential cascade.** Always question sequential assumptions. Independent work starts NOW.
2. **Design vision documents as gating artifacts.** Mockups + tokens unlock UI build → tests → perf → merge.
3. **Critical path identification pre-execution.** Map dependencies and highlight the longest pole (often content or decision gates).

---

## 5 Anti-Patterns to Avoid

1. **Sequential cascade assumption without explicit task dependencies.** If B doesn't need A's output, B starts now, not "after A."
2. **File-on-disk dispatch without agent invocation.** Documents in qa-reports/ don't auto-execute; pair with `/role` invocation or orchestrator.
3. **Neglecting PROJECT_STATE + TASK_GRAPH post-shipping.** These are Orion's coherence heartbeat.
4. **Merging shared-commit branches last.** If branch-A includes commits from branch-B, merge-B first.
5. **Burying critical decisions in prose.** Create a "Decisions for Sky" section with 3–5 clear gates.

---

## 6 Gotchas Sky Needs to Remember

1. **Phase 2 blocks on Sky's case study drafts.** You write narratives (5× problem/process/outcome); Will edits for voice + accessibility. Estimated 3 days for drafts; missing deadline delays Phase 2 by ~12 days.
2. **Zod validation on JSON files is load-bearing.** Run `npm test` before pushing; failures surface immediately.
3. **Merge order: shared-commit branches first.** If branch-A includes branch-B's commits, merge-B before rebasing branch-A.
4. **Design-first discipline is non-negotiable.** Dani's mockups + tokens precede Shamus's UI work.
5. **Parallel work saves time.** Phase 1 went from 25 min (sequential) to 10 min (parallel); always ask "are these independent?"
6. **Agent invocation is explicit.** Dispatch docs don't activate agents; use `/role` or orchestrator.

---

## Synthesis

The Phase 1 cascade (design merge → OG tags → content URLs → test validation → About expansion) was a successful proof-of-concept for role-based execution at scale (5 roles, 31 reports, 11-branch merge wave). Key lessons:

- **Execution model:** Parallel-task dispatch + explicit agent invocation + clear approval authority unlocks velocity.
- **Quality gates:** Zod validation + test suite + coherence checks catch real issues early.
- **Roadmap discipline:** Critical path identification + decision gating + role responsibilities prevent surprises.

Phase 2-4 roadmap is ready pending Sky's 5 decisions. Phase 2 critical path is Sky's content (case studies); all engineering + design is ready to go.

---

**Next step:** Sky reviews Phase 2-4 roadmap decisions. Phase 2 execution gate: Sky case study drafts by 2026-05-30.

**Report prepared:** 2026-05-28, Sage (temporary specialist)  
**Appended to:** `/Users/skypie/Portfolio/docs/LEARNINGS.md`
