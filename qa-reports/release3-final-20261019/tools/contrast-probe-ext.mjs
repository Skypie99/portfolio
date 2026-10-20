// Release 3 final (2026-10-19): extended rendered text-contrast probe.
// Same method as qa-reports/release3-flagstone-20261019/tools/contrast-probe.mjs (computed text colour
// against the pixels behind glyph-hidden line boxes, the minimum over every 2px sample), widened:
// both engines, three widths, seven scroll positions, Flagstone's six proof-row targets, plus the
// shared kicker / caption on two other case studies (reported, not changed by Release 3).
//   node contrast-probe-ext.mjs <base-url> <out.json> [chromium,webkit]
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(path.join(process.cwd(), 'package.json'));
const pw = require('playwright-core');
const sharp = require('sharp');
const [base, dest, engines = 'chromium,webkit'] = process.argv.slice(2);
const FLAGSTONE = {
  label01: '[data-proof-window="01"] > p', label02: '[data-proof-window="02"] > p', label03: '[data-proof-window="03"] > p',
  provenance: '.proof-row + p', caption01: '[data-proof-window="01"] figcaption', caption02: '[data-proof-window="02"] figcaption',
  caption03: '[data-proof-window="03"] figcaption', kicker: '.proof-breakout > p:first-child',
};
const OTHER = { kicker: '[aria-label$="product evidence"] > p:first-child', caption01: '[aria-label$="product evidence"] figcaption' };
const PAGES = [['flagstone', FLAGSTONE], ['dashboard', OTHER], ['claude-corp', OTHER]];
const FRACTIONS = [0.05, 0.2, 0.35, 0.5, 0.65, 0.8, 0.95];
const lum = (c) => c.map((v) => v / 255).map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)).reduce((n, v, i) => n + v * [0.2126, 0.7152, 0.0722][i], 0);
const ratio = (a, b) => { const x = lum(a); const y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const rows = [];
for (const engine of engines.split(',')) {
  const browser = await pw[engine].launch({ headless: true });
  for (const width of [393, 1024, 1440]) for (const theme of ['light', 'dark']) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: theme, deviceScaleFactor: 1, reducedMotion: 'no-preference' });
    await context.route('**/*', (r) => (new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort()));
    const page = await context.newPage();
    for (const [slug, targets] of PAGES) {
      await page.goto(`${base}/work/${slug}/`, { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready);
      const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
      for (const [name, selector] of Object.entries(targets)) {
        if (!(await page.$(selector))) { rows.push({ engine, slug, width, theme, name, missing: true }); continue; }
        for (const fraction of FRACTIONS) {
          await page.evaluate(({ selector, fraction }) => { const e = document.querySelector(selector); window.scrollTo(0, scrollY + e.getBoundingClientRect().top - innerHeight * fraction); }, { selector, fraction });
          await page.waitForTimeout(900);
          const lines = (sel) => page.evaluate((sel) => { const r = document.createRange(); r.selectNodeContents(document.querySelector(sel)); return [...r.getClientRects()].filter((b) => b.width > 1 && b.y >= 0 && b.bottom <= innerHeight).map((b) => ({ x: b.x, y: b.y, width: b.width, height: b.height })); }, sel);
          const info = await page.evaluate((sel) => { const e = document.querySelector(sel); return { color: getComputedStyle(e).color, fontSize: getComputedStyle(e).fontSize, opacity: getComputedStyle(e.closest('li') ?? e).opacity }; }, selector);
          const before = await lines(selector);
          if (!before.length) { rows.push({ engine, slug, width, theme, name, fraction, offscreen: true }); continue; }
          const style = await page.addStyleTag({ content: `${selector}, ${selector} * { visibility:hidden!important; }` });
          await page.waitForTimeout(250);
          const shot = await page.screenshot({ type: 'png' });
          const after = await lines(selector);
          await style.evaluate((s) => s.remove());
          const stable = before.length === after.length && before.every((r, i) => Math.abs(r.x - after[i].x) < 0.5 && Math.abs(r.y - after[i].y) < 0.5);
          if (!stable || Number(info.opacity) < 0.999) { rows.push({ engine, slug, width, theme, name, fraction, unstable: true, opacity: info.opacity }); continue; }
          const color = info.color.match(/[\d.]+/g).slice(0, 3).map(Number);
          const { data, info: img } = await sharp(shot).removeAlpha().raw().toBuffer({ resolveWithObject: true });
          const samples = [];
          for (const r of before) for (let y = Math.ceil(r.y); y < Math.floor(r.y + r.height); y += 2) for (let x = Math.ceil(r.x); x < Math.floor(r.x + r.width); x += 2) {
            if (x < 0 || x >= img.width || y < 0 || y >= img.height) continue;
            const n = (y * img.width + x) * img.channels; samples.push(ratio(color, [data[n], data[n + 1], data[n + 2]]));
          }
          samples.sort((a, b) => a - b);
          rows.push({ engine, slug, width, theme, isDark, name, fraction, color: info.color, fontSize: info.fontSize, n: samples.length, min: samples[0], p05: samples[Math.floor(samples.length * 0.05)], median: samples[Math.floor(samples.length * 0.5)] });
        }
      }
    }
    await context.close();
    console.log('contrast', engine, width, theme);
  }
  await browser.close();
}
const measured = rows.filter((r) => r.min !== undefined);
const worst = {};
for (const r of measured) { const k = `${r.slug}/${r.theme}/${r.name}`; if (!worst[k] || r.min < worst[k].min) worst[k] = r; }
const result = {
  method: 'Computed text colour vs rendered pixels behind glyph-hidden line boxes (visibility:hidden, layout unchanged), every 2px, minimum reported. Chromium + WebKit headless, DPR 1, 393/1024/1440 x 900, 7 scroll positions. Rows with moving layout or a not-yet-revealed (opacity<1) ancestor are recorded as unstable and excluded.',
  generated: new Date().toISOString(), samples: measured.length, unstable: rows.filter((r) => r.unstable).length,
  worst: Object.values(worst).map((r) => ({ key: `${r.slug}/${r.theme}/${r.name}`, engine: r.engine, width: r.width, fraction: r.fraction, color: r.color, fontSize: r.fontSize, min: +r.min.toFixed(3), p05: +r.p05.toFixed(3), median: +r.median.toFixed(3) })),
  rows,
};
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, JSON.stringify(result, null, 2) + '\n');
for (const w of result.worst) console.log(w.key.padEnd(34), w.engine.padEnd(8), String(w.width).padEnd(5), w.color.padEnd(20), 'min', w.min, 'p05', w.p05);
