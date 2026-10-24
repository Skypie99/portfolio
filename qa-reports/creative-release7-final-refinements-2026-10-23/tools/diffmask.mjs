// Writes a red-on-grey diff mask between two PNGs (same size). Usage: node diffmask.mjs a.png b.png out.png
import { createRequire } from 'node:module'; const sharp = createRequire('/Users/skypie/Portfolio/package.json')('sharp');
const [a, b, out] = process.argv.slice(2);
const [A, B] = await Promise.all([a, b].map((f) => sharp(f).ensureAlpha().raw().toBuffer({ resolveWithObject: true })));
const { width, height } = A.info; const o = Buffer.alloc(width * height * 4); const rows = new Map();
for (let i = 0; i < width * height * 4; i += 4) { const d = Math.abs(A.data[i] - B.data[i]) + Math.abs(A.data[i + 1] - B.data[i + 1]) + Math.abs(A.data[i + 2] - B.data[i + 2]); const g = (A.data[i] + A.data[i + 1] + A.data[i + 2]) / 6 + 100; if (d > 24) { o[i] = 230; o[i + 1] = 20; o[i + 2] = 20; const y = Math.floor(i / 4 / width); rows.set(y, (rows.get(y) || 0) + 1); } else { o[i] = o[i + 1] = o[i + 2] = g; } o[i + 3] = 255; }
await sharp(o, { raw: { width, height, channels: 4 } }).png().toFile(out);
const bands = []; let cur = null; for (const y of [...rows.keys()].sort((p, q) => p - q)) { if (cur && y - cur[1] <= 3) { cur[1] = y; cur[2] += rows.get(y); } else { cur = [y, y, rows.get(y)]; bands.push(cur); } }
console.log('changed-row bands [y0,y1,px]:', JSON.stringify(bands));
