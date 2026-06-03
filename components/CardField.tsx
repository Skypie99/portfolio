'use client';

import type { ReactNode } from 'react';

import { useParallax } from '@/lib/motion';
import { cn } from '@/lib/cn';

/**
 * Per-project golden-hour hue — ALL warm (terracotta → gold → rust → clay-rose),
 * a disciplined family, no cool outliers. RGB triplets (fixed: the field is a rich
 * warm "image" area that reads the same in light + dark, like a photograph).
 */
const FIELD_HUE: Record<string, string> = {
  'accessmap': '182 84 44', // sunlit terracotta
  'claude-corp': '176 109 52', // deep amber
  'prompt-library': '193 152 86', // gold
  'pacman-code-trainer': '166 72 40', // rust
  'pacman': '166 72 40',
  'mutual-mesh': '158 96 78', // warm clay-rose
  'mutual': '158 96 78',
};

const FIELD_DEEP = '38 25 16'; // deep espresso base
const FIELD_GLOW = '212 170 106'; // warm gold crest

/** Site film-grain (matches body::after) — adds crafted, photographic texture. */
const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23g)'/%3E%3C/svg%3E\")";

type CardFieldProps = {
  slug: string;
  /** Sizing/shape classes — the PARENT owns aspect/height. */
  className?: string;
  /** Parallax depth for the light layer (small; far tier). 0 disables. */
  depth?: number;
  /** Overlaid editorial content (numeral, title, meta). */
  children?: ReactNode;
};

/**
 * CardField — the shared "expensive material" for product cards (v2 editorial).
 * A layered golden-hour gradient field (echoing the cinematic intro) instead of
 * any illustration: deep espresso base → project-hued bloom → gold crest, finished
 * with film grain + a lit-well top-light + a deep bottom pool that guarantees an
 * overlaid cream title hits WCAG AA.
 *
 * The glow/hue layer drifts on scroll via useParallax (RM-safe: no transform under
 * reduced motion); the dark base + bottom pool stay fixed so text contrast is stable.
 */
export function CardField({ slug, className, depth = 0.04, children }: CardFieldProps) {
  const ref = useParallax<HTMLDivElement>(depth);
  const hue = FIELD_HUE[slug] ?? FIELD_HUE['accessmap'];

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={{ backgroundColor: `rgb(${FIELD_DEEP})` }}
    >
      {/* Golden-hour light — gold crest + project-hue bloom. Oversized + drifts. */}
      <div
        ref={ref}
        aria-hidden="true"
        className="absolute -inset-[14%] will-change-transform"
        style={{
          backgroundImage: [
            `radial-gradient(130% 78% at 50% -10%, rgb(${FIELD_GLOW} / 0.55), transparent 56%)`,
            `radial-gradient(125% 95% at 50% 44%, rgb(${hue} / 0.7), transparent 72%)`,
          ].join(','),
        }}
      />
      {/* Base warm wash + deep bottom pool (vignette → AA for the overlaid title). */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(180deg, rgb(${hue} / 0.26) 0%, transparent 30%, rgb(${FIELD_DEEP} / 0.55) 68%, rgb(${FIELD_DEEP} / 0.94) 100%)`,
        }}
      />
      {/* Film grain — crafted texture, not a flat div. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.14] mix-blend-soft-light"
        style={{ backgroundImage: NOISE, backgroundSize: '160px 160px' }}
      />
      {children && <div className="relative z-10 flex h-full flex-col">{children}</div>}
    </div>
  );
}
