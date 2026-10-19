# Cinematic desktop hotfix Report — 2026-10-19

mode: active · model_tier: opus (owner-started session) · project: Portfolio · branch: `claude/cinematic-desktop-hotfix-20261019`
loop health: coherence_score high · state_consistency verified against git (base 78169e9 = origin/main) · duplicate_work_detected none · drift_risk low

## 1. DECISIONS FOR SKY

- [x] **Publish the cinematic desktop hotfix** — authorised by the owner directive "COMPLETE AND PUBLISH INTRO HOTFIX" (2026-10-19), for this hotfix only.
  - **Flow:** push the branch → PR into main → every CI check green → `gh pr merge --merge --match-head-commit <sha>` (never `--admin`) → CI-gated Deploy → live check.
  - **Rollback:** `git revert -m 1 <merge-sha>` and push (CI-gated deploy), or re-run the last good Deploy.
- [ ] **(Optional) Real-device sign-off** — real Safari 27 (its "Allow remote automation" is off, so it was not driven), iPhone/Android and the owner's own Chrome profile were not exercised. The Safari engine was tested through Playwright WebKit 26.5.

## 2. BLOCKERS / FAIL_FAST

None.

## 3. Summary

Release 2's desktop intro had two faults, both reproduced in Chrome 155 and WebKit and both corrected.

1. **Opening restarts:** ScrollTrigger re-parented the pin at load, on resize and on mid-scroll refreshes, restarting the opening light-up. Our own pin-spacer stops it.
2. **Partial-scene dropouts (the owner's recording):** Chrome ran out of its ~1 GB GPU tile budget. It re-rasterises every plate GSAP zooms at a new scale on every frame (`will-change: transform` does not stop it) and keeps 2–3 tilings of each full-viewport plate alive. On Chromium desktop each plate is now laid out at its own image pixels and scaled back to the cover box by its `<picture>`. That makes it a directly composited image, so the zoom never re-rasterises, with the same pixels on screen. Two earlier, invisible headroom changes stay: the light-up retains nothing once it ends (`backwards`), and the hidden world backdrop is parked while the film covers it.

Measured at the owner's display settings (headed Chrome 155, 1920×1066, DPR 2):

- **Checkerboarded frames per run** (6 interleaved rounds, cold and warm loads, 2 passes each way): production 2–12 per run, with no clean run; this branch **0 in 12 of 12 runs**.
- **Tile memory for the four plates** (one natural pass, 2 runs each): 353–363 MB mean / 597–706 MB peak → **29 MB / 39 MB**.
- **Page tile peak:** 895–970 MB → **518–547 MB**. Tile-manager out-of-memory snapshots per pass: 63–68 → **0**.
- **Light-up restarts:** 2–4 per load → 1 (7/7 race conditions).

## 4. What Shipped (Checkpoints)

Commits on `claude/cinematic-desktop-hotfix-20261019`:

- `fix(cinematic): never re-parent the pin, so the opening light-up runs once` — `CinematicDesert.tsx` (pin-spacer) + `components/__tests__/CinematicDesertPinSpacer.test.tsx`.
- `fix(cinematic): give desktop Chrome its tile budget back` — `globals.css` (desktop fill `backwards`, world parking rule) + `CinematicDesert.tsx` (parking, write-guarded, unmount cleanup) + `components/__tests__/CinematicDesertDesktopTiles.test.tsx`.
- `fix(cinematic): composite desktop plates straight from their images` — `CinematicDesert.tsx` (`fitPlates`, refit on refresh/resize, cleanup), `plates.ts` (`PLATE_PIXELS`), `globals.css` (desktop fit rules) + `components/__tests__/CinematicDesertPlateFit.test.tsx`.
- `docs(qa): …` — this report + regenerated `INDEX.md`.

## 5. What's Proposed (Not Applied)

| Proposal | File path | What it does | Impact | Rollback documented? |
|---|---|---|---|---|
| Optional real-device sign-off | — | Safari 27, iPhone, Android, owner profile | Closes the remaining verification gap | n/a |

## 6. Findings by Domain

### Performance (Peter)
- 🔴→🟢 **Opening restart** — `components/cinematic/CinematicDesert.tsx` (pin re-parenting by ScrollTrigger) — fixed with `pinSpacer`.
- 🔴→🟢 **Tile-memory dropouts on large DPR-2 desktops** — per-frame plate re-raster (pre-existing), made worse by Release 2's retained frame animation — fixed at the root. Plates are composited straight from their images on Chromium desktop: 0 raster-scale changes per plate, 0 checkerboarded frames in 12/12 runs.
- 🟡 **Not changed:** the cliff rim-glow is still re-rasterised as it zooms (~117 MB). The page now peaks at about 520–550 MB against the ~1006 MB budget, so this leaves headroom.

### Design / visual (Dani)
- 🟢 **Same picture.** Headed Chrome 155: every plate registers at (0,0) against production at DPR 1, 1.5 and 2. At 1.25 and 2.2 a few patches read ±1–2 device px (sub-pixel). Fewer than 0.11% of pixels differ by more than 8/255, the mean shift is 0, and there is no softening (1–3% crisper; GPU vs raster resampling).
- 🟢 **Unchanged paths:** WebKit, phones and wide windows keep today's code, and captures match production within the noise floor.
- 🟡 **Emulated-DPR quirk:** in Playwright's emulated-DPR headless Chromium only, lower plates sit 2–4 device px low. Real Chrome renders at true DPR and showed no offset.

### Accessibility (Alex)
- 🟢 No change, verified identical to production in Chromium and WebKit, desktop and mobile:
  - reduced-motion first paint;
  - Skip Intro (exact `#hero` landing on desktop);
  - keyboard (2 Tabs to Skip Intro; Space/PageDown);
  - no hydration errors and no horizontal overflow.
- 🟢 axe on `/`: 0 violations in all 16 combinations (engines × viewports × themes), for both builds. Incomplete items are identical: `color-contrast`, the documented gradient case.

### Tests / CI (Gary)
- 🟢 typecheck ✓, lint ✓, build ✓ (guarded; only fonts.googleapis.com and fonts.gstatic.com contacted), vitest **116 files / 1021 passed / 2 skipped (pre-existing)**.
- 🟢 New tests (12 in total):
  - pin never moved (fails on 78169e9);
  - desktop-only parking and fill rules;
  - `PLATE_PIXELS` matches the real files;
  - the fit maps each box onto the cover box about the 50%/70% zoom centre, on whole device pixels;
  - the fit applies only on Chromium desktop windows no wider than a plate;
  - unmount removes the fit;
  - CSS rules sit in desktop media only.

## 6.5 Process Self-Check

### Efficiency Check
- Reviewed the Release 2 and RM first-paint checkpoints so the RM path is preserved.
- Single runs vary on this 8 GB machine, so every comparison was interleaved, rotated and repeated. An earlier "mitigation only" candidate (fill + parking) still drew 2–3 checkerboarded frames in every run; it was not published.

### Overlap Check
No overlap: no other branch touches `components/cinematic/**` after 78169e9. Releases 3 (PR #29) and 4 (PR #28) were not modified.

### Simplification Opportunities
- **Rejected:**
  - hint-only fixes (`will-change` variants; a constant compositor animation);
  - re-boxed plates;
  - a scroll-timeline rewrite, which would lose the GSAP scrub feel.
- The plate fit is the smallest change that removes the re-raster itself. It needs no new timeline, no per-frame listener and no visual change.

## 7. How to Review

```bash
git diff 78169e9..claude/cinematic-desktop-hotfix-20261019
npm run typecheck && npm run lint && npm test
```

Evidence and full method: `~/SkyPi_Portfolio_Execution_Review/2026-10-19_cinematic-desktop-hotfix-r1/REPORT.md`.

## 8. Next Recommended Action

After deploy, run the live checks: light-up once on skypistudio.com, a headed 1920 pass with zero checkerboarded frames, and Skip Intro on phone. Then do the optional real-device sign-off.
