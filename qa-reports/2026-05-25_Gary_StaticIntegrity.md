# Gary QA Report — Static Integrity Tests (Gaps 2 + 3)

**Date:** 2026-05-25
**Branch:** `test/gary-static-integrity-2026-05-25`
**Role:** Gary (QA)
**Scope:** `lib/__tests__/static-integrity.test.ts` — new file implementing Sam's audit gaps 2 and 3

---

## What Was Done

Created `lib/__tests__/static-integrity.test.ts` and added `npm run test:static` script to `package.json`.

---

## Gap 2 — Internal Link Resolution

**Status: IMPLEMENTED — 2 tests, all pass**

Walks all `.html` files inside `./out/` and asserts that every internal `<a href="...">` resolves to an existing file in the static export. Logic:

- Strips the `/portfolio` basePath prefix (Next.js build-time setting)
- Trailing-slash URLs check for `index.html` inside the directory
- Skips `mailto:`, `#fragment`, and `_next/` asset links
- Fails with a per-file, per-href breakdown if any are broken

One sanity-check test also asserts at least one internal link exists across all pages (catches a degenerate case where the parser silently matches nothing).

---

## Gap 3 — External Link rel Attributes

**Status: IMPLEMENTED — 2 tests, all pass**

Walks all `.html` files in `./out/` and asserts every `<a href="https://...">` carries both `noopener` and `noreferrer` in its `rel` attribute. Covers Alex §4.5 and security (window.opener access + referrer leak).

One sanity-check test asserts at least one external link exists (prevents a false-green if the regex matches nothing).

---

## Test Results

```
✓ lib/__tests__/static-integrity.test.ts (4 tests) 21ms
  ✓ Gap 2 — internal link resolution > every internal href resolves to an existing file
  ✓ Gap 2 — internal link resolution > finds at least one internal link (sanity check)
  ✓ Gap 3 — external link rel attributes > every external link has rel="noopener noreferrer"
  ✓ Gap 3 — external link rel attributes > finds at least one external link (sanity check)
```

---

## Infrastructure Note (Sam's Flag — Confirmed)

These tests require `./out/` to exist (a prior `npm run build`). They are NOT part of the normal `npm run test` suite (vitest config excludes the `out/` dir). Use:

```bash
npm run test:static   # chains: npm run build && vitest run static-integrity
```

Or run against an existing build:

```bash
npx vitest run lib/__tests__/static-integrity.test.ts
```

Consider adding `test:static` to CI as a separate step after the build step.

---

## Files Changed

- `lib/__tests__/static-integrity.test.ts` — new (272 lines)
- `package.json` — added `test:static` script

---

## Not Done (Out of Scope for This Task)

Per the redirect instruction, the broader QA sweep proposal (Gaps 1 and 4, CI integration, etc.) is documented separately. This report covers only Gaps 2 and 3.

---

*— Gary, 2026-05-25*
