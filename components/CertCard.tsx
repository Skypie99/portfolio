'use client';

import BadgeImage from '@/components/BadgeImage';
import { CardField } from '@/components/CardField';
import { CredentialBadge } from '@/components/CredentialBadge';
import { useSpotlight } from '@/lib/motion';
import type { Certificate } from '@/lib/schema';

const MONTHS = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
];

function formatIssuedDate(iso: string): string {
  const [yearStr, monthStr] = iso.split('-');
  const year = Number(yearStr);
  const month = MONTHS[Number(monthStr) - 1] ?? '';
  return `ISSUED ${month} ${year}`;
}

/** issuer → CardField caustic key (e.g. "DeepLearning.AI" → "deeplearning-ai"). */
function issuerKey(issuer: string): string {
  return issuer.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/**
 * CertCard — a credential on the same liquid-glass material as the work cards
 * (organic-pass 2026-06-03: cert/work coherence). Frosted glass body, spectral
 * rim, cursor-follow specular (useSpotlight → --mx/--my) and a living per-issuer
 * caustic (CardField), so /certificates reads as one system with /work instead
 * of a flat earlier-generation tier. The badge sits in a lit well that brightens
 * on hover; the credential link carries its own focus ring. Ink tokens flip AA
 * in both modes; RM → static (glass + caustic both degrade gracefully).
 */
export function CertCard({ certificate: c }: { certificate: Certificate }) {
  const spotRef = useSpotlight<HTMLDivElement>();

  return (
    <article
      ref={spotRef}
      // L5-03: the md band (sidebar-narrowed ~424px column) gets a DESIGNED
      // ledger row — badge well left, text right — instead of the inherited
      // phone stack whose aspect-square well filled a whole tablet screen per
      // credential. lg returns to the 3-column vertical card untouched.
      className="glass-card group relative isolate flex h-full flex-col overflow-hidden rounded-card p-12 md:max-lg:p-8"
    >
      <CardField slug={issuerKey(c.issuer)} />

      <div className="relative z-10 flex h-full flex-col md:max-lg:flex-row md:max-lg:items-center md:max-lg:gap-8">
        {/* Badge well — lit from above, badge leans in on hover */}
        <div
          className="relative mb-8 flex aspect-square w-full items-center justify-center overflow-hidden rounded-md border border-[rgb(var(--rgb-ink)/0.08)] md:max-lg:mb-0 md:max-lg:w-36 md:max-lg:shrink-0"
          style={{
            background:
              'radial-gradient(60% 60% at 50% 36%, rgb(var(--rgb-surface-warm)) 0%, rgb(var(--rgb-surface-mid)) 55%, rgb(var(--rgb-canvas-alt)) 100%)',
          }}
        >
          <BadgeImage
            src={c.badgeImage.src}
            alt={c.badgeImage.alt}
            className="absolute inset-0 h-full w-full object-contain p-4 transition-transform duration-slow ease-gh-glide group-hover:scale-[1.03] group-focus-within:scale-[1.03]"
          />
        </div>

        {/* Text block — display:contents outside the md band, so base + lg DOM
            behavior (incl. the verify pill's mt-auto against the card column)
            is byte-identical; at md it becomes the ledger row's right column. */}
        <div className="contents md:max-lg:flex md:max-lg:min-w-0 md:max-lg:flex-1 md:max-lg:flex-col">
          {/* Issuer */}
          <p className="mb-2 font-mono text-meta uppercase tracking-label text-text-meta">
            {c.issuer}
          </p>

          {/* Title — h3 per Alex F-C4-2 (h1 page → h2 sr-only section → h3 card) */}
          <h3 className="mb-3 font-serif font-normal text-step-2 leading-tight text-near-black nums-lining">
            {c.title}
          </h3>

          {/* Issued date */}
          <p className="mb-8 font-mono text-meta uppercase tracking-label text-text-meta md:max-lg:mb-6">
            {formatIssuedDate(c.issuedDate)}
          </p>

          <div className="mt-auto">
            <CredentialBadge label={c.title} href={c.credentialUrl} />
          </div>
        </div>
      </div>
    </article>
  );
}
