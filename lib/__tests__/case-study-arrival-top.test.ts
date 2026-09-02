/**
 * Cook Out P8 (final acceptance): forward navigation to a case study must
 * start at the top of the page.
 *
 * Next's post-navigation scroll handler (layout-router's
 * handlePotentialScroll) begins at the route segment's FIRST rendered DOM node
 * and walks `nextElementSibling` until it finds a visible box, then scrolls to
 * top. React 19 hoists a `<link rel="preload">` rendered in the page into
 * `<head>`, so when that link was the segment's first node the walk ran
 * through head-only siblings, reached null, and returned without scrolling.
 * Result, reproduced in a real browser at 375, 768 and 1440 in both themes,
 * under reduced motion and without view transitions: every arrival at
 * /work/flagstone/ from a scrolled page (the homepage room and rows, the About
 * card, the blog article, a neighbour card) kept the departing page's scroll
 * offset. The four themed routes were unaffected only because their
 * ThemedHeroPreload renders a body-level `<script>`.
 *
 * The repair is order-only: the inline JSON-LD `<script>` (a body node, skipped
 * as zero-rect, whose next sibling is the first `<section>`) renders before any
 * preload. This guard pins that order in the source so a later edit cannot
 * silently put a hoistable element first again.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const pageSource = readFileSync(join(process.cwd(), 'app', 'work', '[slug]', 'page.tsx'), 'utf8');

describe('case-study page: first rendered node is a body-level script, never a hoisted <link>', () => {
  const returnAt = pageSource.indexOf('return (\n    <>');
  const jsonLd = pageSource.indexOf('type="application/ld+json"', returnAt);
  const themedPreload = pageSource.indexOf('<ThemedHeroPreload', returnAt);
  const preloadLink = pageSource.indexOf('rel="preload"', returnAt);

  it('renders the JSON-LD script inside the page fragment', () => {
    expect(returnAt, 'the page component must return a fragment').toBeGreaterThan(-1);
    expect(jsonLd, 'the SoftwareApplication JSON-LD script must exist').toBeGreaterThan(-1);
  });

  it('renders the JSON-LD script before the themed hero preload', () => {
    expect(themedPreload).toBeGreaterThan(-1);
    expect(jsonLd).toBeLessThan(themedPreload);
  });

  it('renders the JSON-LD script before the single-theme preload <link>', () => {
    expect(preloadLink).toBeGreaterThan(-1);
    expect(jsonLd).toBeLessThan(preloadLink);
  });
});
