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
