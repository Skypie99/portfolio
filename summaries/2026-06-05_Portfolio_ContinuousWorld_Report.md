# Portfolio — "One Continuous World" (Direction A) — Build Report

**Date:** 2026-06-05
**Branch:** `feature/portfolio-continuous-world-2026-06-05` (off `main` @ `88ab9f8`, which already has B + C + D — verified)
**Status:** Built, green, reviewable. **NOT merged, NOT pushed** — main stays your gate.
**Effort:** flagship build. Intro untouched (byte-identical). B + D intact.

---

## ▶ DECISIONS FOR SKY (read first)

1. **Theme ↔ scroll reconciliation rule (CHOSEN — please confirm).**
   Two inputs, two layers, they never fight:
   - **The theme toggle / system preference owns the BASE theme** (light or dark) — it governs every *readable* surface (panels, text, chrome). Your explicit choice is always respected, persisted, and announced.
   - **Scroll position owns only the BACKDROP's time-of-day** (golden → dusk → night), behind the frosted panels.
   The framing that makes "the day→night arc IS the light→dark transition" true: **light mode = the daylight half of the world; dark mode = the night half.** Scroll moves the sun *within* each; toggling steps between the day-world and the night-world. A light-mode reader who wants full night drama toggles to dark.
   *Alternative considered and NOT chosen:* scroll literally flips the content theme mid-page. Rejected — text contrast would depend on scroll position (an accessibility hazard). If you'd prefer that, say so and I'll scope it carefully.

2. **Light mode is intentionally airy; dark mode is dramatic.** To keep small meta/eyebrow text at WCAG AA over the moving world, the light-theme world is a *gentle* golden→blue-hour wash (high luminance). The deep, cinematic night lives in **dark mode**, where light text has the headroom for it. If you want light mode *more* present, the lever is lowering panel opacity + deepening the world — but that pushes small mono labels toward the 4.5:1 floor. I can tune it further with your blessing (a one-line `--surface-alpha` change).

3. **Project URLs / subdomains — 3 need your confirmation (I did NOT guess).**
   - ✅ **Prompt Library** → `https://prompts.skypistudio.com` — already correct, left as-is.
   - ✅ **Ghost Code** → `https://ghostcode.skypistudio.com` — already correct, left as-is.
   - ⚠️ **AccessMap** → still `https://access-map-tau.vercel.app` (Vercel auto-URL). Is there an `accessmap.skypistudio.com`? If so, tell me and it's a one-line swap.
   - ⚠️ **Claude Corp** → still `https://skypie99.github.io/Claude_Corp/` (old GitHub-Pages URL). Subdomain?
   - ⚠️ **Mutual Mesh** → still `https://mutual-mesh.vercel.app` (Vercel auto-URL). Subdomain?
   GitHub links are kept as intentional secondary "source" links. **I could not verify link resolution** from the sandbox (outbound to those hosts is blocked) — please confirm they resolve / aren't half-migrated.

4. **Canonical strategy (proposed, not forced).** Each `/work/[slug]` case study should be **self-canonical to the apex** (`https://skypistudio.com/work/<slug>/`). The product subdomains are *separate sites* (the live products), not duplicates of the case studies — so there is **no duplicate-content conflict** and no cross-canonical is needed. The apex/`www` canonical fix is already handled by your **pending `feature/canonical-apex-domain` PR**; this branch deliberately does **not** touch the SEO files, so the two won't collide.

5. **I stashed your pre-existing uncommitted bookkeeping** (the `/new-window` edits to `DECISIONS_LOG.md` + `PROJECT_STATE.md`) so this branch started clean off `main`. Nothing lost — restore with:
   `git checkout feature/canonical-apex-domain-2026-06-05 && git stash pop`  (it's `stash@{0}`).

6. **No new dependency, no new image asset.** The world is pure CSS (echoing the approved `.pr-world` language). *Option for later:* a photographic AVIF desert-horizon plane would add more literal continuity — but it would couple to (or duplicate) the protected intro assets, so I left it out. If you want it, provide/approve an asset and I'll wire it behind the same `--day-night` engine.

7. **Live 60fps not measured in the sandbox** (headless throttles rAF). The effect is **compositor-only** (opacity/transform on ~4 fixed layers; +2 kB JS; zero per-scroll repaints) and within the perf budget by design — but please confirm smoothness on a real device. The reduced-motion / low-power path serves a **static** world, so even if a device struggles, it degrades to a clean still.

8. **Email = draft, not auto-sent.** Per the "no unsupervised external sends" rule, I prepared the briefing as a Gmail **draft** to skylerhalisky@gmail.com and saved it to `summaries/…_Email.txt`. Send it whenever you like.

---

## BEFORE → AFTER (the scroll experience)

**Before:** The cinematic golden-hour world ended when the intro's wordmark finished. From the hero down, the page was a stack of **opaque cream / near-black panels** — "amazing intro, then an ordinary page." The light→dark choice was a flat toggle flip.

**After:** A single **fixed, golden-hour desert** now lives behind the entire post-intro site. As you scroll, the **sun lowers and the grade shifts golden → dusk → night** — and *that arc is the light→dark journey*. Content rides on the **same panels, now translucent frosted glass**, so the page literally travels *through* the evolving world. The intro stops being a curtain lifting onto a room and becomes **Act One** of one continuous descent. On every sub-page the world is present too, so the whole site reads as one place.

---

## The continuous-world spec (what was built)

All additive; all in the site-UI region of `globals.css`, well clear of the locked `.cinematic-*` / `.cdesert-*` ranges.

- **`components/WorldBackdrop.tsx`** — a `position:fixed; inset:0; z-index:-1; aria-hidden; pointer-events:none` stage, mounted once in `app/layout.tsx`. Layers: a base **dusk** sky, a **day** sky (crossfades out 0→0.5), a **night** sky (crossfades in 0.5→1), a **sun** (lowers + dims), a warm **horizon** line (fades with the light). The locked intro (opaque, z 50 while pinned) sits *on top* on the homepage, so the world is revealed only after the handoff.
- **`lib/motion.ts → useDayNight()`** — one rAF-throttled scroll listener sets `--day-night` (0→1) on `<html>`. **Remapped** so the arc *begins at the post-intro handoff*: on the homepage `--day-night` is 0 (full golden) the instant the 680vh intro finishes (anchored to `.cinematic-content-reveal`); on sub-pages it runs top→footer. Reduced-motion → no-op (the var stays unset). Mirrors the existing `useScrollProgress` exactly.
- **Translucent surfaces** — `.world-surface` / `-alt` / `-cool` / `-cool-pale` replaced the opaque `bg-cream` / `bg-warm-white` / `bg-wa-teal-*` on every post-intro section + the footer, site-wide. Static paint (no per-scroll repaint); the world shows through as content scrolls over it. The frosted **glass cards** (work/certs) now refract the living world.

### Tokens (per-theme, flip with `html.dark`)
Decorative `--rgb`-style triplets so they flip automatically:
- `--sky-day-1..4`, `--sky-dusk-1..4`, `--sky-night-1..4`, `--sky-sun` — the sky gradient stops for each state.
- `--day-night-rest` — the reduced-motion / no-JS resting state: **0 (golden) in light, 1 (night) in dark**.
- `--surface-alpha` (0.62 light / 0.66 dark), `--surface-alpha-alt` (0.79 / 0.70), `--surface-alpha-cool` (0.77 / 0.66) — the panel translucency knobs, set just above the AA floor so the world shows through as much as legibility allows.

---

## Readability proof (WCAG AA — measured, both themes, all states)

Exact contrast was computed by alpha-compositing each panel over the **worst (darkest) stop** of the world at **golden / dusk / night**, then WCAG-scoring every text tier. AA = 4.5:1 (normal text), 3:1 (large).

| Theme | `ink` (body/headings) | `ink-muted` (body) | `ink-meta` (small labels) |
|---|---|---|---|
| **Light** (airy) | **≥ 9.7 : 1** | **≥ 5.6 : 1** | **≥ 4.5 : 1** on every surface that carries it (worst ~4.6, footer/certs at dusk) |
| **Dark** (deep) | **≥ 9.8 : 1** | **≥ 6.4 : 1** | **≥ 5.2 : 1** (worst of *all* tiers in dark is 5.20) |

Every real text/surface combination clears AA at golden, dusk, **and** night, in both themes — including the footer (night end). The contact panel (`cool-pale`, the lowest-luminance base) carries only `cool-deep` + `ink-muted` text, both ≥ 5.5:1. Headings use the `ember` gradient (large) with even more headroom. **No scroll position drops any text below AA.**

---

## Performance

- **Compositor-only:** `opacity` + `transform` on ~4 fixed, promoted layers; the surfaces are *static* translucent paint (no `background-color` animation, no per-scroll repaint). One added rAF-throttled scroll listener (same shape as the existing `useScrollProgress`).
- **Bundle:** home First Load JS **206 kB → 208 kB** (+2 kB for the component + hook). No new dependency.
- **Reduced-motion / no-JS / low-power:** `useDayNight` no-ops → the world rests at a **static** theme-appropriate state (light → golden, dark → night), via `var(--day-night, var(--day-night-rest))`. Verified: with the var unset, the day layer holds opacity 1 in light, the night layer holds in dark. No scroll-linked motion, no jank.
- Live 60fps on device not measurable in the headless sandbox (see DECISION 7).

---

## Floor intact (nothing regressed)

- **Intro:** byte-identical. `git diff main` over `components/cinematic/**`, `app/tokens-phase2.css`, `cinematic-masters/**`, `components/CinematicIntro.tsx`, `public/images/cinematic/**`, `designs/**` = **empty**. The `.cdesert-*` / `.cinematic-*` CSS ranges are unchanged.
- **B — "Show the work":** `ProductReveal` placeholders + glass cards render over the world (verified 5 + 5 present on `/work`); they sit *on top* of the backdrop, never under it.
- **D — Filmic transitions + scroll-spy:** `ViewTransitions` and `SidebarSectionNav` are untouched (layout/sidebar); their tests pass.
- **Type/colour system, both-theme AA, reduced-motion, `(scripting:none)`, existing motion (C washes, carve-in, ambient drift):** preserved.
- **Build green:** `typecheck` clean · `vitest` 178 passed · `token-parity` green · `test:static` (build + link/image/JSON integrity) passed · static export builds. CLS: surfaces only change `background-color` (no box-size change) → no layout shift.

---

## How to review

```
git diff main..feature/portfolio-continuous-world-2026-06-05
```
13 files changed (mostly `bg-*` → `world-surface*` swaps) + 2 new files (`components/WorldBackdrop.tsx`, `CONTINUOUS_WORLD_PLAN.md`).

**Live checklist (`npm run dev`, then scroll the full site):**
1. **Scroll the homepage top → footer** — watch the world descend golden → dusk → night behind the content, continuing from the intro's golden cliff.
2. **Toggle light ⇄ dark** — light is the airy daylight world; dark is the deep night world; both run the arc; your choice sticks.
3. **Read everything as you scroll** — text should read effortlessly at every position, both themes (hero, work cards, process, about, certs, contact, footer).
4. **Sub-pages** (`/work`, a `/work/[slug]`, `/about`, `/certificates`, `/contact`, `/blog`) — the world is present and evolves there too.
5. **Static fallback** — enable *Reduce Motion* (System Settings → Accessibility) and reload: the world is a clean static golden (light) / night (dark), no scroll motion. Same on a phone.
6. **Intro** — confirm it looks and times exactly as before; the world only appears *after* the wordmark hands off.
