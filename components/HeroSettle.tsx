/**
 * HeroSettle — signature moment #3 (Phase 4; CSS conversion fix(settle) 2026-06-10).
 *
 * Three thin wrappers that settle a page's flagship elements on arrival,
 * mirroring the cinematic landing's signature gesture:
 *
 *   1. HeroImageSettle: image well settles — opacity 0→1, scale 1.02→1,
 *      ~900ms, ease [0.22,1,0.36,1] (snappy easeOut).
 *   2. HeroTitleSettle: h1 carves in AFTER the image — opacity 0→1,
 *      y 12→0, letter-spacing 0.12em→-0.02em, delay ~150ms, ~520ms,
 *      ease [0.16,1,0.3,1] (power2.out). The tightening LS mirrors the
 *      cinematic wordmark gesture — loose → crystallised.
 *   3. SettleHeading: the same gesture generalized for every route page's
 *      <h1> — opacity 0→1, y 8→0, letter-spacing 0.10em→-0.02em, ~560ms.
 *
 * These are SERVER components: the markup carries the visible FINAL state
 * and the entrance lives entirely in CSS (`.settle-heading`,
 * `.hero-settle-title`, `.hero-settle-img` — globals.css, same idiom as
 * .hero-enter). The previous framer-motion version SSR'd its `initial`
 * state as inline `opacity:0`, which permanently stranded reduced-motion
 * visitors (hydration branch mismatch leaves the baked style unpatched)
 * and no-JS visitors (the scripting:none block doesn't reach inline
 * styles) with invisible titles and heroes on hard loads. CSS keyframes
 * gated behind `prefers-reduced-motion: no-preference` give the identical
 * motion with a readable end frame for everyone else — no JS, no rAF.
 *
 * `restLetterSpacing` pins a different resting letter-spacing than the
 * default -0.02em via the `--ls-rest` custom property.
 */

import { type CSSProperties, type ReactNode } from 'react';

import { cn } from '@/lib/cn';

type SlotProps = {
  children: ReactNode;
  className?: string;
};

/**
 * HeroImageSettle — wraps the case-study hero image well.
 * Settles on arrival: opacity 0→1, scale 1.02→1, ~900ms (CSS).
 */
export function HeroImageSettle({ children, className }: SlotProps) {
  return <div className={cn('hero-settle-img', className)}>{children}</div>;
}

/**
 * HeroTitleSettle — wraps the case-study <h1>.
 * Carves in after the image: opacity 0→1, y 12→0,
 * letter-spacing 0.12em→-0.02em, delay 150ms, ~520ms (CSS).
 */
export function HeroTitleSettle({ children, className }: SlotProps) {
  return <h1 className={cn('hero-settle-title', className)}>{children}</h1>;
}

/**
 * SettleHeading — the title gesture generalized for every route page's
 * <h1> (organic-pass 2026-06-03, signature move #3). Carves in on arrival
 * so every page header crystallises the way the detail-page title and the
 * cinematic wordmark do, instead of popping in flat.
 */
export function SettleHeading({
  children,
  className,
  restLetterSpacing,
}: SlotProps & { restLetterSpacing?: string }) {
  return (
    <h1
      className={cn('settle-heading', className)}
      style={
        restLetterSpacing
          ? ({ '--ls-rest': restLetterSpacing } as CSSProperties)
          : undefined
      }
    >
      {children}
    </h1>
  );
}
