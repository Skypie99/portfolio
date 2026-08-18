import { describe, expect, it } from 'vitest';

import { cardMedia, heroMedia, heroPreloadLinks } from '../media';
import type { Deliverable } from '../schema';

/** Themed threading (showcase/theme-sync): heroMedia/cardMedia carry dark/
 *  matte/chrome through untouched, and heroPreloadLinks yields BOTH avif
 *  hrefs only when the hero is truly themed (never a raw fallback). */

const themed = {
  src: '/showcase/flagstone/map-overview.light.phone.webp',
  avif: '/showcase/flagstone/map-overview.light.phone.avif',
  webp: '/showcase/flagstone/map-overview.light.phone.webp',
  alt: 'The Flagstone barrier map, severity pins over street tiles',
  dark: {
    src: '/showcase/flagstone/map-overview.dark.phone.webp',
    avif: '/showcase/flagstone/map-overview.dark.phone.avif',
    webp: '/showcase/flagstone/map-overview.dark.phone.webp',
  },
  chrome: 'device',
} as NonNullable<Deliverable['heroShot']>;

const d = (over: Partial<Deliverable>) =>
  ({
    heroImage: { src: '/images/deliverables/flagstone/hero.svg', alt: 'Warm Flagstone mockup' },
    ...over,
  }) as Deliverable;

describe('themed media threading', () => {
  it('heroMedia threads dark + chrome', () => {
    const m = heroMedia(d({ heroShot: themed }));
    expect(m.dark?.avif).toBe('/showcase/flagstone/map-overview.dark.phone.avif');
    expect(m.chrome).toBe('device');
    expect(m.matte).toBeUndefined();
  });

  it('cardMedia threads matte from a dedicated cardImage', () => {
    const m = cardMedia(
      d({
        cardImage: {
          src: '/showcase/pet-paradise/hero.matte.phone.webp',
          alt: 'The Pet Paradise front door in gold on near-black',
          matte: 'dark-mono',
        } as NonNullable<Deliverable['cardImage']>,
      }),
    );
    expect(m.matte).toBe('dark-mono');
    expect(m.precropped).toBe(true);
  });

  it('cardMedia falls back to the themed hero (dark rides the spread)', () => {
    const m = cardMedia(d({ heroShot: themed }));
    expect(m.dark?.src).toContain('.dark.');
  });

  it('heroPreloadLinks returns both avif hrefs only when both variants exist', () => {
    const links = heroPreloadLinks(d({ heroShot: themed }));
    expect(links?.light.href).toContain('.light.');
    expect(links?.dark.href).toContain('.dark.');
    expect(links?.dark.type).toBe('image/avif');

    const single = heroPreloadLinks(d({ heroShot: { ...themed, dark: undefined } }));
    expect(single).toBeNull();

    const noAvif = heroPreloadLinks(
      d({ heroShot: { ...themed, avif: undefined } as NonNullable<Deliverable['heroShot']> }),
    );
    expect(noAvif).toBeNull();
  });
});
