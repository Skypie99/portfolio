#!/usr/bin/env node
/**
 * record-motion.mjs — normal-speed recordings of the Release 5 showcase motion
 * from the BUILT site, plus a reduced-motion first-paint check.
 *
 *   npm run build
 *   node qa-reports/release5-showcases-20261020/tools/record-motion.mjs --out <dir> [--routes a,b] [--themes light]
 *        [--size 1440x900] [--rm-check]
 *
 * For each route × theme it records one clip: the page arrives (hero settle),
 * then the viewport scrolls to the evidence chapter at a reading pace and holds
 * while the exhibits reveal and their plinths bloom, then on to the second
 * exhibit. Playwright records the context to WebM; ffmpeg transcodes to MP4
 * and cuts a six-frame strip so the motion can be read without playing it.
 * With --rm-check it also loads the page under prefers-reduced-motion: reduce
 * and compares a 120ms screenshot with a 1600ms screenshot of the chapter:
 * identical pixels mean the composition was complete from first paint.
 * Chromium only (the pre-installed Playwright build); nothing is installed.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
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
const OUT = path.resolve(opt('out', path.join(ROOT, 'qa-reports/release5-showcases-20261020/motion')));
const ROUTES = opt('routes', 'prompt-library,claude-corp,ghost-code,dashboard').split(',');
const THEMES = opt('themes', 'light').split(',');
const [W, H] = opt('size', '1440x900').split('x').map(Number);
const RM_CHECK = args.includes('--rm-check');
// --keep-raw keeps the WebM originals and frame PNGs under <out>/raw.
const PORT = Number(process.env.CAPTURE_PORT || 3106);
const BASE = `http://127.0.0.1:${PORT}`;
const FFMPEG = process.env.FFMPEG || 'ffmpeg';

if (!fs.existsSync(OUT_DIR)) {
  console.error('[motion] out/ is missing: run `npm run build` first.');
  process.exit(2);
}
fs.mkdirSync(OUT, { recursive: true });

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

/** Scroll from the current position to `y` in `steps` even steps over `ms`
 *  (a reading pace, no smooth-scroll dependence), on the page's own clock. */
async function glide(page, y, ms = 1600, steps = 40) {
  await page.evaluate(
    ({ y, ms, steps }) =>
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
    { y, ms, steps },
  );
}

const engine = resolveChromium();
const server = await serve();
const browser = await chromium.launch({ headless: true, executablePath: engine });
const report = [];
try {
  for (const route of ROUTES) {
    for (const theme of THEMES) {
      const tag = `${route}-${theme}-${W}x${H}`;
      const videoDir = path.join(OUT, 'raw', tag);
      fs.mkdirSync(videoDir, { recursive: true });
      const ctx = await browser.newContext({
        viewport: { width: W, height: H },
        deviceScaleFactor: 1,
        colorScheme: theme,
        recordVideo: { dir: videoDir, size: { width: W, height: H } },
      });
      await ctx.addInitScript((t) => {
        try {
          window.localStorage.setItem('theme', t);
        } catch {
          /* storage denied */
        }
      }, theme);
      const page = await ctx.newPage();
      const t0 = Date.now();
      await page.goto(`${BASE}/work/${route}/`, { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForFunction(() => document.documentElement.classList.contains('js'), null, { timeout: 15000 });
      const marks = { arrived: Date.now() - t0 };
      await sleep(1800); // the hero settle (world 900ms, frame 1200ms + 120ms)
      const chapterTop = await page.evaluate(() => {
        const el = document.querySelector('[data-case-showcase]');
        return el ? el.getBoundingClientRect().top + window.scrollY : null;
      });
      if (chapterTop !== null) {
        marks.glideToChapter = Date.now() - t0;
        await glide(page, chapterTop - 40, 1600);
        await sleep(2600); // reveals (900ms depth, stepped) + the plinth bloom (1200ms + 120ms)
        const second = await page.evaluate(() => {
          const items = document.querySelectorAll('[data-case-showcase] ol > li');
          const el = items[1] ?? items[0];
          return el ? el.getBoundingClientRect().top + window.scrollY : null;
        });
        if (second !== null) {
          marks.glideToSecond = Date.now() - t0;
          await glide(page, second - 120, 1400);
          await sleep(2400);
        }
      }
      marks.end = Date.now() - t0;
      const video = page.video();
      await ctx.close();
      const webm = await video.path();
      const mp4 = path.join(OUT, `${tag}.mp4`);
      const strip = path.join(OUT, `${tag}-frames.jpg`);
      const ff = spawnSync(FFMPEG, ['-y', '-loglevel', 'error', '-i', webm, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '27', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4]);
      if (ff.status !== 0) console.error(`[motion] ffmpeg mp4 failed for ${tag}: ${ff.stderr}`);
      // six frames across the clip, side by side, so the motion can be read at a glance
      const probe = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', webm]);
      const duration = Number(String(probe.stdout).trim()) || (marks.end / 1000);
      const times = [0.4, 2.2, 4.0, 5.0, 6.4, Math.max(0.5, duration - 0.3)];
      const frames = [];
      for (const t of times) {
        const f = path.join(videoDir, `frame-${t.toFixed(1)}.png`);
        spawnSync(FFMPEG, ['-y', '-loglevel', 'error', '-ss', String(t), '-i', webm, '-frames:v', '1', f]);
        if (fs.existsSync(f)) frames.push({ t, f });
      }
      if (frames.length) {
        const cw = 480;
        const ch = Math.round((H / W) * cw);
        const tiles = await Promise.all(frames.map(({ f }) => sharp(f).resize(cw, ch).toBuffer()));
        const label = (t) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${cw}" height="28"><rect width="100%" height="100%" fill="#1d1b17"/><text x="10" y="19" font-family="DejaVu Sans Mono, monospace" font-size="14" fill="#f3ede4">${tag} · t = ${t.toFixed(1)} s</text></svg>`);
        await sharp({ create: { width: cw * tiles.length + 8 * (tiles.length - 1), height: ch + 28, channels: 3, background: '#8a8378' } })
          .composite(tiles.flatMap((buf, i) => [
            { input: label(frames[i].t), left: i * (cw + 8), top: 0 },
            { input: buf, left: i * (cw + 8), top: 28 },
          ]))
          .jpeg({ quality: 82 })
          .toFile(strip);
      }
      report.push({ tag, webm: path.relative(ROOT, webm), mp4: path.relative(ROOT, mp4), strip: path.relative(ROOT, strip), durationS: Number(duration.toFixed(2)), marksMs: marks });
      console.log(`[motion] ${tag}: ${duration.toFixed(1)}s · ${path.basename(mp4)} · ${frames.length} frames`);

      if (RM_CHECK) {
        const rm = await browser.newContext({ viewport: { width: W, height: H }, colorScheme: theme, reducedMotion: 'reduce' });
        await rm.addInitScript((t) => {
          try {
            window.localStorage.setItem('theme', t);
          } catch {
            /* storage denied */
          }
        }, theme);
        const p = await rm.newPage();
        await p.goto(`${BASE}/work/${route}/`, { waitUntil: 'load' });
        await p.evaluate(() => document.fonts.ready);
        const top = await p.evaluate(() => {
          const el = document.querySelector('[data-case-showcase]');
          return el ? el.getBoundingClientRect().top + window.scrollY : 0;
        });
        await p.evaluate((y) => window.scrollTo(0, y - 40), top);
        await sleep(120);
        const early = await p.screenshot({ type: 'png' });
        await sleep(1500);
        const late = await p.screenshot({ type: 'png' });
        const a = await sharp(early).raw().toBuffer();
        const b = await sharp(late).raw().toBuffer();
        let diff = 0;
        for (let i = 0; i < a.length; i += 1) if (a[i] !== b[i]) diff += 1;
        const animated = await p.evaluate(() => document.getAnimations().filter((an) => an.playState === 'running').length);
        const hidden = await p.evaluate(() => Array.from(document.querySelectorAll('[data-case-showcase] .reveal')).filter((el) => getComputedStyle(el).opacity !== '1' && getComputedStyle(el).display !== 'none').length);
        await sharp(early).jpeg({ quality: 80 }).toFile(path.join(OUT, `${tag}-rm-120ms.jpg`));
        report[report.length - 1].reducedMotion = { differingBytes: diff, runningAnimations: animated, chapterRevealsNotAtRest: hidden };
        console.log(`[motion] ${tag} reduced motion: ${diff} differing bytes between 120ms and 1620ms · running animations ${animated} · reveals not at rest ${hidden}`);
        await rm.close();
      }
    }
  }
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));
  // The WebM originals and frame PNGs are working files; the MP4, the frame
  // strip and the report are the evidence. Keep them with --keep-raw.
  if (!args.includes('--keep-raw')) fs.rmSync(path.join(OUT, 'raw'), { recursive: true, force: true });
} finally {
  await browser.close();
  server.kill('SIGTERM');
}
