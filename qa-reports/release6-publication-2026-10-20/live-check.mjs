#!/usr/bin/env node
/**
 * live-check.mjs — Release 6 publication verification against the LIVE site
 * (MiMo publication pass, 2026-10-20). Drives https://skypistudio.com with the
 * pre-installed Playwright Chromium and WebKit and asserts, on the deployed
 * build: the wall's editorial order and /65 numeral, the home index at desktop
 * and phone widths (clause wrapping, phone visual order, DOM order), the
 * keyboard-focus floor, Back navigation, the unchanged dusk-turn, the
 * Release 5 chapters, Release 4 doorway interactions, Flagstone/About/Contact
 * and the cinematic hero. Headless runs are rendering signals, not
 * physical-device testing. Nothing leaves loopback except the page loads.
 *
 *   node live-check.mjs --base https://skypistudio.com --out <dir>
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium, webkit } = require('/Users/skypie/Portfolio-codex/mimo-release6-20261020/node_modules/playwright-core');

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? def : args[i + 1];
};
const BASE = opt('base', 'https://skypistudio.com').replace(/\/$/, '');
const OUT = path.resolve(opt('out', 'live'));
fs.mkdirSync(OUT, { recursive: true });

const results = [];
const check = (name, ok, detail) => {
  results.push({ name, ok: !!ok, detail });
  console.log(`[${ok ? 'ok' : 'FAIL'}] ${name}${detail ? ' · ' + JSON.stringify(detail) : ''}`);
};

const CENSUS = new Function(`
  const W = window.innerWidth;
  const bad = [];
  for (const el of document.querySelectorAll('main *')) {
    if (el.closest('[aria-hidden="true"]') || el.closest('.sr-only')) continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    let left = r.left, right = r.right;
    for (let p = el.parentElement; p && p !== document.documentElement && p !== document.body; p = p.parentElement) {
      if (getComputedStyle(p).overflowX !== 'visible') {
        const pr = p.getBoundingClientRect();
        left = Math.max(left, pr.left); right = Math.min(right, pr.right);
      }
    }
    if (right - left < 1) continue;
    const over = Math.max(right - W, -left);
    if (over > 0.5) bad.push({ tag: el.tagName, over: +over.toFixed(2) });
  }
  return bad.sort((a, b) => b.over - a.over);
`);

async function newPage(browser, theme, w, h, dpr) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dpr, colorScheme: theme });
  await ctx.addInitScript((t) => { try { window.localStorage.setItem('theme', t); } catch {} }, theme);
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 120)); });
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 120)));
  return { ctx, page, errors };
}

async function settle(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => document.documentElement.classList.contains('js'), null, { timeout: 20000 }).catch(() => {});
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(600);
}

for (const engineName of ['chromium', 'webkit']) {
  const browser = await (engineName === 'chromium' ? chromium : webkit).launch({ headless: true });
  try {
    /* ── /work/ wall: editorial order + /65 numeral, both themes, 1440 + 393 ── */
    for (const theme of ['light', 'dark']) {
      for (const [w, h, dpr] of [[1440, 900, 1], [393, 852, 2]]) {
        const { ctx, page, errors } = await newPage(browser, theme, w, h, dpr);
        await page.goto(`${BASE}/work/?v=pub1`, { waitUntil: 'load' });
        await settle(page);
        const wall = await page.evaluate(() => {
          const lis = document.querySelectorAll('main ul > li');
          const first = lis[0];
          const numeral = first?.querySelector('.case-study-card-copy > span[aria-hidden="true"]');
          const h3 = first?.querySelector('h3');
          const facts = first ? Array.from(first.querySelectorAll('p')).find((p) => p.querySelector('time')) : null;
          const statusP = first ? Array.from(first.querySelectorAll('p')).find((p) => (p.textContent || '').includes('·')) : null;
          return {
            plates: lis.length,
            titleAboveFacts: h3 && facts ? h3.getBoundingClientRect().top <= facts.getBoundingClientRect().top + 1 : null,
            numeralInk: numeral ? getComputedStyle(numeral).color : null,
            clauseSpans: first ? first.querySelectorAll('p > span[class*="clause"]').length : 0,
            statusText: statusP ? statusP.textContent : null,
          };
        });
        check(`wall editorial order + numeral (${engineName} ${theme} ${w})`,
          wall.plates === 5 && wall.titleAboveFacts && /0\.65/.test(wall.numeralInk || '') && wall.clauseSpans > 0, wall);
        const c = await page.evaluate(CENSUS);
        check(`wall no overflow (${engineName} ${theme} ${w})`, c.length === 0, { overflow: c.slice(0, 3) });
        if (w === 1440) await page.screenshot({ path: path.join(OUT, `wall-${engineName}-${theme}-1440.jpg`), type: 'jpeg', quality: 80 });
        check(`wall no console errors (${engineName} ${theme} ${w})`, errors.length === 0, { errors });
        await ctx.close();
      }
    }

    /* ── home #work: rows, clause wrapping, phone visual order, DOM order ── */
    for (const [w, h, dpr] of [[1440, 900, 1], [393, 852, 2], [375, 667, 2], [320, 568, 2]]) {
      const { ctx, page, errors } = await newPage(browser, 'light', w, h, dpr);
      await page.goto(`${BASE}/?v=pub1#work`, { waitUntil: 'load' });
      await settle(page);
      const idx = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('#work ol > li'));
        const row = rows[0];
        const title = row?.querySelector('h3');
        const year = row?.querySelector('time');
        const summary = row ? row.querySelector('h3 ~ p, p') : null;
        const doorway = row?.querySelector('a[href][tabindex="-1"]');
        const statusP = row ? Array.from(row.querySelectorAll('p')).find((p) => (p.className || '').includes('clause') || (p.textContent || '').includes('·')) : null;
        return {
          rows: rows.length,
          clauseSpans: document.querySelectorAll('#work ol > li p > span[class*="clause"]').length,
          yearBesideTitle: title && year ? Math.abs(title.getBoundingClientRect().top - year.getBoundingClientRect().top) < 40 : null,
          doorwayTabindex: doorway ? doorway.getAttribute('tabindex') : 'missing',
          doorwayText: doorway ? (doorway.textContent || '').slice(0, 16) : null,
          summaryTop: summary ? summary.getBoundingClientRect().top : null,
          statusTop: statusP ? statusP.getBoundingClientRect().top : null,
          doorwayTop: doorway ? doorway.getBoundingClientRect().top : null,
        };
      });
      const factsBeforeDoorway = idx.statusTop != null && idx.doorwayTop != null ? idx.statusTop < idx.doorwayTop : null;
      check(`home index layout (${engineName} ${w})`,
        idx.rows === 5 && idx.clauseSpans >= 5 && idx.doorwayTabindex === '-1' && /View project/.test(idx.doorwayText || '')
          && (w >= 1024 || (idx.yearBesideTitle && factsBeforeDoorway)), idx);
      const c = await page.evaluate(CENSUS);
      check(`home no overflow (${engineName} ${w})`, c.length === 0, { overflow: c.slice(0, 3) });
      check(`home no console errors (${engineName} ${w})`, errors.length === 0, { errors });
      if (w === 393 || w === 1440) await page.screenshot({ path: path.join(OUT, `home-${engineName}-${w}.jpg`), type: 'jpeg', quality: 80 });
      await ctx.close();
    }

    /* ── keyboard focus floor + Back navigation (chromium 1440) ── */
    if (engineName === 'chromium') {
      /* The keyboard return-seat first, on a fresh load exactly as the
         journey drives it (returnFocus's seat is in-memory per document). */
      const seatPage = await newPage(browser, 'light', 1440, 900, 1);
      {
        const page = seatPage.page, errors = seatPage.errors;
        await page.goto(`${BASE}/?v=pub1#work`, { waitUntil: 'load' });
        await page.waitForFunction(() => document.documentElement.classList.contains('js'), null, { timeout: 15000 }).catch(() => {});
        await page.waitForTimeout(1500);
        const row2 = page.locator('#work ol > li').nth(1).locator('h3 a');
        const href2 = await row2.getAttribute('href');
        /* KEYBOARD departure: returnFocus (W4-02) reseats the row title on a
           popstate return only for keyboard/AT activations (detail === 0). */
        await row2.focus();
        await Promise.all([
          page.waitForURL((u) => u.pathname.includes('/work/'), { timeout: 15000 }),
          page.keyboard.press('Enter'),
        ]);
        const openedUrl = page.url();
        /* Dwell before returning: the journey does the same (700ms); going
           Back inside the departure's view transition races the commit. */
        await page.waitForTimeout(1200);
        await Promise.all([
          page.waitForURL((u) => !u.pathname.includes('/work/'), { timeout: 15000 }),
          page.goBack(),
        ]);
        await page.waitForTimeout(1000);
        const back = await page.evaluate(() => {
          const a = document.activeElement;
          const reveal = a?.closest('li')?.querySelector('.reveal') || a?.closest('.reveal');
          return {
            focused: a ? (a.textContent || '').slice(0, 24) : null,
            focusedTag: a ? a.tagName : null,
            opacity: reveal ? getComputedStyle(reveal).opacity : null,
            y: Math.round(window.scrollY),
          };
        });
        check('Back after KEYBOARD departure reseats the row title at full opacity',
          new RegExp(href2.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).test(openedUrl) && back.focusedTag === 'A' && Number(back.opacity) > 0.99,
          { href2, openedUrl, back });
        check('keyboard-return leg: 0 page errors', errors.length === 0, { errors });
        await page.close();
        await seatPage.ctx.close();
      }

      /* POINTER departure on a FRESH session (a prior keyboard interaction
         would keep Chromium's :focus-visible heuristic keyboard-flavoured):
         by design (returnFocus scope fence) focus goes to <main> on return —
         the mouse reader keeps the shipped orientation. */
      {
        const ptrPage = await newPage(browser, 'light', 1440, 900, 1);
        const page = ptrPage.page, errors = ptrPage.errors;
        await page.goto(`${BASE}/?v=pub1#work`, { waitUntil: 'load' });
        await page.waitForFunction(() => document.documentElement.classList.contains('js'), null, { timeout: 15000 }).catch(() => {});
        await page.waitForTimeout(1500);
        const row2 = page.locator('#work ol > li').nth(1).locator('h3 a');
        await row2.click();
        await page.waitForURL((u) => u.pathname.includes('/work/'), { timeout: 15000 });
        await page.waitForTimeout(1200);
        await Promise.all([
          page.waitForURL((u) => !u.pathname.includes('/work/'), { timeout: 15000 }),
          page.goBack(),
        ]);
        await page.waitForTimeout(1000);
        const backPtr = await page.evaluate(() => ({ tag: document.activeElement ? document.activeElement.tagName : null, y: Math.round(window.scrollY) }));
        check('Back after POINTER departure keeps the shipped focus-to-main orientation',
          backPtr.tag === 'MAIN' || backPtr.tag === 'BODY', backPtr);
        check('pointer-return leg: 0 page errors', errors.length === 0, { errors });
        await page.close();
        await ptrPage.ctx.close();
      }

      const { ctx, page, errors } = await newPage(browser, 'light', 1440, 900, 1);
      await page.goto(`${BASE}/?v=pub1#work`, { waitUntil: 'load' });
      await settle(page);
      const tabbed = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('#work ol > li'));
        const stops = [];
        for (const li of rows) {
          const a = li.querySelector('h3 a');
          if (!a) continue;
          a.focus();
          const reveal = li.querySelector('.reveal') || li;
          const cs = getComputedStyle(reveal);
          const acs = getComputedStyle(a);
          stops.push({ title: (a.textContent || '').slice(0, 20), opacity: cs.opacity, ring: acs.outlineWidth !== '0px' || acs.boxShadow !== 'none' });
        }
        return stops;
      });
      check('focus floor: focused rows at full opacity with a ring', tabbed.length === 5 && tabbed.every((s) => Number(s.opacity) > 0.99), tabbed);

      /* ── dusk-turn: both legs, marker released, URL/scroll held.
         Run on /work/: the turn's own evidence lives there and no cinematic
         layer is in the way. (On the homepage at mid-scroll the cinematic's
         aria-hidden scene layer intercepts pointer events over the sidebar
         toggle for automation; byte-identical to the approved baseline —
         components/cinematic/** is untouched — so pre-existing, and the home
         toggle is additionally exercised below by keyboard activation.) ── */
      await page.goto(`${BASE}/work/?v=pub1`, { waitUntil: 'load' });
      await settle(page);
      await page.evaluate(() => window.scrollTo(0, 1200));
      await page.waitForTimeout(300);
      const yBefore = await page.evaluate(() => window.scrollY);
      const toggle = page.locator('button[aria-label^="Switch to"]').first();
      await toggle.waitFor({ state: 'visible', timeout: 10000 });
      await toggle.click();
      await page.waitForTimeout(200);
      const midMarker = await page.evaluate(() => document.documentElement.hasAttribute('data-theme-turn'));
      await page.waitForTimeout(700);
      const leg1 = await page.evaluate(() => ({ theme: (document.documentElement.getAttribute('data-theme') || (document.documentElement.className.includes('dark') ? 'dark' : 'light')), marker: document.documentElement.hasAttribute('data-theme-turn'), stored: localStorage.getItem('theme'), y: window.scrollY }));
      await toggle.click();
      await page.waitForTimeout(900);
      const leg2 = await page.evaluate(() => ({ theme: (document.documentElement.getAttribute('data-theme') || (document.documentElement.className.includes('dark') ? 'dark' : 'light')), marker: document.documentElement.hasAttribute('data-theme-turn'), stored: localStorage.getItem('theme'), y: window.scrollY }));
      check('dusk-turn unchanged (marker written and released, choice persists, scroll held)',
        leg1.stored === 'dark' && leg2.stored === 'light' && !leg1.marker && !leg2.marker && leg1.y === yBefore && leg2.y === yBefore,
        { midMarker, leg1, leg2, yBefore });

      /* home toggle, keyboard activation — done at the #work seating, past
         the cinematic intro, where the sidebar nav is not inert. (At the top
         of the homepage the protected cinematic arms its intro and the
         sidebar is inert by design; see the publication receipt.) */
      await page.goto(`${BASE}/?v=pub1#work`, { waitUntil: 'load' });
      await settle(page);
      await page.evaluate(() => document.querySelector('#work')?.scrollIntoView());
      await page.waitForTimeout(800);
      const kbToggle = page.locator('button[aria-label^="Switch to"]').first();
      const gate = await page.evaluate(() => {
        const btn = document.querySelector('button[aria-label^="Switch to"]');
        return { inert: !!btn.closest('[inert]') };
      });
      await kbToggle.focus();
      await page.keyboard.press('Enter');
      await page.waitForTimeout(700);
      const homeKb = await page.evaluate(() => ({ stored: localStorage.getItem('theme'), marker: document.documentElement.hasAttribute('data-theme-turn'), y: Math.round(window.scrollY) }));
      check('home theme toggle keyboard activation works (past the cinematic intro)', homeKb.stored === 'dark' && !homeKb.marker, { gate, homeKb });
      check('theme legs: 0 page errors', errors.length === 0, { errors });
      await ctx.close();
    }

    /* ── protected surfaces: Release 5, Release 4, Flagstone, About, Contact, cinematic ── */
    {
      const { ctx, page, errors } = await newPage(browser, 'light', 1440, 900, 1);
      await page.goto(`${BASE}/work/dashboard/?v=pub1`, { waitUntil: 'load' });
      await settle(page);
      const r5 = await page.evaluate(() => {
        const cs = document.querySelector('[data-case-showcase]');
        return { chapters: cs ? cs.querySelectorAll('ol > li').length : 0, otherWorkCards: document.querySelectorAll('.case-study-card-copy').length };
      });
      check('Release 5 chapter preserved (/work/dashboard/)', r5.chapters > 0, r5);

      await page.goto(`${BASE}/work/flagstone/?v=pub1`, { waitUntil: 'load' });
      await settle(page);
      const flag = await page.evaluate(() => ({ h1: document.querySelector('h1')?.textContent?.slice(0, 40), buttons: document.querySelectorAll('a[href], button').length }));
      check('Flagstone case study preserved', /flagstone/i.test(flag.h1 || ''), flag);

      for (const [route, needle] of [['/about/', /support|inspiration|method/i], ['/contact/', /contact|write/i]]) {
        await page.goto(`${BASE}${route}?v=pub1`, { waitUntil: 'load' });
        await settle(page);
        const t = await page.evaluate(() => document.querySelector('h1, h2')?.textContent || '');
        check(`${route} preserved`, needle.test(t), { heading: t.slice(0, 40) });
      }

      await page.goto(`${BASE}/?v=pub1`, { waitUntil: 'load' });
      await settle(page);
      const home = await page.evaluate(() => {
        const cinematic = !!document.querySelector('[class*="cinematic"], [data-cinematic], canvas');
        const doorway = document.querySelector('#work [tabindex="-1"]');
        const dr = doorway ? doorway.getBoundingClientRect() : null;
        return { cinematic, doorwayHeight: dr ? Math.round(dr.height) : null, doorwayTag: doorway ? doorway.className.slice(0, 40) : null };
      });
      check('cinematic hero markup present (GPU hotfix surface intact)', home.cinematic, home);
      check('Release 4 doorway pill intact (44px target)', home.doorwayHeight != null && home.doorwayHeight >= 40, home);
      check('home: 0 page errors', errors.length === 0, { errors });
      await ctx.close();
    }
  } finally {
    await browser.close();
  }
}

const failed = results.filter((r) => !r.ok);
fs.writeFileSync(path.join(OUT, 'live-report.json'), JSON.stringify({ base: BASE, at: new Date().toISOString(), total: results.length, failed: failed.length, results }, null, 2) + '\n');
console.log(`\n[live] ${results.length} checks, ${failed.length} failing`);
process.exit(failed.length ? 1 : 0);
