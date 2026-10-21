#!/usr/bin/env node
/**
 * record-band-focus.mjs — Post-Release-6 Record-band keyboard-focus probe.
 *
 * Measures what a keyboard reader actually sees when focus lands on the home
 * `#record` band's row links (`the record`, `the account`, `the statement`,
 * `evidence`): the focused link's own opacity, the minimum opacity across its
 * ancestor chain (the Reveal container), the Reveal's computed state, viewport
 * rect, scrollY, and how long the container takes to reach >= 0.99 after focus
 * lands. Two experiments per run:
 *
 *   walk     — ONE continuous Tab (or Shift+Tab) journey from the Release 6
 *              seat (`#work ol h3 a`) through the band, sampling AT THE INSTANT
 *              focus arrives at each record link and never pausing. This is the
 *              reported failure's own shape: a reader tabbing through sees each
 *              focused link against its still-fading row.
 *   trials   — one FRESH page load per link, tab-walked to that link, then
 *              sampled over 1.4 s with no further input to record the fade the
 *              focused content sits behind (arrival opacity + settle time).
 *
 * Fresh loads per trial keep earlier stops' reveals from settling the later
 * rows (the contamination a dwell-based walk would hide).
 *
 *   node record-band-focus.mjs --dir <export dir> --out <dir> \
 *     [--sizes 1440x900@1,393x852@2] [--modes normal,rm,nojs] [--themes light,dark]
 *
 * Serves over loopback only; nothing is installed; nothing leaves the machine.
 * Engine: the pre-installed Playwright Chromium (NOT Safari/WebKit; headless
 * rendering evidence only — never physical-device validation).
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright-core');

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
const MODES = opt('modes', 'normal').split(',');
const THEMES = opt('themes', 'light,dark').split(',');
const PORT = Number(opt('port', 3261));
const BASE = `http://127.0.0.1:${PORT}`;
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..', '..');
fs.mkdirSync(OUT, { recursive: true });

/** The row links of the home #record band, in DOM order. */
const RECORD_HREFS = ['/colophon/#calibration', '/work/flagstone/#what-went-wrong', '/accessibility/', '/accessibility/#receipts'];
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

async function makeContext(browser, { w, h, dpr, theme, mode }) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: h },
    deviceScaleFactor: dpr,
    colorScheme: theme,
    reducedMotion: mode === 'rm' ? 'reduce' : 'no-preference',
    javaScriptEnabled: mode !== 'nojs',
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
  await sleep(400);
}

/** Snapshot of the ACTIVE ELEMENT plus its Reveal container chain. */
const sample = () => {
  const el = document.activeElement;
  if (!el || el === document.body) return null;
  const r = el.getBoundingClientRect();
  let minOpacity = 1;
  let reveal = null;
  for (let n = el; n; n = n.parentElement) {
    const cs = getComputedStyle(n);
    minOpacity = Math.min(minOpacity, Number(cs.opacity));
    if (!reveal && typeof n.className === 'string' && /\breveal\b/.test(n.className)) reveal = n;
  }
  const revealCs = reveal ? getComputedStyle(reveal) : null;
  return {
    tag: el.tagName.toLowerCase(),
    text: (el.textContent || '').trim().slice(0, 40),
    href: el.getAttribute('href'),
    rect: { top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height) },
    inViewport: r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight,
    scrollY: Math.round(window.scrollY),
    ownOpacity: Number(getComputedStyle(el).opacity),
    ancestorMinOpacity: minOpacity,
    ringVisible: getComputedStyle(el).outlineStyle !== 'none' && parseFloat(getComputedStyle(el).outlineWidth) > 0,
    reveal: reveal
      ? {
          cls: reveal.className.toString(),
          opacity: Number(revealCs.opacity),
          transform: revealCs.transform,
          transitionProperty: revealCs.transitionProperty,
          transitionDuration: revealCs.transitionDuration,
          transitionDelay: revealCs.transitionDelay,
        }
      : null,
  };
};

/** One real Tab / Shift+Tab press + settle, returning the new focus href. */
const press = async (page, shift) => {
  await page.keyboard.press(shift ? 'Shift+Tab' : 'Tab');
  await sleep(50);
  return page.evaluate(() => document.activeElement && document.activeElement.getAttribute && document.activeElement.getAttribute('href'));
};

/** Tab-walk from the work-band row 01 title to `targetHref`. Returns presses. */
async function walkTo(page, targetHref, shift) {
  await page.focus('#work ol h3 a');
  for (let i = 0; i < 60; i++) {
    const href = await press(page, shift);
    if (href === targetHref) return i + 1;
  }
  throw new Error(`never reached ${targetHref}`);
}

/** Arrival probe: sample at focus, then over time with no further input. */
async function probeArrival(page) {
  const at = [];
  const t0 = Date.now();
  at.push({ ms: 0, s: await page.evaluate(sample) });
  for (const ms of [200, 500, 900, 1400]) {
    const wait = ms - (Date.now() - t0);
    if (wait > 0) await sleep(wait);
    at.push({ ms: Date.now() - t0, s: await page.evaluate(sample) });
  }
  return at;
}

const engine = resolveChromium();
if (!engine) {
  console.error('[record-band-focus] no resolvable Chromium — set PLAYWRIGHT_CHROMIUM_EXECUTABLE');
  process.exit(2);
}
const server = await serve(DIR, PORT);
const browser = await chromium.launch({ headless: true, executablePath: engine });
const report = {
  meta: {
    tool: 'record-band-focus.mjs',
    engine: `Chromium headless — NOT Safari/WebKit, NOT physical-device testing`,
    dir: DIR,
    at: new Date().toISOString(),
    note: 'ancestorMinOpacity is the opacity a keyboard reader sees the focused link against; < 0.99 = the reported faint-focus failure state.',
  },
  runs: [],
};
try {
  for (const mode of MODES) {
    for (const size of SIZES) {
      for (const theme of THEMES) {
        const ctx = await makeContext(browser, { ...size, theme, mode });
        const page = await ctx.newPage();
        const errors = [];
        page.on('pageerror', (e) => errors.push(String(e)));
        const run = { mode, size: size.tag, theme, walk: [], trials: [], passthrough: {}, errors };

        if (mode !== 'nojs') {
          // ── Experiment 1: ONE continuous walk per entry direction, sampling
          //    at the instant focus lands (no dwell — dwell would let sibling
          //    rows finish revealing and mask the failure).
          for (const [entry, shift, seat] of [
            // Tab enters the band from ABOVE (the work band's row 01 title);
            // Shift+Tab enters from BELOW (the first link after the band in DOM
            // order — #how-i-work carries no focusables; the seat is the About
            // band's /about/ link at the first anchor past #record).
            ['Tab', false, '#work ol h3 a'],
            ['Shift+Tab', true, '#about a'],
          ]) {
            await load(page, BASE + '/');
            await page.focus(seat);
            const seen = [];
            for (let i = 0; i < 80; i++) {
              const href = await press(page, shift);
              const idx = RECORD_HREFS.indexOf(href);
              if (idx !== -1) {
                const s = await page.evaluate(sample);
                seen.push({ link: LINK_TEXT[idx], href, atFocus: s });
                if (seen.length === RECORD_HREFS.length) break;
              }
            }
            run.walk.push({ entry, stops: seen });
          }

          // ── Experiment 2: fresh-load arrival trials (timing of the fade a
          //    focused link sits behind).
          for (let li = 0; li < RECORD_HREFS.length; li++) {
            await load(page, BASE + '/');
            const keys = await walkTo(page, RECORD_HREFS[li], false);
            const arrival = await probeArrival(page);
            run.trials.push({ link: LINK_TEXT[li], href: RECORD_HREFS[li], entry: 'Tab', keys, arrival });
          }

          // ── Direct anchor arrival (the seat path): /#record must rest visible.
          await load(page, BASE + '/#record');
          run.passthrough.anchorRecord = await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll('#record ul .reveal'));
            return {
              rows: rows.length,
              hiddenRows: rows.filter((r) => Number(getComputedStyle(r).opacity) < 0.99).length,
              scrollY: Math.round(window.scrollY),
            };
          });

          // ── Pointer scroll entry: ordinary entrance motion must still run.
          await load(page, BASE + '/');
          await page.evaluate(() => {
            const el = document.querySelector('#record');
            window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.5);
          });
          await sleep(120);
          const mid = await page.evaluate(() =>
            Array.from(document.querySelectorAll('#record ul .reveal')).map((r) => Number(getComputedStyle(r).opacity)),
          );
          await sleep(1600);
          const settled = await page.evaluate(() =>
            Array.from(document.querySelectorAll('#record ul .reveal')).map((r) => Number(getComputedStyle(r).opacity)),
          );
          run.passthrough.pointerScroll = { midFlight: mid, settled };

          // ── Back-navigation return seat from the record band's row 02.
          await load(page, BASE + '/');
          await page.focus('#record ul li:nth-child(2) a');
          await page.keyboard.press('Enter');
          await page.waitForURL(/\/work\/[^/]+\//, { timeout: 10000 }).catch(() => {});
          await sleep(800);
          await page.goBack();
          await sleep(1000);
          run.passthrough.backReturn = await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll('#record ul .reveal'));
            const el = document.activeElement;
            let o = 1;
            for (let n = el; n; n = n.parentElement) o = Math.min(o, Number(getComputedStyle(n).opacity));
            return {
              scrollY: Math.round(window.scrollY),
              hiddenRows: rows.filter((r) => Number(getComputedStyle(r).opacity) < 0.99).length,
              focusTag: el ? el.tagName.toLowerCase() : null,
              focusHref: el && el.getAttribute ? el.getAttribute('href') : null,
              focusAncestorMinOpacity: o,
            };
          });
        } else {
          // no-JS: every reveal must rest visible and every link present.
          await load(page, BASE + '/');
          run.passthrough.noJs = await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll('#record ul .reveal'));
            const links = Array.from(document.querySelectorAll('#record ul a'));
            return {
              rows: rows.length,
              hiddenRows: rows.filter((r) => Number(getComputedStyle(r).opacity) < 0.99).length,
              links: links.map((a) => a.getAttribute('href')),
            };
          });
        }

        run.errors = errors;
        report.runs.push(run);
        console.log(`[record-band-focus] ${mode} ${size.tag} ${theme}: walk=${run.walk.length} trials=${run.trials.length}`);
        await ctx.close();
      }
    }
  }
} finally {
  await browser.close();
  server.kill();
}

fs.writeFileSync(path.join(OUT, 'record-band-focus.json'), JSON.stringify(report, null, 2));

// ── Console summary.
let faint = 0;
let total = 0;
const line = (label, s) => {
  const isFaint = s.ancestorMinOpacity < 0.99;
  total += 1;
  if (isFaint) faint += 1;
  console.log(
    `${label}: at-focus ancestorMinOpacity=${s.ancestorMinOpacity.toFixed(3)} reveal=${s.reveal ? s.reveal.opacity.toFixed(3) : 'n/a'} ` +
      `own=${s.ownOpacity.toFixed(3)} ring=${s.ringVisible} inVP=${s.inViewport} top=${s.rect.top} scrollY=${s.scrollY} ${isFaint ? 'FAINT' : 'OK'}`,
  );
};
for (const run of report.runs) {
  for (const w of run.walk) {
    for (const stop of w.stops) line(`[${run.mode}/${run.size}/${run.theme}] walk ${w.entry} → ${stop.link}`, stop.atFocus);
  }
  for (const t of run.trials) {
    const first = t.arrival[0].s;
    const settleMs = t.arrival.find((a) => a.s.ancestorMinOpacity >= 0.99)?.ms ?? null;
    const worst = Math.min(...t.arrival.map((a) => a.s.ancestorMinOpacity));
    console.log(
      `[${run.mode}/${run.size}/${run.theme}] trial ${t.link}: settle@${settleMs === null ? 'NEVER' : settleMs + 'ms'} worst=${worst.toFixed(3)} (arrival sampled below)`,
    );
    line(`[${run.mode}/${run.size}/${run.theme}] trial ${t.link} arrival`, first);
  }
}
console.log(`[record-band-focus] ${faint}/${total} focus arrivals landed on faint content (ancestorMinOpacity < 0.99)`);
console.log(`[record-band-focus] wrote ${path.join(OUT, 'record-band-focus.json')}`);
