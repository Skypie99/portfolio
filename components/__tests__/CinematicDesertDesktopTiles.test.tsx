/**
 * CinematicDesert — desktop tile-memory hotfix (2026-10-19).
 *
 * On large DPR-2 desktop windows Chrome re-rasterises the zooming plates every
 * frame and runs out of its tile budget; the missing tiles were the owner's
 * "partial scene" dropouts. Two changes give that budget back, both desktop
 * only, both invisible:
 *   - the opening light-up retains nothing once it ends (fill `backwards`), so
 *     Chrome stops compositing .cdesert-frame as an active animation;
 *   - while the pinned film covers the viewport, the fixed world backdrop under
 *     it is parked (html.cdesert-world-parked → visibility: hidden).
 * These tests pin the class lifecycle (set on desktop at hydration, removed on
 * unmount, never on phones) and that both CSS rules exist only for desktop, so
 * phones keep the deployed behaviour byte for byte.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { act } from 'react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

// Own timers before GSAP module evaluation, for this file only.
await vi.hoisted(async () => {
  const { ownGsapTimers } = await import('../../test-utils/gsap-teardown');
  ownGsapTimers();
});

import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { CinematicDesert } from '@/components/cinematic/CinematicDesert';

const PARKED = 'cdesert-world-parked';

/** matchMedia stub: no motion preference; `phone` decides the max-width query. */
function mockMatchMedia(phone: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('max-width') ? phone : false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

beforeAll(() => {
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
});

let root: Root | null = null;
let host: HTMLDivElement | null = null;

afterEach(() => {
  act(() => root?.unmount());
  root = null;
  host?.remove();
  host = null;
  document.documentElement.classList.remove(PARKED);
  vi.restoreAllMocks();
});

/**
 * jsdom has no layout, so the stage would measure 0×0 and ScrollTrigger would
 * place the film's start and end on the same pixel (progress reads as "past
 * the film"). Give the stage the box it has in a browser: 380vh tall in a 900px
 * viewport, at the top of the page.
 */
function layoutStage() {
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 900 });
  const real = Element.prototype.getBoundingClientRect;
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    if (this.classList.contains('cdesert-stage')) {
      return { x: 0, y: 0, top: 0, left: 0, right: 1440, bottom: 3420, width: 1440, height: 3420, toJSON() {} } as DOMRect;
    }
    return real.call(this);
  });
}

function hydrate() {
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
  const html = renderToString(<CinematicDesert />);
  spy.mockRestore();
  host = document.createElement('div');
  host.innerHTML = html;
  document.body.appendChild(host);
  act(() => {
    root = hydrateRoot(host!, <CinematicDesert />);
  });
  // A browser runs ScrollTrigger's first refresh on the next frame (and again
  // at window load); these suites own GSAP's timers, so run it here.
  act(() => {
    ScrollTrigger.refresh();
  });
}

describe('CinematicDesert — world parking', () => {
  it('desktop: parks the world backdrop while the film covers it and unparks on unmount', () => {
    mockMatchMedia(false);
    layoutStage();
    hydrate();
    expect(document.documentElement.classList.contains(PARKED)).toBe(true);

    act(() => root?.unmount());
    root = null;
    expect(document.documentElement.classList.contains(PARKED)).toBe(false);
  });

  it('phones never park', () => {
    mockMatchMedia(true);
    layoutStage();
    hydrate();
    expect(document.documentElement.classList.contains(PARKED)).toBe(false);
  });
});

describe('globals.css — the desktop tile rules exist only for desktop', () => {
  const css = readFileSync(resolve(process.cwd(), 'app', 'globals.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

  /** The at-rule prelude enclosing `index`, or null at top level. */
  function enclosingAtRule(index: number): string | null {
    let depth = 0;
    for (let i = index - 1; i >= 0; i -= 1) {
      if (css[i] === '}') depth += 1;
      if (css[i] === '{') {
        if (depth === 0) {
          const start = css.lastIndexOf('}', i) + 1;
          const prelude = css.slice(start, i).trim();
          return prelude.startsWith('@') ? prelude : null;
        }
        depth -= 1;
      }
    }
    return null;
  }

  /** Enclosing at-rules of every `selector { prop: value }` rule. */
  function rules(selector: string, prop: string, value: string) {
    const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
    const re = new RegExp(`(?:^|[}\\s;])${esc(selector)}\\s*\\{\\s*${esc(prop)}:\\s*${esc(value)};?\\s*\\}`, 'g');
    return [...css.matchAll(re)].map((m) => enclosingAtRule(m.index ?? 0));
  }

  it('the opening light-up retains nothing after it ends — on desktop only', () => {
    expect(rules('.cdesert-stage .cdesert-frame', 'animation-fill-mode', 'backwards')).toEqual([
      '@media (prefers-reduced-motion: no-preference) and (min-width: 768px)',
    ]);
  });

  it('the world backdrop is parked only by the desktop rule', () => {
    expect(rules('html.cdesert-world-parked .world-backdrop', 'visibility', 'hidden')).toEqual([
      '@media (min-width: 768px)',
    ]);
  });
});
