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

describe('Homepage work-index project affordances', () => {
  it('renders one visible View project CTA for every project destination', () => {
    render(<HomePage />);

    const ctas = screen.getAllByRole('link', { name: /^View project:/i });
    expect(ctas).toHaveLength(5);
    for (const cta of ctas) {
      expect(cta).toHaveAttribute('href', expect.stringMatching(/^\/work\//));
      expect(cta).toHaveAttribute('tabindex', '-1');
      expect(cta).toHaveTextContent('View project');
      expect(cta).toHaveClass('h-11', 'border', 'rounded-pill');
    }
  });

  it('keeps the project titles as the five keyboard destinations', () => {
    render(<HomePage />);

    for (const title of ['Flagstone', 'Claude Corp', 'Claude Corp Dashboard', 'Prompt Library', 'Ghost Code']) {
      const link = screen.getByRole('link', { name: `View ${title} project` });
      expect(link).toHaveAttribute('href', expect.stringMatching(/^\/work\//));
      expect(link).not.toHaveAttribute('tabindex');
    }
  });
});
