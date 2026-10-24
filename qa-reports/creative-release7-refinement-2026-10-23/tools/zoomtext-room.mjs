#!/usr/bin/env node
/**
 * zoomtext-room.mjs — the flagship room under text-only 200% enlargement
 * (root font-size doubled: every rem-sized text and box follows, px-sized
 * boxes do not), from a BUILT export. Frames the room and reports horizontal
 * overflow and any text line in the room whose box crosses the viewport edge.
 *
 *   node qa-reports/creative-release7-flagship-detail-2026-10-22/tools/zoomtext-room.mjs \
 *        --dir <export dir> --out <dir> [--tag after] [--sizes 1440x900@1,1024x768@1,768x1024@1,393x852@2,320x568@2] [--port 3411]
 *
 * Refinement-round copy (2026-10-23) of the 2026-10-22 tool, with --sizes so tablet is probed too.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..', '..');
const require = createRequire(path.join(ROOT, 'package.json'));
const { chromium } = require('playwright-core');
const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf(`--${n}`); return i === -1 ? d : argv[i + 1]; };
const DIR = path.resolve(opt('dir', 'out')); const OUT = path.resolve(opt('out', 'boundaries')); const TAG = opt('tag', 'after');
const PORT = Number(opt('port', 3411));
const SIZES = opt('sizes', '1440x900@1,1024x768@1,768x1024@1,393x852@2,320x568@2').split(',').map((t) => /^(\d+)x(\d+)@([\d.]+)$/.exec(t).slice(1).map(Number));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
fs.mkdirSync(OUT, { recursive: true });
const srv = spawn(process.execPath, [path.join(ROOT, 'scripts', 'static-serve.mjs'), DIR, String(PORT)], { stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise((r) => srv.stdout.once('data', r));
const browser = await chromium.launch({ headless: true });
const rows = [];
try {
  for (const [w, h, dpr] of SIZES) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dpr, colorScheme: 'light', ...(w < 600 ? { isMobile: true, hasTouch: true } : {}) });
    await ctx.addInitScript(() => { try { localStorage.setItem('theme', 'light'); } catch { /* denied */ } });
    const page = await ctx.newPage();
    await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'networkidle' });
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; return document.fonts.ready; });
    await sleep(400);
    const { top, bottom } = await page.evaluate(() => { const r = document.querySelector('#flagship').getBoundingClientRect(); return { top: r.top + scrollY, bottom: r.bottom + scrollY }; });
    for (let y = 0; y <= bottom; y += 350) { await page.evaluate((v) => scrollTo(0, v), y); await sleep(40); }
    await page.evaluate((v) => scrollTo(0, v), top);
    await sleep(2600);
    const g = await page.evaluate(() => {
      const room = document.querySelector('#flagship'); const vw = document.documentElement.clientWidth;
      const crossing = [...room.querySelectorAll('p, h2, a, span')].filter((el) => el.textContent.trim() && !el.closest('[aria-hidden="true"]')).map((el) => ({ el, r: el.getBoundingClientRect() })).filter(({ r }) => r.width > 0 && (r.right > vw + 0.5 || r.left < -0.5)).map(({ el, r }) => ({ text: el.textContent.trim().slice(0, 40), left: Math.round(r.left), right: Math.round(r.right) }));
      const tag = room.querySelector('[data-exhibit-detail] > p')?.getBoundingClientRect();
      return { overflowX: document.documentElement.scrollWidth - vw, crossing, tagBox: tag ? [Math.round(tag.left), Math.round(tag.right), Math.round(tag.height)] : null, vw };
    });
    const tag = `${TAG}-zoomtext-light-${w}x${h}@${dpr}`;
    await page.locator('#flagship').screenshot({ path: path.join(OUT, `${tag}-room.jpg`), type: 'jpeg', quality: 80 });
    rows.push({ tag, ...g });
    console.log(tag, JSON.stringify(g));
    await ctx.close();
  }
} finally { await browser.close(); srv.kill(); }
fs.writeFileSync(path.join(OUT, `zoomtext-${TAG}.json`), JSON.stringify(rows, null, 1));
