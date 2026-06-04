'use client';

import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

import { CertCard } from '@/components/CertCard';
import type { Certificate } from '@/lib/schema';

type AnimatedCertGridProps = {
  certificates: Certificate[];
};

const itemVariants = {
  // Weighted landing — matches the /work grid cascade (rise + slight depth).
  hidden: { opacity: 0, y: 24, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: [0.22, 0.9, 0.26, 1] as const },
  },
};

/**
 * AnimatedCertGrid — credential cards (CertCard, liquid-glass) with a staggered
 * weighted fade-in-up triggered when the grid scrolls into view. Respects
 * prefers-reduced-motion (renders final state, no perturb).
 */
export function AnimatedCertGrid({ certificates }: AnimatedCertGridProps) {
  const ref = useRef<HTMLUListElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const shouldReduceMotion = useReducedMotion();

  return (
    <ul ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
      {certificates.map((c, i) => (
        <motion.li
          key={c.id}
          variants={shouldReduceMotion ? undefined : itemVariants}
          initial={shouldReduceMotion ? undefined : 'hidden'}
          animate={shouldReduceMotion ? undefined : isInView ? 'visible' : 'hidden'}
          transition={
            shouldReduceMotion
              ? undefined
              : { delay: i * 0.09, duration: 0.7, ease: [0.22, 0.9, 0.26, 1] }
          }
        >
          <CertCard certificate={c} />
        </motion.li>
      ))}
    </ul>
  );
}
