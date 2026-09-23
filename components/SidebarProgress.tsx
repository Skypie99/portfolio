'use client';

import { useScrollProgress } from '@/lib/motion';

/**
 * SidebarProgress — a hairline reading-progress indicator on the sidebar's
 * right edge that fills as the page scrolls (high-end polish 2026-06-03).
 *
 * Native root scroll timeline where available; the existing shared motion-clock
 * custom-property writer remains the fallback. Both scale a thin terracotta
 * gradient without React re-renders. Reduced motion collapses the line.
 * aria-hidden: the
 * indicator is decorative; scroll position is already conveyed by the content.
 */
export function SidebarProgress() {
  useScrollProgress();
  return (
    <div
      aria-hidden="true"
      className="sidebar-progress-fill pointer-events-none absolute right-0 top-0 h-full w-[2px] origin-top"
      style={{
        background:
          'linear-gradient(to bottom, rgb(var(--rgb-accent) / 0.12), rgb(var(--rgb-accent) / 0.7))',
      }}
    />
  );
}
