# Portfolio Wave 3 — Peter + Gary — 2026-05-25

Branch: `test/auto-2026-05-25-gary-portfolio-tests`
Parent: `fix/auto-2026-05-25-portfolio-wave2`

---

## Peter: Performance Findings

### Issues found (with severity)

**LOW — `<img>` in ProjectCard.tsx instead of Next.js `<Image>` (line 86)**

`components/ProjectCard.tsx` uses a bare `<img>` element with an `// eslint-disable-next-line @next/next/no-img-element` suppression comment. This is intentional and documented in the component: the aspect-ratio container (`relative w-full aspect-[3/2]` or `aspect-[16/9]`) already reserves the layout space, explicit `width`/`height` attributes are present for the browser's intrinsic-ratio hint, and `loading="lazy"` is set. The real penalty of bare `<img>` over `<Image>` (automatic WebP/AVIF conversion, srcset generation, Vercel Image Optimization) only applies once real images replace the current placeholder cream blocks. Until `/public/images/deliverables/*` is populated, swapping to `<Image>` would be premature and adds no measurable benefit.

**SEVERITY: LOW — no immediate action required.** Recommend converting to `next/image <Image>` in Wave 4 when real hero images are added. The `eslint-disable` comment and the Cycle 23 code comment already document this as a deferred task.

**LOW — `transition-[transform,top]` in HamburgerNav hamburger lines**

`components/HamburgerNav.tsx` lines 119 and 132 use `transition-[transform,top]` on the hamburger bar spans (the open/close animation rotates + repositions the lines). Transitioning `top` is technically a layout-triggering property; transitioning `transform` only would be more performant. However:
- The animated elements are tiny `<span>` nodes (1px tall) inside a 22×14px bounding box.
- The browser paints this in the compositor once the overlay is open (fixed position, isolated stack).
- `useReducedMotion` gates the entire animation for accessibility-sensitive users.
- The visual result (lines converging to an X) requires `top` movement because the lines are positioned with `top-0` / `top-1.5` / `top-3` — using `translateY` would work but would require removing absolute positioning.

**SEVERITY: LOW — cosmetic, not user-perceptible.** Recommend a future micro-refactor to swap `top` transitions for `translateY`, but this is not a Wave 3 blocker.

### Already optimized

- **Fonts:** `app/fonts.ts` uses `next/font/google` with `latin` subset, specific weights only (300/400), and `display: 'swap'`. Correctly imported in `app/layout.tsx` and wired to CSS variables. No third-party font requests at runtime.
- **Client components:** Only `HamburgerNav` uses `"use client"`. It is loaded via `HamburgerNavMount` using `next/dynamic({ ssr: false })` — comment in `layout.tsx` explicitly notes this splits Framer Motion (~45 KB) out of the homepage First Load JS (Peter C2 perf). All other components (Sidebar, Footer, Hero, ProjectCard, etc.) are Server Components.
- **No heavy imports:** No lodash, moment, date-fns, or wholesale icon library imports found across any client or server component.
- **No bare `<img>` tags outside ProjectCard:** Zero hits for `<img` in `app/` directory or any other component file.
- **Animation transforms:** All hover/focus lift animations use `scale`, `translate-x`, or Framer Motion `y` (transform-based) — not `top`/`left` position properties — except the hamburger open/close noted above.
- **Static export:** Site is a static export — no server-side runtime, no runtime JS for most pages.

### Fixes applied

None. Peter is read-only this wave. Both issues noted above require source-code changes that need Sky or Shamus review first.

### Recommended next steps

1. **Wave 4 (when real images ship):** Replace `<img>` in `ProjectCard.tsx` with `next/image <Image>`, remove the eslint-disable, and populate `/public/images/deliverables/`. This unlocks automatic WebP/AVIF delivery and proper srcset.
2. **Nice-to-have (low priority):** Refactor hamburger bar spans to use `translateY` instead of `top` for the open/close animation — eliminates the one layout-triggering property transition. No user-visible impact.

---

## Gary: Test Coverage

### Before: 40 tests (10 files)

### After: 83 tests (12 files)

### What was added

**`lib/__tests__/cn.test.ts` — 14 new tests**

Pure-function tests for `lib/cn.ts`, the custom tailwind-merge wrapper. The Cycle 11 bug (custom color `text-umber` silently dropped when combined with custom font-size `text-meta`) was the motivating regression. Tests cover:

- Basic merging: empty input, single class, multiple classes, deduplication, clsx conditionals, object-style conditionals
- **Custom color token preservation (the Cycle 11 regression):** `text-umber` + `text-meta` both survive; `bg-sand` vs `bg-cream` resolves to last-wins; `text-accent-primary` + font-size both survive; `border` + `border-terracotta` both survive
- Custom font-size token resolution: two custom font-sizes resolve last-wins; standard `text-sm` vs custom `text-meta` resolves to `text-meta`
- Array/nested clsx inputs: flat array join, conflicting padding from two arrays

**`lib/__tests__/schema.test.ts` — 29 new tests**

Pure Zod validation tests for `lib/schema.ts`. These document the rules from Dana's DATA_SHAPE.md §2 and Alex §4.1 as executable assertions, so any future schema change must update these tests explicitly. Tests cover:

- `DeliverableSchema` happy path (base + gallery/links variants)
- Slug validation: uppercase rejected, leading/trailing hyphens rejected, numbers accepted
- Alt text rules (Alex §4.1): `"image of"` / `"picture of"` / `"photo of"` prefixes rejected; mid-sentence occurrence accepted; too-short / too-long rejected
- heroImage path rule: must be under `/images/deliverables/<slug>/`
- Links refine: two `demo`-type links rejected; one demo + one github accepted
- `CertificateSchema` happy path (with and without expiresDate)
- Date invariant: expiresDate equal to or before issuedDate rejected; wrong format rejected
- credentialUrl: http:// rejected; non-URL rejected
- badgeImage path rule: must be under `/images/certificates/<slug>/`
- `ProfileSchema` happy path; contactEmail validation; socials platform enum (all 6 valid platforms accepted; unknown platform rejected)

### Remaining gaps

- **`app/work/[slug]/page.tsx`** — the detail page has no dedicated tests. It's a Server Component that reads a single deliverable from `getDeliverables()` and renders gallery + links. A pure rendering test would be brittle; this is fine to leave as is until it gains utility functions worth testing.
- **`lib/content.ts` — `readJson` error paths** — the file-not-found branch of `readJson` throws a Node `fs` error. This is integration-level behaviour (requires a missing file on disk) so it's out of scope for pure-logic unit tests.
- **`components/HamburgerNav.tsx`** — focus-trap and keyboard-event logic is integration/E2E territory. The existing smoke tests cover mount/visibility; detailed trap behaviour belongs in Playwright.
- **`app/` pages** — homepage, /about, /certificates, /contact are Server Components. Pure tests would mock `lib/content`, which is fragile. Integration tests (Playwright) are the right tool.
