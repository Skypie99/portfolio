'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/cn';

/**
 * Light/dark toggle. Default follows the OS (theme="system"); clicking sets
 * an explicit, persisted choice. Hydration-safe: the icon/label render a
 * stable placeholder until mounted so SSR markup matches the client.
 *
 * A11y: real <button>, descriptive aria-label that names the destination
 * mode, keyboard-operable, and the global focus-visible ring applies. The
 * icon is aria-hidden (the label is the accessible name).
 */

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[18px] w-[18px]"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[18px] w-[18px]"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

type Props = { className?: string; withLabel?: boolean };

export function ThemeToggle({ className, withLabel = false }: Props) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === 'dark';
  const next = isDark ? 'light' : 'dark';

  // S19 (L4-03): flipping the theme joins the route-dissolve language — one
  // full-surface golden cross-dissolve (the ::view-transition(root) block in
  // globals.css: --dur-transition on --ease-gh-glide). Reduced motion and
  // engines without the API keep today's instant snap (the ::view-transition
  // 0.01ms guard is layer 3 of the RM contract; this JS gate is belt-and-braces).
  const flip = () => {
    const reduce =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const startViewTransition = (
      document as unknown as {
        startViewTransition?: (cb: () => void) => unknown;
      }
    ).startViewTransition;
    if (reduce || typeof startViewTransition !== 'function') {
      setTheme(next);
      return;
    }
    startViewTransition.call(document, () => {
      // Paint is suspended while a VT callback runs, so we cannot wait for
      // next-themes' post-commit effect to apply the class (a rAF/paint resolver
      // would never fire — see ViewTransitions.tsx). Toggle the class synchronously
      // here so the transition captures the NEW theme; setTheme keeps next-themes'
      // state, storage and disableTransitionOnChange guard in sync (it re-applies
      // the same class — a no-op).
      const root = document.documentElement;
      root.classList.toggle('dark', next === 'dark');
      root.style.colorScheme = next;
      setTheme(next);
    });
  };

  const button = (
    <button
      type="button"
      onClick={flip}
      aria-label={mounted ? `Switch to ${next} mode` : 'Toggle colour theme'}
      title={mounted ? `Switch to ${next} mode` : undefined}
      className={cn(
        'inline-flex items-center justify-center h-11 w-11 rounded-pill shrink-0',
        'border border-line text-ink-meta',
        'transition-colors duration-base ease-out',
        'hover:text-accent hover:border-line-strong',
        !withLabel && className,
      )}
    >
      <span aria-hidden="true" className="block">
        {isDark ? <SunIcon /> : <MoonIcon />}
      </span>
    </button>
  );

  if (!withLabel) return button;

  return (
    <div className={cn('inline-flex items-center gap-3', className)}>
      <span className="font-mono text-meta tracking-label uppercase text-ink-meta">
        {/* IN-5: name the DESTINATION (the capitalized `next` mode), so the label
            agrees with the icon and aria-label instead of reporting current state.
            Existing strings only — no new copy. */}
        {mounted ? (isDark ? 'Light' : 'Dark') : 'Theme'}
      </span>
      {button}
    </div>
  );
}
