'use client';

import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

import { NumberedStep } from '@/components/NumberedStep';

type Step = {
  number: string;
  title: string;
  body: string;
};

type AnimatedStepListProps = {
  steps: Step[];
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

/**
 * AnimatedStepList — renders NumberedStep items with a staggered
 * fade-in-up triggered when the list scrolls into view.
 *
 * Respects prefers-reduced-motion: when reduced motion is preferred,
 * items render immediately with no animation.
 */
export function AnimatedStepList({ steps }: AnimatedStepListProps) {
  const ref = useRef<HTMLOListElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const shouldReduceMotion = useReducedMotion();

  return (
    <ol ref={ref} className="flex flex-col divide-y divide-border-decorative">
      {steps.map((step, i) => (
        <motion.li
          key={step.number}
          className="py-12 first:pt-0 last:pb-0"
          variants={shouldReduceMotion ? undefined : itemVariants}
          initial={shouldReduceMotion ? undefined : 'hidden'}
          animate={shouldReduceMotion ? undefined : (isInView ? 'visible' : 'hidden')}
          transition={
            shouldReduceMotion
              ? undefined
              : { delay: i * 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] }
          }
        >
          <NumberedStep
            number={step.number}
            title={step.title}
            body={step.body}
          />
        </motion.li>
      ))}
    </ol>
  );
}
