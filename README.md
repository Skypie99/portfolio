# AI Portfolio

A warm-minimal showcase of Sky's AI deliverables and certificates. ffern.co-inspired.

## Status

Day-0 planning complete (2026-05-23). No code yet. Sky reviews this cycle's artifacts; build begins next cycle.

## How this repo is organized

```
Portfolio/
├── PLAN.md              — what this cycle did
├── README.md            — this file
├── docs/                — all planning artifacts
├── designs/             — wireframes and mockups
└── qa-reports/          — Morgan's compiled briefing for Sky
```

### `PLAN.md`
Morgan's cycle plan for 2026-05-23: the Day-0 survey, the dependency graph of which roles ran in which wave, the roles deliberately skipped, hard constraints from the Constitution, and the decisions parked for Sky.

### `docs/`
- **`FEATURES.md`** (Quinn, PM) — Backlog of portfolio features grouped by priority, plus the DECISIONS FOR SKY block at the top.
- **`PERSONAS.md`** (Riley, User Researcher) — Composite visitor personas (recruiter, peer engineer, curious browser, etc.) reasoned from common portfolio-site UX patterns. Treat as hypothesis until real analytics land.
- **`PROJECT_DESIGN.md`** (Dani, Creative Director) — The design system: warm-minimal philosophy, color and type tokens, components, motion rules. Includes a changelog at the top documenting Alex's WCAG fixes applied this cycle (split Sage tokens, added Umber accent-text, added interactive border, restricted Cormorant Light to ≥24px).
- **`ACCESSIBILITY.md`** (Alex, Accessibility Engineer) — WCAG 2.2 AA contrast audit of Dani's tokens. Three blockers (now resolved in Dani's revision) and two decisions escalated to Sky.
- **`DATA_SHAPE.md`** (Dana, Backend Engineer) — Content schema for the file-backed portfolio (no database). Defines the shape of project entries, certificate entries, and supporting metadata.
- **`SCAFFOLDING_PLAN.md`** (Shamus, Feature Pusher) — Proposed Next.js 15 static-export project structure: directories, dependencies, routing, how Dani's tokens map to Tailwind config, how MDX content is loaded. Docs-only; no scaffold commands ran.
- **`DEPLOY_PLAN.md`** (Rory, DevOps) — GitHub Pages deployment plan modeled on the existing `pacman-code-trainer` success. Workflow shape, `basePath` handling, `.nojekyll`, the safe non-destructive steps.

### `designs/`
- **`home-hero-mockup.md`** (Dani) — Homepage hero + first-fold wireframe in markdown, with token references resolving to `PROJECT_DESIGN.md` §1.1. Built for Shamus to scaffold against and Alex to audit.

### `qa-reports/`
Morgan's compiled briefing files for Sky. The current cycle's briefing is `cycle-2026-05-23.md` (DECISIONS FOR SKY at the top).

## Read in this order

1. **`qa-reports/cycle-2026-05-23.md`** — Morgan's briefing. DECISIONS FOR SKY at the top.
2. **`PLAN.md`** — this cycle's plan.
3. **`docs/PERSONAS.md`** — who we're building for.
4. **`docs/FEATURES.md`** — what we're building.
5. **`docs/PROJECT_DESIGN.md`** + **`designs/home-hero-mockup.md`** — how it looks.
6. **`docs/ACCESSIBILITY.md`** — the WCAG floor.
7. **`docs/DATA_SHAPE.md`** + **`docs/SCAFFOLDING_PLAN.md`** + **`docs/DEPLOY_PLAN.md`** — how it gets built and shipped.

## Branch state

`cycle/auto-2026-05-23` is the current work. `main` is intentionally unborn until Sky blesses the initial state — per Constitution v1.3 Art. 1, only Sky merges to `main`.

## How to review

```
git log --oneline cycle/auto-2026-05-23
```

Read `qa-reports/cycle-2026-05-23.md` first; everything else is referenced from there.
