// Before/after probe of the flagship room's detail plate. BEFORE = main 43788b2 out/ on :8741,
// AFTER = refine/flagstone-detail-crop out/ on :8742. Same browser, viewport, theme, scroll walk.
import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
const req = createRequire('/Users/skypie/Portfolio/package.json');
const { chromium, webkit } = req('playwright-core');
const OUT = process.argv[2]; const SIDES = { before: 'http://127.0.0.1:8741/', after: 'http://127.0.0.1:8742/' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const CAP = { w: 1290, h: 2803, box: process.argv[3] ? JSON.parse(process.argv[3]) : null };
async function walk(page) {
  await page.evaluate(() => document.fonts.ready);
  const top = await page.evaluate(() => document.querySelector('#flagship').getBoundingClientRect().top + scrollY);
  for (let y = 0; y < top; y += 400) { await page.evaluate((v) => scrollTo(0, v), y); await sleep(20); }
  const bottom = await page.evaluate(() => { const r = document.querySelector('#flagship').getBoundingClientRect(); return r.bottom + scrollY; });
  for (let y = top; y < bottom; y += 300) { await page.evaluate((v) => scrollTo(0, v), y); await sleep(60); }
  await page.evaluate(() => document.querySelector('#flagship [class*="exhibitDetail_stage"]').scrollIntoView({ block: 'center' }));
  await sleep(2600);
  await page.waitForFunction(() => [...document.querySelectorAll('#flagship img')].every((i) => i.complete && i.naturalWidth > 0), null, { timeout: 15000 }).catch(() => {});
}
const MEASURE = () => {
  const room = document.querySelector('#flagship');
  const r = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return { x: +b.left.toFixed(2), y: +b.top.toFixed(2), w: +b.width.toFixed(2), h: +b.height.toFixed(2) }; };
  const plateBox = room.querySelector('[data-exhibit-detail] .overflow-hidden');
  const plateImg = plateBox.querySelector('img'); const screenImg = room.querySelector('.pr-screen img');
  const leader = room.querySelector('[data-exhibit-detail] span.h-px'); const pin = room.querySelector('[data-exhibit-detail] span.rounded-full');
  const imgs = [...room.querySelectorAll('img')].map((i) => ({ src: i.currentSrc, nat: [i.naturalWidth, i.naturalHeight], alt: i.getAttribute('alt') }));
  const res = performance.getEntriesByType('resource').filter((e) => /explore-current/.test(e.name)).map((e) => e.name.replace(location.origin, ''));
  return { vw: innerWidth, docW: document.documentElement.scrollWidth, dark: document.documentElement.classList.contains('dark'),
    plate: r(plateBox), plateImg: r(plateImg), screenImg: r(screenImg), leader: r(leader), leaderDisplay: leader && getComputedStyle(leader).display,
    pin: r(pin), tag: room.querySelector('[data-exhibit-detail] > p')?.textContent, imgs, captureRequests: res,
    plateImgFit: getComputedStyle(plateImg).objectFit };
};
async function frame(bt, side, f) {
  const browser = await bt.launch(); const { w, h, dpr = 1, theme } = f;
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dpr, colorScheme: theme, ...(w < 600 ? { isMobile: true, hasTouch: true } : {}) });
  await ctx.addInitScript((t) => { try { localStorage.setItem('theme', t); } catch {} }, theme);
  const page = await ctx.newPage(); const errors = []; page.on('pageerror', (e) => errors.push(String(e))); page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(SIDES[side], { waitUntil: 'networkidle' }); await walk(page);
  const tag = `${bt === webkit ? 'webkit-' : ''}${theme}-${w}`;
  const m = await page.evaluate(MEASURE);
  fs.mkdirSync(path.join(OUT, side), { recursive: true });
  await page.locator('#flagship [class*="exhibitDetail_stage"]').screenshot({ path: path.join(OUT, side, `${tag}-stage.png`) });
  await page.locator('#flagship [data-exhibit-detail] .overflow-hidden').screenshot({ path: path.join(OUT, side, `${tag}-plate.png`) });
  await page.locator('#flagship').screenshot({ path: path.join(OUT, side, `${tag}-room.png`) });
  await browser.close();
  // Derived: the capture rows the plate shows, and the capture row the leader lands on, on the screen.
  const s = m.screenImg, p = m.plate, pi = m.plateImg; const k = s.h / CAP.h;
  const shown = { y0: +((p.y - pi.y) / pi.h * CAP.h).toFixed(1), y1: +((p.y + p.h - pi.y) / pi.h * CAP.h).toFixed(1), x0: +((p.x - pi.x) / pi.w * CAP.w).toFixed(1), x1: +((p.x + p.w - pi.x) / pi.w * CAP.w).toFixed(1) };
  const plateAspectErr = +((p.w / p.h) - (pi.w / pi.h) * 0).toFixed(4);
  const imgDistortion = +Math.abs((pi.w / pi.h) / (CAP.w / CAP.h) - 1).toFixed(5);
  const leaderRow = m.leaderDisplay === 'block' ? +(((m.leader.y + m.leader.h / 2) - s.y) / k).toFixed(1) : null;
  return { tag, side, engine: bt.name(), ...f, errors, ...m, shownCaptureRegion: shown, imgDistortion, plateRenderScale: +(pi.w / CAP.w).toFixed(4), screenRenderScale: +(s.w / CAP.w).toFixed(4), leaderCaptureRow: leaderRow };
}
const plan = [];
for (const [w, h, dpr] of [[1440, 900, 1], [1280, 800, 1], [1024, 768, 1], [768, 1024, 1], [393, 852, 2]]) for (const theme of ['light', 'dark']) plan.push({ w, h, dpr, theme });
const results = [];
for (const f of plan) for (const side of ['before', 'after']) { results.push(await frame(chromium, side, f)); process.stdout.write('.'); }
for (const f of [{ w: 1440, h: 900, theme: 'light' }, { w: 393, h: 852, dpr: 2, theme: 'dark' }]) for (const side of ['before', 'after']) { results.push(await frame(webkit, side, f)); process.stdout.write('w'); }
fs.writeFileSync(path.join(OUT, 'measurements.json'), JSON.stringify(results, null, 1));
for (const x of results) console.log([x.side.padEnd(6), x.tag.padEnd(16), 'plate', `${x.plate.w}x${x.plate.h}`, 'shows y', x.shownCaptureRegion.y0, '..', x.shownCaptureRegion.y1, 'x', x.shownCaptureRegion.x0, '..', x.shownCaptureRegion.x1, 'distort', x.imgDistortion, 'leaderRow', x.leaderCaptureRow, 'docW', x.docW, 'req', x.captureRequests.length, 'err', x.errors.length].join(' '));
