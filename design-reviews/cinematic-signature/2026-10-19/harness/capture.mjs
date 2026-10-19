// capture.mjs — rendered-evidence harness for the cinematic intro.
//   node capture.mjs --base http://localhost:3100 --out <dir> [--video] [--configs desktop-light,...]
// Captures SETTLED viewport frames at fixed scroll-progress points inside the
// pinned film (scrub: 1.0 → we wait for the catch-up), the handoff into the hero,
// both colour schemes, three viewports; optionally a scroll-through video.
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire('/home/user/portfolio/package.json');
const { chromium } = require('playwright-core');

const args = Object.fromEntries(process.argv.slice(2).map((a, i, arr) => a.startsWith('--') ? [a.slice(2), arr[i + 1]?.startsWith('--') || arr[i + 1] === undefined ? true : arr[i + 1]] : []).filter(Boolean));
const BASE = args.base || 'http://localhost:3100';
const OUT = args.out; if (!OUT) throw new Error('--out required');
mkdirSync(OUT, { recursive: true });

const CONFIGS = {
  'desktop-light': { width: 1440, height: 900, dpr: 1, scheme: 'light', mobile: false },
  'desktop-dark':  { width: 1440, height: 900, dpr: 1, scheme: 'dark',  mobile: false },
  'mobile-light':  { width: 393,  height: 852, dpr: 2, scheme: 'light', mobile: true },
  'mobile-dark':   { width: 393,  height: 852, dpr: 2, scheme: 'dark',  mobile: true },
  'small-light':   { width: 360,  height: 740, dpr: 2, scheme: 'light', mobile: true },
  'small-dark':    { width: 360,  height: 740, dpr: 2, scheme: 'dark',  mobile: true },
};
const wanted = (args.configs ? String(args.configs).split(',') : Object.keys(CONFIGS));
const PROGRESS = (args.progress ? String(args.progress).split(',').map(Number) : [0, 0.12, 0.25, 0.4, 0.55, 0.7, 0.82, 0.9, 1.0]);
const HANDOFF = (args.handoff ? String(args.handoff).split(',').map(Number) : [160, 420, 720, 1100]);
const SETTLE = Number(args.settle || 1500);

function exe() {
  try { const p = chromium.executablePath(); if (p && existsSync(p)) return p; } catch {}
  return '/opt/pw-browsers/chromium';
}

async function ready(page) {
  await page.waitForLoadState('networkidle');
  await page.evaluate(async () => {
    await document.fonts?.ready;
    // only the film planes: lazy theme-variant images below the fold are never fetched, so decode() on them never settles
    const planes = [...document.querySelectorAll("img[data-plate]")];
    await Promise.race([Promise.all(planes.map((i) => (i.decode ? i.decode().catch(() => {}) : null))), new Promise((r) => setTimeout(r, 5000))]);
  });
  await page.waitForTimeout(400);
}

async function geometry(page) {
  return page.evaluate(() => {
    const stage = document.querySelector('.cdesert-stage, .cdesert-static');
    const pin = document.querySelector('.cdesert-pin');
    const r = stage.getBoundingClientRect();
    const top = r.top + window.scrollY;
    const h = r.height;
    const phone = matchMedia('(max-width: 767px)').matches;
    const pinH = pin ? pin.offsetHeight : window.innerHeight;
    const end = pin ? (phone ? top + h - pinH : top + h - window.innerHeight) : top + h;
    const hero = document.querySelector('#hero');
    const heroTop = hero ? hero.getBoundingClientRect().top + window.scrollY : null;
    return { top, h, end, pinH, phone, heroTop, vh: window.innerHeight, docH: document.documentElement.scrollHeight };
  });
}

async function shot(page, file) { await page.screenshot({ path: file, type: 'png' }); }

const browser = await chromium.launch({ executablePath: exe(), headless: true, args: ['--enable-gpu-rasterization'] });
const manifest = { base: BASE, capturedAt: new Date().toISOString(), configs: {} };

for (const name of wanted) {
  const c = CONFIGS[name]; if (!c) continue;
  const ctx = await browser.newContext({
    viewport: { width: c.width, height: c.height }, deviceScaleFactor: c.dpr,
    colorScheme: c.scheme, isMobile: c.mobile, hasTouch: c.mobile,
    reducedMotion: args.rm ? 'reduce' : 'no-preference',
  });
  const page = await ctx.newPage();
  const logs = [];
  page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) logs.push({ type: m.type(), text: m.text() }); });
  page.on('pageerror', (e) => logs.push({ type: 'pageerror', text: String(e) }));
  page.on('requestfailed', (r) => logs.push({ type: 'requestfailed', text: r.url() }));
  await page.goto(BASE + '/', { waitUntil: 'load' });
  await ready(page);
  const g = await geometry(page);
  const frames = [];
  const dir = join(OUT, name); mkdirSync(dir, { recursive: true });
  // the film
  for (const p of PROGRESS) {
    const y = Math.round(g.top + p * (g.end - g.top));
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(SETTLE);
    const f = `film-p${p.toFixed(2)}.png`;
    await shot(page, join(dir, f)); frames.push({ file: f, kind: 'film', p, scrollY: y });
  }
  // the handoff (past the pin release)
  for (const off of HANDOFF) {
    const y = Math.round(g.end + off);
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(SETTLE);
    const f = `handoff-+${off}.png`;
    await shot(page, join(dir, f)); frames.push({ file: f, kind: 'handoff', offset: off, scrollY: y });
  }
  // overflow probe at rest + at the handoff
  const overflow = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth; const bad = [];
    for (const el of document.querySelectorAll('body *')) {
      if (el.closest('[aria-hidden="true"]')) continue;
      const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
      if (r.right > vw + 1 && getComputedStyle(el).position !== 'fixed') bad.push({ tag: el.tagName, cls: String(el.className).slice(0, 60), right: Math.round(r.right) });
    }
    return { vw, scrollWidth: document.documentElement.scrollWidth, bad: bad.slice(0, 10) };
  });
  manifest.configs[name] = { ...c, geometry: g, frames, logs, overflow };
  await ctx.close();
  console.log(`[capture] ${name}: ${frames.length} frames, ${logs.length} console entries, overflow ${overflow.bad.length}`);
}

if (args.video) {
  for (const name of (args.videoConfigs ? String(args.videoConfigs).split(',') : ['desktop-light', 'mobile-light'])) {
    const c = CONFIGS[name];
    const vdir = join(OUT, 'video-' + name); mkdirSync(vdir, { recursive: true });
    const ctx = await browser.newContext({
      viewport: { width: c.width, height: c.height }, deviceScaleFactor: 1, colorScheme: c.scheme,
      isMobile: c.mobile, hasTouch: c.mobile, recordVideo: { dir: vdir, size: { width: c.width, height: c.height } },
    });
    const page = await ctx.newPage();
    await page.goto(BASE + '/', { waitUntil: 'load' });
    await ready(page);
    const g = await geometry(page);
    await page.waitForTimeout(1200); // hold the opening frame
    // smooth, human-paced scroll: ~9s through the film, ~3s into the hero
    const total = g.end - g.top + 1200;
    const durationMs = Number(args.videoMs || 12000);
    await page.evaluate(async ({ total, durationMs, top }) => {
      const t0 = performance.now();
      await new Promise((res) => {
        const tick = (t) => {
          const k = Math.min(1, (t - t0) / durationMs);
          // gentle ease in/out so the recording reads like a person, not a motor
          const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
          window.scrollTo(0, top + e * total);
          if (k < 1) requestAnimationFrame(tick); else res();
        };
        requestAnimationFrame(tick);
      });
    }, { total, durationMs, top: g.top });
    await page.waitForTimeout(2200); // let the scrub settle on the hero
    const video = page.video();
    await ctx.close();
    const path = await video.path();
    manifest.configs['video-' + name] = { ...c, geometry: g, video: path, durationMs };
    console.log(`[capture] video ${name}: ${path}`);
  }
}

await browser.close();
writeFileSync(join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log('[capture] manifest written');
