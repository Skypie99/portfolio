'use client';

import type { ElementType, ReactNode } from 'react';

import { cn } from '@/lib/cn';
import { useInViewOnce } from '@/lib/motion';

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Stagger index — adds `index * 80ms` of transition delay. Default 0. */
  index?: number;
  /** Rendered element. Default `div`. */
  as?: ElementType;
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
export function Reveal({ children, className, index = 0, as: Tag = 'div' }: RevealProps) {
  const [ref, inView] = useInViewOnce<HTMLElement>();
  const Comp = Tag as ElementType;

  return (
    <Comp
      ref={ref}
      className={cn('reveal', inView && 'reveal-shown', className)}
      style={index ? { transitionDelay: `${index * 80}ms` } : undefined}
    >
      {children}
    </Comp>
  );
}
