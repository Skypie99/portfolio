#!/usr/bin/env node

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright-core');

function argument(name, fallback) {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : process.argv[index + 1];
}

const url = argument('--url');
const outputDirectory = argument('--out');
const label = argument('--label', 'candidate');
const source = argument('--source', 'unknown');
const quick = process.argv.includes('--quick');
const historyOnly = process.argv.includes('--history-only');
const executablePath =
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ||
  path.join(
    os.homedir(),
    'Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
  );

if (!url || !outputDirectory) {
  console.error(
    'Usage: node scripts/verify-intro-focus.cjs --url <local-url> --out <directory> [--label <name>] [--source <sha>] [--quick]',
  );
  process.exit(2);
}

const targetUrl = new URL(url);
if (!['127.0.0.1', 'localhost'].includes(targetUrl.hostname)) {
  console.error('This verifier accepts local URLs only.');
  process.exit(2);
}

fs.mkdirSync(outputDirectory, { recursive: true });

const desktopReduced = [
  { name: 'desktop-light-reduce', width: 1440, height: 900, theme: 'light', motion: 'reduce', visits: 2 },
  { name: 'desktop-dark-reduce', width: 1440, height: 900, theme: 'dark', motion: 'reduce', visits: 2 },
];

const extendedScenarios = [
  { name: 'desktop-light-motion', width: 1440, height: 900, theme: 'light', motion: 'no-preference', visits: 1 },
  { name: 'desktop-dark-motion', width: 1440, height: 900, theme: 'dark', motion: 'no-preference', visits: 1 },
  { name: 'mobile-light-reduce', width: 390, height: 844, theme: 'light', motion: 'reduce', visits: 1 },
  { name: 'mobile-dark-reduce', width: 390, height: 844, theme: 'dark', motion: 'reduce', visits: 1 },
  { name: 'mobile-light-motion', width: 390, height: 844, theme: 'light', motion: 'no-preference', visits: 1 },
  { name: 'mobile-dark-motion', width: 390, height: 844, theme: 'dark', motion: 'no-preference', visits: 1 },
  { name: 'shell-below-767', width: 767, height: 900, theme: 'light', motion: 'reduce', visits: 1 },
  { name: 'shell-at-768', width: 768, height: 900, theme: 'light', motion: 'reduce', visits: 1 },
  { name: 'shell-above-769', width: 769, height: 900, theme: 'light', motion: 'reduce', visits: 1 },
  { name: 'desktop-short', width: 1440, height: 600, theme: 'light', motion: 'reduce', visits: 1 },
];

function visibleRatio(rect, viewport) {
  if (!rect || rect.width <= 0 || rect.height <= 0) return 0;
  const visibleWidth = Math.max(0, Math.min(rect.right, viewport.width) - Math.max(rect.left, 0));
  const visibleHeight = Math.max(0, Math.min(rect.bottom, viewport.height) - Math.max(rect.top, 0));
  return (visibleWidth * visibleHeight) / (rect.width * rect.height);
}

async function inspect(page) {
  return page.evaluate(() => {
    const box = (element) => {
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      return {
        x: rect.x,
        y: rect.y,
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
      };
    };
    const active = document.activeElement;
    const activeBox = box(active);
    const point = activeBox
      ? {
          x: Math.min(innerWidth - 1, Math.max(0, activeBox.x + activeBox.width / 2)),
          y: Math.min(innerHeight - 1, Math.max(0, activeBox.y + activeBox.height / 2)),
        }
      : null;
    const hit = point ? document.elementFromPoint(point.x, point.y) : null;
    const activeStyle = active ? getComputedStyle(active) : null;
    const skip = document.querySelector('a[href="#hero"]');
    const skipStyle = skip ? getComputedStyle(skip) : null;
    const rail = document.querySelector('[data-rail]');

    return {
      scrollY,
      hash: location.hash,
      active: {
        tag: active?.tagName || '',
        name: active?.getAttribute('aria-label') || active?.textContent?.trim() || '',
        href: active?.getAttribute('href') || null,
        box: activeBox,
        focusVisible: active?.matches(':focus-visible') || false,
        outline: activeStyle?.outline || '',
      },
      hit: hit
        ? {
            tag: hit.tagName,
            className: typeof hit.className === 'string' ? hit.className : '',
            text: hit.textContent?.trim().slice(0, 100) || '',
          }
        : null,
      unobscured: Boolean(hit && active && (active === hit || active.contains(hit))),
      identity: box(document.querySelector('[data-hero-identity]')),
      hero: box(document.querySelector('#hero')),
      skip: skip
        ? {
            done: skip.hasAttribute('data-skip-done'),
            visible:
              skipStyle?.visibility === 'visible' &&
              skipStyle?.display !== 'none' &&
              Number(skipStyle?.opacity || '0') > 0,
            box: box(skip),
          }
        : null,
      rail: rail
        ? {
            inert: rail.hasAttribute('inert'),
            display: getComputedStyle(rail).display,
            box: box(rail),
          }
        : null,
      viewport: { width: innerWidth, height: innerHeight, devicePixelRatio },
      bodyHasContent: Boolean(document.body.innerText.trim()),
      errorOverlay: Boolean(
        document.querySelector(
          '[data-nextjs-dialog], .vite-error-overlay, #webpack-dev-server-client-overlay',
        ),
      ),
    };
  });
}

function focusIsVisible(state) {
  if (!state.active.focusVisible || !state.active.box) return false;
  const ratio = visibleRatio(state.active.box, state.viewport);
  return ratio > 0 && state.unobscured && state.active.outline !== 'none';
}

async function prepare(page) {
  await page.goto(url, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(800);
}

async function sequenceJourney(page, scenario, visit) {
  await prepare(page);
  const initial = await inspect(page);
  const screenshotPath = path.join(outputDirectory, `${scenario.name}-${visit}-first-frame.png`);
  await page.screenshot({ path: screenshotPath });

  const steps = [];
  const count = scenario.width >= 768 ? 18 : 10;
  for (let tab = 1; tab <= count; tab += 1) {
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);
    const state = await inspect(page);
    steps.push({
      tab,
      ...state,
      focusIndicatorVisible: focusIsVisible(state),
      identityVisibleRatio: visibleRatio(state.identity, state.viewport),
    });
    if (tab <= 3) {
      await page.screenshot({
        path: path.join(outputDirectory, `${scenario.name}-${visit}-tab-${tab}.png`),
      });
    }
  }

  const desktopRailVisible = initial.rail?.display !== 'none';
  const first = steps[0];
  const second = steps[1];
  const introSkipStep = steps.find((step) => step.active.href === '#hero');
  const covered = steps.filter((step) => step.active.focusVisible && !step.focusIndicatorVisible);
  const failures = [];
  if (!initial.bodyHasContent || initial.errorOverlay) failures.push('page-load');
  if (first?.active.name !== 'Skip to main content' || !first.focusIndicatorVisible) {
    failures.push('first-focus-skip-main');
  }
  if (desktopRailVisible && !initial.rail?.inert) failures.push('desktop-rail-not-inert-at-intro');
  if (
    !introSkipStep ||
    !introSkipStep.skip?.visible ||
    !introSkipStep.focusIndicatorVisible
  ) {
    failures.push('intro-skip-not-discoverable');
  }
  if (desktopRailVisible && second?.active.href !== '#hero') {
    failures.push('intro-skip-not-second-visible-stop');
  }
  if (covered.length > 0) failures.push('covered-focus');

  return { kind: 'sequence', scenario: scenario.name, visit, initial, steps, covered, failures };
}

async function bypassJourney(page, scenario, method) {
  await prepare(page);
  if (method === 'keyboard') {
    let found = false;
    for (let tab = 1; tab <= 20; tab += 1) {
      await page.keyboard.press('Tab');
      const state = await inspect(page);
      if (state.active.href === '#hero' && state.skip?.visible) {
        found = true;
        break;
      }
    }
    if (found) await page.keyboard.press('Enter');
  } else {
    await page.locator('a[href="#hero"]').click();
  }
  await page.waitForTimeout(300);
  const landing = await inspect(page);
  const landingRatio = visibleRatio(landing.identity, landing.viewport);
  await page.keyboard.press('Tab');
  await page.waitForTimeout(200);
  const next = await inspect(page);
  await page.keyboard.press('Shift+Tab');
  await page.waitForTimeout(200);
  const reverse = await inspect(page);
  const failures = [];
  // ViewTransitions intentionally strips the one-shot fragment after the
  // browser completes its native jump, so the durable contract is the landed
  // geometry and focus state rather than a persistent location.hash value.
  if (landing.scrollY === 0 || landingRatio < 0.75) failures.push('identity-landing');
  if (!landing.skip?.done) failures.push('skip-not-retired-at-landing');
  if (!focusIsVisible(next)) failures.push('next-focus-not-visible');
  if (reverse.active.focusVisible && !focusIsVisible(reverse)) failures.push('reverse-focus-covered');
  return {
    kind: 'bypass',
    scenario: scenario.name,
    method,
    landing: { ...landing, identityVisibleRatio: landingRatio },
    next,
    reverse,
    failures,
  };
}

async function historyJourney(page, scenario) {
  await prepare(page);
  await page.locator('a[href="#hero"]').click();
  await page.waitForTimeout(300);
  const hero = await inspect(page);
  const heroIdentityRatio = visibleRatio(hero.identity, hero.viewport);

  const workLink = page.locator('a[href="#work"]').first();
  await workLink.scrollIntoViewIfNeeded();
  await page.waitForTimeout(100);
  const departure = await inspect(page);
  await workLink.click();
  await page.waitForTimeout(300);
  const work = await inspect(page);
  const workBox = await page.locator('#work').evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height,
    };
  });
  const workRatio = visibleRatio(workBox, work.viewport);

  await page.evaluate(() => history.back());
  await page.waitForTimeout(500);
  const back = await inspect(page);

  await page.evaluate(() => history.forward());
  await page.waitForTimeout(500);
  const forward = await inspect(page);
  const forwardWorkBox = await page.locator('#work').evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height,
    };
  });
  const forwardWorkRatio = visibleRatio(forwardWorkBox, forward.viewport);

  await page.reload({ waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  const reload = await inspect(page);

  const failures = [];
  if (heroIdentityRatio < 0.75) failures.push('hero-anchor-landing');
  if (workRatio === 0) failures.push('work-anchor-landing');
  if (Math.abs(back.scrollY - departure.scrollY) > 2) failures.push('back-scroll-restoration');
  if (forwardWorkRatio === 0) failures.push('forward-scroll-restoration');
  if (reload.scrollY === 0) failures.push('reload-scroll-restoration');

  return {
    kind: 'history',
    scenario: scenario.name,
    hero: { ...hero, identityVisibleRatio: heroIdentityRatio },
    departure,
    work: { ...work, workVisibleRatio: workRatio },
    back,
    forward: { ...forward, workVisibleRatio: forwardWorkRatio },
    reload,
    failures,
  };
}

(async () => {
  const browser = await chromium.launch({ executablePath, headless: true });
  const browserVersion = browser.version();
  const scenarios = historyOnly
    ? [desktopReduced[0]]
    : quick
      ? desktopReduced
      : [...desktopReduced, ...extendedScenarios];
  const results = [];
  const blockedExternalRequests = [];
  const pageErrors = [];

  for (const scenario of scenarios) {
    const context = await browser.newContext({
      viewport: { width: scenario.width, height: scenario.height },
      colorScheme: scenario.theme,
      reducedMotion: scenario.motion,
    });
    await context.route('**/*', async (route) => {
      const requestUrl = new URL(route.request().url());
      if (['127.0.0.1', 'localhost'].includes(requestUrl.hostname)) {
        await route.continue();
      } else {
        blockedExternalRequests.push(requestUrl.origin + requestUrl.pathname);
        await route.abort('blockedbyclient');
      }
    });
    const page = await context.newPage();
    page.on('pageerror', (error) => pageErrors.push(`${scenario.name}: ${error.message}`));

    if (historyOnly) {
      results.push(await historyJourney(page, scenario));
    } else {
      for (let visit = 1; visit <= scenario.visits; visit += 1) {
        results.push(await sequenceJourney(page, scenario, visit === 1 ? 'fresh' : 'repeat'));
      }

      if (!scenario.name.startsWith('shell-') && scenario.name !== 'desktop-short') {
        results.push(await bypassJourney(page, scenario, 'keyboard'));
        results.push(await bypassJourney(page, scenario, 'pointer'));
      }
    }
    await context.close();
  }

  await browser.close();
  const failures = results.flatMap((result) =>
    result.failures.map((failure) => ({ scenario: result.scenario, kind: result.kind, failure })),
  );
  if (pageErrors.length > 0) failures.push({ scenario: 'all', kind: 'runtime', failure: 'page-error' });

  const evidence = {
    label,
    source,
    url,
    browser: browserVersion,
    zoomPercent: 100,
    generatedAt: new Date().toISOString(),
    quick,
    historyOnly,
    blockedExternalRequests: [...new Set(blockedExternalRequests)].sort(),
    pageErrors,
    failures,
    results,
  };
  fs.writeFileSync(
    path.join(outputDirectory, 'evidence.json'),
    `${JSON.stringify(evidence, null, 2)}\n`,
  );
  console.log(
    JSON.stringify(
      {
        label,
        source,
        browser: browserVersion,
        scenarios: results.length,
        failures,
        pageErrors,
        blockedExternalRequests: evidence.blockedExternalRequests,
      },
      null,
      2,
    ),
  );
  process.exitCode = failures.length === 0 ? 0 : 1;
})().catch((error) => {
  console.error(error);
  process.exitCode = 2;
});
