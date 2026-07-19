'use client';

import { useParallax } from '@/lib/motion';
import { cn } from '@/lib/cn';

const DEPTHS = { far: 0.04, mid: 0.08, near: 0.14 } as const;

type ParallaxWashProps = {
  /** Depth tier (MOTION_SYSTEM.md §5). far = subtle/distant, near = stronger. */
  depth?: keyof typeof DEPTHS;
  /** Warm golden (default) or cool teal light field. */
  tone?: 'gold' | 'teal';
  /** Extra positioning classes if a section wants the glow off-centre. */
  className?: string;
};

/**
 * ParallaxWash — a decorative golden-hour light field that drifts on scroll
 * (motion-polish 2026-06-03). Echoes the landing's warmth as the page moves,
 * carrying the intro's layered depth into ordinary sections.
 *
 * Drop into any section that is `relative overflow-hidden` (so the oversized
 * `-inset` wash is clipped to the section). It is `aria-hidden`, behind
 * content (z-0 — give the content `relative z-10`), and pointer-transparent.
 * Under reduced motion `useParallax` writes no transform, so it holds as a
 * static glow. Transform-only → stays on the compositor at 60fps.
 */
export function ParallaxWash({ depth = 'far', tone = 'gold', className }: ParallaxWashProps) {
  const ref = useParallax<HTMLDivElement>(DEPTHS[depth]);
  const gradient =
    tone === 'teal'
      ? 'radial-gradient(50% 45% at 50% 32%, rgb(var(--rgb-cool-soft) / 0.18), rgb(var(--rgb-cool) / 0.06) 48%, transparent 72%)'
      : 'radial-gradient(50% 45% at 50% 32%, rgb(var(--rgb-gold) / 0.16), rgb(var(--rgb-accent-soft) / 0.07) 48%, transparent 72%)';

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn('pointer-events-none absolute -inset-[22%] z-0', className)}
      // will-change is managed by useParallax (promoted only while registered —
      // never under reduced motion, where no transform is ever written).
      style={{ background: gradient }}
    />
  );
}
