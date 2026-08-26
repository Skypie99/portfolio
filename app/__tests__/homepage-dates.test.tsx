/**
 * Homepage date elements (H1, THE ROOM Phase H).
 *
 * No dedicated test existed for the work-index row years or the Record
 * band's dates — F4's question ("which test fails if this breaks?") had no
 * answer for either. Renders the real HomePage against the site's real
 * content, the same pattern app/__tests__/work-receipt.test.tsx already
 * uses to test FlagstoneTestReceipt out of the sibling heavy page file.
 *
 * HomePage mounts CinematicDesert, which registers GSAP/ScrollTrigger on
 * mount — jsdom has no layout/rAF-driven scroll for it to run against.
 * Same fix as components/cinematic/__tests__/CinematicDesert.test.tsx: mock
 * matchMedia to report prefers-reduced-motion, so the component takes its
 * contractual static-frame path and never touches GSAP at all.
 */
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';

import HomePage from '@/app/page';

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

describe('Homepage — work-index years and Record-band dates render as <time>', () => {
  it('renders every work-index row year as a real <time> element', () => {
    const { container } = render(<HomePage />);
    const work = container.querySelector('#work');
    expect(work).not.toBeNull();
    const years = Array.from(work!.querySelectorAll('ol > li time'));
    expect(years.length).toBeGreaterThan(0);
    for (const y of years) {
      expect(y.getAttribute('dateTime')).toMatch(/^\d{4}$/);
    }
  });

  it('renders the Record band\'s dated rows as real <time> elements, never the "closed" status word', () => {
    const { container } = render(<HomePage />);
    const record = container.querySelector('#record');
    expect(record).not.toBeNull();
    const times = Array.from(record!.querySelectorAll('time'));
    expect(times.length).toBeGreaterThan(0);
    for (const t of times) {
      expect(t.getAttribute('dateTime')).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(t.textContent).not.toBe('closed');
    }
    // the defect row's literal status word must still render, as plain text
    expect(record!.textContent).toContain('the dead Report button');
  });
});
