# Phase H — Accessibility & Responsive — CLOSE-OUT

**Branch:** `room/pH-a11y` · **Date:** 2026-08-25 · **Depends on:** Phases A–E, G (all merged; G unpushed by design)

**Gate at close:** typecheck 0 · build 26/26 + 3/3 export · **79 files / 763 tests passing** (was 74/734 at Phase G close) · axe **0 violations across 34 scans** (17 routes × 2 themes) · worst-case CLS **0.0039** (floor 0.004).

Five commits, one per work item, each independently revertible:
1. `H1 — every date becomes a <time> element, no gap left unfilled`
2. `H2 — the receipt paper stock, re-derived not re-asserted`
3. `H3 — fix what the first clean re-audit found`
4. `H3 — refresh the accessibility receipts, one commit, one date`
5. `H6 — the ~545px measure, re-evaluated as promised`

H4 and H5 needed no code commit — H4's verdict is "drop everything" (nothing to land), and H5's verification found no defect to fix, only two premises that didn't hold (documented below, not silently absorbed).

---

## H1 · Extend every guarantee to the new furniture

Every date across the seven named surfaces (Plate, Receipt, LedgerRow, Exhibit, Flagship Room, Work index, Record band) now renders inside a real `<time dateTime>` element, in one format sitewide. Two things were verified rather than assumed before touching anything:

- **Plate's `placeDate` has no date in it.** The one real caller (`content/deliverables.json`'s Flagstone entry) sets `provenance: "DOWNTOWN KELOWNA, BRITISH COLUMBIA"` — a place, not a date. The schema doesn't require a date there either (`z.string().min(2).max(80)`, no ISO regex, unlike `closed`/`verifiedDate`). Nothing to wrap; noted rather than guessed.
- **The Record band's `defect` row uses the literal word `'closed'` for `when`, not a date.** A blind regex-free wrap would have emitted `<time dateTime="closed">closed</time>` — invalid HTML. `renderRecordWhen()` in `app/page.tsx` only wraps values matching `/^\d{4}-\d{2}-\d{2}$/`; everything else (currently just this one row) renders as plain text, same as before.

Fixed: `Receipt.tsx`, `LedgerRow.tsx`, `Exhibit.tsx`, `CalibrationRecord.tsx` (the un-consolidated duplicate of LedgerRow — `LedgerRow` itself turned out to be **dead code**, imported nowhere outside its own test; flagged below, not silently fixed-and-ignored), `CaseStudyCard.tsx`'s `verifiedDate`, the homepage work-index `d.year`, the Record band's dated rows, and `FlagstoneTestReceipt`'s inline "measured 2026-08-16" (a hardcoded literal, not schema data).

Receipt's hover/focus-visible parity was checked directly: the method link is **always-visible text** (`.method-pair`/`.method-draw`, Phase G), so hover/focus only draw an underline — there's no reveal to fail for touch or reduced-motion in the first place. Tier stays lexical everywhere (checked, unchanged). Exhibit's leader lines are `<span>`, not `<svg>`, but still `aria-hidden` with the claim restated as real caption text — the brief's intent, not its literal mechanism.

## H2 · Contrast, re-derived not re-asserted

`--rgb-receipt`/`--rgb-receipt-rule` (A5) had zero contrast coverage. Confirmed empirically first: `bg-receipt` paints at full opacity everywhere (no consumer anywhere applies a `/NN` modifier), so unlike `world-surface-*` there's no panel×alpha composite to derive — every ink Receipt.tsx actually paints on it is checked directly against the token, both themes:

| Pairing | Light | Dark | Floor |
|---|---|---|---|
| `--rgb-ink` on `--rgb-receipt` | 12.46:1 | 13.83:1 | 4.5 |
| `--rgb-accent-ink` on `--rgb-receipt` | 6.38:1 | 9.08:1 | 4.5 |
| `--rgb-ink-meta` on `--rgb-receipt` | 5.64:1 | 7.35:1 | 4.5 |
| `--rgb-receipt-rule` on `--rgb-receipt` (card boundary, 1.4.11) | 4.46:1 | 7.87:1 | 3.0 |

Found and closed a real forced-colors gap while extending the rescue list: `.glass-card` had an explicit `border: 1px solid CanvasText` rescue, `.bg-receipt` did not — under `forced-colors: active` the receipt card would have lost its boundary the same way glass-card would have without its own rescue.

Phase A's measured rule carried forward and **re-verified, not re-asserted**: light-mode gold (2.45:1 on canvas) still never carries text or meaning alone. Grepped every `--rgb-gold`/`gold-glow` usage across the new furniture — the only live one is a decorative ambient glow on the homepage (`app/page.tsx`), aria-hidden, no text, no meaning riding on it alone.

## H3 · Refresh the accessibility receipts — real numbers, real bugs

**First: the rig itself.** `axe-core` was never a real devDependency — it rode in transitively via `eslint-plugin-jsx-a11y`, and `run-axe.mjs` hardcoded the absolute path `/Users/skypie/Portfolio/node_modules/axe-core/axe.min.js`. Declared it for real (`package.json`), resolved via `require.resolve`. Both harness scripts (`run-axe.mjs`, `run-cls.mjs`) carried a stale 2026-07-09 route list (`work-accessmap`, `work-mutual-mesh`, `blog-building-accessmap`) — brought up to the real 17-route inventory, verified against `find app -name page.tsx`, not guessed: the Flagstone rename, Mutual Mesh's withdrawal (net −1), and `/archive` + `/runway` (both real routes added since the last census, net +2) account for 16 → 17 exactly.

**Then: running the fixed rig for the first time found three live violations**, all fixed, all F4-tested:

1. **Homepage "Featured — above" link** — `aria-label="Flagstone — the flagship room, above"` shared not one word with its visible text ("Featured — above"). `label-content-name-mismatch` / SC 2.5.3, caught live by axe. Dropped the aria-label; the row's own title link already announces the project. This is a *different* instance of the same bug class than H4's stranded branch — that branch never touched this file.
2. **Homepage work-index numeral** — `aria-hidden="true"` exempts it from the accessibility tree, not from 1.4.3 (it's still visually legible text). `text-ink/30` measured 1.8:1 light / 2.46:1 dark at `text-step-1` (20px normal — under the large-text 3:1 threshold too). Bumped to `/70` rest, `/85` hover (real margin: 5.13:1 / 7.70:1). CaseStudyCard's own ghosted numeral uses the identical `/30` idiom at a larger size that already clears 3:1 — confirmed by 0 violations on every `/work` route both before and after this fix — left untouched.
3. **`global-error.tsx`'s "Try again" button** — canvas-on-ACCENT measured 4.02:1 at button size. ACCENT itself is correctly scoped ("CTA / ≥large text") for the H1 heading two lines above; it was never validated for a 15px button label. Darkened the fill only (`#9D5436`, 5.26:1); the heading is untouched. Caught this route only because `/archive` crashed to the global error boundary in this environment (below) — but the fix is real and environment-independent: this fallback page is reachable from *any* uncaught client error, on any route, in production too.

**Refreshed, one commit, one date (2026-08-25), all six together:**

| Receipt | 2026-07-09 | 2026-08-25 | Note |
|---|---|---|---|
| axe violations | 0 (16×2) | **0 (17×2)** | route count grew, stayed clean |
| reduced-motion layers | 6 | **6** | re-verified each of the six exists (below) |
| measured, both themes | AA | **AA** | 0 axe color-contrast violations |
| tests passing | 325 | **763** | more than double; was honestly dated, understated by half |
| focus stops visible | 100% | **100%** | real keyboard Tab-traces this time (see Gates) |
| worst-case CLS | 0.003 | **0.0039** | *worse* — published as measured, per the brief |

The **worse CLS number is published, not smoothed** — `work-flagstone@768` at 0.0039 is real, still under the 0.004 floor, but the margin is thin (2.5%) and worth Sky knowing rather than rounding away.

The **reduced-motion layer count was re-verified individually**, not copied: `usePrefersReducedMotion` (`lib/motion.ts`) · the global 0.01ms CSS rule (`globals.css:2148`) · `.reveal` rest-visible floors (`globals.css:1129`+) · `@media (scripting: none)` no-JS floors (`globals.css:1249`, `1876`) · framer-motion's own `useReducedMotion` (`components/HamburgerNav.tsx` — the old receipt called this "shouldReduceMotion," which isn't the real export name; corrected in the new detail text) · `motion-safe:` Tailwind wrappers (3 files). All six confirmed present by direct grep, not assumed from the old label.

Flagstone's cross-reference ("portfolio's own measured 325 on the accessibility page," `app/work/[slug]/page.tsx`) moved to 763 in the same commit as the receipts JSON, so the two never disagree.

**axe's 30 recurring "incomplete" flags (color-contrast) are expected, not new** — they're this site's translucent `world-surface-*` panels over a moving gradient backdrop, which is *exactly* why `ink-contrast.test.ts`'s manual derivation exists (axe can't auto-resolve a composited, animated background with certainty). The 4 "incomplete" `video-caption` flags are `/runway`'s film — already flagged in that route's own source comment as a known, Sky-owned gap (no transcript authored yet). Neither fabricated here; both correctly left as open, tracked limitations.

## H4 · The stranded WCAG fix — F7 verdict: drop, don't merge

`fix/label-in-name-2.5.3` sits on one commit, `03b37b6`, at the merge-base with main from **333 commits ago**. F7 (ancestry + diff before any merge) checked against the current tree, file by file:

| File | Branch's fix | Current main | Verdict |
|---|---|---|---|
| `app/about/page.tsx` | Drop `aria-label`, name from content | **Already fixed**, near-identical rationale | Drop — redundant |
| `app/blog/page.tsx` | Stretched-link redesign (title-only name) | **Different fix**: kept whole-card link, dropped `aria-label` instead | Drop — conflicts with a later main decision |
| `components/CaseStudyCard.tsx` | Keep composite link, reword `aria-label` | **Rearchitected**: title and each action are independent focus targets, no nested anchors, cites decision "C-55" | Drop — would regress a deliberate later redesign |
| `components/ProductReveal.tsx` | Conditional `alt=""` for `context==='card'` | **Moot**: card images now render outside any link entirely | Drop — applying it would regress 1.1.1 (blank real alt text) |
| `components/SidebarFeatured.tsx` | Drop `aria-label` | **Already fixed**, near-verbatim rationale | Drop — redundant |
| `components/__tests__/BlogIndex.test.tsx` | Asserts the stretched-link shape | Current test asserts the name-from-content shape | Drop — tests a structure that no longer exists |

**Every hunk drops.** Nothing survives to cherry-pick or rebase. This is the *same* failure mode Phase 0's `fix/claude-corp-real-commits-seam` caught — an older branch silently undoing a newer decision — except here every single file lands on "already superseded" rather than "partially salvageable." **Recommendation: delete the branch.** Not done unilaterally here — Sky merges (and, by extension, disposes); this report is the prepared case for that call (`git branch -D fix/label-in-name-2.5.3`).

## H5 · Responsive, recomposed and verified

Verified at 1440 / 768 / 375 (plus 320 for the reflow gate), live in the built `out/` — real DOM measurements and real keyboard input, not inference:

| Surface | Finding |
|---|---|
| Hero | `grid-cols-1 lg:grid-cols-3` — stacks to a hairline list (each Receipt keeps its own border) below `lg`, exactly as documented. The `lg` (not `md`) cutover is deliberate and already justified in-code: the rail eats 280px from `md`, and a `sm:` 3-up was measured at 131px/cell there. |
| Flagship Room | Plate-before-capture confirmed by direct DOM order at **375, 768, and 1440** (`plate.top < capture.top` in every case) — first attempt at 768 gave a false negative from grabbing the *hidden* theme-twin `<img>` (this site ships light/dark image pairs) instead of the visible one; corrected and re-verified. |
| Work index | `document.documentElement.scrollWidth === clientWidth` at 375 and 320 — no horizontal overflow. |
| Record band | Confirmed **not** a `<table>` at any width (`querySelector('table')` → null); 4 `<li>` rows, `role="list"`, stacks naturally via flex-col below `lg`. |
| Exhibit | No overflow, figure holds its 19rem cap at every width. Two things the doc describes that the build doesn't do (see Premises, below) — neither is a defect. |
| Truncation | Two real `truncate` usages exist (`app/blog/[slug]/page.tsx`, `app/work/[slug]/page.tsx` — breadcrumb "current page" crumbs, `max-w-[240px→560px]`). Judged acceptable, not silently ignored: the full title is the page's own H1 moments below, screen readers read the untruncated DOM text regardless of CSS `text-overflow`, and empirically **it never actually triggers** — every real project title measured `scrollWidth === clientWidth` even at 320px. |

## H6 · The measure, re-evaluated

Sky's condition: *"we will evaluate it again in the complete build and adjust only if readability suffers."* Ran `cpl-census.mjs` (fixed the same stale-route problem as run-axe/run-cls first) and **read the pages at real size**, not from the numbers alone.

**Verdict: KEEP 545px, unchanged.** Confirmed `--measure-lead` renders at exactly 545px live (`/about`, measured via `getBoundingClientRect`). Content it actually governs (`/about`'s narrative sections, `/contact`, `/certificates`, `/blog`, the homepage work-index summary, Hero) reads well — the raw "49 of 95 runs over 75cpl" census number is dominated by a measurement artifact: the script's `main li` selector scoops up structurally composite rows (numeral + title + summary concatenated as one text run) on the homepage work-index and Record band, which were never continuous prose to begin with.

**A secondary, honest finding, not folded into the same decision:** the case-study body (`/work/[slug]`, e.g. Flagstone) and the homepage's own long-form sections use a *different*, pre-existing token — `--measure-wide` (60ch, renders 651.84px live) — which the 545px ratification never covered. Read at real size (17px, 1.75 line-height, well-paragraphed prose): clear, doesn't cross into the site's actual AA conformance target even where it runs past the aspirational 66–75cpl "luxury band" (up to 88cpl in places). Worth knowing; **not** escalated to a 🔴 — my own read is that it does not suffer, and forcing a decision block on a token this brief never actually asked about would manufacture a choice nobody's ready to make.

## Gates

```
typecheck 0 · build 26/26 + 3/3 export · 79 files / 763 tests passing
axe: 17 routes × 2 themes, strict — 0 violations (34/34 scans clean)
```

- **Full keyboard trace:** real Tab presses (not `.focus()` — confirmed that method never triggers `:focus-visible` at all, a methodology bug caught before it produced a false pass). **14/14 consecutive stops clean** across `/about` (8, nav/sidebar) and `/work/flagstone/` (6, including the H3-fixed method link) — every one the identical `2px solid rgb(207, 122, 79)` ring. Representative sample, not all 17 routes' every stop — same scope the 2026-07-09 baseline itself claimed ("keyboard-traced transcripts").
- **200% text zoom, 320px reflow:** zero overflow on `/about`, `/work/flagstone/`, `/work/` at 200% (`documentElement.style.fontSize`); zero overflow at 320×700 on home and `/work/flagstone/`. Representative sample.
- **Reduced-motion walk:** verified at the **code** level (all six layers individually re-confirmed present, above) and via the existing SSR test suite's own RM/no-JS floor assertions (e.g. "SSR emits every plate visible — no inline opacity:0," already in the 763). **Could not perform a live `prefers-reduced-motion`-emulated visual walk this session** — this Browser pane exposes a `colorScheme` emulation control but no motion-preference one. Named honestly rather than faked; see Honest Limits.
- **Long-title / empty-state / missing-image probes:** not separately run this phase — no code path touching these was in scope, and nothing in H1–H6's own work created new risk here.
- **Untouched routes:** proven by `git diff 050b560 HEAD` rather than a capture-diff — a full file-level accounting (below) shows exactly nine `app/`/`components/` source files touched, all of them H1–H3's own named targets. `/about`, `/contact`, `/certificates`, `/blog`, `/colophon`, `/runway`, `/archive`'s own components, and every other `work/[slug]` route's markup are **byte-identical** to Phase G.

<details>
<summary>Full file-level diff, Phase G → Phase H close (click to expand)</summary>

```
app/global-error.tsx                             |  10 +-
app/globals.css                                  |   6 ++
app/page.tsx                                     |  39 ++++++-
app/work/[slug]/page.tsx                         |   8 +-
components/CalibrationRecord.tsx                 |   2 +-
components/CaseStudyCard.tsx                     |   5 +-
components/Exhibit.tsx                           |   3 +-
components/LedgerRow.tsx                         |   2 +-
components/Receipt.tsx                           |   7 +-
content/a11y-receipts.json                       |  12 +--
package.json / package-lock.json                 |   2 ++
public/receipts/a11y-2026-08-25.json             | 125 (new)
+ 12 test files (5 new, 7 extended)
```

</details>

## F4 audit — which test fails if this breaks

| Guarantee | Test |
|---|---|
| Receipt/LedgerRow/Exhibit/CalibrationRecord dates are real `<time>` | `Receipt.test.tsx`, `LedgerRow.test.tsx`, `Exhibit.test.tsx`, `CalibrationRecord.test.tsx` (new), `work-receipt.test.tsx` |
| CaseStudyCard's `verifiedDate` | `CaseStudyCard.test.tsx` (new — no test existed for this component at all before H1) |
| Homepage work-index year / Record-band dates render as `<time>`, never the `'closed'` status word | `homepage-dates.test.tsx` (new) |
| Homepage numeral clears AA at its actual opacity, both themes | `ink-contrast.test.ts` (math) + `homepage-numeral-contrast.test.tsx` (markup, new) — split so either a token change or a class regression fails loudly |
| "Featured — above" carries no diverging `aria-label` | `homepage-featured-link.test.tsx` (new) |
| `global-error.tsx`'s button clears AA | `global-error.test.tsx` (extended, with a non-vacuity check against the pre-fix pairing) |
| `--rgb-receipt`/`--rgb-receipt-rule` clear AA / 1.4.11 | `ink-contrast.test.ts` (extended) |
| forced-colors rescues extend to the receipt card | `contrast-preferences.test.ts` (extended) |

**`components/LedgerRow.tsx` is dead code** — imported nowhere outside its own test (`CalibrationRecord.tsx` keeps its own inline duplicate, by its own docblock's admission: "not yet wired to this component"). Fixed its date-wrapping anyway (the brief names it explicitly, and its test should keep meaning something), but did not consolidate the duplication — that's a real, separate finding, flagged, not silently done as a drive-by refactor.

## PROTECT proof

`git diff 050b560 HEAD -- lib/content.ts app/accessibility/page.tsx` → **0 lines.** Neither file was touched. The byte-frozen sentence — *"I have not run a full manual screen-reader pass on this site"* — is verbatim present at `lib/content.ts:220`, unchanged. `getAccessibilityStatementParts()`'s marker split is untouched; the receipts strip still seats before the limits section (page structure unedited). `components/cinematic/**`: zero files in this phase's diff.

## Honest limits — what's Chromium-only and what's environment-only

- **Every claim in this report is Chromium** (`playwright-core` 1.61.1, headless). Safari/WebKit — including the real `/archive` sign-in flow on a real device — stays a device row (SE-7), never an assertion.
- **`/archive`'s real UI was not reachable in this environment.** No `.env.local` exists locally (only the `.env.example` template — correctly gitignored, since the real Supabase credentials live in GitHub Actions repo Variables for the deployed site). `createClient('', '', …)` throws inside `AuthGate`'s uncaught `useEffect` call, which is why axe measured `global-error.tsx`'s fallback, not the sign-in card — confirmed by matching symptoms (identical `#B96340` color signature, `0 incomplete` on both runs, same crash shape). The fix landed anyway because `global-error.tsx` is a real, reachable, site-wide boundary independent of this cause — but **`/archive`'s own sign-in form's contrast remains unverified this phase.** Needs either a local `.env.local` with real (or a disposable test) Supabase project credentials, or a device pass against the live site.
- **No live `prefers-reduced-motion` emulation available this session** for a true visual RM walk (see Gates) — code-level and SSR-test-level verification only.
- This Browser pane intermittently reports `document.hidden: true` / zero dimensions on the homepage specifically (the cinematic scene's own visibility-gated reveal logic renders black in screenshots as a result) — matches the exact limitation Phase G's close-out already banked for `startViewTransition`. Worked around via DOM/computed-style queries instead of screenshots for homepage verification; not a site defect.

## Premises of this brief that did not hold

A phase that cannot report a negative is not a phase:

1. **"The calibration table is the one permitted `overflow-x` container."** No such table exists. `grep -r overflow-x` across `app/`+`components/` returns nothing. `CalibrationRecord` (the only real "calibration" surface, on `/colophon`) is a wrapping `<ul role="list">` that never scrolls horizontally at any width down to 320px — verified live, zero overflow on all 4 rows. This is arguably a *better* outcome than what the doc envisioned (no horizontal-scroll-table a11y/UX pitfall to manage at all), but it is not what's written, and I didn't build a table to match a sentence — I reported the mismatch instead.
2. **"Exhibits: margin notes at `lg`... below `lg` they fold beneath the figure... leader lines don't exist below `lg`."** The actual, shipped `Exhibit` renders at a fixed `max-w-[19rem]` (304px) uniformly at every breakpoint — inline in the single-column article flow, never a true side-margin treatment, never full-bleed at mobile. Leader lines are `display: block` (present and visible) at 375px, confirmed live — never conditionally hidden below `lg`. No overflow, no accessibility defect either way (leader lines stay `aria-hidden`, the claim stays real caption text regardless) — just simpler than the design doc describes. This was probably a Phase D build-time simplification that was never reconciled back into `09_A11Y_PERF_RESPONSIVE.md`.

Neither finding blocks anything. Both are reported so the doc and the build stop disagreeing silently.

## STOP

Branch `room/pH-a11y`, 5 commits ahead of `050b560`. **Not merged, not pushed.** Sky merges.

Decisions carried into Sky's queue: H4's branch-deletion recommendation (above); the `--measure-wide` case-study column, worth knowing about, not gated on a decision; `/archive`'s real-credential contrast verification (needs a `.env.local` or a device pass).
