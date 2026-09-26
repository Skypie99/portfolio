# Portfolio — project context

Sky's public-facing portfolio. Static Next.js 15 site deployed to GitHub Pages. Shows five case-study projects, certificates, a blog, and About, Accessibility, Colophon, and Contact pages, plus the private `/archive` and the unlisted `/runway`. Content lives in JSON files validated by Zod schemas at build time.

**Live:** https://skypistudio.com
**Local path:** Sky's checkout is `~/Portfolio`; nothing depends on that path, and any clone works.
**Owner:** hello@skypistudio.com
**Which docs are current:** `docs/INDEX.md`. Root `*_PLAN.md`, `PROJECT_STATE.md`, and similar files are dated history (each carries a lifecycle banner).

---

## Stack

- **Next.js 15** (App Router, `output: 'export'` → static HTML)
- **React 18** + **TypeScript strict**
- **Tailwind CSS 3** + **Framer Motion** and **GSAP** (animation) + **next-themes** (light/dark)
- **Zod** — build-time content validation
- **Vitest** + **@testing-library/react** — component + integration tests
- **GitHub Pages** — hosting. `.github/workflows/deploy.yml` deploys only after the `CI` workflow succeeds on `main` (Gotcha 1)

No backend, database, or auth — **except `/archive`** (the Studio Archive), a self-contained Supabase-backed island. See "The Studio Archive" at the end of this file.

---

## File map

```
app/                    App Router routes, one folder per page
  layout.tsx            root layout — fonts, globals, ThemeProvider, skip link
  page.tsx              homepage — cinematic scene, hero, project index
  work/, work/[slug]/   project index + one case study per deliverable
  about/ accessibility/ blog/ blog/[slug]/ certificates/ colophon/ contact/
  runway/               unlisted proof-of-use page (noindex)
  archive/              private Studio Archive (see the end of this file)
  sitemap.ts, feed.xml/, feed.json/, opengraph-image.tsx   generated endpoints
  not-found.tsx, global-error.tsx
pages/500.tsx           stub Next needs to emit 500.html; postbuild prunes it from out/

components/             all shared UI components
  cinematic/            opening interactive desert scroll scene (GSAP) — PROTECTED, read-only
  archive/              Studio Archive UI
  Hero.tsx, Sidebar.tsx, HamburgerNav.tsx, ProjectCard.tsx, ProductReveal.tsx, Footer.tsx, …

content/                what the site is built from — see content/README.md

lib/
  schema.ts             Zod schemas for every content file
  content.ts            getDeliverables(), getBlogPosts(), getCertificates(), … — parse + validate JSON
  motion.ts, media.ts, sectionNav.ts, cn.ts, …
  archive/              Studio Archive data + pure logic

public/
  images/               curated media: deliverables/<slug>/, certificates/<slug>/, cinematic/
  showcase/<slug>/      capture-factory output (docs/showcase-factory.md)
  flagstone/            static Flagstone utility pages

scripts/                build hooks, QA instruments, media pipeline — see scripts/README.md
docs/                   docs/INDEX.md says which documents are current
qa-reports/             dated receipts + raw evidence — start at qa-reports/INDEX.md (generated)
```

---

## Content data model

All content is JSON, parsed and validated at build time via `lib/content.ts`. A schema violation **fails the build** — that's intentional.

### deliverables.json
Each entry must match `DeliverableSchema` (`lib/schema.ts` is the authority; this is the load-bearing subset):
- `id` — kebab-case slug (matches the `/work/[slug]` route)
- `title`, `summary` (max 160 chars), `role`, `year`
- `status` — **required** one-line status (4–48 chars). Sky's protected wording; the recruiter-copy truth guards check it.
- `tech` — array, 1–8 items
- `heroImage` — `{ src, alt }`, src must be under `/images/deliverables/<slug>/`
- optional media (`heroShot`, `cardImage`, `mobileCardImage`, `shots` max 3) — src under `/images/deliverables/<slug>/` or `/showcase/<slug>/`; usually written by `scripts/wire-showcase.mjs`
- `gallery` — optional, max 8 images
- `links` — optional, max 5 links, each with `label`, `href` (https only), `type` (github/demo/writeup/video/other/appstore). Max one `type: "demo"` per deliverable.
- `tags` — max 6
- `featured: boolean` — **at most one** deliverable may be `featured: true`. Two or more = build error.

### certificates.json
Each entry must match `CertificateSchema`:
- `id`, `title`, `issuer`, `issuedDate` (ISO `YYYY-MM-DD`), optional `expiresDate`
- `credentialUrl` — must be a real https URL
- `badgeImage` — src must be under `/images/certificates/<slug>/`
- `tags` — max 6

### profile.json
Matches `ProfileSchema` — `name`, `wordmarkText`, `tagline`, `location`, `contactEmail`, `socials` (max 6).

### Other content files
`blog.json` (posts), `rounds.json` (the calibration record), and `a11y-receipts.json` (dated accessibility measurements) are schema-validated the same way. `showcase.manifest.json` is **generated** by the capture factory; don't hand-edit it. See `content/README.md`.

### Alt-text rule (Alex §4.1)
Alt text must be 4–200 chars and must NOT start with "image of", "picture of", or "photo of". The schema enforces this — a violation fails the build.

---

## Deploy pipeline

**Push to `main` → CI → (only on success) Deploy → live a few minutes after the push.** There is no staging environment, and only Sky pushes or merges `main`.

```
npm run build   # outputs to out/ (static export)
# Pushing to main runs CI (lint · typecheck · test · build); Deploy runs
# only after CI succeeds — see .github/workflows/deploy.yml
```

What is live is recorded in GitHub Actions (the latest successful Deploy run), not in any file. Don't write a production SHA into docs; it goes stale at the next deploy.

The site serves at the **domain root** (`https://skypistudio.com/…`). There is **no `basePath`** — `next.config.mjs` sets none. (Earlier docs claimed `/portfolio`; that is stale — don't reintroduce it or hardcode any base path.) Use Next.js `<Link>` and relative paths.

`trailingSlash: true` is required — GH Pages serves `/work/` via `/work/index.html`.

---

## Commands

```
npm run dev             # localhost:3000 (no basePath in dev)
npm run build           # static export → out/ (prebuild validates assets; postbuild prunes /500, aliases OG cards)
npm run lint            # next lint + jsx-a11y
npm run typecheck       # tsc --noEmit — must pass before shipping
npm test                # vitest run; after a build, the build-dependent guards run too (as in CI)
npm run test:static     # build + run static-integrity tests (validates links, images, JSON)
npm run qa:index        # regenerate qa-reports/INDEX.md; qa:index:check reports drift without writing
```

Always run `npm run typecheck` before declaring something done; CI also runs lint, a build-backed `npm test`, and a final build. Every script is described in `scripts/README.md`.

---

## Conventions

- **TypeScript strict** — no `any`.
- **Tailwind first.** Raw CSS lives only in `app/globals.css` and `app/tokens-phase2.css` (tokens, the cinematic block, shared keyframes). Inline `style=` is for runtime-computed values only (CSS custom properties such as a project's signature colour, computed gradients, `objectPosition`) and for the `opengraph-image.tsx` routes, whose image renderer requires it. `/archive` has its own documented exception (end of this file).
- **Themes:** light and dark via `next-themes` (class strategy on `<html>`). Colours are `--rgb-*` custom properties defined for `:root` and `html.dark` in `app/globals.css` and exposed as Tailwind colours in `tailwind.config.ts`. Visual rules: `UI_SYSTEM.md`; motion rules: `MOTION_SYSTEM.md`.
- Components are in `components/`, pages are in `app/`. Don't blur the line.
- Client components (`"use client"`) only when actually needed (event handlers, browser APIs). Everything else stays server/static.
- Tests live in `app/__tests__/`, `components/__tests__/`, and `lib/__tests__/` (Vitest runs any `**/__tests__/**/*.test.{ts,tsx}`). Match the filename of what you're testing.
- QA evidence goes under `qa-reports/`; follow the evidence rule in `qa-reports/INDEX.md` and regenerate that index with `npm run qa:index`.

---

## Gotchas (load-bearing)

### 1. Push to `main` deploys — but CI gates it
`.github/workflows/deploy.yml` triggers on `workflow_run` of **CI** completing, and its build job runs only `if github.event.workflow_run.conclusion == 'success'` (or a manual `workflow_dispatch`, which is the deliberate ungated emergency path). So a push that fails lint, typecheck, tests, or build **never reaches production** — the previous version simply stays up, with no rollback notice. There is still no staging environment, and a green CI run deploys a few minutes after the push. Run `npm run typecheck && npm test && npm run build` locally anyway; finding it here is faster than finding it in Actions.

### 2. `output: 'export'` bans runtime Next.js features
No `next/image` optimization (images are `unoptimized: true`), no API routes, no server actions, no middleware at runtime. Everything must be statically generatable.

### 3. No basePath — the site serves at the domain root
`next.config.mjs` sets no `basePath`; the site serves at `https://skypistudio.com/…`. Some older docs/comments say `/portfolio` — that is **stale**; don't reintroduce it or hardcode any base path. Use `<Link>` and relative paths.

### 4. Featured-slot invariant
Exactly 0 or 1 deliverable may have `featured: true`. Adding a second throws at build time with a clear error message. If you want to change the featured project, set the old one to `false` first.

### 5. Image paths are schema-enforced
`heroImage.src` must match `/images/deliverables/<slug>/...`. `badgeImage.src` must match `/images/certificates/<slug>/...`. The Zod regex enforces this — wrong path = build error.

### 6. Security headers are documentation only
The `headers()` block in `next.config.mjs` is present for when we migrate off GitHub Pages, but GH Pages ignores it at runtime. Don't rely on those headers being applied in production.

### 7. Static-integrity test runs a full build
`npm run test:static` calls `npm run build` first. Don't run it in hot loops — it's slow. Use `npm test` for the fast component tests during development.

### 8. README.md is guarded by a test
`lib/__tests__/recruiter-copy-truth.test.ts` requires the line `> Historical repository documentation follows.` to appear in `README.md` **exactly once**, and everything above it to carry no em dash and no `--` in prose (inline code and fenced blocks excepted; that includes `---` rules and HTML comments). Keep dated material below that line, and never put a hand-written production SHA or test count above it.

### 9. `qa-reports/INDEX.md` is generated
Don't edit it by hand. Stage new evidence (`git add`), then run `npm run qa:index`; `npm run qa:index:check` exits non-zero when the index is stale. It is not wired into CI.

---

## The Studio Archive (`/archive`)

A private, auth-gated personal art catalogue at `skypistudio.com/archive` — the one Supabase-backed island in this otherwise static, backend-less site. It reimplements a single-file prototype so Sky's catalogue opens from any device.

- **Stack island:** Supabase (Postgres + Storage + magic-link/OTP auth) via `@supabase/supabase-js`, 100% client-side (`output: 'export'` = no server). **RLS is the security boundary**; the anon key is publishable by design.
- **Code:** `app/archive/` (route + `archive.css`), `components/archive/*`, `lib/archive/*` (pure logic is unit-tested), `supabase/migrations/*`, `scripts/archive/extract-seed.mjs`.
- **Documented deviations from this repo's conventions — `/archive` only:** (1) **scoped raw CSS** in `app/archive/archive.css`, every rule under `.studio-archive`/`#studio-archive-root`, `sa-`-prefixed — the archive's design language IS the requirement. (2) **inline `style=`** in archive components (ported positioning). Confined to `/archive`; the rest of the site stays Tailwind-only.
- **Chrome:** `/archive` hides the site chrome via `components/ChromeGate.tsx`; it is registered in `UNINDEXED_ROUTES` and ships `noindex`.
- **Env:** `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` — repo Actions **Variables** for deploy, `.env.local` for dev (see `.env.example`). Never a `service_role` key.
- **Runbook:** `docs/ARCHIVE_RUNBOOK.md` (deploy, unpause, custom SMTP, second user).
