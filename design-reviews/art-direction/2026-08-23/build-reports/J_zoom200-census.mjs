/**
 * J_zoom200-census.mjs — 200% text zoom, measured the ONLY way that can fail here.
 *
 * WHY: `document.documentElement.scrollWidth > clientWidth` is structurally
 * incapable of returning true in this repo — `app/globals.css` sets
 * `overflow-x: clip` on html AND body (the full-bleed guard for the cinematic's
 * 100vw). scripts/overflow-census.mjs proved that vacuity for the 320/375 case
 * (P8 / DECISIONS §P `P8-OVERFLOW-VACUOUS`) and replaced it with an
 * element-level census. The 200%-zoom leg had never been given the same
 * treatment — Phase H's and Phase J's first 200% readings both used the vacuous
 * probe, so "zero overflow at 200%" was UNVERIFIED, which is a different claim
 * from wrong.
 *
 * This borrows overflow-census.mjs's method exactly: walk every rendered box,
 * measure its VISIBLE rect (own rect ∩ every clipping ancestor, html/body
 * excluded as clippers), exclude by REASON (aria-hidden subtrees, .sr-only,
 * zero-area), and PROVE NON-VACUITY every frame by planting a 150%-viewport div
 * and requiring the census to catch it.
 */
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright-core');
const BASE = 'http://localhost:3005';
const OUT = process.argv[2];
const ROUTES = [
  ['home','/'], ['about','/about/'], ['accessibility','/accessibility/'], ['archive','/archive/'],
  ['blog','/blog/'], ['blog-building-flagstone','/blog/building-flagstone/'],
  ['certificates','/certificates/'], ['colophon','/colophon/'], ['contact','/contact/'],
  ['runway','/runway/'], ['work','/work/'], ['work-flagstone','/work/flagstone/'],
  ['work-claude-corp','/work/claude-corp/'], ['work-dashboard','/work/dashboard/'],
  ['work-prompt-library','/work/prompt-library/'], ['work-ghost-code','/work/ghost-code/'], ['404','/404/'],
];
const CENSUS = () => {
  const vw = document.documentElement.clientWidth;
  const clipped = (el) => {
    let r = el.getBoundingClientRect();
    let L = r.left, R = r.right, T = r.top, B = r.bottom;
    for (let p = el.parentElement; p && p !== document.body && p !== document.documentElement; p = p.parentElement) {
      const cs = getComputedStyle(p);
      if (/hidden|clip|scroll|auto/.test(cs.overflowX) || /hidden|clip|scroll|auto/.test(cs.overflowY)) {
        const pr = p.getBoundingClientRect();
        L = Math.max(L, pr.left); R = Math.min(R, pr.right);
        T = Math.max(T, pr.top);  B = Math.min(B, pr.bottom);
      }
    }
    return { left: L, right: R, w: R - L, h: B - T };
  };
  const findings = [];
  for (const el of document.querySelectorAll('body *')) {
    if (el.closest('[aria-hidden="true"]')) continue;
    if (el.classList.contains('sr-only') || el.closest('.sr-only')) continue;
    const v = clipped(el);
    if (v.w <= 0 || v.h <= 0) continue;
    if (v.right > vw + 1 || v.left < -1) {
      findings.push({
        tag: el.tagName.toLowerCase(),
        cls: (typeof el.className === 'string' ? el.className : '').split(' ').slice(0, 3).join('.'),
        over: Math.round((v.right - vw) * 100) / 100,
        left: Math.round(v.left * 100) / 100,
        text: (el.textContent || '').trim().slice(0, 40),
      });
    }
  }
  return { vw, findings };
};
const browser = await chromium.launch({ headless: true });
const R = { meta: { engine: 'Chromium (playwright-core) headless — NOT WebKit',
  method: 'element-level visible-box census, borrowed from scripts/overflow-census.mjs; non-vacuity planted per frame',
  zoom: 'documentElement.style.fontSize = 200%', when: process.argv[3] || 'unstamped' }, frames: {} };
let frames = 0, plantMissed = 0, realFindings = 0;
for (const [slug, url] of ROUTES) {
  for (const theme of ['light', 'dark']) {
    for (const w of [1440, 375]) {
      const ctx = await browser.newContext({ viewport: { width: w, height: w < 500 ? 812 : 900 }, colorScheme: theme });
      await ctx.addInitScript((t) => { try { localStorage.setItem('theme', t); } catch (e) {} }, theme);
      const page = await ctx.newPage();
      await page.goto(BASE + url, { waitUntil: 'networkidle' });
      await page.evaluate(async () => { const h = document.body.scrollHeight; for (let y = 0; y < h; y += 500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 18)); } window.scrollTo(0, 0); });
      await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
      await page.waitForTimeout(500);
      const res = await page.evaluate(CENSUS);
      // NON-VACUITY: plant a 150%-viewport box and require a catch.
      const caught = await page.evaluate((censusSrc) => {
        const d = document.createElement('div');
        d.style.cssText = `position:relative;height:20px;width:${Math.round(window.innerWidth * 1.5)}px;background:#f0f`;
        document.querySelector('main')?.appendChild(d) ?? document.body.appendChild(d);
        const fn = new Function('return (' + censusSrc + ')')();
        const hit = fn().findings.length;
        d.remove();
        return hit;
      }, CENSUS.toString());
      const key = `${slug}__${theme}__${w}`;
      R.frames[key] = { vw: res.vw, findings: res.findings, plantCaught: caught > res.findings.length };
      frames++;
      if (!(caught > res.findings.length)) plantMissed++;
      if (res.findings.length) { realFindings += res.findings.length; console.log(`  ${key}: ${res.findings.length} crossing → ${JSON.stringify(res.findings.slice(0, 3))}`); }
      await ctx.close();
    }
  }
}
await browser.close();
fs.writeFileSync(OUT, JSON.stringify(R, null, 2));
console.log(`\n[zoom200] ${frames} frames · 17 routes × 2 themes × {1440,375} at 200% root font`);
console.log(`[zoom200] non-vacuity plant caught on ${frames - plantMissed}/${frames} frames`);
if (plantMissed) { console.error(`[zoom200] BROKEN INSTRUMENT — plant missed on ${plantMissed} frame(s). Refusing to certify.`); process.exit(2); }
console.log(realFindings ? `[zoom200] ❌ ${realFindings} element(s) cross the viewport edge` : `[zoom200] ✅ no element crosses the viewport edge at 200% text.`);
