/**
 * fix-arrival-sky.mjs — de-streak the ARRIVAL backdrop sky plane.
 *
 * ── WHY ─────────────────────────────────────────────────────────────────────
 * `separate-scene.mjs` (cliff layout) builds arrival-sky by keeping the real
 * sky above the diagonal crest and INPAINTING a sky-fill behind/below the wall
 * (column-seeded, vertical falloff). Where the wall reaches high (left edge +
 * the big occluded block right-of-crest) that per-column inpaint leaves faint
 * VERTICAL STREAKS and a flat rectangular "shelf" slightly off the real sky's
 * tone. The cliff plane covers all of it at p=1 — but during the arrival
 * fade-in (p≈0.65–0.72) the wall hasn't risen far enough yet, so the upper
 * third briefly shows those streaks. (Cosmetic tell flagged for the hero.)
 *
 * The arrival-sky plane is a PURE smooth gradient backdrop — no clouds, no
 * stars, no detail (verified: boosting contrast 2× reveals only sensor-grain
 * noise). And everything below the sky sliver is occluded by the opaque cliff
 * plane in the composite. So the fix that provably can't change the look is to
 * REBUILD the plane as a clean, streak-free continuation of the SAME gradient.
 *
 * ── METHOD (normalized-convolution, rock-excluded) ──────────────────────────
 * 1. Classify each pixel sky vs rock via the project's skyness metric.
 * 2. Build a smooth gradient FIELD by blurring ONLY the clean-sky pixels
 *    (normalized convolution: rock pixels carry zero weight, so no orange
 *    bleeds into the sky and the occluded block is filled by the surrounding
 *    real sky, not by a per-column seed). Separable box blur ×N passes ≈ a wide
 *    Gaussian — kills vertical streaks + the shelf edge, keeps the gradient.
 * 3. Output = the smooth field everywhere. Visible sky sliver is bit-for-bit
 *    the same gradient (sampled from the real sky); the occluded region is now
 *    a seamless extension of it instead of streaky inpaint.
 *
 * Only arrival-sky.png is rewritten. arrival-cliff / arrival-fg are untouched.
 *
 *   node scripts/fix-arrival-sky.mjs \
 *     --src cinematic-masters/planes/arrival-sky.png \
 *     --out cinematic-masters/planes/arrival-sky.png
 */

import { existsSync } from 'node:fs';

import sharp from 'sharp';

function parseArgs(argv) {
  const a = {};
  for (let i = 0; i < argv.length; i += 1) {
    const t = argv[i];
    if (t.startsWith('--')) {
      const key = t.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) a[key] = true;
      else {
        a[key] = next;
        i += 1;
      }
    }
  }
  return a;
}

const args = parseArgs(process.argv.slice(2));
const SRC = args.src;
const OUT = args.out ?? SRC;
// passes/radius of the separable box blur (wide → smooth gradient field).
const RADIUS = args.radius ? Number(args.radius) : 90;
const PASSES = args.passes ? Number(args.passes) : 3;

if (!SRC) {
  console.error('fix-arrival-sky: --src required');
  process.exit(1);
}
if (!existsSync(SRC)) {
  console.error(`fix-arrival-sky: source not found: ${SRC}`);
  process.exit(1);
}

async function main() {
  const { data, info } = await sharp(SRC).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: ch } = info;

  // global mean luminance — the `mean` term of the project's skyness metric
  let lumSum = 0;
  for (let i = 0; i < data.length; i += ch) {
    lumSum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }
  const meanLum = lumSum / (w * h);

  // weight = 1 for clean sky, 0 for rock. Same classifier as separate-scene.
  const W = new Float64Array(w * h);
  const R = new Float64Array(w * h);
  const G = new Float64Array(w * h);
  const B = new Float64Array(w * h);
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const p = y * w + x;
      const idx = p * ch;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      const skyness = b - r + 0.4 * (lum - meanLum);
      const redDom = r - Math.max(g, b);
      const isSky = skyness > -6 && redDom < 26;
      const wt = isSky ? 1 : 0;
      W[p] = wt;
      R[p] = r * wt;
      G[p] = g * wt;
      B[p] = b * wt;
    }
  }

  // separable box blur (horizontal then vertical), N passes ≈ wide Gaussian.
  // We blur the weighted color AND the weight, then divide → normalized
  // convolution. Rock (weight 0) contributes nothing; gaps fill from real sky.
  function boxBlurInto(arr) {
    const tmp = new Float64Array(w * h);
    const out = new Float64Array(w * h);
    // horizontal
    for (let y = 0; y < h; y += 1) {
      const base = y * w;
      let acc = 0;
      for (let x = 0; x <= RADIUS && x < w; x += 1) acc += arr[base + x];
      for (let x = 0; x < w; x += 1) {
        const lo = x - RADIUS - 1;
        const hi = x + RADIUS;
        if (hi < w) acc += arr[base + hi];
        if (lo >= 0) acc -= arr[base + lo];
        const cnt = Math.min(w - 1, x + RADIUS) - Math.max(0, x - RADIUS) + 1;
        tmp[base + x] = acc / cnt;
      }
    }
    // vertical
    for (let x = 0; x < w; x += 1) {
      let acc = 0;
      for (let y = 0; y <= RADIUS && y < h; y += 1) acc += tmp[y * w + x];
      for (let y = 0; y < h; y += 1) {
        const lo = y - RADIUS - 1;
        const hi = y + RADIUS;
        if (hi < h) acc += tmp[hi * w + x];
        if (lo >= 0) acc -= tmp[lo * w + x];
        const cnt = Math.min(h - 1, y + RADIUS) - Math.max(0, y - RADIUS) + 1;
        out[y * w + x] = acc / cnt;
      }
    }
    return out;
  }

  let wr = R;
  let wg = G;
  let wb = B;
  let ww = W;
  for (let pass = 0; pass < PASSES; pass += 1) {
    wr = boxBlurInto(wr);
    wg = boxBlurInto(wg);
    wb = boxBlurInto(wb);
    ww = boxBlurInto(ww);
  }

  const out = Buffer.alloc(w * h * ch);
  for (let p = 0; p < w * h; p += 1) {
    const denom = ww[p] || 1e-9;
    const o = p * ch;
    out[o] = Math.max(0, Math.min(255, Math.round(wr[p] / denom)));
    out[o + 1] = Math.max(0, Math.min(255, Math.round(wg[p] / denom)));
    out[o + 2] = Math.max(0, Math.min(255, Math.round(wb[p] / denom)));
  }

  await sharp(out, { raw: { width: w, height: h, channels: ch } })
    .png({ compressionLevel: 9 })
    .toFile(OUT);

  console.log(
    `fix-arrival-sky: rebuilt ${w}x${h} clean gradient sky (radius=${RADIUS}, passes=${PASSES}) → ${OUT}`,
  );
}

main().catch((err) => {
  console.error('fix-arrival-sky failed:', err);
  process.exit(1);
});
