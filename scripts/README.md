# scripts/

What each script is for, how it runs, and whether it is part of the current
workflow. Run everything from the repository root. Scripts that need
`node_modules` (sharp, ffmpeg-static, playwright-core, esbuild) assume `npm ci`
has been run; none of them installs anything.

| Label | Meaning |
|---|---|
| `ACTIVE_BUILD` | Runs automatically on every `npm run build`, so CI and Deploy run it too. |
| `ACTIVE_QA` | Run by hand to check a build. Not wired into CI. |
| `ACTIVE_MAINTENANCE` | Repository upkeep, run by hand. |
| `MEDIA_PIPELINE` | Produces or wires project media, run by hand. |
| `REGENERATION` | Rebuilds the protected cinematic scene's masters and planes. Owner-approved runs only. |
| `MIGRATION` | One-time data move. |
| `UNKNOWN` | Kept, but its current use is unproven. |

## Build hooks and upkeep

| Script | Label | How it runs | What it does |
|---|---|---|---|
| `validate-assets.mjs` | `ACTIVE_BUILD` | `prebuild`; also `npm run validate:assets` | Fails the build if a certificate badge, a deliverable's declared proof file, a blog figure, or a cinematic plane is missing from `public/`. |
| `prune-500.mjs` | `ACTIVE_BUILD` | `postbuild` | Removes the unreachable pages-router `/500` from `out/`. Never touches the `/404` pair GitHub Pages serves. |
| `og-png-alias.mjs` | `ACTIVE_BUILD` | `postbuild` | Copies each generated share card to a byte-identical `.png` path, so GitHub Pages serves it as an image. |
| `generate-qa-index.mjs` | `ACTIVE_MAINTENANCE` | `npm run qa:index`; `npm run qa:index:check` | Regenerates `qa-reports/INDEX.md` from tracked files. Check mode writes nothing and exits 1 on drift. |
| `overflow-census.mjs` | `ACTIVE_QA` (owner machine only) | `npm run build`, then `npm run check:overflow` (optionally `-- --widths 320,375,414`) | Element-level horizontal-overflow census of every built route in both themes, with a non-vacuity probe. See the known limits below. |

`overflow-census.mjs` known limits: it serves `out/` with
`design-reviews/showcase-refresh/tools/static-serve.mjs`, which is not tracked,
so it cannot run from a fresh clone; and it looks for Chromium only in the macOS
Playwright cache (`~/Library/Caches/ms-playwright`).

## Media pipeline

The capture factory and its companions. Full runbook, including how to point it
at project checkouts on another machine: [`docs/showcase-factory.md`](../docs/showcase-factory.md).

| Script | Label | How it runs | What it does |
|---|---|---|---|
| `capture-showcase.mjs` with `showcase/registry.mjs`, `driver.mjs`, `servers.mjs`, `worktree.mjs`, `media.mjs`, `manifest.mjs` | `MEDIA_PIPELINE` | `node scripts/capture-showcase.mjs [--dry] [--project <slug>] …` | Builds or serves each project at its pinned SHA (the Dashboard is captured from its live public demo), photographs its scenes in both themes, encodes through the budget-guarded encoders, and banks `content/showcase.manifest.json`. Guest-only and read-only on every app: it refuses mutating controls, aborts non-GET Supabase requests, and allows at most one Nominatim request per run. |
| `wire-showcase.mjs` with `showcase/wiring.mjs` | `MEDIA_PIPELINE` | `node scripts/wire-showcase.mjs scripts/showcase/wiring.mjs [--dry]` | Writes captured media into `content/deliverables.json`, validating each entry against the schema. |
| `og-cards.mjs` | `MEDIA_PIPELINE` | `node scripts/og-cards.mjs [--project <slug>]` | Cuts the 1200×630 `og-card.jpg` for each project from the factory's dark masters, which live in the gitignored bank. |
| `encode-proof.mjs` | `MEDIA_PIPELINE` | `node scripts/encode-proof.mjs <slug> <master> [--kind hero\|shot\|card] [--dry] [--json]` | Master screenshot to AVIF, WebP, and an inline LQIP, under a hard size budget. The capture factory calls it too. |
| `encode-video.mjs` | `MEDIA_PIPELINE` | `node scripts/encode-video.mjs <slug> <master> [--dry] [--json] …` | Screen recording to MP4, WebM, and a poster. Over-budget output is written to an evidence directory, never to `public/`. |

## Cinematic regeneration

The opening scene is protected; these rebuild its tracked masters in
`cinematic-masters/` and the shipped planes in `public/images/cinematic/`. The
usual chain is `separate-scene.mjs`, then `fix-arrival-sky.mjs` and
`build-arrival-cliff.mjs` for the arrival scene, then `encode-planes.mjs` and
`encode-planes-mobile.mjs`.

| Script | Label | What it does |
|---|---|---|
| `separate-scene.mjs` | `REGENERATION` | Splits a source vista (`cinematic-masters/source/`) into depth planes (`cinematic-masters/planes/`). |
| `fix-arrival-sky.mjs` | `REGENERATION` | Rebuilds `planes/arrival-sky.png` as a streak-free gradient. |
| `build-arrival-cliff.mjs` | `REGENERATION` | Cuts `source/arrival-cliff-newest.png` into `planes/arrival-cliff.png` with a halo-free crest. |
| `encode-planes.mjs` | `REGENERATION` | Encodes the planes to AVIF and WebP under `public/images/cinematic/`. |
| `encode-planes-mobile.mjs` | `REGENERATION` | Adds a half-resolution mobile tier for the four live planes. |

## One-time and unknown

| Script | Label | What it does |
|---|---|---|
| `archive/extract-seed.mjs` | `MIGRATION` | Extracts the Studio Archive prototype's seed data to `scripts/archive/out/seed-legacy.json` (gitignored: personal data) for a one-time import. Source: `ARCHIVE_PROTOTYPE`, default `~/Downloads/studio_archive.html`. |
| `verify-intro-focus.cjs` | `UNKNOWN` | See below. |

### `verify-intro-focus.cjs`: status unknown

Added on 2026-09-07 with commit `7ce2467` ("fix(a11y): keep covered intro chrome
out of focus"). Nothing references it: no package script, workflow, document,
or tracked output. Whether it is still part of anyone's routine is unproven, so
it is kept and labelled rather than retired.

What its source shows: it drives headless Chromium against a local server only
(non-localhost URLs are refused, and every external request is blocked). It
checks the homepage intro's focus order (the skip link first, an inert desktop
rail, Skip Intro as the second visible stop, no covered focus), the Skip Intro
bypass by keyboard and pointer, and hero and work anchor landings with
back, forward, and reload scroll restoration. It covers light and dark themes,
reduced and full motion, and the 767, 768, and 769 px shell widths.

```bash
npm run build   # then serve out/ on a local port
node scripts/verify-intro-focus.cjs --url http://127.0.0.1:<port>/ --out <dir> \
  [--label <name>] [--source <sha>] [--quick | --history-only]
```

It writes `<dir>/evidence.json` and exits 0 when there are no failures, 1 when
there are, and 2 on a usage or runtime error. `--quick` runs only the two
desktop reduced-motion scenarios; `--history-only` runs one history journey. Its
default Chromium path is the macOS arm64 Playwright cache; set
`PLAYWRIGHT_CHROMIUM_EXECUTABLE` on other machines.
