# SCAFFOLDING_PLAN.md — AI Portfolio (Next.js 15 Static Export)

**Author:** Shamus (Feature Pusher)
**Cycle:** `cycle/auto-2026-05-23` (Day-0, Wave 2)
**Status:** PROPOSED — docs-only. No code, no installs, no scaffold commands run this cycle.
**Authority:** Sky's intent > CONSTITUTION v1.3 > role files > skills
**Pairs with:** `PLAN.md`, `docs/FEATURES.md` (Quinn), `docs/PROJECT_DESIGN.md` (Dani), `designs/home-hero-mockup.md` (Dani), `docs/DEPLOY_PLAN.md` (Rory), forthcoming `docs/DATA_SHAPE.md` (Dana) and `docs/ACCESSIBILITY.md` (Alex).

---

## 0. What this document is (and isn't)

This is the **blueprint** Sky will use to scaffold the app **next cycle**. It enumerates every command, file, and component decision in advance so the actual build is mechanical — no exploratory choices once `npx create-next-app` runs.

It is NOT:

- A scaffold run. No `npx`, no `npm install`, no files in `app/` or `components/` this cycle.
- A finalized package.json. Dependency choices flagged "RECOMMEND" still need Sky's ratification (or Sky can defer to my recommendations and proceed).
- A re-spec of Dani's tokens or Quinn's features. It maps them to a file tree; it doesn't re-author them.

---

## 1. Stack confirmation

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 15 (App Router)** | Confirmed in `PLAN.md`. Static export is first-class in 15 (`output: 'export'`). Matches Rory's `DEPLOY_PLAN.md`. |
| Language | **TypeScript (strict)** | Matches Sky's other projects (AccessMap, Mutual Mesh). Catches the Database-type-style gotchas early. |
| Styling | **Tailwind CSS v3.x** + CSS variables for Dani's tokens | See §1.1 below for the trade-off rationale. |
| Routing | App Router, file-based | All routes statically generated. No client-side data fetching in v1. |
| Content | Static JSON files in `/content/` for v1 (MDX deferred until Journal decision lands) | See §4. |
| Motion | **Framer Motion v11** (recommended) — falls back to pure CSS if Sky wants zero JS deps | See §5. |
| Validation | **Zod** at build time only — never ships to client | Per Dana's likely DATA_SHAPE.md contract. |
| Util | `clsx` + `tailwind-merge` for class composition | Standard, ~3KB combined. |
| Fonts | `next/font/google` (self-hosted at build) for Cormorant Garamond, DM Sans, DM Mono | Removes third-party CDN request (per Rory) and matches Dani's §2.1. |
| Icons | Lucide React (line-style, fits Dani's restraint) | Dani §8 floats this as a likely fit. |
| Output | `next build && next export` → `out/` directory served by GitHub Pages | Per Rory's `DEPLOY_PLAN.md`. |

### 1.1 Tailwind vs. plain CSS — recommendation

**Recommend Tailwind.** Reasons:

1. Dani's 65 design tokens (§1.2 of `PROJECT_DESIGN.md`) map cleanly to a `tailwind.config.ts` `theme.extend` block — colors, spacing, radii, fonts, durations all become utility classes. We get autocomplete, purging, and zero runtime CSS-in-JS overhead.
2. Static export benefits from PurgeCSS — final bundle ships only the classes actually used. Estimated CSS payload < 12KB gzip for v1.
3. Component primitives in §3 of `PROJECT_DESIGN.md` are utility-class shaped already (`bg-cream text-near-black border-stone rounded-full px-6 py-4`).
4. Keeps CSS-variable escape hatch open for any token that needs runtime updates (none planned for v1, but free option).

**Trade-off:** verbose JSX class strings. We mitigate with `cn()` helper (`clsx` + `tailwind-merge`) and small per-component composition functions where strings exceed ~6 utilities.

**Alternative if Sky says no to Tailwind:** plain CSS Modules + `globals.css` with the `:root` block from Dani §1.1 verbatim. Same tokens, more boilerplate. Estimated +2 days across cycles 2-6.

---

## 2. Init commands (in order — for Sky to run NEXT cycle, NOT now)

```bash
# 1. Position in the empty repo
cd ~/Portfolio

# 2. Scaffold Next.js 15 with TS + Tailwind + App Router into the current dir
#    Note: --no-src-dir keeps app/ at repo root, matching Sky's AccessMap layout.
#          Use "." for the project name so create-next-app populates the existing dir.
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*" \
  --use-npm \
  --eslint

# 3. Add the lightweight utility deps Sky will need across all components
npm install clsx tailwind-merge zod

# 4. Add Framer Motion (only if Sky ratifies §5 recommendation)
npm install framer-motion

# 5. Add Lucide for icons (hamburger glyph, optional terracotta arrow)
npm install lucide-react

# 6. Verify the scaffold built clean — does NOT deploy, just confirms local build works
npm run build

# 7. Sanity check the static export output
ls -la out/
```

**Prompts `create-next-app` will ask** (and the answer to each):

| Prompt | Answer |
|---|---|
| TypeScript? | Yes (covered by `--typescript`) |
| ESLint? | Yes (covered by `--eslint`) |
| Tailwind CSS? | Yes (covered by `--tailwind`) |
| `src/` directory? | No (covered by `--no-src-dir`) |
| App Router? | Yes (covered by `--app`) |
| Customize import alias? | Yes, `@/*` (covered by `--import-alias "@/*"`) |
| Turbopack? | Default (No) — `next build` still uses webpack for export; safer for v1. |

**One post-scaffold tweak Sky must apply by hand** (Shamus does this in cycle 2 when code work begins):

- Open `next.config.mjs` (Next 15 default) and add:
  ```js
  const nextConfig = {
    output: 'export',
    images: { unoptimized: true },
    basePath: process.env.NODE_ENV === 'production' ? '/Portfolio' : '',
    trailingSlash: true, // makes GitHub Pages directory-style URLs work
  };
  ```
  Exact value of `basePath` matches Rory's `DEPLOY_PLAN.md` (subdir vs apex domain TBD).

- Create `public/.nojekyll` (empty file) so GitHub Pages doesn't run Jekyll over the `_next` directory. Per Rory.

---

## 3. File tree (annotated)

```
~/Portfolio/
├── app/                                 ← App Router root (root-level, --no-src-dir)
│   ├── layout.tsx                       ← Root layout: <html>, <body>, sidebar + main shell,
│   │                                      next/font preloads (Cormorant, DM Sans, DM Mono)
│   ├── page.tsx                         ← Homepage (F-01): Hero + intro funnel
│   ├── globals.css                      ← Dani's :root CSS vars (§1.1 verbatim)
│   │                                      + @tailwind base/components/utilities
│   │                                      + reduced-motion media query (§5.2)
│   ├── work/
│   │   ├── page.tsx                     ← Deliverables index (F-04)
│   │   └── [slug]/
│   │       └── page.tsx                 ← Deliverable detail (F-05)
│   │                                      Uses generateStaticParams() reading /content
│   ├── certificates/
│   │   └── page.tsx                     ← Certificates section (F-06)
│   ├── about/
│   │   └── page.tsx                     ← About + numbered "How I work" steps (F-07)
│   ├── contact/
│   │   └── page.tsx                     ← Mailto contact (F-08, pending DECISIONS #1)
│   ├── (journal)/                       ← Route group, only if F-09 ships
│   │   ├── journal/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   ├── not-found.tsx                    ← Custom 404, editorial styling
│   └── error.tsx                        ← App-router error boundary
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx                  ← F-02 persistent left rail (desktop ≥1024px)
│   │   ├── HamburgerNav.tsx             ← F-03 top-right hamburger + overlay drawer
│   │   └── Footer.tsx                   ← F-10 three-column footer
│   ├── home/
│   │   ├── Hero.tsx                     ← F-01 hero block (Dani §3.7)
│   │   └── IntroFunnel.tsx              ← 2-3 sentence second-section (F-01 scope)
│   ├── work/
│   │   ├── ProjectCard.tsx              ← Card primitive (Dani §3.3) used in F-04 + sidebar featured
│   │   ├── ProjectGrid.tsx              ← 2-col desktop / 1-col mobile grid for F-04
│   │   └── ProjectDetail.tsx            ← 2-col layout (image left, meta right) for F-05
│   ├── certificates/
│   │   └── CertificateCard.tsx          ← Reuses ProjectCard tokens, issuer-aware variant
│   ├── about/
│   │   └── NumberedStep.tsx             ← Dani §3.6 — DM Mono numeral + Cormorant heading
│   ├── ui/                              ← Atomic primitives reused everywhere
│   │   ├── Button.tsx                   ← Primary + ghost variants (Dani §3.1, §3.2)
│   │   ├── TagPill.tsx                  ← Dani §3.8 — Sand bg, Umber text
│   │   ├── EyebrowLabel.tsx             ← DM Mono uppercase eyebrow text
│   │   ├── SectionEyebrow.tsx           ← Section opener with `--fs-label` + heading
│   │   └── Link.tsx                     ← Wraps next/link, applies hover color shift
│   └── motion/                          ← Only if Framer Motion ratified
│       ├── FadeUpOnView.tsx             ← Scroll-triggered fade + translateY
│       └── ReducedMotionGate.tsx        ← Wrapper that no-ops on prefers-reduced-motion
│
├── content/                             ← Source of truth for portfolio data
│   ├── deliverables.json                ← Array of deliverables (slug, title, role, tech, year, hero, gallery, summary, externalUrl)
│   │                                      Schema validated by Zod at build time
│   ├── certificates.json                ← Array of certificates (issuer, title, date, url, logo)
│   ├── profile.json                     ← About-page narrative + numbered steps + portrait
│   └── README.md                        ← How to add a deliverable (for Sky's future-self)
│
├── lib/
│   ├── content.ts                       ← getDeliverables(), getDeliverable(slug), getCertificates()
│   │                                      All read /content at build time, validate with Zod, type-safe outputs
│   ├── schema.ts                        ← Zod schemas mirroring Dana's DATA_SHAPE.md
│   ├── cn.ts                            ← cn(...inputs) helper — clsx + tailwind-merge
│   └── tokens.ts                        ← TS export of Dani's design tokens for use in components
│                                          (mirrors tailwind.config.ts; single source for tests)
│
├── public/
│   ├── images/
│   │   ├── deliverables/<slug>/         ← hero.jpg + gallery-01.jpg, gallery-02.jpg…
│   │   └── certificates/<slug>/         ← logo.svg or wordmark.png
│   ├── fonts/                           ← Self-hosted woff2 (populated by next/font at build)
│   ├── og-image.png                     ← 1200×630 social share image (Dani-styled)
│   ├── favicon.svg, favicon.ico         ← Cream-bg favicon w/ terracotta dot
│   └── .nojekyll                        ← Empty marker for GitHub Pages
│
├── docs/                                ← Already populated by Wave 1
│   ├── FEATURES.md, PROJECT_DESIGN.md, PERSONAS.md, DEPLOY_PLAN.md
│   ├── SCAFFOLDING_PLAN.md              ← This file
│   ├── DATA_SHAPE.md                    ← Dana — incoming Wave 2
│   ├── ACCESSIBILITY.md                 ← Alex — incoming Wave 2
│   └── LEARNINGS.md                     ← Will — incoming Wave 3
│
├── designs/
│   └── home-hero-mockup.md              ← Dani — already authored
│
├── qa-reports/                          ← Per-project, per Claude Corp convention
│   └── cycle-2026-05-23.md              ← Morgan — incoming Wave 3
│
├── .github/
│   └── workflows/
│       └── deploy.yml                   ← Per Rory's DEPLOY_PLAN.md (not authored this cycle)
│
├── tailwind.config.ts                   ← Wires Dani's tokens into Tailwind's theme
├── next.config.mjs                      ← output: 'export', basePath, images.unoptimized
├── postcss.config.js                    ← Default from create-next-app
├── tsconfig.json                        ← Default + paths alias `@/*`
├── package.json                         ← Deps from §2 step 3 + 4 + 5
├── .eslintrc.json                       ← Default + a11y plugin (per Alex's likely ask)
├── .gitignore                           ← Default
├── README.md                            ← Will authors Wave 3
└── PLAN.md                              ← Already exists
```

**Annotations:**

- **`app/(journal)/` is a route group.** Wrapping in parentheses keeps the URL clean (`/journal/`, not `/journal/journal/`). Whole folder is conditional on Sky's DECISIONS #2 answer.
- **`lib/tokens.ts` mirrors `tailwind.config.ts`** so Gary's tests (next cycle) can assert against tokens without importing Tailwind's runtime config.
- **`content/README.md`** is a future-Sky convenience — a "how to add a new deliverable" cheat sheet so the data layer stays self-documenting.

---

## 4. Routing strategy

### 4.1 Generation model

Every route is **statically generated at build time**. Zero client-side data fetching in v1.

| Route | Generation | Reads | Static? |
|---|---|---|---|
| `/` | Static, no params | `content/profile.json` (featured deliverable ref) | Yes |
| `/work` | Static, no params | `content/deliverables.json` | Yes |
| `/work/[slug]` | `generateStaticParams()` returns every deliverable slug | `content/deliverables.json` | Yes |
| `/certificates` | Static, no params | `content/certificates.json` | Yes |
| `/about` | Static, no params | `content/profile.json` | Yes |
| `/contact` | Static, no params | Mailto only — no data | Yes |
| `/journal` (optional) | Static, no params | `content/journal/*.mdx` | Yes |
| `/journal/[slug]` (optional) | `generateStaticParams()` | MDX files | Yes |

### 4.2 Server vs. Client Components

- **Server Components by default.** All page files (`layout.tsx`, `page.tsx`) are Server Components — they read from `/content` at build, render HTML, ship zero JS for the static parts.
- **Client Components only where interactivity is required:**
  - `HamburgerNav.tsx` — needs `useState`, focus-trap, Escape-key handler. Marked `'use client'`.
  - `FadeUpOnView.tsx` (if Framer Motion approved) — needs `useInView`. Marked `'use client'`.
  - `Button.tsx` — Server-rendered, no `'use client'`. Hover is CSS-only.
- **Result:** estimated < 30KB JS shipped to client for the entire site. Hamburger + motion accounts for ~25KB of that.

### 4.3 generateMetadata

Every page exports `generateMetadata()` returning page-specific `<title>`, OG image, description. Drives SEO and social sharing without per-page boilerplate in `<head>`.

---

## 5. Component → token mapping

Each of Dani's 9 primitives (§3 of `PROJECT_DESIGN.md`) maps to a component file and a specific Tailwind class composition. This table is the implementation contract for cycle 2 onwards.

| Dani primitive | Component file | Tailwind class composition (illustrative) | Notes |
|---|---|---|---|
| **§3.1 Primary Button** | `components/ui/Button.tsx` (variant=primary) | `inline-flex items-center gap-3 h-14 px-6 bg-cream text-near-black border border-stone rounded-full font-mono text-label tracking-label uppercase transition-colors duration-base ease-out hover:bg-blush` + `<span class="w-2 h-2 rounded-full bg-terracotta transition-all duration-base group-hover:w-2.5 group-hover:h-2.5">` | Dot is its own span. Hover uses CSS-only `group-hover:` — no JS. |
| **§3.2 Ghost Button** | `components/ui/Button.tsx` (variant=ghost) | Same as primary but `bg-transparent` and `hover:bg-warm-white hover:border-pebble` | One file, two variants via prop. |
| **§3.3 Project Card** | `components/work/ProjectCard.tsx` | `block bg-cream border border-stone rounded-lg p-6 transition-all duration-slow ease-out hover:border-pebble [&_img]:transition-transform [&_img]:duration-slow hover:[&_img]:scale-[1.02]` | Featured variant swaps `bg-cream` → `bg-blush`. |
| **§3.4 Sidebar** | `components/layout/Sidebar.tsx` | `hidden lg:flex flex-col gap-12 sticky top-0 h-screen w-[280px] bg-cream p-12` | `hidden lg:flex` enforces the ≥1024px breakpoint per F-02 AC. |
| **§3.5 Hamburger Nav** | `components/layout/HamburgerNav.tsx` | Trigger: `fixed top-6 right-6 w-10 h-10 z-50 flex items-center justify-center` · Overlay: `fixed inset-0 bg-cream z-40` | Client component. Uses focus-trap-react (or manual focus management — see §6). |
| **§3.6 Numbered Step** | `components/about/NumberedStep.tsx` | Block: `bg-peach-cream rounded-lg p-12 flex flex-col gap-6` · Step row: `flex gap-6 border-t border-stone pt-6 first:border-t-0` · Numeral: `font-mono text-display-s text-terracotta` | Hairline divider via Tailwind `border-t first:border-t-0`. |
| **§3.7 Hero Block** | `components/home/Hero.tsx` | `min-h-[80vh] flex flex-col justify-center px-gutter pt-[200px] pb-[128px] bg-cream` | `pt-[200px]` = `--space-20`. Tailwind arbitrary values keep Dani's exact pixel intent. |
| **§3.8 Tag Pill** | `components/ui/TagPill.tsx` | `inline-flex items-center px-3 py-1 rounded-full bg-sand text-umber font-mono text-meta tracking-label uppercase` | Used in ProjectCard meta row. |
| **§3.9 Footer** | `components/layout/Footer.tsx` | `bg-warm-white border-t border-stone pt-12 pb-8 grid grid-cols-1 md:grid-cols-3 gap-8 px-gutter` | Auto-updating year via `new Date().getFullYear()` in a Server Component. |

### 5.1 tailwind.config.ts skeleton (NOT authored this cycle — for reference only)

```ts
// Illustrative — actual file authored in cycle 2
export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FAF9F5',
        'warm-white': '#F0F0EA',
        blush: '#FCF3ED',
        'peach-cream': '#FDE9D7',
        sand: '#FBCFAC',
        amber: '#E2976E',
        terracotta: '#B35F32',
        umber: '#7F4323',
        bark: '#48230F',
        stone: '#DCDCD6',
        pebble: '#B8B8AA',
        sage: '#717267',
        charcoal: '#484A43',
        'near-black': '#232420',
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Garamond', 'Georgia', 'serif'],
        body: ['DM Sans', 'Inter', 'sans-serif'],
        mono: ['DM Mono', 'JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'display-l': ['3.25rem', { lineHeight: '1.15' }],
        'display-m': ['2.25rem', { lineHeight: '1.15' }],
        'display-s': ['1.1875rem', { lineHeight: '1.2' }],
        body: ['1rem', { lineHeight: '1.65' }],
        'body-sm': ['0.875rem', { lineHeight: '1.6' }],
        label: ['0.75rem', { lineHeight: '1.4' }],
        meta: ['0.6875rem', { lineHeight: '1.4' }],
      },
      letterSpacing: { body: '0.0156em', label: '0.125em' },
      spacing: {
        gutter: '2rem', // 32px
        // Other spacing inherits Tailwind defaults; Dani's scale aligns w/ Tailwind's 4px base
      },
      borderRadius: { sm: '4px', md: '8px', lg: '16px', pill: '9999px' },
      transitionDuration: { fast: '180ms', base: '280ms', slow: '520ms', reveal: '900ms' },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.22, 1, 0.36, 1)',
        soft: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      maxWidth: { content: '1120px' },
    },
  },
  plugins: [],
};
```

Pebble/Sage/Charcoal darkening from Alex's `ACCESSIBILITY.md` (forthcoming) will overwrite the above values verbatim. Dani's §7.3 already flags `sage`, `stone`, `charcoal-on-blush` as the at-risk pairs.

---

## 6. Interaction layer ("bright and interactive")

Sky's brief said "really bright and interactive." Dani interprets that as warm-bright cream + tasteful motion (slow easings, soft fades). Shamus's interaction catalog:

### 6.1 Recommended motion stack

**Framer Motion v11.** ~50KB gzipped, tree-shakable to ~30KB for our use. Buys us:

- `useReducedMotion()` hook → trivially honors `prefers-reduced-motion`.
- `useInView()` → scroll-triggered fade-ups without bespoke IntersectionObserver code.
- Variants → centralized motion specs.

**Alternative if Sky wants zero JS-for-motion:** CSS-only via `@starting-style` + IntersectionObserver wrapped in a tiny custom hook. Adds ~2 days of bespoke code across cycles; trades 30KB JS for engineer-time. Recommend Framer Motion.

### 6.2 Micro-interactions catalogue (matches Dani §5.3 + hero mockup §interaction-notes)

| # | Element | Trigger | What happens | Reduced-motion fallback |
|---|---|---|---|---|
| 1 | Sidebar slide (mobile→desktop crossover) | Resize past 1024px | Sidebar fades in over 280ms | Appears instantly |
| 2 | Hamburger overlay | Click hamburger glyph | Cream overlay fades + clip-path expand from top-right, 280ms `--ease-soft` | Opacity 0→1 only |
| 3 | Hamburger X glyph | Same | Three lines morph to X via CSS transform, 180ms | No transform animation, X swaps instantly |
| 4 | Card hover | Mouse over `ProjectCard` | Image scales `1.02` over 520ms `--ease-out`, border deepens `stone→pebble` | Border deepens only, no scale |
| 5 | Section scroll-in | Section's top crosses 80% of viewport | Children fade up 12-16px with 60-100ms stagger, 900ms `--dur-reveal` | Render in final state immediately |
| 6 | Hero stagger | Initial load | eyebrow → heading → body → button fade up 12px with 100ms stagger, 900ms | All visible immediately |
| 7 | Link hover | Mouse over `<Link>` | Color `near-black → terracotta` (180ms), underline draws left-to-right via `text-decoration-thickness` transition | Color shift only, no underline draw |
| 8 | Primary button hover | Mouse over `<Button variant=primary>` | bg `cream → blush`, dot `8px → 10px` over 280ms `--ease-out` | bg shift only, dot stays 8px |
| 9 | Sidebar "Latest" link hover | Mouse over featured-deliverable title | Color shift + arrow translates +4px right, 180ms | Color shift only |
| 10 | Terracotta dot pulse (optional) | Initial load, primary CTAs only | Single subtle pulse 1.0 → 1.15 → 1.0 over 1200ms, then settle | No pulse |

### 6.3 Focus & keyboard rails (Alex will sign off)

- All interactive elements: 2px terracotta focus ring at 3px offset (Dani §3.1).
- HamburgerNav: focus trapped inside open drawer; Escape closes + returns focus to trigger (F-03 AC).
- Skip-link `<a href="#main">Skip to content</a>` at the top of every page, visually hidden until focused.
- All `<Link>` components forward refs so keyboard focus works correctly across Server/Client boundaries.

---

## 7. Build order — cycle-by-cycle (cycles 2-6)

Shamus's recommended build sequence. Each cycle is one self-contained vertical slice that's verifiable in isolation. Gary slots in alongside cycle 2+ to grow the test suite as code lands.

### Cycle 2 — Shell (foundation)

**Goal:** sidebar + hamburger + cream canvas renders on every route.

- Run §2 init commands (Sky runs, Shamus verifies output).
- Author `tailwind.config.ts` with Dani's tokens.
- Author `app/globals.css` with `:root` block from Dani §1.1 verbatim + `@tailwind base/components/utilities` + `prefers-reduced-motion` block.
- Author `app/layout.tsx` — root layout with `<html lang="en">`, font preloads, sidebar + main wrapper.
- Author `components/layout/Sidebar.tsx` (F-02 — desktop only, content placeholder).
- Author `components/layout/HamburgerNav.tsx` (F-03 — opens/closes, all 5 nav items as placeholder links).
- Author `app/page.tsx` as a "Hello, scaffold" placeholder so `/` doesn't 404.
- Verify: `npm run dev` renders cream bg, sidebar visible at 1280px, hamburger opens/closes, Escape closes.
- Hand off: Alex audits hamburger keyboard a11y. Gary writes first Playwright test (does the page load on cream bg + sidebar visible).

**Acceptance:** F-02 + F-03 done. F-01 partial (placeholder homepage). Estimated 1 cycle.

### Cycle 3 — Homepage (the hero)

**Goal:** F-01 hero homepage fully shipped — first impression locked.

- Author `components/home/Hero.tsx` per Dani §3.7 + hero mockup.
- Author `components/home/IntroFunnel.tsx` (2-3 sentence quiet second section).
- Author `components/ui/EyebrowLabel.tsx` and `components/ui/Button.tsx` (primary variant).
- Wire `app/page.tsx` to compose Hero + IntroFunnel.
- Add Framer Motion if approved; wire hero stagger.
- Verify: hero hits min-height 80vh on 1440×900, CLS < 0.05, one CTA above the fold, all C-1 through C-5 satisfied.
- Hand off: Alex audits hero (contrast, focus, motion preferences). Gary adds visual regression test.

**Acceptance:** F-01 done. Estimated 1 cycle.

### Cycle 4 — Content layer + Deliverables

**Goal:** F-04 + F-05 — the reason the site exists.

- Author `lib/schema.ts` mirroring Dana's `DATA_SHAPE.md` Zod schema for deliverables.
- Author `lib/content.ts` with `getDeliverables()` + `getDeliverable(slug)`. Validates on read; throws at build if invalid (so a bad content file fails CI, not production).
- Populate `content/deliverables.json` with 3-5 real entries (Sky provides per DECISIONS #3) or 3 stand-in placeholders.
- Populate `public/images/deliverables/<slug>/hero.jpg` with editorial placeholders.
- Author `components/work/ProjectCard.tsx` and `components/work/ProjectGrid.tsx`.
- Author `app/work/page.tsx` (F-04 index).
- Author `app/work/[slug]/page.tsx` with `generateStaticParams()` (F-05 detail).
- Author `components/work/ProjectDetail.tsx`.
- Wire sidebar's featured-deliverable to read from `content/profile.json`.
- Verify: every deliverable slug builds, 404 on bad slug, empty-state copy renders when 0 deliverables.
- Hand off: Alex audits cards + detail page. Gary tests slug generation and link integrity.

**Acceptance:** F-04 + F-05 done. F-02 fully done (featured wired). Estimated 1 cycle.

### Cycle 5 — Certificates + About

**Goal:** F-06 + F-07 — credentialing and personality.

- Author `lib/content.ts` extension for `getCertificates()`.
- Populate `content/certificates.json` (Sky provides per DECISIONS #3) or 3 stand-in placeholders.
- Author `components/certificates/CertificateCard.tsx` (reuses ProjectCard primitive).
- Author `app/certificates/page.tsx` (F-06).
- Populate `content/profile.json` with narrative + 3-5 numbered steps.
- Author `components/about/NumberedStep.tsx`.
- Author `app/about/page.tsx` (F-07).
- Verify: contrast on issuer logos against Blush/Cream backgrounds (Alex's biggest call-out for certificates).
- Hand off: Alex audits both new pages. Gary expands suite.

**Acceptance:** F-06 + F-07 done. Estimated 1 cycle.

### Cycle 6 — Polish, footer, contact, motion pass, final sweep

**Goal:** Site is launchable.

- Author `components/layout/Footer.tsx` (F-10).
- Author `app/contact/page.tsx` (F-08, mailto only assuming DECISIONS #1 lands "mailto").
- Author `components/motion/FadeUpOnView.tsx` and apply to every section's stagger.
- Add custom `app/not-found.tsx` and `app/error.tsx` with editorial styling.
- Author `public/og-image.png` (1200×630), favicon set.
- Author `app/sitemap.ts` and `app/robots.ts` (Next 15 conventions).
- Hand off: **Steve** runs full hardening pass on the now-existing code (CSP headers via `next.config.mjs`, no inline-script regressions, no third-party requests beyond what Rory authorized). **Gary** brings test coverage to ~70% of components + at least one end-to-end Playwright per route. **Peter** runs a Lighthouse pass — targets ≥95 perf, ≥95 a11y. **Alex** does the final WCAG 2.2 AA sweep. **Will** finalizes README.

**Acceptance:** F-08, F-10 done. Site ready for Sky's review and a `main` merge. Estimated 1 cycle.

### Cycle 7+ (optional)

- F-09 Journal if Sky says yes to DECISIONS #2. Adds `next-mdx-remote` + `gray-matter`. Estimated 1 cycle.
- Real photography swap-in once Sky sources it.
- Custom domain DNS work (Rory leads).

---

## 8. Decisions for Sky (escalated; Morgan compiles)

These are the choices that gate or shape cycle 2's work. Shamus has a recommendation on each; Sky's yes/no/different unblocks.

1. **Tailwind vs. plain CSS for styling.**
   **Shamus recommends Tailwind** (§1.1). Dani's tokens map cleanly, ~12KB final CSS, autocomplete, no runtime cost. Alternative is CSS Modules + plain CSS vars — adds ~2 days across the 5 cycles.
   **Sky's call:** Tailwind / Plain CSS / Different.

2. **Framer Motion vs. CSS-only motion.**
   **Shamus recommends Framer Motion v11** (§6.1). Ships ~30KB tree-shaken JS, makes `useReducedMotion` + scroll-triggered reveals trivial. Alternative is bespoke IntersectionObserver + `@starting-style` CSS — adds ~2 days, saves 30KB.
   **Sky's call:** Framer Motion / CSS-only / Different.

3. **Directory layout — root `app/` (no `src/`) vs. `src/app/`.**
   **Shamus recommends root** (§2 init flags use `--no-src-dir`). Matches Sky's AccessMap and Mutual Mesh layouts; less indentation in import paths.
   **Sky's call:** Root / `src/`.

4. **Lock the Framer Motion choice before cycle 3 starts** (the hero stagger is the first concrete use).
   No action needed until Sky reviews this doc — flagging that cycle 3 needs the answer before it runs.

5. **`generateStaticParams` requires real deliverable + certificate data** (per DECISIONS #3 in Quinn's FEATURES.md).
   Cycle 4 + cycle 5 ship placeholder content if Sky hasn't provided real data by then. The scaffolding works either way; the visual quality of the launch depends on Sky's content.

6. **Content file format — JSON now, MDX later (if Journal ships).**
   **Shamus recommends staying on JSON for v1.** Deliverables and certificates are structured data, not prose; JSON keeps them validatable by Zod and trivially editable. MDX gets introduced only if/when F-09 ships.
   **Sky's call:** OK / Different.

---

## 9. What Shamus is deliberately NOT doing this cycle (Constitution rails)

- NOT running `npx create-next-app`. Sky runs it next cycle.
- NOT running `npm install`. Sky runs it next cycle.
- NOT creating any file in `app/`, `components/`, `lib/`, `content/`, or `public/`.
- NOT authoring `tailwind.config.ts`, `next.config.mjs`, or `package.json`.
- NOT touching `main` (per Constitution Art. 1).
- NOT making any external network call beyond reading these docs (per Art. 5).
- NOT messaging Sky directly (per Art. 9 — Morgan compiles cycle briefing).

This document is the entire deliverable.

---

## 10. Sign-off chain for cycle 2 start

Before Sky runs the §2 init commands:

1. **Sky** ratifies DECISIONS #1, #2, #3, #6 above (Tailwind, Framer Motion, directory, content format).
2. **Alex** publishes `docs/ACCESSIBILITY.md` with verdicts on Dani's §7 contrast pairs. Any failing pair becomes a token update in §5.1's `tailwind.config.ts` skeleton.
3. **Dana** publishes `docs/DATA_SHAPE.md` with the deliverable + certificate + profile Zod schemas. `lib/schema.ts` in cycle 4 mirrors this verbatim.
4. **Rory** confirms `basePath` value in `next.config.mjs` matches `DEPLOY_PLAN.md` (subdir `/Portfolio` vs apex).
5. **Morgan** compiles all of the above into `qa-reports/cycle-2026-05-23.md` for Sky's review.

Once Sky says go, cycle 2 starts and Shamus executes the §2 init commands + Cycle 2 build order from §7.

---

*Shamus, 2026-05-23 — Day-0 scaffolding plan v1. Re-grooms next cycle after Sky's ratifications and Alex/Dana/Rory hand-offs land.*
