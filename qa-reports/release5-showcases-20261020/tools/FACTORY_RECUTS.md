# Detail crops for the capture factory

Release 5 cut its detail exhibits from the shipped captures (1290 or 1600 px wide) because the
2880×1800 masters live only in the owner's gitignored bank. The table maps every box to master
space (×2.232 for the 1290-wide desktop hero captures, ×1.8 for the 1600-wide desktop shots) so the
factory can re-cut the same regions at full resolution and overwrite the same output file names;
`lib/caseShowcase.ts` then needs no change. Phone captures are already native and need no re-cut.

A `captureRegion` scene per row in `scripts/showcase/registry.mjs` (the P2 mechanism) would let the
factory bank them with hashes; the manifest rows would then supply the dates these exhibits print.

| Output | Source capture | Box in the shipped file (left, top, width, height) | Same box in the 2880-wide master |
|---|---|---|---|
| `prompt-library/r5-prompt-open.{light,dark}` | `showcase/prompt-library/prompt-detail.{light,dark}.desktop.webp` (1600×1000 shipped) | [288, 228, 1024, 544] | [518, 410, 1843, 979] |
| `prompt-library/r5-prompt-variables.{light,dark}` | `showcase/prompt-library/prompt-detail.{light,dark}.desktop.webp` (1600×1000 shipped) | [792, 372, 520, 400] | [1426, 670, 936, 720] |
| `prompt-library/r5-featured-card.{light,dark}` | `showcase/prompt-library/home.{light,dark}.desktop.webp` (1290×806 shipped) | [760, 222, 330, 206] | [1697, 496, 737, 460] |
| `claude-corp/r5-pipeline.{light,dark}` | `showcase/claude-corp/hero-pipeline.{light,dark}.desktop.webp` (1290×806 shipped) | [150, 488, 990, 298] | [335, 1089, 2210, 665] |
| `claude-corp/r5-team-phone.{light,dark}` | `showcase/claude-corp/team.{light,dark}.phone.webp` (780×1688 shipped) | [0, 120, 780, 1300] | phone files are native; no master re-cut needed |
| `dashboard/r5-disclosure.{light,dark}` | `showcase/dashboard/command-center.{light,dark}.desktop.webp` (1290×806 shipped) | [200, 0, 1090, 440] | [447, 0, 2433, 982] |
| `dashboard/r5-think-tank.{light,dark}` | `showcase/dashboard/think-tank.{light,dark}.desktop.webp` (1600×1000 shipped) | [248, 76, 1352, 754] | [446, 137, 2434, 1357] |
| `dashboard/r5-dispatch.{light,dark}` | `showcase/dashboard/dispatch.{light,dark}.desktop.webp` (1600×1000 shipped) | [240, 60, 1360, 775] | [432, 108, 2448, 1395] |
| `dashboard/r5-think-tank-phone.{light,dark}` | `showcase/dashboard/think-tank.{light,dark}.phone.webp` (780×1688 shipped) | [0, 720, 780, 820] | phone files are native; no master re-cut needed |
| `dashboard/r5-dispatch-phone.{light,dark}` | `showcase/dashboard/dispatch.{light,dark}.phone.webp` (780×1688 shipped) | [0, 120, 780, 1300] | phone files are native; no master re-cut needed |
