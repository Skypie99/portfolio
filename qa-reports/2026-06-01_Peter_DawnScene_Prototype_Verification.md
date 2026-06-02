# Peter — Dawn-Vista Real-Scene Prototype Verification — 2026-06-01

Branch `feat/cinematic-desert-2.5d` @ `73ab49b` · `main` untouched (`cebeb7e`) · not pushed.
Method: production `npm run build` (clean), then `npm run dev` driven by self-launched system Chrome `--headless=new` over CDP (port 9333, Metal/ANGLE GPU, dpr 2). Desktop 1440×900 captured at 5 progress points across the pinned range; mobile 375×812 static frame. Screenshots + per-frame computed-style probes in `/tmp/peter-dawn/`.

## 1. DECISIONS FOR SKY
None blocking. This prototype ships as **CINEMATIC-AND-CLEAN with one polish note** (sky-fill horizon seam) and one known follow-up (2× source upscale). Both are Dani-tunable on-branch; neither needs a Sky decision to proceed. Detail in §6.

## 2. BLOCKERS / FAIL_FAST
None. Build clean, prod load had 0 console errors and 0 non-200 network responses (14/14 resources).

## 3. Summary
The pivot works. One cohesive Midjourney vista, separated into 3 depth planes (sky / mid / fg) and driven by the existing single scrubbed timeline, reads as a real 2.5D forward dolly into Monument Valley — not a flat zoom. The pre-dawn→sunrise lighting arc is genuinely beautiful and band-free. Plane **alpha edges are clean** (no halos, doubling, or torn pixels at the butte skylines or the foreground top edge). The one honest tell is a subtle **horizontal tonal "shelf" in the reconstructed sky backdrop**, visible only in the cool pre-dawn frames (p≈0–0.25) and fully masked by haze+bloom from p≈0.4 onward. Foreground goes soft at max push (2.4× on a 1680px source) — the flagged upscale is the real ship-quality follow-up.

## 4. VERDICT: CINEMATIC-AND-CLEAN
Ships as a cinematic prototype. Two polish items (sky seam, fg upscale) tighten it from "very good" to "flawless" — neither blocks.

## 5. Keyframe table (desktop 1440×900, pin geometry stageH 4500 / pinH 900 / travel 3600px — matches Dani's report exactly)

| p | scrollY | sky scale | mid scale | fg scale / Δy | expose=grade | sun op | title | Read |
|---|---|---|---|---|---|---|---|---|
| 0.00 | 0 | 1.040 | 1.000 | 1.150 / +72px | 0.00 | 0.00 | hidden, blur 8px | Deep cool pre-dawn. Indigo sky, buttes in silhouette. Seam visible. |
| 0.25 | 900 | 1.042 | 1.019 | 1.189 / +80px | 0.146 | 0.119 | hidden | Sky warming low; sun emerging. Seam still faintly visible. |
| 0.50 | 1800 | 1.070 | 1.300 | 1.775 / +207px | 0.500 | 0.475 | hidden | Sun bloom + haze swell. Valley warms. Seam masked. |
| 0.75 | 2700 | 1.098 | 1.581 | 2.361 / +334px | 0.854 | 0.831 | hidden | Buttes loom to frame edges; warm gold; deep into the dust. |
| 1.00 | 3600 | 1.100 | 1.600 | 2.400 / +342px | 1.00 | 0.90 | **resolved, blur 0** | "SkyPi Studio" crisp + held; sun crested over the valley. |

Differential scale is the proof of depth: at p=1 the **fg has grown 2.4× and dropped 342px** while the **sky grew only 1.1× and moved −9px**. That is true parallax, monotonic, scrub-smooth. Pin stayed locked at left:0 / top:0 / w:1440 every frame — **full-bleed, no sidebar, scene visible across the entire pin (no blank).**

## 6. Separation quality — per edge (the make-or-break for "real art")

- **Foreground top edge (near scrub → valley floor):** CLEAN. Seamless — you cannot locate where the fg plane ends and the mid plane begins. Generous feather reads as natural scrub. (`desktop_p000_fgEdge.png`) ✅
- **Butte skylines (mid → sky), left & right:** CLEAN. No halo, no chroma fringe, no doubling, no torn pixels along any butte silhouette. Slight natural edge softness only. (`desktop_p000_skyline_L.png`, `_R.png`) ✅
- **Reconstructed sky backdrop (the fill behind the buttes):** ⚠️ ONE TELL. A faint horizontal tonal **shelf** — a lighter dusty-mauve/pink band meeting the deeper indigo along a near-horizontal line at the skyline level. Reads *partly* as legitimate horizon glow (the source has a warm horizon band there), but the boundary is slightly too uniform/flat-topped across the full width to fully pass as natural haze in the open-sky gaps. It is **subtle, not a hard cut**, and only legible at p≈0–0.25; haze+sun bloom hide it from p≈0.4→1. (`desktop_p000_seam.png`, `desktop_p025_seam.png`)
  - **Source:** the sky-fill cross-fade junction in `dawn-sky.png` (visible even in the raw plane — the lower half carries a mauve band with faint vertical column residue). Engine/transform are not at fault; this is purely the reconstructed-backdrop asset.
  - **Fix (Dani, on-branch, no Sky decision):** widen/feather the fill-junction cross-fade band in the separation pass, or add a touch of low-amplitude vertical noise to break the flat top so it reads as atmosphere. Alternatively nudge `transform-origin`/sky `object-position` so the junction sits lower (below where open-sky gaps expose it). Cheapest: accept it — at speed, with grain, it's barely perceptible.
- **Foreground at max push (p=1, 2.4×):** SOFT. Near scrub/rock loses crispness (effective ~700px of source detail stretched full-frame). Acceptable for shadowed dawn scrub under grain, but it's the softest point in the sequence. (`desktop_p100_fg.png`) — the **2× source upscale (→3360×1440) Dani flagged is the right ship-quality follow-up.**

## 7. Lighting arc
Convincing and **continuous — no banding/step** in the exposure ramp (`--cdesert-expose` 0→1 sine.inOut, verified monotonic at every keyframe). p=0 reads true deep/cool pre-dawn; the sun glow rises from the horizon, warms, and blooms low-center so the **valley genuinely reads as the sun cresting over it** by p=1 — not a recolored midday. The `overlay`-blend exposure layer never blows out; warm at p=1 is rich, not contrasty. This is the most "expensive"-looking part of the scene.

## 8. Title / full-bleed / visibility / console
- **Title:** resolves crisp (blur0, opacity1 at p=1, probed) and HOLDS to end; dark halation lifts the serif off the bright glow — comfortably legible. ✅
- **Full-bleed:** pin at x=0/w=1440 the entire descent; no sidebar peek. ✅
- **Visibility:** scene fills the pin at all 5 keyframes; no blank/letterbox. ✅
- **Console:** prod load = **0 errors, 0 non-200** (14/14). A single transient 404 seen once under `next dev` did not reproduce on clean capture and never appears in the dev route log (only `GET / 200`) — a dev-server/favicon artifact, NOT a missing scene asset. ✅

## 9. Mobile (375×812)
StaticDesertFrame renders correctly: probe confirms `hasStatic:true / hasPin:false`, static box 375×812 at 0,0 — **full-bleed, no pin, no GSAP**. Holds the resolved **warm sunrise** state (`expose/grade/sun = 1`) with the **title visible** (`opacity:1, filter:none`). 0 console errors. Honest note: at 21:9→portrait cover-crop the buttes reduce to a faint silhouette and the centered title sits over the brightest glow band — the lowest-contrast spot in the whole experience; the text-shadow carries it. Acceptable. (`mobile_p000.png`)

## 10. Build / bundle
`npm run build` clean: 15 static pages exported, home route **197 kB First Load JS** (50.3 kB page). Prebuild asset gate passed (would fail if any of the 3 dawn planes were missing). No errors; only the expected `headers not applied on export` warning.

---
Artifacts: `/tmp/peter-dawn/` — `desktop_p000…p100.png`, edge/seam crops, `mobile_p000.png`, `desktop_probes.json`, `mobile_probes.json`.
