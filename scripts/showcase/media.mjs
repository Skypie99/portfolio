/**
 * media.mjs — masters → shipped assets, by shelling the repo's own encode
 * pipeline (SE-7: reuse, never rebuild). Stills ride encode-proof.mjs (AVIF
 * ladder + whale guard + LQIP); clips ride the hardened encode-video.mjs.
 * Everything returns manifest-ready file records with sha256 + bytes.
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { createRequire } from 'node:module';

import { REPO_ROOT, SHIP_ROOT } from './registry.mjs';
import { sha256 } from './manifest.mjs';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

function runJson(script, args) {
  const out = execFileSync('node', [path.join(REPO_ROOT, 'scripts', script), ...args], {
    encoding: 'utf8',
    cwd: REPO_ROOT,
    maxBuffer: 32 * 1024 * 1024,
  });
  const marker = out.lastIndexOf('--json--');
  if (marker === -1) throw new Error(`${script} emitted no --json-- block:\n${out.slice(-800)}`);
  return { json: JSON.parse(out.slice(marker + 8)), log: out.slice(0, marker) };
}

export async function masterInfo(file) {
  const meta = await sharp(file).metadata();
  return {
    path: path.relative(REPO_ROOT, file),
    sha256: sha256(file),
    bytes: fs.statSync(file).size,
    width: meta.width,
    height: meta.height,
  };
}

const shipRel = (slug, name) => `/showcase/${slug}/${name}`;

/** Encode one master still → public/showcase/<slug>/<stem>.{avif,webp} + lqip. */
export function encodeStill({ slug, stem, kind, masterPath }) {
  const outDir = path.join(SHIP_ROOT, slug);
  const { json } = runJson('encode-proof.mjs', [
    slug,
    masterPath,
    '--kind', kind,
    '--name', stem,
    '--out-dir', outDir,
    '--json',
  ]);
  const rec = (p, extra = {}) => ({
    path: shipRel(slug, path.basename(p)),
    bytes: fs.statSync(path.join(SHIP_ROOT, slug, path.basename(p))).size,
    ...extra,
  });
  return {
    shipped: [
      rec(json.avif.path, { quality: json.avif.quality }),
      rec(json.webp.path),
    ],
    lqip: json.lqip,
  };
}

/** Encode one raw clip → public/showcase/<slug>/clips/… via encode-video.mjs.
 *  Returns { mp4, webm|null (with reason), posters[], flags[] }. */
export function encodeClip({ slug, stem, masterPath, startS, seconds, posterAt, width = 390 }) {
  const outDir = path.join(SHIP_ROOT, slug, 'clips');
  const args = [
    slug,
    masterPath,
    '--name', stem,
    '--width', String(width),
    '--out-dir', outDir,
    '--json',
  ];
  if (startS != null) args.push('--start', String(Math.max(0, startS)));
  if (seconds != null) args.push('--seconds', String(seconds));
  if (posterAt != null) args.push('--poster-at', String(posterAt));
  const { json } = runJson('encode-video.mjs', args);
  const clipRel = (p) => `/showcase/${slug}/clips/${path.basename(p)}`;
  const fileRec = (p) => {
    const abs = path.join(outDir, path.basename(p));
    return fs.existsSync(abs) ? { path: clipRel(p), bytes: fs.statSync(abs).size } : null;
  };
  const posters = ['-poster.avif', '-poster.webp', '-poster.jpg']
    .map((suffix) => fileRec(`${stem}${suffix}`))
    .filter(Boolean);
  return {
    mp4: fileRec(json.video.mp4),
    webm: json.video.webm ? fileRec(json.video.webm) : null,
    webmDropReason: json.webmDropReason ?? null,
    posters,
    needsCaptions: !json.video.captions,
  };
}
