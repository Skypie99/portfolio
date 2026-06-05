/**
 * media.ts — resolve a deliverable's product image to "real or placeholder"
 * (Show-the-work 2026-06-04). ONE rule, shared by the case-study hero, the work
 * cards (ProjectCard) and the work-index cards (CaseStudyCard), so the whole
 * site reads consistently and a real screenshot is a one-line swap in the JSON.
 *
 * The contract: `heroShot.src` (a real screenshot) wins; otherwise the legacy
 * `heroImage` is used ONLY if it's a real raster — the four `.svg` mockups are
 * treated as placeholders so they render the new golden-hour world instead of a
 * flat illustration. `undefined` => ProductReveal paints the placeholder.
 */

import type { ProductRevealMedia } from '@/components/ProductReveal';

import type { Deliverable } from './schema';

/** SVG heroes are illustrative mockups → treated as placeholders, not screenshots. */
export const isPlaceholderAsset = (src?: string): boolean => !src || src.endsWith('.svg');

type HeroSource = Pick<Deliverable, 'heroImage' | 'heroShot'>;

/** The best REAL hero image src for a deliverable, or `undefined` → placeholder. */
export function realHeroSrc(d: HeroSource): string | undefined {
  return d.heroShot?.src ?? (isPlaceholderAsset(d.heroImage.src) ? undefined : d.heroImage.src);
}

/** Alt text ready for the (future) real image; falls back to the hero's alt. */
export function heroAlt(d: HeroSource): string {
  return d.heroShot?.alt ?? d.heroImage.alt;
}

/** Future responsive sources for the hero screenshot (absent until generated). */
export function heroSources(d: HeroSource): { avif?: string; webp?: string } | undefined {
  if (!d.heroShot?.avif && !d.heroShot?.webp) return undefined;
  return { avif: d.heroShot?.avif, webp: d.heroShot?.webp };
}

/**
 * The full ProductReveal media object for a deliverable — one source of truth for
 * the case-study hero AND both card types. Carries the real src (or undefined →
 * placeholder), alt, responsive sources, and the `focal` crop used by the
 * full-bleed card/shot band (the device-framed hero ignores focal — it shows the
 * whole screen).
 */
export function heroMedia(d: HeroSource): ProductRevealMedia {
  const sources = heroSources(d);
  return {
    src: realHeroSrc(d),
    alt: heroAlt(d),
    avif: sources?.avif,
    webp: sources?.webp,
    focal: d.heroShot?.focal,
  };
}

type CardSource = Pick<Deliverable, 'heroImage' | 'heroShot' | 'cardImage'>;

/**
 * Media for a work CARD. A dedicated, pre-cropped `cardImage` wins (shown exactly
 * — static cover, no re-zoom), so a tall phone hero can stay whole while the card
 * shows a wide framed crop. Otherwise the card falls back to the hero image
 * (focal-cropped with parallax) — landscape heroShots fit the band fine.
 */
export function cardMedia(d: CardSource): ProductRevealMedia {
  if (d.cardImage?.src) {
    return {
      src: d.cardImage.src,
      alt: d.cardImage.alt,
      avif: d.cardImage.avif,
      webp: d.cardImage.webp,
      focal: d.cardImage.focal,
      precropped: true,
    };
  }
  return heroMedia(d);
}
