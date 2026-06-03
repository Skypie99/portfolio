'use client';

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import type { ReactNode } from 'react';

/**
 * Wraps homepage content so it fades up into view as the cinematic intro
 * completes. The intro's scroll budget is 400px; content is fully visible
 * by the time the sticky scene exits. SSR renders opacity:0 which Framer
 * corrects immediately on hydration by reading the current scrollY.
 */
export function ContentReveal({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [300, 420], [0, 1]);
  const y = useTransform(scrollY, [300, 420], [22, 0]);

  // Reduced motion: skip the scroll-linked fade — render content fully visible
  // so it's never stuck at opacity:0 (WCAG 2.3.3) and keyboard focus never
  // lands on invisible content (2.4.7). [Alex P8 finding HIGH-3.]
  if (reduced) {
    return <div className="cinematic-content-reveal">{children}</div>;
  }

  return (
    <motion.div className="cinematic-content-reveal" style={{ opacity, y }}>
      {children}
    </motion.div>
  );
}
