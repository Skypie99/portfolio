/**
 * CinematicDesert — reduced-motion render test.
 *
 * jsdom can't run GSAP/ScrollTrigger (no layout, no rAF-driven scroll), and we
 * don't want it to: the engine's contract is that when the user prefers reduced
 * motion (or is on a narrow viewport) it renders the STATIC arrival frame and
 * never mounts the pinned scene. So we mock matchMedia to report
 * prefers-reduced-motion: reduce and assert the static frame renders cleanly and
 * actually references a plate image. Kept intentionally light.
 */
import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { CinematicDesert } from '../CinematicDesert';
import { ARRIVAL_ID } from '../plates';

// gsap/ScrollTrigger is imported by the component under test and registers
// global load/resize listeners that call window.scrollTo on import — jsdom has
// no scroll, so it logs "Not implemented" noise. Stub it once; the
// reduced-motion path never actually scrolls anything.
beforeAll(() => {
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
});

/** matchMedia stub: reduced-motion = true, everything else (e.g. max-width) = false. */
function mockMatchMedia(reducedMotion: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('prefers-reduced-motion') ? reducedMotion : false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

describe('CinematicDesert (reduced motion)', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders the static arrival frame without throwing when reduced motion is preferred', () => {
    mockMatchMedia(true);
    expect(() => render(<CinematicDesert />)).not.toThrow();
  });

  it('static frame references a plate image source', () => {
    mockMatchMedia(true);
    const { container } = render(<CinematicDesert />);

    // The static frame paints the depth-plane <img> layers with data-plate ids.
    const plates = container.querySelectorAll('img[data-plate]');
    expect(plates.length).toBeGreaterThan(0);

    // Scene-agnostic: the arrival plane (whatever the active scene declares) is
    // present and its src points at the cinematic image dir. This survives a
    // scene swap (placeholder rig ↔ separated vista) without editing the test.
    const arrival = container.querySelector(`img[data-plate="${ARRIVAL_ID}"]`);
    expect(arrival).not.toBeNull();
    expect(arrival?.getAttribute('src')).toContain('/images/cinematic/');

    // The resolved wordmark is present in the static frame.
    expect(container.querySelector('.cdesert-title-mark')?.textContent).toBe('SkyPi Studio');
  });
});
