# DEPLOYMENT — Gary Static Integrity Tests

**Project:** Portfolio  
**Delegated to:** Gary (QA)  
**Authority:** Morgan autonomous deployment (safe + scoped)  
**Timeline:** 2–3 hours  
**Scope:** Implement gaps in `lib/__tests__/static-integrity.test.ts`

---

## THE WORK

Portfolio PROJECT_STATE shows 2 test gaps that block QA closure:
1. **Gap 2:** Internal link resolution (`/portfolio/docs/` → resolve against actual pages)
2. **Gap 3:** External link rel attrs (`rel="noopener noreferrer"` verification)

Both are **safe, scoped, deterministic** test implementations. No feature changes, no deploy.

---

## EXECUTION SCOPE

1. **Read** `lib/__tests__/static-integrity.test.ts` (current state + Gap 2/3 comments)
2. **Implement Gap 2:** Parse internal links in markdown/component files → verify they resolve to actual files in `/src/pages/`, `/docs/`, etc.
3. **Implement Gap 3:** For each external link in the portfolio, verify `rel="noopener noreferrer"` is present
4. **Test:** `npm test -- static-integrity.test.ts` must pass
5. **Report:** qa-report with implementation, test results, any new gaps found

---

## DECISION MATRIX

If you hit complexity:
- **"Internal link resolution is unclear"** → Route to Morgan for design input
- **"rel attrs are missing from X component"** → Report findings; no need to fix (that's component work)
- **"New gap discovered during testing"** → Note in qa-report, don't block

You're testing the tests; findings are the output.

---

## NEXT STEP

1. Review scope
2. Implement gaps 2 + 3
3. Run tests
4. Report findings + test results

**Report location:** `~/portfolio/qa-reports/2026-05-28_Gary_StaticTests.md`

---

**Morgan deployment sent to Gary at 2026-05-28. Ready to execute.**
