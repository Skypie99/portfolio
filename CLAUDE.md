# Portfolio — project context

Sky's public-facing AI portfolio. Static Next.js 15 site deployed to GitHub Pages. Shows deliverables (projects), certificates, and an About page. Content lives in JSON files validated by Zod schemas at build time.

**Live:** https://skypistudio.com
**Local path:** `~/Portfolio`
**Owner:** hello@skypistudio.com

---

## Stack

- **Next.js 15** (App Router, `output: 'export'` → static HTML)
- **React 18** + **TypeScript strict**
- **Tailwind CSS 3** + **Framer Motion** (animation)
- **Zod** — build-time content validation
- **Vitest** + **@testing-library/react** — component + integration tests
- **GitHub Pages** — hosting (auto-deploy via `.github/workflows/deploy.yml` on push to `main`)

No backend, database, or auth — **except `/archive`** (the Studio Archive), a self-contained Supabase-backed island. See "The Studio Archive" at the end of this file.

---

## File map

```
app/
  layout.tsx            root layout — fonts, globals, skip link
  page.tsx              homepage — hero + project cards
  about/page.tsx        About page
  work/page.tsx         full deliverables list
  work/[slug]/page.tsx  individual deliverable detail page
  certificates/page.tsx credentials grid
  contact/page.tsx      contact page
  not-found.tsx         404

components/             all shared UI components
  cinematic/            opening interactive desert scroll scene (GSAP) — PROTECTED, read-only
  Hero.tsx              homepage hero section (below the cinematic scene)
  ProjectCard.tsx       card for each deliverable
  Sidebar.tsx           persistent left sidebar nav
  HamburgerNav.tsx      mobile nav (client component)
  Button.tsx            styled button / link button
  TagPill.tsx           tech/category tag pill
  NumberedStep.tsx      methodology step display
  SkipLink.tsx          a11y skip-to-content link
  Footer.tsx            page footer

content/                edit these to update what's on the site
  profile.json          name, tagline, location, email, socials
  deliverables.json     array of portfolio projects (cards + detail pages)
  certificates.json     array of credentials/badges

lib/
  schema.ts             Zod schemas — DeliverableSchema, CertificateSchema, ProfileSchema
  content.ts            getProfile(), getDeliverables(), getCertificates() — parse + validate JSON
  cn.ts                 clsx + tailwind-merge utility

public/images/
  deliverables/<slug>/  hero images for each project
  certificates/<slug>/  badge images for each certificate
```

---

## Content data model

All content is JSON, parsed and validated at build time via `lib/content.ts`. A schema violation **fails the build** — that's intentional.

### deliverables.json
Each entry must match `DeliverableSchema`:
- `id` — kebab-case slug (matches the `/work/[slug]` route)
- `title`, `summary` (max 160 chars), `role`, `year`
- `tech` — array, 1–8 items
- `heroImage` — `{ src, alt }`, src must be under `/images/deliverables/<slug>/`
- `gallery` — optional, max 8 images
- `links` — optional, max 5 links, each with `label`, `href` (https only), `type` (github/demo/writeup/video/other). Max one `type: "demo"` per deliverable.
- `tags` — max 6
- `featured: boolean` — **exactly one** deliverable may be `featured: true`. Two or more = build error.

### certificates.json
Each entry must match `CertificateSchema`:
- `id`, `title`, `issuer`, `issuedDate` (ISO `YYYY-MM-DD`), optional `expiresDate`
- `credentialUrl` — must be a real https URL
- `badgeImage` — src must be under `/images/certificates/<slug>/`
- `tags` — max 6

### profile.json
Matches `ProfileSchema` — `name`, `wordmarkText`, `tagline`, `location`, `contactEmail`, `socials` (max 6).

### Alt-text rule (Alex §4.1)
Alt text must be 4–200 chars and must NOT start with "image of", "picture of", or "photo of". The schema enforces this — a violation fails the build.

---

## Deploy pipeline

**Push to `main` = live within ~2 minutes.** There is no staging environment.

```
npm run build   # outputs to out/ (static export)
# Pushing to main runs CI (lint · typecheck · test · build); Deploy runs
# only after CI succeeds — see .github/workflows/deploy.yml
```

The site serves at the **domain root** (`https://skypistudio.com/…`). There is **no `basePath`** — `next.config.mjs` sets none. (Earlier docs claimed `/portfolio`; that is stale — don't reintroduce it or hardcode any base path.) Use Next.js `<Link>` and relative paths.

`trailingSlash: true` is required — GH Pages serves `/work/` via `/work/index.html`.

---

## Commands

```
npm run dev          # localhost:3000 (no basePath in dev)
npm run build        # static export → out/
npm run typecheck    # tsc --noEmit — must pass before shipping
npm test             # vitest run (all tests)
npm run test:static  # build + run static-integrity tests (validates links, images, JSON)
```

Always run `npm run typecheck` before declaring something done.

---

## Conventions

- **TypeScript strict** — no `any`.
- **Tailwind only** — no inline `style=` or raw CSS except in `globals.css`.
- No theme system yet; color tokens are Tailwind classes.
- Components are in `components/`, pages are in `app/`. Don't blur the line.
- Client components (`"use client"`) only when actually needed (event handlers, browser APIs). Everything else stays server/static.
- Tests live in `components/__tests__/` and `lib/__tests__/`. Match the filename of what you're testing.

---

## Gotchas (load-bearing)

### 1. Push to `main` deploys — but CI gates it
`.github/workflows/deploy.yml` triggers on `workflow_run` of **CI** completing, and its build job runs only `if github.event.workflow_run.conclusion == 'success'` (or a manual `workflow_dispatch`, which is the deliberate ungated emergency path). So a push that fails lint, typecheck, tests, or build **never reaches production** — the previous version simply stays up, with no rollback notice. There is still no staging environment, and a green CI run deploys within ~2 minutes of the push. Run `npm run typecheck && npm test && npm run build` locally anyway; finding it here is faster than finding it in Actions.

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

---

## The Studio Archive (`/archive`)

A private, auth-gated personal art catalogue at `skypistudio.com/archive` — the one Supabase-backed island in this otherwise static, backend-less site. It reimplements a single-file prototype so Sky's catalogue opens from any device.

- **Stack island:** Supabase (Postgres + Storage + magic-link/OTP auth) via `@supabase/supabase-js`, 100% client-side (`output: 'export'` = no server). **RLS is the security boundary**; the anon key is publishable by design.
- **Code:** `app/archive/` (route + `archive.css`), `components/archive/*`, `lib/archive/*` (pure logic is unit-tested), `supabase/migrations/*`, `scripts/archive/extract-seed.mjs`.
- **Documented deviations from this repo's conventions — `/archive` only:** (1) **scoped raw CSS** in `app/archive/archive.css`, every rule under `.studio-archive`/`#studio-archive-root`, `sa-`-prefixed — the archive's design language IS the requirement. (2) **inline `style=`** in archive components (ported positioning). Confined to `/archive`; the rest of the site stays Tailwind-only.
- **Chrome:** `/archive` hides the site chrome via `components/ChromeGate.tsx`; it is registered in `UNINDEXED_ROUTES` and ships `noindex`.
- **Env:** `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` — repo Actions **Variables** for deploy, `.env.local` for dev (see `.env.example`). Never a `service_role` key.
- **Runbook:** `docs/ARCHIVE_RUNBOOK.md` (deploy, unpause, custom SMTP, second user).
