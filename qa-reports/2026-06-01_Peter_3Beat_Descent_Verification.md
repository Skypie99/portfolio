# Peter — 3-Beat Cinematic Descent — Production Verification — 2026-06-01

**Branch:** `feat/cinematic-desert-2.5d` · **HEAD:** `670e53f` · main untouched, nothing pushed.
**Method:** Self-launched system Chrome `--headless=new` on CDP port 9333 (own profile — bypasses the Claude_Preview→AccessMap misresolution). Pure-Node WebSocket CDP driver, zero deps added. Each beat frozen via the dev-only `__cdesert.freeze(p)` hook (pins scene `position:fixed` at scrollY 0, sets timeline `progress(p)` directly — exact, no scroll/pin-sync drift). Ground-truth read by sampling computed `--cdesert-expose` / `--cdesert-grade-mix`, per-scene group opacities, per-plane transforms, sun positions, haze, and title opacity at each keyframe + full-frame screenshots + 2×-zoom edge crops. Screenshots in `/tmp/peter-3beat/` (31 PNGs).

## 1. DECISIONS FOR SKY

- [ ] **Ship the 3-beat cinematic descent to production (skypistudio.com).** — The full dawn→mid→arrival descent renders as one continuous, breathtaking forward dolly; all gates green; mobile + route-scoping correct. **VERDICT: SHIP** (with one cosmetic polish noted in §6 that does not gate the push).
  - **Action:** Merge `feat/cinematic-desert-2.5d` → `main` (Sky-only), then deploy the static `out/`.
  - **Rollback:** revert the merge commit; the feature is self-contained under `components/cinematic/` + `.cdesert-*` CSS + `public/images/cinematic/`.
  - **Why deferred:** production push to a live surface — Sky-only per Const. Art. 1/5.
  - **Owner:** Peter.

## 2. GATES

| Gate | Result |
|---|---|
| `npm run build` | PASS — static export, all 15 routes; prebuild `validate-assets` found all 9 cinematic planes; First Load JS 197 kB (home 51 kB). |
| `npm run typecheck` | PASS — clean. |
| `npm test` | PASS — 110 pass / 1 todo (17 files). |
| `__cdesert` debug hook | Confirmed `NODE_ENV !== 'production'`-gated; present in dev (used here), stripped from `out/`. |
| Console (desktop, all 8 keyframes) | **0 errors, 0 warnings.** |
| Console (mobile, /work) | **0 errors.** |

## 3. KEYFRAME TABLE (desktop 1440×900, ground-truth)

Stage 680vh / pin 100vh → pinSpan 5220px. Pin measured `fixed`, left:0, w:1440 (full-bleed) at every frame.

| p | expose | grade | dawn op | mid op | arr op | haze[1,2] | front-plane scale (active beat) | title op | read |
|----|------|------|------|------|------|------|------|------|------|
| 0.00 | 0.00 | 0.00 | 1 | 0 | 0 | 0,0 | dawn-fg 1.15 | 0 | deep cool blue-hour vista |
| 0.15 | 0.05 | 0.06 | 1 | 0 | 0 | 0,0 | dawn-fg 1.28 | 0 | push begins, glow stirring |
| 0.30 | 0.16 | 0.21 | 1 | 0 | 0 | 0,0 | dawn-fg 2.35 | 0 | deep into valley, warming |
| 0.42 | 0.23 | 0.38 | 1 | 0.80 | 0 | 0,0 | mid fading in | 0 | **Dissolve A** — same valley, warmer |
| 0.55 | 0.34 | 0.59 | 1 | 1 | 0 | 0,0 | mid-fg 1.71 | 0 | **MID plateau** — warm, NOT midday |
| 0.70 | 0.42 | 0.80 | 1 | 1 | 0.25 | 0.52,0.29 | arr resolving in | 0 | **Dissolve B** — cliff through haze |
| 0.85 | 0.66 | 0.95 | 1 | 1 | 1 | 0.27,0.30 | arr-cliff 2.12 | 0.42 | golden, sun bloom, title carving |
| 1.00 | 1.00 | 1.00 | 1 | 1 | 1 | 0.06,0.04 | arr-cliff 2.30 | 1 | **HOLD** — golden cliff + title |

**Continuous forward dolly:** confirmed. Front-plane scale climbs monotonically within each beat (dawn-fg 1.15→2.5, mid-fg 1.15→2.6, arr-cliff 1.12→2.3); foreground parallaxes faster than buttes in the screenshots — real depth, not a flat zoom. Scene ranges overlap (dawn 0–.46 / mid .34–.80 / arr .62–1.0) so the push runs THROUGH both dissolves. No gap on [0,1]; pin backstop never bleeds (incoming-only dissolve over opaque sky-backs). **Zero hard cuts.**

## 4. THE TWO DISSOLVES

**Dissolve A (dawn→mid, p~0.34–0.46) — near-seamless. PASS.** At p0.42 dawn holds opaque underneath, mid resolves in at op 0.80; by p0.55 mid is full. Because it's the same valley, the screenshots show the central twin spires holding dead-center across the handoff — the continuity lock is intact. Reads as the same place getting warmer and closer, exactly as intended. No seam, no luminance dip.

**Dissolve B (mid→arrival, p~0.66–0.80) — the one real leap. PASS, with a transient cosmetic tell (§6).** The cliff genuinely resolves IN through swelling haze (peaks 0.58 at p~0.73–0.77) rather than cutting; by p0.77 the fluted golden wall fills the frame cleanly and the leap has landed convincingly. Exposure rises monotonically through it (0.40→0.47, no dip) and warmth carries unbroken — Shamus's incoming-only fix did kill the indigo sag. **Finding:** in the early part of the window (p~0.65–0.72), while the arrival **sky plane** is partially faded in but the cliff wall hasn't yet risen to cover the upper frame, that plane's inpaint streaks are briefly perceptible as faint vertical raking in the upper third (most visible at p0.67, before haze peaks). It's ~1–2% of the scroll, partly masked by haze, and reads ambiguously as dust/light-rays — not a clear matte seam. Gone entirely by p0.77. See `extra-p67.png`, `extra-p73.png`.

## 5. SEPARATION QUALITY (2×-zoom edge crops — picky pass)

| Edge | Verdict | Note |
|---|---|---|
| Dawn — left mesa silhouette vs indigo sky (`z-dawn-mesa-edge.png`) | CLEAN | crisp feathered rock→sky, no halo, no fringe, no doubling |
| Mid — right butte face vs graded blue sky (`z-mid-rightbutte.png`) | CLEAN | believable hard sunlit-rock edge, no matte line |
| Arrival — cliff crest vs cool sky sliver, diagonal mask (`z2-arr-crest.png`) | CLEAN | trickiest (per-pixel diagonal); natural feather, no halo |
| Mid central spire vs sky (p42/p55 full) | CLEAN | dead-center continuity subject; crisp silhouette |
| Grade gradients (dawn sky, mid clouds) | CLEAN | smooth, no banding; whisper-grain present, static, no crawl |
| Dissolve-B transient (arrival sky plane, p65–72) | TELL (cosmetic) | faint vertical streaks during the fade; see §6 |

No matte halos, no doubling, no torn pixels on any settled (at-rest) plane edge. The at-rest art is production-clean; the only artifact lives inside the dissolve-B fade.

## 6. LIGHT ARC

Single monotonic exposure ramp: 0 → 0.05 → 0.16 → 0.23 → **0.34 → 0.42 (MID plateau)** → 0.66 → 1.0. Never dips, never jumps. MID held warm-but-LOW (no daytime luminance spike — screenshots confirm late-afternoon warmth, not noon). Gold accelerates after p0.74, full golden at p1 — arrival earns its warmth in the last ~25%. Grade rides cool-blue→warm-gold in lockstep, no banding. Sun travels x 50%→62%→70%, y 62%→40%→30% (each beat's sun visible only with its group); DAWN sunMax capped 0.34 (subtle pre-dawn glow — the §3 `left:17%` BLOCK is fixed, dawn sun parks at 50%), ARRIVAL blooms to 0.92 — bloom reserved for the golden landing. **dark→golden reads. PASS.**

### Cosmetic polish (does NOT gate the push)
- **Dissolve-B arrival-sky streak (§4):** worth a future pass. The arrival **sky** plane (`public/images/cinematic/arrival-sky.png`) carries faint vertical inpaint streaks (Dani's note: the wall reaches frame-top so there's no clean sky to seed; "hidden under the opaque wall anyway"). True at rest, but briefly exposed mid-dissolve. Cheapest fix: delay `ARRIVAL_SCENE.fadeIn` start ~p0.69 (so the wall is taller before the sky shows) OR nudge haze1 to peak ~3% earlier/denser over p0.66–0.70 to fully veil it. Either is a one-number tweak in `plates.ts` / `CinematicDesert.tsx`. Not a blocker — the live render reads as atmospheric dust.
- **Opening key (taste call, not a drift):** p0 reads as deep cool *dim* rather than near-silhouette; foreground scrub stays legible. Lockfile says "silhouettes only / lum 0.160." It's genuinely beautiful and unmistakably blue-hour; if Sky wants it darker, sink the exposure floor's first knot. Left as-is — it is not a drift-list violation and the vista negative space is preserved.

## 7. TITLE / FULL-BLEED / SCOPING / MOBILE

- **Title:** carves p0.84→0.95 (op 0→1), HOLDS to p=1; centered (cx=720 = ½·1440); Cormorant Garamond, bone-white `#FFF6EC`, layered shadow carries legibility over the golden flutes. Reads "SkyPi Studio". Settles, never pops. (Code carves at 0.84 vs the lockfile's *named* 0.80 — later, not earlier, so it cannot trip the "arrives early" drift; cosmetic doc-number reconcile only, flagged by Guard too.)
- **Full-bleed:** pin measured `position:fixed`, left:0, width:1440 at every keyframe — no sidebar peek through the entire descent. Scene visible at all 8 points (no blank frame).
- **/work route:** `.cdesert-*` does NOT mount (`hasCdesert:false`); sidebar NAV present (left:0, w:280, h:900). Full-bleed is correctly homepage-scoped. (`work-route.png`)
- **Mobile 375×812:** `StaticDesertFrame` renders (`hasStatic:true`, `hasAnimatedStage:false`) — the golden arrival cliff + resolved centered title, full-bleed, no 680vh scroll-hijack. The destination shot; nothing missing. (`mobile-static.png`)

## 8. VERDICT — **SHIP**

It reads as a continuous, breathtaking descent — not slides. Real parallax through all three beats, both dissolves smooth (A near-seamless, B sells the leap through haze), dark→cool→golden light arc lands, title carves + holds centered + legible, full-bleed the whole way, scene never blank, zero console errors, all gates green, mobile golden-arrival fallback correct, route-scoping correct. One cosmetic tell (transient arrival-sky streaks during the p65–72 part of dissolve B) is worth a one-number polish but does not gate production — it's brief, haze-veiled, and reads as dust. Holds Sky's bar.

— Peter (Performance Engineer), last gate before production.

---

## Post-optimization re-verify (2026-06-01, Peter)

**Branch:** `feat/cinematic-desert-2.5d` · **HEAD:** `8d99c53` (`perf(cinematic): AVIF/WebP hero planes + arrival-sky streak fix`, on top of `12f6ea9` fadeIn 0.66→0.70). main untouched (`cebeb7e`), nothing pushed.
**Method:** same rig — self-launched system Chrome `--headless=new` on CDP 9333 (own profile), pure-Node WS driver, `__cdesert.freeze(p)`. Re-shot the SAME keyframes as the SHIP run and **pixel-diffed each optimized AVIF frame against the prior SHIP PNG** in `/tmp/peter-3beat/` (per-channel mean-abs-diff overall + upper-third "streak zone" + a detrended per-column-stdev vertical-streak metric). Plus an independent network/format capture. New artifacts in `/tmp/peter-optimized/` (14 PNGs + `diff.json` + `netcheck.json`).
**Chrome-148 note:** the newer build rejects the DevTools WS unless launched with `--remote-allow-origins=*` (403 otherwise) — added to the launch flags; rig otherwise unchanged.

### Bundle: before → after
| | SHIP (PNG) | Optimized (AVIF+WebP) | Δ |
|---|---|---|---|
| 9 shipped planes (`public/images/cinematic/`) | ~67–69 MB PNG | **4.15 MB** (9 AVIF 2.07 MB + 9 WebP 2.07 MB) | **~94% lighter** |
| `out/images/cinematic/` | ~69 MB, PNG | **4.5 MB** — 0 PNG, 9 AVIF + 9 WebP | — |
| whole `out/` | ~73 MB | **8.1 MB** | — |
| eager (DAWN) weight | — | **dawn AVIF ≈ 0.59 MB** (sky 23 KB + mid 223 KB + fg 331 KB) | under ~3 MB eager target |
PNG masters relocated to `cinematic-masters/` (outside `public/`); `find out -path '*cinematic-masters*'` → 0, no source/master leak into the export.

### Gates (all clean on `8d99c53`)
- `npm run typecheck` → exit 0.
- `npm test` → **110 passed | 1 todo** (17 files).
- `npm run build` → prebuild `validate-assets` **PASS** ("all 9 cinematic real plate (AVIF+WebP)"), static export 3/3. (Note: validate-assets now enforces both `<id>.avif` AND `<id>.webp` for all 9.)

### Format served (independent capture, `netcheck.json`)
All 9 planes fetched `.avif`, HTTP 200, MIME `image/avif`; **0 WebP/PNG requested** (fallback never fires on a modern browser). Decoded natural widths match the per-magnification right-sizing: sky **nw=2048**, mid/cliff **nw=2880**, fg **nw=3360**. Lazy/eager unchanged (DAWN eager, MID/ARRIVAL lazy).

### Visual identity vs SHIP (pixel-diff, `diff.json`)
At-rest + transition frames OUTSIDE the dissolve-B window are **imperceptibly identical** — overall mean-abs-diff **0.8–1.7 / 255** (p00 0.82, p15 0.90, p30 1.05, p42 1.25, p55 1.64, p64 1.66). The AVIF banding worst-case (dawn/mid/arrival **sky gradients**) shows **no banding**: upper-third detrended column-stdev is identical opt-vs-prior (p15 0.301 vs 0.304; p64 2.344 vs 2.388) — AVIF added no vertical blocking. Feathered edges (mesa skyline, cliff crest, fg cutoff) decode clean; the golden arrival hold (p100, the money shot — finest cliff-flute detail) diffs 2.5/255, title crisp. **No AVIF artifact found at any keyframe.**

The only large diffs are at **p70 / p73** (overall 10.8 / 12.4; upper-third 16.9 / 20.1) — and they are the **streak fix landing, not a regression**: at those p-values the SHIP build had the streaky arrival-sky already faded in mid-dissolve, whereas the optimized build (a) holds the arrival group hidden until 0.70 (telemetry: arrival-cliff op=0.012 @ p0.70 vs SHIP ~0.3+) and (b) ships a rebuilt streak-free sky. By p77 the arrival fully resolves and the frame **reconverges** (diff drops to 3.8/255).

### Streak — GONE ✅
Side-by-side upper-third inspection at p64 / p67 / p70 (`desktop-*.png` vs SHIP `extra-*.png`):
- **p67** (mid old-streak-window): SHIP shows faint vertical inpaint streaks raining down the upper sky; **optimized is a clean smooth gradient** — streaks absent, composition (mesas, spires, dunes, palette, golden tone) otherwise identical.
- **p70**: SHIP shows pronounced vertical streaks across the upper two-thirds (streaky arrival-sky mid-fade); **optimized still shows the clean MID vista** (arrival not yet visible) — zero streaks.
Both mechanisms (timing delay 0.66→0.70 + source-art rebuild) are present and complementary. The cosmetic tell flagged in §6 is **eliminated**.

### Sanity (unchanged from SHIP)
Continuous descent, both dissolves smooth (A near-seamless via central-spire lock, B sells the leap through haze), monotonic dark→cool→golden light arc (expose 0→1, gradeMix 0→1, arrival bloom →0.92), title carves p0.85→1.0 and HOLDS centered (cx=720) + legible, full-bleed (pin `position:fixed`, left:0, w:1440 every frame), scene never blank. **0 console errors** across desktop + netcheck + mobile + work passes.
- **Mobile 375×812:** `StaticDesertFrame` golden-arrival cliff + resolved centered title, full-bleed, AVIF, no scroll-hijack. (`mobile-static.png`)
- **/work route:** cinematic does NOT mount; left NAV rail intact (left:0, w:280, h:900). (`work-route.png`)

### Verdict — **SHIP**
Bundle is production-light (~73 MB → 8.1 MB out/; planes ~94% lighter; eager DAWN ~0.59 MB). Visuals are pixel-identical to the locked SHIP build everywhere except the dissolve-B window, where the change is the *removal* of the arrival-sky streak — confirmed gone. No AVIF banding or edge artifacts. All gates green, AVIF served at right widths, mobile + route-scoping correct, zero console errors. **Cleared for Gary to push to skypistudio.com.** Artifacts: `/tmp/peter-optimized/`.

— Peter (Performance Engineer), final gate — optimization re-verify.
