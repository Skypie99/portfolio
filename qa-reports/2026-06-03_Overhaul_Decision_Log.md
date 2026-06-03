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

### Phase 3 — Visual / UI pass ✅ (tag `overhaul-phase3`)

**Shipped (warm depth system — the "expensive" look):**
- **The "lit well" — the signature depth move.** Each Work-card mockup now sits in a warm lit well: `from-earth→earth-deep` gradient + a soft base inner-shadow (`shadow-[inset_0_-34px_50px_-38px_rgba(60,32,18,0.32)]`) + a single warm top-light overlay (`radial-gradient … rgba(255,241,217,0.38)`, dark variant `0.16`). The device reads as *seated and lit from above* — one warm light source, echoing the landing. Validated visually in **both modes** (Morgan greenlit off the prototype before roll-out).
- **Cards onto the warm shadow ramp:** `shadow-md` resting → `hover:shadow-lg` (was `shadow-warm` + `--shadow-elevation-2`).
- **Aliased `--shadow-elevation-1/2/3` → `var(--shadow-md/lg/xl)`** in tokens-phase2.css — so `AnimatedCertGrid` hover + the `card-elevate` keyframe inherit warm depth with zero call-site churn.
- **Lit-well applied to the case-study image wells** (hero `aspect-[4/5]` + gallery `aspect-[4/3]` in `work/[slug]`) — same pattern; also sets up signature moment #3 (P4).
- **Stats band** grid gains `shadow-md` (reads as a seated panel).
- **Decluttered the ProjectCard CTA row:** `Case study →` primary (left), `Live demo / GitHub` quiet cluster pushed right (`ml-auto`), `·` divider removed — addresses the audit's "crowded" flag. All aria-labels/rel/focus rings preserved.

**Decisions:**
- **D3.1** Greenlit the lit-well direction off a homepage prototype, then delegated roll-out to a Sonnet builder (model-split K3). The lit-well is the restrained "depth & materiality" the brief asks for — felt, not seen.
- **D3.2** Left the Method panel + Button + small chips on `shadow-soft` (intentionally quiet; brief wants Method restrained).
- **D3.3** Dark top-light alpha lowered to 0.16 (vs 0.38 light) so the warm glow doesn't read as a hotspot on the dark earth backdrop.

**Verification:** typecheck clean · 154 tests + 1 todo · ESLint clean · static export builds (15 pages / 3 exported). **`/` First Load JS still 197 kB — depth is pure CSS, zero perf cost.** Cards' warm depth confirmed via computed styles + both-mode captures; cinematic intact (dawn vista unchanged). No frozen files touched.

**Tooling notes:** (1) Hit a Next dev `.next`-cache corruption (`__webpack_modules__ is not a function` + RSC manifest errors) that served stale bundles — fixed by `rm -rf .next` + restart; verify edits via `preview_inspect` computed styles, not just screenshots. (2) The preview MCP is pinned to `/`; eval-navigation to sub-routes doesn't persist — case-study visuals verified at the code/computed level (identical lit-well pattern); will point a launch.json path at a sub-route when P4/P7/P8 need sub-route captures.

### Phase 4 — Motion & interaction ✅ (tag `overhaul-phase4`)

**The three signature moments (all "arrive & settle", echoing the landing):**
1. **Stat count-up** (`components/CountUpStat.tsx`, Morgan-built) — numeric figures count 0→value once on scroll-in over `--dur-reveal`/`--ease-out`, then hold. `tabular-nums` (verified applied) locks digit width = no jitter. `E2E` stays static; `50+` reveals its `+` at completion. Accessible name = final value; SSR/no-JS/RM render the final value (no flash of 0). Verified live: counts, correct values, panel depth.
2. **Ambient golden-hour drift** (`.ambient-drift` in globals.css + a blob in `#contact`, Morgan-built) — one warm radial light field drifting ≤4% over 26s, infinite-alternate, `--rgb-gold`/`--rgb-accent-soft` (flips dark). CSS/compositor-only. Verified live: `animation-name: ambient-drift`, 26s. RM → static glow (gated `no-preference` + global RM freeze).
3. **Case-study hero "settle"** (`components/HeroSettle.tsx`, Sonnet-built, Morgan-reviewed) — on mount the image well settles (opacity + `scale 1.02→1`, 900ms) then the `<h1>` carves in (opacity + y + **letter-spacing 0.12em→-0.02em**, 520ms, +150ms delay) — the landing's signature title gesture, image-then-title ordering. RM → final state. Verified live on `/work/accessmap/` (title + lit-well render correct).

**Quiet micro-motion layer:**
- **Keystone fix:** replaced the Firefox-broken CSS `reveal-on-scroll` on all 6 homepage sections with the cross-browser `<Reveal>` primitive. Verified reveals settle visible; grid dividers + featured `md:col-span-2` preserved.
- **Staggered entrances** (80ms): Work cards, stat cells, credentials items, Method steps (used `<Reveal index>` not AnimatedStepList — the latter lacks the `highlight` prop + owns its own divider structure; Reveal gives the same stagger with zero restructure).
- **Footer link-draw:** all 9 footer links now draw an underline on hover + focus-visible (was color-only).
- **Card press:** ProjectCard gains `active:translate-y-0 active:shadow-md`.

**Verification:** typecheck clean · 20 files / 160 tests + 1 todo (incl. 6 new HeroSettle) · ESLint clean · build 15 pages / 3 exported · no console errors · cinematic untouched (no frozen edits).

**⚠ Carried items:**
- **PERF (→ Phase 6):** `/` First Load JS rose **197 → 210 kB (+13 kB)** — the new homepage motion components pull framer-motion into the homepage bundle, breaking the lazy-load split. Phase 6 fix: `LazyMotion`+`m` (loads features lazily, ~5 kB core) or lazy-mount, to restore the split while keeping SSR + the count-up's no-flash.
- **Consistency (→ Phase 7):** `reveal-on-scroll` still active on the sub-route pages (`/about`, `/blog`, `/certificates`, `/contact`, `/work` index) — migrate those to `<Reveal>` in the cohesion pass for site-wide Firefox parity.
- **Verify (→ P7/P8):** HeroSettle carve-in feel + a mid-count frame are best confirmed with a slow-mo / RM-toggle pass; functionally verified now.

**Tooling note:** Next dev HMR is unreliable on this GSAP-heavy setup (stale bundles; `__webpack_modules__` corruption after `next build` shares `.next`). Reliable loop: stop → `rm -rf .next` → restart → verify via `preview_inspect`/`eval`. Sub-route navigation works on a *healthy* server (earlier bounces were the corrupted one).

### Phase 5 — Detail & finish (the 1%) ✅ (tag `overhaul-phase5`)

**Shipped (the details people feel but can't name):**
- **Styled scrollbar** — thin, warm, low-contrast, `--rgb-line-strong`/`--rgb-pebble`-backed (flips dark for free), gated to `pointer:fine` (touch keeps native overlay). Understated so it never reads as chrome over the cinematic takeover (lockfile §7 #1).
- **Tokenized focus ring** — the global `*:focus-visible` now reads `--focus-ring-width/offset/color` (values unchanged; now a system knob).
- **Tight optical kerning** on the large serif tiers — `step-3/4/5` gain `-0.01 / -0.015 / -0.02em` (the "expensive serif" tracking the section heads lost migrating off `display-m`).
- **Favicon** — `app/icon.svg`: a golden-hour desert sun (terracotta disc + clay horizon lines) echoing the landing; legible at 16px, works on light + dark tabs. Wired (`<link rel="icon" type="image/svg+xml">`).
- **theme-color** — `viewport` export: light `#FAF8F1` / dark `#15191A`, so mobile browser chrome matches the mode.
- **Raster OG card** (HIGH VALUE — the owner is about to share publicly) — `app/opengraph-image.tsx` via `next/og` generates a **static 1200×630 PNG** at build (needed `dynamic = 'force-static'` for export). Desert palette, terracotta sun motif, name + tagline + SKYPISTUDIO.COM eyebrow + "AI PORTFOLIO" pill. Replaces the SVG OG (which didn't render on iMessage/LinkedIn/Slack/Twitter). Built `og:image`/`twitter:image` confirmed pointing at the PNG.
- **Empty states** — `/certificates` was missing one (bare `<ul>`); added a brand-voice "Credentials coming soon." `/work` + `/blog` + 404 already handled (confirmed).

**Decisions:**
- **D5.1** Scrollbar styled (not hidden) — hiding it would remove a scroll affordance (a11y/usability); subtle-styling is the premium-and-accessible choice.
- **D5.2** OG card uses system fonts (not Cormorant) for build robustness — loading the brand serif into satori needs a fragile build-time font fetch. Card is on-brand via palette + sun motif. **Optional P7 refinement:** wire Cormorant into the OG card for full display-face consistency (only if a non-fragile font source is available).

**Verification:** typecheck clean · 160 tests + 1 todo · ESLint clean · build 17 pages / export OK (PNG OG emitted, 1200×630). Favicon + theme-color + PNG og:image confirmed in built `out/index.html`. No frozen files touched.

### Phase 6 — Perf & a11y hardening
_(next)_
