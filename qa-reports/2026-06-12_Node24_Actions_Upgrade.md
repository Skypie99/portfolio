# 2026-06-12 — GitHub Actions Node 24 upgrade (deploy.yml + ci.yml)

**Branch:** `cycle/node24-actions-2026-06-12` · **Scope:** workflow files only, no app code touched.

## Why

Deploy run [27441311467](https://github.com/Skypie99/portfolio/actions/runs/27441311467) carries a deprecation annotation: the pinned actions run on Node.js 20, which GitHub force-switches to Node 24 on **2026-06-16** and removes from runners on **2026-09-16**. Rather than setting the `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true` stopgap, the actions are upgraded to their current Node 24-native majors.

## What changed

| Action | Before | After | Node 24 since | Latest release (verified via GitHub API) |
|---|---|---|---|---|
| actions/checkout | v4 | **v6** | v5.0.0 | v6.0.3 (2026-06-02) |
| actions/setup-node | v4 | **v6** | v5.0.0 | v6.4.0 (2026-04-20) |
| actions/configure-pages | v5 | **v6** | v6.0.0 | v6.0.0 (2026-03-25) |
| actions/upload-pages-artifact | v3 | **v5** | v5.0.0 (via upload-artifact v7) | v5.0.0 (2026-04-10) |
| actions/deploy-pages | v4 | **v5** | v5.0.0 | v5.0.0 (2026-03-25) |

`ci.yml` used `checkout@v4` / `setup-node@v4` in all four jobs — same deadline, updated in the same pass.

## Breaking changes reviewed (per release notes)

- **checkout v6** — persist-credentials now stored under `$RUNNER_TEMP` instead of local git config; requires runner ≥ 2.329.0. GitHub-hosted `ubuntu-latest` is always current. No impact.
- **setup-node v5/v6** — auto-caching from `package.json`'s `packageManager` field, restricted to npm in v6. Both workflows already set `cache: npm` explicitly. No impact.
- **configure-pages v6** — Node 24 bump only (the Next.js <13.3.0 drop landed in v5 and only affects the `static_site_generator` input, which this workflow doesn't use — it runs `npm run build` itself).
- **upload-pages-artifact v4+** — ⚠️ **dotfiles excluded from the artifact by default.** Local build shows `out/` contains `.nojekyll` (from `public/.nojekyll`) and stray `.DS_Store` files. Both are now dropped from the deployed artifact — intentionally: `.nojekyll` is a no-op for workflow-based Pages deploys (Jekyll only runs for deploy-from-branch sources), and `.DS_Store` should never have shipped publicly. Documented in a comment at the step; `include-hidden-files: true` is available if a dotfile ever genuinely needs serving. `public/.nojekyll` left in place.
- **deploy-pages v5** — Node 24 bump only; no breaking changes documented.

## Verification

- `npm run build` — clean static export to `out/` ✅
- `npm test` — 27 files, 201 passed / 1 skipped / 1 todo ✅
- Action versions + release notes verified against `gh api repos/actions/<action>/releases` (not just docs summaries).
- Branch name matches ci.yml's `cycle/**` push trigger, so pushing this branch exercises the upgraded `checkout@v6`/`setup-node@v6` in CI before merge. Result recorded below.
- The upgraded deploy.yml itself only runs after merge to main; the first deploy after merge should be watched for the annotation disappearing and the site rendering normally.

### CI run on this branch

- Result: see PR checks (run triggered on push).

## DECISIONS FOR SKY

- None blocking. Merge of `cycle/node24-actions-2026-06-12` → main is Sky's call (push to main = instant production deploy).
- Note: post-merge, the served site loses `.nojekyll` and `.DS_Store` files (see above — believed harmless/beneficial). If anything looks off after deploy, re-run the previous good deploy from the Actions tab (deploy.yml §6.2 rollback).
