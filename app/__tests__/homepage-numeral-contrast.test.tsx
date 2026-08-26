/**
 * The homepage work-index row numeral's ink opacity (H3, THE ROOM Phase H).
 *
 * lib/__tests__/ink-contrast.test.ts proves text-ink/70 clears WCAG AA and
 * text-ink/30 does not; this test proves the component actually renders at
 * /70 (and not some other value) — the two guards together are what F4
 * asks for: which test fails if either the math or the markup regresses.
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

describe('Homepage work-index numeral opacity', () => {
  it('every row numeral renders at text-ink/70 (rest) and text-ink/85 (hover), never the pre-fix /30 or /45', () => {
    const { container } = render(<HomePage />);
    const work = container.querySelector('#work');
    expect(work).not.toBeNull();
    const numerals = Array.from(work!.querySelectorAll('ol > li span[aria-hidden="true"].tabular-nums'));
    expect(numerals.length).toBeGreaterThan(0);
    for (const n of numerals) {
      expect(n.className).toContain('text-ink/70');
      expect(n.className).toContain('group-hover:text-ink/85');
      expect(n.className).not.toMatch(/text-ink\/30\b/);
      expect(n.className).not.toMatch(/text-ink\/45\b/);
    }
  });
});
