'use client';

import { Fragment } from 'react';

import { cn } from '@/lib/cn';
import { usePrefersReducedMotion } from '@/lib/motion';

type KineticHeadingProps = {
  /** The full heading text — split into words for the staggered reveal. */
  text: string;
  className?: string;
  /** Class applied to EACH word span (e.g. a gradient like `ember`). Needed
   *  because a `background-clip:text` gradient on the <h1> does not paint
   *  through inline-block children — so the gradient must live on the words. */
  wordClassName?: string;
  /** Delay before the first word (ms). */
  baseDelay?: number;
  /** Per-word stagger step (ms). */
  step?: number;
};

/**
 * KineticHeading — the hero's signature "max drama" arrival (bolder pass).
 *
 * Splits the heading into words and rises each one in on a stagger, so the
 * whole line assembles word-by-word. Distinct from the landing's wordmark
 * gesture (which tightens letter-spacing) — this is a vertical word cascade.
 *
 * Accessibility / robustness:
 *  - The `<h1>` carries `aria-label={text}`; the per-word spans are
 *    `aria-hidden`, so a screen reader hears the whole heading once, not
 *    a stutter of words.
 *  - The animation is pure CSS (`.kinetic-word` + per-word `animation-delay`),
 *    so it runs even without JS, and the delays are server-rendered.
 *  - `.kinetic-word` is gated behind `@media (prefers-reduced-motion:
 *    no-preference)` in globals.css, and this component also drops the class
 *    entirely when `usePrefersReducedMotion()` is true — so reduced-motion
 *    visitors get the final, fully-visible heading with no animation.
 */
export function KineticHeading({ text, className, wordClassName, baseDelay = 120, step = 55 }: KineticHeadingProps) {
  const reduced = usePrefersReducedMotion();
  const words = text.split(' ');

  return (
    <h1 className={className} aria-label={text}>
      {words.map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          <span
            aria-hidden="true"
            className={cn('inline-block', wordClassName, !reduced && 'kinetic-word')}
            style={reduced ? undefined : { animationDelay: `${baseDelay + i * step}ms` }}
          >
            {word}
          </span>
          {i < words.length - 1 ? ' ' : ''}
        </Fragment>
      ))}
    </h1>
  );
}
