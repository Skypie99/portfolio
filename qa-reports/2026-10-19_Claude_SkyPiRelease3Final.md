# SkyPi Release 3 — final integration and accessibility clearance

Date: 2026-10-19 (America/Vancouver) · Branch `claude/skypi-release3-final-20261019` · supersedes the pre-hotfix candidate in PR #29

**Release candidate, verified locally. Not merged, not deployed.** The finished Release 3 Flagstone candidate (`9ddc430`) now sits on the live production baseline (`1001624`, the cinematic desktop hotfix, PR #30). The four measured contrast holds and the video focus-ring exceptions are fixed with token swaps on Flagstone's proof row.

## 1. DECISIONS FOR SKY

- [ ] **Publish Release 3** — merge this branch's PR into `main`, with the head commit pinned and no `--admin`. CI then gates Deploy.
  - Approve publication (Recommended) — every local gate below passes; GitHub CI has to be green on the exact head first.
  - Hold — keep the PR draft.
  - **Rollback:** `git revert -m 1 <merge-sha>` and push, or re-run the last good Deploy (`1001624`).
- [ ] **The light-theme Play focus ring is now ink, not terracotta.** No accent-family colour can pair with the cream halo strongly enough to keep 3:1 over every clip frame (the best is 2.80:1). Ink can (worst frame ≥ 3.61:1). Over the navy clip the cream halo is now the band you see. The terracotta ring elsewhere on the site is unchanged.
  - Keep ink (Recommended) — it is the measured AA fix.
  - Ask for a three-band ring that keeps terracotta. That needs a 2px geometry change and fresh approval.
- [ ] **A pre-existing dark-theme dip on other case studies (not changed by Release 3).** Over the dark golden-hour wash, the shared "Inside the build" kicker and the window captions read 4.04 / 3.79:1 on Claude Corp and 4.42 / 4.42:1 on Dashboard, at worst. They are live today. Release 3 fixes Flagstone only.
  - Follow-up release (Recommended): apply the same `dark:text-ink` swap site-wide, with its own render check.
  - Leave as is.

## 2. BLOCKERS / FAIL_FAST

None in the application. The remaining items need a person: physical-device and assistive-technology checks (section 8), and publication, which is gated on Sky's approval.

## 3. Summary

Release 3 merged onto main with one conflict: the generated `qa-reports/INDEX.md`, which was regenerated. The cinematic hotfix's files are byte-identical to main.

Four class swaps and one CSS rule clear every measured hold, with margin:

- every Flagstone text target now reads ≥ 5.10:1 in the worst single sample (1,008 stable samples);
- the Play focus ring has 0 failing frames over all 902 sought frames and during real playback, in Chromium and WebKit, light and dark. The previous ring, re-applied on the same export, still fails 656–670 light frames.

Typecheck, lint, build, all 1,056 tests, the 32-scenario two-engine matrix and all three overflow censuses pass.

## 4. What shipped (commits on top of `9ddc430`)

- `c405d23`, merge of `origin/main` `1001624`:
  - `app/globals.css` auto-merged; the hotfix's rules and Release 3's rules are separate blocks, and no line was removed;
  - `qa-reports/INDEX.md` conflict resolved with `npm run qa:index`;
  - `components/cinematic/**`, the hotfix tests and the hotfix report are byte-identical to main.
- `e3f1f1d`, the corrections (the tested application commit):
  - `app/work/[slug]/page.tsx`: four Flagstone-only class changes;
  - `app/globals.css`: one Play focus rule;
  - `app/__tests__/flagstone-proof-row.test.tsx`: pins the new classes, keeps other case studies on their old classes, and asserts ring:halo ≥ 9:1 in both themes.
- Receipt commit: this report, `qa-reports/release3-final-20261019/`, and the regenerated index. Evidence only.

## 5. Accessibility corrections

Text was measured as the computed colour against the rendered pixels behind glyph-hidden line boxes, at the minimum over every 2 px sample. It ran in Chromium 151 and WebKit 26.5, at 393/1024/1440 px, over 7 scroll positions.

| Target (Flagstone row) | Was (measured hold) | Change | Now, worst sample |
|---|---|---|---|
| Light labels 01–03 | `ink-meta`, 4.471:1 | `text-ink-muted` (dark keeps `ink`) | 5.697:1 |
| Light provenance | `ink-meta`, 4.481:1 | `text-ink-muted` | 5.691:1 |
| Dark captions 01–03 | `ink-muted`, 3.981:1 | `dark:text-ink` | 5.765:1 |
| Dark kicker "Inside the build" | `accent-ink`, 4.283:1 | `dark:text-ink` (light keeps `accent-ink`, 5.16:1) | 6.447:1 |

`dark:link-hover` would have kept the kicker warm, but its worst-case bound is only about 4.93:1, too thin a margin over the moving wash, so it was not used.

**Play/Pause focus ring (WCAG 1.4.11).** The ring's geometry is unchanged: 2px at a 2px offset, with a 2px canvas halo. What changes is the colour: ink in both themes. That removes the dark accent-ink override.

A two-band ring keeps 3:1 on one side over any frame only when ring:halo ≥ 9:1, because the better side is then at least √pair (Technique C40). The ring:halo pairs:

| Ring | Theme | ring:halo | Worst frame (≥ √pair) |
|---|---|---|---|
| Accent (before) | light | 4.0:1 | 2.00:1 |
| Accent-ink (before) | dark | 9.6:1 | 3.10:1 in theory, 2.91:1 rendered |
| Ink (now) | light | 13.0:1 | 3.61:1 |
| Ink (now) | dark | 14.7:1 | 3.83:1 |

Each sweep tests every one of the clip's 901 frames plus the poster, at 360 angles, at DPR 2, with real keyboard focus. Before = the previous rule re-applied on the same export.

| Sweep | Before: frames with a failing arc / worst | After |
|---|---|---|
| Chromium light 1440, every frame | 656 / 1.95:1 | **0** |
| Chromium dark 1440, every frame | 4 / 2.95:1 | **0** |
| WebKit light 393, every frame | 670 / 1.96:1 | **0** |
| WebKit dark 393, every frame | 31 / 2.91:1 | **0** |
| Real playback after Enter: Chromium light/dark 423/426 captures, WebKit 349/320 | — | **0** |

**Rig disclosure.** The first after-sweep (v1) refit the ring centre on every frame from ring-coloured pixels. An ink ring shares those colours with the clip's dark UI, so the fit drifted up to 2.3 px and sampled off the bands: the "halo" read rgb(52–73) where cream was rendered, which produced false light failures. v2 fits the centre once, from a capture with the clip hidden. That leaves offsets of ≤ 0.47 px and finds the halo on 100% of light angles. Every result above is v2; the v1 runs are kept in `release3-final-20261019/focus/focus-summary.json`.

## 6. Gates and results

The tested commit is `e3f1f1d`, built on Node 24.15.0 / npm 11.12.1 with the dependencies at lockfile `46e68f63`, unchanged. Builds and browser runs went one at a time, under a memory-pressure guard.

| Gate | Result |
|---|---|
| Production build | PASS, 18.8 s. Network: only fonts.googleapis.com (6) and fonts.gstatic.com (32); 0 blocked |
| Typecheck · lint · `git diff --check` | PASS · PASS (no ESLint warnings or errors) · PASS |
| Full suite (after build) | PASS: 118 files, 1,056 passed, 2 existing skips, 0 failed. That is 1,043 for Release 3, +12 hotfix and +1 new |
| Browser matrix, Chromium 151 + WebKit 26.5 | PASS, 32/32. Per engine: 1440/393 × light/dark × normal/reduced/no-JS, plus the table at 100/200% text. It covers paused-on-load and scroll, Enter plays, Space pauses, pause survives a theme flip, visible unobscured focus, keyboard table scroll and exit, and the 217.4 px hero at 393 |
| Automated accessibility (axe, WCAG 2.2 AA tags) | 0 violations. Incomplete items kept for manual review: `color-contrast` (gradient backgrounds, measured above), `video-caption` (silent clip, described in text) and `aria-prohibited-attr` |
| Overflow | Repository `check:overflow`: 108 frames. Four widths: 216 frames = 27 routes × 2 themes × 320/393/1024/1440. No-JS Flagstone: 24 frames. 0 overhangs in each; every planted overflow was caught |
| QA index | `npm run qa:index:check` PASS |

## 7. Preservation

- **Cinematic hotfix, source:** every hotfix file and its tests are byte-identical to `1001624`.
- **Cinematic hotfix, behaviour (built homepage, headless):**
  - plate fit engages on 4/4 plates in desktop Chromium at 1440 and 1920;
  - plate fit stays off on phone and in WebKit, as the hotfix intends;
  - the light-up starts once, with 0 cancels;
  - world parking toggles while the film covers the viewport;
  - reduced motion paints statically;
  - 0 page errors.
- **Homepage vs live:** the built homepage HTML matches live `skypistudio.com` (Deploy `1001624` succeeded), apart from hashes and one environment-only CSP difference: production lists the Archive's Supabase host, which comes from the deploy's repository variables.
- **Flagstone:** the following are as approved and unchanged:
  - the 220px treatment (217.4 CSS px at 393, 1290×2803 aspect);
  - the Version A three-panel row, aligned at desktop and in reading order on phone;
  - the authentic captures and captions;
  - `autoplay: false`;
  - the keyboard table repair.

  Only the four colours and the ring differ from Fable's approved screenshots (`boards/fable-vs-final-*`). Float (`/float/`), Tokyo Through Time and all 27 routes are built, and the overflow census loaded every one of them in both themes.

## 8. Limits

Every check above ran in headless Playwright Chromium and WebKit. None of them is a substitute for:

- Safari on a real iPhone or Mac;
- VoiceOver or another screen reader;
- Windows High Contrast on hardware;
- a human's motion-comfort judgement.

None of those was performed. With JavaScript off, the dark preference falls back to light, as in the earlier candidate.

## 9. Evidence

Everything is in `qa-reports/release3-final-20261019/`:

- `boards/` — before | after and Fable | final;
- `focus/` — summary and crops;
- `data/` — contrast, browser results, overflow, cinematic and gate data;
- `tools/` — the rigs.

The full screenshot sets (96 after-state captures) stay in the local review packet `~/SkyPi_Portfolio_Execution_Review/2026-10-19_release3-final-r1/`, beside the "before" set already tracked at `release3-flagstone-20261019/screenshots/`.

## 10. Process self-check

- **Reuse:** the approved commits, the Codex matrix and the overflow tools were re-run unchanged. New rigs were written only for the wider contrast sweep, the focus centre fit and the cinematic check.
- **Overlap:** the Release 4 branches and PRs (#28, #31), the Codex worktree and the primary `~/Portfolio` checkout were not touched.
