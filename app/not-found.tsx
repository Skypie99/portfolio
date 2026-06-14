import type { Metadata } from 'next';
import Link from 'next/link';

import { Button } from '@/components/Button';
import { SettleHeading } from '@/components/HeroSettle';
import { Reveal } from '@/components/Reveal';

export const metadata: Metadata = {
  title: '404 — Page not found',
  description: 'That page doesn’t exist. Browse the selected work or head back home.',
};

/**
 * 404 page. Cycle 28 critique pass — evergreen copy (the "still
 * being built" line was dated), breadcrumb-style header matching
 * the rest of the editorial frame, secondary "Selected Work" link
 * for visitors who 404'd by typing a /work/<slug> wrong.
 */
export default function NotFound() {
  return (
    <section className="px-gutter py-24 lg:py-32 min-h-[60vh] flex items-center world-surface">
      <div className="max-w-content mx-auto w-full">
        {/* Breadcrumb-style header — matches /work/[slug] pattern */}
        <nav aria-label="Breadcrumb" className="mb-12">
          <ol className="inline-flex items-center gap-2 font-mono text-meta tracking-label uppercase text-text-meta">
            <li>
              <Link href="/" className="link-draw inline-block text-text-meta">
                Home
              </Link>
            </li>
            <li aria-hidden="true" className="text-stone">/</li>
            <li aria-current="page" className="text-near-black">404</li>
          </ol>
        </nav>

        <SettleHeading
          className="font-serif font-light text-display ember leading-[1.05] mb-8 text-balance"
        >
          Nothing here.
        </SettleHeading>

        <Reveal>
          <p className="font-sans font-light text-prose text-charcoal max-w-[540px] mb-16 leading-[1.65] text-pretty">
            The page you{'’'}re looking for doesn{'’'}t exist — or it moved.
            The homepage is the best place to start, and the work index has
            every deliverable.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            <Button href="/">Back to the homepage</Button>
            <Link
              href="/work/"
              className="link-draw inline-block font-mono text-label tracking-label uppercase text-near-black"
            >
              Or browse the work {'→'}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
