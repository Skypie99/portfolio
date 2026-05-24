# Sharp WebP Prebuild Pipeline — Plan

**Author:** Peter (Performance Engineer)
**Cycle:** 13 of cycle/auto-2026-05-23 (UI/QA 15-loop run)
**Status:** PROPOSED — do not ship until Sky provides real images
**Reads from:** `2026-05-23_Peter_C4-6_perf.md` §4 (queued image pipeline)

---

## TL;DR

When Sky drops real editorial photographs into `public/images/deliverables/<slug>/` and `public/images/certificates/<slug>/`, a `scripts/build-images.mjs` prebuild step will:

1. Read each `*.{jpg,jpeg,png}` source file.
2. Emit `.webp` at 1× and 2× density (e.g. `hero.webp`, `hero@2x.webp`).
3. Update the content JSON files with the WebP paths + intrinsic dimensions.
4. The JSX swaps `<img>` for `<picture>` with explicit `srcset` and `sizes`.

The script runs during `npm run build` via the `prebuild` lifecycle hook. Local dev (`npm run dev`) still serves the original JPGs — no work done unless explicitly invoked.

**Why ship this only when real images land:** the current placeholders are cream blocks with overlaid typography (the `.webp` files don't exist on disk at all — the `<img src=>` 404s and the fallback `<span>` shows through). Running a sharp pipeline against nothing produces nothing. Wait for real photos.

---

## 1. File layout (target state)

```
public/images/
├── deliverables/
│   ├── accessmap/
│   │   ├── hero.jpg          ← Sky's source (any reasonable format)
│   │   ├── hero.webp         ← generated, 1× (~800w)
│   │   ├── hero@2x.webp      ← generated, 2× (~1600w)
│   │   └── gallery-1.jpg     ← optional gallery images
│   │   └── gallery-1.webp    ← generated
│   │   └── gallery-1@2x.webp ← generated
│   ├── claude-corp/
│   │   └── ...
│   └── ...
└── certificates/
    ├── anthropic-claude-engineer-2025/
    │   ├── badge.png         ← Sky's source (PNG retained for transparency)
    │   ├── badge.webp        ← generated, 1× (~400w)
    │   └── badge@2x.webp     ← generated, 2× (~800w)
    └── ...
```

Sources stay in the repo (small payload, ~5 MB total expected) so the WebP outputs can be regenerated deterministically from any commit.

---

## 2. The script — `scripts/build-images.mjs`

Roughly 80 lines of node. Outline:

```js
import sharp from 'sharp';
import { readdir, stat } from 'node:fs/promises';
import { join, parse, dirname } from 'node:path';

const ROOT = 'public/images';
const TARGETS = [
  { dir: 'deliverables', maxWidth: 1600, format: 'jpg', skipExt: ['webp'] },
  { dir: 'certificates', maxWidth: 800,  format: 'png', skipExt: ['webp'] },
];

async function walk(rootDir) {
  // recursive directory walk, yield file paths
}

async function processOne(srcPath, maxWidth) {
  const { dir, name } = parse(srcPath);
  const at1x = join(dir, `${name}.webp`);
  const at2x = join(dir, `${name}@2x.webp`);

  await sharp(srcPath)
    .resize({ width: Math.floor(maxWidth / 2), withoutEnlargement: true })
    .webp({ quality: 82, effort: 5 })
    .toFile(at1x);

  await sharp(srcPath)
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality: 82, effort: 5 })
    .toFile(at2x);

  // Report the intrinsic dimensions for the content JSON update.
  const meta = await sharp(srcPath).metadata();
  return { src1x: at1x, src2x: at2x, intrinsic: { width: meta.width, height: meta.height } };
}

async function main() {
  for (const target of TARGETS) {
    const root = join(ROOT, target.dir);
    for await (const file of walk(root)) {
      if (!file.endsWith(`.${target.format}`)) continue;
      await processOne(file, target.maxWidth);
      console.log(`  ✓ ${file} → .webp + @2x.webp`);
    }
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
```

**Quality choices:**
- `quality: 82` is the empirical sweet spot for editorial photography on WebP — visually lossless vs JPG quality 95, ~35% smaller bytes.
- `effort: 5` (out of 6) costs ~3× the time of effort 1 for ~8% smaller bytes. Worth it at build time.
- `withoutEnlargement: true` — if a source is smaller than the target width, don't upscale.

**Determinism:** sharp encodes deterministically given the same input + same options, so committed WebP files won't churn across machines unless the source changes.

---

## 3. npm script integration

`package.json`:

```json
{
  "scripts": {
    "prebuild": "node scripts/build-images.mjs",
    "build": "next build",
    "images:build": "node scripts/build-images.mjs",
    "images:clean": "find public/images -name '*.webp' -delete"
  }
}
```

`prebuild` runs automatically before every `npm run build` (npm lifecycle convention — no config needed).

`images:build` is a manual one-off for dev convenience.

`images:clean` lets Sky nuke generated outputs if a source changes substantially and stale `.webp` files should be regenerated from scratch.

---

## 4. JSX changes (deferred until script runs)

Today's `<img src={d.heroImage.src} ... width={800} height={600} />` becomes:

```tsx
<picture>
  <source
    type="image/webp"
    srcSet={`${baseWebp} 1x, ${baseWebp2x} 2x`}
    sizes="(min-width: 1120px) 540px, (min-width: 768px) 50vw, 100vw"
  />
  <img
    src={d.heroImage.src}        // JPG fallback for ancient browsers
    alt={d.heroImage.alt}
    width={d.heroImage.width}    // from content JSON, no more hardcoded 800×600
    height={d.heroImage.height}
    loading="lazy"
    decoding="async"
    className="..."
  />
</picture>
```

The `sizes` value matches the responsive grid:
- ≥1120px (max-content): card is exactly 540px wide (the `max-w-[540px]` rule on summary)
- ≥768px (md): card is 50vw (2-column grid)
- <768px: card is 100vw (single column)

Browser uses `sizes` to pick the right `srcSet` density.

**Decoding hint:** `decoding="async"` lets the browser defer the WebP decode to after layout. Subtle win for LCP on the first card.

---

## 5. Content JSON migration

Each entry in `content/deliverables.json` already has a `heroImage` block:

```json
"heroImage": {
  "src": "/images/deliverables/accessmap/hero.jpg",
  "alt": "Warm-toned mockup..."
}
```

Migration adds three fields (script auto-populates from sharp metadata):

```json
"heroImage": {
  "src": "/images/deliverables/accessmap/hero.jpg",
  "alt": "Warm-toned mockup...",
  "srcWebp": "/images/deliverables/accessmap/hero.webp",
  "srcWebp2x": "/images/deliverables/accessmap/hero@2x.webp",
  "width": 1600,
  "height": 1200
}
```

The Zod schema in `lib/schema.ts` gains three optional fields:

```ts
heroImage: z.object({
  src: z.string(),
  alt: z.string(),
  srcWebp: z.string().optional(),
  srcWebp2x: z.string().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
}),
```

Optional so the JSON works whether or not the prebuild has run (e.g. fresh checkout before `npm run build`).

---

## 6. Performance expectations

Per Peter's C4-6 measurements: 5 deliverable hero JPGs at ~400 KB each ≈ 2 MB total. WebP at 82% quality typically cuts that 30–40%. Expected `out/` total drop: 1.9 MB → 1.4 MB.

For LCP specifically:
- Today: the placeholder `<img>` 404s, the cream fallback paints instantly, no LCP delay attributable to images.
- With real JPGs: LCP would be dominated by the hero image bytes (~400 KB).
- With WebP 1× at ~270 KB: LCP shaves ~130ms on a 4G connection (~2 Mbps), more on slower.
- With WebP @2x served only when needed (sizes-driven), retina screens get crisp without penalising mobile.

CLS stays at 0 — explicit width/height are already in place from Cycle 6.

---

## 7. Rollback

If the pipeline ever produces broken output:

1. `npm run images:clean` — deletes every generated `.webp`.
2. Revert the JSX change to plain `<img src={...}>`.
3. Site renders against the JPG fallbacks. No data loss; the originals are committed.

The pipeline writes ONLY to `public/images/**/*.webp` paths and never to JSON content. JSON updates are a separate (manual or scripted) step Sky reviews before commit.

---

## 8. Dependencies

```bash
npm install --save-dev sharp
```

`sharp` ships prebuilt binaries for Linux/Mac/Windows × x64/arm64. Install size ~70 MB (it's a wrapper around libvips). Only used at build time — zero runtime impact, zero bundle impact.

---

## 9. Open questions for Sky

1. **Image format for source files** — JPG for deliverables (lossy is fine for photos), PNG for cert badges (transparency matters)?
2. **Quality knob** — accept the default 82, or want to tune per image?
3. **Hold the generated WebP in git, or `.gitignore` them?** — Committing them makes CI reproducible without sharp; gitignoring them keeps the repo smaller. Peter recommends commit (small payload, deterministic builds).
4. **Manifest file?** — Should the script emit `public/images/manifest.json` listing every generated asset, so the CI can verify no orphans? Optional, recommend skip for v1.

---

## 10. DECISIONS FOR SKY

- **Do not ship this pipeline until real images exist.** Running it against nothing is a 200-line PR that adds zero value and a 70 MB devDep. Wait.
- **When real images arrive, ship the pipeline FIRST (this plan), THEN the JSX <picture> swap, THEN the JSON schema update.** Three small PRs, each verifiable in isolation. Don't bundle.

---

*Peter, 2026-05-23 — filed under cycle/auto-2026-05-23 Cycle 13 of the 15-loop run. Plan only; no code shipped.*
