'use client';

import { useEffect, useRef } from 'react';

/** Keep the contact glow's phase while it is away from the viewport. */
export function AmbientDrift() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const contact = el?.closest('#contact');
    if (!el || !contact || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(([entry]) => {
      el.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
      el.style.willChange = entry.isIntersecting ? 'transform' : 'auto';
    }, { rootMargin: '400px 0px 400px 0px' });
    observer.observe(contact);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="ambient-drift pointer-events-none absolute -inset-[25%] z-0"
      style={{
        background:
          'radial-gradient(55% 50% at 50% 38%, rgb(var(--rgb-gold) / 0.22), rgb(var(--rgb-accent-soft) / 0.10) 46%, transparent 70%)',
        willChange: 'transform',
      }}
    />
  );
}
