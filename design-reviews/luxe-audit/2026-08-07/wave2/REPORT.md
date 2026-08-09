# LUXE LEDGER — WAVE 2 · BUILD REPORT

**Run:** 2026-08-09 · single sitting · `~/Portfolio`
**Base:** `f39b1ab` (Wave 1, now live on skypistudio.com) — Wave 2 branches from live main
**Branch:** `luxe/wave2` — 3 commits · **STOPPED ON BRANCH. Sky merges.** (Const. Art. 1)
**Scope fired:** the `--color-link-hover` defect (first), then items 7 + 10 + 6
**Gate law:** lint · typecheck · build · vitest · `check:overflow` 0 · axe strict 0 · CLS ≤ 0.004

> ⚠️ **Wave 2 was NOT pre-approved for merge.** Sky's merge approval covered Wave 1 only.
> This branch stops for her review. One item (6) is **refused as specified** — see §2.

---

## 1. HEADLINE

**Three things shipped to the branch; one is refused because it collides with a law Sky already ratified.**

| | outcome | commit |
|---|---|---|
| **Defect · `--color-link-hover`** | **FIXED** — and it caught a *second*, unmeasured AA bug on dark | `b4c3b80` |
| **Item 7 · `beyond-the-floor`** | **BUILT** — contrast preferences as designed peers | `8078960` |
| **Item 10 · `prints-like-a-book`** | **BUILT** — a designed ink-on-paper layer | `f576418` |
| **Item 6 · `every-room-its-postcard`** | **REFUSED as specified** — violates the ratified PROTECT-70 OG taxonomy | — |

The wave's throughline is the same as Wave 1's: the ledger is a strong starting point, not ground truth.
Wave 1 retired 4 of its own premises on measurement; Wave 2 retires a 5th — item 6 — on a *design law*.

---

## 2. PER-ITEM

### ✅ Defect · `--color-link-hover` — FIXED · `b4c3b80`

Wave 1 surfaced this and banked it: the link **hover** colour reused `--rgb-accent-hover`, which brightens
past resting ink, and on the cool/lit surfaces links actually sit on it fell **below AA** — invisible to axe,
which evaluates resting style and never simulates `:hover`.

Measured on the real **composited** surfaces (raw-token sampling is what hid it originally):

| theme | surface | old hover | ratio |
|---|---|---|---|
| light | world-surface-cool-pale `[215,209,190]` | `178 81 40` | **3.35:1 FAIL** |
| dark | world-surface-alt, lit `[89,74,57]` | `218 138 92` | **3.16:1 FAIL** |

**The dark failure is a NEW find — Wave 1 hadn't measured it.** The earlier "dark is clean 5.50:1" was
sampled on the raw dark tokens (`21 25 26`…), not the warm world composites a link is painted over. So the
bug lived in *both* themes, hidden the same way.

Resting ink is already tuned to the AA ceiling ("≥4.5:1 on every world surface"), so a brighter hover cannot
be AA-safe on light. The unifying fix: **hover moves *away* from its own background for more contrast** —
mirrored per theme:

    --rgb-link-hover  light  135 71 45 → 120 62 38   (deepen; worst 5.47:1)
                      dark   231 181 147 → 240 196 166 (brighten; worst 5.34:1)

Decoupled into its own token so the `.ember` gradient and the `accent-hover` utility are byte-untouched.
Verified in an emulated browser + a swatch sheet (`captures/link-hover-swatches.png`): the hover reads as an
intentional shift on both binding surfaces. **Guard:** `ink-contrast.test.ts` gains four `rgb-link-hover`
binding surfaces + a two-theme non-vacuity that proves the *old* values fail — the coverage Wave 1 said was
missing. Stale Wave-1 docs (the `.link-draw-group` rule, the `SidebarFeatured` guard) updated: they no longer
cite a live sub-AA reason and now pin the two-tier response as a deliberate design choice.

**Gates:** vitest 619·1·1·63 · overflow 0/68 · axe 0/32 · ink-contrast 22/22.

---

### ✅ Item 7 · `beyond-the-floor` — BUILT · `8078960`

The estate meets AA everywhere but answered **no** OS contrast preference — `prefers-contrast` rules: 0,
`forced-colors` rules: 0. Same philosophy the reduced-motion contract already proves: a preference is a
designed peer, not an absence. Both blocks are **additive** — with no preference set they never match, so the
default render is byte-identical (axe/overflow unchanged).

- **`prefers-contrast: more`** — token-layer only. Muted inks step toward the body ink, the decorative
  hairline adopts the interactive line. Measured on canvas: light muted 7.5→10.2:1, meta 5.9→8.6:1; dark meta
  7.8→10.7:1. Verified: `--rgb-ink-muted` resolves to the boosted `50 64 58` under the preference.
- **`forced-colors: active`** — rescues the two things that actually break when Windows High Contrast strips
  backgrounds + shadows: (1) the gradient-clipped `.ember`/`.ember-moss` display headings, which otherwise
  render `color: transparent` = **invisible** (verified: "I build things with AI." now paints CanvasText);
  (2) glass, which loses its fill+shadow — given a real 1px system border. Everything else already degrades
  correctly (outline focus survives, currentColor icons follow CanvasText). Screenshot:
  `captures/forced-colors-about.png`.

**Banked for Sky:** the cinematic title carve has the same invisible-in-forced-colors shape but sits behind
the LOCKED desktop intro and is decorative — not touched.

**Guard:** `contrast-preferences.test.ts` (+9) — every `prefers-contrast` override must have *strictly more*
contrast than its default (a "more contrast" mode that lowered contrast would be worse than none), and the
forced-colors rescues must be present.

**Gates:** vitest 628·1·1·64 · overflow 0/68 · axe 0/32.

---

### ✅ Item 10 · `prints-like-a-book` — BUILT · `f576418`

Print rules were 0; ⌘P gave the UA's mercy. A designed ink-on-paper layer, **inert on screen** (all inside
`@media print`, zero screen specificity). The palette is forced at the **token layer** so every component
re-inks at once, then chrome is hidden, depth flattened, and the designed artifacts kept.

Verified by rendering **all four priority routes to PDF with Chromium print emulation, browser started in DARK
mode** (the hardest case): flagship · blog · about · home all print clean ink-on-paper, chrome gone, no dark
voids. Contact sheet: `captures/print-sheet.png`; PDFs: `captures/print-*.pdf`.

Two bugs the rendering caught and fixed (neither guessable from source):
- a dark-mode print kept the **peach** accent-ink (231 181 147) and printed the terracotta headings as ghosts
  → the accent tokens are now forced to their light paper values.
- inline-gradient decorative washes (home hero wash, `ambient-drift`, the `html.dark` candlelight pool, the
  1px terracotta seam ticks) bled warm through the token reset → neutralised by pattern.

**Banked for Sky:** the cinematic title carve (behind the LOCKED intro) is not print-rescued — decorative,
desktop-only, locked.

**Guard:** `print-layer.test.ts` (+8) pins the paper contract so an edit can't silently undo it.

**Gates:** vitest 636·1·1·65 · overflow 0/68 · axe 0/32.

---

### ⛔ Item 6 · `every-room-its-postcard` — REFUSED, then **HELD by Sky (2026-08-09)**

> **SKY'S RULING (2026-08-09): HOLD THE LINE.** The OG system stays the ratified 3-grammar set
> (name · artifact · measurement). Item 6 is closed on the restraint list — **do not re-propose it.**
> PROTECT-70 stands. The five content rooms keep the home name plate by design.

**Not built, on purpose.** Item 6 asks to give `/certificates/`, `/contact/`, `/about/`, `/colophon/` and
`/blog/` their own bespoke OG cards, reading their sharing of the home card as a defect ("a shared business
card where the work rooms hand out engraved ones"). **That premise contradicts a design law Sky already
ratified.**

**PROTECT-70** (`design-reviews/r3-audit/03_r3-slate.md:99`, quoted in `r4-gallery/01_ground.md:104`), verbatim:

> "The OG division of labor: the HOME card signs the NAME (PROTECT-17/44); every `/work/*` route unfurls its
> own ARTIFACT (FT-1). F's proof-debt reading of the home card is the ACCEPTED COST of that division — loading
> the home card with numbers dies on sprezzatura."

The OG system is a deliberate, complete taxonomy: **name plate (home) · artifact cards (/work/* — now 6/6,
ghost-code included) · one measurement plate (/accessibility)**. Non-work rooms unfurling the name plate is
**the designed division, not a gap.** The `/accessibility` card — the *one* non-work bespoke card — required,
in its own words, "a **PROTECT-70 taxonomy ratify, Sky's**" to add a *third* grammar.

Item 6 would add **five more grammars** at once. And the two most-shared rooms have nothing to unfurl:
`/about/` and `/contact/` have no artifact and no measurement, so a bespoke card would have to *invent* a
grammar — which is exactly the accretion the law names: *"Beautiful but wrong for this site… the
anti-accretion law working as designed. The studio's power is in what it leaves out."*

- The ledger's item-6 Deps/PROTECT line cited the TA-10 precedence chain but **never cited PROTECT-70** — the
  binding law for any OG proposal. This is the same class of miss as Wave 1's four retired premises.
- There is **no PROTECT-70-consistent gap left to build instead**: the artifact half is complete (all 6
  deliverables, incl. ghost-code, now declare a `cardImage`), and the measurement seat is filled.

**So this is a Sky call by the estate's own rules, not an agent's to self-authorize.** Options for her:
1. **Hold the line (recommended)** — item 6 dies on the restraint list, where its own audit puts "knowing when
   to stop is the aesthetic." Zero work; the OG system stays a system.
2. **Ratify a widened taxonomy** — decide which rooms (if any) earn a grammar and what each unfurls (the
   engraving, not just the name). Each is her taxonomy ratify. I can then build exactly that set.

Building 5 cards on my own would have shipped precisely the "beautiful but wrong" accretion the law rejects.

---

## 3. CONSERVATION — 4 / 4 MAPPED

| item | verdict | outcome | where |
|---|---|---|---|
| defect `--color-link-hover` | live AA bug, both themes | **FIXED** | `b4c3b80` |
| 7 `beyond-the-floor` | STILL-PRESENT (0 rules of each) | **BUILT** | `8078960` |
| 10 `prints-like-a-book` | STILL-PRESENT (0 print rules) | **BUILT** | `f576418` |
| 6 `every-room-its-postcard` | CONFLICTS with ratified PROTECT-70 | **REFUSED — banked for Sky** | this report §2 |

Also confirmed cured-not-mine last session and *not* re-touched: **item 9 `gecko-parity-scrollbar` was already
shipped** (`globals.css:489-490`, `scrollbar-width`/`scrollbar-color` present) — the 4th of the ledger's ten
premises to not survive checking, found before Wave 2 fired.

---

## 4. DECISIONS FOR SKY

1. **Merge Wave 2.** From `main`: `git merge --ff-only luxe/wave2` (3 commits on `f39b1ab`), then `git push`.
   Rollback: `git reset --hard f39b1ab && git push --force-with-lease`. Per-item revert is one `git revert`.
   *All three are additive/defensive — the defect fix changes a hover colour, items 7 & 10 add media blocks
   that are inert on the default screen render (axe 0/32 and overflow 0/68 unchanged across all three).*
2. **Item 6 — ✅ DECIDED 2026-08-09: HELD.** Sky ruled hold-the-line; PROTECT-70 stands, item 6 is closed,
   do not re-propose. (No work; the OG system stays a clean 3-grammar set.)
3. **The two Wave-1 mockup picks are still open** (they moved with the rebase, both still one clean merge):
   glass `luxe/w1-finish-the-glass` (yes/no), hamburger A/B/C (`captures/hamburger-candidates.png`).
4. **`--color-link-hover` is now guarded** — the two-tier link-draw response (block/keyboard get the line,
   pointer-on-word gets line + colour) is *now* a free design choice since the colour is AA-safe everywhere.
   Unifying it (give keyboard the full treatment) is a one-line change whenever you want it.

---

## 5. HONEST BOUNDARY

- **Forced-colors + print were verified by Chromium emulation, not a real Windows HCM box or a physical
  printer.** That is the standard verification path and it proves the mechanism (ember visible, chrome hidden,
  palette forced), but a device pass on real HCM and a real sheet of paper stays a banked check.
- **The rebase onto the archive-bearing main** (Wave 1's merge) is done and clean; Wave 2 sits on live `main`.
- **Morgan's three dirty files** (`.claude/launch.json`, `DECISIONS_LOG.md`, `PROJECT_STATE.md`) stayed frozen
  and are in no commit.

**Report ends. STOPPED ON BRANCH — nothing merged, nothing pushed.**
