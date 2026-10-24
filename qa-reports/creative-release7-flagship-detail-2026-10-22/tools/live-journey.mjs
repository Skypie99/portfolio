#!/usr/bin/env node
/**
 * live-journey.mjs — frames of the homepage journey (intro first frame, three
 * points in the film, its last frame, the seam, the hero, then each band) plus
 * /work/ and /work/flagstone/ folds, from any origin: the live site or a
 * loopback build. This is how the live baseline in ../baseline-live/ was taken.
 *
 *   node qa-reports/creative-release7-flagship-detail-2026-10-22/tools/live-journey.mjs \
 *        --base https://skypistudio.com --out <dir> [--themes light,dark] [--sizes 1440x900@1,393x852@2] [--routes home,work,flagstone]
 *
 * Reading a public page is the only network use. The film is walked in 160px
 * steps so its scroll-scrubbed timeline is driven the way a wheel drives it.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..', '..');
const require = createRequire(path.join(ROOT, 'package.json'));
const { chromium } = require('playwright-core');
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf('--' + n); return i < 0 ? d : args[i + 1]; };
const BASE = opt('base', 'https://skypistudio.com');
const OUT = path.resolve(opt('out', 'out-journey'));
const THEMES = opt('themes', 'light,dark').split(',');
const SIZES = opt('sizes', '1440x900@1,393x852@2').split(',').map((t) => { const m = /^(\d+)x(\d+)@([\d.]+)$/.exec(t); return { w: +m[1], h: +m[2], dpr: +m[3], tag: t }; });
const ROUTES = opt('routes', 'home,work,flagstone').split(',');
const RM = args.includes('--rm');
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.launch({ headless: true });
const manifest = [];
async function ctxFor(size, theme) {
  const ctx = await browser.newContext({ viewport: { width: size.w, height: size.h }, deviceScaleFactor: size.dpr, colorScheme: theme, reducedMotion: RM ? 'reduce' : 'no-preference', ...(size.w < 600 ? { isMobile: true, hasTouch: true } : {}) });
  await ctx.addInitScript((t) => { try { localStorage.setItem('theme', t); } catch {} }, theme);
  return ctx;
}
async function walkTo(page, y, step = 160, dwell = 24) {
  const y0 = await page.evaluate(() => scrollY);
  const dir = y > y0 ? 1 : -1;
  for (let cur = y0; dir > 0 ? cur < y : cur > y; cur += dir * step) {
    await page.evaluate((v) => scrollTo(0, v), cur);
    await sleep(dwell);
  }
  await page.evaluate((v) => scrollTo(0, v), y);
}
const shot = async (page, name, entry) => { const f = path.join(OUT, name + '.jpg'); await page.screenshot({ path: f, type: 'jpeg', quality: 80 }); entry.files.push(path.basename(f)); };
for (const theme of THEMES) for (const size of SIZES) {
  const tagBase = `${theme}-${size.tag}${RM ? '-rm' : ''}`;
  if (ROUTES.includes('home')) {
    const ctx = await ctxFor(size, theme); const page = await ctx.newPage();
    const entry = { route: '/', theme, size: size.tag, files: [], errors: [] };
    page.on('pageerror', (e) => entry.errors.push(String(e)));
    await page.goto(BASE + '/', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready); await sleep(900);
    const pos = await page.evaluate(() => { const t = (s) => { const e = document.querySelector(s); return e ? Math.round(e.getBoundingClientRect().top + scrollY) : null; }; return { hero: t('#hero'), flagship: t('#flagship'), support: t('#support-work'), work: t('#work'), record: t('#record'), how: t('#how-i-work'), about: t('#about'), contact: t('#contact'), vh: innerHeight, H: document.documentElement.scrollHeight }; });
    entry.pos = pos;
    await shot(page, `home-00-intro-first-${tagBase}`, entry);
    const film = pos.hero; // intro occupies [0, hero)
    for (const [k, frac] of [['25', 0.25], ['55', 0.55], ['85', 0.85]]) { await walkTo(page, Math.round((film - pos.vh) * frac)); await sleep(1600); await shot(page, `home-01-intro-${k}-${tagBase}`, entry); }
    await walkTo(page, film - pos.vh); await sleep(1600); await shot(page, `home-02-intro-last-${tagBase}`, entry);
    await walkTo(page, film - Math.round(pos.vh * 0.5)); await sleep(1400); await shot(page, `home-03-seam-${tagBase}`, entry);
    await walkTo(page, film); await sleep(1400); await shot(page, `home-04-hero-top-${tagBase}`, entry);
    // the hero's own composition: scroll so the identity block sits ~1/5 down
    const idTop = await page.evaluate(() => { const e = document.querySelector('[data-hero-identity]'); return e ? Math.round(e.getBoundingClientRect().top + scrollY) : null; });
    if (idTop) { await walkTo(page, idTop - Math.round(pos.vh * 0.12)); await sleep(1400); await shot(page, `home-05-hero-composed-${tagBase}`, entry); }
    for (const [k, y] of [['06-flagship', pos.flagship], ['07-support', pos.support], ['08-work', pos.work], ['09-record', pos.record], ['10-how', pos.how], ['11-about', pos.about], ['12-contact', pos.contact]]) {
      if (y == null) continue; await walkTo(page, y); await sleep(1500); await shot(page, `home-${k}-${tagBase}`, entry);
    }
    // flagship mid-band (the capture centred)
    await walkTo(page, pos.flagship + Math.round(pos.vh * 0.35)); await sleep(1300); await shot(page, `home-06b-flagship-mid-${tagBase}`, entry);
    manifest.push(entry); await ctx.close();
  }
  for (const [key, route] of [['work', '/work/'], ['flagstone', '/work/flagstone/']]) {
    if (!ROUTES.includes(key)) continue;
    const ctx = await ctxFor(size, theme); const page = await ctx.newPage();
    const entry = { route, theme, size: size.tag, files: [], errors: [] };
    page.on('pageerror', (e) => entry.errors.push(String(e)));
    await page.goto(BASE + route, { waitUntil: 'networkidle' }); await page.evaluate(() => document.fonts.ready); await sleep(1200);
    await shot(page, `${key}-00-fold-${tagBase}`, entry);
    const H = await page.evaluate(() => document.documentElement.scrollHeight); const vh = size.h;
    let i = 1; for (let y = Math.round(vh * 0.85); y < H - vh && i <= 7; y += Math.round(vh * 0.85), i++) { await walkTo(page, y); await sleep(1100); await shot(page, `${key}-${String(i).padStart(2, '0')}-${tagBase}`, entry); }
    entry.H = H; manifest.push(entry); await ctx.close();
  }
}
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 1));
await browser.close();
console.log('done', OUT, manifest.map((m) => `${m.route} ${m.theme} ${m.size} files=${m.files.length} errors=${m.errors.length}`).join('\n'));
