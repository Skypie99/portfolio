/**
 * media.ts — proof-media resolution (P2-A). Locks the hero-preload contract:
 * preload the AVIF (the LCP element, L7-02) when it exists, and NEVER the raw
 * PNG whale when it doesn't.
 */
import { describe, expect, it } from 'vitest';

import { heroMedia, heroPreloadLink } from '@/lib/media';

const base = {
  heroImage: { src: '/images/deliverables/accessmap/hero.svg', alt: 'Flagstone mockup' },
};

describe('heroPreloadLink', () => {
  it('returns an AVIF image preload at high priority when an optimized sibling exists', () => {
    const p = heroPreloadLink({
      ...base,
      heroShot: {
        src: '/images/deliverables/accessmap/screen-map.png',
        avif: '/images/deliverables/accessmap/screen-map.avif',
        alt: 'Flagstone map with a verified No ramp barrier',
      },
    });
    expect(p).toEqual({
      href: '/images/deliverables/accessmap/screen-map.avif',
      as: 'image',
      type: 'image/avif',
      fetchPriority: 'high',
    });
  });

  it('returns null when there is no optimized hero sibling (never preload the whale)', () => {
    expect(heroPreloadLink({ ...base, heroShot: { src: '/images/deliverables/accessmap/screen-map.png', alt: 'raw png only' } })).toBeNull();
    expect(heroPreloadLink(base)).toBeNull();
  });
});

describe('heroMedia threads the proof fields', () => {
  it('carries avif/webp + lqip into the media object', () => {
    const m = heroMedia({
      ...base,
      heroShot: {
        src: '/images/deliverables/accessmap/screen-map.png',
        avif: '/images/deliverables/accessmap/screen-map.avif',
        webp: '/images/deliverables/accessmap/screen-map.webp',
        lqip: 'data:image/webp;base64,ABC',
        alt: 'Flagstone map with a verified No ramp barrier',
      },
    });
    expect(m.avif).toBe('/images/deliverables/accessmap/screen-map.avif');
    expect(m.webp).toBe('/images/deliverables/accessmap/screen-map.webp');
    expect(m.lqip).toBe('data:image/webp;base64,ABC');
  });
});
