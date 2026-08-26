# PROJECT_STATE — portfolio

_Last compiled: 2026-08-26 (THE ROOM Phase J close) — superseding the 2026-07-16 Morgan cycle refresh, which sat uncommitted and went a month stale_

## Latest State — THE ROOM complete, `main` merged 2026-08-26

**THE ROOM (The Instrument Room, with the Hand)** — the art-direction program approved 2026-08-23 — is finished. Phases **0 · A · B · C · D · E · G · H · I · J are merged on `main`.** Phase **F (the art wing) is HELD** by Sky: it fires only when a real body of curated work exists, and no placeholder artwork ships, ever.

**Gate at close (on `main`):** typecheck 0 · lint clean · build 26/26 static + 3/3 export, no warnings beyond the documented `headers` + `output: export` notice · **vitest 79 files / 770 pass / 1 skip / 0 todo** · **axe 0 violations across 17 routes × 2 themes** · keyboard **463/463 light + 411/411 dark focus stops, one 2px ring per theme** · **reduced motion emulated for real, 17/17 routes at rest** · 320px and 200%-text reflow clean by element-level census with a per-frame non-vacuity plant · CLS worst 0.0039 (`work-flagstone@768`, run-to-run variable and hugging the 0.004 floor) · homepage First Load JS **173 → 171 kB**.

**Start here before touching this program again:**
`design-reviews/art-direction/2026-08-23/build-reports/J_CLOSEOUT.md` — the ten gates with real numbers, the full conservation table by ID, the guard-migration ledger, the census (187 → 156 arbitrary values), both flagship scorecards, and the honest-limits section.

### What is actually open

- **Sky's ONE device session** — `design-reviews/art-direction/2026-08-23/build-reports/DEVICE_SESSION.md`, 16 rows, ~30 minutes. It **replaces** the ~50 device rows scattered across four programs (`a11y-qa/…/DEVICE_SCRIPT.md`, `ui-polish/…/REPORT.md`, `r4-gallery/04_r4-curation.md`, and the R3 `DEVICE-GATE-CHECKLIST.md`) — none of which were ever run. **Do not re-point anyone at those files.** Rows 6, 8 and 14 carry live decisions.
- **Needs Sky's words, numbers, or an asset** (no agent may supply these): BP9's curator's line (`GalleryWall.tsx`, deliberately empty) · UP-18 badge art for the two full-bleed badges (`CertCard.tsx`) · E1's four `heroPlate` blocks (drafted, awaiting approval) · CP-3 Claude Corp's current hero stats · E8's colophon P10/P11 copy · `humans.txt`'s optional `/* NOTES */` line.
- **Carried decisions that block nothing:** BP4's exhibit lamp (built both ways, captured both, recommendation AS-BUILT) · `/about#method` (two drafts written, unapplied) · `intro-cue-rise` 600ms vs PROTECT-66 (recommendation LEAVE IT) · `browserslist` (measured; recommendation LEAVE IT) · the `public/` tree budget's scope vs the noindexed `/runway` video.
- **`perf/trim-hero-weight`** — a real mobile-tier srcset for the cinematic plates, stranded 263 commits behind with one genuine conflict in `components/cinematic/StaticDesertFrame.tsx` (PROTECT). Needs Sky's unlock; recommendation UNLOCK. Its own session, not a wrap-up item.

### Corrections to what this file used to say

Four claims here were false by the time anyone read them again, which is the reason for this rewrite:

- ~~"Current production = main `544dc1b`"~~ — the R3 arrival train has been superseded by five later trains.
- ~~"3 un-ratified placeholders STILL LIVE: T7 · T9 · T18"~~ — **T7** (the TKTK test count) was reconciled 2026-08-16 into a dated receipt; **T9** (the reduced-motion bracket line) was filled with Sky's own words 2026-07-19; **T18** (`humans.txt`'s "NEEDS-SKY COPY (placeholder — not final)" header) was still live on production until Phase J's sweep found it and K1 removed it, 2026-08-26.
- ~~"Register fork (R3 DECISIONS #1): OPEN, default (a)-INFUSE"~~ — **CLOSED 2026-08-23.** Sky ruled **light arrival** at THE ROOM's mockup gate, from two finished arrivals boarded at equal fidelity. See `13_DECISIONS.md`.
- ~~"NEXT = Sky's ONE device session per `r3-audit/build-plan/DEVICE-GATE-CHECKLIST.md`"~~ — superseded by `DEVICE_SESSION.md` above.

---

## Prior Live State — main `80334ad` (== origin/main), 2026-06-19

**Current production = main `80334ad`** (HEAD == origin/main; GitHub Pages live at https://skypistudio.com). **Gates green: 293 tests across 30 files** · lint 0 · typecheck 0 · build + static-integrity clean. Both deep polish sweeps and the attribution pass are **merged + live** as of 2026-06-19:

- **Deep Polish Sweep #1 + #2 (2026-06-18 / 2026-06-19): MERGED + LIVE.** Both editorial/cohesion sweeps shipped — sweep-1 `df4f6f7` and sweep-2 `a64809d` are on origin/main and live. (The DeepPolish2 qa-report's "SKY-ONLY / Nothing merged or pushed" header is stale — see its prepended SHIPPED note.)
- **Attribution Pass (2026-06-18): MERGED + LIVE.** Hero nameplate ("Sky Halisky" + soft positioning) shipped with the **real headshot photo** (commit `2fc4f8b`) — the earlier "SH monogram placeholder / QUEUED FOR SKY" status is stale (see that report's prepended SHIPPED note). Hub→spoke demo links corrected to canonical subdomains.
- **OG / share-card fix: LIVE** on main.

## Prior Release — Final Polish + Honest Copy + Reorder (2026-06-10)

**MERGED + DEPLOYED.** `polish/portfolio-final-2026-06-10` → main `--no-ff` at **`80e512f`** (pushed; GitHub Pages live; since superseded by `80334ad`). Rollback: `git revert -m 1 80e512f`.

- **Honest count/live status (Decision A):** site now says **six projects built/shown, FIVE live** — Mutual Mesh is built but NOT live. Hero "Six projects built, five live on the open internet"; showcase strip reframed (eyebrow "Shipped", heading "Built, shipped, and open."); footer "five of six live"; Mutual Mesh demo link reads **"Demo"** on the card, detail page, and a11y label (`ProjectCard` now derives the label from the data — five live products keep "Live").
- **Card reorder (Decision B):** AccessMap featured #1 → **Claude Corp #2 → Dashboard #3** → Prompt Library → Ghost Code → Mutual Mesh. One `deliverables.json` source, so the homepage grid and `/work` agree; Mutual Mesh stays the full-width grid bookend.
- **Plus the polish pass** (reduced-motion + no-JS title visibility raised, grid bookends, pill contrast, hero scaling).
- **Gates (at 2026-06-10):** lint 0 · typecheck 0 · 184 tests · build + static-integrity clean — green on branch AND merged main. **Intro byte-identical** (cinematic pathset diff empty; `CinematicIntro.tsx` blob hash unchanged). _(Current main `80334ad` now runs 293 tests across 30 files — see Latest Live State above.)_
- Full report: `summaries/2026-06-10_Portfolio_FinalPolish_Merge_Report.md`.

## Current Status

**PHASE 1 COMPLETE + DEPLOYED (2026-05-29).** All Phase 1 cascades merged to main. Main is production-ready with design finalization, OG meta tags, content URLs, portfolio tests passing, and About expansion complete. GitHub Pages live.

## Context Snapshot

User session merged feat/luxury-showcase-2026-05-25 → main, pushed to origin, verified all 6 projects, and sent iMessage with current live links. Portfolio is production-ready. Feature branches (AccessMap, MutualMesh) remain on active work; no blocking issues for Portfolio itself.

## Recent Outcomes

- Merged `feat/luxury-showcase-2026-05-25` → `main` (fast-forward, 6 files changed, 770 insertions)
- Deployed to GitHub Pages via deploy.yml
- New `AppMockup.tsx` component added (371 lines)
- All tests passing; lint 0, typecheck 0, build clean
- External demo links all verified working

## Phase 1 Execution (2026-05-28 → COMPLETE 2026-05-29)

### COMPLETED
- **Dani:** Design branch finalization + merge to main ✓
- **Peter:** Add OG/Twitter meta tags to layout.tsx ✓
- **Will:** Replace example.com URLs, add Pac-Man entry to deliverables.json ✓
- **Gary:** Portfolio test suite passing (40/40) ✓
- **Casey:** About page expansion complete ✓
- **Morgan:** Phase 1 synthesis + merge to main ✓

### Post-Phase 1 (Active)
- **Gary/Casey:** Implement `lib/__tests__/static-integrity.test.ts` gaps 2–3 (internal link resolution + external link rel attrs) — now in Phase 2 work

## Phase 2 Status (2026-05-29)

### Active Branches
- `security/portfolio-overhaul-2026-05-29` — security enhancements
- `perf/portfolio-overhaul-2026-05-29` — performance optimizations
- `ui/portfolio-overhaul-2026-05-29` — UI refinements
- `release/portfolio-qa-2026-05-29` — QA release candidate
- `will/portfolio-features-2026-05-28` — additional feature work
- `feat/portfolio-wave4-2026-05-27` — wave 4 feature set

### Open Decisions for Sky
1. **Dark mode support** — Phase 4 feature, design direction needed
2. **Blog infrastructure** — Phase 3 conditional, depends on content strategy

## Open Risks

- Static deployment verification assumed working (not explicitly tested in this session)
- AccessMap + MutualMesh on heavy feature branches; merging without QA gate risks regression
