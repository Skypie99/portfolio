import { cn } from '@/lib/cn';

import styles from './editorial.module.css';

type HorizonRuleProps = {
  /**
   * 'mount'  — draws left-to-right on first paint (title bands, inside a plate).
   * 'reveal' — draws when its enclosing `<Reveal>` header arrives on scroll.
   * 'none'   — the resting hairline.
   * Reduced motion, print, no-JS and the dead-bundle floor all rest it drawn.
   */
  arrival?: 'mount' | 'reveal' | 'none';
  /** Width / spacing utilities (e.g. `w-24 mt-8`). */
  className?: string;
};

/**
 * HorizonRule — the About / Contact signature motif: the site's `.rule-ember`
 * hairline (terracotta → gold → air) that draws itself like a horizon at
 * golden hour. Decorative (`aria-hidden`); transform-only (`scaleX`, origin
 * left), so it never changes layout and never animates `width` (CLS 0).
 *
 * Markup matches the estate's existing `rule-ember block h-px` spans byte
 * for byte in its base classes; only the motion classes are added.
 */
export function HorizonRule({ arrival = 'none', className }: HorizonRuleProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'rule-ember block h-px',
        styles.horizon,
        arrival === 'mount' && styles.horizonMount,
        arrival === 'reveal' && styles.horizonReveal,
        className,
      )}
    />
  );
}
