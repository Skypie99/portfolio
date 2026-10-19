// opening-anim.mjs — DETERMINISTIC frames of the opening light-up: pause the CSS animation
// on .cdesert-frame and sample it at exact animation times. (Wall-clock bursts cannot
// resolve a 1.2 s move in headless Chromium, where a screenshot costs ~0.7 s.)
//   node opening-anim.mjs --base http://localhost:3101 --out <dir> [--config desktop-light|mobile-light]
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire('/home/user/portfolio/package.json');
const { chromium } = require('playwright-core');
const args = Object.fromEntries(process.argv.slice(2).map((a, i, arr) => a.startsWith('--') ? [a.slice(2), arr[i + 1]] : []).filter(Boolean));
const CONFIGS = { 'desktop-light': { width: 1440, height: 900, dpr: 1, mobile: false }, 'mobile-light': { width: 393, height: 852, dpr: 2, mobile: true } };
const c = CONFIGS[args.config || 'desktop-light']; const OUT = args.out; mkdirSync(OUT, { recursive: true });
const TIMES = (args.times ? String(args.times).split(',').map(Number) : [0, 200, 400, 600, 800, 1000, 1200]);
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true });
const ctx = await browser.newContext({ viewport: { width: c.width, height: c.height }, deviceScaleFactor: c.dpr, colorScheme: 'light', isMobile: c.mobile, hasTouch: c.mobile });
const page = await ctx.newPage();
await page.goto(args.base + '/', { waitUntil: 'networkidle' });
await page.evaluate(async () => { await document.fonts?.ready; const planes = [...document.querySelectorAll('img[data-plate]')]; await Promise.race([Promise.all(planes.map((i) => i.decode().catch(() => {}))), new Promise((r) => setTimeout(r, 5000))]); });
await page.waitForTimeout(300);
const has = await page.evaluate(() => {
  const anims = document.getAnimations().filter((a) => a.animationName === 'cdesert-arrive');
  window.__arrive = anims; return anims.length;
});
const shots = [];
if (has) {
  for (const t of TIMES) {
    await page.evaluate((tt) => { for (const a of window.__arrive) { a.pause(); a.currentTime = tt; } }, t);
    await page.waitForTimeout(120);
    const f = `anim-${String(t).padStart(4, '0')}ms.png`; await page.screenshot({ path: join(OUT, f), type: 'png' }); shots.push({ file: f, animationTime: t });
  }
  await page.evaluate(() => { for (const a of window.__arrive) a.play(); });
} else {
  const f = 'painted.png'; await page.screenshot({ path: join(OUT, f), type: 'png' }); shots.push({ file: f, animationTime: null, note: 'no light-up animation on this build (original): the painted first frame' });
}
writeFileSync(join(OUT, 'manifest.json'), JSON.stringify({ hasAnimation: !!has, shots }, null, 2));
console.log('[opening-anim]', args.config || 'desktop-light', has ? `animation found, ${shots.length} frames` : 'no animation (original)');
await browser.close();
