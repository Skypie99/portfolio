/**
 * Portfolio 3.0 Phase 02 · F-028 — shared canonical/URL helpers.
 *
 * Every indexable route must emit its own absolute self-canonical
 * (`<link rel="canonical">`), never inherit the homepage's or a sibling
 * route's. Next's metadata resolution replaces a top-level field (like
 * `alternates`) wholesale per route rather than deep-merging it, so every
 * indexable page's own `generateMetadata`/`metadata` export must set
 * `alternates: { canonical: canonicalFor(path) } }` itself — the same
 * TA-10-class inheritance trap this codebase already documents for
 * `openGraph` (see app/about/page.tsx and siblings).
 *
 * `/archive` and `/runway` also declare self-canonicals to avoid inheriting
 * the homepage canonical; both retain `robots: { index: false }`. A
 * canonical does not grant indexability. Legacy redirect stubs carry their
 * own hand-written destination canonical (see static-integrity.test.ts).
 */

export const SITE_URL = 'https://skypistudio.com';

/** Resolve a site-relative path (e.g. "/work/flagstone/") to an absolute URL. */
export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

/** The canonical self-URL for an indexable route. */
export function canonicalFor(path: string): string {
  return absoluteUrl(path);
}
