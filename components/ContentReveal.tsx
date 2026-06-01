'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import type { ReactNode } from 'react';

/**
 * Wraps homepage content so it fades up into view as the cinematic intro
 * completes. The intro's scroll budget is 400px; content is fully visible
 * by the time the sticky scene exits. SSR renders opacity:0 which Framer
 * corrects immediately on hydration by reading the current scrollY.
 */
export function ContentReveal({ children }: { children: ReactNode }) {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [300, 420], [0, 1]);
  const y = useTransform(scrollY, [300, 420], [22, 0]);

  return (
    <motion.div className="cinematic-content-reveal" style={{ opacity, y }}>
      {children}
    </motion.div>
  );
}
