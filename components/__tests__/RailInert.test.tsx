/**
 * RailInert tests — defects repair R3 (2026-06-12).
 *
 * RailInert toggles the native `inert` attribute on the desktop rail
 * ([data-rail]) while the homepage's pinned desert stage fully obscures it,
 * deriving the pin state from one IntersectionObserver on the content
 * wrapper (the stage's next in-flow sibling). These tests stub IO and
 * assert the contract:
 *   - inert engages when the content is NOT intersecting (stage covers all)
 *   - edge-touch stays guarded until content reaches the top release band
 *   - unmount cleanup disconnects and removes inert (route changes)
 *   - the reduced-motion static frame receives the same focus guard
 *   - no-op when neither homepage intro variant is present
 *   - no crash when IntersectionObserver is unavailable
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';

import { RailInert } from '@/components/RailInert';

type IOEntry = { isIntersecting: boolean; intersectionRatio: number };
type IOCallback = (entries: IOEntry[]) => void;

let ioCallback: IOCallback | null = null;
let observedTargets: Element[] = [];
let disconnectCount = 0;
let ioOptions: IntersectionObserverInit | undefined;

class MockIntersectionObserver {
  constructor(cb: IOCallback, options?: IntersectionObserverInit) {
    ioCallback = cb;
    ioOptions = options;
  }
  observe(el: Element) {
    observedTargets.push(el);
  }
  unobserve() {}
  disconnect() {
    disconnectCount += 1;
  }
}

/** Build the homepage DOM fixtures RailInert queries for. */
function addFixtures({ intro = 'animated' }: { intro?: 'animated' | 'static' | 'none' } = {}) {
  if (intro !== 'none') {
    const stage = document.createElement('section');
    stage.className = intro === 'animated' ? 'cdesert-stage' : 'cdesert-static';
    document.body.appendChild(stage);
  }
  const content = document.createElement('div');
  content.className = 'cinematic-content-reveal';
  document.body.appendChild(content);

  const rail = document.createElement('nav');
  rail.setAttribute('data-rail', '');
  document.body.appendChild(rail);
  return rail;
}

beforeEach(() => {
  ioCallback = null;
  observedTargets = [];
  disconnectCount = 0;
  ioOptions = undefined;
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

describe('RailInert', () => {
  it('engages while content is below the release band and releases on real intersection', () => {
    const rail = addFixtures();
    render(<RailInert />);

    expect(ioCallback).not.toBeNull();
    expect(observedTargets[0]?.className).toBe('cinematic-content-reveal');
    expect(ioOptions?.rootMargin).toBe('100000px 0px -99% 0px');

    // Top of page: stage fully covers the viewport, content off-screen.
    ioCallback!([{ isIntersecting: false, intersectionRatio: 0 }]);
    expect(rail.hasAttribute('inert')).toBe(true);

    // A zero-ratio edge touch is not visible content and stays guarded.
    ioCallback!([{ isIntersecting: true, intersectionRatio: 0 }]);
    expect(rail.hasAttribute('inert')).toBe(true);

    // The content reaches the top release band and the intro has cleared.
    ioCallback!([{ isIntersecting: true, intersectionRatio: 0.001 }]);
    expect(rail.hasAttribute('inert')).toBe(false);

    // Scrolled back up: re-engage (the stage covers the chrome again).
    ioCallback!([{ isIntersecting: false, intersectionRatio: 0 }]);
    expect(rail.hasAttribute('inert')).toBe(true);
  });

  it('disconnects and removes inert on unmount (client navigation away)', () => {
    const rail = addFixtures();
    const { unmount } = render(<RailInert />);

    ioCallback!([{ isIntersecting: false, intersectionRatio: 0 }]);
    expect(rail.hasAttribute('inert')).toBe(true);

    unmount();
    expect(disconnectCount).toBe(1);
    expect(rail.hasAttribute('inert')).toBe(false);
  });

  it('guards the rail while the reduced-motion static frame obscures it', () => {
    const rail = addFixtures({ intro: 'static' });
    render(<RailInert />);

    expect(ioCallback).not.toBeNull();
    ioCallback!([{ isIntersecting: false, intersectionRatio: 0 }]);
    expect(rail.hasAttribute('inert')).toBe(true);

    ioCallback!([{ isIntersecting: true, intersectionRatio: 0 }]);
    expect(rail.hasAttribute('inert')).toBe(true);

    ioCallback!([{ isIntersecting: true, intersectionRatio: 0.001 }]);
    expect(rail.hasAttribute('inert')).toBe(false);
  });

  it('no-ops away from the homepage when neither intro variant is present', () => {
    const rail = addFixtures({ intro: 'none' });
    render(<RailInert />);

    expect(ioCallback).toBeNull();
    expect(observedTargets).toHaveLength(0);
    expect(rail.hasAttribute('inert')).toBe(false);
  });

  it('does not crash when IntersectionObserver is unavailable', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    const rail = addFixtures();
    expect(() => render(<RailInert />)).not.toThrow();
    expect(rail.hasAttribute('inert')).toBe(false);
  });
});
