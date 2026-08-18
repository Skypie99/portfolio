import { describe, expect, it } from 'vitest';

import rawDeliverables from '../../content/deliverables.json';
import { DeliverableSchema } from '../schema';

/**
 * Themed-variant schema law (showcase/theme-sync): the additive dark/matte/
 * chrome/ogTheme fields parse, their refines bite, the /showcase/ tree is
 * accepted — and every LEGACY entry still parses unchanged (backward
 * compatibility is the contract).
 */

const base = {
  id: 'accessmap',
  title: 'Flagstone',
  summary: 'Mobile app for flagging accessibility barriers on a real city map.',
  role: 'Solo builder',
  tech: ['Expo'],
  year: 2026,
  heroImage: { src: '/images/deliverables/accessmap/hero.svg', alt: 'Warm mockup of the Flagstone interface' },
  tags: ['accessibility'],
  featured: true,
};

const themedShot = {
  src: '/showcase/accessmap/map-overview.light.phone.webp',
  avif: '/showcase/accessmap/map-overview.light.phone.avif',
  webp: '/showcase/accessmap/map-overview.light.phone.webp',
  alt: 'The Flagstone barrier map in daylight, severity pins over street tiles',
  dark: {
    src: '/showcase/accessmap/map-overview.dark.phone.webp',
    avif: '/showcase/accessmap/map-overview.dark.phone.avif',
    webp: '/showcase/accessmap/map-overview.dark.phone.webp',
  },
};

describe('themed showcase schema', () => {
  it('accepts a themed shot with a /showcase/ dark twin', () => {
    const parsed = DeliverableSchema.parse({ ...base, heroShot: themedShot });
    expect(parsed.heroShot?.dark?.avif).toBe('/showcase/accessmap/map-overview.dark.phone.avif');
  });

  it('accepts the legacy /images/deliverables/ tree in the same fields', () => {
    const parsed = DeliverableSchema.parse({
      ...base,
      heroShot: { ...themedShot, src: '/images/deliverables/accessmap/screen-map.png', avif: undefined, webp: undefined, dark: undefined },
    });
    expect(parsed.heroShot?.src).toContain('/images/deliverables/');
  });

  it('rejects a dark twin without a base src', () => {
    const r = DeliverableSchema.safeParse({
      ...base,
      heroShot: { alt: themedShot.alt, dark: themedShot.dark },
    });
    expect(r.success).toBe(false);
  });

  it('rejects dark + matte together', () => {
    const r = DeliverableSchema.safeParse({
      ...base,
      heroShot: { ...themedShot, matte: 'dark-mono' },
    });
    expect(r.success).toBe(false);
  });

  it('accepts a mono matte entry and the chrome override', () => {
    const parsed = DeliverableSchema.parse({
      ...base,
      heroShot: {
        src: '/showcase/pet-paradise/hero.matte.phone.webp',
        alt: 'The Pet Paradise front door in gold on near-black',
        matte: 'dark-mono',
        chrome: 'float',
      },
    });
    expect(parsed.heroShot?.matte).toBe('dark-mono');
    expect(parsed.heroShot?.chrome).toBe('float');
  });

  it('rejects paths outside both trees', () => {
    const r = DeliverableSchema.safeParse({
      ...base,
      heroShot: { ...themedShot, dark: { src: '/elsewhere/x.webp' } },
    });
    expect(r.success).toBe(false);
  });

  it('accepts ogTheme and rejects junk values', () => {
    expect(DeliverableSchema.parse({ ...base, ogTheme: 'dark' }).ogTheme).toBe('dark');
    expect(DeliverableSchema.safeParse({ ...base, ogTheme: 'sepia' }).success).toBe(false);
  });

  it('every legacy entry in content/deliverables.json still parses', () => {
    for (const d of rawDeliverables as unknown[]) {
      const r = DeliverableSchema.safeParse(d);
      expect(r.success, `deliverable ${(d as { id?: string }).id} must parse`).toBe(true);
    }
  });
});
