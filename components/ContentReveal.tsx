import type { ReactNode } from 'react';

/**
 * Wraps homepage content below the cinematic intro. The REST state is the
 * VISIBLE state: SSR, no-JS, and reduced-motion all render the wrapper with no
 * inline styles, so content is never stranded at opacity:0 (WCAG 2.3.3 /
 * 2.4.7) and hydration always matches the server markup. The
 * .cinematic-content-reveal class persists in every state — useDayNight
 * anchors the day→night arc on it (lib/motion.ts), and the RM + mobile CSS
 * floors in globals.css keep the rest state visible, belt-and-braces.
 *
 * MOTION MACHINERY REMOVED (motion-clockwork 2026-07-19): this wrapper used to
 * run a scroll-linked entrance fade mapping scrollY [300,420] → opacity/rise.
 * But the wrapper's first visible pixel sits BELOW the pinned desert stage —
 * thousands of pixels past scrollY 420 — so the fade had saturated long before
 * any visitor could see it: a session-long scroll listener + rAF driving an
 * animation nobody ever witnessed. Worse, the permanently-held inline
 * `translateY(0.00px)` made this whole-page wrapper a CONTAINING BLOCK for any
 * `position: fixed` descendant. The arrival frame visitors actually see is the
 * settled rest state — which is exactly what now renders, with zero listeners
 * and no transform. (This also honors the ratified U1 mandate at this seam:
 * gravity, never magnetism.) If a witnessed, geometry-keyed entrance is ever
 * wanted here, key it to the wrapper's real offsetTop on the shared motion
 * clock — see the motion-clockwork qa-report, stretch S2.
 */
export function ContentReveal({ children }: { children: ReactNode }) {
  return <div className="cinematic-content-reveal">{children}</div>;
}
