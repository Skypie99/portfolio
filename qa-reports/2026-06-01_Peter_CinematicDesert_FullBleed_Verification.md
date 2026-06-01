# Peter — Cinematic Desert FULL-BLEED Takeover Verification

**Role:** Peter (Performance Engineer, acting as motion/framing verifier)
**Date:** 2026-06-01
**Branch:** `feat/cinematic-desert-2.5d`
**Commit under test:** `8ad34a3` — "feat(cinematic): full-bleed takeover — intro owns the viewport, shell flows after"
**Baseline:** `3937f3c` engine verified MECHANICS-SOLID (`qa-reports/2026-06-01_Peter_CinematicDesert_Engine_Verification.md`)
**Scope:** Re-verify Dani's full-bleed reframe (framing CSS only) + confirm **no regression** to the already-verified engine mechanics. Work confined to this branch. `main` untouched, nothing pushed.

---

## VERDICT: FULL-BLEED-CONFIRMED ✅

The homepage cinematic now owns the entire viewport edge-to-edge for the whole descent; the sidebar is fully covered (not just geometrically pushed — painted over). The shell (sidebar + Hero) returns cleanly after the pin releases. Other routes keep their sidebar — the full-bleed is correctly homepage-scoped. No mechanics regression. JS console clean. Build, typecheck, and tests all pass.

---

## Method

Self-launched system Chrome 148 `--headless=new --remote-debugging-port=9222`, driven raw over CDP (`ws` from `node_modules`, no puppeteer). The Claude_Preview MCP misresolves to AccessMap, so CDP self-launch was used as in the engine pass. Per scroll position: `Emulation.setDeviceMetricsOverride` → `Page.navigate` → settle 1.8s (GSAP/ScrollTrigger init) → `window.scrollTo(0,Y)` → settle → DOM probe + `Page.captureScreenshot`. Console via `Runtime.consoleAPICalled` / `Runtime.exceptionThrown` / `Log.entryAdded`.

**The load-bearing assertion** ("sidebar gone") is verified two ways, because `getBoundingClientRect` returns *layout* geometry and is blind to z-order occlusion: the sidebar `<nav>` stays in the DOM at x:0/w:280 by design (Dani covers it, doesn't remove it). So the authoritative test is **`document.elementFromPoint()` at sidebar-zone pixels** — what actually paints there — corroborated by reading the rendered screenshot pixels.

Pin geometry at 900px viewport: stage 500vh = 4500px, pin 100vh = 900px → **pinned range y=0→3600**, shell flows in past 3600.

---

## Desktop 1440×900 — FULL-BLEED table

`elementFromPoint` probed at three sidebar-zone coordinates: (60,30) = name slot, (60,250) = FEATURED/AccessMap slot, (140,450) = sidebar right-edge mid.

| scroll Y | pin position | pin x / width | z-index | elem painted at sidebar zone | sidebar visible? | cinematic width | result |
|---|---|---|---|---|---|---|---|
| 0    | fixed    | 0 / 1440 | 50 | `.cdesert-pin` (×3) | NO — covered | 1440 (full) | **PASS** |
| 900  | fixed    | 0 / 1440 | 50 | `.cdesert-pin` (×3) | NO — covered | 1440 (full) | **PASS** |
| 1800 | fixed    | 0 / 1440 | 50 | `.cdesert-pin` (×3) | NO — covered | 1440 (full) | **PASS** |
| 2700 | fixed    | 0 / 1440 | 50 | `.cdesert-pin` (×3) | NO — covered | 1440 (full) | **PASS** |
| 3200 | fixed    | 0 / 1440 | 50 | `.cdesert-pin` (×3) | NO — covered | 1440 (full) | **PASS** |
| 3600 | relative | 0 / 1440 | 50 | (pin releasing — end of range) | — | 1440 (full) | **PASS** |

At every pinned position the pin is `position:fixed; left:0; width:1440px; z-index:50` — true edge-to-edge. `elementFromPoint` over the entire sidebar column returns `.cdesert-pin`, whose own text content is "SkyPi Studio" (the cinematic title), **never** the nav. No horizontal scroll at any Y (`document.scrollWidth == innerWidth == 1440`).

**Screenshot confirmation (rendered pixels):**
- **y=0** — sky-dawn placeholder, mid-mesa, cacti at both far edges (x≈0 and x≈1440), central rockface. No "Sky Halisky", no nav, no AccessMap rail. Edge-to-edge.
- **y=1800** — camera dollied forward (rockface much larger), sky crossfaded dawn→day, "near-rockface PLACEHOLDER" prominent. Full-bleed, no sidebar.
- **y=3200** — near-rockface arrival (warm sunlit), full day-blue sky, **title "SkyPi Studio" resolved and holding** center. Full-bleed, no sidebar.

> **Is the sidebar fully gone across the whole descent on desktop? YES.** The `<nav>` remains in the DOM (layout x:0/w:280) but is painted-over by the fixed z:50 pin at 100vw; `elementFromPoint` and the screenshots both confirm zero sidebar pixels reach the screen during the descent. This is the correct, intended mechanism.

---

## Shell-returns check (scroll past the pin)

At **y=4500** (past the 3600 pin range): pin flips `fixed → relative` and scrolls up out of view; `elementFromPoint` at the sidebar zone now returns the `<nav>` again; `#hero` is at top:0 in the viewport. Screenshot at y=4500 shows the sidebar fully restored ("Sky Halisky / AI ENGINEER · ACCESSIBILITY / AVAILABLE FOR WORK / FEATURED AccessMap / DISPATCHES") alongside the Hero ("An accessibility map. A multi-agent system. A Pac-Man trainer."), laid out exactly as the standard shell. **Shell returns correctly. ✅** The fixed→relative handoff is clean in headless; per Dani's note #1, a live human scroll-through at the ~y3600 seam is still worth a glance for any 1-frame swap, but no jump or gap was observable in the probe data (pin x:0 throughout, Hero monotonically rising 4522→3600→2700→1800→900→0 across the scroll sweep).

---

## Other-route check (homepage-scoping)

`elementFromPoint` at the same three sidebar-zone coordinates:

| route | painted at sidebar zone | sidebar present? | horiz scroll | sidebar rect |
|---|---|---|---|---|
| `/work` | `NAV` "Sky Halisky AI engineer ·" (×3) | YES | none | x:0 / w:280 |
| `/about` | `NAV` "Sky Halisky AI engineer ·" (×3) | YES | none | x:0 / w:280 |
| `/certificates` | — | YES | none | x:0 / w:280 |

`/work` screenshot: sidebar at left (full "Sky Halisky" rail), "The Work — 5 deliverables" main content boxed to the right, no cinematic, no full-bleed bleed-through. **The `.cdesert-*` rules never apply off-homepage** (`CinematicDesert` is imported only in `app/page.tsx` — verified by grep). **Other routes keep their sidebar. ✅** Dani's `overflow-x: clip` (global) does not clip the sticky sidebar or introduce horizontal scroll on long routes (verified `/work`, `/certificates`: `horiz:false`, sidebar x:0/w:280 intact). Caveat #2 cleared.

---

## Mobile 375×812 — homepage

`elementFromPoint` at sidebar zone returns `.cdesert-static-stage` (the StaticDesertFrame, used at narrow/reduced-motion), title text "SkyPi Studio". Screenshot: warm desert grade full-width edge-to-edge, "SkyPi Studio" centered/visible, hamburger nav top-right. Sidebar is `hidden md:flex` so it's already absent → mobile was already full-bleed; the reframe is a no-op here, confirmed unaffected. **PASS.**

---

## No-regression — engine mechanics (vs. baseline 3937f3c)

Framing-only honored: `git` shows the only file changed by `8ad34a3` is `app/globals.css` (+71/-3); `CinematicDesert.tsx`, `plates.ts`, `Layer`/`FilmGrain`/`StaticDesertFrame` untouched. Re-confirmed empirically from the descent screenshots:

| mechanic | baseline | now | verdict |
|---|---|---|---|
| Forward-dolly parallax (depth) | monotonic | rockface grows y0→y1800→y3200 (near-layer scales fastest) | ✅ no regression |
| Dawn→day crossfade | continuous, no dip | dawn-purple (y0) → warm transition (y1800) → full day-blue (y3200) | ✅ no regression |
| Near-rockface arrival | clean | rockface fills frame at y3200, warm sunlit | ✅ no regression |
| Title resolves + holds at end | yes | "SkyPi Studio" resolved & holding at y3200 | ✅ no regression |
| Pin attach across full range + clean release | yes | fixed y0→3600, relative release, no gap | ✅ no regression |
| Reduced-motion / narrow static frame | renders | `.cdesert-static-stage` on mobile + 2 RM tests pass | ✅ no regression |

---

## Console — CLEAN

JS console: **0 `console.error`, 0 exceptions** across two full desktop runs (y=0/1800/3600) + mobile + other routes. No ScrollTrigger NaN.

**One intermittent line investigated and dismissed:** the very first cold-target run logged a single `Failed to load resource: 404`. Root cause: **missing `/favicon.ico`** (no `app/favicon.ico` or `public/favicon.ico`; `curl` → 404). It is a browser-initiated speculative favicon fetch, fires only before cache warms, did **not** reproduce in two subsequent runs or in the network-layer probe (0 `loadingFailed`, 0 4xx/5xx page resources). **Pre-existing, browser-initiated, unrelated to the full-bleed change** — the engine baseline also reported a clean app console. Not a regression, not a blocker. (Optional pre-existing cleanup: add a favicon; out of scope for this pass.)

---

## Gate

| check | result |
|---|---|
| `npm run build` | clean static export — `✓ Exporting (3/3)`; homepage **50.3 kB / 197 kB** (unchanged, no JS added) |
| `npm run typecheck` | clean (no output) |
| `npm test` | **110 passed, 1 todo (17 files)**, incl. 2 CinematicDesert reduced-motion cases |
| horizontal scroll (`/`, `/work`, `/certificates`) | none |
| `headers` export warning | pre-existing (meta-CSP note), not from this change |

---

## DECISIONS FOR SKY

None blocking. Full-bleed takeover is verified and safe to keep on this branch.

- **Optional, pre-existing:** no favicon → intermittent 404 in console. Trivial to add `app/favicon.ico`. Not introduced by this work.
- **Live-scroll nicety (Dani note #1):** headless shows a clean fixed→relative handoff at the y≈3600 seam; a human scroll-through is still the gold standard for confirming no single-frame swap. Probe data showed none.
- **Token sync (Dani note #3):** `--sidebar-w: 280px` in `globals.css` mirrors `spacing.sidebar` in `tailwind.config.ts` (verified equal). If the rail width changes, both must move together — commented as such in the CSS.

---

*Verification by Peter. CDP self-launch, Chrome 148 headless. main (`cebeb7e`) untouched; nothing pushed. Dev server + Chrome stopped, ports freed.*
