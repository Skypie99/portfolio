# Cinematic hero — depth plates (drop folder)

Drop the 6 AI-generated desert plates here. Filenames are **exact** — the build's
`scripts/validate-assets.mjs` will fail loudly if any are missing, and the engine
references them by these names.

| File | What | Background | Notes |
|------|------|------------|-------|
| `sky-dawn.png` | Pre-dawn sky (indigo→plum→rose, last stars) | full-frame, **no alpha** | cool grade |
| `sky-day.png` | Golden-morning sky (cerulean→pale gold) | full-frame, **no alpha** | same horizon line as dawn so they crossfade |
| `far-ridge.png` | Distant hazy ridge silhouette | **transparent** | low detail |
| `mid-mesa.png` | Mid-distance stratified butte | **transparent** | warm side-lit |
| `near-rockface.png` | Near cliff face — the *arrival* subject | **transparent** | most detail, fluting + lit lower band |
| `foreground.png` | Near desert floor + scrub silhouettes | **transparent** | darkest tonal value |

## Specs
- **Width ≥ 2560px** (plates scale up to ~2.4× during the push — they must not run out of pixels).
- **21:9** aspect for generation; the engine crops to viewport.
- Plates 3–6: background removed → **transparent PNG** (remove.bg / Photoshop *Select Subject*).
- **Same low sun angle (raking from frame left)** across all terrain layers so they composite coherently.
- Source PNGs go here as-is; AVIF/WebP encoding happens in the build (a finishing step).

## Why isolated layers (not one sliced photo)
Each plate is a *complete* element on its own. Stacked, every back layer is whole
behind the nearer ones — so the parallax push never reveals gaps. (Slicing one flat
photo into depth bands leaves holes that need inpainting. We avoid that by construction.)

See the full prompt pack + engine plan in the approved plan file.
