import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

type TagPillProps = {
  children: ReactNode;
  className?: string;
};

/**
 * TagPill — Dani §3.8 canonical primitive.
 *
 * Shape: rounded-pill (999px). Background sand (#FBCFAC).
 * Text: DM Mono, 11px (text-meta), UPPERCASE, tracking-label, Umber.
 * Padding: px-3 py-1 (12px horizontal, 4px vertical) per --space-3/--space-1.
 *
 * Used for tech stack on cards (ProjectCard, /work/[slug], homepage selected
 * work). Extracted in Cycle 8 to deduplicate four identical inline copies
 * of the same className combo. If Dani's spec changes, only this file moves.
 */
export function TagPill({ children, className }: TagPillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-pill',
        'bg-sand text-umber',
        'font-mono text-meta tracking-label uppercase',
        'transition-colors duration-fast ease-out',
        className,
      )}
    >
      {children}
    </span>
  );
}
