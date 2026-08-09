/**
 * contrast-preferences.test.ts — the `prefers-contrast` / `forced-colors`
 * peers actually intensify, and the forced-colors rescue is present
 * (luxe W2, item 7 `beyond-the-floor`).
 *
 * This does not re-measure the estate (ink-contrast.test.ts owns the AA floor).
 * It guards the two things item 7 added:
 *   1. Under `prefers-contrast: more`, every overridden ink token has STRICTLY
 *      MORE contrast against its canvas than the default — a "high contrast"
 *      mode that quietly lowered contrast would be worse than none.
 *   2. Under `forced-colors: active`, the gradient-clipped display text
 *      (`.ember`) is given a solid system fill — without it those headings
 *      render `color: transparent` with no gradient, i.e. invisible.
 *
 * Reads globals.css as text, like ink-contrast.test.ts, because the cascade for
 * an @media block this component tree never imports is not modelled in jsdom.
 */
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const CSS = readFileSync(resolve(process.cwd(), 'app', 'globals.css'), 'utf8');

type RGB = [number, number, number];

function luminance([r, g, b]: RGB): number {
  const f = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function contrast(a: RGB, b: RGB): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** The whole body of the first `<selector> {…}` at brace depth, from a start index. */
function blockBodyAfter(fromIndex: number): string {
  const open = CSS.indexOf('{', fromIndex);
  let i = open + 1;
  let depth = 1;
  while (depth > 0 && i < CSS.length) {
    if (CSS[i] === '{') depth++;
    else if (CSS[i] === '}') depth--;
    i++;
  }
  return CSS.slice(open + 1, i - 1);
}

/** Read an `--rgb-*` triplet from a chunk of CSS. */
function readTriplet(chunk: string, name: string): RGB {
  const m = chunk.match(new RegExp(`--${name}:\\s*(\\d+)\\s+(\\d+)\\s+(\\d+)`));
  expect(m, `--${name} not found`).toBeTruthy();
  return [Number(m![1]), Number(m![2]), Number(m![3])];
}

/** The default (non-media) light `:root` and dark `html.dark` token blocks. */
function defaultScope(scope: 'root' | 'dark'): string {
  const sel = scope === 'root' ? ':root' : 'html.dark';
  // The first top-level occurrence carries the base tokens.
  const idx = CSS.search(new RegExp(`^${sel.replace('.', '\\.')}\\s*\\{`, 'm'));
  expect(idx, `base ${sel} block not found`).toBeGreaterThan(-1);
  return blockBodyAfter(idx);
}

const CANVAS: Record<'root' | 'dark', RGB> = { root: [250, 248, 241], dark: [21, 25, 26] };
const BOOSTED_TOKENS = ['rgb-ink-muted', 'rgb-ink-meta'] as const;

describe('prefers-contrast: more — a designed high-contrast peer', () => {
  const pcIdx = CSS.indexOf('@media (prefers-contrast: more)');
  it('the block exists', () => {
    expect(pcIdx, 'no @media (prefers-contrast: more) block').toBeGreaterThan(-1);
  });

  const pcBody = blockBodyAfter(pcIdx);
  // Slice the nested :root {…} / html.dark {…} overrides directly out of pcBody.
  function nested(scope: 'root' | 'dark'): string {
    const sel = scope === 'root' ? ':root' : 'html.dark';
    const at = pcBody.indexOf(sel);
    expect(at, `prefers-contrast override missing ${sel}`).toBeGreaterThan(-1);
    const open = pcBody.indexOf('{', at);
    let i = open + 1;
    let depth = 1;
    while (depth > 0 && i < pcBody.length) {
      if (pcBody[i] === '{') depth++;
      else if (pcBody[i] === '}') depth--;
      i++;
    }
    return pcBody.slice(open + 1, i - 1);
  }

  for (const scope of ['root', 'dark'] as const) {
    for (const token of BOOSTED_TOKENS) {
      it(`${token} (${scope}) has strictly more contrast than the default`, () => {
        const boosted = readTriplet(nested(scope), token);
        const base = readTriplet(defaultScope(scope), token);
        const cv = CANVAS[scope];
        expect(contrast(boosted, cv)).toBeGreaterThan(contrast(base, cv));
        // And it must still be a real AA pass (it can only go up, but pin it).
        expect(contrast(boosted, cv)).toBeGreaterThanOrEqual(4.5);
      });
    }
  }

  it('the decorative hairline steps up to at least the interactive line strength', () => {
    const line = readTriplet(nested('root'), 'rgb-line');
    const base = readTriplet(defaultScope('root'), 'rgb-line');
    const cv = CANVAS.root;
    expect(contrast(line, cv)).toBeGreaterThan(contrast(base, cv));
  });
});

describe('forced-colors: active — the estate does not vanish', () => {
  const fcIdx = CSS.indexOf('@media (forced-colors: active)');
  it('the block exists', () => {
    expect(fcIdx, 'no @media (forced-colors: active) block').toBeGreaterThan(-1);
  });

  const fcBody = blockBodyAfter(fcIdx);

  it('gives the gradient-clipped display text a solid system fill', () => {
    // Without this, .ember renders color:transparent with no gradient = invisible.
    expect(fcBody).toMatch(/\.ember[\s,]/);
    expect(fcBody).toContain('-webkit-text-fill-color: CanvasText');
    expect(fcBody).toContain('background-image: none');
  });

  it('restores a real border on glass so cards stay bounded', () => {
    expect(fcBody).toMatch(/\.glass-card\s*\{[^}]*border:\s*1px solid CanvasText/s);
  });
});
