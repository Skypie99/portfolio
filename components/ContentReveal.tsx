'use client';

import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

import { usePrefersReducedMotion } from '@/lib/motion';

/**
 * Wraps homepage content below the cinematic intro. The REST state is the
 * VISIBLE state: SSR, no-JS, and reduced-motion all render the wrapper with
 * no inline styles, so content is never stranded at opacity:0 (WCAG 2.3.3 /
 * 2.4.7) and hydration always matches the server markup. The scroll-linked
 * fade (scrollY [300,420] → opacity/y) is adopted client-side after mount,
 * only when motion is allowed — content sits below the pinned desert stage,
 * so the post-mount adoption of the hidden state is never on screen at the
 * top of the page. The element never remounts, and the
 * .cinematic-content-reveal class persists in every state (useDayNight
 * anchors on it — lib/motion.ts; the RM + mobile CSS floors in globals.css
 * override any inline style with !important, belt-and-braces).
 *
 * L7-04: plain rAF + passive scroll listener (the lib/motion compositor
 * discipline) — this wrapper was the ONLY framer-motion consumer in the
 * homepage's first load, so hand-rolling the two-value map drops the whole
 * ~111 KiB framer chunk from `/`.
 */
export function ContentReveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return; // never attach — the rest state IS the visible state
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const apply = () => {
      raf = 0;
      const t = Math.min(Math.max((window.scrollY - 300) / 120, 0), 1);
      el.style.opacity = String(t);
      el.style.transform = `translateY(${((1 - t) * 22).toFixed(2)}px)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
      // Release the inline styles so the CSS floors own the rest state again.
      el.style.opacity = '';
      el.style.transform = '';
    };
  }, [reduced]);

  return (
    <div ref={ref} className="cinematic-content-reveal">
      {children}
    </div>
  );
}
