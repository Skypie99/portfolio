'use client';

import { useRef, type ElementType, type ReactNode } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

type RevealProps = {
  children: ReactNode;
  className?: string;
  /**
   * Stagger index — multiplied by 0.08 s to stagger siblings.
   * Default 0 (no extra delay).
   */
  index?: number;
  /**
   * Rendered HTML element. Default `div`.
   */
  as?: ElementType;
};

/**
 * Reveal — shared scroll-reveal primitive (Phase 2).
 *
 * Wraps content in a framer-motion element that fades up into view when
 * it enters the viewport. Respects prefers-reduced-motion: when reduced
 * motion is preferred, the element renders immediately at its final state
 * with no transform or animation.
 *
 * Phase 4 will wire this into pages in place of the CSS .reveal-on-scroll
 * class, which has known Firefox scroll-driven-animation issues.
 *
 * Mirrors patterns from AnimatedStepList.tsx and WorkFilterGrid.tsx:
 * - useReducedMotion() guard gates all animation props
 * - useInView with { once: true, margin: '-80px' } (matching WorkFilterGrid)
 * - motion.<as> for semantic flexibility
 */
export function Reveal({ children, className, index = 0, as = 'div' }: RevealProps) {
  // The ref is typed broadly because motion[as] can be any HTML element;
  // we cast here to satisfy framer-motion's RefObject<HTMLDivElement> expectation.
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const shouldReduceMotion = useReducedMotion();

  const MotionComponent = motion[as as keyof typeof motion] as typeof motion.div;

  if (shouldReduceMotion) {
    // Render at final visible state — no transform, no animation.
    return (
      <MotionComponent ref={ref} className={className}>
        {children}
      </MotionComponent>
    );
  }

  return (
    <MotionComponent
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1],
        delay: index * 0.08,
      }}
    >
      {children}
    </MotionComponent>
  );
}
