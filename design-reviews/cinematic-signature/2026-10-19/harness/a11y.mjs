// a11y.mjs — the human-verifiable checks: keyboard path through the intro, Skip intro,
// reduced-motion render, no-JS render, axe scan, and the credit line's measured contrast.
//   node a11y.mjs --base http://localhost:3101 --out <dir>
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire('/home/user/portfolio/package.json');
const { chromium } = require('playwright-core');
const sharp = require('sharp');
const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const args = Object.fromEntries(process.argv.slice(2).map((a, i, arr) => a.startsWith('--') ? [a.slice(2), arr[i + 1]] : []).filter(Boolean));
const BASE = args.base; const OUT = args.out; mkdirSync(OUT, { recursive: true });
const report = { base: BASE, at: new Date().toISOString() };
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true });

async function ready(page) { await page.waitForLoadState('networkidle'); await page.evaluate(async () => { await document.fonts?.ready; const planes = [...document.querySelectorAll('img[data-plate]')]; await Promise.race([Promise.all(planes.map((i) => i.decode().catch(() => {}))), new Promise((r) => setTimeout(r, 5000))]); }); await page.waitForTimeout(400); }
const geom = (page) => page.evaluate(() => { const stage = document.querySelector('.cdesert-stage, .cdesert-static'); const pin = document.querySelector('.cdesert-pin'); const r = stage.getBoundingClientRect(); const top = r.top + window.scrollY; const h = r.height; const phone = matchMedia('(max-width: 767px)').matches; const end = pin ? (phone ? top + h - pin.offsetHeight : top + h - window.innerHeight) : top + h; return { top, h, end }; });

for (const [name, c] of Object.entries({ 'desktop-light': { width: 1440, height: 900, mobile: false, dpr: 1 }, 'mobile-light': { width: 393, height: 852, mobile: true, dpr: 2 } })) {
  const r = (report[name] = {});
  // 1 — keyboard path from the top: Tab × 6, what gets focus and is the ring visible
  {
    const ctx = await browser.newContext({ viewport: { width: c.width, height: c.height }, deviceScaleFactor: c.dpr, isMobile: c.mobile, hasTouch: c.mobile });
    const page = await ctx.newPage(); const errors = []; page.on('pageerror', (e) => errors.push(String(e))); page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto(BASE + '/', { waitUntil: 'load' }); await ready(page);
    const stops = [];
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Tab'); await page.waitForTimeout(120);
      stops.push(await page.evaluate(() => { const el = document.activeElement; if (!el || el === document.body) return { tag: 'body' }; const cs = getComputedStyle(el); const rect = el.getBoundingClientRect(); return { tag: el.tagName, text: (el.textContent || '').trim().slice(0, 40), href: el.getAttribute('href'), outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`, inViewport: rect.bottom > 0 && rect.top < innerHeight, scrollY: window.scrollY }; }));
      if (i === 1) await page.screenshot({ path: join(OUT, `${name}-focus-tab2.png`) });
    }
    r.tabStops = stops;
    // 2 — Skip intro: click it, where do we land?
    await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300);
    const skip = page.locator('a:has-text("Skip intro")');
    r.skipVisible = await skip.isVisible();
    await skip.click(); await page.waitForTimeout(1200);
    r.afterSkip = await page.evaluate(() => { const id = document.querySelector('[data-hero-identity]'); const rect = id?.getBoundingClientRect(); const skip = document.querySelector('a[href="#hero"]'); return { scrollY: window.scrollY, hash: location.hash, identityTop: rect?.top, identityVisible: !!rect && rect.top >= 0 && rect.bottom <= innerHeight, skipRetired: skip?.hasAttribute('data-skip-done'), activeTag: document.activeElement?.tagName, activeId: document.activeElement?.id }; });
    await page.screenshot({ path: join(OUT, `${name}-after-skip.png`) });
    r.consoleErrors = errors;
    await ctx.close();
  }
  // 3 — reduced motion: the static frame + its seam
  {
    const ctx = await browser.newContext({ viewport: { width: c.width, height: c.height }, deviceScaleFactor: c.dpr, isMobile: c.mobile, hasTouch: c.mobile, reducedMotion: 'reduce' });
    const page = await ctx.newPage(); await page.goto(BASE + '/', { waitUntil: 'load' }); await ready(page); await page.waitForTimeout(600);
    r.reducedMotion = await page.evaluate(() => ({ staticFrame: !!document.querySelector('.cdesert-static'), pinned: !!document.querySelector('.cdesert-pin'), creditVisible: (() => { const el = document.querySelector('.cdesert-credit-line'); if (!el) return null; const cs = getComputedStyle(el); return { opacity: cs.opacity, text: el.textContent.trim() }; })(), veilOpacity: (() => { const el = document.querySelector('.cdesert-veil'); return el ? getComputedStyle(el).opacity : null; })(), frameAnimation: (() => { const el = document.querySelector('.cdesert-frame'); return el ? getComputedStyle(el).animationName : 'n/a (static)'; })() }));
    await page.screenshot({ path: join(OUT, `${name}-rm-top.png`) });
    const g = await geom(page); await page.evaluate((y) => window.scrollTo(0, y), g.end + 160); await page.waitForTimeout(500);
    await page.screenshot({ path: join(OUT, `${name}-rm-handoff.png`) });
    await ctx.close();
  }
  // 4 — no JavaScript: is the essential content there, is anything stranded invisible?
  {
    const ctx = await browser.newContext({ viewport: { width: c.width, height: c.height }, deviceScaleFactor: c.dpr, isMobile: c.mobile, hasTouch: c.mobile, javaScriptEnabled: false });
    const page = await ctx.newPage(); await page.goto(BASE + '/', { waitUntil: 'load' }); await page.waitForTimeout(1800);
    r.noJs = await page.evaluate(() => { const vis = (sel) => { const el = document.querySelector(sel); if (!el) return 'missing'; const cs = getComputedStyle(el); return `opacity ${cs.opacity}, visibility ${cs.visibility}`; }; return { title: vis('.cdesert-title'), frame: vis('.cdesert-frame'), hero: vis('[data-hero-identity]'), skip: vis('a[href="#hero"]'), heroText: document.querySelector('[data-hero-identity]')?.textContent?.trim().slice(0, 60) }; });
    await page.screenshot({ path: join(OUT, `${name}-nojs-top.png`) });
    const g = await geom(page); await page.evaluate((y) => window.scrollTo(0, y), g.top + g.h + 420); await page.waitForTimeout(300);
    await page.screenshot({ path: join(OUT, `${name}-nojs-hero.png`) });
    await ctx.close();
  }
  // 5 — axe at the opening frame and at the landing frame (automated scan; not a compliance claim)
  {
    const ctx = await browser.newContext({ viewport: { width: c.width, height: c.height }, deviceScaleFactor: c.dpr, isMobile: c.mobile, hasTouch: c.mobile });
    const page = await ctx.newPage(); await page.goto(BASE + '/', { waitUntil: 'load' }); await ready(page);
    await page.addScriptTag({ content: axeSource });
    const run = () => page.evaluate(async () => { const res = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } }); return res.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, targets: v.nodes.slice(0, 3).map((n) => n.target.join(' ')) })); });
    r.axeOpening = await run();
    const g = await geom(page); await page.evaluate((y) => window.scrollTo(0, y), g.end); await page.waitForTimeout(1600);
    r.axeLanding = await run();
    // 6 — the credit's measured contrast: sample the rendered pixels behind + around the credit line at p=1
    const box = await page.evaluate(() => { const el = document.querySelector('.cdesert-credit-line'); if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
    if (box) {
      const png = await page.screenshot({ type: 'png' });
      const img = sharp(png); const meta = await img.metadata(); const s = c.dpr;
      const region = { left: Math.max(0, Math.round(box.x * s) - 4), top: Math.max(0, Math.round(box.y * s) - 4), width: Math.min(meta.width, Math.round(box.w * s) + 8), height: Math.min(meta.height, Math.round(box.h * s) + 8) };
      const { data, info } = await img.extract(region).raw().toBuffer({ resolveWithObject: true });
      const lum = (r, g, b) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
      const L = []; for (let i = 0; i < data.length; i += info.channels) L.push(lum(data[i], data[i + 1], data[i + 2]));
      L.sort((a, b) => a - b);
      const q = (p) => L[Math.floor(p * (L.length - 1))];
      const bone = lum(255, 246, 236);
      const cr = (bg) => (Math.max(bone, bg) + 0.05) / (Math.min(bone, bg) + 0.05);
      // The text's own pixels are the brightest in the crop; the background is the lower part of the distribution.
      r.creditContrast = { crop: region, bgMedianL: +q(0.5).toFixed(4), bgP90L: +q(0.9).toFixed(4), contrastVsMedian: +cr(q(0.5)).toFixed(2), contrastVsP90: +cr(q(0.9)).toFixed(2), note: 'bone #FFF6EC vs sampled background luminance inside the credit box (p90 = brightest non-glyph ground, worst case)' };
      await sharp(png).extract({ left: Math.max(0, region.left - 60), top: Math.max(0, region.top - 40), width: Math.min(meta.width - Math.max(0, region.left - 60), region.width + 120), height: Math.min(meta.height - Math.max(0, region.top - 40), region.height + 80) }).png().toFile(join(OUT, `${name}-credit-crop.png`));
    }
    await ctx.close();
  }
  console.log('[a11y]', name, 'done');
}
await browser.close();
writeFileSync(join(OUT, 'report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 1).slice(0, 4000));
