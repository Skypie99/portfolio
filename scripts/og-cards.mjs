#!/usr/bin/env node
/**
 * og-cards.mjs — cut the dedicated unfurl rasters (og:image) from the capture
 * factory's DARK masters: 1200×630 JPG per themed project, written to
 * public/showcase/<slug>/og-card.jpg (stable name — re-runs replace).
 *
 * WHY dark, why JPG: W0-05 measured the pale card melting into white LinkedIn
 * feeds while dark survives them; unfurl fetchers are format-conservative, so
 * the og raster is always a JPG even though the on-site cards ride AVIF/WebP.
 * Source of truth: content/showcase.manifest.json (the dark desktop master of
 * each project's hero scene).
 *
 *   node scripts/og-cards.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BANK_ROOT =
  process.env.SHOWCASE_BANK_ROOT || path.join(ROOT, 'design-reviews', 'showcase-refresh');

/** slug → the hero scene whose dark desktop master feeds the unfurl. */
const OG_SOURCES = {
  'flagstone': 'map-overview',
  'prompt-library': 'home',
  'claude-corp': 'hero-pipeline',
  'dashboard': 'command-center',
  'ghost-code': 'board',
};

const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', 'showcase.manifest.json'), 'utf8'));

let total = 0;
for (const [slug, scene] of Object.entries(OG_SOURCES)) {
  const row = manifest.captures.find(
    (c) => c.project === slug && c.scene === scene && c.theme === 'dark' && c.viewport === 'desktop' && !c.clip,
  );
  if (!row?.files?.master?.path) {
    console.error(`[og-cards] SKIP ${slug} — no dark desktop master for ${scene}`);
    continue;
  }
  const master = path.resolve(BANK_ROOT, row.files.master.path);
  const outDir = path.join(ROOT, 'public', 'showcase', slug);
  fs.mkdirSync(outDir, { recursive: true });
  const out = path.join(outDir, 'og-card.jpg');
  await sharp(master)
    .resize({ width: 1200, height: 630, fit: 'cover', position: 'attention' })
    .jpeg({ quality: 78, mozjpeg: true })
    .toFile(out);
  const bytes = fs.statSync(out).size;
  total += bytes;
  console.log(`[og-cards] ${slug}/og-card.jpg  ${(bytes / 1024).toFixed(0)}KB  (from ${scene}.dark.desktop)`);
}
console.log(`[og-cards] total ${(total / 1024).toFixed(0)}KB`);
