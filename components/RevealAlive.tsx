'use client';

import { useEffect } from 'react';

/**
 * RevealAlive — the "hydration is alive" signal for the reveal failure floor
 * (L7-01, 2026-07-04). Renders nothing.
 *
 * An inline <head> script (app/layout.tsx) sets `html.js` before first paint
 * (arming the hidden scroll-reveal state with no flash) and starts a watchdog
 * that, after ~8s, adds `html.reveal-failsafe` to force every `.reveal` back to
 * its visible rest frame. This component's layout effect runs only if React
 * actually hydrated — i.e. the main bundle executed — and clears the watchdog.
 * If a chunk drops and hydration dies, this effect never runs, the watchdog
 * fires, and content is rescued to visible instead of being stranded forever.
 *
 * useEffect fires on hydration commit — the ~8s watchdog is far longer than the
 * sub-frame difference vs useLayoutEffect, and useEffect avoids the "does
 * nothing on the server" warning when Next SSRs this client component. It only
 * ever clearTimeout()s — it never touches <html>'s className, so React never
 * re-renders the root and drops the script-added `js` class.
 */
export function RevealAlive() {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.__revealFailsafe !== undefined) {
      clearTimeout(window.__revealFailsafe);
      window.__revealFailsafe = undefined;
    }
  }, []);

  return null;
}

declare global {
  interface Window {
    /** Watchdog timer id set by the inline <head> reveal-floor script. */
    __revealFailsafe?: ReturnType<typeof setTimeout>;
  }
}
