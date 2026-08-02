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

/** Preload descriptor for a case-study hero's AVIF — its LCP element (L7-02).
 *  Returns null when no optimized hero sibling exists, so we NEVER preload the
 *  raw PNG whale. PRODUCED here (P2-A); P2-B WIRES it into the case-study <head>
 *  (it touches a showcase surface), e.g.:
 *
 *    const p = heroPreloadLink(d);
 *    if (p) ReactDOM.preload(p.href, { as: p.as, type: p.type, fetchPriority: p.fetchPriority });
 *
 *  Home first-paint plate preload / avatar-preload retirement (L7-03) is
 *  deliberately NOT produced here — it touches the locked-intro delivery surface
 *  (PROTECT #1); see design-reviews/uplift/assets/p2a/README-p2a.md for the note. */
export type HeroPreload = { href: string; as: 'image'; type: string; fetchPriority: 'high' };

export function heroPreloadLink(d: HeroSource): HeroPreload | null {
  const avif = d.heroShot?.avif;
  if (!avif) return null;
  return { href: avif, as: 'image', type: 'image/avif', fetchPriority: 'high' };
}

/** Themed hero preloads (showcase/theme-sync): when the hero carries a dark
 *  twin, the static single preload would waste the wrong variant's bytes for
 *  half the visitors. ThemedHeroPreload injects exactly ONE of these at
 *  runtime, picked by the same theme signal next-themes reads pre-hydration.
 *  Null when the hero isn't themed → callers keep the static heroPreloadLink. */
export function heroPreloadLinks(d: HeroSource): { light: HeroPreload; dark: HeroPreload } | null {
  const light = d.heroShot?.avif;
  const dark = d.heroShot?.dark?.avif;
  if (!light || !dark) return null;
  return {
    light: { href: light, as: 'image', type: 'image/avif', fetchPriority: 'high' },
    dark: { href: dark, as: 'image', type: 'image/avif', fetchPriority: 'high' },
  };
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
    lqip: d.heroShot?.lqip,
    video: d.heroShot?.video,
    focal: d.heroShot?.focal,
    // Theme-synced twin + mono matting + chrome (showcase/theme-sync) — pure
    // threading; ProductReveal decides how (and whether) to render them.
    dark: d.heroShot?.dark,
    matte: d.heroShot?.matte,
    chrome: d.heroShot?.chrome,
  };
}

type CardSource = Pick<Deliverable, 'heroImage' | 'heroShot' | 'cardImage'>;

/**
 * Media for a work CARD. A dedicated, pre-cropped `cardImage` wins (shown exactly
 * — static cover, no re-zoom), so a tall phone hero can stay whole while the card
 * shows a wide framed crop. Otherwise the card falls back to the hero image —
 * still a static cover crop (precropped), never TactileMedia's hover parallax, so
 * every card plate reads with the same no-hover reach [C-19]; landscape heroShots
 * fit the band fine.
 */
export function cardMedia(d: CardSource): ProductRevealMedia {
  if (d.cardImage?.src) {
    return {
      src: d.cardImage.src,
      alt: d.cardImage.alt,
      avif: d.cardImage.avif,
      webp: d.cardImage.webp,
      lqip: d.cardImage.lqip,
      video: d.cardImage.video,
      focal: d.cardImage.focal,
      dark: d.cardImage.dark,
      matte: d.cardImage.matte,
      chrome: d.cardImage.chrome,
      precropped: true,
    };
  }
  return { ...heroMedia(d), precropped: true };
}
