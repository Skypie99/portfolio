#!/usr/bin/env node
/**
 * overflow-census.mjs — the horizontal-overflow instrument for this repo.
 *
 *   npm run build && npm run check:overflow
 *   npm run check:overflow -- --widths 320,375,414   (default: 320,375)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHY THIS EXISTS: THE OBVIOUS CHECK CANNOT FAIL HERE
 * ─────────────────────────────────────────────────────────────────────────────
 * The standard test for horizontal overflow is
 *
 *     document.documentElement.scrollWidth > window.innerWidth
 *
 * and in THIS repo it is structurally incapable of returning true.
 * `app/globals.css` sets `overflow-x: clip` on BOTH html and body (the Dani
 * 2026-06-01 full-bleed guard for the cinematic's `width: 100vw`). Under `clip`
 * the scrollable overflow region is clamped to the viewport, so scrollWidth can
 * never exceed innerWidth no matter how far a child overhangs.
 *
 * Every "horizontal overflow 0" reading in the ui-polish train — P1 through P7,
 * and REPORT §0's own baseline — was taken with that probe. Those readings are
 * not known to be wrong; they are UNVERIFIED, which is a different claim and is
 * the honest one. Found and proven by P8 (DECISIONS §P `P8-OVERFLOW-VACUOUS`):
 * a 600px div injected into /colophon's <main> at 320 left the reading at 0
 * while its right edge sat +280.00px past the viewport.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT THIS DOES INSTEAD
 * ─────────────────────────────────────────────────────────────────────────────
 * An ELEMENT-LEVEL census: walk every rendered box and report any that crosses
 * the viewport edge. Decorative and contained boxes are excluded BY REASON, never
 * by class name:
 *
 *   · aria-hidden subtrees      — not presented to the reader
 *   · .sr-only                  — clipped to 1px by design
 *   · zero-area boxes           — nothing to see
 *
 * and crucially it measures each element's VISIBLE box — its own rect intersected
 * with every clipping ancestor — rather than its layout box. An in-page container
 * with `overflow: hidden` clips its child whether or not the child's box extends
 * past it, so the raw rect is not what a reader sees. Measuring it instead reports
 * the design's own containment as a defect: TactileMedia's deliberate parallax
 * overscan flagged on 5 routes, 36 of 40 findings, at a 90% false-positive rate.
 * html and body are deliberately NOT counted as clipping ancestors — they carry
 * the `overflow-x: clip` full-bleed guard, and honouring it would contain
 * everything and make this census exactly as vacuous as the probe it replaces.
 * Being cut off at the VIEWPORT edge is the defect; being cut off by an in-page
 * container is the design.
 *
 * NON-VACUITY IS PROVED EVERY RUN, not asserted once: each frame plants a div at
 * 150% of the viewport width and requires the census to catch it. If the plant is
 * ever missed the run FAILS as a broken instrument rather than reporting a clean
 * site — the whole point of this file is that a silent pass is the failure mode.
 *
 * Both readings are printed side by side: the vacuous scrollWidth one (labelled,
 * so old numbers stay comparable) and the real element census.
 *
 * FRESH CLONE: after `npm ci` and `npm run build`, install the browser once with
 * `npx playwright-core install chromium`, then `npm run check:overflow`. It
 * serves `out/` with the tracked `scripts/static-serve.mjs` (no untracked
 * helper) and resolves Chromium portably via playwright-core, falling back to
 * PLAYWRIGHT_CHROMIUM_EXECUTABLE and then the macOS cache.
 *
 * NOT WIRED INTO CI. It drives a real browser via playwright-core and needs a
 * chromium binary on disk, which CI does not install. It is a local gate and a
 * pre-merge check. `npm run test` remains the CI gate.
 *
 * Exit codes: 0 clean · 1 real overflow found · 2 broken instrument / no fixture.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'out');
/* Port 0 asks the OS for a free port, so a stray listener can never be mistaken
   for our fixture. Set OVERFLOW_PORT to pin a specific port instead. */
const PORT = process.env.OVERFLOW_PORT ? Number(process.env.OVERFLOW_PORT) : 0;
let BASE = null;

const arg = (flag, dflt) => {
  const i = process.argv.indexOf(flag);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : dflt;
};
const WIDTHS = arg('--widths', '320,375').split(',').map((n) => Number(n.trim())).filter(Boolean);
const THEMES = ['light', 'dark'];

/* A width list that parses to nothing would run 0 frames and report a clean
   site — the silent pass this whole instrument exists to prevent. */
if (!WIDTHS.length || WIDTHS.some((w) => !Number.isFinite(w) || w <= 0)) {
  console.error(`[overflow] invalid --widths "${arg('--widths', '')}" — pass positive comma-separated pixel widths, e.g. --widths 320,375.`);
  process.exit(2);
}

let chromium;
try {
  ({ chromium } = require('playwright-core'));
} catch {
  console.error('[overflow] playwright-core is not installed. `npm i` should provide it (declared in devDependencies).');
  process.exit(2);
}

/* Portable browser resolution. Order:
 *   1. playwright-core's own resolver — cross-platform and honours
 *      PLAYWRIGHT_BROWSERS_PATH. It returns the expected path even when the
 *      browser has not been downloaded, so the existence check is required.
 *   2. PLAYWRIGHT_CHROMIUM_EXECUTABLE — the repo's documented cross-machine
 *      override (see scripts/verify-intro-focus.cjs and scripts/README.md);
 *      it takes over whenever playwright-core's default is not installed.
 *   3. The legacy macOS Playwright-cache scan, kept so an owner machine whose
 *      installed revision predates playwright-core's expectation still resolves.
 * If all three miss, the caller fails closed with install instructions. */
function resolveChromium() {
  try {
    const resolved = chromium.executablePath();
    if (resolved && fs.existsSync(resolved)) return resolved;
  } catch { /* playwright-core could not resolve it — fall through */ }

  const override = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
  if (override && fs.existsSync(override)) return override;

  const cache = path.join(os.homedir(), 'Library/Caches/ms-playwright');
  if (!fs.existsSync(cache)) return null;
  const newest = (re, rel) =>
    fs.readdirSync(cache).filter((d) => re.test(d))
      .map((d) => ({ d, n: Number(d.split('-').pop()) })).sort((a, b) => b.n - a.n)
      .map(({ d }) => path.join(cache, d, rel)).find((p) => fs.existsSync(p)) || null;
  return (
    newest(/^chromium_headless_shell-\d+$/, 'chrome-headless-shell-mac-arm64/chrome-headless-shell') ||
    newest(/^chromium-\d+$/, 'chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing') ||
    newest(/^chromium-\d+$/, 'chrome-mac/Chromium.app/Contents/MacOS/Chromium')
  );
}

/** Every built route, from disk — a route added later cannot fall out of coverage. */
function routes() {
  const found = [];
  const walk = (dir, rel) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory()) walk(path.join(dir, e.name), `${rel}${e.name}/`);
      else if (e.name === 'index.html') found.push(rel === '' ? '/' : `/${rel}`);
    }
  };
  walk(OUT, '');
  return found.sort();
}

/* The census + its own non-vacuity proof. One argument only (Playwright). */
const CENSUS = new Function(`
  const W = window.innerWidth;
  const census = () => {
    const bad = [];
    for (const el of document.querySelectorAll('main *, footer *, header *, nav *')) {
      if (el.closest('[aria-hidden="true"]')) continue;
      if (el.closest('.sr-only')) continue;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;

      /* THE VISIBLE box, not the layout box. An element's own rect is not what a
         reader sees: every clipping ancestor cuts it down, so overflow must be
         measured on the INTERSECTION of the element with all of them.
         Measuring the raw rect (P8's form, which took the nearest clipping
         ancestor and asked only whether the child fitted inside it) reports a
         clipped element as overflowing — the design's own containment read as a
         defect. Measured: TactileMedia's deliberate parallax overscan
         (absolute inset-[-12%]) has a layout box of [-4.08, 379.08] at 375, and
         its parent is absolute inset-0 overflow-hidden at [33, 342]. Nothing
         reaches the viewport edge, yet the raw-rect form flagged it on 5 routes —
         36 of 40 findings, a 90% false-positive rate. A guard that cries wolf
         nine times in ten is a guard people learn to ignore.

         html/body are EXCLUDED from the intersection on purpose. They carry
         overflow-x: clip (the full-bleed guard), and honouring that would
         contain everything and make this census as vacuous as the scrollWidth
         probe it replaces. Being cut off at the viewport edge IS the defect;
         being cut off by an in-page container is the design. */
      let left = r.left, right = r.right;
      for (let p = el.parentElement; p && p !== document.documentElement && p !== document.body; p = p.parentElement) {
        if (getComputedStyle(p).overflowX !== 'visible') {
          const pr = p.getBoundingClientRect();
          left = Math.max(left, pr.left);
          right = Math.min(right, pr.right);
        }
      }
      if (right - left < 1) continue;            // fully clipped away
      const over = Math.max(right - W, -left);
      if (over <= 0.5) continue;
      bad.push({
        tag: el.tagName,
        cls: String(el.className || '').slice(0, 70),
        over: +over.toFixed(2),
        text: (el.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 46),
      });
    }
    return bad.sort((a, b) => b.over - a.over);
  };

  const real = census();

  /* NON-VACUITY: plant a box at 150% of the viewport and require a catch. */
  const probe = document.createElement('div');
  probe.setAttribute('data-overflow-probe', '1');
  probe.style.cssText = 'width:' + Math.round(W * 1.5) + 'px;height:8px;background:red';
  (document.querySelector('main') || document.body).appendChild(probe);
  const caught = census().some((b) => b.over > W * 0.3);
  probe.remove();

  return {
    scrollWidthReading: {
      docW: document.documentElement.scrollWidth,
      winW: W,
      over: document.documentElement.scrollWidth > W + 0.5,
      vacuous:
        getComputedStyle(document.documentElement).overflowX === 'clip' ||
        getComputedStyle(document.body).overflowX === 'clip',
    },
    offenders: real,
    nonVacuityProof: caught,
  };
`);

async function main() {
  if (!fs.existsSync(OUT)) {
    console.error('[overflow] ./out/ missing — run `npm run build` first.');
    process.exit(2);
  }
  const exe = resolveChromium();
  if (!exe) {
    console.error('[overflow] no chromium binary found.');
    console.error('[overflow] install the version-matched browser once: `npx playwright-core install chromium`');
    console.error('[overflow] (add `--with-deps` if the OS libraries are missing), or point');
    console.error('[overflow] PLAYWRIGHT_CHROMIUM_EXECUTABLE at an existing chromium build.');
    process.exit(2);
  }

  /* The served directory is fixture state; the tracked helper owns the listener.
     It reports the bound URL on stdout, so BASE is whatever port we actually
     got (ephemeral unless OVERFLOW_PORT pinned one) — never a stranger's server.
     stderr is captured so a missing dir or a pinned-port clash is reported. */
  const server = spawn('node', [path.join(ROOT, 'scripts/static-serve.mjs'), OUT, String(PORT)], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const serverErr = [];
  server.stderr.on('data', (b) => { serverErr.push(b.toString()); if (serverErr.length > 40) serverErr.shift(); });
  server.on('error', (e) => serverErr.push(`[overflow] could not spawn the fixture server: ${e.message}\n`));
  let serverOut = '';
  server.stdout.on('data', (b) => {
    serverOut += String(b);
    const m = serverOut.match(/http:\/\/127\.0\.0\.1:(\d+)/);
    if (m && !BASE) BASE = `http://127.0.0.1:${m[1]}`;
  });

  /* Clean teardown: SIGTERM closes the listener; SIGKILL only if it does not. */
  const stopServer = () => {
    if (server.exitCode !== null || server.signalCode) return;
    try { server.kill('SIGTERM'); } catch { /* already gone */ }
    setTimeout(() => { try { server.kill('SIGKILL'); } catch { /* gone */ } }, 1000).unref();
  };

  /* A Ctrl-C mid-run must not orphan the fixture listener. */
  let browser = null;
  for (const sig of ['SIGINT', 'SIGTERM']) {
    process.on(sig, () => {
      stopServer();
      try { if (browser) browser.close(); } catch { /* already gone */ }
      process.exit(130);
    });
  }

  const ready = async () => {
    for (let i = 0; i < 60; i++) {
      if (server.exitCode !== null) return false;
      if (BASE) { try { if ((await fetch(BASE + '/', { signal: AbortSignal.timeout(900) })).ok) return true; } catch {} }
      await new Promise((r) => setTimeout(r, 100));
    }
    return false;
  };
  if (!(await ready())) {
    console.error('[overflow] static fixture never came up (helper: scripts/static-serve.mjs).');
    const tail = serverErr.join('').trim();
    if (tail) console.error(tail);
    else if (BASE) console.error(`[overflow] helper is listening on ${BASE} but GET / never returned 200 — is out/index.html present?`);
    else console.error('[overflow] helper gave no diagnostics and no bound URL.');
    stopServer();
    process.exit(2);
  }

  const urls = routes();
  if (!urls.length) {
    console.error('[overflow] no built routes found under ./out/ — the export is empty, refusing to certify.');
    stopServer();
    process.exit(2);
  }
  const findings = [];
  let frames = 0, vacuousFrames = 0, proofFailures = 0;
  try {
    browser = await chromium.launch({ executablePath: exe });

    for (const width of WIDTHS) {
      for (const theme of THEMES) {
        for (const url of urls) {
          const ctx = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: theme, reducedMotion: 'reduce', deviceScaleFactor: 1 });
          const page = await ctx.newPage();
          await page.goto(BASE + url, { waitUntil: 'networkidle' });
          await page.waitForTimeout(250);
          const r = await page.evaluate(CENSUS);
          frames++;
          if (r.scrollWidthReading.vacuous) vacuousFrames++;
          if (!r.nonVacuityProof) proofFailures++;
          for (const o of r.offenders) findings.push({ url, theme, width, ...o });
          await ctx.close();
        }
      }
    }
  } finally {
    /* Whatever happens above — launch failure, a mid-run throw, success — the
       listener is released and the browser closed. */
    try { if (browser) await browser.close(); } catch { /* report the original error */ }
    stopServer();
  }

  const worst = findings.length ? Math.max(...findings.map((f) => f.over)) : 0;
  console.log(`[overflow] ${frames} frames · ${urls.length} routes × ${THEMES.length} themes × ${WIDTHS.length} widths (${WIDTHS.join(', ')})`);
  console.log(`[overflow] scrollWidth probe was VACUOUS on ${vacuousFrames}/${frames} frames (overflow-x:clip) — that reading is not evidence here`);
  console.log(`[overflow] non-vacuity plant caught on ${frames - proofFailures}/${frames} frames`);

  if (proofFailures > 0) {
    console.error(`[overflow] BROKEN INSTRUMENT — the planted 150%-viewport probe was MISSED on ${proofFailures} frame(s). Refusing to certify.`);
    process.exit(2);
  }

  if (!findings.length) {
    console.log('[overflow] ✅ no element crosses the viewport edge.');
    return;
  }

  console.error(`\n[overflow] ❌ ${findings.length} overhanging element(s), worst +${worst.toFixed(2)}px:\n`);
  const seen = new Set();
  for (const f of findings.sort((a, b) => b.over - a.over)) {
    const key = `${f.url}|${f.tag}|${f.cls}`;
    if (seen.has(key)) continue;
    seen.add(key);
    console.error(`  +${String(f.over.toFixed(2)).padStart(7)}px  ${f.url} @${f.width} ${f.theme}`);
    console.error(`             <${f.tag.toLowerCase()} class="${f.cls}">  ${f.text ? `"${f.text}"` : ''}`);
  }
  process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(2); });
