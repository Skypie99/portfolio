#!/usr/bin/env node
/**
 * Luxe Wave-1 axe gate — the strict-rule a11y floor for this train.
 *
 *   npm run build && node design-reviews/luxe-audit/2026-08-07/wave1/tools/run-axe.mjs <out.json> <stamp>
 *
 * Lineage: this is the P3/uplift `run-axe.mjs` harness (design-reviews/uplift/
 * assets/p3/run-axe.mjs) with two changes, both to make it self-contained:
 *   (1) it spawns the estate's own static fixture over `out/` instead of
 *       assuming a dev server is already listening on :3005, and
 *   (2) the report path/stamp are argv-driven so each run banks its own receipt.
 *
 * STRICTNESS: axe-core defaults PLUS `label-content-name-mismatch` and
 * `color-contrast` explicitly enabled — this is the "axe strict 0" the luxe
 * floors refer to, and it is stricter than an out-of-the-box axe run.
 *
 * MEASUREMENT HONESTY (inherited, do not delete):
 *   · Chromium only (playwright-core). Every Safari/WebKit claim stays a DEVICE
 *     ROW and is never asserted from this rig.
 *   · `reducedMotion: 'reduce'` is deliberate: it lands every Reveal at its FINAL
 *     visible frame, so contrast is measured on settled paint rather than racing
 *     a mid-animation opacity. It is not a claim about the RM contract itself.
 *   · The scroll-settle loop below exists because IntersectionObserver reveals
 *     are inert until scrolled into view; without it most of the estate is never
 *     measured and the run reports a falsely clean 0.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright-core');

const ROOT = '/Users/skypie/Portfolio';
const AXE = path.join(ROOT, 'node_modules/axe-core/axe.min.js');
const OUT_DIR = path.join(ROOT, 'out');
const PORT = Number(process.env.AXE_PORT || 3098);
const BASE = `http://127.0.0.1:${PORT}`;
const REPORT_PATH = process.argv[2] || path.join(ROOT, 'design-reviews/luxe-audit/2026-08-07/wave1/axe-report.json');
const STAMP = process.argv[3] || 'unstamped';

const ROUTES = [
  ['home', '/'], ['about', '/about/'], ['accessibility', '/accessibility/'],
  ['blog', '/blog/'], ['blog-building-accessmap', '/blog/building-accessmap/'],
  ['certificates', '/certificates/'], ['colophon', '/colophon/'], ['contact', '/contact/'],
  ['work', '/work/'], ['work-accessmap', '/work/accessmap/'], ['work-claude-corp', '/work/claude-corp/'],
  ['work-dashboard', '/work/dashboard/'], ['work-prompt-library', '/work/prompt-library/'],
  ['work-ghost-code', '/work/ghost-code/'], ['work-mutual-mesh', '/work/mutual-mesh/'], ['404', '/404/'],
];

if (!fs.existsSync(OUT_DIR)) {
  console.error('[axe] out/ does not exist — run `npm run build` first.');
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
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  return false;
}

if (!(await ready())) {
  server.kill('SIGKILL');
  console.error('[axe] static fixture never came up.');
  process.exit(2);
}

const report = {
  meta: {
    engine: 'Chromium (playwright-core) headless, DSF2, 1440x900 — NOT Safari/WebKit',
    axeCore: JSON.parse(fs.readFileSync(path.join(ROOT, 'node_modules/axe-core/package.json'), 'utf8')).version,
    rules: 'defaults + label-content-name-mismatch enabled + color-contrast enabled',
    when: STAMP,
  },
  axe: {},
};

const browser = await chromium.launch({ headless: true });

async function runAxe(url, theme, key) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    colorScheme: theme,
    reducedMotion: 'reduce',
  });
  await ctx.addInitScript((t) => {
    try { localStorage.setItem('theme', t); } catch { /* private mode */ }
  }, theme);
  const page = await ctx.newPage();
  await page.goto(BASE + url, { waitUntil: 'networkidle' });
  if (theme === 'dark') {
    await page
      .waitForFunction(`document.documentElement.classList.contains('dark')`, { timeout: 4000 })
      .catch(() => {});
  }
  await page.evaluate(`(async () => {
    const H = document.documentElement.scrollHeight;
    for (let y = 0; y <= H; y += 700) { scrollTo({ top: y, behavior: 'instant' }); await new Promise(r => setTimeout(r, 90)); }
    scrollTo({ top: 0, behavior: 'instant' });
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  })()`);
  await page.waitForTimeout(500);
  await page.addScriptTag({ path: AXE });
  const res = await page.evaluate(`axe.run(document, {
    resultTypes: ['violations', 'incomplete'],
    rules: { 'color-contrast': { enabled: true }, 'label-content-name-mismatch': { enabled: true } },
  })`);
  report.axe[key] = {
    violations: res.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      nodes: v.nodes.length,
      sample: v.nodes.slice(0, 3).map((n) => ({
        target: n.target.join(' '),
        summary: (n.failureSummary || '').slice(0, 260),
      })),
    })),
    incompleteIds: [...new Set(res.incomplete.map((v) => v.id))],
  };
  const nv = res.violations.length;
  console.log(
    `[axe] ${key}: ${nv} violations, ${res.incomplete.length} incomplete` +
      (nv ? '  <<< ' + res.violations.map((v) => v.id).join(',') : ''),
  );
  await ctx.close();
}

for (const [slug, url] of ROUTES) {
  for (const theme of ['light', 'dark']) await runAxe(url, theme, `${slug}__${theme}`);
}

await browser.close();
server.kill('SIGKILL');

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
const totals = Object.values(report.axe).reduce((a, r) => a + r.violations.length, 0);
console.log(`\n[luxe-axe] TOTAL violations across ${Object.keys(report.axe).length} scans (16 routes x 2 themes): ${totals}`);
console.log('[luxe-axe] →', REPORT_PATH);
process.exit(totals === 0 ? 0 : 1);
