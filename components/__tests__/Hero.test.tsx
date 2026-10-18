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
import { renderToString } from 'react-dom/server';

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

  it('keeps the measured short-phone display step local to the hero headline', () => {
    render(<Hero {...fixture} />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass(
      'max-[375px]:text-[2.5rem]',
      'max-[375px]:leading-[1.1]',
      'max-[359px]:text-[2.1875rem]',
    );
  });
});

/**
 * RC-2 first visual slice (D-CON-001 B · M-CON-001 B r2) — structure only.
 *
 * jsdom applies no CSS, so these pin the classes and the DOM order that the
 * later rendered review measures; the geometry itself belongs to the browser
 * matrix. Each case names the decision it guards.
 */
const rc2Props = {
  eyebrow: 'Kicker line',
  heading: 'A quiet statement.',
  subhead: 'One lead sentence that explains the statement.',
  ctaLabel: 'See it.',
  ctaHref: '#work',
  name: 'A Name',
  positioning: 'One positioning sentence.',
  imprint: 'One imprint line.',
  avatarSrc: '/images/headshot.jpg',
} as const;

describe('Hero — RC-2 landing structure (desktop, D-CON-001 B)', () => {
  it('from xl the lead and the pill share one row: lead first in the DOM, pill second, in a plain wrapper', () => {
    render(<Hero {...rc2Props} />);
    const lead = screen.getByText(rc2Props.subhead);
    const pill = screen.getByRole('link', { name: rc2Props.ctaLabel });
    const row = lead.parentElement as HTMLElement;
    expect(row).toHaveClass('xl:flex', 'xl:items-start', 'xl:gap-12');
    // A plain block below xl: every class on the wrapper is xl-scoped.
    expect(row.className.split(/\s+/).every((c) => c.startsWith('xl:'))).toBe(true);
    const pillWrapper = pill.parentElement as HTMLElement;
    expect(pillWrapper.parentElement).toBe(row);
    expect(lead.compareDocumentPosition(pill) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    // The lead gives up its bottom margin only in the row and never fades;
    // the pill's wrapper keeps the fade, B's 2px optical offset, and never shrinks.
    expect(lead).toHaveClass('mb-5', 'max-[375px]:mb-3', 'sm:mb-16', 'xl:mb-0');
    expect(lead).not.toHaveClass('hero-scroll-fade');
    expect(pillWrapper).toHaveClass('hero-scroll-fade', 'xl:mt-0.5', 'xl:shrink-0');
  });

  it('from xl the duplicate "Explore projects" link is display-none; below xl it is untouched', () => {
    render(<Hero {...rc2Props} />);
    const pill = screen.getByRole('link', { name: rc2Props.ctaLabel });
    const explore = screen.getByRole('link', { name: 'Explore projects' });
    expect(explore).toHaveAttribute('aria-label', 'Explore projects');
    expect(explore).toHaveAttribute('href', '#work');
    expect(explore).toHaveClass('xl:hidden');
    expect(explore).not.toHaveClass('hidden', 'sr-only', 'invisible');
    // Still the pill's sibling inside the fade wrapper, after the pill.
    expect(explore.parentElement).toBe(pill.parentElement);
    expect(pill.compareDocumentPosition(explore) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('keeps the landing pad byte-identical and moves only the bottom padding to classes', () => {
    const html = renderToString(<Hero {...rc2Props} />);
    // The one inline length left on the section is the protected landing pad.
    expect(html).toContain('style="padding-top:clamp(200px, calc(605px - 28vw), 500px)"');
    expect(html).not.toContain('padding-bottom');
    const { container } = render(<Hero {...rc2Props} />);
    const section = container.querySelector('section') as HTMLElement;
    expect(section).toHaveClass('pb-[clamp(64px,10vw,128px)]', 'xl:pb-24');
  });

  it('adds no motion: the three scroll classes stay on exactly their base elements', () => {
    const { container } = render(<Hero {...rc2Props} />);
    const fades = Array.from(container.querySelectorAll('.hero-scroll-fade'));
    expect(fades).toHaveLength(2);
    expect(fades[0]).toBe(screen.getByText(rc2Props.eyebrow).parentElement);
    expect(fades[1]).toBe(screen.getByRole('link', { name: rc2Props.ctaLabel }).parentElement);
    const translates = container.querySelectorAll('.hero-scroll-translate');
    expect(translates).toHaveLength(1);
    expect(translates[0]).toBe(screen.getByRole('heading', { level: 1 }));
    const drifts = container.querySelectorAll('.hero-bg-drift');
    expect(drifts).toHaveLength(1);
    expect(drifts[0]).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('Hero — RC-2 identity gap (mobile, M-CON-001 B r2)', () => {
  it('identity to kicker: 40px from 376px up, the base 16px at the two shortest portrait widths', () => {
    const { container } = render(<Hero {...rc2Props} />);
    const identity = container.querySelector('[data-hero-identity]') as HTMLElement;
    expect(identity).toHaveClass('mb-10', 'max-[375px]:mb-4');
    expect(identity).not.toHaveClass('mb-4', 'sm:mb-10');
    // Kicker-to-rule and rule-to-H1 stay the base's 12px and 16px on phones.
    const kicker = screen.getByText(rc2Props.eyebrow);
    expect(kicker).toHaveClass('mb-3');
    expect(kicker.parentElement).toHaveClass('mb-4', 'sm:mb-12');
  });
});
