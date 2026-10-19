#!/usr/bin/env node
/**
 * press-evidence/harness.mjs — interaction-state capture rig.
 *
 *   node harness.mjs --base http://127.0.0.1:3105 --out <dir> --label before
 *
 * For each viewport × theme it drives the real built site in Chromium and
 * captures the three controls under review (Button, ProjectDoorwayButton,
 * HamburgerNav trigger / close / item) in: rest, hover (fine pointer only),
 * keyboard focus, pressed, cancelled (pointer dragged away / touch scroll),
 * released-without-navigation (shows whether anything sticks). Every capture is
 * paired with the computed styles that produced it (measurements.json) so a
 * reader can audit the PNG against numbers, not the other way round.
 *
 * Touch viewports use CDP Input.dispatchTouchEvent so a press can be HELD
 * (Playwright's touchscreen.tap() cannot hold). Mouse viewports use
 * mouse.down()/up(). Nothing here is reconstructed: every PNG is a live frame.
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const arg = (flag, dflt) => {
  const i = process.argv.indexOf(flag);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : dflt;
};
const BASE = arg('--base', 'http://127.0.0.1:3105');
const OUT = path.resolve(arg('--out', 'evidence'));
const LABEL = arg('--label', 'run');
const ONLY_VP = arg('--vp', null); // e.g. 393x852
const ONLY_THEME = arg('--theme', null);

const VIEWPORTS = [
  { w: 1440, h: 900, touch: false },
  { w: 393, h: 852, touch: true },
  { w: 375, h: 667, touch: true },
  { w: 320, h: 568, touch: true },
].filter((v) => !ONLY_VP || `${v.w}x${v.h}` === ONLY_VP);
const THEMES = ['light', 'dark'].filter((t) => !ONLY_THEME || t === ONLY_THEME);

const PAD = 20;
const SETTLE = 420; // > duration-base (280ms) so a captured state is its end state

fs.mkdirSync(OUT, { recursive: true });
const measurements = [];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Computed-style probe for a control and its signature dot (if any). */
const PROBE = (el) => {
  const cs = getComputedStyle(el);
  const dot = el.querySelector('span[aria-hidden="true"].rounded-full');
  const d = dot ? getComputedStyle(dot) : null;
  const r = el.getBoundingClientRect();
  return {
    box: { x: r.x, y: r.y, w: r.width, h: r.height },
    active: el.matches(':active'),
    hover: el.matches(':hover'),
    focus: el.matches(':focus'),
    focusVisible: el.matches(':focus-visible'),
    borderColor: cs.borderTopColor,
    borderWidth: cs.borderTopWidth,
    backgroundColor: cs.backgroundColor,
    backgroundImage: cs.backgroundImage,
    color: cs.color,
    boxShadow: cs.boxShadow,
    transform: cs.transform,
    outline: `${cs.outlineWidth} ${cs.outlineStyle} ${cs.outlineColor} / offset ${cs.outlineOffset}`,
    transitionProperty: cs.transitionProperty,
    transitionDuration: cs.transitionDuration,
    transitionTimingFunction: cs.transitionTimingFunction,
    tapHighlight: cs.webkitTapHighlightColor ?? cs.getPropertyValue('-webkit-tap-highlight-color'),
    dot: d ? { width: d.width, height: d.height, backgroundColor: d.backgroundColor, transitionDuration: d.transitionDuration } : null,
    media: {
      hoverHover: matchMedia('(hover: hover)').matches,
      pointerCoarse: matchMedia('(pointer: coarse)').matches,
      reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
      dark: document.documentElement.classList.contains('dark'),
    },
  };
};

/** Prevent the NEXT click from navigating / toggling anything (window capture
 *  runs before the document-capture nav interceptor and before React's root). */
const ARM_CLICK_GUARD = () => {
  window.__guard = (e) => { e.preventDefault(); e.stopImmediatePropagation(); };
  window.addEventListener('click', window.__guard, { capture: true, once: true });
};
const DISARM_CLICK_GUARD = () => {
  if (window.__guard) window.removeEventListener('click', window.__guard, { capture: true });
};

async function center(loc) {
  const box = await loc.boundingBox();
  if (!box) throw new Error('no box');
  return { x: box.x + box.width / 2, y: box.y + box.height / 2, box };
}

async function crop(page, loc, file) {
  const box = await loc.boundingBox();
  const vp = page.viewportSize();
  const x = Math.max(0, box.x - PAD);
  const y = Math.max(0, box.y - PAD);
  const w = Math.min(vp.width - x, box.width + PAD * 2);
  const h = Math.min(vp.height - y, box.height + PAD * 2);
  await page.screenshot({ path: file, clip: { x, y, width: w, height: h }, caret: 'hide' });
}

async function record(page, loc, ctx, control, state, file) {
  const m = await loc.evaluate(PROBE);
  measurements.push({ label: LABEL, ...ctx, control, state, file: path.relative(OUT, file), ...m });
  return m;
}

async function capture(page, loc, ctx, control, state) {
  const dir = path.join(OUT, `${ctx.vp}-${ctx.theme}`);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${control}-${state}.png`);
  await crop(page, loc, file);
  return record(page, loc, ctx, control, state, file);
}

async function settleScroll(page, loc) {
  await loc.evaluate((el) => el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' }));
  await sleep(900); // reveals (IntersectionObserver) + any pinned-stage settle
}

/** Keyboard-initiated focus: focus the previous tabbable by script, then Tab. */
async function keyboardFocus(page, loc) {
  const ok = await loc.evaluate((el) => {
    const all = Array.from(document.querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])'))
      .filter((n) => n.tabIndex >= 0 && n.getClientRects().length > 0 && getComputedStyle(n).visibility !== 'hidden');
    const i = all.indexOf(el);
    if (i < 0) return false;
    if (i === 0) { document.body.focus?.(); return true; }
    all[i - 1].focus({ preventScroll: true });
    return true;
  });
  if (!ok) return false;
  await page.keyboard.press('Tab');
  await sleep(SETTLE);
  return loc.evaluate((el) => document.activeElement === el);
}

async function blurAll(page) {
  await page.evaluate(() => { (document.activeElement)?.blur?.(); });
  await sleep(SETTLE);
}

async function mouseAway(page) {
  await page.mouse.move(2, 2);
  await sleep(SETTLE);
}

/* ---------- touch primitives (CDP) ----------
 * Input.emulateTouchFromMouseEvent is Chromium's DevTools device-mode touch
 * path: it runs the real touch emulator + gesture pipeline, so a HELD press
 * matches :active from ~40ms (measured) under the phone media profile
 * (hover:none, pointer:coarse). Plain Input.dispatchTouchEvent never showed
 * :active during a hold in headless (only a ~20ms flash after release). */
const R = Math.round;
async function touchStart(cdp, x, y) {
  await cdp.send('Input.emulateTouchFromMouseEvent', { type: 'mousePressed', x: R(x), y: R(y), button: 'left', clickCount: 1 });
}
async function touchMove(cdp, x, y) {
  await cdp.send('Input.emulateTouchFromMouseEvent', { type: 'mouseMoved', x: R(x), y: R(y), button: 'left' });
}
async function touchEnd(cdp, x, y) {
  await cdp.send('Input.emulateTouchFromMouseEvent', { type: 'mouseReleased', x: R(x), y: R(y), button: 'left', clickCount: 1 });
}

/**
 * The state ladder for one control. `opts.focusable` = whether a keyboard
 * stop exists (row doorways are tabindex=-1 by design). `opts.pressWait` lets
 * the touch show-press settle (Chromium applies :active ~150ms after
 * touchstart unless the finger lifts first).
 */
async function ladder(page, cdp, loc, ctx, control, opts = {}) {
  const touch = ctx.touch;
  // REST
  await (touch ? sleep(SETTLE) : mouseAway(page));
  await blurAll(page);
  await capture(page, loc, ctx, control, 'rest');

  // HOVER (fine pointer only)
  if (!touch) {
    const { x, y } = await center(loc);
    await page.mouse.move(x, y, { steps: 4 });
    await sleep(SETTLE);
    await capture(page, loc, ctx, control, 'hover');
    await mouseAway(page);
  }

  // KEYBOARD FOCUS
  if (opts.focusable !== false) {
    const focused = await keyboardFocus(page, loc);
    if (focused) await capture(page, loc, ctx, control, 'focus');
    else measurements.push({ label: LABEL, ...ctx, control, state: 'focus', skipped: 'could not keyboard-focus' });
    await blurAll(page);
    if (!touch) await mouseAway(page);
  }

  // PRESSED (held)
  {
    const { x, y } = await center(loc);
    if (touch) {
      await touchStart(cdp, x, y);
      await sleep(opts.pressWait ?? 320);
      await capture(page, loc, ctx, control, 'pressed');
      // RELEASED without navigation: shows what sticks after the finger lifts.
      await page.evaluate(ARM_CLICK_GUARD);
      await touchEnd(cdp, x, y);
      await sleep(SETTLE + 200);
      await capture(page, loc, ctx, control, 'released');
      await page.evaluate(DISARM_CLICK_GUARD);
    } else {
      await page.mouse.move(x, y, { steps: 4 });
      await page.mouse.down();
      await sleep(320);
      await capture(page, loc, ctx, control, 'pressed');
      await page.evaluate(ARM_CLICK_GUARD);
      await page.mouse.up();
      await sleep(SETTLE + 200);
      await capture(page, loc, ctx, control, 'released'); // still hovered: pointer is on it
      await page.evaluate(DISARM_CLICK_GUARD);
      await mouseAway(page);
    }
  }

  // CANCELLED: press, then drag/scroll away before releasing.
  {
    const { x, y, box } = await center(loc);
    if (touch) {
      await touchStart(cdp, x, y);
      await sleep(opts.pressWait ?? 320);
      for (let i = 1; i <= 6; i++) { await touchMove(cdp, x, y - i * 14); await sleep(16); } // scroll gesture
      await sleep(SETTLE);
      await capture(page, loc, ctx, control, 'cancelled');
      await touchEnd(cdp, x, y - 84);
      await sleep(SETTLE);
      await loc.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
      await sleep(300);
    } else {
      await page.mouse.move(x, y, { steps: 4 });
      await page.mouse.down();
      await sleep(320);
      await page.mouse.move(x, box.y + box.height + 60, { steps: 6 });
      await sleep(SETTLE);
      await capture(page, loc, ctx, control, 'cancelled');
      await page.mouse.up();
      await mouseAway(page);
    }
  }
}

async function gotoReady(page, url) {
  await page.goto(BASE + url, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await sleep(600);
}

async function run() {
  // Resolve the browser the repo's own rigs document: PLAYWRIGHT_CHROMIUM_EXECUTABLE
  // first, then playwright-core's own expectation, then the container's symlink.
  const candidates = [process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE, (() => { try { return chromium.executablePath(); } catch { return null; } })(), '/opt/pw-browsers/chromium'].filter(Boolean);
  const exe = candidates.find((p) => fs.existsSync(p));
  if (!exe) throw new Error('no chromium executable found: ' + candidates.join(', '));
  console.log('[harness] chromium =', exe);
  const browser = await chromium.launch({ executablePath: exe });
  try {
    for (const vp of VIEWPORTS) {
      for (const theme of THEMES) {
        const ctx = { vp: `${vp.w}x${vp.h}`, theme, touch: vp.touch };
        const context = await browser.newContext({
          viewport: { width: vp.w, height: vp.h },
          colorScheme: theme,
          isMobile: vp.touch,
          hasTouch: vp.touch,
          deviceScaleFactor: 2,
          reducedMotion: 'no-preference',
        });
        const page = await context.newPage();
        const cdp = vp.touch ? await context.newCDPSession(page) : null;
        page.on('pageerror', (e) => measurements.push({ label: LABEL, ...ctx, pageerror: String(e) }));

        // ── /accessibility/ — the shared <Button> on a plain page
        await gotoReady(page, '/accessibility/');
        const btn = page.locator('main a.rounded-pill.h-14').first();
        await settleScroll(page, btn);
        await page.screenshot({ path: path.join(OUT, `${ctx.vp}-${ctx.theme}`, 'context-accessibility.png').replace(`${OUT}/`, `${OUT}/`), caret: 'hide' }).catch(() => {});
        await ladder(page, cdp, btn, ctx, 'button');

        // ── / — doorway pills, hero Button, hamburger (phones)
        await gotoReady(page, '/');
        const flagship = page.locator('#flagship a.rounded-pill.h-11').first();
        await settleScroll(page, flagship);
        await page.screenshot({ path: path.join(OUT, `${ctx.vp}-${ctx.theme}`, 'context-flagship.png'), caret: 'hide' }).catch(() => {});
        await ladder(page, cdp, flagship, ctx, 'doorway-flagship');

        const row = page.locator('#work ol li a.rounded-pill.h-11').first();
        await settleScroll(page, row);
        await ladder(page, cdp, row, ctx, 'doorway-row', { focusable: false });

        const hero = page.locator('#hero a.rounded-pill.h-14').first();
        if (await hero.count()) {
          await settleScroll(page, hero);
          await page.screenshot({ path: path.join(OUT, `${ctx.vp}-${ctx.theme}`, 'context-hero.png'), caret: 'hide' }).catch(() => {});
          await ladder(page, cdp, hero, ctx, 'button-hero');
        }

        if (vp.touch) {
          const trigger = page.locator('button[aria-label="Open navigation menu"]');
          await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
          await sleep(600);
          await ladder(page, cdp, trigger, ctx, 'hamburger-trigger', { focusable: true });

          // open the dialog with a real tap
          const { x, y } = await center(trigger);
          await page.touchscreen.tap(x, y);
          await page.locator('#primary-menu').waitFor({ state: 'visible' });
          await sleep(1200); // item stagger: 0.04 + 7×0.08 + 0.28 ≈ 0.9s
          await page.screenshot({ path: path.join(OUT, `${ctx.vp}-${ctx.theme}`, 'context-menu.png'), caret: 'hide' }).catch(() => {});
          const close = page.locator('#primary-menu button[aria-label="Close navigation menu"]');
          await ladder(page, cdp, close, ctx, 'hamburger-close', { focusable: true });
          const item = page.locator('#primary-menu nav ul li a').first();
          await ladder(page, cdp, item, ctx, 'hamburger-item', { focusable: true });
          await page.keyboard.press('Escape');
          await sleep(500);
        }

        // ── /work/flagstone/ — the closing CTA Button with a per-project dot hue
        await gotoReady(page, '/work/flagstone/');
        const cta = page.locator('main a.rounded-pill.h-14').last();
        await settleScroll(page, cta);
        await ladder(page, cdp, cta, ctx, 'button-dotcolor', { focusable: true });

        await context.close();
        console.log(`[harness] ${LABEL} ${ctx.vp} ${theme} done`);
      }
    }
  } finally {
    await browser.close();
    fs.writeFileSync(path.join(OUT, 'measurements.json'), JSON.stringify(measurements, null, 2));
    console.log(`[harness] wrote ${measurements.length} measurements → ${path.join(OUT, 'measurements.json')}`);
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
