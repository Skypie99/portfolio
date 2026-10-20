# SkyPi Release 6: publication record (2026-10-20)

**Status: PUBLISHED AND VERIFIED.**

New record only — the historical receipts (`2026-10-20_Fable_Release6EditorialFinish.md`,
`2026-10-20_Mimo_Release6Integration.md`, and everything under
`release6-editorial-finish-2026-10-20/`) are preserved unchanged, as directed.

## Provenance

| Item | Value |
|---|---|
| Owner approval | Visual implementation approved and publication authorized for PR #33; D1 (scoped focus floor), D2 (dusk-turn unchanged), D3 (/65 numeral) accepted as implemented |
| Approved candidate (PR head, pinned) | `44a066ebcfcf61e211d8cdf1e3acf110642d549a` — reverified immediately before merge (local HEAD, `origin/` branch and PR head all identical) |
| Expected production main (reverified) | `b51c742b31dd519018d927e20af452327e0c7f53` |
| PR | [#33](https://github.com/Skypie99/portfolio/pull/33) — marked ready, merged normally (merge commit, no admin bypass, no force-push, no direct push to main) |
| **Production merge SHA** | **`e5c3624499bdad04dffad0ec0281eb16a0d44868`** |
| PR-head CI (Build, Lint, Test, Typecheck) | all four `pass` on `44a066e` (run 39379276804) before merge; PR `MERGEABLE` / `CLEAN` |
| Production CI on the merge commit | run 39380907539 — **success** (Lint, Typecheck, Test build-backed, Build) |
| CI-triggered Deploy (GitHub Pages) | run 39381241254 — **success**, deploying the exact CI-verified commit `e5c3624` |
| Pages deployment | 7193259200 (`github-pages`) — `success` |
| Public site | https://skypistudio.com (verified serving Release 6) |

## Live verification (70 checks, 0 failing — `live/`, instrument `live-check.mjs`)

Headless Chromium 1234 **and** WebKit 2336 against the deployed site. This is a rendering
verification, not physical-device testing.

| Area | Live result |
|---|---|
| Work gallery editorial ordering | All 5 plates read title above the facts with the /65 numeral ink (`rgba(…, 0.65)` both themes) and clause-bound statuses — 8 frames (2 engines × 2 themes × 1440/393) |
| Homepage project index | 5 rows, 10 clause spans, year on the title line, facts before the doorway, the doorway out of tab order (`tabindex="-1"`, "View project→", 44px) at 1440, 393, 375 and 320 in both engines |
| Correct wrapping | Element-level census: **no element crosses the viewport edge** on 16 surface frames (2 engines × 4 widths × 2 surfaces) |
| Contrast (deployed) | The deployed styles carry the halved dark wash (`dark:opacity-50`) and the /65 numeral; the 64-probe rendered-contrast run on the byte-identical source measured 0 below threshold |
| Focused content visibility | Focus floor live: all five rows at opacity 1 with rings under keyboard focus |
| Back navigation | Keyboard departure → Back reseats the row title at opacity 1 (the return seat, W4-02); pointer departure → Back keeps the shipped focus-to-`<main>` orientation — both as designed in `lib/returnFocus.ts`'s scope fences |
| Theme transition unchanged | Dusk-turn on `/work/`: marker written during the turn and released after both legs, choice persists, URL and scroll (1200) held; home toggle keyboard-activates past the cinematic intro (persists, no marker left) |
| Release 5 showcases preserved | `/work/dashboard/` renders its chapter (3 evidence rows) with both "Other work" cards on CaseStudyCard's default variant |
| Release 4 interactions preserved | The doorway pill keeps its 44px target and keyboard disposition |
| Flagstone, About, Contact preserved | All render their headings with 0 console errors |
| Cinematic GPU hotfix preserved | Hero cinematic markup present and armed; `components/cinematic/**` byte-identical to the approved baseline |
| Console | 0 page errors on every route and frame |

## Observations recorded, not hidden

1. **The cinematic intro gates the homepage sidebar at the top of the page** (by design): while
   the protected cinematic is armed, the desktop sidebar `<nav>` is `inert`
   (html `cdesert-world-parked`) and its scene layer sits above the theme toggle, so pointer
   clicks there land on the scene until the reader scrolls past the hero. Keyboard Tab order runs
   the intro's own stops (`Skip intro`, `See the work.`). Past the hero the gate lifts and the
   toggle works normally (verified at the `#work` seating). This is the approved cinematic
   behaviour — `components/cinematic/**`, `SidebarRailLinks`, `ThemeToggle` and `globals.css` are
   byte-identical to `b51c742` — therefore pre-existing and untouched by Release 6.
2. **The return seat has designed activation fences**: only keyboard/AT departures reseat the row
   title on Back; pointer departures keep focus-to-`<main>`. A rapid automated Back inside the
   departure's view transition races the commit (the journey instrument dwells ~700ms on the case
   page before returning; so does this one). All behaviour matches `lib/returnFocus.ts`'s
   documented fences exactly.

## What this publication does NOT claim

- **Not accessibility-complete.** Per the owner's directive this approval covers the reviewed
  Release 6 publication only.
- **OPEN — next accessibility campaign:** the Record band's three faint focus stops
  (`the record`, `the account`, `the statement`) land focus while their row is fading
  (`DECISIONS_LOG.md` `[r6-focus-floor-scoped]`; Fable R6 owner decision 1's global-floor
  alternative remains the candidate fix).
- **OPEN — physical-device and assistive-technology gates:** physical Safari and Firefox, real
  VoiceOver, real touch/scroll feel, GPU compositing of the dusk-turn, and real 2× display
  sharpness were never verified by this headless publication pass and remain the owner's device
  pass.
- No factual-accuracy or accessibility-wide remediation was started inside this release.

## Where this record lives and why

Recorded on the integration branch `mimo/skypi-release6-integration-20261020` (a normal push, no
PR), because the publication authorization covered only the reviewed Release 6 publication — a
second merge to `main` would exceed it. Folding this record (and the `DECISIONS_LOG.md`
publication entry) into `main` is a trivial docs-only PR whenever the owner wishes, e.g. with the
next campaign. Historical receipts were not rewritten.
