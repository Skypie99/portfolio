// Phase J gate 1+3 — console sweep + frame captures, served out/ on :3005.
// Chromium only (Era Codex SE-7) — never a WebKit claim.
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright-core');
const BASE = 'http://localhost:3005';
const OUT  = process.argv[2];
const SHOTDIR = process.argv[3] || null;
const ROUTES = [
  ['home','/'], ['about','/about/'], ['accessibility','/accessibility/'], ['archive','/archive/'],
  ['blog','/blog/'], ['blog-building-flagstone','/blog/building-flagstone/'],
  ['certificates','/certificates/'], ['colophon','/colophon/'], ['contact','/contact/'],
  ['runway','/runway/'], ['work','/work/'], ['work-flagstone','/work/flagstone/'],
  ['work-claude-corp','/work/claude-corp/'], ['work-dashboard','/work/dashboard/'],
  ['work-prompt-library','/work/prompt-library/'], ['work-ghost-code','/work/ghost-code/'], ['404','/404/'],
];
const WIDTHS = SHOTDIR ? [375, 768, 1440] : [1440];
if (SHOTDIR) fs.mkdirSync(SHOTDIR, { recursive: true });
const browser = await chromium.launch({ headless: true });
const report = { meta: { engine: 'Chromium (playwright-core 1.61.1) headless — NOT Safari/WebKit', when: process.argv[4] || 'unstamped', base: BASE }, routes: {} };
let totalErrors = 0, shots = 0;
for (const [slug, url] of ROUTES) {
  for (const theme of ['light','dark']) {
    for (const w of WIDTHS) {
      const ctx = await browser.newContext({ viewport: { width: w, height: w < 500 ? 812 : 900 }, deviceScaleFactor: 1, colorScheme: theme });
      await ctx.addInitScript((t) => { try { localStorage.setItem('theme', t); } catch (e) {} }, theme);
      const page = await ctx.newPage();
      const errs = [], warns = [], pageErrs = [], badReq = [];
      page.on('console', m => { const t = m.type(); if (t === 'error') errs.push(m.text()); else if (t === 'warning') warns.push(m.text()); });
      page.on('pageerror', e => pageErrs.push(String(e)));
      page.on('response', r => { if (r.status() >= 400) badReq.push(`${r.status()} ${r.url().replace(BASE,'')}`); });
      await page.goto(BASE + url, { waitUntil: 'networkidle' });
      if (theme === 'dark') await page.waitForFunction(`document.documentElement.classList.contains('dark')`, { timeout: 4000 }).catch(()=>{});
      // scroll through to trigger every reveal, then settle at top
      await page.evaluate(async () => { const h = document.body.scrollHeight; for (let y = 0; y < h; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 24)); } window.scrollTo(0, 0); });
      await page.waitForTimeout(700);
      const key = `${slug}__${theme}__${w}`;
      report.routes[key] = { consoleErrors: errs, pageErrors: pageErrs, http4xx5xx: badReq, consoleWarnings: warns.length };
      totalErrors += errs.length + pageErrs.length + badReq.length;
      if (SHOTDIR) { await page.screenshot({ path: `${SHOTDIR}/${key}.png`, fullPage: false }); shots++; }
      if (errs.length || pageErrs.length || badReq.length) console.log(`  ${key}: ${errs.length} console-error, ${pageErrs.length} page-error, ${badReq.length} 4xx/5xx  <<< ${[...errs,...pageErrs,...badReq].slice(0,2).join(' | ').slice(0,160)}`);
      await ctx.close();
    }
  }
}
await browser.close();
fs.writeFileSync(OUT, JSON.stringify(report, null, 2));
console.log(`\n[j-console] ${Object.keys(report.routes).length} page loads · TOTAL console errors + page errors + 4xx/5xx: ${totalErrors}`);
if (SHOTDIR) console.log(`[j-console] ${shots} frames → ${SHOTDIR}`);
console.log('[j-console] →', OUT);
