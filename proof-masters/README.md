# proof-masters/ — raw proof-media masters (never shipped)

Drop raw, full-resolution proof media here, organized by deliverable slug:

```
proof-masters/
  accessmap/screen-map.png        # a device screenshot (PNG/JPG)
  ghost-code/round.mov            # a screen-recording (MOV/MP4/WebM)
  ...
```

Then encode the shipped siblings into `public/images/deliverables/<slug>/`:

```bash
# still → AVIF + WebP + LQIP (prints the lqip data-URI to paste into deliverables.json)
node scripts/encode-proof.mjs <slug> proof-masters/<slug>/<file>.png --kind hero|shot|card --json

# screen-video → MP4 + WebM + poster (extracted frame, run through the still pipeline)
node scripts/encode-video.mjs <slug> proof-masters/<slug>/<file>.mov --name <name>
```

**Everything in this directory is git-ignored** (except this README and `.gitkeep`).
Masters are heavy; only their optimized, budget-checked siblings in `public/`
ship. See `design-reviews/uplift/assets/p2a/README-p2a.md` for the full shot list
and the per-slug asset→slot mapping.
