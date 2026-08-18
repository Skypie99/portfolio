import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ThemedShowcase } from '@/components/ThemedShowcase';

/**
 * ThemedShowcase law (showcase/theme-sync):
 *  - BOTH layers are full SSR markup (correct first paint in every path);
 *  - the swap is pure CSS display-gating (html.dark) — NO transition classes,
 *    ever (the site's view-transition dissolve supplies the crossfade; RM
 *    inherits the 0.01ms guard) — reduced-motion safety BY CONSTRUCTION;
 *  - both imgs are lazy (the hidden twin has no box → never fetched);
 *  - toggle INTENT arms the in-viewport twin: loading flips to eager at low
 *    fetchpriority, and data-twin="ready" lands after load;
 *  - matte mode renders ONE layer inside the token-built exhibit mat.
 */

type IOCallback = (entries: Array<{ isIntersecting: boolean }>) => void;
const observers: { cb: IOCallback; observed: Element[] }[] = [];

class MockIO {
  cb: IOCallback;
  observed: Element[] = [];
  constructor(cb: IOCallback) {
    this.cb = cb;
    observers.push(this);
  }
  observe(el: Element) {
    this.observed.push(el);
  }
  disconnect() {}
  unobserve() {}
}

const themed = {
  light: {
    src: '/showcase/flagstone/map.light.phone.webp',
    avif: '/showcase/flagstone/map.light.phone.avif',
    webp: '/showcase/flagstone/map.light.phone.webp',
    lqip: 'data:image/webp;base64,LIGHT',
  },
  dark: {
    src: '/showcase/flagstone/map.dark.phone.webp',
    avif: '/showcase/flagstone/map.dark.phone.avif',
    webp: '/showcase/flagstone/map.dark.phone.webp',
    lqip: 'data:image/webp;base64,DARK',
  },
  alt: 'The Flagstone barrier map, severity pins over street tiles',
};

describe('ThemedShowcase', () => {
  beforeEach(() => {
    observers.length = 0;
    vi.stubGlobal('IntersectionObserver', MockIO as unknown as typeof IntersectionObserver);
    vi.stubGlobal('requestIdleCallback', undefined as unknown as typeof requestIdleCallback);
    document.documentElement.classList.remove('dark');
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('SSRs BOTH layers with gating classes, shared alt, lazy imgs, per-layer LQIP', () => {
    const { container } = render(<ThemedShowcase {...themed} fit="cover" />);
    const light = container.querySelector('.ts-layer--light');
    const dark = container.querySelector('.ts-layer--dark');
    expect(light).toBeTruthy();
    expect(dark).toBeTruthy();
    const imgs = container.querySelectorAll('img');
    expect(imgs).toHaveLength(2);
    for (const img of imgs) {
      expect(img.getAttribute('loading')).toBe('lazy');
      expect(img.getAttribute('alt')).toBe(themed.alt);
    }
    expect(light?.innerHTML).toContain('LIGHT');
    expect(dark?.innerHTML).toContain('DARK');
    expect(container.querySelector('source[type="image/avif"]')).toBeTruthy();
  });

  it('carries no transition/animation classes on the layers (RM by construction)', () => {
    const { container } = render(<ThemedShowcase {...themed} fit="cover" />);
    for (const layer of Array.from(container.querySelectorAll('.ts-layer'))) {
      expect(layer.className).not.toMatch(/transition|animate|duration|ease/);
    }
  });

  it('arms the inactive twin on ts:theme-intent while intersecting', () => {
    const { container } = render(<ThemedShowcase {...themed} fit="cover" />);
    const host = container.querySelector('[data-themed-showcase="themed"]') as HTMLElement;
    const darkImg = container.querySelector('.ts-layer--dark img') as HTMLImageElement;
    expect(darkImg.getAttribute('loading')).toBe('lazy');

    // Enter the viewport, then signal intent (site theme is light → twin = dark).
    observers[0].cb([{ isIntersecting: true }]);
    window.dispatchEvent(new Event('ts:theme-intent'));

    expect(darkImg.getAttribute('loading')).toBe('eager');
    expect(darkImg.getAttribute('fetchpriority')).toBe('low');
    darkImg.dispatchEvent(new Event('load'));
    expect(host.dataset.twin).toBe('ready');
  });

  it('does NOT arm on intent while off-screen (off-screen showcases swap plainly)', () => {
    const { container } = render(<ThemedShowcase {...themed} fit="cover" />);
    const darkImg = container.querySelector('.ts-layer--dark img') as HTMLImageElement;
    window.dispatchEvent(new Event('ts:theme-intent'));
    expect(darkImg.getAttribute('loading')).toBe('lazy');
  });

  it('arms the LIGHT twin when the site is dark', () => {
    document.documentElement.classList.add('dark');
    const { container } = render(<ThemedShowcase {...themed} fit="cover" />);
    const lightImg = container.querySelector('.ts-layer--light img') as HTMLImageElement;
    observers[0].cb([{ isIntersecting: true }]);
    window.dispatchEvent(new Event('ts:theme-intent'));
    expect(lightImg.getAttribute('loading')).toBe('eager');
    document.documentElement.classList.remove('dark');
  });

  it('matte mode renders ONE layer inside the exhibit mat', () => {
    const { container } = render(
      <ThemedShowcase light={themed.light} matte="dark-mono" alt={themed.alt} fit="cover" />,
    );
    expect(container.querySelector('.ts-matte')).toBeTruthy();
    expect(container.querySelector('.ts-matte-well')).toBeTruthy();
    expect(container.querySelectorAll('img')).toHaveLength(1);
    expect((container.querySelector('[data-themed-showcase]') as HTMLElement).dataset.matte).toBe('dark-mono');
  });

  it('single-variant passthrough renders one layer and installs no observer', () => {
    const { container } = render(<ThemedShowcase light={themed.light} alt={themed.alt} fit="contain" />);
    expect(container.querySelectorAll('img')).toHaveLength(1);
    expect(observers).toHaveLength(0);
  });
});
