#!/usr/bin/env node
/**
 * perf-room.mjs — what the flagship room costs, from a BUILT export: every
 * network request the homepage makes up to and through the room (with the
 * capture's own requests singled out), the layout shift accumulated while a
 * reader walks from the top through the room, and the bytes of the built
 * homepage HTML and CSS.
 *
 *   node qa-reports/creative-release7-flagship-detail-2026-10-22/tools/perf-room.mjs \
 *        --dir <export dir> --out <dir> --tag before|after [--sizes 1440x900@1,393x852@2] [--port 3381]
 *
 * Layout shift is read from a PerformanceObserver buffered from navigation
 * (type layout-shift, excluding hadRecentInput), summed over the whole walk
 * and separately over the frames where the room is in the viewport. Network
 * comes from Playwright's request/response events (bytes = Content-Length or
 * body size). Loopback only.
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
const DIR = path.resolve(opt('dir', 'out'));
const OUT = path.resolve(opt('out', 'perf'));
const TAG = opt('tag', 'after');
const SIZES = opt('sizes', '1440x900@1,393x852@2').split(',').map((t) => { const m = /^(\d+)x(\d+)@([\d.]+)$/.exec(t); return { w: +m[1], h: +m[2], dpr: +m[3], tag: t }; });
const PORT = Number(opt('port', 3381));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
fs.mkdirSync(OUT, { recursive: true });

const dirBytes = (rel, ext) => fs.readdirSync(path.join(DIR, rel)).filter((f) => f.endsWith(ext)).reduce((a, f) => a + fs.statSync(path.join(DIR, rel, f)).size, 0);
const files = { indexHtml: fs.statSync(path.join(DIR, 'index.html')).size, cssTotal: dirBytes('_next/static/css', '.css') };

const srv = spawn(process.execPath, [path.join(ROOT, 'scripts', 'static-serve.mjs'), DIR, String(PORT)], { stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise((r) => srv.stdout.once('data', r));
const browser = await chromium.launch({ headless: true });
const runs = [];
try {
  for (const size of SIZES) {
    const ctx = await browser.newContext({ viewport: { width: size.w, height: size.h }, deviceScaleFactor: size.dpr, colorScheme: 'light', ...(size.w < 600 ? { isMobile: true, hasTouch: true } : {}) });
    await ctx.addInitScript(() => {
      try { localStorage.setItem('theme', 'light'); } catch { /* denied */ }
      window.__shifts = [];
      new PerformanceObserver((list) => { for (const e of list.getEntries()) if (!e.hadRecentInput) window.__shifts.push({ v: e.value, t: e.startTime, y: scrollY }); }).observe({ type: 'layout-shift', buffered: true });
    });
    const page = await ctx.newPage();
    const reqs = [];
    page.on('response', async (res) => {
      const url = res.url();
      let bytes = Number(res.headers()['content-length'] || 0);
      if (!bytes) { try { bytes = (await res.body()).length; } catch { bytes = 0; } }
      reqs.push({ url: url.replace(`http://127.0.0.1:${PORT}`, ''), status: res.status(), type: res.request().resourceType(), bytes });
    });
    await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const { top, bottom } = await page.evaluate(() => { const r = document.querySelector('#flagship').getBoundingClientRect(); return { top: r.top + scrollY, bottom: r.bottom + scrollY }; });
    const roomWindow = { from: top - size.h, to: bottom };
    for (let y = 0; y <= bottom; y += 200) { await page.evaluate((v) => scrollTo(0, v), y); await sleep(40); }
    await sleep(2600);
    const shifts = await page.evaluate(() => window.__shifts);
    const sum = (a) => +a.reduce((s, x) => s + x.v, 0).toFixed(4);
    const capture = reqs.filter((r) => /explore-current\.phone\./.test(r.url));
    runs.push({
      size: size.tag,
      cls: { walk: sum(shifts), whileRoomInView: sum(shifts.filter((s) => s.y >= roomWindow.from && s.y <= roomWindow.to)), entries: shifts.length },
      captureRequests: capture.map((r) => ({ url: r.url, bytes: r.bytes })),
      totals: { requests: reqs.length, imageRequests: reqs.filter((r) => r.type === 'image').length, imageBytes: reqs.filter((r) => r.type === 'image').reduce((a, r) => a + r.bytes, 0), scriptBytes: reqs.filter((r) => r.type === 'script').reduce((a, r) => a + r.bytes, 0) },
    });
    await ctx.close();
  }
} finally { await browser.close(); srv.kill(); }
const result = { tag: TAG, files, runs };
fs.writeFileSync(path.join(OUT, `perf-${TAG}.json`), JSON.stringify(result, null, 1));
console.log(JSON.stringify({ tag: TAG, files, runs: runs.map((r) => ({ size: r.size, cls: r.cls, capture: r.captureRequests.length, captureUrls: r.captureRequests.map((c) => c.url.split('/').pop()), totals: r.totals })) }, null, 1));
