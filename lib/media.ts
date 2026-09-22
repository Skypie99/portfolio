/**
 * media.ts — resolve a deliverable's product image to "real or placeholder"
 * (Show-the-work 2026-06-04). ONE rule, shared by the case-study hero, the work
 * cards (ProjectCard) and the work-index cards (CaseStudyCard), so the whole
 * site reads consistently and a real screenshot is a one-line swap in the JSON.
 *
 * Owner-selected `heroArtwork` can lead a case study as a labelled illustration.
 * Otherwise `heroShot.src` (a real screenshot) wins; the legacy `heroImage` is
 * used only if it's a real raster. Dedicated cards and gallery shots retain
 * authentic product evidence.
 */

import type { ProductRevealMedia } from '@/components/ProductReveal';

import type { Deliverable } from './schema';

/** SVG heroes are illustrative mockups → treated as placeholders, not screenshots. */
export const isPlaceholderAsset = (src?: string): boolean => !src || src.endsWith('.svg');

type HeroSource = Pick<Deliverable, 'heroImage' | 'heroShot' | 'heroArtwork'>;

/** The selected hero image src, or `undefined` → placeholder. */
export function realHeroSrc(d: HeroSource): string | undefined {
  return d.heroArtwork?.src ?? d.heroShot?.src ?? (isPlaceholderAsset(d.heroImage.src) ? undefined : d.heroImage.src);
}

/** Alt text ready for the (future) real image; falls back to the hero's alt. */
export function heroAlt(d: HeroSource): string {
  return d.heroArtwork?.alt ?? d.heroShot?.alt ?? d.heroImage.alt;
}

/** Responsive sources for the selected hero image. */
export function heroSources(d: HeroSource): { avif?: string; webp?: string } | undefined {
  const source = d.heroArtwork ?? d.heroShot;
  if (!source?.avif && !source?.webp) return undefined;
  return { avif: source.avif, webp: source.webp };
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
  const avif = d.heroArtwork?.avif ?? d.heroShot?.avif;
  if (!avif) return null;
  return { href: avif, as: 'image', type: 'image/avif', fetchPriority: 'high' };
}

/** Themed hero preloads (showcase/theme-sync): when the hero carries a dark
 *  twin, the static single preload would waste the wrong variant's bytes for
 *  half the visitors. ThemedHeroPreload injects exactly ONE of these at
 *  runtime, picked by the same theme signal next-themes reads pre-hydration.
 *  Null when the hero isn't themed → callers keep the static heroPreloadLink. */
export function heroPreloadLinks(d: HeroSource): { light: HeroPreload; dark: HeroPreload } | null {
  const light = d.heroArtwork?.avif ?? d.heroShot?.avif;
  const dark = d.heroArtwork?.dark?.avif ?? d.heroShot?.dark?.avif;
  if (!light || !dark) return null;
  return {
    light: { href: light, as: 'image', type: 'image/avif', fetchPriority: 'high' },
    dark: { href: dark, as: 'image', type: 'image/avif', fetchPriority: 'high' },
  };
}

/**
 * The full ProductReveal media object for a case-study hero. Authored art may
 * lead here; cardMedia keeps the separate product-evidence source. Carries the
 * src (or undefined → placeholder), alt, responsive sources, and any focal crop.
 */
export function heroMedia(d: HeroSource): ProductRevealMedia {
  const sources = heroSources(d);
  const active = d.heroArtwork ?? d.heroShot;
  return {
    src: realHeroSrc(d),
    alt: heroAlt(d),
    avif: sources?.avif,
    webp: sources?.webp,
    lqip: d.heroArtwork ? undefined : d.heroShot?.lqip,
    video: d.heroArtwork ? undefined : d.heroShot?.video,
    focal: d.heroArtwork ? undefined : d.heroShot?.focal,
    // Theme-synced twin + mono matting + chrome (showcase/theme-sync) — pure
    // threading; ProductReveal decides how (and whether) to render them.
    dark: active?.dark,
    matte: d.heroArtwork ? undefined : d.heroShot?.matte,
    chrome: d.heroArtwork ? 'float' : d.heroShot?.chrome,
  };
}

type CardSource = Pick<Deliverable, 'heroImage' | 'heroShot' | 'cardImage' | 'mobileCardImage'>;

function mobileCardMedia(d: CardSource): ProductRevealMedia['mobile'] {
  if (!d.mobileCardImage?.src) return undefined;
  return {
    src: d.mobileCardImage.src,
    alt: d.mobileCardImage.alt,
    avif: d.mobileCardImage.avif,
    webp: d.mobileCardImage.webp,
    lqip: d.mobileCardImage.lqip,
    focal: d.mobileCardImage.focal,
    dark: d.mobileCardImage.dark,
    matte: d.mobileCardImage.matte,
    chrome: d.mobileCardImage.chrome,
  };
}

/**
 * Media for a work CARD. A dedicated, pre-cropped `cardImage` wins (shown exactly
 * — static cover, no re-zoom), so a tall phone hero can stay whole while the card
 * shows a wide framed crop. Otherwise the card falls back to the hero image —
 * still a static cover crop (precropped), never TactileMedia's hover parallax, so
 * every card plate reads with the same no-hover reach [C-19]; landscape heroShots
 * fit the band fine. Hero-only artwork never flows into this fallback.
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
      mobile: mobileCardMedia(d),
      precropped: true,
    };
  }
  return { ...heroMedia({ ...d, heroArtwork: undefined }), mobile: mobileCardMedia(d), precropped: true };
}
