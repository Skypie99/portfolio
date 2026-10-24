#!/usr/bin/env node
/**
 * boards.mjs — before | after boards from room-capture.mjs output.
 *
 *   node qa-reports/creative-release7-flagship-detail-2026-10-22/tools/boards.mjs \
 *        --before <dir> --after <dir> --out <dir> [--before-label "main 0933245"] [--after-label "candidate"]
 *
 * Pairs `<before>/before-<theme>-<size>-<frame>.jpg` with the same name under
 * `<after>` and writes `<out>/<theme>-<size>-<frame>.jpg`: the two captures
 * side by side at their native pixels, tops aligned, the shorter one padded
 * (never scaled, so sizes compare truly), each under a label strip naming
 * build, theme, size and frame. The label strip is the only annotation; the
 * captures are not altered.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..', '..');
const require = createRequire(path.join(ROOT, 'package.json'));
const sharp = require('sharp');
const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf(`--${n}`); return i === -1 ? d : argv[i + 1]; };
const BEFORE = path.resolve(opt('before')); const AFTER = path.resolve(opt('after')); const OUT = path.resolve(opt('out'));
const BL = opt('before-label', 'BEFORE'); const AL = opt('after-label', 'AFTER');
fs.mkdirSync(OUT, { recursive: true });
const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const strip = (t, w, h) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="#1d1b17"/><text x="16" y="${Math.round(h * 0.64)}" font-family="Menlo, DejaVu Sans Mono, monospace" font-size="${Math.round(h * 0.4)}" fill="#f3ede4">${esc(t)}</text></svg>`);
const GAP = 16; const LABEL = 48;
for (const f of fs.readdirSync(BEFORE).filter((n) => n.startsWith('before-') && n.endsWith('.jpg'))) {
  const key = f.slice('before-'.length);
  const af = path.join(AFTER, `after-${key}`);
  if (!fs.existsSync(af)) continue;
  const [bm, am] = await Promise.all([sharp(path.join(BEFORE, f)).metadata(), sharp(af).metadata()]);
  const H = Math.max(bm.height, am.height);
  const bw = bm.width; const aw = am.width;
  const [bb, ab] = await Promise.all([sharp(path.join(BEFORE, f)).toBuffer(), sharp(af).toBuffer()]);
  const name = key.replace(/\.jpg$/, '');
  const W = bw + GAP + aw;
  await sharp({ create: { width: W, height: H + LABEL, channels: 3, background: '#1d1b17' } })
    .composite([
      { input: strip(`BEFORE · ${BL} · ${name}`, bw, LABEL), left: 0, top: 0 },
      { input: strip(`AFTER · ${AL} · ${name}`, aw, LABEL), left: bw + GAP, top: 0 },
      { input: bb, left: 0, top: LABEL },
      { input: ab, left: bw + GAP, top: LABEL },
    ])
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(path.join(OUT, `${name}.jpg`));
  console.log('board', name);
}
