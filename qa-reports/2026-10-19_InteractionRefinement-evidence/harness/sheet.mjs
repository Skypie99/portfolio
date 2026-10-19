#!/usr/bin/env node
/**
 * press-evidence/sheet.mjs — before/after comparison sheets from the harness
 * crops. Every tile is a live frame captured by harness.mjs; this script only
 * arranges and labels them (sharp). Nothing is redrawn.
 *
 *   node sheet.mjs --before ./before --after ./after --out ./sheets
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const arg = (flag, dflt) => {
  const i = process.argv.indexOf(flag);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : dflt;
};
const BEFORE = path.resolve(arg('--before', 'before'));
const AFTER = path.resolve(arg('--after', 'after'));
const OUT = path.resolve(arg('--out', 'sheets'));
fs.mkdirSync(OUT, { recursive: true });

const STATES = ['rest', 'hover', 'focus', 'pressed', 'released', 'cancelled'];
const LABEL_H = 44; // px per label band
const GUTTER = 16;
const BG = { r: 235, g: 232, b: 224, alpha: 1 }; // neutral board, neither theme
const INK = '#20302c';

const svgText = (w, h, text, size = 18, weight = 500, fill = INK) =>
  Buffer.from(
    `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg"><text x="${GUTTER}" y="${Math.round(h / 2 + size / 3)}" font-family="DejaVu Sans Mono, monospace" font-size="${size}" font-weight="${weight}" fill="${fill}">${text.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text></svg>`,
  );

async function tile(file, w, h) {
  if (!fs.existsSync(file)) {
    return sharp({ create: { width: w, height: h, channels: 4, background: { r: 215, g: 212, b: 204, alpha: 1 } } })
      .composite([{ input: svgText(w, h, '(not captured — state does not exist on this profile)', 14, 400, '#555'), top: 0, left: 0 }])
      .png().toBuffer();
  }
  return sharp(file).resize({ width: w, height: h, fit: 'contain', background: BG, position: 'left top' }).png().toBuffer();
}

const groups = new Map(); // key: vp-theme/control → states present
for (const root of [BEFORE, AFTER]) {
  for (const dir of fs.readdirSync(root)) {
    const full = path.join(root, dir);
    if (!fs.statSync(full).isDirectory()) continue;
    for (const f of fs.readdirSync(full)) {
      const m = /^(.*)-(rest|hover|focus|pressed|released|cancelled)\.png$/.exec(f);
      if (!m) continue;
      const key = `${dir}/${m[1]}`;
      if (!groups.has(key)) groups.set(key, new Set());
      groups.get(key).add(m[2]);
    }
  }
}

for (const [key, states] of groups) {
  const [profile, control] = key.split('/');
  const rows = STATES.filter((s) => states.has(s));
  // uniform tile size: the largest crop in this group (either side)
  let tw = 0, th = 0;
  for (const root of [BEFORE, AFTER]) for (const s of rows) {
    const f = path.join(root, profile, `${control}-${s}.png`);
    if (!fs.existsSync(f)) continue;
    const meta = await sharp(f).metadata();
    tw = Math.max(tw, meta.width); th = Math.max(th, meta.height);
  }
  if (!tw) continue;
  const rowLabelW = 220;
  const W = rowLabelW + tw * 2 + GUTTER * 3;
  const H = LABEL_H * 2 + rows.length * (th + GUTTER) + GUTTER;
  const composites = [];
  composites.push({ input: svgText(W, LABEL_H, `${control}  ·  ${profile}  ·  @2x crops, +20px context`, 18, 600), top: 0, left: 0 });
  composites.push({ input: svgText(tw, LABEL_H, 'BEFORE — main b3e992b', 16, 600, '#7a3f24'), top: LABEL_H, left: rowLabelW + GUTTER });
  composites.push({ input: svgText(tw, LABEL_H, 'AFTER — candidate', 16, 600, '#2f5c4f'), top: LABEL_H, left: rowLabelW + GUTTER * 2 + tw });
  let y = LABEL_H * 2 + GUTTER;
  for (const s of rows) {
    composites.push({ input: svgText(rowLabelW, th, s.toUpperCase(), 16, 600), top: y, left: 0 });
    composites.push({ input: await tile(path.join(BEFORE, profile, `${control}-${s}.png`), tw, th), top: y, left: rowLabelW + GUTTER });
    composites.push({ input: await tile(path.join(AFTER, profile, `${control}-${s}.png`), tw, th), top: y, left: rowLabelW + GUTTER * 2 + tw });
    y += th + GUTTER;
  }
  const out = path.join(OUT, `${profile}--${control}.png`);
  await sharp({ create: { width: W, height: H, channels: 4, background: BG } }).composite(composites).png({ compressionLevel: 9 }).toFile(out);
  console.log('[sheet]', path.relative(process.cwd(), out));
}
