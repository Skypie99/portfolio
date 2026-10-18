#!/usr/bin/env node
/**
 * capture.mjs — renders the RC2 VE04 thin-frame study and records evidence.
 *
 * Uses ONLY the repository's own declared toolchain (playwright-core + sharp,
 * both in package.json devDependencies) and the Chromium already installed in
 * the Cloud environment at $PLAYWRIGHT_BROWSERS_PATH. Nothing is installed.
 *
 * It serves the repository root over loopback HTTP (so ../../public media
 * resolve exactly as the prototype references them), then captures:
 *   comp     composition shots of baseline / A / B per theme per viewport (JPEG)
 *   fullpage full-page phone captures (overflow evidence)
 *   detail   window-01 crops at DSF 2 (rest / armed / bleed) + pixel readings (PNG)
 *   focus    real keyboard focus on the Play control (Tab), ring readings, Enter plays
 *   motion   the prototype settle transition: screenshot frames + per-rAF colour trace
 *   modes    reduced motion (incl. mid-beat switch), no-JS, prefers-contrast: more
 * and writes captures/manifest.json + captures/MEASUREMENTS.md.
 *
 * Run from the study folder:  node tools/capture.mjs [--only=comp,detail,...]
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import sharp from 'sharp';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const STUDY = path.resolve(HERE, '..');
const ROOT = path.resolve(STUDY, '..', '..');
const REL = path.relative(ROOT, STUDY).split(path.sep).join('/');
const OUT = path.join(STUDY, 'captures');
const EXE = process.env.STUDY_CHROMIUM || path.join(process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers', 'chromium-1194', 'chrome-linux', 'chrome');
const ONLY = (process.argv.find((a) => a.startsWith('--only=')) || '--only=comp,fullpage,detail,focus,motion,modes').slice(7).split(',');
const want = (p) => ONLY.includes(p);

for (const d of ['composition', 'fullpage', 'detail', 'focus', 'motion', 'modes']) fs.mkdirSync(path.join(OUT, d), { recursive: true });

const VIEWPORTS = [
  { name: '1440x900', w: 1440, h: 900, kind: 'desktop' },
  { name: '1920x1080', w: 1920, h: 1080, kind: 'desktop' },
  { name: '393x852', w: 393, h: 852, kind: 'phone' },
  { name: '375x667', w: 375, h: 667, kind: 'phone' },
  { name: '320x568', w: 320, h: 568, kind: 'phone' },
];
const THEMES = ['light', 'dark'];
const SECTION = { baseline: '#baseline', A: '#variant-a', B: '#variant-b' };

const manifest = {
  generatedAt: new Date().toISOString(),
  chromium: null,
  fonts: null,
  notes: [
    'All readings are instrument readings off this standalone prototype, not the live site.',
    'Stages sit on the canvas-alt token, an approximation of the live world-surface-alt composite.',
    'Pixel readings are median samples of small runs at stated element-relative coordinates, device scale factor 2.',
  ],
  overflow: [],
  geometry: [],
  shots: [],
  pixels: [],
  focus: [],
  motion: [],
  modes: [],
};

/* ---------- static server (Range-aware so <video> can seek) ---------- */
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.avif': 'image/avif', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.webm': 'video/webm', '.woff2': 'font/woff2', '.vtt': 'text/vtt',
};
function serve(req, res) {
  const url = new URL(req.url, 'http://x');
  const file = path.join(ROOT, decodeURIComponent(url.pathname));
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  const size = fs.statSync(file).size;
  const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
  const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
  if (range) {
    const start = range[1] ? Number(range[1]) : 0;
    const end = range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
    res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': end - start + 1, 'Accept-Ranges': 'bytes' });
    fs.createReadStream(file, { start, end }).pipe(res);
  } else {
    res.writeHead(200, { 'Content-Type': type, 'Content-Length': size, 'Accept-Ranges': 'bytes' });
    fs.createReadStream(file).pipe(res);
  }
}
const server = http.createServer(serve);
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const PORT = server.address().port;
const studyUrl = (params) => {
  const u = new URL(`http://127.0.0.1:${PORT}/${REL}/index.html`);
  for (const [k, v] of Object.entries(params)) if (v !== undefined) u.searchParams.set(k, v);
  return u.toString();
};

/* ---------- browser helpers ---------- */
const browser = await chromium.launch({ executablePath: EXE, headless: true, args: ['--force-color-profile=srgb', '--disable-lcd-text'] });
manifest.chromium = { version: browser.version(), executable: EXE };

async function ctxPage({ w = 1440, h = 900, dsf = 1, theme = 'light', reducedMotion = 'no-preference', js = true, injectDarkClass = false, forcedColors } = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dsf, colorScheme: theme, reducedMotion, javaScriptEnabled: js, forcedColors });
  if (injectDarkClass) {
    await ctx.route(/index\.html/, async (route) => {
      const body = fs.readFileSync(path.join(STUDY, 'index.html'), 'utf8').replace('<html lang="en">', '<html lang="en" class="dark">');
      await route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body });
    });
  }
  const page = await ctx.newPage();
  return { ctx, page };
}

async function settle(page, { js = true } = {}) {
  await page.waitForLoadState('networkidle');
  if (!js) { await page.waitForTimeout(900); return; }
  try {
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map((i) => (i.complete ? Promise.resolve() : new Promise((r) => { i.onload = i.onerror = r; }))));
    });
  } catch { /* fine */ }
  await page.waitForTimeout(350);
}

async function fontReport(page) {
  return page.evaluate(() => {
    const faces = [...document.fonts].map((f) => ({ family: f.family.replace(/"/g, ''), weight: f.weight, style: f.style, status: f.status }));
    return { status: document.fonts.status, loaded: faces.filter((f) => f.status === 'loaded'), failed: faces.filter((f) => f.status === 'error') };
  });
}

async function rectOf(page, selector) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height, left: r.left + window.scrollX, top: r.top + window.scrollY };
  }, selector);
}

async function shotEl(page, selector, file, opts = {}) {
  const loc = page.locator(selector).first();
  await loc.scrollIntoViewIfNeeded();
  await page.waitForTimeout(120);
  const buf = await loc.screenshot({ animations: 'disabled', caret: 'hide', ...opts });
  fs.writeFileSync(path.join(OUT, file), buf);
  return buf;
}

/* ---------- pixel sampling ---------- */
async function raw(buf) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
}
function px(img, x, y) {
  x = Math.max(0, Math.min(img.w - 1, Math.round(x))); y = Math.max(0, Math.min(img.h - 1, Math.round(y)));
  const i = (y * img.w + x) * 4; return [img.data[i], img.data[i + 1], img.data[i + 2]];
}
function median(vals) { const s = [...vals].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; }
function sampleRun(img, x, y, dx, dy, n = 9) {
  const r = [], g = [], b = [];
  for (let k = -Math.floor(n / 2); k <= Math.floor(n / 2); k++) { const p = px(img, x + dx * k, y + dy * k); r.push(p[0]); g.push(p[1]); b.push(p[2]); }
  return [median(r), median(g), median(b)];
}
const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => { const [h, l] = [Math.max(lum(a), lum(b)), Math.min(lum(a), lum(b))]; return Math.round(((h + 0.05) / (l + 0.05)) * 100) / 100; };
const rgbs = (c) => `rgb(${c.join(' ')})`;

/* Window-01 readings: frame line vs page surface, mat inside, Play pill. */
async function readWindow01(page, id, buf, extra = {}) {
  const dsf = 2;
  const winSel = id === 'baseline' ? `${SECTION[id]} .proof-grid > li:first-child` : `${SECTION[id]} .proof-window[data-window="01"]`;
  const frameSel = `${SECTION[id]} .proof-arrival-edge`;
  const g = await page.evaluate(({ winSel, frameSel }) => {
    const w = document.querySelector(winSel).getBoundingClientRect();
    const f = document.querySelector(frameSel).getBoundingClientRect();
    const pill = document.querySelector(frameSel).querySelector('.ts-play');
    const p = pill ? pill.getBoundingClientRect() : null;
    const cap = document.querySelector(winSel).querySelector('.proof-caption');
    const c = cap ? cap.getBoundingClientRect() : null;
    const rel = (r) => (r ? { x: r.left - w.left, y: r.top - w.top, w: r.width, h: r.height } : null);
    return { frame: rel(f), pill: rel(p), caption: rel(c), win: { w: w.width, h: w.height } };
  }, { winSel, frameSel });
  const img = await raw(buf);
  const f = g.frame;
  // The frame starts at the crop's left edge, so the page surface is read ABOVE the top edge
  // (in the 12 px gap under the label); the line is the top edge at mid-width; inside = 6 px below it.
  const xMid = (f.x + f.w / 2) * dsf;
  const line = sampleRun(img, xMid, f.y * dsf + 1, 1, 0);
  const outside = sampleRun(img, xMid, (f.y - 5) * dsf, 1, 0);
  const inside = sampleRun(img, xMid, (f.y + 6) * dsf, 1, 0);
  const rec = { id, ...extra, frameCss: f, line: rgbs(line), surfaceBeside: rgbs(outside), inside4px: rgbs(inside), line_vs_surface: ratio(line, outside), line_vs_inside: ratio(line, inside) };
  if (g.pill) {
    const p = g.pill; const cx = (p.x + p.w / 2) * dsf; const cy = (p.y + p.h / 2) * dsf;
    const pillBg = sampleRun(img, cx - 14 * dsf, cy, 0, 1, 5);
    const icon = sampleRun(img, cx + 1 * dsf, cy, 1, 0, 3);
    const poster = sampleRun(img, p.x * dsf - 8 * dsf, cy, 0, 1, 7);
    const border = sampleRun(img, p.x * dsf + 0.5 * dsf, cy, 0, 1, 5);
    Object.assign(rec, { pillCss: p, pillBg: rgbs(pillBg), icon: rgbs(icon), posterBesidePill: rgbs(poster), pillBorder: rgbs(border), icon_vs_pill: ratio(icon, pillBg), pill_vs_poster: ratio(pillBg, poster), pillBorder_vs_poster: ratio(border, poster), pillEdgeToFrameEdge_css: { right: f.x + f.w - (p.x + p.w), bottom: f.y + f.h - (p.y + p.h) } });
    if (extra.focused) {
      const ring = sampleRun(img, (p.x - 3) * dsf, cy, 0, 1, 5);
      const ringOutside = sampleRun(img, (p.x - 7) * dsf, cy, 0, 1, 5);
      Object.assign(rec, { ring: rgbs(ring), ringBackdrop: rgbs(ringOutside), ring_vs_backdrop: ratio(ring, ringOutside), ring_vs_pill: ratio(ring, pillBg) });
    }
  }
  if (g.caption) {
    const c = g.caption; const rule = sampleRun(img, (c.x + c.w / 2) * dsf, c.y * dsf + 1, 1, 0, 9); const under = sampleRun(img, (c.x + c.w / 2) * dsf, (c.y + 5) * dsf, 1, 0, 9);
    Object.assign(rec, { captionRule: rgbs(rule), captionRule_vs_surface: ratio(rule, under) });
  }
  manifest.pixels.push(rec);
  return rec;
}

/* ====================================================================== */
try {
  /* ---------- comp: composition matrix + overflow + geometry ---------- */
  if (want('comp')) {
    for (const theme of THEMES) for (const vp of VIEWPORTS) {
      const { ctx, page } = await ctxPage({ w: vp.w, h: vp.h, theme });
      await page.goto(studyUrl({ theme, beat: 'settled', chrome: 'off' }));
      await settle(page);
      if (!manifest.fonts) manifest.fonts = await fontReport(page);
      // overflow census (whole document, all variants visible)
      const ov = await page.evaluate(() => {
        const iw = window.innerWidth; const bad = [];
        for (const el of document.querySelectorAll('main *')) {
          const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
          if (cs.display === 'none' || cs.visibility === 'hidden' || r.width === 0) continue;
          if (r.right > iw + 1 || r.left < -1) bad.push({ tag: el.tagName.toLowerCase(), cls: el.className && String(el.className).slice(0, 60), left: Math.round(r.left), right: Math.round(r.right) });
        }
        return { innerWidth: iw, scrollWidth: document.documentElement.scrollWidth, offenders: bad.slice(0, 12), offenderCount: bad.length };
      });
      manifest.overflow.push({ theme, viewport: vp.name, ...ov });
      // geometry of the three frames (A) + baseline plates
      const geo = await page.evaluate(() => {
        const q = (sel) => [...document.querySelectorAll(sel)].map((el) => { const r = el.getBoundingClientRect(); return { left: Math.round(r.left * 10) / 10, width: Math.round(r.width * 10) / 10, height: Math.round(r.height * 10) / 10 }; });
        return { A_frames: q('#variant-a .proof-frame'), B_frames: q('#variant-b .proof-frame'), baseline_plates: q('#baseline .plate'), articleWidth: document.querySelector('#baseline .case-article').getBoundingClientRect().width };
      });
      manifest.geometry.push({ theme, viewport: vp.name, ...geo });
      const sets = [['A', 'variant-a'], ['B', 'variant-b']];
      if (vp.name === '1440x900' || vp.name === '393x852') sets.unshift(['baseline', 'baseline']);
      for (const [id, sec] of sets) {
        const file = `composition/comp_${id}_${theme}_${vp.name}.jpg`;
        await shotEl(page, `#${sec} .study-stage`, file, { type: 'jpeg', quality: 90 });
        manifest.shots.push({ file, kind: 'composition', id, theme, viewport: vp.name, state: 'settled', mat: 'mat' });
      }
      await ctx.close();
    }
  }

  /* ---------- fullpage: phone documents with chrome ---------- */
  if (want('fullpage')) {
    for (const [theme, vps] of [['light', ['393x852', '375x667', '320x568']], ['dark', ['393x852']]]) {
      for (const name of vps) {
        const vp = VIEWPORTS.find((v) => v.name === name);
        const { ctx, page } = await ctxPage({ w: vp.w, h: vp.h, theme });
        await page.goto(studyUrl({ theme, beat: 'settled' }));
        await settle(page);
        const file = `fullpage/fullpage_${theme}_${name}.jpg`;
        fs.writeFileSync(path.join(OUT, file), await page.screenshot({ fullPage: true, type: 'jpeg', quality: 82, animations: 'disabled' }));
        manifest.shots.push({ file, kind: 'fullpage', theme, viewport: name, state: 'settled' });
        await ctx.close();
      }
    }
  }

  /* ---------- detail: window-01 crops (DSF 2) + pixel readings ---------- */
  if (want('detail')) {
    for (const theme of THEMES) {
      for (const [id, state, mat] of [['baseline', 'settled', 'mat'], ['baseline', 'hold', 'mat'], ['A', 'settled', 'mat'], ['A', 'hold', 'mat'], ['B', 'settled', 'mat'], ['B', 'hold', 'mat'], ['A', 'settled', 'bleed'], ['B', 'settled', 'bleed']]) {
        const params = { theme, beat: state, chrome: 'off', variant: id, mat };
        const tag = mat === 'bleed' ? 'bleed' : (state === 'hold' ? 'armed' : 'rest');
        const { ctx, page } = await ctxPage({ w: 1440, h: 900, dsf: 2, theme });
        await page.goto(studyUrl(params));
        await settle(page);
        const winSel = id === 'baseline' ? `${SECTION[id]} .proof-grid > li:first-child` : `${SECTION[id]} .proof-window[data-window="01"]`;
        const file = `detail/w01_${id}_${theme}_${tag}.png`;
        const buf = await shotEl(page, winSel, file, { type: 'png' });
        const st = await page.evaluate((i) => window.__study.state(i), id);
        manifest.shots.push({ file, kind: 'detail', id, theme, viewport: '1440x900@2x', state: st, mat });
        await readWindow01(page, id, buf, { theme, state: st, mat, file });
        await ctx.close();
      }
      // B option: warm the 01 caption rule
      {
        const { ctx, page } = await ctxPage({ w: 1440, h: 900, dsf: 2, theme });
        await page.goto(studyUrl({ theme, beat: 'settled', chrome: 'off', variant: 'B', opt: 'warm-rule' }));
        await settle(page);
        const file = `detail/w01_B_${theme}_rest_warm-rule.png`;
        const buf = await shotEl(page, `#variant-b .proof-window[data-window="01"]`, file, { type: 'png' });
        manifest.shots.push({ file, kind: 'detail', id: 'B', theme, viewport: '1440x900@2x', state: 'settled', mat: 'mat', option: 'warm-rule' });
        await readWindow01(page, 'B', buf, { theme, state: 'settled', mat: 'mat', option: 'warm-rule', file });
        await ctx.close();
      }
    }
  }

  /* ---------- focus: real Tab to the Play control; Enter plays ---------- */
  if (want('focus')) {
    for (const theme of THEMES) for (const [id, mat] of [['A', 'mat'], ['B', 'mat'], ['A', 'bleed'], ['baseline', 'mat']]) {
      const { ctx, page } = await ctxPage({ w: 1440, h: 900, dsf: 2, theme });
      await page.goto(studyUrl({ theme, beat: 'settled', chrome: 'off', variant: id, mat }));
      await settle(page);
      let tabs = 0, focused = false, fv = null;
      for (let i = 0; i < 12 && !focused; i++) {
        await page.keyboard.press('Tab'); tabs++;
        const r = await page.evaluate(() => { const a = document.activeElement; return { isPlay: !!(a && a.classList && a.classList.contains('ts-play')), label: a && a.getAttribute && a.getAttribute('aria-label'), fv: a && a.matches ? a.matches(':focus-visible') : null }; });
        focused = r.isPlay; fv = r;
      }
      const ring = await page.evaluate(() => { const a = document.activeElement; const cs = getComputedStyle(a); return { outlineColor: cs.outlineColor, outlineWidth: cs.outlineWidth, outlineOffset: cs.outlineOffset, outlineStyle: cs.outlineStyle }; });
      const winSel = id === 'baseline' ? `${SECTION[id]} .proof-grid > li:first-child` : `${SECTION[id]} .proof-window[data-window="01"]`;
      const file = `focus/focus_${id}_${theme}${mat === 'bleed' ? '_bleed' : ''}.png`;
      const buf = await shotEl(page, winSel, file, { type: 'png' });
      const pxr = await readWindow01(page, id, buf, { theme, state: 'settled', mat, focused: true, file });
      // keyboard operability: Enter on the focused control starts the clip
      await page.keyboard.press('Enter');
      await page.waitForTimeout(900);
      const play = await page.evaluate((sel) => { const v = document.querySelector(sel + ' video'); return { paused: v.paused, currentTime: Math.round(v.currentTime * 1000) / 1000, readyState: v.readyState, src: v.currentSrc.split('/').pop(), label: document.activeElement.getAttribute('aria-label') }; }, SECTION[id]);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(150);
      const pause = await page.evaluate((sel) => { const v = document.querySelector(sel + ' video'); return { paused: v.paused, label: document.activeElement.getAttribute('aria-label') }; }, SECTION[id]);
      manifest.focus.push({ id, theme, mat, file, tabsToReachPlay: tabs, reached: focused, focusVisible: fv && fv.fv, ariaLabelAtRest: fv && fv.label, ring, afterEnter: play, afterSecondEnter: pause, pixels: { ring: pxr.ring, ringBackdrop: pxr.ringBackdrop, ring_vs_backdrop: pxr.ring_vs_backdrop, ring_vs_pill: pxr.ring_vs_pill }, pillEdgeToFrameEdge_css: pxr.pillEdgeToFrameEdge_css });
      manifest.shots.push({ file, kind: 'focus', id, theme, viewport: '1440x900@2x', state: 'settled', mat });
      await ctx.close();
    }
  }

  /* ---------- motion: the prototype settle transition ---------- */
  if (want('motion')) {
    const RUNS = [];
    for (const theme of THEMES) for (const id of ['baseline', 'A', 'B']) RUNS.push({ theme, id, vp: VIEWPORTS[0] });
    RUNS.push({ theme: 'light', id: 'A', vp: VIEWPORTS[2] }); // phone band: --dur-base (280 ms)
    for (const { theme, id, vp } of RUNS) {
      const { ctx, page } = await ctxPage({ w: vp.w, h: vp.h, dsf: 1, theme });
      await page.goto(studyUrl({ theme, beat: 'hold', chrome: 'off', variant: id }));
      await settle(page);
      await page.evaluate((i) => document.querySelector(`[data-beat-id="${i}"]`).scrollIntoView({ block: 'center' }), id);
      await page.waitForTimeout(200);
      const fr = await rectOf(page, `${SECTION[id]} .proof-arrival-edge`);
      const pad = 24; const clip = { x: Math.max(0, fr.x - pad), y: Math.max(0, fr.y - pad), width: Math.min(fr.w + 2 * pad, vp.w - Math.max(0, fr.x - pad)), height: fr.h + 2 * pad };
      const before = await page.evaluate((i) => ({ state: window.__study.state(i), color: window.__study.edgeColor(i), transition: window.__study.edgeTransition(i) }), id);
      // start the in-page per-frame sampler and, concurrently, take screenshots
      const sampler = page.evaluate((i) => window.__study.triggerAndSample(i, 820), id);
      const frames = [];
      const tStart = Date.now();
      let k = 0;
      while (Date.now() - tStart < 820) {
        const t0 = await page.evaluate(() => performance.now());
        const buf = await page.screenshot({ clip, animations: 'allow', caret: 'hide', type: 'png' });
        const t1 = await page.evaluate(() => performance.now());
        frames.push({ k, t0, t1, buf }); k++;
      }
      const trace = await sampler;
      // normalise frame times to the trigger moment: the sampler's first sample is t≈0 at performance.now() = tTrig
      // derive the trigger time from the trace: first sample time is relative; use the first screenshot's t0 as an upper bound
      const after = await page.evaluate((i) => ({ state: window.__study.state(i), color: window.__study.edgeColor(i) }), id);
      // Timestamps: the trace is relative to its own t0 (the trigger). Screenshot timestamps are absolute
      // performance.now(); the trigger happened just before the first screenshot's t0, so we report
      // frame times as (t0 - firstScreenshotT0) with the caveat that the trigger preceded frame 0 by the
      // evaluate round-trip (typically < 20 ms).
      const base = frames[0].t0;
      for (const f of frames) f.tMid = Math.round((f.t0 + f.t1) / 2 - base);
      // keep only the frames nearest the review instants (the full per-frame trace is kept in the manifest)
      const keep = new Set([0, 100, 200, 300, 420, 600, 800].map((t) => frames.reduce((b, f) => (Math.abs(f.tMid - t) < Math.abs(b.tMid - t) ? f : b), frames[0]).k));
      const files = [];
      for (const f of frames) {
        if (!keep.has(f.k)) continue;
        const file = `motion/beat_${id}_${theme}_${vp.name}_f${String(f.k).padStart(2, '0')}_${String(f.tMid).padStart(4, '0')}ms.png`;
        fs.writeFileSync(path.join(OUT, file), f.buf);
        files.push({ file, k: f.k, tFromFirstFrame_ms: f.tMid, window_ms: Math.round(f.t1 - f.t0) });
      }
      manifest.motion.push({ id, theme, viewport: vp.name, clipCss: clip, frameRectCss: fr, before, after, triggered: trace.triggered, framesCaptured: frames.length, trace: trace.samples, frames: files, note: 'trace: computed border colour per animation frame from the trigger; frames: screenshots nearest the review instants, times relative to the first screenshot (the trigger preceded it by one evaluate round-trip).' });
      await ctx.close();
    }
  }

  /* ---------- modes: reduced motion, no-JS, prefers-contrast ---------- */
  if (want('modes')) {
    for (const theme of THEMES) for (const id of ['A', 'B']) {
      // RM from first paint
      {
        const { ctx, page } = await ctxPage({ w: 1440, h: 900, dsf: 2, theme, reducedMotion: 'reduce' });
        await page.goto(studyUrl({ theme, beat: 'auto', chrome: 'off', variant: id }));
        await settle(page);
        const r = await page.evaluate((i) => ({ state: window.__study.state(i), color: window.__study.edgeColor(i), transition: window.__study.edgeTransition(i), rm: matchMedia('(prefers-reduced-motion: reduce)').matches }), id);
        const file = `modes/rm_${id}_${theme}.png`;
        await shotEl(page, `${SECTION[id]} .proof-window[data-window="01"]`, file, { type: 'png' });
        manifest.modes.push({ mode: 'reduced-motion-from-first-paint', id, theme, file, ...r });
        await ctx.close();
      }
      // RM switched on mid-beat, then off again (prototype CSS floor)
      if (theme === 'light') {
        const { ctx, page } = await ctxPage({ w: 1440, h: 900, dsf: 1, theme });
        await page.goto(studyUrl({ theme, beat: 'hold', chrome: 'off', variant: id }));
        await settle(page);
        await page.evaluate((i) => document.querySelector(`[data-beat-id="${i}"]`).scrollIntoView({ block: 'center' }), id);
        const seq = [];
        await page.evaluate((i) => window.__study.trigger(i), id);
        await page.waitForTimeout(120);
        seq.push({ at: 'mid-beat (~120 ms)', ...(await page.evaluate((i) => ({ state: window.__study.state(i), color: window.__study.edgeColor(i) }), id)) });
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.waitForTimeout(40);
        seq.push({ at: 'RM switched on (+40 ms)', ...(await page.evaluate((i) => ({ state: window.__study.state(i), color: window.__study.edgeColor(i), transition: window.__study.edgeTransition(i) }), id)) });
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        await page.waitForTimeout(500);
        seq.push({ at: 'RM switched off again (+500 ms)', ...(await page.evaluate((i) => ({ state: window.__study.state(i), color: window.__study.edgeColor(i) }), id)) });
        manifest.modes.push({ mode: 'reduced-motion-mid-beat-toggle', id, theme, sequence: seq });
        await ctx.close();
      }
      // no-JS (dark via injected class since no script runs)
      {
        const { ctx, page } = await ctxPage({ w: 1440, h: 900, dsf: 2, theme, js: false, injectDarkClass: theme === 'dark' });
        await page.goto(studyUrl({ theme, chrome: 'off', variant: id }));
        await settle(page, { js: false });
        let r = null;
        try {
          r = await page.evaluate((sel) => { const f = document.querySelector(sel + ' .proof-arrival-edge'); const v = document.querySelector(sel + ' video'); return { htmlHasJs: document.documentElement.classList.contains('js'), state: f.closest('[data-proof-arrival]').dataset.proofArrival, color: getComputedStyle(f).borderTopColor, nativeControls: v.hasAttribute('controls'), overlayButton: !!document.querySelector(sel + ' .ts-play') }; }, SECTION[id]);
        } catch (e) { r = { evaluateUnavailable: String(e).slice(0, 80) }; }
        const file = `modes/nojs_${id}_${theme}.png`;
        await shotEl(page, `${SECTION[id]} .proof-window[data-window="01"]`, file, { type: 'png' });
        manifest.modes.push({ mode: 'no-js', id, theme, file, ...r });
        await ctx.close();
      }
      // prefers-contrast: more
      {
        const { ctx, page } = await ctxPage({ w: 1440, h: 900, dsf: 2, theme });
        let ok = true;
        try { await page.emulateMedia({ contrast: 'more' }); } catch (e) { ok = false; }
        await page.goto(studyUrl({ theme, beat: 'settled', chrome: 'off', variant: id }));
        await settle(page);
        const r = await page.evaluate((i) => ({ pcMore: matchMedia('(prefers-contrast: more)').matches, line: getComputedStyle(document.documentElement).getPropertyValue('--rgb-line').trim(), edge: window.__study.edgeColor(i) }), id);
        const file = `modes/contrast-more_${id}_${theme}.png`;
        await shotEl(page, `${SECTION[id]} .proof-window[data-window="01"]`, file, { type: 'png' });
        manifest.modes.push({ mode: 'prefers-contrast-more', id, theme, file, emulationSupported: ok, ...r });
        await ctx.close();
      }
    }
  }
} finally {
  await browser.close();
  server.close();
}

/* ---------- write manifest + a readable measurements table ---------- */
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 1));

const md = [];
md.push('# Measurements (generated by tools/capture.mjs)\n');
md.push(`Chromium ${manifest.chromium.version} · generated ${manifest.generatedAt}. Instrument readings off the standalone prototype at the stated coordinates; not conformance claims and not readings of the live site.\n`);
if (manifest.fonts) md.push(`Web fonts: document.fonts.status = ${manifest.fonts.status}; loaded faces = ${manifest.fonts.loaded.map((f) => `${f.family} ${f.weight}${f.style === 'italic' ? 'i' : ''}`).join(', ') || 'none'}; failed = ${manifest.fonts.failed.length}.\n`);
if (manifest.overflow.length) {
  md.push('## Horizontal overflow census (all sections visible, study chrome hidden)\n');
  md.push('| Theme | Viewport | innerWidth | scrollWidth | Elements past the right or left edge |\n|---|---|---|---|---|');
  for (const o of manifest.overflow) md.push(`| ${o.theme} | ${o.viewport} | ${o.innerWidth} | ${o.scrollWidth} | ${o.offenderCount}${o.offenderCount ? ' (' + o.offenders.map((x) => `${x.tag}.${x.cls} → ${x.right}`).join('; ') + ')' : ''} |`);
  md.push('');
}
if (manifest.geometry.length) {
  md.push('## Frame geometry (CSS px, viewport-relative left · width · height)\n');
  md.push('| Theme | Viewport | A frames | Baseline plates | Article column |\n|---|---|---|---|---|');
  for (const g of manifest.geometry) md.push(`| ${g.theme} | ${g.viewport} | ${g.A_frames.map((f) => `${f.left} · ${f.width}×${f.height}`).join(' / ')} | ${g.baseline_plates.map((f) => `${f.left} · ${f.width}×${f.height}`).join(' / ')} | ${Math.round(g.articleWidth)} |`);
  md.push('');
}
if (manifest.pixels.length) {
  md.push('## Window 01 pixel readings (DSF 2, medians of short runs)\n');
  md.push('| Variant | Theme | State | Mat | Frame line | Surface beside | line : surface | Pill bg | Icon | icon : pill | Poster beside pill | pill : poster | pill border : poster | Caption rule | rule : surface |\n|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|');
  for (const p of manifest.pixels) md.push(`| ${p.id}${p.option ? ' (' + p.option + ')' : ''}${p.focused ? ' (focused)' : ''} | ${p.theme} | ${p.state} | ${p.mat} | ${p.line} | ${p.surfaceBeside} | ${p.line_vs_surface} | ${p.pillBg || '—'} | ${p.icon || '—'} | ${p.icon_vs_pill || '—'} | ${p.posterBesidePill || '—'} | ${p.pill_vs_poster || '—'} | ${p.pillBorder_vs_poster || '—'} | ${p.captionRule || '—'} | ${p.captionRule_vs_surface || '—'} |`);
  md.push('');
}
if (manifest.focus.length) {
  md.push('## Keyboard focus on the Play control\n');
  md.push('| Variant | Theme | Mat | Tabs to reach | :focus-visible | Ring (computed) | Ring px | Ring backdrop px | ring : backdrop | ring : pill | Pill edge → frame edge (right, bottom) | Enter → playing? | currentTime after ~0.9 s | source | Enter again → paused? |\n|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|');
  for (const f of manifest.focus) md.push(`| ${f.id} | ${f.theme} | ${f.mat} | ${f.tabsToReachPlay} | ${f.focusVisible} | ${f.ring.outlineWidth} ${f.ring.outlineStyle} ${f.ring.outlineColor}, offset ${f.ring.outlineOffset} | ${f.pixels.ring} | ${f.pixels.ringBackdrop} | ${f.pixels.ring_vs_backdrop} | ${f.pixels.ring_vs_pill} | ${f.pillEdgeToFrameEdge_css ? Math.round(f.pillEdgeToFrameEdge_css.right) + ', ' + Math.round(f.pillEdgeToFrameEdge_css.bottom) : '—'} | ${f.afterEnter.paused ? 'no' : 'yes'} | ${f.afterEnter.currentTime} s | ${f.afterEnter.src} | ${f.afterSecondEnter.paused ? 'yes' : 'no'} |`);
  md.push('');
}
if (manifest.motion.length) {
  md.push('## Prototype settle transition (computed border colour per animation frame)\n');
  for (const m of manifest.motion) {
    const pick = (t) => m.trace.reduce((best, s) => (Math.abs(s.t - t) < Math.abs(best.t - t) ? s : best), m.trace[0]);
    const pts = [0, 100, 200, 300, 420, 600, 800].map((t) => { const s = pick(t); return `t=${s.t}ms ${s.color} (${s.state})`; });
    const done = m.trace.find((s) => s.color === m.trace[m.trace.length - 1].color);
    md.push(`- **${m.id} · ${m.theme} · ${m.viewport}** — before: ${m.before.state} ${m.before.color}; triggered: ${m.triggered}; final value first reached at t=${done ? done.t : '?'} ms; after: ${m.after.state} ${m.after.color}. Samples: ${pts.join(' → ')}. ${m.framesCaptured} screenshot frames captured, ${m.frames.length} kept (${Math.min(...m.frames.map((f) => f.window_ms))}–${Math.max(...m.frames.map((f) => f.window_ms))} ms capture window each).`);
  }
  md.push('');
}
if (manifest.modes.length) {
  md.push('## Modes\n');
  for (const m of manifest.modes) md.push(`- ${JSON.stringify(m)}`);
  md.push('');
}
fs.writeFileSync(path.join(OUT, 'MEASUREMENTS.md'), md.join('\n'));
console.log(`done: ${manifest.shots.length} shots, ${manifest.pixels.length} pixel records, ${manifest.focus.length} focus records, ${manifest.motion.length} motion records, ${manifest.modes.length} mode records`);
