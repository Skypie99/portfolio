# Phase G — Motion — CLOSE-OUT

**Branch:** `room/pG-motion` (3 commits, one per addition). **STOP — not merged, not pushed.**
**Date:** 2026-08-25 (single session). **Base:** `main` @ `79ba45c` (Phases A–E merged *and* pushed; `origin/main` was in sync at start — the memory line saying Phase C was unpushed had rotted).

**Gate at close — all green.**

| | baseline (`main`) | at close |
|---|---|---|
| `npm run typecheck` | 0 errors | **0 errors** |
| `npm run build` | 26/26 pages, 3/3 exports | **26/26, 3/3** |
| `npx vitest run` | 70 files · 685 passed / 1 skipped / 1 todo | **74 files · 734 passed / 1 skipped / 1 todo** |

+49 tests across +4 files. Build warnings unchanged at 6 — all the same pre-existing `output: export` / `headers` notice (UI_SYSTEM.md UP-01), zero new.

---

## The three additions, and nothing else

| # | Commit | What shipped |
|---|---|---|
| **G1** | `4568b04` | **The dusk-turn.** The theme flip dissolves through the world's own dusk. |
| **G2** | `ea4cb0e` | **The method underline.** Every measured number draws to its proof on hover and focus. |
| **G3** | `bc1874e` | **The settle audit.** The duration ramp is the whole truth again — and is now guarded. |

No fourth addition. Each commit carries its own reduced-motion behaviour, as required.

---

## G1 · The dusk-turn — Sky's defect requirement, answered

**Sky's ruling was that the dark version "is currently so subtle that it is effectively invisible… more like small gray rectangles/pixels than an intentional gradient."** That was not a tuning miss, it was structural: the flip rode the generic route dissolve, which cross-fades two frames whose **layout is identical and whose only difference is colour**, plus a 0.10-alpha gold field. A cross-fade between two near-identical frames has nothing to show.

**The fix is a value journey, not a louder fade.** The two rooms are *sequenced* rather than blended — the room you leave is gone by 42% (~176ms), the room you enter begins at 58% (~244ms) — and in between the page passes through an actual sky, painted **statically** on `::view-transition` (the overlay root, under the snapshot pair). Opacity is the only animated property in the whole move.

**The colour is the site's own.** The dark leg is `--sky-dusk-1/2/3 → --sky-day-4 → --sky-dusk-4` — literally the ramp `WorldBackdrop` already crossfades through at `--day-night 0.5`. Pseudo-element styles resolve *after* the callback toggles `.dark`, so each leg picks up the destination room's palette automatically: **you dissolve through the dusk of the room you are entering.**

### Measured, not asserted

| | value |
|---|---|
| dark ramp | indigo-plum L=0.029 → wine L=0.057 → **ember L=0.095** → deep earth L=0.027 → night L=0.008 |
| ember vs night | **12.5×** the luminance, with a full indigo→orange hue travel |
| dawn ramp | L=0.857 → 0.452 |
| sky ≥50% of composite | **244ms** of the 420 (58%) |
| sky ≥90% | 174ms |
| sky fully opaque | 81ms |
| luminance overshoot | **none** — the dawn sky's brightest stop (L=0.857) stays under the light room's own canvas (L=0.938). One monotonic change in each direction, not a flash |

### Honest judgement on the dark leg — **it reads as intentional**

It is not gray, and there is no gray in it: the ramp travels indigo → wine → ember → night, with strong hue movement as well as value. At the middle of the turn the page is unambiguously *a dusk sky*, and the long eased shoulders read as the room dissolving into it rather than as a cut. Frames captured at 0 / 118 / 176 / 210 / 315 / 420ms, **both directions, both starting themes**.

**The reservation I will not hide:** 81ms of *total* content absence is at the loud end of "restrained." It reads as the page passing behind the sky rather than as a blink — because the shoulders are long — but it is a big move, and repeated toggling is where it would wear. The dial-back lever is precise and one line (see the 🔴 below).

### ⚠ Environment limit — stated plainly

**The live view transition could not be exercised on this machine.** `startViewTransition` is **skipped outright when the document is hidden**, and a headless Browser pane is permanently hidden (`document.visibilityState === 'hidden'`, `innerHeight === 0`, `window.scrollTo` inert). Confirmed empirically: the flip completed instantly with zero VT animations registered.

So the frames come from `G1_turn-harness.html` (banked), which composites **the same layers the VT composites**: the real `::view-transition` gradient read out of the built stylesheet via CSSOM (never retyped, and evaluated inside a frame pinned to the destination theme so its `var()`s resolve in the right scope), with the real page in each theme above it at exactly the opacity `theme-turn-out` / `theme-turn-in` give at time *p*, on the real `--ease-gh-glide` curve. The arithmetic is the browser's; only the clock is held. **What this cannot answer is how it FEELS at speed** — that is a device row for Sky.

---

## G2 · The method underline

One mechanism, three call sites — every measured number on the site, in all three shapes they come in:

| shape | where | the pair |
|---|---|---|
| **A · card** | homepage `Receipt` ×3 | figure and method in one card |
| **B · one-line** | `/work/flagstone/` | figure and method in one `<p>` |
| **C · many-to-one** | `/accessibility/` | six figures, one shared method line beneath |

`.method-pair` triggers, `.method-draw` rides beside `link-draw` — deliberately the `.link-draw-group` idiom already in the sheet, not a new pattern. 180ms (`--dur-fast`) per the design system's motion clause: faster than `link-draw`'s stock 280ms because the hover was not aimed at the link and the answer must already be there when the eye arrives.

**Verified with a real pointer**, on the real built markup and stylesheet (the surfaces sit thousands of px down their pages; `G2_method-harness.mjs` lifts the three shapes to the top of one page):

- **A** — hovering the *figure* "2,900+" draws the underline under `METHOD`; the other two receipts stay at `0px`. Correctly scoped per card.
- **B** — hovering "2,971 tests passing" draws its own method link.
- **C** — hovering the "0 axe violations" cell, deep inside the grid, draws `EVIDENCE JSON` in the line below (97.6% mid-draw).
- Pointer away retracts to `0px`; `:hover` clears cleanly.
- Keyboard: `:focus-within` resolves to `100% 1px` on the built page.

**Touch and RM lose nothing** — at all three sites the method link is ordinary, always-visible, always-in-the-a11y-tree text in accent ink. The line is an enhancement on a door that is already open.

**A claim I had to correct mid-build.** My first comment said the loud tier (line + colour deepen) stays reserved for the pointer directly on the word. Measured on the built page, that is **false on these anchors**: each pins `hover:text-accent-text`, which overrides `link-draw:hover`'s `--color-link-hover` deepen — `rgb(135 71 45)` in *both* states. Pre-existing and deliberate. The rationale in `globals.css` now says what is actually true.

**The `/accessibility/` wrapper is layout-neutral, proven not asserted** — A/B'd on the live rendered page by unwrapping it and re-measuring: grid top `13645.18`, method-line top `15092.48`, identical to the pixel with and without it; computed `display: block`, margin/padding/border `0`, `position: static`.

---

## G3 · The settle audit — **a premise of the brief did not hold**

> The brief opens: *"Phase A tokenised the off-ramp durations… Confirm the Flagstone 'stone laid' settle uses the ramp."*

**Phase A did not.** `A_CLOSEOUT.md` says so in its own words: *"Duration tokenization ('NEW 560 settle') on Sheet 4 is Phase G (motion)'s scope per the roadmap file split, not Phase A's actual A1–A18 table."* Every straggler the brief lists was still a literal. So G3 did the work instead of confirming it, and the answer to the question actually asked is: **no, the flagship settle was not on the ramp — it is now.**

**Why it drifted:** `token-parity.test.ts` guards `--fs-*`, `--ease-*` and `--shadow-*` and has **never covered durations**. Nothing failed; the ramp just quietly stopped being the whole truth.

### Tokenised

| what | was | now | rendered change |
|---|---|---|---|
| **NEW** `--dur-settle` | — | `560ms` | the seventh rung the approved system sheet names |
| `.settle-heading` | `560ms` | `var(--dur-settle)` | none |
| `.pr-stone-settle` (Flagstone) | `180ms` | `var(--dur-fast)` | none |
| `.pr-hero-lift` delay | `120ms` | `var(--stagger-scene)` | none |
| `:target` gutter-bar arrival | `300ms` | `var(--dur-base)` | **300 → 280ms** |

**That last line is the only rendered value the phase changes**, and it is verified as such: resolving every `var()` in the built CSS bundle before and after gives 300ms `2→1`, 280ms `5→6`, and **every other duration count identical**. (180ms `+2` and 420ms `+2` in the same comparison are G2's and G1's new rules, not retimings. 600ms and 700ms are unchanged — the protected cue, untouched.)

**The Flagstone coupling is stated, not hidden.** The codex's 180ms and the ramp's micro rung are the same number, so reading from the rung is what makes "the flagship's one loud beat is on the site's own ramp" *checkable*. But retune `--dur-fast` and the settle moves with it and the citation stops being true — so the rung is pinned in the guard, whose failure message names that rule.

**`settle-title`'s 560-vs-520 split is resolved by naming both sides**, not flattening them: `.settle-heading` is a route h1 arriving alone and takes the longer `--dur-settle` tail; `.hero-settle-title` is one beat of a composed hero and takes `--dur-slow` plus its own offset. One gesture, two contexts, two *rungs* — no longer one rung and one literal.

### The new guard, mutation-tested

`lib/__tests__/duration-ramp.test.ts` — every authored duration in `globals.css` must be a ramp token or one of four enumerated **survivors** carrying its reason, and the survivor list is itself guarded against rot (a survivor that no longer exists fails, so the allowance cannot silently widen). Proven able to fail: reintroducing a literal trips 5 assertions; retuning `--dur-fast` trips the rung test by name.

### Zero-call-site Tailwind keys — removed, with the note

`duration-transition` and `duration-scene` were registered in the 2026-06-03 pass and **never acquired a single call site**: both tiers are consumed only as `var(--dur-…)` inside hand-authored CSS, which never routes through Tailwind. Removed. `--dur-settle` is deliberately not mirrored for the same reason. `globals.css` keeps all seven rungs; the mirror simply stops carrying keys nothing can reach through it.

> **Reported, not acted on:** `duration-reveal` is in the **identical** condition — zero call sites, `--dur-reveal` is CSS-only today. The brief named `transition` and `scene` specifically, so I left `reveal` standing rather than extending the ruling on my own authority. Recommendation: remove it too, for consistency, whenever Sky says.

### Left alone, on purpose

- **`app/archive/**`** carries ~8 off-ramp durations and is **not** swept — it is the Studio Archive art surface, excluded from the design-system census since Phase A, with Phase F held and "no motion on artwork" standing.
- **`.hero-settle-title`'s 150ms delay** — not rhythm but one composition's offset; not in the system sheet's stray list.
- **`intro-cue-rise` 600ms + 700ms delay** — see the 🔴 below.

---

## Verification

### The RM walk — **26 of 26 routes clean**

The Browser pane cannot emulate `prefers-reduced-motion`, so RM was simulated faithfully from the real build: every route copied with a script injected as the first thing in `<head>` that (1) wraps `matchMedia` so `(prefers-reduced-motion: reduce)` reports true and `no-preference` false — the JS half — and (2) on load deletes every `no-preference` block and hoists every `reduce` block to top level — the CSS half. **Recursively**, because three `no-preference` blocks are nested inside `@supports (animation-timeline: view())` and a top-level walk misses them.

Every route was then swept for text-bearing elements that are effectively invisible (opacity, visibility), displaced mid-animation, or still animating.

**Result: 0 faded · 0 hidden · 0 displaced · 0 animations over 1ms, on all 26 routes.**

Two findings surfaced and both resolved as harness artifacts, verified rather than waved off:
- Three routes reported `reduce: false` — `blog/building-accessmap`, `work/accessmap`, `work/mutual-mesh` are **meta-refresh redirect stubs** (the Flagstone rename and the Mesh withdrawal); the iframe followed the redirect to the real, un-injected route. Confirmed by reading their `<meta http-equiv="refresh">`. All three destinations were audited directly and are clean.
- The homepage reported the cinematic wordmark at opacity 0 — my driver's 900ms window was racing the film's static-frame resolution. Loaded directly and given time: `.cdesert-title` computes **opacity 1**, `.cdesert-static-stage` applied, GSAP never loads, stable at 5s. Screenshot confirms the full static frame — cliff, wordmark, identity mark, scroll cue, skip control, all readable.

**The three additions, specifically, under RM:**

| | behaviour |
|---|---|
| **G1** | `viewTransitionsStarted: 0`, `data-theme-turn` never written → **the sky is never painted**. The flip still happens: stored theme `light → dark`, class applied, label updates. Instant cut. |
| **G2** | method link visible, `rgb(231 181 147)`, `transitionDuration: 1e-05s` (the global floor) — the underline appears instantly instead of drawing. Door already open. |
| **G3** | `.pr-stone-settle` → `animationName: none`, `opacity: 1`, `transform: none`. **Pre-settled.** |

### Focus-visible parity — kept exact

| | hover selectors | focus selectors | unpaired |
|---|---|---|---|
| `main` | 9 | 9 | 1 |
| `HEAD` | 10 | 10 | 1 |

**New unpaired introduced by Phase G: NONE.** `.method-pair:hover` has its `.method-pair:focus-within` twin. No new `hover:` Tailwind utility was added anywhere (the 3 `hover:text-accent-text` in the diff are pre-existing lines rewritten to add a class — same count on the removed side).

### Console — clean

22 routes walked with `console.error`/`warn`, `error` and `unhandledrejection` captured. **Routes with any console output: 0.**

### Untouched routes — diffed against pre-phase captures

**23 of 26 routes byte-identical** in structural markup (scripts, comments and asset hashes normalised out). The 3 that changed — `/`, `/accessibility/`, `/work/flagstone/` — contain **nothing but the G2 class hooks**. G1 and G3 change zero markup.

### PROTECT proof

- `components/cinematic/**` — **zero files touched.**
- **Zero** `.cdesert-*` / `.cinematic-*` / `intro-cue` / `runway` CSS lines added or removed.
- Count-up untouched — `CountUpStat` is not in the diff.
- No new night moves beyond the dusk-turn.
- No scroll-jacking; the dusk-turn is explicit-toggle-only, never on scroll, never ambient.
- No animation-library additions — everything is CSS or existing hooks.
- `transition-all` — still zero real uses; every grep is a comment explaining the ban.
- `Hero.test.tsx`'s guards (`hero-scroll-fade` present, `hero-enter` / `cta-dot-pulse` absent) pass untouched; `ViewTransitions`, `Reveal`, `RevealAlive`, `ContentReveal` suites all pass unmodified.
- `globals.css`'s global RM floor still beats everything added — no addition needed an exception.

---

## 🔴 DECISION NEEDED — the dark dusk-turn's intensity

**What:** how far the sweep goes before it stops feeling restrained. At the middle of the turn the page is **entirely** the dusk sky for 81ms, and ≥90% sky for 174ms of the 420.

**Recommendation: [SHIP AS TUNED].** It answers your defect requirement squarely — the dark leg is an unmistakable gradient (indigo → wine → ember → night, the ember at 12.5× the night's luminance), with no gray anywhere in it. The values are the world's own dusk, so it reads as *this world turning* rather than as an effect. Board 02 pane B2 storyboards exactly this — "a full-value sweep, not a gray shimmer."

**Why not louder:** it is already at the top of the restrained register. **Why not quieter:** quieter is the thing you rejected.

**Alternative — [DIAL BACK]:** one line, and precise. Change the two hold stops in `globals.css` from `opacity: 0` to `opacity: .10` (`theme-turn-out` at 42%, `theme-turn-in` at 58%). The rooms then never fully vanish — the sky peaks at ~81% instead of 100% — so it reads as the room *passing through* dusk rather than the page briefly becoming the sky. Costs about a fifth of the drama; removes all of the "did the screen just blink" risk on repeated toggling.

**Impact:** cosmetic only, either way. No a11y consequence (no luminance overshoot in either direction — one monotonic change, not a flash), no layout, no test change, fully reversible.

**Your choice:** `[SHIP AS TUNED]` · `[DIAL BACK]` · `[DEFER]`

---

## 🔴 DECISION NEEDED — `intro-cue-rise`, brief vs. PROTECT-66

**What:** the brief's G3 stray list names **600ms**, which is `intro-cue-rise` — the intro scroll cue's **entrance** (plus its 700ms delay). **PROTECT-66 sanctions the cue's EXIT duration only** (already `var(--dur-fast)`), and its existence/placement/register are protected. The guard bank records two refinements of exactly this kind being **blocked as governance violations and reverted before merge**.

**Recommendation: [LEAVE IT].** The ban list outranks the work list — the brief says so itself — and I will not retime a protected surface on my own authority. The cost is one 600ms entrance and one 700ms delay staying literal; both are now enumerated survivors in the guard with this reason attached, so they are documented rather than drifting.

**Alternative — [TOKENISE ANYWAY]:** 600 → `var(--dur-settle)` (560ms, −7%) and the delay to a token. Needs your explicit ratification, the way D1/D2/D3/D5 were ratified in the clockwork pass.

**Impact:** either way, cosmetic and one line. The risk is governance, not pixels.

**Your choice:** `[LEAVE IT]` · `[TOKENISE ANYWAY]` · `[DEFER]`

---

## Premises of this brief that did not hold

1. **"Phase A tokenised the off-ramp durations."** It did not, and said so in its own close-out. G3 did the work rather than confirming it. *(The biggest one — it changed G3 from an audit into an implementation.)*
2. **"`origin/main` is 10 behind; HOLD THE PUSH."** Carried in memory, not the brief — but checked first, and stale: `origin/main` was already at `79ba45c`, in sync.
3. **"The only two greps [for `transition-all`] are comments."** There were three before this phase (`globals.css`, `Button.tsx`, `CredentialBadge.tsx`); the ban itself holds — all three are comments explaining it. My guard adds a fourth.
4. **The brief's stray list includes 600ms**, which PROTECT-66 puts out of reach. See the second 🔴.
5. **`duration-reveal` is in the same zero-call-site condition** as the two keys the brief named; left standing rather than removed on my own authority.

---

## Device rows generated — for Sky's Phase J session

Everything below is Chromium-only here (Era Codex SE-7) and is **not** asserted from this machine.

| # | Row |
|---|---|
| **G-D1** | **The dusk-turn at real speed, on a real screen** — both directions. The one thing the harness cannot answer: how 420ms *feels*, especially on repeated toggling. Drives the first 🔴. |
| **G-D2** | **The dusk-turn on OLED at night** — the dark leg's ember horizon against true black; whether the plum reads as plum or as noise on a phone panel. |
| **G-D3** | **WebKit view-transition behaviour** — Safari's VT support differs; confirm the turn either plays or degrades to a clean instant cut, never a half-state. |
| **G-D4** | **iOS `:active` on the method links** — touch has no hover; confirm the always-visible method text is genuinely the whole affordance and nothing reads as broken. |
| **G-D5** | **Real reduced-motion, at the OS level** — everything here is a faithful simulation, but the real setting on a real device is the only proof. Toggle the theme with RM on: it must cut instantly with no sky. |
| **G-D6** | **The 300 → 280ms `:target` arrival** — deep-link to any `article h2[id]` and confirm the gutter bar still announces itself. |

---

## Banked evidence (re-runnable, not screenshots)

- `build-reports/G1_turn-harness.html` — the dusk-turn composite. Copy into `out/`, serve via the `portfolio-out` launch config, `?leg=dark|light&p=0..1`.
- `build-reports/G2_method-harness.mjs` — regenerates the pointer harness from the current build; all three pair shapes with a live HUD.

> ⚠ **Delete both from `out/` before running the gate.** `lib/__tests__/static-integrity.test.ts` sweeps every `.html` in `out/` and will correctly fail a page that is not a real route (missing pre-paint reveal guard, missing `og:url` / `og:site_name` / `og:locale`). Found the honest way — by running the gate with them still there.

---

## STOP

Branch `room/pG-motion`, 3 commits, **not merged, not pushed.** Sky reviews the diff and the frames, answers the two 🔴s (or defers them — neither blocks anything), then merges. Next in the ratified scope: **H (a11y + responsive)**.
