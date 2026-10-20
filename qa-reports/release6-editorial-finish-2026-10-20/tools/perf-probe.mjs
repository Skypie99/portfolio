#!/usr/bin/env node
/**
 * perf-probe.mjs — layout shift, long tasks and animated-surface counts for
 * the two Release 6 surfaces, from a BUILT export, so a baseline and a
 * candidate can be compared like for like.
 *
 *   node perf-probe.mjs --dir <export dir> --out <file.json> [--label before] [--size 1440x900@1]
 *
 * Per route: a PerformanceObserver collects layout-shift entries (CLS, with
 * the largest shift's sources) and long tasks from navigation through a
 * scroll-through to the surface and a 1.5 s hold; then it counts, inside the
 * surface, elements with a non-none transition on transform/opacity,
 * `will-change` declarations, backdrop-filter surfaces and the DOM node
 * total. Headless software rendering: the numbers are relative between two
 * builds in this container, not device truth.
 */
import fs from 'node:fs';
import path from 'node:path';
import { opt, parseSizes, resolveChromium, serve, chromium, makeContext, load, scrollThrough, scrollToSelector, sleep } from './lib.mjs';

const DIR = path.resolve(opt('dir', 'out'));
const OUTF = path.resolve(opt('out'));
const LABEL = opt('label', path.basename(DIR));
const SIZE = parseSizes(opt('size', '1440x900@1'))[0];
const PORT = Number(opt('port', 3421));
const BASE = `http://127.0.0.1:${PORT}`;
const SURFACES = [
  { name: 'work', route: '/work/', selector: 'ul.flex.flex-col' },
  { name: 'home-work', route: '/', selector: '#work' },
];
const server = await serve(DIR, PORT);
const browser = await chromium.launch({ headless: true, executablePath: resolveChromium() });
const rows = [];
try {
  for (const surf of SURFACES) {
    const ctx = await makeContext(browser, { ...SIZE, theme: 'light', mode: 'normal' });
    await ctx.addInitScript(() => {
      window.__perf = { shifts: [], longTasks: [] };
      try {
        new PerformanceObserver((l) => {
          for (const e of l.getEntries()) {
            if (e.hadRecentInput) continue;
            window.__perf.shifts.push({ t: Math.round(e.startTime), value: e.value, sources: (e.sources || []).map((s) => s.node?.tagName + (s.node?.className ? '.' + String(s.node.className).split(' ')[0] : '')).slice(0, 3) });
          }
        }).observe({ type: 'layout-shift', buffered: true });
        new PerformanceObserver((l) => {
          for (const e of l.getEntries()) window.__perf.longTasks.push({ t: Math.round(e.startTime), d: Math.round(e.duration) });
        }).observe({ type: 'longtask', buffered: true });
      } catch {}
    });
    const page = await ctx.newPage();
    await load(page, BASE + surf.route);
    await scrollThrough(page);
    await scrollToSelector(page, surf.selector, 0);
    await sleep(1500);
    const r = await page.evaluate((sel) => {
      const root = document.querySelector(sel) || document.body;
      const all = Array.from(root.querySelectorAll('*'));
      const transitioned = all.filter((el) => {
        const cs = getComputedStyle(el);
        return cs.transitionDuration.split(',').some((d) => parseFloat(d) > 0) && /transform|opacity|all/.test(cs.transitionProperty);
      }).length;
      const willChange = all.filter((el) => getComputedStyle(el).willChange !== 'auto').length;
      const backdrop = all.filter((el) => (getComputedStyle(el).backdropFilter || getComputedStyle(el).webkitBackdropFilter || 'none') !== 'none').length;
      const shifts = window.__perf.shifts;
      const cls = shifts.reduce((a, s) => a + s.value, 0);
      const largest = shifts.slice().sort((a, b) => b.value - a.value)[0] || null;
      return { nodes: all.length, transitioned, willChange, backdrop, cls: Number(cls.toFixed(4)), shifts: shifts.length, largestShift: largest, longTasks: window.__perf.longTasks.length, longTaskMs: window.__perf.longTasks.reduce((a, t) => a + t.d, 0) };
    }, surf.selector);
    rows.push({ label: LABEL, surface: surf.name, size: SIZE.tag, ...r });
    console.log(`[perf] ${LABEL} ${surf.name}: CLS ${r.cls} (${r.shifts} shifts, largest ${JSON.stringify(r.largestShift)}) · long tasks ${r.longTasks} (${r.longTaskMs} ms) · nodes ${r.nodes} · transitioned ${r.transitioned} · will-change ${r.willChange} · backdrop-filter ${r.backdrop}`);
    await ctx.close();
  }
} finally {
  await browser.close();
  server.kill('SIGTERM');
}
fs.mkdirSync(path.dirname(OUTF), { recursive: true });
fs.writeFileSync(OUTF, JSON.stringify({ dir: DIR, label: LABEL, at: new Date().toISOString(), rows }, null, 2));
