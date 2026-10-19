#!/usr/bin/env node
/**
 * press-evidence/strip.mjs — frame strips from the sequence recordings, so the
 * navigation acknowledgement can be read at a glance without playing video.
 *
 *   node strip.mjs --seq ./after-seq --label after --out ./after-seq/strips
 *
 * Frames are pulled with ffmpeg from the real .webm at 10 fps across the
 * press → release → dissolve → arrival window (press mark − 0.2s … + 1.6s) and
 * tiled left-to-right, top-to-bottom. Nothing is synthesised.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ffmpeg = require('ffmpeg-static');

const arg = (flag, dflt) => {
  const i = process.argv.indexOf(flag);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : dflt;
};
const SEQ = path.resolve(arg('--seq', 'seq'));
const OUT = path.resolve(arg('--out', path.join(SEQ, 'strips')));
fs.mkdirSync(OUT, { recursive: true });

const runs = JSON.parse(fs.readFileSync(path.join(SEQ, 'sequence.json'), 'utf8'));
for (const run of runs) {
  const video = path.join(SEQ, run.video);
  const mark = (w) => run.marks.find((m) => m.what === w)?.t ?? 0;
  const windows = [
    { name: 'A-doorway', from: mark('press') - 200, to: mark('press') + 1600 },
  ];
  if (run.seqB) windows.push({ name: 'B-menu-item', from: mark('item-press') - 200, to: mark('item-press') + 1600 });
  for (const w of windows) {
    const start = Math.max(0, w.from) / 1000;
    const dur = (w.to - Math.max(0, w.from)) / 1000;
    const scale = run.run.startsWith('phone') ? 'scale=iw/2:ih/2' : 'scale=iw/3:ih/3';
    const out = path.join(OUT, `${run.run}-${w.name}.png`);
    execFileSync(ffmpeg, [
      '-y', '-loglevel', 'error', '-ss', String(start), '-t', String(dur), '-i', video,
      '-vf', `fps=10,${scale},tile=6x3:padding=4:margin=4:color=#ebe8e0`,
      '-frames:v', '1', out,
    ]);
    console.log('[strip]', path.relative(process.cwd(), out), `(${start.toFixed(2)}s → +${dur.toFixed(1)}s, 10fps, reading order)`);
  }
}
