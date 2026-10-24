#!/usr/bin/env node
/**
 * room-motion.mjs — the flagship room's arrival, measured and recorded.
 *
 *   node qa-reports/creative-release7-flagship-detail-2026-10-22/tools/room-motion.mjs \
 *        --dir <export dir> --out <dir> [--tag after] [--size 1440x900@1] [--theme light] [--port 3331]
 *
 * Loads the page, walks to 1.2 viewports above the room (reveals stay armed),
 * then glides the room's top to the viewport top over 1600ms on the page's
 * own clock (cubic ease-out). From the glide's first frame it samples, every
 * animation frame for 3.2s: the stage Reveal's opacity and transform, the
 * plate's opacity, and the leader's computed scaleX. Writes
 * motion-<tag>-<theme>-<size>.json (sample table + derived milestones) and a
 * normal-speed .webm of the same glide (Playwright's recorder, ~25fps). Then
 * the same probe under reduced motion and with JavaScript disabled, where the
 * leader must read scaleX 1 from the first sample. Loopback only.
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
const OUT = path.resolve(opt('out', 'room-motion'));
const TAG = opt('tag', 'after');
const THEME = opt('theme', 'light');
const [, W, H, DPR] = /^(\d+)x(\d+)@([\d.]+)$/.exec(opt('size', '1440x900@1')).map(Number);
const PORT = Number(opt('port', 3331));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
fs.mkdirSync(OUT, { recursive: true });

const srv = spawn(process.execPath, [path.join(ROOT, 'scripts', 'static-serve.mjs'), DIR, String(PORT)], { stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise((r) => srv.stdout.once('data', r));
const browser = await chromium.launch({ headless: true });
const results = {};
try {
  for (const mode of ['normal', 'rm', 'nojs']) {
    const ctx = await browser.newContext({
      viewport: { width: W, height: H }, deviceScaleFactor: DPR, colorScheme: THEME,
      reducedMotion: mode === 'rm' ? 'reduce' : 'no-preference', javaScriptEnabled: mode !== 'nojs',
      ...(W < 600 ? { isMobile: true, hasTouch: true } : {}),
    });
    await ctx.addInitScript((t) => { try { localStorage.setItem('theme', t); } catch { /* denied */ } }, THEME);
    const page = await ctx.newPage();
    await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const top = await page.evaluate(() => document.querySelector('#flagship').getBoundingClientRect().top + scrollY);
    const start = Math.max(0, top - Math.round(H * 1.2));
    for (let y = 0; y < start; y += 400) { await page.evaluate((v) => scrollTo(0, v), y); await sleep(12); }
    await page.evaluate((v) => scrollTo(0, v), start);
    await sleep(900);
    if (mode === 'nojs') {
      await page.evaluate((v) => scrollTo(0, v), top);
      await sleep(400);
      const still = await page.evaluate(() => {
        const plate = document.querySelector('#flagship [data-exhibit-detail]');
        const stage = plate?.closest('.reveal');
        const leader = plate?.querySelector('.h-px.bg-terracotta');
        const t = leader ? getComputedStyle(leader).transform : null;
        return { stageOpacity: stage ? +getComputedStyle(stage).opacity : null, leaderTransform: t, leaderDisplay: leader ? getComputedStyle(leader).display : null };
      });
      results[mode] = { milestones: { staticReading: still } };
      await ctx.close();
      continue;
    }
    await page.evaluate(({ to }) => {
      const room = document.querySelector('#flagship');
      const plate = room.querySelector('[data-exhibit-detail]');
      const stage = plate ? plate.closest('.reveal') : room.querySelector('.hero-settle-img')?.closest('.reveal');
      const leader = plate?.querySelector('.h-px.bg-terracotta') ?? null;
      const scaleX = (el) => { if (!el) return null; const t = getComputedStyle(el).transform; if (!t || t === 'none') return 1; const m = /matrix\(([^,]+)/.exec(t); return m ? +(+m[1]).toFixed(3) : null; };
      const out = []; const y0 = scrollY; const t0 = performance.now(); const ease = (t) => 1 - Math.pow(1 - t, 3);
      window.__roomSamples = out; window.__roomDone = false;
      window.__roomError = null;
      const tick = () => { try { step(); } catch (e) { window.__roomError = String((e && e.stack) || e); window.__roomDone = true; } };
      const step = () => {
        const t = performance.now() - t0;
        const g = Math.min(1, t / 1600);
        scrollTo(0, y0 + (to - y0) * ease(g));
        const sb = stage ? getComputedStyle(stage) : null;
        out.push({ t: Math.round(t), stageOpacity: sb ? +(+sb.opacity).toFixed(3) : null, stageShown: stage ? stage.classList.contains('reveal-shown') : null, stageTransform: sb ? sb.transform : null, plateOpacity: plate ? +(+getComputedStyle(plate).opacity).toFixed(3) : null, leaderScaleX: scaleX(leader) });
        if (t < 3200) requestAnimationFrame(tick); else window.__roomDone = true;
      };
      requestAnimationFrame(tick);
    }, { to: top });
    await page.waitForFunction(() => window.__roomDone === true, null, { timeout: 20000, polling: 100 }).catch(async (e) => {
      throw new Error(`${e.message} :: samples=${await page.evaluate(() => window.__roomSamples?.length)} err=${await page.evaluate(() => window.__roomError)}`);
    });
    const roomError = await page.evaluate(() => window.__roomError);
    if (roomError) throw new Error(`sampling failed: ${roomError}`);
    const samples = await page.evaluate(() => window.__roomSamples);
    const firstShown = samples.find((s) => s.stageShown);
    const stageRest = samples.find((s) => s.stageShown && s.stageOpacity >= 0.999 && (s.stageTransform === 'none' || /matrix\(1, 0, 0, 1, 0, 0\)/.test(s.stageTransform)));
    const leaderStart = samples.find((s) => s.leaderScaleX !== null && s.leaderScaleX > 0.001 && s.leaderScaleX < 1);
    const leaderRest = samples.find((s, i) => s.leaderScaleX === 1 && i > 0);
    results[mode] = {
      milestones: {
        stageShownAt: firstShown?.t ?? null,
        stageAtRestAt: stageRest?.t ?? null,
        leaderFirstMovesAt: leaderStart?.t ?? null,
        leaderAtRestAt: leaderRest?.t ?? null,
        leaderAtFirstSample: samples[0]?.leaderScaleX,
      },
      samples,
    };
    await ctx.close();
  }
  // The recording is a separate pass: Playwright's recorder and an in-page
  // rAF sampler in one context starved the sampler here (0 frames), so the
  // film is driven from Node instead, on the same 1600ms cubic glide.
  const vctx = await browser.newContext({
    viewport: { width: W, height: H }, deviceScaleFactor: DPR, colorScheme: THEME,
    ...(W < 600 ? { isMobile: true, hasTouch: true } : {}),
    recordVideo: { dir: OUT, size: { width: W, height: H } },
  });
  await vctx.addInitScript((t) => { try { localStorage.setItem('theme', t); } catch { /* denied */ } }, THEME);
  const vpage = await vctx.newPage();
  await vpage.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'networkidle' });
  await vpage.evaluate(() => document.fonts.ready);
  const vtop = await vpage.evaluate(() => document.querySelector('#flagship').getBoundingClientRect().top + scrollY);
  const vstart = Math.max(0, vtop - Math.round(H * 1.2));
  for (let y = 0; y < vstart; y += 400) { await vpage.evaluate((v) => scrollTo(0, v), y); await sleep(12); }
  await vpage.evaluate((v) => scrollTo(0, v), vstart);
  await sleep(900);
  const t0 = Date.now();
  for (;;) {
    const g = Math.min(1, (Date.now() - t0) / 1600);
    await vpage.evaluate((v) => scrollTo(0, v), vstart + (vtop - vstart) * (1 - Math.pow(1 - g, 3)));
    if (g >= 1) break;
    await sleep(16);
  }
  await sleep(2600);
  const video = vpage.video();
  await vctx.close();
  if (video) fs.renameSync(await video.path(), path.join(OUT, `motion-${TAG}-${THEME}-${W}x${H}.webm`));
} finally { await browser.close(); srv.kill(); }
fs.writeFileSync(path.join(OUT, `motion-${TAG}-${THEME}-${W}x${H}.json`), JSON.stringify(results, null, 1));
for (const [m, r] of Object.entries(results)) console.log(m, JSON.stringify(r.milestones));
