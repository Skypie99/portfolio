'use client';

/**
 * HeroSettle — signature moment #3 (Phase 4).
 *
 * Two thin wrappers for the case-study hero block. Both animate on MOUNT
 * (not scroll — they're above the fold on the detail page), mirroring the
 * cinematic landing's signature gesture:
 *
 *   1. HeroImageSettle: image well settles — opacity 0→1, scale 1.02→1,
 *      ~900ms, ease [0.22,1,0.36,1] (snappy easeOut).
 *   2. HeroTitleSettle: h1 carves in AFTER the image — opacity 0→1,
 *      y 12→0, letter-spacing 0.12em→-0.02em, delay ~150ms, ~520ms,
 *      ease [0.16,1,0.3,1] (power2.out). The tightening LS mirrors the
 *      cinematic wordmark gesture — loose → crystallised.
 *
 * Reduced motion: useReducedMotion() immediately renders the final/visible
 * state — no perturb on mount. SSR-safe: framer-motion only fires
 * `animate` after hydration, so the server renders both slots at their
 * final state (opacity:1, no transforms, LS at -0.02em). Initial state
 * is applied client-side after hydration — the brief flash is imperceptible
 * because the mount animation fires in the same frame.
 *
 * Existing markup is preserved: each wrapper accepts `children` + an
 * optional `className` forwarded to the motion element. All existing
 * classes/content on the image well and h1 live in page.tsx as before.
 */

import { type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

type SlotProps = {
  children: ReactNode;
  className?: string;
};

/**
 * HeroImageSettle — wraps the 4:5 hero image well.
 * Settles on mount: opacity 0→1, scale 1.02→1, ~900ms.
 */
export function HeroImageSettle({ children, className }: SlotProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    // Final state immediately — no scale, no opacity perturb.
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 1.02 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.9,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * HeroTitleSettle — wraps the case-study <h1>.
 * Carves in after the image: opacity 0→1, y 12→0,
 * letter-spacing 0.12em→-0.02em, delay 150ms, ~520ms.
 */
export function HeroTitleSettle({ children, className }: SlotProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    // Final state: resting letter-spacing, fully visible.
    return (
      <h1
        className={className}
        style={{ letterSpacing: '-0.02em' }}
      >
        {children}
      </h1>
    );
  }

  return (
    <motion.h1
      className={className}
      initial={{ opacity: 0, y: 12, letterSpacing: '0.12em' }}
      animate={{ opacity: 1, y: 0, letterSpacing: '-0.02em' }}
      transition={{
        duration: 0.52,
        ease: [0.16, 1, 0.3, 1],
        delay: 0.15,
      }}
    >
      {children}
    </motion.h1>
  );
}
