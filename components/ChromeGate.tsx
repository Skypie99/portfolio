'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Suppresses the portfolio's site chrome on the archive surface.
 *
 * The Studio Archive is a full-bleed app with its own dark studio world, header
 * and footer, so the site's Sidebar / Footer / HamburgerNav / WorldBackdrop must
 * not render on /archive. usePathname resolves at static-export prerender for a
 * given route, so gated chrome is absent from the built /archive HTML (no
 * hydration flash); archive.css carries a CSS belt as defence-in-depth.
 */
export function ChromeGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith('/archive')) return null;
  return <>{children}</>;
}
