// Follow-up probe: (1) text-extent alignment of tag vs plate and caption vs screen; (2) run-to-run determinism
// (BEFORE vs BEFORE) for frames whose before/after pixel diff covered the whole room; (3) no-JS frame/screen boxes.
import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
const req = createRequire('/Users/skypie/Portfolio/package.json'); const { chromium, webkit } = req('playwright-core'); const sharp = req('sharp');
const OUT = process.argv[2]; const SIDES = { before: 'http://127.0.0.1:8741/', after: 'http://127.0.0.1:8742/' }; const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function open(bt, side, { w, h, dpr = 1, theme, nojs = false }) {
  const browser = await bt.launch(); const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dpr, colorScheme: theme, javaScriptEnabled: !nojs, ...(w < 600 ? { isMobile: true, hasTouch: true } : {}) });
  if (!nojs) await ctx.addInitScript((t) => { try { localStorage.setItem('theme', t); } catch {} }, theme);
  const page = await ctx.newPage(); await page.goto(SIDES[side], { waitUntil: 'networkidle' }); await page.evaluate(() => document.fonts.ready);
  const top = await page.evaluate(() => document.querySelector('#flagship').getBoundingClientRect().top + scrollY);
  for (let y = 0; y < top; y += 400) { await page.evaluate((v) => scrollTo(0, v), y); await sleep(20); }
  await page.evaluate((v) => scrollTo(0, v), top); await sleep(2600);
  await page.waitForFunction(() => [...document.querySelectorAll('#flagship img')].every((i) => i.complete), null, { timeout: 15000 }).catch(() => {});
  return { browser, page };
}
const ALIGN = () => { const room = document.querySelector('#flagship');
  const textBox = (el) => { const r = document.createRange(); r.selectNodeContents(el); const b = r.getBoundingClientRect(); return { left: +b.left.toFixed(1), right: +b.right.toFixed(1), cx: +((b.left + b.right) / 2).toFixed(1) }; };
  const elBox = (el) => { const b = el.getBoundingClientRect(); return { left: +b.left.toFixed(1), right: +b.right.toFixed(1), cx: +((b.left + b.right) / 2).toFixed(1), top: +b.top.toFixed(1), h: +b.height.toFixed(1), w: +b.width.toFixed(1) }; };
  const tag = room.querySelector('[data-exhibit-detail] > p'); const cap = [...room.querySelectorAll('p')].find((p) => p.textContent.trim().startsWith('Current product capture'));
  const plate = room.querySelector('[data-exhibit-detail] .overflow-hidden'); const screen = room.querySelector('.pr-screen'); const frame = room.querySelector('.pr-frame-phone');
  const t = textBox(tag), c = textBox(cap), p = elBox(plate), s = elBox(screen);
  return { tagText: t, plate: p, captionText: c, screen: s, frame: elBox(frame), tagTextCxMinusPlateCx: +(t.cx - p.cx).toFixed(1), tagTextLeftMinusPlateLeft: +(t.left - p.left).toFixed(1), captionTextCxMinusScreenCx: +(c.cx - s.cx).toFixed(1), captionTextRightMinusScreenRight: +(c.right - s.right).toFixed(1) };
};
async function shot(bt, side, f, file) { const { browser, page } = await open(bt, side, f); await page.locator('#flagship').screenshot({ path: file }); await browser.close(); }
async function diff(a, b, dpr) { const [A, B] = await Promise.all([a, b].map((f) => sharp(f).ensureAlpha().raw().toBuffer({ resolveWithObject: true }))); if (A.info.width !== B.info.width || A.info.height !== B.info.height) return { sizeChanged: true }; let n = 0, x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1; const { width, height } = A.info; for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) { const i = (y * width + x) * 4; if (Math.abs(A.data[i] - B.data[i]) + Math.abs(A.data[i + 1] - B.data[i + 1]) + Math.abs(A.data[i + 2] - B.data[i + 2]) > 24) { n++; x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); } } return { changedPx: n, bboxCss: n ? [x0, y0, x1 + 1, y1 + 1].map((v) => Math.round(v / dpr)) : null }; }
const res = { alignment: [], determinism: [], nojs: [] };
for (const f of [{ w: 1440, h: 900, theme: 'light' }, { w: 1280, h: 800, theme: 'light' }, { w: 1024, h: 768, theme: 'light' }, { w: 768, h: 1024, theme: 'light' }, { w: 393, h: 852, dpr: 2, theme: 'light' }, { w: 320, h: 700, dpr: 2, theme: 'light' }])
  for (const side of ['before', 'after']) { const { browser, page } = await open(chromium, side, f); res.alignment.push({ side, w: f.w, ...(await page.evaluate(ALIGN)) }); await browser.close(); }
const dir = path.join(OUT, 'determinism'); fs.mkdirSync(dir, { recursive: true });
for (const [bt, f] of [[chromium, { w: 393, h: 852, dpr: 2, theme: 'dark' }], [chromium, { w: 768, h: 1024, theme: 'dark' }], [chromium, { w: 393, h: 852, dpr: 2, theme: 'light' }], [webkit, { w: 1280, h: 800, theme: 'light' }]]) {
  const n = `${bt.name()}-${f.theme}-${f.w}`; const a = path.join(dir, `${n}-before-run2.png`); await shot(bt, 'before', f, a);
  const first = path.join(OUT, 'before', `${bt === webkit ? 'webkit-' : ''}${f.theme}-${f.w}x${f.h}${f.dpr ? '@' + f.dpr : ''}-room.png`);
  res.determinism.push({ frame: n, beforeRun1VsBeforeRun2: await diff(first, a, f.dpr || 1) }); }
for (const f of [{ w: 1280, h: 800, theme: 'light', nojs: true }, { w: 393, h: 852, dpr: 2, theme: 'light', nojs: true }]) for (const side of ['before', 'after', 'before']) { const { browser, page } = await open(chromium, side, f); res.nojs.push({ side, w: f.w, ...(await page.evaluate(ALIGN)) }); await browser.close(); }
fs.writeFileSync(path.join(OUT, 'investigation.json'), JSON.stringify(res, null, 1)); console.log(JSON.stringify(res, (k, v) => (['tagText', 'captionText', 'plate', 'screen'].includes(k) ? undefined : v)));
