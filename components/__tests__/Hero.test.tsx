/**
 * Hero smoke tests — Cycle 11 (Gary).
 *
 * Locks in two Hero behaviors:
 *   1. The eyebrow carries the Cycle 10 .hero-scroll-fade class so the
 *      pure-CSS scroll-driven fade-out animation is wired up. (We don't
 *      try to assert the animation runs — jsdom doesn't implement
 *      scroll-driven animations — just that the class is present.)
 *   2. The headline is rendered as <h1> (one per page rule).
 */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { Hero } from '@/components/Hero';

afterEach(() => {
  cleanup();
});

describe('Hero', () => {
  const fixture = {
    eyebrow: 'AI PORTFOLIO — 2026',
    heading: 'Building thoughtful AI work.',
    subhead: 'Small studio of AI-assisted tools.',
    ctaLabel: 'View the work',
    ctaHref: '/work/',
  } as const;

  it('renders the headline as a single h1', () => {
    render(<Hero {...fixture} />);
    expect(
      screen.getByRole('heading', { level: 1, name: fixture.heading }),
    ).toBeInTheDocument();
  });

  it('eyebrow carries both hero-enter (mount fade) and hero-scroll-fade (Cycle 10) classes', () => {
    render(<Hero {...fixture} />);
    const eyebrow = screen.getByText(fixture.eyebrow);
    expect(eyebrow).toHaveClass('hero-enter');
    expect(eyebrow).toHaveClass('hero-scroll-fade');
  });

  it('CTA dot carries the cta-dot-pulse class (Cycle 20 one-shot mount pulse)', () => {
    const { container } = render(<Hero {...fixture} />);
    // The terracotta dot is the aria-hidden span with bg-terracotta inside
    // the Hero's CTA button. The pulse class wires up the one-shot 800ms
    // scale animation declared in globals.css.
    const dot = container.querySelector('span.bg-terracotta.cta-dot-pulse');
    expect(dot).not.toBeNull();
  });
});
