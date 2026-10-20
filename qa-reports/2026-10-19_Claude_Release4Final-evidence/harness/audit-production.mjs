// Copy of ../../2026-10-19_Codex_Release4Interactions-evidence/harness/audit-production.mjs; the only change
// is RELEASE4_BROWSERS engine selection (local Firefox automation cannot start inside this Mac's tool sandbox).
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { chromium, firefox, webkit } from 'playwright-core';
const require = createRequire(import.meta.url);
const OUT = path.resolve(process.env.RELEASE4_EVIDENCE_DIR || 'qa-reports/2026-10-19_Codex_Release4Interactions-evidence');
fs.mkdirSync(OUT, { recursive: true });
const ROOT = path.resolve('out');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const data = { commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), started: new Date().toISOString(), routes: [], scans: [], checks: [], observations: [], errors: [] };
const save = () => fs.writeFileSync(path.join(OUT, process.env.RELEASE4_AUDIT_STATES_ONLY ? 'state-audit.json' : 'production-audit.json'), JSON.stringify(data, null, 2) + '\n');
const check = (name, pass, details = {}) => { data.checks.push({ name, pass: Boolean(pass), details }); if (!pass) console.error('FAIL', name, JSON.stringify(details)); };
const walk = (dir, rel = '') => { for (const f of fs.readdirSync(dir, { withFileTypes: true })) { if (f.isDirectory() && f.name !== '_next') walk(path.join(dir, f.name), rel + f.name + '/'); else if (f.name === 'index.html') data.routes.push('/' + rel); } };
walk(ROOT); data.routes.sort();
const s = spawn(process.execPath, ['scripts/static-serve.mjs', ROOT, '0'], { stdio: ['ignore', 'pipe', 'inherit'] });
const base = await new Promise((resolve, reject) => { s.once('error', reject); s.stdout.once('data', (d) => resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0])); });
try {
  for (const route of data.routes) { const r = await fetch(base + route); check(`export-http/${route}`, r.status === 200, { status: r.status }); }
  if (!process.env.RELEASE4_AUDIT_STATES_ONLY) {
  const b = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE });
  const axe = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
  try {
    for (const width of [320, 1440]) for (const theme of ['light', 'dark']) {
      const c = await b.newContext({ viewport: { width, height: 900 }, colorScheme: theme, reducedMotion: 'reduce' });
      await c.addInitScript((t) => localStorage.setItem('theme', t), theme);
      const p = await c.newPage();
      p.on('pageerror', (e) => data.errors.push({ width, theme, route: new URL(p.url()).pathname, type: 'pageerror', message: String(e) }));
      p.on('console', (m) => { if (m.type() === 'error') data.errors.push({ width, theme, route: new URL(p.url()).pathname, type: 'console', message: m.text() }); });
      const scan = async (route, state) => {
        await p.addScriptTag({ content: axe });
        const r = await p.evaluate(async () => {
          const a = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } });
          const pick = (x) => ({ id: x.id, impact: x.impact, help: x.help, nodes: x.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })) });
          return { violations: a.violations.map(pick), incomplete: a.incomplete.map(pick), passes: a.passes.length };
        });
        data.scans.push({ route, arrived: new URL(p.url()).pathname, state, width, theme, motion: 'reduce', browser: await b.version(), ...r });
        check(`axe/${width}/${theme}/${route}/${state}`, r.violations.length === 0, r.violations);
        console.log('axe', width, theme, route, state, r.violations.length); save();
      };
      // /archive's auth island is outside the interaction audit. HTTP export
      // presence is checked above, but no auth flow or backend is contacted.
      for (const route of data.routes.filter((r) => r !== '/archive/')) {
        const html = fs.readFileSync(path.join(ROOT, route, 'index.html'), 'utf8');
        const redirect = html.match(/http-equiv=["']refresh["'][^>]*content=["'][^"']*url=([^"']+)/i)?.[1];
        // Do not await document.fonts.ready in a meta-refresh stub while its
        // document is being discarded. Follow the existing alias first.
        if (redirect) {
          await p.goto(base + route, { waitUntil: 'commit' });
          await p.waitForURL(new URL(redirect, base).href, { waitUntil: 'networkidle', timeout: 15000 });
        } else await p.goto(base + route, { waitUntil: 'load' });
        await p.evaluate(() => document.fonts.ready); await sleep(240);
        if (route === '/') { await p.locator('#flagship').evaluate((e) => e.scrollIntoView({ block: 'start', behavior: 'instant' })); await sleep(300); }
        await scan(route, 'rest');
        if (route === '/' && width === 320) {
          await p.getByRole('button', { name: 'Open navigation menu' }).click(); await sleep(400); await scan(route, 'menu-open'); await p.keyboard.press('Escape');
        }
      }
      await c.close();
    }
  } finally { await b.close(); }
  }
  for (const [name, engine, opts] of [['chromium', chromium, { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }], ['firefox', firefox, { env: { ...process.env, MOZ_DISABLE_CONTENT_SANDBOX: '1', MOZ_DISABLE_RDD_SANDBOX: '1', MOZ_DISABLE_GMP_SANDBOX: '1', MOZ_DISABLE_SOCKET_PROCESS_SANDBOX: '1' }, firefoxUserPrefs: { 'security.sandbox.content.level': 0 } }], ['webkit', webkit, {}]].filter(([n]) => (process.env.RELEASE4_BROWSERS || 'chromium,firefox,webkit').split(',').includes(n))) {
    const browser = await engine.launch(opts);
    try {
      for (const theme of ['light', 'dark']) {
        const c = await browser.newContext({ viewport: { width: 393, height: 852 }, colorScheme: theme, reducedMotion: 'reduce' });
        await c.addInitScript((t) => localStorage.setItem('theme', t), theme);
        const p = await c.newPage(); await p.goto(base + '/accessibility/'); await sleep(350);
        const button = p.locator('main a.rounded-pill.h-14'); await button.scrollIntoViewIfNeeded();
        await button.hover(); await p.mouse.down();
        await p.evaluate(() => new Promise(requestAnimationFrame));
        const rm = await button.evaluate((e) => ({ duration: getComputedStyle(e).transitionDuration, dot: getComputedStyle(e.querySelector('.rounded-full')).width, fill: getComputedStyle(e).backgroundColor, active: e.matches(':active') }));
        check(`reduced-motion/${name}/${theme}`, rm.active && parseFloat(rm.duration) <= .00001 && rm.dot === '6px', rm);
        await p.evaluate(() => window.addEventListener('click', (e) => { e.preventDefault(); e.stopImmediatePropagation(); }, { capture: true, once: true })); await p.mouse.up();
        // Native disabled control with the real built Button's exact markup
        // and classes. The fixture has no product handler and is labelled here.
        await button.evaluate((e) => { const f = document.createElement('button'); f.className = e.className; f.innerHTML = e.innerHTML; f.disabled = true; f.id = 'release4-disabled-fixture'; f.onclick = () => { window.disabledClicks = (window.disabledClicks || 0) + 1; }; document.querySelector('main').append(f); });
        const disabled = p.locator('#release4-disabled-fixture'); await disabled.scrollIntoViewIfNeeded(); const box = await disabled.boundingBox(); await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await p.mouse.down(); await p.mouse.up();
        const d = await disabled.evaluate((e) => ({ disabled: e.disabled, clicks: window.disabledClicks || 0, fill: getComputedStyle(e).backgroundColor, transform: getComputedStyle(e).transform }));
        check(`disabled-native-fixture/${name}/${theme}`, d.disabled && d.clicks === 0 && ['none', 'matrix(1, 0, 0, 1, 0, 0)'].includes(d.transform), d);
        await c.close();
      }
      const c = await browser.newContext({ viewport: { width: 393, height: 852 }, javaScriptEnabled: false });
      const p = await c.newPage(); await p.goto(base + '/'); const doorway = p.locator('#flagship a.rounded-pill.h-11'); await doorway.scrollIntoViewIfNeeded(); await sleep(500);
      const before = await doorway.evaluate((e) => ({ h: e.getBoundingClientRect().height, label: e.getAttribute('aria-label') || e.textContent, scriptsExecuted: document.documentElement.classList.contains('js') }));
      await doorway.click(); await p.waitForURL('**/work/flagstone/'); check(`no-js/${name}/navigate`, before.h >= 44 && Boolean(before.label), { ...before, arrived: p.url() });
      await p.goBack(); await p.waitForURL(base + '/'); check(`no-js/${name}/back`, !await p.locator('#flagship a.rounded-pill.h-11').evaluate((e) => e.matches(':active')), {});
      await c.close();
      const keyboard = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
      const kp = await keyboard.newPage(); await kp.goto(base + '/'); await sleep(400);
      const title = kp.locator('#work a[data-return-focus]').first(); await title.scrollIntoViewIfNeeded(); await sleep(1400); await title.focus();
      const href = await title.getAttribute('href'); await kp.keyboard.press('Enter'); await kp.waitForURL((u) => u.pathname.replace(/\/$/, '') === href.replace(/\/$/, ''));
      await sleep(1100);
      await kp.goBack(); await kp.waitForURL(base + '/'); await sleep(900);
      const returned = await title.evaluate((e) => ({ focused: document.activeElement === e, visible: e.matches(':focus-visible'), top: e.getBoundingClientRect().top, bottom: e.getBoundingClientRect().bottom }));
      check(`keyboard-enter-back/${name}`, returned.focused && returned.visible && returned.top >= 0 && returned.bottom <= 900, returned);
      await keyboard.close();
      if (name !== 'firefox') {
        const touch = await browser.newContext({ viewport: { width: 393, height: 852 }, hasTouch: true, isMobile: true, reducedMotion: 'no-preference' });
        const tp = await touch.newPage(); await tp.goto(base + '/'); await sleep(400);
        const door = tp.locator('#flagship a.rounded-pill.h-11'); await door.scrollIntoViewIfNeeded(); await sleep(1400); await door.tap(); await tp.waitForURL('**/work/flagstone/');
        await tp.goBack(); await tp.waitForURL(base + '/'); await sleep(650);
        check(`touchscreen-tap-back/${name}`, !await tp.locator('#flagship a.rounded-pill.h-11').evaluate((e) => e.matches(':active')), { input: 'Playwright touchscreen.tap', physical: false });
        await tp.getByRole('button', { name: 'Open navigation menu' }).tap(); await sleep(1100);
        await tp.locator('#primary-menu').getByRole('link', { name: /Credentials/ }).tap(); await tp.waitForURL('**/certificates/');
        await tp.goBack(); await tp.waitForURL(base + '/'); await sleep(500);
        check(`touchscreen-menu-back/${name}`, await tp.locator('#primary-menu').count() === 0, { input: 'Playwright touchscreen.tap', physical: false });
        await touch.close();
      }
    } finally { await browser.close(); save(); }
  }
} finally { s.kill('SIGTERM'); data.finished = new Date().toISOString(); save(); }
console.log(JSON.stringify({ routes: data.routes.length, scans: data.scans.length, checks: data.checks.length, failed: data.checks.filter((c) => !c.pass).length, errors: data.errors.length }));
if (data.checks.some((c) => !c.pass)) process.exitCode = 1;
