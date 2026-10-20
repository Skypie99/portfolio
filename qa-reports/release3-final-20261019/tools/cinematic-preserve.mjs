// Release 3 final (2026-10-19): is the cinematic desktop hotfix (PR #30) still live in the candidate's
// built homepage? Headless, so this is a behaviour check, not the headed tile-memory matrix:
//   - desktop Chromium: plate fit engages (picture.cdesert-plate--fit with --cdesert-fit-* set),
//     the frame's light-up animation starts once and is never cancelled, world parking toggles
//     while the film covers the viewport;
//   - phone Chromium and desktop WebKit: plate fit stays off (hotfix scope: Chromium desktop only);
//   - reduced motion: the static frame paints, no light-up.
//   node cinematic-preserve.mjs <base-url> <out.json>
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(path.join(process.cwd(), 'package.json'));
const pw = require('playwright-core');
const [base, dest] = process.argv.slice(2);
const runs = [
  { engine: 'chromium', vp: [1440, 900], rm: 'no-preference', expectFit: true },
  { engine: 'chromium', vp: [1920, 1080], rm: 'no-preference', expectFit: true },
  { engine: 'chromium', vp: [393, 852], rm: 'no-preference', expectFit: false, mobile: true },
  { engine: 'webkit', vp: [1440, 900], rm: 'no-preference', expectFit: false },
  { engine: 'chromium', vp: [1440, 900], rm: 'reduce', expectFit: null },
];
const out = [];
for (const r of runs) {
  const browser = await pw[r.engine].launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: r.vp[0], height: r.vp[1] }, deviceScaleFactor: 2, reducedMotion: r.rm, isMobile: Boolean(r.mobile), hasTouch: Boolean(r.mobile) });
  await ctx.route('**/*', (q) => (new URL(q.request().url()).hostname === '127.0.0.1' ? q.continue() : q.abort()));
  await ctx.addInitScript(() => {
    window.__anim = { start: 0, cancel: 0, end: 0 };
    for (const [type, key] of [['animationstart', 'start'], ['animationcancel', 'cancel'], ['animationend', 'end']]) {
      document.addEventListener(type, (e) => { if (e.target.classList?.contains('cdesert-frame')) window.__anim[key] += 1; }, true);
    }
    window.__parked = [];
    // rig v2: the init script runs before <html> exists, so attach once it does.
    const watch = () => new MutationObserver(() => {
      const p = document.documentElement.classList.contains('cdesert-world-parked');
      if (window.__parked.at(-1) !== p) window.__parked.push(p);
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    if (document.documentElement) watch(); else new MutationObserver((_, mo) => { if (document.documentElement) { mo.disconnect(); watch(); } }).observe(document, { childList: true });
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`${base}/`, { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  const sample = () => page.evaluate(() => {
    const pics = [...document.querySelectorAll('.cdesert-stage picture')];
    const fit = pics.filter((p) => p.classList.contains('cdesert-plate--fit'));
    const st = fit[0] ? getComputedStyle(fit[0]) : null;
    return {
      plates: pics.length, fit: fit.length,
      fitVars: st ? ['--cdesert-fit-k', '--cdesert-fit-w', '--cdesert-fit-h'].map((v) => st.getPropertyValue(v).trim() || fit[0].style.getPropertyValue(v)) : null,
      frameAnimation: (() => { const f = document.querySelector('.cdesert-stage .cdesert-frame'); return f ? getComputedStyle(f).animationName + ' / ' + getComputedStyle(f).animationFillMode : null; })(),
      anim: { ...window.__anim }, parked: [...window.__parked], scrollY: Math.round(scrollY),
    };
  });
  const atTop = await sample();
  // Scroll through the film in steps, then past it.
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y <= Math.min(h, r.vp[1] * 6); y += Math.round(r.vp[1] / 3)) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(800);
  const after = await sample();
  const rec = { ...r, version: browser.version(), atTop, after, errors };
  rec.pass = errors.length === 0
    && (r.expectFit === true ? atTop.fit > 0 && atTop.fit === atTop.plates && atTop.anim.start === 1 && after.anim.start === 1 && after.anim.cancel === 0 && after.parked.includes(true)
      : r.expectFit === false ? atTop.fit === 0 && after.fit === 0 && after.anim.cancel === 0
        : after.anim.start === 0);
  out.push(rec);
  console.log(r.engine, r.vp.join('x'), r.rm, JSON.stringify({ fit: `${atTop.fit}/${atTop.plates}`, anim: after.anim, parked: after.parked, frame: atTop.frameAnimation }), rec.pass ? 'PASS' : 'FAIL');
  await browser.close();
}
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, JSON.stringify(out, null, 2) + '\n');
process.exitCode = out.every((r) => r.pass) ? 0 : 1;
