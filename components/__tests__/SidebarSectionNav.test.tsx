/**
 * SidebarSectionNav tests (view-transitions 2026-06-05; rewritten for UP-10,
 * ui-polish 2026-08-01).
 *
 * The old contract — "render the homepage's five links on every non-longform
 * route, gate the active marker to pathname === '/'" — was replaced because it
 * lied: on all eight other routes every entry pointed at an id the page does not
 * contain. These tests pin the NEW contract:
 *   - each indexed route renders its OWN ordered section list and hrefs,
 *   - the home list is byte-unchanged,
 *   - the scroll-spy now lights on every indexed route (the onHome gate is gone),
 *   - and an unindexed route renders NOTHING at all — not an empty shell.
 *
 * The complementary guard lives in lib/__tests__/section-nav-anchors.test.ts: it
 * proves against the BUILT HTML that every id exists on its route and that every
 * label is a string that route actually renders. Between them, a page section
 * cannot be renamed, moved or deleted without a test failing.
 *
 * `next/navigation` (usePathname) and `@/lib/motion` (useActiveSection) are
 * mocked with hoisted, per-test-configurable fns — jsdom provides neither App
 * Router context nor IntersectionObserver. Same mocking approach as
 * HamburgerNav.test.tsx.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

const { pathnameMock, activeMock } = vi.hoisted(() => ({
  pathnameMock: vi.fn(() => '/'),
  activeMock: vi.fn(() => ''),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => pathnameMock(),
}));

vi.mock('@/lib/motion', () => ({
  useActiveSection: () => activeMock(),
}));

import { SidebarSectionNav } from '@/components/SidebarSectionNav';
import { ROUTE_SECTIONS, sectionsForRoute, INDEXED_ROUTES } from '@/lib/sectionNav';

const HOME_LABELS = [
  'The Work',
  // Truth pass 2026-08-21. This array is a literal, not a read of the map, so
  // it is what makes the loops below a real assertion rather than a tautology —
  // which also means a new rail entry that is not added here is a section the
  // suite silently stops checking. `how-i-work` is that entry. DOM order.
  'How the work gets made',
  // 'Method' left with #process in the truth pass (2026-08-21). /about keeps
  // its own Method entry, asserted separately in the non-home block below.
  'A Brief Account',
  'Credentials',
  "Let’s talk",
];

/**
 * Rendered outside the app, next/link normalizes `/about/#x` to `/about#x`;
 * the real export re-adds the slash (`trailingSlash: true`) and ships
 * `/about/#x` — asserted byte-for-byte against the built HTML in
 * lib/__tests__/section-nav-anchors.test.ts (T5). Here both sides are collapsed
 * to the same form so these tests are about routing intent, not serialization.
 */
const hrefShape = (href: string | null) => (href ?? '').replace('/#', '#');

/** The rendered index, in DOM order, as [label, href] pairs. */
function renderedEntries() {
  const nav = screen.queryByRole('navigation', { name: /on this page/i });
  if (!nav) return null;
  return Array.from(nav.querySelectorAll('a')).map((a) => [
    (a.textContent ?? '').trim(),
    hrefShape(a.getAttribute('href')),
  ]);
}

beforeEach(() => {
  pathnameMock.mockReturnValue('/');
  activeMock.mockReturnValue('');
});

afterEach(() => {
  cleanup();
});

describe('SidebarSectionNav — the homepage index is unchanged', () => {
  it('renders the "On this page" landmark with every section link', () => {
    render(<SidebarSectionNav />);
    const nav = screen.getByRole('navigation', { name: /on this page/i });
    expect(nav).toBeInTheDocument();

    for (const label of HOME_LABELS) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument();
    }
    expect(screen.getByRole('link', { name: 'The Work' })).toHaveAttribute('href', '/#work');
    expect(screen.getByRole('link', { name: 'A Brief Account' })).toHaveAttribute('href', '/#about');
    expect(screen.getByRole('link', { name: "Let’s talk" })).toHaveAttribute('href', '/#contact');
  });

  it('keeps the visible "On this page" label string exactly', () => {
    render(<SidebarSectionNav />);
    // Sky's copy — the phase may change the LIST, never this string.
    expect(screen.getByText('On this page')).toBeInTheDocument();
  });

  it('marks nothing active by default (no section in view yet)', () => {
    render(<SidebarSectionNav />);
    for (const label of HOME_LABELS) {
      expect(screen.getByRole('link', { name: label })).not.toHaveAttribute('aria-current');
    }
  });

  it('marks exactly the in-view section with aria-current on the homepage', () => {
    activeMock.mockReturnValue('about');
    render(<SidebarSectionNav />);

    expect(screen.getByRole('link', { name: 'A Brief Account' })).toHaveAttribute(
      'aria-current',
      'true',
    );
    for (const label of HOME_LABELS.filter((l) => l !== 'A Brief Account')) {
      expect(screen.getByRole('link', { name: label })).not.toHaveAttribute('aria-current');
    }
  });
});

describe('SidebarSectionNav — the index describes the route you are on (UP-10)', () => {
  it.each([
    [
      '/about/',
      [
        ['Method', '/about#method'],
        ['Principles', '/about#principles'],
        ['Currently', '/about#currently'],
        ['The Work', '/about#work'],
      ],
    ],
    [
      '/colophon/',
      [
        ['The stack', '/colophon#the-stack'],
        ['The type', '/colophon#the-type'],
        ['The world', '/colophon#the-world'],
        ['The quiet systems', '/colophon#the-quiet-systems'],
        ['How it was made', '/colophon#how-it-was-made'],
        ['The type, set live', '/colophon#type-specimen'],
        ['Calibration record', '/colophon#calibration'],
      ],
    ],
    [
      '/accessibility/',
      [
        ['The standard I aim for', '/accessibility#the-standard-i-aim-for'],
        ['What I built in', '/accessibility#what-i-built-in'],
        ['Measured, not claimed', '/accessibility#receipts'],
        ['What I have not done', '/accessibility#what-i-have-not-done'],
        ['Found a barrier? Tell me.', '/accessibility#found-a-barrier-tell-me'],
      ],
    ],
  ])('%s renders its own sections, in document order', (pathname, expected) => {
    pathnameMock.mockReturnValue(pathname);
    render(<SidebarSectionNav />);
    expect(renderedEntries()).toEqual(expected);
  });

  it('never shows the homepage list on another route', () => {
    pathnameMock.mockReturnValue('/about/');
    render(<SidebarSectionNav />);
    // 'The Work' and 'A Brief Account' legitimately recur as /about's OWN
    // section names, so the tell is the href: no entry may point at '/#...'.
    for (const [, href] of renderedEntries() ?? []) {
      expect(href).toMatch(/^\/about#/);
    }
    expect(screen.queryByRole('link', { name: 'Credentials' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'A Brief Account' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Method' })).toBeInTheDocument();
  });

  it('lights the active section on a non-home route (the onHome gate is gone)', () => {
    pathnameMock.mockReturnValue('/colophon/');
    activeMock.mockReturnValue('the-world');
    render(<SidebarSectionNav />);

    expect(screen.getByRole('link', { name: 'The world' })).toHaveAttribute('aria-current', 'true');
    const current = screen
      .getByRole('navigation', { name: /on this page/i })
      .querySelectorAll('[aria-current]');
    expect(current).toHaveLength(1);
  });

  it('resolves a route with and without its trailing slash identically', () => {
    expect(sectionsForRoute('/about')).toBe(sectionsForRoute('/about/'));
    // Counts are asserted deliberately: the rail is curated, so a section
    // JOINING or LEAVING it should be a decision someone made, not a diff
    // that slid through. The truth pass did both — `how-i-work` in, `process`
    // out — so home went back to 5 by way of 6, not by never having moved.
    // THE ROOM Phase C moved it again, one band per commit: C2 added
    // `flagship` (5 → 6), C5 added `record` (6 → 7). C6 drops `certificates`,
    // so home settles at 6 — a different six from the one above.
    expect(sectionsForRoute('/')).toHaveLength(7);
    expect(sectionsForRoute('/about')).toHaveLength(4);
  });

  it('an empty pathname gets NO index — it must never fall back to home\'s', () => {
    // usePathname is typed `string | null`; the component's `?? ''` fallback
    // would otherwise render the homepage index, with live scroll-spy, on an
    // unknown route — a miniature of the bug UP-10 removes.
    expect(sectionsForRoute('')).toHaveLength(0);
    pathnameMock.mockReturnValue('');
    const { container } = render(<SidebarSectionNav />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('SidebarSectionNav — routes with no index render nothing', () => {
  it.each([
    ['/work/', 'a single gallery band; its only other heading is sr-only'],
    ['/certificates/', 'a single credential grid; its only other heading is sr-only'],
    ['/blog/', 'a single post list; its only other heading is sr-only'],
    ['/contact/', 'one named band under its title band — a one-item list is not an index'],
    ['/some-unmapped-route/', 'the 404 and anything unmapped'],
  ])('%s renders no "On this page" block at all — %s', (pathname) => {
    pathnameMock.mockReturnValue(pathname);
    const { container } = render(<SidebarSectionNav />);
    expect(screen.queryByRole('navigation', { name: /on this page/i })).not.toBeInTheDocument();
    // Not an empty shell either — the component contributes no DOM whatsoever.
    expect(container).toBeEmptyDOMElement();
  });

  it.each(['/blog/building-flagstone/', '/work/flagstone/'])(
    'steps aside on the long-form route %s so SidebarArticleNav owns the slot',
    (pathname) => {
      pathnameMock.mockReturnValue(pathname);
      const { container } = render(<SidebarSectionNav />);
      expect(container).toBeEmptyDOMElement();
    },
  );
});

describe('sectionNav map invariants', () => {
  it('every href is its own route plus its own id — no cross-route anchors', () => {
    for (const route of INDEXED_ROUTES) {
      const sections = ROUTE_SECTIONS[route as keyof typeof ROUTE_SECTIONS];
      const prefix = route === '/' ? '/' : `${route}/`;
      for (const s of sections) {
        expect(s.href).toBe(`${prefix}#${s.id}`);
      }
    }
  });

  it('has no duplicate ids or labels within a route, and never an empty list', () => {
    for (const route of INDEXED_ROUTES) {
      const sections = ROUTE_SECTIONS[route as keyof typeof ROUTE_SECTIONS];
      // Rule 2: fewer than two named sections means the route is not indexed.
      expect(sections.length).toBeGreaterThanOrEqual(2);
      expect(new Set(sections.map((s) => s.id)).size).toBe(sections.length);
      expect(new Set(sections.map((s) => s.label)).size).toBe(sections.length);
    }
  });
});
