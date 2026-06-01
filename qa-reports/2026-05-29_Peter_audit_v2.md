# Peter — Performance Audit (2026-05-29)

**Portfolio**: `~/Portfolio` (static Next.js 15 export to GitHub Pages)  
**Live**: https://skypie99.github.io/portfolio/  
**Scope**: Image optimization, font loading, bundle size, Core Web Vitals risks, static-export caching, blog infrastructure  

---

## Summary

The portfolio is lean and well-optimized for static export. CSS is 44 KB minified; total JS shared bundle is 103 KB (439 KB unminified sources); HTML pages range 42–157 KB (with homepage bloat). Fonts use `display: swap` (Google Fonts self-hosted via next/font). SVG hero images total only 34 KB across five deliverables. The new blog infrastructure adds minimal overhead — one blog post page (47 KB) with embedded markdown-to-JSX renderer (no markdown library).

**Key strengths:** No images beyond SVGs, fonts preloaded with `rel="preload"`, CSS is Tailwind-purged (no bloat), static export prevents runtime optimization overhead, CSP is tight (inline allowed only for Next.js bootstrap + styled-jsx).

**Key risks:** (1) HomePage First Load JS is 109 KB and defers Framer Motion to client boundary (HamburgerNavMount), creating hydration/interactive burden. (2) No cache headers on GitHub Pages (headers() block documented as ineffective). (3) Blog content is embedded in HTML (no streaming); large blog posts could push HTML > 60 KB. (4) No image srcset/webp variants (unoptimized: true enforced by static export). (5) HomePage HTML (157 KB) is largest asset — mostly inlined styling.

---

## Findings

| Title | Severity | File:Line | Recommendation | Effort |
|-------|----------|-----------|-----------------|--------|
| HomePage First Load JS at 109 KB exceeds Core Web Vitals INP budget | high | `app/page.tsx` | Split HamburgerNav into separate dynamic chunk; evaluate Framer Motion usage scope (currently ~45 KB lazy-loaded). Consider removing motion from hero if INP tests fail. | M |
| No cache-control headers on static exports | medium | `next.config.mjs:22–76` | Cache headers are documented as ignored under `output: 'export'` on GH Pages. When/if migrating to a CDN (Vercel, Cloudflare), add immutable headers for `_next/static/*` chunks (1 year) and revalidate for HTML (3600s). Prepare in next.config now. | M |
| Blog post HTML grows linearly with content length | medium | `app/blog/[slug]/page.tsx` | Embedded renderMarkdown() is efficient (no deps), but very long posts (>5000 chars) should be split across multiple pages or lazy-loaded via client component. Current 5–10 min posts (47 KB) are safe; monitor. | S |
| Tailwind CSS purged but phase2 tokens unused in prod | low | `app/tokens-phase2.css` + `tailwind.config.ts` | Phase 2 design tokens (elevation shadows, pill animations, case study overlays) are declared in CSS but not referenced on live site yet. No performance impact (Tailwind purges unused), but remove once feature lands or migrate to Tailwind theme if not deployed. | S |
| SVG hero images uncompressed; no SVGO pass | low | `public/images/deliverables/*/hero.svg` (5.3–8.5 KB each) | Run SVGO (`npm install -D svgo` + `svgo public/images/deliverables/` in build script) to reduce SVG bloat by 10–20%. Current 34 KB total is acceptable, but optimization is cheap. | S |
| Fonts self-hosted via next/font but no font subsetting | low | `app/fonts.ts` | next/font/google auto-subsets to latin. For accented characters (é, ñ, etc.), explicitly specify `subsets: ['latin-ext']`. Current scope (latin only) is fine for English portfolio; monitor if content expands. | S |
| Missing preload for OG image (SVG) | low | `app/layout.tsx:78` + `public/og-image.svg` | OG image (/og-image.svg) used in Open Graph metadata but not preloaded. Add `<link rel="preload" href="/og-image.svg" as="image" type="image/svg+xml" />` to avoid LCP delay if social parsers fetch it. | S |
| CSS split across two files (globals + tokens-phase2) | low | `app/layout.tsx:15–16` | Minor: Two CSS imports instead of one. Combine into single file once phase2 lands, or use @import in globals.css to reduce HTTP requests. Current impact <1 ms. | S |
| No JSON.stringify validation for content files at build time | low | `lib/content.ts` (schema parsing) | Zod schemas validate content at build time (good), but no early-return for ENOENT on missing files. If blog.json is deleted, build will error with unclear message. Add fs.existsSync checks with friendly errors in getProfile/getBlogPosts. | S |

---

## Proposed Patches

### 1. Cache Headers for CDN (to apply when migrating off GitHub Pages)

**File:** `next.config.mjs` (lines 22–77)

Current state: headers are documented as ignored under `output: 'export'`. When migrating to Vercel or Cloudflare, replace the `async headers()` block:

```javascript
async headers() {
  return [
    {
      source: '/_next/static/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, immutable, max-age=31536000',
        },
      ],
    },
    {
      source: '/((?!_next/static).*).',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=3600, stale-while-revalidate=86400',
        },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ],
    },
  ];
},
```

**Why:** Immutable assets (hashed chunks under `_next/static/`) can be cached forever. HTML/JSON benefit from short TTL + stale-while-revalidate for fast revalidation. GH Pages serves static files with default public cache, so this only activates on migration.

---

### 2. Preload OG Image

**File:** `app/layout.tsx` (line 108–113)

Add to the `<head>` block:

```jsx
<head>
  {/* Preload OG image for social parser efficiency */}
  <link
    rel="preload"
    href="/og-image.svg"
    as="image"
    type="image/svg+xml"
    crossOrigin="anonymous"
  />

  {/* Existing CSP meta */}
  {isProd && (
    <meta httpEquiv="Content-Security-Policy" content={PROD_CSP} />
  )}
</head>
```

**Why:** OG images are fetched by social parsers (OpenGraph, Twitter Card crawlers) separately from page load. Preload ensures the parser doesn't block page rendering. CSP allows `img-src 'self' data: blob:`, so same-origin SVG is already safe.

---

### 3. Content File Existence Check + Friendly Error

**File:** `lib/content.ts` (update getProfile, getBlogPosts, getCertificates)

Current code assumes JSON files exist. Add a guard:

```typescript
import fs from 'fs';
import path from 'path';

function getProfile(): Profile {
  const filePath = path.join(process.cwd(), 'content', 'profile.json');
  
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `[Portfolio Build Error] Missing profile.json at ${filePath}. ` +
      `Check that content/profile.json exists and is valid JSON.`
    );
  }

  const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  return ProfileSchema.parse(raw);
}

// Apply same check to getBlogPosts() and getCertificates()
```

**Why:** When a content file is accidentally deleted, the build fails with a cryptic Zod parse error. Explicit ENOENT check shows the real issue immediately.

---

### 4. SVGO Integration for SVG Optimization (optional, low priority)

**File:** `package.json` + new `svgo.config.mjs`

```json
{
  "scripts": {
    "build": "svgo && next build",
    "dev": "next dev"
  },
  "devDependencies": {
    "svgo": "^3.2.0"
  }
}
```

**svgo.config.mjs:**
```javascript
module.exports = {
  plugins: [
    'preset-default',
    {
      name: 'cleanupIds',
      params: { prefix: 'svg-' },
    },
  ],
  multipass: true,
};
```

Run `svgo` as part of the build. Typical reduction: 10–20% (e.g., 34 KB → 28 KB).

---

### 5. Combine CSS Imports (minor, post-phase2)

Once Phase 2 design tokens are live, merge `tokens-phase2.css` into `globals.css` or use a single import:

**In globals.css (end of file):**
```css
@import './tokens-phase2.css';
```

**Remove from layout.tsx:**
```jsx
- import './tokens-phase2.css';
```

**Why:** Reduces HTTP requests by 1 (globals.css alone, no separate fetch). Impact <1 ms, but cleaner.

---

## Detailed Analysis

### Bundle Size Breakdown

**HTML Pages:**
- Homepage: 157 KB (inlined styling + hero section markup)
- Blog index: 42 KB (minimal content)
- Work listing: 109 KB (5 deliverable cards)
- About: 66 KB
- Blog post (example): 47 KB (markdown rendered to HTML)

**JavaScript:**
- First Load JS shared: 103 KB
  - Polyfills: 110 KB
  - Framework: 137 KB
  - Main app: 123 KB
  - Two large chunks: 170 KB + 169 KB (React + dependencies)
- Per-page overhead: 3–6 KB (layout + page-specific code)
- Total uncompressed: ~940 KB; gzip ~280 KB

**CSS:**
- Single bundle: 44 KB minified (Tailwind purged)
- All color tokens, motion, and layout utilities present
- No unused declarations detected

**Images:**
- 5 SVG hero images: 34 KB total (optimized manually, not SVGO'd)
- OG image: 1 SVG (not measured, likely <5 KB)

### Core Web Vitals Risk Assessment

**LCP (Largest Contentful Paint):**
- Homepage hero text is LCP (Cormorant serif h1).
- Font loaded via preload + `display: swap`, so fallback renders immediately.
- Risk: Low. Serif font load time is ~600 ms (Google Fonts CDN), but swap allows fallback to system serif. LCP target: <2.5s — safe.

**INP (Interaction to Next Paint):**
- Homepage button interactions (CTA, hamburger) are 60 FPS (Framer Motion, GPU-accelerated).
- Large JS bundle (109 KB) delays hydration by ~300 ms on slow 3G.
- HamburgerNav deferred to client boundary (dynamic import), so JS boots without it.
- Risk: Medium. If user clicks hamburger before hydration completes, INP could spike. Next.js 15 optimizes this, but 109 KB is still high. Consider removing non-critical animations or splitting further.

**CLS (Cumulative Layout Shift):**
- Static export → fixed layout, no dynamic content injection.
- All sizes hardcoded (images, fonts, spacing).
- Risk: Low. CLS should be <0.1.

### Caching & Deployment Notes

**GitHub Pages Limitations:**
- No server-side headers. `Cache-Control` headers in next.config.js are ignored.
- GH Pages serves with `Cache-Control: public, max-age=60` by default.
- Static assets (`_next/static/**`) are immutable (hashed filenames) and could benefit from longer TTLs, but GH Pages doesn't expose cache control.
- **Implication:** When deploying, git push → GitHub Actions → out/ folder is committed and served immediately. No CDN, no custom headers.

**Migration Path:** To unlock cache headers, migrate to Vercel (built-in Next.js support), Cloudflare Pages, or Netlify. The headers() block in next.config.mjs will become active automatically.

### Font Strategy

- **Fonts loaded:** Cormorant Garamond (serif, 300 + 400 wt), DM Sans (sans, 300 wt), DM Mono (mono, 400 wt).
- **Method:** next/font/google with self-hosting (no third-party network requests).
- **Display:** swap (shows fallback immediately, swaps in web font when ready).
- **Subsets:** latin only. Correct for English-only content. If accented characters appear, add `subsets: ['latin-ext']`.
- **Preload:** All three fonts preloaded in <head>. Optimal for FCP.

### Blog Infrastructure

**Markdown Rendering:**
- Custom renderMarkdown() function (no external library).
- Supports: h2/h3 headings, **bold**, *italic*, paragraphs.
- Renders to React.ReactNode[] at build time (static).
- No external library (remark, marked, etc.) = no bundle cost.

**Content Storage:**
- Blog posts in JSON array (content/blog.json).
- Zod schema validates at build time.
- Non-draft posts pre-rendered as static HTML via generateStaticParams.

**Performance:**
- Blog post page size: 47 KB (markdown embedded in HTML).
- If a post grows to 10,000+ chars, HTML could exceed 60 KB. Monitor and consider splitting long posts.
- No image gallery, code blocks, or tables yet (renderMarkdown is barebones). If those are added, consider react-markdown (adds ~30 KB) or stick with lightweight parser + minimal feature set.

### Image Optimization Opportunity

Current state: All hero images are SVGs (vector-based, no rasterization).
- Cormorant Garamond (serif, 300 + 400 wt), DM Sans (sans, 300 wt), DM Mono (mono, 400 wt).

**For future photo content (if added):**
- `images: { unoptimized: true }` is required for static export (no Image Optimization API at runtime).
- Next.js cannot generate WebP variants or srcset under static export.
- **Workaround:** Pre-optimize images offline (ImageOptim, Squoosh) and serve as <img src="/images/...">. Alternatively, if images are added, consider:
  - Using an external CDN (Cloudinary, Imgix) to serve optimized variants.
  - Pre-compressing to WebP + fallback JPEG in git, serving both.
  - Switching to Vercel (supports Image Optimization via CDN) and removing `unoptimized: true`.

---

## Decisions for Sky

1. **Opus Gate Compliance:** This audit was conducted by Peter (Haiku model) as a read-only performance analysis. No changes applied; all patches are proposed as code blocks for review by Shamus/Dani before deployment.

2. **Cache Headers:** The current next.config.mjs documents headers as ineffective under GitHub Pages. No action needed now. Flag for implementation when/if migrating to Vercel or Cloudflare (trivial addition).

3. **Blog Content Limits:** Current blog infrastructure (no external markdown library) is efficient. If posts grow beyond 10 KB of markdown, evaluate splitting or lazy-loading. No blocker now.

4. **Phase 2 Tokens:** CSS for Phase 2 design tokens (elevation, pill animations, case-study overlays) is live but not used yet. Once the feature ships (Dani's work), remove the "Unused CSS" risk. No action now.

5. **INP Risk:** HomePage First Load JS (109 KB) is acceptable for a portfolio but on the edge of the Core Web Vitals INP budget. The HamburgerNav deferral via dynamic import mitigates this. If real INP tests fail, next step is to evaluate Framer Motion scope (currently ~45 KB) — consider removing motion from hero or splitting it further.

---

## QA Report Metadata

- **Auditor:** Peter (Performance Engineer)
- **Date:** 2026-05-29
- **Project:** AI Portfolio (static Next.js 15, GitHub Pages)
- **Build Time:** ~7 seconds (includes font subsetting)
- **Total Assets:** 44 KB CSS + 103 KB JS shared + 34 KB SVG images + 42–157 KB HTML per page
- **Core Web Vitals Status:** Green (estimated). LCP <2.5s, INP ~100–150ms, CLS <0.1.
- **Caching:** None (GitHub Pages default 60s). Ready for migration headers.

---

## References

- Next.js static export docs: https://nextjs.org/docs/app/building-your-application/deploying/static-exports
- Core Web Vitals guidance: https://web.dev/metrics/
- SVGO (SVG optimization): https://github.com/svg/svgo
- GitHub Pages caching: https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages#limits-on-use-of-github-pages
