# PORTFOLIO PHASE 1 — EXECUTION DIRECTIVE

**Date:** 2026-05-28 · **Status:** STANDBY (awaiting Dani design merge, then cascade)  
**Authority:** Morgan (PM) · **Deadline:** EOD 2026-05-28

---

## PHASE 1 EXECUTION SEQUENCE

**Gate:** Dani merges `design/portfolio-creative-polish-2026-05-27` to main  
**Once gate opens:** Execute below in sequence (each role waits for gate before starting)

---

### STEP 1: PETER — OG/TWITTER META TAGS (5 MIN)

**File:** `app/layout.tsx`  
**Add tags:**
- `og:title`, `og:description`, `og:image`
- `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`

**Image:** Use portfolio hero or preview placeholder if real image unavailable  
**Test:** Verify with og:image placeholder (real image can be finalized post-deploy)  
**Outcome:** Report to `qa-reports/deploy-peter-portfolio-meta-2026-05-28.md`

**Start:** Once Dani merge completes  
**Timeline:** 5 min

---

### STEP 2: WILL — CONTENT URLS + PAC-MAN ENTRY (10 MIN)

**File:** `content/deliverables.json`  
**Actions:**
1. Replace all 5× `example.com` URLs with real GitHub/live demo links
2. Add Pac-Man Code Trainer entry:
   - Project description
   - GitHub URL
   - Live demo URL

**Test:** Verify all URLs resolve (valid, no 404)  
**Outcome:** Report to `qa-reports/deploy-will-portfolio-urls-2026-05-28.md`

**Start:** Once Dani merge completes (parallel with Peter, but Peter finishes first so order doesn't matter for gate)  
**Timeline:** 10 min

---

### STEP 3: GARY — PORTFOLIO TEST SUITE (5 MIN)

**File:** `lib/__tests__/static-integrity.test.ts`  
**Task:** Run full test suite on `content/deliverables.json` changes (Pac-Man entry + real URLs)

**Validate:**
- Gap 2: Internal link resolution (all links resolve)
- Gap 3: External link rel attributes (rel="noopener noreferrer" where needed)
- Target: 40/40 tests pass (no new failures)

**Outcome:** Report to `qa-reports/deploy-gary-portfolio-tests-2026-05-28.md`

**Start:** Once Will completes content changes (5 min after Will starts, since Will takes 10 min)  
**Timeline:** 5 min

---

### STEP 4: CASEY — ABOUT PAGE EXPANSION (5 MIN)

**File:** `app/about/page.tsx`  
**Actions:**
1. Add 2–3 new original paragraphs (distinct from homepage bio)
2. Reveal work philosophy or approach
3. Remove duplicate About section from homepage (single-scroll cleanup)

**Keep:** Direct `/app/about` navigation path (don't delete the page, just remove homepage duplicate)  
**Outcome:** Report to `qa-reports/deploy-casey-portfolio-about-2026-05-28.md`

**Start:** Once Dani merge completes (parallel with others)  
**Timeline:** 5 min

---

## EXECUTION TIMELINE

```
Dani design merge (5 min)
    ↓
[GATE OPENS]
    ↓
Peter (5 min) ──→ DONE
Will (10 min) ──→ DONE
  ↓
  Gary (5 min after Will) ──→ DONE
Casey (5 min, parallel) ──→ DONE
    ↓
Morgan phase 1 synthesis + merge to main (5 min)
    ↓
Sky final merge + deploy verification
```

**Total time from gate open to Phase 1 complete:** ~25 min  
**Phase 1 deadline:** EOD 2026-05-28  
**Target Phase 2 start:** 2026-05-29 (Shamus UI build)

---

## ROLE RESPONSIBILITIES

### Peter (Performance)
- [ ] Add OG/Twitter meta tags to `app/layout.tsx`
- [ ] Test og:image with placeholder (or real image if available)
- [ ] Report results to qa-reports/deploy-peter-portfolio-meta-2026-05-28.md

### Will (Tech Writer)
- [ ] Replace 5× `example.com` URLs in `content/deliverables.json` with real GitHub/live links
- [ ] Add Pac-Man Code Trainer entry (description, GitHub URL, live URL)
- [ ] Verify all URLs resolve
- [ ] Report to qa-reports/deploy-will-portfolio-urls-2026-05-28.md

### Gary (QA)
- [ ] Run `lib/__tests__/static-integrity.test.ts` on Will's content changes
- [ ] Validate gaps 2 & 3 (internal links, external link rel attrs)
- [ ] Confirm 40/40 tests pass
- [ ] Report results to qa-reports/deploy-gary-portfolio-tests-2026-05-28.md

### Casey (Community)
- [ ] Expand `/app/about/page.tsx` with 2–3 new original paragraphs
- [ ] Remove duplicate About section from homepage
- [ ] Keep direct `/app/about` route accessible
- [ ] Report to qa-reports/deploy-casey-portfolio-about-2026-05-28.md

### Morgan (PM — this step)
- [ ] Synthesize Phase 1 completion (all 4 role reports in hand)
- [ ] Merge feature branch to main (or coordinate Sky merge)
- [ ] Confirm all 40 tests still pass post-merge
- [ ] Final report: `qa-reports/2026-05-28_Morgan_Phase1_Complete.md`

---

## QUALITY GATES

**Before final merge:**
- [ ] Gary: 40/40 tests PASS (no regressions)
- [ ] Peter: OG/Twitter tags present in layout.tsx (verifiable via inspect)
- [ ] Will: All URLs in deliverables.json are real + resolve (no example.com)
- [ ] Casey: About page has new distinct content (no duplicate from homepage)

**If any fail:** STOP, report blocker, request fix.

---

## CURRENT STATUS

**Gate:** ⏳ Awaiting Dani design merge  
**Roles:** Standby (briefed, ready to execute)  
**Next:** Once Dani merge signal arrives, execute Phase 1 cascade

---

**Update coming in:** ~15 min (once Dani merge decision made)
