// Phase J gates 5 + 7 — keyboard trace, reflow, REAL reduced-motion walk,
// hover↔focus parity, method-link reachability. Served out/ on :3005.
// Chromium only (Era Codex SE-7). Uses playwright's own reducedMotion
// emulation — the first real RM emulation in this program (G and H both
// had to verify RM at code level only; their Browser pane exposed no toggle).
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
const browser = await chromium.launch({ headless: true });
const R = { meta: { engine: 'Chromium (playwright-core 1.61.1) headless — NOT Safari/WebKit', when: process.argv[3] || 'unstamped' },
            keyboard: {}, reflow: {}, reducedMotion: {}, hoverFocusParity: {}, methodLinks: {} };

async function open(url, opts = {}) {
  const ctx = await browser.newContext({ viewport: opts.viewport || { width: 1440, height: 900 },
    colorScheme: opts.theme || 'light', reducedMotion: opts.rm ? 'reduce' : 'no-preference' });
  await ctx.addInitScript((t) => { try { localStorage.setItem('theme', t); } catch (e) {} }, opts.theme || 'light');
  const page = await ctx.newPage();
  await page.goto(BASE + url, { waitUntil: 'networkidle' });
  await page.evaluate(async () => { const h = document.body.scrollHeight; for (let y=0;y<h;y+=500){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,20));} window.scrollTo(0,0); });
  await page.waitForTimeout(500);
  return { ctx, page };
}

// ---- 1. KEYBOARD TRACE: real Tab presses, ring visible at every stop ----
for (const [slug, url] of ROUTES) {
  const { ctx, page } = await open(url);
  const stops = [];
  let last = null;
  for (let i = 0; i < 60; i++) {
    await page.keyboard.press('Tab');
    const s = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const cs = getComputedStyle(el);
      const vis = el.matches(':focus-visible');
      const ow = parseFloat(cs.outlineWidth) || 0;
      const ring = (cs.outlineStyle !== 'none' && ow > 0) ? `outline ${cs.outlineWidth} ${cs.outlineStyle} ${cs.outlineColor}`
                 : (cs.boxShadow && cs.boxShadow !== 'none') ? `box-shadow ${cs.boxShadow}` : null;
      const r = el.getBoundingClientRect();
      return { tag: el.tagName.toLowerCase(), name: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 46),
               focusVisible: vis, ring, offset: cs.outlineOffset, w: Math.round(r.width), h: Math.round(r.height) };
    });
    if (!s) break;
    const key = s.tag + '|' + s.name + '|' + s.w + 'x' + s.h;
    if (key === last) break;           // wrapped / stuck
    last = key; stops.push(s);
  }
  const noRing = stops.filter(s => s.focusVisible && !s.ring);
  R.keyboard[slug] = { stops: stops.length, focusVisibleStops: stops.filter(s=>s.focusVisible).length,
                       stopsWithoutRing: noRing.length, offenders: noRing.slice(0,4),
                       rings: [...new Set(stops.filter(s=>s.ring).map(s=>s.ring))] };
  await ctx.close();
}

// ---- 2. REFLOW: 320px width, and 200% root font at 1440 ----
for (const [slug, url] of ROUTES) {
  const a = await open(url, { viewport: { width: 320, height: 700 } });
  const at320 = await a.page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
    worst: [...document.querySelectorAll('body *')].filter(e => e.getBoundingClientRect().right > document.documentElement.clientWidth + 1)
      .slice(0,3).map(e => e.tagName.toLowerCase() + '.' + (e.className && typeof e.className === 'string' ? e.className.split(' ')[0] : '')) }));
  await a.ctx.close();
  const b = await open(url);
  await b.page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  await b.page.waitForTimeout(400);
  const at200 = await b.page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  await b.ctx.close();
  R.reflow[slug] = { at320: { overflow: at320.sw > at320.cw + 1, sw: at320.sw, cw: at320.cw, worst: at320.worst },
                     at200pct: { overflow: at200.sw > at200.cw + 1, sw: at200.sw, cw: at200.cw } };
}

// ---- 3. REAL reduced-motion walk (playwright RM emulation) ----
for (const [slug, url] of ROUTES) {
  const { ctx, page } = await open(url, { rm: true });
  const rm = await page.evaluate(() => ({
    mediaMatches: matchMedia('(prefers-reduced-motion: reduce)').matches,
    running: document.getAnimations().filter(a => a.playState === 'running').length,
    hiddenReveals: [...document.querySelectorAll('.reveal, [class*="reveal"]')]
      .filter(e => { const cs = getComputedStyle(e); return parseFloat(cs.opacity) < 0.99 || (cs.transform !== 'none' && cs.transform !== 'matrix(1, 0, 0, 1, 0, 0)'); }).length,
    revealCount: document.querySelectorAll('.reveal, [class*="reveal"]').length,
    invisibleText: [...document.querySelectorAll('main p, main h1, main h2, main h3, main li')]
      .filter(e => parseFloat(getComputedStyle(e).opacity) < 0.99).length,
  }));
  R.reducedMotion[slug] = rm;
  await ctx.close();
}

// ---- 4. hover ↔ focus-visible parity ----
const PARITY_ROUTES = [['home','/'], ['work-flagstone','/work/flagstone/'], ['about','/about/'], ['colophon','/colophon/'], ['work','/work/']];
for (const [slug, url] of PARITY_ROUTES) {
  const { ctx, page } = await open(url);
  const res = await page.evaluate(() => {
    const els = [...document.querySelectorAll('main a, main button, nav a, footer a')].slice(0, 90);
    const PROPS = ['color','textDecorationLine','textDecorationColor','borderBottomColor','backgroundColor','opacity'];
    const snap = e => { const cs = getComputedStyle(e); const o = {}; for (const p of PROPS) o[p] = cs[p]; return o; };
    const out = { checked: 0, hoverChanges: 0, focusChanges: 0, mismatches: [] };
    for (const e of els) {
      const rest = snap(e);
      e.classList.add('__j-hover'); // no-op: we compare via :hover rules below
      // simulate by reading the CSSOM rules that match :hover / :focus-visible for this element
      let hoverDecl = {}, focusDecl = {};
      for (const sheet of document.styleSheets) {
        let rules; try { rules = sheet.cssRules; } catch { continue; }
        for (const r of rules) {
          if (!r.selectorText) continue;
          for (const sel of r.selectorText.split(',')) {
            const s = sel.trim();
            if (s.includes(':hover') && !s.includes(':focus')) {
              try { if (e.matches(s.replace(/:hover/g,''))) for (const p of PROPS) { const v = r.style[p]; if (v) hoverDecl[p]=v; } } catch {}
            } else if (s.includes(':focus-visible')) {
              try { if (e.matches(s.replace(/:focus-visible/g,''))) for (const p of PROPS) { const v = r.style[p]; if (v) focusDecl[p]=v; } } catch {}
            }
          }
        }
      }
      e.classList.remove('__j-hover');
      out.checked++;
      if (Object.keys(hoverDecl).length) out.hoverChanges++;
      if (Object.keys(focusDecl).length) out.focusChanges++;
      const hk = Object.keys(hoverDecl).sort().join(','), fk = Object.keys(focusDecl).sort().join(',');
      if (hk && fk && hk !== fk) out.mismatches.push({ text: (e.textContent||'').trim().slice(0,34), hover: hk, focus: fk });
    }
    return out;
  });
  R.hoverFocusParity[slug] = res;
  await ctx.close();
}

// ---- 5. method links: reachable by hover AND focus AND touch ----
for (const [slug, url] of [['home','/'], ['work-flagstone','/work/flagstone/'], ['accessibility','/accessibility/']]) {
  const { ctx, page } = await open(url);
  const links = await page.evaluate(() => [...document.querySelectorAll('a[href*="method"], a[href*="#flagstone-test-count-method"], a[href*="receipts"], a[href*="evidence"]')]
    .map(a => { const r = a.getBoundingClientRect(); const cs = getComputedStyle(a);
      return { href: a.getAttribute('href'), text: (a.textContent||'').trim().slice(0,40),
               visibleAtRest: parseFloat(cs.opacity) > 0.01 && r.width > 0 && r.height > 0,
               w: Math.round(r.width), h: Math.round(r.height),
               tabbable: a.tabIndex >= 0 && !a.hasAttribute('inert'),
               hitH: Math.round(r.height), targetOK: r.height >= 24 || !!cs.getPropertyValue('--tap') };
    }));
  // touch: does a real tap navigate?
  let tapWorks = null;
  if (links.length) {
    try { const t = await browser.newContext({ viewport:{width:390,height:844}, hasTouch:true, isMobile:true });
      const p2 = await t.newPage(); await p2.goto(BASE + url, { waitUntil:'networkidle' });
      const sel = 'a[href*="method"], a[href*="receipts"]';
      const el = await p2.$(sel);
      if (el) { await el.scrollIntoViewIfNeeded(); await el.tap(); await p2.waitForTimeout(400);
        tapWorks = { hash: new URL(p2.url()).hash || '(no hash)', url: p2.url().replace(BASE,'') }; }
      await t.close();
    } catch (e) { tapWorks = { error: String(e).slice(0,120) }; }
  }
  R.methodLinks[slug] = { links, tap: tapWorks };
  await ctx.close();
}

await browser.close();
fs.writeFileSync(OUT, JSON.stringify(R, null, 2));
const kbTot = Object.values(R.keyboard).reduce((a,v)=>a+v.stops,0);
const kbBad = Object.values(R.keyboard).reduce((a,v)=>a+v.stopsWithoutRing,0);
const rf320 = Object.entries(R.reflow).filter(([,v])=>v.at320.overflow).map(([k])=>k);
const rf200 = Object.entries(R.reflow).filter(([,v])=>v.at200pct.overflow).map(([k])=>k);
const rmBad = Object.entries(R.reducedMotion).filter(([,v])=>v.hiddenReveals>0||v.invisibleText>0||v.running>0).map(([k,v])=>`${k}(run:${v.running},hidden:${v.hiddenReveals},invisText:${v.invisibleText})`);
console.log(`\n[j-a11y] keyboard: ${kbTot - kbBad}/${kbTot} focus stops carry a visible ring   (${kbBad} without)`);
console.log(`[j-a11y] 320px reflow overflow: ${rf320.length ? rf320.join(', ') : 'NONE (17/17 clean)'}`);
console.log(`[j-a11y] 200% text overflow:    ${rf200.length ? rf200.join(', ') : 'NONE (17/17 clean)'}`);
console.log(`[j-a11y] reduced-motion issues: ${rmBad.length ? rmBad.join(', ') : 'NONE (17/17 at rest, visible)'}`);
console.log('[j-a11y] →', OUT);
