'use client';

import { useEffect, useRef } from 'react';

import { cn } from '@/lib/cn';

/**
 * IntroSkip — a real, clickable way past the locked cinematic runway (P2-6).
 *
 * The pinned intro holds ~3.8 viewport-heights before any identity appears
 * below it. The sr-only SkipLink already gets keyboard users past it in one
 * Tab + Enter; this is the missing escape for pointer/touch visitors, who
 * have no reason to discover a focus-only control and would otherwise have
 * to scroll through the whole film by hand. A fixed sibling of the stage
 * (never a child — components/cinematic/** is untouched); `href="#hero"` is
 * a plain same-page anchor jump, which ViewTransitions.tsx explicitly leaves
 * to native fragment-scroll (samePath && url.hash → not intercepted), so it
 * needs no special handling and works with JS disabled.
 *
 * Retirement mirrors IntroScrollCue's own IntersectionObserver on
 * `.cinematic-content-reveal` (same top-open + strict-intersection guards,
 * C-20/C-21/C-22) — once there is nothing left to skip, it disappears rather
 * than floating over the real page. Unlike the decorative "Scroll" cue, this
 * IS a control: real text, a real href, the site's focus-visible ring, and a
 * 44px tap target — it must never be pointer-events:none or aria-hidden.
 */
export function IntroSkip() {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const content = document.querySelector('.cinematic-content-reveal');
    const el = ref.current;
    if (!content || !el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        el.toggleAttribute(
          'data-skip-done',
          entry.isIntersecting && entry.intersectionRatio > 0,
        );
      },
      {
        threshold: [0, 0.001, 0.01, 0.05],
        rootMargin: '100000px 0px 0px 0px',
      },
    );
    io.observe(content);

    return () => io.disconnect();
  }, []);

  return (
    <a
      ref={ref}
      href="#hero"
      className={cn(
        'fixed z-[55]',
        'bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1.25rem,env(safe-area-inset-right))]',
        'inline-flex h-11 items-center gap-2 rounded-pill px-4',
        'border border-line bg-canvas/90 backdrop-blur-sm',
        'font-mono text-meta tracking-label uppercase text-ink-meta',
        'transition-[opacity,color,border-color] duration-base ease-out',
        'hover:text-accent hover:border-line-strong',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary',
        'data-[skip-done]:invisible data-[skip-done]:pointer-events-none data-[skip-done]:opacity-0',
      )}
    >
      Skip intro
      <span aria-hidden="true">↓</span>
    </a>
  );
}
