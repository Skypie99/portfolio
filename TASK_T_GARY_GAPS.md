# TASK: Gary - Portfolio Static Integrity Test Gaps (In Progress)

**Timeline:** 2026-05-27, ETA 1-2 hours
**Blocker:** None — tests currently passing (45/45)
**Output:** 2 new test cases + passing npm test + qa-report

## Gap 2: Internal Link Resolution
Verify all `/portfolio/...` links resolve to actual deployed pages.

**Implementation:**
```javascript
// In src/lib/__tests__/static-integrity.test.ts
describe('Gap 2: Internal Link Resolution', () => {
  test('all internal portfolio links resolve to deployed pages', () => {
    // Parse HTML for /portfolio/* links
    // Verify each target file exists in build output
    // Check no 404-pattern links
  });
});
```

## Gap 3: External Link rel Attributes
Verify external links have `rel="noopener noreferrer"`.

**Implementation:**
```javascript
describe('Gap 3: External Link rel Attributes', () => {
  test('external links have rel="noopener noreferrer"', () => {
    // Find all <a> tags with non-skypie99.github.io hrefs
    // Assert rel attribute includes both noopener and noreferrer
    // Report any missing or incomplete rel attrs
  });
});
```

## Success
- [ ] npm test passes (45+ tests)
- [ ] npm run typecheck GREEN
- [ ] npm run lint clean
- [ ] Commit + push to feature branch (NOT main)
- [ ] qa-report: 2026-05-27_Gary_PortfolioTestGaps.md

**Status:** START NOW — no dependencies
