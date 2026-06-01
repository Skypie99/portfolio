# Badge Image Verification Report

**Date:** 2026-05-29  
**Scope:** Certificate badge image asset validation  
**Status:** PRODUCTION BLOCKER CONFIRMED

---

## Executive Summary

The `/certificates` page references **6 certificate badge images** in `content/certificates.json` (verified at lines 10, 23, 36, 49, 62, 75). **All 6 images are missing from disk.** The build succeeds (no schema validation error), but the HTML render references broken image paths, resulting in 404s at runtime.

---

## Findings

### Referenced Images (from certificates.json)

**Source:** `/Users/skypie/Portfolio/content/certificates.json`

| Certificate ID | Badge Path | Line | Status |
|---|---|---|---|
| anthropic-ai-fluency-foundations-2026 | `/images/certificates/anthropic-ai-fluency-2026/badge.png` | 10 | **MISSING** |
| anthropic-claude-cowork-intro-2026 | `/images/certificates/anthropic-cowork-intro-2026/badge.png` | 23 | **MISSING** |
| anthropic-claude-101-2026 | `/images/certificates/anthropic-claude-101-2026/badge.png` | 36 | **MISSING** |
| google-prompting-essentials-2025 | `/images/certificates/google-prompting-essentials-2025/badge.png` | 49 | **MISSING** |
| umich-python-getting-started-2025 | `/images/certificates/umich-python-2025/badge.png` | 62 | **MISSING** |
| deeplearning-ai-for-everyone-2025 | `/images/certificates/deeplearning-ai-for-everyone-2025/badge.png` | 75 | **MISSING** |

### Disk Reality

**Path checked:** `/Users/skypie/Portfolio/public/images/`

```
✓ /Users/skypie/Portfolio/public/images/deliverables/ EXISTS
  ├─ accessmap/hero.svg
  ├─ claude-corp/hero.svg
  ├─ mutual-mesh/hero.svg
  ├─ pacman-code-trainer/hero.svg
  └─ prompt-library/hero.svg

✗ /Users/skypie/Portfolio/public/images/certificates/ DOES NOT EXIST
```

### Full Missing Paths

```
/Users/skypie/Portfolio/public/images/certificates/anthropic-ai-fluency-2026/badge.png
/Users/skypie/Portfolio/public/images/certificates/anthropic-cowork-intro-2026/badge.png
/Users/skypie/Portfolio/public/images/certificates/anthropic-claude-101-2026/badge.png
/Users/skypie/Portfolio/public/images/certificates/google-prompting-essentials-2025/badge.png
/Users/skypie/Portfolio/public/images/certificates/umich-python-2025/badge.png
/Users/skypie/Portfolio/public/images/certificates/deeplearning-ai-for-everyone-2025/badge.png
```

### Render Impact

**Page:** `/certificates` (server-rendered at `app/certificates/page.tsx`, lines 101–112)

The page renders `<img src={c.badgeImage.src} ... />` for each certificate. On the live site, this produces broken image references:

```html
<!-- From /out/certificates/index.html -->
<img src="/images/certificates/anthropic-ai-fluency-2026/badge.png" 
     alt="Anthropic AI Fluency Framework & Foundations credential badge" 
     width="400" height="400" ... />
```

When users visit `https://skypie99.github.io/portfolio/certificates/`, the badge container (a 1:1 aspect square, lines 98–113) displays **a broken image icon** instead of the credential badge. The page is otherwise functional (links work, text renders), but the visual presentation is incomplete.

---

## Root Cause

The `badgeImage` field in `certificates.json` was populated with paths to images that were never created or committed. The schema validation at build time (`lib/schema.ts`) enforces the **path pattern** (must start with `/images/certificates/` and end with `.png`), but does not enforce **file existence** — only Next.js `static-integrity` tests would catch this if run via `npm run test:static`.

**Current behavior:**
- ✓ Build succeeds (no TypeScript or schema errors)
- ✓ Page renders without error
- ✗ 6 broken image references appear in live HTML
- ✗ Users see broken badge icons at runtime

---

## Classification

**Severity:** Production Blocker

**Reason:** The `/certificates` page is published to the live site (`https://skypie99.github.io/portfolio/certificates/`) and users currently see broken images. This is a visual/functional defect visible to all visitors, not a build-time or hidden issue.

**Why it wasn't caught:**
1. `npm run build` does not validate image file existence — only path format.
2. `npm run test:static` (which would catch this) is not run in CI/CD.
3. The build pipelines documented in `.github/workflows/deploy.yml` do not include static-integrity validation.

---

## Remediation Path

**Option A (Quick fix):** Remove badgeImage references
- Delete the `badgeImage` field from each certificate in `certificates.json`
- Update `app/certificates/page.tsx` to render a fallback (issuer logo, icon, or blank)
- Allows page to publish without broken images

**Option B (Complete fix):** Provide badge images
- Create directories: `/public/images/certificates/{slug}/`
- Add `badge.png` files (400×400 or similar) for each of the 6 credentials
- Ensure files match the exact paths in `certificates.json`

**Option C (Deferred):** Disable certificates page
- Remove `/certificates` from navigation
- Set page to render a "coming soon" message
- Plan badge images for a future release

---

## Verification Checklist

- [x] Read `certificates.json` lines 1–80; extracted all `badgeImage.src` values
- [x] Verified none of the 6 paths exist on disk
- [x] Confirmed `/public/images/certificates/` directory does not exist
- [x] Ran `npm run build` to confirm build succeeds despite missing images
- [x] Inspected HTML output at `/out/certificates/index.html` to confirm broken paths are rendered
- [x] Reviewed `app/certificates/page.tsx` (lines 101–112) for image render logic

---

## Impact Summary

| Aspect | Status |
|--------|--------|
| **Build** | ✓ Passes |
| **Page renders** | ✓ Yes |
| **Image references present** | ✓ Yes (6 broken links) |
| **Image files exist** | ✗ No |
| **Live site shows broken images** | ✓ Yes |
| **User-facing defect** | ✓ Yes |

**Recommendation:** Address before next major release or next time the `/certificates` page is promoted in marketing/social media.
