#!/usr/bin/env node
/**
 * capture.mjs — renders and measures the Flagstone Version A three-panel proof
 * row from the BUILT site (`out/`), for the candidate receipt
 * qa-reports/2026-10-19_Flagstone_VersionA_Candidate.md.
 *
 *   npm run build
 *   node qa-reports/flagstone-version-a-20261018/tools/capture.mjs
 *
 * What it does, per theme (light, dark) and viewport (1920×1080 · 1440×900 ·
 * 1280×800 · 1024×768 · 393×852 · 375×667 · 320×568):
 *   · loads /work/flagstone/, waits for fonts + hydration (`html.js`);
 *   · records the VE04 state before the row is scrolled to, then scrolls the
 *     row into view while sampling the window-01 border colour and lifecycle
 *     state on every animation frame (the real ProofArrival beat, not a
 *     prototype), and waits past the 900ms safety bound;
 *   · measures geometry (frames, gaps, grid tracks, article and column
 *     edges), the overflow probe (`scrollWidth` vs `innerWidth`) and an
 *     element census of the proof subtree against the viewport edges;
 *   · verifies click-to-play: nothing plays on load, hydration or viewport
 *     entry; Tab reaches the Play control (count recorded); Enter plays the
 *     real clip; Enter pauses it; the accessible name tracks the state;
 *   · screenshots the viewport at the row and the row itself.
 * Then, at 1440 and 393 in both themes at device scale 2: the Play control at
 * rest and with keyboard focus, with pixel readings (pill body, hairline,
 * focus ring, halo, clip beside the ring) and WCAG contrast ratios, plus the
 * window-01 edge and the neutral frame line. Then the modes: reduced motion,
 * no JavaScript, a theme flip while paused, reload / hash / Back-Forward
 * arrivals, an axe-core pass on the proof block, and the other case studies'
 * proof sections (unchanged presentation) and /tokyo-through-time/.
 *
 * Writes captures/** and measurements.json beside this file, then
 * MEASUREMENTS.md from the same data. No network beyond loopback. Chromium is
 * the pre-installed Playwright build (PLAYWRIGHT_CHROMIUM_EXECUTABLE or
 * $PLAYWRIGHT_BROWSERS_PATH); nothing is installed.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright-core');
const sharp = require('sharp');

const HERE = path.dirname(new URL(import.meta.url).pathname);
const EVIDENCE = path.resolve(HERE, '..');
const ROOT = path.resolve(EVIDENCE, '..', '..');
const OUT = path.join(ROOT, 'out');
const CAPTURES = path.join(EVIDENCE, 'captures');
const PORT = Number(process.env.CAPTURE_PORT || 3017);
const BASE = `http://127.0.0.1:${PORT}`;
const ROUTE = '/work/flagstone/';

const VIEWPORTS = [
  [1920, 1080],
  [1440, 900],
  [1280, 800],
  [1024, 768],
  [393, 852],
  [375, 667],
  [320, 568],
];
const THEMES = ['light', 'dark'];
const JPEG = { type: 'jpeg', quality: 78 };

const ROW = '.proof-breakout';
const FRAME = (n) => `[data-proof-window="${n}"] > div.group`;
const PLAY = '.proof-row [data-themed-motion] > button';
const HOST = '.proof-row [data-themed-motion]';
const EDGE = '.proof-arrival-edge';
const ARRIVAL = '[data-proof-arrival]';

if (!fs.existsSync(OUT)) {
  console.error('[capture] out/ is missing — run `npm run build` first.');
  process.exit(2);
}
for (const d of ['composition', 'row', 'detail', 'modes', 'others', 'boards']) {
  fs.mkdirSync(path.join(CAPTURES, d), { recursive: true });
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
  if (fs.existsSync(base)) {
    const dirs = fs
      .readdirSync(base)
      .filter((d) => /^chromium-\d+$/.test(d))
      .sort((a, b) => Number(b.split('-')[1]) - Number(a.split('-')[1]));
    for (const d of dirs) {
      const p = path.join(base, d, 'chrome-linux', 'chrome');
      if (fs.existsSync(p)) return p;
    }
  }
  return null;
}

function serve() {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(ROOT, 'scripts', 'static-serve.mjs'), OUT, String(PORT)], {
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

/* ---------- colour maths (WCAG 2.x) ---------- */
const lin = (c) => {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
};
const luminance = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
};
const rgbStr = ([r, g, b]) => `rgb(${r} ${g} ${b})`;

/** Median colour over a ring of sample points (CSS px, relative to a crop origin). */
async function samplePng(buffer, points, dpr) {
  const img = sharp(buffer).ensureAlpha().raw();
  const { data, info } = await img.toBuffer({ resolveWithObject: true });
  const px = (x, y) => {
    const ix = Math.min(info.width - 1, Math.max(0, Math.round(x * dpr)));
    const iy = Math.min(info.height - 1, Math.max(0, Math.round(y * dpr)));
    const o = (iy * info.width + ix) * info.channels;
    return [data[o], data[o + 1], data[o + 2]];
  };
  const samples = points.map(([x, y]) => px(x, y));
  const med = (i) => {
    const v = samples.map((s) => s[i]).sort((a, b) => a - b);
    return v[Math.floor(v.length / 2)];
  };
  return [med(0), med(1), med(2)];
}
const ring = (cx, cy, r, n = 24) =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });

/* ---------- page helpers ---------- */
async function load(page, url = BASE + ROUTE, { js = true } = {}) {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  if (js) await page.waitForFunction(() => document.documentElement.classList.contains('js'), null, { timeout: 15000 });
  await sleep(300);
}

/** The site scrolls smoothly, so a box read right after a programmatic
 *  scroll (scrollIntoView, focus) can be stale by the time a crop is taken.
 *  Wait until scrollY holds still for three consecutive readings. */
async function settleScroll(page, { every = 100, max = 3000 } = {}) {
  let last = null, still = 0;
  for (let t = 0; t < max; t += every) {
    await sleep(every);
    const y = await page.evaluate(() => Math.round(window.scrollY * 10) / 10);
    if (y === last) { if (++still >= 2) return y; } else { still = 0; last = y; }
  }
  return last;
}

async function rowTop(page) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    return el ? el.getBoundingClientRect().top + window.scrollY : null;
  }, ROW);
}

/** Scroll the row in while sampling the VE04 beat on every animation frame. */
async function scrollToRowWithTrace(page) {
  await page.evaluate(
    ({ ROW, EDGE, ARRIVAL }) => {
      const el = document.querySelector(ROW);
      const edge = document.querySelector(EDGE);
      const host = document.querySelector(ARRIVAL);
      window.__beat = [];
      const t0 = performance.now();
      const tick = () => {
        window.__beat.push([
          Math.round(performance.now() - t0),
          host ? host.getAttribute('data-proof-arrival') : null,
          edge ? getComputedStyle(edge).borderTopColor : null,
        ]);
        if (performance.now() - t0 < 1600) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 24);
    },
    { ROW, EDGE, ARRIVAL },
  );
  await sleep(1900);
  const beat = await page.evaluate(() => window.__beat || []);
  return summarizeBeat(beat);
}

function summarizeBeat(beat) {
  if (!beat.length) return { samples: 0 };
  const states = [];
  for (const [t, s] of beat) if (!states.length || states[states.length - 1].state !== s) states.push({ t, state: s });
  const settlingAt = states.find((s) => s.state === 'settling')?.t ?? null;
  const settledAt = states.find((s, i) => s.state === 'settled' && i > 0)?.t ?? states.find((s) => s.state === 'settled')?.t ?? null;
  const colours = [];
  if (settlingAt !== null) {
    for (const want of [0, 100, 200, 300, 420, 600, 900]) {
      const s = beat.find(([t]) => t - settlingAt >= want);
      if (s) colours.push({ at: want, t: s[0] - settlingAt, colour: s[2] });
    }
    // first sample whose colour equals the final sample
    const final = beat[beat.length - 1][2];
    const firstFinal = beat.find(([t, , c]) => t >= settlingAt && c === final);
    colours.push({ at: 'final-first-reached', t: firstFinal ? firstFinal[0] - settlingAt : null, colour: final });
  }
  return { samples: beat.length, states, settlingAt, settledAt, colours, first: beat[0], last: beat[beat.length - 1] };
}

async function measure(page) {
  return page.evaluate(
    ({ ROW, PLAY, HOST, EDGE, ARRIVAL }) => {
      const r = (el) => {
        if (!el) return null;
        const b = el.getBoundingClientRect();
        return { x: +b.x.toFixed(1), y: +b.y.toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1), right: +b.right.toFixed(1) };
      };
      const q = (s) => document.querySelector(s);
      const row = q(ROW);
      const ol = q('ol.proof-row');
      const frames = [1, 2, 3].map((n) => q(`[data-proof-window="0${n}"] > div.group`));
      const figures = [1, 2, 3].map((n) => q(`[data-proof-window="0${n}"]`));
      const labels = figures.map((f) => f && f.children[0]);
      const captions = figures.map((f) => f && f.querySelector('figcaption'));
      const article = q('article[aria-label]');
      const column = q('.proof-breakout-root');
      const btn = q(PLAY);
      const host = q(HOST);
      const video = host && host.querySelector('video');
      const well = q('.proof-row .ts-matte-well');
      const edge = q(EDGE);
      const arrival = q(ARRIVAL);
      const cs = (el) => (el ? getComputedStyle(el) : null);
      // census: any element of the proof subtree whose own box crosses a viewport edge
      const crossing = [];
      if (row) {
        for (const el of row.querySelectorAll('*')) {
          if (el.closest('[aria-hidden="true"]') || el.classList.contains('sr-only')) continue;
          const b = el.getBoundingClientRect();
          if (b.width === 0 || b.height === 0) continue;
          // visible box = own rect intersected with every overflow-clipping ancestor
          let left = b.left, right = b.right, p = el.parentElement;
          while (p && p !== document.body) {
            const o = getComputedStyle(p).overflowX;
            if (o === 'hidden' || o === 'clip' || o === 'auto' || o === 'scroll') {
              const pb = p.getBoundingClientRect();
              left = Math.max(left, pb.left);
              right = Math.min(right, pb.right);
            }
            p = p.parentElement;
          }
          if (right - left <= 0) continue;
          if (left < -0.5 || right > window.innerWidth + 0.5) {
            crossing.push({ tag: el.tagName.toLowerCase(), cls: el.className && String(el.className).slice(0, 60), left: +left.toFixed(1), right: +right.toFixed(1) });
          }
        }
      }
      const gaps = [];
      for (let i = 1; i < 3; i++) if (frames[i] && frames[i - 1]) gaps.push(+(frames[i].getBoundingClientRect().left - frames[i - 1].getBoundingClientRect().right).toFixed(1));
      return {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        breakout: r(row),
        breakoutWidthCss: cs(row)?.width,
        list: r(ol),
        gridTemplateColumns: cs(ol)?.gridTemplateColumns,
        columnGap: cs(ol)?.columnGap,
        rowGap: cs(ol)?.rowGap,
        frames: frames.map(r),
        frameAspect: frames.map((f) => (f ? +(f.getBoundingClientRect().width / f.getBoundingClientRect().height).toFixed(3) : null)),
        gapsBetweenFrames: gaps,
        stacked: frames[1] && frames[0] ? frames[1].getBoundingClientRect().top > frames[0].getBoundingClientRect().bottom : null,
        labels: labels.map((l) => (l ? { text: l.textContent.trim(), rect: r(l), font: cs(l).fontSize + ' ' + cs(l).fontFamily.split(',')[0], color: cs(l).color } : null)),
        captions: captions.map((c) => (c ? { lines: Math.round(c.getBoundingClientRect().height / parseFloat(cs(c).lineHeight)), rect: r(c), ruleColor: cs(c).borderTopColor, ruleWidth: cs(c).borderTopWidth, fontSize: cs(c).fontSize, color: cs(c).color } : null)),
        article: r(article),
        articleMaxWidth: cs(article)?.maxWidth,
        column: r(column),
        containerType: cs(column)?.containerType,
        frameBorder: frames.map((f) => (f ? { color: cs(f).borderTopColor, width: cs(f).borderTopWidth, radius: cs(f).borderTopLeftRadius } : null)),
        edgeTransitionDuration: cs(edge)?.transitionDuration,
        arrivalState: arrival ? arrival.getAttribute('data-proof-arrival') : null,
        consumed: (() => { try { return sessionStorage.getItem('w4-06-proof-arrival.v1'); } catch { return 'unavailable'; } })(),
        well: r(well),
        wellInset: well && frames[0] ? { left: +(well.getBoundingClientRect().left - frames[0].getBoundingClientRect().left).toFixed(1), top: +(well.getBoundingClientRect().top - frames[0].getBoundingClientRect().top).toFixed(1), radius: cs(well).borderTopLeftRadius, shadow: cs(well).boxShadow } : null,
        play: btn ? { rect: r(btn), label: btn.getAttribute('aria-label'), bg: cs(btn).backgroundColor, border: cs(btn).borderTopColor, color: cs(btn).color, distanceToFrameRight: frames[0] ? +(frames[0].getBoundingClientRect().right - btn.getBoundingClientRect().right).toFixed(1) : null, distanceToFrameBottom: frames[0] ? +(frames[0].getBoundingClientRect().bottom - btn.getBoundingClientRect().bottom).toFixed(1) : null } : null,
        motion: host ? host.getAttribute('data-motion') : null,
        video: video ? { paused: video.paused, currentTime: +video.currentTime.toFixed(3), preload: video.preload, autoplayAttr: video.hasAttribute('autoplay'), controlsAttr: video.hasAttribute('controls'), muted: video.muted, loop: video.loop, readyState: video.readyState, currentSrc: video.currentSrc.split('/').pop() } : null,
        crossing,
        theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
        js: document.documentElement.classList.contains('js'),
      };
    },
    { ROW, PLAY, HOST, EDGE, ARRIVAL },
  );
}

async function tabToPlay(page, max = 400) {
  for (let i = 1; i <= max; i++) {
    await page.keyboard.press('Tab');
    const hit = await page.evaluate((sel) => {
      const a = document.activeElement;
      return a && a.matches(sel) ? { focusVisible: a.matches(':focus-visible') } : null;
    }, PLAY);
    if (hit) return { tabs: i, ...hit };
  }
  return { tabs: null, focusVisible: false };
}

async function playState(page) {
  return page.evaluate((HOST) => {
    const host = document.querySelector(HOST);
    const v = host.querySelector('video');
    const b = host.querySelector(':scope > button');
    return { paused: v.paused, currentTime: +v.currentTime.toFixed(3), motion: host.getAttribute('data-motion'), label: b && b.getAttribute('aria-label'), readyState: v.readyState, src: v.currentSrc.split('/').pop() };
  }, HOST);
}

async function focusStyles(page) {
  return page.evaluate((PLAY) => {
    const b = document.querySelector(PLAY);
    const s = getComputedStyle(b);
    return { outline: `${s.outlineWidth} ${s.outlineStyle} ${s.outlineColor}`, outlineOffset: s.outlineOffset, boxShadow: s.boxShadow, focusVisible: b.matches(':focus-visible'), active: document.activeElement === b };
  }, PLAY);
}

/* ---------- main ---------- */
const exe = resolveChromium();
if (!exe) {
  console.error('[capture] no Chromium found. Set PLAYWRIGHT_CHROMIUM_EXECUTABLE.');
  process.exit(2);
}
const server = await serve();
const browser = await chromium.launch({ executablePath: exe, headless: true });
const results = {
  generated: new Date().toISOString(),
  chromium: browser.version(),
  route: ROUTE,
  compositions: [],
  playControl: [],
  edges: [],
  modes: {},
  arrivals: {},
  axe: [],
  others: [],
};

try {
  /* 1 · compositions, geometry, click-to-play at every viewport × theme */
  for (const theme of THEMES) {
    for (const [w, h] of VIEWPORTS) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: theme, deviceScaleFactor: 1 });
      const page = await ctx.newPage();
      await load(page);
      const before = await page.evaluate(({ ARRIVAL, HOST }) => {
        const a = document.querySelector(ARRIVAL);
        const host = document.querySelector(HOST);
        const v = host && host.querySelector('video');
        return { arrival: a && a.getAttribute('data-proof-arrival'), motion: host && host.getAttribute('data-motion'), paused: v ? v.paused : null, belowFold: a ? a.getBoundingClientRect().top > window.innerHeight : null };
      }, { ARRIVAL, HOST });
      const beat = await scrollToRowWithTrace(page);
      const m = await measure(page);
      const tag = `${theme}_${w}x${h}`;
      await page.screenshot({ path: path.join(CAPTURES, 'composition', `comp_${tag}.jpg`), ...JPEG });
      await page.locator(ROW).screenshot({ path: path.join(CAPTURES, 'row', `row_${tag}.jpg`), ...JPEG });

      // click-to-play: keyboard path
      const atRest = await playState(page);
      const tab = await tabToPlay(page);
      const focus = tab.tabs ? await focusStyles(page) : null;
      await page.keyboard.press('Enter');
      await sleep(1100);
      const afterEnter = await playState(page);
      await page.keyboard.press('Enter');
      await sleep(250);
      const afterSecondEnter = await playState(page);
      // pointer resume + pause
      await page.locator(PLAY).click();
      await sleep(700);
      const afterClick = await playState(page);
      await page.locator(PLAY).click();
      await sleep(200);
      const afterSecondClick = await playState(page);

      results.compositions.push({ theme, viewport: [w, h], before, beat, measure: m, keyboard: { atRest, tab, focus, afterEnter, afterSecondEnter, afterClick, afterSecondClick } });
      await ctx.close();
      console.log(`[capture] ${tag}: frames ${m.frames.map((f) => f && `${f.w}×${f.h}@${f.x}`).join(' · ')} · gaps ${m.gapsBetweenFrames.join('/')} · stacked ${m.stacked} · overflow ${m.scrollWidth}/${m.innerWidth} · crossing ${m.crossing.length} · tabs ${tab.tabs} · play ${!afterEnter.paused}`);
    }
  }

  /* 2 · Play control at rest + keyboard focus, pixel readings, DPR 2 */
  for (const theme of THEMES) {
    for (const [w, h] of [[1440, 900], [393, 852]]) {
      const dpr = 2;
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: theme, deviceScaleFactor: dpr });
      const page = await ctx.newPage();
      await load(page);
      await scrollToRowWithTrace(page);
      await settleScroll(page);
      const m = await measure(page);
      const b = m.play.rect;
      const pad = 40;
      // Whole-pixel crop origins: a fractional origin would shift every
      // sample by up to one CSS pixel against the 1–2px bands being read.
      const clip = { x: Math.max(0, Math.floor(b.x - pad)), y: Math.max(0, Math.floor(b.y - pad)), width: Math.ceil(b.w + pad * 2) + 1, height: Math.ceil(b.h + pad * 2) + 1 };
      const cx = b.x + b.w / 2 - clip.x;
      const cy = b.y + b.h / 2 - clip.y;
      const restPng = await page.screenshot({ clip, type: 'png' });
      fs.writeFileSync(path.join(CAPTURES, 'detail', `play_rest_${theme}_${w}.png`), restPng);
      const rest = {
        body: await samplePng(restPng, ring(cx, cy, 17), dpr),
        hairline: await samplePng(restPng, ring(cx, cy, 21.4), dpr),
        clipBeside: await samplePng(restPng, ring(cx, cy, 25), dpr),
        clipFar: await samplePng(restPng, ring(cx, cy, 31), dpr),
        icon: await samplePng(restPng, [[cx + 1.5, cy], [cx + 0.5, cy - 2], [cx + 0.5, cy + 2], [cx - 1, cy]], dpr),
      };
      const tab = await tabToPlay(page);
      await settleScroll(page);
      const fstyles = await focusStyles(page);
      // the focused element may have been scrolled; re-measure
      const m2 = await measure(page);
      const b2 = m2.play.rect;
      const clip2 = { x: Math.max(0, Math.floor(b2.x - pad)), y: Math.max(0, Math.floor(b2.y - pad)), width: Math.ceil(b2.w + pad * 2) + 1, height: Math.ceil(b2.h + pad * 2) + 1 };
      const cx2 = b2.x + b2.w / 2 - clip2.x;
      const cy2 = b2.y + b2.h / 2 - clip2.y;
      const focusPng = await page.screenshot({ clip: clip2, type: 'png' });
      fs.writeFileSync(path.join(CAPTURES, 'detail', `play_focus_${theme}_${w}.png`), focusPng);
      const focused = {
        body: await samplePng(focusPng, ring(cx2, cy2, 17), dpr),
        hairline: await samplePng(focusPng, ring(cx2, cy2, 21.4), dpr),
        halo: await samplePng(focusPng, ring(cx2, cy2, 23), dpr),
        ring: await samplePng(focusPng, ring(cx2, cy2, 25), dpr),
        clipBeside: await samplePng(focusPng, ring(cx2, cy2, 27.5), dpr),
        clipFar: await samplePng(focusPng, ring(cx2, cy2, 33), dpr),
      };
      const ratios = {
        rest: {
          'hairline : clip beside': contrast(rest.hairline, rest.clipBeside),
          'hairline : pill body': contrast(rest.hairline, rest.body),
          'pill body : clip beside': contrast(rest.body, rest.clipBeside),
          'icon : pill body': contrast(rest.icon, rest.body),
        },
        focused: {
          'ring : halo (inner side)': contrast(focused.ring, focused.halo),
          'ring : clip beside (outer side)': contrast(focused.ring, focused.clipBeside),
          'halo : clip beside': contrast(focused.halo, focused.clipBeside),
          'halo : pill hairline': contrast(focused.halo, focused.hairline),
        },
      };
      // window-01 edge + neutral frame line + caption rule. Each target is
      // scrolled into view first: at phone widths windows 02/03 sit below the
      // fold once window 01 is framed, and a viewport clip cannot reach them.
      const cornerOf = async (selector) => {
        const loc = page.locator(selector).first();
        await loc.scrollIntoViewIfNeeded();
        await settleScroll(page);
        const bb = await loc.boundingBox();
        const clip = { x: Math.max(0, Math.floor(bb.x - 12)), y: Math.max(0, Math.floor(bb.y - 12)), width: 73, height: 73 };
        const png = await page.screenshot({ clip, type: 'png' });
        const ox = bb.x - clip.x, oy = bb.y - clip.y; // element origin inside the crop
        return { png, ox, oy };
      };
      // A 1px border at a fractional element top paints on device rows
      // floor(top·dpr) and floor(top·dpr)+1; sample the second row exactly.
      const borderRow = (oy) => (Math.floor(oy * dpr) + 1) / dpr;
      const e1 = await cornerOf(FRAME('01'));
      fs.writeFileSync(path.join(CAPTURES, 'detail', `edge_w01_${theme}_${w}.png`), e1.png);
      const edgeColour = await samplePng(e1.png, Array.from({ length: 20 }, (_, i) => [e1.ox + 20 + i, borderRow(e1.oy)]), dpr);
      const surfaceBeside = await samplePng(e1.png, Array.from({ length: 20 }, (_, i) => [e1.ox + 20 + i, e1.oy - 4]), dpr);
      const e2 = await cornerOf(FRAME('02'));
      const neutralColour = await samplePng(e2.png, Array.from({ length: 20 }, (_, i) => [e2.ox + 20 + i, borderRow(e2.oy)]), dpr);
      const capLoc = page.locator('[data-proof-window="02"] figcaption').first();
      await capLoc.scrollIntoViewIfNeeded();
      await settleScroll(page);
      const cap = await capLoc.boundingBox();
      const capClip = { x: Math.floor(cap.x), y: Math.max(0, Math.floor(cap.y - 4)), width: 60, height: 11 };
      const capPng = await page.screenshot({ clip: capClip, type: 'png' });
      const ruleColour = await samplePng(capPng, Array.from({ length: 20 }, (_, i) => [20 + i, borderRow(cap.y - capClip.y)]), dpr);
      results.playControl.push({ theme, viewport: [w, h], dpr, tabsToReach: tab.tabs, focusVisible: tab.focusVisible, focusStyles: fstyles, buttonRect: b2, pill: { rest, focused }, ratios, computed: m2.play });
      results.edges.push({
        theme,
        viewport: [w, h],
        windowOneEdge: rgbStr(edgeColour),
        neutralFrameLine: rgbStr(neutralColour),
        captionRule: rgbStr(ruleColour),
        surfaceBeside: rgbStr(surfaceBeside),
        'edge : surface': contrast(edgeColour, surfaceBeside),
        'neutral line : surface': contrast(neutralColour, surfaceBeside),
        computedEdge: m2.frameBorder[0],
        computedNeutral: m2.frameBorder[1],
        computedRule: m2.captions[1].ruleColor,
        arrivalState: m2.arrivalState,
      });
      await ctx.close();
      console.log(`[capture] play ${theme} ${w}: tabs ${tab.tabs} · ring:halo ${ratios.focused['ring : halo (inner side)']} · ring:clip ${ratios.focused['ring : clip beside (outer side)']} · hairline:clip ${ratios.rest['hairline : clip beside']} · edge ${rgbStr(edgeColour)}`);
    }
  }

  /* 3 · modes */
  for (const theme of THEMES) {
    // reduced motion
    {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: theme, reducedMotion: 'reduce' });
      const page = await ctx.newPage();
      await load(page);
      const atHydration = await page.evaluate(({ ARRIVAL, EDGE }) => {
        const a = document.querySelector(ARRIVAL);
        const e = document.querySelector(EDGE);
        return { arrival: a.getAttribute('data-proof-arrival'), edge: getComputedStyle(e).borderTopColor, transition: getComputedStyle(e).transitionProperty + ' ' + getComputedStyle(e).transitionDuration };
      }, { ARRIVAL, EDGE });
      const beat = await scrollToRowWithTrace(page);
      const inView = await playState(page);
      await page.locator(PLAY).click();
      await sleep(1000);
      const afterClick = await playState(page);
      await page.locator(PLAY).click();
      await page.screenshot({ path: path.join(CAPTURES, 'modes', `rm_${theme}_1440.jpg`), ...JPEG });
      results.modes[`reducedMotion_${theme}`] = { atHydration, beat, inView, afterDeliberatePlay: afterClick };
      await ctx.close();
    }
    // theme flip while paused (system preference change → next-themes class flip)
    {
      const from = theme, to = theme === 'light' ? 'dark' : 'light';
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: from });
      const page = await ctx.newPage();
      await load(page);
      await scrollToRowWithTrace(page);
      const beforeFlip = { ...(await playState(page)), theme: await page.evaluate(() => (document.documentElement.classList.contains('dark') ? 'dark' : 'light')) };
      const edgeBefore = await page.evaluate((EDGE) => getComputedStyle(document.querySelector(EDGE)).borderTopColor, EDGE);
      await page.emulateMedia({ colorScheme: to });
      await sleep(900);
      const afterFlip = { ...(await playState(page)), theme: await page.evaluate(() => (document.documentElement.classList.contains('dark') ? 'dark' : 'light')) };
      const edgeAfter = await page.evaluate((EDGE) => getComputedStyle(document.querySelector(EDGE)).borderTopColor, EDGE);
      const playAfter = await page.evaluate((PLAY) => { const b = document.querySelector(PLAY); const s = getComputedStyle(b); return { bg: s.backgroundColor, border: s.borderTopColor }; }, PLAY);
      results.modes[`themeFlip_${from}_to_${to}`] = { beforeFlip, afterFlip, edgeBefore, edgeAfter, playAfter };
      await ctx.close();
    }
  }
  // no JavaScript
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'light', javaScriptEnabled: false });
    const page = await ctx.newPage();
    await load(page, BASE + ROUTE, { js: false });
    const y = await rowTop(page);
    await page.evaluate((y) => window.scrollTo(0, y - 24), y);
    await sleep(400);
    const nojs = await page.evaluate(({ ARRIVAL, EDGE, HOST }) => {
      const a = document.querySelector(ARRIVAL);
      const e = document.querySelector(EDGE);
      const host = document.querySelector(HOST);
      const v = host.querySelector('video');
      return { js: document.documentElement.classList.contains('js'), arrivalAttr: a.getAttribute('data-proof-arrival'), edgePainted: getComputedStyle(e).borderTopColor, nativeControls: v.hasAttribute('controls'), overlayButton: !!host.querySelector(':scope > button'), autoplayAttr: v.hasAttribute('autoplay'), paused: v.paused };
    }, { ARRIVAL, EDGE, HOST });
    await page.screenshot({ path: path.join(CAPTURES, 'modes', 'nojs_light_1440.jpg'), ...JPEG });
    results.modes.noJavaScript_light = nojs;
    await ctx.close();
  }

  /* 4 · arrival clauses on the real page: reload, hash, Back/Forward */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'light' });
    const page = await ctx.newPage();
    await load(page);
    const first = await page.evaluate((ARRIVAL) => document.querySelector(ARRIVAL).getAttribute('data-proof-arrival'), ARRIVAL);
    await scrollToRowWithTrace(page);
    const consumed = await page.evaluate(() => sessionStorage.getItem('w4-06-proof-arrival.v1'));
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.documentElement.classList.contains('js'));
    await sleep(300);
    const afterReload = await page.evaluate((ARRIVAL) => ({ state: document.querySelector(ARRIVAL).getAttribute('data-proof-arrival'), navType: performance.getEntriesByType('navigation')[0]?.type }), ARRIVAL);
    await page.goto(BASE + '/work/', { waitUntil: 'networkidle' });
    await page.goBack({ waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.documentElement.classList.contains('js'));
    await sleep(300);
    const afterBack = await page.evaluate((ARRIVAL) => ({ state: document.querySelector(ARRIVAL).getAttribute('data-proof-arrival'), navType: performance.getEntriesByType('navigation')[0]?.type }), ARRIVAL);
    await ctx.close();
    const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'light' });
    const page2 = await ctx2.newPage();
    await page2.goto(BASE + ROUTE + '#the-approach', { waitUntil: 'load' });
    const hashAtLoad = await page2.evaluate(() => ({ hash: location.hash, seat: document.documentElement.classList.contains('reveal-seat'), js: document.documentElement.classList.contains('js') }));
    await page2.waitForFunction(() => document.documentElement.classList.contains('js'));
    await sleep(600);
    const hash = await page2.evaluate((ARRIVAL) => {
      const a = document.querySelector(ARRIVAL);
      const r = a.getBoundingClientRect();
      return { state: a.getAttribute('data-proof-arrival'), hashAfterHydration: location.hash, hostTop: Math.round(r.top), hostBottom: Math.round(r.bottom), innerHeight: window.innerHeight, target: !!document.querySelector('#the-approach') };
    }, ARRIVAL);
    await ctx2.close();
    Object.assign(hash, { hashAtLoad });
    results.arrivals = { firstVisitBeforeScroll: first, consumedAfterTrigger: consumed, afterReload, afterBack, hashArrival: hash };
  }

  /* 5 · axe-core on the proof block */
  const axePath = path.join(ROOT, 'node_modules', 'axe-core', 'axe.min.js');
  if (fs.existsSync(axePath)) {
    for (const theme of THEMES) {
      for (const [w, h] of [[1440, 900], [393, 852]]) {
        const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: theme });
        const page = await ctx.newPage();
        await load(page);
        await scrollToRowWithTrace(page);
        await page.addScriptTag({ path: axePath });
        const axe = await page.evaluate(async (ROW) => {
          const r = await window.axe.run(document.querySelector(ROW), {
            runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] },
          });
          const slim = (list) => list.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.map((n) => n.target.join(' ')).slice(0, 6) }));
          return { version: window.axe.version, violations: slim(r.violations), incomplete: slim(r.incomplete), passes: r.passes.length };
        }, ROW);
        results.axe.push({ theme, viewport: [w, h], ...axe });
        await ctx.close();
        console.log(`[capture] axe ${theme} ${w}: ${axe.violations.length} violations, ${axe.incomplete.length} incomplete, ${axe.passes} passes`);
      }
    }
  }

  /* 6 · other case studies + Tokyo: unchanged presentation */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'light' });
    const page = await ctx.newPage();
    for (const slug of ['dashboard', 'ghost-code', 'claude-corp']) {
      await load(page, `${BASE}/work/${slug}/`);
      const info = await page.evaluate(() => {
        const block = document.querySelector('[aria-label$=" product evidence"]');
        if (!block) return { present: false };
        block.scrollIntoView({ block: 'start' });
        window.scrollBy(0, -24);
        const list = block.querySelector('ul, ol');
        const host = block.querySelector('[data-themed-motion]');
        return { present: true, listTag: list && list.tagName, proofRow: !!block.querySelector('.proof-row'), breakout: block.classList.contains('proof-breakout'), gridTemplateColumns: list && getComputedStyle(list).gridTemplateColumns, items: list && list.children.length, labelsAboveMedia: block.querySelector('figure > p:first-child') !== null, motion: host && host.getAttribute('data-motion') };
      });
      await sleep(1200);
      await page.locator('[aria-label$=" product evidence"]').screenshot({ path: path.join(CAPTURES, 'others', `${slug}_light_1440.jpg`), ...JPEG });
      results.others.push({ slug, ...info });
    }
    await load(page, `${BASE}/tokyo-through-time/`);
    await sleep(800);
    const tokyo = await page.evaluate(() => ({ title: document.title, videos: document.querySelectorAll('video').length, proofRow: !!document.querySelector('.proof-row') }));
    await page.screenshot({ path: path.join(CAPTURES, 'others', 'tokyo-through-time_light_1440.jpg'), ...JPEG });
    results.others.push({ slug: 'tokyo-through-time', ...tokyo });
    await ctx.close();
  }
} finally {
  await browser.close();
  server.kill('SIGTERM');
}

/* 7 · boards (owner review): desktop light over dark; phones; play control */
async function board(files, out, { cols, gap = 24, bg = '#ffffff', label = true }) {
  const imgs = [];
  for (const f of files) {
    if (!fs.existsSync(f.path)) continue;
    const meta = await sharp(f.path).metadata();
    imgs.push({ ...f, meta });
  }
  if (!imgs.length) return;
  const cellW = Math.max(...imgs.map((i) => i.meta.width));
  const cellH = Math.max(...imgs.map((i) => i.meta.height));
  const labelH = label ? 28 : 0;
  const rows = Math.ceil(imgs.length / cols);
  const W = cols * cellW + (cols + 1) * gap;
  const H = rows * (cellH + labelH) + (rows + 1) * gap;
  const composites = [];
  imgs.forEach((im, i) => {
    const c = i % cols, r = Math.floor(i / cols);
    const left = gap + c * (cellW + gap);
    const top = gap + r * (cellH + labelH + gap) + labelH;
    composites.push({ input: im.path, left, top });
    if (label) {
      const svg = Buffer.from(`<svg width="${cellW}" height="${labelH}" xmlns="http://www.w3.org/2000/svg"><text x="0" y="19" font-family="monospace" font-size="15" fill="#444">${im.label}</text></svg>`);
      composites.push({ input: svg, left, top: top - labelH });
    }
  });
  const ext = path.extname(out).toLowerCase();
  const base = sharp({ create: { width: W, height: H, channels: 3, background: bg } }).composite(composites);
  if (ext === '.png') await base.png().toFile(out);
  else await base.jpeg({ quality: 80 }).toFile(out);
}
const cap = (...p) => path.join(CAPTURES, ...p);
await board(
  [
    { path: cap('row', 'row_light_1440x900.jpg'), label: 'Version A · light · 1440 × 900 (row crop)' },
    { path: cap('row', 'row_dark_1440x900.jpg'), label: 'Version A · dark · 1440 × 900 (row crop)' },
  ],
  cap('boards', 'desktop_light-over-dark_1440.jpg'),
  { cols: 1 },
);
for (const theme of THEMES) {
  await board(
    [393, 375, 320].map((w) => ({ path: cap('composition', `comp_${theme}_${w}x${[852, 667, 568][[393, 375, 320].indexOf(w)]}.jpg`), label: `${theme} · ${w} wide` })),
    cap('boards', `phones_${theme}.jpg`),
    { cols: 3, bg: theme === 'dark' ? '#111' : '#fff' },
  );
  await board(
    [
      { path: cap('detail', `play_rest_${theme}_1440.png`), label: `${theme} · 1440 · rest (2×)` },
      { path: cap('detail', `play_focus_${theme}_1440.png`), label: `${theme} · 1440 · keyboard focus (2×)` },
      { path: cap('detail', `play_rest_${theme}_393.png`), label: `${theme} · 393 · rest (2×)` },
      { path: cap('detail', `play_focus_${theme}_393.png`), label: `${theme} · 393 · keyboard focus (2×)` },
    ],
    cap('boards', `play-control_${theme}.png`),
    { cols: 4, bg: theme === 'dark' ? '#111' : '#fff' },
  );
}

fs.writeFileSync(path.join(EVIDENCE, 'measurements.json'), JSON.stringify(results, null, 2));

/* 8 · MEASUREMENTS.md from the same data */
const md = [];
md.push('# Measurements · Flagstone Version A candidate', '');
md.push(`Generated ${results.generated} by \`tools/capture.mjs\` from the built \`out/\` served over loopback. Renderer: Chromium ${results.chromium} (pre-installed Playwright build). Every value below is read off the real Next.js page, not a prototype. Pixel readings are medians over 24 samples at device scale 2. Contrast is WCAG 2.x relative-luminance contrast.`, '');
md.push('## 1. Geometry, overflow and click-to-play per viewport', '');
md.push('| Theme | Viewport | Frames (w × h @ x) | Gaps | Stacked | Grid tracks | Row width | scrollWidth / innerWidth | Edge-crossing elements | VE04 before scroll → trace | Tabs to Play | Enter plays → Enter pauses | Clip |');
md.push('|---|---|---|---|---|---|---|---|---|---|---|---|---|');
for (const c of results.compositions) {
  const m = c.measure;
  const frames = m.frames.map((f) => (f ? `${f.w}×${f.h} @ ${f.x}` : '—')).join(' · ');
  const st = c.beat.states ? c.beat.states.map((s) => `${s.state}@${s.t}ms`).join(' → ') : 'n/a';
  const k = c.keyboard;
  md.push(`| ${c.theme} | ${c.viewport.join('×')} | ${frames} | ${m.gapsBetweenFrames.join(' / ') || '—'} | ${m.stacked} | ${m.gridTemplateColumns} | ${m.breakout?.w} | ${m.scrollWidth} / ${m.innerWidth} | ${m.crossing.length} | ${c.before.arrival} → ${st} | ${k.tab.tabs ?? 'not reached'} (focus-visible ${k.tab.focusVisible}) | ${k.atRest.paused ? 'paused at rest' : 'PLAYING AT REST'} → ${!k.afterEnter.paused ? `playing (t=${k.afterEnter.currentTime}s, "${k.afterEnter.label.split(':')[0]}")` : 'DID NOT PLAY'} → ${k.afterSecondEnter.paused ? 'paused' : 'STILL PLAYING'} | ${k.afterEnter.src} |`);
}
md.push('', 'Beat trace columns: the first sample of each lifecycle state relative to the moment the scroll was issued. The 900ms safety flip to `settled` is the ProofArrival timer; the colour reaches its rest value earlier (see §2).', '');
md.push('## 2. VE04 beat colour samples (window 01 border, computed, every animation frame)', '');
md.push('| Theme | Viewport | at 0 | 100 | 200 | 300 | 420 | 600 | 900 ms after `settling` | Final value first reached |');
md.push('|---|---|---|---|---|---|---|---|---|---|');
for (const c of results.compositions) {
  if (!c.beat.colours) continue;
  const by = Object.fromEntries(c.beat.colours.map((x) => [String(x.at), x]));
  md.push(`| ${c.theme} | ${c.viewport.join('×')} | ${['0', '100', '200', '300', '420', '600', '900'].map((k) => (by[k] ? by[k].colour : '—')).join(' | ')} | ${by['final-first-reached'] ? `${by['final-first-reached'].t} ms` : '—'} |`);
}
md.push('', '## 3. Play control: pixel readings and contrast', '');
md.push('| Theme | Viewport | Tabs | :focus-visible | Computed outline / halo | Rest: hairline : clip | hairline : body | body : clip | icon : body | Focus: ring : halo | ring : clip | halo : clip | Button rect | Pill → frame edge (right, bottom) |');
md.push('|---|---|---|---|---|---|---|---|---|---|---|---|---|---|');
for (const p of results.playControl) {
  md.push(`| ${p.theme} | ${p.viewport.join('×')} | ${p.tabsToReach} | ${p.focusVisible} | ${p.focusStyles.outline}, offset ${p.focusStyles.outlineOffset}; ${p.focusStyles.boxShadow} | ${p.ratios.rest['hairline : clip beside']} | ${p.ratios.rest['hairline : pill body']} | ${p.ratios.rest['pill body : clip beside']} | ${p.ratios.rest['icon : pill body']} | **${p.ratios.focused['ring : halo (inner side)']}** | ${p.ratios.focused['ring : clip beside (outer side)']} | ${p.ratios.focused['halo : clip beside']} | ${p.buttonRect.w}×${p.buttonRect.h} | ${p.computed.distanceToFrameRight}, ${p.computed.distanceToFrameBottom} |`);
}
md.push('', 'Sampled colours (median rgb):', '');
md.push('| Theme | Viewport | Pill body | Hairline | Ring | Halo | Clip beside ring | Clip beside pill (rest) |');
md.push('|---|---|---|---|---|---|---|---|');
for (const p of results.playControl) {
  md.push(`| ${p.theme} | ${p.viewport.join('×')} | ${rgbStr(p.pill.rest.body)} | ${rgbStr(p.pill.rest.hairline)} | ${rgbStr(p.pill.focused.ring)} | ${rgbStr(p.pill.focused.halo)} | ${rgbStr(p.pill.focused.clipBeside)} | ${rgbStr(p.pill.rest.clipBeside)} |`);
}
md.push('', '## 4. Window-01 edge, neutral frame line, caption rule (settled rest state)', '');
md.push('| Theme | Viewport | Window 01 edge (pixel) | Computed | Neutral line (window 02) | Caption rule | Surface beside | Edge : surface | Neutral : surface | State |');
md.push('|---|---|---|---|---|---|---|---|---|---|');
for (const e of results.edges) {
  md.push(`| ${e.theme} | ${e.viewport.join('×')} | ${e.windowOneEdge} | ${e.computedEdge.color} ${e.computedEdge.width} r${e.computedEdge.radius} | ${e.neutralFrameLine} (${e.computedNeutral.color}) | ${e.captionRule} (${e.computedRule}) | ${e.surfaceBeside} | ${e['edge : surface']} | ${e['neutral line : surface']} | ${e.arrivalState} |`);
}
md.push('', '## 5. Modes', '');
for (const [k, v] of Object.entries(results.modes)) md.push(`- **${k}**: \`${JSON.stringify(v)}\``);
md.push('', '## 6. Arrival clauses on the real page', '', '```json', JSON.stringify(results.arrivals, null, 2), '```', '');
md.push('## 7. axe-core on the proof block', '');
for (const a of results.axe) {
  md.push(`- ${a.theme} ${a.viewport.join('×')} (axe ${a.version}): **${a.violations.length} violations**, ${a.incomplete.length} incomplete, ${a.passes} rules passed.`);
  for (const v of a.violations) md.push(`  - violation \`${v.id}\` (${v.impact}): ${v.help} — ${v.nodes.join('; ')}`);
  for (const v of a.incomplete) md.push(`  - incomplete \`${v.id}\`: ${v.help} — ${v.nodes.join('; ')}`);
}
md.push('', '## 8. Other case studies and the Tokyo route', '');
for (const o of results.others) md.push(`- \`${o.slug}\`: \`${JSON.stringify(o)}\``);
md.push('', '## 9. Files', '');
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
for (const f of walk(CAPTURES).sort()) md.push(`- \`${path.relative(EVIDENCE, f)}\` (${(fs.statSync(f).size / 1024).toFixed(0)} KB)`);
fs.writeFileSync(path.join(EVIDENCE, 'MEASUREMENTS.md'), md.join('\n') + '\n');
console.log('[capture] done →', path.relative(ROOT, EVIDENCE));
