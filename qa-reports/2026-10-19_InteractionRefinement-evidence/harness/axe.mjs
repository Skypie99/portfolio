#!/usr/bin/env node
/**
 * press-evidence/axe.mjs — axe-core over the surfaces the three controls live
 * on, before and after, in both themes, at 393 (touch) and 1440 (mouse).
 * Also an explicit contrast read of the designed press colours against the
 * fills they sit on (WCAG 2.x relative luminance), since axe only measures
 * the resting state.
 *
 *   node axe.mjs --base http://127.0.0.1:3106 --label after > axe-after.json
 */
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { chromium } from 'playwright-core';

const require = createRequire(import.meta.url);
const axeSource = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

const arg = (flag, dflt) => {
  const i = process.argv.indexOf(flag);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : dflt;
};
const BASE = arg('--base', 'http://127.0.0.1:3106');
const LABEL = arg('--label', 'run');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const lum = ([r, g, b]) => {
  const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const contrast = (a, b) => { const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x); return (l1 + 0.05) / (l2 + 0.05); };
const blend = (fg, alpha, bg) => fg.map((c, i) => Math.round(c * alpha + bg[i] * (1 - alpha)));

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const out = { label: LABEL, runs: [], pressContrast: [] };

for (const profile of [
  { vp: { width: 393, height: 852 }, touch: true },
  { vp: { width: 1440, height: 900 }, touch: false },
]) {
  for (const theme of ['light', 'dark']) {
    const context = await browser.newContext({ viewport: profile.vp, isMobile: profile.touch, hasTouch: profile.touch, colorScheme: theme, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const scan = async (name, prep) => {
      await page.addScriptTag({ content: axeSource });
      await prep?.();
      const r = await page.evaluate(async () => {
        const res = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'] } });
        const pick = (v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.map((n) => n.target.join(' ')).slice(0, 6) });
        return { violations: res.violations.map(pick), incomplete: res.incomplete.map(pick).length, passes: res.passes.length };
      });
      out.runs.push({ profile: `${profile.vp.width}x${profile.vp.height}`, theme, surface: name, ...r });
      console.error(`[axe] ${LABEL} ${profile.vp.width} ${theme} ${name}: ${r.violations.length} violations`);
    };

    await page.goto(BASE + '/accessibility/', { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await sleep(400);
    await scan('/accessibility/');

    await page.goto(BASE + '/', { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.locator('#flagship').evaluate((el) => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
    await sleep(900);
    await scan('/ (flagship + work rows)');

    if (profile.touch) {
      await scan('/ (primary menu open)', async () => {
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
        await page.locator('button[aria-label="Open navigation menu"]').click();
        await page.locator('#primary-menu').waitFor({ state: 'visible' });
        await sleep(1200);
      });
    }

    // Press-colour contrast, read from the live tokens of this theme.
    const tokens = await page.evaluate(() => {
      const cs = getComputedStyle(document.documentElement);
      const t = (n) => cs.getPropertyValue(n).trim().split(/\s+/).map(Number);
      return { canvas: t('--rgb-canvas'), accent: t('--rgb-accent'), accentHover: t('--rgb-accent-hover'), ink: t('--rgb-ink'), lineStrong: t('--rgb-line-strong'), surface: t('--rgb-surface') };
    });
    const tint = blend(tokens.accent, 0.1, tokens.canvas);
    out.pressContrast.push({
      theme,
      'pressed hairline (accent) vs canvas': contrast(tokens.accent, tokens.canvas).toFixed(2),
      'pressed hairline (accent) vs 10% tint': contrast(tokens.accent, tint).toFixed(2),
      'resting hairline (line-strong) vs canvas': contrast(tokens.lineStrong, tokens.canvas).toFixed(2),
      'label ink vs 10% tint (pressed fill)': contrast(tokens.ink, tint).toFixed(2),
      'label ink vs canvas (rest)': contrast(tokens.ink, tokens.canvas).toFixed(2),
      'ember dot (accent-hover) vs 10% tint': contrast(tokens.accentHover, tint).toFixed(2),
      'terracotta dot vs canvas (rest)': contrast(tokens.accent, tokens.canvas).toFixed(2),
      tint,
    });
    await context.close();
  }
}
await browser.close();
console.log(JSON.stringify(out, null, 2));
