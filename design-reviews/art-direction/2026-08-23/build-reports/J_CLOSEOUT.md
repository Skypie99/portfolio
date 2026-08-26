# Phase J — Final QA & Close-out — THE ROOM

**Branch:** `room/pJ-qa` (J1–J6, then K1–K8 after Sky's rulings) · **Date:** 2026-08-26 · **Base:** `main` @ `a5a46a1`
**MERGED to `main` and PUSHED 2026-08-26 on Sky's explicit instruction** (sprint merge exception, 2026-08-25 → ~08-27). What went live was named before the push was run and the deploy was verified after.

**Gate at merge, after the K-wave:**
```
typecheck 0 · lint ✔ 0 warnings · build 26/26 + 3/3, no warning but the documented headers notice
vitest 79 files / 770 pass / 1 skip / 0 todo
axe 0 violations · 34 scans (17 routes × 2 themes, strict)
keyboard 463/463 ringed stops · reduced motion 17/17 at rest · 320px + 200% reflow clean
overflow census ✅ 100/100 frames, plant caught every frame
zoom-200 census ✅ 68/68 frames, plant caught every frame — 2 crossings before K5/K6, 0 after
CLS worst 0.0039 (work-flagstone@768) · homepage First Load JS 171 kB (was 173 pre-program)
console 32/34 clean; the 2 are /archive/'s known no-.env.local condition
```

Depends on A–E, G, H, I merged. **F (the art wing) is HELD by Sky and out of scope — its absence is expected, not an omission.**

Every number below was measured on the **built `out/`** (SE-2) served locally, in **Chromium only** (`playwright-core` 1.61.1). Chromium never claims WebKit (SE-7). Nothing here is quoted from a prior close-out without being re-run.

---

## ⚠ First: the harness bug that would have produced a false report

The first axe run of this phase returned **16 violations across 6 routes** — `document-title` + `landmark-one-main` + `page-has-heading-one`, the signature of a page that never loaded, on scattered unrelated routes. The first console sweep returned 30 errors, all `ERR_CONNECTION_RESET` / `ERR_SOCKET_NOT_CONNECTED`.

**Neither was a site defect.** The `portfolio-out` launch config serves `out/` with `python3 -m http.server`, which is **single-threaded**: under the concurrent page loads the axe/CLS/console rigs generate, it starves and drops sockets. Re-running the identical rigs against a Node static server returned **0 violations** and **0 console errors**.

This matters beyond this phase: every prior phase's rig ran against that same server. A future run that sees scattered `document-title` violations should suspect the server before the site. The replacement lives at `build-reports/J_serve-out.mjs` with the reason in its docblock.

---

## The ten gates

### 1 · Build & console — **PASS, with one pre-existing warning named**

```
npm run typecheck                    0 errors
npm run lint                         ✔ no ESLint warnings or errors
npx vitest run                       79 files · 770 passed · 1 skipped · 0 todo (771)
npm run build                        compiled clean · 26/26 static · 3/3 export
  prebuild validate-assets           9 certs · 5 cinematic plates · 125 deliverable siblings · 3 blog figures
  postbuild                          /500 ghost pruned · 2 OG .png aliases written
console, 17 routes × 2 themes        32/34 loads: 0 console errors, 0 page errors, 0 4xx/5xx
                                     2/34: /archive/ light + dark — "supabaseUrl is required" (below)
console, 17 × 2 × 3 widths           102 loads, 6 errors, all the same /archive/ cause
```

**Test count moved 765 → 770** across this phase: +2 from J2's Gap-9 guard, +1 from J3, +2 from J6 — **and the `1 todo` that had been printing on every run for months is gone.** It was `asset-integrity`'s badge guard, disabled with the note "add real badge PNGs … to un-todo this guard". The badges arrived; nobody re-read the note. See J6.

**"Zero new warnings" — one warning is present and it is not new.** The build prints, besides the long-standing `headers` + `output: export` notice:

> `Next.js inferred your workspace root… We detected multiple lockfiles and selected the directory of /Users/skypie/package-lock.json`

That lockfile is `~/package-lock.json`, dated **2026-05-28** — three months before Phase A. Proven not to be this program's doing rather than asserted: `git diff 52bd0ef..HEAD -- next.config.mjs` is empty, and the only `package.json` change in the whole program is `+ "axe-core": "^4.11.4"` (H3). Silenceable in one line (`outputFileTracingRoot` in `next.config.mjs`) or by deleting the stray `~/package-lock.json` + `~/node_modules` — the latter is outside the repo and not mine to delete. 🔴 below.

**`/archive/`'s two console errors are the known local-credential condition, now characterised exactly.** With no `.env.local`, `createClient('','')` throws inside `AuthGate`'s effect and the route renders `global-error.tsx`'s fallback: title `The Studio Archive — Sky Halisky`, `h1` = "Something went sideways.", one `<main>`, three exits. That is why axe scores `/archive/` clean — **it is scoring the error boundary, not the sign-in card.** See Honest limits.

### 2 · Links & routes — **PASS**

- `static-integrity` full: **27 tests + 1 skip** (25 + J2's Gap 9 pair), run against a fresh `out/` (note: in a bare `npx vitest run` this file executes *before* the build in the same command, so it was re-run standalone after `npm run build` — the numbers above are the post-build run).
  Covers: every internal href resolves in `out/` · external links carry `rel="noopener noreferrer"` · pre-paint reveal guard in `<head>` on every reveal-bearing page · per-route `og:url` is the route's own · `og:site_name`/`og:locale` never dropped by a leaf · no interior route wears the homepage's OG title · every local `<img src>`/`<source srcset>` resolves · every share-card image resolves and has a real image extension · **each `.png` alias byte-identical** to the generated card · sitemap lists the new URLs and does not advertise the stubs. Plus the new **Gap 9** (below).
- `section-nav-anchors` **27/27**, `smart-punctuation` **11/11**, `asset-integrity` **3/3** (was 1 test + 1 permanently-todo'd guard until J6).
- The one remaining `1 skipped` in the whole suite is `static-integrity`'s own deliberate, labelled skip for when `out/` does not exist — it does exist here, so the skip is a different case inside that file, not a silenced check.
- **The three redirect stubs are intact and byte-identical to the pre-program baseline** (proven by a full built-HTML diff, §3): `/work/accessmap/` → `/work/flagstone/`, `/work/mutual-mesh/` → `/work/`, `/blog/building-accessmap/` → `/blog/building-flagstone/` — each with `<meta http-equiv="refresh">`, a correct `<link rel="canonical">`, a plain `<a>` fallback, and absent from the 14-URL sitemap.
- **Manual click-walk, real clicks in a real browser:** nav + footer + work-index rows + case-study cross-links from `/`, `/work/flagstone/`, `/work/`. **47 landed correctly** (path + anchor within 160px of viewport top). **9 "failures" were all the homepage rail during the pinned film** — see §7, where it turns out to be a pre-existing condition the program measurably *improved*.

### 3 · Visual consistency & regression tripwires — **PASS**

**The system sheet, re-derived from the real tokens.** Extracted every custom property from `mockups/04-system-sheet.html`'s `.L`/`.D` scopes and diffed against the live `app/globals.css` `:root` and `html.dark` blocks:

| | board tokens | identical | drifted |
|---|---|---|---|
| Light (`.L` vs `:root`) | 19 | **19** | 0 |
| Dark (`.D` vs `html.dark`) | 19 | **19** | 0 |

The one apparent mismatch resolved on inspection and is worth recording: the board's `--ember1/2/3` are its **own three-stop demo gradient** for `.t-hero`, not site tokens. The shipped `.ember` reads `--rgb-accent-hover → --rgb-accent → --rgb-accent-ink` and is **byte-identical between `52bd0ef` and HEAD** — PROTECT held.

**Frame captures: 102 frames** — 17 routes × 2 themes × 375/768/1440 — at `build-reports/J-frames/` (untracked, matching this repo's practice for capture bundles). Every frame is a real render, not a blank: smallest 156 KB (`/archive/`'s error page), largest 1.92 MB (`home__dark__1440`). This is the first frame set in the program where the homepage captured properly — C and H both had to fall back to geometry probes because the Browser pane returned blanks; a headless Playwright context does not.

**Untouched routes, diffed against a real pre-program baseline.** Built `52bd0ef` (the parent of the Phase A merge) in an isolated worktree and diffed all 26 built HTML files against today's, normalising hashed chunk names and build ids, then again at the *visible text* level:

| Result | Routes |
|---|---|
| **Byte-identical after hash normalisation (8)** | the 3 redirect stubs + the 5 `/flagstone/*` legal pages |
| **Markup changed, visible text identical (1)** | `/archive/` — Phase A class tokenisation only |
| **Order/multiplicity only — no text added or removed (12)** | `404`, `/404/`, `/about/`, `/blog/`, `/blog/building-flagstone/`, `/certificates/`, `/colophon/`, `/contact/`, `/runway/`, `/work/claude-corp/`, `/work/dashboard/`, `/work/ghost-code/` — the Phase B shell additions (`/accessibility/` + `/colophon/` promoted into nav, `Skip intro`) reordering the same strings |
| **Visible text added or removed (5)** | `/` +53/−103 (Phase C) · `/work/flagstone/` +22/−2 (Phase D + H3) · `/accessibility/` +8/−8 (H3's receipts refresh) · `/work/` +15/−0 (E2 status + verified dates) · `/work/prompt-library/` +3/−3 (E9's Reflection rewrite) |

8 + 1 + 12 + 5 = **26, the whole route inventory, accounted for.**

**No unexplained pixel or text delta anywhere.** Every one of the five text-level changes maps to a named phase item; the eight byte-identical routes are the strongest possible statement that the protected surfaces were not touched. Note `/work/prompt-library/` is the one route whose text changed that no phase close-out lists in a headline — it is E9's ratified Reflection rewrite (`01887be`), authorised and content-checked in §8, but it took a whole-inventory diff to notice it belonged in the accounting at all.

### 4 · The flagship standard — **run in full, §Scorecards below**

### 5 · Accessibility — **PASS, and two prior honest limits closed**

```
axe-core 4.11.4, defaults + label-content-name-mismatch + color-contrast
  17 routes × 2 themes, strict                       0 violations across 34 scans
keyboard trace, real Tab presses, ALL 17 routes
  light                                              463 / 463 stops carry a visible ring
  dark                                               411 / 411 stops carry a visible ring
  distinct ring signatures                           exactly ONE per theme:
                                                       light  outline 2px solid rgb(185, 99, 64)
                                                       dark   outline 2px solid rgb(207, 122, 79)
                                                     offset 2px everywhere
check:overflow (the repo's own instrument)           100 frames · 25 routes × 2 themes × 320/375
                                                     non-vacuity plant caught 100/100
                                                     ✅ no element crosses the viewport edge
200% root text — NEW element-level census            68 frames · 17 routes × 2 themes × 1440/375
                                                     non-vacuity plant caught 68/68
                                                     ❌ 2 elements cross the edge at 375 (below)
reduced motion — REAL emulation, 17 routes           0 running animations · 0 of 240 reveals hidden
                                                     · 0 invisible prose elements
cpl-census                                           95 measurable runs, 49 over 75 cpl (unchanged)
contrast suites (in the 768)                         ink-contrast (derived composites + 3 non-vacuity
                                                     rejections) · prefers-contrast: more strictly
                                                     increasing · forced-colors rescues incl. the
                                                     receipt card · ember large-text floor
```

**⚠ The reflow evidence had to be rebuilt mid-phase, because the obvious probe cannot fail in this repo.**

My first pass reported "320px reflow: 17/17 clean · 200% text: 17/17 clean" from `documentElement.scrollWidth > clientWidth`. Then `npm run check:overflow` printed, in its own words: *"scrollWidth probe was VACUOUS on 80/100 frames (`overflow-x: clip`) — that reading is not evidence here."*

It is right, and its docblock explains why better than I can: `app/globals.css` sets `overflow-x: clip` on **both** `html` and `body` (the full-bleed guard for the cinematic's `100vw`), and under `clip` the scrollable region is clamped to the viewport — so that probe is **structurally incapable of returning true**, no matter how far a child overhangs. The ui-polish train proved this the honest way (P8 / `P8-OVERFLOW-VACUOUS`: a 600px div planted in `/colophon`'s `<main>` at 320 left the reading at 0 while its right edge sat +280px past the viewport) and replaced it with an element-level census that proves its own non-vacuity every frame.

**The 320/375 leg was already covered by that instrument and passes cleanly.** The **200%-zoom leg never was** — Phase H's 200% reading and my own first one both used the vacuous probe, which makes "zero overflow at 200%" *unverified*, a different claim from wrong. So this phase built the missing half (`build-reports/J_zoom200-census.mjs`), borrowing `overflow-census.mjs`'s method exactly: visible box (own rect ∩ every clipping ancestor, `html`/`body` excluded as clippers), excluded **by reason** (aria-hidden subtrees, `.sr-only`, zero-area), and a 150%-viewport div planted on every frame that the census must catch. **Plant caught 68/68 — the instrument is not vacuous.** It then found two things nobody had seen:

> **R1 · `/accessibility/`, 375px at 200% text, both themes — 151.6px of the method line is clipped and unreachable.**
> The offender is `MethodSegment`'s `whitespace-nowrap` span holding `· label-content-name-mismatch`. UP-14c built that nowrap deliberately, and its docblock did the arithmetic: *"the widest unbreakable unit this ships is `· label-content-name-mismatch` at 231.3px, which clears 320 with ~25px to spare."* True at 100%. At 200% that unit is ~462px against a 375px viewport, and `overflow-x: clip` means it is **cut off, not scrollable**.
> **This is a real trade, not a bug:** a 27-character hyphenated token cannot fit a phone at 200% by any CSS choice — you get either a mid-token break (which UP-14c added the nowrap to prevent: "COLOR-/CONTRAST", "SCROLL-/SETTLED") or clipped text. **Recommendation: let it break** — unreachable text on the accessibility page costs more than a split at a hyphen. **Not changed here:** reversing a shipped, reasoned contract on Sky's own accessibility page is a 🔴, not a QA-phase drive-by.
>
> **R2 · `/work/claude-corp/`, 375px at 200% text, both themes — 34.4px of the "Real commits (AccessMap) ↗" link is clipped.**
> Mechanism, measured: the link is `inline-flex items-center gap-2`, and **an inline-flex box does not wrap** (`flex-wrap: nowrap` is the initial value), so label + arrow lay out on one unbreakable line. 280px at 100% (fits), 345px at 200% starting at x=64 → right edge 409 against a 375px viewport. `max-w-full` or `flex-wrap: wrap` on that shared link class fixes it and changes nothing at any width where it already fits — but *where* the arrow or the label breaks is a visible layout choice on Sky's page, so it is reported, not taken.

**Both are beyond the conformance conditions this site is actually measured against** — 1.4.10 asks for reflow at 320 CSS px, and `check:overflow` passes that cleanly at 320 and 375. They are recorded because "we never checked" is worth knowing, and because the accessibility page losing text at 200% is the kind of irony this site should not ship unknowingly.

**Two things here are better than any prior phase could claim.**

1. **A real reduced-motion walk finally happened.** G and H both recorded, honestly, that their browser pane exposed no motion-preference toggle and their RM verification was code-level only. A headless Playwright context takes `reducedMotion: 'reduce'`, so this is the first *emulated* RM walk of the program: on all 17 routes `matchMedia('(prefers-reduced-motion: reduce)')` matched, **zero animations were running**, and **every one of the 240 `.reveal` elements sat at opacity 1 with no transform** — pre-settled, meaning intact.

2. **The keyboard trace is now the whole site, not a sample.** H reported 14/14 across two routes and said so plainly. This is 874 real Tab presses across 17 routes × 2 themes, and **one ring shape, one offset, one token colour per theme** — OCD checklist item 7, verified rather than asserted.

**The three exceptions, named.** In dark theme, three focus stops render the *light* ring: the "Try again" / "Back to the homepage" / "Browse the work →" buttons on `/archive/`. Cause: those are `global-error.tsx`, which **renders its own `<html>` with literal inline hex and no stylesheet dependency, deliberately** ("DELIBERATELY CSS-INDEPENDENT: this can render at the exact moment a CSS chunk failed to load"). It is light-only by design, so a dark-theme visitor who hits a global error gets a light page. That is a design consequence, not drift — but it has never been written down anywhere, so it is written down here.

**The cpl number, correctly attributed for the first time.** 49 of 95 runs exceed 75 cpl — identical to H6's figure, so no regression. Bucketing every over-band run by its measured container width settles what H6 argued in prose:

| Container width | Over-band runs | What it is |
|---|---|---|
| **545px** (`--measure-lead`, **Sky's ruled measure**) | **0** | 17 of 17 runs at the ruled measure are **in band** |
| 652px (`--measure-wide`, 60ch) | 28 | case-study + blog body — a pre-existing token the 545px ruling never covered |
| 880–1096px | 9 | the `main li` artifact — composite work-index / Record rows, never continuous prose |
| 551px | 5 | homepage work-index summaries at 14px — **new in Phase C** (max 84 cpl) |
| 562–815px | 7 | assorted headings and figure captions |

**Not one over-band run is governed by the measure Sky ruled.** The five 551px runs are the only over-band family this program itself created; at 14px in a 551px column the "cpl band" heuristic, calibrated for 16–17px body prose, is doing less work than the raw number suggests. Reported, not reconciled away.

### 6 · Performance — **PASS on three of four; the tree budget is over, as Phase I already reported**

| Budget | Limit | Measured now | |
|---|---|---|---|
| Worst-case CLS, **per item** | ≤ 0.004 | **0.0039** (`work-flagstone@768`), worst of **51** route×width measurements | ✅ but see below |
| Homepage First Load JS | must not grow | **173 kB → 171 kB (−2 kB)**; page size 52.5 → 50.6 kB | ✅ |
| AVIF/WebP pairs | complete | 75 `.avif` / 76 `.webp`; **0 AVIF without a WebP sibling** | ✅ |
| LQIP paint under throttling | reserved box, no jump | **every visible image well has a reserved box** at 900 ms on 400 kbps / 400 ms RTT | ✅ |
| `public/` tree | ≤ 8 MB | **25.65 MB raw · 8.42 MB** excluding the one noindexed `/runway` video | ❌ over |
| `out/` tree (what ships) | ≤ 8 MB | **30.17 MB raw · 12.93 MB** excluding that video | ❌ over |

**The First Load JS number is new evidence, not a re-quote.** Phase I flagged that no close-out had ever banked a pre-program figure and refused to invent one. This phase built `52bd0ef` in an isolated worktree and read its own route table: **173 kB**. It did not grow; it shrank by 2 kB, with the shared chunk flat at 103 kB.

**CLS is per-item, and there is deliberately no estate-wide number.** 51 measurements (17 routes × 375/768/1440), none at or over the floor. The 64-frame full-page rig that produced the old estate-wide figure **was a one-off from the ui-polish train and was never committed** — Phase I said so, and rebuilding it is still out of scope. No synthesised number appears here.

**⚠ The worst case is run-to-run variable, and it hugs the floor.** This phase ran the rig twice on the same build. The first run: **0.00366** worst, at `404@768`. The second: **0.0039** worst, at `work-flagstone@768` — the same route and width Phase H measured at exactly 0.0039. Both pass, but 0.0039 is **97.5% of the 0.004 floor**, and which route wins moves between runs. The honest reading is not "0.0039, comfortably under" — it is *this budget has approximately no headroom left, and a single route is the reason.* The per-item table below the top row is stable across both runs (`work-dashboard@768` and `work-claude-corp@768` at 0.0015, everything else ≤0.0013), so `work-flagstone@768` is the one item worth watching, not the site.

| worst 6, final run | CLS |
|---|---|
| `work-flagstone@768` | **0.00390** |
| `work-dashboard@768` | 0.00150 |
| `work-claude-corp@768` | 0.00150 |
| `work-flagstone@1440` | 0.00130 |
| `work-dashboard@1440` | 0.00050 |
| `work-claude-corp@1440` | 0.00050 |

**The LQIP check needed a correction mid-flight, recorded because it nearly became a false finding.** The first throttled run reported "zero-height image wells" on three routes. They were the `.dark.*` twins of each `<picture>`, `display:none` in light theme — every one. Re-probed per-theme: **`out/` ships explicit `width="1280" height="800"` on every `<img>`**, so the intrinsic box is reserved before a byte of image arrives, which is exactly why CLS measures where it does.

### 7 · Interaction states — **PASS, and one pre-existing pointer trap measured and shown fixed**

**hover ↔ focus parity, Phase G's own metric, re-run across the whole program:**

| | `:hover` selectors | `:focus*` selectors | unpaired |
|---|---|---|---|
| pre-program `52bd0ef` | 9 | 10 | **1** |
| Phase A close | 9 | 10 | **1** |
| Phase G close | 10 | 11 | **1** |
| Phase H close | 10 | 11 | **1** |
| **Phase J now** | **10** | **11** | **1** |

The single unpaired selector is `::-webkit-scrollbar-thumb:hover` — a pointer-only pseudo-element with no keyboard analogue — and it has been the same one selector from before the program to now. **Parity constant, N/N, end to end.**

A stricter per-element probe over 175 interactive elements on 5 routes found **0** elements declaring a different *property set* on hover than on focus-visible. Elements that change colour on hover without their own `:focus-visible` declaration still receive the site's single ring — proven by the 874/874 trace above, not assumed.

**Method links reach their proof by hover AND focus AND touch.** All are **visible at rest** (so touch users need no hover to discover them) and tabbable, and a real `tap()` on a 390×844 touch context navigates: homepage `method` → `/work/flagstone/#flagstone-test-count-method`; the Flagstone receipt's `measured 2026-08-16, method` → the same anchor. (A tap probe on `/accessibility/` timed out — the selector's first match was the sidebar rail link inside `NAV.hidden.md:flex`, correctly hidden below `md`. A probe artifact that happens to confirm the rail-hide contract.)

**`:active` is designed on `.glass-card` only** — including a deliberate `:has(:active)` ancestor-propagation rule whose own comment names the device gate. No component this program built adds an `:active` state; the Receipt's method link and IntroSkip rely on the ring, consistent with every other link on the site. Not a regression; row 4 of the device session is where touch decides.

**The homepage rail, and a genuinely good result.** The click-walk's 9 "failures" were the sidebar rail on `/`. Probing `elementFromPoint` at seven scroll depths shows the pinned cinematic film's `.cdesert-scene` (`position:absolute; inset:0`, and the FLOOR group is never culled, so it keeps `pointer-events:auto`) sits over the rail region while the film is pinned. Then the same probe was run against the **pre-program build**:

| scroll | pre-program `52bd0ef` | now |
|---|---|---|
| y=0 | wordmark **blocked** · rail link **blocked** · **no escape exists** | wordmark blocked · rail link blocked · **Skip intro CLICKABLE** |
| y=1000 | blocked · blocked · none | blocked · blocked · **Skip intro CLICKABLE** |
| y=2000 | blocked · blocked · none | blocked · blocked · **Skip intro CLICKABLE** |
| y=3000 | blocked · clickable | blocked · clickable |
| y=4000 | clickable · clickable | clickable · clickable |

**Identical blocking, before and after — this is not a THE ROOM regression.** What changed is that Phase B4's `Skip intro` is clickable from the first frame, where previously **no pointer route past the film existed at all**. This is the first measured proof that B4 fixed a real, pre-existing pointer trap. Keyboard was never affected (34/34 ringed stops on the homepage). The film lives in `components/cinematic/**` — project law — so nothing here was touched; row 3 of the device session confirms it on glass.

### 8 · Content safety — **PASS**

Not a spot-check: every byte-frozen item extracted from both revisions and compared.

```
content/deliverables.json   slug set identical · all 5 status strings identical
                            · all 5 role strings identical · Flagstone body BYTE-IDENTICAL
                            · 4 of 5 bodies byte-identical (prompt-library = E9, authorised)
content/blog.json           byte-identical
content/profile.json        byte-identical
content/rounds.json         byte-identical  (Sky's append-only ledger — untouched, as C promised)
lib/content.ts              byte-identical  → the whole /accessibility/ statement, its marker
                            split, and the RM-only line are provably unchanged
app/accessibility/page.tsx  2 lines, className only (max-w-3xl → max-w-measure-heading,
                            leading-[1.75] → leading-prose); copy byte-identical
#how-i-work band            36 visible text runs, IDENTICAL; the only delta in the whole
                            <section> is one className (leading-[1.1] → leading-heading)
literals still present      "No analytics. No cookies." · "Okanagan Valley" ·
                            "I have not run a full manual screen-reader pass on this site" ·
                            "Solo builder · AI-assisted" · "2026-08-16"
smart-punctuation           11/11 green
```

**Every `content/*.json` field that moved, and its authorisation:**

| Field | Deliverables | Authorised by |
|---|---|---|
| `+ verifiedDate` | all 5 | **E2** — `/work/` status + last-verified |
| `heroShot.chrome: "device"` | flagstone | **D2** |
| `shots[].capturedDate` + `.commit` | flagstone ×3 | **D7** |
| `heroImage.alt` rewritten | claude-corp | **CP-4 / E4** — the dead alt reconciled |
| `body` (What shipped + Reflection) | prompt-library | **E9** + `19c186f` |
| `heroImage.src` `.png` → `.webp` | ghost-code | **I1** |
| `badgeImage.avif` + `.webp` | certificates.json ×1 | **I1** |
| receipts refreshed | a11y-receipts.json | **H3** |

**Nothing else. No unauthorised field moved anywhere.**

**One claim worth verifying rather than trusting, and it holds.** E9's rewrite has the Prompt Library case study say it is *"open-sourced under a permissive license"* — while MEMORY.md still lists "MIT LICENSE still not added" as open. Checked the repo directly: `Skypie99/Prompt_Library`'s `LICENSE` is **1,068 bytes**, GitHub detects **MIT**, pushed 2026-08-24. **The memory line is stale; the site's claim is true.** (The repo-description typo the same memory line cites was already retired too.)

### 9 · Device truth — `build-reports/DEVICE_SESSION.md`

Four programs accumulated ~50 device rows across five documents and **none were ever run.** Merged, deduped, re-pointed at routes that exist today (the a11y script still said `/work/accessmap/`), and cut to **16 tick-rows in three sittings, ~30 minutes.** Sources: `a11y-qa/…/DEVICE_SCRIPT.md` D1–D18 · `ui-polish/…/REPORT.md` carried rows · `r4-gallery/04_r4-curation.md` DEVICE/WEBKIT ROLL-UP (P01/P04/P05/P12/P13) · THE ROOM C/D/E/G rows + G-D1…G-D6 · three rows this phase's own findings produced.

Covers, as required: `backdrop-filter` glass on iOS (row 1, with Reduce Transparency) · `100vh` vs the collapsing address bar (2) · sticky rail + scroll-spy across soft nav (3, 10) · the night register on OLED (7) · iOS `:active` (4) · **the dusk-turn on a real device, both directions (8 — Sky's perceptibility requirement closes there or not at all)** · one real share unfurl (13) · a VoiceOver spot-pass (14).

**On row 14, stated in the document itself:** if Sky runs it, `/accessibility/`'s sentence *"I have not run a full manual screen-reader pass on this site"* can finally become a dated fact. **If she doesn't, that sentence stays exactly as written.** No agent may soften it on her behalf.

### 10 · Close-out — this document

---

## THE CONSERVATION TABLE

`11_ROADMAP.md` promised to absorb or formally kill every open item from six prior programs. Every one, by ID, with what actually happened. **Verified against the repo, not against intent.**

### Absorbed — 16 promised

| ID | Promised to | Outcome |
|---|---|---|
| truth R2 **T4** (tagline) | C | ✅ **Landed before Phase A**, as `feb17c3 fix(truth): R2-T4 — one tagline, Sky's pick`. Phase A's own prerequisite check found the memory note about it had rotted. |
| truth R2 **T5** (homepage halves) | C | 🟡 **Split.** The credentials-URL half rode E; the `/about#method` half is **C7 — drafted, deliberately not applied** (🔴 3 below, two drafts on the table). |
| **R4 P15** missed-path receipt | C, → Record band | ✅ The Record band ships as a published defect ledger — open round, last defect, `2.2 AA`, `100% focus stops` — with `/accessibility/#receipts` holding the rest. |
| **CP-2** claude-corp dead `shots[]` | E | ✅ **Already fixed 2026-08-01**, three weeks before the brief — E3 verified and banked the finding rather than re-doing it. |
| **CP-3** claude-corp stale hero stats | E | ⛔ **OPEN — needs Sky's numbers.** The stats are baked into the capture; the registry pins a commit, so a reshoot reproduces the same stale figures. Correctly deferred to the C-27/WM-4 reshoot lane. |
| **CP-4** dead alt/caption pairs | E | ✅ Six of seven collapsed when CP-2 shipped; the seventh is `b5c58d3 content(claude-corp): reconcile the dead heroImage.alt`. |
| showcase **`ProseFigure` dark branch** | E | ✅ `5d2125b feat(blog): add optional dark-mode figure support`. |
| **UP-36** Notes rail link colour | B | ✅ `34589d6` — `text-cool-deep` → `text-accent-text`, measured 6.11:1 / 8.99:1. |
| **UP-38** glass fix | B | ✅ B1 — the subpage brand chip's fill made opaque + hairline raised; 3.34:1 / 4.15:1, clears the 3:1 non-text floor. |
| **UP-24** | E | ✅ Folded into the `/work/` status work (E2). |
| **UP-11-SET** footer ELSEWHERE column | B | ✅ `8304176` — GitHub's terracotta special case deleted; all three links share one rule. Sky ratified in-session. |
| **UP-46** colophon pill vs quiet mono | B | ✅ **Ratified LEAVE AS SHIPPED** — decided, not skipped. |
| **UP-42** colophon specimen size | B | ✅ **Ratified LEAVE AS SHIPPED.** |
| **UP-18** badge art | E | ⛔ **OPEN — needs Sky's asset.** Confirmed twice as not CSS-fixable: the source image slices words mid-letter at its 500×500 crop. I1 re-encoded the format (AVIF/WebP siblings) and explicitly did **not** pretend that fixed the crop. |
| **luxe item 8** — the dusk-turn | board → G | ✅ `4568b04 G1` — shipped and tuned; Sky's dark-perceptibility requirement answered with measured stops. **Its 🔴 (ship-as-tuned vs dial-back) is device row 8.** |
| **luxe reading-measure** question | board → A/C | ✅ A3/A4 adopted one measure vocabulary at Sky's ~545px; **H6 re-evaluated as promised and kept it**; §5 above now shows 17/17 runs at that measure are in band. |
| **wave-1 banked trio** | B | ✅ All three: wordmark overhang (`28c281d`, a measured box-sizing bug, fixed rather than surfaced as a fake decision), two-tier link (B2), drawn ThemeToggle (`96eda25`, Sky picked "draw it"). |
| **BP4** — the exhibit lamp | board → D | 🟡 **Built both halves, captured both, decided nothing** — exactly as the brief instructed. Recommendation AS-BUILT. **🔴 open, blocks nothing.** |
| **BP9** curator's line | C, placeholder | ⛔ **Still empty and visibly pending, as it should be.** An agent refused to author it once; that was right. One line, in Sky's words, whenever she writes it. |
| guards **PF-22 / PF-25** | A | 🟡 **PF-25 satisfied** (token-parity extended to `--shadow-soft`, hand-migrated, no bulk regex — which is PF-25's own rule). **PF-22 still PARTIAL**: `ink-contrast.test.ts` measures against backgrounds hard-coded from a 2026-07-31 pixel reading, and the guard ledger's own remedy — pin the `world-surface-*` declarations so a surface change forces a re-measure — was **not built**. Phase A re-verified those sky-stop pins after every `globals.css` commit, so nothing drifted, but the structural gap is real and remains open. |
| **~50 device rows** | J, one session | ✅ `DEVICE_SESSION.md` — 16 rows, three sittings. |
| **R4 P10 / P11** colophon ideas | E | ⛔ **OPEN — needs Sky's copy or a go-ahead.** P10's own pitch says every string is hers; P11 needs a composite mock nobody built. |
| dead **mutual-mesh** code | A | 🟡 **Partly.** `6c2dccd A16` removed the app code and `fadfc0d`/`900030f` retired the images — but **three stale non-image references survive on `main`** (see the unaccounted item below). |
| fable **S16** | → Record band + receipts | ✅ Superseded in substance: the Record band + hero receipts are the carry-away artifact, published rather than downloaded. **Sky ratifies the supersede** — that ratification has not been recorded anywhere, so it is a 🔴 line item, not a closed one. |

### Killed, with reasons on the record — 5 promised

| ID | Reason | Verified |
|---|---|---|
| **R2-P7** proof reel as a separate program | Superseded by the capture plan through the factory | ✅ No P7 branch, no reel work in any phase. `project_portfolio_intro` (the Remotion mp4s) is a *different* artifact and is separately Sky-gated. |
| **R4 P09** "Night Gains Its Sky" | Restraint — no new night moves | ✅ G shipped exactly three motion additions and nothing else. |
| **luxe Q1** arrival-fog work | Inside the intro lock | ✅ `components/cinematic/**` diff vs `52bd0ef` is **empty**. |
| **D4's "measured seal"** | Kitsch | ✅ Nothing resembling a seal shipped; D4 became the diagram + exhibit. |
| **the five-chip band** | Hierarchy — one loud moment per page | ✅ **With its evidence-preservation conservation table attached, and re-verified today against the built `out/index.html`:** every one of the five figures **and** its label appears exactly once in the *rendered text* (not the RSC payload) — `2,900+` · `tests passing` · `15 AI agents` · `100% static` · `56 command cards` · `2.2 AA` · `the bar I build to` — and all five doors survive (`/work/flagstone/`, `/work/claude-corp/`, `/work/prompt-library/`, `/work/ghost-code/`, `/accessibility/`). C's own rider earned its keep: the first pass looked complete to the eye and `100% static` was not on the page at all. |

### Parked, with named re-entry triggers — 5 promised

| Item | Trigger | Verified |
|---|---|---|
| `/specs` | a design-adjacent job target appears | ✅ `specs/` exists on disk, no route, not in the sitemap's 14 URLs |
| the JetBrains-for-Flagstone-data echo | Sky's word | ✅ nothing built |
| the Same Eye crossfade | art wing v2 | ✅ nothing built |
| the portfolio-intro embed | Sky says so | ✅ no embed on any route; the mp4s live outside the repo's shipped tree |
| **Phase F, the art wing** | **HELD — awaiting a real body of work** | ✅ `07_ART_PILLAR.md` unimplemented; no `/art` route; **no placeholder artwork anywhere, ever** — which was the point |

### Not this program — 5 promised

truth R2's remaining **content rulings** (Sky) · **P1-2** redacted Constitution excerpt (positioning) · **P2-2** the one real essay (Notes) · the **resume surface** (career-arsenal, outside every repo) · anything in **`~/AccessMap`** (its own program). ✅ None touched; `git diff 52bd0ef..HEAD` contains no file from any of those surfaces.

### ⚠ Unaccounted — the findings

The brief said an unaccounted item is the finding, not an embarrassment. Seven.

**U1 · `global-error.tsx` carries a `TODO(Sky)` that says "before merge", and it merged.**
> *"TODO(Sky): the eyebrow / heading / body copy below are on-brand placeholders in the 404 voice — replace with your final wording before merge."*

Live on every route as the site-wide crash boundary since 2026-07-04. Phase H fixed its button contrast and did not surface the copy TODO. **It appears in no program ledger — not absorbed, not killed, not parked.** It is placeholder copy on a shipping surface, which is the one thing this site's whole thesis is against. It needs Sky's words; nobody may write them for her.

**U2 · Three stale `mutual-mesh` references survive on `main`, and an unmerged branch already fixes them.**
`README.md:32` says the build prerenders **6** `/work/[slug]` slugs including `mutual-mesh` — the build table says **5**. `FINAL_POLISH_PLAN.md` carries two stale notes (one also still says `accessmap`, stale since the rename). `scripts/showcase/registry.mjs:465` keeps a dead `PROJECTS` entry wiring an expo export from the backend-deleted MutualMesh repo. A16 was scoped to app code and never covered docs or the capture registry. Branch **`chore/stale-mutual-mesh-refs`** (one commit, `65e5108`) fixes exactly these three; verified read-only that it still merges cleanly onto `main`. Not merged by me — SE-9.

**U3 · The published test-count receipt has drifted, honestly.**
`content/a11y-receipts.json` publishes **763 tests passing**, dated `2026-08-25`. The suite is at **768** today (H3 measured 763; Phase I's dedup and this phase's guards added the rest). The receipt is *dated*, so it is not false — but it will read as stale the moment the site is pushed, and the same figure was **hand-copied into `app/work/[slug]/page.tsx`** with nothing tying the two together. **J3 now guards the cross-reference** (the two surfaces can no longer silently disagree); whether to refresh the receipt before pushing is 🔴 4.

**U4 · `/work/flagstone/` still says "The homepage chip says 2,900+". The chip band was retired in Phase C.**
The number survived — it is Hero receipt 1, conserved and re-verified above — but the *word* did not: a reader following that sentence will look for a chip and find a receipt. The sentence is inside the **byte-frozen receipt method text** (PROTECT), so it is not mine to reword. 🔴 5.

**U6 · `/work/claude-corp/` shows a reader the words "Real commits (AccessMap)".**
`content/deliverables.json`'s claude-corp `links[]` carries the **visible label** `Real commits (AccessMap)` — the only place on the site where a reader meets the pre-rename name. Phase E touched claude-corp content and did not catch it; the identity sweep's ledger counts it among its ~120 remaining edits but nothing in THE ROOM's ledger claims it.

**The `href` beside it is correct and must not change:** the repo really is still `github.com/Skypie99/AccessMap` — a case-sensitive path that also appears in the privacy URL Apple holds. So this is not a find-and-replace: a reader who clicks a link labelled "Flagstone" would land on a repo called AccessMap, which is a *different* mismatch. Which of the two inconsistencies to keep is a copy judgement, and the copy is Sky's. Reported, unchanged. (The three `AccessMap` URLs inside the Flagstone case-study body are hrefs, not labels, and are correct as they stand.)

**U7 · A guard has been switched off since before this program, and `npm test` said so on every run. Fixed (J6).**
`asset-integrity.test.ts` shipped `it.todo('every badgeImage.src in certificates.json exists in public/')` with the note *"add real badge PNGs … to un-todo this guard."* The badges arrived — every build's own prebuild prints "all 9 certificate badge image(s) found in public/", and I1 added AVIF/WebP siblings for one. So the guard sat disabled while the thing it guarded was correct, and the `1 todo` in every test summary for months was that. Enabled in **J6**, extended to the sibling formats (I1 made those a live code path), given a non-vacuity companion, and mutation-tested. **Also worth naming: four of the nine phase close-outs of this program were untracked files on one machine** — A/B/G/I committed theirs, C/D/E/H did not, and no `.gitignore` rule covers them. Preserved in `28f1593`, byte-unaltered.

**U5 · The repo's own `CLAUDE.md` told the next agent there is no deploy gate. Fixed (J5).**
Gotcha 1 read, verbatim: *"Push to `main` is instant production. There's no deploy gate."* **Phase 0 of this program changed exactly that** — `.github/workflows/deploy.yml` now triggers on `workflow_run` of **CI** and its build job runs only `if github.event.workflow_run.conclusion == 'success'` (with `workflow_dispatch` as the deliberate ungated emergency path). A17's docs truth pass covered `UI_SYSTEM.md`, `ACCESSIBILITY.md` and the token blocks; `CLAUDE.md` was not in its scope, and Phase 0's close-out recorded the CI change without re-reading the instructions it contradicted.

This is the most consequential stale sentence found in the whole phase: it is the **first file every agent loads**, and it understates the safety of the pipeline in a way that could push someone toward a riskier path. Corrected from the workflow file itself, not from memory, in **J5** — the gate, the manual-dispatch carve-out, and the parts that are still true (no staging, ~2 minutes, no rollback notice) all stated. Nothing else in the file touched. `11_ROADMAP.md`'s own "(SE-9; CI does not gate deploy)" is left alone deliberately: it was true when written, and that document is the program's historical record, not live instructions.

---

## Guard-migration ledger

**24 test files touched across the program (including this phase's two). 20 are purely additive — new coverage, zero deletions.** Exactly **four** carry any deletion at all, 17 deleted lines between them; every one hand-made, none bulk-regexed (PF-25's own rule), no guard deleted:

| Guard | What moved | One-line justification |
|---|---|---|
| `token-parity.test.ts` | `SHADOWS` `['sm','md','lg','xl']` → `+ 'soft'` | Not a migration — **new coverage of a token that had none**, which is exactly how both `--shadow-soft` defects (no dark twin, no var-backing) survived until A7. |
| `HamburgerNav.test.tsx` | `'z-[90]'`/`'z-[80]'` → `'z-chrome'`/`'z-overlay'` | Same commit as A8's z-ladder adoption. Intent (stacking order) preserved exactly; only the literal string changed. |
| `SidebarSectionNav.test.tsx` | curated count 5 → 6 → 7 → 6; `HOME_LABELS` `+ Featured — the flagship`, `+ The Record`, `− Credentials`; the `/about` leakage tell switched from `Credentials` to `The Record` | Each rode its own band's commit (C2, C5, C6). The leakage tell had to move because `Credentials` became vacuous when the band retired. **C also closed a real gap it exposed:** `HOME_LABELS` only failed on *removal*, so C2's and C5's additions rode in unchecked until C6 took one away — both added in the commit that found it. |
| `LitWindows.test.tsx` | docblock/comment repointed from the chips band to `workIndex[].lit` | **Assertions untouched**, including the pinned `'Claude Corp Dashboard — dark'` aria-label grammar. The source of the lit set moved; the set did not. |
| `contrast-preferences.test.ts` | `+ 1 assertion` — forced-colors restores a real border on `.bg-receipt` | New coverage extending an existing rescue to H2's new furniture. |
| `work-receipt.test.tsx` | `+ 1` (H1's `<time>`), `+ 1` (**J3**, the cross-reference) | Both additive. J3 is mutation-tested: setting the JSON to `999` fails with `expected '763' to be '999'`. |
| `static-integrity.test.ts` | **+ Gap 9** (J2) — no ISO date in an app route's rendered text outside a `<time>` | The invariant version of OCD item 8. Ships with a non-vacuity case so it cannot pass by finding nothing. Scope stated in the test rather than allow-listed away. |

**Not done, and named rather than quietly dropped:** PF-22's surface-drift pin (above). Phase A flagged it, no A-item scoped it, and no later phase picked it up.

---

## Census

Methodology stated so it can be re-run: every Tailwind arbitrary-bracket utility in `app/` + `components/`, `.ts`/`.tsx` only. Two columns because the raw grep also matches bracket values quoted **inside explanatory comments** — which is how a documented deliberate survivor gets counted as drift.

| | raw | comments stripped (real class usages) |
|---|---|---|
| **Program start** (`52bd0ef`) | 196 | **187** |
| Phase A close | 151 | **136** ← −51 |
| Phase B close | 158 | 143 (+7 — `IntroSkip`) |
| Phase C close | 162 | 150 (+7 — the homepage re-cut) |
| Phase D close | 168 | 156 (+6 — the case-study furniture) |
| Phase E / G / H / I close | 168 | **156** — three phases added zero |
| **Phase J now** | 169 | **156** |

**187 → 156 for the program: −31 (−17%).** The brief cites 193 at program start; Phase A's own count of the identical state was 198; mine is 187/196. Three methodologies, three numbers, all within ~5% — reported rather than reconciled to whichever is most flattering.

**Phase A's ≤60 target was missed and Phase A said so.** This phase adds the *shape* of the survivors: every one of the +20 after Phase A traces to a surface B, C, or D genuinely built new (`IntroSkip` +7, `app/work/[slug]/page.tsx` +6, `app/page.tsx` +4), and most are structurally un-tokenisable — `env(safe-area-inset-*)`, `data-[skip-done]`, enumerated `transition-[…]` property lists, `grid-cols-[1.15fr_0.85fr]`, SVG `text-[11px]` in `viewBox` user units. **J4** wrote down the reasons for the two that were deliberate but undocumented. **One genuine token candidate remains and was deliberately not invented:** `max-w-[880px]`, now a repeated literal ×2 in `app/page.tsx`. Naming it needs a design ruling, not a drive-by.

**cpl:** 95 measurable runs, 49 over the 66–75 band — unchanged from H6, fully attributed in §5. **0 of 17 runs at Sky's ruled 545px measure are over band.**

---

## Flagship-standard scorecards

### `/work/flagstone/` — 8 clean · 2 partial

| # | | |
|---|---|---|
| 1 | First impression | 🟡 Capture + plate land in the first viewport at 1440 and 375; the dated number does not — by design (C's 🔴 1 put the `2,900+` receipt hero-strip-only; D3 keeps the exact count near the sign-off). Read as one flagship *experience* — hero strip → Flagship Room → case study — all three exist within two screens of the site. Flagged rather than passed on a technicality, unchanged from D. |
| 2 | Hierarchy | ✅ One loud beat (the settle). Serif → sans → mono unbroken. |
| 3 | Image / art presentation | ✅ Device-true, both themes, **five figures / five figcaptions**, zero decorative screenshots. **Now dated in markup too** — J1. |
| 4 | Typography | ✅ Tabular numerals; no orphan headlines. Body runs at `--measure-wide` (652px, up to 87 cpl) — over the aspirational band, inside the site's actual conformance target, and H6 read it at real size and judged it fine. Attributed in §5, not hidden. |
| 5 | Storytelling | ✅ `The problem · The approach · Where it stands · My role · **What went wrong** · Reflection`. Body prose **byte-frozen and proven so**. |
| 6 | Motion | ✅ One signature beat; RM state loses no meaning (**live-emulated** this phase, 30 reveals all at rest and visible). |
| 7 | Interaction | ✅ The measured number reaches its method by hover, focus **and a real touch tap**. |
| 8 | Responsive | ✅ Recomposed at 375: **zero horizontal overflow** at 320 and at 200% text. |
| 9 | Accessibility | ✅ **Now clean.** One `h1`; keyboard-complete with the single ring (38 stops); house alt rules; **every date in `<time>`** — the gap D disclosed and H's sweep missed is closed by J1; axe 0 both themes. |
| 10 | Authorship | ✅ Sign-off present; sentences no template could contain. |

**Point 9 was a disclosed partial in D and is now clean.** Point 1 remains a deliberate, argued partial.

### `/work/claude-corp/` — at its own scale — 6 clean · 4 not held

| # | | |
|---|---|---|
| 1 | First impression | ❌ Real capture ✓. **No plate** (E1 open — needs Sky's approval or edits on four drafted `heroPlate` blocks). **No dated number** — `<time>` count on this page is **0**, because its one shot carries no `capturedDate`. |
| 2 | Hierarchy | ✅ shared template |
| 3 | Image presentation | 🟡 Both themes ✓, one real caption ✓ (**1 figure / 1 figcaption**), not dated — same gap as #1. |
| 4 | Typography | ✅ by construction |
| 5 | Storytelling | ❌ **No `## What went wrong`** — and this is not unique to Claude Corp: **none of the four non-flagship studies has one.** A factual account of what went wrong is Sky's own; drafting four is its own item, not a drive-by. |
| 6 | Motion | ✅ by construction |
| 7 | Interaction | ➖ no dated figure exists to check |
| 8 | Responsive | ✅ **verified this phase** — zero overflow at 375 and 1440, 320px and 200% clean |
| 9 | Accessibility | ✅ **verified this phase** — axe 0 both themes, one `h1`, 34/34 ringed stops, no overflow |
| 10 | Authorship | ✅ specific, not template-fillable |

**Its follow-up is small and knowable:** the one shot could carry `capturedDate`/`commit` (the Aug 1 wiring commit `65a0f9b` is a real source), which would move points 1, 3 and 7 at once. Not done here — it is a content edit outside any authorised field, and E flagged it as incremental beyond the lettered items.

---

## Honest limits — what was NOT verified, on which engine, and what stays Sky's

1. **Everything above is Chromium** (`playwright-core` 1.61.1, headless). Safari/WebKit — `backdrop-filter`, `100vh` against the collapsing address bar, iOS `:active`, OLED rendering, real touch feel, `startViewTransition` behaviour, the OG unfurl — is a device row and is never asserted here.
2. **`/archive/`'s real sign-in UI was not verified by this program, on any engine.** No `.env.local` exists locally (the real Supabase credentials live in GitHub Actions repo Variables), so the route renders `global-error.tsx` and every measurement of `/archive/` in every phase — axe, captures, keyboard, CLS — scored the **error boundary**. Needs a `.env.local` with real or disposable credentials, or a device pass against the live site.
3. **No estate-wide CLS number exists and none was invented.** Per-item only, 51 measurements. The 64-frame rig that produced the old estate-wide figure was never committed.
4. **The dusk-turn's live theme transition cannot be tested headless.** `startViewTransition` is skipped in a hidden pane — banked by G, re-confirmed here. Its perceptibility ruling closes on Sky's screen (device row 8) or not at all.
5. **`cpl-census.mjs` measures its own copy of `out/` on a hard-coded port and path**, so a pre-program cpl baseline could not be produced without swapping the built tree. The five new over-band runs were instead proven new structurally (`lg:flex-[1.6]` does not exist before Phase C).
6. **The 102 frames are viewport captures, not full-page**, and are untracked — deliberately, matching this repo's practice for capture bundles, and because 102 PNGs is ~40 MB of history for evidence that is re-runnable in four minutes.
7. **Above-fold image weight per route (≤600 KB) was not exhaustively re-audited** — Phase I spot-verified the homepage; no route's above-fold set changed after that.
8. **The hover↔focus per-element probe reads the CSSOM**, so a pairing declared on a *child* element (e.g. `group-focus-visible:` on an inner span) counts as unpaired on the parent. Phase G's stylesheet-level metric — the program's own — is the one reported as the parity number, and it is constant end to end.
9. **PF-22's surface-drift pin was never built.** `ink-contrast.test.ts`'s binding backgrounds remain 2026-07-31 pixel readings; changing a `world-surface-*` alpha would invalidate the maths while the guard stayed green.
10. **`/500`** is pruned at postbuild and has no built HTML to scan; it is out of every route census here, as it has been throughout.

---

## ✅ RESOLVED — Sky's rulings, 2026-08-26

**Every 🔴 below was put to Sky in one block the same day and answered.** The eight are kept verbatim underneath as the record of what was asked and why; this table is what happened, and the K-wave commits that did it.

| 🔴 | Sky's ruling | Shipped as |
|---|---|---|
| **1** · Round IV open in the ledger | **Close IV, open V** | **K3** — IV closed `2026-08-26` with `15 proposed · 9 chosen` untouched and `9 shipped · 9 accounted` appended (append-only, never rewrite a closed row). V opens as **The Room** — `11 phases · 10 shipped · 1 held` + `axe 0 violations · 34 scans`, both measured. It is genuinely open: **Phase F is held**, and the round closes when F fires. |
| **2** · `global-error.tsx` placeholder copy | **Adopt as final** | **K2** — four `TODO(Sky)` markers deleted, docblock rewritten to record the ratification. Not one visible character changed; the file just stops calling its own copy provisional. |
| **3** · `chore/stale-mutual-mesh-refs` | **Merge it** | `9d2c400` — README's route table now says **5** prerendered slugs, which is what the build actually emits. Also drops a dead capture-registry entry pointing at the backend-deleted MutualMesh repo. |
| **4** · Published test count 763 vs the live suite | **Leave it dated** | No commit, by ruling. The receipt says `763`, *measured 2026-08-25* — a dated measurement that lags is the honest form, and **J3** now makes it impossible for the case study to cite a figure `/accessibility/` doesn't publish. |
| **5** · "the homepage **chip** says 2,900+" | **Change the word** | **K4** — `chip` → `receipt`. One word inside PROTECT's byte-frozen method text, which is exactly why it was asked rather than taken. No guard moves. |
| **6** · The `public/` tree budget's scope | **Exclude noindexed pages** | Recorded here, no file moves either way. `public/` is **8.42 MB** excluding `/runway`'s single unlinked, `noindex`, metadata-preload video (17.23 MB, 67% of the tree) — over by 5%, not by 220%. |
| **7** · `/accessibility/` clipping 151.6px at 200% text | **Let it break** | **K5** — and it took three attempts to find a mechanism that actually works. See below; both dead ends are recorded in the code so nobody re-walks them. |
| **8** · `Real commits (AccessMap)` | **Keep the label, fix the overflow** | **K6** for the overflow. The label stands: the link opens a repo genuinely still named `AccessMap` — a case-sensitive path that also lives in the privacy URL Apple holds — so relabelling it "Flagstone" would trade one mismatch for a worse one. |

### 🔴 7 is worth reading even though it is closed

The first two fixes for it were wrong, and only measurement caught that:

1. **A Tailwind `max-[16em]:` arbitrary variant.** This project's `screens` config mixes units, so Tailwind **refuses to generate `min-*`/`max-*` arbitrary variants at all** — it says so in a build warning, and the class silently never existed. Caught by reading the build output rather than assuming the class had worked.
2. **A plain `@media (max-width: …em)`.** `em` in a *media* query resolves against the browser's **initial** font size, not the root font-size — so it is structurally blind to text scaling. It would have looked correct in review and done nothing at all.
3. **`em` inside a `@container` query** — which resolves against the *container's own* font size, the thing that actually scales. This is the only one of the three that measures the real failure condition.

Proven, not asserted: the census re-run reports **2 crossings before, 0 after**, with its non-vacuity plant caught on 68/68 frames.

### And three more, found only because Sky asked "what else has been deferred"

| | Found | Shipped as |
|---|---|---|
| **`humans.txt`** | Live at `skypistudio.com/humans.txt` — **verified with a 200 from production** — opening with six lines of agent-to-Sky scaffolding headed *"NEEDS-SKY COPY (placeholder — not final)"*. The document head links to it via `<link rel="author">`, so the people most likely to open it are exactly the people it was worst for. **In no ledger of any program.** | **K1** — header and the empty `/* NOTES */` section removed. Everything left was already true and already hers. |
| **The stray-lockfile warning** | Every build printed it. | **K7** — `outputFileTracingRoot`, after proving the stray `~/package-lock.json` (2026-05-28) predates the program by three months. |
| **Three "permanently dirty" state files** | Memory recorded them as permanent dirt and every session stepped around them. Two were stale, one was harmful: `PROJECT_STATE.md` had been a month stale and still said the **register fork was OPEN** (Sky closed it 2026-08-23), still listed **T7/T9/T18 as live placeholders** (two were resolved weeks ago, the third was T18 — real, and fixed by K1 today), and still pointed at the **superseded** R3 device checklist. `.claude/launch.json` still served `out/` with the single-threaded Python server that fabricated this phase's 16 false axe violations. | **K8** — all three resolved, corrections shown struck-through rather than quietly overwritten. |

**Privacy claim re-verified while sweeping, because `Footer.tsx`'s own comment asks for it before shipping:** "No analytics. No cookies." holds — 0 analytics dependencies, 0 third-party `<script src>` in the built HTML, 0 third-party requests across 102 page loads, and the only `document.cookie` / `Set-Cookie` strings in the entire codebase are inside the comment that asks you to check.

---

## 🔴 DECISIONS FOR SKY — as asked, kept for the record

Ordered by what blocks the push.

> ### 🔴 1 · The push itself — Round IV is still open in the ledger
> **What:** `content/rounds.json` shows Round IV ("Weight", 15 proposed · 9 chosen) with no `closed` date, while all nine R4 cars shipped and merged. The live Record band would print *"Round IV · calibration round, open"* the moment you push.
> **Recommendation:** **close IV with its accounted counts and open Round V for THE ROOM.**
> **Why:** the band and the hero receipt both *read* the ledger, so this needs no code change — but an open round that finished makes the page state something false on arrival. Opening V is honest about what just happened.
> **Alternative:** close IV and leave none open — accurate, but the band loses its work-in-progress line.
> **Impact:** `content/rounds.json` only, append-only. `rounds.test.ts`'s "at most one open round" holds either way. **I did not touch it — it is your append-only ledger.**
> **Your choice:** `[CLOSE IV + OPEN V (recommended)]` · `[CLOSE IV ONLY]` · `[DEFER]`

> ### 🔴 2 · `global-error.tsx`'s placeholder copy (U1)
> **What:** the site-wide crash boundary ships eyebrow/heading/body copy its own docblock calls "on-brand placeholders… replace with your final wording **before merge**." It merged 2026-07-04 and is in no ledger.
> **Recommendation:** **write the three strings, or ratify the placeholders as final.** Either closes it; leaving the TODO in place does not.
> **Why:** it is the one surface on this site carrying copy nobody has ratified, on a page every route can fall back to. The current text is good — that is exactly why it has survived unexamined.
> **Alternative:** leave as-is and delete the TODO comment, recording that the placeholders were adopted. Honest, and one line.
> **Impact:** `app/global-error.tsx`, three strings. Its contrast fix (H3) and CSS-independence are untouched either way.
> **Your choice:** `[I'LL WRITE THEM]` · `[ADOPT AS FINAL — delete the TODO]` · `[DEFER]`

> ### 🔴 3 · `chore/stale-mutual-mesh-refs` — one clean commit, unmerged (U2)
> **What:** `README.md` states the build prerenders 6 `/work/[slug]` slugs; it prerenders 5. Two stale plan notes and one dead capture-registry entry. Branch `65e5108` fixes all three and **merges cleanly onto `main`** (verified read-only).
> **Recommendation:** **merge it.** Docs-and-scripts only, zero site surface, and it corrects a factually wrong route table.
> **Why:** A16 removed the dead app code but was never scoped to docs; this is the remainder, already written and verified by a concurrent session.
> **Alternative:** leave it and let the README stay wrong.
> **Impact:** 3 files, +2 / −25. No test, no route, no rendered byte.
> **Your choice:** `[MERGE (recommended)]` · `[LEAVE]`

> ### 🔴 4 · The published test count: 763 vs 768 (U3)
> **What:** `/accessibility/` publishes **763 tests passing**, *measured 2026-08-25*. The suite is at **768**. The receipt is dated, so it is not false — but it lands stale.
> **Recommendation:** **leave it dated and unchanged.** A dated measurement that lags is the honest form; re-cutting it on every push turns a receipt into a counter, which is the disease the Record band was built against.
> **Why:** the number's authority comes from its date. J3 now guarantees the case study can never cite a figure `/accessibility/` doesn't publish, which was the only real risk.
> **Alternative:** refresh both `content/a11y-receipts.json` and the case study's literal to 768 with today's date immediately before pushing — a two-value edit J3 will hold consistent.
> **Impact:** `content/a11y-receipts.json` + one literal in `app/work/[slug]/page.tsx`, or nothing.
> **Your choice:** `[LEAVE IT DATED (recommended)]` · `[REFRESH AT PUSH]`

> ### 🔴 5 · "The homepage **chip** says 2,900+" (U4)
> **What:** the Flagstone method paragraph still names a chip. Phase C retired the chips band; the figure now lives in a hero **receipt**. The number is conserved and re-verified; the noun is stale.
> **Recommendation:** **change one word — "chip" → "receipt".**
> **Why:** a reader who follows that sentence goes looking for something that no longer exists on the page it names.
> **Alternative:** leave it — nobody has complained, and the sentence is inside PROTECT's byte-frozen receipt method text, which is exactly why I did not touch it.
> **Impact:** one word in `app/work/[slug]/page.tsx`. No guard moves; `work-receipt.test.tsx` pins the date and the command, not that noun.
> **Your choice:** `[CHANGE TO "receipt" (recommended)]` · `[LEAVE FROZEN]`

> ### 🔴 6 · The tree budget's scope (Phase I's 🔴, unchanged and now re-measured)
> **What:** ≤8 MB against `public/` at **25.65 MB raw / 8.42 MB** excluding `videos/amazon-night-flight.mp4` (17.23 MB — 67% of the tree, belonging to `/runway`: `noindex`, unlinked, `preload="metadata"`).
> **Recommendation:** **exclude noindexed, unlinked pages from the gate explicitly.** The budget protects the crawlable visitor experience; that asset structurally cannot affect it.
> **Why:** the raw number reads as a 3× blowout that is not true of the site anyone but one hiring team will load. Excluded, it is 8.42 MB — over by 5%, not 220%.
> **Alternative:** keep it literal and accept a permanently red gate, or move the video out of `public/` entirely (its own serving mechanism, real work).
> **Impact:** a measurement-scope decision; no files move either way.
> **Your choice:** `[EXCLUDE noindexed pages (recommended)]` · `[KEEP LITERAL]` · `[DEFER]`

> ### 🔴 7 · `/accessibility/` loses 151.6px of its method line at 200% text on a phone (R1)
> **What:** `MethodSegment`'s `whitespace-nowrap` keeps `· label-content-name-mismatch` whole. At 200% root text on a 375px viewport that token is ~462px wide and `overflow-x: clip` cuts the tail off — unreachable, not scrollable. UP-14c's own docblock did this arithmetic at 100% and was right at 100%; nobody had measured 200%, because the probe everyone used cannot fail here.
> **Recommendation:** **let it break.** Allow a hyphen break as the last resort — unreachable text on the accessibility page costs more than "COLOR-/CONTRAST" splitting across a line at an extreme text size.
> **Why:** a 27-character hyphenated token cannot fit a phone at 200% under any CSS. The only choice is *which* defect: a split token or lost text. UP-14c chose the split-token defect to avoid, without knowing the other one existed.
> **Alternative:** leave it — this is beyond WCAG 1.4.10's 320-CSS-px condition, which the site passes cleanly, and the affected text is a method footnote rather than the statement itself.
> **Impact:** `components/A11yReceipts.tsx`, `MethodSegment` only. Zero copy change either way — the visible characters are byte-identical, the spans are structure. It would reverse a shipped, reasoned contract, which is why I did not.
> **Your choice:** `[LET IT BREAK (recommended)]` · `[LEAVE THE CONTRACT]` · `[DEFER]`

> ### 🔴 8 · The `Real commits (AccessMap)` link, twice over (R2 + U6)
> **What:** one link, two unrelated findings. (a) Its **label** is the only place a reader meets the pre-rename name. (b) It is `inline-flex`, which never wraps, so at 200% text on 375 it runs 34.4px past the viewport and its `↗` is clipped.
> **Recommendation:** **(a) is yours; take (b) either way.** For the label, my read is *keep "AccessMap"* — the link opens a repo genuinely named that, and relabelling it "Flagstone" trades one mismatch for a worse one; a parenthetical like `Real commits (Flagstone's repo, still named AccessMap)` is the only fully honest form and it is long. For the overflow, `max-w-full` on the shared deliverable-link class fixes it and changes nothing at any width where the link already fits.
> **Why:** the repo name is a case-sensitive path Apple holds in the privacy URL, so it is not renameable on a whim — which makes the label a genuine copy judgement rather than a cleanup.
> **Alternative:** leave both. Neither breaks a conformance condition the site is measured against.
> **Impact:** (a) one string in `content/deliverables.json`. (b) one class in `app/work/[slug]/page.tsx`, shared by every deliverable's link row.
> **Your choice:** `[KEEP THE LABEL (recommended)]` · `[REWORD IT]` — and `[FIX THE OVERFLOW]` · `[LEAVE IT]`

### Still open from earlier phases — carried, not re-litigated

| From | 🔴 | State |
|---|---|---|
| C | `/about#method` — Draft A / Draft B / leave / Sky writes it | drafted, unapplied, blocks nothing |
| D | BP4 the exhibit lamp — as-built (confined) vs re-ruled (spill) | both built and captured; recommendation AS-BUILT; **device row 15 informs it** |
| E | E1 four `heroPlate` blocks · CP-3 Claude Corp's current numbers · UP-18 badge art · E8 P10/P11 copy | each needs Sky's words, numbers, or an asset — not a pick-list |
| G | the dark dusk-turn's intensity — SHIP AS TUNED vs DIAL BACK | **device row 8** |
| G | `intro-cue-rise` 600ms vs PROTECT-66 | recommendation LEAVE IT; a governance question, not a pixel one |
| I | unlock `components/cinematic/StaticDesertFrame.tsx` so `perf/trim-hero-weight`'s mobile srcset can land | one real, small conflict; recommendation UNLOCK |
| I | `browserslist` — measured; the 112 KB premise was false | recommendation LEAVE IT |
| — | **fable S16's supersede needs your ratification** (the Record band + receipts replaced the carry-away artifact) | never recorded anywhere |
| — | the stray `~/package-lock.json` build warning | one line in `next.config.mjs`, or delete two things in your home directory |

---

## Banked evidence — re-runnable, not screenshots

Everything above regenerates from the repo. Serve the built `out/` first:

```bash
node design-reviews/art-direction/2026-08-23/build-reports/J_serve-out.mjs
```

| Artifact | What it is |
|---|---|
| `J_serve-out.mjs` | Node static server for `out/`. **Use this, not the `portfolio-out` launch config** — see the harness note at the top. |
| `J_console-capture.mjs` | console/page-error/4xx sweep; pass a directory as arg 2 to also write the 102 frames |
| `J_a11y-interaction.mjs` | keyboard trace · reflow · **real reduced-motion emulation** · hover↔focus parity · method-link reachability |
| `J_zoom200-census.mjs` | **new** — the 200%-zoom element-level census with a per-frame non-vacuity plant |
| `J-axe-2026-08-26.json` · `J-cls-2026-08-26.json` · `J-cpl-2026-08-26.json` · `J-console-2026-08-26.json` · `J-a11y-interaction-2026-08-26.json` · `J-zoom200-2026-08-26.json` · `J-flagship-2026-08-26.json` · `J-parity-2026-08-26.json` · `J-clickwalk-2026-08-26.json` | this phase's raw readings |
| `J-frames/` | 102 frames, untracked |

The pre-program baseline used for §3 and §6 is a worktree at `52bd0ef`; recreate with
`git worktree add ~/Portfolio-worktrees/pJ-baseline 52bd0ef --detach`, symlink `node_modules`, `npm run build`.

---

## STOP

Branch **`room/pJ-qa`**, 9 commits (six fixes, three records). **Not merged, not pushed.**

```
967ed11  docs — close-out final numbers (this line included)
518363e  J6  — enable the badge guard that has been disabled since its blocker went away
28f1593  docs — commit the four close-outs that exist only on this machine
afec1b9  docs — the Phase J close-out, the ONE device session, and the rigs
41a36b9  J5  — CLAUDE.md still tells the next agent there is no deploy gate
84b34de  J4  — the census's two undocumented survivors get their reasons written down
33b34b7  J3  — tie the case study's portfolio test count to the page it cites
81a540d  J2  — /accessibility/'s two measured dates, and the guard that ends the class
b4f9e61  J1  — the flagship's three capture dates become real <time> elements
```

**The only rendered-markup changes in the whole branch are J1 and J2, and both were proven to change zero rendered characters** — the built-HTML text diff against the pre-program baseline is byte-for-byte identical before and after each. Everything else is a guard (J3, J6), a comment (J4), a factual doc correction (J5), or a record. **Nothing on any page moved.**

Final gate on this branch: `typecheck 0 · lint clean · build 26/26 + 3/3 · 79 files / 770 passed / 1 skipped / 0 todo`.

One commit is separable on purpose: `28f1593` only preserves four other phases' close-outs that were living untracked in this working directory. Drop it if they were kept out of history deliberately — nothing else depends on it.

**`main` is 18 commits ahead of `origin/main` and unpushed by design.** Push is deploy, and this phase was the gate on it. 🔴 1 is the one that should be answered before the push; 🔴 2 is the one that should probably be answered *with* it.
