'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ComponentProps } from 'react';

/**
 * Theme provider — wraps next-themes so the class-strategy dark mode works
 * inside our Server-Component layout. Follows the OS by default
 * (defaultTheme="system" + enableSystem); a manual choice is persisted to
 * localStorage and wins. next-themes injects a no-flash script and manages
 * the `color-scheme` style. `disableTransitionOnChange` stops every CSS
 * transition from firing at once during a theme switch.
 */
export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
