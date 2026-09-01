import type { Metadata } from 'next';
import Link from 'next/link';

import { EmptyState } from '@/components/EmptyState';
import { GalleryWall } from '@/components/GalleryWall';
import { SettleHeading } from '@/components/HeroSettle';
import { ParallaxWash } from '@/components/ParallaxWash';
import { RunwayIdentity } from '@/components/RunwayIdentity';
import { cn } from '@/lib/cn';
import { getDeliverables, getProfile } from '@/lib/content';
import { OG_CARD } from '@/lib/og';

export function generateMetadata(): Metadata {
  const profile = getProfile();
  const description = 'Projects by Sky Halisky: AI builder. Accessibility mapping, multi-agent systems, prompt management, and more.';
  return {
    title: `Selected Work: ${profile.name}`,
    description,
    openGraph: {
      type: 'website',
      // TA-10: a leaf openGraph REPLACES the root's wholesale (W0-04), so url,
      // siteName and locale must be restated here or they drop out of this
      // route's share card entirely. url is this route's OWN.
      url: '/work/',
      siteName: 'Sky Halisky: AI Portfolio',
      locale: 'en_CA',
      title: `Selected Work: ${profile.name}`,
      description,
      images: [OG_CARD],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Selected Work: ${profile.name}`,
      description,
    },
  };
}

/**
 * /work — the gallery wall (R4/BP9 · P03, was F-04's filterable grid).
 *
 * Server Component. Header + back link are static; the wall itself is a thin
 * client component (GalleryWall) only for the C-25 entrance-skip — no framer,
 * no filters (retired under the §S-delegated PROTECT-63-adjacent ruling;
 * DECISIONS records it, Sky can re-rule).
 *
 * Every work hangs full-width in alternating plates, walked 01→06 — the
 * featured invariant still picks who hangs first; on the wall the order IS
 * the hierarchy.
 */
export default function WorkIndexPage() {
  const deliverables = getDeliverables();

  return (
    <>
      {/* UP-38: the mobile brand chip. Measured, this route rendered ZERO
          identity -- visible OR in the a11y tree -- before the footer at
          320/375/414. Same mark home's runway uses; hidden from md up, where
          the rail starts signing. */}
      <RunwayIdentity variant="page" />
      {/* Page header */}
      <section
        className={cn(
          'relative isolate overflow-hidden',
          'px-gutter',
          // Z6a/HI-1: hero owns the page-top beat only. Its bottom beat used to
          // double-stack against the deliverables section's pt-24 lg:pt-32 (the
          // single canonical seam) — an accidental ~256px doubling that pushed
          // every deliverable below the fold. Drop the hero's bottom; the
          // border-t section divider below carries the single transition.
          // UP-35 (ui-polish 2026-08-01) REFINES that ruling, it does not revert
          // it. Z6a took the bottom to ZERO, which glued the divider to the lead
          // paragraph: 0.00px from its border box and 8.05px from its last
          // baseline (pure descender + half-leading — no authored space at all),
          // against 129px of air on the far side. A 0:129 split reads as an
          // underline of that sentence, not a section break, and /work was the
          // estate's only such hero — the other six index heroes all run the
          // symmetric py-24 lg:py-32 (128:129). pb-12 restores a beat WITHOUT
          // re-creating the doubling: the seam totals 177px @1440 / 145px @375,
          // not ~256px. Re-verified at Z6a's own 1280x800 — the first work still
          // crests the fold by 287px where Z6a certified its fix at 191px, partly
          // because the 13 filter pills it also blamed went with the retired
          // filter grid (the component name is deliberately not written here —
          // GalleryWall.test.tsx guards this file against that string, and the
          // guard is correct). Dropping the rule instead was measured and refused:
          // the world-surface -> world-surface-alt wash step is only 1.04-1.06:1
          // while the hairline carries 1.38-1.62:1, so the rule is ~90% of the
          // seam's signal, and it is a 40-site house grammar. A FULL beat re-add
          // here IS the doubling this comment was written to kill: don't.
          'pt-24 lg:pt-32 pb-12',
          'world-surface',
        )}
      >
        {/* golden-hour light continuity (wow 2026-06-04) — arriving at the
            showcase feels lit, carrying the desert's warmth in. RM → static. */}
        <ParallaxWash depth="far" />
        <div className="relative z-10 max-w-content mx-auto">
          <div className="pl-4 border-l-2 border-terracotta">
            <p className="font-mono text-label tracking-label uppercase text-accent-ink mb-4 flex items-center gap-2">
              <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
              The Work: {deliverables.length} deliverable{deliverables.length === 1 ? '' : 's'}
            </p>
            <SettleHeading
              className="font-serif font-light text-display ember max-w-measure-heading mb-12 text-balance"
            >
              The Work
            </SettleHeading>
          </div>
          <p className="font-sans font-light text-prose text-ink-muted max-w-measure-lead mt-8 text-pretty">
            A small body of AI-assisted tools and reference materials. Built
            slowly, documented honestly, sized to a single careful hand.
          </p>
        </div>
      </section>

      {/* Deliverables grid */}
      <section
        className={cn(
          'px-gutter',
          // SP-3: closer is now its own section below; this beat becomes the
          // content-internal gap (~72px) so it doesn't double-stack. §7.4.
          'pb-18',
          // Dani wave4: warm-white contrasts the cream header for clear section rhythm.
          'world-surface-alt',
          'border-t border-border-decorative pt-24 lg:pt-32',
        )}
      >
        <div className="max-w-content mx-auto">
          {/* sr-only section heading — Alex F-C4-2. Closes the
              h1 → h3 gap that previously existed; sighted users still
              see the visible page header above as the only h1. */}
          <h2 className="sr-only">Deliverables</h2>
          {deliverables.length === 0 ? (
            // Empty-state per F-04 acceptance criteria — composed treatment (EmptyState).
            <EmptyState
              title="Deliverables coming soon."
              note="New work is being written up: built slowly, documented honestly. Check back shortly."
            />
          ) : (
            // The gallery wall (R4/BP9 · P03) — the promenade replaces the
            // filterable grid: every work full-width, walked 01→06, framer
            // retired from the route. The C-25 entrance-skip survives inside.
            <GalleryWall deliverables={deliverables} />
          )}

        </div>
      </section>

      {/* Back link — SP-3 unified closer grammar: hairline border-t + ~72px
          (py-18). world-surface alternates off the -alt grid above. */}
      <section className="px-gutter py-18 world-surface border-t border-border-decorative">
        <div className="max-w-content mx-auto">
          <Link
            href="/"
            className="group px-1 py-1.5 -mx-1 -my-1.5 inline-flex items-center gap-2 font-mono text-label tracking-label uppercase text-ink hover:text-accent-text transition-colors duration-fast ease-out"
          >
            <span aria-hidden="true" className="inline-block transition-transform duration-base ease-gh-glide group-hover:-translate-x-1">{'←'}</span>
            Back to home
          </Link>
        </div>
      </section>
    </>
  );
}
