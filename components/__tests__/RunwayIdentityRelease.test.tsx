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

type IOEntry = {
  isIntersecting: boolean;
  intersectionRatio: number;
  boundingClientRect?: Pick<DOMRect, 'top'>;
};
type IOCallback = (entries: IOEntry[]) => void;

let ioCallback: IOCallback | null = null;
let ioCallbacks: IOCallback[] = [];
let observedTargets: Element[] = [];
let disconnectCount = 0;

class MockIntersectionObserver {
  constructor(cb: IOCallback) {
    ioCallback = cb;
    ioCallbacks.push(cb);
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

/** Page fixtures expose the chip and heading geometry that page-mode derives
 * its retirement boundary from. */
function addPageFixtures() {
  let headingTop = 129;
  const main = document.createElement('main');
  const heading = document.createElement('h1');
  heading.textContent = 'Readable route heading';
  heading.getBoundingClientRect = () =>
    ({ top: headingTop, bottom: headingTop + 48, height: 48 } as DOMRect);
  main.appendChild(heading);
  document.body.appendChild(main);

  const mark = document.createElement('div');
  mark.setAttribute('data-runway-identity', '');
  mark.getBoundingClientRect = () => ({ top: 14, bottom: 62, height: 48 } as DOMRect);
  document.body.appendChild(mark);

  return {
    mark,
    setHeadingTop(top: number) {
      headingTop = top;
    },
  };
}

beforeEach(() => {
  ioCallback = null;
  ioCallbacks = [];
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

  it('retires a page chip before its heading reaches the chip, then restores only after a full-chip buffer', () => {
    const { mark, setHeadingTop } = addPageFixtures();
    render(<RunwayIdentityRelease variant="page" />);

    // Chip bottom 62 + 18px safety buffer = 80px retirement line. The return
    // boundary adds the chip's 48px height, so it is 128px: no threshold flicker.
    expect(ioCallbacks).toHaveLength(2);
    expect(mark.hasAttribute('data-runway-done')).toBe(false);

    setHeadingTop(79);
    ioCallbacks[0]!([{ isIntersecting: false, intersectionRatio: 0, boundingClientRect: { top: 79 } }]);
    expect(mark.hasAttribute('data-runway-done')).toBe(true);

    setHeadingTop(90);
    ioCallbacks[1]!([{ isIntersecting: false, intersectionRatio: 0, boundingClientRect: { top: 90 } }]);
    expect(mark.hasAttribute('data-runway-done')).toBe(true);

    setHeadingTop(128);
    ioCallbacks[1]!([{ isIntersecting: true, intersectionRatio: 1, boundingClientRect: { top: 128 } }]);
    expect(mark.hasAttribute('data-runway-done')).toBe(false);
  });
});
