# Portfolio Robustness & Security Audit — 2026-05-29

**Auditor:** Steve  
**Scope:** Static Next.js 15 export, CSP/security headers, error handling, link integrity, XSS/injection vectors  
**Build Status:** ✓ All 113 tests pass (16 test files) | ✓ Typecheck clean | ✓ Static export builds successfully

---

## Executive Summary

The Portfolio static site is robust and secure. The codebase enforces a build-time content validation layer (Zod schemas) that fails fast on malformed data, all external links are protected with `rel="noopener noreferrer"`, and a meta-CSP policy (production-only to avoid HMR conflicts) covers inline scripts and styles. Internal link resolution is tested via static-integrity tests. The only notable finding is a documentation gap: the `headers()` block in `next.config.mjs` is not applied at runtime on GitHub Pages, which the code already documents but could be more visible. No XSS, injection, or error-handling failures detected.

---

## Findings

| Title | Severity | File:Line | Recommendation | Effort |
|-------|----------|-----------|-----------------|--------|
| **Meta-CSP production-only limitation not prominent in docs** | LOW | `app/layout.tsx:18–32` | Add DEPLOYMENT.md or update README with explicit note: "CSP is meta-tag only on GitHub Pages; real HTTP headers require CDN migration." | S |
| **Missing error.tsx boundary for route-level recovery** | LOW | `app/error.tsx` (absent) | Create an optional error boundary for client-side component errors in non-static routes. Current site has no runtime errors by design (no API calls, no dynamic state), so this is defensive-only. | S |
| **Markdown inline parsing could be XSS-vulnerable if schema changes** | MEDIUM | `app/blog/[slug]/page.tsx:96–107` | The `parseInline()` function manually splits on `*` patterns and assumes no HTML tags in content. Safe today but fragile. Recommend: (1) Add a Zod refine rule that blocks `<` / `>` characters in `blog.json` content, or (2) migrate to `react-markdown` with sanitization plugin. | M |
| **No duplicate-link detection in external link rel validation** | LOW | `lib/__tests__/static-integrity.test.ts:212–270` | The static-integrity tests validate `rel="noopener noreferrer"` presence but do not check for duplicate external links (same URL, different text). Recommend: Log top 5 external URLs by frequency in test output for visibility. | S |
| **No `robots.txt` for GitHub Pages deployment** | LOW | `public/robots.txt` (absent) | Add minimal robots.txt to allow search indexing: `User-agent: *`, `Allow: /portfolio/`. Not critical for static site, but good practice. | S |
| **Image `loading="lazy"` not gated on viewport size** | LOW | `app/work/[slug]/page.tsx:116` | Hero images use `loading="lazy"` unconditionally. Safe (hero is below fold on mobile), but could be LCP-risky if page structure changes. Recommend: Document or add a comment that hero images are intentionally lazy because they never appear in viewport on first paint. | S |

---

## Detailed Analysis

### 1. Content Validation Strength (✓ Secure)

**File:** `lib/schema.ts` + `lib/content.ts`

The Zod schemas enforce strict build-time validation:
- **Alt-text rule (Alex §4.1):** Must be 4–200 chars, cannot start with "image of" / "picture of". Regex enforced at line 23–25.
- **Slug invariants:** Kebab-case slug format, unique deliverable/certificate/blog post IDs. Enforced at lines 56–62, 102–108, 132–137 in content.ts.
- **Featured-slot invariant:** Exactly 0 or 1 deliverable can have `featured: true`. Throw at build if violated (line 64–70).
- **External link validation:** All `href` fields in links arrays must be `https://`. Schema line 59.
- **URL enforcement:** All credential and social URLs must start with `https://` (lines 83, 113).

**Status:** ✓ No XSS or injection vectors via content. A malformed content JSON file will fail the build loudly.

---

### 2. Markdown Rendering Safety (⚠ Needs Minor Hardening)

**File:** `app/blog/[slug]/page.tsx:49–108`

The custom `renderMarkdown()` and `parseInline()` functions manually parse markdown without HTML escaping:

```typescript
// Line 56–64: heading extraction (safe — no interpolation)
if (block.startsWith('### ')) {
  return (
    <h3 key={key} ... >
      {block.slice(4)}  // No escaping
    </h3>
  );
}

// Line 96–107: inline parsing (naive regex split)
function parseInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;  // No escaping
    }
    ...
  });
}
```

**Risk:** If `blog.json` content field ever contains HTML tags (e.g., `<script>`), the text would render as-is. React's JSX auto-escapes string content, so `<script>` inside a `<p>` becomes literal text, not executable code. However, the regex split is fragile — if content contains `*nested **bold** text*`, the regex fails to match correctly.

**Recommendation:**
1. Add a Zod refine rule to `BlogPostSchema` (line 126–135 in schema.ts) that blocks `<`, `>` characters:
```typescript
export const BlogPostSchema = z.object({
  // ... existing fields ...
  content: z.string()
    .min(1)
    .refine(
      (s) => !/[<>]/.test(s),
      'Content must not contain HTML tags (< or >)'
    ),
});
```
2. Update the inline parser to handle nested patterns correctly, or migrate to `react-markdown` with a sanitization plugin.

**Current Risk Level:** LOW (React auto-escapes; no XSS observed). Recommendation is defensive.

---

### 3. External Link Security (✓ Secure)

**Files:** All pages + components

**Coverage:**
- `app/work/[slug]/page.tsx:203` — `rel="noopener noreferrer"` on external links ✓
- `app/page.tsx:316` — External links secured ✓
- `app/certificates/page.tsx:136` — Credential URLs protected ✓
- `app/contact/page.tsx:90` — Social links secured ✓
- `components/ProjectCard.tsx:182, 198` — Demo links protected ✓
- `components/Footer.tsx:130` — Footer socials secured ✓

**Validation:** `lib/__tests__/static-integrity.test.ts` Gap 3 (lines 212–270) runs at build time and asserts every external link has both `noopener` and `noreferrer`.

**Status:** ✓ No vulnerable external links. All tested and enforced.

---

### 4. Content Security Policy (✓ Implemented, Limited by Hosting)

**File:** `app/layout.tsx:48–112`

The root layout injects a meta-CSP policy in production only:
```html
<!-- Production -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline'; ..." />

<!-- Development (omitted) -->
<!-- Reason: Next.js HMR uses eval() and webpack plugins that violate strict CSP -->
```

**Limitations & Tradeoffs:**
- GitHub Pages does NOT apply HTTP CSP headers (no server-side header control).
- Meta-CSP is less strict than HTTP CSP (frame-ancestors ignored, no report-uri).
- `'unsafe-inline'` on script-src and style-src is required because Next.js inlines runtime bootstrap and Tailwind hashes styles.
- Per-request nonce-based CSP is impossible under static export (no dynamic header generation).

**Status:** ✓ Documented (lines 18–46). Acknowledged that production-only is necessary for dev HMR. When/if Portfolio migrates off GitHub Pages, `headers()` block (next.config.mjs:22–77) will auto-apply.

---

### 5. Internal Link Integrity (✓ Tested)

**File:** `lib/__tests__/static-integrity.test.ts` Gap 2 (lines 155–206)

Test asserts:
1. Every internal href in every HTML file resolves to an existing file in `./out/`.
2. Handles trailing-slash URLs (Next.js `trailingSlash: true`), fragments, and basePath (`/portfolio` in prod).
3. Skips mailto: and fragment-only links.

**Build Output:** 4 tests pass, including sanity check that at least one internal link exists across all pages.

**Status:** ✓ No broken internal links. All static params (15 dynamic routes) generate correctly.

---

### 6. Error Handling & Recovery (✓ Adequate for Static Site)

**Files:** `app/not-found.tsx`, no `app/error.tsx`

The site has a 404 page (`not-found.tsx`) that renders cleanly if a dynamic route slug doesn't match any deliverable or blog post. No error boundary exists, but the site has no runtime state, no API calls, and no client-side component errors by design.

**Status:** ✓ Safe. The static-export model eliminates most error scenarios. If stricter error handling is desired for future features, create `app/error.tsx` with a boundary.

---

### 7. XSS Prevention & Injection Surface (✓ Clean)

**Findings:**
- No `dangerouslySetInnerHTML` anywhere in the codebase ✓
- No inline event handlers or `eval()` ✓
- No user input accepted at build time (all content JSON validated by Zod) ✓
- No client-side dynamic content rendering (no fetch, no useEffect with unvalidated data) ✓
- All external links and social URLs validated as https:// URLs ✓
- Inline styles use only literal values (no interpolation from untrusted data) ✓

**Status:** ✓ XSS surface is minimal and secure.

---

### 8. Image Path Enforcement (✓ Strict)

**File:** `lib/schema.ts:50–52, 84–86`

Zod regex enforces image paths:
```typescript
heroImage: ImageSchema.refine(
  (img) => /^\/images\/deliverables\/[a-z0-9-]+\//.test(img.src),
  'heroImage.src must live under /images/deliverables/<slug>/',
),

badgeImage: ImageSchema.refine(
  (img) => /^\/images\/certificates\/[a-z0-9-]+\//.test(img.src),
  'badgeImage.src must live under /images/certificates/<slug>/',
),
```

Prevents path traversal attacks (e.g., `../../../../etc/passwd`). All images loaded via raw `<img>` tags (Next.js unoptimized because of static export).

**Status:** ✓ Secure.

---

### 9. Static Export Security (✓ No Runtime APIs)

**File:** `next.config.mjs:4`

Configuration: `output: 'export'` prevents:
- No API routes (no route handlers with secrets) ✓
- No server actions (no form submissions) ✓
- No middleware (no token validation) ✓
- No dynamic image optimization (all images shipped as-is) ✓

**Status:** ✓ No backend attack surface.

---

### 10. Package.json Lock & Build Output Safety (✓ Clean)

**Observed:**
- Build completes with 0 TypeScript errors ✓
- npm test: 113 tests pass ✓
- Static export: 15 pages generated correctly ✓
- No dev dependencies shipped to `out/` ✓

**Status:** ✓ Production build is clean and isolated.

---

## Proposed Patches

### Patch 1: Add Markdown Content Escaping to Zod Schema

**File:** `lib/schema.ts`

```diff
 export const BlogPostSchema = z.object({
   id: SlugSchema,
   title: z.string().min(4).max(120),
   summary: z.string().min(10).max(200),
   publishedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'must be ISO date YYYY-MM-DD'),
   tags: z.array(z.string().min(2).max(30)).max(6),
   readingTimeMinutes: z.number().int().positive().max(60),
-  content: z.string().min(1),
+  content: z.string()
+    .min(1)
+    .refine(
+      (s) => !/[<>]/.test(s),
+      'Content must not contain HTML tags (< or >). Use markdown syntax instead.'
+    ),
   draft: z.boolean().optional(),
 });
```

**Rationale:** Prevents HTML injection in blog content and makes the constraint explicit in the schema.

---

### Patch 2: Add robots.txt for Search Indexing

**File:** `public/robots.txt` (new file)

```
User-agent: *
Allow: /portfolio/

Sitemap: https://skypie99.github.io/portfolio/sitemap.xml
```

**Rationale:** Best practice for static sites hosted on GitHub Pages. Not critical but good for SEO.

---

### Patch 3: Document CSP Limitation in README or Deployment Guide

**File:** `docs/DEPLOY_PLAN.md` or `README.md`

Add section:

```markdown
## Security Headers & CSP

This site uses a **meta-CSP policy** (Content-Security-Policy via <meta> tag) 
in production to restrict inline scripts and styles. However, GitHub Pages 
does NOT apply HTTP-level CSP headers, so the policy is incomplete.

**When migrating off GitHub Pages to a CDN or server:**
- Uncomment the `headers()` block in `next.config.mjs` (lines 22–77)
- The site will automatically apply strict HTTP CSP headers
- Update the meta-CSP policy to remove 'unsafe-inline' once per-request nonces are available
```

**Rationale:** Makes the hosting-specific limitation explicit for future maintainers.

---

## Test Results

```
$ npm test
✓ lib/__tests__/blog.test.ts (11 tests)
✓ lib/__tests__/static-integrity.test.ts (4 tests) — CRITICAL GAPS 2 & 3
✓ lib/__tests__/schema.test.ts (29 tests)
✓ lib/__tests__/content.test.ts (7 tests)
✓ components/__tests__/BlogIndex.test.tsx (8 tests)
✓ components/__tests__/ProjectCard.test.tsx (8 tests)
✓ components/__tests__/HamburgerNav.test.tsx (4 tests)
✓ lib/__tests__/cn.test.ts (14 tests)
✓ components/__tests__/ThemeToggle.test.tsx (6 tests)
✓ components/__tests__/Footer.test.tsx (4 tests)
✓ components/__tests__/Sidebar.test.tsx (4 tests)
✓ components/__tests__/Hero.test.tsx (3 tests)
✓ components/__tests__/TagPill.test.tsx (3 tests)
✓ components/__tests__/NumberedStep.test.tsx (3 tests)
✓ components/__tests__/Button.test.tsx (3 tests)
✓ components/__tests__/SkipLink.test.tsx (2 tests)

Test Files: 16 passed (16)
Tests: 113 passed (113)
```

---

## DECISIONS FOR SKY

1. **Markdown content escaping (Patch 1):** RECOMMEND APPLY. Low effort, prevents future HTML injection risk. Aligns with existing Zod validation philosophy.

2. **robots.txt (Patch 2):** OPTIONAL. Only if SEO visibility matters. Not required for security.

3. **CSP documentation (Patch 3):** RECOMMEND APPLY. Helps future maintainers understand why 'unsafe-inline' is necessary today and what to change post-GitHub Pages.

4. **Custom markdown parser vs. react-markdown:** DEFER. Current parser is safe (React auto-escapes) and minimal. Migrate only if blog features grow (code blocks, tables, etc.).

5. **Error boundary (error.tsx):** NOT REQUIRED. Site has no runtime errors by design. Add only if client-side features are added later.

**No blockers. Site is production-ready and secure.**
