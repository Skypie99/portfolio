'use client';

import { useEffect } from 'react';

/**
 * RailInert — homepage-only chrome guard for the pinned desert scene (R3,
 * defects repair 2026-06-12).
 *
 * While either full-bleed intro variant covers the viewport, the desktop
 * rail's tab stops are completely obscured. This is the WCAG 2.4.11 Focus Not
 * Obscured case.
 * This toggles the native `inert` attribute on the rail so top-of-page focus
 * order stays on visible controls, and releases it when the intro scrolls away.
 *
 * Derivation: the stage's ScrollTrigger progress is sealed inside the
 * PROTECTED cinematic component, so the state is derived chrome-side from one
 * IntersectionObserver on `.cinematic-content-reveal`, the intro's next
 * in-flow sibling. The observer root keeps only the top 1% of the viewport as
 * the release band. A positive intersection therefore means at least 99% of
 * the full-bleed intro has cleared, including every rail focus target. This is
 * still boundary-driven work, not a scroll listener.
 *
 * Top-open guard (C-20): "content not intersecting" is true both before the
 * wrapper arrives and after it scrolls entirely above the viewport. Growing
 * the root far upward keeps past content intersecting, so the rail never
 * becomes inert again at the footer. The strict positive-ratio check preserves
 * the edge-touch state as guarded.
 *
 * Engage gate: bails unless either `.cdesert-stage` or `.cdesert-static`
 * exists. The static reduced-motion scene is still a full-viewport,
 * full-bleed layer above the rail, so it needs the same focus guard even
 * though it has no pin or timeline. Direct `toggleAttribute` on the
 * server-rendered nav (`[data-rail]`) keeps Sidebar a server component;
 * React 18 has no `inert` prop and never reconciles an attribute it didn't
 * render. Unmount (client navigation away) disconnects and releases;
 * non-home routes are never inert.
 */
export function RailInert() {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const intro = document.querySelector('.cdesert-stage, .cdesert-static');
    const content = document.querySelector('.cinematic-content-reveal');
    const rail = document.querySelector<HTMLElement>('[data-rail]');
    if (!intro || !content || !rail) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        const introHasCleared = entry.isIntersecting && entry.intersectionRatio > 0;
        rail.toggleAttribute('inert', !introHasCleared);
      },
      { threshold: 0, rootMargin: '100000px 0px -99% 0px' },
    );
    io.observe(content);

    return () => {
      io.disconnect();
      rail.removeAttribute('inert');
    };
  }, []);

  return null;
}
