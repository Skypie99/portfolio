/**
 * CinematicDesert — ScrollTrigger never moves the pin (desktop hotfix, 2026-10-19).
 *
 * Release 2's opening light-up is a CSS animation on `.cdesert-frame`, INSIDE
 * the ScrollTrigger pin. ScrollTrigger's default pin-spacer is created by
 * MOVING the pin into a new div, and every global refresh (creation, window
 * `load`, `resize`, the `scrollEnd` after a mid-scroll load) moves it out and
 * back in. Browsers cancel and restart the CSS animations of a moved subtree,
 * so each move blinked the lit scene back to the dawn wash and re-ran the 4.5%
 * settle — live, on cold desktop loads and mid-scroll. The component now
 * server-renders its own spacer as the pin's parent and hands it to
 * ScrollTrigger (`pinSpacer`), which then only styles it. These tests pin it:
 *   - the server HTML already wraps the pin in that spacer;
 *   - hydration wires ScrollTrigger to THAT element;
 *   - neither hydration nor a global ScrollTrigger.refresh() removes or
 *     re-inserts the pin.
 *
 * Outside the protected cinematic suite on purpose, like the first-paint test;
 * owns GSAP timers the same way, because the no-preference case really does
 * wire the ScrollTrigger at hydration.
 */
import { act } from 'react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

// Own timers before GSAP module evaluation, for this file only.
await vi.hoisted(async () => {
  const { ownGsapTimers } = await import('../../test-utils/gsap-teardown');
  ownGsapTimers();
});

import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { CinematicDesert } from '@/components/cinematic/CinematicDesert';

/** matchMedia stub: no motion preference, every other query (max-width) false. */
function mockNoPreference() {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

// jsdom has no layout: every element reports offsetParent null and a 0×0 box,
// and for exactly such (unrendered) elements GSAP's CSSPlugin re-parents the
// element to <html> and back to read its transform. A laid-out pin never takes
// that path in a browser, so give elements the offsetParent a rendered element
// has; any move left is ScrollTrigger's own.
const offsetParent = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetParent');

beforeAll(() => {
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
    configurable: true,
    get(this: HTMLElement) {
      return this.parentElement;
    },
  });
});

afterAll(() => {
  if (offsetParent) Object.defineProperty(HTMLElement.prototype, 'offsetParent', offsetParent);
});

let root: Root | null = null;
let host: HTMLDivElement | null = null;

afterEach(() => {
  act(() => root?.unmount());
  root = null;
  host?.remove();
  host = null;
  vi.restoreAllMocks();
});

/** Server HTML, with only the known jsdom useLayoutEffect warning tolerated. */
function ssr(): string {
  const errors: string[] = [];
  const spy = vi.spyOn(console, 'error').mockImplementation((...args) => {
    errors.push(String(args[0]));
  });
  const html = renderToString(<CinematicDesert />);
  spy.mockRestore();
  expect(errors.filter((e) => !e.includes('useLayoutEffect does nothing on the server'))).toEqual([]);
  return html;
}

describe('CinematicDesert — the pin keeps its place in the DOM', () => {
  it('server-renders the pin inside its own spacer, directly under the stage', () => {
    mockNoPreference();
    host = document.createElement('div');
    host.innerHTML = ssr();

    const pin = host.querySelector('.cdesert-pin');
    const spacer = pin?.parentElement;
    expect(spacer?.classList.contains('cdesert-pin-spacer')).toBe(true);
    expect(spacer?.parentElement?.classList.contains('cdesert-stage')).toBe(true);
  });

  it('hands that spacer to ScrollTrigger and never moves the pin, through hydration and a refresh', () => {
    mockNoPreference();
    host = document.createElement('div');
    host.innerHTML = ssr();
    document.body.appendChild(host);

    const pin = host.querySelector('.cdesert-pin')!;
    const spacer = pin.parentElement!;
    // Any childList record that removes or adds the pin (or a subtree holding
    // it) is a move — the thing that restarts .cdesert-frame's CSS animation.
    const observer = new MutationObserver(() => {});
    observer.observe(host, { childList: true, subtree: true });
    const pinMoves = () =>
      observer
        .takeRecords()
        .flatMap((r) => [...r.addedNodes, ...r.removedNodes])
        .filter((n) => n === pin || (n instanceof Element && n.contains(pin))).length;

    const consoleErrors: unknown[][] = [];
    vi.spyOn(console, 'error').mockImplementation((...args) => {
      consoleErrors.push(args);
    });
    act(() => {
      root = hydrateRoot(host!, <CinematicDesert />);
    });

    expect(ScrollTrigger.getAll().find((t) => t.pin === pin)).toBeDefined();
    // ScrollTrigger tags the element it adopted as the spacer: it must be the
    // server-rendered parent, and there must be no second, generated one.
    expect(spacer.classList.contains('pin-spacer')).toBe(true);
    expect(host.querySelectorAll('.pin-spacer')).toHaveLength(1);
    expect(pinMoves()).toBe(0);

    // the window `load` / `resize` path: revert every trigger, then re-pin
    act(() => {
      ScrollTrigger.refresh();
    });
    expect(pinMoves()).toBe(0);
    expect(pin.parentElement).toBe(spacer);
    expect(consoleErrors).toEqual([]);
    observer.disconnect();
  });
});
