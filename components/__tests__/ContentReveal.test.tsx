/**
 * ContentReveal floor tests — defects repair R1 (2026-06-12).
 *
 * The wrapper's REST state is the VISIBLE state: SSR must emit NO inline
 * opacity:0 (no-JS and reduced-motion visitors read the homepage), and the
 * .cinematic-content-reveal class must persist after hydration in every
 * state (useDayNight anchors the day-night arc on it — lib/motion.ts).
 *
 * framer-motion is intentionally REAL here (not mocked): the SSR string is
 * exactly what `next build` serializes, which is the defect surface this
 * repair fixes — a mock would assert nothing.
 */
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { renderToString } from 'react-dom/server';

import { ContentReveal } from '@/components/ContentReveal';

beforeAll(() => {
  // jsdom has no matchMedia; framer's useReducedMotion touches it on mount.
  if (typeof window.matchMedia !== 'function') {
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;
  }
});

afterEach(() => {
  cleanup();
});

describe('ContentReveal', () => {
  it('SSR emits the wrapper visible — no inline opacity:0 (no-JS floor)', () => {
    const html = renderToString(
      <ContentReveal>
        <p>homepage content</p>
      </ContentReveal>,
    );
    expect(html).toContain('cinematic-content-reveal');
    expect(html).not.toContain('opacity:0');
    expect(html).not.toContain('opacity: 0');
    expect(html).toContain('homepage content');
  });

  it('keeps the day-night anchor class on the wrapper after mount', () => {
    const { container } = render(
      <ContentReveal>
        <p>homepage content</p>
      </ContentReveal>,
    );
    const wrapper = container.firstElementChild;
    expect(wrapper).not.toBeNull();
    expect(wrapper).toHaveClass('cinematic-content-reveal');
    expect(wrapper).toHaveTextContent('homepage content');
  });
});
