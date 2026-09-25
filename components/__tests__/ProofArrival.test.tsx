/**
 * ProofArrival lifecycle tests — W4-06 VE04/M1 (one-time evidence-arrival
 * decoration for the Flagstone first proof).
 *
 * Pins the exact lifecycle contract (contracts/VE04_M1_MOTION_POLICY.json):
 *   - consumed is marked AT TRIGGER (sessionStorage write at IO entry),
 *     never at animation end;
 *   - hash / Back-Forward / reload / repeat / uncertain arrival → settled
 *     immediately, with consume latched;
 *   - storage-unavailable and nav-type-unavailable fall back to settled
 *     static (never a replay);
 *   - proof already in viewport at arrival (restored scroll) → settled;
 *   - scroll-away mid-settle finishes to rest and stays consumed —
 *     reentry does not replay;
 *   - disabled instance renders children with zero wrapper footprint.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, waitFor } from '@testing-library/react';

import { ProofArrival } from '@/components/ProofArrival';

type IOEntry = { isIntersecting: boolean };
type IOCallback = (entries: IOEntry[]) => void;

const CONSUMED_KEY = 'w4-06-proof-arrival.v1';

describe('ProofArrival — one-time evidence-arrival lifecycle', () => {
  let ioCallback: IOCallback | null = null;
  let ioInstances: number = 0;
  let rectSpy: ReturnType<typeof vi.spyOn> | null = null;
  let navOriginal: typeof performance.getEntriesByType | null = null;

  class MockIntersectionObserver {
    constructor(cb: IOCallback) {
      ioCallback = cb;
      ioInstances += 1;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  /** Proof below the fold (armed path) by default — jsdom innerHeight 768. */
  const mockRectTop = (top: number) => {
    rectSpy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      top,
      bottom: top + 400,
      left: 0,
      right: 300,
      width: 300,
      height: 400,
      x: 0,
      y: top,
      toJSON: () => ({}),
    } as DOMRect);
  };

  const mockNavType = (type: string | undefined) => {
    if (!navOriginal) navOriginal = performance.getEntriesByType.bind(performance);
    performance.getEntriesByType = ((name: string) =>
      name === 'navigation' && type ? ([{ type }] as unknown as PerformanceEntryList) : []) as
      typeof performance.getEntriesByType;
  };

  const mockReducedMotion = (matches: boolean) => {
    vi.stubGlobal(
      'matchMedia',
      (query: string) =>
        ({
          matches: query.includes('prefers-reduced-motion') ? matches : false,
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => false,
        }) as MediaQueryList,
    );
  };

  beforeEach(() => {
    ioCallback = null;
    ioInstances = 0;
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
    window.sessionStorage.clear();
    window.history.replaceState(null, '', '/');
    mockReducedMotion(false);
    mockNavType('navigate');
    mockRectTop(1200); // below the fold
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    rectSpy = null;
    if (navOriginal) {
      performance.getEntriesByType = navOriginal;
      navOriginal = null;
    }
  });

  it('renders children with no wrapper when disabled (zero footprint)', () => {
    const { container } = render(
      <ProofArrival enabled={false}>
        <figure data-testid="proof" />
      </ProofArrival>,
    );
    expect(container.querySelector('[data-proof-arrival]')).toBeNull();
    expect(container.querySelector('[data-testid="proof"]')).toBeTruthy();
  });

  it('wraps with data-proof-arrival=armed when eligible', () => {
    const { container } = render(
      <ProofArrival>
        <figure data-testid="proof" />
      </ProofArrival>,
    );
    expect(container.querySelector('[data-proof-arrival="armed"]')).toBeTruthy();
    expect(ioInstances).toBe(1);
  });

  it('consumes AT trigger and settles through the beat once', async () => {
    const { container } = render(
      <ProofArrival>
        <figure data-testid="proof" />
      </ProofArrival>,
    );
    const host = container.querySelector('[data-proof-arrival]') as HTMLElement;
    expect(host).toHaveAttribute('data-proof-arrival', 'armed');
    expect(window.sessionStorage.getItem(CONSUMED_KEY)).toBeNull();

    act(() => ioCallback?.([{ isIntersecting: true }]));

    // Consumed AT trigger — before any settle completes.
    expect(window.sessionStorage.getItem(CONSUMED_KEY)).toBe('1');
    expect(host).toHaveAttribute('data-proof-arrival', 'settling');

    await waitFor(() => expect(host).toHaveAttribute('data-proof-arrival', 'settled'), {
      timeout: 2500,
    });

    // Reentry after settle must not replay.
    act(() => ioCallback?.([{ isIntersecting: true }]));
    expect(host).toHaveAttribute('data-proof-arrival', 'settled');
  });

  it('finishes to rest on scroll-away mid-settle and stays consumed', () => {
    const { container } = render(
      <ProofArrival>
        <figure data-testid="proof" />
      </ProofArrival>,
    );
    const host = container.querySelector('[data-proof-arrival]') as HTMLElement;

    act(() => ioCallback?.([{ isIntersecting: true }]));
    expect(host).toHaveAttribute('data-proof-arrival', 'settling');

    act(() => ioCallback?.([{ isIntersecting: false }]));
    expect(host).toHaveAttribute('data-proof-arrival', 'settled');
    expect(window.sessionStorage.getItem(CONSUMED_KEY)).toBe('1');

    // Reentry does not replay.
    act(() => ioCallback?.([{ isIntersecting: true }]));
    expect(host).toHaveAttribute('data-proof-arrival', 'settled');
  });

  it('hash arrival settles immediately and consumes', () => {
    window.history.replaceState(null, '', '/work/flagstone/#the-approach');
    const { container } = render(
      <ProofArrival>
        <figure data-testid="proof" />
      </ProofArrival>,
    );
    const host = container.querySelector('[data-proof-arrival]') as HTMLElement;
    expect(host).toHaveAttribute('data-proof-arrival', 'settled');
    expect(window.sessionStorage.getItem(CONSUMED_KEY)).toBe('1');
  });

  it('Back/Forward and reload arrivals settle immediately', () => {
    mockNavType('back_forward');
    const first = render(
      <ProofArrival>
        <figure />
      </ProofArrival>,
    );
    expect(first.container.querySelector('[data-proof-arrival]')).toHaveAttribute(
      'data-proof-arrival',
      'settled',
    );
    cleanup();

    window.sessionStorage.clear();
    mockNavType('reload');
    const second = render(
      <ProofArrival>
        <figure />
      </ProofArrival>,
    );
    expect(second.container.querySelector('[data-proof-arrival]')).toHaveAttribute(
      'data-proof-arrival',
      'settled',
    );
  });

  it('repeat visit (already consumed in tab) settles without replay', () => {
    window.sessionStorage.setItem(CONSUMED_KEY, '1');
    const { container } = render(
      <ProofArrival>
        <figure />
      </ProofArrival>,
    );
    expect(container.querySelector('[data-proof-arrival]')).toHaveAttribute(
      'data-proof-arrival',
      'settled',
    );
  });

  it('restored scroll (proof already in viewport at arrival) settles', () => {
    mockRectTop(200); // in view at mount
    const { container } = render(
      <ProofArrival>
        <figure />
      </ProofArrival>,
    );
    expect(container.querySelector('[data-proof-arrival]')).toHaveAttribute(
      'data-proof-arrival',
      'settled',
    );
  });

  it('storage unavailable falls back to settled static (never a replay)', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });
    const { container } = render(
      <ProofArrival>
        <figure />
      </ProofArrival>,
    );
    expect(container.querySelector('[data-proof-arrival]')).toHaveAttribute(
      'data-proof-arrival',
      'settled',
    );
  });

  it('navigation-type detection unavailable falls back to settled static', () => {
    mockNavType(undefined); // no PerformanceNavigationTiming entry
    const { container } = render(
      <ProofArrival>
        <figure />
      </ProofArrival>,
    );
    expect(container.querySelector('[data-proof-arrival]')).toHaveAttribute(
      'data-proof-arrival',
      'settled',
    );
  });

  it('reduced motion settles immediately at arrival', () => {
    mockReducedMotion(true);
    const { container } = render(
      <ProofArrival>
        <figure />
      </ProofArrival>,
    );
    expect(container.querySelector('[data-proof-arrival]')).toHaveAttribute(
      'data-proof-arrival',
      'settled',
    );
    expect(window.sessionStorage.getItem(CONSUMED_KEY)).toBe('1');
  });
});
