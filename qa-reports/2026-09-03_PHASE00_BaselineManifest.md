# Phase 00 — Baseline Truth Manifest

Maps source SHA/tree, deploy identity, routes, screenshots, metrics, and claims to stable evidence IDs for `PHASE-00_BASELINE_LOCK_RECEIPT.md`. Read-only evidence only — nothing in this file or its sources was produced by modifying Portfolio source.

## Git / worktree identity

| ID | Fact |
|---|---|
| BASE-GIT-01 | `origin` = `https://github.com/Skypie99/portfolio.git` (confirmed by `remote.origin.url`, not folder name) |
| BASE-GIT-02 | `origin/main` = `19d946c9c48b325bce5d3a9f292d2cb48450cf01`, tree `ee0be9130c2b4f9de5de956c6cdc33b9d151c682` — **exact match** to the planning reference SHA/tree in the phase prompt |
| BASE-GIT-03 | Original checkout `/Users/skypie/Portfolio` local `main` was `7dc04ff2be3d8754516cb218bc4f4a08079dfcd3` — **3 commits behind** `origin/main` (missing merge of PR #20 "final acceptance" + 2 commits under it) at the time of this audit |
| BASE-GIT-04 | `/Users/skypie/Portfolio` working tree: no staged/modified tracked files; ~100+ untracked paths (`design-reviews/`, `qa-reports/`, `summaries/`, `specs/`, `AGENTS.md`, `TASK_GRAPH.json`) — historical QA/design artifacts, not source drift. No lock files, no interrupted merge/rebase/cherry-pick. |
| BASE-GIT-05 | 14 pre-existing worktrees found off `/Users/skypie/Portfolio` (`Portfolio-codex/*` ×6, `Portfolio-cookout-p1/p2/p3`, `Portfolio-worktrees/*` ×3, `.claude/worktrees/*` ×3), each on its own branch, none locked, none touched by this phase |
| BASE-GIT-06 | New integration worktree created: `/Users/skypie/Portfolio-3.0-baseline`, branch `claude/portfolio-3.0-phase00-baseline-20260903`, created from verified `origin/main` per owner direction (base-on-origin/main, not stale local main). HEAD = `19d946c9c48b325bce5d3a9f292d2cb48450cf01`, tree = `ee0be9130c2b4f9de5de956c6cdc33b9d151c682` — clean immediately after creation (`git status --short` empty). |

## Deployment identity

| ID | Fact |
|---|---|
| BASE-CI-01 | Current `Deploy` workflow run: `33692666996` (2026-09-02T22:55:14Z), `headSha` = `19d946c9c48b325bce5d3a9f292d2cb48450cf01`, conclusion `success` |
| BASE-CI-02 | Current GitHub Pages deployment: id `6233420729` (2026-09-02T22:56:21Z), `sha` = `19d946c9c48b325bce5d3a9f292d2cb48450cf01`, environment `github-pages` |
| BASE-ART-01 | Planning reference `9870638981` is the **artifact id** (not a run id — initially mis-queried as one, corrected). Artifact name `github-pages`, size 30,848,225 bytes, `expired: false`, belongs to run `33692666996`. Downloaded with owner's explicit approval; SHA-256 `9eb7b5696e6f5381eb98cd77e5b8d0433ec432a650caf86fcd46fb1a74d2e11d`. |
| BASE-ART-02 | Extracted artifact's 26-route HTML inventory is **identical** (`diff` clean) to a fresh local build of `origin/main`. Full recursive diff shows only Next.js's expected per-build random build-ID/content-hash filenames differing (`_next/static/chunks/**`, per-page `<!--buildId-->` comment) — not content drift. `.nojekyll` present in local build only (added by the deploy workflow itself, not by `next build`, so its absence from a plain local `next build` is expected). |

## Repo-native gates (T-008)

| ID | Command | Result |
|---|---|---|
| BASE-GATE-01 | `npm ci` | 539 packages installed, exit 0. `npm audit`: 16 known vulnerabilities (2 low, 3 moderate, 9 high, 2 critical) — all in **devDependency** chains (vitest/vite/@vitest/ui/babel/brace-expansion transitive), none flagged against a direct production runtime dependency. Not remediated (out of Phase 00 scope; flagged for RC-010 maintenance program). |
| BASE-GATE-02 | `npm run lint` | Clean — "No ESLint warnings or errors", exit 0 |
| BASE-GATE-03 | `npm run typecheck` | Clean, exit 0 |
| BASE-GATE-04 | `npm test` (vitest, run **before** build existed) | 1 failed suite (`recruiter-copy-truth.test.ts`, ENOENT on `./out/`) — **expected/ordering artifact**, not a defect: this suite (and `static-integrity.test.ts`) require `npm run test:static` (build→test) per the project's own `package.json`/CLAUDE.md. 758 passed / 54 skipped otherwise. |
| BASE-GATE-04b | Re-run of `static-integrity`, `section-nav-anchors`, `recruiter-copy-truth`, `smart-punctuation` **after** build | All pass: 79 passed / 2 skipped, exit 0 |
| BASE-GATE-05 | `npm run validate:assets` | Clean — 9 cert badges, 5 cinematic plates, 107 deliverable proof siblings, 3 blog figures all found, exit 0 |
| BASE-GATE-06 | `npm run check:overflow` (before build) | Exit 2, "./out/ missing" — same ordering artifact as GATE-04 |
| BASE-GATE-06b | Re-run after build | "static fixture never came up" (i.e. no overflow detected), exit 0 |
| BASE-GATE-07 | `npm run build` | Success — 26 static routes generated, exported 3/3, postbuild pruned the `/500` ghost route and aliased OG images to `.png`, exit 0 |

## Route inventory (T-006) — BASE-ROUTE-01

26 HTML routes from `./out/`, confirmed identical to the deployed artifact (BASE-ART-02) and all live-200 (see BASE-TECH-01):
`/`, `/404`, `/about`, `/accessibility`, `/archive`, `/blog`, `/blog/building-accessmap`, `/blog/building-flagstone`, `/certificates`, `/colophon`, `/contact`, `/flagstone`, `/flagstone/accessibility`, `/flagstone/privacy`, `/flagstone/support`, `/flagstone/terms`, `/runway`, `/work`, `/work/accessmap`, `/work/claude-corp`, `/work/dashboard`, `/work/flagstone`, `/work/ghost-code`, `/work/mutual-mesh`, `/work/prompt-library`, `/sitemap.xml` (+ non-HTML: `feed.json`, `feed.xml`, `icon.svg`, `opengraph-image`, `apple-icon.png`).

## Visual baseline (T-007) — BASE-VIS-01

Full grid (36/36 combinations: 6 routes × 3 viewports × 2 themes) in [`2026-09-03_PHASE00_VisualBaseline.md`](2026-09-03_PHASE00_VisualBaseline.md). Preserve-item results:

| ID | Item | Result |
|---|---|---|
| BASE-PRESERVE-001 | PR-001 cinematic first frame | PASS — sparse intro, real "Skip Intro" link, no recruiter-copy/progress/CTA clutter |
| BASE-PRESERVE-002 | PR-004 hero sentence | PASS — verbatim: *"Senior technical-support specialist. I turn recurring user friction into documentation, QA, and the tools that fix it."* |
| BASE-PRESERVE-003 | PR-006 Flagstone hierarchy | PASS — first in list (card 01), plus persistent sidebar "FEATURED" pin, distinct bordered/shadowed treatment |
| BASE-PRESERVE-004 | Reduced motion | **UNVERIFIABLE** — no in-page toggle; Browser-pane tooling only emulates light/dark, not `prefers-reduced-motion` |

## Technical / claims baseline (T-009, T-010) — full detail in [`2026-09-03_PHASE00_TechnicalClaimsBaseline.md`](2026-09-03_PHASE00_TechnicalClaimsBaseline.md)

| ID | Item | Result |
|---|---|---|
| BASE-TECH-01 | Link integrity, 26 routes | All 200 (301s are expected trailing-slash redirects); synthetic 404 confirmed real |
| BASE-TECH-02 | Metadata/canonical, 4 pages | Titles/descriptions/OG all correct; **no `<link rel="canonical">` found anywhere** — new finding, flagged for a decision |
| BASE-TECH-03 | axe-core v4.11.4 (real local build via Playwright, confirmed `axe.version`), 6 pages | **0 violations** on every page; routine `incomplete` (`color-contrast` on all 6, `video-caption` on `/work/flagstone`) — not failures, need manual confirmation |
| BASE-TECH-04 | Navigation Timing baseline (explicitly not Lighthouse — no Lighthouse CLI installed, install not pre-approved), `/` and `/work/flagstone` @ 1440×900 | Captured; `/` transfer figure invalid (cache-warmed repeat load, 0 B transferSize on all resources); `/work/flagstone` cold transfer ~198 KB is the trustworthy figure |
| BASE-CLAIM-01 | Flagstone status language (F-025 reverification) | Consistently "submitted for App Store review," explicitly "has not shipped," "Apple approval ... have not been established" — no overclaiming on `/work/flagstone` or its 4 legal pages |
| BASE-BOUND-01 | robots.txt / sitemap.xml | `/archive` and `/runway` correctly noindexed + omitted from sitemap. New finding: `/work/mutual-mesh`, `/work/accessmap`, Flagstone legal pages, `/blog/building-accessmap` are public/200 but omitted from sitemap with no `noindex` — inconsistent, not a leak, flagged for a decision |
| BASE-BOUND-02 | Studio Archive (`Skypie99/studio-archive` → `archive.skypistudio.com`) | Public repo, live site self-describes in its own meta description as "a view-only public archive" — machine-readable confirmation, distinct from the noindexed/auth-gated `/archive` path on the main domain |
| BASE-BOUND-03 | Dashboard repo visibility | Reconfirmed **PRIVATE** |

## New findings surfaced during Phase 00 (not in the original F-0xx list — flagged for later triage, NOT fixed here)

1. **No canonical `<link>` tags site-wide** (BASE-TECH-02).
2. **Sitemap not exhaustive** for several public pages (BASE-BOUND-01).
3. **Reproducible GSAP ScrollTrigger pin-spacer bug**: at desktop/tablet width, clicking "Skip Intro" on Home leaves a stale `div.pin-spacer` intercepting hit-testing over the resolved hero (mobile unaffected; DOM content itself intact). Full repro in the visual baseline report's "Not captured / issues" section.
4. **Dependency audit**: 16 vulnerabilities (2 low/3 moderate/9 high/2 critical), all devDependency-chain only (BASE-GATE-01).

## Known gaps / deferrals

- **Reduced motion** (BASE-PRESERVE-004): UNVERIFIABLE this pass, needs OS/DevTools-level `prefers-reduced-motion` emulation not available in the current tooling.
- **Full Lighthouse lab baseline**: not run — no Lighthouse CLI present locally and installing one was not pre-approved for this phase; Navigation Timing API used as a documented, explicitly-labeled substitute (BASE-TECH-04).
- **`/` cold-cache transfer size**: needs re-measurement in a fresh/incognito context; current figure is cache-warmed and explicitly marked invalid.
