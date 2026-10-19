import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn, execFileSync } from 'node:child_process';
import { chromium, firefox, webkit } from 'playwright-core';

// Independent integration instrument. Source Fable measurements are never
// used as expected results. Both sites are fresh production exports.
const ROOT = process.cwd();
const OUT = path.resolve('qa-reports/2026-10-19_Codex_Release4Interactions-evidence');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const result = {
  commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  os: `${os.type()} ${os.release()} ${os.arch()}`, node: process.version,
  started: new Date().toISOString(), browsers: [], profiles: [], readings: [],
  checks: [], observations: [], errors: [],
};
const save = () => fs.writeFileSync(path.join(OUT, process.env.RELEASE4_RESULTS_NAME || 'browser-results.json'), JSON.stringify(result, null, 2) + '\n');
const check = (name, pass, details) => { result.checks.push({ name, pass: Boolean(pass), details }); if (!pass) console.error('FAIL', name, JSON.stringify(details)); };
const observe = (name, details) => result.observations.push({ name, details });
fs.mkdirSync(path.join(OUT, 'frames'), { recursive: true });

async function serve(dir) {
  const s = spawn(process.execPath, ['scripts/static-serve.mjs', dir, '0'], { stdio: ['ignore', 'pipe', 'pipe'] });
  const base = await new Promise((resolve, reject) => {
    s.once('error', reject); s.once('exit', (code) => reject(new Error(`server exit ${code}`)));
    s.stdout.on('data', (chunk) => { const m = String(chunk).match(/http:\/\/127\.0\.0\.1:\d+/); if (m) resolve(m[0]); });
  });
  return { server: s, base };
}
const PROBE = (el) => {
  const s = getComputedStyle(el), r = el.getBoundingClientRect();
  const dot = el.querySelector('span[aria-hidden="true"].rounded-full');
  const d = dot && getComputedStyle(dot);
  return {
    label: el.getAttribute('aria-label') || el.textContent.trim(), href: el.getAttribute('href'),
    width: r.width, height: r.height, active: el.matches(':active'), hover: el.matches(':hover'), focusVisible: el.matches(':focus-visible'),
    border: s.borderTopColor, borderWidth: s.borderTopWidth, fill: s.backgroundColor, color: s.color,
    outline: [s.outlineStyle, s.outlineWidth, s.outlineOffset, s.outlineColor],
    shadow: s.boxShadow, twShadow: s.getPropertyValue('--tw-shadow').trim(), transform: s.transform, inlineTransform: el.style.transform,
    duration: s.transitionDuration, transition: s.transitionProperty,
    dot: d ? { width: parseFloat(d.width), height: parseFloat(d.height), fill: d.backgroundColor, duration: d.transitionDuration } : null,
  };
};
async function capture(page, loc, meta, control, state, shot = true) {
  const reading = { ...meta, control, state, ...await loc.evaluate(PROBE) };
  result.readings.push(reading);
  if (shot) {
    const box = await loc.boundingBox(), vp = page.viewportSize();
    const x = Math.max(0, box.x - 9), y = Math.max(0, box.y - 9);
    if (y < vp.height && x < vp.width) {
      const file = `${meta.build}-${meta.browser}-${meta.width}-${meta.theme}-${control}-${state}.png`;
      await page.screenshot({ path: path.join(OUT, 'frames', file), clip: { x, y, width: Math.min(vp.width - x, box.width + 18), height: Math.min(vp.height - y, box.height + 18) } });
      reading.frame = `frames/${file}`;
    }
  }
  return reading;
}
async function ready(page, base, route) {
  const response = await page.goto(base + route, { waitUntil: 'load' });
  if (response.status() !== 200) throw new Error(`${route}: HTTP ${response.status()}`);
  await page.evaluate(() => document.fonts.ready); await sleep(180);
}
async function seat(page, loc) {
  await loc.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await sleep(1300);
  // Measure the resting target after its ancestor's reveal has naturally
  // reached full size. Retain a timeout observation rather than suppress it.
  try { await loc.evaluate((e) => new Promise((resolve) => {
    const t = performance.now(); const tick = () => { if (Math.abs(e.getBoundingClientRect().height - e.offsetHeight) < .00001 || performance.now() - t > 5000) resolve(); else requestAnimationFrame(tick); }; tick();
  })); } catch (e) { observe('reveal-settle-error', String(e)); }
}
async function focusWithTab(page, loc) {
  const prior = await loc.evaluate((el) => {
    const a = [...document.querySelectorAll('a[href],button:not([disabled]),[tabindex]')].filter((e) => e.tabIndex >= 0 && e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden' && !e.closest('[inert]'));
    const i = a.indexOf(el); if (i > 0) { a[i - 1].focus({ preventScroll: true }); return true; } return false;
  });
  if (prior) await page.keyboard.press('Tab');
  else { await page.keyboard.press('Tab'); await loc.focus(); }
  await sleep(310);
  return loc.evaluate((e) => document.activeElement === e);
}
const clickGuard = () => window.addEventListener('click', (e) => { e.preventDefault(); e.stopImmediatePropagation(); }, { once: true, capture: true });
async function touch(cdp, type, x, y) {
  await cdp.send('Input.emulateTouchFromMouseEvent', { type, x: Math.round(x), y: Math.round(y), button: 'left', ...(type !== 'mouseMoved' ? { clickCount: 1 } : {}) });
}
async function ladder(page, context, loc, meta, control, expectedDot, focusable = true) {
  await seat(page, loc); await page.mouse.move(1, 1);
  await page.evaluate(() => document.activeElement?.blur()); await sleep(310);
  const shots = meta.browser === 'chromium' || ['button', 'doorway'].includes(control);
  const rest = await capture(page, loc, meta, control, 'rest', shots);
  check(`${meta.id}/${control}/44px-and-name`, rest.width >= 44 && rest.height >= 44 && Boolean(rest.label), rest);
  if (meta.input === 'mouse') {
    await loc.hover(); await sleep(310); await capture(page, loc, meta, control, 'hover', shots); await page.mouse.move(1, 1); await sleep(310);
  }
  if (focusable) {
    check(`${meta.id}/${control}/keyboard-target`, await focusWithTab(page, loc), {});
    const f = await capture(page, loc, meta, control, 'focus', shots);
    check(`${meta.id}/${control}/focus-visible`, f.focusVisible && f.outline[0] !== 'none' && parseFloat(f.outline[1]) >= 2, f);
    await page.evaluate(() => document.activeElement?.blur()); await sleep(310);
  }
  const r = await loc.boundingBox(), x = r.x + r.width / 2, y = r.y + r.height / 2;
  const cdp = meta.input === 'cdp-touch' ? await context.newCDPSession(page) : null;
  if (!cdp) await page.mouse.move(x, y);
  const t = Date.now();
  if (cdp) await touch(cdp, 'mousePressed', x, y); else await page.mouse.down();
  const onset = [];
  for (const wait of [0, 25, 40, 60, 100]) { await sleep(wait); onset.push({ ms: Date.now() - t, ...await loc.evaluate(PROBE) }); }
  observe(`${meta.id}/${control}/press-onset`, onset);
  const p = await capture(page, loc, meta, control, 'held', shots);
  check(`${meta.id}/${control}/held-active`, p.active, p);
  if (meta.build === 'candidate') {
    check(`${meta.id}/${control}/press-duration`, p.duration === '0.09s', p);
    if (expectedDot) check(`${meta.id}/${control}/pressed-dot`, Math.abs(p.dot.width - expectedDot) < 0.2 && Math.abs(p.dot.height - expectedDot) < 0.2, p);
    if (['button', 'doorway', 'row', 'hue'].includes(control)) check(`${meta.id}/${control}/press-colour`, p.fill !== rest.fill && p.border !== rest.border, { rest, pressed: p });
    if (control === 'hue') check(`${meta.id}/${control}/project-colour-preserved`, p.dot.fill === rest.dot.fill, { rest: rest.dot, pressed: p.dot });
  }
  await page.evaluate(clickGuard);
  if (cdp) await touch(cdp, 'mouseReleased', x, y); else await page.mouse.up();
  await sleep(350);
  const release = await capture(page, loc, meta, control, 'release', shots);
  check(`${meta.id}/${control}/released-active-clears`, !release.active, release);
  if (meta.build === 'candidate' && cdp && ['button', 'doorway', 'hue'].includes(control)) check(`${meta.id}/${control}/touch-restored`, release.fill === rest.fill && release.border === rest.border, { rest, release });
  if (meta.build === 'candidate' && cdp && expectedDot) check(`${meta.id}/${control}/touch-dot-restored`, release.dot.width === rest.dot.width && release.dot.height === rest.dot.height, { rest: rest.dot, release: release.dot });
  // A mouse outside can remain :active until up. We record this engine limit;
  // we require clearing after release, and separately measure real scrolls.
  if (cdp) {
    await touch(cdp, 'mousePressed', x, y); await sleep(250);
    const beforeY = await page.evaluate(() => scrollY);
    for (let i = 1; i <= 6; i++) { await touch(cdp, 'mouseMoved', x, y - i * 17); await sleep(20); }
    await sleep(310); const cancelled = await capture(page, loc, meta, control, 'cancel', shots);
    observe(`${meta.id}/${control}/scroll-cancellation`, { beforeY, afterY: await page.evaluate(() => scrollY), cancelled });
    await touch(cdp, 'mouseReleased', x, y - 102);
  } else {
    await page.mouse.move(x, y); await page.mouse.down(); await sleep(130);
    await page.mouse.move(Math.min(page.viewportSize().width - 2, r.x + r.width + 20), Math.min(page.viewportSize().height - 2, r.y + r.height + 35));
    await sleep(310); const cancelled = await capture(page, loc, meta, control, 'cancel', shots);
    observe(`${meta.id}/${control}/mouse-drag-away`, cancelled); await page.mouse.up();
  }
  // The emulator's release is asynchronous. Detaching its CDP session before
  // the queued pointerup arrives drops that event and strands :active (proved
  // in touch-cancel-probe.json); retain the session through release sampling.
  await sleep(600); check(`${meta.id}/${control}/cancel-release-clears`, !await loc.evaluate((e) => e.matches(':active')), {});
  if (cdp) await cdp.detach();
}

async function profile(browser, name, profile, theme, build, base) {
  const input = profile.touch && name === 'chromium' ? 'cdp-touch' : 'mouse';
  const meta = { build, browser: name, width: profile.width, height: profile.height, theme, motion: 'no-preference', input };
  meta.id = `${build}/${name}/${profile.width}/${theme}/${input}`;
  const context = await browser.newContext({ viewport: { width: profile.width, height: profile.height }, colorScheme: theme, hasTouch: profile.touch && name !== 'firefox', ...(name !== 'firefox' ? { isMobile: profile.touch } : {}), reducedMotion: 'no-preference' });
  await context.addInitScript((t) => localStorage.setItem('theme', t), theme);
  const page = await context.newPage();
  page.on('pageerror', (e) => result.errors.push({ id: meta.id, kind: 'pageerror', message: String(e) }));
  page.on('console', (m) => { if (m.type() === 'error') result.errors.push({ id: meta.id, kind: 'console', message: m.text() }); });
  try {
    await ready(page, base, '/accessibility/');
    result.profiles.push({ ...meta, media: await page.evaluate(() => ({ hover: matchMedia('(hover:hover)').matches, coarse: matchMedia('(pointer:coarse)').matches, touch: navigator.maxTouchPoints, userAgent: navigator.userAgent })) });
    await ladder(page, context, page.locator('main a.rounded-pill.h-14').first(), meta, 'button', 6);
    await ready(page, base, '/');
    await ladder(page, context, page.locator('#flagship a.rounded-pill.h-11').first(), meta, 'doorway', 4);
    await ladder(page, context, page.locator('#work ol li a.rounded-pill.h-11').first(), meta, 'row', 4, false);
    if (profile.width < 768) {
      const trigger = page.getByRole('button', { name: 'Open navigation menu' });
      await ladder(page, context, trigger, meta, 'trigger');
      await trigger.click(); await page.getByRole('dialog', { name: 'Primary menu' }).waitFor(); await sleep(1100);
      await ladder(page, context, page.locator('#primary-menu').getByRole('button', { name: 'Close navigation menu' }), meta, 'close');
      await ladder(page, context, page.locator('#primary-menu nav a').first(), meta, 'item');
      await page.keyboard.press('Escape'); await sleep(500);
      check(`${meta.id}/escape-focus-return`, await trigger.evaluate((e) => document.activeElement === e), {});
      await trigger.click(); await sleep(1100);
      const focusables = page.locator('#primary-menu').locator('a[href],button:not([disabled])');
      await focusables.last().focus(); await page.keyboard.press('Tab');
      check(`${meta.id}/focus-trap-forward`, await focusables.first().evaluate((e) => document.activeElement === e), {});
      await page.keyboard.press('Shift+Tab');
      check(`${meta.id}/focus-trap-backward`, await focusables.last().evaluate((e) => document.activeElement === e), {});
      await page.locator('#primary-menu').getByRole('link', { name: /Credentials/ }).click(); await page.waitForURL('**/certificates/'); await sleep(500);
      check(`${meta.id}/menu-navigation`, await page.locator('#primary-menu').count() === 0, { url: page.url() });
      await page.goBack(); await page.waitForURL(base + '/'); await sleep(600);
      check(`${meta.id}/menu-back`, await page.locator('#primary-menu').count() === 0 && !await page.getByRole('button', { name: 'Open navigation menu' }).evaluate((e) => e.matches(':active')), {});
    }
    const doorway = page.locator('#flagship a.rounded-pill.h-11').first();
    await seat(page, doorway); await doorway.click(); await page.waitForURL('**/work/flagstone/'); await sleep(600);
    check(`${meta.id}/doorway-navigation`, await page.locator('h1').count() === 1, { url: page.url() });
    await page.mouse.move(1, 1); await page.goBack(); await page.waitForURL(base + '/'); await sleep(650);
    const back = await doorway.evaluate(PROBE); observe(`${meta.id}/doorway-back`, back);
    check(`${meta.id}/back-active-clears`, !back.active, back);
    await ready(page, base, '/work/flagstone/');
    await ladder(page, context, page.locator('main a.rounded-pill.h-14').last(), meta, 'hue', 6);
    if (build === 'candidate' && profile.width === 1440) {
      await ready(page, base, '/contact/'); const self = page.locator('nav[data-rail] a[aria-current="page"].rounded-pill');
      if (await self.count()) { await self.hover(); await sleep(350); const r = await self.evaluate(PROBE); check(`${meta.id}/on-route-hover-withdrawal`, r.transform === 'matrix(1, 0, 0, 1, 0, 0)' || r.transform === 'none', r); check(`${meta.id}/on-route-shadow-withdrawal`, r.twShadow === '0 0 #0000', r); }
      else check(`${meta.id}/on-route-cta-present`, false, {});
      await ready(page, base, '/'); const magnetic = page.locator('#hero a.rounded-pill.h-14').first(); await seat(page, magnetic);
      // Release 2 has no live MagneticButton consumer. Exercise its precise
      // inline transform contract on a real built Button; this is a DOM fixture,
      // not evidence of a live magnetic CTA or of the hook running on this route.
      await magnetic.evaluate((e) => { e.style.transform = 'translate3d(6px, -3px, 0)'; });
      const box = await magnetic.boundingBox(); await page.mouse.move(box.x + box.width * .8, box.y + box.height * .6); await sleep(400);
      const before = await magnetic.evaluate(PROBE); await page.mouse.down(); await sleep(200); const held = await magnetic.evaluate(PROBE);
      check(`${meta.id}/magnetic-inline-contract-fixture`, Boolean(before.inlineTransform) && held.inlineTransform === before.inlineTransform && held.transform === before.transform, { fixture: true, before, held });
      await page.evaluate(clickGuard); await page.mouse.up();
    }
    console.log('profile complete', meta.id);
  } catch (e) { check(`${meta.id}/completed`, false, { error: String(e), stack: e.stack }); }
  finally { await context.close(); save(); }
}

const before = await serve(path.resolve('../baseline-out'));
const after = await serve(path.join(ROOT, 'out'));
try {
  const selected = (process.env.RELEASE4_BROWSERS || 'chromium,firefox,webkit').split(',');
  for (const [name, type, options] of [
    ['chromium', chromium, { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }],
    ['firefox', firefox, { env: { ...process.env, MOZ_DISABLE_CONTENT_SANDBOX: '1', MOZ_DISABLE_RDD_SANDBOX: '1', MOZ_DISABLE_GMP_SANDBOX: '1', MOZ_DISABLE_SOCKET_PROCESS_SANDBOX: '1' }, firefoxUserPrefs: { 'security.sandbox.content.level': 0 } }],
    ['webkit', webkit, {}],
  ]) {
    if (!selected.includes(name)) continue;
    let browser;
    try { browser = await type.launch({ headless: true, ...options }); }
    catch (e) { check(`${name}/available`, false, String(e)); continue; }
    result.browsers.push({ name, version: await browser.version(), headless: true });
    try {
      for (const build of name === 'chromium' && process.env.RELEASE4_INCLUDE_BASELINE !== '0' ? ['baseline', 'candidate'] : ['candidate']) {
        for (const p of [{ width: 1440, height: 900, touch: false }, { width: 393, height: 852, touch: true }, ...(name === 'chromium' ? [{ width: 320, height: 568, touch: true }] : [])]) {
          for (const theme of ['light', 'dark']) await profile(browser, name, p, theme, build, build === 'baseline' ? before.base : after.base);
        }
      }
    } finally { await browser.close(); }
  }
} finally {
  before.server.kill('SIGTERM'); after.server.kill('SIGTERM'); result.finished = new Date().toISOString(); save();
}
const baselineFailures = result.checks.filter((c) => !c.pass && c.name.startsWith('baseline/'));
const candidateFailures = result.checks.filter((c) => !c.pass && !c.name.startsWith('baseline/'));
console.log(JSON.stringify({ checks: result.checks.length, baselineFailures: baselineFailures.length, candidateFailures: candidateFailures.length, readings: result.readings.length, errors: result.errors.length }));
// Baseline is a negative comparison, including its measured short menu links.
// Every failed baseline assertion stays in the JSON and in the log.
if (candidateFailures.length || result.errors.some((e) => e.id.startsWith('candidate/'))) process.exitCode = 1;
