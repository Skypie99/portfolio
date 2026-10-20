// Copy of ../../2026-10-19_Codex_Release4Interactions-evidence/harness/resolve-observations.mjs; the only change
// is RELEASE4_BROWSERS engine selection (local Firefox automation cannot start inside this Mac's tool sandbox).
import fs from 'node:fs';
import { spawn, execFileSync } from 'node:child_process';
import { chromium, firefox, webkit } from 'playwright-core';
const OUT = process.env.RELEASE4_EVIDENCE_DIR || 'qa-reports/2026-10-19_Codex_Release4Interactions-evidence';
fs.mkdirSync(OUT, { recursive: true });
const sleep = (t) => new Promise((r) => setTimeout(r, t));
const results = { commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), baseline: process.env.RELEASE4_BASELINE_SHA || null, checks: [], observations: [] };
const check = (name, pass, details) => { results.checks.push({ name, pass, details }); console.log(name, pass, JSON.stringify(details)); };
async function server(dir) { const s = spawn(process.execPath, ['scripts/static-serve.mjs', dir, '0'], { stdio: ['ignore', 'pipe', 'inherit'] }); const url = await new Promise((r) => s.stdout.once('data', (d) => r(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]))); return { s, url }; }
const after = await server('out'), before = await server(process.env.RELEASE4_BASELINE_OUT || '../baseline-out');
try {
  for (const [name, engine, options] of [
    ['chromium', chromium, { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }],
    ['firefox', firefox, { env: { ...process.env, MOZ_DISABLE_CONTENT_SANDBOX: '1', MOZ_DISABLE_RDD_SANDBOX: '1', MOZ_DISABLE_GMP_SANDBOX: '1', MOZ_DISABLE_SOCKET_PROCESS_SANDBOX: '1' }, firefoxUserPrefs: { 'security.sandbox.content.level': 0 } }], ['webkit', webkit, {}],
  ].filter(([n]) => (process.env.RELEASE4_BROWSERS || 'chromium,firefox,webkit').split(',').includes(n))) {
    const b = await engine.launch(options);
    try {
      for (const theme of ['light', 'dark']) {
        const c = await b.newContext({ viewport: { width: 393, height: 852 }, reducedMotion: 'reduce', colorScheme: theme });
        await c.addInitScript((t) => localStorage.setItem('theme', t), theme); const p = await c.newPage();
        await p.goto(after.url + '/accessibility/'); const link = p.locator('main a.rounded-pill.h-14'); await link.scrollIntoViewIfNeeded(); await link.hover(); await p.mouse.down();
        const samples = [];
        for (const wait of [0, 25, 75, 150]) { await sleep(wait); samples.push({ afterWait: wait, ...await link.evaluate((e) => ({ active: e.matches(':active'), dot: getComputedStyle(e.querySelector('.rounded-full')).width, duration: getComputedStyle(e).transitionDuration, fill: getComputedStyle(e).backgroundColor })) }); }
        check(`reduced-held/${name}/${theme}`, samples.at(-1).dot === '6px' && parseFloat(samples.at(-1).duration) <= .00001, samples);
        await p.evaluate(() => window.addEventListener('click', (e) => { e.preventDefault(); e.stopImmediatePropagation(); }, { once: true, capture: true })); await p.mouse.up();
        await p.goto(after.url + '/'); await sleep(400);
        const trigger = p.getByRole('button', { name: 'Open navigation menu' });
        await trigger.focus(); await p.keyboard.press('Enter'); await p.locator('#primary-menu').waitFor(); await sleep(500);
        const home = p.locator('#primary-menu nav a').first(); await home.focus(); await p.keyboard.press('Shift+Tab');
        const close = p.locator('#primary-menu button[aria-label="Close navigation menu"]');
        check(`native-shift-tab-close/${name}/${theme}`, await close.evaluate((e) => document.activeElement === e && e.matches(':focus-visible')), await close.evaluate((e) => ({ focused: document.activeElement === e, visible: e.matches(':focus-visible'), outline: getComputedStyle(e).outline })));
        const links = await p.locator('#primary-menu nav a').evaluateAll((a) => a.map((e) => ({ label: e.textContent.trim(), height: e.getBoundingClientRect().height, width: e.getBoundingClientRect().width })));
        check(`all-menu-targets/${name}/${theme}`, links.every((e) => e.height >= 44 && e.width >= 44), links);
        await p.locator('#primary-menu').getByRole('link', { name: /Credentials/ }).click(); await p.waitForURL('**/certificates/'); const t = Date.now();
        await p.locator('#primary-menu').waitFor({ state: 'detached', timeout: 4000 }); check(`menu-exit-completes/${name}/${theme}`, true, { msAfterRouteCommit: Date.now() - t });
        await c.close();
      }
      if (name === 'firefox') {
        for (const [label, base] of [['baseline', before.url], ['candidate', after.url]]) {
          const c = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' }); const p = await c.newPage(); await p.goto(base + '/');
          const title = p.locator('#work a[data-return-focus]').first(); await title.scrollIntoViewIfNeeded(); await sleep(1800); await title.focus(); const href = await title.getAttribute('href'); await p.keyboard.press('Enter'); await p.waitForURL((u) => u.pathname.replace(/\/$/, '') === href.replace(/\/$/, '')); await sleep(1400); await p.goBack(); await p.waitForURL(base + '/'); await sleep(1200);
          const r = await title.evaluate((e) => ({ focused: document.activeElement === e, activeLabel: document.activeElement?.textContent?.slice(0, 100), focusVisible: e.matches(':focus-visible') })); check(`firefox-keyboard-back/${label}`, r.focused && r.focusVisible, r);
          await p.goto(base + '/accessibility/'); const a = p.locator('main a.rounded-pill.h-14'); await a.scrollIntoViewIfNeeded(); await p.evaluate(() => { window.events = []; for (const t of ['dragstart', 'dragend', 'pointercancel', 'pointerup', 'mouseup']) addEventListener(t, (e) => events.push(e.type)); });
          const box = await a.boundingBox(); await p.mouse.move(box.x + 10, box.y + 10); await p.mouse.down(); await p.mouse.move(box.x + box.width + 20, box.y + box.height + 30); await p.mouse.up(); await sleep(600); const released = await a.evaluate((e) => ({ active: e.matches(':active'), events: window.events, draggable: e.draggable })); await p.keyboard.press('Escape'); await sleep(200); const escaped = await a.evaluate((e) => e.matches(':active')); results.observations.push({ name: `native-link-drag/${label}`, released, activeAfterEscape: escaped });
          await c.close();
        }
      }
    } finally { await b.close(); }
  }
} finally { before.s.kill('SIGTERM'); after.s.kill('SIGTERM'); fs.writeFileSync(OUT + '/resolved-observations.json', JSON.stringify(results, null, 2) + '\n'); }
if (results.checks.some((x) => !x.pass)) process.exitCode = 1;
