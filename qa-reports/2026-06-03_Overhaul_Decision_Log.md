# Decision Log — skypistudio.com Experience & UI Overhaul

**Run:** below-the-landing overhaul · **Branch:** `overhaul/skypistudio-2026-06-03` (off `main` @ `cd6294e`)
**Lead/Orchestrator:** Morgan (Opus) · **Build:** Dani + Shamus (Sonnet) · **A11y sign-off:** Alex
**Started:** 2026-06-03 · **Deadline:** Fri 2026-06-05 12:00 PM
**Plan:** `~/.claude/plans/brief-skypistudio-com-humble-harp.md`

This log records decisions as the run proceeds (brief §2.4: "the record is part of the deliverable").

---

## Kickoff decisions (2026-06-03)

| # | Decision | Rationale |
|---|---|---|
| K1 | **Scope = core routes.** Homepage + Work/case studies + About + Credentials + Contact get full treatment; Blog *inherits* the system, no bespoke redesign. | Sky's clarification. Concentrates the budget where it shows; keeps all 3 signature moments. |
| K2 | **Updates = iMessage per phase**, non-blocking, sent by Morgan only. Overrides the standing 2026-05-28 no-iMessage rule **for this run only**. | Sky's clarification + the brief's explicit instruction. |
| K3 | **Models:** Morgan orchestrates/reviews on Opus (Sky-started session); Dani/Shamus build on Sonnet. | Sky's clarification. Quality bar held at the Opus review layer; cost discipline on execution. |
| K4 | **Role rebalance:** `/will` is a technical writer (no app code), not the UX/motion designer the brief names. Dani absorbs UX/interaction/motion *design*; Shamus builds; Will owns decision log + final report + docs; Alex owns a11y. | Brief grants Morgan re-balancing authority; uses each real skill for its strength. |
| K5 | **Branch architecture:** single integration branch `overhaul/skypistudio-2026-06-03` off `main`; sequential per-phase commits; git tag at each phase exit (`overhaul-phaseN`). Never touch `main` — Sky merges at the end. | Constitution (only Sky merges main) + non-blocking run + per-phase rollback. |
| K6 | **Landing freeze boundary is narrow & sharp:** verified the live cinematic reads only `--font-cormorant` + `--sidebar-w`, NOT the `--rgb-*` palette. So the token system is safe to extend additively; the frozen set is `components/cinematic/**`, the `.cdesert-*`/`.cinematic-*` CSS, those two tokens, and the AESTHETIC_LOCKFILE §7 BLOCK list. | Corrects the brief's assumption that the landing "relies on the palette tokens"; sharpens the guardrail. |
| K7 | **Fork clean from `main`; do not merge the stale `a11y/tagpill-contrast-2026-06-03` branch.** main `cd6294e` already fixes the same 3 TagPill warm variants (Gary pre-merge QA). | Avoids reverting newer main work; TagPill contrast re-verified in Phase 3/8 instead. Memory-confirmed pattern (stale parallel a11y branches). |

---

## Phase decisions

### Phase 1 — Foundations ✅ (tag `overhaul-phase1`)

**Shipped (additive token spine, zero rendered change):**
- **Modular type scale** `--fs-step-1..5` (1.25 ratio) + `--fs-display` (clamp) + `--fs-hero` (clamp) + `--lh-tight/snug`, `--ls-display/hero`. Existing `--fs-display-*` kept as compat layer (retire in P7).
- **Easing vocabulary** `--ease-entrance` / `--ease-exit` / `--ease-snap` (beside `--ease-out`/`--ease-soft`).
- **Warm layered shadow ramp** `--shadow-sm/md/lg/xl` (warm `rgba(60,32,18,…)`) + explicit `html.dark` overrides (rgba literals don't auto-flip). Overrides Tailwind's *unused* core sm/md/lg/xl (verified unused first).
- **Border-width scale** `--border-width-hairline/thin/thick/heavy` + Tailwind `border-hairline` (0.5px, decorative only).
- **Tokenized focus ring** (`--focus-ring-*`, value unchanged); `--scrim` (+ dark); `--dur-ambient: 26s` (signature moment 2); `--z-*` ladder (consistent with the landing's frozen z-indexes).
- Mirrored into `tailwind.config.ts` (var-backed = single source of truth) + registered in `lib/cn.ts` `CUSTOM_FONT_SIZES`.
- **`lib/__tests__/token-parity.test.ts`** (39 assertions) guards the globals ↔ tailwind ↔ cn.ts three-file sync + the html.dark shadow override.

**Decisions:**
- **D1.1** Scale numbers UP from body (step-1 = 20px); reuse existing `--fs-label/meta` for sub-body. Avoids awkward `step--1`/`step--2` double-dash Tailwind classes; the micro sizes already exist.
- **D1.2** Tailwind fontSize values are `var(--fs-*)` (not literals) → one source of truth, drift impossible; the parity test still guards existence.
- **D1.3** `--scrollbar-w` token defined but scrollbar RULES deferred to Phase 5 (need the §7 takeover check first) — keeps Phase 1 truly zero-visual.

**Verification:** typecheck clean · 18 test files / 150 tests + 1 todo pass (incl. new 39) · ESLint clean · static export builds (3/3). Browser: cinematic renders untouched both modes; below-landing content unchanged (light + dark). **Baseline metric: `/` First Load JS = 197 kB** (Phase 6 budget guard). No console errors.

**Tooling note:** added a `portfolio-overhaul` entry to `~/AccessMap/.claude/launch.json` (preview MCP reads cwd's launch.json; serves Portfolio on :3220 via `bash -lc cd …`). Left uncommitted in AccessMap (dev convenience). No headless browser in Portfolio → mockup-PNG pipeline (puppeteer-core + system Chrome in /tmp) to be set up before Phase 2.

### Phase 2 — Structure & UX
_(next)_
