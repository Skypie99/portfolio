#!/usr/bin/env node
/**
 * width-probe.mjs — what does each candidate measure ACTUALLY deliver?
 *
 *   npm run build && node design-reviews/luxe-audit/2026-08-07/wave1/tools/width-probe.mjs
 *
 * The ledger prescribes "~640→612px" for the over-wide reading runs. Before
 * spending that change it is worth knowing whether it reaches the 66–75 cpl band
 * it is spent for. It does not, and extrapolation is not a safe way to find that
 * out: characters-per-pixel is NOT constant across paragraphs. Measured on
 * 933c59a, the /about/ principles run yields 0.1375 chars/px while the process
 * step yields 0.1190 — a 15% spread at the SAME font size, because the glyph mix
 * differs ("I would rather take longer…" is a narrow-letter sentence).
 *
 * So this probe does not extrapolate. It re-measures real line boxes at each
 * candidate width by overriding max-width in the live page, using the same
 * Range.getClientRects() line-bucketing as cpl-census.mjs.
 *
 * Chromium only.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright-core');

const ROOT = '/Users/skypie/Portfolio';
const OUT_DIR = path.join(ROOT, 'out');
const PORT = Number(process.env.PROBE_PORT || 3094);
const BASE = `http://127.0.0.1:${PORT}`;
const REPORT = path.join(ROOT, 'design-reviews/luxe-audit/2026-08-07/wave1/width-probe.json');

/** The widths worth pricing. 640 = today's measure-lead; 706 = --measure at 65ch. */
const WIDTHS = [706, 640, 612, 580, 560, 545, 520];

const TARGETS = [
  { route: '/about/', sel: '.max-w-measure-lead p', label: '/about/ body prose (max-w-measure-lead, 640px today)' },
  { route: '/', sel: '.max-w-measure', label: 'process steps (max-w-measure, --measure 65ch → 706px today)' },
];

if (!fs.existsSync(OUT_DIR)) { console.error('[probe] run `npm run build` first.'); process.exit(2); }

const server = spawn('node', [path.join(ROOT, 'design-reviews/showcase-refresh/tools/static-serve.mjs'), OUT_DIR, String(PORT)], { stdio: 'ignore' });
async function ready() {
  for (let i = 0; i < 60; i += 1) {
    try { if ((await fetch(BASE + '/')).ok) return true; } catch { /* not up */ }
    await new Promise((r) => setTimeout(r, 250));
  }
  return false;
}
if (!(await ready())) { server.kill('SIGKILL'); console.error('[probe] fixture never came up.'); process.exit(2); }

const MEASURE = `(sel, widthPx) => {
  const out = [];
  for (const el of document.querySelectorAll(sel)) {
    const text = (el.textContent || '').trim();
    if (text.length < 80) continue;
    if (getComputedStyle(el).display === 'none') continue;
    el.style.maxWidth = widthPx + 'px';
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const lines = new Map();
    let node;
    while ((node = walker.nextNode())) {
      const s = node.nodeValue || '';
      for (let i = 0; i < s.length; i += 1) {
        const r = document.createRange();
        r.setStart(node, i); r.setEnd(node, i + 1);
        const rect = r.getClientRects()[0];
        if (!rect || rect.width === 0) continue;
        const key = Math.round(rect.top);
        lines.set(key, (lines.get(key) || 0) + 1);
      }
    }
    const sorted = [...lines.entries()].sort((a, b) => a[0] - b[0]).map((e) => e[1]);
    const body = sorted.slice(0, -1).filter((n) => n > 1);   // last line is a ragged remainder
    if (!body.length) continue;
    out.push({
      snippet: text.slice(0, 46),
      lines: sorted.length,
      cplMax: Math.max(...body),
      cplMean: Math.round((body.reduce((a, b) => a + b, 0) / body.length) * 10) / 10,
    });
  }
  return out;
}`;

const browser = await chromium.launch({ headless: true });
const report = { meta: { engine: 'Chromium headless 1440x900', band: '66-75 cpl', when: process.argv[2] || 'unstamped' }, probes: [] };

for (const t of TARGETS) {
  console.log(`\n[probe] ${t.label}`);
  console.log('  width │ worst cpl │ mean cpl │ in band?');
  console.log('  ──────┼───────────┼──────────┼─────────');
  for (const w of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'light', reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto(BASE + t.route, { waitUntil: 'networkidle' });
    await page.evaluate(`(async () => {
      const H = document.documentElement.scrollHeight;
      for (let y = 0; y <= H; y += 700) { scrollTo({ top: y, behavior: 'instant' }); await new Promise(r => setTimeout(r, 50)); }
    })()`);
    const rows = await page.evaluate(`(${MEASURE})(${JSON.stringify(t.sel)}, ${w})`);
    const worst = rows.length ? Math.max(...rows.map((r) => r.cplMax)) : null;
    const mean = rows.length ? Math.round((rows.reduce((a, r) => a + r.cplMean, 0) / rows.length) * 10) / 10 : null;
    report.probes.push({ target: t.label, width: w, runs: rows.length, worstCpl: worst, meanCpl: mean, inBand: worst !== null && worst <= 75 });
    console.log(`   ${String(w).padStart(4)} │    ${String(worst ?? '—').padStart(4)}   │   ${String(mean ?? '—').padStart(5)}  │ ${worst !== null && worst <= 75 ? 'YES' : 'no'}`);
    await ctx.close();
  }
}

await browser.close();
server.kill('SIGKILL');
fs.writeFileSync(REPORT, JSON.stringify(report, null, 2));
console.log('\n[probe] →', path.relative(ROOT, REPORT));
