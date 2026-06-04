'use client';

import { useScrollProgress } from '@/lib/motion';

/**
 * SidebarProgress — a hairline reading-progress indicator on the sidebar's
 * right edge that fills as the page scrolls (high-end polish 2026-06-03).
 *
 * Compositor-only: `useScrollProgress` sets `--scroll-progress` (0→1) on
 * <html> via one rAF-throttled scroll listener, and this line is a
 * `transform: scaleY(var(--scroll-progress))` of a thin terracotta gradient —
 * zero React re-renders, runs on the GPU. Reduced motion → the hook no-ops, the
 * var stays unset, `scaleY(0)` collapses the line to nothing. aria-hidden: the
 * indicator is decorative; scroll position is already conveyed by the content.
 */
export function SidebarProgress() {
  useScrollProgress();
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute right-0 top-0 h-full w-[2px] origin-top"
      style={{
        transform: 'scaleY(var(--scroll-progress, 0))',
        background:
          'linear-gradient(to bottom, rgb(var(--rgb-accent) / 0.12), rgb(var(--rgb-accent) / 0.7))',
      }}
    />
  );
}
