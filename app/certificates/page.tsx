import type { Metadata } from 'next';
import Link from 'next/link';

import { AnimatedCertGrid } from '@/components/AnimatedCertGrid';
import { Reveal } from '@/components/Reveal';
import { cn } from '@/lib/cn';
import { getCertificates, getProfile } from '@/lib/content';

export function generateMetadata(): Metadata {
  const profile = getProfile();
  return {
    title: `Certificates — ${profile.name}`,
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
      <section className="px-gutter py-24 lg:py-32 bg-cream">
        <div className="max-w-content mx-auto">
          <p className="font-mono text-label tracking-label uppercase text-text-meta mb-4 flex items-center gap-2">
            <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
            Credentials — {certificates.length}
          </p>
          <h1
            className="font-serif font-light text-display text-near-black leading-[1.05] max-w-3xl mb-8 text-balance"
          >
            Certificates
          </h1>
          <p className="font-sans font-light text-prose text-charcoal leading-[1.65] max-w-[640px] text-pretty">
            Selected credentials and certifications. A short paper trail of the
            things I&apos;ve studied formally — most of the learning happens in
            the work, not on paper.
          </p>
        </div>
      </section>

      {/* Certificates grid */}
      <section
        className={cn(
          'px-gutter pb-24 lg:pb-32 pt-24 lg:pt-32',
          // Dani wave4: warm-white for the grid section — blush cards pop on warm-white.
          'bg-warm-white border-t border-border-decorative',
        )}
      >
        <div className="max-w-content mx-auto">
          {/* sr-only section heading — Alex F-C4-2 heading rotor. */}
          <h2 className="sr-only">Credentials</h2>
          <Reveal>
          {certificates.length === 0 ? (
            <p className="font-serif font-light text-display-s text-charcoal leading-[1.65] max-w-[540px]">
              Credentials coming soon.
            </p>
          ) : (
            <AnimatedCertGrid certificates={certificates} />
          )}
          </Reveal>

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
