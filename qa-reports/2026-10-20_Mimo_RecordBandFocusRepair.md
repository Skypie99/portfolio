# 2026-10-20 — MiMo — Record band keyboard-focus repair (post-Release-6)

**Lane:** Post-Release-6 Record-band keyboard-focus repair (the only source-editing lane authorized).
**Branch:** `mimo/skypi-postr6-focus-20261020` · **Base:** `e5c3624499bdad04dffad0ec0281eb16a0d44868` (= `origin/main` at start)
**Engine:** Playwright Chromium (pre-installed), headless. **This is rendering evidence, not physical Safari / iPhone / VoiceOver testing.**

---

## 1. Baseline reproduction (unchanged `e5c3624` build)

The reported issue **reproduces**, and on **four** links, not three — the fourth Record
row link (`evidence`) sits one Tab past the Release 6 journey's 9-stop cap, so it was
never sampled there. The three named in the brief (`the record`, `the account`,
`the statement`) reproduce exactly as reported.

Method: `qa-reports/record-band-focus-2026-10-20/tools/record-band-focus.mjs` against a
clean build of the base SHA. Two experiments per run: (a) one continuous Tab and one
continuous Shift+Tab journey into the band, sampling **at the instant focus lands** (no
dwell — dwelling lets sibling rows finish revealing and masks the failure), and (b) one
fresh page load per link, tab-walked to that link, then sampled for 1.4 s with no input.

**Measured at focus arrival — ancestor opacity (what the reader sees the ring against):**

| Size | Theme | Tab walk (record → account → statement → evidence) | Shift+Tab walk (evidence → … → record) | Fresh-load trials: settle |
|---|---|---|---|---|
| 1440×900@1 | light | 0.157 · 0.022 · 0.000 · 0.000 | 0.000 · 0.000 · 0.238 · 0.717 | 901–903 ms |
| 1440×900@1 | dark | 0.076 · 0.006 · 0.000 · 0.000 | 0.000 · 0.000 · 0.240 · 0.722 | 902 ms |
| 393×852@2 | light | 0.081 · 0.000 · 0.000 · 0.000 | 0.000 · 0.000 · 0.238 · 0.683 | 901–903 ms |
| 393×852@2 | dark | 0.076 · 0.010 · 0.000 · 0.000 | 0.000 · 0.000 · 0.239 · 0.721 | 901–903 ms |

- **48/48 normal-mode focus arrivals landed on faint content** (ancestorMinOpacity < 0.99);
  worst case **0.000** — the ring landed on fully invisible text.
- Every row was already `reveal-shown` at arrival and **mid-transition**: the reveal was
  fading on the 900 ms depth clock (`--dur-reveal`) behind its 0/80/160/240 ms stagger
  delay, so the reader held a ring on unreadable content for ~0.9 s after every stop.
- The link itself is opacity 1.000; the faintness is the row Reveal container
  (`variant="depth"`), so the ring is visible on invisible text.
- Focus ring itself: solid 2 px, present at every stop.
- Reduced motion and no-JS runs: **0/48 and 0/0 faint** — the floors already rest visible
  there, unchanged.
- Baseline passthrough (all as expected): `/#record` anchor arrival 0 hidden rows; pointer
  scroll entry shows the fade mid-flight (0.37/0.02/0/0) settling to 1; Back return keeps
  scroll and leaves 0 hidden rows; 0 page errors anywhere.

Full baseline log: `evidence/baseline/record-band-focus.json` (12 runs: normal/rm/nojs ×
1440/393 × light/dark).

## 2. Cause

Each Record row is a `<Reveal variant="depth">` wrapper. Under `html.js` a Reveal rests at
`opacity: 0` + `translateY(22px) scale(0.985)` until its IntersectionObserver adds
`reveal-shown`, then fades in over `--dur-reveal` (900 ms) after its inline stagger delay
(`index × 80 ms`). Tabbing to a row link scrolls the row into view, the observer arms
`reveal-shown` — and the fade is only beginning. Keyboard focus therefore always arrives
before the content is readable; pointer and scrolling readers never notice because they
are not looking at a focus ring.

This is the same mechanism Release 6 fixed for its two reading groups
(`components/readingGroup.module.css` focus floor) and deliberately left unfixed for the
Record band per owner direction D1 (`DECISIONS_LOG [r6-focus-floor-scoped]`).

## 3. Repair (smallest scoped fix)

**One rule, scoped to the home `#record` band** — `app/globals.css`, immediately after the
`reveal-rearm` floor:

```css
html.js #record .reveal:focus-within {
  opacity: 1;
  transform: none;
  transition: none;
}
```

The moment anything inside a record row holds focus, that row rests at its visible frame
at once — same floor grammar and reasoning as the Release 6 reading-group floor. The
IntersectionObserver adds `reveal-shown` on the same scroll the focus caused, so the frame
never fades back when focus moves on (confirmed in the after-run: 0 hidden rows after Back).

**Explicitly preserved:**

- Shared Reveal defaults (`html.js .reveal`, all variants, all floors) are **byte-for-byte
  untouched** — the diff is purely additive (+24 lines including the comment).
- **No motion token changed.** Pointer and scrolling entrance motion is unchanged: no
  focus, no rule. Measured — the pointer scroll-entry fade still runs (mid-flight
  0.43/0.09/0/0 → settled 1/1/1/1, identical to baseline).
- Reduced motion, print, `scripting: none`, `reveal-seat` (hash arrival), `reveal-rearm`
  and `reveal-failsafe` all still win: they are `!important` and this rule agrees with
  every one of them (the regression test pins this).
- Back navigation and direct-anchor (`/#record`) behaviour: measured identical to baseline.
- The one-rule **site-wide** version stays deferred per `DECISIONS_LOG
  [r6-focus-floor-scoped]`; this scoped rule is not it, and a guard asserts no unscoped
  `.reveal:focus-within` floor ships in `globals.css`.
- Nothing touched: the cinematic, route navigation, focus-restoration architecture, the
  dusk-turn, `Reveal.tsx`, `readingGroup.module.css`, motion tokens.

**The repair does NOT require a sitewide behavioural change**, so no expansion was made
and nothing is parked for owner review beyond the standing D1 deferral of the global rule.

## 4. Regression test

`lib/__tests__/record-band-focus-floor.test.ts` (11 tests). jsdom cannot evaluate
`:focus-within`, so the guard models the sheet's actual cascade deterministically from the
parsed rules (a small evaluator over the selector shapes this sheet uses on reveals — with
a test asserting every reveal selector is one it understands, so it cannot silently fall
behind the sheet). It demonstrates **both sides**:

- **THE OLD FAILURE** — resolve the same record-row subject with the floor rule removed:
  an armed focused row computes `opacity: 0`; a shown focused row computes opacity 1 but a
  `var(--dur-reveal)` (900 ms) transition — i.e. the reproduced failure state.
- **THE CORRECTED BEHAVIOUR** — resolve with the full sheet: `opacity: 1`, `transform:
  none`, `transition-property: none` at focus arrival, armed or shown.
- Entrance motion preserved (no focus → armed at 0 with depth travel and the reveal clock).
- Scoped-only reach: a focused reveal outside `#record` resolves **identically with and
  without** the rule.
- No unscoped `.reveal:focus-within` floor in `globals.css` (the deferred global stays
  deferred).
- Every `!important` floor (RM, print, scripting:none, failsafe, seat) still wins; the
  floor itself carries no `!important` (Release 6 grammar — wins by specificity, pinned).
- Build-backed wiring (runs with `out/`, as in CI): all four row links sit inside a
  `.reveal` container within the band, and the floor ships in the built CSS alongside the
  intact armed state.

## 5. Verification on the final candidate

| Check | Result |
|---|---|
| Focused regression tests (`record-band-focus-floor.test.ts`) | **11/11 pass** (old failure and corrected behaviour both demonstrated) |
| Keyboard journeys: continuous Tab and Shift+Tab into the band, 1440 and 393, both themes | **0/96 faint arrivals** (was 48/96): every stop at ancestorMinOpacity **1.000** at the instant focus lands, `transitionProperty: none`, ring solid 2 px, all rows in viewport |
| Fresh-load arrival trials (per link) | settle at **0 ms** (was ~902 ms) |
| Initial load, pointer scroll entry | entrance fade still runs mid-flight (0.43/0.09/0/0 → 1/1/1/1) — **unchanged from baseline** |
| Direct anchor `/#record` | 0 hidden rows (seat path intact) |
| Back navigation return | scroll restored, 0 hidden rows, focus ancestor opacity 1 — identical to baseline |
| Light and dark | all of the above in both themes |
| Reduced motion | 0 faint; rows rest visible; no motion (unchanged) |
| JavaScript disabled | all 4 rows visible, all 4 links present (unchanged) |
| axe-core 4.11.4 (document + `#record` scoped), 1440 and 393, both themes | **0 violations on all 8 frames** |
| Rendered-focus checks (per stop) | focus ring solid 2 px on fully opaque content at 16/16 stops, screenshots in `evidence/after-verify/` |
| Text-only 200% enlargement, 1440 and 393, both themes | 0 clipped rows, no horizontal page overflow |
| Narrow reflow 320 px | no document overflow, band within viewport, 0 clipped rows |
| `npm run typecheck` | clean |
| `npm run lint` | clean (only the standing `headers`/`output: export` notice) |
| `npm run build` (static export + prebuild validation + postbuild prune/alias) | clean |
| Full build-backed suite (`npm run test` with `out/` present, as in CI) | **123 files, 1122 passed, 2 skipped (the same two labelled skips as main), 0 failed** — +1 file/+11 tests vs. base = the new regression file |

All runs: **0 page errors** in every frame.

## 6. Changed files

| File | Change |
|---|---|
| `app/globals.css` | +24 lines: one `html.js #record .reveal:focus-within` rule + its comment. Purely additive; no existing line touched. |
| `lib/__tests__/record-band-focus-floor.test.ts` | new — 11-test regression guard (see §4) |
| `qa-reports/record-band-focus-2026-10-20/` | new — this receipt's tools and evidence (2.4 MB) |

No changes to `Reveal.tsx`, `readingGroup.module.css`, motion tokens, the cinematic, route
navigation, focus restoration, the dusk-turn, content, or any other agent's files.

## 7. Evidence

- `evidence/baseline/record-band-focus.json` — 12-run baseline matrix (this §1).
- `evidence/after/record-band-focus.json` — 12-run matrix on the repair.
- `evidence/after-verify/record-band-verify.json` + focus/zoom/320 screenshots — axe,
  rendered-focus, text enlargement, narrow reflow.
- `tools/record-band-focus.mjs`, `tools/record-band-verify.mjs` — the probes (loopback
  only; nothing installed; nothing leaves the machine).

## 8. Known limitations (stated plainly)

- **Headless Chromium only.** No physical Safari, VoiceOver, iPhone, real 2× display or
  GPU session was used. Device gates remain the owner's.
- The `:focus-within` floor cannot help the rare case of programmatic `focus()` on a record
  link whose row never intersects the viewport (the observer never arms `reveal-shown`); on
  blur the row returns to its armed state. Ordinary Tab/Shift+Tab travel always scrolls the
  row into view, so the observer fires on the same scroll — measured stable in all 96
  arrivals and in the Back-return probe.
- The site-wide focus floor (every Reveal, Fable R6 owner decision 1) remains deferred per
  `DECISIONS_LOG [r6-focus-floor-scoped]`; other bands outside the two Release 6 reading
  groups and this Record band still carry the pre-existing behaviour.
- Real Firefox was not run (the house instruments are Chromium/WebKit).

## 9. Owner decisions required

1. **Visual + copy acceptance** of this scoped repair (no visible copy changed; motion for
   pointer/scroll readers unchanged).
2. **Publication authorization** for the draft PR to merge into production main and deploy
   through the normal CI and GitHub Pages workflow.

No merge or deploy performed. No force push, no admin bypass.
