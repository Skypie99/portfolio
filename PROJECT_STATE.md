# PROJECT_STATE — portfolio

_Last compiled: 2026-06-10 by Rory (Release)_

## Latest Release — Final Polish + Honest Copy + Reorder (2026-06-10)

**MERGED + DEPLOYED.** `polish/portfolio-final-2026-06-10` → main `--no-ff` at **`80e512f`** (pushed; GitHub Pages live). Rollback: `git revert -m 1 80e512f`.

- **Honest count/live status (Decision A):** site now says **six projects built/shown, FIVE live** — Mutual Mesh is built but NOT live. Hero "Six projects built, five live on the open internet"; showcase strip reframed (eyebrow "Shipped", heading "Built, shipped, and open."); footer "five of six live"; Mutual Mesh demo link reads **"Demo"** on the card, detail page, and a11y label (`ProjectCard` now derives the label from the data — five live products keep "Live").
- **Card reorder (Decision B):** AccessMap featured #1 → **Claude Corp #2 → Dashboard #3** → Prompt Library → Ghost Code → Mutual Mesh. One `deliverables.json` source, so the homepage grid and `/work` agree; Mutual Mesh stays the full-width grid bookend.
- **Plus the polish pass** (reduced-motion + no-JS title visibility raised, grid bookends, pill contrast, hero scaling).
- **Gates:** lint 0 · typecheck 0 · 184 tests · build + static-integrity clean — green on branch AND merged main. **Intro byte-identical** (cinematic pathset diff empty; `CinematicIntro.tsx` blob hash unchanged).
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
