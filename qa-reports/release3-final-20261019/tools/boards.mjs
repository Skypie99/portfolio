// Release 3 final: before (9ddc430 Codex screenshots / previous ring on the same export) | after (e3f1f1d) boards.
import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
const require = createRequire(path.join(process.cwd(), 'package.json')); const sharp = require('sharp');
const [P, WT] = process.argv.slice(2);
const OLD = path.join(WT, 'qa-reports/release3-flagstone-20261019/screenshots');
const label = (t, w) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="44"><rect width="100%" height="100%" fill="#111"/><text x="14" y="29" font-family="Menlo, monospace" font-size="20" fill="#fff">${t}</text></svg>`);
async function pair(a, b, la, lb, out, width) {
  const [A, B] = await Promise.all([a, b].map((f) => sharp(f).resize({ width, withoutEnlargement: false }).toBuffer({ resolveWithObject: true })));
  const h = Math.max(A.info.height, B.info.height) + 44; const gap = 24;
  await sharp({ create: { width: width * 2 + gap, height: h, channels: 3, background: '#777' } })
    .composite([{ input: label(la, width), left: 0, top: 0 }, { input: A.data, left: 0, top: 44 }, { input: label(lb, width), left: width + gap, top: 0 }, { input: B.data, left: width + gap, top: 44 }])
    .jpeg({ quality: 85 }).toFile(out);
  console.log(path.basename(out));
}
for (const eng of ['chromium', 'webkit']) for (const vp of ['1440', '393']) for (const th of ['light', 'dark']) {
  const id = `${eng}-${vp}-${th}-normal-proof`;
  await pair(path.join(OLD, `${id}.jpg`), path.join(P, `data/browser-${eng}/screenshots/${id}.jpg`), `BEFORE 9ddc430 ${id}`, `AFTER e3f1f1d ${id}`, path.join(P, `boards/${id}.jpg`), vp === '1440' ? 900 : 393);
}
const F = path.join(P, 'data/focus-v2/captures/focus-dense');
for (const [tag, bw, aw] of [['chromium_light_1440x900', 'BEFORE_worst_f764', 'worst_poster'], ['chromium_dark_1440x900', 'BEFORE_worst_f739', 'worst_f164'], ['webkit_light_393x852', 'BEFORE_worst_f714', 'worst_poster'], ['webkit_dark_393x852', 'BEFORE_worst_f135', 'worst_f164']]) {
  await pair(path.join(F, `${tag}_${bw}.png`), path.join(F, `${tag}_${aw}.png`), `BEFORE ring, worst frame`, `AFTER ink ring, worst frame`, path.join(P, `boards/focus-${tag}.jpg`), 360);
}
