# Cinematic desktop hotfix Report — 2026-10-19

mode: active · model_tier: opus (owner-started session) · project: Portfolio · branch: `claude/cinematic-desktop-hotfix-20261019` (local, not pushed)
loop health: coherence_score high · state_consistency verified against git (base 78169e9 = origin/main) · duplicate_work_detected none · drift_risk low

## 1. DECISIONS FOR SKY

- [ ] **Publish the cinematic desktop hotfix** — three small changes and two test files; no measured visual change; mobile unchanged.
  - **Action:** Push the branch, open a PR with `PR_BODY.md` from the evidence folder, and wait for CI. Then `gh pr merge <n> --merge --match-head-commit <sha>` (never `--admin`), watch Deploy, and run the live checks in REPORT §9.
  - **Rollback:** `git revert -m 1 <merge-sha>` and push (CI-gated deploy), or re-run the last good Deploy.
  - **Why deferred:** a push publishes (public repo) and a merge deploys. Both are irreversible-by-design steps reserved for Sky.
  - **Owner:** this session (Opus).
- [ ] **(Optional, later) Engine-level fix for very large displays** — composite the two locked MID plates as one layer, or drive the plate zoom from the compositor. Only if dropouts are still reported on 2560+/4K/5K screens. Needs a design and approval decision.

## 2. BLOCKERS / FAIL_FAST

None.

## 3. Summary

Release 2's desktop intro had two faults, both reproduced in Chrome 155 and WebKit and both corrected.

1. **Opening restarts:** the opening light-up restarted whenever ScrollTrigger re-parented the pin, at load, on resize, and on mid-scroll refreshes. Our own pin-spacer now stops it.
2. **Partial-scene dropouts:** in the owner's recording, Chrome's ~1 GB tile budget ran out on a 1920-wide DPR-2 window. That is pre-existing, from per-frame plate re-rasterisation, and Release 2's retained light-up fill made it about 2–3× worse. Desktop-only, invisible changes give the budget back: fill `backwards`, and the hidden world backdrop parked while the pinned film covers it.

Measured: checkerboarded frames per pass went from after `0, 7, 8, 27, 5` to `0, 0, 0, 4, 0`; restarts went from 2–4 per load to 1 (7/7 conditions).

## 4. What Shipped (Checkpoints)

Local commits on `claude/cinematic-desktop-hotfix-20261019` (not pushed):

- `fix(cinematic): never re-parent the pin, so the opening light-up runs once` — `CinematicDesert.tsx` (pin-spacer) + `components/__tests__/CinematicDesertPinSpacer.test.tsx`.
- `fix(cinematic): give desktop Chrome its tile budget back` — `globals.css` (desktop fill `backwards`, world parking rule) + `CinematicDesert.tsx` (parking, write-guarded, unmount cleanup) + `components/__tests__/CinematicDesertDesktopTiles.test.tsx`.
- `docs(qa): cinematic desktop hotfix report` — this file + regenerated `INDEX.md`.

## 5. What's Proposed (Not Applied)

| Proposal | File path | What it does | Impact | Rollback documented? |
|---|---|---|---|---|
| Publish the hotfix | branch above | Push, PR, CI, merge (no `--admin`), deploy | Fixes both faults live | Yes |

## 6. Findings by Domain

### Performance (Peter)
- 🔴→🟢 **Opening restart** — `components/cinematic/CinematicDesert.tsx` (pin re-parenting by ScrollTrigger) — fixed with `pinSpacer`.
- 🔴→🟢 **Tile-memory dropouts on large DPR-2 desktops** — plate re-raster churn (pre-existing) plus the retained frame animation (Release 2) — mitigated: 4/5 passes had zero, against a median of 7–35 deployed.
- 🟡 **Residual:** the per-step plate re-raster is Chrome behaviour for main-thread zooms of big layers. Larger displays have less headroom (untested). See §1 option 2.

### Accessibility (Alex)
- 🟢 Reduced-motion first paint, Skip Intro (exact `#hero` landing, instant), keyboard (Tab to Skip Intro + Enter; Space/PageDown) — all identical to deployed in Chromium and WebKit, desktop and mobile. No hydration errors, no horizontal overflow.

### Tests / CI (Gary)
- 🟢 typecheck ✓, lint ✓, build ✓ (guarded, no network), vitest **115 files / 1015 passed / 2 skipped (pre-existing)**, static-integrity ran against a fresh `out/`.
- 🟢 Six new tests. The pin-spacer tests fail on 78169e9 (3 pin moves at hydration, 6 per refresh).

## 6.5 Process Self-Check

### Efficiency Check
- Reviewed `2026-10-19` Release 2 integration notes (memory checkpoint) and the RM first-paint checkpoint, so the RM path is preserved.
- Measurements were interleaved and repeated because single runs on this 8 GB machine vary widely. One exploratory run that looked like a large regression did not survive repetition.

### Overlap Check
No overlap detected: no other branch touches `components/cinematic/**` after 78169e9. The Release 2 worktree and other agents' worktrees were read-only inputs.

### Simplification Opportunities
- **Rejected as smaller-looking but ineffective:** veil changes, credit removal, promotion changes, decode changes.
- **Rejected as larger:** re-boxing plates, directly composited plates, engine rewrite. All were tested and recorded in the evidence folder.

## 7. How to Review

```bash
git -C ~/Portfolio-codex/cinematic-desktop-hotfix-20261019 diff 78169e9..claude/cinematic-desktop-hotfix-20261019
npm run typecheck && npm run lint && npm test
```

Evidence and full method: `~/SkyPi_Portfolio_Execution_Review/2026-10-19_cinematic-desktop-hotfix-r1/REPORT.md`.

## 8. Next Recommended Action

Sky reviews REPORT.md, then approves publication. The flow in §1 goes straight to live, with live re-checks afterwards.
