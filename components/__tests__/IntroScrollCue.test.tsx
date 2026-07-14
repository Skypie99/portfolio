/**
 * IntroScrollCue tests — T6 / W2-01.
 *
 * The whisper scroll-continuation cue is decorative orientation, not a link,
 * and it retires (fades out) when the post-intro content arrives — via one
 * IntersectionObserver on `.cinematic-content-reveal`, the same geometry
 * RailInert / RunwayIdentityRelease trust. These stub IO and assert:
 *   - it drops the Hero cue's NAV semantics (aria-hidden; no <a>/href/aria-label/
 *     tabindex) so the sr-only skip-link stays the sole keyboard truth, and it
 *     carries the RM fade hook class,
 *   - it retires when content intersects with a real ratio; stays present on the
 *     ratio-0 edge-touch (the RM static frame, mirrors C-21); returns off-screen,
 *   - it disconnects on unmount; no crash when IO is unavailable.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';

import { IntroScrollCue } from '@/components/IntroScrollCue';

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

/** The post-intro content wrapper the cue observes for its retirement. */
function addContentWrapper() {
  const content = document.createElement('div');
  content.className = 'cinematic-content-reveal';
  document.body.appendChild(content);
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

describe('IntroScrollCue — decorative, does not compete with the skip-link', () => {
  it('is aria-hidden and introduces no tab stop (no <a>/href/aria-label/tabindex)', () => {
    addContentWrapper();
    const { container } = render(<IntroScrollCue />);
    const cue = container.querySelector('.intro-scroll-cue');
    expect(cue).toBeTruthy();
    expect(cue).toHaveAttribute('aria-hidden', 'true');
    // the Hero cue is an <a href aria-label>; this one drops all nav semantics.
    expect(container.querySelector('a')).toBeNull();
    expect(container.querySelector('[href]')).toBeNull();
    expect(container.querySelector('[aria-label]')).toBeNull();
    expect(container.querySelector('[tabindex]')).toBeNull();
  });

  it('reuses the Hero cue text and carries the RM fade hook class', () => {
    addContentWrapper();
    const { container } = render(<IntroScrollCue />);
    expect(container.textContent).toContain('Scroll');
    expect(container.querySelector('.intro-scroll-cue-glyph')).toBeTruthy();
  });
});

describe('IntroScrollCue — retirement contract', () => {
  it('retires when content intersects with a real ratio, and returns off-screen', () => {
    addContentWrapper();
    const { container } = render(<IntroScrollCue />);
    const cue = container.querySelector('.intro-scroll-cue')!;

    expect(ioCallback).not.toBeNull();
    expect(observedTargets[0]?.className).toBe('cinematic-content-reveal');

    // Content in view with a real ratio: the runway is over — retire.
    ioCallback!([{ isIntersecting: true, intersectionRatio: 0.5 }]);
    expect(cue.hasAttribute('data-cue-done')).toBe(true);

    // Genuinely off-screen (still in the intro): the cue returns.
    ioCallback!([{ isIntersecting: false, intersectionRatio: 0 }]);
    expect(cue.hasAttribute('data-cue-done')).toBe(false);
  });

  it('stays present on the exact 0px edge-touch (reduced-motion static frame)', () => {
    addContentWrapper();
    const { container } = render(<IntroScrollCue />);
    const cue = container.querySelector('.intro-scroll-cue')!;

    // The RM static frame reports isIntersecting=true at ratio 0 on mount — the
    // strict-intersection gate must NOT retire the cue before it is ever seen.
    ioCallback!([{ isIntersecting: true, intersectionRatio: 0 }]);
    expect(cue.hasAttribute('data-cue-done')).toBe(false);
  });

  it('disconnects the observer on unmount (client navigation away)', () => {
    addContentWrapper();
    const { unmount } = render(<IntroScrollCue />);

    ioCallback!([{ isIntersecting: true, intersectionRatio: 1 }]);
    unmount();
    expect(disconnectCount).toBe(1);
  });

  it('does not crash when IntersectionObserver is unavailable', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    addContentWrapper();
    expect(() => render(<IntroScrollCue />)).not.toThrow();
  });
});
