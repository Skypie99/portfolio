# 🔧 PRE-MERGE CONFLICT RESOLUTION — Portfolio Monday Prep

**Date:** 2026-05-28  
**Authority:** Morgan Standing Approval (Preparation, no merges yet)  
**Purpose:** Identify branch conflicts with main before Monday merge wave.  
**Action:** Resolve or flag blockers by Saturday EOD.

---

## CONFLICT SCAN RESULTS

**Total branches scanned:** 12 unmerged (note: `design/portfolio-creative-polish-2026-05-27` already merged Phase 1)  
**Linear (ready to merge):** 4  
**Diverged (need rebase or manual resolution):** 8  

---

## LINEAR BRANCHES (safe to merge as-is)

✅ **No conflicts with main. Ready for Monday wave.**

| Branch | Files Changed | Status |
|---|---|---|
| `design/portfolio-creative-polish-2026-05-27` | 19 | ALREADY MERGED Phase 1 (note only) |
| `feat/portfolio-wave4-2026-05-27` | 23 | READY |
| `perf/auto-2026-05-28-peter` | 24 | READY |
| `test/gary-static-integrity-2026-05-25` | 2 | READY |

**Action:** Merge these in Tier 1–3 on Monday. No rebase needed.

---

## DIVERGED BRANCHES (need rebase or merge resolution)

⚠️ **These branches have diverged from main. Risk: stale bases, potential conflicts.**

All 8 are dated 2026-05-25 (3+ days old). Phase 1 cascade merged design + content + feature branches Saturday, so main has been updated. These branches need rebase to sync with new main.

| Branch | Files Changed | Last Commit Date | Recommended Action | Owner |
|---|---|---|---|---|
| `assets/auto-2026-05-25-project-images` | 10 | 2026-05-25 | Rebase on main (Sat) | Shamus/Dani |
| `content/auto-2026-05-25-links-and-copy` | 6 | 2026-05-25 | Rebase on main (Sat) | Will |
| `docs/auto-2026-05-25-will-merge-guide` | 1 | 2026-05-25 | Rebase on main (Sat) | Will |
| `fix/auto-2026-05-25-portfolio-wave2` | 5 | 2026-05-25 | Merge main + resolve (Sat) | Gary |
| `fix/auto-2026-05-25-wave5-final` | 7 | 2026-05-25 | Merge main + resolve (Sat) | Gary |
| `test/auto-2026-05-25-gary-portfolio-tests` | 8 | 2026-05-25 | Merge main + resolve (Sat) | Gary |
| `ui/auto-2026-05-25-dani-warmth` | 5 | 2026-05-25 | Rebase on main (Sat) | Dani |
| `ui/auto-2026-05-25-homepage-polish` | 14 | 2026-05-25 | Merge main + resolve (Sat) | Shamus + Gary |
| `ui/auto-2026-05-25-shamus-card-upgrade` | 9 | 2026-05-25 | Merge main + resolve (Sat) | Shamus + Gary |

**Summary:** All 8 are old branches from before Phase 1 cascade. They need sync with the updated main. No major conflicts expected (assets, content, UI are independent), but rebase will catch any.

---

## REBASE INSTRUCTIONS (Saturday)

### For simple rebase (no content conflict):

```bash
git fetch origin main
git checkout assets/auto-2026-05-25-project-images
git rebase origin/main
# If no conflicts, done
git push --force-with-lease origin assets/auto-2026-05-25-project-images
```

### For merge (if conflicts):

```bash
git fetch origin main
git checkout assets/auto-2026-05-25-project-images
git merge origin/main
# Resolve conflicts in editor (if any)
git add .
git commit -m "Merge main into assets branch"
git push origin assets/auto-2026-05-25-project-images
```

---

## CONFLICT-FREE EXPECTATION

These branches (assets, content, UI, docs, fixes) **should not conflict** because:
- Assets folder is isolated (images only).
- Content is copy + links (no code overlap with design/feat merges).
- UI branches are component-level (no overlap with base design merge).
- Docs are standalone.
- Fixes are bug-specific.

**Expected outcome:** Rebase succeeds for 7 of 8 branches. 1–2 may have trivial conflicts (line numbers shifted), easily resolved.

---

## RESOLUTION TIMELINE

### Saturday 10am → 12pm

**Will:** Rebase `content/auto-2026-05-25-links-and-copy` + `docs/auto-2026-05-25-will-merge-guide`.  
**Dani:** Rebase `ui/auto-2026-05-25-dani-warmth`.  
**Shamus + Gary:** Merge main into `assets/auto-2026-05-25-project-images` + `ui/auto-2026-05-25-homepage-polish` + `ui/auto-2026-05-25-shamus-card-upgrade`.  
**Gary:** Merge main into `fix/auto-2026-05-25-portfolio-wave2` + `fix/auto-2026-05-25-wave5-final` + `test/auto-2026-05-25-gary-portfolio-tests`.

### Saturday 12pm

**All:** Rebase/merge complete. Run `npm test` on each branch to confirm no regressions.

### Saturday 1pm

**All:** Conflicts resolved. Branches ready for merge.

---

## ROLLBACK PLAN

If rebase/merge fails:

1. **Abort the rebase/merge:** `git rebase --abort` or `git merge --abort`.
2. **Report to Morgan:** which branch + exact conflict message.
3. **Escalate if needed:** If conflict is semantic (two branches edit same component), have Shamus + Dani arbitrate offline.
4. **Re-attempt Sunday morning** after resolution.

Expected rollback time: ~10 min per branch.

---

## STATUS

✅ **READY FOR SATURDAY REBASE.**

- 4 branches: linear, ready now.
- 8 branches: need rebase/merge (Sat ~2–3h work).
- Expected conflict-free (no major overlaps).

**Next:** Saturday 10am rebase work. Saturday 1pm done. Monday 1pm merge wave.

---

**Report:** qa-reports/2026-05-28_Pre_Merge_Conflict_Resolution_Portfolio.md  
**Status:** ASSIGNED (Will/Dani/Shamus/Gary actions required Saturday)  
**Next:** Saturday 10am rebase. Monday 1pm merge wave.
