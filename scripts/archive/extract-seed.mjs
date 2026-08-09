#!/usr/bin/env node
/**
 * extract-seed.mjs — lift the prototype's seed data into a gitignored JSON file
 * that seeds the archive through the app's own legacy-import path (so seeding
 * exercises the exact importer real backups use).
 *
 * The prototype's SUPPLY_SEED..ART_SEED block is self-contained (only the E/A
 * helpers it defines), so we slice it out and evaluate it in an isolated
 * node:vm — no browser, no DOM. Then we hard-assert the invariants before
 * writing scripts/archive/out/seed-legacy.json (personal data; gitignored).
 *
 * Usage: node scripts/archive/extract-seed.mjs
 *   ARCHIVE_PROTOTYPE=/path/to/studio_archive.html overrides the source.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROTOTYPE = process.env.ARCHIVE_PROTOTYPE ?? '/Users/skypie/Downloads/studio_archive.html';
const OUT = resolve(__dirname, 'out', 'seed-legacy.json');

function fail(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

const src = readFileSync(PROTOTYPE, 'utf8');
const start = src.indexOf('const SUPPLY_SEED = [');
const end = src.indexOf('function esc('); // the statement immediately after ART_SEED
if (start === -1 || end === -1 || end < start) fail('could not locate the seed block in the prototype');

const block = src.slice(start, end);
let seed;
try {
  seed = vm.runInNewContext(`${block}\n;({ supplies: SUPPLY_SEED, arts: ART_SEED });`, Object.create(null), {
    timeout: 5000,
  });
} catch (e) {
  fail(`evaluating the seed block failed: ${e.message}`);
}

const { supplies, arts } = seed;

// ---- invariants (the reason this is a script and not a copy-paste) ----
if (!Array.isArray(supplies) || supplies.length !== 119) fail(`expected 119 supplies, got ${supplies?.length}`);
if (!Array.isArray(arts) || arts.length !== 67) fail(`expected 67 artworks, got ${arts?.length}`);

const swatched = supplies.filter((s) => s.swatched === true).length;
if (swatched !== 16) fail(`expected 16 swatched supplies, got ${swatched}`);

const supPrefix = supplies.filter((s) => s.id.startsWith('sup-')).length;
const sup2Prefix = supplies.filter((s) => s.id.startsWith('sup2-')).length;
if (supPrefix !== 20) fail(`expected 20 name-derived sup- ids, got ${supPrefix}`);
if (sup2Prefix !== 99) fail(`expected 99 sup2- ids, got ${sup2Prefix}`);

for (let i = 0; i < arts.length; i++) {
  const order = (i + 1) * 10;
  if (arts[i].order !== order) fail(`artwork ${i}: order ${arts[i].order} != ${order}`);
  if (arts[i].id !== `art-${order}`) fail(`artwork ${i}: id ${arts[i].id} != art-${order}`);
}

const badHex = supplies.find((s) => !/^#[0-9a-f]{6}$/.test(s.hex));
if (badHex) fail(`supply "${badHex.name}" has a hex the DB constraint would reject: ${badHex.hex}`);

const blob = JSON.stringify(seed);
for (const ch of ['é', '—', '✓', 'à']) {
  // é — ✓ à — the diacritics/marks the display + search must preserve
  if (!blob.includes(ch)) fail(`expected unicode "${ch}" to survive extraction`);
}

const sanguine = supplies.find((s) => s.id === 'sup-sanguine');
if (!sanguine || sanguine.hex !== '#a8542f') fail('sup-sanguine missing or wrong hex');
if (arts[66].id !== 'art-670') fail('last artwork should be art-670');

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify({ supplies, arts }, null, 2), 'utf8');
console.log(`✓ wrote ${supplies.length} supplies + ${arts.length} artworks → ${OUT}`);
console.log(`  swatched ${swatched} · sup- ${supPrefix} · sup2- ${sup2Prefix} · orders 10–670`);
