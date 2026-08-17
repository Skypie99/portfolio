# AI Portfolio

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
| `/work/[slug]` | Detail page per deliverable. 6 prerendered slugs: `accessmap`, `claude-corp`, `dashboard`, `prompt-library`, `ghost-code`, `mutual-mesh` |
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

`cycle/auto-2026-05-23` carries the entire Day-0 + Cycle 2/3 + Cycle 4-6 build. `main` is intentionally unborn until Sky blesses the initial state — per Constitution v1.3 Art. 1, only Sky merges to `main`.

## How to review

```bash
git log --oneline cycle/auto-2026-05-23
git diff cycle/auto-2026-05-23            # against working tree if main is still unborn
```

Read `qa-reports/cycle-2026-05-23-eve.md` first; the C4-6 per-role reports are referenced from there.
