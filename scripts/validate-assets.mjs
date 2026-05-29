/**
 * validate-assets.mjs — Build-time validation of referenced static assets.
 *
 * Gap 4 (Gary): Checks that every badgeImage path referenced in
 * content/certificates.json exists in public/. Fails with a clear
 * error message listing missing files so the build is blocked before
 * any missing badge reaches production.
 *
 * Run automatically as npm `prebuild` (wired in package.json).
 * Can also be run standalone: node scripts/validate-assets.mjs
 */

import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..');

function main() {
  const certPath = join(ROOT, 'content', 'certificates.json');
  const publicDir = join(ROOT, 'public');

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

    // src is like "/images/certificates/<slug>/badge.png"
    // Strip the leading "/" and resolve against public/
    const relPath = src.startsWith('/') ? src.slice(1) : src;
    const fullPath = join(publicDir, relPath);

    if (!existsSync(fullPath)) {
      missing.push({ id: cert.id ?? '(unknown)', src, expected: fullPath });
    }
  }

  if (missing.length > 0) {
    console.error(`\n[validate-assets] BUILD BLOCKED — ${missing.length} missing badge image(s):\n`);
    for (const m of missing) {
      console.error(`  cert: ${m.id}`);
      console.error(`  src:  ${m.src}`);
      console.error(`  path: ${m.expected}`);
      console.error('');
    }
    console.error('Add the missing badge PNG files to public/ before building.');
    console.error('See qa-reports/2026-05-29_DaniShamus_BadgeImage_Proposal.md for directory structure.\n');
    process.exit(1);
  }

  console.log(`[validate-assets] OK — all ${certs.length} certificate badge image(s) found in public/.`);
}

main();
