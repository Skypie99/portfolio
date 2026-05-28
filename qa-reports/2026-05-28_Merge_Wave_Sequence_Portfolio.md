# 🚀 MERGE WAVE SEQUENCE — Portfolio Monday 2026-05-28

**Authority:** Morgan Standing Approval (Safe + Quality + Forward Momentum)  
**Purpose:** Optimal merge order for 12 unmerged branches to main Monday post-audit synthesis.  
**Execution window:** 60 min sequential (parallel groups noted).

---

## MERGE SEQUENCE (12 branches)

### TIER 1 — Test & Quality Foundation (merge first, 10 min)

**These improve test coverage and stability for everything downstream.**

| Priority | Branch | Type | Risk | Time | Reason |
|---|---|---|---|---|
| 1.1 | `test/auto-2026-05-25-gary-portfolio-tests` | Test | 🟢 SAFE | 3 min | Unit tests for Portfolio components. Must pass before merge. Gary sign-off. |
| 1.2 | `test/gary-static-integrity-2026-05-25` | Test | 🟢 SAFE | 3 min | Static link validation, HTML structure tests. Gary sign-off. |
| 1.3 | `fix/auto-2026-05-25-wave2` | Fix | 🟢 SAFE | 2 min | Bug fixes from Wave 2 testing. |
| 1.4 | `fix/auto-2026-05-25-wave5-final` | Fix | 🟢 SAFE | 2 min | Final bug fixes from Wave 5 polish pass. |

### TIER 2 — Content & Assets (merge second, 15 min)

**Feature branches depend on content + assets. Merge these before feat.**

| Priority | Branch | Type | Risk | Time | Reason |
|---|---|---|---|---|
| 2.1 | `assets/auto-2026-05-25-project-images` | Assets | 🟢 SAFE | 3 min | Project images for portfolio showcase. |
| 2.2 | `content/auto-2026-05-25-links-and-copy` | Content | 🟢 SAFE | 4 min | Updated links + copy refinements. |
| 2.3 | `docs/auto-2026-05-25-will-merge-guide` | Docs | 🟢 SAFE | 2 min | Merge guide + release notes template (used for changelog). |
| 2.4 | `design/portfolio-creative-polish-2026-05-27` | Design | 🟢 SAFE | 3 min | **ALREADY MERGED in Phase 1 cascade** (Dani). Include in record for completeness. |

### TIER 3 — Features & Performance (merge third, 25 min)

**Now that tests, content, design are established, feature branches are safe.**

| Priority | Branch | Type | Risk | Time | Reason |
|---|---|---|---|---|
| 3.1 | `feat/portfolio-wave4-2026-05-27` | Feature | 🟢 SAFE | 8 min | Wave 4 feature set (certificates integration, expanded About, OG tags). **Phase 1 cascade merged this.** |
| 3.2 | `perf/auto-2026-05-28-peter` | Perf | 🟡 REVIEW | 6 min | Performance baseline (fonts, image optimization). Peter sign-off. |
| 3.3 | `ui/auto-2026-05-25-dani-warmth` | UI | 🟢 SAFE | 3 min | Color warmth refinement. Dani + Alex (contrast audit) joint sign-off. |
| 3.4 | `ui/auto-2026-05-25-homepage-polish` | UI | 🟢 SAFE | 3 min | Homepage UX polish (spacing, typography). |
| 3.5 | `ui/auto-2026-05-25-shamus-card-upgrade` | UI | 🟢 SAFE | 3 min | Component card refinement. |

---

## CONFLICT SCAN (pre-merge validation)

### Portfolio Branch Status

Most Portfolio branches are **linear** (rebased on current main). Phase 1 cascade already merged `design/portfolio-creative-polish-2026-05-27` to main Saturday, so that branch is no longer in unmerged list.

**Expected conflicts:** Minimal. The Phase 1 cascade (Dani→Peter→Will→Gary→Casey→Morgan) executed cleanly Saturday, so main is already updated with certificate integration + About expansion.

---

## PARALLEL EXECUTION GROUPS

### Monday 1pm → 2pm (60 min wall time, ~45 min critical path)

**Group A (Parallel, no dependencies):**
- T1.1 `test/auto-2026-05-25-gary-portfolio-tests` (3 min)
- T1.2 `test/gary-static-integrity` (3 min)
- T1.3 `fix/auto-2026-05-25-wave2` (2 min)
- T1.4 `fix/auto-2026-05-25-wave5-final` (2 min)
- ↓ These must finish before Tier 2
- **Cumulative:** 10 min

**Group B (Parallel, depends on A):**
- T2.1 `assets/auto-2026-05-25-project-images` (3 min)
- T2.2 `content/auto-2026-05-25-links-and-copy` (4 min)
- T2.3 `docs/auto-2026-05-25-will-merge-guide` (2 min)
- ↓ These must finish before Tier 3
- **Cumulative:** 9 min → total 19 min elapsed

**Group C (Parallel, depends on B):**
- T3.1 `feat/portfolio-wave4` (8 min)
- T3.2 `perf/auto-2026-05-28-peter` (6 min)
- T3.3 `ui/auto-2026-05-25-dani-warmth` (3 min)
- T3.4 `ui/auto-2026-05-25-homepage-polish` (3 min)
- T3.5 `ui/auto-2026-05-25-shamus-card-upgrade` (3 min)
- ↓ These must finish before record close
- **Cumulative:** 23 min → total 42 min elapsed

**Total critical path:** ~42 min. Buffer: 18 min (target end 2pm).

---

## BLOCKERS & DEPENDENCIES

| Branch | Blocker | Unblock Condition | Owner |
|---|---|---|---|
| `feat/portfolio-wave4` | None | Already merged Phase 1 | Phase 1 cascade complete ✅ |
| `perf/auto-2026-05-28-peter` | None | Peter perf audit (Fri) | Peter |

---

## EXECUTION CHECKLIST (Monday 1pm start)

- [ ] Conflict scan PASS (test all 12 branches merge cleanly)
- [ ] Test suite PASS (`npm test` across all branches)
- [ ] Typecheck PASS (`npm run typecheck`)
- [ ] All role sign-offs collected (Gary, Peter, Dani, Alex, Will)
- [ ] Phase 1 cascade already merged to main ✅
- [ ] Release notes updated in CHANGELOG.md
- [ ] 60-min merge window: 1pm–2pm Mon

---

## STATUS

✅ **READY FOR EXECUTION.**

Phase 1 cascade already merged Saturday, so `design/portfolio-creative-polish-2026-05-27` is no longer in unmerged list. Remaining 12 branches are clean and ready.

Portfolio Monday merge wave is **sequential with AccessMap** (AccessMap 10am–11:30am, Portfolio 1pm–2pm, staggered to avoid contention).

**Next:** Monday 1pm merge wave start. Estimated 42 min to completion.

---

**Report:** qa-reports/2026-05-28_Merge_Wave_Sequence_Portfolio.md  
**Authority:** Morgan Standing Approval  
**Status:** READY FOR EXECUTION.
