/**
 * CinematicDesert — reduced-motion first paint (OPT-D-001a, 2026-10-19).
 *
 * useReducedMotion cannot resolve on the server, so the server HTML carries
 * BOTH intro trees and globals.css picks one before first paint. Without that,
 * a reduced-motion visitor was painted the animated opener and then swapped to
 * the static arrival frame after hydration. These tests pin the contract:
 *   - the SSR shape the CSS selectors rely on (flagged stage wrapper, static
 *     frame AFTER it as a sibling);
 *   - the CSS itself (static hidden by default, stage hidden under reduce);
 *   - hydration keeps the PAINTED tree as the same DOM node (no remount, no
 *     hydration warning) and unmounts the unpainted twin;
 *   - reduced-motion visitors never wire GSAP/ScrollTrigger.
 *
 * Outside the protected cinematic suite on purpose; owns GSAP timers the same
 * way app/__tests__/homepage-dates.test.tsx does, because the no-preference
 * case really does wire the ScrollTrigger at hydration.
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

const SCENE_LABEL = 'SkyPi Studio: desert title scene';

/** matchMedia stub: reduced motion as given, everything else (max-width) false. */
function mockMatchMedia(reducedMotion: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('prefers-reduced-motion: reduce') ? reducedMotion : false,
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
  vi.restoreAllMocks();
});

/**
 * renderToString under jsdom. @gsap/react picks useLayoutEffect because jsdom
 * has a `document`, so React warns about it on the server; a real Next build
 * renders on Node, where useGSAP falls back to useEffect. That warning is the
 * only server-render noise allowed.
 */
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

/** Server-render, mount the HTML, hydrate it, and collect any hydration noise. */
function serverRenderThenHydrate() {
  const html = ssr();
  host = document.createElement('div');
  host.innerHTML = html;
  document.body.appendChild(host);

  const before = {
    stage: host.querySelector('.cdesert-stage'),
    static: host.querySelector('.cdesert-static'),
  };
  const consoleErrors: unknown[][] = [];
  vi.spyOn(console, 'error').mockImplementation((...args) => {
    consoleErrors.push(args);
  });
  const recoverable: unknown[] = [];
  act(() => {
    root = hydrateRoot(host!, <CinematicDesert />, {
      onRecoverableError: (err) => recoverable.push(err),
    });
  });
  return { html, before, consoleErrors, recoverable, container: host };
}

describe('CinematicDesert — server HTML carries both trees for CSS to choose', () => {
  it('flags the stage wrapper and places the static frame after it', () => {
    mockMatchMedia(false);
    host = document.createElement('div');
    host.innerHTML = ssr();

    const wrapper = host.querySelector('[data-cdesert-firstpaint]');
    expect(wrapper?.querySelector('.cdesert-stage')).not.toBeNull();
    // the CSS uses `[data-cdesert-firstpaint] ~ .cdesert-static`: order matters
    expect(host.querySelector('[data-cdesert-firstpaint] ~ .cdesert-static')).not.toBeNull();
    expect(host.querySelectorAll('.cdesert-static')).toHaveLength(1);
    expect(host.querySelectorAll('.cdesert-stage')).toHaveLength(1);
  });
});

describe('CinematicDesert — hydration keeps the painted tree, drops the twin', () => {
  it('reduced motion: keeps the SAME static node, unmounts the stage, never wires GSAP', () => {
    mockMatchMedia(true);
    const { before, consoleErrors, recoverable, container } = serverRenderThenHydrate();

    expect(before.static).not.toBeNull();
    expect(container.querySelector('.cdesert-static')).toBe(before.static);
    expect(container.querySelector('.cdesert-stage')).toBeNull();
    expect(container.querySelector('[data-cdesert-firstpaint]')).toBeNull();
    expect(container.querySelectorAll(`section[aria-label="${SCENE_LABEL}"]`)).toHaveLength(1);

    expect(ScrollTrigger.getAll()).toHaveLength(0);
    expect(container.querySelector('.pin-spacer')).toBeNull();

    expect(recoverable).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  it('no preference: keeps the SAME stage node, unmounts the static frame, wires GSAP', () => {
    mockMatchMedia(false);
    const { before, consoleErrors, recoverable, container } = serverRenderThenHydrate();

    expect(before.stage).not.toBeNull();
    expect(container.querySelector('.cdesert-stage')).toBe(before.stage);
    expect(container.querySelector('.cdesert-static')).toBeNull();
    expect(container.querySelector('[data-cdesert-firstpaint]')).toBeNull();
    expect(container.querySelectorAll(`section[aria-label="${SCENE_LABEL}"]`)).toHaveLength(1);

    expect(ScrollTrigger.getAll().length).toBeGreaterThan(0);

    expect(recoverable).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });
});

describe('globals.css — first-paint selection by prefers-reduced-motion', () => {
  const css = readFileSync(resolve(process.cwd(), 'app', 'globals.css'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '');

  /** The at-rule prelude enclosing `index` (e.g. "@media (...)"), or null at top level. */
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

  /** Every occurrence of `selector { display: <value> }` with its enclosing at-rule. */
  function rules(selector: string, value: string) {
    const escaped = selector.replace(/[[\]~.()]/g, (c) => `\\${c}`).replace(/\s+/g, '\\s*');
    const re = new RegExp(`(?:^|[}\\s;])${escaped}\\s*\\{\\s*display:\\s*${value};?\\s*\\}`, 'g');
    return [...css.matchAll(re)].map((m) => enclosingAtRule(m.index ?? 0));
  }

  it('hides the static frame by default (also where the media feature is unsupported)', () => {
    expect(rules('[data-cdesert-firstpaint] ~ .cdesert-static', 'none')).toEqual([null]);
  });

  it('under reduce, hides the stage wrapper and shows the static frame', () => {
    expect(rules('[data-cdesert-firstpaint]', 'none')).toEqual([
      '@media (prefers-reduced-motion: reduce)',
    ]);
    expect(rules('[data-cdesert-firstpaint] ~ .cdesert-static', 'block')).toEqual([
      '@media (prefers-reduced-motion: reduce)',
    ]);
  });
});
