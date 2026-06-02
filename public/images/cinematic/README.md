# Cinematic hero — depth planes

The 3-beat descent (DAWN → MID → ARRIVAL) is driven by **9 depth planes**, 3 per
beat, separated from 3 whole Midjourney vistas. The engine references them by the
ids in `components/cinematic/plates.ts`; the build's `scripts/validate-assets.mjs`
fails loudly if any shipped variant is missing.

## What ships: AVIF + WebP (not PNG)

Each plane ships as **`<id>.avif`** (primary) **and `<id>.webp`** (fallback).
`components/cinematic/Layer.tsx` renders a `<picture>` that serves AVIF, falls
back to WebP, and uses the WebP as the `<img>` src — between them they cover
~all 2026 browsers, with alpha intact. The heavy source PNGs are **not shipped**.

| Plane (×3 beats) | What | Alpha | Shipped width |
|---|---|---|---|
| `<beat>-sky`  | sky backdrop (opaque gradient) | no  | 2048px |
| `<beat>-mid` / `arrival-cliff` | buttes / valley / the fluted wall | yes | 2880px |
| `<beat>-fg`   | near rocks / talus / scrub | yes | 3360px |

Right-sizing follows each plane's max on-screen magnification — the sky barely
scales (≤1.12×) so it ships smallest; the fg magnifies most (≤2.6×) so it keeps
full width. Together the 9 planes ship at **~4.2 MB** of AVIF+WebP, down from
**~67 MB** of PNG (~94% lighter). Eager DAWN beat ≈ 1.2 MB.

## The pipeline (regenerable, two steps)

```
# 1. separate a source vista into 3 lossless PNG masters
node scripts/separate-scene.mjs \
  --src cinematic-masters/source/<vista>.png \
  --out cinematic-masters/planes \
  --scene <beat> --layout vista|cliff --horizon <0..1> --fg <0..1>

# 2. encode the 9 masters → AVIF + WebP into the shipped dir (public/)
node scripts/encode-planes.mjs
```

- **Lossless PNG masters** live in `cinematic-masters/` — OUTSIDE `public/`, so the
  static export never copies them into `out/`. `cinematic-masters/source/` holds the
  3 vistas; `cinematic-masters/planes/` holds the 9 separated masters. They're
  retained (version-controlled) so the AVIF/WebP can be re-encoded without
  re-separating, but they never ship.
- `arrival-sky` is additionally run through `scripts/fix-arrival-sky.mjs`, which
  rebuilds it as a clean streak-free gradient (the cliff-layout inpaint left faint
  vertical streaks in the upper third that peeked through during the arrival
  fade-in). It's a pure gradient backdrop, so this changes nothing visible — it
  just removes the streaks.

## Why separated planes (not one sliced photo)

Each plane is a *complete* element on its own. Stacked, every back layer is whole
behind the nearer ones — so the parallax push never reveals gaps. (Slicing one
flat photo into depth bands leaves holes that need inpainting; we avoid most of
that by construction.)

Authority for the look: `designs/AESTHETIC_LOCKFILE.md`.
