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
