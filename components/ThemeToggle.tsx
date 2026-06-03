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

  const button = (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={mounted ? `Switch to ${next} mode` : 'Toggle colour theme'}
      title={mounted ? `Switch to ${next} mode` : undefined}
      className={cn(
        'inline-flex items-center justify-center h-9 w-9 rounded-pill shrink-0',
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
        {mounted ? (isDark ? 'Dark' : 'Light') : 'Theme'}
      </span>
      {button}
    </div>
  );
}
