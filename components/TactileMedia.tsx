'use client';

import { cn } from '@/lib/cn';
import { useParallax } from '@/lib/motion';

type TactileMediaProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Parallax depth. Default 0.05 (far) — paired with the -12% oversize below
   *  so the drift never reveals an edge of the clipping well. */
  depth?: number;
  className?: string;
};

/**
 * TactileMedia — a work image that responds to the visitor (organic-pass
 * 2026-06-03, signature move #2: "tactile work evidence").
 *
 * The photo sits in a slightly-oversized inner layer that drifts gently on
 * scroll (useParallax) and leans in on hover (group-hover scale) — so the
 * actual evidence of the work feels touchable and alive instead of a flat
 * plate. Two nested transforms on two elements (layer = parallax translate,
 * img = hover scale) so they never fight.
 *
 * The PARENT well must be `position:relative overflow-hidden group` and carry
 * the aspect ratio + lit-well treatment. Reduced motion / no-JS: useParallax
 * never registers or transforms (static), and the hover scale is hover intent
 * (fine under RM). Touch devices simply never hover. Alt text is preserved.
 */
export function TactileMedia({ src, alt, width, height, depth = 0.05, className }: TactileMediaProps) {
  const ref = useParallax<HTMLDivElement>(depth);

  return (
    <div ref={ref} className="absolute inset-[-12%]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        className={cn(
          'absolute inset-0 h-full w-full object-cover transition-transform duration-slow ease-gh-glide group-hover:scale-[1.05]',
          className,
        )}
      />
    </div>
  );
}
