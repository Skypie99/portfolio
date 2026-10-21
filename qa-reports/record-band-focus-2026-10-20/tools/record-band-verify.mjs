#!/usr/bin/env node
/**
 * record-band-verify.mjs — supplementary verification for the Record-band
 * keyboard-focus repair: axe-core over the home page and scoped to the band,
 * a rendered-focus check (ring + full-opacity rows + focus screenshots),
 * text-only 200% enlargement, and 320px narrow reflow of the band.
 *
 *   node record-band-verify.mjs --dir <export dir> --out <dir> \
 *     [--themes light,dark] [--sizes 1440x900@1,393x852@2]
 *
 * Serves over loopback only; nothing leaves the machine. Engine: the
 * pre-installed Playwright Chromium (NOT Safari/WebKit, NOT physical-device
 * testing).
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright-core');
const AXE_SRC = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const AXE_VERSION = require('axe-core/package.json').version;

const argv = process.argv.slice(2);
const opt = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? def : argv[i + 1];
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const DIR = path.resolve(opt('dir', 'out'));
const OUT = path.resolve(opt('out'));
const SIZES = opt('sizes', '1440x900@1,393x852@2')
  .split(',')
  .map((t) => {
    const m = /^(\d+)x(\d+)(?:@([\d.]+))?$/.exec(t);
    if (!m) throw new Error(`bad size ${t}`);
    return { w: Number(m[1]), h: Number(m[2]), dpr: Number(m[3] || 1), tag: t };
  });
const THEMES = opt('themes', 'light,dark').split(',');
const PORT = Number(opt('port', 3271));
const BASE = `http://127.0.0.1:${PORT}`;
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..', '..');
fs.mkdirSync(OUT, { recursive: true });

const HREFS = ['/colophon/#calibration', '/work/flagstone/#what-went-wrong', '/accessibility/', '/accessibility/#receipts'];
const LINK_TEXT = ['the record', 'the account', 'the statement', 'evidence'];

function resolveChromium() {
  const override = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
  if (override && fs.existsSync(override)) return override;
  try {
    const p = chromium.executablePath();
    if (p && fs.existsSync(p)) return p;
  } catch {
    /* fall through */
  }
  return null;
}

function serve(dir, port) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(ROOT, 'scripts', 'static-serve.mjs'), dir, String(port)], {
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

async function makeContext(browser, { w, h, dpr, theme }) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: h },
    deviceScaleFactor: dpr,
    colorScheme: theme,
    ...(w < 600 ? { isMobile: true, hasTouch: true } : {}),
  });
  await ctx.addInitScript(
    (t) => {
      try {
        window.localStorage.setItem('theme', t);
      } catch {
        /* storage denied */
      }
    },
    theme,
  );
  return ctx;
}

async function load(page, url) {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => document.documentElement.classList.contains('js'), null, { timeout: 15000 });
  await sleep(400);
}

async function scrollThrough(page) {
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  const vh = await page.evaluate(() => window.innerHeight);
  for (let y = 0; y < total; y += Math.round(vh * 0.6)) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await sleep(120);
  }
  await sleep(400);
}

const engine = resolveChromium();
if (!engine) {
  console.error('[record-band-verify] no resolvable Chromium');
  process.exit(2);
}
const server = await serve(DIR, PORT);
const browser = await chromium.launch({ headless: true, executablePath: engine });
const report = {
  meta: { tool: 'record-band-verify.mjs', axe: AXE_VERSION, engine: 'Chromium headless — NOT Safari/WebKit', at: new Date().toISOString(), dir: DIR },
  runs: [],
};
try {
  for (const size of SIZES) {
    for (const theme of THEMES) {
      const ctx = await makeContext(browser, { ...size, theme });
      const page = await ctx.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(String(e)));
      const run = { size: size.tag, theme, errors };

      await load(page, BASE + '/');
      await scrollThrough(page);

      // ── axe: whole document, then scoped to the Record band.
      await page.addScriptTag({ content: AXE_SRC });
      const axeRun = async (context) =>
        page.evaluate(
          async ({ context }) => {
            const r = await window.axe.run(context, {
              runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] },
            });
            return {
              violations: r.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.map((n) => ({ target: n.target, html: n.html.slice(0, 160) })) })),
              passes: r.passes.length,
            };
          },
          { context },
        );
      run.axe = { document: await axeRun('html'), recordBand: await axeRun('#record') };

      // ── Rendered focus: real Tab into each row link; ring + opacity + shot.
      run.focusStops = [];
      for (let li = 0; li < HREFS.length; li++) {
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.focus('#work ol h3 a');
        for (let i = 0; i < 60; i++) {
          const href = await page.evaluate(() => document.activeElement && document.activeElement.getAttribute && document.activeElement.getAttribute('href'));
          if (href === HREFS[li]) break;
          await page.keyboard.press('Tab');
          await sleep(40);
        }
        const state = await page.evaluate(() => {
          const el = document.activeElement;
          const r = el.getBoundingClientRect();
          let minOpacity = 1;
          let reveal = null;
          for (let n = el; n; n = n.parentElement) {
            minOpacity = Math.min(minOpacity, Number(getComputedStyle(n).opacity));
            if (!reveal && typeof n.className === 'string' && /\breveal\b/.test(n.className)) reveal = n;
          }
          const cs = getComputedStyle(el);
          return {
            href: el.getAttribute('href'),
            inViewport: r.top >= 0 && r.bottom <= window.innerHeight,
            ancestorMinOpacity: minOpacity,
            revealOpacity: reveal ? Number(getComputedStyle(reveal).opacity) : null,
            revealTransition: reveal ? getComputedStyle(reveal).transitionProperty : null,
            ring: { style: cs.outlineStyle, width: cs.outlineWidth, color: cs.outlineColor, offset: cs.outlineOffset },
          };
        });
        await page.screenshot({ path: path.join(OUT, `focus-${size.tag}-${theme}-${LINK_TEXT[li].replace(/\s+/g, '-')}.jpg`), type: 'jpeg', quality: 80 });
        run.focusStops.push({ link: LINK_TEXT[li], ...state });
        await page.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur());
      }

      // ── Text-only 200% enlargement: the band must not clip or overlap.
      await page.evaluate(() => {
        document.documentElement.style.fontSize = '200%';
      });
      await sleep(400);
      run.zoom200 = await page.evaluate(() => {
        const band = document.querySelector('#record');
        const rows = Array.from(band.querySelectorAll('li'));
        const clipped = rows.filter((row) => row.scrollHeight > row.clientHeight + 2 || row.scrollWidth > row.clientWidth + 2);
        const docOverflow = document.documentElement.scrollWidth > window.innerWidth + 2;
        return {
          rows: rows.length,
          clippedRows: clipped.map((r) => (r.textContent || '').trim().slice(0, 40)),
          horizontalPageOverflow: docOverflow,
          bandWidth: Math.round(band.getBoundingClientRect().width),
          viewport: window.innerWidth,
        };
      });
      await page.screenshot({ path: path.join(OUT, `zoom200-${size.tag}-${theme}.jpg`), type: 'jpeg', quality: 80 });
      await page.evaluate(() => {
        document.documentElement.style.fontSize = '';
      });
      await sleep(200);

      run.errors = errors;
      report.runs.push(run);
      console.log(`[record-band-verify] ${size.tag} ${theme}: axe doc=${run.axe.document.violations.length} band=${run.axe.recordBand.violations.length} stops=${run.focusStops.length}`);
      await ctx.close();
    }
  }

  // ── Narrow reflow at 320px (design floor) — one theme is enough for layout.
  const ctx = await makeContext(browser, { w: 320, h: 800, dpr: 2, theme: 'light' });
  const page = await ctx.newPage();
  await load(page, BASE + '/');
  await scrollThrough(page);
  const narrow = await page.evaluate(() => {
    const band = document.querySelector('#record');
    const rows = Array.from(band.querySelectorAll('li'));
    return {
      viewport: window.innerWidth,
      docOverflow: document.documentElement.scrollWidth > window.innerWidth + 2,
      bandCrossesViewport: band.getBoundingClientRect().right > window.innerWidth + 2,
      rows: rows.map((r) => {
        const b = r.getBoundingClientRect();
        return { right: Math.round(b.right), width: Math.round(b.width), clips: r.scrollWidth > r.clientWidth + 2 };
      }),
    };
  });
  await page.screenshot({ path: path.join(OUT, 'narrow-320-light.jpg'), type: 'jpeg', quality: 80 });
  report.narrow320 = narrow;
  console.log(`[record-band-verify] 320px: docOverflow=${narrow.docOverflow} bandCrosses=${narrow.bandCrossesViewport}`);
  await ctx.close();
} finally {
  await browser.close();
  server.kill();
}

fs.writeFileSync(path.join(OUT, 'record-band-verify.json'), JSON.stringify(report, null, 2));
console.log(`[record-band-verify] wrote ${path.join(OUT, 'record-band-verify.json')}`);
