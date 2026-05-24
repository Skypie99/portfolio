import type { Metadata } from 'next';
import Link from 'next/link';

import { ProjectCard } from '@/components/ProjectCard';
import { cn } from '@/lib/cn';
import { getDeliverables, getProfile } from '@/lib/content';

export function generateMetadata(): Metadata {
  const profile = getProfile();
  return {
    title: `Selected Work — ${profile.name}`,
    description:
      'A small, deliberate body of AI-assisted tools, audits, and reference materials by Sky Halisky.',
  };
}

/**
 * /work — F-04. Editorial grid of deliverables.
 *
 * Server Component (zero JS shipped to the client beyond the layout shell).
 * The card primitive lives in `components/ProjectCard.tsx` — shared with
 * any other surface that lists deliverables. Keeps hover/focus rules and
 * accessibility patterns in lockstep across the site.
 *
 * Featured deliverable is hoisted to the first cell and given a row-spanning
 * treatment on md+. Empty state copy renders if no deliverables exist
 * (cross-cutting F-04 acceptance criterion).
 */
export default function WorkIndexPage() {
  const deliverables = getDeliverables();
  const featured = deliverables.find((d) => d.featured);
  const rest = deliverables.filter((d) => !d.featured);
  const ordered = featured ? [featured, ...rest] : rest;

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
          <p className="font-mono text-label tracking-label uppercase text-text-meta mb-4">
            Work — {deliverables.length} deliverable{deliverables.length === 1 ? '' : 's'}
          </p>
          <h1 className="font-serif font-light text-display-l text-near-black leading-tight max-w-3xl mb-6">
            Selected Work
          </h1>
          <p className="font-sans font-light text-body text-charcoal leading-[1.65] max-w-[640px]">
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
          'bg-cream',
          'border-t border-border-decorative pt-16 lg:pt-20',
        )}
      >
        <div className="max-w-content mx-auto">
          {/* sr-only section heading — Alex F-C4-2. Closes the
              h1 → h3 gap that previously existed; sighted users still
              see the visible page header above as the only h1. */}
          <h2 className="sr-only">Deliverables</h2>
          {ordered.length === 0 ? (
            // Empty-state per F-04 acceptance criteria.
            <p className="font-serif font-light text-display-s text-charcoal leading-[1.65] max-w-[540px]">
              Deliverables coming soon.
            </p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
              {ordered.map((d, idx) => (
                <li
                  key={d.id}
                  className={cn(
                    // Featured deliverable spans the full row on md+, giving
                    // it a "row-spanning treatment" (per Cycle 4 brief). Falls
                    // back to a single column when nothing's featured.
                    d.featured && idx === 0 && 'md:col-span-2',
                  )}
                >
                  <ProjectCard deliverable={d} />
                </li>
              ))}
            </ul>
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
