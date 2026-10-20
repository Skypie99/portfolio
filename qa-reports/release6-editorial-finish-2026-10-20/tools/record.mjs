#!/usr/bin/env node
/**
 * record.mjs — normal-speed recordings of a scroll into a surface, plus a
 * reveal-timing probe, from a BUILT export.
 *
 *   node record.mjs --dir <export dir> --out <dir> --name <tag> --route /work/ \
 *        [--theme light] [--size 1440x900] [--to "#work"] [--offset 0] [--glide 1400] [--hold 2200]
 *        [--start "#support-work"] [--probe "#work .reveal"] [--storage key=value,...]
 *
 * The clip: the page loads, holds a beat, glides to `--to` (or scrolls by one
 * viewport when absent) at a reading pace, and holds while whatever is there
 * reveals. Playwright records WebM; ffmpeg transcodes to MP4 and cuts a
 * 8-frame strip. The probe samples the computed opacity of every element
 * matching `--probe` every 50 ms from the moment the glide starts, and writes
 * when each crossed 0.5 and 0.99, so two builds can be compared numerically.
 * Chromium only (the pre-installed Playwright build); nothing is installed.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { opt, flag, parseSizes, resolveChromium, serve, chromium, makeContext, load, sleep, glide, sharp, label } from './lib.mjs';

const DIR = path.resolve(opt('dir', 'out'));
const OUT = path.resolve(opt('out'));
const NAME = opt('name');
const ROUTE = opt('route', '/work/');
const THEME = opt('theme', 'light');
const SIZE = parseSizes(opt('size', '1440x900'))[0];
const TO = opt('to', '');
const START = opt('start', '');
const OFFSET = Number(opt('offset', 0));
const GLIDE = Number(opt('glide', 1400));
const HOLD = Number(opt('hold', 2200));
const PROBE = opt('probe', '');
// --probe-load <selector>: sample from the navigation itself (an init script),
// for choreography that runs on page arrival rather than on scroll.
const PROBE_LOAD = opt('probe-load', '');
const STORAGE = Object.fromEntries((opt('storage', '') || '').split(',').filter(Boolean).map((kv) => kv.split('=')));
const PORT = Number(opt('port', 3206));
const BASE = `http://127.0.0.1:${PORT}`;
const FFMPEG = process.env.FFMPEG || 'ffmpeg';
const KEEP = flag('keep-raw');

fs.mkdirSync(OUT, { recursive: true });
const rawDir = path.join(OUT, 'raw', NAME);
fs.mkdirSync(rawDir, { recursive: true });

const engine = resolveChromium();
const server = await serve(DIR, PORT);
const browser = await chromium.launch({ headless: true, executablePath: engine });
let report = {};
try {
  const ctx = await browser.newContext({
    viewport: { width: SIZE.w, height: SIZE.h },
    deviceScaleFactor: 1,
    colorScheme: THEME,
    reducedMotion: 'no-preference',
    recordVideo: { dir: rawDir, size: { width: SIZE.w, height: SIZE.h } },
    ...(SIZE.w < 600 ? { isMobile: true, hasTouch: true } : {}),
  });
  await ctx.addInitScript(
    ({ t, s }) => {
      try {
        window.localStorage.setItem('theme', t);
        for (const [k, v] of Object.entries(s)) window.sessionStorage.setItem(k, v);
      } catch {}
    },
    { t: THEME, s: STORAGE },
  );
  if (PROBE_LOAD) {
    await ctx.addInitScript((sel) => {
      window.__probeLoad = { samples: new Map() };
      const tick = () => {
        const t = Math.round(performance.now());
        for (const el of document.querySelectorAll(sel)) {
          const key = (el.textContent || '').trim().slice(0, 40) || el.className;
          if (!window.__probeLoad.samples.has(key)) window.__probeLoad.samples.set(key, []);
          const cs = getComputedStyle(el);
          window.__probeLoad.samples.get(key).push([t, Number(cs.opacity)]);
        }
        if (t < 6000) setTimeout(tick, 40);
      };
      tick();
    }, PROBE_LOAD);
  }
  const page = await ctx.newPage();
  await load(page, BASE + ROUTE, { settle: 600 });
  if (START) {
    // Jump (instantly) so the clip begins one band above the surface, the way a
    // visitor who has already read the band above arrives at it.
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY);
    }, START);
    await sleep(900);
  }
  // Arm the probe before the glide so no sample is missed.
  if (PROBE) {
    await page.evaluate((sel) => {
      const els = Array.from(document.querySelectorAll(sel));
      window.__probe = { t0: performance.now(), els, samples: els.map(() => []) };
      const tick = () => {
        const t = performance.now() - window.__probe.t0;
        window.__probe.els.forEach((el, i) => {
          const cs = getComputedStyle(el);
          window.__probe.samples[i].push([Math.round(t), Number(cs.opacity), cs.transform]);
        });
        if (t < 8000) setTimeout(tick, 50);
      };
      tick();
    }, PROBE);
  }
  const t0 = Date.now();
  await sleep(700);
  const targetY = TO
    ? await page.evaluate(
        ({ sel, off }) => {
          const el = document.querySelector(sel);
          return el.getBoundingClientRect().top + window.scrollY - off;
        },
        { sel: TO, off: OFFSET },
      )
    : await page.evaluate(() => window.innerHeight);
  const glideStart = Date.now() - t0;
  await glide(page, targetY, GLIDE);
  const glideEnd = Date.now() - t0;
  await sleep(HOLD);
  const total = Date.now() - t0;
  let loadReport = [];
  if (PROBE_LOAD) {
    loadReport = await page.evaluate(() => {
      const out = [];
      for (const [key, s] of window.__probeLoad.samples) {
        const first = s.find(([, o]) => o > 0.02);
        const half = s.find(([, o]) => o >= 0.5);
        const full = s.find(([, o]) => o >= 0.99);
        out.push({ text: key, firstSampleMs: s[0]?.[0], startOpacity: s[0]?.[1], firstVisibleMs: first?.[0] ?? null, halfMs: half?.[0] ?? null, fullMs: full?.[0] ?? null });
      }
      return out;
    });
  }
  if (PROBE) {
    report = await page.evaluate(() => {
      const { els, samples } = window.__probe;
      return els.map((el, i) => {
        const s = samples[i];
        const first = s.find(([, o]) => o > 0.02);
        const half = s.find(([, o]) => o >= 0.5);
        const done = s.find(([, o]) => o >= 0.99 && s.indexOf(s.find(([, oo]) => oo > 0.02)) <= s.indexOf(s.find(([, oo]) => oo >= 0.99)));
        const startOp = s[0]?.[1];
        return {
          tag: el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ').slice(0, 2).join('.') : ''),
          text: (el.textContent || '').trim().slice(0, 40),
          startOpacity: startOp,
          firstVisibleMs: first?.[0] ?? null,
          halfMs: half?.[0] ?? null,
          fullMs: done?.[0] ?? null,
        };
      });
    });
  }
  await ctx.close();
  const webm = fs.readdirSync(rawDir).find((f) => f.endsWith('.webm'));
  const mp4 = path.join(OUT, `${NAME}.mp4`);
  const strip = path.join(OUT, `${NAME}-frames.jpg`);
  if (webm) {
    const src = path.join(rawDir, webm);
    spawnSync(FFMPEG, ['-y', '-loglevel', 'error', '-i', src, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '23', '-movflags', '+faststart', mp4]);
    // 8 frames spanning the glide + hold
    const frameDir = path.join(rawDir, 'frames');
    fs.mkdirSync(frameDir, { recursive: true });
    const dur = Number(
      spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', mp4]).stdout.toString().trim(),
    );
    const times = [];
    const span = Math.min(dur, (glideEnd + HOLD) / 1000);
    const from = Math.max(0, glideStart / 1000 - 0.2);
    for (let i = 0; i < 8; i++) times.push(from + ((span - from) * i) / 7);
    const frames = [];
    for (const [i, t] of times.entries()) {
      const f = path.join(frameDir, `f${i}.png`);
      spawnSync(FFMPEG, ['-y', '-loglevel', 'error', '-ss', t.toFixed(2), '-i', mp4, '-frames:v', '1', f]);
      if (fs.existsSync(f)) frames.push({ f, t });
    }
    const w = 360;
    const scaled = await Promise.all(frames.map(({ f }) => sharp(f).resize({ width: w }).toBuffer({ resolveWithObject: true })));
    const h = Math.max(...scaled.map((s) => s.info.height)) + 28;
    await sharp({ create: { width: (w + 8) * frames.length, height: h, channels: 3, background: '#8a8378' } })
      .composite(
        scaled.flatMap((s, i) => [
          { input: label(`${NAME} · t=${frames[i].t.toFixed(2)}s`, w, 28), left: i * (w + 8), top: 0 },
          { input: s.data, left: i * (w + 8), top: 28 },
        ]),
      )
      .jpeg({ quality: 82 })
      .toFile(strip);
    if (!KEEP) fs.rmSync(rawDir, { recursive: true, force: true });
  }
  const meta = { name: NAME, route: ROUTE, theme: THEME, size: SIZE.tag, glideStartMs: glideStart, glideEndMs: glideEnd, totalMs: total, probe: PROBE, elements: report, probeLoad: PROBE_LOAD, loadElements: loadReport };
  fs.writeFileSync(path.join(OUT, `${NAME}.json`), JSON.stringify(meta, null, 2));
  console.log(`[record] ${NAME}: ${mp4} (${(total / 1000).toFixed(1)}s), probe elements: ${report.length ?? 0}`);
} finally {
  await browser.close();
  server.kill('SIGTERM');
}
