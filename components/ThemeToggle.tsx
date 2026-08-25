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

// B3 candidate (Phase B, wave-1 banked question): drawn to match the house
// sun family — RunwayIdentity's disc-over-two-horizon-lines (app/icon.svg,
// RunwayIdentity.tsx:87-103) and HamburgerNav's LUXE-4 "Horizon" glyph, which
// already borrows the same proportions. currentColor keeps it theming with
// the button's ink token (RunwayIdentity's sun is deliberately NOT tokenized
// because it rides the intro's fixed palette — this is chrome, not a fixed
// mark, so it should flip). Not yet chosen — see ThemeToggle candidate below.
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
      <circle cx="12" cy="8.5" r="4.25" />
      <line x1="4" y1="15.5" x2="20" y2="15.5" strokeWidth="1.7" />
      <line x1="7.5" y1="18.5" x2="16.5" y2="18.5" strokeWidth="1.3" />
    </svg>
  );
}

// The sun's necessary dark-mode partner — no house moon exists yet, so this is
// original: a crescent (the standard two-arc technique, own proportions) over
// the same two horizon lines, so the pair reads as one object across day/night
// rather than two unrelated glyphs.
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
      <path d="M13.5 4 A4.6 4.6 0 1 0 13.5 13.2 A4 4 0 1 1 13.5 4 Z" />
      <line x1="4" y1="15.5" x2="20" y2="15.5" strokeWidth="1.7" />
      <line x1="7.5" y1="18.5" x2="16.5" y2="18.5" strokeWidth="1.3" />
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

  // showcase/theme-sync: hovering/focusing/touching the toggle is INTENT — it
  // gives in-viewport ThemedShowcases a ~150-500ms head start to arm their
  // inactive twin before the click, so the dissolve is sharp, not blurred.
  // Pure event dispatch: no markup, no geometry, no behavior change here.
  const signalIntent = () => {
    try {
      window.dispatchEvent(new Event('ts:theme-intent'));
    } catch {
      /* SSR/jsdom guard */
    }
  };

  const button = (
    <button
      type="button"
      onClick={flip}
      onPointerEnter={signalIntent}
      onFocus={signalIntent}
      onTouchStart={signalIntent}
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
