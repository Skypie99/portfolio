'use client';

import type { CSSProperties } from 'react';

import BadgeImage from '@/components/BadgeImage';
import { CardField } from '@/components/CardField';
import { CredentialBadge } from '@/components/CredentialBadge';
import { useSpotlight } from '@/lib/motion';
import type { Certificate } from '@/lib/schema';
import { signatureFor } from '@/lib/signature';

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
      className="glass-card group relative isolate flex h-full flex-col overflow-hidden rounded-[22px] p-8"
    >
      <CardField slug={issuerKey(c.issuer)} />

      <div className="relative z-10 flex h-full flex-col items-center text-center">
        {/* Badge well — HI-5: the cream tile the Anthropic doodles already use;
            third-party badges are equalized to a consistent, slightly-reduced
            scale inside it (artwork pixels untouched, protected #12). The light
            tile lives in `.cert-badge-well` (globals.css); --cert-sig is the
            per-issuer hue consumed by the dark surround (item 20, CO-7). */}
        <div
          className="cert-badge-well relative mb-6 flex aspect-square w-full items-center justify-center overflow-hidden rounded-md border border-[rgb(var(--rgb-ink)/0.14)]"
          style={{ '--cert-sig': signatureFor(issuerKey(c.issuer)) } as CSSProperties}
        >
          <BadgeImage
            src={c.badgeImage.src}
            alt={c.badgeImage.alt}
            className="max-h-[72%] max-w-[72%] w-auto h-auto object-contain transition-transform duration-slow ease-gh-glide group-hover:scale-[1.03] group-focus-within:scale-[1.03]"
          />
        </div>

        {/* Issuer */}
        <p className="mb-2 font-mono text-meta uppercase tracking-label text-text-meta">
          {c.issuer}
        </p>

        {/* Title — h3 per Alex F-C4-2 (h1 page → h2 sr-only section → h3 card) */}
        <h3 className="mb-3 font-serif font-normal text-step-2 leading-tight text-near-black nums-lining">
          {c.title}
        </h3>

        {/* Issued date */}
        <p className="mb-6 font-mono text-meta uppercase tracking-label text-text-meta">
          {formatIssuedDate(c.issuedDate)}
        </p>

        <div className="mt-auto">
          <CredentialBadge label={c.title} href={c.credentialUrl} />
        </div>
      </div>
    </article>
  );
}
