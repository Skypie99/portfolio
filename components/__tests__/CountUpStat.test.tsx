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
    const suffix = container.querySelector('p span'); // the subordinate unit lives inside the figure
    expect(p.textContent).toBe('100%');
    expect(suffix?.textContent).toBe('%');
    expect(suffix?.className).toContain(SUFFIX);
    // L6-05: the animated figure is aria-hidden; the accessible name lives on an sr-only span.
    expect(p.getAttribute('aria-hidden')).toBe('true');
    expect(p.getAttribute('aria-label')).toBeNull();
    expect(container.querySelector('.sr-only')?.textContent).toBe('100% Conformance');
  });

  it('static "2.2 AA": "AA" subordinates, "2.2" stays the figure, gap is margin (no space)', () => {
    const { container } = render(<CountUpStat value="2.2 AA" emberClass="ember-teal" label="WCAG level" />);
    const p = container.querySelector('p')!;
    const suffix = container.querySelector('p span');
    expect(p.textContent).toBe('2.2AA'); // literal space dropped; ml-[0.12em] is the gap
    expect(suffix?.textContent).toBe('AA');
    expect(suffix?.className).toContain(SUFFIX);
    // L6-05: accessible name preserved on the sr-only span, not a prohibited <p> aria-label.
    expect(p.getAttribute('aria-hidden')).toBe('true');
    expect(container.querySelector('.sr-only')?.textContent).toBe('2.2 AA WCAG level');
  });

  it('pure number "1,680": no subordinate span', () => {
    const { container } = render(<CountUpStat value="1,680" emberClass="ember" label="commits" />);
    expect(container.querySelector('p')!.textContent).toBe('1,680');
    expect(container.querySelector('p span')).toBeNull(); // no subordinate unit span inside the figure
  });

  it('"0": renders bare, no empty span', () => {
    const { container } = render(<CountUpStat value="0" emberClass="ember" label="incidents" />);
    expect(container.querySelector('p')!.textContent).toBe('0');
    expect(container.querySelector('p span')).toBeNull();
  });

  it('non-numeric token "E2E": rendered whole, never split', () => {
    const { container } = render(<CountUpStat value="E2E" emberClass="ember-moss" label="coverage" />);
    expect(container.querySelector('p')!.textContent).toBe('E2E');
    expect(container.querySelector('p span')).toBeNull();
  });

  it('pure decimal "0.003": rendered whole — the last digit never subordinates (S6 receipts)', () => {
    const { container } = render(<CountUpStat value="0.003" emberClass="ember-teal" label="worst-case CLS" />);
    expect(container.querySelector('p')!.textContent).toBe('0.003');
    expect(container.querySelector('p span')).toBeNull();
    expect(container.querySelector('.sr-only')?.textContent).toBe('0.003 worst-case CLS');
  });
});
