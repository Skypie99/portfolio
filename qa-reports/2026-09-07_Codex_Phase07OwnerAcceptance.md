# Phase 07 — owner visual acceptance

## Outcome

**Owner-approved visual result; full phase gate awaiting one device-checklist confirmation.** The owner supplied real-iPhone Safari screenshots and said, “ok its PERFECT are we done this phase?” The portrait seam, higher landing, full name, one-person credit, and normal-case identity presentation are accepted in the shown states. No source repair is needed or authorized by this evidence review.

`INTRO_HANDOFF_GATE: HOLD` is retained solely because the message does not explicitly state whether the unpictured history, repeat, theme, and orientation checklist actions were all performed. These are not inferred from the images. A verbal confirmation is sufficient; no additional screenshots are required unless a defect was observed.

## Branch, SHA, and changes

- Worktree: `/Users/skypie/Portfolio-codex/portfolio-3.0-phase07-20260905`.
- Branch: `codex/portfolio-3.0-phase07-20260905`.
- Intake clean at evidence commit `4c1ea360df54cc1bfdb07144bc710fb9e02f6d81`.
- Approved source: `d6e378a4f5b76682a3a9b821e7d90c12e255be76`.
- Source tree: `52c276e537fdd06603c5e91dbea48c4b4fef66c2`.
- **NO IMPLEMENTATION CHANGE.** Documentation changes: this report, the current gate receipt, and the scoped QA helper/results under `qa-reports/phase-07-owner-acceptance/`.
- No push, merge, integration, deployment, production mutation, external send, privacy/auth changes, or Phase 08 work. Primary checkout and unrelated worktrees remain untouched.

## Physical-device evidence retained

| Original file | SHA-256 | What it supports |
| --- | --- | --- |
| `/Users/skypie/Downloads/IMG_8190.PNG` | `8a655614e5df65ee36ab4a187279a86035607841162ac1bb931f7a43b3f01de8` | Cinematic meets the dark hero background without the former beige strip, with Safari controls visible. |
| `/Users/skypie/Downloads/IMG_8191.PNG` | `0e9face4ca9aedae646a27949a9de5356dac2e2c11fcd5d9dd4de7b6d6f352af` | Portrait identity and role are visible above browser controls; full name, shorter credit, quieter casing, and landing composition match the requested revision. |

Original screenshots were not edited or copied into the repository. Device model, iOS/Safari version, zoom, VoiceOver status, and the unpictured checklist actions are not supplied. The owner replied to the explicit candidate URL `http://10.0.0.22:3028/?phase07=d6e378a`; the revised visible copy/layout corroborates that candidate. The collapsed Safari address alone does not independently encode a source SHA. No universal-device claim is made.

## Current artifact verification

Read-only source comparison against `d6e378a` for `app`, `components`, `content`, `lib`, and `public`: identical. LAN URL HTTP status: **200**. Both fetched HTML and `out/index.html` match the previously retained SHA-256:

`cd5995bb292327521bf3656a0e67f196e65119846e426c2eee67a83737910ece`.

The existing temporary Node server remains available on port 3028. No hot renderer or production hosting was used.

## Commands, results, and scope

| Check | Actual result |
| --- | --- |
| `git status --porcelain=v1 -b` at intake | Clean isolated branch. |
| `npm run typecheck` | PASS, exit 0. |
| Read-only source/HTTP/hash verification | PASS: source matches, HTTP 200, served and local HTML hashes match. |
| `OVERFLOW_PORT=3028 npm run check:overflow` | Exit 2: `page.goto: Timeout 30000ms exceeded`, navigating to `http://127.0.0.1:3028/404/`, waiting for `networkidle`, at `scripts/overflow-census.mjs:225:20`. The existing server solved fixture availability but not the broader wrapper's readiness problem. No all-routes PASS is claimed. |
| `node qa-reports/phase-07-owner-acceptance/scoped-check.mjs` | PASS, exit 0: 30 cells, 60 initial/arrival frames, zero offenders, 60/60 non-vacuity probes caught. |
| Prior immutable-candidate gates | Reused, not rerun: lint PASS; full suite 96 files/870 passed/2 skipped; rebuilt static integrity 54 passed/1 skipped; final browser matrix 23 passed/zero failures. Source remains identical. |

The scoped check reuses the **exact** `CENSUS` function from `scripts/overflow-census.mjs`, including element-visible-box intersection and the injected 150%-width probe. It does not rely on the known-vacuous `scrollWidth` check. Only fixture/readiness orchestration is different; page load, fonts, and cinematic pin readiness are asserted directly. No app code or original instrument was changed. The instrument hash and per-frame data are in [scoped-check.json](phase-07-owner-acceptance/scoped-check.json).

Coverage: two consecutive runs per light/dark primary viewport at 320×720, 360×800, 375×812, 393×852, and 430×932; one per light/dark desktop boundary at widths 768, 1024, 1280, 1440, and 1728. Initial and arrival states both pass the element census. The role remains above the portrait viewport midpoint; narrow margin is `-360px`, wider margin `0px`. These are desktop Chrome results, not additional physical Safari observations.

Browser-verification skill guidance was used for this last local check. The optional `agent-browser` CLI is unavailable; the repository's existing Playwright-based instrument and a documentation-scoped readiness harness were used. The broader site-wide wrapper failure remains banked as maintenance outside the Phase 07 homepage acceptance scope; it is not erased, called green, or repaired here.

## What's left

One owner confirmation of Back/Forward, reload and repeat Skip Intro, both themes, and portrait → landscape → portrait on the current physical-iPhone candidate. Final gate adjudication follows that report; no new design work is proposed.

## DECISIONS FOR SKY

**Decision:** did all unpictured device-checklist actions work normally? **Recommendation:** confirm verbally if Back/Forward, reload/repeat, both themes, and rotation all passed. **Why:** screenshots prove the shown visuals, not the action sequence or states not pictured. **Alternative:** retain HOLD and finish any skipped checks when convenient. **Impact:** a truthful successful confirmation permits final gate adjudication; a reported defect requires a bounded proposal and explicit repair authorization before source edits. No additional screenshots are needed for a clean result.

The broader site-wide overflow wrapper can be repaired in a separate maintenance scope before a future all-routes/pre-merge check. The assigned Phase 07 overflow coverage now has a passing exact-detector run; no maintenance source change is needed for this phase's visual work.
