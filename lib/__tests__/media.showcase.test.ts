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

  it('cardMedia threads an authentic phone-composed sibling without changing desktop media', () => {
    const mobileCardImage = {
      src: '/showcase/prompt-library/home.light.phone.webp',
      avif: '/showcase/prompt-library/home.light.phone.avif',
      webp: '/showcase/prompt-library/home.light.phone.webp',
      alt: 'The Prompt Library home on a phone, with search and prompt cards in a readable view',
      dark: {
        src: '/showcase/prompt-library/home.dark.phone.webp',
        avif: '/showcase/prompt-library/home.dark.phone.avif',
        webp: '/showcase/prompt-library/home.dark.phone.webp',
      },
    } as NonNullable<Deliverable['mobileCardImage']>;
    const m = cardMedia(d({ cardImage: themed, mobileCardImage }));
    expect(m.src).toContain('map-overview.light.phone');
    expect(m.mobile?.src).toContain('prompt-library/home.light.phone');
    expect(m.mobile?.dark?.src).toContain('.dark.phone');
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

  it('shows selected artwork in the case-study hero while work cards keep captured evidence', () => {
    const artwork = {
      src: '/images/deliverables/claude-corp/branch-atlas.light.webp',
      avif: '/images/deliverables/claude-corp/branch-atlas.light.avif',
      webp: '/images/deliverables/claude-corp/branch-atlas.light.webp',
      alt: 'Concept diagram of fifteen separate role paths ending at a review gate',
      label: 'Concept diagram',
      dark: {
        src: '/images/deliverables/claude-corp/branch-atlas.dark.webp',
        avif: '/images/deliverables/claude-corp/branch-atlas.dark.avif',
        webp: '/images/deliverables/claude-corp/branch-atlas.dark.webp',
      },
    } as NonNullable<Deliverable['heroArtwork']>;
    const item = d({ heroShot: themed, heroArtwork: artwork, cardImage: themed });

    expect(heroMedia(item)).toMatchObject({ src: artwork.src, alt: artwork.alt, dark: artwork.dark });
    expect(heroPreloadLinks(item)?.light.href).toBe(artwork.avif);
    expect(heroPreloadLinks(item)?.dark.href).toBe(artwork.dark.avif);
    expect(cardMedia(item).src).toBe(themed.src);
    expect(cardMedia(d({ heroShot: themed, heroArtwork: artwork })).src).toBe(themed.src);
  });
});
