#!/usr/bin/env node
/**
 * theme-turn.mjs — record the dusk-turn (the theme flip) in both directions
 * with readable text in view, from a BUILT export.
 *
 *   node theme-turn.mjs --dir <export dir> --out <dir> [--route /work/] [--size 1440x900] [--dilate 10]
 *
 * Two recordings per leg: real time (what a visitor sees; headless Chromium
 * records at ~25 fps, so a 420 ms turn is ~10 frames) and a DIAGNOSTIC
 * time-dilated pass where the ::view-transition pseudo animations are slowed
 * N× by an injected stylesheet, so the keyframe structure (hold windows, the
 * uncovered sky) can be read frame by frame. The dilated pass is labelled as
 * such everywhere; it is instrumentation, not the shipped timing.
 * Also checks: the marker lifecycle, the theme-synced showcase images, scroll
 * and route stability, and a rapid double toggle.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { opt, parseSizes, resolveChromium, serve, chromium, load, sleep, sharp, label } from './lib.mjs';

const DIR = path.resolve(opt('dir', 'out'));
const OUT = path.resolve(opt('out'));
const ROUTE = opt('route', '/work/');
const SIZE = parseSizes(opt('size', '1440x900'))[0];
const DILATE = Number(opt('dilate', 10));
const PORT = Number(opt('port', 3261));
const BASE = `http://127.0.0.1:${PORT}`;
fs.mkdirSync(OUT, { recursive: true });

const engine = resolveChromium();
const server = await serve(DIR, PORT);
const browser = await chromium.launch({ headless: true, executablePath: engine });
const report = [];

async function runLeg({ from, to, dilate }) {
  const name = `turn-${from}-to-${to}${dilate > 1 ? `-x${dilate}-diagnostic` : ''}`;
  const rawDir = path.join(OUT, 'raw', name);
  fs.mkdirSync(rawDir, { recursive: true });
  const ctx = await browser.newContext({
    viewport: { width: SIZE.w, height: SIZE.h },
    colorScheme: from,
    reducedMotion: 'no-preference',
    recordVideo: { dir: rawDir, size: { width: SIZE.w, height: SIZE.h } },
  });
  await ctx.addInitScript((t) => {
    try {
      localStorage.setItem('theme', t);
      sessionStorage.setItem('work:seen', '1');
    } catch {}
  }, from);
  const page = await ctx.newPage();
  await load(page, BASE + ROUTE);
  // readable text in view: the first plate / the index
  await page.evaluate(() => {
    const el = document.querySelector('.case-study-card') || document.querySelector('#work');
    if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 40);
  });
  await sleep(800);
  if (dilate > 1) {
    await page.addStyleTag({
      content: `::view-transition-old(root), ::view-transition-new(root) { animation-duration: calc(var(--dur-transition) * ${dilate}) !important; }`,
    });
  }
  const supports = await page.evaluate(() => typeof document.startViewTransition === 'function');
  const y0 = await page.evaluate(() => Math.round(window.scrollY));
  const imgsBefore = await page.evaluate(() => Array.from(document.images).map((i) => i.currentSrc).filter(Boolean));
  const toggle = page.locator('button[aria-label^="Switch to"]').first();
  const ariaBefore = await toggle.getAttribute('aria-label');
  const tStart = Date.now();
  await toggle.click();
  // sample the marker during the turn
  const markers = [];
  for (let i = 0; i < (dilate > 1 ? 60 : 12); i++) {
    markers.push(await page.evaluate(() => document.documentElement.dataset.themeTurn ?? null));
    await sleep(dilate > 1 ? 100 : 50);
  }
  await sleep(dilate > 1 ? 1200 : 800);
  const after = await page.evaluate(() => ({
    dark: document.documentElement.classList.contains('dark'),
    marker: document.documentElement.dataset.themeTurn ?? null,
    y: Math.round(window.scrollY),
    stored: localStorage.getItem('theme'),
    colorScheme: document.documentElement.style.colorScheme,
    imgs: Array.from(document.images).map((i) => i.currentSrc).filter(Boolean),
  }));
  const ariaAfter = await toggle.getAttribute('aria-label');
  const focusOnToggle = await page.evaluate(() => document.activeElement?.getAttribute('aria-label') ?? null);
  await ctx.close();
  const webm = fs.readdirSync(rawDir).find((f) => f.endsWith('.webm'));
  const mp4 = path.join(OUT, `${name}.mp4`);
  if (webm) {
    spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', path.join(rawDir, webm), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-movflags', '+faststart', mp4]);
  }
  fs.rmSync(rawDir, { recursive: true, force: true });
  const themedBefore = imgsBefore.filter((s) => /\.(light|dark)\./.test(s));
  const themedAfter = after.imgs.filter((s) => /\.(light|dark)\./.test(s));
  const row = {
    leg: `${from} → ${to}`,
    dilate,
    supportsViewTransitions: supports,
    ariaBefore,
    ariaAfter,
    markerSeen: markers.filter(Boolean)[0] ?? null,
    markerReleased: after.marker === null,
    endedDark: after.dark,
    stored: after.stored,
    colorScheme: after.colorScheme,
    scrollUnchanged: after.y === y0,
    focusStaysOnToggle: focusOnToggle === ariaAfter,
    themedImagesBefore: themedBefore.length,
    themedImagesNowMatching: themedAfter.filter((s) => s.includes(`.${to}.`)).length,
    themedImagesTotal: themedAfter.length,
    clip: path.basename(mp4),
  };
  report.push(row);
  console.log(`[theme-turn] ${name}: ${JSON.stringify(row)}`);
  return { mp4, tStart };
}

try {
  const legs = [];
  for (const dilate of [1, DILATE]) {
    legs.push(await runLeg({ from: 'light', to: 'dark', dilate }));
    legs.push(await runLeg({ from: 'dark', to: 'light', dilate }));
  }
  // rapid double toggle, real time: ends where it started, marker released
  {
    const ctx = await browser.newContext({ viewport: { width: SIZE.w, height: SIZE.h }, colorScheme: 'light' });
    await ctx.addInitScript(() => {
      try {
        localStorage.setItem('theme', 'light');
      } catch {}
    });
    const page = await ctx.newPage();
    await load(page, BASE + ROUTE);
    const toggle = page.locator('button[aria-label^="Switch to"]').first();
    await toggle.click();
    await sleep(80);
    await toggle.click();
    await sleep(1000);
    const st = await page.evaluate(() => ({ dark: document.documentElement.classList.contains('dark'), marker: document.documentElement.dataset.themeTurn ?? null, stored: localStorage.getItem('theme') }));
    report.push({ leg: 'rapid double toggle (light→dark→light within 80 ms)', ...st, markerReleased: st.marker === null });
    console.log(`[theme-turn] rapid: ${JSON.stringify(st)}`);
    await ctx.close();
  }
} finally {
  await browser.close();
  server.kill('SIGTERM');
}
fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify({ dir: DIR, route: ROUTE, size: SIZE.tag, at: new Date().toISOString(), rows: report }, null, 2));
