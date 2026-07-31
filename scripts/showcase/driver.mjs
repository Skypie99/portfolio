/**
 * driver.mjs — the playwright-core engine: themed contexts, the nav DSL, the
 * shot/record primitives, and the safety fences.
 *
 * Fences (mechanical, not just discipline):
 *  - any click/fill step whose target matches FORBIDDEN_TARGETS throws BEFORE
 *    acting (AccessMap talks to production Supabase; reads only, always);
 *  - non-GET requests to *.supabase.co are aborted and recorded — a scene that
 *    attempted one FAILS loudly;
 *  - Nominatim gets at most one request per run (rate-limit courtesy).
 *
 * Theme is SET, never hoped for: context colorScheme emulation (live from first
 * paint) + per-project localStorage seeds/attributes as the belt.
 */

import { createRequire } from 'node:module';

import { FORBIDDEN_TARGETS, NETWORK_FENCES } from './registry.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright-core');

let nominatimCount = 0;

export async function launchBrowser({ headless = true } = {}) {
  return chromium.launch({ headless });
}

/** Effective colorScheme for a capture theme ('matte' = mono project). */
const schemeFor = (theme) => (theme === 'dark' ? 'dark' : 'light');

export async function makeContext(browser, project, { theme, viewport, dsf = 2, recordVideoDir = null }) {
  const opts = {
    viewport,
    deviceScaleFactor: dsf,
    colorScheme: schemeFor(theme),
    reducedMotion: 'no-preference',
  };
  if (project.geolocation) {
    opts.geolocation = project.geolocation;
    opts.permissions = ['geolocation'];
  }
  if (recordVideoDir) opts.recordVideo = { dir: recordVideoDir, size: viewport };
  const ctx = await browser.newContext(opts);
  ctx.__violations = [];
  ctx.__createdAt = Date.now();

  // Pre-paint theme seeds.
  const t = project.theme ?? {};
  if (t.seeds && theme !== 'matte') {
    const entries = Object.entries(t.seeds(theme));
    await ctx.addInitScript((kv) => {
      for (const [k, v] of kv) {
        try { localStorage.setItem(k, v); } catch { /* storage denied */ }
      }
    }, entries);
  }
  if (t.seedScript && theme !== 'matte') await ctx.addInitScript(t.seedScript(theme));
  if (t.dataThemeAttr && theme !== 'matte') {
    await ctx.addInitScript((th) => {
      document.addEventListener('DOMContentLoaded', () => {
        document.documentElement.setAttribute('data-theme', th);
      });
    }, theme);
  }

  // Network fences.
  const { supabaseWriteFence, nominatimBudgetHost, nominatimMaxPerRun } = NETWORK_FENCES;
  await ctx.route('**/*', (route) => {
    const req = route.request();
    const url = req.url();
    if (supabaseWriteFence.test(url) && req.method() !== 'GET' && req.method() !== 'OPTIONS') {
      ctx.__violations.push(`${req.method()} ${url.slice(0, 120)}`);
      return route.abort('accessdenied');
    }
    if (nominatimBudgetHost.test(url)) {
      nominatimCount += 1;
      if (nominatimCount > nominatimMaxPerRun) return route.abort('accessdenied');
    }
    return route.continue();
  });

  return ctx;
}

/** Post-load theme assertions/pins the pre-paint layer can't cover. */
export async function settleTheme(page, project, theme) {
  const t = project.theme ?? {};
  if (theme === 'matte') return;
  if (t.postLoadAttr || t.dataThemeAttr) {
    await page.evaluate((th) => document.documentElement.setAttribute('data-theme', th), theme).catch(() => {});
  }
  if (t.assertDarkClass && theme === 'dark') {
    await page
      .waitForFunction(() => document.documentElement.classList.contains('dark'), { timeout: 5000 })
      .catch(() => {
        throw new Error('dark class never applied — theme seed failed');
      });
  }
  if (t.settleAfterLoadMs) await page.waitForTimeout(t.settleAfterLoadMs);
}

const fenceCheck = (step) => {
  const target = [
    step.clickLabel, step.clickLabelOpt, step.clickText, step.clickTextOpt, step.clickOpt,
    step.clickSel, step.clickFirst, step.tab,
    step.fillLabel?.label, step.fillLabelOpt?.label,
  ]
    .filter(Boolean)
    .join(' ');
  if (target && FORBIDDEN_TARGETS.test(target)) {
    throw new Error(`FENCE: nav step targets a terminal mutating control ("${target}") — refused`);
  }
};

async function tryClick(locator, timeout) {
  await locator.first().click({ timeout });
  return true;
}

/** Run one scene's nav steps. Optional steps swallow timeouts; required steps
 *  throw. Returns marks recorded by {mark} steps (ms since context creation). */
export async function runNav(page, ctx, steps, { timeout = 8000 } = {}) {
  const marks = {};
  for (const step of steps) {
    fenceCheck(step);
    if (step.wait) { await page.waitForTimeout(step.wait); continue; }
    if (step.mark) { marks[step.mark] = Date.now() - ctx.__createdAt; continue; }
    if (step.press) { await page.keyboard.press(step.press); continue; }
    if (step.waitFonts) { await page.evaluate(() => document.fonts?.ready).catch(() => {}); continue; }
    if (step.waitText) { await page.getByText(step.waitText, { exact: false }).first().waitFor({ timeout }); continue; }
    if (step.scrollTo) {
      await page.evaluate((sel) => document.querySelector(sel)?.scrollIntoView({ behavior: 'instant', block: 'start' }), step.scrollTo);
      continue;
    }
    if (step.evaluateOpt) { await page.evaluate(step.evaluateOpt).catch(() => {}); continue; }
    if (step.drag) {
      const { from, to, ms = 600 } = step.drag;
      await page.mouse.move(from[0], from[1]);
      await page.mouse.down();
      const hops = 24;
      for (let i = 1; i <= hops; i += 1) {
        await page.mouse.move(
          from[0] + ((to[0] - from[0]) * i) / hops,
          from[1] + ((to[1] - from[1]) * i) / hops,
        );
        await page.waitForTimeout(ms / hops);
      }
      await page.mouse.up();
      continue;
    }
    if (step.clickLabel) { await tryClick(page.getByLabel(step.clickLabel, { exact: false }), timeout); continue; }
    if (step.clickLabelOpt) { await tryClick(page.getByLabel(step.clickLabelOpt, { exact: false }), 3000).catch(() => {}); continue; }
    if (step.clickText) { await tryClick(page.getByText(step.clickText, { exact: false }), timeout); continue; }
    if (step.clickTextOpt) { await tryClick(page.getByText(step.clickTextOpt, { exact: false }), 3000).catch(() => {}); continue; }
    if (step.clickOpt) {
      const byLabel = page.getByLabel(step.clickOpt, { exact: false });
      await tryClick(byLabel, 2500).catch(async () => {
        await tryClick(page.getByText(step.clickOpt, { exact: false }), 2000).catch(() => {});
      });
      continue;
    }
    if (step.clickSel || step.clickFirst) { await tryClick(page.locator(step.clickSel ?? step.clickFirst), timeout); continue; }
    if (step.fillLabel) { await page.getByLabel(step.fillLabel.label, { exact: false }).first().fill(step.fillLabel.value, { timeout }); continue; }
    if (step.fillLabelOpt) {
      await page.getByLabel(step.fillLabelOpt.label, { exact: false }).first().fill(step.fillLabelOpt.value, { timeout: 3000 }).catch(() => {});
      continue;
    }
    if (step.tab) {
      const name = step.tab;
      const cascade = [
        () => tryClick(page.getByRole('tab', { name, exact: false }), 2500),
        () => tryClick(page.getByRole('button', { name, exact: false }), 2500),
        () => tryClick(page.getByLabel(name, { exact: false }), 2500),
        () => tryClick(page.getByText(name, { exact: true }), 2500),
      ];
      let done = false;
      for (const attempt of cascade) {
        // eslint-disable-next-line no-await-in-loop
        done = await attempt().catch(() => false);
        if (done) break;
      }
      if (!done) throw new Error(`tab "${name}" not found by role/label/text`);
      continue;
    }
    throw new Error(`unknown nav step: ${JSON.stringify(step)}`);
  }
  return marks;
}

/** Stable still: fonts settled, two frames painted, focus blurred. */
export async function shoot(page, outPath, { fullPage = false, settleMs = 450 } = {}) {
  await page.evaluate(() => document.fonts?.ready).catch(() => {});
  await page.evaluate(
    () =>
      new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
  ).catch(() => {});
  await page.evaluate(() => document.activeElement?.blur?.()).catch(() => {});
  await page.waitForTimeout(settleMs);
  await page.screenshot({ path: outPath, fullPage });
}

export function assertNoViolations(ctx, label) {
  if (ctx.__violations.length) {
    throw new Error(`WRITE FENCE tripped during ${label}: ${ctx.__violations.join(' · ')}`);
  }
}

/** Three sampled frames must differ — proves RN Animated actually ran while
 *  recording (headless rAF is live in Playwright, but this is the belt). */
export async function motionProbe(page, ms = 900) {
  const a = await page.screenshot();
  await page.waitForTimeout(ms / 2);
  const b = await page.screenshot();
  await page.waitForTimeout(ms / 2);
  const c = await page.screenshot();
  return !(a.equals(b) && b.equals(c));
}
