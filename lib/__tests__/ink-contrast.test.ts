/**
 * ink-contrast.test.ts — the ink tokens must clear WCAG AA on the surfaces the
 * site actually paints them on (a11y deep-QA, 2026-07-31).
 *
 * WHY THIS EXISTS
 * The `world-surface-*` panels are TRANSLUCENT (alpha 0.62–0.82) over the moving
 * WorldBackdrop, so a token's contrast cannot be read off the token pair alone —
 * `--rgb-accent-ink` was specced "≥4.5:1" but that only ever held against pure
 * canvas. Measured at HEAD 38b94db, 59 light-theme and 1 dark-theme text elements
 * sat below the 4.5:1 floor, including the homepage contact eyebrow at 3.49:1 —
 * which falsified the /accessibility/ page's "every text role meets WCAG AA
 * contrast, light and dark alike".
 *
 * WHAT IT GUARDS
 * The BINDING_BACKGROUNDS below are the darkest (light theme) / lightest (dark
 * theme) composited backgrounds each ink is actually painted on, pixel-measured
 * across 16 routes × 2 themes with every glyph painted transparent (so the sample
 * is the true composite: panel + WorldBackdrop + gradients). If someone lightens
 * accent-ink back toward its old value, or darkens ink-meta's surfaces, this fails.
 *
 * Evidence + method: design-reviews/a11y-qa/2026-07-31/
 */

import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = resolve(process.cwd());
const CSS = readFileSync(join(ROOT, 'app', 'globals.css'), 'utf8');

type RGB = [number, number, number];

/** Relative luminance, WCAG 2.x definition. */
function luminance([r, g, b]: RGB): number {
  const f = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrast(a: RGB, b: RGB): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Read an `--rgb-*` triplet from a specific block of globals.css.
 * `scope: 'root'` reads the light `:root` block; `scope: 'dark'` reads `html.dark`.
 */
function readToken(name: string, scope: 'root' | 'dark'): RGB {
  const darkStart = CSS.indexOf('html.dark {');
  expect(darkStart, 'globals.css must contain an `html.dark {` block').toBeGreaterThan(-1);
  const region = scope === 'root' ? CSS.slice(0, darkStart) : CSS.slice(darkStart);
  const m = region.match(new RegExp(`--${name}:\\s*(\\d+)\\s+(\\d+)\\s+(\\d+)\\s*;`));
  expect(m, `--${name} must be defined in the ${scope} block of globals.css`).toBeTruthy();
  return [Number(m![1]), Number(m![2]), Number(m![3])];
}

/**
 * Pixel-measured binding backgrounds — the worst real surface each ink lands on.
 * Recorded 2026-07-31 from design-reviews/a11y-qa/2026-07-31/ (census2.json).
 */
const BINDING_BACKGROUNDS: ReadonlyArray<{
  token: string;
  scope: 'root' | 'dark';
  bg: RGB;
  where: string;
}> = [
  { token: 'rgb-accent-ink', scope: 'root', bg: [215, 209, 190], where: 'homepage contact eyebrow — world-surface-cool-pale' },
  { token: 'rgb-accent-ink', scope: 'root', bg: [238, 223, 203], where: '"More work" eyebrow — world-surface-alt (work pages)' },
  { token: 'rgb-accent-ink', scope: 'root', bg: [226, 228, 216], where: '"Shipped" eyebrow — world-surface-cool' },
  { token: 'rgb-ink-meta', scope: 'root', bg: [236, 221, 199], where: 'showcase date meta — world-surface-alt' },
  { token: 'rgb-accent-ink', scope: 'dark', bg: [89, 74, 57], where: 'prose link on /work/accessmap/ — world-surface-alt over the night world' },
];

const AA_SMALL = 4.5;

describe('ink tokens clear WCAG AA on the surfaces they are actually painted on', () => {
  it.each(BINDING_BACKGROUNDS)(
    '--$token ($scope) ≥ 4.5:1 against $where',
    ({ token, scope, bg }) => {
      const ink = readToken(token, scope);
      expect(contrast(ink, bg)).toBeGreaterThanOrEqual(AA_SMALL);
    },
  );

  // Regression pin: the specific values this audit landed on. A deliberate future
  // change should update these together with a fresh measured census — never one
  // without the other.
  it('the audited ink values are the ones in the stylesheet', () => {
    expect(readToken('rgb-accent-ink', 'root')).toEqual([135, 71, 45]);
    expect(readToken('rgb-ink-meta', 'root')).toEqual([84, 100, 93]);
    expect(readToken('rgb-accent-ink', 'dark')).toEqual([231, 181, 147]);
  });

  // The floors themselves must not silently move: prove the maths still fails the
  // pre-fix values, so this suite can never pass vacuously.
  it('rejects the pre-fix ink values (non-vacuity)', () => {
    expect(contrast([163, 86, 54], [215, 209, 190])).toBeLessThan(AA_SMALL);
    expect(contrast([90, 107, 100], [236, 221, 199])).toBeLessThan(AA_SMALL);
    expect(contrast([224, 160, 116], [89, 74, 57])).toBeLessThan(AA_SMALL);
  });
});
