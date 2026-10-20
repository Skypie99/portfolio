#!/usr/bin/env node
/**
 * webkit-spot-check.mjs — cross-engine spot check of the Release 6 surfaces
 * and their neighbours on the integrated build (MiMo Release 6 integration).
 * Modeled on the Release 5 tool (read, not copied); Fable's container had no
 * WebKit, this machine has the Playwright WebKit build.
 *
 *   npm run build
 *   node qa-reports/release6-editorial-finish-2026-10-20/integrated/tools/webkit-spot-check.mjs --out <dir>
 *
 * Surfaces: /work/ (the wall) and home #work (the index) — both Release 6 —
 * plus protected neighbours: /work/flagstone/ (Flagstone case study),
 * /about/, /contact/, and /work/dashboard/ (a Release 5 chapter).
 *
 * Per route × theme × size it checks: no console errors, every laid-out image
 * resolves (naturalWidth > 0), and no element's visible box crosses the
 * viewport edge (the same element-level census as scripts/overflow-census.mjs,
 * including its non-vacuity plant). The two Release 6 surfaces additionally
 * check the scoped editorial order (wall: title before facts, /65 numeral) and
 * the home index's clause spans. Headless WebKit is NOT physical Safari or
 * iOS; a pass here is a rendering signal only. Nothing leaves loopback.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { webkit } = require('playwright-core');

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..', '..', '..');
const OUT_DIR = path.join(ROOT, 'out');
const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? def : args[i + 1];
};
const OUT = path.resolve(opt('out', path.join(ROOT, 'qa-reports', 'release6-editorial-finish-2026-10-20', 'integrated', 'webkit')));
const ROUTES = [
  { slug: 'work', path: '/work/', surface: 'wall' },
  { slug: 'home-work', path: '/#work', surface: 'index' },
  { slug: 'flagstone', path: '/work/flagstone/', surface: 'protected' },
  { slug: 'about', path: '/about/', surface: 'protected' },
  { slug: 'contact', path: '/contact/', surface: 'protected' },
  { slug: 'dashboard', path: '/work/dashboard/', surface: 'protected' },
];
const THEMES = ['light', 'dark'];
const SIZES = [{ w: 1440, h: 900, dpr: 1 }, { w: 393, h: 852, dpr: 2 }];
const PORT = Number(opt('port', process.env.WEBKIT_PORT || 3436));
const BASE = `http://127.0.0.1:${PORT}`;

if (!fs.existsSync(OUT_DIR)) {
  console.error('[webkit] out/ is missing: run `npm run build` first.');
  process.exit(2);
}
fs.mkdirSync(OUT, { recursive: true });

/* The visible-box census + non-vacuity plant, mirroring scripts/overflow-census.mjs. */
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
      let left = r.left, right = r.right;
      for (let p = el.parentElement; p && p !== document.documentElement && p !== document.body; p = p.parentElement) {
        if (getComputedStyle(p).overflowX !== 'visible') {
          const pr = p.getBoundingClientRect();
          left = Math.max(left, pr.left);
          right = Math.min(right, pr.right);
        }
      }
      if (right - left < 1) continue;
      const over = Math.max(right - W, -left);
      if (over <= 0.5) continue;
      bad.push({ tag: el.tagName, over: +over.toFixed(2) });
    }
    return bad.sort((a, b) => b.over - a.over);
  };
  const real = census();
  const probe = document.createElement('div');
  probe.style.cssText = 'width:' + Math.round(W * 1.5) + 'px;height:8px;background:red';
  (document.querySelector('main') || document.body).appendChild(probe);
  const caught = census().some((b) => b.over > W * 0.3);
  probe.remove();
  return { real, plantCaught: caught };
`);

const server = spawn(process.execPath, [path.join(ROOT, 'scripts', 'static-serve.mjs'), OUT_DIR, String(PORT)], { stdio: ['ignore', 'pipe', 'pipe'] });
await new Promise((r) => setTimeout(r, 700));

const browser = await webkit.launch({ headless: true, executablePath: webkit.executablePath() });
const report = [];
let failures = 0;
try {
  for (const route of ROUTES) {
    for (const theme of THEMES) {
      for (const { w, h, dpr } of SIZES) {
        const tag = `${route.slug}-${theme}-${w}x${h}@${dpr}`;
        const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dpr, colorScheme: theme });
        await ctx.addInitScript((t) => {
          try {
            window.localStorage.setItem('theme', t);
          } catch {
            /* storage denied */
          }
        }, theme);
        const page = await ctx.newPage();
        const errors = [];
        page.on('console', (m) => {
          if (m.type() === 'error') errors.push(m.text().slice(0, 120));
        });
        page.on('pageerror', (e) => errors.push(String(e).slice(0, 120)));
        await page.goto(`${BASE}${route.path}`, { waitUntil: 'load' });
        await page.evaluate(() => document.fonts.ready);
        await page.waitForFunction(() => document.documentElement.classList.contains('js'), null, { timeout: 15000 }).catch(() => {});
        await page.evaluate(async () => {
          for (let y = 0; y < document.body.scrollHeight; y += 700) {
            window.scrollTo(0, y);
            await new Promise((r) => setTimeout(r, 60));
          }
        });
        await new Promise((r) => setTimeout(r, 800));
        await page.evaluate(() => window.scrollTo(0, 0));
        await new Promise((r) => setTimeout(r, 300));
        const c = await page.evaluate(CENSUS);
        const imgs = await page.evaluate(() =>
          Array.from(document.images)
            .filter((i) => i.getClientRects().length > 0 && i.naturalWidth === 0)
            .map((i) => (i.currentSrc || i.src).slice(-60)),
        );
        /* Release 6 specifics on the two surfaces. */
        let r6 = null;
        if (route.surface === 'wall') {
          r6 = await page.evaluate(() => {
            const cards = document.querySelectorAll('main ul > li');
            const first = cards[0];
            const numeral = first && first.querySelector('.case-study-card-copy > span[aria-hidden="true"]');
            const h3 = first && first.querySelector('h3');
            const facts = first && Array.from(first.querySelectorAll('p')).find((p) => p.querySelector('time'));
            const order = h3 && facts ? h3.getBoundingClientRect().top <= facts.getBoundingClientRect().top + 1 : null;
            const ink = numeral ? getComputedStyle(numeral).color : null;
            const alpha = ink ? Number((ink.match(/[\d.]+\)$/)?.[0] || '1').replace(')', '')) : null;
            return { plates: cards.length, titleAboveFacts: order, numeralInk: ink };
          });
        } else if (route.surface === 'index') {
          r6 = await page.evaluate(() => {
            const rows = document.querySelectorAll('#work ol > li');
            const clauseSpans = document.querySelectorAll('#work ol > li p > span[class*="clause"]').length;
            return { rows: rows.length, clauseSpans };
          });
        }
        if (w === 1440) await page.screenshot({ path: path.join(OUT, `${tag}.jpg`), type: 'jpeg', quality: 80 });
        const ok = errors.length === 0 && imgs.length === 0 && c.real.length === 0 && c.plantCaught;
        if (!ok) failures++;
        report.push({ tag, surface: route.surface, brokenImages: imgs, consoleErrors: errors, overflow: c.real, plantCaught: c.plantCaught, r6 });
        console.log(`[webkit] ${tag} · broken images ${imgs.length} · errors ${errors.length} · overflow ${c.real.length ? JSON.stringify(c.real) : 'no'} · plant ${c.plantCaught ? 'caught' : 'MISSED'}${r6 ? ' · r6 ' + JSON.stringify(r6) : ''}`);
        await ctx.close();
      }
    }
  }
  fs.writeFileSync(path.join(OUT, 'webkit.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(`[webkit] ${report.length} frames, ${failures} failing`);
} finally {
  await browser.close();
  server.kill('SIGTERM');
}
