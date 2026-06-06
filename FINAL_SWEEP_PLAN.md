# FINAL_SWEEP_PLAN — Light-World Reveal + Whole-Site Polish

**Branch:** `polish/portfolio-final-sweep-2026-06-05` (off `main` @ `74bd7e3`, trio fix merged)
**Date:** 2026-06-05 · **Effort:** maximum / thorough final sweep
**Do NOT merge to main** — main is Sky's gate.

Two sequenced parts: **(1)** reveal the light-mode world (gentler than dark, AA-protected),
then **(2)** a deep whole-site design/UX polish on the finished look, then a second
fresh-eyes sweep until nothing meaningful remains.

---

## Findings (read-first, no code)

### The world + dark reveal (the parallel to mirror gently)
- A fixed golden-hour→evening "world" paints behind content at `z-index:-1`
  (`components/WorldBackdrop.tsx`, `.world-backdrop` `app/globals.css:928`, opaque
  `--sky-dusk-4` base). Three crossfading sky layers (`--sky-day/dusk/night-*`) are driven
  by `--day-night` (0→1), set on scroll by `useDayNight()` (`lib/motion.ts`), anchored from
  `.cinematic-content-reveal` to document bottom. Reduced-motion / no-JS → var unset → rests
  at `--day-night-rest` (light 0 golden, dark 1 night).
- **Dark was revealed** by `html.dark body { background-color: transparent }`
  (`globals.css:921`): with the body fill dropped, the world's opaque dusk base becomes the
  page backstop and shows through the translucent `.world-surface*` panels.
- **Light is still occluded** by the opaque cream body. The opaque fill has **two** sources:
  the `html, body { background: var(--color-cream) }` shorthand (`globals.css:369`) **and**
  the Tailwind `.bg-canvas` utility on `<body>` (`app/layout.tsx:152`). A bare
  `body { background: transparent }` (spec 0-0-1) would lose to `.bg-canvas` (0-1-0).
- Light sky tokens are deliberately high-luminance, BUT the night (evening) end is currently
  **cool twilight blue** (`--sky-night-1..4: 200 206 224 …`) — the wrong direction for the
  brief's warm golden-evening.
- Surface alphas protect text contrast: `--surface-alpha .59 / -alt .79 / -cool .77 /
  -coolpale .62` (light). `.world-surface* { background: rgb(var(--rgb-*) / alpha) }`.

### Locked / off-limits
- Intro cinematic: `components/CinematicIntro.tsx`, `components/cinematic/*`, the
  `.cinematic-*`/`.cdesert-*` CSS in `globals.css` (edit only **above** `.cinematic-wrapper`,
  ~line 1399), cinema tokens in `app/tokens-phase2.css` (~262–325), and `--font-cormorant` /
  `--sidebar-w`. Never touch.
- Locked floor: type/color tokens, measured WCAG AA both modes, `prefers-reduced-motion`,
  `@media (scripting: none)`, the world reveal + dark arc + card spotlight, view-transitions.

### Open issues already catalogued (from the live review + reports)
- Writing section named 3 ways: "Blog" (title/OG), "Writing" (H1), "Dispatches" (nav).
- Ghost numerals on cards read accidental (`text-near-black/15`→`/25`, ~3.4:1).
- Hero right-side void on wide screens.
- 2 of 5 case-study heroes (claude-corp, prompt-library) lack real screenshots → placeholder
  "fires on empty"; galleries placeholder.
- `tabular-nums` missing on non-CountUpStat numerals.
- Homepage prints raw email in static HTML while `/contact` obfuscates it.

### Already done (verify-only — do not duplicate)
- `::selection` exists & flips dark (`globals.css:1211–1219`).
- `tabular-nums` already on `CountUpStat`.
- Rendered-copy straight-quote audit clean (hits are in comments).
- Favicon assets present (`/icon.svg`, `/apple-icon.png`).

### Green gates (baseline confirmed green on this branch)
`npm run lint && npm run typecheck && npm test && npm run build` — typecheck ✓, 179 tests ✓,
build ✓. `token-parity.test.ts` guards only `--fs-*`/`--ease-*`/`--shadow-*` → sky/alpha/color
edits are safe. `static-integrity` + `asset-integrity` enforce link/image/alt invariants. No
new dependencies.

---

## Part 1 — Light reveal

1. **Mechanism** (`globals.css:921`): replace `html.dark body { background-color: transparent }`
   with `body.bg-canvas { background-color: transparent }` (0-1-1, theme-agnostic, beats the
   utility). Dark stays byte-identical; light reveals. Leave line 369 (`html` keeps cream
   fallback) as-is.
2. **Warm-evening retune** (LIGHT `:root` only, `globals.css:879–881`): retune `--sky-dusk-*`
   and `--sky-night-*` to warm, high-luminance, low-travel golden-evening; keep the `-4`
   (behind-text) stops the most stable. Lock values only after the live AA pass.
3. **Alphas** (conservative margin): `--surface-alpha .59→.62`, `--surface-alpha-coolpale
   .62→.66`; keep `-alt .79`, `-cool .77`.
4. **Live AA pass** (the hard gate): measure worst-case meta/muted over every surface at
   `--day-night ∈ {0,.25,.5,.75,1}`; every text ≥ 4.5:1 (large ≥3:1) **with margin**; prove
   dark unchanged at dn=1; verify reduced-motion + scripting:none rest. Never ship a marginal
   pass — pull back the reveal / raise alpha if tight. Record ratios in the report.

## Part 2 — Polish (section by section)

- **Phase 0 (global, first):** ghost numerals → deliberate; `tabular-nums` on the other
  numerals; unify the writing section to **"Notes"** (incl. H1 + BlogIndex test in lockstep);
  `FilterPill` `:active`.
- **Phase 1 (homepage):** close the hero void (whisper-quiet meta-mark); showcase dividers
  read over the light world; The Work inherits G1; unify section rhythm; **obfuscate the
  homepage email** via the bot-safe `ContactEmail` pattern.
- **Phase 2 (work + 5 studies):** index inherits G1/G4; designed empty state for the two
  screenshot-less studies; consistent radii.
- **Phase 3 (Notes):** naming + numerals.
- **Phase 4 (about/cert/contact/404):** remove stray empty `<p>` in about; verify 404.
- **Phase 5 (detail layer):** focus-ring/radii/OG-title consistency; `::selection` verify.

## Second sweep
Fresh whole-site walkthrough (both modes, desktop + mobile); fix residuals; Alex AA +
keyboard/focus re-check; iterate until a clean sweep finds nothing meaningful.

## Decisions for Sky (answered / flagged)
- Section name → **"Notes"** (answered). Homepage email → **obfuscate** (answered).
- Light reveal amount + measured AA ratios → decide-and-log (conservative posture).
- Real screenshots for claude-corp + prompt-library → **asset gap, flag only** (interim:
  designed empty state). Never fabricate.

## Deliverable
`summaries/2026-06-05_Portfolio_FinalSweep_Report.md` led by DECISIONS FOR SKY, then
BEFORE→AFTER section by section; email prepared as a **draft** (not auto-sent); review
instructions + checklist.
