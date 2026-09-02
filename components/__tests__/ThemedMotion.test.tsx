import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ThemedMotion } from '@/components/ThemedMotion';

/**
 * ThemedMotion law: poster-first + preload none; autoplay only in-viewport and
 * never under reduced motion; SSR keeps native controls (no-JS play path) and
 * hydration swaps them for the visible 44px overlay affordance; user pause is
 * sticky; the html.class flip pauses the hidden twin and resumes the visible
 * one (loop continuity across the theme dissolve).
 */

type IOCallback = (entries: Array<{ isIntersecting: boolean }>) => void;
const observers: { cb: IOCallback }[] = [];
class MockIO {
  cb: IOCallback;
  constructor(cb: IOCallback) {
    this.cb = cb;
    observers.push(this);
  }
  observe() {}
  disconnect() {}
  unobserve() {}
}

const mm = (reduce: boolean) =>
  vi.fn().mockImplementation((q: string) => ({
    matches: reduce && q.includes('prefers-reduced-motion'),
    media: q,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  }));

const clip = {
  light: { mp4: '/showcase/flagstone/clips/drawer.light.phone.mp4', poster: '/showcase/flagstone/clips/drawer.light.phone-poster.avif' },
  dark: { mp4: '/showcase/flagstone/clips/drawer.dark.phone.mp4', poster: '/showcase/flagstone/clips/drawer.dark.phone-poster.avif' },
  alt: 'The navigation drawer springing open over the home screen',
};

let playSpy: ReturnType<typeof vi.fn>;
let pauseSpy: ReturnType<typeof vi.fn>;

describe('ThemedMotion', () => {
  beforeEach(() => {
    observers.length = 0;
    vi.stubGlobal('IntersectionObserver', MockIO as unknown as typeof IntersectionObserver);
    playSpy = vi.fn().mockResolvedValue(undefined);
    pauseSpy = vi.fn();
    Object.defineProperty(HTMLMediaElement.prototype, 'play', { configurable: true, value: playSpy });
    Object.defineProperty(HTMLMediaElement.prototype, 'pause', { configurable: true, value: pauseSpy });
    window.matchMedia = mm(false) as unknown as typeof window.matchMedia;
    document.documentElement.classList.remove('dark');
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('SSR markup keeps native controls (no-JS play path) and both themed layers', () => {
    const html = renderToStaticMarkup(<ThemedMotion {...clip} fit="cover" />);
    expect(html).toContain('controls');
    expect(html).toContain('ts-layer--light');
    expect(html).toContain('ts-layer--dark');
    expect(html).toContain('preload="none"');
  });

  it('hydration swaps controls for the visible 44px overlay affordance', () => {
    const { container, getByRole } = render(<ThemedMotion {...clip} fit="cover" />);
    for (const v of Array.from(container.querySelectorAll('video'))) {
      expect(v.hasAttribute('controls')).toBe(false);
      expect(v.muted).toBe(true);
      expect(v.getAttribute('playsinline')).not.toBeNull();
      expect(v.getAttribute('aria-label')).toBe(clip.alt);
    }
    const btn = getByRole('button', { name: `Play animation: ${clip.alt}` });
    expect(btn.className).toContain('h-11');
    expect(btn.className).toContain('w-11');
  });

  // The component re-observes when the RM hook syncs (effect deps) — the LIVE
  // observer is always the most recent one.
  const enter = () => act(() => observers.at(-1)!.cb([{ isIntersecting: true }]));
  const exit = () => act(() => observers.at(-1)!.cb([{ isIntersecting: false }]));

  it('autoplays on viewport entry, pauses on exit', () => {
    const { container } = render(<ThemedMotion {...clip} fit="cover" />);
    enter();
    expect(playSpy).toHaveBeenCalled();
    expect((container.querySelector('[data-themed-motion]') as HTMLElement).dataset.motion).toBe('playing');
    exit();
    expect(pauseSpy).toHaveBeenCalled();
  });

  it('NEVER autoplays under reduced motion: the poster stands, deliberate play remains', () => {
    window.matchMedia = mm(true) as unknown as typeof window.matchMedia;
    const { getByRole } = render(<ThemedMotion {...clip} fit="cover" />);
    enter();
    expect(playSpy).not.toHaveBeenCalled();
    fireEvent.click(getByRole('button', { name: `Play animation: ${clip.alt}` }));
    expect(playSpy).toHaveBeenCalledTimes(1);
  });

  it('a user pause is sticky against viewport re-entry', () => {
    const { getByRole } = render(<ThemedMotion {...clip} fit="cover" />);
    enter();
    fireEvent.click(getByRole('button', { name: `Pause animation: ${clip.alt}` }));
    playSpy.mockClear();
    exit();
    enter();
    expect(playSpy).not.toHaveBeenCalled();
  });

  it('the html.class flip pauses the hidden twin and resumes the visible one', async () => {
    render(<ThemedMotion {...clip} fit="cover" />);
    enter();
    playSpy.mockClear();
    pauseSpy.mockClear();
    act(() => {
      document.documentElement.classList.add('dark');
    });
    await waitFor(() => expect(pauseSpy).toHaveBeenCalled());
    expect(playSpy).toHaveBeenCalled();
    document.documentElement.classList.remove('dark');
  });

  it('matte mode renders one video inside the exhibit mat', () => {
    const { container } = render(
      <ThemedMotion light={clip.light} matte="dark-mono" alt={clip.alt} fit="cover" />,
    );
    expect(container.querySelector('.ts-matte-well')).toBeTruthy();
    expect(container.querySelectorAll('video')).toHaveLength(1);
  });

  it('matte mode\'s video stays visible in dark theme (Cook Out P2 · Part C regression)', () => {
    // A DOM test proving the node merely exists is insufficient — that is
    // exactly how the reproduced defect escaped (a real qa-reports receipt).
    // The matte video is tagged `.ts-layer--light` (the single-source, no-twin
    // convention) — assert the SCOPED override this fix adds in globals.css
    // (`html.dark .ts-matte .ts-layer--light { display: block; }`) actually
    // targets this exact class combination, not merely that a video exists.
    act(() => {
      document.documentElement.classList.add('dark');
    });
    try {
      const { container } = render(
        <ThemedMotion light={clip.light} matte="dark-mono" alt={clip.alt} fit="cover" />,
      );
      const matte = container.querySelector('.ts-matte');
      const layer = matte?.querySelector('.ts-layer--light');
      expect(layer, 'matte video must carry .ts-layer--light for the scoped CSS override to reach it').toBeTruthy();
      expect(matte?.querySelector('.ts-layer--dark')).toBeNull(); // matte never renders a dark twin
      expect(layer?.querySelector('video')).toBeTruthy();
    } finally {
      document.documentElement.classList.remove('dark');
    }
  });
});
