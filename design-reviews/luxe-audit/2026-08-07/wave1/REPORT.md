# LUXE LEDGER — WAVE 1 · BUILD REPORT

**Run:** 2026-08-09 · single sitting · unattended · `~/Portfolio`
**Base:** `933c59a` = `origin/main` = `polish/p11-closeout` = **what is live on skypistudio.com**
**Train branch:** `luxe/wave1` — 4 commits (`e58c26e` · `21bdaef` · `6bd4db0` · docs)
— **STOPPED ON BRANCH. Sky merges.** (Const. Art. 1)
**Gated branch:** `luxe/w1-finish-the-glass` → `d9a211c`, 1 commit, **PENDING-SKY-PICK**
**Gated, no branch:** item 4 — 3 candidates rendered, **no pick made**
**Gate law:** lint · typecheck · build · vitest · `check:overflow` 0 · axe strict 0 · CLS ≤ 0.004

---

## 0. PRE-FLIGHT GATE — **PASSED**

The fire prompt required confirming `live == main == the polish train is MERGED` before building item 2,
which stacks on UP-19.

| Check | Result |
|---|---|
| `origin/main` | `933c59a` |
| `polish/p11-closeout` | `933c59a` — **identical**, `rev-list --left-right` = `0 0` |
| UP-19 (`8645610`) ancestor of HEAD? | **yes** (`merge-base --is-ancestor` exit 0) |
| `45f6632..origin/main` | **51 commits** — the whole polish stack landed |
| GH Pages deploy for `933c59a` | **success** |

**The polish train is merged, pushed and live.** Item 2 is unblocked; no BLOCKED-ON-MERGE case arose.
Local `main` is 1 commit behind `origin/main` and was left alone — `origin/main` is the truth here.

**Baseline measured before any edit:** typecheck clean · vitest **518 · 1 skipped · 1 todo · 54 files**
(exactly the ledger's stated `518·1·1·54`) · `check:overflow` **0 offenders / 64 frames**, non-vacuity plant
caught 64/64 · axe strict **0 violations / 32 scans**.

---

## 1. THE HEADLINE

**Three items shipped to the train; two are gated on your eye and wait on their own branch.**

The wave's real finding is not in any single item — it is that **the ledger was written against pre-merge
live (`45f6632`) and three of its five premises did not survive re-measurement against the merged tree.**
Every item was re-derived from the current code before a line was written. Two prescriptions were refused
on measurement and are banked for you with numbers instead of being quietly built.

Nothing in this run guessed at a gated decision.

---

## 2. PER-ITEM

### ✅ Item 1 · `curly-the-estate` — SHIPPED · `e58c26e`

**Ledger premise:** typewriter apostrophes in luxury prose; build a render-time smart-punctuation transform.

**What re-measurement found.** `smartPunctuation()` **already existed** at `lib/markdown.ts:17` and already did
the entire job the card describes — curly quotes, apostrophes, em dash, ellipsis, opener/closer heuristics,
`code`-span exclusion. It was not missing; it was not reaching everything. So the item is *extend coverage*,
not *build a transform* — and the correct scope is far smaller and far safer than the card assumed.

Two surfaces rendered a straight U+0027:

| Surface | Count | Fix |
|---|---|---|
| JSX prose escaped as `&apos;` | **9** | → `’` |
| `a11y-receipts.json` → `receipts[].sub` | 1 | routed through the existing transform |

The 9 sat against **9** places already rendering a proper `’` — an exact 50/50 split of one glyph across one
estate. That *is* the "mixed is the worst read" the audit named, and both of its cited examples ("weren't" on
/about/, "no one's left out" in the footer) were in the set.

**Deliberately not touched.** All remaining apostrophes in `content/*.json` are either (a) in `body` /
`content` / captions, which already route through `MarkdownProse` → `smartPunctuation`, or (b) **alt text**.
Alt text was left alone on purpose: it is not visible prose, the glyph is inaudible to the screen reader that
consumes it, and it sits under a Zod length + prefix rule — churn with a validation risk and no reader-visible
gain.

**Zero `content/*.json` bytes changed. Zero words changed** — every diff line is the same sentence with a
different apostrophe glyph.

**Coupling handled:** T2 in `section-nav-anchors.test.ts` requires every rail label to match a string its route
actually renders, so `lib/sectionNav.ts` and the "Let's talk" headings had to move as one atomic change.

**Guard — the non-obvious part.** `lib/__tests__/smart-punctuation.test.ts`, **+11 tests**, the first coverage
this function has ever had. It is a **source** scan, not a built-HTML scan, because the obvious guard needs
`./out/` and therefore only runs under `test:static` — which this repo has already recorded that CI never
invokes (`P3-CI-STATIC-GAP`). A guard that only fires locally would not have caught this. The rendered-prose
scan is there too, gated on `./out/` existing. Includes the `'No ramp'` case from `blog.json`, which proves the
opener/closer heuristic (a naive pass would render `’No ramp’`).

**Gates:** typecheck · lint · build · vitest **529·1·1·55** · overflow **0/64** · axe **0/32**.

---

### ⏸ Item 2 · `finish-the-glass` — **MOCKUP-GATE · PENDING-SKY-PICK** · branch `luxe/w1-finish-the-glass`

Built, gated, and **not on the train**. One `git merge` puts it in; deleting the branch discards it.

**Two declarations change, light only:**

| | current | proposed |
|---|---|---|
| pane tint | `rgb(252 251 255 / .42)` — #FCFBFF, B>R | `rgb(255 252 244 / .42)` — R>B |
| specular glint | `rgb(206 228 244 / .26)` | `rgb(250 226 196 / .26)` |

Dark glass is byte-untouched — `html.dark .glass-card` replaces the background wholesale and is already warm
at `rgb(38 31 24 / .52)`.

**A correction to the ledger, recorded rather than smoothed over.** The card names the corner glow as
`rgba(150,188,214,.26)`. That triplet *is* in `globals.css`, but it is not this rule — it was the **rim's** lit
stop until UP-19 replaced it, and it survives at two unrelated backdrops. The cool light this item actually
changes is `rgb(206 228 244 / 0.26)`. Alpha quoted right, triplet quoted wrong.

**What it costs — measured across 75 text-on-glass nodes in BOTH states:**

| Measure | Result |
|---|---|
| New AA failures | **0** |
| Direction of every delta | **positive** — warm is very slightly *better* |
| Largest ratio movement | +0.028 |
| Lowest ratio after warm | **5.237** "Expo" (floor 4.5) |
| Max per-channel pixel shift | **6 / 255** |
| Frame area changed (work cards / certificates / chip) | 29.4% / 40.6% / **3.6%** |
| axe strict | **0 / 32** |

**The decision is taste, not safety.** The change is broad in area and shallow in depth. The case for it: the
estate currently wears two temperatures of glass in one material. The case against: a cool cast is defensible
material realism — real glass *is* slightly blue.

**Where to judge it.** Not on the identity chip. The ledger leads with the chip as "the first pixel of every
arrival," and it is — but that glass floats over the *cinematic desert frame*, already deep orange, so only
**3.6%** of that frame's pixels move at all. Judge on the work cards and certificates, which sit on the canvas.

**Receipts:** `captures/glass-comparison.html` (side-by-side + 4× + the cost table) ·
`captures/glass-{work-cards,certificates,home-identity-chip}--{current,warm}.png` · `glass-compare.json`.
**Gates on the branch:** typecheck · lint · build · vitest 539·1·1·56 · overflow 0/64 · axe 0/32.

---

### ✅ Item 3 · `the-hand-answers` — SHIPPED (scope corrected) · `21bdaef`

**Ledger premise:** two dead sidebar links give the hand nothing; give both the link-draw underline.

**What re-measurement found — the premise was wrong in one direction and understated in another.**
Both targets already answered, and the polish stack is not why: the `45f6632..933c59a` diff over both files is
token renames only. They answered at the ledger's own baseline. What is genuinely broken is narrower and worse:

- `.link-draw` triggers on the **element itself**. The Featured title is an inner `<span>`, so a pointer over
  the role line or the "Open it" row hovered a *sibling* and drew nothing — the block never answered as a whole.
- **A `<span>` can never match `:focus-visible`.** The keyboard got the ring but never the line. Of the **30**
  `.link-draw` call sites in the estate this is **the only one** with that break — and the ledger did not name it.
- `self-start` was missing, so the span was a stretched flex item: the 1px line drew the full **183px** rail
  column under an **85px** word.

**Verified in Chromium against the built site** (/about/ rail):

| gesture | before | after |
|---|---|---|
| rest | `0px 1px` | `0px 1px` |
| hover the **role line** (a sibling) | `0px 1px` | **`100% 1px`** |
| **keyboard** focus-visible on the anchor | `0px 1px` | **`100% 1px`** |
| title width in a 183px column | 183px | **84.97px** |

**The Notes link is deliberately untouched — zero bytes in `SidebarRailLinks.tsx`.** UP-36 (its colour family)
is your open fork, and `.link-draw:hover` sets `color: var(--color-link-hover)`. Even a colour-neutral rider
would not escape it: **the underline gradient is painted from `--color-link-hover`, not `currentColor`**, so an
accent line under a pine label is still a colour decision on the one element whose colour is yours. It also has
a byte-identical twin ("Open it →", ~30px above on the same rail) with no underline, so adding one to a single
member of a matched pair would manufacture a new mismatch. Pinned by test so a later pass cannot add it casually.

**The rider is STATE-ONLY and must stay that way.** `--color-link-hover` is `rgb(178 81 40)` = **4.422:1** on
`bg-rail` — *under* the 4.5:1 floor for this 19px regular title. Widening the **line's** trigger is safe (1px
decorative, owes 3:1); widening the **colour's** trigger would have handed a sub-AA state to whole-block hover
and, for the first time, to keyboard users. **axe cannot catch this** — `color-contrast` evaluates resting
computed style and does not simulate `:hover`, which is exactly how 4.422:1 survived this long. So the guard is
a source assertion (`SidebarFeatured.test.tsx`, +10 tests, first coverage this component has had).

**Gates:** typecheck · lint · build · vitest **539·1·1·56** · overflow **0/64** · axe **0/32**.

---

### ⏸ Item 4 · `a-drawn-hamburger` — **MOCKUP-GATE · PENDING-SKY-PICK** · no branch, no pick

**Premise confirmed STILL-PRESENT.** The 51-commit polish stack did not touch the glyph: exactly three commits
touched `HamburgerNav.tsx` between `45f6632` and HEAD and all three are token renames — zero bytes of `h-px`,
`bg-current`, `rotate-45` or `w-[22px]`.

**The sharpest tell, measured.** Every stroked mark in the estate is round-capped — `app/icon.svg`,
`RunwayIdentity.tsx` (the sun), `IntroScrollCue.tsx` (the UP-39 chevron), `Icon.tsx`, `ThemeToggle.tsx`,
`CredentialBadge.tsx`. **The hamburger's three square ends are the sole exception sitewide**, and it is one
property. Effective weights in the estate's chrome band: chevron **1.500** CSS px · ThemeToggle 1.200 ·
`Icon.tsx` 1.021 · **hamburger 1.000**, just under the floor of the band.

The sun's own grammar is *unequal* lines — 21 units @1.7 over 13 units @1.5, both centred (ratios 0.619 /
0.882). The hamburger is 22/22/22 at 1/1/1.

**Three candidates, none committed.** All three preserve the open/close X choreography byte-for-byte — same
`top`/`rotate`/`opacity` states, same transition property lists, same `duration-base` + `ease-out` — and all
land the weight on 1.5px, exactly the ratified chevron.

| | what it says |
|---|---|
| **A · Round Hand** | The mark was always right; it just never got the hand's ends. One property, maximal restraint. |
| **B · The Horizon** | Borrows the sun's own proportions — middle rule 13.5px @1.25 against 22px @1.5, centred (0.614 / 0.833 vs the sun's 0.619 / 0.882). The short rule is the one that fades, so the X stays symmetric. |
| **C · The Drawn Rule** | True taper — width varies along each run, tapers opposed so both heavy ends land at the **top** of the X, the weight of two downstrokes. The estate has no taper anywhere; this adds vocabulary rather than conforming to it. |

**Receipts:** `captures/hamburger-candidates.html` + `.png` — all four marks at real size in the real 44px disc
with the real scrim, closed **and** open, light **and** dark, plus a 6× block where the caps and the taper are
legible. Full pasteable JSX for each candidate is in the verifier record; one commit applies whichever you pick.

**Not decided here, on purpose.** A 1px→1.5px change is a ~50% heavier mark at the most-seen altitude on the
site. That is the item's whole point and it is a taste call.

---

### ✅ Item 5 · `rag-finish` — SHIPPED (half built, half refused on measurement) · `6bd4db0`

**BUILT — the rag half.** `text-wrap: pretty` was already the house default on **27** prose paragraphs; /about/
held the only **seven** still running `wrap`. Same defect class as item 1, applied to rag.

Receipt, measured by `Range.getClientRects()` line-bucketing before and after:

| | before | after |
|---|---|---|
| runs with `textWrap: wrap` → `pretty` | — | **8** |
| total line count across all 78 measured prose runs | 276 | **276 (delta 0)** |
| every `cplMax` | — | identical |

**Zero height change anywhere** — no reflow, no layout shift, CLS floor untouched. `text-wrap: pretty` is
progressive; engines without it render exactly as today, so there is no fallback to write and no Safari/WebKit
claim made from a Chromium rig.

**NOT BUILT — the width nudge. This is a measurement, not a preference.**

The card prescribes ~640→612px to bring over-wide runs into the 66–75 cpl band. Probed at real line boxes —
*not* extrapolated, because chars-per-pixel is not constant across paragraphs (the /about/ principles run
yields 0.1375 chars/px against a process step's 0.1190 at the same font size):

| /about/ body prose | worst cpl | in band? |
|---|---|---|
| 640px — today | 88 | no |
| **612px — the prescription** | **84** | **no** |
| 580px | 76 | no |
| **545px** | **72** | **YES** |
| 520px | 69 | YES |

**612px does not reach the band it is spent for; it lands 9 over.** The first width that clears is ~545px — a
15% narrowing of the reading measure, a visible compositional change, not the XS nudge the card scoped. And
`measure-lead` is shared by ~10 call sites across /contact/, /certificates/, /blog/, /work/ and /about/, so
scoping it to two runs would manufacture two different reading measures on one estate.

**The audit also understated the scope:** not "two runs at 76–79 cpl" but **38 of 78** measurable prose runs
over 75, worst **88**. That is a token-level decision about the estate's reading measure and it is yours.

---

## 3. CONSERVATION — 5 / 5 MAPPED

| # | item | verdict on re-measurement | outcome | where |
|---|---|---|---|---|
| 1 | `curly-the-estate` | PARTIALLY-CURED — transform already existed; coverage was the gap | **SHIPPED** | `e58c26e` |
| 2 | `finish-the-glass` | STILL-PRESENT (glow triplet mis-cited) | **GATED — built, not merged** | `luxe/w1-finish-the-glass` |
| 3 | `the-hand-answers` | PARTIALLY-CURED — premise wrong; a worse, unnamed defect found | **SHIPPED, scope corrected** | `21bdaef` |
| 4 | `a-drawn-hamburger` | STILL-PRESENT | **GATED — 3 candidates, no pick** | `captures/hamburger-candidates.*` |
| 5 | `rag-finish` | PARTIALLY-CURED + UNDERSTATED | **SHIPPED (rag) · REFUSED (width, with numbers)** | `6bd4db0` |

Nothing dropped silently. Nothing gated was guessed.

---

## 4. DECISIONS FOR SKY

1. **Merge the train.** From `main` (currently 1 behind `origin/main` — fast-forward it first):

   ```
   git checkout main && git merge --ff-only origin/main && git merge --ff-only luxe/wave1 && git push
   ```

   That puts **4 commits** on top of `933c59a` — items 1, 3, 5 and this report bundle. Live in ~2 min,
   no staging, no deploy gate. **Rollback:** `git reset --hard 933c59a && git push --force-with-lease`.
   Per-item revert is `git revert <sha>` — each item is exactly one commit.

2. **Item 2 — warm glass: yes or no.** Open `captures/glass-comparison.png` (or the `.html` beside it).
   - Yes → `git merge luxe/w1-finish-the-glass` *after* the train. The branch is based on `6bd4db0`,
     one commit behind the train tip, so this is a real merge rather than a fast-forward — verified
     conflict-free (`git merge-tree`, 0 conflicts).
   - No → `git branch -D luxe/w1-finish-the-glass`.

   No a11y cost either way; every contrast delta is positive.
3. **Item 4 — pick A, B, C, or none.** Open `captures/hamburger-candidates.png`. One commit applies it.
4. **The reading measure (item 5's refused half).** 38 of 78 prose runs exceed 75 cpl, worst 88. Reaching the
   band needs ~545px against today's 640 — 15% narrower, estate-wide, and `--measure` at `65ch` renders 706px.
   Do you want that pass at all? It is a compositional change, not a polish item.
5. **`--color-link-hover` is under AA on five light surfaces** — canvas-alt 4.402 · surface-warm 4.492 · rail
   4.422 · panel-cool 3.709 · wash-cool 4.461 (canvas 4.819 and surface 5.121 pass; dark is clean 5.496–6.553).
   It is a *hover* colour, so `axe` never sees it and `ink-contrast.test.ts` does not cover it. **This is a
   pre-existing live defect this wave did not introduce and deliberately did not widen.** Worth its own pass.

---

## 5. BANKED QUESTIONS (asked of no one but you)

1. **Item 4 weight:** 1.5px lands exactly on the ratified chevron, but it is a 50% increase over today at the
   most-seen altitude. Chevron as the anchor, or ThemeToggle's 1.200px?
2. **Item 4 middle rule (candidate B):** centred follows the sun's grammar; left-aligned is the conventional
   hamburger idiom and the site's editorial habit. Which?
3. **UP-36 adjacency:** once the colour family is settled — should the Notes link take an underline at all?
   Its twin "Open it →" has none, so one without the other creates a new mismatch.
4. **`Sidebar.tsx:57`** — the wordmark has the identical missing-`self-start` condition; its underline also
   draws the full 183px column. Its hover colour is fine there (24px = WCAG large text, 3:1 floor). Overhang
   only. Fix in a follow-on?
5. **`SidebarFeatured.tsx:30`** — the no-featured fallback ("Latest work →") is `text-display-s` with
   `.link-draw` on the anchor, so it hits the same 4.422:1 at 19px regular. Currently dead code (exactly one
   deliverable is featured). Left untouched.
6. **Two-tier response (item 3):** pointer directly on the word gives line + colour; block hover and keyboard
   give line only. Unify once `--color-link-hover` is ratified, or is reserving the loudest answer for the most
   direct gesture the grammar you want?
7. **ThemeToggle's sun/moon** sits inside the same mobile dialog and is also a stock Lucide-family mark rather
   than a drawn one. Does the drawn-glyph question extend to it?

---

## 6. HONEST BOUNDARY — what this run did NOT do

- **CLS was not re-instrumented.** The audit's 64-frame fullPage CLS rig was a one-off and was never committed.
  Instead each item carries its own zero-height-delta proof: item 5 measured **276 → 276** total prose lines;
  items 1 and 3 change glyphs and a hover-state paint property with no box-model effect; item 2's diff is two
  colour values. Worst-case CLS therefore rests on the banked **0.0003** (floor 0.004). Flagged, not faked.
- **Chromium only.** Every rig here is `playwright-core`/Chromium. No Safari/WebKit claim is made; those stay
  device rows.
- **The process-step cpl figure is contaminated and is not relied on.** At `lg` the NumberedStep layout is two
  columns (numeral | text), and the line-bucketing groups characters by their painted `top` — so the numeral
  shares a row with body text and inflates the count. The 612px finding rests entirely on the /about/ runs,
  which are single-column and clean. Named rather than quietly averaged in.
- **Five of seven verification agents were lost to a session limit mid-run.** Items 3 and 4 carry full
  adversarial specs from completed agents; items 1, 2 and 5 were verified by direct measurement instead
  (source census, `Range.getClientRects()` cpl census, composited-contrast sampling, pixel diffing) and every
  claim above is traceable to a committed instrument in `tools/`.
- **One measurement was contaminated mid-run, caught, and re-taken.** While shrinking the glass captures I
  re-ran `glass-compare.mjs` against an `./out/` that had been built *on the glass branch* — so its "current"
  arm already carried the warm pane, both arms were the same colour, and every delta came out `0.000`. Read
  naively that is a *cleaner* result than the truth, which is exactly what makes it dangerous. Caught by the
  backdrop composite reading `[252.1, 249.7, 242.3]` (the warm value) in both states. Rebuilt from the train
  and re-ran: the original figures reproduced exactly (0 new failures · max movement 0.028 · lowest 5.237).
  The tool now **refuses to emit a comparison** whose un-injected arm does not compute the cool pane — the
  same class of guard this repo already had to add twice (the frozen-literal ink guard, the vacuous
  `scrollWidth` probe). Every glass number in this report comes from the clean run.
- **Morgan's three dirty files** (`.claude/launch.json`, `DECISIONS_LOG.md`, `PROJECT_STATE.md`) were frozen as
  found and are in no commit.

---

## 7. INSTRUMENTS ADDED (reproducible, committed)

| tool | what it measures |
|---|---|
| `tools/run-axe.mjs` | axe strict (defaults + `label-content-name-mismatch` + `color-contrast`), 16 routes × 2 themes |
| `tools/cpl-census.mjs` | real characters-per-line via `Range.getClientRects()` line-bucketing — not `ch` arithmetic |
| `tools/width-probe.mjs` | what each candidate measure actually delivers, re-measured per width |
| `tools/glass-compare.mjs` | warm-vs-current from one build + composited contrast on every text-on-glass node |

Baselines banked alongside: `axe-baseline-933c59a.json` · `cpl-baseline-933c59a.json` · per-item axe reports.

**Report ends. STOPPED ON BRANCH — nothing merged, nothing pushed.**
