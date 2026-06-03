'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Tiny dependency-free motion hooks (Phase 6 perf).
 *
 * The homepage reveal + count-up moments are simple enough to drive with
 * IntersectionObserver + CSS transitions + rAF — so they don't pull
 * framer-motion's `useInView`/`animate` into the homepage's First Load JS.
 * Both hooks are SSR-safe (start in the static/final-safe state) and the
 * count/reveal CSS is gated on `prefers-reduced-motion` elsewhere.
 */

/** Returns `[ref, inView]`; `inView` flips true once when the element first
 *  enters the viewport, then the observer disconnects (one-shot). */
export function useInViewOnce<T extends Element = HTMLElement>(
  rootMargin = '0px 0px -80px 0px',
) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (inView) return;
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true); // no IO support → just show
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [inView, rootMargin]);

  return [ref, inView] as const;
}

/** Tracks `prefers-reduced-motion: reduce`. SSR-safe (starts false; resolves
 *  on mount), so server render + first paint never assume reduced. */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    // Guard: matchMedia is absent in jsdom / non-DOM envs — stay at the
    // default (false) rather than throw (mirrors the IntersectionObserver
    // guard in useInViewOnce).
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
