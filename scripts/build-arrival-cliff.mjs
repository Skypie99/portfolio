/**
 * build-arrival-cliff.mjs — cut the new flat-top mesa photo into the arrival
 * cliff plane, with a clean, halo-free edge.
 *
 * ── WHY ─────────────────────────────────────────────────────────────────────
 * The arrival cliff RISES to fill the frame. The previous cliff photo had a
 * hard rectangular TOP — illogical as it pops up. The new source is a complete
 * flat-topped mesa with a natural crest + sky above it. We separate it (key the
 * blue sky → transparent ABOVE the natural crest, opaque rock below) so the warm
 * dawn sky shows through as it rises, then DEFRINGE the crest so the cyan sky
 * never halos the rock edge (the tell that made the old rise look like a cutout).
 *
 * ── METHOD ──────────────────────────────────────────────────────────────────
 * 1. Sky-key: per-column sky→rock crest via the project skyness metric
 *    (B−R)+0.4·(lum−mean) + redDom (same classifier as separate-scene.mjs),
 *    smoothed horizontally, feathered into a per-pixel land alpha.
 * 2. Defringe: rock-seeded normalized-convolution color-bleed recolors the
 *    feathered crest pixels (which carry sky-blue RGB) to rock, so the soft edge
 *    composites as a natural rock→sky AA edge, not a glowing halo.
 * 3. Despeckle: connected-component pass recolors only SMALL cyan blobs (key
 *    slips); any large structural region is left intact.
 * 4. Gentle alpha choke tightens the very faint outer feather. Silhouette kept.
 *
 *   node scripts/build-arrival-cliff.mjs
 * Input : cinematic-masters/source/arrival-cliff-newest.png (opaque 3360x1440)
 * Output: cinematic-masters/planes/arrival-cliff.png (RGBA master)
 *   then: node scripts/encode-planes.mjs   → ships AVIF + WebP under public/
 */
import { fileURLToPath } from 'node:url';
import { join, resolve } from 'node:path';

import sharp from 'sharp';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..');
const SRC = join(ROOT, 'cinematic-masters/source/arrival-cliff-newest.png');
const OUT = join(ROOT, 'cinematic-masters/planes/arrival-cliff.png');

// ── tunables ─────────────────────────────────────────────────────────────────
const FEATHER_FRAC = 0.008; // crest feather half-height (fraction of H) → ~12px
const CREST_SCAN = 0.68; // scan this far down (fraction of H) for sky→rock crest
const BLEED_RADIUS = 12, BLEED_PASSES = 4; // reach ≈ 48px (covers the feather)
const ROCK_FALLBACK = [120, 58, 32];
const CHOKE_LO = 0.08, CHOKE_HI = 0.92; // tighten the faint outer feather
const MAX_SPECK_AREA = 1500, SPECK_DILATE = 5; // despeckle small cyan blobs only
// color-match grade — seat the deep-red golden-hour mesa among the scene's brighter dawn
// buttes (scene lit rock ~209,89,11; newest ~135,43,8). Per-channel gain on a gamma-lifted
// base + small lift, applied to all output RGB (rock + bled edge). Tune by eye in-scene.
const GRADE_GAIN = [1.26, 1.42, 1.12];
const GRADE_GAMMA = 0.94;
const GRADE_LIFT = [4, 2, 0];

const clamp01 = (x) => Math.max(0, Math.min(1, x));
const smoothstep = (e0, e1, x) => {
  if (e0 === e1) return x < e0 ? 0 : 1;
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};
const gradeCh = (c, gi, li) =>
  Math.max(0, Math.min(255, Math.round(Math.pow(c / 255, GRADE_GAMMA) * 255 * gi + li)));

const { data, info } = await sharp(SRC).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: w, height: h, channels: ch } = info; // ch = 3

let lumSum = 0;
for (let i = 0; i < data.length; i += ch) lumSum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
const meanLum = lumSum / (w * h);
const featherPx = Math.max(1, Math.round(FEATHER_FRAC * h));

// ── 1. per-column crest (sky→rock), horizontally smoothed ────────────────────
const crest = new Float64Array(w);
const scanTo = Math.round(CREST_SCAN * h);
for (let x = 0; x < w; x += 1) {
  let row = 0;
  for (let y = 0; y < scanTo; y += 1) {
    const idx = (y * w + x) * ch;
    const r = data[idx], g = data[idx + 1], b = data[idx + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const skyness = b - r + 0.4 * (lum - meanLum);
    const redDom = r - Math.max(g, b);
    if (!(skyness > -6 && redDom < 26)) { row = y; break; }
  }
  crest[x] = row;
}
const rad = Math.max(6, Math.round(w * 0.008));
const crestS = new Float64Array(w);
for (let x = 0; x < w; x += 1) {
  let s = 0, n = 0;
  for (let k = -rad; k <= rad; k += 1) { const xx = x + k; if (xx < 0 || xx >= w) continue; s += crest[xx]; n += 1; }
  crestS[x] = s / n;
}

// feathered land alpha (0 above crest, 1 below)
const fAlpha = new Float64Array(w * h);
for (let x = 0; x < w; x += 1) {
  const c = crestS[x];
  for (let y = 0; y < h; y += 1) fAlpha[y * w + x] = smoothstep(c - featherPx, c + featherPx, y);
}

// ── 2. rock-seeded bled color field (seed = opaque red-dominant rock) ────────
const W = new Float64Array(w * h), R = new Float64Array(w * h), G = new Float64Array(w * h), B = new Float64Array(w * h);
for (let p = 0, i = 0; p < w * h; p += 1, i += ch) {
  const r = data[i], g = data[i + 1], b = data[i + 2];
  const seed = fAlpha[p] >= 0.98 && r > b + 25 ? 1 : 0;
  W[p] = seed; R[p] = r * seed; G[p] = g * seed; B[p] = b * seed;
}
function boxBlur(arr) {
  const tmp = new Float64Array(w * h), out = new Float64Array(w * h);
  for (let y = 0; y < h; y += 1) { const bse = y * w; let acc = 0;
    for (let x = 0; x <= BLEED_RADIUS && x < w; x += 1) acc += arr[bse + x];
    for (let x = 0; x < w; x += 1) { const hi = x + BLEED_RADIUS, lo = x - BLEED_RADIUS - 1;
      if (hi < w) acc += arr[bse + hi]; if (lo >= 0) acc -= arr[bse + lo];
      tmp[bse + x] = acc / (Math.min(w - 1, x + BLEED_RADIUS) - Math.max(0, x - BLEED_RADIUS) + 1); } }
  for (let x = 0; x < w; x += 1) { let acc = 0;
    for (let y = 0; y <= BLEED_RADIUS && y < h; y += 1) acc += tmp[y * w + x];
    for (let y = 0; y < h; y += 1) { const hi = y + BLEED_RADIUS, lo = y - BLEED_RADIUS - 1;
      if (hi < h) acc += tmp[hi * w + x]; if (lo >= 0) acc -= tmp[lo * w + x];
      out[y * w + x] = acc / (Math.min(h - 1, y + BLEED_RADIUS) - Math.max(0, y - BLEED_RADIUS) + 1); } }
  return out;
}
let wr = R, wg = G, wb = B, ww = W;
for (let k = 0; k < BLEED_PASSES; k += 1) { wr = boxBlur(wr); wg = boxBlur(wg); wb = boxBlur(wb); ww = boxBlur(ww); }

// ── 3. CC despeckle: strict cyan candidates, keep only small components ───────
const cand = new Uint8Array(w * h);
for (let p = 0, i = 0; p < w * h; p += 1, i += ch) {
  const r = data[i], b = data[i + 2];
  const lum = 0.299 * r + 0.587 * data[i + 1] + 0.114 * b;
  if (fAlpha[p] >= 0.98 && b > r && lum > 140) cand[p] = 1; // opaque + bluer-than-red + bright
}
const seen = new Uint8Array(w * h), keep = new Uint8Array(w * h);
const stk = new Int32Array(1 << 21);
let keptComps = 0, keptPx = 0, biggest = 0;
for (let p0 = 0; p0 < w * h; p0 += 1) {
  if (!cand[p0] || seen[p0]) continue;
  let sp = 0; stk[sp++] = p0; seen[p0] = 1; const members = [p0];
  while (sp > 0) { const p = stk[--sp]; const x = p % w, y = (p - x) / w;
    const nb = [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1, y > 0 ? p - w : -1, y < h - 1 ? p + w : -1];
    for (const q of nb) if (q >= 0 && cand[q] && !seen[q]) { seen[q] = 1; stk[sp++] = q; members.push(q); } }
  biggest = Math.max(biggest, members.length);
  if (members.length < MAX_SPECK_AREA) { keptComps += 1; keptPx += members.length; for (const p of members) keep[p] = 1; }
}
const speckMask = new Uint8Array(w * h);
for (let y = 0; y < h; y += 1) for (let x = 0; x < w; x += 1) {
  if (!keep[y * w + x]) continue;
  for (let dy = -SPECK_DILATE; dy <= SPECK_DILATE; dy += 1) for (let dx = -SPECK_DILATE; dx <= SPECK_DILATE; dx += 1) {
    if (dx * dx + dy * dy > SPECK_DILATE * SPECK_DILATE) continue;
    const xx = x + dx, yy = y + dy; if (xx >= 0 && xx < w && yy >= 0 && yy < h) speckMask[yy * w + xx] = 1;
  }
}

// ── 4. compose output: recolor fringe + specks; choke alpha ──────────────────
const out = Buffer.alloc(w * h * 4);
let fr = 0, fg = 0, fb = 0, fc = 0;
for (let p = 0, i = 0, o = 0; p < w * h; p += 1, i += ch, o += 4) {
  const a = fAlpha[p];
  const isFringe = a > 0.02 && a < 0.98;
  if (isFringe || speckMask[p]) {
    if (ww[p] > 1e-4) { out[o] = Math.round(wr[p] / ww[p]); out[o + 1] = Math.round(wg[p] / ww[p]); out[o + 2] = Math.round(wb[p] / ww[p]); }
    else { out[o] = ROCK_FALLBACK[0]; out[o + 1] = ROCK_FALLBACK[1]; out[o + 2] = ROCK_FALLBACK[2]; }
  } else { out[o] = data[i]; out[o + 1] = data[i + 1]; out[o + 2] = data[i + 2]; }
  // color-match grade (rock + bled edge alike) → seat the mesa among the dawn buttes
  out[o] = gradeCh(out[o], GRADE_GAIN[0], GRADE_LIFT[0]);
  out[o + 1] = gradeCh(out[o + 1], GRADE_GAIN[1], GRADE_LIFT[1]);
  out[o + 2] = gradeCh(out[o + 2], GRADE_GAIN[2], GRADE_LIFT[2]);
  out[o + 3] = Math.round(clamp01((a - CHOKE_LO) / (CHOKE_HI - CHOKE_LO)) * 255);
  if (isFringe) { fr += out[o]; fg += out[o + 1]; fb += out[o + 2]; fc += 1; }
}
const avg = (s, c) => (c ? (s / c).toFixed(0) : 'n/a');
console.log(`crest rows: ${Math.round(Math.min(...crestS))}..${Math.round(Math.max(...crestS))} (feather ${featherPx}px)`);
console.log(`despeckle: kept ${keptComps} small comps (${keptPx}px), biggest cyan comp ${biggest}px (excluded if ≥${MAX_SPECK_AREA})`);
console.log(`fringe recolored to rock avgRGB=(${avg(fr, fc)},${avg(fg, fc)},${avg(fb, fc)})  [cyan was ~150,190,220]`);

await sharp(out, { raw: { width: w, height: h, channels: 4 } }).png({ compressionLevel: 9 }).toFile(OUT);
console.log(`wrote ${w}x${h} RGBA cliff master → ${OUT}`);

// ── verification crops: cutout over dawn mauve, crest at 100% (→ /tmp) ────────
const SKY = [150, 145, 170];
for (const cx of [400, 1000, 1700, 2400, 3000]) {
  let y0 = 0; for (let y = 0; y < h; y += 1) { if (out[(y * w + cx) * 4 + 3] > 150) { y0 = y; break; } }
  const left = Math.max(0, cx - 130), top = Math.max(0, y0 - 90), cw = 260, cht = 220;
  const cl = await sharp(out, { raw: { width: w, height: h, channels: 4 } }).extract({ left, top, width: cw, height: cht }).png().toBuffer();
  await sharp({ create: { width: cw, height: cht, channels: 3, background: { r: SKY[0], g: SKY[1], b: SKY[2] } } })
    .composite([{ input: cl, left: 0, top: 0 }]).png().toFile(`/tmp/newcliff-c${cx}.png`);
}
console.log('wrote /tmp/newcliff-c{400,1000,1700,2400,3000}.png');
