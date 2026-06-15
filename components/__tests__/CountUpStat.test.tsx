/**
 * CountUpStat tests (§5.5 — subordinate the stat-figure unit).
 *
 * Locks the suffix-subordination contract that has TWO code paths:
 *  - counted ("100%")  → the numeral counts; the unit "%" renders in an
 *    optically-subordinate span once the count lands;
 *  - static ("2.2 AA") → parseStat returns null (decimal), so a trailing unit
 *    is split out for the span while "2.2" stays the figure;
 * and the must-NOT-split cases (pure numbers "1,680"/"0", non-numeric "E2E").
 *
 * Motion is mocked OFF (not-in-view + reduced) so the component renders its
 * deterministic FINAL state — the rest frame — without driving rAF. The
 * count-up "lands cleanly with the suffix" is the HARD WATCH verified live.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';

import { CountUpStat } from '@/components/CountUpStat';

// Force the rest/final state: never in view, reduced motion → no count-up.
vi.mock('@/lib/motion', () => ({
  useInViewOnce: () => [{ current: null }, false] as const,
  usePrefersReducedMotion: () => true,
}));

afterEach(() => {
  cleanup();
});

const SUFFIX = 'text-[0.5em]'; // the subordinate unit span's tell

describe('CountUpStat — suffix subordination', () => {
  it('counted "100%": "%" sits in the subordinate span, "100" does not', () => {
    const { container } = render(<CountUpStat value="100%" emberClass="ember-gold" label="Conformance" />);
    const p = container.querySelector('p')!;
    const span = container.querySelector('span');
    expect(p.textContent).toBe('100%');
    expect(span?.textContent).toBe('%');
    expect(span?.className).toContain(SUFFIX);
    expect(p.getAttribute('aria-label')).toBe('100% Conformance');
  });

  it('static "2.2 AA": "AA" subordinates, "2.2" stays the figure, gap is margin (no space)', () => {
    const { container } = render(<CountUpStat value="2.2 AA" emberClass="ember-teal" label="WCAG level" />);
    const p = container.querySelector('p')!;
    const span = container.querySelector('span');
    expect(p.textContent).toBe('2.2AA'); // literal space dropped; ml-[0.12em] is the gap
    expect(span?.textContent).toBe('AA');
    expect(span?.className).toContain(SUFFIX);
    expect(p.getAttribute('aria-label')).toBe('2.2 AA WCAG level'); // accessible name unchanged
  });

  it('pure number "1,680": no subordinate span', () => {
    const { container } = render(<CountUpStat value="1,680" emberClass="ember" label="commits" />);
    expect(container.querySelector('p')!.textContent).toBe('1,680');
    expect(container.querySelector('span')).toBeNull();
  });

  it('"0": renders bare, no empty span', () => {
    const { container } = render(<CountUpStat value="0" emberClass="ember" label="incidents" />);
    expect(container.querySelector('p')!.textContent).toBe('0');
    expect(container.querySelector('span')).toBeNull();
  });

  it('non-numeric token "E2E": rendered whole, never split', () => {
    const { container } = render(<CountUpStat value="E2E" emberClass="ember-moss" label="coverage" />);
    expect(container.querySelector('p')!.textContent).toBe('E2E');
    expect(container.querySelector('span')).toBeNull();
  });
});
