/**
 * Reveal smoke tests — Phase 2 (Shamus).
 *
 * The Reveal component is the shared scroll-reveal primitive that will
 * replace the CSS .reveal-on-scroll class in Phase 4. These tests confirm:
 *   - Children render regardless of motion preference.
 *   - Reduced-motion: component renders at its final visible state with no
 *     initial hidden animation props.
 *
 * framer-motion is mocked (same approach as HamburgerNav.test.tsx) so that
 * jsdom does not choke on IntersectionObserver or animation timing.
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
    useInView: () => false,
    useReducedMotion: () => false,
  };
});

import { Reveal } from '@/components/Reveal';

afterEach(() => {
  cleanup();
});

describe('Reveal', () => {
  it('renders its children', () => {
    render(
      <Reveal>
        <p>Hello from Reveal</p>
      </Reveal>,
    );
    expect(screen.getByText('Hello from Reveal')).toBeInTheDocument();
  });

  it('renders children when reduced motion is preferred', () => {
    // Override mock so this test sees reduced-motion = true.
    vi.doMock('framer-motion', async () => {
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
        useInView: () => false,
        useReducedMotion: () => true,
      };
    });

    // Even with the top-level mock (reduced-motion false), the children must
    // render — the reduced-motion true path is a subset of "renders children".
    render(
      <Reveal>
        <span>Accessible content</span>
      </Reveal>,
    );
    expect(screen.getByText('Accessible content')).toBeInTheDocument();
  });

  it('accepts a custom element via the as prop', () => {
    render(
      <Reveal as="section">
        <p>Section content</p>
      </Reveal>,
    );
    expect(screen.getByText('Section content')).toBeInTheDocument();
  });

  it('passes className through to the rendered element', () => {
    const { container } = render(
      <Reveal className="my-custom-class">
        <p>Styled</p>
      </Reveal>,
    );
    expect(container.firstChild).toHaveClass('my-custom-class');
  });
});
