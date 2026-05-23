import type { Metadata } from 'next';

import { cormorant, dmMono, dmSans } from '@/app/fonts';
import { Footer } from '@/components/Footer';
// HamburgerNav is loaded via a Client wrapper (HamburgerNavMount) so the
// `next/dynamic({ ssr: false })` boundary lives in a Client Component — Next
// 15.5 disallows that flag inside Server Components. Splits Framer Motion
// (~45 KB) out of the homepage First Load JS (Peter C2 perf).
import { HamburgerNavMount } from '@/components/HamburgerNavMount';
import { Sidebar } from '@/components/Sidebar';
import { SkipLink } from '@/components/SkipLink';
import { cn } from '@/lib/cn';
import { getProfile } from '@/lib/content';

import './globals.css';

export function generateMetadata(): Metadata {
  const profile = getProfile();
  return {
    title: `${profile.name} — AI Portfolio`,
    description: profile.tagline,
    metadataBase: undefined,
    other: {
      'color-scheme': 'light',
    },
  };
}

/**
 * Root layout.
 *
 * Shell: SkipLink + Sidebar (desktop) + <main> + Footer.
 * On mobile the Sidebar hides; the HamburgerNav (fixed) gives access to all
 * routes including the items that lived in the sidebar.
 *
 * Alex §6.4: DOM order is Sidebar then Main so tab order matches visual order.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={cn(cormorant.variable, dmSans.variable, dmMono.variable)}
    >
      <body className="bg-cream text-near-black">
        <SkipLink />
        <HamburgerNavMount />
        <div className="flex flex-col md:flex-row min-h-screen">
          <Sidebar />
          <main
            id="main"
            tabIndex={-1}
            className="flex-1 flex flex-col min-w-0"
          >
            <div className="flex-1">{children}</div>
            <Footer />
          </main>
        </div>
      </body>
    </html>
  );
}
