'use client';

import { useParallax } from '@/lib/motion';
import { cn } from '@/lib/cn';

/**
 * Per-project signature colour for the scrim. Role tokens (accent/cool-mid/gold)
 * flip in dark mode; emerald/caramel are fixed brand paint.
 */
const SCRIM: Record<string, string> = {
  terracotta: 'rgb(var(--rgb-accent) / 0.42)',
  lagoon: 'rgb(var(--rgb-cool-mid) / 0.40)',
  gold: 'rgb(var(--rgb-gold) / 0.40)',
  emerald: 'rgb(77 169 120 / 0.40)',
  caramel: 'rgb(169 122 76 / 0.42)',
};

export type CardAccent = keyof typeof SCRIM;

type CardImageProps = {
  src: string;
  alt: string;
  /** Per-project signature colour — drives the bottom scrim. */
  accent?: CardAccent;
  /**
   * Parallax depth (fraction of scroll travel; see MOTION_SYSTEM.md §5).
   * Kept small (far tier) so the drift stays inside the frame's overflow.
   */
  depth?: number;
  /** Sizing/shape classes for the frame — the PARENT owns aspect/height. */
  className?: string;
};

/**
 * CardImage — the shared "premium material" for product imagery (card-upgrade
 * 2026-06-03). One frame used by ProjectCard + CaseStudyCard so they read as one
 * family.
 *
 * Layers (back → front):
 *  1. Lit-well base — warm clay gradient + inset shadow (the site's image material;
 *     also the graceful fallback if the image fails).
 *  2. The image — `object-cover`, sat slightly OVERSIZED inside an `overflow-hidden`
 *     frame so it can parallax-drift on scroll without exposing the frame edges.
 *     `object-cover` + a fixed-aspect frame means a real raster screenshot drops
 *     straight in later with no rework (screenshot-ready).
 *  3. Signature-colour scrim — a low bottom-up wash in the project's key colour
 *     (replaces the old flat full-cover tint; grounds the card, adds depth).
 *  4. Warm top-light — single source from above (lit-well), softer in dark mode.
 *
 * Motion: a hover scale lives on a WRAPPER (class transform) while parallax writes
 * an inline transform on the <img> — separate elements so they never clobber each
 * other. Under reduced motion `useParallax` writes no transform (static).
 */
export function CardImage({ src, alt, accent = 'terracotta', depth = 0.05, className }: CardImageProps) {
  const ref = useParallax<HTMLImageElement>(depth);
  const scrim = SCRIM[accent] ?? SCRIM.terracotta;

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        'bg-gradient-to-br from-earth to-earth-deep',
        'shadow-[inset_0_-34px_50px_-38px_rgba(60,32,18,0.32)]',
        className,
      )}
    >
      {/* Hover scale on the wrapper (class transform) — parallax owns the img's
          inline transform, so the two never fight. */}
      <div className="absolute inset-0 transition-transform duration-slow ease-out group-hover:scale-[1.04]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={ref}
          src={src}
          alt={alt}
          loading="lazy"
          className="absolute -top-[15%] left-0 h-[130%] w-full object-cover will-change-transform"
        />
      </div>

      {/* Signature-colour scrim — bottom-up, low opacity. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: `linear-gradient(to top, ${scrim}, transparent 52%)` }}
      />

      {/* Warm top-light (lit-well depth) — softer in dark to avoid bloom. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(125%_85%_at_50%_-15%,rgba(255,241,217,0.32),transparent_60%)] dark:bg-[radial-gradient(125%_85%_at_50%_-15%,rgba(255,241,217,0.14),transparent_60%)]"
      />
    </div>
  );
}
