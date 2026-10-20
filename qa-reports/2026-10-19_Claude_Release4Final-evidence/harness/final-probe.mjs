// Release 4 final: focused proof of the two corrections on the production export.
//   R4-F03  work-row touch hover residue (globals.css hover gate)
//   R4-F05  keyboard return seat after Back when the Enter click carries detail 1 (Firefox shape)
// Plus preservation: desktop hover / press / cancel / focus cues, pointer Back keeps focus-to-main.
// Serves ./out with the tracked Node static server. Run from the worktree root after `npm run build`:
//   RELEASE4_BROWSERS=chromium,webkit node qa-reports/2026-10-19_Claude_Release4Final-evidence/harness/final-probe.mjs
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { chromium, webkit } from 'playwright-core';

const OUT = path.resolve(process.env.RELEASE4_EVIDENCE_DIR || 'qa-reports/2026-10-19_Claude_Release4Final-evidence');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const result = { commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), dirty: execFileSync('git', ['status', '--porcelain', '--', 'app', 'components', 'lib'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean), started: new Date().toISOString(), browsers: [], checks: [], observations: [], errors: [] };
const check = (name, pass, details = {}) => { result.checks.push({ name, pass: Boolean(pass), details }); console.log(pass ? 'PASS' : 'FAIL', name, pass ? '' : JSON.stringify(details)); };
const observe = (name, details) => result.observations.push({ name, details });
const save = () => fs.writeFileSync(path.join(OUT, process.env.RELEASE4_RESULTS_NAME || 'final-probe.json'), JSON.stringify(result, null, 2) + '\n');

const DOT = "span[aria-hidden='true'].rounded-full";
const LEGACY_UNGATED = `#work ol > li:has(a:hover) a.group > ${DOT} { width: 0.5rem; height: 0.5rem; }`;
const read = (el) => {
  const li = el.closest('li'); const dot = li.querySelector("a.group > span[aria-hidden='true'].rounded-full");
  return { dot: parseFloat(getComputedStyle(dot).width), rowBorder: getComputedStyle(li).borderTopColor, hover: el.matches(':hover'), active: el.matches(':active'), focusVisible: el.matches(':focus-visible'), focused: document.activeElement === el };
};

const server = spawn(process.execPath, ['scripts/static-serve.mjs', path.resolve('out'), '0'], { stdio: ['ignore', 'pipe', 'inherit'] });
const base = await new Promise((resolve, reject) => { server.once('error', reject); server.stdout.on('data', (d) => { const m = String(d).match(/http:\/\/127\.0\.0\.1:\d+/); if (m) resolve(m[0]); }); });

async function home(context, theme) {
  const p = await context.newPage();
  p.on('pageerror', (e) => result.errors.push({ url: p.url(), type: 'pageerror', message: String(e) }));
  p.on('console', (m) => { if (m.type() === 'error') result.errors.push({ url: p.url(), type: 'console', message: m.text() }); });
  await p.goto(base + '/', { waitUntil: 'load' }); await p.evaluate(() => document.fonts.ready); await sleep(400);
  return p;
}
async function seat(loc) { await loc.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await sleep(1400); }
const newCtx = (browser, theme, extra) => browser.newContext({ colorScheme: theme, ...extra }).then(async (c) => { await c.addInitScript((t) => { try { localStorage.setItem('theme', t); } catch {} }, theme); return c; });

try {
  for (const [name, type] of [['chromium', chromium], ['webkit', webkit]].filter(([n]) => (process.env.RELEASE4_BROWSERS || 'chromium,webkit').split(',').includes(n))) {
    const browser = await type.launch({ headless: true });
    result.browsers.push({ name, version: browser.version() });
    try {
      // ── R4-F03: phone taps must leave every work row at rest ────────────────
      for (const theme of ['light', 'dark']) for (const motion of ['no-preference', 'reduce']) {
        const id = `${name}/393/${theme}/${motion}`;
        const c = await newCtx(browser, theme, { viewport: { width: 393, height: 852 }, hasTouch: true, isMobile: true, reducedMotion: motion });
        const p = await home(c, theme);
        const rows = await p.locator('#work ol > li').count();
        check(`${id}/rows-present`, rows >= 3, { rows });
        // Keep the tap's hover/press/release, but stop the navigation so the post-release state is observable.
        // window capture runs before the site's document-capture interceptor.
        await p.evaluate(() => window.addEventListener('click', (e) => { e.preventDefault(); e.stopImmediatePropagation(); }, true));
        let sticky = 0;
        for (let i = 0; i < rows; i++) for (const target of ['doorway', 'title']) {
          const loc = target === 'doorway' ? p.locator('#work ol > li').nth(i).locator('a.group.rounded-pill') : p.locator('#work ol > li').nth(i).locator('a[data-return-focus]');
          await seat(loc);
          const rest = await loc.evaluate(read);
          const box = await loc.boundingBox();
          await p.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2); await sleep(motion === 'reduce' ? 250 : 650);
          const after = await loc.evaluate(read);
          if (after.hover) sticky++;
          check(`${id}/row${i}-${target}/tap-returns-to-rest`, after.dot === rest.dot && after.rowBorder === rest.rowBorder && !after.active, { rest, after });
        }
        // Negative control: re-add the old ungated hover rule; a sticky :hover must now enlarge the dot again.
        // The last tap was the last row's title, so that row is the one still holding :has(a:hover).
        const last = p.locator('#work ol > li').nth(rows - 1).locator('a.group.rounded-pill');
        const rowHovered = await last.evaluate((e) => e.closest('li').matches(':has(a:hover)'));
        await p.addStyleTag({ content: LEGACY_UNGATED }); await sleep(450);
        const control = await last.evaluate(read);
        observe(`${id}/negative-control`, { stickyHoverTaps: sticky, rowHovered, control });
        if (sticky && rowHovered) check(`${id}/negative-control-detects-legacy-rule`, control.dot === 8, { control, note: 'the probe is sensitive: the legacy ungated rule re-creates the 8px residue' });
        else observe(`${id}/negative-control-vacuous`, 'engine left no sticky :hover after tap; the gate cannot be observed by this input path');
        await c.close();
      }

      // ── Desktop preservation: fine-pointer hover / press / cancel / focus ─────
      for (const theme of ['light', 'dark']) {
        const id = `${name}/1440/${theme}`;
        const c = await newCtx(browser, theme, { viewport: { width: 1440, height: 900 } });
        const p = await home(c, theme);
        const row = p.locator('#work ol > li').first(), title = row.locator('a[data-return-focus]'), door = row.locator('a.group.rounded-pill');
        await seat(door); await p.mouse.move(2, 2); await sleep(400);
        const rest = await door.evaluate(read);
        const tb = await title.boundingBox(); await p.mouse.move(tb.x + 8, tb.y + tb.height / 2); await sleep(450);
        const titleHover = await door.evaluate(read);
        const db = await door.boundingBox(); await p.mouse.move(db.x + db.width / 2, db.y + db.height / 2); await sleep(450);
        const doorHover = await door.evaluate(read);
        await p.mouse.down(); await sleep(250); const pressed = await door.evaluate(read);
        await p.mouse.move(2, 2, { steps: 6 }); await p.mouse.up(); await sleep(500); const dropped = await door.evaluate(read);
        // A drag-away from a link is a native drag: Chromium fires dragstart/pointercancel/dragend with no
        // mouseup and keeps the :active chain until the next pointer movement (main behaves the same). Record
        // that immediate state; assert rest after the next movement.
        observe(`${id}/drag-away-immediately-after-drop`, dropped);
        await p.mouse.move(4, 4); await sleep(500); const cancelled = await door.evaluate(read);
        check(`${id}/rest-6px`, rest.dot === 6, rest);
        check(`${id}/title-hover-row-cue-8px-and-rule`, titleHover.dot === 8 && titleHover.rowBorder !== rest.rowBorder, { rest, titleHover });
        check(`${id}/doorway-hover-8px`, doorHover.dot === 8, doorHover);
        check(`${id}/pressed-4px`, pressed.dot === 4 && pressed.active, pressed);
        check(`${id}/cancel-drag-away-returns-to-rest`, cancelled.dot === rest.dot && cancelled.rowBorder === rest.rowBorder, { rest, cancelled });
        await c.close();
        // Keyboard focus on a fresh page (keyboard modality, no prior pointer input).
        const kc = await newCtx(browser, theme, { viewport: { width: 1440, height: 900 } });
        const kp = await home(kc, theme);
        const krow = kp.locator('#work ol > li').first(), ktitle = krow.locator('a[data-return-focus]'), kdoor = krow.locator('a.group.rounded-pill');
        await seat(ktitle); await kp.keyboard.press('Shift'); await ktitle.focus(); await sleep(450);
        const focus = await kdoor.evaluate(read); const tf = await ktitle.evaluate(read);
        check(`${id}/title-focus-visible-row-cue-8px`, tf.focusVisible && focus.dot === 8 && focus.rowBorder !== rest.rowBorder, { tf, focus });
        await kc.close();
      }

      // ── R4-F05: keyboard return seat, and the Firefox-shaped (detail 1) activation ──
      for (const mode of ['enter', 'firefox-shaped-detail-1', 'pointer']) {
        const id = `${name}/1440/back/${mode}`;
        const c = await newCtx(browser, 'light', { viewport: { width: 1440, height: 900 } });
        const p = await home(c, 'light');
        const title = p.locator('#work a[data-return-focus]').first(); const href = await title.getAttribute('href');
        await seat(title);
        if (mode === 'pointer') await title.click();
        else {
          await p.keyboard.press('Shift'); await title.focus(); await sleep(300);
          const fv = await title.evaluate((e) => e.matches(':focus-visible'));
          check(`${id}/departure-link-focus-visible`, fv, { fv });
          if (mode === 'enter') { await p.keyboard.down('Enter'); await sleep(20); await p.keyboard.up('Enter'); }
          // Gecko's Enter-on-link click: click count 1 on the keyboard-focused link (Element::DispatchClickEvent).
          else await title.evaluate((e) => e.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window, button: 0, detail: 1 })));
        }
        await p.waitForURL((u) => u.pathname.replace(/\/$/, '') === href.replace(/\/$/, ''), { timeout: 10000 }); await sleep(1200);
        await p.goBack(); await p.waitForURL(base + '/'); await sleep(1200);
        const back = await title.evaluate((e) => ({ focused: document.activeElement === e, focusVisible: e.matches(':focus-visible'), active: document.activeElement?.id || document.activeElement?.tagName, top: e.getBoundingClientRect().top, bottom: e.getBoundingClientRect().bottom }));
        if (mode === 'pointer') check(`${id}/pointer-back-keeps-focus-on-main`, !back.focused && back.active === 'main', back);
        else check(`${id}/back-reseats-on-row-link`, back.focused && back.focusVisible && back.top >= 0 && back.bottom <= 900, back);
        await c.close();
      }
    } finally { await browser.close(); save(); }
  }
} finally { server.kill('SIGTERM'); result.finished = new Date().toISOString(); save(); }
const failed = result.checks.filter((x) => !x.pass);
console.log(JSON.stringify({ checks: result.checks.length, failed: failed.length, errors: result.errors.length }));
if (failed.length || result.errors.length) process.exitCode = 1;
