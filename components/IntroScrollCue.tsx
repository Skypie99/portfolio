'use client';

import { useEffect, useRef } from 'react';

/**
 * IntroScrollCue — the whisper-weight scroll-continuation cue [T6 / W2-01].
 *
 * The locked cinematic runs a long pinned scrub with zero orientation inside
 * it: a first-timer can't tell the scroll IS the skip, or that there's a
 * destination below the film. This surfaces the SAME "Scroll ↓" affordance the
 * Hero already uses one viewport later (components/Hero.tsx) INSIDE the intro,
 * at the same weight and grammar — the only honest lever inside the locked-film
 * fence (the film's imagery, timing, and 380vh budget are untouched).
 *
 * It is a fixed SIBLING of <CinematicDesert/>, never a child — it does not
 * touch components/cinematic/** or the T3-owned observers. Decorative
 * orientation, not a link: no href, aria-hidden, pointer-events:none, no tab
 * stop — the sr-only skip-link stays the sole keyboard truth through the intro.
 *
 * Retirement reuses the exact geometry RailInert / RunwayIdentityRelease trust
 * — one IntersectionObserver on the post-intro content wrapper
 * (`.cinematic-content-reveal`); once it arrives the cue fades out (CSS on
 * [data-cue-done]). Without this a fixed cue would float over every section
 * below the intro forever (a permanent nag, not a whisper). Two guards mirror
 * that pattern: the top-open rootMargin ('100000px 0px 0px 0px') so the resting
 * page bottom never un-retires it, and the strict intersectionRatio > 0 gate so
 * the reduced-motion static frame's ratio-0 mount can't retire it before it is
 * ever seen. Not gated on `.cdesert-stage`: under RM the intro is a single
 * static frame and the cue must still retire once content scrolls in.
 *
 * The cue is in the static HTML at first paint; degrades to "cue stays visible"
 * without JS (the rest-visible floor) — benign, it never blocks anything
 * (aria-hidden, pointer-events:none). CLS: fixed node, opacity/visibility
 * transitions only → 0.
 */
export function IntroScrollCue() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const content = document.querySelector('.cinematic-content-reveal');
    const el = ref.current;
    if (!content || !el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        el.toggleAttribute(
          'data-cue-done',
          entry.isIntersecting && entry.intersectionRatio > 0,
        );
      },
      { threshold: 0, rootMargin: '100000px 0px 0px 0px' },
    );
    io.observe(content);

    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} aria-hidden="true" className="intro-scroll-cue">
      <span className="intro-scroll-cue-glyph inline-flex flex-col items-center gap-1.5 font-mono text-meta tracking-label uppercase">
        <span>Scroll</span>
        <span className="text-[1rem] leading-none">{'↓'}</span>
      </span>
    </div>
  );
}
