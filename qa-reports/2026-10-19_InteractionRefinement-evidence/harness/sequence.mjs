#!/usr/bin/env node
/**
 * press-evidence/sequence.mjs — the navigation acknowledgement, recorded.
 *
 *   node sequence.mjs --base http://127.0.0.1:3106 --out ./after-seq --label after
 *
 * Records real video of: press (held) → release → the route dissolve →
 * arrival → history Back → the restored page, and measures the doorway's
 * computed state after Back (nothing may look pressed or hovered). Phones use
 * the same touch-from-mouse path as harness.mjs; desktop uses the mouse.
 * A second phone sequence does the same through the hamburger menu.
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const arg = (flag, dflt) => {
  const i = process.argv.indexOf(flag);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : dflt;
};
const BASE = arg('--base', 'http://127.0.0.1:3106');
const OUT = path.resolve(arg('--out', 'seq'));
const LABEL = arg('--label', 'run');
fs.mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const R = Math.round;

const PROBE = (sel) => {
  const el = document.querySelector(sel);
  if (!el) return { missing: sel };
  const cs = getComputedStyle(el);
  const dot = el.querySelector('span[aria-hidden="true"].rounded-full');
  return {
    active: el.matches(':active'), hover: el.matches(':hover'), focus: el.matches(':focus'), focusVisible: el.matches(':focus-visible'),
    borderColor: cs.borderTopColor, backgroundColor: cs.backgroundColor, transform: cs.transform, boxShadow: cs.boxShadow,
    dot: dot ? { width: getComputedStyle(dot).width, backgroundColor: getComputedStyle(dot).backgroundColor } : null,
    anyActive: Boolean(document.querySelector(':active')),
    activeElement: document.activeElement?.tagName + (document.activeElement?.id ? '#' + document.activeElement.id : ''),
    path: location.pathname,
  };
};

const RUNS = [
  { name: 'phone-393-light', vp: { width: 393, height: 852 }, touch: true, theme: 'light' },
  { name: 'phone-393-dark', vp: { width: 393, height: 852 }, touch: true, theme: 'dark' },
  { name: 'desktop-1440-light', vp: { width: 1440, height: 900 }, touch: false, theme: 'light' },
];

const results = [];
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

for (const run of RUNS) {
  const videoDir = path.join(OUT, 'video', run.name);
  fs.mkdirSync(videoDir, { recursive: true });
  const context = await browser.newContext({
    viewport: run.vp, isMobile: run.touch, hasTouch: run.touch, colorScheme: run.theme,
    deviceScaleFactor: 1, reducedMotion: 'no-preference',
    recordVideo: { dir: videoDir, size: run.vp },
  });
  const t0 = Date.now();
  const page = await context.newPage();
  const cdp = run.touch ? await context.newCDPSession(page) : null;
  const marks = [];
  const mark = (what) => marks.push({ what, t: Date.now() - t0 });

  const press = async (x, y, hold) => {
    if (run.touch) await cdp.send('Input.emulateTouchFromMouseEvent', { type: 'mousePressed', x: R(x), y: R(y), button: 'left', clickCount: 1 });
    else { await page.mouse.move(x, y, { steps: 4 }); await page.mouse.down(); }
    mark('press');
    await sleep(hold);
    if (run.touch) await cdp.send('Input.emulateTouchFromMouseEvent', { type: 'mouseReleased', x: R(x), y: R(y), button: 'left', clickCount: 1 });
    else await page.mouse.up();
    mark('release');
  };

  // ── Sequence A: doorway press → dissolve → /work/flagstone/ → Back
  await page.goto(BASE + '/', { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const doorway = page.locator('#flagship a.rounded-pill.h-11').first();
  await doorway.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await sleep(1200);
  mark('settled');
  const box = await doorway.boundingBox();
  const before = await page.evaluate(PROBE, '#flagship a.rounded-pill.h-11');
  await press(box.x + box.width / 2, box.y + box.height / 2, 350);
  await page.waitForURL(/\/work\/flagstone\/?$/, { timeout: 8000 });
  mark('arrived');
  await sleep(1100); // the 420ms dissolve + settle
  const arrived = await page.evaluate(PROBE, 'main a.rounded-pill.h-14');
  await page.goBack();
  await page.waitForURL((u) => u.pathname === '/', { timeout: 8000 });
  mark('back');
  await sleep(1200);
  const restored = await page.evaluate(PROBE, '#flagship a.rounded-pill.h-11');
  await page.screenshot({ path: path.join(OUT, `${run.name}-A-after-back.png`), caret: 'hide' });
  if (!run.touch) { await page.mouse.move(2, 2); await sleep(400); }
  const restoredAway = await page.evaluate(PROBE, '#flagship a.rounded-pill.h-11');

  // ── Sequence B (phones): hamburger → item press → navigate → Back
  let seqB = null;
  if (run.touch) {
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await sleep(500);
    const trigger = page.locator('button[aria-label="Open navigation menu"]');
    const tb = await trigger.boundingBox();
    mark('menu-open-tap');
    await press(tb.x + tb.width / 2, tb.y + tb.height / 2, 120);
    await page.locator('#primary-menu').waitFor({ state: 'visible' });
    await sleep(1300);
    const item = page.locator('#primary-menu nav ul li a', { hasText: 'Credentials' }).first();
    const ib = await item.boundingBox();
    const itemBefore = await item.evaluate((el) => ({ color: getComputedStyle(el).color }));
    mark('item-press');
    await press(ib.x + ib.width / 2, ib.y + ib.height / 2, 350);
    await page.waitForURL(/\/certificates\/?$/, { timeout: 8000 });
    mark('item-arrived');
    await sleep(1100);
    const menuGone = await page.evaluate(() => !document.querySelector('#primary-menu'));
    await page.goBack();
    await page.waitForURL((u) => u.pathname === '/', { timeout: 8000 });
    mark('item-back');
    await sleep(1200);
    const triggerState = await page.evaluate(PROBE, 'button[aria-label="Open navigation menu"]');
    const menuStillGone = await page.evaluate(() => !document.querySelector('#primary-menu'));
    await page.screenshot({ path: path.join(OUT, `${run.name}-B-after-back.png`), caret: 'hide' });
    seqB = { itemBefore, menuGone, triggerState, menuStillGone };
  }

  mark('end');
  const video = page.video();
  await context.close();
  const videoPath = await video.path();
  const finalPath = path.join(OUT, `${run.name}.webm`);
  fs.renameSync(videoPath, finalPath);
  results.push({ label: LABEL, run: run.name, marks, before, arrived, restored, restoredAway, seqB, video: path.basename(finalPath) });
  console.log(`[sequence] ${LABEL} ${run.name} done`);
}
await browser.close();
fs.writeFileSync(path.join(OUT, 'sequence.json'), JSON.stringify(results, null, 2));
console.log('[sequence] wrote', path.join(OUT, 'sequence.json'));
