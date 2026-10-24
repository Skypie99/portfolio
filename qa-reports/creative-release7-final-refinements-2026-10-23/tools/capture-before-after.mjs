// Before/after capture for the two R7 corrections (R7-VIS-01 status wrap, R7-VIS-02 tag alignment).
// BEFORE = the preserved package's own out/ (f0dec85), served read-only over loopback.
// AFTER  = the correction branch's fresh `npm run build` out/.
// Same browser, viewport, theme and scroll walk for both. Usage: node capture-before-after.mjs <outDir>
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const req = createRequire('/Users/skypie/Portfolio/package.json');
const { chromium, webkit } = req('playwright-core');
const sharp = req('sharp');
const OUT = process.argv[2];
const SIDES = { before: 'http://127.0.0.1:8741/', after: 'http://127.0.0.1:8742/' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function walk(page, rm) {
  await page.evaluate(() => document.fonts.ready);
  const top = await page.evaluate(() => document.querySelector('#flagship').getBoundingClientRect().top + scrollY);
  for (let y = 0; y < top; y += 400) { await page.evaluate((v) => scrollTo(0, v), y); await sleep(20); }
  const bottom = await page.evaluate(() => { const r = document.querySelector('#flagship').getBoundingClientRect(); return r.bottom + scrollY; });
  if (!rm) for (let y = top; y < bottom; y += 300) { await page.evaluate((v) => scrollTo(0, v), y); await sleep(60); }
  await page.evaluate((v) => scrollTo(0, v), top);
  await sleep(rm ? 200 : 2600);
  await page.waitForFunction(() => [...document.querySelectorAll('#flagship img')].every((i) => i.complete), null, { timeout: 15000 }).catch(() => {});
}

const MEASURE = () => {
  const room = document.querySelector('#flagship'); const rb = room.getBoundingClientRect();
  const box = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return { x: +b.left.toFixed(1), y: +(b.top - rb.top).toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1), cx: +(b.left + b.width / 2).toFixed(1) }; };
  // words grouped by rendered line
  const wordLines = (el) => { if (!el) return null; const lines = new Map(); const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let n; (n = tw.nextNode());) { const re = /\S+/g; let m; while ((m = re.exec(n.data))) { const r = document.createRange(); r.setStart(n, m.index); r.setEnd(n, m.index + m[0].length); const rc = r.getClientRects()[0]; if (!rc) continue; const k = Math.round(rc.top); lines.set(k, [...(lines.get(k) || []), m[0]]); } }
    return [...lines.entries()].sort((a, b) => a[0] - b[0]).map(([, w]) => w.join(' ')); };
  const ps = [...room.querySelectorAll('p')]; const byText = (t) => ps.find((p) => p.textContent.replace(/\s+/g, ' ').trim().startsWith(t));
  const status = byText('Status'); const claim = byText('SEVERITY') || byText('Severity'); const prov = byText('CURRENT EXPLORE') || byText('Current Explore'); const caption = byText('Steep grade');
  const tag = room.querySelector('[data-exhibit-detail] > p'); const capcap = byText('Current product capture');
  const plate = room.querySelector('[data-exhibit-detail] .overflow-hidden'); const frame = room.querySelector('.pr-frame-phone'); const screen = room.querySelector('.pr-screen');
  const h2 = room.querySelector('h2'); const cta = room.querySelector('a[href="/work/flagstone/"]');
  const cs = (el, p) => (el ? getComputedStyle(el).getPropertyValue(p) : null);
  return {
    roomH: +rb.height.toFixed(1), docW: document.documentElement.scrollWidth, vw: innerWidth,
    lines: { h2: wordLines(h2), claim: wordLines(claim), caption: wordLines(caption), provenance: wordLines(prov), status: wordLines(status), tag: wordLines(tag), captureCaption: wordLines(capcap) },
    statusWrap: cs(status, 'text-wrap') || cs(status, 'text-wrap-style'), statusClipped: status ? status.scrollWidth > status.clientWidth + 1 : null,
    textAlign: { tag: cs(tag, 'text-align'), captureCaption: cs(capcap, 'text-align') },
    boxes: { status: box(status), tag: box(tag), capcap: box(capcap), plate: box(plate), frame: box(frame), screen: box(screen), h2: box(h2), cta: box(cta) },
    leaderDisplay: cs(room.querySelector('[data-exhibit-detail] .h-px'), 'display'),
    isDark: document.documentElement.classList.contains('dark'), hasJsClass: document.documentElement.classList.contains('js'),
  };
};

async function frame(bt, side, f) {
  const browser = await bt.launch(); const { w, h, dpr = 1, theme, rm = false, nojs = false, focus = false } = f;
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dpr, colorScheme: theme, reducedMotion: rm ? 'reduce' : 'no-preference', javaScriptEnabled: !nojs, ...(w < 600 ? { isMobile: true, hasTouch: true } : {}) });
  if (!nojs) await ctx.addInitScript((t) => { try { localStorage.setItem('theme', t); } catch {} }, theme);
  const page = await ctx.newPage(); const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(SIDES[side], { waitUntil: 'networkidle' });
  await walk(page, rm || nojs);
  const tag = `${side}/${bt === webkit ? 'webkit-' : ''}${theme}-${w}x${h}${dpr > 1 ? '@' + dpr : ''}${rm ? '-rm' : ''}${nojs ? '-nojs' : ''}${focus ? '-focus' : ''}`;
  fs.mkdirSync(path.join(OUT, side), { recursive: true });
  const m = await page.evaluate(MEASURE);
  await page.locator('#flagship').screenshot({ path: path.join(OUT, `${tag}-room.png`) });
  if (w >= 1024) await page.locator('#flagship .lg\\:flex.lg\\:flex-col').screenshot({ path: path.join(OUT, `${tag}-copy.png`) }).catch(() => {});
  await page.locator('#flagship [class*="exhibitDetail_stage"]').screenshot({ path: path.join(OUT, `${tag}-stage.png`) }).catch(() => {});
  let focusRing = null;
  if (focus) { await page.keyboard.press('Tab'); await page.locator('#flagship a[href="/work/flagstone/"]').focus();
    focusRing = await page.evaluate(() => { const a = document.activeElement; const s = getComputedStyle(a); return { href: a.getAttribute('href'), focusVisible: a.matches(':focus-visible'), outline: `${s.outlineWidth} ${s.outlineStyle} ${s.outlineColor}`, outlineOffset: s.outlineOffset, boxShadow: s.boxShadow }; });
    await page.locator('#flagship a[href="/work/flagstone/"]').screenshot({ path: path.join(OUT, `${tag}-cta-focus.png`) }); }
  await browser.close();
  return { tag, side, engine: bt.name(), ...f, errors, focusRing, ...m };
}

const W = [[1440, 900], [1280, 800], [1180, 820], [1024, 768], [768, 1024], [393, 852, 2], [320, 700, 2]];
const plan = [];
for (const [w, h, dpr] of W) for (const theme of ['light', 'dark']) plan.push({ w, h, dpr, theme });
plan.push({ w: 1440, h: 900, theme: 'light', rm: true }, { w: 393, h: 852, dpr: 2, theme: 'light', rm: true }, { w: 1280, h: 800, theme: 'dark', rm: true });
plan.push({ w: 1280, h: 800, theme: 'light', nojs: true }, { w: 393, h: 852, dpr: 2, theme: 'light', nojs: true });
plan.push({ w: 1440, h: 900, theme: 'light', focus: true }, { w: 1440, h: 900, theme: 'dark', focus: true });
const results = [];
for (const f of plan) for (const side of ['before', 'after']) {
  results.push(await frame(chromium, side, f)); process.stdout.write('.');
}
for (const f of [{ w: 1280, h: 800, theme: 'light' }, { w: 393, h: 852, dpr: 2, theme: 'light' }]) for (const side of ['before', 'after']) { results.push(await frame(webkit, side, f)); process.stdout.write('w'); }
fs.writeFileSync(path.join(OUT, 'measurements.json'), JSON.stringify(results, null, 1));

// pixel diff before vs after, per room frame: count + bounding box of changed pixels (room-relative CSS px)
const diffs = [];
for (const r of results.filter((x) => x.side === 'after')) {
  const a = path.join(OUT, `${r.tag}-room.png`), b = a.replace('/after/', '/before/');
  const p = a, q = b;
  if (!fs.existsSync(p) || !fs.existsSync(q)) continue;
  const [A, B] = await Promise.all([p, q].map((f) => sharp(f).ensureAlpha().raw().toBuffer({ resolveWithObject: true })));
  if (A.info.width !== B.info.width || A.info.height !== B.info.height) { diffs.push({ tag: r.tag, sizeChanged: true, before: [B.info.width, B.info.height], after: [A.info.width, A.info.height] }); continue; }
  let n = 0, x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1; const { width, height } = A.info; const d = r.dpr || 1;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) { const i = (y * width + x) * 4; if (Math.abs(A.data[i] - B.data[i]) + Math.abs(A.data[i + 1] - B.data[i + 1]) + Math.abs(A.data[i + 2] - B.data[i + 2]) > 24) { n++; if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y; } }
  diffs.push({ tag: r.tag.replace('after/', ''), changedPx: n, bboxCss: n ? [x0 / d, y0 / d, (x1 + 1) / d, (y1 + 1) / d].map((v) => Math.round(v)) : null });
}
fs.writeFileSync(path.join(OUT, 'pixel-diff.json'), JSON.stringify(diffs, null, 1));
console.log('\ndone', results.length, 'frames');
