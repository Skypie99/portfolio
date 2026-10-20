#!/usr/bin/env node
/**
 * capture.mjs — review captures of the Release 6 surfaces from a BUILT export.
 *
 *   node qa-reports/release6-editorial-finish-2026-10-20/tools/capture.mjs \
 *        --dir <export dir> --out <dir> [--targets work,home-work] [--themes light,dark] \
 *        [--sizes 1440x900@1,393x852@2] [--modes normal,rm,nojs,zoomtext] [--port 3205]
 *
 * Targets (each is a route plus what to frame):
 *   work       /work/        fold, full page, and the wall's first two plates
 *   home-work  /#work        the homepage work index section alone (scrolled into view
 *                            after the page has been walked once), plus the fold there
 *   home-tail  /             the lower homepage from #work to #contact as a full strip
 *
 * Every page is loaded, waited for fonts + hydration, scrolled through once so
 * one-shot reveals have fired, then framed. `rm` emulates prefers-reduced-motion:
 * reduce and captures 120 ms after load WITHOUT a scroll pass (the composition
 * must be complete from first paint); `nojs` disables JavaScript. Output: JPEG
 * (fold q82, full q72) + a manifest.json with page errors and element boxes.
 */
import fs from 'node:fs';
import path from 'node:path';
import { argv, opt, flag, parseSizes, resolveChromium, serve, chromium, makeContext, load, scrollThrough, scrollToSelector, sleep } from './lib.mjs';

const DIR = path.resolve(opt('dir', 'out'));
const OUT = path.resolve(opt('out'));
const TARGETS = opt('targets', 'work,home-work').split(',');
const THEMES = opt('themes', 'light,dark').split(',');
const SIZES = parseSizes(opt('sizes', '1440x900@1,393x852@2'));
const MODES = opt('modes', 'normal').split(',');
const PORT = Number(opt('port', 3205));
const BASE = `http://127.0.0.1:${PORT}`;
const JPEG = { type: 'jpeg', quality: 82 };
const JPEG_FULL = { type: 'jpeg', quality: 72 };

if (!fs.existsSync(DIR)) {
  console.error(`[capture] export dir missing: ${DIR}`);
  process.exit(2);
}
fs.mkdirSync(OUT, { recursive: true });

const ROUTE_OF = { work: '/work/', 'home-work': '/', 'home-tail': '/' };

const engine = resolveChromium();
const server = await serve(DIR, PORT);
const browser = await chromium.launch({ headless: true, executablePath: engine });
const manifest = [];
try {
  for (const target of TARGETS) {
    for (const theme of THEMES) {
      for (const size of SIZES) {
        for (const mode of MODES) {
          const ctx = await makeContext(browser, { ...size, theme, mode });
          const page = await ctx.newPage();
          const errors = [];
          page.on('pageerror', (e) => errors.push(String(e)));
          const tag = `${target}-${theme}-${size.tag}${mode === 'normal' ? '' : `-${mode}`}`;
          const url = BASE + ROUTE_OF[target];
          const entry = { target, theme, size: size.tag, mode, files: [], errors };
          try {
            if (mode === 'rm') {
              await load(page, url, { settle: 0 });
              await sleep(120);
            } else {
              await load(page, url, { js: mode !== 'nojs' });
            }
            if (mode === 'zoomtext') {
              // Text-only enlargement to 200%: the root font-size doubles, so
              // every rem-based size follows while px-sized boxes do not.
              await page.evaluate(() => {
                document.documentElement.style.fontSize = '200%';
              });
              await sleep(300);
            }
            if (target === 'work') {
              if (mode === 'normal' || mode === 'zoomtext') await scrollThrough(page);
              const fold = path.join(OUT, `${tag}-fold.jpg`);
              await page.screenshot({ path: fold, ...JPEG });
              entry.files.push(fold);
              const full = path.join(OUT, `${tag}-full.jpg`);
              await page.screenshot({ path: full, fullPage: true, ...JPEG_FULL });
              entry.files.push(full);
              // the first two plates, framed as the reader meets them
              for (const n of [1, 2]) {
                const sel = `ul > li:nth-child(${n}) .case-study-card`;
                const el = page.locator(sel).first();
                if ((await el.count()) === 0) continue;
                await scrollToSelector(page, sel, 48);
                await sleep(mode === 'normal' ? 1300 : 150);
                const f = path.join(OUT, `${tag}-plate-0${n}.jpg`);
                await page.screenshot({ path: f, ...JPEG });
                entry.files.push(f);
                entry[`plate0${n}`] = await el.boundingBox();
              }
            } else if (target === 'home-work') {
              if (mode === 'normal' || mode === 'zoomtext') {
                await scrollThrough(page, { backTo: 0 });
              }
              await scrollToSelector(page, '#work', 0);
              await sleep(mode === 'normal' ? 1500 : 150);
              const fold = path.join(OUT, `${tag}-fold.jpg`);
              await page.screenshot({ path: fold, ...JPEG });
              entry.files.push(fold);
              const el = page.locator('#work');
              const sec = path.join(OUT, `${tag}-section.jpg`);
              await el.screenshot({ path: sec, ...JPEG });
              entry.files.push(sec);
              entry.section = await el.boundingBox();
            } else if (target === 'home-tail') {
              await scrollThrough(page, { backTo: 0 });
              await scrollToSelector(page, '#work', 0);
              await sleep(800);
              const box = await page.evaluate(() => {
                const a = document.querySelector('#work').getBoundingClientRect();
                const b = document.querySelector('#contact').getBoundingClientRect();
                return { x: 0, y: a.top + window.scrollY, width: window.innerWidth, height: b.bottom - a.top };
              });
              const f = path.join(OUT, `${tag}-strip.jpg`);
              await page.screenshot({ path: f, fullPage: true, clip: box, ...JPEG_FULL });
              entry.files.push(f);
            }
          } catch (e) {
            entry.failure = String(e);
            console.error(`[capture] ${tag}: ${e}`);
          }
          manifest.push(entry);
          console.log(`[capture] ${tag} ok (${entry.files.length} files, ${errors.length} page errors)`);
          await ctx.close();
        }
      }
    }
  }
} finally {
  await browser.close();
  server.kill('SIGTERM');
}
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify({ dir: DIR, at: new Date().toISOString(), captures: manifest }, null, 2));
console.log(`[capture] wrote ${manifest.length} entries to ${OUT}`);
