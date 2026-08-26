/**
 * encode-planes-mobile.mjs — encode a smaller "mobile" tier for the 4 depth
 * planes actually used in the LIVE 2-scene descent (ACTIVE_SCENES in
 * plates.ts): mid-sky, mid-mid, arrival-cliff, mid-fg.
 *
 * ── WHY ─────────────────────────────────────────────────────────────────────
 * CinematicDesert.tsx animates on every viewport (mobile included — see the
 * `animate = !FORCE_STATIC && !reduce` comment; `narrow` is a CSS data-hook
 * only, not a gate). Layer.tsx served ONE fixed-resolution image per plane
 * (the full desktop-magnification tier from encode-planes.mjs — up to 2304px
 * wide) to every viewport, so a 390px-wide phone downloaded the same bytes as
 * a 2560px desktop for an object-fit:cover full-bleed image. This script adds
 * a half-resolution "-mobile" variant so a responsive srcset (wired in
 * plates.ts/Layer.tsx) can let the browser pick the right one for its width x
 * DPR instead of always fetching the largest.
 *
 * Only the 4 LIVE planes get a mobile tier — the dropped DAWN scene + the
 * static-only arrival-sky/arrival-fg planes are unused dead weight already
 * (never `<img>`-referenced by the shipped bundle) and out of scope here.
 *
 * Same encode settings as encode-planes.mjs (AVIF q56/effort9/chroma444,
 * WebP q80/effort6) so the mobile tier matches the existing visual grade.
 *
 *   node scripts/encode-planes-mobile.mjs
 */

import { statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..');
const SRC_DIR = join(ROOT, 'cinematic-masters', 'planes');
const OUT_DIR = join(ROOT, 'public', 'images', 'cinematic');

const AVIF_QUALITY = 56;
const AVIF_EFFORT = 9;
const WEBP_QUALITY = 80;

// Full-tier width halved (rounded to a clean multiple of 32) — matches the
// `width:` values in encode-planes.mjs's PLANES manifest for these 4 ids.
const MOBILE_PLANES = [
  { id: 'mid-sky', fullWidth: 1536, mobileWidth: 768, transparent: false, avifQ: 62 },
  { id: 'mid-mid', fullWidth: 2048, mobileWidth: 1024, transparent: true },
  { id: 'arrival-cliff', fullWidth: 2048, mobileWidth: 1024, transparent: true },
  { id: 'mid-fg', fullWidth: 2304, mobileWidth: 1152, transparent: true },
];

const fmtKB = (bytes) => `${(bytes / 1024).toFixed(0)}KB`;

async function encodeOne(plane) {
  const srcPath = join(SRC_DIR, `${plane.id}.png`);
  const avifQ = plane.avifQ ?? AVIF_QUALITY;

  const base = () => sharp(srcPath).resize({ width: plane.mobileWidth, withoutEnlargement: true });

  const avifPath = join(OUT_DIR, `${plane.id}-mobile.avif`);
  await base().avif({ quality: avifQ, effort: AVIF_EFFORT, chromaSubsampling: '4:4:4' }).toFile(avifPath);

  const webpPath = join(OUT_DIR, `${plane.id}-mobile.webp`);
  await base().webp({ quality: WEBP_QUALITY, effort: 6 }).toFile(webpPath);

  const avifBytes = statSync(avifPath).size;
  const webpBytes = statSync(webpPath).size;
  return { ...plane, avifBytes, webpBytes, avifQ };
}

async function main() {
  console.log(`encode-planes-mobile: AVIF q${AVIF_QUALITY}/effort${AVIF_EFFORT} + WebP q${WEBP_QUALITY}\n`);
  const results = [];
  const only = process.argv[2];
  for (const plane of MOBILE_PLANES.filter((p) => !only || p.id === only)) {
    // eslint-disable-next-line no-await-in-loop
    const r = await encodeOne(plane);
    results.push(r);
    console.log(
      `  ${r.id.padEnd(14)} ${String(r.fullWidth).padStart(4)}→${String(r.mobileWidth).padStart(4)}px  ` +
        `AVIF ${fmtKB(r.avifBytes).padStart(6)} (q${r.avifQ})  WebP ${fmtKB(r.webpBytes).padStart(6)}${r.transparent ? '  [alpha]' : ''}`,
    );
  }
  const sum = (k) => results.reduce((a, r) => a + r[k], 0);
  console.log('\n  ── totals (mobile tier, 4 planes) ──────────────────────');
  console.log(`  AVIF: ${fmtKB(sum('avifBytes'))}   WebP: ${fmtKB(sum('webpBytes'))}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
