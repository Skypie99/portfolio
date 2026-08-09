'use client';

import { type RefObject, useEffect, useState } from 'react';

/**
 * True once the element has scrolled within `rootMargin` of the viewport (and
 * stays true — one-shot, so a thumb signs once). Falls back to true when there
 * is no IntersectionObserver (SSR/old engines) so nothing is stranded.
 */
export function useInView(ref: RefObject<Element | null>, rootMargin = '400px'): boolean {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (inView) return;
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin, inView]);
  return inView;
}
