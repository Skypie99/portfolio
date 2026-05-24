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

/**
 * Steve §Cycle 12 — meta-CSP + meta-referrer.
 *
 * GH Pages can't send real CSP/HSTS HTTP headers (no server-side
 * header control), so we ship a meta-equivalent CSP via <meta
 * http-equiv> in <head>. Less strict than HTTP CSP (frame-ancestors
 * is ignored, no report-uri), but covers script/style/font/img/object.
 *
 * IMPORTANT — production-only.
 * Next.js dev mode uses webpack with eval() for HMR / Fast Refresh.
 * Shipping this CSP in dev silently blocks chunk loads (no
 * 'unsafe-eval' in our policy) — hydration fails, dynamic imports
 * stay TEMPLATE placeholders. Confirmed via demo capture
 * post-cycle-12. The static export build doesn't use eval, so
 * production gets the tight policy.
 *
 * Permissive choices for production and why:
 *  - 'unsafe-inline' on script-src: Next 15 inlines a small runtime
 *    bootstrap script and chunk-load hints. Per-request nonces aren't
 *    available under static export.
 *  - 'unsafe-inline' on style-src: styled-jsx + Tailwind's hashed
 *    selectors emit inline <style>. Same constraint as script-src.
 *  - img-src 'self' data: blob:: data: covers SVG-in-CSS, blob:
 *    covers any future client-side image processing.
 *  - connect-src 'self': site does no AJAX in v1.
 *  - frame-ancestors 'none' + base-uri 'self' + form-action 'self':
 *    defense-in-depth.
 *
 * Referrer-Policy ships in both dev + prod via metadata.referrer.
 */
const PROD_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const isProd = process.env.NODE_ENV === 'production';

export function generateMetadata(): Metadata {
  const profile = getProfile();
  return {
    title: `${profile.name} — AI Portfolio`,
    description: profile.tagline,
    metadataBase: undefined,
    referrer: 'strict-origin-when-cross-origin',
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
      <head>
        {/* Steve §Cycle 12 — meta-CSP (GH Pages has no HTTP CSP path).
            Production-only — dev needs 'unsafe-eval' for HMR. */}
        {isProd && (
          <meta httpEquiv="Content-Security-Policy" content={PROD_CSP} />
        )}
      </head>
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
