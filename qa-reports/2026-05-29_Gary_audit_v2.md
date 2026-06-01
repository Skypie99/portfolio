# Gary — Portfolio Static Integrity Audit v2

**Date:** 2026-05-29  
**Project:** Portfolio (static Next.js 15 → GitHub Pages)  
**Status:** AUDIT COMPLETE — 1 CRITICAL GAP IDENTIFIED

---

## Summary

The portfolio's static-integrity test suite (Gap 2: Internal Link Resolution, Gap 3: External Link rel Attributes) is **fully implemented and passing**. However, a **critical missing-file gap** exists: the `content/certificates.json` references six badge images under `/images/certificates/*/badge.png`, but those image files do **not exist in `public/images/`**. This will cause broken image displays on the deployed site despite the schema validating the paths. Additionally, a structural test gap exists: **no test verifies that all content-referenced images actually exist in the static export**.

---

## Findings

| Title | Severity | File:Line | Recommendation | Effort |
|-------|----------|-----------|-----------------|--------|
| **Missing certificate badge images** | **critical** | `content/certificates.json:9,23,36,49,62,75` | Create missing directories `public/images/certificates/*/` and add placeholder or real badge PNGs. Schema validates paths but does not validate file existence — images will fail to load on the site. | **M** |
| **No image-existence validation test** | **high** | `lib/__tests__/static-integrity.test.ts` | Add Gap 4 test: "All images referenced in content JSON files exist in the static build (`./out/`)". Should validate `deliverables.json` heroImage+gallery paths and `certificates.json` badgeImage paths. | **M** |
| **No form submission validation** | **medium** | `app/contact/page.tsx` | Contact form uses client-side `<form>` (no action) — add test verifying form structure, required fields, and mailto: link validity if present. | **S** |
| **Blog post route coverage incomplete** | **medium** | `lib/__tests__/static-integrity.test.ts` | Static-integrity test suite does NOT verify that dynamic routes (`/blog/[slug]` and `/work/[slug]`) have HTML files for all published slugs. Add test for route param coverage. | **M** |

---

## Detailed Findings

### 1. Missing Certificate Badge Images (CRITICAL)

**Status:** ❌ Files do not exist  
**Files affected:** All 6 certificates in `content/certificates.json`

The `certificates.json` file defines six certificates, each with a `badgeImage.src` pointing to a PNG under `/images/certificates/`:

```json
"badgeImage": {
  "src": "/images/certificates/anthropic-ai-fluency-2026/badge.png",
  "alt": "Anthropic AI Fluency Framework & Foundations credential badge"
}
```

**The Problem:**  
- ✅ Schema validates the path format at build time (regex: `/^\/images\/certificates\/[a-z0-9-]+\/.*/)
- ❌ **No actual file exists** at `public/images/certificates/anthropic-ai-fluency-2026/badge.png` or any of the other 5 paths
- ❌ The site builds successfully (schema only validates format, not existence)
- ❌ On GitHub Pages, certificate badges will fail to load → 404 images → broken UI

**Root cause:** The schema enforces path *format* but not file *existence*. This is a valid design (schemas don't do filesystem checks), but it means **content editors can create dead image references that pass validation but break at runtime**.

**Files to create:**
- `public/images/certificates/anthropic-ai-fluency-2026/badge.png`
- `public/images/certificates/anthropic-cowork-intro-2026/badge.png`
- `public/images/certificates/anthropic-claude-101-2026/badge.png`
- `public/images/certificates/google-prompting-essentials-2025/badge.png`
- `public/images/certificates/umich-python-2025/badge.png`
- `public/images/certificates/deeplearning-ai-for-everyone-2025/badge.png`

---

### 2. No Image-Existence Validation Test (HIGH)

**Status:** ❌ Gap exists  
**Current test coverage:** 4 tests in static-integrity.test.ts
- ✅ Gap 2: Internal link resolution (HTML <a> hrefs)
- ✅ Gap 3: External link rel attributes
- ❌ Gap 4: Image file existence (missing)

**The Problem:**  
The static-integrity suite validates *links* but not *images*. All images referenced in content JSON files should exist in the static build output (`./out/`). Currently, if an image path is added to `content/deliverables.json` or `certificates.json` but the actual file is missing, no test will catch it — the build will succeed, and the site will ship broken.

**Proposed test structure:**

```typescript
// Gap 4 — Image file existence
describe('Gap 4 — image file existence', () => {
  it('all images referenced in content JSON files exist in ./out/', () => {
    assertOutDirExists();

    // Load deliverables + certificates
    const deliverables = getDeliverables();
    const certificates = getCertificates();

    const missingImages: Array<{ source: string; path: string }> = [];

    // Check deliverable hero images + galleries
    for (const d of deliverables) {
      const heroPath = resolveImagePath(d.heroImage.src);
      if (!existsSync(heroPath)) {
        missingImages.push({ source: `deliverables.json[${d.id}].heroImage`, path: d.heroImage.src });
      }

      if (d.gallery) {
        for (const img of d.gallery) {
          const galleryPath = resolveImagePath(img.src);
          if (!existsSync(galleryPath)) {
            missingImages.push({ source: `deliverables.json[${d.id}].gallery`, path: img.src });
          }
        }
      }
    }

    // Check certificate badge images
    for (const c of certificates) {
      const badgePath = resolveImagePath(c.badgeImage.src);
      if (!existsSync(badgePath)) {
        missingImages.push({ source: `certificates.json[${c.id}].badgeImage`, path: c.badgeImage.src });
      }
    }

    if (missingImages.length > 0) {
      const report = missingImages
        .map((m) => `  [${m.source}] → ${m.path} not found in ./out/`)
        .join('\n');
      expect.fail(`${missingImages.length} missing image(s):\n${report}`);
    }
  });

  it('finds at least one image across all content (sanity check)', () => {
    const deliverables = getDeliverables();
    const totalImages = deliverables.reduce((sum, d) => {
      return sum + 1 + (d.gallery?.length ?? 0);
    }, 0);
    expect(totalImages).toBeGreaterThan(0);
  });
});
```

**Effort:** M (2–3 hours) — needs image path resolution logic, integration with content loaders, reporting.

---

### 3. No Form Submission Validation (MEDIUM)

**Status:** ⚠️ Incomplete coverage  
**File:** `app/contact/page.tsx`

The contact page renders a form with a mailto: link button, but there's no test verifying:
- Form structure and required fields (name, email, message)
- mailto: link is valid and properly escaped
- Form is accessible (labels, ARIA attributes)

**Proposed test case:**

```typescript
// In components/__tests__/ContactForm.test.tsx (new file)
describe('ContactForm', () => {
  it('renders a form with required fields', () => {
    // Test that <input name="email">, <textarea name="message">, etc. exist
    // Test that labels are associated with inputs
  });

  it('mailto: link is properly formatted', () => {
    // Extract mailto: href
    // Verify it includes subject, body encoding, and recipient email
    // Verify special chars are URL-encoded
  });

  it('form fields have ARIA attributes for accessibility', () => {
    // Test aria-label, aria-required, aria-describedby present
  });
});
```

**Effort:** S (1–2 hours) — component tests using @testing-library/react.

---

### 4. Dynamic Route Coverage Not Tested (MEDIUM)

**Status:** ⚠️ Incomplete coverage  
**File:** `lib/__tests__/static-integrity.test.ts`

The current Gap 2 (internal link resolution) tests that links *resolve to files*, but it does **not verify that all dynamic routes have matching HTML files**. For example:
- `/work/[slug]` should generate HTML files for *all* deliverable slugs
- `/blog/[slug]` should generate HTML files for *all* published blog post slugs

If a deliverable or blog post is defined in JSON but the static params generation breaks, the link might be broken or the route might not render.

**Current test:** Checks that links in HTML point to existing files (reactive)  
**Missing test:** Verifies that all content IDs have corresponding static HTML files (proactive)

**Proposed test case:**

```typescript
// In static-integrity.test.ts
describe('Gap 5 — dynamic route coverage', () => {
  it('all deliverable slugs have corresponding /work/[slug]/index.html files', () => {
    assertOutDirExists();

    const deliverables = getDeliverables();
    const missing: string[] = [];

    for (const d of deliverables) {
      const slugPath = join(OUT_DIR, 'work', d.id, 'index.html');
      if (!existsSync(slugPath)) {
        missing.push(`/work/${d.id}/`);
      }
    }

    if (missing.length > 0) {
      expect.fail(
        `${missing.length} deliverable(s) missing HTML files:\n` +
        missing.map((p) => `  ${p}`).join('\n')
      );
    }
  });

  it('all published blog post slugs have corresponding /blog/[slug]/index.html files', () => {
    assertOutDirExists();

    const posts = getBlogPosts();
    const missing: string[] = [];

    for (const p of posts) {
      const slugPath = join(OUT_DIR, 'blog', p.id, 'index.html');
      if (!existsSync(slugPath)) {
        missing.push(`/blog/${p.id}/`);
      }
    }

    if (missing.length > 0) {
      expect.fail(
        `${missing.length} blog post(s) missing HTML files:\n` +
        missing.map((p) => `  ${p}`).join('\n')
      );
    }
  });
});
```

**Effort:** M (1–2 hours) — adds test logic to static-integrity.test.ts, requires importing content loaders.

---

## Proposed Patch

### Immediate Fix: Add Missing Image Directories

Create the six missing certificate badge image directories:

```bash
mkdir -p public/images/certificates/{anthropic-ai-fluency-2026,anthropic-cowork-intro-2026,anthropic-claude-101-2026,google-prompting-essentials-2025,umich-python-2025,deeplearning-ai-for-everyone-2025}
```

Then add placeholder or real badge PNGs to each directory. For now, a single blank/placeholder PNG in each location will unblock the build.

### Test Enhancement: Add Gap 4 (Image Existence)

Diff to add to `lib/__tests__/static-integrity.test.ts`:

```typescript
// Add at the top after existing imports
import { getDeliverables, getCertificates } from '@/lib/content';

// Add this function after existing helpers
function resolveImagePath(imageSrc: string): string {
  // Remove leading / and resolve relative to ./out/
  const relativePath = imageSrc.startsWith('/') ? imageSrc.slice(1) : imageSrc;
  return join(OUT_DIR, relativePath);
}

// Add this describe block after Gap 3
describe('Gap 4 — image file existence', () => {
  it('all images referenced in content JSON files exist in ./out/', () => {
    assertOutDirExists();

    const deliverables = getDeliverables();
    const certificates = getCertificates();
    const missing: Array<{ source: string; path: string }> = [];

    // Check deliverable images
    for (const d of deliverables) {
      const heroPath = resolveImagePath(d.heroImage.src);
      if (!existsSync(heroPath)) {
        missing.push({ source: `deliverables[${d.id}].heroImage`, path: d.heroImage.src });
      }

      if (d.gallery) {
        for (let i = 0; i < d.gallery.length; i++) {
          const galleryPath = resolveImagePath(d.gallery[i].src);
          if (!existsSync(galleryPath)) {
            missing.push({
              source: `deliverables[${d.id}].gallery[${i}]`,
              path: d.gallery[i].src,
            });
          }
        }
      }
    }

    // Check certificate images
    for (const c of certificates) {
      const badgePath = resolveImagePath(c.badgeImage.src);
      if (!existsSync(badgePath)) {
        missing.push({ source: `certificates[${c.id}].badgeImage`, path: c.badgeImage.src });
      }
    }

    if (missing.length > 0) {
      const report = missing
        .map((m) => `  [${m.source}] → ${m.path}`)
        .join('\n');
      expect.fail(`${missing.length} missing image(s):\n${report}`);
    }
  });

  it('finds at least one content-referenced image (sanity check)', () => {
    assertOutDirExists();

    const deliverables = getDeliverables();
    const certificates = getCertificates();

    let imageCount = deliverables.length; // at least one hero per deliverable
    imageCount += deliverables.reduce((sum, d) => sum + (d.gallery?.length ?? 0), 0);
    imageCount += certificates.length; // at least one badge per certificate

    expect(imageCount).toBeGreaterThan(0);
  });
});
```

---

## Summary Table

| Gap | Status | Coverage | Effort | Blocker |
|-----|--------|----------|--------|---------|
| **Gap 2: Internal Links** | ✅ PASS | 2 tests: link resolution + sanity check | — | No |
| **Gap 3: External rel attrs** | ✅ PASS | 2 tests: rel validation + sanity check | — | No |
| **Gap 4: Image Existence** | ❌ MISSING | 0 tests | M | **Yes (certificates)** |
| **Gap 5: Dynamic Routes** | ⚠️ PARTIAL | Gap 2 checks links, not coverage | M | No (defensive) |
| **Form Validation** | ❌ MISSING | 0 tests | S | No (UX-only) |

---

## DECISIONS FOR SKY

1. **CRITICAL — Image files must be created immediately** before any deployment. The six certificate badge images referenced in `content/certificates.json` do not exist. They will fail to load on the live site.

2. **Gap 4 (image existence test) should be added to prevent future regressions** — the current test suite validates image path *format* (via Zod) but not *existence* (via filesystem). A single missing image file can pass the build and break the site.

3. **Gap 5 (dynamic route coverage) is defensive** — if `generateStaticParams` is working correctly, all routes will be rendered. However, adding this test catches breakage in the params generation logic before deployment.

4. **Form validation test (Gap X) is nice-to-have** — the contact form is simple (mailto: link button), but a test suite covering form structure + accessibility would improve confidence in the form's actual functionality.

5. **Test count will increase from 4 to 6–7** in `static-integrity.test.ts` (2 new Gap 4 tests + optionally 2 new Gap 5 tests) → expect `npm test` to report ~117–119 tests passing (up from current 113).

---

## Next Steps

1. **Sky creates missing image directories and adds placeholder badge PNGs** (`public/images/certificates/*/badge.png`)
2. **Gary implements Gap 4 test** and confirms it passes with the new images in place
3. **Optional: Implement Gap 5 test** for dynamic route coverage
4. **Run full test suite:** `npm test` + `npm run test:static` → all green
5. **Push to feature branch** (not main) and mark task complete

**QA Sign-off:** ✅ Ready for Shamus merge review once images are in place.
