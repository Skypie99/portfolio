# Portfolio Truth Manifest — Cook Out Prompt 1

**Date:** 2026-09-02 (correction pass)
**Status:** Prompt 1, corrected. Superseded conclusions from the initial pass are noted inline where relevant.
**Method:** 6 parallel read-only research passes + direct source verification (grep/read against primary files) + 6 live-URL checks. No writes, merges, deploys, or production side effects performed anywhere except this document, committed only to this isolated worktree/branch.

---

## 0. Authority hierarchy (as applied in this manifest)

1. Exact shipped/submitted release identity or production receipt (e.g. `release/current.json`, live URL response).
2. Current implementation and tests (source code, not docs about the code).
3. Current machine-readable state/governance/release files.
4. Current architecture documentation.
5. Current README/project-state prose.
6. Portfolio copy.
7. Old audits and historical reports.

A README is evidence. It is not automatically authority. Where a lower-tier source (e.g. a README) conflicts with a higher-tier source (e.g. source code or a dated machine-readable release record), the higher tier wins and the lower tier is flagged as drift.

---

## 1. Verified repository identities / SHAs

| Repo | Canonical path | Remote | HEAD / branch | Notes |
|---|---|---|---|---|
| Portfolio | `/Users/skypie/Portfolio` | — | `main` @ `3725e7fd9e619240f17af0c3873cf083b20d4f63` | == `origin/main`, clean, no interrupted state |
| AccessMap / Flagstone | `/Users/skypie/AccessMap-main-merge-20260901` (this worktree is on current `main`) | `github.com/Skypie99/AccessMap` | `main` @ `70b52a3` (2026-09-01) | Primary clone `/Users/skypie/AccessMap` is currently checked out on a diverged side branch, not `main` — don't mistake it for canonical HEAD |
| Ghost Code | `~/Games/pacman-code-trainer` (dir name is legacy) | `github.com/Skypie99/ghost-code` | — | Live at `ghostcode.skypistudio.com`, verified 200 |
| Prompt Library | `/Users/skypie/Prompt_Library` | `github.com/Skypie99/Prompt_Library` (inferred) | `claude/prompt-library-truth-readme-20260828` @ `c6cfa1f`, not merged; `origin/main` = `a3cbead` (2026-08-23) | Live at `prompts.skypistudio.com`, verified 200 |
| Dashboard (public/private) | `/Users/skypie/Dashboard` | `github.com/Skypie99/Dashboard` (private repo, per repo's own doc) | `deploy/real` @ `2b4a39a` (2026-06-19); sibling worktree `Dashboard-dispatch` @ `b8bd3a9` (2026-07-31, `uplift/close-out`) is same repo, newer commit | Public demo live at `dashboard.skypistudio.com` (Vercel), verified 200 — see §7 |
| Claude Corp (public) | `/Users/skypie/Claude_Corp` | `github.com/Skypie99/Claude_Corp` | `main`-equivalent @ `7e961a3` | Live at `claudecorp.skypistudio.com`, verified 200. **This is the editable public-sync target.** |
| Claude Corp (governance) | `/Users/skypie/ClaudeCorp` | `github.com/Skypie99/ClaudeCorp-governance` (remote name `backup`) | `morgan/governance-polish-2026-06-21` @ `fdabf28` | **Distinct repo from `Claude_Corp` above.** Supplies evidence only — read-only for this Cook Out. See §9. |

**Correction from initial pass:** the initial pass treated "Claude Corp" as one repo. It is two: `Claude_Corp` (public site, editable, deploys to `claudecorp.skypistudio.com`) and `ClaudeCorp-governance` (the internal law/role-file repo mirrored locally at `/Users/skypie/ClaudeCorp`). Any public-sync implementation prompt targets `Claude_Corp`, never the governance repo.

---

## 2. Flagstone release-specific identity (AccessMap)

- Product/display name: **Flagstone** (`app.json`). Internal package/slug: **accessmap**. Both current, not contradictory.
- Version: **4.1.1** per `app.json`/`package.json`/`release/current.json`. AccessMap's own `CHANGELOG.md` top entry contradicts this, describing "the 0.2.0 line" as current on `main` — **confirmed wrong**, source-documentation drift, do not use CHANGELOG.md for version claims.
- **Native track:** App Store status `submitted_for_review` per `release/current.json` (schema v2), source `f559417…`, iOS build 33. The record itself flags EAS build ID/timestamp as `UNPROVEN`/`null` — the submission is documented but the precise timing evidence is incomplete even at the source. Local `app.json` `buildNumber: "15"` is stale/diagnostic-only versus the real submitted build 33.
- **Web track (protected, frozen):** `release/web-4.1.1-build33-openfreemap` @ `ebf091c2` — per `DECISIONS_LOG.md` entry `[WEB-DEPLOY-BUILD33-SPLIT]` (2026-09-01), this is the exact source Vercel serves at `flagstone.skypistudio.com` (verified live, 200). Not merged into `main`. **Do not touch — this Cook Out and the repo's own governing decision log both say so.**
- A second, unrelated, unmerged branch `release/flagstone-4.1.1-rc-7e13d76` also exists — not what's in production, don't confuse the two.

---

## 3. Per-project proven capabilities (implementation-verified, not just claimed)

- **Flagstone/AccessMap:** Supabase Postgres + Storage + RLS backend (`auth.uid()`-scoped policies); on-device EXIF stripping via `expo-image-manipulator` before any photo upload, so raw GPS metadata never reaches the server; a parallel off-screen `FlatList` accessibility layer that mirrors every map marker as a labeled, screen-reader-navigable element (map markers are otherwise a single opaque native view to VoiceOver/TalkBack); no analytics/tracking SDKs present in `package.json`. 239 test files exist with CI wired (`ci.yml`, `eas-build.yml`, `eas-testflight-submit.yml`, `lighthouse.yml`, `release-identity.yml`); current pass/fail state at `70b52a3` not independently re-run in this pass.
- **Ghost Code:** genuinely zero-dependency single-file browser game (`index.html` + `cards.js`), 56 cards, keyboard-navigable, `localStorage`-only persistence (`gc.v1`), live on its own domain via GitHub Pages.
- **Prompt Library:** `output: "export"` static build, `localStorage` as the entire data layer, direct browser→Anthropic API calls (`src/lib/anthropic.ts`, streaming via fetch to `api.anthropic.com/v1/messages` using the `anthropic-dangerous-direct-browser-access` header) — no Sky-operated backend in the execution path.
- **Dashboard:** a genuinely audited, gated public-demo architecture — see §7. This is real, non-trivial engineering that the initial pass entirely missed.
- **Claude Corp:** 26 command files exist at `~/.claude/commands/`, of which 15 are human-named domain-role personas — the "15 roles" claim is independently verified accurate against the current filesystem.

## 4. Per-project strongest underused engineering evidence (currently invisible to a portfolio visitor)

- **Flagstone:** `app/work/[slug]/page.tsx:41-67` (Portfolio side) documents an audited reconciliation between the homepage's "2,900+" floor and the exact "2,971" measured figure, backed by a dedicated regression-guard test (`app/__tests__/flagstone-release-status.test.ts`) whose entire purpose is preventing an accidental overclaim about App Store approval vs. submission. The screen-reader parallel-layer solution for the map (§3) is also a strong, specific engineering story currently reduced to the generic phrase "WCAG 2.2 AA accessible UI."
- **Dashboard:** `qa-reports/2026-06-05_PrivacyGate_DemoMode_SignOff.md` records a real privacy near-miss and its fix: an earlier GitHub Pages deploy published the real, sensitive `data/snapshot.json` (452 real reports including security findings and "Decisions for Sky"); it was pulled on 2026-06-01, the real snapshot was `git rm --cached` + gitignored, and a proper demo-mode was engineered — `IS_DEMO` build flag, a synthetic `snapshot.demo.json` scanned for sensitive markers (0 hits), the write path (`decisions/approve`) short-circuited to a no-op in demo mode, and a `guard-demo.mjs` build guard that **refuses to build for any public target unless demo mode is on**. This is a genuine security-conscious engineering story, currently not told anywhere.
- **Prompt Library:** the explicit design constraint ("no server of mine ever sees your data") that forced 20 stacked branches of feature work without ever standing up a backend — already told reasonably well in `content/deliverables.json:355`, but undercut by the misleading claim on the Prompt Library site itself (§6).

---

## 5. Claim matrix

Classification taxonomy used throughout: **CONFIRMED-CORRECT** / **CONFIRMED FACTUAL CONTRADICTION** (Portfolio contradicts itself or hard evidence) / **EXTERNAL PUBLIC SOURCE CONTRADICTION** (a *different* live public page Portfolio references says something inconsistent) / **STALE HISTORICAL FRAMING** / **CURRENT BUT UNDERSELLING** / **UNVERIFIED**.

| Project | Claim | Source | Classification |
|---|---|---|---|
| Portfolio (self) | "no server, no database, and no account: nothing to run, and nothing to breach" | `lib/content.ts:290` | **CONFIRMED FACTUAL CONTRADICTION** — contradicted by `/archive` in the same repo. See §6. |
| Flagstone | "Privacy-first: no tracking, no data sold" | `content/deliverables.json:5` | CONFIRMED-CORRECT (no-tracking part; "no data sold" is a business claim not verifiable from code) |
| Flagstone | "App Store review submitted · August 2026" | `content/deliverables.json:7-8` | CONFIRMED-CORRECT against `release/current.json`, though that source's own timestamp field is UNPROVEN |
| Flagstone | "2,971 tests passing" (measured 2026-08-16) / homepage "2,900+" floor | `app/work/[slug]/page.tsx:77,96`; `app/page.tsx:348-349` | CONFIRMED-CORRECT and self-consistent, but measured against a ref that predates current `main` (`70b52a3`) — needs a fresh count, not re-verified in this pass |
| Flagstone | "WCAG 2.2 AA accessible UI throughout" | `content/blog.json:27` (blog post, published 2026-05-29) | **EXTERNAL PUBLIC SOURCE CONTRADICTION** with AccessMap's own README ("WCAG 2.1 AA"), and **UNVERIFIED** as formal conformance either way — see §8 |
| Flagstone | "WCAG 2.1 AA — fully accessible from signup to reporting" | AccessMap `README.md:20` | UNVERIFIED as formal conformance; real implementation/manual-audit evidence exists (§3, §8) but no automated whole-app scan artifact found |
| Flagstone | "48 findings... accounted for every one"; "1,700+ commits" | `content/deliverables.json:97` | UNVERIFIED — no corroborating primary-source evidence found in this pass |
| Ghost Code | "Retro arcade trainer for CLI commands" | `content/deliverables.json:362` (summary) | **CURRENT BUT UNDERSELLING / STALE PRODUCT POSITIONING** — see §6. Not false; the game does have arcade mechanics (lives, streak, score). But it no longer matches the product's own current self-description. |
| Ghost Code | Live/no-backend/56-card/tech-stack claims | `content/deliverables.json:434,439,449` | CONFIRMED-CORRECT — matches live repo and live URL exactly |
| Prompt Library | "Live, public, and without a backend"; "each run goes straight to Anthropic" | `content/deliverables.json:280,355` | CONFIRMED-CORRECT — Portfolio's own phrasing already correctly discloses the direct-to-Anthropic call |
| Prompt Library | "No account, no backend — your key and prompts never leave your browser" | `prompts.skypistudio.com` / `src/components/HomeClient.tsx:497` | **EXTERNAL PUBLIC SOURCE CONTRADICTION** — materially misleading when Run is used; see §6. Portfolio does **not** repeat this phrasing itself. |
| Prompt Library | "shipped across 20 stacked branches" | `content/deliverables.json:355` | UNVERIFIED — not branch-counted in this pass |
| Dashboard | "Live demo with synthetic data"; "the write path is severed so nothing persists"; link → `dashboard.skypistudio.com` | `content/deliverables.json:185-271` | **CONFIRMED-CORRECT** — verified live (200), verified serving demo-mode content, matches the real audited architecture in §7. Initial pass's "GitHub Pages URL 404s" finding was checking the wrong URL (the Dashboard *repo's own* now-abandoned README, not what Portfolio actually links to) — corrected here. |
| Claude Corp | "fifteen roles with explicit domain boundaries, and a written constitution" | `content/deliverables.json:104,178`; `app/page.tsx:848` | CONFIRMED-CORRECT — independently verified against `~/.claude/commands/` |
| Claude Corp | "This portfolio... was built and maintained entirely within Claude Corp" | `content/deliverables.json:178` | UNVERIFIED — plausible, self-descriptive, not independently checkable |
| Claude Corp | Link labeled "Live demo" → `claudecorp.skypistudio.com` | `content/deliverables.json:163-164` | CONFIRMED-CORRECT — verified 200, and confirmed to be the correct distinct public-sync repo (`Claude_Corp`), not the governance repo |
| Portfolio (self) | Own test count: 567/611 (README, measured 2026-08-16) vs. 763 (`a11y-receipts.json`, measured 2026-08-25) | `README.md:9`; `content/a11y-receipts.json:20` | Internal self-inconsistency — not recruiter-facing, low stakes, should be reconciled |

---

## 6. Prohibited-claim register

Claims that must **not** be published, repeated, or strengthened anywhere (Portfolio or the source repos) until the underlying issue is fixed at the source:

1. **"there is no server, no database, and no account: nothing to run, and nothing to breach"** (`lib/content.ts:290`) — false as a whole-site claim. `/archive` (`app/archive/`, `lib/archive/supabaseClient.ts`, `docs/ARCHIVE_RUNBOOK.md`) is a real Supabase-backed island: magic-link/PKCE auth, Postgres database, Storage for media, all within the same live repo/domain. RLS is the actual security boundary, not the absence of a backend. Correct future framing (do not implement copy yet, per original instruction): *"Most of the public Portfolio is statically exported, while one private/unlisted application surface uses Supabase authentication, data storage, and private media."* Do not publicly promote Studio Archive itself — see §10.
2. **"No account, no backend — your key and prompts never leave your browser"** (Prompt Library site, `src/components/HomeClient.tsx:497`) — materially misleading when Run is used: `src/lib/anthropic.ts` sends the prompt and API key directly from the browser to `https://api.anthropic.com/v1/messages` (confirmed via the `anthropic-dangerous-direct-browser-access` header and endpoint constant). Correct distinction: local *persistence* stays in the browser; there is no Sky-operated backend; but *running* a prompt sends it over the network to Anthropic using the user's key. This claim lives only on Prompt Library's own site — Portfolio does not repeat it.
3. **Formal WCAG conformance certification** for Flagstone at any specific version (2.1 or 2.2) — not supported by an automated whole-app conformance artifact. See §8 for the acceptable alternative phrasing.
4. **Specific unconfirmed Flagstone figures** — "48 findings, all accounted for" and "1,700+ commits" — until sourced.
5. **Claude Corp "24/7"/continuous-autonomy framing**, precise scheduled-task counts, or claims about what individual roles autonomously decide — self-reported inside the system's own docs, not independently checkable.

## 7. External public contradiction register

| Claim on Portfolio (or linked site) | Contradicting external source | Notes |
|---|---|---|
| Flagstone: "WCAG 2.2 AA accessible UI throughout" (`content/blog.json:27`) | AccessMap `README.md:20`: "WCAG 2.1 AA" | Two different version numbers for the same product from two of Sky's own sources. Neither is backed by a conformance scan. Record precisely; do not silently pick one. |
| Prompt Library: "your key and prompts never leave your browser" (own site) | Prompt Library's own `src/lib/anthropic.ts` (direct fetch to `api.anthropic.com`) | The site contradicts its own implementation. Portfolio itself is clean here — its own copy ("each run goes straight to Anthropic") is accurate. |
| Dashboard repo's own `.github/workflows/README.md`: describes GitHub Pages as removed | Dashboard repo's main `README.md`: still describes "deploys via GitHub Actions to GitHub Pages... live at `skypie99.github.io/Dashboard/`" | Internal Dashboard-repo doc drift, not a Portfolio-facing issue — Portfolio links to `dashboard.skypistudio.com` (Vercel demo), which is live and correct. See §7.1 for full story. |

### 7.1 Dashboard — corrected account (supersedes initial pass)

The initial pass concluded the claimed GitHub Pages URL 404s and flagged it as a "landmine." That check was against the wrong URL — the Dashboard *repo's* own (stale) README claim, not the URL Portfolio actually links to. Portfolio links to `https://dashboard.skypistudio.com`, which is **live (verified 200)** and **serves content that self-identifies as demo/synthetic** (verified via direct fetch, matched "Demo"/"demo"/"synthetic" in the page).

The real story, per `qa-reports/2026-06-05_PrivacyGate_DemoMode_SignOff.md` in the Dashboard repo:
- A **real, private, local-only operator application** exists (`/Users/skypie/Dashboard`), gated by Constitutional mandate (Art. 7) because it reads real qa-reports across every project, including unredacted security findings and "Decisions for Sky." Its own `.github/workflows/README.md` confirms: *"Do not add a deploy workflow here"* — a prior public GitHub Pages deploy was **intentionally removed on 2026-06-01** after it was found to publish the real `data/snapshot.json` (452 real reports). `dashboard-app/next.config.ts` now throws if built with `NEXT_DEPLOY_TARGET=github-pages`, as defense-in-depth.
- A **separate, deliberately engineered public synthetic demo** was built afterward (sign-off dated 2026-06-05): an `IS_DEMO` build flag, every real-data reader short-circuited to a committed synthetic `snapshot.demo.json` (scanned for sensitive markers, 0 hits), the write path (`decisions/approve`) neutered to a no-op, and a `guard-demo.mjs` build guard that refuses any deploy build not in demo mode. This is what's live at `dashboard.skypistudio.com`.

**Conclusion:** Portfolio's Dashboard claims are fully correct and, if anything, undersell a genuinely strong security-engineering story (§4). The only actual drift is internal to the Dashboard repo's own README, which still describes the pre-2026-06-01 GitHub Pages path — worth fixing at the source, not a Portfolio risk.

---

## 8. Flagstone accessibility — full evidence tiers (corrected from initial pass)

The initial pass treated "no automated axe artifact" as roughly equivalent to "no WCAG evidence." That's too coarse. Evidence exists at multiple tiers:

- **Intended standard:** stated as 2.2 AA (Portfolio blog) and 2.1 AA (AccessMap README) — inconsistent, needs to be picked once and stated consistently at the source.
- **Implementation evidence:** real — a purpose-built parallel accessibility layer for the map (§3), 44px minimum touch targets, contrast handling, full keyboard navigation on iPad (per `content/blog.json:27`'s technical description).
- **Automated tests:** real — `src/components/A11yLiveRegion.tsx`, `src/lib/a11yText.ts` + tests, `src/navigation/__tests__/tabBarButton.a11y.test.tsx`.
- **Manual evidence:** real — `QA_PLAN_A11Y.md` and roughly 30 dated `qa-reports/*A11y*` audit documents.
- **Screen-reader evidence:** partially documented in prose (the blog post's description of VoiceOver/TalkBack testing of the map) but not captured as a discrete, dated artifact in this pass.
- **Formal third-party audit/certification:** **absent.** No automated whole-app conformance scan (axe/Lighthouse-style) artifact was found for AccessMap, unlike Portfolio which has one (`content/a11y-receipts.json`).

**Acceptable future wording** (not to be implemented yet, per original scope) if the source evidence is presented honestly: *"Built and tested against WCAG 2.2 AA"* — this is supportable given the implementation + automated-test + manual-audit tiers, **without** implying formal certification. Whichever version number (2.1 or 2.2) is used, it must be made consistent across AccessMap's own README and anything Portfolio says. **Do not** state or imply formal conformance/certification. This does **not** require a new AccessMap implementation pass merely because a whole-app automated artifact is missing — see §9.

---

## 9. AccessMap and ClaudeCorp-governance — read-only status

- **AccessMap remains a READ-ONLY EVIDENCE REPOSITORY for this Cook Out.** Its Git objects and receipts (`release/current.json`, dated qa-reports, README) may be used to verify Portfolio claims. The `CHANGELOG.md` version contradiction (§2) and the WCAG version inconsistency (§8) are recorded as **source-documentation drift**, not scheduled for repair tonight, and must not be allowed to mutate Build 33 or the frozen `release/web-4.1.1-build33-openfreemap` branch. No AccessMap implementation prompt is included in the execution graph (§11). If a future pass finds a genuinely critical public contradiction that requires an AccessMap change before Portfolio publication, it should be raised as a **BLOCKER requiring separate future authorization** — none was found in this pass; the WCAG version mismatch and the unconfirmed 48-findings/1,700-commits figures are real but do not block Portfolio publication (see §11 conservative-wording path).
- **`ClaudeCorp-governance` (mirrored locally at `/Users/skypie/ClaudeCorp`) is READ-ONLY GOVERNANCE AUTHORITY for this Cook Out.** It supplies evidence (version strings, role counts, drift findings) but is not an implementation target. The editable public-sync target is `Claude_Corp` (§1), a separate repo. No governance-repo implementation prompt is included in the execution graph.

---

## 10. Studio Archive — private status

`/archive` (`skypistudio.com/archive`) is a **private, auth-gated, unlisted** application surface within the Portfolio repo — not a public-facing feature. It is registered in `UNINDEXED_ROUTES`, ships `noindex`, and hides site chrome via `ChromeGate.tsx`. It is real (Supabase auth/database/storage, per §6 item 1) and its existence is what makes the Colophon's "no server, no database, no account" claim false as a whole-site statement — but **it should not be publicly promoted or turned into a portfolio case study**; it's Sky's own private art catalogue. The only correction needed is to the Colophon's architectural accuracy (§6), not to add visibility to Archive itself.

---

## 11. Execution graph

```
Prompt 1: Portfolio truth lock (this document)
   │
   ├─▶ Portfolio serial track:
   │      Prompt 2 — navigation + CTA
   │      Prompt 3 — story/truth refresh (must respect §6 prohibited-claim register)
   │
   ├─▶ Independent parallel tracks (may run alongside or after Prompt 2/3):
   │      • Ghost Code public sync (positioning refresh only — see §5, no factual fix needed)
   │      • Prompt Library public sync (fix the misleading hero line, §6 item 2)
   │      • Dashboard public/synthetic sync (fix the Dashboard repo's own stale README; no Portfolio-facing fix needed)
   │      • Claude Corp PUBLIC sync — targets `Claude_Corp` only, using `ClaudeCorp-governance` as read-only evidence
   │
   ├─▶ AccessMap: READ-ONLY evidence, no implementation track (§9)
   ├─▶ ClaudeCorp-governance: READ-ONLY evidence, no implementation track (§9)
   │
   └─▶ Final: Fable recruiter/truth/UX acceptance — LAST, after all above.
```

No genuine blocker to this graph was found. The one item that could plausibly delay Prompt 3 — the Flagstone WCAG version inconsistency — does not have to: see the early-publish matrix below, conservative-wording path clears it.

---

## 12. Early-publish matrix (claim-level)

| Project | Claim | Clear / Blocks | Conservative wording clears it? | Deferrable? |
|---|---|---|---|---|
| Ghost Code | All current claims | **CLEAR** | n/a — already accurate | n/a |
| Ghost Code | Positioning ("retro arcade" vs. "calm, modern") | **CLEAR** — not a factual block, a polish opportunity | n/a | Yes, cosmetic, can land whenever the Ghost Code sync prompt runs |
| Prompt Library | Portfolio's own copy ("each run goes straight to Anthropic") | **CLEAR** | Already conservative/accurate | n/a |
| Prompt Library | "never leave your browser" hero line | **BLOCKS the Prompt Library site's own credibility**, but **does not block Portfolio** | Yes — Portfolio already uses the accurate framing and never repeats the misleading line | Yes — the external fix can land on its own timeline; flag the inconsistency, don't hide it |
| Dashboard | All current Portfolio claims | **CLEAR** | Already accurate and verified | n/a |
| Dashboard | Repo's own stale README | **BLOCKS nothing on Portfolio** — internal-repo-only issue | n/a | Yes, whenever the Dashboard sync prompt runs |
| Claude Corp | "15 roles," "written constitution," live-demo link | **CLEAR** | Already accurate | n/a |
| Claude Corp | Broader autonomy framing (not currently on Portfolio, per §6 item 5) | **CLEAR** (nothing currently published needs walking back) | n/a — just don't add it | n/a |
| Flagstone | App Store submission status, test count, no-tracking | **CLEAR** | Already accurate | n/a |
| Flagstone | WCAG version/conformance language | **BLOCKS strengthening the claim further**, does **not** block current Portfolio publication | Yes — "Built and tested against WCAG 2.2 AA" (§8) is supportable without implying certification; Prompt 3 should use this or softer, not a stronger formal-conformance claim | Yes — full reconciliation (picking one version number at the AccessMap source) can happen on AccessMap's own timeline as read-only-flagged drift |
| Flagstone | 48-findings / 1,700-commits figures | **BLOCKS using these specific numbers** until sourced | N/A — just don't cite the unconfirmed numbers | Yes |
| Portfolio (self) | Own test count (567/611 vs. 763) | **CLEAR for visitors** (not shown to them), should still be reconciled | Use the more recent, freshest-measured number | Low priority |

**Net result: the Portfolio (Prompt 2/3) is safe to publish now.** Nothing live is a confirmed error that requires walking back. The real work is (a) not adding new claims beyond what §6/§12 allow, (b) optionally surfacing the underused engineering evidence in §4, and (c) letting the four independent external fixes land on their own tracks without blocking Portfolio.

## 13. Parallel-launch safety matrix

| Track | Safe to launch now? | Depends on |
|---|---|---|
| Portfolio Prompt 2 (nav + CTA) | Yes | Nothing in this manifest |
| Portfolio Prompt 3 (story/truth refresh) | Yes, bounded by §6/§12 | This manifest's prohibited-claim register |
| Ghost Code public sync | Yes | Nothing |
| Prompt Library public sync | Yes | Nothing (independent of Portfolio) |
| Dashboard public/synthetic sync | Yes | Nothing (independent of Portfolio) |
| Claude Corp public sync | Yes, but must target `Claude_Corp`, not `ClaudeCorp-governance` | Correct repo identification (§1) |
| AccessMap implementation | **Not launched** — read-only for this Cook Out | Future separate authorization if a true blocker emerges |
| ClaudeCorp-governance implementation | **Not launched** — read-only for this Cook Out | Not applicable to this Cook Out |
| Fable recruiter/truth/UX acceptance | Last, after all above | All parallel tracks |

---

## 14. Precise replacement for "nothing live is wrong"

The initial pass's blanket conclusion — *"Nothing live on the Portfolio site is a confirmed factual error"* — is replaced with:

- **Confirmed factual contradictions:** 1 — Portfolio's own Colophon ("no server, no database, no account") vs. `/archive`'s real Supabase backend (§6.1). This is a genuine Portfolio-authored claim about Portfolio's own architecture, contradicted by Portfolio's own code.
- **Stale/underselling positioning:** 1 — Ghost Code's "retro arcade trainer" framing vs. its own current "calm, modern terminal-command trainer" self-description. Not false, not urgent, but real drift.
- **External-source/public-demo contradictions (not Portfolio's own copy):** 2 — Prompt Library's own site overstates browser-only privacy; AccessMap's own README cites a different WCAG version than Portfolio's blog post.
- **Unverified claims (real but unconfirmed):** Flagstone's 48-findings/1,700-commits figures; formal WCAG conformance at any version; Claude Corp's "built and maintained entirely within Claude Corp"; Prompt Library's "20 stacked branches."
- **Already-safe, confirmed-correct claims:** the large majority — Flagstone's submission status and test-count self-consistency, all of Dashboard's claims (now fully verified, §7.1), all of Claude Corp's currently-published claims, Ghost Code's factual/technical claims, Prompt Library's own Portfolio-side copy.

---

*Produced by Prompt 1 of the Portfolio Cook Out (correction pass). Committed only to this isolated worktree (`claude/portfolio-cookout-p1-truth-20260902`) — no changes made to `/Users/skypie/Portfolio` main, no other repo touched, no production side effects. AccessMap and ClaudeCorp-governance were read from, never written to.*
