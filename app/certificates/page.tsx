import type { Metadata } from 'next';
import Link from 'next/link';

import BadgeImage from '@/components/BadgeImage';
import { CredentialBadge } from '@/components/CredentialBadge';
import { cn } from '@/lib/cn';
import { getCertificates, getProfile } from '@/lib/content';

export function generateMetadata(): Metadata {
  const profile = getProfile();
  return {
    title: `Certificates — ${profile.name}`,
    description:
      'Professional credentials and certifications held by Sky Halisky.',
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
function formatIssuedDate(iso: string): string {
  // "2025-11-14" -> "ISSUED NOVEMBER 2025"
  const [yearStr, monthStr] = iso.split('-');
  const year = Number(yearStr);
  const monthIdx = Number(monthStr) - 1;
  const MONTHS = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
  ];
  const month = MONTHS[monthIdx] ?? '';
  return `ISSUED ${month} ${year}`;
}

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
            className="font-serif font-light text-[clamp(2.5rem,6vw,4rem)] text-near-black leading-[1.05] max-w-3xl mb-8 text-balance"
            style={{ letterSpacing: '-0.02em' }}
          >
            Certificates
          </h1>
          <p className="font-sans font-light text-[1.0625rem] text-charcoal leading-[1.65] max-w-[640px] text-pretty">
            Selected credentials and certifications. A short paper trail of the
            things I&apos;ve studied formally — most of the learning happens in
            the work, not on paper.
          </p>
        </div>
      </section>

      {/* Certificates grid */}
      <section
        className={cn(
          'reveal-on-scroll',
          'px-gutter pb-24 lg:pb-32 pt-24 lg:pt-32',
          // Dani wave4: warm-white for the grid section — blush cards pop on warm-white.
          'bg-warm-white border-t border-border-decorative',
        )}
      >
        <div className="max-w-content mx-auto">
          {/* sr-only section heading — Alex F-C4-2 heading rotor. */}
          <h2 className="sr-only">Credentials</h2>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {certificates.map((c) => (
              <li key={c.id}>
                <article
                  className={cn(
                    'work-card group',
                    'h-full flex flex-col',
                    'bg-blush border border-border-decorative',
                    'p-8',
                    'rounded-md',
                    'transition-all duration-base ease-out',
                    'hover:border-pebble hover:shadow-[var(--shadow-elevation-2)] hover:-translate-y-0.5',
                    'focus-within:border-pebble',
                  )}
                >
                  {/* Badge image well — warm radial gradient gives depth vs flat bg */}
                  <div
                    className="relative w-full aspect-square border border-border-decorative mb-6 overflow-hidden flex items-center justify-center"
                    style={{
                      background:
                        'radial-gradient(60% 60% at 50% 40%, #FDE9D7 0%, #FCF3ED 55%, #F0F0EA 100%)',
                    }}
                  >
                    {/* Alex F-C4-3: explicit dimensions for the 1:1 badge.
                        BadgeImage is a client component so the onError
                        fallback (graceful degradation) can fire. */}
                    <BadgeImage
                      src={c.badgeImage.src}
                      alt={c.badgeImage.alt}
                      className={cn(
                        'absolute inset-0 w-full h-full object-contain p-4',
                        'transition-transform duration-slow ease-out',
                        'group-hover:scale-[1.02] group-focus-within:scale-[1.02]',
                      )}
                    />
                  </div>

                  {/* Issuer */}
                  <p className="font-mono text-meta tracking-label uppercase text-sage-text mb-2">
                    {c.issuer}
                  </p>

                  {/* Title — h3 per Alex F-C4-2 (heading rotor flat:
                      h1 page → h2 sr-only section → h3 card). */}
                  <h3 className="font-serif font-normal text-[1.5rem] text-near-black leading-tight mb-3">
                    {c.title}
                  </h3>

                  {/* Issued date */}
                  <p className="font-mono text-meta tracking-label uppercase text-sage-text mb-6">
                    {formatIssuedDate(c.issuedDate)}
                  </p>

                  {/* Credential badge — CredentialBadge renders as a polished
                      checkmark + label pill linked to the credential URL.
                      logoUrl is omitted until Sky adds the real badge PNGs,
                      so it renders gracefully as checkmark + label only. */}
                  <div className="mt-auto">
                    <CredentialBadge
                      label={c.title}
                      href={c.credentialUrl}
                    />
                  </div>
                </article>
              </li>
            ))}
          </ul>

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
