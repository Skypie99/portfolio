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

### Phase 2 — Structure & UX ✅ (tag `overhaul-phase2`)

**Shipped (type hierarchy systematized + reveal primitive + hover reconcile):**
- **Tuned the two fluid display tokens to real content** (nothing referenced them yet): `--fs-display` → `clamp(2.75rem, 1.6rem + 5vw, 4.25rem)` (44→68px, route page titles); `--fs-hero` → `clamp(3rem, 1.4rem + 6vw, 5.5rem)` (48→88px, homepage hero). Keeps titles confident rather than shrinking onto the mathematical scale.
- **Migrated all structural type onto the scale** across 16 files (Dani mapping, applied by Sonnet builder): hero h1 → `text-hero`; all route page-title h1s → `text-display`; section h2s (`display-m` 36px) → `text-step-4` (39px, more confident); card/large titles → `text-step-3`; sub-heads/blockquotes/cert titles → `text-step-2`; 20px → `text-step-1`. Removed now-redundant inline `letterSpacing` where `text-display`/`text-hero` tuples supply it; kept specific `-0.015em`/`-0.01em` on card titles/blockquotes (step tokens don't set ls). −8 net lines (cleaner than the arbitrary clamps it replaced).
- **Built `components/Reveal.tsx`** — the cross-browser scroll-reveal primitive (framer `useInView({once,margin:-80px})` + `useReducedMotion`, `{opacity:0,y:16}→{0}`, `index*0.08s` stagger). Replaces the Firefox-broken CSS `reveal-on-scroll`. **Built + tested, NOT yet wired** (wiring is Phase 4). + `components/__tests__/Reveal.test.tsx` (4 tests).
- **Reconciled the stale ProjectCard hover comment** in globals.css (`.work-card`): the "NO lift, NO shadow" Dani §3.3 note contradicted shipped behavior (`hover:-translate-y-1` + warm shadow). Updated the comment text to match reality; behavior untouched.

**Decisions:**
- **D2.1** Section headers → fixed `text-step-4` (39px) not a new fluid tier — short headers, +3px over the old 36px reads more confident; revisit fluidity in P6 if mobile flags it.
- **D2.2** Left UNMIGRATED (intentional): stat figures (page.tsx — they get the count-up in P4), HamburgerNav nav-link clamps (nav, not headings), body leads `1.0625rem`/`1.125rem` (body-adjacent), `display-s` (distinct small-serif role; P7 cleanup), AppMockup SVG label letterSpacings, content-renderer markdown headings.
- **D2.3** Delegated the mechanical roll-out to a Sonnet builder with an exact mapping table; Morgan (Opus) reviewed the full diff + verified visually. Model-split per Sky's kickoff decision K3.

**Verification:** typecheck clean · 19 test files / 154 tests + 1 todo (incl. 4 new Reveal) · ESLint clean · static export builds. Browser (both modes): hero now commanding `text-hero` ember serif; section headers more confident; dark-mode hero legible. **Cinematic byte-identical** (diff: zero frozen-file edits; landing reads only `--font-cormorant`/`--sidebar-w`, untouched). No console errors.

**Note:** dark-mode preview screenshots letterbox (MCP screenshot-canvas artifact after a colorScheme resize) — content verified correct via light captures + eval state; not a site issue. Race-avoidance for future captures: resize → reload → scroll → shoot.

### Phase 3 — Visual / UI pass
_(next)_
