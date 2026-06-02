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
