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
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
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

/**
 * U4 (A-04) — seated fragment arrivals.
 *
 * The head script sets `reveal-seat` on <html> when a document loads with a
 * location.hash; these tests exercise the React half at that boundary (the
 * class, not live location.hash — the script's output is the unit seam):
 *   - seat class + in-viewport → adopted seated (reveal-shown + transition
 *     none, no IO entry ever fired), then the class is released,
 *   - seat class + below-viewport → re-armed unseen; IO fire still animates
 *     (the choreography survives for the rest of the page),
 *   - no class → today's path, byte-identical (the TOC-click regression pin).
 *
 * IntersectionObserver MUST be stubbed with a capturing mock here: with IO
 * undefined, useInViewOnce auto-shows everything (lib/motion.ts:41-44) and
 * every "armed" assertion would go vacuous.
 */
type IOEntry = { isIntersecting: boolean };
type IOCallback = (entries: IOEntry[]) => void;

describe('Reveal — seated fragment arrivals (U4)', () => {
  let ioCallback: IOCallback | null = null;
  let rectSpy: ReturnType<typeof vi.spyOn> | null = null;

  class MockIntersectionObserver {
    constructor(cb: IOCallback) {
      ioCallback = cb;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  const mockRectTop = (top: number) => {
    rectSpy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      top,
      bottom: top + 100,
      left: 0,
      right: 375,
      width: 375,
      height: 100,
      x: 0,
      y: top,
      toJSON: () => ({}),
    } as DOMRect);
  };

  beforeEach(() => {
    ioCallback = null;
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    rectSpy?.mockRestore();
    rectSpy = null;
    document.documentElement.classList.remove('reveal-seat', 'reveal-rearm');
  });

  it('adopts an in-viewport reveal as seated and releases the seat class', async () => {
    document.documentElement.classList.add('reveal-seat');
    mockRectTop(100); // well inside the arming band (jsdom innerHeight 768 → band 921.6)

    const { container } = render(
      <Reveal>
        <p>Target section</p>
      </Reveal>,
    );

    // Seated synchronously at hydration — no IO entry ever fired.
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass('reveal-shown');
    expect(el.style.transition).toBe('none');

    // The seat is released (rAF-aligned; setTimeout floor in jsdom), and the
    // rearm companion does not linger.
    await waitFor(() =>
      expect(document.documentElement.classList.contains('reveal-seat')).toBe(false),
    );
    await waitFor(() =>
      expect(document.documentElement.classList.contains('reveal-rearm')).toBe(false),
    );
    // The adopted reveal stays seated after release.
    expect(el).toHaveClass('reveal-shown');
  });

  it('re-arms a below-viewport reveal unseen; the choreography survives', async () => {
    document.documentElement.classList.add('reveal-seat');
    mockRectTop(2000); // beyond the 1.2 × innerHeight band

    const { container } = render(
      <Reveal>
        <p>Later section</p>
      </Reveal>,
    );
    const el = container.firstChild as HTMLElement;

    // Not adopted: armed (hidden state is CSS's job; no reveal-shown here).
    expect(el).not.toHaveClass('reveal-shown');
    await waitFor(() =>
      expect(document.documentElement.classList.contains('reveal-seat')).toBe(false),
    );
    expect(el).not.toHaveClass('reveal-shown');

    // Scrolling on: the normal entrance still fires.
    act(() => {
      ioCallback?.([{ isIntersecting: true }]);
    });
    expect(el).toHaveClass('reveal-shown');
  });

  it('keeps today\'s path byte-identical without the seat class (TOC-click pin)', async () => {
    mockRectTop(100); // in-viewport, but NO seat class — must stay armed
    const { container } = render(
      <Reveal>
        <p>Ordinary visit</p>
      </Reveal>,
    );
    const el = container.firstChild as HTMLElement;

    expect(el).not.toHaveClass('reveal-shown');
    expect(el.style.transition).toBe('');
    // The U4 classes never appear on an ordinary visit.
    expect(document.documentElement.classList.contains('reveal-seat')).toBe(false);
    expect(document.documentElement.classList.contains('reveal-rearm')).toBe(false);

    act(() => {
      ioCallback?.([{ isIntersecting: true }]);
    });
    expect(el).toHaveClass('reveal-shown');
  });

  it('seats to the arming band, not just the visible viewport', () => {
    document.documentElement.classList.add('reveal-seat');
    mockRectTop(900); // below the fold (768) but inside the 1.2 band (921.6)

    const { container } = render(
      <Reveal>
        <p>Band content</p>
      </Reveal>,
    );
    expect(container.firstChild).toHaveClass('reveal-shown');
  });
});
