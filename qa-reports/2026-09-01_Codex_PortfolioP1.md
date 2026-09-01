# Codex Portfolio P1 Report — 2026-09-01

## DECISIONS FOR SKY

- [ ] **Review and merge the PORTFOLIO-P1 candidate** — The release-truth update is committed on `codex/portfolio-p1`; merging or deploying remains Sky's decision.
  - **Action:** Review `origin/main..codex/portfolio-p1`, then merge the branch through Sky's normal process if accepted.
  - **Rollback:** Revert implementation commit `f8c8e51` before any later deployment, or revert the merge commit if it has already landed.
  - **Why deferred:** Merging `main` triggers the production deployment and is reserved for Sky.
  - **Owner:** Sky

## BLOCKERS / FAIL_FAST

- None. The first sandboxed build could not reach `fonts.googleapis.com`; the authorized network-enabled rerun and the independent static-integrity rebuild both passed.

## Summary

PORTFOLIO-P1 updates Flagstone's current recruiter-facing status from submission preparation to the confirmed August 31, 2026 App Store review submission. The diff preserves the existing visual system and recruiter-truth repair, adds a narrow regression guard, and introduces no approval, listing, download, or public-App-Store claim.

## What changed

- `app/page.tsx:328` — Homepage hero now says one project was submitted to Apple for App Store review.
- `content/deliverables.json:7-8` — Shared Flagstone status is `App Store review submitted · August 2026`, verified `2026-08-31`; this feeds the featured homepage surface, work listing, project metadata ledger, and related cards.
- `content/deliverables.json:135` — Case-study “Where it stands” names the exact August 31 submission date and explicitly withholds Apple approval and public App Store availability.
- `content/blog.json:27` — Recasts the older TestFlight sentence as a historical statement. The existing “Status as of May 29, 2026” treatment remains intact rather than rewriting history.
- `public/flagstone/index.html:87` — Flagstone's standalone product landing now carries the current submission milestone.
- `app/__tests__/flagstone-release-status.test.ts:1` — Four guards pin the milestone, verification date, recruiter discovery surfaces, prohibited claims, and historical-blog wording.

## Branch + SHA

- Branch: `codex/portfolio-p1`
- Implementation commit: `f8c8e51` (`fix(portfolio): record Flagstone App Store submission`)
- Base: current fetched `origin/main` (`b4b799f`) plus the existing recruiter-truth series, replayed locally as `26e0cec`, `2682584`, `191e11f`, and `df3f1a5`.
- No push, merge, deployment, or production mutation was performed.

## Gates

- `npm run lint` — PASS; no ESLint warnings or errors. Existing Next.js deprecation/export-header notices remain.
- `npm run typecheck` — PASS.
- `npm test` — PASS: 80 files passed, 1 skipped; 724 tests passed, 54 skipped. Existing React/Vite warnings remain unchanged.
- `npm run build` — PASS after the sandboxed attempt failed only on blocked Google Fonts DNS. Static export generated all 26 pages, including `/` and `/work/flagstone`.
- `npm run test:static` — PASS: build passed; 53 tests passed, 1 skipped. Built internal links, route output, assets, metadata integrity, and section anchors passed.
- `git diff --check` — PASS.
- Focused truth tests — PASS: 2 files, 10 tests, including the new four-test release-status guard and the existing six-test dated-blog guard.

## Visual QA

- Candidate served from the built `out/` directory with the repository-required threaded Node preview.
- Homepage: desktop 1440-class and mobile 375-class, light and dark.
- `/work/flagstone/`: desktop 1440-class and mobile 375-class, light and dark; top metadata and `#where-it-stands` inspected.
- `/flagstone/`: desktop 1440-class and mobile 375-class.
- Result: current submission wording is rendered as readable text, wraps without clipping, and causes no horizontal overflow. Browser console produced no warnings or errors during candidate inspection.
- Production comparison: `https://skypistudio.com/` still says “submission in progress”; `https://skypistudio.com/work/flagstone/` still says nothing was submitted. No deployment was attempted.
- Browser limitation: Chromium-only acceptance does not establish Safari/WebKit behavior.

## Claim safety

- Added: submission to Apple for App Store review, with the exact August 31, 2026 date on the case study.
- Not added: Apple approval, App Store release, listing availability, downloadability, rankings, downloads, users, adoption, certification, security/privacy guarantees, performance figures, or new architecture/responsibility claims.
- The case study explicitly states that Apple approval and public App Store availability have not been established.

## Existing truth risks

- `content/blog.json:27` remains a dated May 29 article and still contains broad existing feature claims, including “WCAG 2.2 AA accessible UI throughout,” push notifications, offline-first browsing, and real-time behavior. This pass did not re-verify those claims against the privacy-sensitive Flagstone app repository; they should be handled by a separate evidence-led truth audit.
- `content/deliverables.json:135` says one outside tester received a TestFlight build and then says “there are no users yet.” This may mean “no public users,” but the wording is ambiguous. It was left unchanged because resolving that meaning would widen the narrow release-status pass.
- `content/deliverables.json:5` retains “Privacy-first: no tracking, no data sold.” It was part of the pre-existing recruiter-truth surface and was not re-proven in this portfolio-only pass.

## What's left

- Sky review/merge and any later deployment.
- The larger Flagstone case-study redesign, THE ROOM/Instrument Room work, new galleries/assets/animation, project architecture, and portfolio-wide typography remain explicitly deferred.
- A separate truth audit may resolve the existing risks above without coupling them to this release milestone.

## Process self-check

### Efficiency check

The shared `content/deliverables.json` object was kept as the source for cards, metadata, structured data, and the project route. Only hard-coded homepage/product-landing copies and one historical tense were edited separately.

### Overlap check

The existing recruiter-truth repair branch was preserved and replayed on top of current `origin/main`; no concurrent working tree was edited or cleaned.

### Simplification opportunities

No new status component or schema field was introduced. The existing `status` and `verifiedDate` fields already covered the release milestone cleanly.

## Next recommended action

Review the five-file implementation commit and this receipt, then merge only if Sky accepts the existing truth risks as explicitly deferred.
