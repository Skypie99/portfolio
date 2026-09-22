'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

/** Put a client-side arrival at the beginning of its new main region. */
export function RouteFocus() {
  const pathname = usePathname();
  const previousPath = useRef(pathname);
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    const previous = previousPath.current;
    previousPath.current = pathname;
    if (!pathname || !previous || pathname === previous) return;

    // The private archive has its own auth flow and focus behavior.
    if (pathname.startsWith('/archive') || previous.startsWith('/archive')) return;

    const main = document.getElementById('main');
    if (!main) return;

    // Next owns scroll restoration, including Back. preventScroll keeps focus
    // from turning a restored position into an unintended jump.
    main.focus({ preventScroll: true });
    const heading = main.querySelector('h1')?.textContent?.trim();
    setAnnouncement(`${heading || document.title} page loaded`);
  }, [pathname]);

  return (
    <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {announcement}
    </p>
  );
}
