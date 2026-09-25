# Skyler Halisky: support-first portfolio

Skyler Halisky works in senior technical/product support. Through SkyPi Studio (his authored umbrella practice, not an agency), he connects investigation, escalation, QA, documentation, accessibility, systems thinking, and AI-assisted product building.

## Current state: 2026-09-24

Production is commit `88075547f600c45b1cfb1c56abbabeb6a26b93e8` on `main` ("docs(qa): record Portfolio 4.0 P4 closure", 2026-09-22), deployed to [skypistudio.com](https://skypistudio.com) through the normal CI-then-deploy path on 2026-09-23. This block describes that deployed state; the dated layers below are history. For the current gate status of any commit, the durable record is the repository's [Actions history](https://github.com/Skypie99/portfolio/actions). Test counts in the historical layers below were true for their own dates and are deliberately not repeated here.

The deployed site presents five projects in authored order: Flagstone, Claude Corp, Claude Corp Dashboard, Prompt Library, Ghost Code.

Flagstone is released. "Flagstone Accessibility Map" (bundle `com.accessmap.app`) version 4.1.1 became available on the App Store on 2026-09-15 in the United States and Canada storefronts (read-only iTunes lookup rechecked 2026-09-24; that lookup returned no Great Britain result, which is an observation about those storefront checks, not a distribution claim). This records the release fact only: nothing here claims approval internals, user counts, adoption, or an accessibility certification.

The public Claude Corp Dashboard demo at [dashboard.skypistudio.com](https://dashboard.skypistudio.com) runs on synthetic data only, is badged "Demo", and carries a scenario snapshot dated 2026-09-02. Its project names, agent counts, blockers, and decisions are historical synthetic scenario content, not live operations.

## Historical accepted local state: 2026-09-04

*Superseded by the current block above; content unchanged from its own date.*

This repository’s Phase 06 entry base is commit `2c89a8e24e1b6693bd4c9239a55d796a64ca0355`, tree `49b6d9feb3a348981668d6dad2aa088c03a2df7d`. It combines the accepted Phase 04 Flagstone work and Phase 05 supporting-project work. It is a local accepted candidate: it has not been pushed, merged to `main`, or deployed.

Public site: [skypistudio.com](https://skypistudio.com). The live site and this local candidate are separate evidence surfaces; this README does not claim deployed parity for the candidate.

### Current project set

The accepted candidate presents five projects, in this order:

1. **Flagstone**: the flagship accessibility-reporting map. Owner-provided App Store Connect evidence dated 2026-09-04 records Flagstone Accessibility Map, iOS 4.1.1, as **Waiting for Review**. That observation does not independently prove Build 33, approval, release, availability, users, or adoption.
2. **Claude Corp**: written governance, bounded AI operations, review, and human authority.
3. **Claude Corp Dashboard**: support-operations visibility through a private operator app and a public synthetic-data demo.
4. **Prompt Library**: a local-first prompt product with no backend operated by Sky.
5. **Ghost Code**: a scoped learning product demonstrating progression and deliberate constraints.

### Current route set

| Surface | Routes |
|---|---|
| Indexed portfolio content | `/`, `/work/`, `/work/flagstone/`, `/work/claude-corp/`, `/work/dashboard/`, `/work/prompt-library/`, `/work/ghost-code/`, `/about/`, `/accessibility/`, `/blog/`, `/blog/building-flagstone/`, `/certificates/`, `/colophon/`, `/contact/` |
| Separate noindex surfaces | `/archive/` is the private, auth-gated Studio Archive island; `/runway/` is an unlisted proof-of-use route |
| Flagstone utility pages | `/flagstone/`, `/flagstone/accessibility/`, `/flagstone/privacy/`, `/flagstone/support/`, `/flagstone/terms/` |
| Generated machine endpoints | `/feed.xml`, `/feed.json`, `/sitemap.xml` |

### Build and deployment

The site is Next.js 15 with `output: 'export'`, `trailingSlash: true`, and no `basePath`. GitHub Pages serves the generated `out/` directory at the domain root.

A push to `main` starts the production path. CI runs lint, typecheck, a build-backed test run, and a final build. The normal deploy workflow runs only after the `CI` workflow completes successfully on `main`; a failed CI run leaves the previous site in place. `workflow_dispatch` remains a deliberately ungated emergency/manual deployment path. There is no staging environment. Only Sky merges or pushes `main`.

The `headers()` block in `next.config.mjs` is documentation for a future hosting layer; GitHub Pages does not apply those runtime headers to this static export.

### Accepted local verification

On 2026-09-04, against the accepted candidate above:

- `npm run typecheck`: PASS.
- `npm run lint`: PASS, with no ESLint warnings or errors.
- `npm run test:static`: PASS after a fresh static build; 2 Vitest files, 54 passed and 1 existing skip.
- `npm test`, run after the build: PASS; 95 Vitest files, 864 passed and 2 existing skips out of 866 tests.
- The build generated 26 static pages and retained the documented static-export header warnings.

The focused static result is included in the full post-build suite and is not added to the 864 total.

### How the work is made

Sky chooses the problems, architecture, policy, constraints, and release decisions. AI agents implement, diagnose, test, and draft within those constraints. Sky performs human review and verification and exclusively controls merge, release, and deployment.

### Links

- [Live portfolio](https://skypistudio.com)
- [GitHub](https://github.com/Skypie99)
- [LinkedIn](https://www.linkedin.com/in/skyler-halisky)
- [Contact](https://skypistudio.com/contact/)

> Historical repository documentation follows. Its dated plans, Cook Out receipts, earlier wave records, and test results remain useful archaeology. Any older section labelled “current,” “latest,” or “live” applies only to its own stated date and is superseded by the current layer above.

A warm-minimal showcase of Sky's AI deliverables and certificates. ffern.co-inspired.

## Status

Live at [skypistudio.com](https://skypistudio.com). Pushing to `main` deploys through GitHub Actions in about two minutes; there is no staging step.

Gates green from a fresh clone, measured 2026-08-16: lint, typecheck, and **567 tests** across 62 files (`npm ci && npx vitest run`). Building first unskips the static-integrity checks that need a real `out/` directory, and the count becomes **611** (`npm run build && npx vitest run`).

## Quick start

```bash
cd ~/Portfolio
npm run dev          # http://localhost:3000  (basePath OFF in dev — see Pages)
```

Static-export preview (matches what GitHub Pages will serve):

```bash
cd ~/Portfolio
npm run build
npx serve out -p 3001     # http://localhost:3001/
```

## Pages

| Route | Purpose |
|---|---|
| `/` | Homepage — hero, selected work list, numbered steps, CTA |
| `/work` | Index of all deliverables (cards from `content/deliverables.json`) |
| `/work/[slug]` | Detail page per deliverable. 5 prerendered slugs: `flagstone`, `claude-corp`, `dashboard`, `prompt-library`, `ghost-code` |
| `/certificates` | Issued credentials with badge, issuer, date |
| `/about` | Bio + "how I work" numbered steps |
| `/contact` | Mailto CTA + socials |
| `/_not-found` | Custom 404 with editorial styling |

There is **no `basePath`**. The site serves at the domain root (`https://skypistudio.com/…`) in production and at `http://localhost:3000` in dev. Older notes claiming a `/portfolio` base path are stale; do not reintroduce one or hardcode a base path anywhere.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Next dev server on `:3000`, no basePath |
| `npm run build` | `next build` → emits static `out/` directory for GH Pages |
| `npm run start` | `next start` — **do not use** (static export has no Node server; left in package.json by `create-next-app`) |
| `npm run lint` | `next lint` with `plugin:jsx-a11y/recommended` (Note: `next lint` deprecated in Next 16 — future migration item) |
| `npm run typecheck` | `tsc --noEmit` in strict mode |
| `npm run test` | Vitest single run (567 tests across 62 files; 611 if you `npm run build` first) |
| `npm run test:watch` | Vitest watch mode |
| `npm run test:ui` | Vitest browser UI |

## Deploy

GitHub Actions → GitHub Pages via `.github/workflows/deploy.yml` (push-to-main trigger + `workflow_dispatch`). The workflow is **LIVE**: every push to `main` publishes to skypistudio.com in about two minutes, with no manual step and no rollback prompt.

Sky's manual steps (5 bullets, ~3 minutes) live in **`docs/DEPLOY_PLAN.md` → Status — Cycle 4 → "Sky still does manually"**. Includes repo creation, push, and `Settings → Pages → Source: GitHub Actions`. Rollback playbook is in `DEPLOY_PLAN.md` §6.

CI runs independently via `.github/workflows/ci.yml` (Gary, Cycle 2) — lint + typecheck + test + build on every PR.

## How this repo is organized

```
Portfolio/
├── app/                — Next.js App Router routes (one folder per page)
├── components/         — React components (Hero, Sidebar, HamburgerNav, ProjectCard, …)
├── content/            — JSON source of truth (profile, deliverables, certificates)
├── lib/                — content loaders + Zod schemas + cn() helper
├── public/             — static assets (.nojekyll, images, fonts)
├── docs/               — planning artifacts, plans, LEARNINGS.md
├── designs/            — wireframes and mockups
├── qa-reports/         — per-cycle role briefings and Morgan's compiled briefing
├── PLAN.md             — Day-0 cycle plan
├── README.md           — this file
├── next.config.mjs     — output: 'export', conditional basePath, images.unoptimized
├── tailwind.config.ts  — Dani's design tokens wired into Tailwind theme
└── package.json
```

### `docs/`

- **`FEATURES.md`** (Quinn) — Backlog grouped by priority + DECISIONS FOR SKY block.
- **`PERSONAS.md`** (Riley) — Composite visitor personas (recruiter, peer engineer, curious browser).
- **`PROJECT_DESIGN.md`** (Dani) — Warm-minimal design system: color tokens, type, components, motion.
- **`ACCESSIBILITY.md`** (Alex) — WCAG 2.2 AA contrast audit of Dani's tokens.
- **`DATA_SHAPE.md`** (Dana) — Zod-mirrored content schema (file-backed, no DB).
- **`SCAFFOLDING_PLAN.md`** (Shamus) — Next.js 15 static-export structure: directories, deps, routing, token → Tailwind mapping. Cycle-by-cycle build order (Cycles 2-6).
- **`DEPLOY_PLAN.md`** (Rory) — GH Pages deployment plan + `Status — Cycle 4` section with Sky's remaining manual steps.
- **`LEARNINGS.md`** (Will) — Running log of gotchas, patterns, decisions revisited.

### `qa-reports/`

Cycle briefings and per-role validation reports. The most recent compiled briefing is `cycle-2026-05-23-eve.md`; per-role C4-6 reports follow the `2026-05-23_<Role>_C4-6_*.md` pattern.

## Read in this order

1. **`qa-reports/cycle-2026-05-23-eve.md`** — Morgan's most recent compiled briefing. DECISIONS FOR SKY at the top (5 new + 14 carried).
2. **`PLAN.md`** — Day-0 cycle plan.
3. **`docs/PERSONAS.md`** — who we're building for.
4. **`docs/FEATURES.md`** — what we're building.
5. **`docs/PROJECT_DESIGN.md`** + **`designs/home-hero-mockup.md`** — how it looks.
6. **`docs/ACCESSIBILITY.md`** + **`qa-reports/2026-05-23_Alex_C4-6_validation.md`** — the WCAG floor + most recent validation.
7. **`docs/DATA_SHAPE.md`** + **`docs/SCAFFOLDING_PLAN.md`** + **`docs/DEPLOY_PLAN.md`** — how it gets built and shipped.
8. **`qa-reports/2026-05-23_Steve_C4-6_security.md`** — security posture (0 critical, 0 high; 2 moderate `postcss` transitives accepted).
9. **`qa-reports/2026-05-23_Peter_C4-6_perf.md`** — perf (106 kB First Load JS across all routes).
10. **`qa-reports/2026-05-23_Gary_C4-6_tests.md`** — test coverage (17/17 passing).
11. **`qa-reports/2026-05-23_Rory_C4-6_deploy.md`** — deploy workflow status + Sky's manual GitHub steps.

## Branch state

`main` is the live branch — every push to it publishes. Work happens on a
prefixed branch (`fix/…`, `rename/…`, `polish/…`) and only Sky merges, per
Constitution Art. 1. The Day-0 `cycle/auto-2026-05-23` branch is long since
merged; earlier notes here calling `main` "unborn" were years of drift.

## How to review

```bash
git log --oneline main..<branch>          # what the branch adds
git diff main..<branch> --stat            # the shape of it
```

Then the gates, all three, before anything merges:

```bash
npm run typecheck && npm run build && npx vitest run
```
