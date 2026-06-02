/**
 * encode-planes.mjs — encode the 9 cinematic depth planes to AVIF + WebP.
 *
 * ── WHY ─────────────────────────────────────────────────────────────────────
 * The 3-beat descent ships 9 separated planes. As lossless PNG (transparent
 * RGBA fg/mid/cliff are 9–11 MB each) they total ~69 MB — far too heavy for a
 * web hero. AVIF (primary) + WebP (fallback) cut that ~80% with no visible
 * change, alpha intact. Between them they cover ~all 2026 browsers.
 *
 * ── RIGHT-SIZING (don't ship more pixels than the deepest push uses) ────────
 * Each plane is sized to its max on-screen magnification. PERF rebuild
 * (2026-06-02): the depth-push scale caps were hard-reduced (sky ≤1.08,
 * mid/cliff ≤1.30, fg ≤1.45 — was up to 2.6×), so the planes no longer need
 * their old pixel budget. Smaller masters = less decode + far less GPU texture
 * memory per composited layer, which is the second-biggest perf lever after the
 * scale cap. New right-sized targets:
 *   sky   planes (scale ≤1.08): 1536px wide  (was 2048)
 *   mid / cliff   (scale ≤1.30): 2048px wide  (was 2880)
 *   fg    planes  (scale ≤1.45): 2304px wide  (was 3360)
 *
 * ── ENCODE ──────────────────────────────────────────────────────────────────
 * AVIF quality 56, effort 9 (high), alpha preserved on the 6 transparent
 * planes. WebP quality 80. A per-plane quality OVERRIDE bumps any plane whose
 * smooth sky gradient would band at the base quality (the sky planes — large
 * flat blue ramps are the worst case for AVIF blocking). Spot-checked
 * composited over the scene: no blocking/banding vs the PNG.
 *
 * Inputs come from the RETAINED lossless planes in cinematic-masters/planes/
 * (kept OUTSIDE public/ so Next's static export never ships them; they stay so
 * we can re-encode without re-separating). Output lands in
 * public/images/cinematic/ as <id>.avif + <id>.webp.
 *
 *   node scripts/encode-planes.mjs
 */

import { mkdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..');
// Lossless PNG masters live OUTSIDE public/ so they never ship in the static
// export (public/ is copied verbatim into out/). Encoded AVIF+WebP land in
// public/ — those are the only plane files that ship.
const SRC_DIR = join(ROOT, 'cinematic-masters', 'planes');
const OUT_DIR = join(ROOT, 'public', 'images', 'cinematic');

// Base encode settings (per the brief: AVIF q~52–58 effort high, WebP q80).
const AVIF_QUALITY = 56;
const AVIF_EFFORT = 9; // high
const WEBP_QUALITY = 80;

/**
 * The 9 planes. `width` = right-sized target (max-magnification tier). `avifQ`
 * overrides the base AVIF quality for planes that need it (smooth sky gradients
 * band first — bumped after a spot-check). `transparent` documents which planes
 * carry alpha (must be preserved); sharp keeps alpha automatically, this is just
 * for the report.
 */
const PLANES = [
  // DAWN
  { id: 'dawn-sky', tier: 'sky', width: 1536, transparent: false, avifQ: 62 },
  { id: 'dawn-mid', tier: 'mid', width: 2048, transparent: true },
  { id: 'dawn-fg', tier: 'fg', width: 2304, transparent: true },
  // MID
  { id: 'mid-sky', tier: 'sky', width: 1536, transparent: false, avifQ: 62 },
  { id: 'mid-mid', tier: 'mid', width: 2048, transparent: true },
  { id: 'mid-fg', tier: 'fg', width: 2304, transparent: true },
  // ARRIVAL
  { id: 'arrival-sky', tier: 'sky', width: 1536, transparent: false, avifQ: 62 },
  { id: 'arrival-cliff', tier: 'cliff', width: 2048, transparent: true },
  { id: 'arrival-fg', tier: 'fg', width: 2304, transparent: true },
];

const fmtKB = (bytes) => `${(bytes / 1024).toFixed(0)}KB`;

async function encodeOne(plane) {
  const srcPath = join(SRC_DIR, `${plane.id}.png`);
  const meta = await sharp(srcPath).metadata();

  // Right-size only if the source is wider than the target (never upscale).
  const resizeOpts =
    meta.width > plane.width ? { width: plane.width, withoutEnlargement: true } : null;

  const base = () => {
    let s = sharp(srcPath);
    if (resizeOpts) s = s.resize(resizeOpts);
    return s;
  };

  const avifQ = plane.avifQ ?? AVIF_QUALITY;

  // AVIF (primary). chromaSubsampling 4:4:4 keeps the gradient + alpha edges
  // crisp (4:2:0 is where smooth blue skies smear/band). lossless:false.
  const avifPath = join(OUT_DIR, `${plane.id}.avif`);
  await base()
    .avif({ quality: avifQ, effort: AVIF_EFFORT, chromaSubsampling: '4:4:4' })
    .toFile(avifPath);

  // WebP (fallback). q80, effort 6. Alpha preserved automatically.
  const webpPath = join(OUT_DIR, `${plane.id}.webp`);
  await base().webp({ quality: WEBP_QUALITY, effort: 6 }).toFile(webpPath);

  const srcBytes = statSync(srcPath).size;
  const avifBytes = statSync(avifPath).size;
  const webpBytes = statSync(webpPath).size;
  return { ...plane, srcW: meta.width, srcBytes, avifBytes, webpBytes, avifQ };
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  console.log(`encode-planes: AVIF q${AVIF_QUALITY}/effort${AVIF_EFFORT} + WebP q${WEBP_QUALITY}\n`);

  const results = [];
  for (const plane of PLANES) {
    // eslint-disable-next-line no-await-in-loop
    const r = await encodeOne(plane);
    results.push(r);
    console.log(
      `  ${r.id.padEnd(14)} ${String(r.srcW).padStart(4)}→${String(r.width).padStart(4)}px  ` +
        `PNG ${fmtKB(r.srcBytes).padStart(7)}  →  AVIF ${fmtKB(r.avifBytes).padStart(6)} (q${r.avifQ})  ` +
        `WebP ${fmtKB(r.webpBytes).padStart(6)}${r.transparent ? '  [alpha]' : ''}`,
    );
  }

  const sum = (k) => results.reduce((a, r) => a + r[k], 0);
  const eager = results.filter((r) => r.id.startsWith('dawn-'));
  const sumEager = (k) => eager.reduce((a, r) => a + r[k], 0);

  console.log('\n  ── totals ─────────────────────────────────────────────');
  console.log(`  PNG (all 9):        ${fmtKB(sum('srcBytes'))}`);
  console.log(`  AVIF (all 9):       ${fmtKB(sum('avifBytes'))}`);
  console.log(`  WebP (all 9):       ${fmtKB(sum('webpBytes'))}`);
  console.log(
    `  shipped (AVIF+WebP): ${fmtKB(sum('avifBytes') + sum('webpBytes'))}  ` +
      `(was ${fmtKB(sum('srcBytes'))} PNG)`,
  );
  console.log(
    `  eager DAWN beat — AVIF: ${fmtKB(sumEager('avifBytes'))}  WebP: ${fmtKB(sumEager('webpBytes'))}`,
  );
}

main().catch((err) => {
  console.error('encode-planes failed:', err);
  process.exit(1);
});
