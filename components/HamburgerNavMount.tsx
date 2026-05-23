'use client';

import dynamic from 'next/dynamic';

/**
 * HamburgerNavMount — Client-side mount wrapper for HamburgerNav (Peter C2 perf).
 *
 * Next 15.5 disallows `next/dynamic({ ssr: false })` inside Server Components,
 * so this thin Client wrapper holds the dynamic import. Splits Framer Motion
 * (~45 KB) out of the homepage's First Load JS — the hamburger is chrome, not
 * LCP content, so loading after hydration is fine.
 */
const HamburgerNav = dynamic(
  () => import('@/components/HamburgerNav').then((m) => m.HamburgerNav),
  { ssr: false },
);

export function HamburgerNavMount() {
  return <HamburgerNav />;
}
