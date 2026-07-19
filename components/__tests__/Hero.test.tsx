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

  it('eyebrow wrapper keeps hero-scroll-fade; the retired hero-enter stagger stays gone', () => {
    render(<Hero {...fixture} />);
    // wave5: eyebrow <p> + terracotta rule are wrapped in a single div; the
    // scroll-exit class lives on the wrapper. motion-clockwork 2026-07-19: the
    // .hero-enter mount stagger was retired (the view-timeline scroll rules had
    // replaced its `animation` in modern browsers, so it never played) — this
    // guards against it quietly returning.
    const eyebrowWrapper = screen.getByText(fixture.eyebrow).parentElement;
    expect(eyebrowWrapper).toHaveClass('hero-scroll-fade');
    expect(eyebrowWrapper).not.toHaveClass('hero-enter');
  });

  it('CTA dot renders without the retired cta-dot-pulse class (motion-clockwork 2026-07-19)', () => {
    const { container } = render(<Hero {...fixture} />);
    // The terracotta dot remains the aria-hidden span inside the CTA button;
    // the Cycle 20 one-shot pulse was retired with the hero entrance it was
    // keyed to (its keyframes are deleted from globals.css).
    const dot = container.querySelector('span.bg-terracotta');
    expect(dot).not.toBeNull();
    expect(dot).not.toHaveClass('cta-dot-pulse');
  });
});
