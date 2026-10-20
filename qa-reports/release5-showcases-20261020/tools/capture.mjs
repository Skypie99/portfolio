#!/usr/bin/env node
/**
 * capture.mjs — Release 5 showcase review captures from the BUILT site (`out/`).
 *
 *   npm run build
 *   node qa-reports/release5-showcases-20261020/tools/capture.mjs --out <dir> [--routes a,b] [--themes light,dark]
 *        [--sizes 1440x900@1,393x852@2] [--modes normal,rm,nojs] [--full] [--fold] [--label before]
 *
 * For every route × theme × size × mode it loads the page, waits for fonts and
 * hydration (`html.js`), scrolls the whole page once so every scroll reveal has
 * fired, returns to the top, and writes the first fold (viewport) and, with
 * --full, the full page as JPEG. `rm` emulates prefers-reduced-motion: reduce
 * (no scroll pass: the page must be complete from first paint); `nojs` disables
 * JavaScript. Chromium only (playwright-core, the pre-installed browser); no
 * network beyond loopback; nothing is installed.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright-core');

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..', '..');
const OUT_DIR = path.join(ROOT, 'out');
const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? def : args[i + 1];
};
const flag = (name) => args.includes(`--${name}`);

const OUT = path.resolve(opt('out', path.join(ROOT, 'qa-reports/release5-showcases-20261020/captures')));
const ROUTES = opt('routes', 'prompt-library,claude-corp,ghost-code,dashboard').split(',');
const THEMES = opt('themes', 'light,dark').split(',');
const SIZES = opt('sizes', '1440x900@1,393x852@2').split(',').map((s) => {
  const m = /^(\d+)x(\d+)@([\d.]+)$/.exec(s);
  if (!m) throw new Error(`bad size ${s}`);
  return { w: Number(m[1]), h: Number(m[2]), dpr: Number(m[3]) };
});
const MODES = opt('modes', 'normal').split(',');
const FULL = flag('full');
const FOLD = flag('fold') || !FULL;
const LABEL = opt('label', '');
const PORT = Number(process.env.CAPTURE_PORT || 3105);
const BASE = `http://127.0.0.1:${PORT}`;
/* Folds keep detail (q80); full pages are long and mostly prose (q70). */
const JPEG = { type: 'jpeg', quality: 80 };
const JPEG_FULL = { type: 'jpeg', quality: 70 };

if (!fs.existsSync(OUT_DIR)) {
  console.error('[capture] out/ is missing: run `npm run build` first.');
  process.exit(2);
}

function resolveChromium() {
  const override = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
  if (override && fs.existsSync(override)) return override;
  try {
    const p = chromium.executablePath();
    if (p && fs.existsSync(p)) return p;
  } catch {
    /* fall through */
  }
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  const dirs = fs.readdirSync(base).filter((d) => /^chromium-\d+$/.test(d)).sort().reverse();
  for (const d of dirs) {
    const p = path.join(base, d, 'chrome-linux', 'chrome');
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function serve() {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(ROOT, 'scripts', 'static-serve.mjs'), OUT_DIR, String(PORT)], {
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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function load(page, url, { js = true } = {}) {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  if (js) await page.waitForFunction(() => document.documentElement.classList.contains('js'), null, { timeout: 15000 });
  await sleep(400);
}

/** Scroll the page once, top to bottom in viewport steps, so every one-shot
 *  reveal arms and shows, then return to the top. */
async function scrollThrough(page) {
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  const vh = await page.evaluate(() => window.innerHeight);
  for (let y = 0; y < total; y += Math.round(vh * 0.6)) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await sleep(140);
  }
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await sleep(500);
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(700);
}

const engine = resolveChromium();
if (!engine) {
  console.error('[capture] no Chromium found');
  process.exit(2);
}
const server = await serve();
const browser = await chromium.launch({ headless: true, executablePath: engine });
const manifest = [];
try {
  for (const route of ROUTES) {
    for (const theme of THEMES) {
      for (const { w, h, dpr } of SIZES) {
        for (const mode of MODES) {
          const ctx = await browser.newContext({
            viewport: { width: w, height: h },
            deviceScaleFactor: dpr,
            colorScheme: theme,
            reducedMotion: mode === 'rm' ? 'reduce' : 'no-preference',
            javaScriptEnabled: mode !== 'nojs',
            ...(w < 600 ? { isMobile: true, hasTouch: true } : {}),
          });
          await ctx.addInitScript((t) => {
            try {
              window.localStorage.setItem('theme', t);
            } catch {
              /* storage denied */
            }
          }, theme);
          const page = await ctx.newPage();
          const errors = [];
          page.on('pageerror', (e) => errors.push(String(e)));
          page.on('console', (m) => {
            if (m.type() === 'error') errors.push(m.text());
          });
          const url = `${BASE}/work/${route}/`;
          await load(page, url, { js: mode !== 'nojs' });
          const dir = path.join(OUT, route);
          fs.mkdirSync(dir, { recursive: true });
          const tag = `${LABEL ? LABEL + '-' : ''}${theme}-${w}x${h}${dpr !== 1 ? `@${dpr}` : ''}${mode !== 'normal' ? `-${mode}` : ''}`;
          if (mode === 'normal') await scrollThrough(page);
          if (FOLD) {
            await page.screenshot({ path: path.join(dir, `${tag}-fold.jpg`), ...JPEG });
          }
          if (FULL) {
            await page.screenshot({ path: path.join(dir, `${tag}-full.jpg`), fullPage: true, ...JPEG_FULL });
          }
          const metrics = await page.evaluate(() => ({
            scrollHeight: document.documentElement.scrollHeight,
            scrollWidth: document.documentElement.scrollWidth,
            innerWidth: window.innerWidth,
            h1: document.querySelector('h1')?.textContent?.trim() ?? null,
            hiddenReveals: Array.from(document.querySelectorAll('.reveal')).filter((el) => getComputedStyle(el).opacity === '0').length,
          }));
          manifest.push({ route, theme, size: `${w}x${h}@${dpr}`, mode, tag, ...metrics, errors });
          console.log(`[capture] ${route} ${tag} · ${metrics.scrollHeight}px tall · overflow ${metrics.scrollWidth > metrics.innerWidth ? 'YES' : 'no'} · hidden reveals ${metrics.hiddenReveals} · errors ${errors.length}`);
          await ctx.close();
        }
      }
    }
  }
  fs.writeFileSync(path.join(OUT, `manifest${LABEL ? '-' + LABEL : ''}.json`), JSON.stringify(manifest, null, 2));
} finally {
  await browser.close();
  server.kill('SIGTERM');
}
