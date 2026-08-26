#!/usr/bin/env node
/**
 * cpl-census.mjs — measure REAL characters-per-line for prose runs.
 *
 *   npm run build && node design-reviews/luxe-audit/2026-08-07/wave1/tools/cpl-census.mjs
 *
 * WHY A REAL MEASUREMENT AND NOT ARITHMETIC
 * -----------------------------------------
 * The tempting estimate is `containerWidthPx / averageGlyphWidthPx`. It is
 * wrong here in both directions and the repo already knows it: `--measure` is
 * authored in `ch`, and `ch` is the advance width of "0" — which in this sans is
 * WIDER than the real average lowercase glyph. globals.css:223 records the
 * consequence in the codebase's own words: `--measure-wide` was authored at 72ch
 * believing it bought ~72 characters and was measured "rendering ~90-96 real
 * chars". So a ch-derived cpl number is not a measurement, it is a guess with a
 * known sign of error.
 *
 * Instead this walks the actual rendered text: it uses Range.getClientRects() to
 * find the real visual line boxes of each text node, assigns every character to
 * the line box it was painted on, and counts. That is the number a reader's eye
 * meets. Reported per element: line count, chars per line (max / mean), and the
 * container's used width.
 *
 * The luxury band cited by the audit is 66-75 cpl. This instrument reports the
 * MAX populated line (the widest line a reader actually encounters) alongside
 * the mean, because a run whose mean is 70 but whose longest line is 79 still
 * shows the reader a 79-character line.
 *
 * Chromium only — like every other rig in this estate, Safari/WebKit stays a
 * device row and is never asserted from here.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright-core');

const ROOT = '/Users/skypie/Portfolio';
const OUT_DIR = path.join(ROOT, 'out');
const PORT = Number(process.env.CPL_PORT || 3097);
const BASE = `http://127.0.0.1:${PORT}`;
const REPORT_PATH = process.argv[2] || path.join(ROOT, 'design-reviews/luxe-audit/2026-08-07/wave1/cpl-report.json');
const STAMP = process.argv[3] || 'unstamped';

/**
 * Routes and the prose selectors worth measuring. H6 (THE ROOM Phase H):
 * work-accessmap → work-flagstone (the project rename) and
 * blog-building-accessmap → blog-building-flagstone, matching run-axe.mjs.
 * work-flagstone is the one H6 explicitly names ("the Flagstone case study
 * and /about especially").
 */
const TARGETS = [
  ['home', '/', 'main p, main li'],
  ['about', '/about/', 'main p, main li'],
  ['work-flagstone', '/work/flagstone/', 'main p, main li'],
  ['contact', '/contact/', 'main p'],
  ['blog-building-flagstone', '/blog/building-flagstone/', 'main p, main li'],
  ['certificates', '/certificates/', 'main p'],
  ['work', '/work/', 'main p'],
];

/** Desktop is where the measure is widest and therefore where cpl peaks. */
const VIEWPORT = { width: 1440, height: 900 };

if (!fs.existsSync(OUT_DIR)) {
  console.error('[cpl] out/ does not exist — run `npm run build` first.');
  process.exit(2);
}

const server = spawn(
  'node',
  [path.join(ROOT, 'design-reviews/showcase-refresh/tools/static-serve.mjs'), OUT_DIR, String(PORT)],
  { stdio: 'ignore' },
);

async function ready() {
  for (let i = 0; i < 60; i += 1) {
    try {
      const res = await fetch(BASE + '/');
      if (res.ok) return true;
    } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 250));
  }
  return false;
}

if (!(await ready())) {
  server.kill('SIGKILL');
  console.error('[cpl] static fixture never came up.');
  process.exit(2);
}

const browser = await chromium.launch({ headless: true });
const report = {
  meta: {
    engine: 'Chromium (playwright-core) headless, 1440x900 — NOT Safari/WebKit',
    method: 'Range.getClientRects() per character, bucketed by visual line box',
    band: '66-75 cpl (audit luxury band)',
    when: STAMP,
  },
  runs: [],
};

const MEASURE = `(sel) => {
  const out = [];
  for (const el of document.querySelectorAll(sel)) {
    const text = el.textContent || '';
    if (text.trim().length < 80) continue;               // too short to have a measure
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    if (el.closest('[aria-hidden="true"]')) continue;

    // Walk text nodes, assigning each character to its painted line box (by top).
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const lines = new Map();                              // roundedTop -> char count
    let node;
    while ((node = walker.nextNode())) {
      const s = node.nodeValue || '';
      for (let i = 0; i < s.length; i += 1) {
        const r = document.createRange();
        r.setStart(node, i);
        r.setEnd(node, i + 1);
        const rect = r.getClientRects()[0];
        if (!rect || rect.width === 0) continue;
        const key = Math.round(rect.top);
        lines.set(key, (lines.get(key) || 0) + 1);
      }
    }
    const counts = [...lines.values()].filter((n) => n > 1);
    if (counts.length < 2) continue;                      // single-line run: no measure to judge
    // The LAST line of a paragraph is a ragged remainder, never a measure sample.
    const sorted = [...lines.entries()].sort((a, b) => a[0] - b[0]).map((e) => e[1]);
    const body = sorted.slice(0, -1).filter((n) => n > 1);
    if (!body.length) continue;

    out.push({
      selectorPath: (() => {
        const parts = [];
        let n = el;
        while (n && n !== document.body && parts.length < 4) {
          parts.unshift(n.tagName.toLowerCase() + (n.className && typeof n.className === 'string'
            ? '.' + n.className.trim().split(/\\s+/).slice(0, 3).join('.') : ''));
          n = n.parentElement;
        }
        return parts.join(' > ');
      })(),
      snippet: text.trim().slice(0, 70),
      widthPx: Math.round(el.getBoundingClientRect().width * 100) / 100,
      fontSizePx: cs.fontSize,
      fontFamily: cs.fontFamily.split(',')[0].replace(/["']/g, ''),
      lines: sorted.length,
      cplMax: Math.max(...body),
      cplMean: Math.round((body.reduce((a, b) => a + b, 0) / body.length) * 10) / 10,
      textWrap: cs.textWrap || cs.getPropertyValue('text-wrap') || '(unset)',
      maxWidth: cs.maxWidth,
    });
  }
  return out;
}`;

for (const [slug, url, sel] of TARGETS) {
  const ctx = await browser.newContext({ viewport: VIEWPORT, colorScheme: 'light', reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(BASE + url, { waitUntil: 'networkidle' });
  await page.evaluate(`(async () => {
    const H = document.documentElement.scrollHeight;
    for (let y = 0; y <= H; y += 700) { scrollTo({ top: y, behavior: 'instant' }); await new Promise(r => setTimeout(r, 60)); }
    scrollTo({ top: 0, behavior: 'instant' });
  })()`);
  await page.waitForTimeout(400);
  const rows = await page.evaluate(`(${MEASURE})(${JSON.stringify(sel)})`);
  for (const r of rows) report.runs.push({ route: slug, ...r });
  const over = rows.filter((r) => r.cplMax > 75);
  console.log(`[cpl] ${slug}: ${rows.length} measurable runs, ${over.length} over 75 cpl`);
  for (const o of over) {
    console.log(`      OVER  max=${o.cplMax} mean=${o.cplMean} w=${o.widthPx}px wrap=${o.textWrap}  "${o.snippet.slice(0, 46)}…"`);
  }
  await ctx.close();
}

await browser.close();
server.kill('SIGKILL');

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
const over = report.runs.filter((r) => r.cplMax > 75);
console.log(`\n[cpl] ${report.runs.length} measurable prose runs; ${over.length} exceed the 75-cpl band.`);
console.log('[cpl] →', REPORT_PATH);
