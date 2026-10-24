// Side-by-side board: before | after, same frame, labelled outside the screenshots.
import { createRequire } from 'node:module'; const req = createRequire('/Users/skypie/Portfolio/package.json'); const sharp = req('sharp');
const [a, b, out, label] = process.argv.slice(2);
const [A, B] = await Promise.all([a, b].map((f) => sharp(f).metadata()));
const H = Math.max(A.height, B.height), gap = 24, top = 40;
const svg = `<svg width="${A.width + B.width + gap * 3}" height="${top}"><text x="${gap}" y="27" font-family="Helvetica" font-size="20" fill="#333">BEFORE (main 43788b2) · ${label}</text><text x="${A.width + gap * 2}" y="27" font-family="Helvetica" font-size="20" fill="#333">AFTER (refined crop)</text></svg>`;
await sharp({ create: { width: A.width + B.width + gap * 3, height: H + top + gap, channels: 3, background: '#f2f2f2' } })
  .composite([{ input: Buffer.from(svg), top: 0, left: 0 }, { input: a, top, left: gap }, { input: b, top, left: A.width + gap * 2 }]).png().toFile(out);
