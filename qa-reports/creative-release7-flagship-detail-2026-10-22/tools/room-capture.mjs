#!/usr/bin/env node
/**
 * room-capture.mjs — before/after captures of the homepage flagship room
 * (#flagship) from a BUILT export, plus the room's measured geometry.
 *
 *   node qa-reports/creative-release7-flagship-detail-2026-10-22/tools/room-capture.mjs \
 *        --dir <export dir> --out <dir> [--tag before|after] [--themes light,dark] \
 *        [--sizes 1440x900@1,393x852@2] [--modes normal,rm,nojs] [--port 3321]
 *
 * Each page is loaded, fonts awaited, then walked from the top to the room in
 * 400px steps and on through the room in 300px steps (the way a reader
 * arrives: lazy images load, every reveal in the room arms and fires), set
 * back at the room's top, held 2.6s so every one-shot transition has finished, then
 * framed two ways: the viewport with the room's top at the top edge
 * ("room-fold") and the room element alone ("room"). `rm` emulates
 * prefers-reduced-motion and frames 120ms after the walk ends (no walk
 * through the room: the composition must be complete at once), `rm1600` the
 * same at 1600ms (diffing the two proves nothing moved); `nojs` disables
 * JavaScript. Writes JPEG frames + geometry.json (boxes of the room, words,
 * stage, plate, screen; image natural sizes; overflow; page errors).
 * Loopback only; nothing is installed.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..', '..');
const require = createRequire(path.join(ROOT, 'package.json'));
const { chromium } = require('playwright-core');

const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf(`--${n}`); return i === -1 ? d : argv[i + 1]; };
const DIR = path.resolve(opt('dir', 'out'));
const OUT = path.resolve(opt('out', 'room-capture'));
const TAG = opt('tag', 'after');
const THEMES = opt('themes', 'light,dark').split(',');
const SIZES = opt('sizes', '1440x900@1,393x852@2').split(',').map((t) => {
  const m = /^(\d+)x(\d+)@([\d.]+)$/.exec(t);
  return { w: +m[1], h: +m[2], dpr: +m[3], tag: t };
});
const MODES = opt('modes', 'normal').split(',');
const PORT = Number(opt('port', 3321));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
fs.mkdirSync(OUT, { recursive: true });

const srv = spawn(process.execPath, [path.join(ROOT, 'scripts', 'static-serve.mjs'), DIR, String(PORT)], { stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise((r) => srv.stdout.once('data', r));
const browser = await chromium.launch({ headless: true });
const geometry = [];
try {
  for (const theme of THEMES) for (const size of SIZES) for (const mode of MODES) {
    const ctx = await browser.newContext({
      viewport: { width: size.w, height: size.h }, deviceScaleFactor: size.dpr, colorScheme: theme,
      reducedMotion: mode.startsWith('rm') ? 'reduce' : 'no-preference', javaScriptEnabled: mode !== 'nojs',
      ...(size.w < 600 ? { isMobile: true, hasTouch: true } : {}),
    });
    await ctx.addInitScript((t) => { try { localStorage.setItem('theme', t); } catch { /* denied */ } }, theme);
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
    await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const top = await page.evaluate(() => document.querySelector('#flagship').getBoundingClientRect().top + scrollY);
    for (let y = 0; y < top; y += 400) { await page.evaluate((v) => scrollTo(0, v), y); await sleep(mode === 'nojs' ? 5 : 20); }
    // Walk on through the room so every reveal inside it (a phone-width room
    // is taller than its viewport) has armed and fired, then frame it.
    const bottom = await page.evaluate(() => { const r = document.querySelector('#flagship').getBoundingClientRect(); return r.bottom + scrollY; });
    if (!mode.startsWith('rm')) { for (let y = top; y < bottom; y += 300) { await page.evaluate((v) => scrollTo(0, v), y); await sleep(60); } }
    await page.evaluate((v) => scrollTo(0, v), top);
    await sleep(mode === 'rm' ? 120 : mode === 'rm1600' ? 1600 : 2600);
    await page.waitForFunction(() => [...document.querySelectorAll('#flagship img')].every((i) => i.complete), null, { timeout: 15000 }).catch(() => {});
    const tag = `${TAG}-${theme}-${size.tag}${mode === 'normal' ? '' : `-${mode}`}`;
    await page.screenshot({ path: path.join(OUT, `${tag}-room-fold.jpg`), type: 'jpeg', quality: 84 });
    await page.locator('#flagship').screenshot({ path: path.join(OUT, `${tag}-room.jpg`), type: 'jpeg', quality: 84 });
    const g = await page.evaluate(() => {
      const room = document.querySelector('#flagship');
      const rb = room.getBoundingClientRect();
      const box = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return { x: +(b.left).toFixed(1), y: +(b.top - rb.top).toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1) }; };
      const screen = room.querySelector('.pr-screen');
      const plate = room.querySelector('[data-exhibit-detail] .overflow-hidden');
      const imgs = [...room.querySelectorAll('img')].map((i) => ({ src: i.currentSrc.split('/').pop(), nat: [i.naturalWidth, i.naturalHeight], alt: i.alt, box: box(i), hiddenFromAT: Boolean(i.closest('[aria-hidden="true"]')) }));
      const sr = screen?.getBoundingClientRect();
      const pr = plate?.getBoundingClientRect();
      // the card's mid-height on the screen (capture px 444..1296 of 2803) vs the plate's mid-height
      const cardMid = sr ? sr.top + ((444 + 1296) / 2 / 2803) * sr.height - rb.top : null;
      const plateMid = pr ? pr.top + pr.height / 2 - rb.top : null;
      const words = room.querySelector('.lg\\:flex.lg\\:flex-col') || room.querySelector('h2')?.parentElement;
      return {
        room: box(room), h2: box(room.querySelector('h2')), screen: box(screen), frame: box(room.querySelector('.pr-frame-phone')),
        plate: box(plate), leader: box(room.querySelector('[data-exhibit-detail] .bg-terracotta.h-px')),
        cardMid: cardMid && +cardMid.toFixed(1), plateMid: plateMid && +plateMid.toFixed(1),
        slabVisible: [...room.querySelectorAll('.pr-world')].some((e) => getComputedStyle(e).display !== 'none'),
        docOverflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        imgs,
      };
    });
    geometry.push({ tag, theme, size: size.tag, mode, errors, ...g });
    await ctx.close();
  }
} finally {
  await browser.close();
  srv.kill();
}
fs.writeFileSync(path.join(OUT, `geometry-${TAG}.json`), JSON.stringify(geometry, null, 1));
console.log(geometry.map((g) => `${g.tag}: screen ${g.screen?.w}x${g.screen?.h} plate ${g.plate?.w ?? '-'} mid ${g.plateMid ?? '-'}/${g.cardMid ?? '-'} slab=${g.slabVisible} ovx=${g.docOverflowX} err=${g.errors.length}`).join('\n'));
