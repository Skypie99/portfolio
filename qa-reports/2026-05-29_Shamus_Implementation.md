# Shamus Implementation Report — Portfolio Fixes
**Date:** 2026-05-29
**Branch:** shamus/portfolio-fixes-2026-05-29
**Status:** COMPLETE — Build GREEN, 89 pre-existing tests pass, 1 new Gap 4 test intentionally fails (correct behavior)

---

## Summary

Applied all confirmed fixes from `2026-05-29_DaniShamus_BadgeImage_Proposal.md`. Three commits on the branch, no push, no merge, no PR.

---

## Fixes Applied

### Fix 1 — Badge Graceful Degradation (DONE)

**Files changed:**
- `components/BadgeImage.tsx` — new `"use client"` component wrapping `<img>` with `onError` fallback
- `app/certificates/page.tsx` — imports and uses `BadgeImage` instead of raw `<img>` (Server Component constraint prevents `onError` directly on img)
- `public/images/certificates/placeholder.png` — 400x400 solid RGB PNG generated via Node.js raw PNG writer (no external dependencies)

**How it works:** When a badge src returns 404, `onError` fires and sets `e.target.src` to `/images/certificates/placeholder.png`. Once Sky adds real badges, `onError` never triggers.

**Note on Server Component constraint:** The proposal put `onError` directly on the `<img>` in the Server Component, but Next.js 15 rejects event handlers on Server Component props. The fix extracts the img into `BadgeImage.tsx` (`"use client"`) which is the correct App Router pattern.

### Fix 2 — Build Guard: Badge Asset Validation (DONE)

**Files changed:**
- `scripts/validate-assets.mjs` — standalone Node.js ESM script that reads `content/certificates.json` and checks every `badgeImage.src` against `public/`. Exits 1 with a clear listing of missing files.
- `lib/__tests__/asset-integrity.test.ts` — new Vitest test file (Gap 4) that runs as part of `npm test`. Fails with actionable error if any badge is missing from `public/`.
- `lib/__tests__/static-integrity.test.ts` — header comment updated to document Gap 4.
- `package.json` — added `validate:assets` script (`node scripts/validate-assets.mjs`)

**How to run:**
```bash
npm run validate:assets   # pre-deploy check (exits 1 if badges missing)
npm test                  # Gap 4 test runs here (asset-integrity.test.ts)
```

**Current state:** Gap 4 test intentionally fails with a list of the 6 missing badge files. This is correct behavior — the test is the guard. It will turn green once Sky adds real badge PNGs to `public/images/certificates/<slug>/badge.png`.

### Fix 3 — robots.txt (DONE)

**File created:** `public/robots.txt`

Allows all crawlers, links sitemap at `https://skypie99.github.io/portfolio/sitemap.xml`.

### Fix 4 — Zod Refine (SKIPPED — schema not present on main)

The task spec says "only if such a schema exists; verify first." The `BlogPostSchema` (which has a `content: z.string()` field that would be the candidate for the `< >` refine) does NOT exist on `main`. It lives only on `feat/blog-infrastructure-2026-05-30`. No Zod refine was added. When the blog branch merges, the refine should be applied at that time.

---

## Build & Test Results

```
npm run build        GREEN — all 13 static pages exported
npm run typecheck    GREEN — no TypeScript errors
npm test             PARTIAL — 89 pass / 1 fail (Gap 4 intentionally fails on missing badges)
```

**Pre-existing tests:** All 89 original tests still pass.
**New tests added:** 2 (Gap 4: 1 intentionally fails, 1 sanity check passes).

---

## Commits

| SHA     | Message |
|---------|---------|
| a7f9a17 | feat(certificates): add badge graceful degradation with placeholder fallback |
| ef137dd | feat(tests): add Gap 4 badge-asset existence guard (Gary) |
| 40f7e33 | feat(seo): add public/robots.txt allowing full indexing with sitemap link |

---

## Decisions for Sky

1. **Real badge images:** Add `badge.png` to each of the 6 directories listed in the proposal (Part 1). Once added, the Gap 4 test turns green and the `onError` fallback becomes dormant.
2. **Zod refine for blog content:** When `feat/blog-infrastructure-2026-05-30` is reviewed, add `.refine(s => !s.includes('<') && !s.includes('>'), ...)` to `BlogPostSchema.content` as the XSS guard. That schema does not exist on `main` yet.
3. **prebuild vs validate:assets:** `validate:assets` is a named script (not `prebuild`) to keep `npm run build` green until real badges land. To enforce at build time: `"prebuild": "node scripts/validate-assets.mjs"` in package.json once badges are in place.

---

## Files Changed

```
app/certificates/page.tsx             (modified — uses BadgeImage)
components/BadgeImage.tsx             (new — "use client" img with onError)
lib/__tests__/asset-integrity.test.ts (new — Gap 4 badge existence test)
lib/__tests__/static-integrity.test.ts (modified — Gap 4 documented in header)
package.json                          (modified — validate:assets script)
public/images/certificates/placeholder.png (new — 400x400 solid-color PNG)
public/robots.txt                     (new — indexing policy + sitemap link)
scripts/validate-assets.mjs           (new — standalone asset validation)
```
