# SkyPi Release 4: final integration onto the Release 3 baseline (2026-10-19)

**Status: IMPLEMENTATION_COMPLETE / INTEGRATED / VERIFIED / PENDING_OWNER_MERGE_AUTHORIZATION.**

This is the last step of [`2026-10-19_Claude_Release4FinalIntegration.md`](2026-10-19_Claude_Release4FinalIntegration.md): bring the already-approved, already-reviewed Fable interaction work onto the production baseline that now carries Release 3, resolve the one known conflict, and re-verify the whole release against the combined tree. No design was reopened, no implementation was replaced.

## Provenance

| Item | Value |
|---|---|
| Production main, verified on GitHub before and after the merge | `f08c327f0f84ac3cef9e00086ac79e93f125a8d4` (merge of Release 3, PR #29) |
| Release 4 candidate before integration | `db1d14e78214913f21b14cd59aedc59f2b217d1a` (PR #31 head) |
| **Integrated candidate tested** | **`2504cdfd2a2fdf078e60fe8561d14bc0dadee160`** |
| Merge parents | `db1d14e` (Release 4) + `f08c327` (Release 3 main) — a normal merge, history preserved, fast-forwardable push |
| Recoverable checkpoint taken before the merge | local tag `checkpoint-r4-pre-integration`, branch `backup-r4-pre-integration`, both at `db1d14e` |
| Worktree | `~/Portfolio-codex/claude-release4-final-20261019` (the primary `~/Portfolio` checkout was not touched) |
| PR | [#31](https://github.com/Skypie99/portfolio/pull/31) · supersedes [#28](https://github.com/Skypie99/portfolio/pull/28), which is deliberately left OPEN and unmerged |

## Pre-flight

Working tree clean, on `claude/skypi-release4-final-20261019`, upstream `origin/claude/skypi-release4-final-20261019` in step. `git fetch --prune` confirmed remote main at `f08c327`, matching the owner's directive exactly. No lock files, no in-flight edits, and no other agent modifying this worktree. PR #31 reported `mergeable: CONFLICTING`, which is the state this integration exists to clear. Memory pressure 33–35% free before the heavy steps.

## Merge and conflict resolution

`git merge origin/main` produced exactly **one** conflicted path: `qa-reports/INDEX.md`. `app/globals.css` auto-merged (Release 3's hunks around lines 1468 and 1779 do not overlap Release 4's hover gate around line 4516). No other path conflicted.

`qa-reports/INDEX.md` is a **generated** file — `scripts/generate-qa-index.mjs` rebuilds it deterministically from `git ls-files` under `qa-reports/`, byte-ordered, no timestamps, never locale-dependent. It was resolved the way the repository intends: stage the evidence, run `npm run qa:index`, confirm with `npm run qa:index:check`. Both releases' entries survive because the generator derives the list from the merged tree; the regenerated index lists the Release 3 receipts and `release3-final-20261019/` + `release3-flagstone-20261019/` evidence alongside the Release 4 receipts and evidence. `npm run qa:index:check` passes (fixed point).

Nothing was reset, cleaned or force-written. The original `~/Portfolio` checkout was never opened for modification.

## Release 3 integration verified

| Release 3 item | Evidence in the combined tree |
|---|---|
| Enlarged Flagstone first screenshot | `content/deliverables.json` carries the capture's declared `1290 × 2803`; shipped HTML has `--pr-screen-aspect: 1290 / 2803` and exactly one `pr-frame--fit-capture`, sized `w-[72%] sm:w-[53%] lg:w-[58%]` |
| Version A three-panel proof section | `app/__tests__/flagstone-proof-row.test.tsx` (424 lines) and `flagstone-first-proof.test.ts` ship in the combined tree and pass |
| Accessible scrolling-table repair | `public/flagstone/accessibility/index.html` line 72: `<div class="table-wrap" role="region" aria-labelledby="features-caption" tabindex="0">`, present in the export |
| Corrected light/dark contrast, animated-video focus ring, video autoplay disabled | `lib/__tests__/flagstone-utility-contrast.test.ts`, `lib/media.test.ts`, and `"autoplay": false` in `content/deliverables.json` (both Flagstone clips) |
| Authentic screenshots and captions | `release3-flagstone-20261019/` (96 jpg) and `release3-final-20261019/` evidence retained; `Plate` renders as the figure's `<figcaption>` |

### The R4-F04 keyboard issue is resolved — and was NOT re-fixed

The earlier Release 4 accessibility report's finding **R4-F04** (`scrollable-region-focusable`, `.table-wrap`, 320px) was a Release 3 dependency. Comparing the two audits on the same harness proves it is gone in the combined build:

| Audit | Commit | Axe scans | Violations | `.table-wrap` |
|---|---|---|---|---|
| Release 4 alone (before) | `2142304` | 106 | **2** — `scrollable-region-focusable` at 320px light + dark | missing `role="region"`/`tabindex` |
| **Combined (this run)** | **`2504cdf`** | **106** | **0** | repaired by Release 3 |

**No duplicate repair was applied.** Release 3's fix is the fix.

## Approved Release 4 design preserved (unchanged, unreopened)

Verified present byte-for-byte after the merge, in `components/ProjectDoorwayButton.tsx`, `components/Button.tsx`, `components/HamburgerNav.tsx` and `app/globals.css`:

- **Four-pixel pressed doorway dot** — `group-active:!h-1 group-active:!w-1` (6px rest → 4px pressed → 8px hover/focus).
- **Deeper terracotta pressed accent** — `group-active:!bg-accent-hover` on the dot.
- **Warm 10% pressed tint** — `active:!bg-accent/10`.
- **Terracotta pressed borders** — `active:!border-accent-primary`.
- **Fast touch acknowledgement** — `active:duration-[calc(var(--dur-fast)/2)]`.
- **Hover gated to hover-capable pointers** — `[@media(hover:hover)]` on every hover cue, plus the Release 4 `@media (hover: hover)` row block in `app/globals.css`.
- **Visually distinct keyboard focus** — `focus-visible:outline-2 … outline-accent-primary`, ungated.
- **Preserved magnetic CTA behaviour** — `MagneticButton` untouched.
- **Improved mobile navigation** — 44px menu targets retained.

The two corrections named in the previous receipt are intact: the work-row hover gate (`lib/__tests__/work-row-hover-gate.test.ts`) and the Firefox-shape keyboard Back seat (`lib/returnFocus.ts` `isKeyboardActivation` now also accepts a `:focus-visible` anchor at click time). The release delta against production main is exactly the approved interaction work — 13 files, `app/globals.css`, `components/{Button,HamburgerNav,ProjectDoorwayButton,SidebarRailLinks,ViewTransitions}.tsx`, `lib/returnFocus.ts` and tests. **No cinematic file, project artwork, content, route, redirect, config or dependency differs from production main.**

## Preservation checks

| Protected thing | Result |
|---|---|
| Cinematic (`components/cinematic/`, `public/cinematic`, `cinematic-masters/`) | **Byte-identical** to both the pre-merge checkpoint and production main |
| Desktop cinematic hotfix (PR #30) | Preserved — no cinematic change in the merge or the release delta |
| Homepage, About, Contact | Exported, 200 |
| Flagstone Release 3 presentation, `/flagstone/{,accessibility,privacy,support,terms}/` | Exported, 200 |
| Float, Tokyo Through Time, `/work/*` (accessmap, claude-corp, dashboard, ghost-code, mutual-mesh, prompt-library, flagstone) | Exported, 200 |
| Reduced-motion, Skip Intro, accessible navigation | `components/cinematic/useReducedMotion.ts`, `components/IntroSkip.tsx`, `components/ViewTransitions.tsx` untouched; reduced-motion and no-JS probes pass |
| All routes | 27/27 exported routes return HTTP 200 |

## Gates and regression results — against `2504cdf`

| Gate | Result |
|---|---|
| Git / merge state | Normal merge, 2 parents, 0 unmerged paths, working tree clean after commit |
| QA index | `npm run qa:index` wrote it; `npm run qa:index:check` passes |
| `npm run typecheck` | exit 0 |
| `npm run lint` | exit 0, no ESLint warnings or errors |
| `npm run build` (`CIRCLE_NODE_TOTAL=2`, one guarded build) | exit 0, all 27 routes exported |
| **Full suite, `--maxWorkers=2`** | **120 files, 1,080 passed, 2 skipped, 0 failed** |
| Overflow census (27 routes × 2 themes × 320/393/1440) | 162 frames, **0 findings**; non-vacuity plant caught 162/162 |
| Focused interaction + Flagstone tests | 5 files, 47 tests pass against the fresh build |

Test totals moved as expected: Release 3 added 2 test files and 35 tests (1,045 → 1,080). The 2 skips are pre-existing. Nothing was weakened or suppressed.

## Browser verification (macOS, Chromium headless shell 151.0.7922.34, Playwright WebKit 26.5)

`final-probe.mjs` on the combined export: **130 checks, 130 passed, 0 errors**.

- **Phone taps** (393px, touch, light/dark, normal + reduced motion, both engines): all 5 rows × doorway and title link return to rest after a tap — dot, row rule and `:active` all clear. The negative control (re-injecting the legacy ungated rule) reproduces the 8px residue in all 8 profiles, so the probe is sensitive and not vacuous.
- **Desktop 1440** (light/dark, both engines): 6px rest, 8px title-hover row cue with the rule, 8px doorway hover, **4px press** with `:active`, drag-away cancel returns to rest, keyboard `:focus-visible` gives the row cue.
- **Back**: keyboard Enter then Back reseats on the row link with `:focus-visible`; a Firefox-shaped activation (`detail: 1` on a keyboard-focused link) also reseats; pointer departure then Back correctly keeps focus on `<main>`.

`audit-production.mjs` (Chromium + WebKit): 27 export routes HTTP 200; **106 axe scans, 0 violations**; no page or console errors (0).

| Check group | Pass | Fail |
|---|---|---|
| `axe` (26 routes + menu-open × 2 widths × 2 themes) | 106 | 0 |
| `export-http` | 27 | 0 |
| `no-js` navigate + Back | 4 | 0 |
| `keyboard-enter-back` | 2 | 0 |
| `touchscreen-tap-back` | 2 | 0 |
| `touchscreen-menu-back` | 2 | 0 |
| `disabled-native-fixture` | 4 | 0 |
| `reduced-motion` | 2 | 2 — pre-paint read artefact, proven below |

### The two `reduced-motion` failures are read timing, not behaviour — re-proven, not inherited

`audit-production.mjs` samples a **held** press after exactly one `requestAnimationFrame` and asserts the contracted `6px`. Two of four engine/theme profiles read `8px` at that instant. Rather than accept the earlier "artefact" verdict, this run re-proved it with a new probe, `harness/reduced-motion-settle.mjs`, which keeps the press held and samples at 0/5/25/100/400ms (`reduced-motion-settle.json`, 24 samples, 0 errors):

| Engine / theme | 0ms | 5ms | 25ms | 100ms | 400ms | after release |
|---|---|---|---|---|---|---|
| chromium / light | 6px | 6px | 6px | 6px | 6px | 10px, `:active` cleared |
| chromium / dark | 8px | 8px | **6px** | 6px | 6px | 10px, `:active` cleared |
| webkit / light | 8px | **6px** | 6px | 6px | 6px | 10px, `:active` cleared |
| webkit / dark | 8px | 8px | **6px** | 6px | 6px | 10px, `:active` cleared |

The press **does** contract to 6px in every engine and theme, by 25ms in all four profiles, with `transition-duration: 0.00001s` — the correct reduced-motion answer (the press is acknowledged without motion). The single-rAF sample simply lands before the computed style updates. The 10px after release is the hover growth with `:active` cleared, which is correct. The previous run had **three** of these flakes (chromium/dark, webkit/light, webkit/dark); this run has **two**. The combined build is strictly no worse.

## Honest limitations

- **Firefox was not run in a real browser.** Playwright Firefox cannot attach its Juggler pipe inside this Mac's tool sandbox, and running it outside the sandbox was refused. The R4-F05 cause is established from Gecko source (`Element::PostHandleEventForLinks` → `DispatchClickEvent` sets `clickCount = 1` for keyboard link activation, so `detail !== 0`), and the fix is exercised against the same event shape in Chromium and WebKit. **This remains a physical-Firefox verification gap.**
- **Physical iOS Safari, Android Chrome, real Mac Safari and hybrid touch laptops were not tested.** Touch checks use Playwright's synthetic `touchscreen.tap`, not a digitiser. **Physical held-touch-to-scroll cancellation is unverified.**
- macOS WebKit's plain Tab skips links and buttons (a platform keyboard preference: Option+Tab includes them); with Option+Shift+Tab the menu Close control takes focus with its 2px terracotta ring in both themes. The earlier Linux WebKit run passed these natively. The harness's plain-Tab assertion is therefore reported as a platform limitation, not a product fix.
- Chromium's CDP touch-from-mouse path never holds `:active` on headless shell 151, on main or on the candidate. Mouse-held press passes fully. This is an input-path limitation.
- Native link drag-and-drop leaves `:active` retained until the next pointer move, identically on main and on the candidate (Chromium reproduces it too). Browser-native, inherited, not a Release 4 regression.
- The cinematic GPU behaviour is untouched and was not retested beyond the shared suite.

## What was committed

Merge commit `2504cdf` resolves `qa-reports/INDEX.md` via `npm run qa:index`. A follow-up commit adds this receipt and the new evidence (`combined-2504cdf/production-audit.json`, `final-probe-combined.json`, `reduced-motion-settle.json`, `harness/reduced-motion-settle.mjs`) and regenerates the index. All prior implementation and evidence is retained — nothing was overwritten; new runs were written under new names so the earlier `final-probe.json` and `production-audit.json` remain as the record of the pre-integration state.

## DECISIONS FOR SKY

1. **One owner authorization remains: merge PR #31.** Everything downstream is mechanical — normal merge (no admin override, no forced merge), wait for production CI (Lint, Typecheck, Test, Build), wait for the GitHub Pages deploy, then verify skypistudio.com serves Release 4.
2. **Do not merge PR #28.** It is superseded by #31 and left open on purpose as the historical record.
3. **Send the two verification gaps to a human before calling the release fully proven:** real Firefox, and physical touch devices (iOS/Android/hybrid). Everything automatable on this machine passed.
