#!/usr/bin/env node
/**
 * webkit-room.mjs — the flagship room in Playwright's WebKit build, from a
 * BUILT export: frames plus the geometry that the composition depends on.
 *
 *   node qa-reports/creative-release7-flagship-detail-2026-10-22/tools/webkit-room.mjs \
 *        --dir <export dir> --out <dir> [--tag after] [--sizes 1440x900@1,768x1024@1,393x852@2] [--port 3401]
 *
 * Refinement-round copy (2026-10-23) of the 2026-10-22 tool, with --sizes so
 * tablet widths are checked too. A spot check of the engine family, not a Safari test: Playwright WebKit is
 * not the shipping Safari, and native Safari + VoiceOver on Apple hardware
 * remain the deferred physical-device pass (GitHub issue #38).
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..', '..');
const require = createRequire(path.join(ROOT, 'package.json'));
const { webkit } = require('playwright-core');
const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf(`--${n}`); return i === -1 ? d : argv[i + 1]; };
const DIR = path.resolve(opt('dir', 'out')); const OUT = path.resolve(opt('out', 'webkit')); const TAG = opt('tag', 'after');
const PORT = Number(opt('port', 3401));
const SIZES = opt('sizes', '1440x900@1,768x1024@1,393x852@2').split(',').map((t) => /^(\d+)x(\d+)@([\d.]+)$/.exec(t).slice(1).map(Number));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
fs.mkdirSync(OUT, { recursive: true });
const srv = spawn(process.execPath, [path.join(ROOT, 'scripts', 'static-serve.mjs'), DIR, String(PORT)], { stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise((r) => srv.stdout.once('data', r));
const browser = await webkit.launch({ headless: true });
const rows = [];
try {
  for (const theme of ['light', 'dark']) for (const [w, h, dpr] of SIZES) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dpr, colorScheme: theme, ...(w < 600 ? { isMobile: true, hasTouch: true } : {}) });
    await ctx.addInitScript((t) => { try { localStorage.setItem('theme', t); } catch { /* denied */ } }, theme);
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const { top, bottom } = await page.evaluate(() => { const r = document.querySelector('#flagship').getBoundingClientRect(); return { top: r.top + scrollY, bottom: r.bottom + scrollY }; });
    for (let y = 0; y <= bottom; y += 350) { await page.evaluate((v) => scrollTo(0, v), y); await sleep(50); }
    await page.evaluate((v) => scrollTo(0, v), top);
    await sleep(2600);
    const g = await page.evaluate(() => {
      const room = document.querySelector('#flagship'); const rb = room.getBoundingClientRect();
      const b = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top - rb.top), Math.round(r.width), Math.round(r.height)]; };
      const plate = room.querySelector('[data-exhibit-detail] .overflow-hidden'); const screen = room.querySelector('.pr-screen'); const frame = room.querySelector('.pr-frame-phone');
      const leader = room.querySelector('[data-exhibit-detail] .h-px.bg-terracotta');
      const img = plate?.querySelector('img');
      return { plate: b(plate), screen: b(screen), frame: b(frame), leader: b(leader), leaderTransform: leader ? getComputedStyle(leader).transform : null, plateImg: img ? [img.complete, img.naturalWidth, img.currentSrc.split('/').pop()] : null, slab: [...room.querySelectorAll('.pr-world')].some((e) => getComputedStyle(e).display !== 'none'), overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth };
    });
    const tag = `${TAG}-webkit-${theme}-${w}x${h}@${dpr}`;
    await page.locator('#flagship').screenshot({ path: path.join(OUT, `${tag}-room.jpg`), type: 'jpeg', quality: 82 });
    rows.push({ tag, errors, ...g });
    console.log(tag, JSON.stringify(g), 'errors', errors.length);
    await ctx.close();
  }
} finally { await browser.close(); srv.kill(); }
fs.writeFileSync(path.join(OUT, `webkit-${TAG}.json`), JSON.stringify({ engine: `Playwright WebKit (playwright-core ${require('playwright-core/package.json').version})`, rows }, null, 1));
