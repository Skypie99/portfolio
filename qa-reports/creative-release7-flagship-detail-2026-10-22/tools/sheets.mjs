#!/usr/bin/env node
/**
 * sheets.mjs — contact sheets from the room-motion recordings, before above
 * after, cut at matched times.
 *
 *   node qa-reports/creative-release7-flagship-detail-2026-10-22/tools/sheets.mjs \
 *        --frames <dir of <clip>/f###.png> --out <dir> [--every 1] [--cols 8]
 *
 * Expects frame folders named motion-<before|after>-<theme>-<WxH> (as written
 * by `ffmpeg -sseof -4.6 -i clip.mp4 -vf fps=5`, i.e. 200ms per frame from 4.6s
 * before the clip's end, which is where the 1600ms glide begins). Each output
 * sheet stacks the before row over the after row for one size, every frame
 * stamped with its time from the start of the trimmed clip. The stamp is the
 * only annotation.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..', '..');
const require = createRequire(path.join(ROOT, 'package.json'));
const sharp = require('sharp');
const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf(`--${n}`); return i === -1 ? d : argv[i + 1]; };
const FR = path.resolve(opt('frames')); const OUT = path.resolve(opt('out'));
const EVERY = Number(opt('every', 1)); const COLS = Number(opt('cols', 8));
fs.mkdirSync(OUT, { recursive: true });
const stamp = (t, w) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="30"><rect width="100%" height="100%" fill="#1d1b17"/><text x="8" y="21" font-family="Menlo, DejaVu Sans Mono, monospace" font-size="15" fill="#f3ede4">${t}</text></svg>`);
const clips = fs.readdirSync(FR).filter((d) => d.startsWith('motion-before-'));
for (const before of clips) {
  const key = before.slice('motion-before-'.length);
  const after = `motion-after-${key}`;
  if (!fs.existsSync(path.join(FR, after))) continue;
  const rows = [];
  for (const clip of [before, after]) {
    const files = fs.readdirSync(path.join(FR, clip)).filter((f) => f.endsWith('.png')).sort().filter((_, i) => i % EVERY === 0).slice(0, COLS * 3);
    rows.push({ clip, files });
  }
  const meta = await sharp(path.join(FR, before, rows[0].files[0])).metadata();
  const cellW = meta.width > meta.height ? 360 : 180;
  const cellH = Math.round((meta.height / meta.width) * cellW);
  const n = Math.min(rows[0].files.length, rows[1].files.length);
  const cols = Math.min(COLS, n);
  const lines = Math.ceil(n / cols);
  const blockH = lines * (cellH + 30 + 6);
  const W = cols * (cellW + 6); const H = 2 * (blockH + 40);
  const comps = [];
  for (const [r, row] of rows.entries()) {
    const y0 = r * (blockH + 40);
    comps.push({ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="40"><rect width="100%" height="100%" fill="#2b2822"/><text x="10" y="27" font-family="Menlo, DejaVu Sans Mono, monospace" font-size="18" fill="#f3ede4">${r === 0 ? 'BEFORE · main 0933245' : 'AFTER · candidate'} · ${key} · 200 ms per frame</text></svg>`), left: 0, top: y0 });
    for (let i = 0; i < n; i++) {
      const x = (i % cols) * (cellW + 6); const y = y0 + 40 + Math.floor(i / cols) * (cellH + 36);
      comps.push({ input: stamp(`${(i * EVERY * 200).toString().padStart(4, ' ')} ms`, cellW), left: x, top: y });
      comps.push({ input: await sharp(path.join(FR, row.clip, row.files[i])).resize(cellW, cellH).toBuffer(), left: x, top: y + 30 });
    }
  }
  await sharp({ create: { width: W, height: H, channels: 3, background: '#1d1b17' } }).composite(comps).jpeg({ quality: 78, mozjpeg: true }).toFile(path.join(OUT, `arrival-${key}.jpg`));
  console.log('sheet', key, `${n} frames`);
}
