'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { notePopstate, resolveArrivalFocus } from '@/lib/returnFocus';

/** Put a client-side arrival at the beginning of its new main region. */
export function RouteFocus() {
  const pathname = usePathname();
  const previousPath = useRef(pathname);
  const [announcement, setAnnouncement] = useState('');

  // W4-02 · N1 — the return seat: history traversals (Back/Forward, the iOS
  // edge-swipe) are popstate events no push fires, so this listener is the
  // one honest way to tell a RETURN apart from a fresh forward arrival.
  // Mounted for the component's whole lifetime (it persists across client
  // navigations in the root layout), and only flips a flag — no timing, no
  // guessing; the pathname effect below consumes it on the next commit.
  useEffect(() => {
    window.addEventListener('popstate', notePopstate);
    return () => window.removeEventListener('popstate', notePopstate);
  }, []);

  useEffect(() => {
    const previous = previousPath.current;
    previousPath.current = pathname;
    if (!pathname || !previous || pathname === previous) return;

    // The private archive has its own auth flow and focus behavior.
    if (pathname.startsWith('/archive') || previous.startsWith('/archive')) return;

    const main = document.getElementById('main');
    if (!main) return;

    // W4-02 · N1: a keyboard reader returning by Back to the work list they
    // departed from is reseated on the row link they activated (in-memory
    // record, popstate-only, keyboard-only — lib/returnFocus). Everything
    // else — forward arrivals, direct visits, pointer departures, missing or
    // unrendered links — keeps the shipped focus-to-main orientation.
    const seat = resolveArrivalFocus(previous, pathname);
    if (seat) {
      // Next owns scroll restoration, including Back. preventScroll keeps
      // focus from turning a restored position into an unintended jump.
      seat.focus({ preventScroll: true });
    } else {
      // Next owns scroll restoration, including Back. preventScroll keeps
      // focus from turning a restored position into an unintended jump.
      main.focus({ preventScroll: true });
    }
    const heading = main.querySelector('h1')?.textContent?.trim();
    setAnnouncement(`${heading || document.title} page loaded`);
  }, [pathname]);

  return (
    <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {announcement}
    </p>
  );
}
