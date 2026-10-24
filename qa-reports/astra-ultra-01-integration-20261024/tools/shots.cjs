// Before/after visual previews for every integrated surface.
// usage: node shots.cjs <baselineUrl> <candidateUrl> <outDir>
const assertStyled = require('./guard.cjs');
const { chromium } = require(process.env.PW);
const fs = require('fs');
const path = require('path');

const pick = (js) => js; // readability: finders are page-side expressions
const SURFACES = [
  { id: 'certificates', route: '/certificates/', widths: [390, 768, 1024, 1440], find: pick(`document.querySelector('.cert-grid')`), maxH: 1600 },
  { id: 'work-card-actions', route: '/work/', widths: [390, 768, 1440], find: pick(`[...document.querySelectorAll('a[href="https://ghostcode.skypistudio.com"]')].find(a => a.closest('div.border-t')).closest('.case-study-card-copy')`) },
  { id: 'case-pill-claude-corp', route: '/work/claude-corp/', widths: [390, 768, 1024, 1440], find: pick(`[...document.querySelectorAll('a[href="https://claudecorp.skypistudio.com"]')].find(a => a.className.includes('rounded-pill')).parentElement`), pad: 48 },
  { id: 'case-pill-prompt-library', route: '/work/prompt-library/', widths: [390, 1024, 1440], find: pick(`[...document.querySelectorAll('a[href="https://prompts.skypistudio.com"]')].find(a => a.className.includes('rounded-pill')).parentElement`), pad: 48 },
  { id: 'case-pill-flagstone', route: '/work/flagstone/', widths: [390, 1024, 1440], find: pick(`[...document.querySelectorAll('a[href="https://flagstone.skypistudio.com"]')].find(a => a.className.includes('rounded-pill')).parentElement`), pad: 48 },
  { id: 'home-contribution-heading', route: '/', widths: [390, 768, 1440], find: pick(`document.querySelector('#how-i-work h2').parentElement`), pad: 32 },
  { id: 'home-record-defect', route: '/', widths: [390, 1440], find: pick(`[...document.querySelectorAll('#record li, section li')].find(li => /documented defect|Last defect/.test(li.textContent) && li.textContent.length < 400)`), pad: 16 },
  { id: 'home-work-ghost-code-hover', route: '/', widths: [390, 768, 1440], find: pick(`(() => { const lis = document.querySelectorAll('#work ol > li'); const w = document.createElement('div'); return lis[lis.length - 1]; })()`), hover: pick(`document.querySelectorAll('#work ol > li')[4].querySelector('h3 a')`), extendUp: 'prev', pad: 24 },
  { id: 'home-work-ghost-code-focus', route: '/', widths: [1440], find: pick(`document.querySelectorAll('#work ol > li')[4]`), focus: pick(`document.querySelectorAll('#work ol > li')[4].querySelector('h3 a')`), extendUp: 'prev', pad: 24 },
  { id: 'contact-intro', route: '/contact/', widths: [390, 768, 1440], find: pick(`[...document.querySelectorAll('main p')].find(p => /Accessible technology/.test(p.textContent)).closest('section') || document.querySelector('main')`), maxH: 1400 },
  { id: 'back-home-focus-work', route: '/work/', widths: [1440], find: pick(`[...document.querySelectorAll('a[href="/"]')].find(a => /Back to home/.test(a.textContent))`), focus: pick(`[...document.querySelectorAll('a[href="/"]')].find(a => /Back to home/.test(a.textContent))`), pad: 32 },
  { id: 'flagship-cr7', route: '/', widths: [390, 768, 1440], find: pick(`document.querySelector('#flagship')`), maxH: 2600, pixelCompare: true },
];

(async () => {
  const [baseUrl, candUrl, outDir] = process.argv.slice(2);
  const browser = await chromium.launch();
  const manifest = [];
  for (const s of SURFACES) for (const width of s.widths) for (const scheme of ['light', 'dark']) for (const [side, base] of [['before', baseUrl], ['after', candUrl]]) {
    const ctx = await browser.newContext({ viewport: { width, height: 1000 }, colorScheme: scheme, reducedMotion: 'reduce', deviceScaleFactor: 2 });
    await ctx.addInitScript(() => document.addEventListener('click', (e) => e.preventDefault(), true));
    const page = await ctx.newPage();
    await page.goto(base + s.route, { waitUntil: 'networkidle' });
    await assertStyled(page);
    const el = (await page.evaluateHandle(s.find)).asElement();
    await el.evaluate((n) => n.scrollIntoView({ block: 'center' }));
    await page.waitForTimeout(700);
    if (s.hover) { const h = (await page.evaluateHandle(s.hover)).asElement(); await h.hover(); }
    if (s.focus) { await page.keyboard.press('Shift'); await page.evaluate(`(${s.focus}).focus()`); }
    await page.waitForTimeout(600);
    let r = await el.boundingBox();
    if (s.extendUp === 'prev') {
      const prev = await el.evaluate((n) => { const p = n.previousElementSibling.getBoundingClientRect(); return p.top; });
      r = { ...r, height: r.y + r.height - prev, y: prev };
    }
    const dir = path.join(outDir, s.id); fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `${width}-${scheme}-${side}.png`);
    let state = null;
    if (s.hover || s.focus || s.extendUp) {
      // Interactive states: no scrolling between applying the state and the
      // capture (scrolling moves the element out from under the pointer), so
      // clip in viewport coordinates and record that the state really applied.
      const pad = s.pad ?? 20;
      const x = Math.max(0, r.x - pad), y = Math.max(0, r.y - pad);
      const clip = { x, y, width: Math.min(width - x, r.width + 2 * pad), height: Math.min(1000 - y, r.height + 2 * pad) };
      state = await page.evaluate(`(() => { const t = ${s.hover || s.focus}; return { hover: t.matches(':hover'), focusVisible: t.matches(':focus-visible') }; })()`);
      await page.screenshot({ path: file, clip });
    } else {
      await el.screenshot({ path: file });
    }
    manifest.push({ surface: s.id, route: s.route, width, scheme, side, state, file: path.relative(outDir, file) });
    await ctx.close();
    process.stdout.write('.');
  }
  await browser.close();
  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 1));
  console.log('\nshots', manifest.length);
})();
