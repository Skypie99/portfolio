#!/usr/bin/env node
/**
 * boards.mjs — before/after boards: pairs <before>/<name>.jpg with <after>/<name>.jpg
 * side by side under label strips, scaled to one column width (desktop 720,
 * phone 393 logical px → whatever the capture's pixel width is, halved for DPR 2).
 *
 *   node boards.mjs --before <dir> --after <dir> --out <dir> --names a,b,c \
 *        [--label-before "BEFORE · main f29ce93"] [--label-after "AFTER · Release 6"]
 */
import fs from 'node:fs';
import path from 'node:path';
import { opt, sharp, label } from './lib.mjs';

const BEFORE = path.resolve(opt('before'));
const AFTER = path.resolve(opt('after'));
const OUT = path.resolve(opt('out'));
const NAMES = opt('names').split(',');
const LB = opt('label-before', 'BEFORE · main f29ce93');
const LA = opt('label-after', 'AFTER · Release 6 candidate');
fs.mkdirSync(OUT, { recursive: true });

for (const name of NAMES) {
  const a = path.join(BEFORE, `${name}.jpg`);
  const b = path.join(AFTER, `${name}.jpg`);
  if (!fs.existsSync(a) || !fs.existsSync(b)) {
    console.error(`[boards] skip ${name}: missing ${!fs.existsSync(a) ? a : b}`);
    continue;
  }
  const meta = await sharp(a).metadata();
  const width = meta.width > 1000 ? 720 : Math.min(meta.width, 480);
  const [A, B] = await Promise.all([a, b].map((f) => sharp(f).resize({ width }).toBuffer({ resolveWithObject: true })));
  const h = Math.max(A.info.height, B.info.height) + 44;
  const gap = 24;
  await sharp({ create: { width: width * 2 + gap, height: h, channels: 3, background: '#8a8378' } })
    .composite([
      { input: label(`${LB} · ${name}`, width), left: 0, top: 0 },
      { input: A.data, left: 0, top: 44 },
      { input: label(`${LA} · ${name}`, width), left: width + gap, top: 0 },
      { input: B.data, left: width + gap, top: 44 },
    ])
    .jpeg({ quality: 84 })
    .toFile(path.join(OUT, `${name}.jpg`));
  console.log(`[boards] ${name}`);
}
