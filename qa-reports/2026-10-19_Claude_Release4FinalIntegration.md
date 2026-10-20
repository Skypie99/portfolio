# SkyPi Release 4: final integration and corrections (2026-10-19)

**Status: IMPLEMENTATION_COMPLETE / READY_PENDING_RELEASE_3 / NOT_MERGED / NOT_DEPLOYED.**

This continues [`2026-10-19_Codex_Release4ApprovedInteractionIntegration.md`](2026-10-19_Codex_Release4ApprovedInteractionIntegration.md) on its own branch. It resolves that receipt's open findings R4-F03 and R4-F05, adjudicates R4-F04 and the remaining browser assertions, and re-verifies the final candidate. The approved Fable design is unchanged.

## Provenance

| Item | Value |
|---|---|
| Production main at start (verified on GitHub) | `10016243debfff0befe53e9d3af48de587303019`, the merge of cinematic hotfix PR #30 |
| Starting point | `21423048af219419242ba8648018d7f9ca058bf4`, head of draft PR #28 (`codex/skypi-release4-interactions-20261019`), already contains that main |
| Branch | `claude/skypi-release4-final-20261019` (new; PR #28's branch was not pushed to) |
| Application commit tested | `97f2a5bcf84b7d873765caa8bccf0064860db1e2` |
| Worktree | `~/Portfolio-codex/claude-release4-final-20261019` (the primary `~/Portfolio` checkout was not touched) |

Every gate and browser run below ran against the working tree whose application files (`app/`, `components/`, `lib/`) are byte-identical to `97f2a5b`. Later commits on this branch change only `qa-reports/`.

## Corrections

**R4-F03, fixed: work-row touch hover residue.** The `#work ol > li:has(a:hover)` row rule and doorway-dot rule in `app/globals.css` applied to every input, so a tap's sticky `:hover` kept a phone row ruled, with its dot at 8px after release (6px rest, 4px pressed, 8px). Only the hover cues now sit inside `@media (hover: hover)`, the same gate the pill's own `[@media(hover:hover)]:` hover uses. Focus-visible and press cues stay ungated, and the gated block still comes before the `:active` dot rule. The built CSS was checked: the old `:is(a:hover, a:focus-visible)` selector is absent. This is the authorized small global-stylesheet change; desktop hover output is identical. `lib/__tests__/work-row-hover-gate.test.ts` guards it: 4 tests pass on the fix, and against the original sheet the gate assertion fails.

**R4-F05, fixed: keyboard return focus after Back in Firefox.** This is a genuine production defect, not a headless artefact. Firefox's `Element::PostHandleEventForLinks` handles Enter on a link by calling `Element::DispatchClickEvent`. That function starts with `clickCount = 1` and copies a count only from mouse source events, so a Firefox keyboard link activation fires `click` with `detail === 1` (Gecko `dom/base/Element.cpp`, read 2026-10-19). The interceptor's `e.detail === 0` test therefore recorded every Firefox keyboard departure as a pointer one, and Back, by design, kept focus on `<main>`. That explains the identical failure on main and candidate. `isKeyboardActivation()` in `lib/returnFocus.ts` now also accepts an anchor that matches `:focus-visible` at click time. That signal comes from the same click, so no listener was added. Mouse and touch activations do not match `:focus-visible`, so pointer Back still focuses `<main>` (verified below).

## Adjudication of the remaining findings

| Finding | Classification | Evidence |
|---|---|---|
| R4-F04 Flagstone accessibility table (`scrollable-region-focusable`, 320px) | **Release 3 dependency, not duplicated.** PR #29 (`9ddc430`) and `claude/skypi-release3-final-20261019` (`c405d23`) both carry `<div class="table-wrap" role="region" aria-labelledby="features-caption" tabindex="0">`. Main and this branch do not | Still the only axe violation here: 2 of 106 scans |
| 18 Firefox native-link-drag `:active` retentions | **Browser native drag-and-drop behaviour, inherited.** Chromium shows the same pattern locally: a drag-away fires `dragstart`, `pointercancel` and `dragend` with no `mouseup`, and the `:active` chain (HTML…LI) remains until the next pointer move, then clears to the 6px rest. The row `<li>` carries `group`, so `group-active` follows that chain. Main's `group-active` press dot does the same | `final-probe.json` observations `*/drag-away-immediately-after-drop` |
| 4 Firefox close-focus helper failures, 2 WebKit menu-exit timings | **Harness sequencing, already resolved by the earlier supplemental checks.** Re-confirmed: every menu exits after navigation (17 to 24ms after route commit), and the Close ring shows on native reverse Tab | `resolved-observations.json` |
| Reduced-motion `reduced-motion/*` early reads | **Pre-paint read artefact.** A held press reads 6px with a 0.00001s transition in every engine and theme by the 25ms sample | `production-audit.json`, `resolved-observations.json` |
| macOS WebKit `keyboard-target` / `focus-visible` (36) and `native-shift-tab-close/webkit` | **Platform keyboard preference.** On macOS, WebKit's plain Tab skips links and buttons; Option+Tab includes them. With Option+Shift+Tab, Close takes focus with the 2px terracotta ring in light and dark. The earlier Linux WebKit run passed these | `ladder-differential.json` (identical on main) |
| Chromium `cdp-touch` held-state reads | **Input-path limitation.** On headless shell 151 the CDP touch-from-mouse path never holds `:active`, on main or on the candidate. Mouse-held press passes fully in Chromium | `ladder-differential.json` |

**Differential, same machine, same harness, production main `1001624` versus the candidate.** Chromium: 28 failures are common to both, 0 fail only on main, and 0 checks shared by both builds fail only on the candidate. The 16 candidate failures without a main counterpart are Release 4 design assertions the harness applies only to the candidate; they fail because the CDP touch path never held `:active`. WebKit: all 36 candidate failures also fail on main. Main fails 42 more, all of them the Release 4 improvements (press dot and timing, 44px menu items, Contact shadow withdrawal). **No candidate regression was found.** No assertion was weakened, and failing assertions are reported as failures.

## Gates (application `97f2a5b`)

| Gate | Result |
|---|---|
| Focused return-focus + row-gate tests | 5 files, 64 passed |
| `npm run typecheck` | exit 0 |
| `npm run lint` | exit 0, no ESLint warnings or errors |
| `npm run build` (sequential gate, `CIRCLE_NODE_TOTAL=2`) | exit 0, 19.2s. Network: fonts.googleapis.com ×6 and fonts.gstatic.com ×32 only, 0 blocked (`build-summary.json`) |
| Full suite after the build, `--maxWorkers=2` | **118 files, 1,045 passed, 2 skipped, 0 failed** (`full-suite.txt`) |
| Overflow census | 162 frames (27 routes × 2 themes × 320/393/1440): no element crosses the viewport edge; the planted control was caught in 162/162 frames (`overflow.txt`) |
| Export routes | 27/27 HTTP 200 |
| Axe (Chromium, 26 routes plus menu-open, 320/1440, light/dark) | 106 scans: 104 clean, 2 with the inherited R4-F04 table violation |
| Page or console errors | 0 |

## Browser verification (local: macOS, Chromium headless shell 151.0.7922.34, Playwright WebKit 26.5)

`final-probe.mjs`, 130 checks, **130 passed**:

- **Phone taps (393px, touch, light/dark, normal and reduced motion, both engines).** All 5 rows × doorway and title link return to rest after a tap: dot, row rule, and `:active` cleared. Negative control: re-injecting the legacy ungated rule brings the 8px residue back in all 8 profiles, so the probe is sensitive.
- **Desktop 1440 (light/dark, both engines).** 6px rest. Title hover gives the 8px row cue and the rule. Doorway hover is 8px. Press is 4px with `:active`. Drag-away cancel returns to rest. Keyboard focus-visible on the title gives the 8px row cue.
- **Back.** Keyboard Enter then Back reseats on the row link with `:focus-visible`. A Firefox-shaped activation (a `detail: 1` click on a keyboard-focused link) now also reseats. Pointer departure then Back keeps focus on `<main>`.

Production audit, Chromium + WebKit: no-JS doorway navigation and Back, keyboard Enter then Back, touchscreen tap navigation and Back, menu Back, disabled-control fixture: all pass. Reduced-motion and menu sampler: all pass except the macOS WebKit plain-Tab check above.

**Not verified:** Firefox in a real browser. Playwright Firefox 153 cannot connect its Juggler pipe inside this Mac's tool sandbox, and running it outside the sandbox was refused. The F05 cause is established from Gecko source, and the fix is exercised with the same event shape in Chromium and WebKit. Physical iOS Safari, Android Chrome, real Mac Safari and hybrid touch laptops were not tested. Physical held-touch-to-scroll cancellation is unverified. The cinematic GPU behaviour is untouched and was not retested beyond the shared suite.

## Protection

Changed application files: `app/globals.css` (row hover block only), `components/ViewTransitions.tsx` (one call site), `lib/returnFocus.ts` (one helper). Also changed: two test files, plus one new test. No change to the cinematic, `MagneticButton`, the four approved interaction components, content, routes, redirects, config or dependencies.

## Release 3 dependency and remaining steps

Release 3 (draft PR #29) is not merged. A trial merge of this branch with `claude/skypi-release3-final-20261019` conflicts only in the generated `qa-reports/INDEX.md`. Release 3's `globals.css` hunks (around lines 1468 and 1779) do not overlap this one (around line 4377). After Release 3 publishes:

1. `git fetch origin` in this worktree and record the new main SHA.
2. `git merge origin/main`. Resolve `qa-reports/INDEX.md` by staging both sides and running `npm run qa:index`.
3. Run `npm run typecheck && npm run lint`, then the gated `npm run build`, then `npm test -- --maxWorkers=2`, then `npm run check:overflow -- --widths 320,393,1440`.
4. Run `final-probe.mjs` and `audit-production.mjs` with `RELEASE4_BROWSERS=chromium,webkit`. Expect 0 axe violations once Release 3's table repair is present.
5. Push, wait for the four CI checks, then ask the owner for merge authorization.

## DECISIONS FOR SKY

1. **Merge and deploy Release 4 after Release 3 is live** and the steps above pass on the combined commit. Only an owner authorization starts that; no administrator bypass will be used.
