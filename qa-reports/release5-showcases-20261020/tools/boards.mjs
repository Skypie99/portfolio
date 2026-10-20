#!/usr/bin/env node
/**
 * boards.mjs — before/after boards for the Release 5 showcase review.
 *
 *   node qa-reports/release5-showcases-20261020/tools/boards.mjs --before <dir> --after <dir> --out <dir>
 *        [--routes a,b] [--themes light,dark] [--tags 1440x900,393x852@2] [--kinds fold,full]
 *
 * For each route × theme × size × kind it pairs <before>/<route>/<theme>-<size>-<kind>.jpg
 * with <after>/<route>/<theme>-<size>-<kind>.jpg side by side under a label strip,
 * scaled to one column width (desktop 720px, phone 393px), heights padded to the
 * taller of the two. Pure sharp composition of existing captures; no browser.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? def : args[i + 1];
};
const BEFORE = path.resolve(opt('before'));
const AFTER = path.resolve(opt('after'));
const OUT = path.resolve(opt('out'));
const ROUTES = opt('routes', 'prompt-library,claude-corp,ghost-code,dashboard').split(',');
const THEMES = opt('themes', 'light,dark').split(',');
const TAGS = opt('tags', '1440x900,393x852@2').split(',');
const KINDS = opt('kinds', 'fold,full').split(',');
const LABEL_BEFORE = opt('label-before', 'BEFORE · main f08c327');
const LABEL_AFTER = opt('label-after', 'AFTER · Release 5 candidate');

const label = (t, w) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="44"><rect width="100%" height="100%" fill="#1d1b17"/><text x="14" y="29" font-family="Menlo, DejaVu Sans Mono, monospace" font-size="17" fill="#f3ede4">${t}</text></svg>`,
  );

async function pair(a, b, la, lb, out, width) {
  const [A, B] = await Promise.all(
    [a, b].map((f) => sharp(f).resize({ width, withoutEnlargement: false }).toBuffer({ resolveWithObject: true })),
  );
  const h = Math.max(A.info.height, B.info.height) + 44;
  const gap = 24;
  await sharp({ create: { width: width * 2 + gap, height: h, channels: 3, background: '#8a8378' } })
    .composite([
      { input: label(la, width), left: 0, top: 0 },
      { input: A.data, left: 0, top: 44 },
      { input: label(lb, width), left: width + gap, top: 0 },
      { input: B.data, left: width + gap, top: 44 },
    ])
    .jpeg({ quality: 84 })
    .toFile(out);
}

fs.mkdirSync(OUT, { recursive: true });
for (const route of ROUTES) {
  for (const theme of THEMES) {
    for (const tag of TAGS) {
      for (const kind of KINDS) {
        const file = `${theme}-${tag}-${kind}.jpg`;
        const a = path.join(BEFORE, route, file);
        const b = path.join(AFTER, route, file);
        if (!fs.existsSync(a) || !fs.existsSync(b)) {
          console.log(`[boards] skip ${route} ${file} (missing side)`);
          continue;
        }
        const width = tag.startsWith('393') ? 393 : 720;
        const out = path.join(OUT, `${route}-${theme}-${tag}-${kind}.jpg`);
        await pair(a, b, `${LABEL_BEFORE} · ${route} · ${theme} · ${tag}`, `${LABEL_AFTER} · ${route} · ${theme} · ${tag}`, out, width);
        console.log(`[boards] ${path.basename(out)}`);
      }
    }
  }
}
