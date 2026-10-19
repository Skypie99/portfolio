// opening.mjs — burst-capture the first ~1.6s after navigation (the opening light-up).
//   node opening.mjs --base http://localhost:3101 --out <dir> [--config desktop-light|mobile-light]
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire('/home/user/portfolio/package.json');
const { chromium } = require('playwright-core');
const args = Object.fromEntries(process.argv.slice(2).map((a, i, arr) => a.startsWith('--') ? [a.slice(2), arr[i + 1]] : []).filter(Boolean));
const CONFIGS = { 'desktop-light': { width: 1440, height: 900, dpr: 1, mobile: false }, 'mobile-light': { width: 393, height: 852, dpr: 2, mobile: true } };
const c = CONFIGS[args.config || 'desktop-light']; const OUT = args.out; mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true });
const ctx = await browser.newContext({ viewport: { width: c.width, height: c.height }, deviceScaleFactor: c.dpr, colorScheme: 'light', isMobile: c.mobile, hasTouch: c.mobile });
const page = await ctx.newPage();
// warm the cache first so the burst measures the animation, not the network
await page.goto(args.base + '/', { waitUntil: 'networkidle' }); await page.waitForTimeout(500);
const shots = [];
await page.goto(args.base + '/', { waitUntil: 'commit' });
const t0 = Date.now();
for (let i = 0; i < 12; i++) {
  const t = Date.now() - t0;
  const f = `t${String(t).padStart(4, '0')}.png`;
  await page.screenshot({ path: join(OUT, f), type: 'png' });
  shots.push({ file: f, ms: t });
  await page.waitForTimeout(90);
}
writeFileSync(join(OUT, 'manifest.json'), JSON.stringify(shots, null, 2));
console.log('[opening]', shots.map((s) => s.ms).join(','));
await browser.close();
