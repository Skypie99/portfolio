/**
 * lib.mjs — shared helpers for the Release 6 review tools: serve a built
 * export over loopback, find the pre-installed Playwright Chromium, settle a
 * page (fonts + hydration), and scroll a page through once so every one-shot
 * reveal has fired. Chromium only; nothing is installed; nothing leaves
 * loopback. Modeled on the Release 5 tools (read, not copied).
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
export const { chromium } = require('playwright-core');
export const sharp = require('sharp');

export const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..', '..');

export const argv = process.argv.slice(2);
export const opt = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? def : argv[i + 1];
};
export const flag = (name) => argv.includes(`--${name}`);
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function parseSizes(s) {
  return s.split(',').map((t) => {
    const m = /^(\d+)x(\d+)(?:@([\d.]+))?$/.exec(t);
    if (!m) throw new Error(`bad size ${t}`);
    return { w: Number(m[1]), h: Number(m[2]), dpr: Number(m[3] || 1), tag: t };
  });
}

export function resolveChromium() {
  const override = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
  if (override && fs.existsSync(override)) return override;
  try {
    const p = chromium.executablePath();
    if (p && fs.existsSync(p)) return p;
  } catch {
    /* fall through */
  }
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  for (const d of fs.readdirSync(base).filter((d) => /^chromium-\d+$/.test(d)).sort().reverse()) {
    const p = path.join(base, d, 'chrome-linux', 'chrome');
    if (fs.existsSync(p)) return p;
  }
  return null;
}

/** Serve `dir` on `port` with the tracked static server; resolves to the child. */
export function serve(dir, port) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(ROOT, 'scripts', 'static-serve.mjs'), dir, String(port)], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let ready = false;
    child.stdout.on('data', (b) => {
      if (!ready && String(b).includes('[static-serve]')) {
        ready = true;
        resolve(child);
      }
    });
    child.stderr.on('data', (b) => {
      if (!ready) reject(new Error(String(b)));
    });
    child.on('exit', (code) => {
      if (!ready) reject(new Error(`static-serve exited ${code}`));
    });
  });
}

/** A context for one theme × size × mode. Theme is forced through the
 *  next-themes storage key AND the colour-scheme emulation, so the pre-hydration
 *  script and the hydrated provider agree. */
export async function makeContext(browser, { w, h, dpr, theme, mode = 'normal', storage = {} }) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: h },
    deviceScaleFactor: dpr,
    colorScheme: theme,
    reducedMotion: mode === 'rm' ? 'reduce' : 'no-preference',
    javaScriptEnabled: mode !== 'nojs',
    ...(w < 600 ? { isMobile: true, hasTouch: true } : {}),
  });
  await ctx.addInitScript(
    ({ t, s }) => {
      try {
        window.localStorage.setItem('theme', t);
        for (const [k, v] of Object.entries(s)) window.sessionStorage.setItem(k, v);
      } catch {
        /* storage denied */
      }
    },
    { t: theme, s: storage },
  );
  return ctx;
}

export async function load(page, url, { js = true, settle = 400 } = {}) {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  if (js) await page.waitForFunction(() => document.documentElement.classList.contains('js'), null, { timeout: 15000 });
  await sleep(settle);
}

/** Scroll top→bottom once in 60% viewport steps so every one-shot reveal has
 *  armed and shown, then return to `backTo` (default top). */
export async function scrollThrough(page, { backTo = 0, step = 0.6, dwell = 140 } = {}) {
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  const vh = await page.evaluate(() => window.innerHeight);
  for (let y = 0; y < total; y += Math.round(vh * step)) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await sleep(dwell);
  }
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await sleep(500);
  await page.evaluate((y) => window.scrollTo(0, y), backTo);
  await sleep(700);
}

/** Scroll so `selector`'s top sits `offset` px under the viewport top. */
export async function scrollToSelector(page, selector, offset = 0) {
  await page.evaluate(
    ({ selector, offset }) => {
      const el = document.querySelector(selector);
      if (!el) throw new Error(`no element ${selector}`);
      const y = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo(0, Math.max(0, y));
    },
    { selector, offset },
  );
}

/** Scroll from the current position to `y` over `ms` on the page's own clock
 *  (a reading pace; no smooth-scroll dependence). */
export async function glide(page, y, ms = 1600) {
  await page.evaluate(
    ({ y, ms }) =>
      new Promise((done) => {
        const y0 = window.scrollY;
        const t0 = performance.now();
        const ease = (t) => 1 - Math.pow(1 - t, 3);
        const tick = () => {
          const t = Math.min(1, (performance.now() - t0) / ms);
          window.scrollTo(0, y0 + (y - y0) * ease(t));
          if (t < 1) requestAnimationFrame(tick);
          else done();
        };
        requestAnimationFrame(tick);
      }),
    { y, ms },
  );
}

export const label = (t, w, h = 44) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="#1d1b17"/><text x="14" y="${Math.round(h * 0.66)}" font-family="DejaVu Sans Mono, Menlo, monospace" font-size="${Math.round(h * 0.39)}" fill="#f3ede4">${t.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text></svg>`,
  );
