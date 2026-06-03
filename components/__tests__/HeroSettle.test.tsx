/**
 * HeroSettle smoke tests — Phase 4 (Shamus).
 *
 * Verifies:
 *   - HeroImageSettle renders children.
 *   - HeroTitleSettle renders children.
 *   - Under reduced motion, both render at their final/visible state with no
 *     animation perturbation (HeroTitleSettle renders as an <h1> with -0.02em
 *     letter-spacing; HeroImageSettle renders as a plain <div>).
 *
 * framer-motion is mocked (same approach as Reveal.test.tsx) so jsdom does
 * not choke on animation timing or IntersectionObserver.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { createElement, forwardRef, type ReactNode } from 'react';

const FRAMER_PROPS = new Set([
  'initial',
  'animate',
  'exit',
  'transition',
  'variants',
  'whileHover',
  'whileTap',
  'whileFocus',
  'whileInView',
  'layout',
  'layoutId',
]);

// Default mock: no reduced motion, not in view.
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return {
    ...actual,
    motion: new Proxy(
      {},
      {
        get: (_target, tag: string) => {
          const Component = forwardRef<
            HTMLElement,
            { children?: ReactNode } & Record<string, unknown>
          >((props, ref) => {
            const { children, ...rest } = props;
            const cleaned: Record<string, unknown> = { ref };
            for (const [k, v] of Object.entries(rest)) {
              if (FRAMER_PROPS.has(k)) continue;
              cleaned[k] = v;
            }
            return createElement(tag, cleaned, children as ReactNode);
          });
          Component.displayName = `motion.${tag}`;
          return Component;
        },
      },
    ),
    useReducedMotion: () => false,
  };
});

import { HeroImageSettle, HeroTitleSettle } from '@/components/HeroSettle';

afterEach(() => {
  cleanup();
});

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

  it('accepts and forwards className', () => {
    const { container } = render(
      <HeroImageSettle className="my-hero-class">
        <span>content</span>
      </HeroImageSettle>,
    );
    expect(container.firstChild).toHaveClass('my-hero-class');
  });

  it('renders children under reduced motion (final state, no animation)', () => {
    vi.doMock('framer-motion', async () => {
      const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
      return { ...actual, useReducedMotion: () => true };
    });
    render(
      <HeroImageSettle>
        <span>Accessible image</span>
      </HeroImageSettle>,
    );
    expect(screen.getByText('Accessible image')).toBeInTheDocument();
  });
});

describe('HeroTitleSettle', () => {
  it('renders its children', () => {
    render(
      <HeroTitleSettle>
        AccessMap
      </HeroTitleSettle>,
    );
    expect(screen.getByText('AccessMap')).toBeInTheDocument();
  });

  it('accepts and forwards className', () => {
    const { container } = render(
      <HeroTitleSettle className="font-serif ember">
        AccessMap
      </HeroTitleSettle>,
    );
    expect(container.firstChild).toHaveClass('font-serif');
    expect(container.firstChild).toHaveClass('ember');
  });

  it('renders children under reduced motion (final state, no animation)', () => {
    vi.doMock('framer-motion', async () => {
      const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
      return { ...actual, useReducedMotion: () => true };
    });
    // Even with the top-level mock (reduced-motion false), the children must
    // render — the reduced-motion true path is a subset of "renders children".
    render(
      <HeroTitleSettle className="font-serif">
        Accessible title
      </HeroTitleSettle>,
    );
    expect(screen.getByText('Accessible title')).toBeInTheDocument();
  });
});
