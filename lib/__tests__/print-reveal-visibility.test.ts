/**
 * Cook Out P8 (final acceptance): paper is a rest frame, not a scroll.
 *
 * The scroll-reveal choreography is armed under `html.js` (`.reveal` at
 * opacity 0 until an IntersectionObserver adds `.reveal-shown`). Reduced
 * motion, no-JS and the dead-bundle watchdog each restore the visible rest
 * frame, but the `@media print` block did not, and print layout never fires
 * the observer. Measured before the repair: /about/ printed 11 of 11 reveal
 * blocks at opacity 0 and /work/flagstone/ 30 of 31, so a case study saved to
 * PDF before being scrolled arrived mostly blank.
 *
 * The repair adds the same override the reduced-motion block already carries
 * to the print block. This guard reads the stylesheet source and pins that the
 * print block still rests every reveal variant visible, flat and unfiltered.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const css = readFileSync(join(process.cwd(), 'app', 'globals.css'), 'utf8');

/** The body of the `@media print { ... }` block, found by brace matching. */
function printBlock(): string {
  const start = css.indexOf('@media print {');
  expect(start, 'globals.css must carry a print block').toBeGreaterThan(-1);
  let depth = 0;
  for (let i = css.indexOf('{', start); i < css.length; i += 1) {
    if (css[i] === '{') depth += 1;
    if (css[i] === '}') {
      depth -= 1;
      if (depth === 0) return css.slice(start, i + 1);
    }
  }
  throw new Error('unterminated @media print block');
}

describe('@media print rests every scroll-reveal visible', () => {
  const block = printBlock();

  it('overrides the armed html.js reveal state for every variant', () => {
    for (const selector of ['html.js .reveal', 'html.js .reveal-scene', 'html.js .reveal-depth', 'html.js .reveal-carve']) {
      expect(block, `print block must rest ${selector}`).toContain(selector);
    }
  });

  it('forces opacity, transform and filter to their rest values with !important', () => {
    const rule = /html\.js \.reveal-carve\s*\{([^}]*)\}/.exec(block);
    expect(rule, 'the reveal rest rule must exist in the print block').not.toBeNull();
    const body = rule![1];
    expect(body).toMatch(/opacity:\s*1\s*!important/);
    expect(body).toMatch(/transform:\s*none\s*!important/);
    expect(body).toMatch(/filter:\s*none\s*!important/);
  });
});
