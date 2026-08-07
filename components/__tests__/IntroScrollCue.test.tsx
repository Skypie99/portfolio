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
let ioOptions: IntersectionObserverInit | undefined;
let observedTargets: Element[] = [];
let disconnectCount = 0;

class MockIntersectionObserver {
  constructor(cb: IOCallback, opts?: IntersectionObserverInit) {
    ioCallback = cb;
    ioOptions = opts;
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
  ioOptions = undefined;
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

describe('IntroScrollCue — U2 retirement geometry (RM-gated early margin)', () => {
  // jsdom has no matchMedia by default: the conservative fork IS the jsdom
  // fork, so this pin is simultaneously the old-webview guard and the C-20
  // byte-parity check for environments without motion signals.
  it('keeps the byte-original geometry when matchMedia is unavailable', () => {
    addContentWrapper();
    render(<IntroScrollCue />);
    expect(ioOptions?.rootMargin).toBe('100000px 0px 0px 0px');
    expect(ioOptions?.threshold).toEqual([0, 0.001, 0.01, 0.05]);
  });

  it('fires a viewport early for motion users (no-preference)', () => {
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: q === '(prefers-reduced-motion: no-preference)',
      media: q,
    }));
    addContentWrapper();
    const { container } = render(<IntroScrollCue />);
    expect(ioOptions?.rootMargin).toBe('100000px 0px 100% 0px');
    expect(ioOptions?.threshold).toEqual([0, 0.001, 0.01, 0.05]);

    // The callback semantics are byte-identical under the expanded root:
    // real-ratio retires, off-screen returns.
    const cue = container.querySelector('.intro-scroll-cue')!;
    ioCallback!([{ isIntersecting: true, intersectionRatio: 0.5 }]);
    expect(cue.hasAttribute('data-cue-done')).toBe(true);
    ioCallback!([{ isIntersecting: false, intersectionRatio: 0 }]);
    expect(cue.hasAttribute('data-cue-done')).toBe(false);
  });

  it('keeps the byte-original geometry under reduced motion (the C-21 mount guard)', () => {
    vi.stubGlobal('matchMedia', (q: string) => ({ matches: false, media: q }));
    addContentWrapper();
    const { container } = render(<IntroScrollCue />);
    // RM keeps 0-margin: at the RM static frame's 0px edge-touch mount, any
    // positive bottom margin would report ratio > 0 and retire the cue before
    // the RM visitor ever sees it.
    expect(ioOptions?.rootMargin).toBe('100000px 0px 0px 0px');
    const cue = container.querySelector('.intro-scroll-cue')!;
    ioCallback!([{ isIntersecting: true, intersectionRatio: 0 }]);
    expect(cue.hasAttribute('data-cue-done')).toBe(false);
  });
  /**
   * C-22 REGRESSION GUARD — the reduced-motion defect this ladder exists to fix.
   *
   * With a lone `0` threshold the observer fires only on the 0-crossing. Under RM
   * the content wrapper mounts ALREADY intersecting at ratio 0 (measured: its top
   * is exactly viewport-bottom), so the crossing is spent before the visitor
   * scrolls and the growing ratio crosses nothing — the callback never runs again
   * and the `ratio > 0` gate is never re-asked. Live result was 0 of 246 samples
   * retiring under reduce vs 220 of 246 under no-preference: a permanent scrim over
   * the footer for exactly the readers who asked for less motion.
   *
   * This asserts the PROPERTY rather than the literal, so it still bites if the
   * stops are retuned: there must be a stop above 0 and low enough to actually be
   * reached. The ratio is relative to the TARGET's height — 9,567px against a 900px
   * viewport — so the achievable maximum is ~0.099 and any lone stop at 0.1 or
   * above would never fire.
   */
  it('offers a reachable threshold above 0, or the RM gate is unreachable (C-22)', () => {
    vi.stubGlobal('matchMedia', (q: string) => ({ matches: false, media: q }));
    addContentWrapper();
    render(<IntroScrollCue />);
    const t = ioOptions?.threshold;
    expect(Array.isArray(t), 'a single threshold cannot re-fire as the ratio grows').toBe(true);
    const stops = t as number[];
    expect(stops).toContain(0);
    const reachable = stops.filter((v) => v > 0 && v <= 0.09);
    expect(
      reachable.length,
      `needs a stop in (0, 0.09] — the target tops out near 0.099, so ${JSON.stringify(stops)} would never re-fire`,
    ).toBeGreaterThan(0);
  });
});
