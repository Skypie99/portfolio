// P5 CLS gate — production build on :3005. PerformanceObserver(layout-shift),
// buffered, scroll-through to trigger every reveal/reserved well, settle, read.
// Floor: 0.004 (PROTECT). Chromium — not WebKit.
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright-core');

const BASE = 'http://localhost:3005';
const OUT = process.argv[2] || '/tmp/p5-cls.json';
// H3 (THE ROOM Phase H): brought up to the same 17-route inventory run-axe.mjs
// uses (was missing work-claude-corp/work-ghost-code entirely, not just
// carrying stale slugs) — see run-axe.mjs for the rename/withdrawal notes.
const ROUTES = [
  ['home', '/'], ['about', '/about/'], ['accessibility', '/accessibility/'], ['archive', '/archive/'],
  ['blog', '/blog/'], ['blog-building-flagstone', '/blog/building-flagstone/'],
  ['certificates', '/certificates/'], ['colophon', '/colophon/'], ['contact', '/contact/'],
  ['runway', '/runway/'], ['work', '/work/'], ['work-flagstone', '/work/flagstone/'],
  ['work-claude-corp', '/work/claude-corp/'], ['work-dashboard', '/work/dashboard/'],
  ['work-prompt-library', '/work/prompt-library/'], ['work-ghost-code', '/work/ghost-code/'], ['404', '/404/'],
];
const WIDTHS = [375, 768, 1440];

const browser = await chromium.launch({ headless: true });
const results = {};
let worst = { key: null, cls: 0 };

for (const [slug, url] of ROUTES) {
  for (const w of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: w < 500 ? 812 : 900 }, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    await page.addInitScript(`
      window.__cls = 0;
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
      }).observe({ type: 'layout-shift', buffered: true });
    `);
    await page.goto(BASE + url, { waitUntil: 'networkidle' });
    await page.evaluate(`(async () => {
      const H = document.documentElement.scrollHeight;
      for (let y = 0; y <= H; y += 600) { scrollTo({ top: y, behavior: 'instant' }); await new Promise(r => setTimeout(r, 120)); }
      scrollTo({ top: 0, behavior: 'instant' });
    })()`);
    await page.waitForTimeout(700);
    const cls = await page.evaluate('window.__cls');
    const key = `${slug}@${w}`;
    results[key] = Number(cls.toFixed(5));
    if (cls > worst.cls) worst = { key, cls: Number(cls.toFixed(5)) };
    console.log(`[cls] ${key}: ${cls.toFixed(5)}${cls > 0.004 ? '  <<< OVER FLOOR' : ''}`);
    await ctx.close();
  }
}
await browser.close();
fs.writeFileSync(OUT, JSON.stringify({ meta: { when: process.argv[3] || 'unstamped', floor: 0.004, engine: 'Chromium (playwright-core), production build — NOT WebKit' }, worst, results }, null, 2));
console.log(`\n[p5-cls] worst: ${worst.key} = ${worst.cls} (floor 0.004) → ${OUT}`);
