# Phase D — The Flagstone Flagship — CLOSE-OUT

**Branch:** `room/pD-flagstone` (5 commits: 4 work-item commits + 1 rider found in verification). **STOP — not merged, not pushed.**
**Date:** 2026-08-25, single continuous session.
**Gate at close:** `npm run typecheck && npm run build && npx vitest run` — **all green.** Typecheck 0 errors. Build compiled successfully, 26/26 static pages exported, same pre-existing `output: export` header warnings as Phases A/B/C. Tests **70 files, 685 passed / 1 skipped / 1 todo** — Phase C's exact baseline, unchanged. `npm run lint` clean.

**Prerequisite check, verified rather than trusted:** `git log` showed `main` at `9c166c7 Merge branch 'room/pC-record-h2'`, with the Phase A/B/C merges beneath it. `components/Exhibit.tsx` (built in Phase A, never wired into a page), `ProductReveal.tsx`'s `pr-lamp`/`pr-hero-lift` mechanism (R4/BP4), and the homepage's Flagship Room (`app/page.tsx`, C2) were all present and working. Gate held.

---

## What shipped, per item

| # | Outcome | Where |
|---|---|---|
| **D1 · the stone-laid settle** | ✅ Delivered. A new `liftClassName` prop on `ProductReveal`/`HeroProductReveal` (additive; every other case study passes nothing and is byte-identical) lets Flagstone's hero override the site-wide `.pr-hero-lift` (1200ms depth-parallax) with its own `.pr-stone-settle` — opacity .55 + scale 1.08 → rest, 180ms, `var(--ease-gh-settle)`. Same-specificity CSS rule placed later in the cascade wins the `animation` property only; nothing else `.pr-hero-lift` sets is touched. Confirmed: **the plate's text does not animate** (Pane D's storyboard explicitly requires this — "the plate is already legible, text never animates" — and the plate was never inside the settle wrapper to begin with, so this held by construction, not by a new guard). | `components/ProductReveal.tsx`, `app/globals.css`, `app/work/[slug]/page.tsx` |
| **D2 · the app reads as an app** | ✅ Delivered, narrower than the brief's literal wording — see 🟡 below. `heroShot.chrome = "device"` in `content/deliverables.json`. Confirmed live: `.pr-frame-phone` renders on both the case-study hero and the homepage Flagship Room (they share `heroMedia`). | `content/deliverables.json` |
| **D3 · Receipt above the sign-off** | ✅ Delivered. `CaseStudySignOff` extracted from inline markup — verified byte-identical to the original by `hexdump`, including the non-breaking space in "British{U+00A0}Columbia" (a real transcription mistake, caught and fixed before it shipped — see 🟡 below). Every deliverable but Flagstone keeps the sign-off right after the essay, unchanged. Flagstone's now renders after `FlagstoneTestReceipt`, in its own section. Confirmed in the built DOM: `receiptHeading.compareDocumentPosition(signoff)` reports `DOCUMENT_POSITION_FOLLOWING` — the receipt genuinely precedes the sign-off. | `app/work/[slug]/page.tsx` |
| **D4 · the What-went-wrong Exhibit** | ✅ Delivered. `Exhibit` (A15, never previously wired) now wraps the `report-composed` capture — the Submit affordance the defect made unreachable — with a FIG tag, one leader line near the Submit button (`top:92%,left:48%`), and a claim caption. Media is read from `d.shots.find(...)`, never re-declared, so it can't drift from what `content/deliverables.json` actually ships. `theme="both"`, not a hardcoded light/dark label — the capture has a dark twin that swaps client-side, and a fixed label would read false in whichever theme isn't currently showing (the exact mistake C_CLOSEOUT.md already caught once, for the homepage's own capture caption). Confirmed in the built DOM: `FIG · report-composed · both · captured 2026-07-31`. | `app/work/[slug]/page.tsx` |
| **D5 · the RLS diagram** | ✅ Delivered, with one real bug found and fixed in verification — see 🟡 below. One inline SVG in "The approach" — report → signed / anonymous write paths → Postgres RLS — token-coloured (`stroke-ink`, `stroke-accent-ink`, `fill-ink-meta`, no raw hex), `aria-hidden`, with a full-sentence visible `figcaption` as the real text alternative. Confirmed in the built DOM: all four label strings fit their nodes with real margin (widest label 198.7px inside a 260px box); at 1440 the rendered SVG is 420×157.5 (the 8:3 `viewBox` ratio, held); at 375 it scales to 311×116.6 with no horizontal overflow. | `app/work/[slug]/page.tsx` |
| **D6 · My role's sideheads** | ✅ Delivered, zero copy change. `**Mine.**` / `**The agents'.**` / `**What I check.**` — previously an inline `<strong>` opening each paragraph — now render as a standalone mono uppercase label above unchanged prose. `MarkdownProse.tsx` exports `parseInline` and `CASE_PROSE_P_CLASS` (both additive, no behavior change for existing callers) so the bespoke renderer reuses the exact shared inline parser and paragraph voice instead of duplicating either. Confirmed in the built DOM on 4 other deliverables' own "My role" sections (`claude-corp`, `dashboard` both carry the same `**Mine.**` convention): their `Mine.` still renders `<strong class="font-light text-ink">` — the original treatment, untouched; only Flagstone's renders the new `<p class="...font-mono...uppercase...">`. | `app/work/[slug]/page.tsx`, `components/MarkdownProse.tsx` |
| **D7 · dated captions** | ✅ Delivered, narrower than the brief's literal wording — see 🟡 below. `capturedDate` + `commit` (both optional, schema-validated `YYYY-MM-DD` / 7–8 hex chars) added to Flagstone's 3 in-body shots, values read from `content/showcase.manifest.json`'s `capturedAt`/`projectSha` for each scene (drawer-open `2026-08-18`/`8cdd6437`; report-composed and tasks `2026-07-31`/`5ab3f0c4`) and hand-staged rather than read at runtime — `lib/showcaseWire.ts`'s own docblock states `content/deliverables.json` stays the only source `lib/content.ts` builds from; the manifest and capture factory are PROTECTED, read-only. Their `figcaption`s now carry a second mono line, "captured YYYY-MM-DD · \<commit\>", gated on the field's presence — invisible everywhere the field is absent (every other deliverable). | `lib/schema.ts`, `content/deliverables.json`, `app/work/[slug]/page.tsx` |

**Commits, in order**

```
3c9e6bb  D1 — the flagship's own arrival, the stone-laid settle
7139087  D2 — Flagstone's showcase media reads as an app
bb27dfb  D3+D4+D5+D6 — the case study stages its own furniture
1ba4193  D7 — dated captions, surfacing what the manifest already recorded
4dbda94  D2 rider — chrome only does anything on the hero scene
```

**Diff:** 6 files, +343 / −13.

```
app/globals.css              |  22 ++++
app/work/[slug]/page.tsx     | 266 ++++++++++++++++++++++++++++++++++++++++++-
components/MarkdownProse.tsx |  32 +++++-
components/ProductReveal.tsx |  10 +-
content/deliverables.json    |  15 ++-
lib/schema.ts                |  11 ++
```

---

## 🟡 Not one commit per item — bundled, and why

The brief says "one commit per item." D3, D4, D5, and D6 all restructure the SAME region of `app/work/[slug]/page.tsx` — the case-study body — and share one substrate: `splitBodyIntoSections` (a pure read-time slicer; the stored body string is never mutated) and `renderFlagstoneBody` (the function that stitches the split sections back together with the new furniture interleaved). `renderFlagstoneBody` calls into `renderRoleSection` (D6), `FlagstoneApproachDiagram` (D5), and `FlagstoneDefectExhibit` (D4) directly — none of the three can be committed alone without referencing not-yet-written code, and `renderFlagstoneBody` itself can't be committed without all three existing. Rather than force an artificial split that would leave an intermediate commit in a broken state (or require a much larger mechanical exercise splitting one contiguous code insertion into three by hand), I bundled the four into one commit, itemized line-by-line in its message. D1, D2, D7, and the D2 rider are each their own clean, independently-working commit.

---

## PROTECT-list proof (mechanical, `git diff main..HEAD`)

```
components/cinematic/                    → 0 diff lines
app/archive/ components/archive/ lib/archive/  → 0 diff lines
app/accessibility/page.tsx               → 0 diff lines
app/about/page.tsx                       → 0 diff lines
app/colophon/page.tsx                    → 0 diff lines
content/rounds.json                      → 0 diff lines   ← the open-Round-IV 🔴 is UNTOUCHED
content/a11y-receipts.json               → 0 diff lines
content/certificates.json                → 0 diff lines
content/profile.json                     → 0 diff lines
content/showcase.manifest.json           → 0 diff lines
scripts/                                 → 0 diff lines
components/Exhibit.tsx                   → 0 diff lines   (used as-built, not modified)
components/__tests__/Exhibit.test.tsx    → 0 diff lines
```

**Byte-frozen case-study text — proven, not asserted** (Python, comparing the parsed JSON value at `main` vs `HEAD`):

```
body identical:      True
status identical:    True   (still "Pre-launch — App Store submission in progress")
heroPlate identical: True   (all three museum-plate lines)
```

The only fields that differ on Flagstone's `deliverables.json` entry between `main` and `HEAD` are `heroShot` and `shots` — exactly D2/D7's intended additive fields, nothing else.

**`FlagstoneTestReceipt`'s own function body** — diffed directly (not just its call site): **empty diff.** Its words ("2,971 tests passing", the measured date, the reproduce command) are untouched; only where it's called from moved, per D3's "relocating a component, not rewording a claim."

**Untouched routes — verified at the code level, not asserted:** the other 4 case-study pages (`claude-corp`, `dashboard`, `prompt-library`, `ghost-code`) were checked against the built `out/` for every new marker this phase introduces (`pr-stone-settle`, `FIG ·`, the SVG's `Signed write path` / `Anonymous write path` labels, the `role-sideheads` treatment) — **zero hits on all four, all four markers.** A naive first pass also flagged `Mine.` and `Row Level Security` as appearing on other pages' built HTML; both are false positives worth recording so a future phase doesn't re-alarm on them: `claude-corp` and `dashboard` carry their own, unrelated `**Mine.**` lead in their own "My role" sections (a site-wide convention, not something this phase introduced), and confirmed still rendering as the original `<strong class="font-light text-ink">` — untouched. "Row Level Security" appears in the Next.js RSC hydration payload (a `<script>` tag, not visible text) on every work-detail page, because `getDeliverables()`'s full result — all six bodies — was already being threaded through for the "Other work" cross-links before this phase; re-checking with scripts/styles stripped (the same visible-text methodology C_CLOSEOUT.md used) returns zero hits on all four other pages for every new marker. Not a new leak; pre-existing serialization behavior this phase didn't create and doesn't change.

---

## Guard migrations

**None were needed** — a premise of the brief that did not hold. `app/__tests__/work-receipt.test.tsx` renders `<FlagstoneTestReceipt />` in isolation via React Testing Library; it never asserted the component's position in the page, only its own contents (visible count, date, reproduce command, method anchor, the retired-scaffold check, the receipt-vs-badge tone check) — none of which changed. `components/__tests__/MarkdownProse.test.tsx` calls `renderMarkdownProse` directly with 2-argument calls; the new 3rd parameter (`dropCapEligible`) defaults to `true`, so every existing call in that test file is byte-identical in behavior. Both suites passed on the first run, unmodified. `components/__tests__/Exhibit.test.tsx` needed no change either — this phase is Exhibit's first real caller, not a change to the component.

---

## The BP4 decision — built both halves, captured both, decided nothing

Per the brief's explicit instruction, I did not re-pick a side from the prose in `06_FLAGSTONE_FLAGSHIP.md` or the deferred R4 pitch. I built a temporary, throwaway "re-ruled" variant, captured it beside the as-built one, and reverted the experiment completely — `git diff main..HEAD` on `app/globals.css` and `app/work/[slug]/page.tsx`'s hero-well class shows zero trace of it. The six-hue intensity sheet Sky already has (`design-reviews/r4-gallery/build-plan/receipts/bp4/*.png`, 7 files) is reused as background reference for *hue intensity* per the brief's instruction not to rebuild it — it does not answer the confined-vs-spill question, which is a placement axis, not a hue axis, and predates this site's current (post-Phase-A/B/C) layout regardless.

**What "as-built" and "re-ruled" actually differ by, mechanically:** the lamp (`app/globals.css`, `html.dark .pr-lamp`) is a two-radial-gradient glow, `mix-blend-mode: screen`, `display:none` in light theme (a lamp at noon is nothing — unaffected either way). As-built, it sits `inset:0` inside the hero well's `overflow-hidden` box — the glow **cannot** mathematically extend past the well's rectangle. For the experiment, I set the well to `overflow-visible` and the lamp to `inset:-40%` with a smaller, hotter gradient — the glow **can and does** extend up to 40% past the well's box in every direction, bleeding toward the plate and the page's own background.

**Real side-by-side captures — both themes, 1440 and 375, on this phase's own built markup** (screenshots taken this session; described here since this file is text-only):

| | AS-BUILT (confined) | RE-RULED (page-coordinate) |
|---|---|---|
| Light, 1440 / 375 | `.pr-lamp{display:none}` — no lamp either way; both variants are pixel-identical in light theme (confirmed structurally: the light-mode rule is untouched by the experiment). | — |
| Dark, 1440 | Warm glow reads as a lit *object* — its edge visibly stops at the well's border; the sidebar and page margin outside the well stay neutral dark. | The same warm light now bleeds past the well's bottom edge into the area around the museum plate, and faintly into the page margin toward the sidebar — reads as *room* light, not *object* light. |
| Dark, 375 | Glow confined tightly around the phone; margins either side of the well stay neutral. | Glow visibly softens the boundary between the well and the page background; less "boxed," warmer overall page mood. |

**My recommendation, formed only after having both in front of me: AS-BUILT (confined).** The difference is real but *subtle* at both widths — the existing S15 plinth glow (the always-on `--pr-sig` radial behind the frame, unrelated to `.pr-lamp`) already supplies most of the ambient warmth a viewer notices; the lamp's own marginal contribution, once let loose from the well, reads as a slightly softer edge rather than a transformed room. Against that small a gain, `overflow-visible` on the hero well is not free: that well is the SAME element the settle (D1) and the sticky positioning (`lg:sticky`) both depend on, and `overflow-hidden` is what currently guarantees the golden-hour world layers (`.pr-world`, `.pr-horizon`) never bleed past their intended box on any of the other five deliverables sharing this exact component. Confining the lamp is the lower-risk choice for a mechanism that touches shared, load-bearing layout — and "the room is calm on purpose" (Pane D's own words) reads more true to a contained glow than a spilling one.

**Alternative:** re-rule it. If Sky's own eye, live on a real device, reads the as-built version as too contained — "boxed in" rather than "the artifact becomes the room's light source" (the lamp's own docblock language) — the re-ruled version is a real, working two-file change (documented above) she can ask for by name.

**Impact of either choice:** `app/globals.css` (`.pr-lamp`'s dark rule only) + one Tailwind class on the hero well in `app/work/[slug]/page.tsx`. No guard moves either way — `lib/__tests__/exhibitLamp.test.ts` (4 tests, unrelated to placement) is green under both, confirmed for as-built; not re-run under the reverted experiment since nothing shipped.

> 🔴 **DECISION NEEDED**
> **What:** whether the exhibit lamp (dark theme, case-study hero) stays confined to the media well (as-built, currently shipping) or is re-ruled to spill into page coordinates (a real, captured, but unshipped alternative).
> **Recommendation:** **AS-BUILT (confined)** — the visible gain is marginal and the well's `overflow-hidden` is shared, load-bearing layout on all six deliverables.
> **Why:** see the captures table and reasoning above — the difference is real but subtle, and confinement is the lower-risk choice for a mechanism touching shared layout.
> **Alternative:** RE-RULED — a genuine two-file change if a real device screen reads the confined version as too boxed-in.
> **Your choice:** `[AS-BUILT (recommended)]` · `[RE-RULED]` · `[DEFER]`

---

## The Flagship Standard — run against `/work/flagstone/`, point by point

1. **First impression** — 🟡 partial. The hero delivers artifact (device-framed capture) + one human claim (the plate) within the first viewport at every width tested. It does **not** also carry a dated number in that same viewport — by design: 🔴1 from `C_CLOSEOUT.md` already put the "2,900+" receipt hero-strip-only on the **homepage**, and D3 explicitly asks this phase to keep the exact-count receipt near the sign-off, not the top. Read as one flagship experience (homepage hero-strip → Flagship Room → case study), all three elements exist within the first two screens of the *site*; read as this one page in isolation, the dated number is a scroll away. Flagging honestly rather than asserting a clean pass on a technicality.
2. **Hierarchy** — ✅. Exactly one loud beat (the settle); every new element (diagram, exhibit, sideheads, dated captions) is static furniture, not a second animation. Serif→sans→mono unbroken: h2/h3 unchanged, new prose (figcaption, claim) is sans, new labels (sideheads, FIG tag, captured-date line) are mono — consistent with existing usage throughout the page, no new register invented.
3. **Image/art presentation** — ✅. Device-true (D2), both themes (confirmed via `ThemedShowcase`'s existing swap mechanism, unmodified), every image carries a caption making one claim (existing shot captions; the Exhibit's claim; the diagram's figcaption stands in for an image caption on a non-photographic diagram). Zero decorative screenshots — the diagram is not a screenshot at all.
4. **Typography** — ✅ by non-interference. No measure, numeral, or heading rule was touched; new text inherits the existing `case` prose voice (`CASE_PROSE_P_CLASS`) or the existing mono-meta voice, verbatim.
5. **Storytelling** — ✅. Body prose byte-frozen (proven above); `What went wrong` now has its evidence; status honest to the day, unchanged.
6. **Transitions/motion** — ✅. One new beat, RM-gated behind `prefers-reduced-motion: no-preference`, same idiom as the pre-existing `.pr-hero-lift` it partially supersedes on this one page.
7. **Interaction** — ✅ by non-interference. The receipt's own hover/focus/touch method-link behavior is untouched (D3 only repositioned the component).
8. **Responsive** — ✅. Recomposed, not shrunk, at 375: no horizontal overflow anywhere in `<article>`, the diagram scales to 311×116.6 preserving its 8:3 ratio, the Exhibit and its leader line stay within their figure's bounds. Verified via `getBoundingClientRect`/`scrollWidth` in the live built page, not asserted.
9. **Accessibility** — 🟡 partial, two findings, both scoped honestly rather than papered over:
   - **Dates are not wrapped in `<time>`** anywhere in this phase's new markup (the captured-date captions, the Exhibit's FIG tag). This is not a Phase D regression — **`<time>` is used nowhere on this site today**, including in furniture Phase A–C already shipped (the receipt's own "measured 2026-08-16" is plain text). A real, sitewide gap, and Phase H ("a11y_responsive") is its natural home, not a one-off fix buried in this phase.
   - Contrast on the new elements (sidehead labels, diagram strokes/fill, the terracotta leader line) was verified by **token reuse**, not a fresh derived-composite measurement: every color is an existing, already-in-production token (`text-accent-ink`, `stroke-ink`, `fill-ink-meta`, `bg-terracotta` — the same class `Exhibit.tsx` already ships with its own guard test), never a new value. This is a lighter bar than C_CLOSEOUT.md's full composited sweep; a follow-up device pass could re-derive the exact ratios if Sky wants that level of proof for the new elements specifically.
   Keyboard-complete: ✅ (2 real, named links inside `<article>`, matching what's actually there — the two inline markdown links; the diagram is `aria-hidden` and never in the tab order; the Exhibit's image is not itself interactive). One h1: ✅, untouched. House alt rules: ✅, the Exhibit reuses the shot's existing, already-schema-valid alt text verbatim.
10. **Authorship** — ✅. Sign-off present (relocated, word-identical). Every sentence a stranger could ask Sky to defend either predates this phase untouched (the essay) or is mechanically true and disclosed as such (the diagram's caption, the Exhibit's claim, D7's dates/commits — all derived from real, cited sources, never invented).

**Score: 7 clean, 2 partial (both disclosed with a specific, actionable reason and an owner for the remainder), 1 not independently re-verified this phase (interaction, by non-interference).** Nothing here was rounded up.

---

## Device rows (built `out/` served by the dev server — SE-7, Chromium only)

| check | 1440 | 375 |
|---|---|---|
| horizontal overflow (`scrollWidth` vs `clientWidth`) | none | none |
| SVG diagram size | 420 × 157.5 (8:3 held, `max-w-[420px]`) | 311 × 116.6 (ratio held) |
| SVG label overflow | none — widest label (198.7px) inside its 260px node | — |
| Exhibit figure width | — | 304px, leader line within bounds |
| device frame present (`.pr-frame-phone`) | ✅ hero (case study) · ✅ hero (homepage Flagship Room) | ✅ |
| homepage Flagship Room height | **836.64px** | — |
| homepage document height | **10,875px** | — |
| homepage `<main>` height | **9,949.26px** | — |

**The homepage geometry is unchanged from `C_CLOSEOUT.md`'s own figures (837px / 10,875px / 9,949px) to within half a pixel of rounding.** This resolves a concern I initially flagged for myself during implementation: because `heroShot` feeds both the case-study hero and the homepage Flagship Room, I expected D2's chrome flip to shift the Room's measured height. It doesn't — `FRAME_PLACEMENT_REAL.phone` positions the device frame *inside* the well's existing fixed-aspect box (`h-[90%]` of a box whose own size comes from the wrapper's aspect-ratio classes, not from the frame's presence), so the visual presentation changed (float → device-framed) with zero effect on the box the rest of the page's layout is built around.

**Console:** zero errors on the built page, confirmed on a genuinely fresh tab. (Worth recording for whoever runs Phase E next: this session's dev-server tab accumulated a *stale* "Unterminated regexp literal" error in its console-message buffer from an early moment when `.next` needed clearing after a burst of edits; that exact error kept being reported by `read_console_messages` on the same tab for the rest of the session even after the server was serving 200s and compiling cleanly, and even after the flagged code was reverted to something that never had the issue. Server logs — not the tab's cumulative console buffer — were the reliable signal; a fresh tab confirmed zero errors conclusively. No code defect; a tooling-environment lesson worth one sentence so it doesn't cost the next session the same detour.)

**Reduced motion:** verified by construction, not by live emulation (the Browser pane used this session doesn't expose an RM toggle) — `.pr-stone-settle`'s animation rule sits inside the identical `@media (prefers-reduced-motion: no-preference)` gate every other motion primitive on this page already uses (`.pr-hero-lift`, `.hero-settle-img`, `.hero-settle-title`), so an RM visitor's stylesheet match is unchanged in kind from what already ships: no animation rule applies, the element rests at its authored base state (opacity 1, no transform) from first paint. Pre-settled, meaning identical, nothing lost.

---

## 🟡 Premises of the brief that did not hold

Four, all recorded where they bit:

1. **"Flip the chrome to phone for Flagstone's scenes" (D2) only does anything for one scene.** `ProductReveal` derives a real `DeviceFrameKind` exclusively for `context==='hero'` (`kind = frame ?? (context==='hero' ? frameForSlug(slug) : 'none')`); card and shot contexts render `kind:'none'` regardless of the `chrome` field, so setting it on the 3 in-body shots and `cardImage` was inert — confirmed live (`.pr-frame-phone` count was 1, not the 4 I expected, until I removed the dead fields). Corrected in the D2 rider commit. Only `heroShot.chrome` does anything, and it does — on both places that consume it.
2. **Guard migration was expected; none was needed.** See "Guard migrations" above — neither named guard encodes a position assumption.
3. **The SVG needed explicit `width`/`height` attributes it wasn't specified with.** `viewBox` alone, with only `w-full h-auto` in CSS, measured `0×0` via `getBoundingClientRect` on first paint in this environment. Explicit `width="560" height="210"` (matching the `viewBox`) fixed it; confirmed correct at both 1440 and 375 afterward.
4. **A byte transcription mistake, caught before it shipped.** Extracting `CaseStudySignOff` from the inline JSX, I first typed a plain space where the source has a non-breaking space (`British{' '}Columbia`) — a deliberate typographic choice keeping the two words from wrapping apart. Caught by `hexdump`, not by eye (the two render identically at a glance); fixed before the function was ever committed. Recorded because "you are relocating a component, not rewording a claim" is exactly the kind of instruction a silent regular-space substitution would have quietly violated.

---

## STOP

Branch `room/pD-flagstone`, 5 commits, **not merged, not pushed.** Sky reviews the diff, answers the BP4 🔴 (or defers it — it blocks nothing, same as Phase C's own open 🔴s), then merges.

The two 🟡 Flagship Standard partials (point 1's dated-number-not-in-first-viewport, point 9's sitewide `<time>` gap) are disclosed above with a specific owner each (the homepage already carries the dated number; Phase H is `<time>`'s natural home) — neither blocks this phase's merge; both are worth a sentence in whatever briefs Phase H when it fires.
