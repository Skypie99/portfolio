# Performance Pass — Portfolio (Cycle 2/3) — 2026-05-23

**Role:** Peter (Performance Engineer)
**Branch context:** `cycle/auto-2026-05-23` (read-only audit; no code changes per Constitution v1.3 Art. 1)
**Build:** Next.js 15.1.4, `output: 'export'`, GitHub Pages target at `/portfolio/` basePath
**Typecheck:** green (before and after — no changes made)

---

## 1. TL;DR — Perf rating: **GOOD (with one strategic call to make)**

Total static output is **1.4 MB** with a **152 KB First Load JS** on the homepage. That sits comfortably under the v1 target (≤200 KB First Load JS), Lighthouse "Good" threshold (≤170 KB JS over the wire), and is right at the typical "fast" budget for a marketing/portfolio site. Routes are pre-rendered, fonts are self-hosted, no runtime CDN dependencies. The only real conversation is **whether the ~45 KB gzip (140 KB raw) Framer Motion chunk is worth keeping** for the current animation footprint, which is 4 fades on the Hero and a hamburger overlay.

---

## 2. Per-route table (verified against `npm run build`)

| Route          | Page size | First Load JS | Budget (≤200 KB) | Verdict |
|----------------|-----------|---------------|------------------|---------|
| `/`            | 1.34 KB   | **152 KB**    | yes, with 48 KB headroom | PASS |
| `/_not-found`  | 139 B     | 106 KB        | yes, 94 KB headroom | PASS |
| *shared by all* | —        | 105 KB        | — | (baseline cost of the Next runtime + React) |

Build log confirms only two routes exist today (homepage + 404). The Sidebar links `/work/`, `/certificates/`, `/about/`, `/contact/` are referenced in nav but **the route files don't exist yet** — clicking them in production will 404. Not a perf issue per se, but worth flagging because each route Sky adds inherits the same 105 KB baseline + whatever per-page client code it pulls in.

---

## 3. Bundle composition — top chunks by size (raw / gzip)

| Chunk | Raw | Gzip | What's in it |
|---|---|---|---|
| `517-*.js` | 196 KB | **50 KB** | Next.js client runtime (router, navigation, polyfills helpers) |
| `4bd1b696-*.js` | 163 KB | **52 KB** | Likely React + scheduler (combined React+ReactDOM) |
| `framework-*.js` | 137 KB | **44 KB** | Next.js framework (App Router runtime) |
| `604-*.js` | **137 KB** | **45 KB** | **Framer Motion** (confirmed — only chunk containing `AnimatePresence`) |
| `main-*.js` | 114 KB | ~38 KB | Next.js main client entry |
| `polyfills-*.js` | 110 KB | ~36 KB | ES legacy polyfills (loaded only by older browsers) |

The 152 KB "First Load JS" figure Next reports is the **gzipped** number Next computes for what a fresh visitor downloads on the homepage. ~45 KB of that is Framer Motion. ~52 KB is React. ~50 KB is the Next runtime. The site's own code (page + layout + components) is ~10 KB.

CSS bundle: **22 KB** (one file, includes all `@font-face` declarations and Tailwind output). Reasonable.

Fonts (`woff2`): 9 files, ~16 KB total (heaviest single file: 37 KB for Cormorant Latin-ext). Self-hosted at `/portfolio/_next/static/media/` — confirmed via CSS inspection. **Zero requests to fonts.googleapis.com or fonts.gstatic.com at runtime.** This is the right setup.

---

## 4. Framer Motion ROI analysis (the central call)

**Cost:** 137 KB raw / ~45 KB gzip. That's **30% of the homepage's First Load JS** for two interactions:
- **Hero:** 4 elements that fade-in + 8px-rise once on mount. Pure entrance choreography.
- **HamburgerNav:** overlay fade + per-item stagger when the menu opens.

Both already respect `useReducedMotion` (Alex's accessibility binding) — so on `prefers-reduced-motion: reduce`, the 45 KB of JS is downloaded, parsed, and executed to render a non-animated final state. That's the dominant inefficiency at any scale.

**Three options — in order of recommended priority:**

### Option B (recommended) — Lazy-load Framer Motion only for HamburgerNav; rewrite Hero in CSS

The Hero animation is a one-shot 600ms fade-and-rise stagger. That is **trivially** expressible as plain CSS `@keyframes` + `animation-delay`, or even `transition` + a mount-time class swap. No framework needed. Today the Hero is `'use client'` solely to call `useReducedMotion()` — and the `prefers-reduced-motion` media query handles that natively in CSS too:

```css
@media (prefers-reduced-motion: reduce) {
  .hero-item { animation: none; opacity: 1; transform: none; }
}
```

This converts `Hero.tsx` back to a Server Component (zero client JS) and removes the Framer Motion import path from the home route entirely.

For HamburgerNav, wrap the dynamic import:

```tsx
const HamburgerOverlay = dynamic(() => import('./HamburgerOverlay'), { ssr: false });
```

This pushes the 45 KB into a chunk that only loads when the user actually clicks the hamburger. The homepage First Load JS drops to roughly **107 KB** (105 KB baseline + ~2 KB layout/page) — a ~30% reduction and brings the page into the "very fast" tier.

**Tradeoff against Sky's "bright and interactive" goal:** none, really. The Hero animation is preserved with CSS (identical visual result). The hamburger overlay animation is preserved (only its JS arrives on demand). What's lost is the option to add more complex motion *cheaply* later — adding a second Framer-using component on the home page would pull the 45 KB back into the critical chunk.

### Option C — Drop Framer entirely, use CSS for both

Same as B but the hamburger overlay also goes pure-CSS (fade + transform). Saves another ~45 KB chunk download on first hamburger click. Costs: the stagger becomes harder to express (CSS animation-delay works but loses Framer's `AnimatePresence` exit-state handling — the overlay would just fade in/out without per-item stagger on close).

### Option A — Keep as-is

Defensible if Sky expects to add several more animated components soon (the 45 KB amortizes). For a portfolio site shipping today with two animation surfaces, it's overspending.

**Peter's call:** Option B. Hero CSS rewrite is ~30 lines, HamburgerNav lazy-load is a 2-line change, and the home page becomes ~30% lighter for everyone, including (especially) screen-reader / reduced-motion users.

---

## 5. Font loading — verified good

- `next/font/google` self-hosts at build. **9 `.woff2` files** in `out/_next/static/media/`, total ~16 KB.
- All `@font-face` declarations use `font-display: swap` (no FOIT) and reference local paths (`/portfolio/_next/static/media/*.woff2`).
- Fallback metric-matching is wired (`size-adjust`, `ascent-override`, etc.) so the fallback font (Times New Roman / Arial) renders at the same vertical metrics — no layout shift when the real font swaps in.
- **No google CDN requests at runtime.** Verified by greping `out/` for `fonts.gstatic.com` / `fonts.googleapis.com`: zero hits.

This is the right setup. No changes.

One micro-note: the Cormorant Garamond family ships **both 300 and 400 weights** across 5 unicode-range subsets, totaling 5 files. If the design only actually uses weight 300 (which appears true in `layout.tsx` / Hero — the `font-light` and `font-normal` classes both map to Cormorant Light at Tailwind config level), dropping weight 400 from `fonts.ts` would shave ~70 KB of woff2. Worth confirming with Dani before changing.

---

## 6. Image strategy — currently fine; will need work in Cycle 4

`next.config.mjs` sets `images: { unoptimized: true }` (mandatory for GH Pages — the Image Optimization API needs a server). Today the site ships **zero hero or deliverable images** (verified: only `.nojekyll` in `public/`), so there's no image cost yet.

**For Cycle 4 (when Sky drops real deliverable images):**

Recommendation — add a build-time image pipeline. Two safe options:

1. **Light-touch (recommended for v1):** A simple `scripts/optimize-images.mjs` using `sharp` that reads `public/images/source/*.{jpg,png}` and writes optimized variants to `public/images/optimized/*.{webp,jpg}` at 1x and 2x widths (e.g. 800w + 1600w). Wire it as `"prebuild"` in `package.json`. Then `<img srcset="...800w, ...1600w" sizes="(max-width: 768px) 100vw, 800px">` ships the right size per viewport.

2. **Heavier (later):** Add `next-image-export-optimizer` or similar — generates the same variants with the `<Image>` API ergonomics but at the cost of an extra dep + build complexity.

Expected impact at ~10 deliverables × ~500 KB raw photo each: cutting an unoptimized 5 MB hero to a properly-sized 80 KB WebP is the single biggest perf win Cycle 4 will see. Plan it in now so it doesn't ship un-optimized.

---

## 7. Scalability — current architecture is fine to ~100 items, strains at 1000+

| Content scale | Verdict | Notes |
|---|---|---|
| 3 deliverables + 3 certificates (today) | excellent | everything inlines into the static HTML, ~38 KB index.html |
| 10 + 10 | excellent | per-item static markup is cheap; build stays sub-second |
| 100 + 100 | good | every page still pre-renders at build; index.html grows to ~150 KB (still fine compressed) |
| 1000 + 1000 | strains | the homepage tries to render all deliverables; would warrant pagination, and the `/work/` index needs a search/filter pattern. Build time still fine (Next handles this) but client HTML payload becomes the issue. |

**Architecture trigger to watch:** when any single page's HTML exceeds ~200 KB uncompressed (~50 KB gzip), it's time to paginate. For a curated portfolio that's "the next several years away" — not a Cycle 2/3 concern.

The Sidebar in `lib/content.ts` correctly enforces the **featured-deliverable invariant** (max one). Good. The `getDeliverables()` call is synchronous file I/O at build time only — zero runtime cost.

---

## 8. Recommended fixes — prioritized

### P0 — do this cycle
- **Lazy-load Framer Motion** for the HamburgerNav (`next/dynamic` with `ssr: false`).
- **Rewrite Hero animation in CSS** (return Hero to a Server Component).
- **Expected impact:** First Load JS 152 KB → ~107 KB (-30%). LCP improves measurably on mobile/slow networks because the largest non-framework chunk is removed from the critical path.

### P1 — before adding real images (Cycle 4)
- Add a `sharp`-based prebuild image pipeline. Ship WebP + a JPEG fallback at 1x/2x widths. (See §6.)
- Add a `width` and `height` attribute discipline to every `<img>` — prevents CLS once images arrive.

### P2 — nice-to-have
- **Confirm with Dani:** drop Cormorant 400 weight from `app/fonts.ts` if design only uses weight 300. Saves ~70 KB of woff2 (won't change First Load JS — fonts download separately — but reduces overall page weight).
- **Fix or remove the `headers()` block in `next.config.mjs`.** Next prints warnings every build that they're ignored for `output: export`. They're a comment-as-config today; either delete the block or move the documentation to a comment.
- **Remove `polyfills-42372ed130431b0a.js` from the critical chunk if possible.** It's 36 KB gzip and only old browsers need it. Next loads it conditionally already via `nomodule` — verify in `out/index.html` it's tagged correctly.

---

## DECISIONS FOR SKY

1. **Approve the Framer-Motion strategy?** Option B (lazy-load nav + CSS Hero) is my recommendation. Option A (keep as-is) is fine if you expect significantly more motion soon. Option C (drop Framer) is the leanest but loses the stagger-on-close from the nav overlay.
2. **Confirm Cormorant weight 400 is actually used in the design.** If not, dropping it from `fonts.ts` saves ~70 KB of woff2.

---

## Verification

- `npm run build` ran clean (✓ Compiled, ✓ Generating, ✓ Exporting).
- `npm run typecheck` green.
- Constitution v1.3 compliance: read-only on code (no edits made); only this report file written; no external sends; no main branch touched.

## How to review (for the implementer who picks this up)

```
# Branch from the current cycle branch:
git checkout -b perf/auto-2026-05-23 cycle/auto-2026-05-23

# Implement the P0 changes:
#  1. Replace Hero motion.* with CSS keyframes (see §4 Option B)
#  2. Refactor HamburgerNav: split overlay into HamburgerOverlay.tsx,
#     import via next/dynamic in HamburgerNav.tsx
#  3. Verify: npm run build → confirm First Load JS dropped to ~107 KB

# Do NOT merge automatically. Sky merges.
```
