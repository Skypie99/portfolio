#!/usr/bin/env node
/**
 * axe-check.mjs — accessibility pass over the Release 5 showcase routes from the
 * BUILT site: axe-core (the repository's devDependency) on the whole page and on
 * the showcase subtree, in both themes at 1440×900 and 393×852, plus a keyboard
 * walk that Tabs from the top of the page to the first showcase control (the
 * Prompt Library doorway, the Ghost Code Play control) and records whether the
 * focus ring is visible and how many stops it took.
 *
 *   npm run build
 *   node qa-reports/release5-showcases-20261020/tools/axe-check.mjs --out <dir> [--routes a,b]
 *
 * Writes axe.json and focus-<route>-<theme>-<w>.jpg crops. Chromium only; no
 * network beyond loopback; nothing is installed.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright-core');

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..', '..');
const OUT_DIR = path.join(ROOT, 'out');
const AXE = fs.readFileSync(path.join(ROOT, 'node_modules', 'axe-core', 'axe.min.js'), 'utf8');
const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? def : args[i + 1];
};
const OUT = path.resolve(opt('out', path.join(ROOT, 'qa-reports/release5-showcases-20261020/a11y')));
const ROUTES = opt('routes', 'prompt-library,claude-corp,ghost-code,dashboard').split(',');
const THEMES = ['light', 'dark'];
const SIZES = [
  [1440, 900],
  [393, 852],
];
const PORT = Number(process.env.CAPTURE_PORT || 3108);
const BASE = `http://127.0.0.1:${PORT}`;
const CONTROL = {
  'prompt-library': 'a[href="https://prompts.skypistudio.com"]',
  'ghost-code': '[data-showcase-clip] [data-themed-motion] > button',
};

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

fs.mkdirSync(OUT, { recursive: true });
const server = await serve();
const browser = await chromium.launch({ headless: true, executablePath: resolveChromium() });
const report = [];
try {
  for (const route of ROUTES) {
    for (const theme of THEMES) {
      for (const [w, h] of SIZES) {
        const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, colorScheme: theme, ...(w < 600 ? { isMobile: true, hasTouch: true } : {}) });
        await ctx.addInitScript((t) => {
          try {
            window.localStorage.setItem('theme', t);
          } catch {
            /* storage denied */
          }
        }, theme);
        const page = await ctx.newPage();
        await page.goto(`${BASE}/work/${route}/`, { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        await page.waitForFunction(() => document.documentElement.classList.contains('js'), null, { timeout: 15000 });
        // show every reveal so axe sees the resting page
        const total = await page.evaluate(() => document.documentElement.scrollHeight);
        for (let y = 0; y < total; y += Math.round(h * 0.6)) {
          await page.evaluate((yy) => window.scrollTo(0, yy), y);
          await sleep(100);
        }
        await page.evaluate(() => window.scrollTo(0, 0));
        await sleep(600);
        await page.addScriptTag({ content: AXE });
        const axe = await page.evaluate(async () => {
          const whole = await window.axe.run(document, { resultTypes: ['violations', 'incomplete'] });
          const sub = await window.axe.run('[data-case-showcase], .hero-settle-img, [data-showcase-hero-caption]', { resultTypes: ['violations', 'incomplete'] });
          const pick = (r) => r.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, targets: v.nodes.slice(0, 3).map((n) => n.target.join(' ')) }));
          return {
            page: { violations: pick(whole.violations), incomplete: pick(whole.incomplete) },
            showcase: { violations: pick(sub.violations), incomplete: pick(sub.incomplete) },
          };
        });
        // keyboard walk to the first showcase control, if the route has one
        let keyboard = null;
        const sel = CONTROL[route];
        if (sel) {
          await page.evaluate(() => window.scrollTo(0, 0));
          let tabs = 0;
          let reached = false;
          for (let i = 1; i <= 120; i += 1) {
            await page.keyboard.press('Tab');
            tabs = i;
            reached = await page.evaluate((s) => document.activeElement === document.querySelector(s), sel);
            if (reached) break;
          }
          if (reached) {
            await sleep(250);
            const info = await page.evaluate((s) => {
              const el = document.querySelector(s);
              const cs = getComputedStyle(el);
              const r = el.getBoundingClientRect();
              return {
                focusVisible: el.matches(':focus-visible'),
                outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`,
                outlineOffset: cs.outlineOffset,
                rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
                name: el.getAttribute('aria-label') || el.textContent?.trim(),
              };
            }, sel);
            const clip = { x: Math.max(0, info.rect.x - 24), y: Math.max(0, info.rect.y - 24), width: Math.min(w, info.rect.w + 48), height: Math.min(h, info.rect.h + 48) };
            await page.screenshot({ path: path.join(OUT, `focus-${route}-${theme}-${w}.jpg`), type: 'jpeg', quality: 85, clip });
            keyboard = { tabs, ...info };
          } else keyboard = { tabs, reached: false };
        }
        report.push({ route, theme, size: `${w}x${h}`, axe, keyboard });
        console.log(`[axe] ${route} ${theme} ${w}: page ${axe.page.violations.length} violations / ${axe.page.incomplete.length} incomplete · showcase ${axe.showcase.violations.length} / ${axe.showcase.incomplete.length}${keyboard ? ` · tabs ${keyboard.tabs} focus-visible ${keyboard.focusVisible} ${keyboard.outline ?? ''}` : ''}`);
        await ctx.close();
      }
    }
  }
  fs.writeFileSync(path.join(OUT, 'axe.json'), JSON.stringify(report, null, 2));
} finally {
  await browser.close();
  server.kill('SIGTERM');
}
