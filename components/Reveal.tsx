'use client';

import type { ElementType, ReactNode } from 'react';

import { cn } from '@/lib/cn';
import { useInViewOnce } from '@/lib/motion';

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Stagger index — adds `index * staggerStep` of transition delay. Default 0. */
  index?: number;
  /** Per-index stagger delay in ms. Default 80 (`--stagger-step`); use 120
   *  (`--stagger-scene`) for larger, more deliberate sequences. */
  staggerStep?: number;
  /**
   * Motion register (see MOTION_SYSTEM.md §2–5). Bundles travel + easing:
   *  - `default` — 16px rise, 0.55s ease-out (unchanged baseline).
   *  - `scene`   — 28px rise on `--dur-scene` + `--ease-gh-settle` (section headers).
   *  - `depth`   — 22px rise + subtle scale-settle on `--ease-gh-settle` (layered feel).
   *  - `carve`   — blur→sharp focus-pull + 18px rise, echoing the locked intro
   *    title's signature resolve. KEY editorial headings only; sharp at rest,
   *    RM/no-JS render it instantly sharp (never blurred, never unreadable).
   * Reduced-motion / no-JS fall back to the final visible state regardless.
   */
  variant?: 'default' | 'scene' | 'depth' | 'carve';
  /** Rendered element. Default `div`. */
  as?: ElementType;
  /** Optional element id — used for in-page anchors (e.g. heading slugs). */
  id?: string;
  /** C-25: render settled immediately, no scroll-entrance — a gallery returned
   *  to via back/forward should already BE there, not re-perform its curtain. */
  skip?: boolean;
};

/**
 * Reveal — cross-browser scroll-reveal primitive.
 *
 * Fades + rises its children into view once, with an optional staggered
 * delay. Built on IntersectionObserver + a CSS transition (Phase 6: this
 * replaced the framer-motion version so it stays OUT of the homepage's
 * First Load JS — the reveal is simple enough not to need an animation lib).
 *
 * The `.reveal` / `.reveal-shown` styles + the reduced-motion and no-JS
 * (`@media (scripting: none)`) fallbacks live in app/globals.css, so a
 * reduced-motion or no-JS visitor sees the final, visible state. Content is
 * always present in the DOM (opacity, not display) so it stays in the a11y
 * tree and is crawlable.
 */
export function Reveal({
  children,
  className,
  index = 0,
  staggerStep = 80,
  variant = 'default',
  as: Tag = 'div',
  id,
  skip = false,
}: RevealProps) {
  const [ref, inView] = useInViewOnce<HTMLElement>();
  const Comp = Tag as ElementType;
  // `skip` shows the final state at once; killing the transition makes it
  // instant (no re-fade) rather than a one-frame jump into the 900ms curtain.
  const shown = skip || inView;

  return (
    <Comp
      ref={ref}
      id={id}
      className={cn(
        'reveal',
        variant === 'scene' && 'reveal-scene',
        variant === 'depth' && 'reveal-depth',
        variant === 'carve' && 'reveal-carve',
        shown && 'reveal-shown',
        className,
      )}
      style={{
        ...(index ? { transitionDelay: `${index * staggerStep}ms` } : {}),
        ...(skip ? { transition: 'none' } : {}),
      }}
    >
      {children}
    </Comp>
  );
}
