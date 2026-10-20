#!/usr/bin/env node
/**
 * rm-check.mjs — the reduced-motion and no-JavaScript floors, from a BUILT export.
 *
 *   node rm-check.mjs --dir <export dir> --out <dir> [--themes light,dark] [--sizes 1440x900@1,393x852@2]
 *
 * For each of the two Release 6 surfaces (/work/ wall, / #work index) it loads
 * the page under prefers-reduced-motion: reduce, screenshots the surface
 * 120 ms after load and again at 1600 ms, and counts the pixels that differ
 * (0 means the composition was complete from first paint). It also counts
 * running animations/transitions inside the surface and any .reveal whose
 * computed opacity is not 1, then repeats the surface capture with
 * JavaScript disabled. Writes JPEGs and report.json.
 */
import fs from 'node:fs';
import path from 'node:path';
import { opt, parseSizes, resolveChromium, serve, chromium, makeContext, sleep, sharp } from './lib.mjs';

const DIR = path.resolve(opt('dir', 'out'));
const OUT = path.resolve(opt('out'));
const THEMES = opt('themes', 'light,dark').split(',');
const SIZES = parseSizes(opt('sizes', '1440x900@1,393x852@2'));
const PORT = Number(opt('port', 3231));
const BASE = `http://127.0.0.1:${PORT}`;
fs.mkdirSync(OUT, { recursive: true });

const SURFACES = [
  { name: 'work', route: '/work/', selector: '[data-wall-seen], ul.flex.flex-col.gap-20' },
  { name: 'home-work', route: '/', selector: '#work' },
];

const engine = resolveChromium();
const server = await serve(DIR, PORT);
const browser = await chromium.launch({ headless: true, executablePath: engine });
const report = [];
try {
  for (const surf of SURFACES) {
    for (const theme of THEMES) {
      for (const size of SIZES) {
        const tag = `${surf.name}-${theme}-${size.tag}`;
        // --- reduced motion: first paint vs settled ---
        const ctx = await makeContext(browser, { ...size, theme, mode: 'rm' });
        const page = await ctx.newPage();
        await page.goto(BASE + surf.route, { waitUntil: 'domcontentloaded' });
        await page.evaluate(() => document.fonts.ready);
        await page.evaluate((sel) => {
          const el = document.querySelector(sel);
          if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY);
        }, surf.selector);
        await sleep(120);
        const a = path.join(OUT, `${tag}-rm-120ms.jpg`);
        const b = path.join(OUT, `${tag}-rm-1600ms.jpg`);
        await page.screenshot({ path: a, type: 'jpeg', quality: 90 });
        await sleep(1480);
        await page.screenshot({ path: b, type: 'jpeg', quality: 90 });
        const diff = await (async () => {
          const [A, B] = await Promise.all([a, b].map((f) => sharp(f).raw().toBuffer({ resolveWithObject: true })));
          if (A.info.width !== B.info.width || A.info.height !== B.info.height) return -1;
          let n = 0;
          for (let i = 0; i < A.data.length; i += 3) {
            if (Math.abs(A.data[i] - B.data[i]) > 12 || Math.abs(A.data[i + 1] - B.data[i + 1]) > 12 || Math.abs(A.data[i + 2] - B.data[i + 2]) > 12) n++;
          }
          return n;
        })();
        const state = await page.evaluate((sel) => {
          const root = document.querySelector(sel) || document.body;
          const reveals = Array.from(root.querySelectorAll('.reveal'));
          const off = reveals.filter((el) => Number(getComputedStyle(el).opacity) < 0.999 || getComputedStyle(el).transform !== 'none');
          const anims = typeof document.getAnimations === 'function' ? document.getAnimations().filter((an) => an.playState === 'running').length : -1;
          return { reveals: reveals.length, revealsOffRest: off.length, runningAnimations: anims, js: document.documentElement.classList.contains('js') };
        }, surf.selector);
        await ctx.close();
        // --- no JavaScript ---
        const ctx2 = await makeContext(browser, { ...size, theme, mode: 'nojs' });
        const page2 = await ctx2.newPage();
        await page2.goto(BASE + surf.route, { waitUntil: 'load' });
        await page2.evaluate(() => document.fonts.ready);
        await page2.evaluate((sel) => {
          const el = document.querySelector(sel);
          if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY);
        }, surf.selector);
        await sleep(300);
        const c = path.join(OUT, `${tag}-nojs.jpg`);
        await page2.screenshot({ path: c, type: 'jpeg', quality: 85 });
        const nojs = await page2.evaluate((sel) => {
          const root = document.querySelector(sel) || document.body;
          const reveals = Array.from(root.querySelectorAll('.reveal'));
          return { reveals: reveals.length, revealsHidden: reveals.filter((el) => Number(getComputedStyle(el).opacity) < 0.999).length, js: document.documentElement.classList.contains('js') };
        }, surf.selector);
        await ctx2.close();
        const row = { surface: surf.name, theme, size: size.tag, rmDiffPixels: diff, ...state, nojs };
        report.push(row);
        console.log(`[rm-check] ${tag}: rm diff ${diff}px · reveals off rest ${state.revealsOffRest}/${state.reveals} · running ${state.runningAnimations} · nojs hidden ${nojs.revealsHidden}/${nojs.reveals}`);
      }
    }
  }
} finally {
  await browser.close();
  server.kill('SIGTERM');
}
fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify({ dir: DIR, at: new Date().toISOString(), rows: report }, null, 2));
