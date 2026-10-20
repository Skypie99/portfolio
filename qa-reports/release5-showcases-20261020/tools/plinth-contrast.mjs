#!/usr/bin/env node
/**
 * plinth-contrast.mjs — measures the chapter text that sits nearest each
 * plinth glow (the label line directly above a plane and the first caption
 * line directly below it) against the background actually rendered behind it,
 * in both themes at 1440×900 and 393×852, from the BUILT site.
 *
 * Method: scroll the figure into view, wait for the bloom to rest (opacity 1),
 * hide the text with `visibility: hidden`, screenshot the text line's box at
 * device pixel ratio 1, and compare every pixel of it with the text's computed
 * colour (WCAG 2 contrast). The worst pixel is the number that matters; the
 * best is the plain page surface. Writes one line per measurement.
 *
 *   npm run build
 *   node qa-reports/release5-showcases-20261020/tools/plinth-contrast.mjs [--out <file>] [--routes a,b]
 *
 * Chromium only; no network beyond loopback; nothing is installed.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright-core');
const sharp = require('sharp');

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..', '..');
const OUT_DIR = path.join(ROOT, 'out');
const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? def : args[i + 1];
};
const OUT = path.resolve(opt('out', path.join(ROOT, 'qa-reports/release5-showcases-20261020/a11y/plinth-contrast.txt')));
const ROUTES = opt('routes', 'prompt-library,claude-corp,ghost-code,dashboard').split(',');
const THEMES = ['light', 'dark'];
const SIZES = [
  [1440, 900],
  [393, 852],
];
const PORT = Number(process.env.CAPTURE_PORT || 3110);
const BASE = `http://127.0.0.1:${PORT}`;

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
  for (const d of fs.readdirSync(base).filter((d) => /^chromium-\d+$/.test(d)).sort().reverse()) {
    const p = path.join(base, d, 'chrome-linux', 'chrome');
    if (fs.existsSync(p)) return p;
  }
  return null;
}
function serve() {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(ROOT, 'scripts', 'static-serve.mjs'), OUT_DIR, String(PORT)], { stdio: ['ignore', 'pipe', 'pipe'] });
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
const lum = ([r, g, b]) => {
  const f = (c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a, b) => {
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
};
const parse = (c) => c.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number);

const server = await serve();
const browser = await chromium.launch({ headless: true, executablePath: resolveChromium() });
const lines = [];
const worst = { light: { r: Infinity }, dark: { r: Infinity } };
const say = (s) => {
  lines.push(s);
  console.log(s);
};
try {
  for (const theme of THEMES) {
    for (const [w, h] of SIZES) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, colorScheme: theme, ...(w < 600 ? { isMobile: true, hasTouch: true } : {}) });
      await ctx.addInitScript((t) => {
        try {
          window.localStorage.setItem('theme', t);
        } catch {
          /* storage denied */
        }
      }, theme);
      const page = await ctx.newPage();
      for (const route of ROUTES) {
        await page.goto(`${BASE}/work/${route}/`, { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        const total = await page.evaluate(() => document.documentElement.scrollHeight);
        for (let y = 0; y < total; y += 500) {
          await page.evaluate((yy) => window.scrollTo(0, yy), y);
          await sleep(60);
        }
        const n = await page.evaluate(() => document.querySelectorAll('[data-case-showcase] figure').length);
        for (let i = 0; i < n; i += 1) {
          for (const which of ['label', 'caption']) {
            const info = await page.evaluate(
              async ({ i, which }) => {
                const fig = document.querySelectorAll('[data-case-showcase] figure')[i];
                const plinth = fig.querySelector('[class*="plinth"]');
                const cap = fig.querySelector('figcaption');
                const plane = plinth && plinth.parentElement;
                if (!plinth || !cap || !plane || getComputedStyle(plane).display === 'none' || plane.getBoundingClientRect().height === 0) return null;
                const scope = which === 'caption' ? cap : plane.previousElementSibling;
                if (!scope) return null;
                const texts = [];
                const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, {
                  acceptNode: (t) => (t.textContent.trim() && t.parentElement.getClientRects().length ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP),
                });
                let tn;
                while ((tn = walker.nextNode())) texts.push(tn);
                if (!texts.length) return null;
                const node = which === 'caption' ? texts[0] : texts[texts.length - 1];
                const el = node.parentElement;
                el.scrollIntoView({ block: 'center' });
                await new Promise((r) => setTimeout(r, 1800));
                const range = document.createRange();
                range.selectNodeContents(node);
                const rects = range.getClientRects();
                const lr = which === 'caption' ? rects[0] : rects[rects.length - 1];
                const pr = plinth.getBoundingClientRect();
                const plr = plane.getBoundingClientRect();
                const color = getComputedStyle(el).color;
                const opacity = getComputedStyle(plinth).opacity;
                scope.style.visibility = 'hidden';
                await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
                const reach = which === 'caption' ? pr.bottom - lr.top : lr.bottom - pr.top;
                return { x: Math.round(lr.left), y: Math.round(lr.top), w: Math.round(lr.width), h: Math.round(lr.height), color, opacity, reach: Math.round(reach), aside: lr.left >= plr.right - 1 };
              },
              { i, which },
            );
            if (!info) continue;
            const png = await page.screenshot({ clip: { x: info.x, y: info.y, width: Math.max(1, info.w), height: Math.max(1, info.h) }, type: 'png' });
            await page.evaluate(
              ({ i, which }) => {
                const fig = document.querySelectorAll('[data-case-showcase] figure')[i];
                const plinth = fig.querySelector('[class*="plinth"]');
                const scope = which === 'caption' ? fig.querySelector('figcaption') : plinth.parentElement.previousElementSibling;
                scope.style.visibility = '';
              },
              { i, which },
            );
            const { data, info: meta } = await sharp(png).raw().toBuffer({ resolveWithObject: true });
            const tl = lum(parse(info.color));
            let lo = Infinity;
            let loPx = null;
            let hi = 0;
            for (let p = 0; p < data.length; p += meta.channels) {
              const px = [data[p], data[p + 1], data[p + 2]];
              const r = ratio(tl, lum(px));
              if (r < lo) {
                lo = r;
                loPx = px;
              }
              if (r > hi) hi = r;
            }
            const where = `${theme} ${w}×${h} ${route} exhibit ${i + 1} ${which}`;
            if (lo < worst[theme].r) worst[theme] = { r: lo, where };
            const glow = info.aside ? 'caption beside the plane' : info.reach >= 0 ? `glow box reaches ${info.reach}px into the line` : `glow box ends ${-info.reach}px short of the line`;
            say(`${where}: text ${info.color}; worst ${lo.toFixed(2)}:1 on rgb(${loPx.join(', ')}); best ${hi.toFixed(2)}:1; plinth opacity ${info.opacity}; ${glow}`);
          }
        }
      }
      await ctx.close();
    }
  }
  say(`WORST light ${worst.light.r.toFixed(2)}:1 (${worst.light.where}) · dark ${worst.dark.r.toFixed(2)}:1 (${worst.dark.where})`);
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, `${lines.join('\n')}\n`);
} finally {
  await browser.close();
  server.kill('SIGTERM');
}
