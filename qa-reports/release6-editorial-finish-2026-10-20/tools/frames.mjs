#!/usr/bin/env node
/**
 * frames.mjs — a dense contact sheet from a recording, for reading motion
 * frame by frame at matched times.
 *
 *   node frames.mjs --in <clip.mp4> --out <sheet.jpg> --from <s> --span <s> [--count 12] [--crop x,y,w,h] [--width 420] [--label text]
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { opt, sharp, label } from './lib.mjs';

const IN = path.resolve(opt('in'));
const OUTF = path.resolve(opt('out'));
const FROM = Number(opt('from', 0));
const SPAN = Number(opt('span', 1.5));
const COUNT = Number(opt('count', 12));
const CROP = opt('crop', '') ? opt('crop').split(',').map(Number) : null;
const W = Number(opt('width', 420));
const LABEL = opt('label', path.basename(IN, '.mp4'));
const COLS = Number(opt('cols', 6));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'frames-'));
const frames = [];
for (let i = 0; i < COUNT; i++) {
  const t = FROM + (SPAN * i) / (COUNT - 1);
  const f = path.join(tmp, `f${i}.png`);
  spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', t.toFixed(3), '-i', IN, '-frames:v', '1', f]);
  if (fs.existsSync(f)) frames.push({ f, t });
}
const tiles = await Promise.all(
  frames.map(async ({ f }) => {
    let s = sharp(f);
    if (CROP) s = s.extract({ left: CROP[0], top: CROP[1], width: CROP[2], height: CROP[3] });
    return s.resize({ width: W }).toBuffer({ resolveWithObject: true });
  }),
);
const th = Math.max(...tiles.map((t) => t.info.height)) + 24;
const rows = Math.ceil(tiles.length / COLS);
const sheet = sharp({ create: { width: (W + 6) * COLS, height: th * rows + 36, channels: 3, background: '#8a8378' } }).composite([
  { input: label(LABEL, (W + 6) * COLS, 36), left: 0, top: 0 },
  ...tiles.flatMap((t, i) => {
    const c = i % COLS;
    const r = Math.floor(i / COLS);
    return [
      { input: label(`t=${frames[i].t.toFixed(2)}s`, W, 24), left: c * (W + 6), top: 36 + r * th },
      { input: t.data, left: c * (W + 6), top: 36 + r * th + 24 },
    ];
  }),
]);
await sheet.jpeg({ quality: 84 }).toFile(OUTF);
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`[frames] ${OUTF} (${frames.length} frames, ${FROM}s +${SPAN}s)`);
