'use client';

import { cn } from '@/lib/cn';

/**
 * CardField — the light INSIDE the liquid-glass card (liquid-glass 2026-06-03,
 * refined v2). A per-project warm caustic (light pooling from the top-left), a
 * soft top lens-sweep (internal glass depth), and a present-but-soft SOFT-BLUE
 * refraction at the far corner — the "prism" of light passing through glass —
 * over a fine frost grain. All decorative + aria-hidden + static (low alpha):
 * the card root paints the glass body, spectral rim and cursor specular; this
 * tints the panel so each project reads a touch different and the glass has
 * internal light to lens, without breaking the minimal/light look. Renders as an
 * absolute fill the card clips.
 */

/** Per-project signature hue (warm golden-hour family) for the caustic. */
const SIGNATURE: Record<string, string> = {
  'accessmap': '224 150 90', // terracotta-amber
  'claude-corp': '206 134 78', // deep amber
  'prompt-library': '236 186 118', // gold
  'ghost-code': '72 195 210', // phantom cyan
  'ghost': '72 195 210',
  'mutual-mesh': '202 142 114', // clay-rose
  'mutual': '202 142 114',
  // Certificate issuers — same warm family, distinct per issuer so the
  // credential cards read a touch different without leaving golden-hour.
  'anthropic': '214 132 88', // clay-terracotta
  'google': '236 186 118', // gold
  'university-of-michigan': '202 142 114', // clay-rose
  'deeplearning-ai': '206 134 78', // deep amber
};

/** Soft blue at the far corner — the refracted "prism" edge (a quiet whisper). */
const BLUE = '150 188 214'; // soft sky-blue

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
      {/* warm caustic — light pooling from the top-left, project-tinted.
          .cf-caustic lets the pool damp-track the cursor (useSpotlight --mx/--my)
          with a slow lag, so it reads as one sun with the ::after specular. */}
      <div
        className="absolute inset-0 cf-caustic"
        style={{ backgroundImage: `radial-gradient(72% 56% at 20% -10%, rgb(${sig} / 0.20), transparent 60%)` }}
      />
      {/* soft top lens-sweep — internal glass highlight, reads convex */}
      <div
        className="absolute inset-0"
        style={{ backgroundImage: `radial-gradient(120% 42% at 50% -16%, rgb(255 255 255 / 0.14), transparent 64%)` }}
      />
      {/* soft-blue refraction — the "prism" light pooling in from the far corner.
          .cf-prism counter-drifts (smaller, slower, opposite) for internal parallax. */}
      <div
        className="absolute inset-0 cf-prism"
        style={{ backgroundImage: `radial-gradient(78% 64% at 108% 112%, rgb(${BLUE} / 0.26), transparent 62%)` }}
      />
      {/* fine frost grain */}
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-soft-light"
        style={{ backgroundImage: NOISE, backgroundSize: '160px 160px' }}
      />
    </div>
  );
}
