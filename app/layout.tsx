import type { Metadata, Viewport } from 'next';

import { cormorant, dmMono, dmSans } from '@/app/fonts';
import { Footer } from '@/components/Footer';
// HamburgerNav is loaded via a Client wrapper (HamburgerNavMount) so the
// `next/dynamic({ ssr: false })` boundary lives in a Client Component — Next
// 15.5 disallows that flag inside Server Components. Splits Framer Motion
// (~45 KB) out of the homepage First Load JS (Peter C2 perf).
import { HamburgerNavMount } from '@/components/HamburgerNavMount';
import { RevealAlive } from '@/components/RevealAlive';
import { Sidebar } from '@/components/Sidebar';
import { SkipLink } from '@/components/SkipLink';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ViewTransitions } from '@/components/ViewTransitions';
import { WorldBackdrop } from '@/components/WorldBackdrop';
import { cn } from '@/lib/cn';
import { getProfile } from '@/lib/content';

import './globals.css';
import './tokens-phase2.css';

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

// Explicit viewport (Next ships a default `width=device-width, initial-scale=1`;
// we own it to add viewport-fit=cover so notched phones render edge-to-edge).
// themeColor per Next 14/15 spec — matches real canvas tokens so the browser
// chrome adopts the active palette (light: --rgb-canvas 250 248 241; dark: 21 25 26).
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF8F1' },
    { media: '(prefers-color-scheme: dark)', color: '#15191A' },
  ],
};

export function generateMetadata(): Metadata {
  const profile = getProfile();
  const siteUrl = 'https://skypistudio.com';
  const description =
    'Sky Halisky is an AI developer building accessible, privacy-first tools from the Okanagan Valley, BC. Creator of AccessMap, the Prompt Library, and more.';
  return {
    title: `${profile.name} — AI Portfolio`,
    description,
    metadataBase: new URL(siteUrl),
    referrer: 'strict-origin-when-cross-origin',
    openGraph: {
      type: 'website',
      url: siteUrl,
      siteName: `${profile.name} — AI Portfolio`,
      title: `${profile.name} — AI Portfolio`,
      description,
      // opengraph-image.tsx (file convention) auto-injects the PNG og:image.
      // No explicit images: entry needed here; the convention takes precedence.
      locale: 'en_CA',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${profile.name} — AI Portfolio`,
      description,
      // Twitter also picks up the auto-generated PNG from opengraph-image.tsx.
    },
    // `color-scheme` is managed at runtime by next-themes (light/dark/system).
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
      suppressHydrationWarning
      className={cn(cormorant.variable, dmSans.variable, dmMono.variable)}
    >
      <head>
        {/* Steve §Cycle 12 — meta-CSP (GH Pages has no HTTP CSP path).
            Production-only — dev needs 'unsafe-eval' for HMR. */}
        {isProd && (
          <meta httpEquiv="Content-Security-Policy" content={PROD_CSP} />
        )}
        {/* Reveal failure floor (L7-01) — CSP-safe inline guard, runs during
            head-parse (before any body .reveal computes style, so no flash):
            (1) add `js` → arm the hidden scroll-reveal state; (2) start an ~8s
            watchdog that adds `reveal-failsafe` (rescues content to visible) if
            hydration never reports alive via RevealAlive; (3) fast-path: a
            dropped chunk fires a resource error on its <script> → rescue at once.
            Imperative classList only (matches next-themes; survives hydration
            under the existing suppressHydrationWarning on <html>). */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){var d=document.documentElement;d.classList.add('js');" +
              "function r(){if(window.__revealFailsafe!==undefined){clearTimeout(window.__revealFailsafe);window.__revealFailsafe=undefined;}d.classList.add('reveal-failsafe');}" +
              "window.__revealFailsafe=setTimeout(r,8000);" +
              "window.addEventListener('error',function(e){var t=e&&e.target;if(t&&t.tagName==='SCRIPT')r();},true);})();",
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: 'Sky Halisky',
              url: 'https://skypistudio.com',
              jobTitle: 'AI Developer',
              description:
                'AI developer and builder based in the Okanagan Valley, British Columbia. Creator of AccessMap, Claude Corp, the Prompt Library, and more.',
              sameAs: [
                'https://github.com/skypie99',
                'https://www.linkedin.com/in/skyler-halisky',
              ],
            }),
          }}
        />
        {/* WM-21 — humans.txt colophon pointer, served at the apex root. */}
        <link rel="author" href="/humans.txt" />
      </head>
      <body className="bg-canvas text-ink">
        <ThemeProvider>
          {/* Reveal failure floor (L7-01): clears the inline guard's watchdog
              once React hydrates — proof the bundle executed. Renders null. */}
          <RevealAlive />
          {/* Continuous world (Direction A): the persistent, scroll-evolving
              golden-hour → night desert behind ALL content. Fixed, z-index:-1,
              aria-hidden; the locked intro + the now-translucent panels sit on
              top of it. Renders behind everything; never covers content. */}
          <WorldBackdrop />
          {/* Filmic page transitions: one capture-phase nav interceptor that
              wraps same-origin client navigations in a native View Transition
              cross-dissolve. Renders null; degrades to plain navigation. */}
          <ViewTransitions />
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
        </ThemeProvider>
      </body>
    </html>
  );
}
