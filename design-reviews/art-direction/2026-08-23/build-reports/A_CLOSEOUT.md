# Phase A — Tokens & Craft Hygiene — CLOSE-OUT

**Branch:** `room/pA-tokens` (18 commits, A1–A18, one per work item, plus one gate-driven correction commit). **STOP — not merged, not pushed.**
**Date:** 2026-08-24 (single continuous session).
**Gate at close:** `npm run typecheck && npm run build && npx vitest run` — **all green.** Typecheck 0 errors. Build: compiled successfully, 26/26 static pages exported, 0 new warnings (the 6 warnings present are all the single pre-existing "headers won't work with output:export" notice, documented as a known GH Pages condition — see UI_SYSTEM.md UP-01). Tests: **678 passed / 1 skipped / 1 todo across 69 files** (baseline was 656/1/1/65; +22 tests / +4 files are the new Plate/Receipt/LedgerRow/Exhibit suites + 3 new token-parity rows for `--shadow-soft`).

---

## Prerequisite check (before any work)

Memory carried a note that `truth/portfolio-round2-2026-08-23` needed merging before Phase A could start. Verified directly rather than trusted: that branch doesn't exist (`fatal: Not a valid object name`), and `main`'s HEAD already carried the R2-T1/T2/T4 truth-pass commits plus later work (Flagstone legal pages, the CI-gates-deploy change). The memory note had rotted, consistent with the standing warning at the top of MEMORY.md. Prerequisite was already satisfied; proceeded directly.

---

## What shipped, per item

| # | What shipped | Where | Gate at commit |
|---|---|---|---|
| **A1** | Unified 17 section-H2 sites (6× `leading-[1.1]` + 11× `leading-tight`) onto a new `leading-heading` Tailwind utility → `var(--lh-snug)`. Named `heading`, not `snug`, because Tailwind's stock `leading-snug` (1.375) already had 2 live consumers (Hero.tsx, work/[slug]/page.tsx) that would have silently broken. | `app/globals.css`, `tailwind.config.ts`, 6 page files | token-parity 107/107 |
| **A2** | Root-caused the `--lh-body` zero-consumer defect: the `body`/`prose` fontSize tuples already baked a matching literal, making ~21 of 24 `leading-[1.65]` sites pure redundant no-ops. Pointed the tuples at `var(--lh-body)` and deleted the redundant classes; added `leading-body`/`leading-prose` for the genuine overrides; adopted stock `leading-loose` for the two sites wanting exactly 2. 7 singular values left arbitrary, each commented. | 17 files | token-parity 107/107 |
| **A3/A4** | `--measure-lead` was a hardcoded `'640px'` Tailwind literal with **no backing CSS var at all** — a 4th, unnamed measure system. Made it real, set to Sky's ratified ~545px ruling (13_DECISIONS.md #4b). New `--measure-heading` (672px) replaces `max-w-2xl` on the same 17 H2 sites. 4 hand-approximated `max-w-[540px]/[520px]` sites folded into `measure-lead`. | 9 files | 656/1/1 (full suite) |
| **A5** | `--rgb-receipt` (exact values from the design doc) + `--rgb-receipt-rule` (doc gave this qualitatively only — see the gate-correction entry below). Purely additive. | `globals.css` | token-parity + ink-contrast |
| **A6+A7** | Radius `{4,8,16,22,pill}`: fixed the `--radius-pill` 999-vs-9999 mirror mismatch (zero visual change), promoted `--radius-card` to a real token, var-backed `tailwind.config.ts`'s whole `borderRadius` block. Migrated the brief's own pre-flagged 🔴 example (`rounded-[1.35rem]`→`rounded-card`) and one `rounded-2xl` stray. `--shadow-soft` given its long-missing dark twin + var-backed in Tailwind; extended `token-parity.test.ts`'s `SHADOWS` array to actually cover it (was zero-coverage, which is how both defects went unnoticed). Combined into one commit — both landed in the same two files before either was committed; noted rather than fought. | `globals.css`, `tailwind.config.ts`, 2 components | typecheck + build + 135 tests |
| **A8** | z-ladder adopted, scoped to the brief's named files only (not the many unrelated `z-10`/`z-0` elsewhere). Added `--z-chrome:90` — a genuinely necessary new rung between overlay(80) and grain(100) that HamburgerNav's trigger has no other home for; does not renumber the existing 5. `body::after`'s hardcoded `z-index:100` now consumes `--z-grain`. 2 test pins migrated in the same commit. | `globals.css`, `tailwind.config.ts`, `HamburgerNav.tsx` + its test | 122 tests |
| **A9** | Codified `--section-y: clamp(6rem,10vw,8rem)` — deliberately **not** wired into any call site, since the near-universal `py-24 lg:py-32` pattern is a discrete breakpoint jump and the clamp would change the rendered value at every intermediate width, not just the notation. (Revisited by the gate correction below — the board named an exception.) | `globals.css`, `tailwind.config.ts` | 110 tests |
| **A10** | A11yReceipts' stat-grid cell padding had drifted from page.tsx's (`p-8` vs the C-22-reclaimed `p-6`) despite both carrying a "byte-identical" comment. Restored the match; container untouched. | `A11yReceipts.tsx` | 6/6 |
| **A11** | 10 sites' `outline-terracotta` (legacy alias) → `outline-accent-primary` (canonical, same value). Unified the 2 card-title links' unexplained `outline-offset-4` to the site's universal `offset-2` (no comment justified the 4px, and 16px of real gap to the neighbouring rule either way). Caught and fixed 2 of my own invalid-JSX mistakes along the way (documented so the pattern doesn't repeat). | 3 files | 218 tests + isolated build |
| **A12** | `.ember-teal/-gold/-moss`'s 6 hardcoded hex pairs (+3 separate `html.dark` override rules) re-based onto `--rgb-ember-{teal,gold,moss}-{a,b}` role triplets — every hex→RGB conversion hand-verified. The 3 dark-override rules are gone; the triplets auto-flip instead. | `globals.css` | 132 tests |
| **A13** | Encoded the gold-contrast rule (2.45:1 light, below the 3:1 floor) as a comment at the token + in UI_SYSTEM.md. Value itself untouched — this documents a risk, not a fix. | `globals.css`, `UI_SYSTEM.md` | 110 tests |
| **A14** | Two independent legacy-alias systems, both audited empirically (real grep, not trusted comments): Tailwind color keys 30→10 survivors (12 removed had zero live call sites — 6 of them, the `wa-teal-*` family, were still marked "pending, retire after showcase merge" though that train merged long ago and the re-count found zero). `globals.css`'s separate `--color-*` legacy vars 22→6 (a genuinely different mechanism — Tailwind classes never route through these). `lib/cn.ts`'s allowlist updated to match. | 3 files | 659/1/1 |
| **A15** | 4 new server components (Plate, Receipt, LedgerRow, Exhibit), each with its own test file, none wired into any page. Plate mirrors Flagstone's existing inline markup byte-for-byte (word-identical, as required). Receipt needed DM Mono weight 500 loaded — added it to `app/fonts.ts`, since `font-synthesis-weight:none` (set globally) would otherwise have silently rendered `font-medium` as 400 rather than fake-bold. | 10 files | isolated build + 678/1/1 |
| **A16** | Deleted dead `mutual-mesh`/`mutual` references. Expanded from the brief's literal 2 named files to all 4 with the identical pattern (+ CaseStudyCard's own type union) — fixing only 2 would have left the brief's own "no references to a withdrawn project" false in the other 2. | 5 files | typecheck + targeted tests |
| **A17** | UI_SYSTEM.md: fixed `canvas-alt` (was `26 31 32`, real is `34 28 22`), `measure-wide` (was 72ch, real is 60ch), radius (`999`→`9999`, `rounded-[22px]`→`rounded-card`), `--space-1…20`→ also `--space-50`. Documented A7/A9's additions so the doc doesn't fall stale the moment it's read. Deleted a 28-line WCAG block in `tokens-phase2.css` auditing a hex palette deleted 2026-06-02. Added a HISTORICAL marker to the top of `docs/ACCESSIBILITY.md` (566 lines auditing that same dead palette + a fully superseded component architecture) rather than rewriting or deleting 566 lines of otherwise-legitimate history. | 3 files | 678/1/1 (unchanged — docs only) |
| **A18** | PROTECT-54 was an open banked question in the 2026-08-01 guard ledger ("formally retired, or does some replacement exist? I will not invent one"). Sky ruled it retired 2026-08-23; updated both the ledger's table row and the banked-question entry to say so. | `design-reviews/guards/2026-08-01/GUARD-LEDGER.md` | n/a (docs) |
| **Gate correction** | Re-rendering the specimen sheet against real tokens found 2 real gaps (detailed below) and fixed both. | `globals.css`, `page.tsx`, `UI_SYSTEM.md` | 678/1/1 |

---

## The specimen-sheet gate

Compared every value in `mockups/04-system-sheet.html`'s embedded `.L`/`.D` token scopes against the real, current `app/globals.css`, then served the sheet over a local static server (not `file://` — that mode wouldn't scroll/interact reliably) and let its own executable contrast script run.

**Result: reproduces the approved board exactly**, including the intentionally-failing gold row (script-computed 2.45:1, matching A13's documented value to two decimal places).

**2 real gaps found and fixed, not just noted** (both already folded into the numbers above):
1. `--rgb-receipt-rule` (A5) was my own derived guess, since the design-system doc only described it qualitatively ("pine-leaning hairline"). The board's embedded swatch is unambiguous — `66 122 111` / `111 191 194`, i.e. `--rgb-cool` verbatim, not a blend. Corrected.
2. Sheet 4 names the homepage's two `py-[15px] -my-[15px]` touch-target sites as a `--space-4` migration by name — a call A9 had explicitly declined (reasoned as precision a11y math, not rhythm). Deferred to the board: migrated to `py-4 -my-4` (~46px effective vs. the hand-calculated 44.39px — 1px more room per side, not a regression).

**Differences explained, not changed** (the board and a later or more specific source disagree; the later/more specific one governs):
- **`measure-lead`:** the board's own text still frames "640→~545px" as an open A/B question. `13_DECISIONS.md` (dated after the board) records it ratified as B. Later, more authoritative source wins.
- **z-ladder:** the board lists only the original 5 rungs; `--z-chrome` (90) isn't among them. HamburgerNav's trigger has no home in the 5-rung set (must sit strictly between overlay/80 and grain/100) — a real implementation necessity the board's one-line summary didn't enumerate, not a contradiction of it.
- **Duration tokenization** ("NEW 560 settle") on Sheet 4 is Phase G (motion)'s scope per the roadmap file split, not Phase A's actual A1–A18 table.
- **Plate's caption typography:** the board's CSS mockup (`.plate .l2`) renders the caption in italic serif. My actual work order (the pasted brief) says, verbatim, "**3 mono lines**... Flagstone's stays **word-identical**" — and Flagstone's real, live, shipped markup is mono. The specific, later, git-committed brief overrides the general concept board here; Plate.tsx is mono, matching the brief and the live site, not the board's illustration.
- **`--measure-heading`:** the board confirms the *original intent* was one token replacing both `max-w-2xl` and `max-w-3xl` — this strengthens rather than resolves the 🔴 already deferred in A3/A4 (see below); no value is specified anywhere for what a merged 672/768 token should be.

---

## Census

**198 → 155** arbitrary values (`app/`+`components/`, excluding `/archive`; brief cited 193 as the pre-phase baseline — my own count of the identical pre-phase state was 198, a ~3% methodology drift, reported honestly rather than reconciled to the brief's number).

**Target ≤60 — missed.** Reported plainly rather than reconciled away. Why: my grep methodology counts *every* Tailwind arbitrary-bracket value sitewide, and only a narrow slice of that total was ever named across A1–A18 (leading, measure, radius, shadow-soft, z-index, ember colors, focus-ring, legacy color aliases). A category breakdown of the 155 survivors:

| Category | Count | In Phase A's actual scope? |
|---|---|---|
| `leading-[...]` | 7 unique sites | Yes — A2's own deliberate survivors, each commented |
| `w`/`h` (icon, device-frame, glyph dimensions) | 26 | No — never named in A1–A18 |
| `aspect-[...]` (image-well ratios) | 11 | No |
| `transition-[...]` (enumerated property lists) | 9 | No — required syntax, not a design value |
| `content-['']` (empty pseudo-element content) | 9 | No — required CSS syntax |
| `bg-[...]` (decorative gradients) | 8 | No |
| `scale-[...]` (hover micro-interactions) | 7 | No |
| `border-[rgb(var(...)/...)]` | 6 | No — already token-sourced, just needs bracket syntax for the alpha |
| `min-h-[...]` (card height floors) | 6 | No |
| `-top`/`-bottom`/`-inset-[21px]` (touch-target pseudo-element math) | 11 | No — A9 explicitly excluded this precision-calculated category (distinct from the `[15px]` padding case the gate correction did move) |
| `max-w-[...]` (breadcrumb truncation triples, hero H1 measures) | 9 | No — different semantic purpose than A3/A4's reading measure |
| everything else (grid-rows, gradient stops, underline-offset, spacing odds, …) | ~46 | No |

Within the categories A1–A18 actually named, the reduction is real and large — e.g. arbitrary `leading-[...]` sites: **45 → 7**. The ≤60 target implicitly assumed touching several categories no work item named; hitting it would have meant scope well beyond the 18 items actually specified.

---

## PROTECT-list proof (mechanical, not asserted)

```
git diff main --stat -- components/cinematic/                                    → empty
git diff main --stat -- app/archive/ components/archive/ lib/archive/ supabase/   → empty
git diff main --stat -- scripts/capture-showcase.mjs scripts/showcase/ \
                         content/showcase.manifest.json                            → empty
git diff main -- content/deliverables.json                                        → empty
git diff main -- app/accessibility/page.tsx                                       → 1 line,
    className only (leading-[1.75] → leading-prose); copy text byte-identical
```

The Flagstone case-study body lives in `content/deliverables.json` (empty diff above) — covered. Golden-hour light/dusk dark palettes: no `--rgb-canvas/-ink/-accent/…` *values* changed anywhere in this branch — only new role triplets were added (`--rgb-ember-*`, `--rgb-receipt*`) and the ladder/radius/shadow *mirrors* were fixed; verified by re-reading every edited hunk in `globals.css` against this claim while writing this report.

---

## Guard-migration ledger

| Guard | What moved | Justification |
|---|---|---|
| `token-parity.test.ts` `SHADOWS` array | `['sm','md','lg','xl']` → `+ 'soft'` | New coverage, not a migrated pin — this guard had **zero** prior coverage of `--shadow-soft`, which is exactly how both A7 defects (no dark twin, no var-backing) went unnoticed. |
| `HamburgerNav.test.tsx` | `toContain('z-[90]')`/`'z-[80]'` → `'z-chrome'`/`'z-overlay'` | Same commit as the z-ladder migration (A8), per PF-25's rule. Intent (verify stacking order) preserved exactly; only the literal string changed. |
| `Button.test.tsx` (`rounded-pill` pin) | Unaffected | Verified explicitly — A6's radius work didn't touch `rounded-pill`'s own value or the class name, only fixed the CSS-var-vs-Tailwind mismatch underneath it. |
| `TapTargets.test.tsx` (`-top-[21px]`/`-bottom-[21px]` pins) | Unaffected | The `[15px]` gate-correction migration is a *different* mechanism (padding, not the one-sided `::after` stretch) — confirmed by re-reading this test before and after. |
| `ink-contrast.test.ts` | Unaffected | No `world-surface-*` value or `--surface-alpha-*` touched anywhere in this branch — re-verified the guard's own `SKY_STOPS_AT_MEASUREMENT` sky-stop pins after every globals.css-touching commit. |
| `axe-core` hardcoded absolute-path load | **Not done** | Named in the brief's guard-migrations list; no A-item scoped it and it touches the a11y test rig's dependency wiring, not tokens — flagged here rather than done as unscoped extra work. |

No guard was deleted. No guard migration used bulk regex — every one above was a hand-made, individually-reasoned edit.

---

## 🔴 Still open

> **What:** `max-w-3xl` (768px, the bigger `text-display` SettleHeadings — about/contact/certificates/blog/work/accessibility/colophon/runway page headers, 9 files) vs. the new `--measure-heading` (672px, replacing `max-w-2xl` on the 17 section-H2s).
> **Recommendation:** leave both distinct this phase (done). A future phase folds `max-w-3xl` into `--measure-heading` only with an explicit value ruling from Sky, since 672px vs 768px is a real, visible width change on 9 page-title headings, not a notation change.
> **Why:** the brief's own text names both classes as being replaced by one new token; the approved board's Sheet 4 confirms that was the original intent. But no value is specified anywhere for what the merged token should be, and collapsing 768→672 (or 672→768) changes the rendered width of every display heading sitewide.
> **Alternative:** guess 672px (matching the more common/H2 pattern) and accept the risk of narrowing 9 display headings without a design ruling.
> **Impact:** 9 files, ~9 page-title `<SettleHeading>` elements, if resolved by folding rather than leaving separate.
> **Your choice:** [Fold to 672] [Fold to 768] [Keep separate, permanently] [DEFER]

---

## Found that the brief didn't predict

1. **The receipt-rule value gap** and **the 15px→space-4 call** (detailed above) — both are cases where my own in-phase judgment, made without the specimen-sheet cross-check, diverged from the ratified board. Neither would have been caught without literally re-rendering the sheet and reading its embedded values line-by-line, which is exactly why that step is the gate rather than a formality.
2. **A stale "pending" comment that was actually long-since-resolved:** the 6 `wa-teal-*` Tailwind aliases were still commented "call sites migrated by P10; retire after showcase merge" as if the merge hadn't happened — it had, and the re-count found zero live call sites. Comments claiming future work should be re-verified, not trusted, even (especially) when they sound authoritative.
3. **Two-tier legacy-alias systems:** `tailwind.config.ts`'s color keys and `globals.css`'s `--color-*` vars turned out to be fully independent mechanisms (Tailwind classes never route through the CSS vars) — a name being "alive" in one says nothing about the other. `--color-peach-cream` is dead while `peach-cream` (the Tailwind class) is live, and vice versa isn't true for several others.
4. **Two invalid-JSX mistakes of my own** (a bare `//` and a `{/* */}` comment, both placed directly inside a JSX tag's attribute list outside any expression container) — caught by typecheck both times before commit, but worth naming: only a bare `/* */` (no braces) is valid there, matching a pre-existing convention already in this codebase (CaseStudyCard.tsx's "door ajar" comment) that I hadn't recognized as the reason it was written that way until I broke it myself.
5. **A concurrent-session branch artifact:** partway through this session, a `fix(runway): correct timeline, add Seedance 2.0 credit...` commit (Sky's own, `Co-Authored-By: Claude Sonnet 5` — a separate session sharing this same working directory) landed on `room/pA-tokens` instead of `main`, sitting between the A11 and A12 commits. An identical commit (same message, same parent) landed properly on `main`/`origin/main` around the same time. Verified mechanically: `git diff main -- CLAUDE.md app/runway/page.tsx components/ContactEmail.tsx components/FooterEmail.tsx` is empty — the two branches converged on identical content for every file that commit touched, so it has **zero net effect** on this branch's diff or on any future merge. Not something I caused or fixed; flagged so it isn't a surprise when reviewing `git log` on this branch.
6. **`--lh-display` is orphaned and disconnected from what its name implies:** `globals.css` defines `--lh-display: 1.15`, but the actual `text-display`/`text-hero` Tailwind tuples hardcode `1.05` directly (per token-parity.test.ts's own comment, "folded 1.1 → 1.05"). The token and the class it's named after have drifted apart. Not touched (no A-item named it, and NumberedStep's `leading-[1.15]` — which happens to match the token's *value* — is a genuinely unrelated element, not a hidden consumer) — flagged for whoever next touches display typography.

---

## Files changed

43 files, +1523/−222, across 18 work-item commits + 1 gate-correction commit. Full list: `git diff main --stat` on this branch.
