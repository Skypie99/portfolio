import type { Metadata } from 'next';

import { ArchiveApp } from '@/components/archive/ArchiveApp';
import { getProfile } from '@/lib/content';
import { canonicalFor } from '@/lib/metadata';
import { OG_CARD } from '@/lib/og';

import './archive.css';

/**
 * /archive — the Studio Archive (private, auth-gated). Server Component: emits
 * metadata and renders the client app.
 *
 * robots noindex/nofollow (it is a personal, private surface), but the share-card
 * tags are still restated in full — a leaf openGraph REPLACES the root layout's,
 * so url / siteName / locale / a distinct title must be declared here or the
 * static-integrity share-card guards fail. (See app/colophon/page.tsx for the
 * pattern this mirrors.)
 */
export function generateMetadata(): Metadata {
  const profile = getProfile();
  const title = `The Studio Archive — ${profile.name}`;
  const description = 'A private catalogue of artworks and art supplies.';
  return {
    title,
    description,
    robots: { index: false, follow: false },
    // F-028: without its own self-canonical this noindex route would
    // silently inherit the root layout's `/` canonical (the same
    // TA-10-class inheritance defect the openGraph block below already
    // guards against) and falsely claim to BE the homepage.
    alternates: {
      canonical: canonicalFor('/archive/'),
    },
    openGraph: {
      type: 'website',
      url: '/archive/',
      siteName: 'Skyler Halisky: Senior Technical Support',
      locale: 'en_CA',
      title,
      description,
      images: [OG_CARD],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default function ArchivePage() {
  return <ArchiveApp />;
}
