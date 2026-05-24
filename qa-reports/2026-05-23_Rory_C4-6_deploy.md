# Rory Report — 2026-05-23 — Cycle 4-6 — deploy.yml lands

## 1. DECISIONS FOR SKY

- [ ] **Push `Portfolio` to GitHub as a public repo named `portfolio`** — one-time setup; everything else fires automatically afterward.
  - **Action:** see the copy-pasteable block in §8 below (or `DEPLOY_PLAN.md` §3.1–§3.3).
  - **Rollback:** if the repo or Pages misbehave, delete the repo (`Settings → General → Danger Zone`) or flip `Settings → Pages → Source` back to "Deploy from a branch" / "None". Workflow stops firing immediately.
  - **Why deferred:** Const. Art. 1 (only Sky merges/pushes `main`) and Art. 5 (no external side effects from agents). I cannot run `gh repo create` or `git push -u origin main`.
  - **Owner:** Rory (DevOps).

- [ ] **(Optional, recommended next cycle)** Turn on branch protection for `main` once the repo exists — require PR review + `ci.yml` checks green. Locks Const. Art. 1 in at the platform level. Not required for `deploy.yml` to function.

## 2. BLOCKERS / FAIL_FAST

None. All four prerequisites (`ci.yml`, `.nojekyll`, `next.config.mjs` basePath, buildable `next.config.mjs`) were already in place from earlier cycles. Wrote `deploy.yml` cleanly on first pass; YAML parsed valid via `js-yaml`.

## 3. Summary

Cycle 4-6 deliverable: real `.github/workflows/deploy.yml` written per `DEPLOY_PLAN.md` §2. Build job runs Node 20 with npm cache, `npm ci` + `npm run build`, uploads `out/` via `actions/upload-pages-artifact@v3`. Deploy job depends on build, uses `actions/deploy-pages@v4`, environment `github-pages` exposes the live URL on the Actions run page. Workflow is **DORMANT** — exists on disk, does not fire until Sky creates the GitHub repo, pushes, and switches `Settings → Pages → Source` to "GitHub Actions". No external side effects from this cycle.

## 4. What Shipped (Checkpoints)

- `deploy.yml-create` — wrote `/Users/skypie/Portfolio/.github/workflows/deploy.yml` (82 lines). Triggers: `push: branches: [main]` + `workflow_dispatch`. Top-level `permissions: { contents: read, pages: write, id-token: write }`. `concurrency: { group: pages, cancel-in-progress: true }`. Two jobs:
  - `build` (ubuntu-latest, 6 steps): `actions/checkout@v4` → `actions/setup-node@v4` (node 20, npm cache) → `npm ci` → `npm run build` → `actions/configure-pages@v5` → `actions/upload-pages-artifact@v3` with `path: ./out`.
  - `deploy` (ubuntu-latest, `needs: build`, `environment: { name: github-pages, url: ${{ steps.deployment.outputs.page_url }} }`, 1 step): `actions/deploy-pages@v4` with `id: deployment`.
- `deploy.yml-validate` — parsed back via `js-yaml`. Result: VALID YAML. `name='Deploy'`, triggers=`['push','workflow_dispatch']`, permissions/concurrency/jobs/environment all match spec. Zero tabs, all required top-level keys present.
- `DEPLOY_PLAN.md-update` — appended `## Status — Cycle 4` to `/Users/skypie/Portfolio/docs/DEPLOY_PLAN.md` with two checklists (DONE this cycle / Sky still does manually), the "what happens on first push" sequence, and a note that §6 rollback is unchanged.

## 5. What's Proposed (Not Applied)

| Proposal | File path | What it does | Impact | Rollback documented? |
|---|---|---|---|---|
| Branch protection on `main` | n/a — repo Settings UI, after Sky pushes | Require PR review + `ci.yml` green checks before merge | Locks Const. Art. 1 in at platform level | Yes — toggle the rule off in Settings → Branches |
| Dependabot for npm + actions | `.github/dependabot.yml` (not written) | Weekly PRs to bump `next`, action versions | Reduces supply-chain drift; ci.yml gates each PR | Yes — delete the file |

Neither is in this cycle's scope per `DEPLOY_PLAN.md` §8. Flagging for the next Rory cycle.

## 6. Findings by Domain

### Tests / CI (Gary)
- 🟢 `ci.yml` (Gary, Cycle 2) and `deploy.yml` (this cycle) are correctly **separate** workflows. `ci.yml` gates PRs (lint + typecheck + test + build on `pull_request` + `push: cycle/**`). `deploy.yml` only fires on `push: main` and only does `npm ci` + `npm run build` + upload + deploy. No overlap, no duplicate work. If Gary adds a new check, it goes in `ci.yml`, not here.

### Docs / Knowledge (Will)
- 🟢 `DEPLOY_PLAN.md` now has a `## Status — Cycle 4` section so anyone reading it in the future sees what changed in this cycle versus the original spec. Two checklists make Sky's remaining manual steps unambiguous.

### Security (Steve)
- 🟢 Zero secrets handled, requested, or printed this cycle. GH-Pages auth is OIDC + built-in `GITHUB_TOKEN` only — no `Settings → Secrets` entries needed. Const. credentials prohibition satisfied.

## 7. How to Review

```bash
# See what changed on the cycle branch
git -C ~/Portfolio diff main..cycle/auto-2026-05-23 -- .github/workflows/deploy.yml docs/DEPLOY_PLAN.md

# Eyeball the workflow
cat ~/Portfolio/.github/workflows/deploy.yml

# Confirm CI is untouched
cat ~/Portfolio/.github/workflows/ci.yml

# Read the new status section
sed -n '/## Status — Cycle 4/,$p' ~/Portfolio/docs/DEPLOY_PLAN.md
```

There are no migrations, no `npm` installs, no production touches to apply. Reviewing the diff is the entire review.

## 8. Next Recommended Action

Sky completes the one-time GitHub setup below (5 bullets, ~3 minutes of clicking) and merges `cycle/auto-2026-05-23` to `main`. The first push to `main` will fire `deploy.yml` and publish the site at `https://skypie99.github.io/portfolio/` in ~90 seconds.

### Sky's manual one-time setup (copy-pasteable)

```bash
# 1. Create the public repo on github.com
#    → https://github.com/new
#    → Owner: Skypie99
#    → Repository name: portfolio   (lowercase — matches basePath in next.config.mjs)
#    → Public
#    → Do NOT initialize with README / .gitignore / license
#    → Create repository

# 2. Wire the local repo to that remote and push main
cd ~/Portfolio
git remote add origin https://github.com/Skypie99/portfolio.git
git checkout main                              # (or: git branch -M main, only if main doesn't exist yet)
git push -u origin main                        # ⚠ only Sky runs this — Const. Art. 1

# 3. Enable GitHub Pages with Actions as source
#    → repo → Settings → Pages (left sidebar)
#    → Source dropdown → select "GitHub Actions"   (NOT "Deploy from a branch")
#    → Save  (no branch picker needed in Actions mode)

# 4. (Optional, recommended) Turn on branch protection
#    → Settings → Branches → Add branch protection rule for `main`
#    → require pull request review, require ci.yml checks (lint/typecheck/test/build) green before merge

# 5. (Optional, can defer) Custom domain — see DEPLOY_PLAN.md §3.4. Recommendation per §7 #2: ship to skypie99.github.io/portfolio/ first.
```

Workflow stays DORMANT — and no one is at risk — until step 3 completes.
