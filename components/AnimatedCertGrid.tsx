'use client';

import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

import BadgeImage from '@/components/BadgeImage';
import { CredentialBadge } from '@/components/CredentialBadge';
import { cn } from '@/lib/cn';
import type { Certificate } from '@/lib/schema';

type AnimatedCertGridProps = {
  certificates: Certificate[];
};

function formatIssuedDate(iso: string): string {
  const [yearStr, monthStr] = iso.split('-');
  const year = Number(yearStr);
  const monthIdx = Number(monthStr) - 1;
  const MONTHS = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
  ];
  const month = MONTHS[monthIdx] ?? '';
  return `ISSUED ${month} ${year}`;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

/**
 * AnimatedCertGrid — renders credential badge cards with a staggered
 * fade-in-up triggered when the grid scrolls into view.
 *
 * Accepts `formatDate` as a prop so the ISO→display formatting stays
 * in the Server Component (pure function, no client JS needed).
 *
 * Respects prefers-reduced-motion.
 */
export function AnimatedCertGrid({ certificates }: AnimatedCertGridProps) {
  const ref = useRef<HTMLUListElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const shouldReduceMotion = useReducedMotion();

  return (
    <ul
      ref={ref}
      className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10"
    >
      {certificates.map((c, i) => (
        <motion.li
          key={c.id}
          variants={shouldReduceMotion ? undefined : itemVariants}
          initial={shouldReduceMotion ? undefined : 'hidden'}
          animate={shouldReduceMotion ? undefined : (isInView ? 'visible' : 'hidden')}
          transition={
            shouldReduceMotion
              ? undefined
              : { delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }
          }
        >
          <article
            className={cn(
              'work-card group',
              'h-full flex flex-col',
              'bg-blush dark:bg-surface-mid border border-border-decorative',
              'p-8',
              'rounded-lg',
              'transition-all duration-base ease-out',
              'hover:border-pebble hover:shadow-[var(--shadow-elevation-2)] hover:-translate-y-0.5',
              'focus-within:border-pebble',
            )}
          >
            {/* Badge image well */}
            <div
              className="relative w-full aspect-square border border-border-decorative mb-6 overflow-hidden flex items-center justify-center"
              style={{
                background:
                  'radial-gradient(60% 60% at 50% 40%, rgb(var(--rgb-surface-warm)) 0%, rgb(var(--rgb-surface-mid)) 55%, rgb(var(--rgb-canvas-alt)) 100%)',
              }}
            >
              <BadgeImage
                src={c.badgeImage.src}
                alt={c.badgeImage.alt}
                className={cn(
                  'absolute inset-0 w-full h-full object-contain p-4',
                  'transition-transform duration-slow ease-out',
                  'group-hover:scale-[1.02] group-focus-within:scale-[1.02]',
                )}
              />
            </div>

            {/* Issuer */}
            <p className="font-mono text-meta tracking-label uppercase text-sage-text mb-2">
              {c.issuer}
            </p>

            {/* Title — h3 per Alex F-C4-2 (h1 page → h2 sr-only section → h3 card) */}
            <h3 className="font-serif font-normal text-step-2 text-near-black leading-tight mb-3">
              {c.title}
            </h3>

            {/* Issued date */}
            <p className="font-mono text-meta tracking-label uppercase text-sage-text mb-6">
              {formatIssuedDate(c.issuedDate)}
            </p>

            <div className="mt-auto">
              <CredentialBadge label={c.title} href={c.credentialUrl} />
            </div>
          </article>
        </motion.li>
      ))}
    </ul>
  );
}
