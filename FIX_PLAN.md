# FIX_PLAN — Portfolio trio (`fix/portfolio-trio-2026-06-05`)

**Date:** 2026-06-05 · **Branch:** `fix/portfolio-trio-2026-06-05` off `main` (`fe22e32`) · **Do NOT merge to main.**
**Source of truth for the gap:** `summaries/2026-06-05_Portfolio_Review_2.md` (live review, 8.5/10 → the three things between "standout" and "jaw-dropping").

Three fixes, in priority order, one commit each, all green checks (`lint` · `typecheck` · `test` · `build`) after each.

## Hard rules honored
- **Intro/landing scene OFF LIMITS** — `components/cinematic/**`, `.cdesert-*`/`.cinematic-*` CSS (globals.css ~1345–2296), `--font-cormorant`, `--sidebar-w`. Read-only. (Verified: the landing reads none of the `--rgb-*` / world / spotlight tokens, so these fixes are additive and safe.)
- **Locked floor** — measured WCAG AA both themes (light meta labels 4.85–6.88:1, dark 7.28–8.98:1), `usePrefersReducedMotion()` gating, `@media (prefers-reduced-motion: reduce)` + `@media (scripting: none)` fallbacks, `(hover:hover) and (pointer:fine)` spotlight gate, B reveals / D transitions / A·C world. None may regress.
- **No new dependencies. No new named Tailwind tokens** (avoids the `lib/cn.ts` ↔ `tailwind.config.ts` registration footgun) — edit existing tokens / raw CSS vars only.

---

## Fix 1 — View Transitions `TimeoutError` (Steve + Shamus)
**Symptom (live):** every case-study navigation logs `TimeoutError: Transition was aborted because of timeout in DOM update`. The nav completes; only the console shows red.
**Root cause:** `components/ViewTransitions.tsx` calls `startViewTransition(cb)` but never attaches a handler to the returned transition's `.finished` / `.updateCallbackDone` / `.ready` promises. When the browser's ~4s DOM-update timeout fires *or* a rapid second navigation interrupts the first, `.finished` rejects → **unhandled rejection → console**. The existing `try/catch` only catches synchronous throws.
**Fix:** capture the transition object; attach a no-op `.catch()` to all three promises (the nav already happened via `router.push`, so swallowing is correct). Keep the `toHome` instant-cut, reduced-motion / unsupported / external / modifier carve-outs and the 2-rAF resolve unchanged.
**Test:** `components/__tests__/ViewTransitions.test.tsx` — mock `document.startViewTransition` returning `{ finished: Promise.reject(...), updateCallbackDone: Promise.resolve(), ready: Promise.resolve() }`; assert **zero** `window` `unhandledrejection` and that `router.push` still fired.

## Fix 2 — Dark-mode day→night arc: "clearly felt sunset→night" (Sky's call)
**Why flat now:** `useDayNight()` drives `--day-night` 0→1 across scroll regardless of theme, but in dark the day↔night sky tokens sit in a narrow dark band and only ~50% bleeds through panels (`--surface-alpha: 0.50`).
**Fix (scoped to `html.dark` only — light mode untouched):** widen the dark sky-token range (warmer amber dusk start → deeper blue-black night), lower `--surface-alpha` (+companions) modestly so more world shows, and add a `html.dark .world-sun` override for more presence/travel. Empirically tuned live.
**Constraint:** dark-mode body + meta text stays WCAG AA over the most-translucent sections (re-measure with the live contrast script). Calm, not a gimmick.

## Fix 3 — Re-tune the cursor "mouse light" = card spotlight, cards only (Sky's call)
**Reality check:** there was never a whole-page cursor light. The "mouse light" is the per-card spotlight (`useSpotlight` → `.glass-card::after`), currently dialed back to a whisper. The `tune/world-intensity` branch (`0.42/0.50` + `opacity 0.4`) is the **"too intense" reference to stay far below**.
**Fix (cards only; `useSpotlight` logic unchanged):** tune `.glass-card::after` (+ `html.dark` companion) alphas/opacity to a deliberate *feel-more-than-see* whisper — anchored near current main, capped well under the `tune` values. Err subtle; re-check the dark soft-light layer doesn't amplify over the now-bolder dark world.

---

## Verification per fix (live browser + green checks)
- **1:** repeated case-study navs incl. rapid double-clicks → console clean of `TimeoutError|Transition`; cross-dissolve still plays; `/` still instant cut.
- **2:** dark fresh-load scroll top→bottom → `--day-night` reaches ~1, sky visibly travels; re-measure dark AA ≥4.5:1 (≥3:1 large); light unchanged.
- **3:** both themes read as atmosphere not feature; reduced-motion / `scripting:none` / touch fallbacks intact.
- **All:** `npm run lint && npm run typecheck && npm test && npm run build` green.

## DECISIONS / flags
- No new dependencies introduced (verified: `package.json` / lockfile unchanged).
- Branch stays off `main`; Sky reviews and merges.

---

## OUTCOME (what shipped, 2026-06-05)

Three commits on `fix/portfolio-trio-2026-06-05` (off `main` `fe22e32`), green checks
(`lint` · `typecheck` · 179 tests · `build`) after each. Intro untouched — every CSS
hunk is at globals.css ~890 / ~971 / ~1154, all far below the locked cinematic range
(1345–2296); `--font-cormorant` / `--sidebar-w` unchanged.

- **Fix 1 — `34d17fa`** (`components/ViewTransitions.tsx` + test). Swallow the
  transition's `.finished`/`.updateCallbackDone`/`.ready` rejections. **Verified live:**
  forcing `startViewTransition` to reject with the exact `TimeoutError` produced **zero**
  unhandled rejections; navigation still completes; `toHome` instant-cut + all fallbacks
  intact.

- **Fix 2 — `cd57a3f`** (`app/globals.css`). **Key discovery:** the arc wasn't flat
  because of timid tokens — the `z-index:-1` backdrop was **occluded** by the body's
  opaque `bg-canvas` (CSS paint order: stacking-bg → negative-z → in-flow block bgs).
  Fix = drop the dark body fill (`html.dark body { background-color: transparent }`) so
  the world's opaque dusk base backstops; plus widened dark sky tokens (warm amber →
  indigo/ember dusk → deep night) and a bigger/sinking dark sun. **Verified live:** day
  reads clearly warm, night deep cool; light mode unchanged (`bodyBg` still cream);
  worst-case dark meta over the warmest day band ≈ **5.4:1** (AA holds).
  *Note for Sky:* light mode's world is still subtler (occluded) — only DARK was in
  scope here. Revealing light's world would need its own AA pass (light tokens are
  high-luminance) — flag if you want it.

- **Fix 3 — `e8c52d3`** (`app/globals.css`). The "mouse light" = the per-card
  `.glass-card::after` cursor sheen (dark uses a brightening `screen` blend). Since
  Fix 2 put a bolder world behind the cards, brought the **dark** sheen down (gradients
  0.09/0.11 → 0.07/0.09; hover 0.45 → 0.34) so it stays atmosphere-you-feel-more-than-see,
  far below the rolled-back "too intense" pass. **Light untouched** (its world is
  unchanged). **Verified live** on `/work/` (no GSAP intro): hover shows a gentle sheen
  tracking the cursor (`--mx/--my` live, `::after` opacity 0.34), never a feature.

**Env note (not a site bug):** the Next *dev* server intermittently logs
`Cannot find module ./vendor-chunks/framer-motion.js` on the `/work/[slug]` route and
needs a clean `.next` after a production `build`; the production `build` itself is clean
and prerenders every route. The GSAP-pinned intro also can't be scrubbed via synthetic
`scrollTo`, so dark-arc/card verification used forced `--day-night` / the intro-free
`/work/` page.
