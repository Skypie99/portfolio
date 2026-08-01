# The capture factory — refreshing every project's imagery

One command re-photographs every project at its current SHA, both themes,
re-encodes through the budget-guarded pipeline, and re-banks the manifest.
Stable filenames overwrite in place — re-runs replace, never accumulate.

```bash
node scripts/capture-showcase.mjs
```

Useful forms:

```bash
node scripts/capture-showcase.mjs --dry                       # print the job plan, touch nothing
node scripts/capture-showcase.mjs --project accessmap         # one project
node scripts/capture-showcase.mjs --project accessmap --scene map-overview
node scripts/capture-showcase.mjs --resume                    # reuse existing masters, re-encode + re-bank
node scripts/capture-showcase.mjs --verify                    # run 2 → determinism diff + receipt
node scripts/og-cards.mjs                                     # re-cut the dark 1200×630 unfurl JPGs
node scripts/wire-showcase.mjs scripts/showcase/wiring.mjs    # manifest → deliverables.json (refreshes LQIPs)
```

After a re-capture: run `og-cards.mjs`, then `wire-showcase.mjs` (refreshes
inline LQIPs), then the normal gates (`npm run typecheck && npm test &&
npm run build`). Nothing else — paths in deliverables.json are stable.

## Where things live

- **Config as data**: `scripts/showcase/registry.mjs` — every project's repo,
  capture SHA policy, build/serve route, exact theme-driving recipe, scene
  list with alt drafts, clip specs, budgets, safety fences.
- **Manifest (tracked)**: `content/showcase.manifest.json` — date + SHA +
  branch + alt + hashes per capture; `budget` + `determinismProof` blocks.
- **Masters (never committed)**: `design-reviews/showcase-refresh/masters/`
  (gitignored); receipts + gate frames beside them under `receipts/`.
- **Shipped assets**: `public/showcase/<slug>/…` — avif+webp pairs per theme,
  `clips/*.{mp4,webm}` + posters, `og-card.jpg`.

## Ground rules baked into the engine

- Theme is SET, never hoped for: colorScheme emulation + per-project
  localStorage/attribute seeds (see each registry entry).
- Guest-only, read-only: the driver refuses terminal mutating controls
  (submit/vote/sign-in regex) and aborts non-GET Supabase calls; ≤1 Nominatim
  request per run.
- Dirty or mid-train repos build from disposable worktrees (node_modules
  arrives as an APFS clonefile copy — Metro resolves by realpath, symlinks
  break it); `.env` is copied byte-for-byte, chmod 600, removed at teardown.
- Never `expo start --web` for AccessMap — `expo export` is the lucide-safe
  route. Never a non-demo Dashboard build (it reads private state); the
  factory captures the live public demo instead.
- Budgets are hard: stills ≤150 KB AVIF (whale guard exits non-zero), clips
  ≤800 KB mp4 target / 3 MB rail, `public/showcase` ≤8 MB target / 10 MB cap.
  Over-budget output lands in evidence, never in the shipped tree.
