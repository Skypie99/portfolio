/**
 * HeroSettle smoke tests — rewritten for the CSS conversion (fix(settle)
 * 2026-06-10). HeroSettle is a server component now: plain elements with
 * entrance classes; globals.css owns the motion.
 *
 * The load-bearing assertion is the SSR-markup regression guard: no inline
 * `opacity` may ever reach the rendered markup again. The previous framer
 * version baked `opacity:0` into the static HTML, which left reduced-motion
 * and no-JS visitors with permanently invisible titles and heroes.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import {
  HeroImageSettle,
  HeroTitleSettle,
  SettleHeading,
} from '@/components/HeroSettle';

afterEach(() => {
  cleanup();
});

/** No inline opacity may reach SSR markup (RM/no-JS visibility guard). */
function expectNoInlineOpacity(el: Element | null) {
  expect(el).not.toBeNull();
  expect((el as HTMLElement).getAttribute('style') ?? '').not.toMatch(/opacity/);
}

describe('HeroImageSettle', () => {
  it('renders its children', () => {
    render(
      <HeroImageSettle>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/test.jpg" alt="Test hero" />
      </HeroImageSettle>,
    );
    expect(screen.getByAltText('Test hero')).toBeInTheDocument();
  });

  it('forwards className and carries the entrance class', () => {
    const { container } = render(
      <HeroImageSettle className="my-hero-class">
        <span>content</span>
      </HeroImageSettle>,
    );
    expect(container.firstChild).toHaveClass('hero-settle-img');
    expect(container.firstChild).toHaveClass('my-hero-class');
  });

  it('ships no inline opacity (visible-at-rest markup)', () => {
    const { container } = render(
      <HeroImageSettle>
        <span>content</span>
      </HeroImageSettle>,
    );
    expectNoInlineOpacity(container.firstElementChild);
  });
});

describe('HeroTitleSettle', () => {
  it('renders an <h1> with the entrance class', () => {
    const { container } = render(<HeroTitleSettle>Flagstone</HeroTitleSettle>);
    const h1 = container.querySelector('h1');
    expect(h1).toBeInTheDocument();
    expect(h1).toHaveClass('hero-settle-title');
    expect(screen.getByText('Flagstone')).toBeInTheDocument();
  });

  it('accepts and forwards className', () => {
    const { container } = render(
      <HeroTitleSettle className="font-serif ember">Flagstone</HeroTitleSettle>,
    );
    expect(container.firstChild).toHaveClass('font-serif');
    expect(container.firstChild).toHaveClass('ember');
  });

  it('ships no inline opacity (visible-at-rest markup)', () => {
    const { container } = render(<HeroTitleSettle>Flagstone</HeroTitleSettle>);
    expectNoInlineOpacity(container.firstElementChild);
  });
});

describe('SettleHeading', () => {
  it('renders an <h1> with the settle-heading class', () => {
    const { container } = render(<SettleHeading>The Work</SettleHeading>);
    const h1 = container.querySelector('h1');
    expect(h1).toBeInTheDocument();
    expect(h1).toHaveClass('settle-heading');
  });

  it('accepts and forwards className', () => {
    const { container } = render(
      <SettleHeading className="text-display ember">The Work</SettleHeading>,
    );
    expect(container.firstChild).toHaveClass('text-display');
    expect(container.firstChild).toHaveClass('ember');
  });

  it('sets --ls-rest when restLetterSpacing is given', () => {
    const { container } = render(
      <SettleHeading restLetterSpacing="-0.03em">Tight</SettleHeading>,
    );
    const h1 = container.querySelector('h1') as HTMLElement;
    expect(h1.style.getPropertyValue('--ls-rest')).toBe('-0.03em');
  });

  it('renders no style attribute when restLetterSpacing is omitted', () => {
    const { container } = render(<SettleHeading>The Work</SettleHeading>);
    const h1 = container.querySelector('h1') as HTMLElement;
    expect(h1.getAttribute('style')).toBeNull();
  });

  it('ships no inline opacity (visible-at-rest markup)', () => {
    const { container } = render(<SettleHeading>The Work</SettleHeading>);
    expectNoInlineOpacity(container.firstElementChild);
  });
});
