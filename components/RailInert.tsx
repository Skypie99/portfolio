'use client';

import { useEffect } from 'react';

/**
 * RailInert — homepage-only chrome guard for the pinned desert scene (R3,
 * defects repair 2026-06-12).
 *
 * While the animated stage fully covers the viewport (the pin window), the
 * desktop rail's ~9 tab stops are completely obscured — WCAG 2.4.11 Focus
 * Not Obscured. This toggles the native `inert` attribute on the rail so
 * top-of-page focus order is: skip link → hero CTA (the sanctioned
 * skip-link journey), and releases it the moment the stage scrolls away.
 *
 * Derivation: the stage's ScrollTrigger progress is sealed inside the
 * PROTECTED cinematic component, so the pin state is derived chrome-side
 * from the same geometry that drives it — one IntersectionObserver on the
 * content wrapper (`.cinematic-content-reveal`), the stage's next in-flow
 * sibling. Its top edge IS the stage bottom, so "content not intersecting"
 * ⇔ "stage fully covers the viewport", and the release point is exactly
 * ScrollTrigger's `end: 'bottom bottom'`. IO is not a scroll listener and
 * fires only at boundary crossings — no per-frame work, no thrash.
 *
 * Engage gate: bails unless `.cdesert-stage` exists — under reduced motion
 * the cinematic renders its static frame (no stage, no pin), so chrome is
 * never inert for RM / static / no-JS visitors. Direct `toggleAttribute`
 * on the server-rendered nav (`[data-rail]`) keeps Sidebar a server
 * component; React 18 has no `inert` prop and never reconciles an
 * attribute it didn't render. Unmount (client navigation away) disconnects
 * and releases — non-home routes are never inert.
 */
export function RailInert() {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const stage = document.querySelector('.cdesert-stage');
    const content = document.querySelector('.cinematic-content-reveal');
    const rail = document.querySelector<HTMLElement>('[data-rail]');
    if (!stage || !content || !rail) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        rail.toggleAttribute('inert', !entry.isIntersecting);
      },
      { threshold: 0 },
    );
    io.observe(content);

    return () => {
      io.disconnect();
      rail.removeAttribute('inert');
    };
  }, []);

  return null;
}
