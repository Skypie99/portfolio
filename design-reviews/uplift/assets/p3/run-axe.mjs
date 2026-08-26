// P3 axe gate — self-contained. axe-core 4.x across 17 routes × 2 themes,
// with label-content-name-mismatch ENABLED (stricter than axe defaults) +
// color-contrast. Reuses the project's axe-core + the cached chromium-1228.
//
// H2 (THE ROOM Phase H): axe-core is now a real devDependency (package.json)
// resolved via require.resolve — it used to be a hardcoded absolute path,
// silently riding on eslint-plugin-jsx-a11y's transitive copy.
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright-core');

const AXE = require.resolve('axe-core/axe.min.js');
const BASE = 'http://localhost:3005';
const OUT = process.argv[2] || '/tmp/p3-axe-report.json';

// H3 (THE ROOM Phase H): work-accessmap → work-flagstone (the project
// rename), work-mutual-mesh dropped (withdrawn 2026-08-18), blog's one post
// renamed to match, and /archive + /runway added — both real routes since
// the 2026-07-09 census. Verified against `find app -name page.tsx` — every
// real route in the app, 17 exactly.
const ROUTES = [
  ['home', '/'], ['about', '/about/'], ['accessibility', '/accessibility/'], ['archive', '/archive/'],
  ['blog', '/blog/'], ['blog-building-flagstone', '/blog/building-flagstone/'],
  ['certificates', '/certificates/'], ['colophon', '/colophon/'], ['contact', '/contact/'],
  ['runway', '/runway/'], ['work', '/work/'], ['work-flagstone', '/work/flagstone/'],
  ['work-claude-corp', '/work/claude-corp/'], ['work-dashboard', '/work/dashboard/'],
  ['work-prompt-library', '/work/prompt-library/'], ['work-ghost-code', '/work/ghost-code/'], ['404', '/404/'],
];

const report = { meta: { engine: 'Chromium 1228 (playwright-core 1.61.1) headless, DSF2 — NOT Safari/WebKit',
  axeCore: require('axe-core/package.json').version,
  rules: 'defaults + label-content-name-mismatch enabled + color-contrast enabled', when: process.argv[3] || 'unstamped' }, axe: {} };

const browser = await chromium.launch({ headless: true });

async function runAxe(url, theme, key) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, colorScheme: theme,
    reducedMotion: 'reduce', // reveals rest at their FINAL visible frame → measure true static contrast, no mid-animation race
  });
  await ctx.addInitScript((t) => { try { localStorage.setItem('theme', t); } catch (e) {} }, theme);
  const page = await ctx.newPage();
  await page.goto(BASE + url, { waitUntil: 'networkidle' });
  // Ensure the theme class actually applied before measuring (no theme-timing race).
  if (theme === 'dark') await page.waitForFunction(`document.documentElement.classList.contains('dark')`, { timeout: 4000 }).catch(() => {});
  // Trigger + settle every IntersectionObserver reveal, then return to top, blur focus.
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
    violations: res.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length,
      sample: v.nodes.slice(0, 3).map((n) => ({ target: n.target.join(' '), summary: (n.failureSummary || '').slice(0, 260) })) })),
    incompleteIds: [...new Set(res.incomplete.map((v) => v.id))],
  };
  const nv = res.violations.length;
  console.log(`[axe] ${key}: ${nv} violations, ${res.incomplete.length} incomplete` + (nv ? '  <<< ' + res.violations.map(v=>v.id).join(',') : ''));
  await ctx.close();
}

for (const [slug, url] of ROUTES) {
  for (const theme of ['light', 'dark']) await runAxe(url, theme, `${slug}__${theme}`);
}

await browser.close();
fs.writeFileSync(OUT, JSON.stringify(report, null, 2));
const totals = Object.values(report.axe).reduce((a, r) => a + r.violations.length, 0);
console.log(`\n[p3-axe] TOTAL violations across ${Object.keys(report.axe).length} scans (17 routes × 2 themes): ${totals}`);
console.log('[p3-axe] →', OUT);
