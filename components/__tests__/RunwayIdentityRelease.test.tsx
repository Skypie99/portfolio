/**
 * RunwayIdentityRelease tests — R2-P0 C-20/C-21 (2026-07-13).
 *
 * RunwayIdentityRelease toggles `data-runway-done` on the RunwayIdentity mark,
 * deriving "runway over" from one IntersectionObserver on the content wrapper
 * (`.cinematic-content-reveal`). These tests stub IO and assert the contract,
 * including the two R2-P0 guards:
 *   - done engages when the content intersects with a real ratio (runway ended)
 *   - done does NOT engage on the exact 0px edge-touch (ratio 0) — the RM static
 *     frame keeps its arrival chip on mount (C-21)
 *   - done releases (chip returns) while the content is genuinely off-screen
 *   - unmount cleanup disconnects and removes the attribute (route changes)
 *   - no-op when the mark is absent; no crash when IO is unavailable
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';

import { RunwayIdentityRelease } from '@/components/RunwayIdentityRelease';

type IOEntry = { isIntersecting: boolean; intersectionRatio: number };
type IOCallback = (entries: IOEntry[]) => void;

let ioCallback: IOCallback | null = null;
let observedTargets: Element[] = [];
let disconnectCount = 0;

class MockIntersectionObserver {
  constructor(cb: IOCallback) {
    ioCallback = cb;
  }
  observe(el: Element) {
    observedTargets.push(el);
  }
  unobserve() {}
  disconnect() {
    disconnectCount += 1;
  }
}

/** Build the homepage DOM fixtures RunwayIdentityRelease queries for. */
function addFixtures({ withMark = true } = {}) {
  const content = document.createElement('div');
  content.className = 'cinematic-content-reveal';
  document.body.appendChild(content);

  let mark: HTMLElement | null = null;
  if (withMark) {
    mark = document.createElement('div');
    mark.setAttribute('data-runway-identity', '');
    document.body.appendChild(mark);
  }
  return mark;
}

beforeEach(() => {
  ioCallback = null;
  observedTargets = [];
  disconnectCount = 0;
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

describe('RunwayIdentityRelease', () => {
  it('retires the mark when content intersects with a real ratio, and restores it off-screen', () => {
    const mark = addFixtures()!;
    render(<RunwayIdentityRelease />);

    expect(ioCallback).not.toBeNull();
    expect(observedTargets[0]?.className).toBe('cinematic-content-reveal');

    // Runway over: content in view with a real intersection ratio — retire.
    ioCallback!([{ isIntersecting: true, intersectionRatio: 0.5 }]);
    expect(mark.hasAttribute('data-runway-done')).toBe(true);

    // Genuinely off-screen (top of the runway): the arrival chip returns.
    ioCallback!([{ isIntersecting: false, intersectionRatio: 0 }]);
    expect(mark.hasAttribute('data-runway-done')).toBe(false);
  });

  it('keeps the arrival chip on the exact 0px edge-touch (reduced-motion static frame, C-21)', () => {
    const mark = addFixtures()!;
    render(<RunwayIdentityRelease />);

    // The RM static frame reports isIntersecting=true at ratio 0 on mount — the
    // strict-intersection gate must NOT retire the mark here.
    ioCallback!([{ isIntersecting: true, intersectionRatio: 0 }]);
    expect(mark.hasAttribute('data-runway-done')).toBe(false);
  });

  it('disconnects and removes the attribute on unmount (client navigation away)', () => {
    const mark = addFixtures()!;
    const { unmount } = render(<RunwayIdentityRelease />);

    ioCallback!([{ isIntersecting: true, intersectionRatio: 1 }]);
    expect(mark.hasAttribute('data-runway-done')).toBe(true);

    unmount();
    expect(disconnectCount).toBe(1);
    expect(mark.hasAttribute('data-runway-done')).toBe(false);
  });

  it('no-ops when the mark is absent', () => {
    addFixtures({ withMark: false });
    render(<RunwayIdentityRelease />);

    expect(ioCallback).toBeNull();
    expect(observedTargets).toHaveLength(0);
  });

  it('does not crash when IntersectionObserver is unavailable', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    addFixtures();
    expect(() => render(<RunwayIdentityRelease />)).not.toThrow();
  });
});
