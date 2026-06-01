# Rory — Merge Wave Report

**Date:** 2026-05-29  
**Role:** Rory (DevOps)  
**Model tier:** Sonnet  
**Authority:** Elevated merge authority (valid through 2026-05-30); Gary audit PASS (2026-05-29_Gary_BranchAudit.md); Morgan approval; Sky delegated handling decisions to Morgan.

---

## Summary

Two branches merged to main per Morgan decisions. One build bug discovered and fixed on main before push.

---

## Task 1 — feat/blog-infrastructure-2026-05-30 (MERGE WITH POST HIDDEN)

**Decision:** Set `draft: true` on placeholder post `building-accessmap`, then merge.

### Steps taken

1. Checked out `feat/blog-infrastructure-2026-05-30`
2. Set `"draft": false` → `"draft": true` for slug `building-accessmap` in `content/blog.json`
3. Committed: `content: hide placeholder blog post until real content ready (Morgan decision 2026-05-29)` — SHA `7aff58e`
4. Dry-run merge to main: `git merge --no-commit --no-ff` → clean, no conflicts
5. Merged to main: `merge(blog): blog infrastructure + placeholder post hidden` — merge SHA `a925090`

### Build issue discovered and fixed

After merge, `npm run build` failed:

```
[Error: Page "/blog/[slug]" is missing "generateStaticParams()" so it cannot be used with "output: export" config.]
```

**Root cause:** Next.js 15 throws this error when `generateStaticParams()` returns an empty array. The blog slug page called `getBlogPosts()` (which filters drafts) — with the only post now draft, it returned `[]`, and Next.js considered the dynamic route unresolvable.

**Fix applied on main:**
- Added `getAllBlogPostSlugs()` to `lib/content.ts` — returns ALL slugs including drafts, for route enumeration only
- Updated `app/blog/[slug]/page.tsx` to use `getAllBlogPostSlugs()` in `generateStaticParams`
- Draft slugs still resolve to `notFound()` at render time (the `BlogPostPage` component calls `getBlogPosts().find(...)` which excludes drafts)
- Commit: `fix(blog): add getAllBlogPostSlugs so static export works when all posts are draft` — SHA `102c97c`

**Result:** Build passes. `/blog/building-accessmap` is generated as a static 404 page. The post is invisible from the blog listing.

---

## Task 2 — shamus/portfolio-fixes-2026-05-29 (MARK GUARD TEST .todo & MERGE)

**Decision:** Convert failing badge asset guard test to `it.todo`, then merge.

### Context

`shamus/portfolio-fixes-2026-05-29` was already merged to main at start of wave (zero commits ahead). The branch still existed as a pointer to the same commit as main. The `asset-integrity.test.ts` file (added by commit `ef137dd`) was on main and failing:

```
FAIL  lib/__tests__/asset-integrity.test.ts > Gap 4 — badge image asset existence > every badgeImage.src...
```

6 badge PNGs are referenced in `content/certificates.json` but do not exist in `public/images/certificates/`.

### Steps taken

1. Checked out `shamus/portfolio-fixes-2026-05-29`
2. In `lib/__tests__/asset-integrity.test.ts`:
   - Converted `it('every badgeImage.src in certificates.json exists in public/', () => { ... })` to `it.todo('every badgeImage.src in certificates.json exists in public/')`
   - Added `// TODO: add real badge PNGs to public/images/certificates/<slug>/badge.png to un-todo this guard` comment
   - Removed orphaned `PUBLIC_DIR` constant (no longer needed in the test body)
3. Verified: `npm test` → 16 files, 108 passed, 1 todo ✓
4. Committed: `test: mark missing-badge guard as todo until real badge PNGs added (Morgan decision 2026-05-29)` — SHA `48d8574`
5. Dry-run merge to main: `git merge --no-commit --no-ff` → clean, no conflicts
6. Merged to main: `merge(tests): mark badge asset guard as todo — real PNGs pending` — merge SHA `ce1e9da`

---

## Quality Gate Results (final main state)

| Check | Result |
|-------|--------|
| `npm test` | 16 files, 108 passed, 1 todo — PASS |
| `npm run typecheck` | Clean (no output) — PASS |
| `npm run build` | Static export succeeded — PASS |
| Push to origin/main | `92c1148..102c97c` — PUSHED |

**Test detail:** 1 todo = `asset-integrity.test.ts > Gap 4 — badge image asset existence > every badgeImage.src...` (intentional — awaiting real badge PNGs per Morgan decision)

---

## Final main SHA

**`102c97c`** — `fix(blog): add getAllBlogPostSlugs so static export works when all posts are draft`

---

## Commits pushed to origin/main (this wave)

```
102c97c fix(blog): add getAllBlogPostSlugs so static export works when all posts are draft
a925090 merge(blog): blog infrastructure + placeholder post hidden (Morgan decision 2026-05-29)
7aff58e content: hide placeholder blog post until real content ready (Morgan decision 2026-05-29)
ce1e9da merge(tests): mark badge asset guard as todo — real PNGs pending (Morgan decision 2026-05-29)
48d8574 test: mark missing-badge guard as todo until real badge PNGs added (Morgan decision 2026-05-29)
```

---

## NOT merged

- `feat/shamus-phase2-ui-2026-05-29` — BLOCKED by Design Compiler (Dani). Shamus fixing separately. Not touched.

---

## Outstanding items for Sky / Morgan

- **Badge PNGs needed:** 6 certificate badge images missing from `public/images/certificates/`. Once added, remove `.todo` from `asset-integrity.test.ts` and the test will enforce integrity automatically. See `qa-reports/2026-05-29_DaniShamus_BadgeImage_Proposal.md` for expected directory structure.
- **Blog post:** `building-accessmap` is draft. Real content replaces placeholder → set `draft: false` when ready.
