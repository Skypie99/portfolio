# Cycle Briefing — 2026-05-23 (Demo State)

**Project:** AI Portfolio Website
**Cycle branch:** `cycle/auto-2026-05-23` (real code; uncommitted in working tree — orchestrator commits after this briefing)
**Mode:** Cycles 4+5+6 complete. Every nav-item route now exists, prerenders, and passes every gate.
**Compiled by:** Morgan (orchestrator-mode, NO external sends — Constitution v1.4 Art. 9.4)
**Roles that ran this cycle:** Shamus, Alex, Steve, Peter, Gary, Rory
**Roles deliberately skipped:** Quinn / Dani / Riley / Dana / Casey / Jordan (no new spec work; Day-0 artifacts still binding)
**Will:** README/LEARNINGS update pending — non-blocking; flagged for next cycle

---

## 1. DECISIONS FOR SKY

### Carried forward (still open)

**NEW-1. Ratify the Cycle 4-6 build (Sky views the demo).** **[VIEW, THEN CONFIRM OR REVERT]**
- All 5 nav routes shipped (`/work`, `/work/[slug]`, `/certificates`, `/about`, `/contact`). Hero CSS animation kept (NEW-1 from Cycle 2/3 — confirmed in this cycle's perf numbers: 106 KB First Load JS across every route).
- Recommendation: **view it (see §6 below), then ratify.** Reverting any part of the cycle is mechanical — every component is isolated.

**NEW-2. GH Pages stay vs Cloudflare migrate.** **[DECIDE]**
- Still unresolved from Cycle 2/3. GH Pages can't send real CSP/HSTS headers. Steve still recommends stay-for-v1 + meta-CSP in `app/layout.tsx`.
- Real-world exploit surface near-zero (static, no auth, no forms). Revisit in Cycle 5+ if Sky ever wants real headers.
- **Recommendation: stay on GH Pages.**

**NEW-3. Accept residual postcss CVEs.** **[ACCEPT]**
- Audit dropped from 26 advisories → 2 after Steve's Next 15.5.18 upgrade. The 2 remaining are transitive postcss inside Next's build pipeline, build-time only, zero runtime exposure.
- The `--force` fix path downgrades Next to 9.3.3 (loses App Router + everything we shipped). Hold.
- **Recommendation: accept** with a README note. Re-evaluate when Next 15.6+ ships.

**NEW-4. Sidebar breakpoint — Tailwind `md:` 768px (shipped) vs Dani spec 960px.** **[CONFIRM 768 OR REVERT TO 960]**
- Shamus shipped 768px; Dani specced 960px. Between 768–960 the sidebar (280px) crowds the main column. Not WCAG-failing; layout-density only.
- **Recommendation: confirm 768px** (tablet/landscape-phone friendly). If Sky prefers 960, it's a 1-line Tailwind config + 2 component edits.

**NEW-5. Disabled button color (Dani vs Alex). RESOLVED.** **[CLOSED]**
- Alex's `text-charcoal/50` applied this cycle. Disabled buttons render at ~4.3:1 — clearly disabled, still readable. Locked before Cycle 6's contact-form scenarios.

### Sky's manual deploy steps (lift verbatim from Rory)

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
git push -u origin main                        # only Sky runs this — Const. Art. 1

# 3. Enable GitHub Pages with Actions as source
#    → repo → Settings → Pages (left sidebar)
#    → Source dropdown → select "GitHub Actions"   (NOT "Deploy from a branch")
#    → Save

# 4. (Optional, recommended) Turn on branch protection for `main`
#    → Settings → Branches → require PR review + ci.yml green before merge

# 5. (Optional, can defer) Custom domain — see DEPLOY_PLAN.md §3.4
```

### Content swap when ready (no rebuild ceremony)

- Edit `content/profile.json`, `content/deliverables.json`, `content/certificates.json`.
- Drop hero images into `public/images/deliverables/<slug>/` and badge images into `public/images/certificates/<slug>/`.
- `npm run dev` hot-reloads on every save. Schema/featured-slot violations surface in `npm run test` (Gary's `content.test.ts` covers it) and again in `npm run build`.

---

## 2. What shipped this session (Cycles 4 + 5 + 6)

**Routes (all 5 prerendered, all nav items live):**
- `/work` — index of all 5 deliverables via `ProjectCard`
- `/work/[slug]` — 5 detail pages: `accessmap`, `claude-corp`, `claude-corp-dashboard`, `prompt-library`, `mutual-mesh`
- `/certificates` — 5 certificate cards
- `/about` — Numbered Steps + bio + "what I'm working on" cards
- `/contact` — mailto CTA + social `<ul>`

**Component primitives:**
- `ProjectCard.tsx` extracted as the canonical card pattern (used on `/work` + future surfaces; whole-card-as-link, `aria-label` summarising destination, no nested anchors).

**A/B picks applied this cycle:**
- Sidebar breakpoint locked at 768px (Tailwind `md:`).
- Hero stays CSS keyframes (NEW-1 from prior cycle confirmed by Peter's numbers).
- Disabled button color: `text-charcoal/50` (Alex's pick).
- Alex F-C4-1: focus-visible Terracotta outline restored on `ProjectCard` (paired with the 4px hover lift).

**Content extended:**
- Deliverables 3 → 5: added **Prompt Library** + **Claude Corp Dashboard**.
- Certificates 3 → 5: added **IBM AI Engineering** + **Microsoft Responsible AI**.

**Infrastructure:**
- `deploy.yml` written (DORMANT — fires when Sky creates the repo + flips Pages to "GitHub Actions").
- `ci.yml` (Gary, prior cycle) unchanged.

**Tests:**
- Gary added 11 new tests across `ProjectCard.test.tsx` (4) + `content.test.ts` (7).
- Total: 17/17 passing. Highest-value addition: `content.test.ts` reads the real JSON so editing `content/` to break schema or featured-slot is caught before build.

---

## 3. Per-role status

**Shamus.** Shipped Cycles 4+5+6 — 5 routes, 5 detail pages via `generateStaticParams`, `ProjectCard` primitive, content extended to 5+5. Picked up Alex F-C4-1 mid-cycle (focus-visible outline restored). Cycle 7 queued: image pipeline + Alex F-C4-2/3 polish + Steve meta-CSP. Not blocked.

**Alex.** PASS WITH FINDINGS — 0 blocking, 3 non-blocking, 0 new color pairs failed. Detail-page hero alt-text from data, `<dl>/<dt>/<dd>` markup on `/work/[slug]`, every external `<a>` carrying `noopener noreferrer` + sr-only "(opens in new tab)". F-C4-1 (focus-visible) applied this cycle; F-C4-2 (flat h2 list) + F-C4-3 (img dimensions for CLS) deferred — both non-blocking polish. Not blocked.

**Steve.** Risk **LOW**. Audit delta C2 → C4-6: CRITICAL 1→0, HIGH 8+→0, MODERATE 1→1 (postcss residual — see NEW-3). `/work/[slug]` path-traversal-safe by three independent layers (whitelist lookup, SlugSchema regex, prerendered files only). Zero `dangerouslySetInnerHTML`, eval, secrets, `http://` URLs. No net-new P0/P1/P2. Not blocked.

**Peter.** Perf **GOOD**. All 7 routes report 106 KB First Load JS (sits 94 KB under the 200 KB budget). 12 HTML files in `out/`, total 1.9 MB on disk. 5 dynamic `/work/[slug]` slugs all generated. Zero new client components, zero new vendor chunks — Shamus respected the budget. Image pipeline (sharp prebuild, WebP at 1x/2x, srcset) queued for Cycle 7 when real images land. Not blocked.

**Gary.** Tests 6 → 17 (+11). Lint 0, typecheck 0, test 17/17, build 0. No flakes across two consecutive runs. jsx-a11y zero new violations. Three `<img>` warnings noted (Shamus app code, intentional under static export — Peter has the WebP fix queued). Next 16 deprecates `next lint` — flagged for migration in a future cycle. Not blocked.

**Rory.** Wrote `.github/workflows/deploy.yml` (82 lines, YAML-validated). Build job: Node 20 + `npm ci` + `npm run build` + `actions/upload-pages-artifact@v3`. Deploy job: `actions/deploy-pages@v4` with OIDC. Zero secrets needed. Status appended to `DEPLOY_PLAN.md`. **DORMANT until Sky completes the 5 manual GitHub steps above.** Not blocked — waiting on Sky.

**Will.** (briefing pending Will's README/LEARNINGS update — non-blocking; flagged for next cycle.)

---

## 4. Build health (snapshot)

| Gate | Result |
|---|---|
| Routes shipped | 7 (Home, `/work`, `/work/[slug]`×5, `/certificates`, `/about`, `/contact`, `/_not-found`) → **12 HTML files** in `out/` |
| First Load JS | **106 kB** across every route (Server Components everywhere except `HamburgerNavMount`) |
| `npm run lint` | **0** warnings / errors |
| `npx tsc --noEmit` | **0** errors |
| `npm run test` | **17/17 passing** across 4 test files |
| `npm run build` | **0** errors; 5 dynamic slugs prerendered |
| `npm audit --omit=dev` | 0 critical, 0 high, **1 moderate** (postcss transitive — accepted, NEW-3) |
| `out/` size on disk | **~1.9 MB** total static output |

---

## 5. Cross-role handshakes resolved this cycle

- **Alex F-C4-1 (focus-visible on ProjectCard) ↔ Shamus** → applied. Global `*:focus-visible` Terracotta outline now fires alongside the 4px hover lift.
- **Alex F-C4-2 (flat sibling `<h2>` list on cards)** → deferred — non-blocking; would require demoting card titles to `<h3>` + adding sr-only section `<h2>`. Low-impact polish.
- **Alex F-C4-3 (img width/height for CLS)** → deferred to image pipeline cycle (Peter owns).
- **Peter image strategy** → queued for Cycle 7 (`sharp` prebuild → WebP + srcset + explicit dimensions) when real images arrive. Plan is in `2026-05-23_Peter_C4-6_perf.md` §4.
- **Gary `next lint` deprecation warning** → queued for Next 16 prep cycle (codemod path documented).

---

## 6. How Sky views the demo

```bash
cd ~/Portfolio
npm run dev              # http://localhost:3000 (no basePath in dev)
```

Click the hamburger top-right; visit every nav item (`/work`, `/work/<any-slug>`, `/certificates`, `/about`, `/contact`); Tab from page top to verify focus lands on Skip Link → Sidebar → main → Footer in order.

**Screenshots:** the orchestrator captured screenshots of the running app and presents them inline in chat — these accompany this briefing.

**Live URL:** blocked on Sky's 5 manual GitHub steps (§1 above). First push to `main` → `deploy.yml` fires → site live at `https://skypie99.github.io/portfolio/` in ~90 seconds.

---

## 7. What's queued for next cycle (after Sky's review)

- **Real content + real images from Sky** — drop into `content/*.json` + `public/images/`; no rebuild required.
- **Cycle 7 polish:**
  - Alex F-C4-2 (heading rotor refactor) + F-C4-3 (img dimensions).
  - Peter — `sharp` prebuild image pipeline (when real images arrive).
  - Gary — `next lint` → ESLint CLI migration before Next 16.
  - Steve — meta-CSP + meta-referrer in `app/layout.tsx`.
- **F-09 Journal/Blog** if Sky changes their mind (currently P2/deferred).
- **Post-deploy:** Rory monitors first deploy run; Casey could spec a `CONTRIBUTING.md` if portfolio ever becomes contributor-facing (unlikely).

---

## 8. FAIL_FAST / BLOCKER record

**None this cycle.** Every sweep finding either applied (Alex F-C4-1, NEW-5 disabled button) or accepted with rationale (NEW-3 postcss CVEs, NEW-4 breakpoint, F-C4-2/3 deferrals). No FAIL_FAST events. No outstanding BLOCKERs. No `main` touched.

---

*Morgan, 2026-05-23 — orchestrator-mode demo-state briefing for Cycles 4+5+6. Authored under Constitution v1.4 Art. 9.4 (no external sends inside orchestrator runs). Briefing lives at `/Users/skypie/Portfolio/qa-reports/cycle-2026-05-23-demo.md` and only there. Sky will see the screenshots inline in chat — Morgan does NOT email this cycle.*
