'use client';

import { useEffect, useLayoutEffect, useState } from 'react';
import type { ElementType, ReactNode } from 'react';

import { cn } from '@/lib/cn';
import { useInViewOnce } from '@/lib/motion';

/* U4 (A-04) — seated fragment arrivals. The layout.tsx head script sets
   `reveal-seat` on <html> pre-paint when the document loads WITH a
   location.hash; globals.css seats every .reveal under it for the hydration
   window. At hydration each Reveal adopts as seated if it sits at/above the
   arming band, then the class is released (rAF-aligned, idempotent) so
   below-viewport reveals re-arm UNSEEN — `reveal-rearm` suppresses the 0.55s
   opacity decay for exactly that recalc. Keyed on the CLASS, never live
   location.hash, so TOC clicks / client navs / bfcache never enter this path. */
const SEAT = 'reveal-seat';
const REARM = 'reveal-rearm';

/* SSR renders Reveal, so the layout effect is isomorphic-guarded (the server
   never runs it; the guard silences React's SSR useLayoutEffect warning). */
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/** One-shot release of the pre-paint seat. Every Reveal that saw the class
 *  schedules it; the first rAF to run does the work, the rest no-op. rAF-
 *  aligned so {add rearm, remove seat} land in ONE style recalc; rearm drops
 *  two frames later, after that recalc has been consumed. setTimeout floor
 *  for jsdom / ancient webviews. */
function releaseSeat() {
  const raf: (cb: () => void) => void =
    typeof requestAnimationFrame === 'function'
      ? (cb) => void requestAnimationFrame(() => cb())
      : (cb) => void setTimeout(cb, 0);
  raf(() => {
    const d = document.documentElement;
    if (!d.classList.contains(SEAT)) return; // already released
    d.classList.add(REARM);
    d.classList.remove(SEAT);
    raf(() => raf(() => d.classList.remove(REARM)));
  });
}

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Stagger index — adds `index * staggerStep` of transition delay. Default 0. */
  index?: number;
  /** Per-index stagger delay in ms. Default 80 (`--stagger-step`); use 120
   *  (`--stagger-scene`) for larger, more deliberate sequences. */
  staggerStep?: number;
  /**
   * Motion register (see MOTION_SYSTEM.md §2–5). Bundles travel + easing:
   *  - `default` — 16px rise, 0.55s ease-out (unchanged baseline).
   *  - `scene`   — 28px rise on `--dur-scene` + `--ease-gh-settle` (section headers).
   *  - `depth`   — 22px rise + subtle scale-settle on `--ease-gh-settle` (layered feel).
   *  - `carve`   — blur→sharp focus-pull + 18px rise, echoing the locked intro
   *    title's signature resolve. KEY editorial headings only; sharp at rest,
   *    RM/no-JS render it instantly sharp (never blurred, never unreadable).
   * Reduced-motion / no-JS fall back to the final visible state regardless.
   */
  variant?: 'default' | 'scene' | 'depth' | 'carve';
  /** Rendered element. Default `div`. */
  as?: ElementType;
  /** Optional element id — used for in-page anchors (e.g. heading slugs). */
  id?: string;
  /** C-25: render settled immediately, no scroll-entrance — a gallery returned
   *  to via back/forward should already BE there, not re-perform its curtain. */
  skip?: boolean;
};

/**
 * Reveal — cross-browser scroll-reveal primitive.
 *
 * Fades + rises its children into view once, with an optional staggered
 * delay. Built on IntersectionObserver + a CSS transition (Phase 6: this
 * replaced the framer-motion version so it stays OUT of the homepage's
 * First Load JS — the reveal is simple enough not to need an animation lib).
 *
 * The `.reveal` / `.reveal-shown` styles + the reduced-motion and no-JS
 * (`@media (scripting: none)`) fallbacks live in app/globals.css, so a
 * reduced-motion or no-JS visitor sees the final, visible state. Content is
 * always present in the DOM (opacity, not display) so it stays in the a11y
 * tree and is crawlable.
 */
export function Reveal({
  children,
  className,
  index = 0,
  staggerStep = 80,
  variant = 'default',
  as: Tag = 'div',
  id,
  skip = false,
}: RevealProps) {
  const [ref, inView] = useInViewOnce<HTMLElement>();
  const Comp = Tag as ElementType;
  const [seated, setSeated] = useState(false);

  // U4 — fragment-arrival adoption. Runs pre-paint (layout effect): a Reveal
  // at/above the arming band adopts the seated state via the skip idiom, so
  // the seated re-render commits before the release rAF ever paints. The 1.2
  // band mirrors useInViewOnce's '0px 0px 20% 0px' pre-arm (lib/motion.ts —
  // keep in sync by eye): anything inside it would be IO-shown at hydration
  // anyway; seating it instead removes the one race a mid-hydration flick
  // could catch. `releaseSeat` is unconditional — pages whose reveals all sit
  // below the viewport must still release and re-arm.
  useIsoLayoutEffect(() => {
    if (!document.documentElement.classList.contains(SEAT)) return;
    const el = ref.current;
    if (el && el.getBoundingClientRect().top < window.innerHeight * 1.2) {
      setSeated(true);
    }
    releaseSeat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // `skip` (and a U4 seated adoption) shows the final state at once; killing
  // the transition makes it instant (no re-fade) rather than a one-frame jump
  // into the 900ms curtain.
  const shown = skip || seated || inView;

  return (
    <Comp
      ref={ref}
      id={id}
      className={cn(
        'reveal',
        variant === 'scene' && 'reveal-scene',
        variant === 'depth' && 'reveal-depth',
        variant === 'carve' && 'reveal-carve',
        shown && 'reveal-shown',
        className,
      )}
      style={{
        ...(index ? { transitionDelay: `${index * staggerStep}ms` } : {}),
        ...(skip || seated ? { transition: 'none' } : {}),
      }}
    >
      {children}
    </Comp>
  );
}
