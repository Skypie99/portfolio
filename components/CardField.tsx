'use client';

import { cn } from '@/lib/cn';

/**
 * CardField — the faint light INSIDE the liquid-glass card (liquid-glass
 * 2026-06-03). A per-project warm caustic (light pooling from the top-left) plus
 * a whisper of cool refraction at the far edge — the "prism" of light passing
 * through glass — and a fine frost grain. All decorative + aria-hidden + static
 * (low alpha): the card root paints the glass body, rim and cursor specular;
 * this just tints the panel so each project reads a touch different without
 * breaking the minimal/light look. Renders as an absolute fill the card clips.
 */

/** Per-project signature hue (warm golden-hour family) for the caustic. */
const SIGNATURE: Record<string, string> = {
  'accessmap': '224 150 90', // terracotta-amber
  'claude-corp': '206 134 78', // deep amber
  'prompt-library': '236 186 118', // gold
  'pacman-code-trainer': '200 108 60', // rust
  'pacman': '200 108 60',
  'mutual-mesh': '202 142 114', // clay-rose
  'mutual': '202 142 114',
};

/** A whisper of cool light at the opposite edge — the refracted "prism" edge. */
const COOL = '137 181 168'; // seafoam (site cool-soft), very low alpha

/** Site film-grain (matches body::after) — fine frost tooth. */
const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23g)'/%3E%3C/svg%3E\")";

type CardFieldProps = {
  slug: string;
  className?: string;
};

export function CardField({ slug, className }: CardFieldProps) {
  const sig = SIGNATURE[slug] ?? SIGNATURE['accessmap'];

  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]', className)}
    >
      {/* warm caustic — light pooling from the top-left, project-tinted */}
      <div
        className="absolute inset-0"
        style={{ backgroundImage: `radial-gradient(72% 56% at 20% -10%, rgb(${sig} / 0.20), transparent 60%)` }}
      />
      {/* cool refraction — a whisper of spectral light at the far corner */}
      <div
        className="absolute inset-0"
        style={{ backgroundImage: `radial-gradient(60% 50% at 110% 114%, rgb(${COOL} / 0.10), transparent 58%)` }}
      />
      {/* fine frost grain */}
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-soft-light"
        style={{ backgroundImage: NOISE, backgroundSize: '160px 160px' }}
      />
    </div>
  );
}
