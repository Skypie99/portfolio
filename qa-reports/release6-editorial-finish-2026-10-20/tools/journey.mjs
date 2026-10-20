#!/usr/bin/env node
/**
 * journey.mjs — the normal visitor journey, driven by keyboard and pointer on
 * a BUILT export: land on the home index, Tab through it, open a project with
 * Enter, go Back and check the focus seat and the scroll position, open /work/
 * and walk its plates, open a plate, Back, flip the theme (both legs), and
 * reach the contact action. Nothing is sent. Writes a JSON log and a few
 * focus-state screenshots.
 *
 *   node journey.mjs --dir <export dir> --out <dir> [--size 1440x900@1] [--theme light]
 */
import fs from 'node:fs';
import path from 'node:path';
import { opt, parseSizes, resolveChromium, serve, chromium, makeContext, load, sleep } from './lib.mjs';

const DIR = path.resolve(opt('dir', 'out'));
const OUT = path.resolve(opt('out'));
const SIZE = parseSizes(opt('size', '1440x900@1'))[0];
const THEME = opt('theme', 'light');
const PORT = Number(opt('port', 3251));
const BASE = `http://127.0.0.1:${PORT}`;
fs.mkdirSync(OUT, { recursive: true });

const log = [];
const note = (step, data) => {
  log.push({ step, ...data });
  console.log(`[journey] ${step}: ${JSON.stringify(data)}`);
};
const active = (page) =>
  page.evaluate(() => {
    const el = document.activeElement;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      tag: el.tagName.toLowerCase(),
      text: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 60),
      href: el.getAttribute('href'),
      visible: r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight,
      opacity: Number(getComputedStyle(el).opacity),
      ringVisible: getComputedStyle(el).outlineStyle !== 'none' && parseFloat(getComputedStyle(el).outlineWidth) > 0,
      ancestorOpacity: (() => {
        let o = 1;
        for (let n = el; n; n = n.parentElement) o = Math.min(o, Number(getComputedStyle(n).opacity));
        return o;
      })(),
    };
  });

const engine = resolveChromium();
const server = await serve(DIR, PORT);
const browser = await chromium.launch({ headless: true, executablePath: engine });
try {
  const ctx = await makeContext(browser, { ...SIZE, theme: THEME, mode: 'normal' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));

  // 1. Direct entry at /#work (the hero CTA's destination): seated reveals, nothing hidden.
  await load(page, BASE + '/#work');
  const seated = await page.evaluate(() => {
    const work = document.querySelector('#work');
    const reveals = Array.from(work.querySelectorAll('.reveal'));
    const hidden = reveals.filter((r) => Number(getComputedStyle(r).opacity) < 0.99);
    return {
      reveals: reveals.length,
      hidden: hidden.length,
      hiddenWhich: hidden.map((r) => `${(r.textContent || '').trim().slice(0, 18)} @top ${Math.round(r.getBoundingClientRect().top)}px (viewport ${window.innerHeight}px)`),
      scrollY: Math.round(window.scrollY),
      workTop: Math.round(work.getBoundingClientRect().top),
    };
  });
  note('hash arrival /#work', seated);

  // 2. Keyboard: focus the first row title and walk the five rows.
  await page.focus('#work ol h3 a');
  const stops = [];
  for (let i = 0; i < 9; i++) {
    stops.push(await active(page));
    await page.keyboard.press('Tab');
    await sleep(60);
  }
  note('tab walk from row 01', { stops: stops.map((s) => `${s.tag}:${s.text}${s.ringVisible ? ' (ring)' : ''}${s.ancestorOpacity < 0.99 ? ' FAINT' : ''}`) });
  await page.focus('#work ol h3 a');
  await page.screenshot({ path: path.join(OUT, 'focus-index-row01.jpg'), type: 'jpeg', quality: 85 });

  // 3. Enter on row 02's title → the case study; then Back → the return seat.
  const row2 = (await page.$$('#work ol h3 a'))[1];
  await row2.focus();
  const before = await page.evaluate(() => ({ y: Math.round(window.scrollY) }));
  await page.keyboard.press('Enter');
  await page.waitForURL(/\/work\/[^/]+\/$/);
  await page.waitForFunction(() => document.documentElement.classList.contains('js'));
  await sleep(700);
  note('opened from row 02', { url: page.url(), focus: await active(page) });
  await page.goBack();
  await page.waitForURL(/\/(#work)?$/);
  await sleep(900);
  const afterBack = await page.evaluate(() => ({ y: Math.round(window.scrollY) }));
  note('back to home', { scrollBefore: before.y, scrollAfter: afterBack.y, focus: await active(page) });
  await page.screenshot({ path: path.join(OUT, 'focus-after-back.jpg'), type: 'jpeg', quality: 85 });

  // 4. Pointer: open /work/, walk plates, open plate 03 by its title, Back; the wall must not replay.
  await page.goto(BASE + '/work/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.documentElement.classList.contains('js'));
  await sleep(1500);
  const firstVisit = await page.evaluate(() => ({ wallSeen: document.querySelector('[data-wall-seen]') !== null }));
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.45));
  await sleep(1200);
  const plate3 = (await page.$$('.case-study-card h3 a'))[2];
  await plate3.scrollIntoViewIfNeeded();
  await sleep(400);
  const plateBox = await plate3.boundingBox();
  const yBeforeOpen = await page.evaluate(() => Math.round(window.scrollY));
  await plate3.click();
  await page.waitForURL(/\/work\/[^/]+\/$/);
  await sleep(600);
  note('opened plate 03 by pointer', { url: page.url(), firstVisitWallSeen: firstVisit.wallSeen });
  await page.goBack();
  await page.waitForURL(/\/work\/$/);
  await sleep(700);
  const wallBack = await page.evaluate(() => ({
    y: Math.round(window.scrollY),
    wallSeen: document.querySelector('[data-wall-seen]') !== null,
    hiddenPlates: Array.from(document.querySelectorAll('ul > li > .reveal')).filter((r) => Number(getComputedStyle(r).opacity) < 0.99).length,
  }));
  note('back to /work/', { scrollBeforeOpen: yBeforeOpen, ...wallBack, plateTitleY: Math.round(plateBox?.y ?? -1) });
  await page.screenshot({ path: path.join(OUT, 'wall-after-back.jpg'), type: 'jpeg', quality: 85 });
  // Settle watch: does the restored position hold with no input for 3 s?
  const watch = [];
  for (let i = 0; i < 30; i++) {
    watch.push(await page.evaluate(() => Math.round(window.scrollY)));
    await sleep(100);
  }
  note('restored position settle watch (3 s, no input)', { first: watch[0], min: Math.min(...watch), max: Math.max(...watch), last: watch.at(-1), height: await page.evaluate(() => document.documentElement.scrollHeight) });

  // 5. Theme: both legs via the header toggle, while scrolled; routing and scroll must not change.
  // The toggle lives in the sidebar. Click it by coordinates: a locator click
  // that fails its first hit-target check retries with scrollIntoView at
  // other alignments, which on a sticky sidebar scrolls the DOCUMENT and
  // would read as a scroll jump the site never made (seen, diagnosed,
  // reproduced as harness-only in the review's back-toggle probe).
  const toggle = page.locator('button[aria-label^="Switch to"]').first();
  const clickToggle = async () => {
    const b = await toggle.boundingBox();
    await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
  };
  const y0 = await page.evaluate(() => Math.round(window.scrollY));
  const url0 = page.url();
  for (const leg of [1, 2]) {
    const label = await toggle.getAttribute('aria-label');
    await clickToggle();
    // Headless software rendering can hold the 420 ms turn's pseudo tree
    // open past a second; while it is open it takes the pointer. Wait it out.
    await sleep(1600);
    const st = await page.evaluate(() => ({ dark: document.documentElement.classList.contains('dark'), turnMarker: document.documentElement.dataset.themeTurn ?? null, y: Math.round(window.scrollY), stored: localStorage.getItem('theme') }));
    note(`theme leg ${leg}`, { clicked: label, ...st, urlUnchanged: page.url() === url0, scrollUnchanged: st.y === y0 });
  }
  // rapid double toggle: the marker must be released, the theme must end where it started.
  await clickToggle();
  await sleep(60);
  await clickToggle();
  await sleep(1600);
  note('rapid double toggle', await page.evaluate(() => ({ dark: document.documentElement.classList.contains('dark'), turnMarker: document.documentElement.dataset.themeTurn ?? null, y: Math.round(window.scrollY) })));

  // 6. Reach the contact action by keyboard from the top of the document.
  await page.evaluate(() => { window.scrollTo(0, 0); document.body.focus?.(); });
  await page.keyboard.press('Tab');
  const path6 = [];
  for (let i = 0; i < 24; i++) {
    const a = await active(page);
    path6.push(`${a.tag}:${a.text}${a.ringVisible ? ' (ring)' : ''}`);
    if (a.href && /\/contact\/?$/.test(a.href)) break;
    await page.keyboard.press('Tab');
    await sleep(40);
  }
  const reached = await active(page);
  const focusVisible = await page.evaluate(() => document.activeElement?.matches(':focus-visible') ?? false);
  note('keyboard path to contact', { stops: path6, reached: `${reached.tag}:${reached.text} ${reached.href}`, focusVisible, faint: reached.ancestorOpacity < 0.99 });
  await page.screenshot({ path: path.join(OUT, 'focus-contact.jpg'), type: 'jpeg', quality: 85 });
  note('page errors', { count: errors.length, errors: errors.slice(0, 5) });
} finally {
  await browser.close();
  server.kill('SIGTERM');
}
fs.writeFileSync(path.join(OUT, 'journey.json'), JSON.stringify({ dir: DIR, at: new Date().toISOString(), size: SIZE.tag, theme: THEME, log }, null, 2));
