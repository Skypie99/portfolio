import { createRequire } from 'node:module'; const req = createRequire('/Users/skypie/Portfolio/package.json'); const { chromium } = req('playwright-core');
for (let i = 0; i < 3; i++) {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, colorScheme: 'dark', isMobile: true, hasTouch: true });
  await ctx.addInitScript(() => { try { localStorage.setItem('theme', 'dark'); } catch {} });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e))); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  const failed = []; p.on('requestfailed', (r) => failed.push(r.url().replace('http://127.0.0.1:8742', '') + ' ' + r.failure()?.errorText));
  await p.goto('http://127.0.0.1:8742/', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.querySelector('#flagship').scrollIntoView()); await new Promise((r) => setTimeout(r, 2500));
  console.log('run', i + 1, 'errors', errs.length, 'failed', JSON.stringify(failed)); await b.close();
}
