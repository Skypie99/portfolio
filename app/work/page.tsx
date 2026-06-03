import type { Metadata } from 'next';
import Link from 'next/link';

import { WorkFilterGrid } from '@/components/WorkFilterGrid';
import { cn } from '@/lib/cn';
import { getDeliverables, getProfile } from '@/lib/content';

export function generateMetadata(): Metadata {
  const profile = getProfile();
  const description = 'Projects by Sky Halisky — AI developer. Accessibility mapping, multi-agent systems, prompt management, and more.';
  return {
    title: `Selected Work — ${profile.name}`,
    description,
    openGraph: {
      type: 'website',
      title: `Selected Work — ${profile.name}`,
      description,
      images: [{ url: '/og-image.svg', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Selected Work — ${profile.name}`,
      description,
    },
  };
}

/**
 * /work — F-04. Editorial grid of deliverables.
 *
 * Server Component. Header + back link are static; the filter grid is a
 * client component (WorkFilterGrid) so FilterPill interactive state works
 * without shipping unnecessary JS for the static header sections.
 *
 * Featured deliverable renders as a wide ProjectCard above the filter grid.
 * Non-featured deliverables render as CaseStudyCards, filterable by tag.
 */
export default function WorkIndexPage() {
  const deliverables = getDeliverables();

  return (
    <>
      {/* Page header */}
      <section
        className={cn(
          'px-gutter',
          'py-24 lg:py-32',
          'bg-cream',
        )}
      >
        <div className="max-w-content mx-auto">
          <div className="pl-4 border-l-2 border-terracotta">
            <p className="font-mono text-label tracking-label uppercase text-accent-ink mb-4 flex items-center gap-2">
              <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
              The Work — {deliverables.length} deliverable{deliverables.length === 1 ? '' : 's'}
            </p>
            <h1
              className="font-serif font-light text-display ember leading-[1.05] max-w-3xl mb-8 text-balance"
            >
              The Work
            </h1>
          </div>
          <p className="font-sans font-light text-[1.0625rem] text-charcoal leading-[1.65] max-w-[640px] mt-6 text-pretty">
            A small body of AI-assisted tools and reference materials. Built
            slowly, documented honestly, sized to a single careful hand.
          </p>
        </div>
      </section>

      {/* Deliverables grid */}
      <section
        className={cn(
          'reveal-on-scroll',
          'px-gutter',
          'pb-24 lg:pb-32',
          // Dani wave4: warm-white contrasts the cream header for clear section rhythm.
          'bg-warm-white',
          'border-t border-border-decorative pt-24 lg:pt-32',
        )}
      >
        <div className="max-w-content mx-auto">
          {/* sr-only section heading — Alex F-C4-2. Closes the
              h1 → h3 gap that previously existed; sighted users still
              see the visible page header above as the only h1. */}
          <h2 className="sr-only">Deliverables</h2>
          {deliverables.length === 0 ? (
            // Empty-state per F-04 acceptance criteria.
            <p className="font-serif font-light text-display-s text-charcoal leading-[1.65] max-w-[540px]">
              Deliverables coming soon.
            </p>
          ) : (
            <WorkFilterGrid deliverables={deliverables} />
          )}

          {/* Back link */}
          <div className="mt-20">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-mono text-label tracking-label uppercase text-near-black hover:text-accent-text transition-colors duration-fast ease-out"
            >
              <span aria-hidden="true">{'←'}</span>
              Back to home
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
