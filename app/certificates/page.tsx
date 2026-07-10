import type { Metadata } from 'next';
import Link from 'next/link';

import { AnimatedCertGrid } from '@/components/AnimatedCertGrid';
import { EmptyState } from '@/components/EmptyState';
import { SettleHeading } from '@/components/HeroSettle';
import { ParallaxWash } from '@/components/ParallaxWash';
import { cn } from '@/lib/cn';
import { getCertificates, getProfile } from '@/lib/content';

export function generateMetadata(): Metadata {
  const profile = getProfile();
  return {
    title: `Credentials — ${profile.name}`,
    description:
      'Credentials earned by Sky Halisky — Anthropic, Google, University of Michigan, DeepLearning.AI.',
  };
}

/**
 * /certificates — F-06. Editorial 3-column grid on md+, 1-column on mobile.
 *
 * Server Component. Per Dana DATA_SHAPE.md we do NOT show `expiresDate`
 * publicly (privacy + signal-to-noise reasons). The page reads issuedDate,
 * the issuer, and the credential URL only.
 *
 * Cards sit on Blush bg per Dani's spec; outer section is Cream so the
 * Blush cards visually pop without losing the soft palette.
 */

export default function CertificatesPage() {
  const certificates = getCertificates();

  return (
    <>
      {/* Page header */}
      <section className="relative isolate overflow-hidden px-gutter py-24 lg:py-32 world-surface">
        {/* golden-hour light continuity (wow 2026-06-04) — the header is lit
            like every other showcase entry point. RM → static. */}
        <ParallaxWash depth="far" />
        <div className="relative z-10 max-w-content mx-auto">
          <p className="font-mono text-label tracking-label uppercase text-accent-ink mb-4 flex items-center gap-2">
            <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
            Credentials — {certificates.length}
          </p>
          <SettleHeading
            className="font-serif font-light text-display ember max-w-3xl mb-12 text-balance"
          >
            Credentials
          </SettleHeading>
          <p className="font-sans font-light text-prose text-charcoal leading-[1.65] max-w-measure-lead text-pretty">
            Selected credentials and certifications. A short paper trail of the
            things I&apos;ve studied formally — most of the learning happens in
            the work, not on paper.
          </p>
        </div>
      </section>

      {/* Certificates grid */}
      <section
        className={cn(
          // SP-3: closer is its own section below; pb becomes a ~72px content
          // gap so it doesn't double-stack with the closer. §7.4 will rename.
          'px-gutter pb-18 pt-24 lg:pt-32',
          // Dani wave4: warm-white for the grid section — blush cards pop on warm-white.
          'world-surface-alt border-t border-border-decorative',
        )}
      >
        <div className="max-w-content mx-auto">
          {/* sr-only section heading — Alex F-C4-2 heading rotor. */}
          <h2 className="sr-only">Credentials</h2>
          {certificates.length === 0 ? (
            <EmptyState
              title="Credentials coming soon."
              note="A short paper trail of formal study will appear here — most of the learning happens in the work."
            />
          ) : (
            // AnimatedCertGrid owns its entrance (per-card weighted cascade).
            <AnimatedCertGrid certificates={certificates} />
          )}

        </div>
      </section>

      {/* Back link — SP-3 unified closer grammar: hairline border-t + ~72px
          (py-18). world-surface alternates off the -alt grid above. */}
      <section className="px-gutter py-18 world-surface border-t border-border-decorative">
        <div className="max-w-content mx-auto">
          <Link
            href="/"
            className="group px-1 py-1.5 -mx-1 -my-1.5 inline-flex items-center gap-2 font-mono text-label tracking-label uppercase text-near-black hover:text-accent-text transition-colors duration-fast ease-out"
          >
            <span aria-hidden="true" className="inline-block transition-transform duration-base ease-gh-glide group-hover:-translate-x-1">{'←'}</span>
            Back to home
          </Link>
        </div>
      </section>
    </>
  );
}
