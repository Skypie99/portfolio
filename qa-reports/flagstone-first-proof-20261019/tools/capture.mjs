#!/usr/bin/env node
/**
 * capture.mjs — Flagstone first-proof hero: real-browser renders + measurements.
 *
 *   node capture.mjs --base http://localhost:3000 --out ./captures --label baseline
 *        [--viewports 1440x900,1280x800,393x852,375x667,320x568]
 *        [--themes light,dark] [--dsf 2] [--rm] [--nojs] [--css "<override css>"]
 *        [--route /work/flagstone/] [--video] [--axe] [--keys]
 *
 * For each viewport × theme it loads the route, waits for fonts + the arrival
 * settle to finish, measures the hero well / phone frame / screen / rendered
 * screenshot box / plate, screenshots the WHOLE hero section (jpg) and a
 * close-up of the phone (png), runs an element-level horizontal-overflow census
 * (visible-rect based, aria-hidden and sr-only excluded — the repo's own
 * overflow-census reasoning), and appends to <out>/<label>/measurements.json.
 *
 * --css injects an override stylesheet after DOMContentLoaded (candidate
 * comparison on the same DOM). --rm emulates prefers-reduced-motion: reduce.
 * --nojs disables JavaScript. --video records the arrival (webm) at each
 * viewport. --axe runs axe-core on the hero section. --keys walks Tab order
 * around the figure and screenshots the focused pill.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('/home/user/portfolio/node_modules/playwright-core');

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => {
    if (a.startsWith('--')) {
      const k = a.slice(2);
      const v = arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : 'true';
      acc.push([k, v]);
    }
    return acc;
  }, []),
);

const BASE = args.base ?? 'http://localhost:3000';
const ROUTE = args.route ?? '/work/flagstone/';
const OUT = path.resolve(args.out ?? './captures');
const LABEL = args.label ?? 'run';
const VIEWPORTS = (args.viewports ?? '1440x900,1280x800,393x852,375x667,320x568')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)
  .map((s) => ({ w: Number(s.split('x')[0]), h: Number(s.split('x')[1]) }));
const THEMES = (args.themes ?? 'light,dark').split(',').map((s) => s.trim());
const DSF = Number(args.dsf ?? 2);
const RM = args.rm === 'true';
const NOJS = args.nojs === 'true';
const CSS = args.css && args.css !== 'true' ? args.css : null;
const VIDEO = args.video === 'true';
const AXE = args.axe === 'true';
const KEYS = args.keys === 'true';
const SETTLE_MS = Number(args.settle ?? 2200);

const dir = path.join(OUT, LABEL);
fs.mkdirSync(dir, { recursive: true });
const measurementsPath = path.join(dir, 'measurements.json');
const measurements = fs.existsSync(measurementsPath)
  ? JSON.parse(fs.readFileSync(measurementsPath, 'utf8'))
  : { label: LABEL, base: BASE, route: ROUTE, runs: [] };

function resolveChromium() {
  try {
    const p = chromium.executablePath();
    if (p && fs.existsSync(p)) return p;
  } catch {}
  for (const c of ['/opt/pw-browsers/chromium', '/opt/pw-browsers/chromium-1194/chrome-linux/chrome']) {
    if (fs.existsSync(c)) return c;
  }
  throw new Error('no chromium');
}

const MEASURE = `(() => {
  const r = (el) => {
    if (!el) return null;
    const b = el.getBoundingClientRect();
    const sy = window.scrollY, sx = window.scrollX;
    return { x: +(b.left + sx).toFixed(2), y: +(b.top + sy).toFixed(2), w: +b.width.toFixed(2), h: +b.height.toFixed(2) };
  };
  const well = document.querySelector('.hero-settle-img');
  const section = well ? well.closest('section') : null;
  const frame = well ? well.querySelector('.pr-frame-phone') : null;
  const screen = frame ? frame.querySelector('.pr-screen-phone') : null;
  const img = screen ? screen.querySelector('img') : null;
  const h1 = document.querySelector('h1');
  const plateLine = Array.from(document.querySelectorAll('p')).find((p) => /CURRENT EXPLORE SCREEN/.test(p.textContent || ''));
  const plate = plateLine ? plateLine.parentElement : null;
  const breadcrumb = document.querySelector('nav[aria-label="Breadcrumb"]');
  // rendered content box of an object-contain image inside its box
  let imgContent = null;
  if (img && img.naturalWidth && img.naturalHeight) {
    const box = img.getBoundingClientRect();
    const fit = getComputedStyle(img).objectFit;
    const ia = img.naturalWidth / img.naturalHeight;
    const ba = box.width / box.height;
    let cw = box.width, ch = box.height;
    if (fit === 'contain') {
      if (ia > ba) { cw = box.width; ch = box.width / ia; } else { ch = box.height; cw = box.height * ia; }
    }
    imgContent = {
      w: +cw.toFixed(2), h: +ch.toFixed(2),
      letterboxX: +((box.width - cw) / 2).toFixed(2), letterboxY: +((box.height - ch) / 2).toFixed(2),
      scale: +(cw / img.naturalWidth).toFixed(4),
      natural: { w: img.naturalWidth, h: img.naturalHeight },
      currentSrc: img.currentSrc, complete: img.complete, alt: img.getAttribute('alt'),
      loading: img.getAttribute('loading'), fetchpriority: img.getAttribute('fetchpriority'),
    };
  }
  const cs = frame ? getComputedStyle(frame) : null;
  const frameStyle = cs ? { padding: cs.padding, borderRadius: cs.borderRadius, border: cs.borderTopWidth, width: cs.width, height: cs.height, aspectRatio: cs.aspectRatio } : null;
  const wellStyle = well ? { aspectRatio: getComputedStyle(well).aspectRatio } : null;
  // element-level horizontal overflow census (visible rect vs viewport edge)
  const vw = document.documentElement.clientWidth;
  const offenders = [];
  const isHidden = (el) => { for (let e = el; e; e = e.parentElement) { if (e.getAttribute && (e.getAttribute('aria-hidden') === 'true' || e.classList.contains('sr-only'))) return true; } return false; };
  for (const el of document.querySelectorAll('body *')) {
    if (isHidden(el)) continue;
    const b = el.getBoundingClientRect();
    if (b.width === 0 || b.height === 0) continue;
    let left = b.left, right = b.right;
    for (let p = el.parentElement; p && p !== document.body && p !== document.documentElement; p = p.parentElement) {
      const o = getComputedStyle(p).overflowX;
      if (o === 'hidden' || o === 'clip' || o === 'auto' || o === 'scroll') { const pb = p.getBoundingClientRect(); left = Math.max(left, pb.left); right = Math.min(right, pb.right); }
    }
    if (right - left <= 0) continue;
    if (right > vw + 0.5 || left < -0.5) offenders.push({ tag: el.tagName.toLowerCase(), cls: (el.className && el.className.baseVal === undefined ? String(el.className) : '').slice(0, 80), left: +left.toFixed(1), right: +right.toFixed(1) });
    if (offenders.length > 12) break;
  }
  return {
    viewport: { w: window.innerWidth, h: window.innerHeight, dpr: window.devicePixelRatio },
    html: { dark: document.documentElement.classList.contains('dark'), js: document.documentElement.classList.contains('js'), reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches },
    docHeight: document.documentElement.scrollHeight,
    section: r(section), breadcrumb: r(breadcrumb), h1: r(h1), well: r(well), frame: r(frame), screen: r(screen), img: r(img), imgContent, plate: r(plate),
    gaps: well && plate ? { wellBottomToPlateTop: +(plate.getBoundingClientRect().top - well.getBoundingClientRect().bottom).toFixed(2) } : null,
    frameStyle, wellStyle,
    frameClass: frame ? frame.className : null, wellClass: well ? well.className : null,
    overflow: { scrollWidthProbe: document.documentElement.scrollWidth, clientWidth: vw, offenders },
  };
})()`;

async function settle(page) {
  await page.waitForLoadState('load');
  await page.evaluate(() => (document.fonts ? document.fonts.ready : Promise.resolve()));
  await page.waitForTimeout(SETTLE_MS);
}

(async () => {
  const exe = resolveChromium();
  const browser = await chromium.launch({ executablePath: exe });
  for (const vp of VIEWPORTS) {
    for (const theme of THEMES) {
      const tag = `${RM ? 'rm_' : ''}${NOJS ? 'nojs_' : ''}${theme}_${vp.w}x${vp.h}`;
      const ctxOpts = {
        viewport: { width: vp.w, height: vp.h },
        deviceScaleFactor: DSF,
        colorScheme: theme === 'dark' ? 'dark' : 'light',
        reducedMotion: RM ? 'reduce' : 'no-preference',
        isMobile: vp.w < 640,
        hasTouch: vp.w < 640,
      };
      if (VIDEO) ctxOpts.recordVideo = { dir: path.join(dir, 'video'), size: { width: vp.w, height: vp.h } };
      const ctx = await browser.newContext(ctxOpts);
      const page = await ctx.newPage();
      const consoleErrors = [];
      page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 200)); });
      page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + String(e).slice(0, 200)));
      if (NOJS) {
        // No-JavaScript mode: the document is served with EVERY <script> removed
        // (inline hydration payloads and the head guard included) and script
        // requests are aborted, so the page is exactly the server-rendered HTML a
        // no-JS visitor gets. (Playwright's javaScriptEnabled:false also disables
        // its own evaluation bridge, which is why it is not used here.)
        await page.route('**/*.js', (route) => route.abort());
        await page.route((url) => url.pathname.endsWith('/') || url.pathname.endsWith('.html'), async (route) => {
          const res = await route.fetch();
          const body = (await res.text()).replace(/<script\b[\s\S]*?<\/script>/gi, '');
          await route.fulfill({ response: res, body, headers: { ...res.headers(), 'content-type': 'text/html; charset=utf-8' } });
        });
      }
      await page.goto(BASE + ROUTE, { waitUntil: 'domcontentloaded' });
      await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' });
      if (CSS) await page.addStyleTag({ content: CSS });
      await settle(page);
      if (VIDEO) {
        // arrival recorded; then scroll the well into view at human pace and hold
        await page.evaluate(async () => {
          const well = document.querySelector('.hero-settle-img');
          if (!well) return;
          const target = well.getBoundingClientRect().top + window.scrollY - 24;
          const start = window.scrollY; const dur = 900; const t0 = performance.now();
          await new Promise((res) => { const step = (t) => { const k = Math.min(1, (t - t0) / dur); const e = 1 - Math.pow(1 - k, 3); window.scrollTo(0, start + (target - start) * e); if (k < 1) requestAnimationFrame(step); else res(); }; requestAnimationFrame(step); });
        });
        await page.waitForTimeout(1600);
      }
      const m = await page.evaluate(MEASURE);
      m.consoleErrors = consoleErrors;
      m.tag = tag; m.theme = theme; m.rm = RM; m.nojs = NOJS; m.cssOverride = Boolean(CSS);
      // Section capture (whole hero section) + first-screen + frame close-up.
      // Arrival: the true viewport at scroll 0 (what the visitor first sees).
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(150);
      await page.screenshot({ path: path.join(dir, `${tag}_arrival.jpg`), type: 'jpeg', quality: 85, animations: 'disabled' });
      // Section: a viewport as tall as the section, so the FIXED world backdrop
      // (WorldBackdrop, position: fixed) paints behind the whole section the way
      // it does while scrolling, instead of ending at one viewport height.
      const tallH = Math.min(6000, Math.ceil((m.section?.h ?? vp.h) + (m.section?.y ?? 0) + 40));
      await page.setViewportSize({ width: vp.w, height: Math.max(vp.h, tallH) });
      await page.waitForTimeout(400);
      const section = page.locator('section').filter({ has: page.locator('.hero-settle-img') }).first();
      await section.screenshot({ path: path.join(dir, `${tag}_section.jpg`), type: 'jpeg', quality: 88, animations: 'disabled', caret: 'hide' });
      if (m.frame) {
        const pad = Math.round(Math.min(40, vp.w * 0.06));
        const clip = { x: Math.max(0, m.frame.x - pad), y: Math.max(0, m.frame.y - pad), width: Math.min(vp.w, m.frame.w + 2 * pad), height: m.frame.h + 2 * pad };
        await page.screenshot({ path: path.join(dir, `${tag}_frame.png`), clip, animations: 'disabled' });
        // the well with its plate (figure + caption relationship)
        const wb = m.well, pb = m.plate;
        if (wb && pb) {
          const y0 = Math.max(0, wb.y - 16), y1 = pb.y + pb.h + 16;
          await page.screenshot({ path: path.join(dir, `${tag}_figure.jpg`), type: 'jpeg', quality: 90, clip: { x: 0, y: y0, width: vp.w, height: y1 - y0 }, animations: 'disabled' });
        }
      }
      await page.setViewportSize({ width: vp.w, height: vp.h });
      if (AXE) {
        const axeSrc = fs.readFileSync('/home/user/portfolio/node_modules/axe-core/axe.min.js', 'utf8');
        await page.addScriptTag({ content: axeSrc });
        const res = await page.evaluate(async () => {
          const sec = document.querySelector('.hero-settle-img')?.closest('section');
          const r = await window.axe.run(sec || document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } });
          return { violations: r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length, targets: v.nodes.slice(0, 3).map((n) => n.target.join(' ')) })), passes: r.passes.length, incomplete: r.incomplete.map((v) => ({ id: v.id, nodes: v.nodes.length })) };
        });
        m.axe = res;
      }
      if (KEYS) {
        // Tab from the top of the document, logging focus until we pass the figure.
        const log = await page.evaluate(async () => {
          const out = [];
          const well = document.querySelector('.hero-settle-img');
          const wellTop = well ? well.getBoundingClientRect().top + window.scrollY : 0;
          return { wellTop, out };
        });
        await page.keyboard.press('Tab');
        const seq = [];
        for (let i = 0; i < 40; i++) {
          const info = await page.evaluate(() => {
            const a = document.activeElement;
            if (!a || a === document.body) return null;
            const b = a.getBoundingClientRect();
            const cs = getComputedStyle(a);
            const name = (a.getAttribute('aria-label') || a.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 70);
            return { tag: a.tagName.toLowerCase(), name, y: +(b.top + window.scrollY).toFixed(0), outline: cs.outlineStyle + ' ' + cs.outlineWidth + ' ' + cs.outlineColor, boxShadow: cs.boxShadow.slice(0, 60), visible: b.width > 0 && b.height > 0, matchesFV: a.matches(':focus-visible') };
          });
          if (info) seq.push(info);
          if (info && /GitHub/.test(info.name) && info.y > m.well.y) break;
          await page.keyboard.press('Tab');
        }
        m.keys = seq;
        // capture the App Store pill focused (last interactive before the well on phones)
        await page.evaluate(() => { const links = Array.from(document.querySelectorAll('a')); const a = links.find((l) => /App Store/i.test(l.textContent || '')); if (a) { a.focus(); a.scrollIntoView({ block: 'center' }); } });
        await page.waitForTimeout(200);
        await page.screenshot({ path: path.join(dir, `${tag}_focus-appstore.png`), animations: 'disabled' });
      }
      measurements.runs = measurements.runs.filter((r) => r.tag !== tag);
      measurements.runs.push(m);
      fs.writeFileSync(measurementsPath, JSON.stringify(measurements, null, 2));
      const v = page.video ? page.video() : null;
      await ctx.close();
      if (v) { const p = await v.path(); const dest = path.join(dir, 'video', `${tag}.webm`); if (p !== dest) fs.renameSync(p, dest); }
      const ic = m.imgContent;
      console.log(`${LABEL} ${tag}: well ${m.well?.w}x${m.well?.h} · frame ${m.frame?.w}x${m.frame?.h} · screenshot ${ic?.w}x${ic?.h} (scale ${ic?.scale}, letterbox y ${ic?.letterboxY}) · gap→plate ${m.gaps?.wellBottomToPlateTop} · section h ${m.section?.h} · doc ${m.docHeight} · overflow ${m.overflow.offenders.length} · dark=${m.html.dark} js=${m.html.js}${m.consoleErrors.length ? ' · console errors ' + m.consoleErrors.length : ''}`);
    }
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
