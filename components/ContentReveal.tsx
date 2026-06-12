'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import type { ReactNode } from 'react';

/**
 * Wraps homepage content below the cinematic intro. The REST state is the
 * VISIBLE state: SSR, no-JS, and reduced-motion all render the wrapper with
 * no inline styles, so content is never stranded at opacity:0 (WCAG 2.3.3 /
 * 2.4.7) and hydration always matches the server markup. The scroll-linked
 * fade (scrollY [300,420] → opacity/y) is adopted client-side after mount,
 * only when motion is allowed — content sits below the pinned desert stage,
 * so the post-mount adoption of the hidden state is never on screen at the
 * top of the page. The element type never changes (always motion.div) so the
 * subtree is never remounted, and the .cinematic-content-reveal class
 * persists in every state (useDayNight anchors on it — lib/motion.ts).
 */
export function ContentReveal({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [300, 420], [0, 1]);
  const y = useTransform(scrollY, [300, 420], [22, 0]);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <motion.div
      className="cinematic-content-reveal"
      style={mounted && !reduced ? { opacity, y } : undefined}
    >
      {children}
    </motion.div>
  );
}
