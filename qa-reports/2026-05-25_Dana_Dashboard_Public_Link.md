# AI Portfolio — Privacy Audit: Dashboard Repository Public Link

**Date:** 2026-05-25  
**Finder:** Dana (Portfolio Audit)  
**Type:** PRIVACY FINDING — Pre-Launch Gate  
**Severity:** HIGH  
**Status:** OPEN — Requires verification and decision

---

## Finding Summary

The portfolio site (https://skypie99.github.io/portfolio/) links to a GitHub repository at `github.com/Skypie99/Dashboard`. However, per system memory, the Dashboard project is marked as "never deploy publicly — qa-reports sensitive."

**Conflict:**
- Portfolio publicly links to Dashboard repo
- Dashboard repository appears to be public (or at least accessible)
- Dashboard qa-reports directory may be exposed (containing project decisions, findings, escalations)

**Impact:**
- If Dashboard repo is public and contains qa-reports: sensitive project decisions and findings are discoverable via public GitHub
- Pre-launch privacy audit gate (Const. Art. 7)

---

## Questions to Resolve

1. **Is the Dashboard repository public or private?**
   - Check: `github.com/Skypie99/Dashboard` visibility setting
   
2. **Does the Dashboard repository contain qa-reports/?**
   - Check: repository structure for `qa-reports/` directory and file count
   
3. **Are qa-reports currently committed to the repo, or local-only?**
   - Check: `git log --all -- qa-reports/` to see if any qa-reports are in commit history
   
4. **What should the portfolio link to?**
   - Option A: Remove the Dashboard link entirely (safest)
   - Option B: If repo is private, verify privacy setting and keep link (medium risk)
   - Option C: If repo is public, move qa-reports to local-only storage or delete from public repo (requires git history cleanup)

---

## Audit Tasks

- [ ] Check Dashboard repository visibility (public/private)
- [ ] List files in `qa-reports/` directory
- [ ] Verify qa-reports are not in public commit history
- [ ] If public + qa-reports exposed: recommend removal or privacy change
- [ ] Update portfolio link status based on audit findings

---

## Decisions for Sky

| # | Decision | Blocking | Route |
|---|---|---|---|
| D1 | Audit Dashboard repo public/private status and qa-reports exposure | YES — privacy gate | Dana to audit; route to Sky if expose found |
| D2 | If exposed, remove portfolio link or make Dashboard private? | YES — privacy gate | Decision after audit results |

---

## DECISIONS FOR SKY

**BLOCKER:** This is a privacy pillar finding (Const. Art. 7). Portfolio launch cannot proceed without verifying the Dashboard repository does not expose sensitive qa-reports publicly.

**Action:** Dana to audit Dashboard repository status and qa-reports exposure. Report findings to Sky via Morgan; Sky decides on removal, privacy change, or other remediation.

---

## Next Steps

1. Dana audits Dashboard repository public/private status
2. Dana checks qa-reports directory and git history for exposure
3. Report audit findings to Sky via Morgan briefing
4. Sky decision on remediation (Option A/B/C or other)
5. Implement remediation if needed
6. Re-verify and mark privacy gate PASS
