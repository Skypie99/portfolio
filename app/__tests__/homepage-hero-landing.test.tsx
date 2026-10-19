/**
 * Homepage hero landing — RC-2 first visual slice (D-CON-001 B desktop,
 * M-CON-001 B r2 mobile grouping), candidate structure.
 *
 * Mounts the real HomePage against the site's real content, the pattern of
 * app/__tests__/homepage-dates.test.tsx, and pins what a jsdom test can pin:
 * the reading order inside #hero, the responsive hide on the duplicate link,
 * the evidence strip's list semantics and its one permitted receipt (read from
 * content/a11y-receipts.json, the same source the page reads), the receipt's
 * method-pair hooks, and that the hero gained no heading and no id. The
 * geometry (first-screen fit, contrast, focus) belongs to the browser matrix.
 */
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { cleanup, render, within } from '@testing-library/react';

// Own timers before GSAP module evaluation, for this file only.
await vi.hoisted(async () => {
  const { ownGsapTimers } = await import('../../test-utils/gsap-teardown');
  ownGsapTimers();
});

import HomePage from '@/app/page';
import { getA11yReceipts } from '@/lib/content';

beforeAll(() => {
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});

afterEach(cleanup);

const STRIP_LABEL = 'The record, in brief';

function mountHero() {
  const { container } = render(<HomePage />);
  const hero = container.querySelector('div#hero') as HTMLElement;
  expect(hero).not.toBeNull();
  return { container, hero, q: within(hero) };
}

/** True when `a` precedes `b` in document order. */
const precedes = (a: Element, b: Element) =>
  Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);

describe('Homepage hero landing (RC-2 candidate) — reading order', () => {
  it('reads identity → kicker → h1 → lead → pill → Explore projects → strip label → receipt', () => {
    const { hero, q } = mountHero();
    const identity = hero.querySelector('[data-hero-identity]') as HTMLElement;
    const kicker = q.getByText(/^Senior technical support/);
    const h1 = q.getByRole('heading', { level: 1 });
    const lead = q.getByText(/^Five projects built/);
    const pill = q.getByRole('link', { name: 'See the work.' });
    const explore = q.getByRole('link', { name: 'Explore projects' });
    const label = q.getByText(STRIP_LABEL);
    const list = q.getByRole('list', { name: STRIP_LABEL });
    const order = [identity, kicker, h1, lead, pill, explore, label, list];
    for (let i = 1; i < order.length; i += 1) {
      expect(precedes(order[i - 1], order[i]), `item ${i - 1} must precede item ${i}`).toBe(true);
    }
  });

  it('the lead precedes the pill, and only the pill rides a hero-scroll-fade wrapper', () => {
    const { q } = mountHero();
    const lead = q.getByText(/^Five projects built/);
    const pill = q.getByRole('link', { name: 'See the work.' });
    expect(precedes(lead, pill)).toBe(true);
    expect(lead).not.toHaveClass('hero-scroll-fade');
    expect(pill.parentElement).toHaveClass('hero-scroll-fade');
    expect(lead.parentElement).toBe(pill.parentElement?.parentElement);
    expect(lead.parentElement).toHaveClass('xl:flex', 'xl:items-start', 'xl:gap-12');
  });

  it('the duplicate "Explore projects" link carries the xl hide and keeps its name and destination', () => {
    const { q } = mountHero();
    const explore = q.getByRole('link', { name: 'Explore projects' });
    expect(explore).toHaveAttribute('aria-label', 'Explore projects');
    expect(explore).toHaveAttribute('href', '#work');
    expect(explore).toHaveClass('xl:hidden');
  });
});

describe('Homepage hero landing (RC-2 candidate) — the evidence strip', () => {
  const a11y = getA11yReceipts();
  const axe = a11y.receipts.find((r) => r.label === 'axe violations');

  it('is a list named by its label, holding exactly the one permitted receipt', () => {
    const { q } = mountHero();
    const label = q.getByText(STRIP_LABEL);
    expect(label.tagName).toBe('P');
    const list = q.getByRole('list', { name: STRIP_LABEL });
    expect(list.tagName).toBe('UL');
    expect(list).not.toHaveAttribute('tabindex');
    expect(within(list).getAllByRole('listitem')).toHaveLength(1);
  });

  it('the receipt is the dated axe receipt, its strings and date read from content/a11y-receipts.json', () => {
    expect(axe).toBeDefined();
    const { q } = mountHero();
    const list = q.getByRole('list', { name: STRIP_LABEL });
    const [item] = within(list).getAllByRole('listitem');
    expect(item).toHaveTextContent(axe!.value);
    expect(item).toHaveTextContent(`${axe!.label}: ${axe!.sub}`);
    expect(item).toHaveTextContent('measured');
    expect(item.querySelector('time')).toHaveAttribute('dateTime', a11y.measuredDate);
    const evidence = within(item).getByRole('link', { name: 'evidence' });
    expect(evidence).toHaveAttribute('href', '/accessibility/#receipts');
    // The base's own wording and date, as approved for this slice. These three
    // literals move with the receipt when the JSON is next re-measured.
    expect(axe!.value).toBe('0');
    expect(`${axe!.label}: ${axe!.sub}`).toBe('axe violations: 17 routes × 2 themes, strict rules');
    expect(a11y.measuredDate).toBe('2026-08-25');
  });

  it('the two receipts omitted from this candidate are not in the hero', () => {
    const { hero } = mountHero();
    const text = hero.textContent ?? '';
    expect(text).not.toContain('2,900+');
    expect(text).not.toContain('tests passing: Flagstone');
    expect(text).not.toMatch(/calibration round/);
    expect(hero.querySelector('a[href="/work/flagstone/#flagstone-test-count-method"]')).toBeNull();
    expect(hero.querySelector('a[href="/colophon/#calibration"]')).toBeNull();
  });

  it('each receipt keeps method-pair, link-draw method-draw and a <time dateTime>', () => {
    const { q } = mountHero();
    const list = q.getByRole('list', { name: STRIP_LABEL });
    for (const item of within(list).getAllByRole('listitem')) {
      expect(item.querySelector('.method-pair')).not.toBeNull();
      const link = within(item).getByRole('link');
      expect(link).toHaveClass('link-draw', 'method-draw');
      expect(item.querySelector('time')?.getAttribute('dateTime')).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("is unboxed: no receipt paper on the entry, hairlines in LedgerRow's first-row grammar", () => {
    const { q } = mountHero();
    const list = q.getByRole('list', { name: STRIP_LABEL });
    const [item] = within(list).getAllByRole('listitem');
    const root = item.querySelector('.method-pair') as HTMLElement;
    for (const paper of ['bg-receipt', 'border', 'rounded-md', 'p-6']) expect(root).not.toHaveClass(paper);
    expect(item).toHaveClass(
      'border-t',
      'border-border-decorative',
      'first:border-t-0',
      'lg:border-l',
      'lg:first:border-l-0',
    );
    expect(list).toHaveClass('flex', 'flex-col', 'lg:flex-row');
    const label = q.getByText(STRIP_LABEL);
    expect(label).toHaveClass(
      'font-mono',
      'text-meta',
      'tracking-label',
      'uppercase',
      'text-ink-muted',
      'border-t',
      'border-border-decorative',
      'pt-4',
      'mb-4',
    );
    // 64px under the lead row below xl (the base), 72px from xl (B's value),
    // 96px from 1440 (owner refinement 2026-10-18: the strip no longer peeks
    // into the 1440×900 first screen).
    expect(label.parentElement).toHaveClass('mt-16', 'xl:mt-18', 'min-[1440px]:mt-24', 'max-w-[880px]');
  });

  // Owner refinement 2026-10-18. With no receipt paper, the strip's small type
  // sits on the hero wash, where text-meta measured 3.77–4.15:1 and the
  // accent-text link 4.52:1 in light (rendered pixels). Every small-type line in
  // the strip is one ink deeper; the figure keeps text-ink.
  it('sets every small-type line one ink deeper than on paper: ink-muted text, link-hover method link', () => {
    const { q } = mountHero();
    const label = q.getByText(STRIP_LABEL);
    expect(label).not.toHaveClass('text-text-meta');
    const list = q.getByRole('list', { name: STRIP_LABEL });
    const [item] = within(list).getAllByRole('listitem');
    const root = item.querySelector('.method-pair') as HTMLElement;
    const [figure, what, tierLine] = Array.from(root.children) as HTMLElement[];
    expect(figure).toHaveClass('text-ink');
    for (const line of [what, tierLine]) {
      expect(line).toHaveClass('text-ink-muted');
      expect(line).not.toHaveClass('text-text-meta');
    }
    const evidence = within(item).getByRole('link', { name: 'evidence' });
    expect(evidence).toHaveClass('link-draw', 'method-draw', 'text-link-hover', 'hover:text-link-hover');
    expect(evidence).not.toHaveClass('text-accent-text', 'hover:text-accent-text');
  });
});

describe('Homepage hero landing — the professional headline underline (owner refinement 2026-10-18)', () => {
  it('keeps the exact headline and underlines it with a group as wide as its text', () => {
    const { q } = mountHero();
    const kicker = q.getByText('Senior technical support · Portfolio 2026');
    expect(kicker.tagName).toBe('P');
    const group = kicker.parentElement as HTMLElement;
    expect(group).toHaveClass('hero-scroll-fade', 'w-fit', 'max-w-full');
    const rule = group.lastElementChild as HTMLElement;
    expect(rule).toHaveAttribute('aria-hidden', 'true');
    expect(rule).toHaveClass('h-px', 'w-full', 'bg-terracotta');
    expect(rule).not.toHaveClass('w-16');
  });
});

describe('Homepage hero landing (RC-2 candidate) — what must not change', () => {
  it('adds no heading and no id inside #hero, and the page keeps one h1', () => {
    const { container, hero } = mountHero();
    expect(hero.querySelectorAll('h2, h3, h4, h5, h6')).toHaveLength(0);
    expect(hero.querySelectorAll('[id]')).toHaveLength(0);
    expect(container.querySelectorAll('h1')).toHaveLength(1);
  });

  it('keeps <div id="hero" tabIndex={-1}> and the [data-hero-identity] block', () => {
    const { hero } = mountHero();
    expect(hero).toHaveAttribute('tabindex', '-1');
    const identity = hero.querySelector('[data-hero-identity]');
    expect(identity).not.toBeNull();
    expect(identity).toHaveTextContent('Skyler Halisky');
    // 40px from 640, 20px on 376–639 phones (owner refinement 2026-10-18), 16px ≤375.
    expect(identity).toHaveClass('mb-5', 'max-[375px]:mb-4', 'sm:mb-10');
  });
});
