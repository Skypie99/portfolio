// Interaction regression gate: computed styles of representative links in
// rest / hover / pointer press / keyboard focus, under normal and reduced
// motion, plus a touch-capable context (tap, then release), for two builds.
// usage: node interaction-gate.cjs <baselineUrl> <candidateUrl> <outDir>
const assertStyled = require('./guard.cjs');
const { chromium } = require(process.env.PW);
const fs = require('fs');
const path = require('path');

const PROPS = ['color', 'backgroundColor', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor', 'borderTopWidth',
  'boxShadow', 'transform', 'translate', 'opacity', 'outlineStyle', 'outlineWidth', 'outlineColor', 'outlineOffset', 'textDecorationColor',
  'transitionProperty', 'transitionDuration', 'transitionTimingFunction', 'transitionDelay', 'cursor', 'height'];
const PART_PROPS = ['width', 'height', 'backgroundColor', 'transform', 'translate', 'color', 'transitionProperty', 'transitionDuration', 'transitionTimingFunction'];
const ROW_PROPS = ['borderTopColor', 'borderBottomColor', 'borderTopWidth', 'borderBottomWidth', 'transitionProperty', 'transitionDuration', 'transitionTimingFunction'];

// Each target: a route, a finder (runs in page, returns the element) and the
// width it is probed at. Labels differ between builds, so find by href/role.
const TARGETS = [
  { id: 'case-pill-flagstone', route: '/work/flagstone/', width: 1440, find: `[...document.querySelectorAll('a[href="https://flagstone.skypistudio.com"]')].find(a => a.className.includes('rounded-pill'))` },
  { id: 'case-pill-claude-corp-1024', route: '/work/claude-corp/', width: 1024, find: `[...document.querySelectorAll('a[href="https://claudecorp.skypistudio.com"]')].find(a => a.className.includes('rounded-pill'))` },
  { id: 'case-pill-ghost-code-390', route: '/work/ghost-code/', width: 390, find: `[...document.querySelectorAll('a[href="https://ghostcode.skypistudio.com"]')].find(a => a.className.includes('rounded-pill'))` },
  { id: 'case-pill-prompt-library-1024', route: '/work/prompt-library/', width: 1024, find: `[...document.querySelectorAll('a[href="https://prompts.skypistudio.com"]')].find(a => a.className.includes('rounded-pill'))` },
  { id: 'case-pill-prompt-library-320', route: '/work/prompt-library/', width: 320, find: `[...document.querySelectorAll('a[href="https://prompts.skypistudio.com"]')].find(a => a.className.includes('rounded-pill'))` },
  { id: 'case-pill-claude-corp-320', route: '/work/claude-corp/', width: 320, find: `[...document.querySelectorAll('a[href="https://claudecorp.skypistudio.com"]')].find(a => a.className.includes('rounded-pill'))` },
  { id: 'case-pill-dashboard-1024', route: '/work/dashboard/', width: 1024, find: `[...document.querySelectorAll('a[href="https://dashboard.skypistudio.com"]')].find(a => a.className.includes('rounded-pill'))` },
  { id: 'appstore-pill-flagstone-1024', route: '/work/flagstone/', width: 1024, find: `[...document.querySelectorAll('a[href^="https://apps.apple.com"]')].find(a => a.className.includes('rounded-pill'))` },
  { id: 'appstore-pill-flagstone', route: '/work/flagstone/', width: 1440, find: `[...document.querySelectorAll('a[href^="https://apps.apple.com"]')].find(a => a.className.includes('rounded-pill'))` },
  { id: 'card-demo-ghost-code', route: '/work/', width: 1440, find: `[...document.querySelectorAll('a[href="https://ghostcode.skypistudio.com"]')].find(a => a.closest('div.border-t'))` },
  { id: 'card-demo-prompt-library-768', route: '/work/', width: 768, find: `[...document.querySelectorAll('a[href="https://prompts.skypistudio.com"]')].find(a => a.closest('div.border-t'))` },
  { id: 'card-github-ghost-code', route: '/work/', width: 1440, find: `[...document.querySelectorAll('a[href="https://github.com/Skypie99/ghost-code"]')].find(a => a.closest('div.border-t'))` },
  { id: 'card-view-project-ghost-code', route: '/work/', width: 1440, find: `[...document.querySelectorAll('a[href="/work/ghost-code/"]')].find(a => /View project/.test(a.textContent))` },
  { id: 'home-row1-title-flagstone', route: '/', width: 1440, row: true, find: `document.querySelectorAll('#work ol > li')[0].querySelector('h3 a')` },
  { id: 'home-row5-title-ghost-code', route: '/', width: 1440, row: true, find: `document.querySelectorAll('#work ol > li')[4].querySelector('h3 a')` },
  { id: 'home-row5-doorway-ghost-code', route: '/', width: 1440, row: true, find: `document.querySelectorAll('#work ol > li')[4].querySelector('a.group')` },
  { id: 'home-row5-title-ghost-code-390', route: '/', width: 390, row: true, find: `document.querySelectorAll('#work ol > li')[4].querySelector('h3 a')` },
  { id: 'back-home-work', route: '/work/', width: 1440, find: `[...document.querySelectorAll('a[href="/"]')].find(a => /Back to home/.test(a.textContent))` },
  { id: 'back-home-contact-control', route: '/contact/', width: 1440, find: `[...document.querySelectorAll('a[href="/"]')].find(a => /Back to home/.test(a.textContent))` },
  { id: 'contact-linkedin', route: '/contact/', width: 1440, find: `[...document.querySelectorAll('main a[href*="linkedin.com"]')][0]` },
];

async function capture(page, find, row) {
  return page.evaluate(([find, PROPS, PART_PROPS, ROW_PROPS, row]) => {
    const el = eval(find);
    const pick = (node, props) => { const cs = getComputedStyle(node); return Object.fromEntries(props.map((p) => [p, cs[p]])); };
    const out = { self: pick(el, PROPS), matches: { hover: el.matches(':hover'), active: el.matches(':active'), focusVisible: el.matches(':focus-visible') } };
    const dot = el.querySelector('span[aria-hidden="true"].rounded-full');
    if (dot) out.dot = pick(dot, PART_PROPS);
    const arrow = [...el.querySelectorAll('span[aria-hidden="true"]')].find((s) => /[←→↗]/.test(s.textContent));
    if (arrow) out.arrow = pick(arrow, PART_PROPS);
    if (row) out.row = pick(el.closest('li'), ROW_PROPS);
    out.text = el.textContent.replace(/\s+/g, ' ').trim();
    out.width = el.getBoundingClientRect().width;
    return out;
  }, [find, PROPS, PART_PROPS, ROW_PROPS, row]);
}

async function probeBuild(browser, base, t, mode) {
  const touch = mode === 'touch';
  const ctx = await browser.newContext({
    viewport: { width: t.width, height: 900 },
    colorScheme: mode.endsWith('dark') ? 'dark' : 'light',
    reducedMotion: mode.startsWith('reduced') ? 'reduce' : 'no-preference',
    hasTouch: touch, isMobile: touch,
  });
  // Keep every activation on the page: no navigation, no popups.
  await ctx.addInitScript(() => document.addEventListener('click', (e) => e.preventDefault(), true));
  const page = await ctx.newPage();
  await page.goto(base + t.route, { waitUntil: 'networkidle' });
  await assertStyled(page);
  const handle = (await page.evaluateHandle(t.find)).asElement();
  await handle.scrollIntoViewIfNeeded();
  await page.mouse.move(1, 1);
  await page.waitForTimeout(900);
  const settle = () => page.waitForTimeout(900);
  const res = { hoverMedia: await page.evaluate(() => matchMedia('(hover: hover)').matches) };
  res.rest = await capture(page, t.find, t.row);
  if (touch) {
    res.pointerReachable = await handle.evaluate((el) => { const r = el.getBoundingClientRect(); const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return el.contains(top); });
    const box = await handle.boundingBox();
    await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
    await settle();
    res.afterTap = await capture(page, t.find, t.row);
  } else {
    // A pre-existing overlay can sit on top of a target (see
    // evidence/preexisting/): record that instead of forcing a pointer
    // through it, and still probe keyboard focus.
    const reachable = await handle.evaluate((el) => { const r = el.getBoundingClientRect(); const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return el.contains(top); });
    res.pointerReachable = reachable;
    if (reachable) {
      await handle.hover(); await settle();
      res.hover = await capture(page, t.find, t.row);
      await page.mouse.down(); await settle();
      res.press = await capture(page, t.find, t.row);
      await page.mouse.up(); await page.mouse.move(1, 1); await settle();
      res.released = await capture(page, t.find, t.row);
    }
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    await page.keyboard.press('Shift');
    await handle.evaluate((el) => el.focus());
    await settle();
    res.focus = await capture(page, t.find, t.row);
  }
  await ctx.close();
  return res;
}

function flatten(obj, prefix = '', out = {}) {
  for (const [k, v] of Object.entries(obj)) {
    if (v && typeof v === 'object') flatten(v, `${prefix}${k}.`, out); else out[prefix + k] = v;
  }
  return out;
}

(async () => {
  const [baseUrl, candUrl, outDir] = process.argv.slice(2);
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const MODES = ['light', 'dark', 'reduced-light', 'reduced-dark', 'touch'];
  const all = [];
  for (const t of TARGETS) {
    for (const mode of MODES) {
      const b = await probeBuild(browser, baseUrl, t, mode);
      const c = await probeBuild(browser, candUrl, t, mode);
      const fb = flatten(b), fc = flatten(c);
      const diffs = [];
      for (const k of new Set([...Object.keys(fb), ...Object.keys(fc)])) if (String(fb[k]) !== String(fc[k])) diffs.push({ key: k, baseline: fb[k], candidate: fc[k] });
      all.push({ target: t.id, route: t.route, width: t.width, mode, baseline: b, candidate: c, diffs });
      process.stdout.write('.');
    }
  }
  await browser.close();
  fs.writeFileSync(path.join(outDir, 'interaction-gate.json'), JSON.stringify(all, null, 1));
  console.log('\n');
  for (const r of all) {
    const d = r.diffs.filter((x) => !/\.text$|^.*\.?width$/.test(x.key));
    console.log(`${r.target} [${r.mode}] diffs=${d.length}${d.length ? '\n   ' + d.map((x) => `${x.key}: ${x.baseline} -> ${x.candidate}`).join('\n   ') : ''}`);
  }
})();
