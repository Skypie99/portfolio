import { Cormorant_Garamond, DM_Sans, DM_Mono } from 'next/font/google';

/**
 * Self-hosted via next/font/google — no third-party requests at runtime.
 * Variables wired into <html className={...}> in app/layout.tsx, then
 * referenced by Tailwind via the font-{serif,sans,mono} utilities.
 */
export const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400'],
  // `italic` added 2026-06-02 for the editorial pull-quote (real italic, not faux).
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

export const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-dm-mono',
  display: 'swap',
});
