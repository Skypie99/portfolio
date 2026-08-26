/**
 * GlobalError tests (L7-01 rider) — the branded crash boundary.
 *
 * Load-bearing contract: it can render at the moment a CSS chunk failed to
 * load, so it MUST be legible with zero external stylesheet (inline styles,
 * literal hex — no Tailwind class dependency) and offer hard-navigation exits
 * that escape the broken client state. It must never leak the error.
 */
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import GlobalError from '@/app/global-error';

const html = renderToStaticMarkup(
  <GlobalError error={Object.assign(new Error('boom-secret-stack'), { digest: 'd1' })} reset={() => {}} />,
);

describe('GlobalError (L7-01 rider)', () => {
  it('renders its own document shell (it replaces the root layout)', () => {
    expect(html).toContain('<html');
    expect(html).toContain('<body');
  });

  it('is legible with zero external CSS — inline styles on brand canvas, no class dependency', () => {
    expect(html).toContain('#FAF8F1'); // canvas inline, not a token/class
    expect(html).not.toContain('class='); // must not depend on Tailwind/app CSS
  });

  it('offers ranked recovery exits via hard navigation (router-independent)', () => {
    expect(html).toContain('href="/"');
    expect(html).toContain('href="/work/"');
    expect(html).toMatch(/Try again/);
  });

  it('never leaks the error message or stack', () => {
    expect(html).not.toContain('boom-secret-stack');
    expect(html).not.toContain('d1');
  });
});

/**
 * H3 (THE ROOM Phase H) — the "Try again" button's own contrast, computed
 * from its literal inline hex (this file is deliberately CSS-independent,
 * so there's no live token to read the way ink-contrast.test.ts does). The
 * axe re-audit measured the pre-fix pairing (canvas-on-ACCENT) at 4.02:1,
 * under the 4.5 floor for a 15px normal button label.
 */
describe('GlobalError — the "Try again" button clears WCAG AA (H3)', () => {
  function luminance([r, g, b]: [number, number, number]): number {
    const f = (c: number) => {
      const s = c / 255;
      return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  }
  function contrast(a: [number, number, number], b: [number, number, number]): number {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  }
  function hexToRgb(hex: string): [number, number, number] {
    const n = hex.replace('#', '');
    return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
  }

  it('the rendered button background/text pairing is ≥ 4.5:1', () => {
    const m = html.match(/<button[^>]*background:\s*(#[0-9A-Fa-f]{6})[^>]*color:\s*(#[0-9A-Fa-f]{6})/);
    expect(m, 'could not find the button\'s inline background/color style').toBeTruthy();
    const [, bg, fg] = m!;
    expect(contrast(hexToRgb(fg), hexToRgb(bg))).toBeGreaterThanOrEqual(4.5);
  });

  it('rejects the pre-fix pairing (non-vacuity)', () => {
    expect(contrast(hexToRgb('#FAF8F1'), hexToRgb('#B96340'))).toBeLessThan(4.5);
  });
});
