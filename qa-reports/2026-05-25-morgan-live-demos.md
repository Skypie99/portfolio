# Morgan Briefing — 2026-05-25 (Live Demos Coordination)

```yaml
model_tier: sonnet
mode: ACTIVE
coherence_score: 0.92
state_consistency: pass
duplicate_work_detected: no
drift_risk: low
```

Window covered: 2026-05-25 — Live demo deployment + portfolio link completion cycle

---

## 1. Dependency Graph

**nodes:**
- `sky/accessmap-vercel#deploy` (Sky, action) — import Skypie99/AccessMap to Vercel, add env vars, deploy
- `rory/prompt-library#vercel-deploy` (Rory, deploy) — wire Skypie99/Prompt_Libary to Vercel, get live URL
- `rory/claude-corp#showcase-page` (Rory, build) — static showcase page for Claude Corp GitHub Pages
- `jordan/mutualmesh-web#privacy-gate` (Jordan, review) — review web-facing exposure of location/disability/PII before Shamus touches web compat
- `shamus/mutualmesh-web#compat` (Shamus, build) — web compat layer for MutualMesh (BLOCKED on Jordan gate)
- `shamus/accessmap-web#merge-pr` (Shamus, merge-prep) — create PR for feat/expo-web-vercel-2026-05-25 → main after Sky's Vercel deploy is verified
- `dani/portfolio#ai-design-pass` (Dani, polish) — AI design pass on portfolio cards + demo landing pages
- `alex/portfolio#a11y-pass` (Alex, review) — accessibility pass on portfolio + any new demo pages
- `gary/prompt-library#qa` (Gary, QA) — clean code + type safety QA on Prompt Library (downtime)
- `steve/accessmap-web#qa` (Steve, QA) — clean code + security review on AccessMap web branch (downtime)

**edges:**
- `sky/accessmap-vercel#deploy → shamus/accessmap-web#merge-pr` (gate: live URL verified before merge)
- `jordan/mutualmesh-web#privacy-gate → shamus/mutualmesh-web#compat` (safety: Jordan must approve before any web-facing changes)
- `rory/prompt-library#vercel-deploy → dani/portfolio#ai-design-pass` (data: live URL needed to link from portfolio card)
- `rory/prompt-library#vercel-deploy → rory/claude-corp#showcase-page` (gate: Rory sequenced — Prompt Library first, highest value)
- `gary/prompt-library#qa → rory/prompt-library#vercel-deploy` (gate: QA must pass before deploy is final)
- `steve/accessmap-web#qa → shamus/accessmap-web#merge-pr` (gate: security review on web branch before merge)
- `dani/portfolio#ai-design-pass → alex/portfolio#a11y-pass` (gate: design settled before a11y audit)

---

## 2. Reason for Ordering

- **Rory → Prompt Library deploy first** — fastest value: Next.js static export is trivially Vercel-deployable, no Jordan gate needed (localStorage only, zero user data sent externally, no location/disability triggers). `ASSUMPTION: Prompt Library's next.config.js already has output: 'export' or Rory confirms it during deploy.`
- **Jordan gates MutualMesh web before Shamus** — MutualMesh fires all three highest-priority Jordan triggers: (1) location data, (2) disability/mutual-aid context, (3) PII beyond auth (contact handles, resource data). `Const. Art. 7.6` mandates Jordan as Phase-0 reviewer before any web-facing changes. `LEARNINGS:2026-05-23 — Pure-helper split` confirms Jordan-cleared helpers (`verification.ts`, `contactHandle.ts`, `resourcesRealtime.ts`) are the safe surface — Shamus must not exceed that surface without re-review.
- **AccessMap Vercel deploy requires Sky** — Vercel import flow requires browser OAuth (Chrome is read-only in computer-use, Const. tier enforcement). Env vars `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are in `~/AccessMap/.env` — Sky copies them during the Vercel setup. No agent can do this step. `Const. Art. 7.5` — prohibited action: agents cannot handle sensitive financial/auth data or enter credentials.
- **Shamus merges AccessMap web branch only after live URL verified** — merging before Vercel is confirmed live risks shipping a broken web path to main. Pattern from `qa-reports/2026-05-25-morgan-portfolio-links.md` — verify-first, merge-second. `LEARNINGS:2026-05-24 — Hydration race guard` applies if Shamus touches any async state in the web path during merge prep.
- **Dani + Alex downtime pass** — AI design quality is Sky directive 2026-05-25. Dani leads design entropy review on portfolio cards; Alex audits a11y on any new demo pages. Sequenced after Rory's Vercel URL lands so real URLs are available in the cards. `LEARNINGS:2026-05-24 — Component extraction: omit caller-specific margin from base style` — if Dani extracts any shared card components, apply this pattern (no baked outer margin).
- **Gary + Steve downtime QA** — Sky directive: clean code focus. Gary runs type safety + dead code sweep on Prompt Library (50 features, all localStorage). Steve reviews AccessMap web branch (`feat/expo-web-vercel-2026-05-25`) for any security exposure from the `Platform.OS === 'web'` paths before merge. `LEARNINGS:2026-05-23 — Phase 0a toolchain stack` (MutualMesh) — if Steve checks MutualMesh toolchain during downtime, `react-native-worklets` must stay in dev-deps; removing it breaks Jest even without animations.

---

## 3. Blocked Nodes

- `{node: sky/accessmap-vercel#deploy, why: Vercel import requires browser OAuth + env var entry — agent cannot handle credentials or browser login flows, unblock: Sky goes to vercel.com/new → import Skypie99/AccessMap → add EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_ANON_KEY from ~/AccessMap/.env → deploy, type: DECISION_FOR_SKY}`
- `{node: shamus/mutualmesh-web#compat, why: Jordan privacy gate not yet cleared — location + disability + PII triggers all fire for any web-facing MutualMesh changes, unblock: Jordan reviews and approves web build plan; if BLOCKED Jordan surfaces conditions to Sky, type: BLOCKER}`
- `{node: shamus/accessmap-web#merge-pr, why: Cannot merge before Vercel deploy is live and verified, unblock: Sky completes vercel deploy → Shamus confirms live URL → PR created → Sky merges, type: BLOCKER}`

---

## 4. Checkpoint References

- `{name: accessmap-web-branch-pushed, role: Shamus, artifact: branch:feat/expo-web-vercel-2026-05-25#step-1, qa-report: qa-reports/2026-05-25-morgan-portfolio-links.md:1}`
- `{name: prompt-library-code-pushed, role: Morgan, artifact: branch:release/initial-push#step-1, qa-report: qa-reports/2026-05-25-morgan-portfolio-links.md:1}`
- `{name: mutualmesh-public-verified, role: Morgan, artifact: commit:verified-via-gh-api-2026-05-25, qa-report: qa-reports/2026-05-25-morgan-portfolio-links.md:1}`
- `{name: all-4-repos-public, role: Morgan, artifact: commit:verified-via-gh-api-2026-05-25, qa-report: qa-reports/2026-05-25-morgan-portfolio-links.md:1}`

---

## 5. Duplication Report

No duplications detected this cycle. Prior 7 days of qa-reports surveyed across ~/AccessMap/qa-reports/, ~/MutualMesh/qa-reports/, ~/Portfolio/qa-reports/, ~/Documents/Claude/Projects/Prompt Library Tool/qa-reports/. No Polish Loop Triggered blocks found. No role is being asked to repeat shipped work. Rory's Prompt Library deploy and Gary's QA are complementary, not overlapping — Gary audits code quality, Rory wires the deploy pipeline.

---

## 6. STATE SNAPSHOT

```
updated: 2026-05-25
cycle: live-demos-coordination

Active Modules:
  - AccessMap: web branch staged (feat/expo-web-vercel-2026-05-25), awaiting Vercel deploy + merge
  - Prompt Library: code live on GitHub (Skypie99/Prompt_Libary), needs Vercel deploy
  - MutualMesh: public repo, mobile-only, web build blocked on Jordan gate
  - Claude Corp: public repo, README only, showcase page not yet built
  - Portfolio: live at https://skypie99.github.io/portfolio/, all 4 GitHub links working

Completed this cycle:
  - All 4 repos made public
  - Prompt Library 50 features pushed to GitHub (main)
  - Portfolio GitHub links verified working

Decisions made:
  - Sky directive: get all projects to working live prototypes
  - Sky directive: downtime = QA focused on AI design + clean code
  - Jordan gate confirmed mandatory for MutualMesh web build (Const. Art. 7.6)

Open risks / blockers:
  - AccessMap Vercel deploy: Sky action required (HIGH — blocks web demo + branch merge)
  - MutualMesh web build: Jordan gate not cleared (MEDIUM — no timeline yet)
  - Claude Corp showcase: Rory sequenced after Prompt Library deploy (LOW)

Known contradictions detected:
  - None

Next cycle intent:
  - Rory: deploy Prompt Library to Vercel, get live URL into portfolio card
  - Jordan: review MutualMesh web build plan, produce APPROVE or CONDITIONS
  - Gary + Steve: downtime QA on Prompt Library + AccessMap web branch
  - Dani + Alex: AI design + a11y pass once Rory's URL is live
  - Sky: Vercel deploy for AccessMap (browser action, cannot be delegated)
```

---

## Team dispatch — who does what right now

| Role | Task | Status |
|---|---|---|
| **Rory** | Deploy Prompt Library to Vercel from Skypie99/Prompt_Libary | 🟢 START NOW |
| **Jordan** | Review MutualMesh web build plan — location/disability/PII triggers | 🟢 START NOW |
| **Gary** | QA sweep on Prompt Library — type safety, dead code, clean code | 🟢 START NOW (downtime) |
| **Steve** | Security review on AccessMap web branch (feat/expo-web-vercel-2026-05-25) | 🟢 START NOW (downtime) |
| **Shamus** | Waiting on: (1) Jordan's MutualMesh gate, (2) Sky's Vercel deploy | 🟡 BLOCKED |
| **Dani** | AI design pass — portfolio cards + demo pages (after Rory's URL lands) | 🟡 WAITING on Rory |
| **Alex** | A11y pass — portfolio + demo pages (after Dani's design pass) | 🟡 WAITING on Dani |
| **Sky** | Deploy AccessMap to Vercel: vercel.com/new → import Skypie99/AccessMap → add 2 env vars → deploy | 🔴 SKY ACTION |

## Sky action (one thing)

Go to **vercel.com/new** → import `Skypie99/AccessMap` → add these env vars from `~/AccessMap/.env`:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Hit deploy. Share the URL and Shamus will prep the merge PR.

## Data notes

- Portfolio LEARNINGS.md does not exist — noted
- ~/ClaudeCorp/ is not a git repo — Rory will need to build Claude Corp showcase from scratch or from files in the folder
- MutualMesh has 4 unmerged branches: `feat/mutualmesh-2026-05-24-shamus-resourcemap-polish`, `fix/photo-upload-verified-pipeline-2026-05-25`, `data/sync-types-mig-002-009-2026-05-24`, `will/contact-email-2026-05-24` — these are pre-existing decisions for Sky, not new this cycle
- AccessMap has 24 unmerged branches — bulk of these are from prior cycles; `feat/expo-web-vercel-2026-05-25` is the only active one this cycle
