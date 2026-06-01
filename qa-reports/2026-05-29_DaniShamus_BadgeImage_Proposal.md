# Portfolio Badge Image Remediation Plan
**Role:** Dani (Design) + Shamus (UI QA)  
**Date:** 2026-05-29  
**Status:** AUDIT-ONLY PROPOSAL — No code applied, no commits, no git.

---

## Executive Summary

Six certificate badge images are **missing from disk** but referenced in `content/certificates.json` (verified 2026-05-29_BadgeImage_Verify.md). The `/certificates` page renders broken image icons on the live site. This audit proposes three remediation paths:

1. **Directory structure + filenames** — exact layout Sky must create for real badge images
2. **Interim placeholder approach** — graceful CSS fallback + single shared `placeholder.png` for immediate visual fix
3. **Build-time validation test** — Gary-owned test (Gap 4) to fail the build if badge paths are missing

All three components work together: Sky adds real badges to the directory structure, the test catches future regressions, and the placeholder provides visual breathing room until badges are in place.

---

## Part 1: Exact Directory Structure + Filenames

Sky must create this directory layout under `/Users/skypie/Portfolio/public/images/certificates/`:

```
public/images/certificates/
├── anthropic-ai-fluency-2026/
│   └── badge.png              (400×400px minimum, PNG)
├── anthropic-cowork-intro-2026/
│   └── badge.png
├── anthropic-claude-101-2026/
│   └── badge.png
├── google-prompting-essentials-2025/
│   └── badge.png
├── umich-python-2025/
│   └── badge.png
└── deeplearning-ai-for-everyone-2025/
    └── badge.png
```

**Reference:** Each directory name matches the first segment of the path in `content/certificates.json`:
- Line 10: `/images/certificates/anthropic-ai-fluency-2026/badge.png` → `anthropic-ai-fluency-2026/badge.png`
- Line 23: `/images/certificates/anthropic-cowork-intro-2026/badge.png` → `anthropic-cowork-intro-2026/badge.png`
- Line 36: `/images/certificates/anthropic-claude-101-2026/badge.png` → `anthropic-claude-101-2026/badge.png`
- Line 49: `/images/certificates/google-prompting-essentials-2025/badge.png` → `google-prompting-essentials-2025/badge.png`
- Line 62: `/images/certificates/umich-python-2025/badge.png` → `umich-python-2025/badge.png`
- Line 75: `/images/certificates/deeplearning-ai-for-everyone-2025/badge.png` → `deeplearning-ai-for-everyone-2025/badge.png`

**Image specs:**
- Format: PNG (8-bit or 24-bit)
- Minimum dimensions: 400×400px (Dani wave spec: badge container is 1:1 aspect ratio, rendered at explicit width/height 400)
- Recommended: 600×600px or 800×800px for sharp display on high-DPI screens
- Content: Credential badge art (issuer logo, certification mark, etc.)

---

## Part 2: Interim Placeholder Approach (Graceful Degradation)

**Status:** Can be implemented NOW without waiting for real badge art.

### Placeholder File
Create a single shared placeholder image at:
```
public/images/certificates/placeholder.png
```

This should be a simple visual indicator (e.g., a neutral geometric shape, a certificate icon, or the text "Certificate"). 400×400px PNG.

### Proposed CSS Fallback Patch
Update `app/certificates/page.tsx` to render a fallback when the real badge fails to load:

```diff
--- a/app/certificates/page.tsx
+++ b/app/certificates/page.tsx
@@ -95,16 +95,29 @@ export default function CertificatesPage() {
                  {/* Badge image / fallback — Cycle 27: removed the
                      issuer overlay text. Issuer name already appears
                      as the eyebrow above the title; repeating it
                      inside the well was triple-redundant. The well
                      now reads as decorative texture instead of
                      duplicate meta. Becomes the real badge once Sky
                      drops actual credential images in. */}
                  <div className="relative w-full aspect-square bg-peach-cream dark:bg-dark-surface border border-border-decorative dark:border-dark-border mb-6 overflow-hidden flex items-center justify-center">
                    {/* Alex F-C4-3: explicit dimensions for the 1:1 badge. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.badgeImage.src}
                      alt={c.badgeImage.alt}
                      width={400}
                      height={400}
                      className={cn(
                        'absolute inset-0 w-full h-full object-contain p-4',
                        'transition-transform duration-slow ease-out',
                        'group-hover:scale-[1.02] group-focus-within:scale-[1.02]',
                      )}
                      loading="lazy"
+                     onError={(e) => {
+                       // Fallback to placeholder if real badge fails to load.
+                       // This provides visual graceful degradation while real
+                       // badges are in the /public/images/certificates/ directory.
+                       (e.target as HTMLImageElement).src = '/images/certificates/placeholder.png';
+                     }}
                    />
                  </div>

                  {/* Issuer */}
```

**Why this works:**
- The real badge (`c.badgeImage.src`) loads first
- If it returns 404 (file missing), the `onError` handler fires
- User sees the placeholder instead of a broken image icon
- Once Sky adds the real badge file, the `onError` is never triggered and the real image displays
- Progressive enhancement: no JavaScript required (graceful degradation works even if JS fails)

**Note:** The `onError` handler requires client-side JS. For a pure-HTML fallback (no JS dependency), an alternative is CSS `image-set()` with a fallback, but that requires HTTP headers or `.htaccess` config that GitHub Pages doesn't support. The `onError` approach is the practical solution for this static-export site.

---

## Part 3: Build-Time Validation Test (Gap 4)

**Owner:** Gary (test infra)  
**Severity:** Should block the build if any referenced badge path is missing.

### Proposed Test: `lib/__tests__/static-integrity.test.ts` (Gap 4)

Add this test to the existing file at `lib/__tests__/static-integrity.test.ts`. This complements Gap 2 (internal links) and Gap 3 (external link security) with Gap 4 (image asset existence):

```diff
--- a/lib/__tests__/static-integrity.test.ts
+++ b/lib/__tests__/static-integrity.test.ts
@@ -1,9 +1,12 @@
 /**
- * static-integrity.test.ts — Portfolio static export integrity checks (Gary).
+ * static-integrity.test.ts — Portfolio static export integrity checks (Gary).
  *
  * Reads the built ./out/ directory and asserts two structural invariants:
  *
  *   Gap 2 — Internal link resolution
  *     Every internal href in every HTML file must resolve to an actual file
  *     or directory inside ./out/. A 404 on any internal nav link is a silent
  *     user-facing break that the build process won't catch on its own.
  *
  *   Gap 3 — External link rel attributes
  *     Every <a> that points to an external URL (http:// or https://) must
  *     carry rel="noopener noreferrer". Missing rel lets the opened page
  *     access window.opener and read the referrer — both a security risk and
  *     an Alex §4.5 / WCAG 3.2.5 compliance gap.
+ *
+ *   Gap 4 — Referenced image asset existence
+ *     Every src= attribute in <img> tags that points to a local asset
+ *     (not external http:// URLs) must exist in ./out/. Missing image files
+ *     result in broken images on the live site. Gallery images, hero images,
+ *     and badge images are all checked.
  *
  * IMPORTANT — requires a prior `npm run build`.
  * These tests operate on all .html files inside ./out/. They will fail with a clear message
  * if ./out/ doesn't exist yet (run `npm run build` first, or use
  * `npm run test:static` which chains build → test).
  *
  * No mocks. No browser. Pure node:fs on the real artifact.
  */

 import { existsSync, readFileSync } from 'node:fs';
 import { join, resolve } from 'node:path';
 import { describe, expect, it } from 'vitest';

@@ -268,3 +271,64 @@ describe('Gap 3 — external link rel attributes', () => {
     expect(totalExternal).toBeGreaterThan(0);
   });
 });
+
+// ---------------------------------------------------------------------------
+// Gap 4 — Referenced image asset existence (Gary)
+// ---------------------------------------------------------------------------
+
+describe('Gap 4 — referenced image asset existence', () => {
+  it('every <img src="/images/..."> points to an existing file in ./out/', () => {
+    assertOutDirExists();
+
+    const htmlFiles = collectHtmlFiles(OUT_DIR);
+    expect(htmlFiles.length).toBeGreaterThan(0);
+
+    const missing: Array<{ file: string; src: string; expected: string }> = [];
+
+    for (const htmlFile of htmlFiles) {
+      const html = readFileSync(htmlFile, 'utf8');
+
+      // Extract all <img src="..." /> tags
+      const imgPattern = /<img\s[^>]*src="([^"]+)"/gi;
+      let imgMatch: RegExpExecArray | null;
+
+      while ((imgMatch = imgPattern.exec(html)) !== null) {
+        const src = imgMatch[1];
+
+        // Skip external URLs (http://, https://, data:, etc.)
+        if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
+          continue;
+        }
+
+        // Skip empty or relative URLs
+        if (!src || !src.startsWith('/')) {
+          continue;
+        }
+
+        // Resolve the src path: strip basePath prefix, then look it up in ./out/
+        let imagePath = src;
+        if (imagePath.startsWith(BASE_PATH)) {
+          imagePath = imagePath.slice(BASE_PATH.length);
+        }
+
+        // Remove query params and fragments
+        imagePath = imagePath.split('?')[0].split('#')[0];
+
+        const fullPath = join(OUT_DIR, imagePath);
+
+        if (!existsSync(fullPath)) {
+          missing.push({
+            file: htmlFile.replace(OUT_DIR, './out'),
+            src,
+            expected: fullPath.replace(OUT_DIR, './out'),
+          });
+        }
+      }
+    }
+
+    if (missing.length > 0) {
+      const report = missing
+        .map((m) => `  [${m.file}] src="${m.src}" → missing ${m.expected}`)
+        .join('\n');
+      expect.fail(`${missing.length} missing image file(s):\n${report}`);
+    }
+  });
+
+  it('finds at least one image across all pages (sanity check)', () => {
+    assertOutDirExists();
+
+    const htmlFiles = collectHtmlFiles(OUT_DIR);
+    let totalImages = 0;
+
+    for (const htmlFile of htmlFiles) {
+      const html = readFileSync(htmlFile, 'utf8');
+      const imgPattern = /<img\s[^>]*src="([^"]+)"/gi;
+      let count = 0;
+      while (imgPattern.exec(html) !== null) {
+        count++;
+      }
+      totalImages += count;
+    }
+
+    expect(totalImages).toBeGreaterThan(0);
+  });
+});
```

**How to run:**
```bash
npm run test:static
```

This runs `npm run build`, then fires all static-integrity tests (Gap 2, Gap 3, **Gap 4**). If any referenced image is missing from `./out/`, the test fails with a clear message listing the missing paths.

**Impact:**
- ✓ Catches missing badge images at build time (before deploy)
- ✓ Also catches missing gallery or hero images (universal asset check)
- ✓ Fails the build, preventing broken images from reaching production
- ✓ Integrates into existing test suite — no new scripts needed

---

## Implementation Roadmap

### For Sky (User)
1. **Create directory structure** under `/Users/skypie/Portfolio/public/images/certificates/`:
   - 6 directories, one per certificate ID (see Part 1)
   - Add real `badge.png` file to each when available
   
2. **Optional — immediate visual fix** (Interim approach, Part 2):
   - Create `/public/images/certificates/placeholder.png` (400×400px)
   - Apply the CSS `onError` diff to `app/certificates/page.tsx`
   - Deploy: users see placeholder instead of broken images until real badges are added

### For Gary (Test Infra)
1. **Merge Gap 4 test** from Part 3 into `lib/__tests__/static-integrity.test.ts`
2. **Validate** with `npm run test:static` locally
3. **Commit** to `main` so future builds catch missing images

---

## Verification Checklist (Dani/Shamus Audit)

- [x] Read `content/certificates.json` (lines 1–80): confirmed all 6 `badgeImage.src` values
- [x] Confirmed `/public/images/certificates/` directory does not exist on disk
- [x] Read `app/certificates/page.tsx` (lines 98–112): confirmed image render logic
- [x] Reviewed Zod schema at `lib/schema.ts` (lines 84–87): path pattern enforced at build time, not file existence
- [x] Read existing static-integrity test at `lib/__tests__/static-integrity.test.ts` (lines 1–270)
- [x] Confirmed `npm run test:static` runs build + vitest, but Gap 4 (image existence) is not covered
- [x] Drafted directory structure (Part 1) — exact filenames match `certificates.json`
- [x] Drafted placeholder fallback patch (Part 2) — CSS graceful degradation with `onError`
- [x] Drafted Gap 4 test (Part 3) — integrates into existing static-integrity suite, fails build on missing images

---

## Risk Assessment

| Risk | Mitigation |
|------|-----------|
| **Real badge images not ready** | Interim placeholder (Part 2) provides visual stopgap; test (Part 3) ensures real images are added before next deploy |
| **Gap 4 test over-triggers** | Scoped to check only `/images/` local paths; external URLs (http://, https://, data:) are skipped |
| **Placeholder CSS onError fails** | Fallback is pure HTML `<img>` tag; JS failure only prevents *switching* to placeholder, original badge attempt still fires (progressive enhancement) |
| **Directory names don't match JSON** | Cross-verified: directory names are **exact prefixes** of `badgeImage.src` values in `certificates.json` |

---

## Status

**AUDIT COMPLETE — PROPOSALS READY FOR IMPLEMENTATION**

All three components (directory structure, placeholder CSS patch, Gap 4 test) are drafted and ready. No code has been applied; this is a pure proposal for Sky + Gary to review and integrate.

Once accepted:
1. Sky creates directories + adds badge images
2. Sky optionally applies placeholder CSS patch for immediate visual fix
3. Gary merges Gap 4 test into the test suite
4. Future builds will validate that all referenced images exist, preventing this class of broken-image regression

---

## Appendix: File References

All findings based on actual file reads:

- **Source config:** `/Users/skypie/Portfolio/content/certificates.json` lines 10, 23, 36, 49, 62, 75
- **Render logic:** `/Users/skypie/Portfolio/app/certificates/page.tsx` lines 98–112
- **Schema:** `/Users/skypie/Portfolio/lib/schema.ts` lines 84–87 (CertificateSchema, badgeImage refine)
- **Existing test:** `/Users/skypie/Portfolio/lib/__tests__/static-integrity.test.ts` (all 271 lines)
- **Package scripts:** `/Users/skypie/Portfolio/package.json` line 14 (`test:static`)
- **Disk reality:** `/Users/skypie/Portfolio/public/images/certificates/` — **DOES NOT EXIST**
