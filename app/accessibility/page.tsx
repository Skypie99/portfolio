import type { Metadata } from 'next';
import Link from 'next/link';

import { A11yReceipts } from '@/components/A11yReceipts';
import { SettleHeading } from '@/components/HeroSettle';
import { renderMarkdownProse } from '@/components/MarkdownProse';
import { cn } from '@/lib/cn';
import { getA11yReceipts, getAccessibilityStatementParts, getProfile } from '@/lib/content';
import { bindSeparatorDash, bindSoloLetters } from '@/lib/markdown';

export function generateMetadata(): Metadata {
  const profile = getProfile();
  const description =
    'How this site is built to be accessible — the specific choices, the honest limits, and how to report a barrier.';
  return {
    title: `Accessibility — ${profile.name}`,
    description,
    openGraph: {
      type: 'website',
      // W0-04 (R4/BP8): the leaf openGraph REPLACES the root's wholesale —
      // url, siteName and locale restated (the /work/[slug] pattern) so they
      // never silently drop from this route's share. The image is the route's
      // OWN measurement plate (app/accessibility/opengraph-image.tsx — the
      // receipt unfurls, P05).
      url: '/accessibility/',
      siteName: 'Sky Halisky — AI Portfolio',
      locale: 'en_CA',
      title: `Accessibility — ${profile.name}`,
      description,
      images: [{ url: '/accessibility/opengraph-image', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Accessibility — ${profile.name}`,
      description,
    },
  };
}

/**
 * /accessibility — F-§8.1. The site's Accessibility Statement: honest about
 * what it does for accessibility and what it does not yet.
 *
 * Server Component, fully static. Reuses the established long-form chrome
 * (eyebrow + SettleHeading header → renderMarkdownProse body → closer link),
 * the same idiom as /about and /blog/[slug]. The body copy lives in
 * lib/content.getAccessibilityStatement() and is authored for the shared
 * renderer (## headings + bold-lead paragraphs only). The root layout supplies
 * the world backdrop, skip link, <main> landmark, and footer, so this route
 * inherits keyboard access, the reduced-motion / no-JS content floors, and the
 * day→night-at-footer arc for free.
 *
 * The "report a barrier" channel is the closer <Link> to /contact (the site
 * never puts the email address in static HTML — anti-harvest, mirrors
 * Footer/ContactEmail).
 */
export default function AccessibilityPage() {
  // S6: the statement splits at "What I have not done" so the measured
  // receipts strip sits before the limits section — the page keeps its honest
  // last word (the split getter throws at build if the marker drifts).
  const { built, limits } = getAccessibilityStatementParts();
  const receipts = getA11yReceipts();
  const renderedBuilt = renderMarkdownProse(built, 'blog');
  const renderedLimits = renderMarkdownProse(limits, 'blog');

  return (
    <>
      {/* Page header — mirrors /about: dotted eyebrow + display title + summary */}
      <section className="px-gutter py-24 lg:py-32 world-surface">
        <div className="max-w-content mx-auto">
          <p className="font-mono text-label tracking-label uppercase text-accent-ink mb-4 flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta"
            />
            Accessibility
          </p>
          <SettleHeading className="font-serif font-light text-display ember max-w-3xl mb-16 text-balance">
            {bindSeparatorDash(bindSoloLetters('Accessibility is where I begin.'))}
          </SettleHeading>
          <p className="font-sans font-light text-step-1 text-charcoal max-w-measure-wide text-pretty">
            Honest about what this site does for accessibility, and what it does not yet.
          </p>
        </div>
      </section>

      {/* Statement body — shared long-form renderer (Z7/CO-6). The .reveal
          floors in globals.css carry the reduced-motion / no-JS rest state. */}
      <section
        className={cn(
          'px-gutter',
          'py-32 lg:py-50',
          'world-surface-alt',
          'border-t border-border-decorative',
        )}
      >
        <div className="max-w-content mx-auto">
          {/* The prose halves keep the long-form measure; the receipts strip
              between them spans the full content column (home's grid width). */}
          <article aria-label="Accessibility statement" className="flex flex-col gap-8">
            <div className="max-w-measure-wide flex flex-col gap-8">
              {renderedBuilt}
              {/* WM-19 — the reduced-motion-only line. Present in the HTML and the
                  a11y tree, display-gated to prefers-reduced-motion via Tailwind's
                  built-in motion-reduce: variant (no JS, no flip, no flash; resolves
                  before first paint). For motion visitors it is display:none — absent
                  from the accessibility tree. NEVER author this in the content.ts
                  markdown string: the single site-wide inline parser has no RM-gating
                  syntax, so a markdown line would render for EVERYONE and invert it. */}
              {/* T9 — Sky's line (picked in-chat 2026-07-19, option 1 verbatim). */}
              <p className="hidden motion-reduce:block font-sans font-light text-prose text-charcoal leading-[1.75] text-pretty">
                You&apos;re reading this because your system asked for less motion.
                The site listened — everything is already in place.
              </p>
            </div>
            <A11yReceipts data={receipts} className="my-12" />
            <div className="max-w-measure-wide flex flex-col gap-8">{renderedLimits}</div>
          </article>
        </div>
      </section>

      {/* Closer — the report-a-barrier route. Forward CTA to /contact, plus a
          quiet back-to-home, matching the /about closer grammar. */}
      <section className="px-gutter py-18 world-surface border-t border-border-decorative">
        <div className="max-w-content mx-auto flex flex-col items-start gap-8">
          <Link
            href="/contact/"
            className="group px-1 py-1.5 -mx-1 -my-1.5 inline-flex items-center gap-2 font-mono text-label tracking-label uppercase text-near-black hover:text-accent-text transition-colors duration-fast ease-out"
          >
            Get in touch
            <span
              aria-hidden="true"
              className="inline-block transition-transform duration-base ease-gh-glide group-hover:translate-x-1"
            >
              {'→'}
            </span>
          </Link>
          <Link
            href="/"
            className="group inline-flex items-center gap-2 font-mono text-meta tracking-label uppercase text-text-meta hover:text-accent-text transition-colors duration-fast ease-out"
          >
            <span
              aria-hidden="true"
              className="inline-block transition-transform duration-base ease-gh-glide group-hover:-translate-x-1"
            >
              {'←'}
            </span>
            Back to home
          </Link>
        </div>
      </section>
    </>
  );
}
