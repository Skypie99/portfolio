/**
 * The return seat (W4-02 · N1) — production wiring guards.
 *
 * The unit matrices in returnFocus.test.ts / RouteFocus.test.tsx fabricate
 * their own opt-in anchors, so they stay green if the production hook is
 * deleted. These source guards (IntroHandoff.test.ts's pattern: the browser
 * matrix owns rendered truth, the source guards protect the mechanism) pin
 * the three wiring points the repair cannot work without:
 *   1. every Home #work row title link renders the data-return-focus hook,
 *   2. the interceptor records + marks the push,
 *   3. the focus owner consumes the record instead of blind focus-to-main.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const home = readFileSync(resolve(process.cwd(), 'app/page.tsx'), 'utf8');
const interceptor = readFileSync(
  resolve(process.cwd(), 'components/ViewTransitions.tsx'),
  'utf8',
);
const focusOwner = readFileSync(
  resolve(process.cwd(), 'components/RouteFocus.tsx'),
  'utf8',
);

describe('returnFocus production wiring (W4-02 · N1)', () => {
  it('the Home #work row title Link carries the data-return-focus hook', () => {
    // The row title link is the one keyboard stop per row (its doorway
    // sibling is tabIndex={-1}); the hook must sit on exactly that Link,
    // bound to the same href the row navigates to.
    const match = home.match(
      /<h3 className="font-serif font-light text-step-[^"]*leading-heading text-ink">\s*<Link\s+href=\{href\}\s+aria-label=\{`View \$\{d\.title\} project`\}[\s\S]*?data-return-focus=\{href\}\s+className=/,
    );
    expect(match, 'the #work row title Link must render data-return-focus={href}').toBeTruthy();
  });

  it('no OTHER link in app/page.tsx gained a data-return-focus hook', () => {
    const count = (home.match(/data-return-focus/g) || []).length;
    expect(count).toBe(1); // the one row-title hook + this file is not page.tsx
  });

  it('the interceptor records the return seat and marks the push', () => {
    expect(interceptor).toContain(
      'recordReturnFocus(anchor, window.location.pathname, url.pathname, e.detail === 0)',
    );
    expect(interceptor).toContain('notePushNavigation()');
  });

  it('the focus owner consults the record before focusing main', () => {
    expect(focusOwner).toContain('resolveArrivalFocus(previous, pathname)');
    expect(focusOwner).toContain('seat.focus({ preventScroll: true })');
    expect(focusOwner).toContain("window.addEventListener('popstate', notePopstate)");
  });
});
