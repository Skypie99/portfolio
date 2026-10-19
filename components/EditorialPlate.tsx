import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

import styles from './editorial.module.css';

type EditorialPlateProps = {
  children: ReactNode;
  className?: string;
  /**
   * 'mount' performs the arrival choreography on first paint (the title-band
   * use: the plate lands one scene-beat after the route h1 settles). 'none'
   * renders the resting plate. Reduced motion, print and no-animation
   * browsers always get the resting plate (components/editorial.module.css).
   */
  arrival?: 'mount' | 'none';
};

/**
 * EditorialPlate — the lit paper panel the About and Contact routes use to
 * hold the person: the portrait, the identity lines and the primary action
 * (Fable about + contact creative implementation, 2026-10-18).
 *
 * Server Component. The markup carries the visible FINAL state; the entrance
 * is CSS keyframes gated behind `prefers-reduced-motion: no-preference`, the
 * same idiom as `SettleHeading` (components/HeroSettle.tsx), so a hydration
 * failure, a dropped chunk or a no-JS visitor never sees a hidden plate. No
 * inline opacity or transform ever reaches the SSR markup.
 *
 * Material: `--rgb-surface-mid` paper (cream in light, a raised panel in
 * dark) with the site's own golden-hour wash behind the content and the
 * `.panel-lit` elevation. The wash and the approach-glow are decorative
 * (`aria-hidden`, behind the content, pointer-inert).
 */
export function EditorialPlate({ children, className, arrival = 'none' }: EditorialPlateProps) {
  return (
    <div
      className={cn(
        styles.plate,
        'relative panel-lit p-6 sm:p-7',
        arrival === 'mount' && styles.plateMount,
        className,
      )}
    >
      <span aria-hidden="true" className={styles.wash} />
      <span aria-hidden="true" className={styles.glow} />
      {children}
    </div>
  );
}

type EditorialRiseProps = {
  children: ReactNode;
  className?: string;
  /** 'late' starts three stagger steps after the plate's identity lines, so
   *  an action block rises after the name it belongs to. */
  timing?: 'default' | 'late';
};

/**
 * EditorialRise — stagger wrapper for a plate's direct children: each child
 * rises into place in reading order (`--stagger-step` apart) once the plate
 * has landed. Resting state is the plain block; the choreography is CSS-only
 * and reduced-motion / print / no-JS safe (see editorial.module.css).
 */
export function EditorialRise({ children, className, timing = 'default' }: EditorialRiseProps) {
  return (
    <div className={cn(styles.riseMount, timing === 'late' && styles.riseLate, className)}>
      {children}
    </div>
  );
}

/**
 * EditorialPortrait — the round portrait that sits over the plate's horizon
 * (the favicon's sun, at reading scale). Plain `<img>` with reserved
 * dimensions (zero CLS); `next/image` is off under `output: 'export'`.
 */
export function EditorialPortrait({
  src,
  alt,
  size,
  className,
  arrival = 'none',
}: {
  src: string;
  alt: string;
  /** Intrinsic square size in CSS px (the attribute pair; display size is the caller's class). */
  size: number;
  className?: string;
  arrival?: 'mount' | 'none';
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      decoding="async"
      className={cn(styles.portrait, arrival === 'mount' && styles.portraitMount, className)}
    />
  );
}
