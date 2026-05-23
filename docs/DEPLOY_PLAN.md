# DEPLOY_PLAN.md — AI Portfolio Website

**Authored by:** Rory (DevOps)
**Cycle:** `cycle/auto-2026-05-23` (Day-0 Kickoff)
**Status:** PLAN ONLY. No workflow file written. No deploy performed. No repo created.
**Authority:** Sky's intent > CONSTITUTION v1.3 > role files > skills
**Reference pattern:** `pacman-code-trainer` → `https://skypie99.github.io/pacman-code-trainer/` (Sky's existing GH-Pages success)

---

## 0. TL;DR — The deploy flow at a glance

```
Sky merges cycle/* → main
        │
        ▼
GitHub Actions trigger (push to main)
        │
        ├─ build job: Node 20 → npm ci → npm run build → next exports to /out
        │                                              → upload-pages-artifact@v3
        ▼
        deploy job: deploy-pages@v4 → live at https://<user>.github.io/<repo>/
```

No external pushes from any agent. Sky owns the merge to `main`. GitHub Actions handles the rest once Sky completes the **one-time manual setup** in §3.

---

## 1. `next.config.js` — Required settings for static export to GH-Pages

When Shamus scaffolds the Next.js 15 app next cycle, his `next.config.js` (or `.mjs`) MUST contain these four lines. Each one fixes a specific GH-Pages footgun.

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',                    // [1] writes static HTML to /out, no Node server needed
  basePath: '/portfolio',              // [2] repo-name prefix — see §1.1 ⚠
  images: { unoptimized: true },       // [3] next/image's loader doesn't run on a static host
  trailingSlash: true,                 // [4] avoids GH-Pages 404s on /about → /about/index.html
};

module.exports = nextConfig;
```

### 1.1 ⚠ `basePath` depends on the repo name

GitHub Pages serves project pages at `https://<user>.github.io/<repo-name>/`, so EVERY internal link, asset URL, and route must be prefixed with `/<repo-name>`. Next handles this automatically when `basePath` is set, but the value must match the repo name exactly.

- **If repo is `portfolio`** → `basePath: '/portfolio'`
- **If repo is `Portfolio`** (capital P, matches the local folder) → `basePath: '/Portfolio'` (case-sensitive!)
- **If Sky uses a custom domain** (e.g., `sky.dev`) → `basePath: ''` and add a `CNAME` file in `/public`

**→ Decision deferred to Sky — see §7.**

### 1.2 Asset linking — use `basePath` in code, not hardcoded paths

- For `<Image>` and `<Link>`: Next prefixes `basePath` automatically. Just use `/about`, not `/portfolio/about`.
- For `<img src="...">` in raw HTML or CSS `url(...)`: prefix manually with `process.env.NEXT_PUBLIC_BASE_PATH` (Shamus to expose this via `next.config.js`).
- For favicon and OG images in `<head>`: same — prefix manually.

### 1.3 Required project files

- `/public/.nojekyll` (empty file) — tells GH-Pages NOT to run Jekyll, which would strip files prefixed with `_` (and Next emits `_next/...`). Without this, every page 404s on assets. **CRITICAL.**
- `/public/CNAME` (only if custom domain) — single line, e.g., `portfolio.skydev.com`.

---

## 2. `.github/workflows/deploy.yml` — Outline (NOT WRITTEN)

This is the **shape** of the workflow Sky (or Gary, next cycle) will create. It is not committed this cycle.

### 2.1 Trigger

```
on:
  push:
    branches: [main]   # Only when Sky merges cycle/* → main
  workflow_dispatch:    # Manual re-deploy button in the Actions tab
```

### 2.2 Permissions (top-level)

```
permissions:
  contents: read       # checkout the code
  pages: write         # publish to GH-Pages
  id-token: write      # OIDC token for deploy-pages@v4
```

These are GH-Pages requirements — without `pages: write` + `id-token: write` the deploy step fails with a cryptic auth error.

### 2.3 Concurrency

```
concurrency:
  group: pages
  cancel-in-progress: true   # if Sky pushes twice fast, kill the old build
```

Keeps the deploy queue clean. Last push always wins.

### 2.4 Jobs

**Job 1: `build`**

| Step | Action | Notes |
|---|---|---|
| 1. Checkout | `actions/checkout@v4` | default |
| 2. Setup Node | `actions/setup-node@v4` with `node-version: '20'`, `cache: 'npm'` | match local dev version |
| 3. Install | `npm ci` | reproducible from `package-lock.json` |
| 4. Build | `npm run build` | runs `next build` → emits `/out` |
| 5. Setup Pages | `actions/configure-pages@v5` | grabs Pages config |
| 6. Upload artifact | `actions/upload-pages-artifact@v3` with `path: './out'` | hands off to deploy job |

Runner: `ubuntu-latest`. Estimated runtime: ~90 seconds for a small portfolio.

**Job 2: `deploy`**

| Step | Action | Notes |
|---|---|---|
| 1. Deploy | `actions/deploy-pages@v4` | publishes the artifact |

- `needs: build` (sequential)
- `environment: name: github-pages, url: ${{ steps.deployment.outputs.page_url }}` — gives Sky a clickable link in the Actions UI

### 2.5 Why these action versions

All pinned to the **current GA majors as of 2026-05**:
- `checkout@v4`, `setup-node@v4`, `configure-pages@v5`, `upload-pages-artifact@v3`, `deploy-pages@v4`.
- Major-version pins (not SHAs) — gets security patches automatically, no supply-chain risk because these are first-party GitHub actions.
- If `deploy-pages@v5` ships before the next cycle, Gary should bump in a separate PR (CI infra change, not app code).

---

## 3. One-time manual GitHub setup (Sky does this, click-by-click)

Rory cannot do any of these. They require Sky's GitHub auth.

### 3.1 Create the repo

1. Go to `https://github.com/new`.
2. Owner: `Skypie99`.
3. Repository name: **`portfolio`** (suggested — see §7).
4. Description: "AI Portfolio Website — Sky Halisky's AI deliverables and certificates."
5. **Public** (required for free GH-Pages; private repos need GH Pro for Pages).
6. Do NOT initialize with README, `.gitignore`, or license — the local repo already has files.
7. Click **Create repository**.

### 3.2 Push the local repo to GitHub

```bash
cd ~/Portfolio
git remote add origin https://github.com/Skypie99/portfolio.git
git branch -M main                              # ⚠ Sky only — Rory does not touch main
git push -u origin main
```

⚠ Per Constitution Art. 1, **only Sky runs the `git push -u origin main`**. No agent does this.

### 3.3 Enable GitHub Pages with Actions as source

1. Repo → **Settings** → **Pages** (left sidebar).
2. **Source** dropdown → select **"GitHub Actions"** (NOT "Deploy from a branch").
3. Save. (No branch picker needed in Actions mode.)

### 3.4 (Optional) Custom domain

1. Same Settings → Pages screen → **Custom domain** field → enter e.g. `portfolio.skydev.com`.
2. Click Save → GitHub generates a verification record.
3. At Sky's DNS provider, add a `CNAME` record: `portfolio` → `skypie99.github.io.`
4. Wait for DNS propagation (5 min – 24 hr).
5. Back on the Pages screen, tick **"Enforce HTTPS"**.
6. Add `/public/CNAME` file with the bare domain (e.g., `portfolio.skydev.com`) and commit.
7. Update `basePath` in `next.config.js` to `''`.

### 3.5 Secrets

**None required.** GH-Pages deploys use OIDC + the built-in `GITHUB_TOKEN`. No `NPM_TOKEN`, no API keys, nothing in `Settings → Secrets`. This is one of the reasons GH-Pages is the right choice for a static portfolio.

---

## 4. Local dev vs prod parity — `package.json` scripts

Shamus's scaffolding should produce these npm scripts (Rory recommends, Shamus owns the final `package.json`):

| Script | Command | Used for |
|---|---|---|
| `dev` | `next dev` | Day-to-day local dev. Runs on `localhost:3000`. ⚠ `basePath` is active in dev too — open `http://localhost:3000/portfolio` not `http://localhost:3000`. |
| `build` | `next build` | Produces the static `/out` directory. Same command CI runs. |
| `preview` | `npx serve out -p 3001` | Serves the built `/out` locally to verify the production build before Sky merges. Catches `basePath` and asset-path bugs that `dev` hides. |
| `lint` | `next lint` | Gary will wire this into a CI check next cycle. |
| `typecheck` | `tsc --noEmit` | Gary will wire this into a CI check next cycle. |

**No `start` script.** `next start` requires a Node server, which a static export does not have. If Shamus auto-generates it, delete it to avoid confusion.

### 4.1 Parity gotcha to flag

`next dev` does NOT enforce `output: 'export'` constraints. Things that work in `dev` but break in `build`:
- `<Image>` without `unoptimized: true` → ✅ fixed in §1
- API routes (`/app/api/...`) → ❌ NOT supported in static export. If anyone proposes a contact form (see PLAN §"Decisions deferred to Sky" #5), it must use a third-party form service (Formspree, Netlify Forms, etc.) — not a Next API route.
- `getServerSideProps` or `dynamic = 'force-dynamic'` → ❌ fails the build.

**Rory will flag any of these in next cycle's review if Shamus's code introduces them.**

---

## 5. Pre-deploy checklist

Before Sky merges `cycle/*` → `main` (which triggers deploy), this checklist must be green. Morgan should re-run it in the cycle briefing.

- [ ] `npm run build` succeeds locally with zero warnings about `next/image`, missing `basePath`, or unsupported features.
- [ ] `npm run preview` serves the site at `http://localhost:3001/portfolio/` (note trailing slash) and every page loads.
- [ ] All internal `<Link href="...">` resolve correctly (click every nav item in preview).
- [ ] No console errors on first paint in preview (open DevTools → Console).
- [ ] Alex's a11y checks pass (axe-core / Lighthouse a11y score ≥ 95).
- [ ] `/public/.nojekyll` exists (empty file is fine).
- [ ] If custom domain: `/public/CNAME` exists with the bare domain.
- [ ] No secrets, API keys, or `.env*` files in the commit (`.gitignore` already covers `.env*`; double-check `git status`).
- [ ] Favicon and OG image resolve (manually inspect `<head>` in preview).
- [ ] PLAN.md and FEATURES.md updated to reflect what actually shipped this cycle.

---

## 6. Rollback plan

GitHub Pages is **last-write-wins** but resilient: the previous successful build stays live until the next deploy finishes. So a bad deploy never takes the site down — it just publishes a bad new version.

### 6.1 Standard rollback (preferred — preserves history)

```bash
# On Sky's machine, on main:
git log --oneline -10                    # find the last-known-good commit
git revert <bad-commit-sha>              # creates a new commit that undoes the bad one
git push origin main                     # triggers a fresh deploy of the reverted state
```

Time to live: ~90 seconds (one full build + deploy cycle).

### 6.2 Emergency rollback (if Sky is mid-presentation and the site is broken)

1. Repo → **Actions** tab.
2. Find the **last successful** deploy workflow run.
3. Click **"Re-run all jobs"**.
4. This re-deploys the previous artifact in ~30 seconds.

### 6.3 What NOT to do

- ❌ `git reset --hard` + force-push to `main` — destroys history, violates Constitution Art. 1 hygiene.
- ❌ Manually delete `gh-pages` branch — there is no `gh-pages` branch in Actions-source mode.
- ❌ Disable GH-Pages in Settings → that takes the site fully offline; revert-and-redeploy is faster.

---

## 7. Decisions for Sky

Rory escalates these because they need human judgment, not infrastructure expertise:

| # | Decision | Recommendation | Why it matters |
|---|---|---|---|
| 1 | **Repo name** | `portfolio` (lowercase, short, clean URL `skypie99.github.io/portfolio/`) | Sets `basePath` in `next.config.js` and the live URL forever |
| 2 | **Custom domain** | Defer to next cycle. Ship to `skypie99.github.io/portfolio/` first, add domain after content is live. | Custom domain adds DNS + verification complexity; not worth it Day-0 |
| 3 | **Deploy branch** | `main` (confirmed default) | Matches Constitution Art. 1 — Sky owns merges to main, main is the deploy trigger |
| 4 | **Public vs private repo** | Public | Free GH-Pages requires public; portfolio is public-facing anyway |
| 5 | **Node version** | `20` (current LTS) | Matches `package.json` engines field Shamus will set; CI and local dev must agree |

Sky's answers feed directly into:
- Shamus's `next.config.js` (decision #1)
- Sky's manual GitHub setup (#1, #2, #4)
- Future workflow file (#3, #5)

---

## 8. Out-of-scope for this cycle (Rory will pick up next cycle)

- Actually writing `.github/workflows/deploy.yml` — waits until Shamus's scaffolding is real code, so the workflow can be tested against an actual build.
- CI lint + typecheck workflow (Gary's territory — Rory will coordinate so we have ONE workflow per concern, not duplicates).
- Branch protection rules on `main` (require PR review, require CI green) — proposes to Sky in next cycle's briefing.
- Dependabot config for action and npm updates.
- Performance budget enforcement (Peter's territory — Rory wires the CI hook).

---

## 9. Constitutional compliance check

- ✅ **Art. 1** — No commits to `main`. This file lives on `cycle/auto-2026-05-23`.
- ✅ **Art. 5** — No external side effects. No `gh repo create`, no `git push`, no API calls, no actual deploy.
- ✅ **Art. 9** — Rory does not message Sky. This document is a deliverable; Morgan aggregates it into the cycle briefing.
- ✅ **Credentials** — Zero secrets handled, requested, or named. GH-Pages auth is OIDC-only.
- ✅ **Cycle scope** — Docs only. No workflow file written.

---

*Rory out. Next cycle: write the actual `deploy.yml` once Shamus has a buildable Next.js app to deploy.*
