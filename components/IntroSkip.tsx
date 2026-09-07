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
 * Retirement observes the actual `[data-hero-identity]` landing rather than
 * the page-sized `.cinematic-content-reveal` wrapper. A wrapper can intersect
 * by a few pixels while the person's name and role remain below the viewport;
 * the skip is still needed then. Once most of the compact identity block is
 * visible, there is no intro left to bypass and the control steps aside. The
 * top-open root keeps it retired after the identity scrolls above the viewport.
 * Unlike the decorative "Scroll" cue, this IS a control: real text, a real
 * href, the site's focus-visible ring, and a 44px tap target — it must never be
 * pointer-events:none or aria-hidden while the landing has not been reached.
 */
export function IntroSkip() {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const identity = document.querySelector('[data-hero-identity]');
    const el = ref.current;
    if (!identity || !el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        el.toggleAttribute(
          'data-skip-done',
          entry.isIntersecting && entry.intersectionRatio >= 0.75,
        );
      },
      {
        // Re-evaluate when a useful majority of the compact identity block is
        // visible. Requiring 100% would make retirement brittle on short
        // viewports or wrapped text; the wrapper-edge false positive is gone
        // because the observed target is now the identity itself.
        threshold: [0, 0.75],
        rootMargin: '100000px 0px 0px 0px',
      },
    );
    io.observe(identity);

    return () => io.disconnect();
  }, []);

  return (
    <a
      ref={ref}
      href="#hero"
      className={cn(
        // z-55 is the landing's own documented "above the pinned stage (z-50)"
        // layer — globals.css already places IntroScrollCue and the runway mark
        // there for the same reason. Deliberately NOT a --z-* ladder rung: that
        // ladder's own comment says it names the layers AROUND the frozen
        // landing numbering (cdesert pin 50 / title 60 / finish 70) and does not
        // renumber them. Phase J's arbitrary-value census flagged this as the
        // one member of that family with no reason written down; the value is
        // right, the note was missing.
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
