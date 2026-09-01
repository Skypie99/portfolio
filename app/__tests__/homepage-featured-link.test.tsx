/**
 * The work-index "Featured — above" cross-reference link (H3, THE ROOM
 * Phase H).
 *
 * The H3 re-audit (the first clean axe run since the rig's absolute-path
 * fragility was fixed) caught a live label-content-name-mismatch / SC 2.5.3
 * violation here: the old aria-label ("Flagstone — the flagship room,
 * above") shared no words with the visible text ("Featured — above"). F4:
 * no test caught it because none existed — this is that test.
 */
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

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

describe('Homepage work index: the "Featured: above" link', () => {
  it("carries no aria-label that could diverge from its visible text", () => {
    render(<HomePage />);
    const link = screen.getByRole('link', { name: /Featured: above/ });
    expect(link).not.toHaveAttribute('aria-label');
  });

  it('its accessible name is built from real visible text, matching what a sighted reader sees', () => {
    render(<HomePage />);
    const link = screen.getByRole('link', { name: /Featured: above/ });
    // The visible words ("Featured — above") must be the accessible name —
    // not replaced by unrelated wording, which is exactly what the old
    // aria-label did.
    expect(link.textContent?.trim().replace(/\s+/g, ' ')).toMatch(/^Featured: above/);
  });

  it('points at the flagship section', () => {
    render(<HomePage />);
    const link = screen.getByRole('link', { name: /Featured: above/ });
    expect(link).toHaveAttribute('href', '#flagship');
  });
});
