# Wave 2 Fix Report — Shamus + Alex
**Date:** 2026-05-25  
**Branch:** `fix/auto-2026-05-25-portfolio-wave2`  
**Commit:** `af5a86e`  
**Typecheck before:** 0 errors (clean codebase from audit)  
**Typecheck after:** 0 errors  
**Tests before:** 40/40  
**Tests after:** 40/40

---

## Fixes Applied

### Fix 1 — Add Pac-Man Code Trainer to deliverables (Quinn priority #1)
**File:** `/Users/skypie/Portfolio/content/deliverables.json`  
**What changed:** Added a new entry with id `pacman-code-trainer` between `prompt-library` and `mutual-mesh`. Schema matches existing entries exactly: id, title, summary, role, tech, year, heroImage (src + alt), links (GitHub + demo), tags, featured.  
**Details:**
- Tech: Vanilla JS, HTML, CSS, GitHub Pages
- GitHub: https://github.com/Skypie99/pacman-code-trainer
- Live: https://skypie99.github.io/pacman-code-trainer/
- `featured: false` — did not displace AccessMap as the featured deliverable
- Hero image path set to `/images/deliverables/pacman-code-trainer/hero.jpg` — Sky to add the actual image to `public/images/deliverables/pacman-code-trainer/`

### Fix 2 — Fix Prompt Library tech stack (Quinn priority #4)
**File:** `/Users/skypie/Portfolio/content/deliverables.json`, Prompt Library entry  
**What changed:** Replaced `["Next.js", "AI", "Solo build"]` with `["Next.js 15", "TypeScript", "Vitest", "localStorage", "GitHub Pages"]`.  
**Rationale:** "AI" and "Solo build" are not technologies; the actual stack is Next.js 15 static export, TypeScript, Vitest test suite, localStorage for all state, deployed to GitHub Pages.

### Fix 3 — SkipLink focus → focus-visible (Alex priority #3)
**File:** `/Users/skypie/Portfolio/components/SkipLink.tsx`  
**What changed:** All 10 `focus:` Tailwind prefixes replaced with `focus-visible:`. This includes `focus:not-sr-only`, `focus:fixed`, `focus:left-4`, `focus:top-4`, `focus:z-[9999]`, `focus:px-4`, `focus:py-3`, `focus:bg-cream`, `focus:text-near-black`, `focus:border-2`, `focus:border-accent-primary`, `focus:rounded-md`, `focus:font-mono`, `focus:text-label`, `focus:tracking-label`, `focus:uppercase`, `focus:no-underline`.  
**Impact:** The skip link now only surfaces for keyboard users (Tab key triggers `focus-visible`), not for mouse clicks (which only trigger `focus`). This is the correct WCAG 2.4.1 bypass block pattern — visible to keyboard, invisible to pointer.

### Fix 4 — prefers-reduced-motion on reveal-on-scroll (audit item)
**File:** `/Users/skypie/Portfolio/app/globals.css` — already correct, NO change needed.  
**Finding:** The `reveal-on-scroll` animation is already fully wrapped in `@supports (animation-timeline: view()) { @media (prefers-reduced-motion: no-preference) { ... } }` (lines 360–366). The animation never fires under `prefers-reduced-motion: reduce`. Additionally, lines 216 and 270 have separate `prefers-reduced-motion: reduce` blocks snapping link-draw and other transitions to near-instant. This fix is fully handled upstream.

### Fix 5 — Add OG/social meta tags (Quinn priority #5)
**File:** `/Users/skypie/Portfolio/app/layout.tsx`, `generateMetadata()` function  
**What changed:** Added `openGraph` and `twitter` keys to the returned Metadata object using the Next.js 15 Metadata API (not raw `<meta>` tags).  
- `openGraph.title`: "Sky Halisky — AI Portfolio"
- `openGraph.description`: "AI-powered apps built with Claude Code. AccessMap, MutualMesh, Prompt Library and more."
- `openGraph.type`: "website"
- `twitter.card`: "summary_large_image"
- `twitter.title` + `twitter.description`: same as OG  
- **Note:** `metadataBase` is still `undefined`. For OG image previews to work fully, Sky should set `metadataBase` to the production URL (e.g., `new URL('https://skypie99.github.io/Portfolio/')`) and add a `/public/og-image.jpg`. Without `metadataBase`, Next.js will not resolve relative OG image URLs, but title/description tags will render correctly.

### Fix 6 — Mobile wordmark in hamburger overlay
**File:** `/Users/skypie/Portfolio/components/HamburgerNav.tsx`  
**What changed:** Added a `<p>` element with "Sky Halisky" styled with `font-serif font-normal text-display-s text-near-black mb-10 select-none` above the `<nav>` inside the full-screen overlay. This matches the Sidebar's wordmark typographic treatment (same font, same size class).  
**Why `<p>` not `<h2>`:** The overlay is `role="dialog" aria-label="Primary menu"` — adding a heading would be semantically reasonable but the existing aria-label on the dialog already announces "Primary menu" to AT. A decorative `<p>` avoids adding an unexpected heading to the dialog's outline without impacting screen reader users.

---

## Items NOT Fixed

None. All 6 items from the brief were addressed (Fix 4 was already correct and required no code change).

---

## DECISIONS FOR SKY

1. **Pac-Man hero image:** `public/images/deliverables/pacman-code-trainer/hero.jpg` does not exist yet. The card will render without an image (or with a broken img) until Sky adds the file. Existing entries have this same pattern.
2. **OG `metadataBase`:** Set to `new URL('https://skypie99.github.io/Portfolio/')` (or whatever the live URL is) in `generateMetadata()` to unlock relative OG image URL resolution. Also add a `/public/og-image.jpg` or `/public/og-image.png` and wire it to `openGraph.images` for Twitter and OG preview cards.
3. **Mobile wordmark element type:** Currently `<p>` — if Sky or Dani prefer `<h2>` inside the dialog, that's a one-line swap.
