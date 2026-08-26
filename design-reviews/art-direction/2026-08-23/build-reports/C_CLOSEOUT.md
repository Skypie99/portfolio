# Phase C — The Homepage — CLOSE-OUT

**Branch:** `room/pC-homepage` (7 commits: 5 work items + 2 riders found in the verification pass). **STOP — not merged, not pushed.**
**Date:** 2026-08-25, single continuous session.
**Gate at close:** `npm run typecheck && npm run build && npx vitest run` — **all green.** Typecheck 0 errors. Build compiled successfully, 26/26 static pages exported, same pre-existing `output: export` header warnings as Phases A and B. Tests **70 files, 685 passed / 1 skipped / 1 todo** (Phase B closed at 684; the delta is exactly one new `Receipt` case for the dateless ledger row). `npm run lint` clean.

**Prerequisite check, verified rather than trusted:** `git log` showed `main` at `c5c349c Merge branch 'room/pB-shell'`, with `49efe18 Merge branch 'room/pA-tokens'` beneath it — Phases A and B both merged. `components/Plate.tsx`, `Receipt.tsx` and `LedgerRow.tsx` all present with their guards. Gate held.

---

## Headline numbers

| | before | after | Δ |
|---|---|---|---|
| **Content bands** (budget 8) | 7 | **7** — hero · flagship · work · record · how-i-work · about · contact | composition re-cut, count held |
| **Document height, 1440** | 13,273px | **10,875px** | **−2,398 (−18.1%)** |
| **Document height, 768** | 16,266px | **12,760px** | **−3,506 (−21.6%)** |
| **Document height, 375** | 16,432px | **12,660px** | **−3,772 (−23.0%)** |
| `<main>` height, 1440 | 12,347px | 9,949px | −2,398 |

Measured on the built `out/` (SE-2), served over `http.server`, light and dark identical at every width. The brief's "~12,700px" referred to `<main>`; both numbers are given so neither can be read favourably.

**Band-by-band, 1440:**

| band | before | after | note |
|---|---|---|---|
| `#hero` | 1,191 | 1,418 | +227 — the three receipts moved in |
| `#showcase` | 861 | — | retired (C4) |
| `#flagship` | — | 837 | new (C2) |
| `#work` | 2,581 | 1,044 | −1,537 — cards → index rows (C3) |
| `#record` | — | 623 | new (C5) |
| `#how-i-work` | 1,180 | 1,180 | byte-frozen, untouched |
| `#about` | 853 | 908 | +55 — the credentials line (C6) |
| `#certificates` | 1,741 | — | retired (C6) |
| `#contact` | 520 | 520 | untouched |

---

## What shipped, per item

| # | Outcome | Where |
|---|---|---|
| **C1 · band order** | ✅ Delivered as specified. Cinematic → hero + 3-receipt strip → flagship room → work index → record → how the work gets made → a brief account (+ credentials line) → let's talk → LitWindows. Seven bands against a budget of eight; page length down at all three widths. | `app/page.tsx` |
| **C2 · The Flagship Room** | ✅ Delivered, with one deliberate omission (below). Full-width band immediately after the hero: eyebrow, `Flagstone`, the museum `Plate`, the device-true capture on the `224 150 90` plinth, the status line, one pull-line from *What went wrong*, and "Read the case study →". Flagstone's card slot is gone from `#work`. | `app/page.tsx` |
| **C3 · The Work index** | ✅ Delivered. Five status-bearing rows — numeral · title · one line · status · year — with row 01 cross-referencing the room (`Featured — above ↑` → `#flagship`). `/work/`'s promenade untouched, verified byte-identical. | `app/page.tsx` |
| **C4 · retire the chips** | ✅ Delivered, **including the conservation rider** — see the table below. Three curated receipts in the hero: tests · axe · the calibration round. | `app/page.tsx`, `components/Hero.tsx`, `components/Receipt.tsx` |
| **C5 · The Record** | ✅ Delivered, minus two rows the board drew and the hero already headlines (below). Four ledger rows, most-recent first, one order at every width; three columns at lg, three stacked lines below it, never a table. | `app/page.tsx` |
| **C6 · credentials demoted** | ✅ Delivered. The band is gone; one sentence inside A Brief Account carries the retired H2 verbatim plus a data-read count and the existing CTA. | `app/page.tsx`, `components/HamburgerNav.tsx` |
| **C7 · `/about#method`** | ⏸ **Drafted, deliberately NOT applied** — the brief says "draft it and surface it; do not silently rewrite Sky's prose." Two drafts are below for ratification. `app/about/page.tsx` is byte-identical to `main`, which also keeps `/about/` inside the untouched-routes proof. | — (draft below) |

**Commits, in order**

```
6c53cb0  C2 — the Flagship Room takes the card slot
eef6433  C3 — The Work becomes an index, not a second gallery
44a2e16  C4 — the chips band retires into three hero receipts
8e5f31f  C5 — The Record, a published defect ledger above the fold
1c9c8f0  C6 — credentials demote from a band to a line
7d10d4e  C3 rider — the 44 floor on the one standalone small link
c90f450  C4 rider — the last three chip figures land on their rows
```

**Diff:** 10 files, +765 / −371.

```
 app/page.tsx                                    | 945 ++++++++++++++--------
 components/A11yReceipts.tsx                     |  25 +-   (comment only)
 components/HamburgerNav.tsx                     |  10 +-
 components/Hero.tsx                             |  15 +
 components/LitWindows.tsx                       |  11 +-   (comment only)
 components/Receipt.tsx                          |  14 +-
 components/__tests__/LitWindows.test.tsx        |  11 +-   (comment only)
 components/__tests__/Receipt.test.tsx           |  16 +
 components/__tests__/SidebarSectionNav.test.tsx |  37 +-
 lib/sectionNav.ts                               |  52 +-
```

---

## C4 · THE CONSERVATION TABLE

*This is the rider Sky attached to approving the chip retirement. It is not optional, and it is checked against the BUILT page, not against intent — a `grep` for each chip's literal string in `out/index.html`.*

| chip (retired) | datum | where it lives now | verbatim in built HTML |
|---|---|---|---|
| `2,900+` **tests passing** · Flagstone | figure + label | **Hero receipt 1** — `2,900+ / tests passing — Flagstone / reported 2026-08-16 · method` → `/work/flagstone/#flagstone-test-count-method` | ✅ `2,900+` ✅ `tests passing` |
| `15` **AI agents** · Claude Corp | figure + label | **Work index row 02**, chip note in the accent register, under the status | ✅ `15 AI agents` |
| `100%` **static** · Prompt Library | figure + label | **Work index row 04**, same slot | ✅ `100% static` |
| `56` **command cards** · Ghost Code | figure + label | **Work index row 05**, same slot | ✅ `56 command cards` |
| `2.2 AA` **the bar I build to** · Born accessible | figure + **Sky-ratified label (2026-07-13, T10 W4-02)** | **Record band row 3**, label moved byte-for-byte, still linking `/accessibility/` | ✅ `2.2 AA` ✅ `the bar I build to` · href present |

Every chip's *project* link also survives: `/work/flagstone/`, `/work/claude-corp/`, `/work/prompt-library/`, `/work/ghost-code/` are the work-index row titles, and `/accessibility/` is the Record row's door.

**The rider earned its keep.** The first pass looked complete to the eye but was not: `15` and `56` were arriving only by coincidence through the deliverables' own summaries ("A 15-role AI team", "56 cards"), and **`100% static` was not on the page at all**. A literal-string grep caught it; reading the page did not. That is commit `c90f450`, and it cost zero pixels at 1440 (the notes fit the slack the summaries already left) and +64px at 375.

**Where the three project figures live in code:** a small `CHIP_NOTE` map in `app/page.tsx`, not `content/deliverables.json`. They were never deliverable data — they were the retired band's own hand-set copy — and giving them a schema field would invent a home for a claim nobody has re-verified.

---

## Guard migrations (each rode its own band's commit)

| guard | migration | commit |
|---|---|---|
| `lib/sectionNav.ts` — home map | `+ flagship` (first, DOM order) | C2 |
| `lib/sectionNav.ts` — home map | `+ record` (between work and how-i-work) | C5 |
| `lib/sectionNav.ts` — home map | `− certificates` | C6 |
| `lib/sectionNav.ts` — `UNINDEXED_SECTION_IDS` | `− showcase` | C4 |
| `SidebarSectionNav.test.tsx` — curated count | 5 → 6 → 7 → 6 | C2, C5, C6 |
| `SidebarSectionNav.test.tsx` — `HOME_LABELS` | `+ Featured — the flagship`, `+ The Record`, `− Credentials`; the `/about` leakage tell switched from `Credentials` (now vacuous) to `The Record` | C6 |
| `HamburgerNav.tsx` | `/#certificates` → `/certificates/` (the anchor no longer exists) | C6 |
| `Receipt.test.tsx` | new case: tier + method with no date | C4 |
| `LitWindows.tsx` + its test | docblock/comment repoint from the chips to `workIndex[].lit` — **assertions untouched**, including the pinned `'Claude Corp Dashboard — dark'` aria-label grammar | C4 |
| `A11yReceipts.tsx` | its grid comment claimed to be "home's showcase grammar verbatim" with a twin that must move in lockstep. The twin is gone. Comment corrected; **render byte-identical** | C4 |

`section-nav-anchors.test.ts` T1–T7 pass against the built export at every step. The rail ships exactly the six mapped labels, in order, and each anchor was click-walked: all six land their band at viewport top, as does row 01's `#flagship` cross-reference.

**A gap in the suite, found and closed rather than left:** `HOME_LABELS` only fails on *removal* — adding a label to the map never breaks its loops. So C2's `flagship` and C5's `record` rode in unchecked and only surfaced when C6 took `Credentials` away. Both were added in the commit that found it. The array's own comment already warned about exactly this ("a new rail entry that is not added here is a section the suite silently stops checking"); it was right.

---

## PROTECT-list proof (mechanical, `git diff main..HEAD`)

```
components/cinematic/                                     → empty
app/archive/ components/archive/ lib/archive/             → empty
app/accessibility/page.tsx                                → empty
app/about/page.tsx                                        → empty
app/work/                                                 → empty
app/colophon/page.tsx                                     → empty
components/CalibrationRecord.tsx                          → empty
content/deliverables.json                                 → empty
content/rounds.json                                       → empty   ← the open-Round-IV 🔴 is UNTOUCHED
content/a11y-receipts.json                                → empty
content/certificates.json                                 → empty
content/profile.json                                      → empty
content/showcase.manifest.json                            → empty
scripts/                                                  → empty
```

- **`#how-i-work` copy, byte-frozen:** prose extracted from the band on `main` and on `HEAD`, stripped of JSX/comments/classNames — **identical, 1,965 characters both sides.**
- **All five `status` strings:** present verbatim in the built homepage. Flagstone's renders in the flagship room's status line (its index row carries the cross-reference instead), the other four on their rows.
- **`profile.json`'s tagline** reads `Small, exact software, documented honestly.` — verified, not re-litigated, per 🔴 1's instruction. `Footer.test.tsx:41`'s pin untouched.
- **Featured-slot invariant:** the room reads `deliverables.find(d => d.featured)` by slot, never by index, so re-ordering the JSON cannot promote a different project into it.
- **LitWindows mechanism:** four lit, Dashboard dark, aria-labels byte-identical in the built page — verified in the DOM, which is what the brief warned would "silently go dark".

---

## Untouched routes, diffed against pre-phase captures

Every `.html` in `out/` was captured before any edit and compared after. Comparing raw bytes is noise (Next stamps a new build id and new chunk hashes on every build), so the comparison is on **visible text** (scripts and styles stripped, tags removed, whitespace collapsed) and on **the complete set of `<a href>` values**:

```
route                                    visible-text-diff   href-diff
./404.html                                       0            0
./404/index.html                                 0            0
./about/index.html                               0            0
./accessibility/index.html                       0            0
./archive/index.html                             0            0
./blog/building-accessmap/index.html             0            0
./blog/building-flagstone/index.html             0            0
./blog/index.html                                0            0
./certificates/index.html                        0            0
./colophon/index.html                            0            0
./contact/index.html                             0            0
./flagstone/{,accessibility,privacy,support,terms}/  0        0
./runway/index.html                              0            0
./work/{,accessmap,claude-corp,dashboard,flagstone,ghost-code,mutual-mesh,prompt-library}/  0  0
./index.html                                     2           25   ← the homepage, by design
```

**25 of 26 routes are byte-identical in visible content and link set.** The only residual byte differences anywhere are build ids and chunk hashes inside the RSC `__next_f` payload.

The homepage's own href delta, for the record: **gained** `#flagship`, `/#flagship`, `/#record`, `/accessibility/#receipts`, `/colophon/#calibration`, `/work/flagstone/#flagstone-test-count-method`, `/work/flagstone/#what-went-wrong`; **lost** `/#certificates`, the nine external credential-verify URLs (they moved with the band to `/certificates/`, which is byte-identical), and the seven project demo/GitHub URLs that lived on the retired ProjectCards. All four new cross-page anchors were checked against real `id=` attributes in the built targets. `static-integrity.test.ts` Gap 2 (every internal href resolves) passes.

> ⚠️ **Worth Sky's eye, not a defect:** the homepage no longer links directly to any live demo or repo — the index rows link to case studies, and the outbound links live on `/work/` and each case study. Board pane A's rows carry no outbound links either, so this is faithful to the approved design; it is flagged because the hero sentence says "all five on the open web" and the front door no longer opens onto any of them.

---

## Device rows (built `out/`, Chromium only — SE-7)

| check | 1440 | 768 | 375 |
|---|---|---|---|
| document height | 10,875 | 12,760 | 12,660 |
| `<main>` height | 9,949 | 11,487 | 11,325 |
| horizontal overflow | none (`scrollWidth` = `clientWidth`) | none | none |
| leaf-node truncation across the new bands | — | — | **0** |
| light vs dark: layout identical | ✅ | ✅ | ✅ |
| hero receipt strip | 3-up, 283px cells | **stacked**, 424px | **stacked** |
| flagship room | 2 columns, words 373px seated against a 571px capture | recomposed | **plate-first**: eyebrow+title → plate → full-bleed capture → 2-line status; pull-line `display: none` |
| work index rows | uniform 125px; cols 47 / 543 / 339 / 63 | rows | rows, 197–278px, nothing truncated |
| Record band | 3 columns, all `when` cells on one right edge (x 1185 / 1185 / 1186) | 3 columns | **3 stacked lines per row**, never a table |
| console errors | **0** | — | — |

The 3-up receipt breakpoint is `lg`, not `sm`, and the reason is the rail: from `md` up the shell spends 280px on the sidebar, so a 768 viewport leaves this column 424px and an `sm:` 3-up measured **131px per cell** — an 83px content box that folded the mono labels and pushed 15px of copy out of its padding. A media query cannot see its container, so the breakpoint had to come from the column width the rail leaves behind.

### Contrast — every new pair, both themes, derived-composite

Measured in the built page by compositing each element's real translucent background stack down to the canvas. Worst real-text pair: **5.47 light / 7.35 dark** — every one clears AA.

```
                              light   dark        light   dark
flagship eyebrow               6.18   9.33   receipt figure     12.46  13.83
plate claim                    6.18   9.33   receipt label       5.64   7.35
plate caption                 12.07  14.22   receipt tier line   5.64   7.35
capture caption                5.47   7.56   receipt method      6.38   9.08
flagship status word           7.08  10.70   work row title     13.00  14.68
flagship pull-line             6.96   9.33   work row summary    7.50   9.63
flagship case link             6.18   9.33   work row status     5.89   7.81
record figure                  6.26   9.27   work flagship xref  6.66   9.64
record what                    7.05   9.26   credentials line    6.66   9.64
record when                    5.53   7.51   credentials link    6.66   9.64
record inline link             6.26   9.27
```

Two things the sweep flagged that are **not** defects, both verified rather than waved through:

1. **`flagship h2` reads 1.00** — `.ember` is gradient text (`color: transparent` + `background-clip: text`), so a naive probe composites transparent onto its own background. The untouched `#how-i-work` h2 measures identically. `ember-large-text.test.ts` is the guard that actually covers `.ember`.
2. **Work-row numeral reads 1.81 / 2.45** — the ghosted ordinal, `text-ink/30` + `aria-hidden="true"`, inside an `<ol>` so AT already announces position. Byte-identical treatment to `ProjectCard`'s shipped numeral, confirmed by measuring it on `/work/` (`rgba(32, 48, 44, 0.3)`, same classes). Decorative, house-consistent, not introduced here.

### Keyboard trace, 1440

20 focusable stops inside `<main>`, every one with an accessible name, in a DOM order that follows the reading order: skip-intro → hero CTA → scroll cue → 3 receipt method links → read the case study → 5 row titles + row 01's cross-reference → 4 Record links → the full account → the credential badges → the email.

**One real target-size defect, found by the trace and fixed** (`7d10d4e`): row 01's `Featured — above ↑` measured 140×**14**px. Every other new link is inline in a sentence and takes WCAG 2.5.8's inline exception; this one is standalone. It now reaches the house 44 floor the way `TapTargets.test.tsx` says to — a stretched `::after`, never padding, because `*:focus-visible` traces the element's own border box and padding would draw a 44px ring around a 14px label. Verified by hit-testing the built page: `elementFromPoint` returns the link at −14px and +14px from its border box and stops at +16px. 14 + 15 + 15 = 44.

**Open for Phase H, stated rather than buried:** the work-index title links measure 24×N px. That meets WCAG 2.5.8 AA's 24×24 minimum exactly, but it is below this house's self-imposed 44 floor. Left as-is because the same is true of every card title in the codebase; flagged so Phase H decides once, for all of them.

### Reduced motion

**No new motion was introduced.** The new bands use `Reveal` (already covered by globals.css's `@media (prefers-reduced-motion: reduce)` block, which forces `opacity: 1; transform: none` and is scoped to beat `html.js`), `HeroImageSettle` (CSS keyframes already gated behind `no-preference`), and `HeroProductReveal`'s `pr-hero-lift` (already `transform: none` under RM). No new keyframes, no scroll-linked animation, no `transition-all`. **No baked `opacity: 0`** on any new element — checked in the built DOM.

Two method notes, because both cost real time and the next phase should not repeat them:

- **Flipping `html.js` at runtime is not a valid no-JS simulation.** It leaves transitioned properties pinned at their pre-flip computed value. The untouched `#how-i-work` and `#contact` bands behave identically under it, which is what proved the reading was an artifact. The real floor is asserted by `static-integrity.test.ts` Gap 5 (static markup ships `.reveal` armed-not-shown; built CSS scopes the hidden state under `html.js` and defines the failsafe) — green.
- **The theme sweep needs transitions neutralised.** With the browser pane backgrounded, CSS transitions never tick, so `getComputedStyle` reports pre-toggle colours and the work-row title appeared to fail dark contrast at 1.28. Injecting `* { transition: none !important }` before measuring returned the true resting value, `rgb(236, 234, 224)` — **14.68:1**.

---

## 🔴 DECISIONS FOR SKY

### 🔴 1 · The `2,900+` Receipt — the brief and the board disagree, and I followed the brief

**What:** C2's contents list puts a `2,900+` `Receipt` inside the Flagship Room. C4's table sends that same datum to the hero strip, and says the strip carries "three curated receipts... tests · axe · the calibration round". Board 01 pane A draws the room **without** a receipt. One datum, two homes.

**Recommendation:** **leave it where it is — the hero strip only** (what shipped).

**Why:** printing the site's biggest number twice inside two consecutive bands is the exact disease this phase treats, and C4's table is the more specific instruction. The room is not left without proof: it has the plate, the dated capture, the status, and the pull-line.

**Alternative:** add a second `Receipt` to the room, satisfying C2 literally and Flagship Standard #1's "one number with a date" within the room's own viewport. It is a five-line addition.

**Impact:** `app/page.tsx`, the flagship band only. No guard moves.

**Your choice:** `[HERO STRIP ONLY (recommended)]` · `[ALSO IN THE ROOM]`

---

### 🔴 2 · Round IV reads open in the ledger, and its nine chosen items all shipped

**What:** unchanged from the brief — `content/rounds.json` shows Round IV ("Weight", *15 proposed · 9 chosen*) with no `closed` date, while all nine R4 gallery cars fired and merged.

**Recommendation:** **close Round IV with its accounted counts, and open Round V for THE ROOM.**

**Why:** the ledger is append-only and load-bearing; an open round that finished makes the Record band state something false the moment it goes live. Opening V is honest about what is happening right now.

**Alternative:** close IV and leave none open — accurate, but the Record band loses its "work in progress" line, which is half its character.

**Impact:** `content/rounds.json` (append-only — add, don't rewrite), and the Record band's first row plus the hero's third receipt.

**⚠ I did not touch `rounds.json`.** It is Sky's append-only ledger and this is Sky's call. Both surfaces **read** it, and both were written to stay true either way: while a round is open they print that round undated; once none is open they print the last one that closed, with its close date. So this 🔴 blocks nothing and can be answered whenever — the band follows the ledger with no code edit. `rounds.test.ts`'s "at most one open round" gate will hold for either answer.

**Your choice:** `[CLOSE IV + OPEN V (recommended)]` · `[CLOSE IV ONLY]` · `[DEFER]`

---

### 🔴 3 · `/about#method` — drafted, not applied

**What:** three "how I work" accounts compete. The homepage `#how-i-work` band is the real one and is byte-frozen; the colophon's "How it was made" is the site's own and legitimately different; `/about#method`'s "Three quiet steps, repeated carefully" is a generic paraphrase of the canonical band. C7 says rewrite it to defer — and says draft and surface, do not silently rewrite. So `app/about/page.tsx` is untouched.

**Keep the eyebrow `Method` either way** — it is the rail's label for `/about/#method` (guard T2 checks it byte-for-byte), so changing it would need its own `sectionNav` migration. Both drafts replace only the H2 and the three `NumberedStep`s.

**Draft A — the deferral, plain (recommended):**

> **Method**
> ## How the work gets made is written down once.
>
> There is one account of my method on this site, and it is on the front page: the governance system the agents work inside, the constraints that make the output reviewable, a case where the system blocked something it should have, and the limit I have not solved.
>
> I would rather it exist once, accurately, than three times in three shortened forms.
>
> **Read how the work gets made →**  ( `/#how-i-work` )

**Draft B — shorter, no editorialising:**

> **Method**
> ## The account lives on the front page.
>
> **Read how the work gets made →**  ( `/#how-i-work` )

**Why A:** the second sentence is the *reason* the page defers, in Sky's register, and it turns a dead-end band into a small statement about how the site is kept. **Why B:** it adds no new authored prose at all, which is the safest reading of "do not silently rewrite."

**Impact:** `app/about/page.tsx` only. `NumberedStep` keeps its other consumers. The `sectionNav` `/about` map does not move.

**Your choice:** `[DRAFT A (recommended)]` · `[DRAFT B]` · `[LEAVE AS-IS]` · `[SKY WRITES IT]`

---

### 🔴 4 · Two new copy strings — RESOLVED 2026-08-25

**Sky ratified the recommendation in-session and authorised the merge.** The credentials line stands as written. The Record band's h2 changed: `Measured, not claimed.` → **`The last thing I got wrong is in here too.`** — it was the only fragment among six full-sentence H2s on the page, and it restated more weakly "The record is honest." from the band two below it; `/accessibility/` keeps the original phrase, untouched. Eyebrow unchanged, so no `sectionNav` migration. Shipped on `room/pC-record-h2`, merged as `9c166c7`. The original ask is kept below for the record.

### 🔴 4 (as asked) · Two new copy strings on Sky's page, for ratification

Neither invents a claim; both re-use existing ratified wording, but they are new sentences on Sky's homepage and she gets the last word.

1. **The Record band's heading.** Eyebrow `The Record` + H2 `Measured, not claimed.` — split from board pane A's own line, "The record — measured, not claimed". Note the phrase also names `/accessibility/`'s receipts strip; different routes, no guard conflict, but it is a repeat.
2. **The credentials line (C6).** `Credentials, earned in order — 9 of them, with issuers and dates.` The first clause is the retired band's own H2 verbatim; the count is read from `content/certificates.json` so it cannot drift; the door keeps the band's existing CTA, "See the credential badges →".

**Your choice:** `[BOTH FINE]` · `[REWORD — tell me which]`

---

### Still empty and visibly pending, as it should be

**BP9's curator's line.** An agent refused to author it once already; that was right. It is one line, in Sky's words, whenever she writes it. Nothing in this phase touched it.

---

## Premises of the brief that did not hold

Four, all recorded where they bit:

1. **"`#hero` and the retired `#showcase` stay/become declared-unindexed."** They cannot both. Guard T4 asserts `UNINDEXED_SECTION_IDS` in *both* directions — an id declared there that the page no longer renders fails exactly as loudly as an undeclared band that appears. Since C4 retires the band outright, `showcase` had to LEAVE the list. `UNINDEXED_SECTION_IDS['/']` is now `['hero']`. The guard is right and the brief was not.

2. **C2's `2,900+` Receipt contradicts C4's re-homing table.** 🔴 1 above.

3. **C5's Record band vs board pane A.** The board draws the ledger with `2,971 pass` and `0 × 32 scans` as its first two rows — the same two figures the hero strip headlines two screens up. Those two rows were not built. What shipped is the open round, the last defect, and the two measured numbers the hero does *not* carry (`2.2 AA` and `100% focus stops`), with `/accessibility/#receipts` holding all six for anyone who wants the rest. Say the word and the two rows go back in.

4. **The board's capture caption is dated `2026-08-17`; the manifest says `2026-07-31`.** `content/showcase.manifest.json` records `map-overview` / phone / `projectSha 5ab3f0c4` / `capturedAt 2026-07-31`. The manifest wins — measured, not asserted. The caption also does **not** name a theme, because the capture is a light/dark twin pair that `ThemedShowcase` swaps with the site; naming one would go false in the other.

## Notes for the phases downstream

- **`LedgerRow` is still unwired.** The Record band's rows are figure · descriptive sentence · date — the board's own `.lrow` shape. `LedgerRow`'s contract is a serif ordinal in a 40px column plus a mono-uppercase short title (CalibrationRecord's bones), which cannot hold `Last defect` or a full sentence. Using it here would have meant bending the furniture to fit; the band got the board's row instead. `LedgerRow` still belongs to CalibrationRecord, and Phase E or a later pass should wire it there.
- **`CountUpStat` no longer runs on the homepage.** It retired with the chips band and still serves `/accessibility/`'s receipts strip. R3 Decision #2's locked timing was not touched — the band that hosted it is simply gone. Phase A anticipated this: `Receipt`'s own docblock says the animated register belongs to `CountUpStat` and the documentary one to `Receipt`.
- **`TagPill` and `ProjectCard` are no longer imported by `app/page.tsx`.** Both remain live elsewhere (`/work/`, the case studies).
- **The hero CTA still reads "See the work." and still targets `#work`,** so it now jumps past the page's loudest moment. Left alone: it is Sky's copy and the label matches its target. Worth a sentence in a later phase.
- **Screenshots could not be captured in this session** — the Browser pane returned blank frames for every capture attempt, on this branch and on an untouched route alike. Every device row above is therefore geometry- and text-derived from the live built page (`getBoundingClientRect`, `getComputedStyle`, `elementFromPoint`, `innerText`), which is stronger evidence for the claims being made, but a visual pass on the two new bands is still owed.

---

## One working-tree note

`.claude/launch.json` was already modified (uncommitted) when this phase started: a previous session had removed the `portfolio-out` entry — the `python3 -m http.server --directory out` config — and moved the dev server to port 3000. SE-2 requires evidence from the built `out/`, so the `portfolio-out` entry was added back, restoring what `main` already carries. It is **left uncommitted**, like the pre-existing edits around it, and every phase after this one will want it. Nothing else in the working tree was touched; each commit staged only its own named files.

---

## STOP → MERGED

Written at STOP: branch `room/pC-homepage`, 7 commits, not merged.

**Superseded the same day.** Sky merged Phase C herself (`a79ecc0`), then ratified 🔴 4's recommendation and authorised the follow-up merge in-session. `main` is now `9c166c7`:

```
9c166c7  Merge branch 'room/pC-record-h2'
78e9c0a  room(pC-record-h2): the Record band's h2 earns its place
a79ecc0  Merge branch 'room/pC-homepage'   ← Sky
c90f450  …the 7 Phase C commits…
```

Gate re-run on `main` after the merge: typecheck 0 · build 26/26 · vitest 70 files / 685 pass · lint clean.

**NOT PUSHED.** `origin/main` is still `c5c349c`, ten commits behind. Pushing is what reaches production, and 🔴 2 is the reason to hold: the live Record band would read *"Round IV · calibration round, open — 15 proposed · 9 chosen"* while all nine of those shipped. Close IV (and open V) in `content/rounds.json` first — both surfaces read the ledger, so it needs no code change.

🔴 1 (receipt stays hero-only) and 🔴 3 (`/about#method`, two drafts, unapplied) remain open and block nothing.
