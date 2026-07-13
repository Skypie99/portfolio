'use client';

import { useEffect } from 'react';

/**
 * RunwayIdentityRelease — retires the RunwayIdentity mark when the wordless
 * cinematic runway ends (L1-01 / S17 handoff).
 *
 * The mark holds the top-left corner through the runway; once the post-runway
 * content arrives it must step aside (it would otherwise overlap the revealed
 * desktop sidebar wordmark and float over body content). We reuse the exact
 * geometry RailInert already trusts: one IntersectionObserver on the content
 * wrapper (`.cinematic-content-reveal`, the intro's next in-flow sibling, whose
 * top edge is the stage bottom). "content intersecting" ⇔ "runway is over", so
 * we toggle `data-runway-done` on the mark and CSS fades it out.
 *
 * Two guards mirror RailInert's top-open repair:
 *  - Top-open rootMargin ('100000px 0px 0px 0px', C-20): the wrapper is also
 *    "not intersecting" once scrolled entirely above the viewport (resting
 *    bottom), which would un-retire the mark and double it over the footer.
 *    Growing the root upward keeps the mark "done" past the bottom.
 *  - Strict-intersection gate (intersectionRatio > 0, C-21): the reduced-motion
 *    static frame reports isIntersecting=true at ratio 0 on mount, retiring the
 *    mark before the RM visitor ever sees the arrival chip. Requiring a real
 *    ratio keeps that chip alive.
 *
 * Unlike RailInert this does NOT gate on `.cdesert-stage`: under reduced motion
 * the intro is a single static frame, and the mark must still retire once the
 * content below it scrolls into view. IO is not a scroll listener — it fires
 * only at the boundary crossing. Renders null; degrades to "mark stays visible"
 * without JS (the rest-visible floor), which is safe — it never hides content.
 */
export function RunwayIdentityRelease() {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const content = document.querySelector('.cinematic-content-reveal');
    const mark = document.querySelector<HTMLElement>('[data-runway-identity]');
    if (!content || !mark) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        mark.toggleAttribute(
          'data-runway-done',
          entry.isIntersecting && entry.intersectionRatio > 0,
        );
      },
      { threshold: 0, rootMargin: '100000px 0px 0px 0px' },
    );
    io.observe(content);

    return () => {
      io.disconnect();
      mark.removeAttribute('data-runway-done');
    };
  }, []);

  return null;
}
