#!/usr/bin/env node
/**
 * wire-showcase.mjs — apply a wiring spec (captured scenes → deliverables.json
 * media fields) through lib/showcaseWire.ts, which validates every patched
 * entry via DeliverableSchema at wire time.
 *
 *   node scripts/wire-showcase.mjs scripts/showcase/wiring.mjs [--dry]
 *
 * The spec module exports WIRING: an array of
 *   { slug, ogTheme?, heroShot?, cardImage?, heroPlate?, shots?: [...] }
 * where each media value is either a SceneRef ({ scene, viewport?, alt?,
 * caption?, focal?, chrome?, matte?, video?: { clip, alt }, darkVideo? }) or
 * an `{ asset }` record for an externally supplied screenshot already encoded
 * through scripts/encode-proof.mjs. A ref may opt into `preserveExisting` when
 * a scoped refresh must keep one already-wired motion asset byte-for-byte.
 * Every route finishes at the same schema gate.
 *
 * lib/showcaseWire.ts is TypeScript; this CLI bundles it once with the repo's
 * own esbuild (a vitest transitive — no installs) into a temp ESM file.
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function loadWireModule() {
  const esbuild = path.join(ROOT, 'node_modules', '.bin', 'esbuild');
  if (!fs.existsSync(esbuild)) throw new Error('esbuild bin not found in node_modules (installs are forbidden)');
  const out = path.join(os.tmpdir(), `showcase-wire-${process.pid}.mjs`);
  execFileSync(esbuild, [
    path.join(ROOT, 'lib', 'showcaseWire.ts'),
    '--bundle',
    '--format=esm',
    '--platform=node',
    `--outfile=${out}`,
  ], { cwd: ROOT, stdio: ['ignore', 'ignore', 'inherit'] });
  const mod = await import(pathToFileURL(out).href);
  fs.rmSync(out, { force: true });
  return mod;
}

async function main() {
  const specPath = process.argv[2];
  const dry = process.argv.includes('--dry');
  if (!specPath) {
    console.error('usage: node scripts/wire-showcase.mjs <specPath.mjs> [--dry]');
    process.exit(2);
  }
  const { WIRING } = await import(pathToFileURL(path.resolve(ROOT, specPath)).href);
  if (!Array.isArray(WIRING)) throw new Error('spec must export WIRING: []');

  const { themedShot, applyShowcase } = await loadWireModule();
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', 'showcase.manifest.json'), 'utf8'));
  const deliverablesPath = path.join(ROOT, 'content', 'deliverables.json');
  const deliverables = JSON.parse(fs.readFileSync(deliverablesPath, 'utf8'));

  const patches = {};
  for (const w of WIRING) {
    const patch = {};
    const existing = deliverables.find((d) => d.id === w.slug);
    const build = (ref, existingMedia) =>
      ref.preserveExisting && existingMedia
        ? { ...existingMedia }
        : ref.asset
        ? { ...ref.asset }
        : themedShot(manifest, w.slug, ref, {
            matte: ref.matte,
            video: ref.video,
            darkVideo: ref.darkVideo,
          });
    if (w.heroShot) patch.heroShot = build(w.heroShot, existing?.heroShot);
    if (w.cardImage) patch.cardImage = build(w.cardImage, existing?.cardImage);
    if (w.heroPlate) patch.heroPlate = { ...w.heroPlate };
    if (w.shots) patch.shots = w.shots.map((ref, i) => build(ref, existing?.shots?.[i]));
    if (w.ogTheme) patch.ogTheme = w.ogTheme;
    if (w.ogCard) patch.ogCard = w.ogCard;
    patches[w.slug] = patch;
  }

  const next = applyShowcase(deliverables, patches);
  if (dry) {
    console.log(`[wire-showcase] DRY — ${Object.keys(patches).length} slug(s) validate clean: ${Object.keys(patches).join(', ')}`);
    return;
  }
  fs.writeFileSync(deliverablesPath, JSON.stringify(next, null, 2) + '\n');
  console.log(`[wire-showcase] wrote ${deliverablesPath} — patched: ${Object.keys(patches).join(', ')}`);
}

main().catch((err) => {
  console.error('[wire-showcase] failed:', err.message);
  process.exit(1);
});
