/**
 * THE ROOM / Phase G · G2 — the method-underline pointer harness (re-runnable).
 *
 *   npm run build && node design-reviews/art-direction/2026-08-23/build-reports/G2_method-harness.mjs
 *   then open http://localhost:3005/_g2-method-harness.html (the `portfolio-out`
 *   launch config serves out/ on 3005).
 *
 * WHY THIS EXISTS. The tic only fires on a real pointer over a real ancestor,
 * and all three measured-number surfaces sit thousands of pixels down their
 * pages — unreachable in a headless pane, where the viewport reports zero
 * height and window.scrollTo is inert. So this lifts the three pair SHAPES out
 * of the built out/ and stacks them at the top of one page:
 *
 *   A · card pair        — homepage Receipt ×3 (figure and method in one card)
 *   B · one-line pair    — /work/flagstone (figure and method in one <p>)
 *   C · many-to-one pair — /accessibility (six figures, one shared method line)
 *
 * Nothing is reconstructed: the markup is copied verbatim out of the built
 * HTML and the real built stylesheets are linked, so the cascade, the tokens
 * and the transition are the shipped ones. Only the page POSITION differs.
 * A live HUD prints each pair's :hover state and its link's computed
 * background-size, so the trigger can be read off the screen rather than
 * inferred. (The strip's figures paint blank here — CountUpStat fills them
 * client-side and this harness runs no React. Irrelevant to the trigger.)
 *
 * Writes out/_g2-method-harness.html. out/ is gitignored, so this leaves no
 * build artifact behind in the repo — but DELETE IT BEFORE RUNNING THE GATE:
 * lib/__tests__/static-integrity.test.ts sweeps every .html in out/ and will
 * (correctly) fail a page that is not a real route, for a missing pre-paint
 * reveal guard and missing og:url / og:site_name / og:locale. Found the honest
 * way — by running the gate with it still there.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const OUT = 'out';
const read = (p) => readFileSync(join(OUT, p), 'utf8');

/** Extract a balanced <div>…</div> beginning at `marker`. */
function balancedDiv(html, marker) {
  const i = html.indexOf(marker);
  if (i < 0) throw new Error(`marker not found: ${marker}`);
  let depth = 0;
  for (const m of html.slice(i).matchAll(/<(\/?)div\b[^>]*>/g)) {
    depth += m[1] ? -1 : 1;
    if (depth === 0) return html.slice(i, i + m.index + m[0].length);
  }
  throw new Error('unbalanced div');
}

const grab = (html, re, label) => {
  const m = html.match(re);
  if (!m) throw new Error(`${label} not found`);
  return m[0];
};

const home = grab(read('index.html'),
  /<div class="grid grid-cols-1 lg:grid-cols-3 gap-4">[\s\S]*?<\/div><\/div><\/div>/, 'home receipts');
const flag = grab(read('work/flagstone/index.html'),
  /<p class="method-pair[^"]*">[\s\S]*?<\/p>/, 'flagstone line');
const a11y = balancedDiv(read('accessibility/index.html'), '<div class="method-pair">');
if (!a11y.includes('method-draw')) throw new Error('a11y extraction lost the method line');

const sheets = readdirSync(join(OUT, '_next/static/css'))
  .filter((f) => f.endsWith('.css'))
  .map((f) => `<link rel="stylesheet" href="/_next/static/css/${f}">`)
  .join('\n');

writeFileSync(join(OUT, '_g2-method-harness.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>G2 method underline — pointer harness</title>${sheets}
<style>body{margin:0;padding:16px 24px;background:rgb(var(--rgb-canvas))}
 h4{font:11px ui-monospace,monospace;letter-spacing:.12em;text-transform:uppercase;
    color:rgb(var(--rgb-ink-meta));margin:14px 0 6px}
 #hud{position:fixed;left:0;right:0;bottom:0;font:11px ui-monospace,monospace;
    background:#000d;color:#fff;padding:6px 10px;white-space:pre}
 .shrink{zoom:.5}</style></head><body>
<h4>A · card pair (homepage Receipt ×3)</h4>
${home}
<h4>B · one-line pair (work/flagstone)</h4>
${flag}
<h4>C · many-to-one pair (accessibility strip)</h4>
<div class="shrink">${a11y}</div>
<div id="hud">…</div>
<script>
setInterval(() => {
  document.getElementById('hud').textContent =
    [...document.querySelectorAll('.method-pair')].map((p, i) => {
      const l = p.querySelector('.method-draw');
      return (i < 3 ? 'A' + (i + 1) : i === 3 ? 'B' : 'C') + ' ' +
        (p.matches(':hover') ? 'HOVER' : '  ·  ') + ' ' +
        (l ? getComputedStyle(l).backgroundSize : 'NO LINK');
    }).join('  |  ');
}, 100);
</script></body></html>`);
console.log('wrote out/_g2-method-harness.html — 5 method links across 3 pair shapes');
