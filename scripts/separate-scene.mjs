/**
 * separate-scene.mjs — split one cohesive desert vista into 2.5D depth planes.
 *
 * ── WHY ─────────────────────────────────────────────────────────────────────
 * The cinematic engine (components/cinematic/*) dollies a back→front stack of
 * transparent PNG "planes" on one GSAP timeline. Sky generates whole Midjourney
 * vistas; this script separates each into the small plane stack the engine
 * drives, so the art is photographic (one real scene) instead of six pasted
 * plates. Committed + reusable + parameterized so every beat (dawn / mid /
 * arrival) is produced the same way and can be re-run if a source is re-rendered.
 *
 * ── THE PLANES ──────────────────────────────────────────────────────────────
 * Two layouts, selected by --layout:
 *
 *   vista  (dawn, mid — wide valleys):
 *     {scene}-sky  opaque backdrop. Sky kept as-is; the LAND below the skyline
 *                  is over-painted with a vertical gradient seeded from a clean
 *                  above-skyline row, so when the mid plane scales up nothing of
 *                  the real buttes shows through the gaps. No transparency.
 *     {scene}-mid  buttes + spires + valley floor. Transparent ABOVE the skyline
 *                  (feathered ~2px), opaque below. Composites over -sky.
 *     {scene}-fg   foreground rocks/scrub. Opaque from the foreground cutoff
 *                  down, feathered transparent above it. Races past the camera.
 *
 *   cliff  (arrival — close wall):
 *     {scene}-sky  the thin sky sliver at top, EXTENDED downward by a gradient
 *                  so it fully backs the wall (opaque).
 *     {scene}-cliff the wall itself — transparent only in the sky sliver region
 *                  (feathered), opaque everywhere else (the wall is dominant).
 *     {scene}-fg   talus + sand at the bottom, feathered transparent above the
 *                  cutoff.
 *
 * ── SKYNESS METRIC ──────────────────────────────────────────────────────────
 * Per Dani's spec: skyness(px) = (B − R) + 0.4·(lum − mean). Sky is blue-leaning
 * and bright; land is warm (red-dominant) and darker, so sky pixels score high.
 * We don't hard-threshold per pixel for the cut (that speckles); we use it only
 * to AUTO-DETECT the skyline row when --horizon isn't given, and to validate.
 * The actual cut uses a smooth feathered band centered on the horizon fraction,
 * which gives clean, halo-free edges that melt into haze (lockfile §7.4).
 *
 * ── SKY-FILL (no streaks, no shelf) ─────────────────────────────────────────
 * Behind the occluding buttes the -sky plane must not be a flat bar. We seed
 * from a clean row just ABOVE the skyline and let it fall off vertically with a
 * gentle, natural darkening toward the bottom, blended over a WIDE cross-fade so
 * there is no horizon shelf and no vertical streaks. Each output column inherits
 * its own seed pixel (so lateral color variation in the sky is preserved), then
 * the vertical falloff is applied uniformly — vertical, smooth, continuous.
 *
 * ── USAGE ───────────────────────────────────────────────────────────────────
 *   node scripts/separate-scene.mjs \
 *     --src cinematic-masters/source/dawn-vista.png \
 *     --out cinematic-masters/planes --scene dawn --layout vista \
 *     --horizon 0.47 --fg 0.72 [--feather 0.012] [--seed 0.06]
 *
 * Fractions are of image HEIGHT, origin top (0=top, 1=bottom).
 *   --horizon  skyline row (sky above, land below). Auto-detected if omitted.
 *   --fg       foreground cutoff (fg opaque below, transparent above).
 *   --feather  half-height of the cross-fade band (fraction of H). Default 0.012.
 *   --seed     how far above the horizon to sample the sky-fill seed row.
 *   --skygrad  (cliff only) how far below the sliver to extend the sky gradient.
 *
 * Output: {out}/{scene}-{plane}.png (sky/mid/fg or sky/cliff/fg) — LOSSLESS PNG
 * masters. These are NOT shipped; scripts/encode-planes.mjs encodes them to the
 * AVIF+WebP that actually ship under public/. Masters live in cinematic-masters/
 * (outside public/, so the static export never copies them into out/).
 */

import { existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

import sharp from 'sharp';

// ── arg parsing ──────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const a = {};
  for (let i = 0; i < argv.length; i += 1) {
    const t = argv[i];
    if (t.startsWith('--')) {
      const key = t.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) {
        a[key] = true;
      } else {
        a[key] = next;
        i += 1;
      }
    }
  }
  return a;
}

const args = parseArgs(process.argv.slice(2));
const SRC = args.src;
const OUT = args.out ?? 'cinematic-masters/planes';
const SCENE = args.scene;
const LAYOUT = args.layout ?? 'vista'; // 'vista' | 'cliff'
const FEATHER = args.feather ? Number(args.feather) : 0.012;
const SEED_ABOVE = args.seed ? Number(args.seed) : 0.06;
const SKY_GRAD = args.skygrad ? Number(args.skygrad) : 0.5;

if (!SRC || !SCENE) {
  console.error('separate-scene: --src and --scene are required.');
  console.error('  node scripts/separate-scene.mjs --src <png> --scene <name> --layout vista|cliff --horizon <0..1> --fg <0..1>');
  process.exit(1);
}
if (!existsSync(SRC)) {
  console.error(`separate-scene: source not found: ${SRC}`);
  process.exit(1);
}

// ── helpers ──────────────────────────────────────────────────────────────────
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const smoothstep = (e0, e1, x) => {
  if (e0 === e1) return x < e0 ? 0 : 1;
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};

/**
 * Auto-detect the skyline as the row where mean skyness drops most steeply
 * (sky → land transition). Only used when --horizon is absent.
 */
function detectHorizon(data, w, h, channels) {
  // mean luminance for the skyness metric's mean term
  let sum = 0;
  for (let i = 0; i < data.length; i += channels) {
    sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }
  const mean = sum / (w * h);

  const rowSky = new Float64Array(h);
  for (let y = 0; y < h; y += 1) {
    let s = 0;
    for (let x = 0; x < w; x += 1) {
      const idx = (y * w + x) * channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      s += b - r + 0.4 * (lum - mean);
    }
    rowSky[y] = s / w;
  }
  // steepest negative gradient = sky handing to land
  let best = Math.floor(h * 0.45);
  let bestDrop = 0;
  const lo = Math.floor(h * 0.15);
  const hi = Math.floor(h * 0.75);
  for (let y = lo + 1; y < hi; y += 1) {
    const drop = rowSky[y - 1] - rowSky[y];
    if (drop > bestDrop) {
      bestDrop = drop;
      best = y;
    }
  }
  return best / h;
}

async function main() {
  const img = sharp(SRC).removeAlpha();
  const meta = await img.metadata();
  const w = meta.width;
  const h = meta.height;
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const ch = info.channels; // 3 after removeAlpha

  // global mean luminance — the `mean` term of the skyness metric.
  let lumSum = 0;
  for (let i = 0; i < data.length; i += ch) {
    lumSum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }
  const meanLum = lumSum / (w * h);

  const horizon =
    args.horizon !== undefined ? Number(args.horizon) : detectHorizon(data, w, h, ch);
  const fgCut = args.fg !== undefined ? Number(args.fg) : 0.74;
  const hzY = Math.round(horizon * h);
  const fgY = Math.round(fgCut * h);
  const featherPx = Math.max(1, Math.round(FEATHER * h));

  if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

  console.log(
    `separate-scene[${SCENE}/${LAYOUT}] ${w}x${h}  horizon=${horizon.toFixed(3)} (y${hzY})  fg=${fgCut.toFixed(3)} (y${fgY})  feather=${featherPx}px`,
  );

  // ── alpha mask builders ────────────────────────────────────────────────────
  // alphaForLand[y] in [0,1]: 0 in sky, 1 in land, smooth across the horizon.
  // Used for the MID/CLIFF plane (transparent above skyline).
  const alphaLand = new Float64Array(h);
  for (let y = 0; y < h; y += 1) {
    alphaLand[y] = smoothstep(hzY - featherPx, hzY + featherPx, y);
  }
  // alphaForFg[y]: 0 above the fg cutoff, 1 below, smooth across it.
  const alphaFg = new Float64Array(h);
  for (let y = 0; y < h; y += 1) {
    alphaFg[y] = smoothstep(fgY - featherPx, fgY + featherPx, y);
  }

  // ── 1. SKY plane (opaque) ───────────────────────────────────────────────────
  // Keep the real sky above the horizon; over-paint the land region with a
  // gradient seeded from CLEAN SKY so there are no vertical streaks (a butte
  // smearing its red down a column) and no horizon shelf (a bright seam line).
  //
  // Per-column clean-sky seed:
  //   For each column, scan the sky band (just above the horizon, upward) and
  //   pick the LOWEST pixel that still reads as sky by the skyness metric. That
  //   gives the sky color right at the base of the open sky for that column.
  //   Columns occluded by a butte at the horizon (no clean sky low down) get
  //   NaN and are INPAINTED from the nearest seeded neighbor, then the whole
  //   seed row is smoothed horizontally — so the fill is plausible sky
  //   everywhere, laterally continuous, never butte-colored.
  const seedScanTop = Math.max(0, hzY - Math.round((SEED_ABOVE + 0.18) * h));
  const seedR = new Float64Array(w);
  const seedG = new Float64Array(w);
  const seedB = new Float64Array(w);
  for (let x = 0; x < w; x += 1) {
    let found = -1;
    // scan upward from just above the seam; first clean-sky pixel wins
    for (let y = hzY - featherPx; y >= seedScanTop; y -= 1) {
      if (y < 0) break;
      const idx = (y * w + x) * ch;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      // sky: blue-leaning OR bright-and-not-red (handles the warm peach horizon
      // band, which is sky too — its R≈G≈B-ish and bright, low red-dominance).
      const skyness = b - r + 0.4 * (lum - meanLum);
      const redDom = r - Math.max(g, b);
      if (skyness > -6 && redDom < 26) {
        found = y;
        break;
      }
    }
    if (found >= 0) {
      const idx = (found * w + x) * ch;
      seedR[x] = data[idx];
      seedG[x] = data[idx + 1];
      seedB[x] = data[idx + 2];
    } else {
      seedR[x] = NaN;
      seedG[x] = NaN;
      seedB[x] = NaN;
    }
  }
  // inpaint NaN columns from the nearest valid neighbor (left then right scan)
  const inpaint = (arr) => {
    let last = NaN;
    for (let x = 0; x < w; x += 1) {
      if (!Number.isNaN(arr[x])) last = arr[x];
      else if (!Number.isNaN(last)) arr[x] = last;
    }
    last = NaN;
    for (let x = w - 1; x >= 0; x -= 1) {
      if (!Number.isNaN(arr[x])) last = arr[x];
      else if (!Number.isNaN(last)) arr[x] = last;
    }
  };
  inpaint(seedR);
  inpaint(seedG);
  inpaint(seedB);
  // horizontal box-smooth the seed row so inpainted spans blend into real sky
  // (kills any residual lateral step). Radius scales with frame width.
  const smoothRadius = Math.max(8, Math.round(w * 0.02));
  const boxSmooth = (arr) => {
    const out = new Float64Array(w);
    for (let x = 0; x < w; x += 1) {
      let s = 0;
      let n = 0;
      for (let k = -smoothRadius; k <= smoothRadius; k += 1) {
        const xx = x + k;
        if (xx < 0 || xx >= w) continue;
        s += arr[xx];
        n += 1;
      }
      out[x] = s / n;
    }
    return out;
  };
  const fr0 = boxSmooth(seedR);
  const fg0 = boxSmooth(seedG);
  const fb0 = boxSmooth(seedB);

  // paint the fill: wide cross-fade from real sky at the seam into the smoothed
  // sky-color, with a gentle vertical luminance falloff (atmosphere behind
  // terrain). Monotonic, no banding, no shelf.
  const skyBuf = Buffer.from(data); // copy; opaque (3ch)
  for (let x = 0; x < w; x += 1) {
    const sr = fr0[x];
    const sg = fg0[x];
    const sb = fb0[x];
    for (let y = hzY - featherPx; y < h; y += 1) {
      if (y < 0) continue;
      // 0 at the seam (keep real sky), → 1 deep into the land over a WIDE band.
      const blend = smoothstep(hzY - featherPx, hzY + featherPx * 8, y);
      // -16% luminance from the seam to the frame bottom; smooth + monotonic.
      const depth = clamp01((y - (hzY - featherPx)) / Math.max(1, h - (hzY - featherPx)));
      const fall = 1 - 0.16 * depth;
      const idx = (y * w + x) * ch;
      skyBuf[idx] = Math.round(data[idx] * (1 - blend) + sr * fall * blend);
      skyBuf[idx + 1] = Math.round(data[idx + 1] * (1 - blend) + sg * fall * blend);
      skyBuf[idx + 2] = Math.round(data[idx + 2] * (1 - blend) + sb * fall * blend);
    }
  }
  await sharp(skyBuf, { raw: { width: w, height: h, channels: ch } })
    .png({ compressionLevel: 9 })
    .toFile(`${OUT}/${SCENE}-sky.png`);

  // ── helper to emit a transparent plane ───────────────────────────────────────
  // `alpha` is EITHER a per-row Float64Array(h) OR a per-pixel Float64Array(w*h).
  async function emitPlane(name, alpha) {
    const perPixel = alpha.length === w * h;
    const rgba = Buffer.alloc(w * h * 4);
    for (let y = 0; y < h; y += 1) {
      const aRow = perPixel ? 0 : alpha[y];
      for (let x = 0; x < w; x += 1) {
        const sIdx = (y * w + x) * ch;
        const dIdx = (y * w + x) * 4;
        rgba[dIdx] = data[sIdx];
        rgba[dIdx + 1] = data[sIdx + 1];
        rgba[dIdx + 2] = data[sIdx + 2];
        const a = perPixel ? alpha[y * w + x] : aRow;
        rgba[dIdx + 3] = Math.round(clamp01(a) * 255);
      }
    }
    await sharp(rgba, { raw: { width: w, height: h, channels: 4 } })
      .png({ compressionLevel: 9 })
      .toFile(`${OUT}/${SCENE}-${name}.png`);
  }

  /**
   * Per-column crest detection for the cliff layout. For each column find the
   * sky→cliff transition row (topmost run of sky ending), smooth the crest line
   * horizontally so the diagonal edge is clean, then build a per-PIXEL land-alpha
   * feathered across that crest. Columns with no sky (wall to the top) get crest
   * row 0 (fully opaque). This follows the real diagonal ridge instead of a flat
   * horizon, so the sky sliver is cut exactly at the rock edge — no flat shelf.
   */
  function buildCliffAlpha() {
    const crest = new Float64Array(w);
    for (let x = 0; x < w; x += 1) {
      let landRow = 0; // default: wall to the top
      for (let y = 0; y < Math.round(0.62 * h); y += 1) {
        const idx = (y * w + x) * ch;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        const skyness = b - r + 0.4 * (lum - meanLum);
        const redDom = r - Math.max(g, b);
        const isSky = skyness > -6 && redDom < 26;
        if (!isSky) {
          landRow = y;
          break;
        }
      }
      crest[x] = landRow;
    }
    // horizontal smoothing of the crest line (median-ish via box) so a few
    // speckle pixels don't notch the edge.
    const rad = Math.max(6, Math.round(w * 0.01));
    const crestS = new Float64Array(w);
    for (let x = 0; x < w; x += 1) {
      let s = 0;
      let n = 0;
      for (let k = -rad; k <= rad; k += 1) {
        const xx = x + k;
        if (xx < 0 || xx >= w) continue;
        s += crest[xx];
        n += 1;
      }
      crestS[x] = s / n;
    }
    // per-pixel feathered land alpha around the smoothed crest
    const a = new Float64Array(w * h);
    for (let x = 0; x < w; x += 1) {
      const c = crestS[x];
      for (let y = 0; y < h; y += 1) {
        a[y * w + x] = smoothstep(c - featherPx, c + featherPx, y);
      }
    }
    return { alpha: a, crest: crestS };
  }

  if (LAYOUT === 'vista') {
    // ── 2. MID plane: buttes/spires/plain. Transparent above skyline. ─────────
    // Opaque from the skyline down to the bottom of the frame (the valley floor
    // belongs to mid). The fg plane carries the very-near ground on top.
    await emitPlane('mid', alphaLand);

    // ── 3. FG plane: foreground rocks/scrub, feathered top. ────────────────────
    await emitPlane('fg', alphaFg);
  } else {
    // cliff layout — the crest is a DIAGONAL ridge, not a flat horizon.
    const { alpha: cliffAlpha, crest } = buildCliffAlpha();

    // ── 1b. SKY plane (cliff): OVERWRITE the flat-horizon sky written above.
    // The sky must back the WHOLE wall, so we extend each column's sky color
    // downward from that column's crest seed, with vertical falloff. Above the
    // crest we keep the real sky sliver; below we fill. This guarantees the wall
    // never reveals a hole — and as the cliff plane scales, only soft sky shows.
    //
    // Seed per column from a CLEAN-SKY pixel just above the crest; columns where
    // the wall reaches the top (no sky to sample) are INPAINTED horizontally from
    // the nearest sky-bearing column, then smoothed — so even the hidden fill
    // behind the wall is plausible sky, never a vertical rock streak.
    const cSr = new Float64Array(w);
    const cSg = new Float64Array(w);
    const cSb = new Float64Array(w);
    for (let x = 0; x < w; x += 1) {
      const cY = Math.round(crest[x]);
      const seedRow = cY - Math.round(0.02 * h);
      if (seedRow >= 1) {
        const sIdx = (seedRow * w + x) * ch;
        cSr[x] = data[sIdx];
        cSg[x] = data[sIdx + 1];
        cSb[x] = data[sIdx + 2];
      } else {
        cSr[x] = NaN; // wall reaches the top here — no clean sky to seed
        cSg[x] = NaN;
        cSb[x] = NaN;
      }
    }
    inpaint(cSr);
    inpaint(cSg);
    inpaint(cSb);
    const cFr = boxSmooth(cSr);
    const cFg = boxSmooth(cSg);
    const cFb = boxSmooth(cSb);

    const cliffSky = Buffer.from(data);
    for (let x = 0; x < w; x += 1) {
      const cY = Math.round(crest[x]);
      const sr = cFr[x];
      const sg = cFg[x];
      const sb = cFb[x];
      for (let y = cY - featherPx; y < h; y += 1) {
        if (y < 0) continue;
        const blend = smoothstep(cY - featherPx, cY + featherPx * 8, y);
        const depth = clamp01((y - (cY - featherPx)) / Math.max(1, h - (cY - featherPx)));
        const fall = 1 - 0.16 * depth;
        const idx = (y * w + x) * ch;
        cliffSky[idx] = Math.round(data[idx] * (1 - blend) + sr * fall * blend);
        cliffSky[idx + 1] = Math.round(data[idx + 1] * (1 - blend) + sg * fall * blend);
        cliffSky[idx + 2] = Math.round(data[idx + 2] * (1 - blend) + sb * fall * blend);
      }
    }
    await sharp(cliffSky, { raw: { width: w, height: h, channels: ch } })
      .png({ compressionLevel: 9 })
      .toFile(`${OUT}/${SCENE}-sky.png`);

    // ── 2. CLIFF plane: the wall, transparent only in the sky sliver (per-pixel
    // crest feather). Opaque everywhere below — the wall is dominant; the fg
    // plane overlays the talus.
    await emitPlane('cliff', cliffAlpha);

    // ── 3. FG plane: talus + sand, feathered top. ──────────────────────────────
    await emitPlane('fg', alphaFg);
  }

  console.log(`separate-scene[${SCENE}] wrote ${LAYOUT === 'vista' ? 'sky, mid, fg' : 'sky, cliff, fg'} → ${OUT}/`);
}

main().catch((err) => {
  console.error('separate-scene failed:', err);
  process.exit(1);
});

// silence unused-dirname lint in case OUT has no dir component
void dirname;
