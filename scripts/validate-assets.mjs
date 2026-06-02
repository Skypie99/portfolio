/**
 * validate-assets.mjs — Build-time validation of referenced static assets.
 *
 * Gap 4 (Gary): Checks that every badgeImage path referenced in
 * content/certificates.json exists in public/. Fails with a clear
 * error message listing missing files so the build is blocked before
 * any missing badge reaches production.
 *
 * Dani (cinematic 2.5D): also validates the cinematic depth planes.
 *   - When components/cinematic/plates.ts has USE_PLACEHOLDERS = true, this
 *     checks the 6 PLACEHOLDER svgs (the motion-mechanics rig) exist.
 *   - When USE_PLACEHOLDERS = false (the default), it requires the real scene
 *     planes in their SHIPPED formats — both <id>.avif AND <id>.webp — for the 5
 *     USED planes of the 2-scene recut (mid-sky, mid-mid, arrival-sky,
 *     arrival-cliff, mid-fg), unioned across MID + ARRIVAL + FLOOR. The heavy
 *     source PNGs are dropped from public/ (retained only in cinematic-masters/,
 *     outside public/ so they never ship), so we validate the AVIF+WebP the
 *     <picture> actually serves, not PNG.
 *
 * Pivot note (2026-06-01): we no longer ship 6 isolated plates; Sky generates
 * whole vistas and we separate each into a small depth-plane stack
 * (scripts/separate-scene.mjs → lossless PNG masters in cinematic-masters/planes/),
 * then encode each plane to AVIF+WebP (scripts/encode-planes.mjs, ~80% lighter,
 * right-sized per plane). The real-art id list below mirrors SCENES
 * (DAWN+MID+ARRIVAL) in plates.ts.
 *
 * Run automatically as npm `prebuild` (wired in package.json).
 * Can also be run standalone: node scripts/validate-assets.mjs
 */

import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..');

/** Placeholder-rig ids (grey SVGs), back → front. Used when USE_PLACEHOLDERS=true.
 *  Mirrors PLACEHOLDER_SCENE.planes in plates.ts. */
const PLACEHOLDER_IDS = ['sky-dawn', 'sky-day', 'far-ridge', 'mid-mesa', 'near-rockface', 'foreground'];

/** Real-art ids (separated vista depth planes), back → front, UNIONED across the
 *  scenes of the descent. Used when USE_PLACEHOLDERS=false. Mirrors
 *  SCENES = [MID_SCENE, ARRIVAL_SCENE, FLOOR_SCENE] in plates.ts — if a scene's
 *  planes change there, grow/edit this list (it's a literal because plates.ts is
 *  TS and this script is plain ESM with no TS loader).
 *
 *  2-SCENE RECUT (2026-06-02): only these 5 planes are USED. DAWN (dawn-sky/mid/fg)
 *  and the arrival base (arrival-fg) are DROPPED — the cliff rises out of the
 *  persistent mid floor (mid-fg) instead. Those files remain on disk but are NOT
 *  gated (unreferenced). All 5 below must exist or the build is blocked at prebuild. */
const SCENE_PLANE_IDS = [
  // MID (opener): sky + buttes
  'mid-sky', 'mid-mid',
  // ARRIVAL: sky sliver + fluted wall
  'arrival-sky', 'arrival-cliff',
  // FLOOR (persistent ground, rendered on top): the mid valley floor
  'mid-fg',
];

/** Certificate badge images referenced from content/certificates.json. */
function checkCertificates(publicDir) {
  const certPath = join(ROOT, 'content', 'certificates.json');
  let certs;
  try {
    certs = JSON.parse(readFileSync(certPath, 'utf8'));
  } catch (err) {
    console.error(`[validate-assets] ERROR: could not read ${certPath}: ${err.message}`);
    process.exit(1);
  }

  const missing = [];
  for (const cert of certs) {
    const src = cert?.badgeImage?.src;
    if (!src) continue;
    const relPath = src.startsWith('/') ? src.slice(1) : src;
    const fullPath = join(publicDir, relPath);
    if (!existsSync(fullPath)) {
      missing.push({ kind: 'badge', id: cert.id ?? '(unknown)', src, expected: fullPath });
    }
  }
  return { count: certs.length, missing };
}

/** Read USE_PLACEHOLDERS straight out of plates.ts (no TS import needed). */
function usePlaceholders() {
  const platesPath = join(ROOT, 'components', 'cinematic', 'plates.ts');
  let text;
  try {
    text = readFileSync(platesPath, 'utf8');
  } catch {
    // No plates module yet → nothing to validate for the cinematic.
    return null;
  }
  const m = text.match(/export\s+const\s+USE_PLACEHOLDERS\s*=\s*(true|false)/);
  if (!m) {
    console.error('[validate-assets] WARN: could not find USE_PLACEHOLDERS in plates.ts; skipping plate check.');
    return null;
  }
  return m[1] === 'true';
}

/** The cinematic depth planes: placeholder SVGs (flag on) OR the real scene
 *  planes in their shipped AVIF+WebP formats (flag off). A real plane must have
 *  BOTH variants — the <picture> serves AVIF with a WebP fallback. */
function checkCinematicPlates(publicDir) {
  const flag = usePlaceholders();
  if (flag === null) return { mode: 'skipped', count: 0, missing: [] };

  // placeholder rig = the 6 grey SVGs; real art = the 9 separated beat planes,
  // each shipped as AVIF + WebP (both required).
  const ids = flag ? PLACEHOLDER_IDS : SCENE_PLANE_IDS;
  const exts = flag ? ['svg'] : ['avif', 'webp'];
  const missing = [];
  for (const id of ids) {
    for (const ext of exts) {
      const rel = flag
        ? join('images', 'cinematic', '_placeholders', `${id}.${ext}`)
        : join('images', 'cinematic', `${id}.${ext}`);
      const fullPath = join(publicDir, rel);
      if (!existsSync(fullPath)) {
        missing.push({
          kind: flag ? 'placeholder' : `plane(${ext})`,
          id,
          src: `/${rel.split(/[\\/]/).join('/')}`,
          expected: fullPath,
        });
      }
    }
  }
  // count = logical planes (each contributes ≥1 file); report stays readable.
  return { mode: flag ? 'placeholders' : 'real', count: ids.length, missing };
}

function main() {
  const publicDir = join(ROOT, 'public');

  const certs = checkCertificates(publicDir);
  const plates = checkCinematicPlates(publicDir);

  const missing = [...certs.missing, ...plates.missing];

  if (missing.length > 0) {
    console.error(`\n[validate-assets] BUILD BLOCKED — ${missing.length} missing asset(s):\n`);
    for (const m of missing) {
      console.error(`  ${m.kind}: ${m.id}`);
      console.error(`  src:  ${m.src}`);
      console.error(`  path: ${m.expected}`);
      console.error('');
    }
    if (certs.missing.length) {
      console.error('Add the missing badge PNG files to public/ before building.');
      console.error('See qa-reports/2026-05-29_DaniShamus_BadgeImage_Proposal.md for directory structure.');
    }
    if (plates.missing.length) {
      if (plates.mode === 'placeholders') {
        console.error('Add the missing cinematic PLACEHOLDER svgs to public/images/cinematic/_placeholders/.');
      } else {
        console.error('USE_PLACEHOLDERS is false — the shipped planes are AVIF + WebP. Regenerate them: `node scripts/separate-scene.mjs ...` (PNG masters → cinematic-masters/planes/) then `node scripts/encode-planes.mjs` (→ <id>.avif + <id>.webp). Or flip the flag back to true.');
      }
    }
    console.error('');
    process.exit(1);
  }

  console.log(`[validate-assets] OK — all ${certs.count} certificate badge image(s) found in public/.`);
  if (plates.mode === 'skipped') {
    console.log('[validate-assets] OK — cinematic plate check skipped (no plates.ts).');
  } else {
    const label = plates.mode === 'placeholders' ? 'placeholder svg' : 'real plate (AVIF+WebP)';
    console.log(`[validate-assets] OK — all ${plates.count} cinematic ${label}(s) found in public/.`);
  }
}

main();
