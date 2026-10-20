// Release 4 combined verification (merge commit 2504cdf): is the
// `reduced-motion/<engine>/<theme>` single-rAF failure a pre-paint read
// artefact, or does the reduced-motion press never contract?
//
// The audit harness samples ONE requestAnimationFrame after mouse.down() and
// expects the contracted 6px. This probe keeps the press HELD and samples the
// computed dot width at 0ms, 5ms, 25ms, 100ms and 400ms, so the settled value
// is observed rather than assumed. Nothing is asserted away: every sample is
// reported.
//
//   RELEASE4_BROWSERS=chromium,webkit node <this file>
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { chromium, webkit } from 'playwright-core';

const OUT = path.resolve(
  process.env.RELEASE4_EVIDENCE_DIR || 'qa-reports/2026-10-19_Claude_Release4Final-evidence/combined-2504cdf',
);
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const data = {
  what: 'held-press dot width over time under reduced motion (the audit single-rAF read)',
  commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  started: new Date().toISOString(),
  samples: [],
  errors: [],
};
const save = () => fs.writeFileSync(path.join(OUT, 'reduced-motion-settle.json'), JSON.stringify(data, null, 2) + '\n');

const server = spawn(process.execPath, ['scripts/static-serve.mjs', path.resolve('out'), '0'], {
  stdio: ['ignore', 'pipe', 'inherit'],
});
const base = await new Promise((resolve, reject) => {
  server.once('error', reject);
  server.stdout.on('data', (d) => {
    const m = String(d).match(/http:\/\/127\.0\.0\.1:\d+/);
    if (m) resolve(m[0]);
  });
});

try {
  for (const [name, type] of [['chromium', chromium], ['webkit', webkit]].filter(([n]) =>
    (process.env.RELEASE4_BROWSERS || 'chromium,webkit').split(',').includes(n),
  )) {
    const browser = await type.launch({ headless: true });
    try {
      for (const theme of ['light', 'dark']) {
        const c = await browser.newContext({
          viewport: { width: 393, height: 852 },
          colorScheme: theme,
          reducedMotion: 'reduce',
        });
        await c.addInitScript((t) => {
          try {
            localStorage.setItem('theme', t);
          } catch {}
        }, theme);
        const p = await c.newPage();
        p.on('pageerror', (e) => data.errors.push({ type: 'pageerror', message: String(e) }));
        await p.goto(base + '/accessibility/', { waitUntil: 'load' });
        await p.evaluate(() => document.fonts.ready);
        await sleep(350);

        const button = p.locator('main a.rounded-pill.h-14');
        await button.scrollIntoViewIfNeeded();
        await button.hover();
        await p.mouse.down();

        // Sample the HELD press at increasing delays without releasing.
        const marks = [0, 5, 25, 100, 400];
        for (const ms of marks) {
          if (ms) await sleep(ms - marks[marks.indexOf(ms) - 1]);
          const r = await button.evaluate((e) => {
            const dot = e.querySelector('.rounded-full');
            return {
              dot: getComputedStyle(dot).width,
              duration: getComputedStyle(e).transitionDuration,
              active: e.matches(':active'),
              fill: getComputedStyle(e).backgroundColor,
            };
          });
          data.samples.push({ engine: name, theme, afterMs: ms, ...r });
          console.log(name, theme, ms + 'ms', r.dot, 'active=' + r.active, 'dur=' + r.duration);
        }

        await p.evaluate(() =>
          window.addEventListener('click', (e) => { e.preventDefault(); e.stopImmediatePropagation(); }, { capture: true, once: true }),
        );
        await p.mouse.up();
        await sleep(120);
        const released = await button.evaluate((e) => {
          const dot = e.querySelector('.rounded-full');
          return { dot: getComputedStyle(dot).width, active: e.matches(':active') };
        });
        data.samples.push({ engine: name, theme, phase: 'after-release', ...released });
        console.log(name, theme, 'after-release', released.dot, 'active=' + released.active);
        save();
        await c.close();
      }
    } finally {
      await browser.close();
    }
  }
} finally {
  server.kill();
  data.finished = new Date().toISOString();
  save();
}
console.log(JSON.stringify({ samples: data.samples.length, errors: data.errors.length }));
