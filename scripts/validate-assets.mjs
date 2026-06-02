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
 *   - When USE_PLACEHOLDERS = false (the default now the real DAWN vista is
 *     separated), it requires the real scene planes
 *     /public/images/cinematic/<id>.png — currently the 3 dawn planes.
 *
 * Pivot note (2026-06-01): we no longer ship 6 isolated plates; Sky generates
 * whole vistas and we separate each into a small depth-plane stack. The real-art
 * id list below mirrors DAWN_SCENE.planes in plates.ts.
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

/** Real-art ids (separated vista depth planes), back → front. Used when
 *  USE_PLACEHOLDERS=false. Mirrors DAWN_SCENE.planes in plates.ts.
 *  (Kept as a literal here because plates.ts is TS and this script is plain ESM
 *  with no TS loader.) */
const DAWN_PLANE_IDS = ['dawn-sky', 'dawn-mid', 'dawn-fg'];

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

/** The cinematic depth planes (placeholder SVGs OR real scene PNGs per the flag). */
function checkCinematicPlates(publicDir) {
  const flag = usePlaceholders();
  if (flag === null) return { mode: 'skipped', count: 0, missing: [] };

  // placeholder rig = the 6 grey SVGs; real art = the separated vista planes.
  const ids = flag ? PLACEHOLDER_IDS : DAWN_PLANE_IDS;
  const missing = [];
  for (const id of ids) {
    const rel = flag
      ? join('images', 'cinematic', '_placeholders', `${id}.svg`)
      : join('images', 'cinematic', `${id}.png`);
    const fullPath = join(publicDir, rel);
    if (!existsSync(fullPath)) {
      missing.push({ kind: flag ? 'placeholder' : 'plane', id, src: `/${rel.split(/[\\/]/).join('/')}`, expected: fullPath });
    }
  }
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
        console.error('USE_PLACEHOLDERS is false — add the missing real scene planes to public/images/cinematic/<id>.png (separate them from public/images/cinematic/source/), or flip the flag back to true.');
      }
    }
    console.error('');
    process.exit(1);
  }

  console.log(`[validate-assets] OK — all ${certs.count} certificate badge image(s) found in public/.`);
  if (plates.mode === 'skipped') {
    console.log('[validate-assets] OK — cinematic plate check skipped (no plates.ts).');
  } else {
    const label = plates.mode === 'placeholders' ? 'placeholder svg' : 'real plate PNG';
    console.log(`[validate-assets] OK — all ${plates.count} cinematic ${label}(s) found in public/.`);
  }
}

main();
