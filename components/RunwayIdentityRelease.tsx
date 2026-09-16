'use client';

import { useEffect } from 'react';

type RunwayIdentityReleaseProps = {
  /**
   * The homepage's runway waits for its in-flow content boundary. Interior
   * pages use the first heading as a readable-content boundary instead.
   */
  variant?: 'runway' | 'page';
};

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
export function RunwayIdentityRelease({ variant = 'runway' }: RunwayIdentityReleaseProps) {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const mark = document.querySelector<HTMLElement>('[data-runway-identity]');
    if (!mark) return;

    if (variant === 'page') {
      const heading = document.querySelector<HTMLElement>('main h1');
      if (!heading) return;

      /*
       * The page mark is fixed; document scroll positions would be brittle
       * across routes, text settings and browser chrome. Its own measured box
       * gives us the boundary instead: retire while the heading moves through a
       * buffer immediately below that box, and only restore once it has cleared
       * a full chip-height on the way back. Two observers provide that small
       * hysteresis without putting a layout read in the scroll path.
       */
      const priorPosition = heading.style.position;
      if (getComputedStyle(heading).position === 'static') heading.style.position = 'relative';

      const sentinel = document.createElement('span');
      sentinel.setAttribute('aria-hidden', 'true');
      sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none;';
      heading.prepend(sentinel);

      let retireObserver: IntersectionObserver | undefined;
      let restoreObserver: IntersectionObserver | undefined;

      const attach = () => {
        retireObserver?.disconnect();
        restoreObserver?.disconnect();

        const markRect = mark.getBoundingClientRect();
        const retireAt = markRect.bottom + 18;
        const restoreAt = markRect.bottom + markRect.height + 18;
        const rootMargin = (top: number) => `-${top}px 0px 0px 0px`;

        // A direct route/anchor arrival may start below the title. Retire only
        // once its reading boundary has actually reached the chip's clear lane;
        // the wider restore boundary is hysteresis for a return journey, not an
        // initial-arrival rule. That keeps the intended at-top brand visible
        // even if late font metrics settle the heading within a fraction of the
        // return line.
        mark.toggleAttribute('data-runway-done', heading.getBoundingClientRect().top < retireAt);

        retireObserver = new IntersectionObserver(
          ([entry]) => {
            if (!entry.isIntersecting && entry.boundingClientRect.top < retireAt) {
              mark.setAttribute('data-runway-done', '');
            }
          },
          { threshold: 0, rootMargin: rootMargin(retireAt) },
        );

        restoreObserver = new IntersectionObserver(
          ([entry]) => {
            // With the root's top edge placed at restoreAt, an entering 1px
            // sentinel is necessarily back below the full-chip buffer. Avoid a
            // second rounded geometry comparison here: subpixel font settling
            // can otherwise strand a correctly returned mark hidden at the top.
            if (entry.isIntersecting) mark.removeAttribute('data-runway-done');
          },
          { threshold: 0, rootMargin: rootMargin(restoreAt) },
        );

        retireObserver.observe(sentinel);
        restoreObserver.observe(sentinel);
      };

      attach();
      window.addEventListener('resize', attach, { passive: true });

      return () => {
        window.removeEventListener('resize', attach);
        retireObserver?.disconnect();
        restoreObserver?.disconnect();
        sentinel.remove();
        heading.style.position = priorPosition;
        mark.removeAttribute('data-runway-done');
      };
    }

    const content = document.querySelector('.cinematic-content-reveal');
    if (!content) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        mark.toggleAttribute(
          'data-runway-done',
          entry.isIntersecting && entry.intersectionRatio > 0,
        );
      },
      {
        // C-22 (2026-08-06) — see IntroScrollCue for the full account; this
        // component had the identical defect for the identical reason, and the
        // docblock above states the mechanism ("IO is not a scroll listener — it
        // fires only at the boundary crossing") without drawing its consequence.
        // Under reduced motion the wrapper is ALREADY intersecting at ratio 0 on
        // mount, so the only boundary crossing happens before the visitor has
        // scrolled; the ratio then grows without crossing anything and the
        // `ratio > 0` gate is never re-asked. The mark stayed pinned over the
        // sidebar wordmark for the whole page. Tiny multiple stops because the
        // ratio is target-relative and tops out near 0.099 here.
        threshold: [0, 0.001, 0.01, 0.05],
        rootMargin: '100000px 0px 0px 0px',
      },
    );
    io.observe(content);

    return () => {
      io.disconnect();
      mark.removeAttribute('data-runway-done');
    };
  }, [variant]);

  return null;
}
