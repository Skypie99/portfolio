/**
 * CinematicDesert — desktop plate fit (hotfix 2026-10-19).
 *
 * Chrome re-rasterises every plate GSAP zooms at a new scale on every frame,
 * holding 2–3 full-viewport tilings per plate, and on a large DPR-2 window the
 * tile budget runs out (the owner's partial-scene dropouts). A plate box that
 * is exactly its image's pixels is composited straight from the image instead,
 * so on Chromium desktop each plate is laid out at its file's pixels and its
 * <picture> scales it back to the object-fit: cover box.
 *
 * These tests pin: the pixel table matches the real files; the solve maps the
 * box onto the cover box about the film's 50%/70% zoom centre, with the box on
 * whole device pixels; only Chromium desktop windows no wider than a plate get
 * the fit; unmount takes it off; both CSS rules exist only for desktop.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { act } from 'react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import sharp from 'sharp';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

// Own timers before GSAP module evaluation, for this file only.
await vi.hoisted(async () => {
  const { ownGsapTimers } = await import('../../test-utils/gsap-teardown');
  ownGsapTimers();
});

import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { CinematicDesert } from '@/components/cinematic/CinematicDesert';
import { ACTIVE_SCENES, PLATE_PIXELS } from '@/components/cinematic/plates';

const FIT = 'cdesert-plate--fit';

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

/** A browser lays the film out; jsdom measures 0×0. Give the scene groups a box. */
function layoutFilm(width: number, height: number, dpr: number, chromium: boolean) {
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: height });
  Object.defineProperty(window, 'devicePixelRatio', { configurable: true, value: dpr });
  if (chromium) Object.defineProperty(navigator, 'userAgentData', { configurable: true, value: { brands: [] } });
  const real = Element.prototype.getBoundingClientRect;
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    if (this.classList.contains('cdesert-stage')) {
      return { x: 0, y: 0, top: 0, left: 0, right: width, bottom: height * 3.8, width, height: height * 3.8, toJSON() {} } as DOMRect;
    }
    return real.call(this);
  });
  const sized = (el: Element) => el.classList.contains('cdesert-scene');
  vi.spyOn(Element.prototype, 'clientWidth', 'get').mockImplementation(function (this: Element) {
    return sized(this) ? width : 0;
  });
  vi.spyOn(Element.prototype, 'clientHeight', 'get').mockImplementation(function (this: Element) {
    return sized(this) ? height : 0;
  });
  // jsdom has no srcset selection: report the <img> fallback (the full tier)
  vi.spyOn(HTMLImageElement.prototype, 'currentSrc', 'get').mockImplementation(function (this: HTMLImageElement) {
    return this.getAttribute('src') ?? '';
  });
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
  document.documentElement.classList.remove('cdesert-world-parked');
  Reflect.deleteProperty(navigator, 'userAgentData');
  vi.restoreAllMocks();
});

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
  act(() => {
    ScrollTrigger.refresh();
  });
}

const pictures = () => [...(host?.querySelectorAll<HTMLElement>('.cdesert-stage picture') ?? [])];
const px = (el: HTMLElement, v: string) => parseFloat(el.style.getPropertyValue(v));

describe('PLATE_PIXELS', () => {
  it('matches the real plate files, both tiers', async () => {
    const live = ACTIVE_SCENES.flatMap((s) => s.planes.map((p) => p.id));
    expect(Object.keys(PLATE_PIXELS).sort()).toEqual([...live].sort());
    for (const id of live) {
      for (const [tier, suffix] of [['full', ''], ['mobile', '-mobile']] as const) {
        for (const ext of ['avif', 'webp']) {
          const meta = await sharp(resolve(process.cwd(), 'public', 'images', 'cinematic', `${id}${suffix}.${ext}`)).metadata();
          expect([meta.width, meta.height], `${id}${suffix}.${ext}`).toEqual([...PLATE_PIXELS[id][tier]]);
        }
      }
    }
  });
});

describe('CinematicDesert — plate fit', () => {
  it('Chromium desktop: every plate box is its file pixels, scaled back onto the cover box', () => {
    const [W, H, dpr] = [1920, 1066, 2];
    mockMatchMedia(false);
    layoutFilm(W, H, dpr, true);
    hydrate();
    const pics = pictures();
    expect(pics).toHaveLength(4);
    for (const pic of pics) {
      expect(pic.classList.contains(FIT)).toBe(true);
      const img = pic.querySelector('img')!;
      const id = img.getAttribute('data-plate')!;
      const [bw, bh] = PLATE_PIXELS[id].full;
      const k = px(pic, '--cdesert-fit-k');
      const [w, h] = [px(pic, '--cdesert-fit-w'), px(pic, '--cdesert-fit-h')];
      const [x, y] = [px(pic, '--cdesert-fit-x'), px(pic, '--cdesert-fit-y')];
      const [ox, oy] = [px(pic, '--cdesert-fit-ox'), px(pic, '--cdesert-fit-oy')];
      // the box is the file's own pixels, on whole device pixels
      expect([w * dpr, h * dpr]).toEqual([bw, bh]);
      expect(Number.isInteger(Math.round(x * dpr * 1e6) / 1e6)).toBe(true);
      expect(Number.isInteger(Math.round(y * dpr * 1e6) / 1e6)).toBe(true);
      // scaled about (ox, oy) it IS the cover box: film-tall, centred, bottom-aligned
      expect(k * h).toBeCloseTo(H, 6);
      const left = ox + k * (x - ox);
      const top = oy + k * (y - oy);
      expect(left).toBeCloseTo(W / 2 - (k * w) / 2, 6);
      expect(top).toBeCloseTo(0, 6);
      // and its 50%/70% transform origin lands on the film's 50%/70% point
      expect(ox + k * (x + w / 2 - ox)).toBeCloseTo(W / 2, 6);
      expect(oy + k * (y + 0.7 * h - oy)).toBeCloseTo(0.7 * H, 6);
    }

    act(() => root?.unmount());
    root = null;
    for (const pic of pics) {
      expect(pic.classList.contains(FIT)).toBe(false);
      expect(pic.style.getPropertyValue('--cdesert-fit-k')).toBe('');
    }
  });

  it('Safari and Firefox keep the plain cover box', () => {
    mockMatchMedia(false);
    layoutFilm(1920, 1066, 2, false);
    hydrate();
    expect(pictures().some((p) => p.classList.contains(FIT))).toBe(false);
  });

  it('phones keep the plain cover box', () => {
    mockMatchMedia(true);
    layoutFilm(393, 852, 3, true);
    hydrate();
    expect(pictures().some((p) => p.classList.contains(FIT))).toBe(false);
  });

  it('a window wider than a plate keeps the plain cover box', () => {
    mockMatchMedia(false);
    layoutFilm(3440, 1000, 1, true); // 3.44:1, wider than the 2.33:1 plates
    hydrate();
    expect(pictures().some((p) => p.classList.contains(FIT))).toBe(false);
  });
});

describe('globals.css — the plate fit exists only for desktop', () => {
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

  it('both fit rules sit in the desktop media block', () => {
    for (const selector of ['.cdesert-stage picture.cdesert-plate--fit', '.cdesert-stage .cdesert-plate--fit > .cdesert-layer']) {
      const at = [...css.matchAll(new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{`, 'g'))].map((m) => enclosingAtRule(m.index ?? 0));
      expect(at, selector).toEqual(['@media (min-width: 768px)']);
    }
  });
});
