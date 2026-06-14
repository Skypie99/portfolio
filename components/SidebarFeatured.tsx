'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/cn';
import type { Deliverable } from '@/lib/schema';

/**
 * SidebarFeatured — the rail's Featured slot, route-aware (§7.2 rider / CO-2).
 *
 * The server Sidebar passes the featured deliverable as a prop (the JSON read
 * stays on the server — getFeaturedDeliverable uses fs and can't run client).
 * When the visitor is ON the featured project's page we mark aria-current="page"
 * and STILL the arrow — geometry never changes, only the hover/focus invitation
 * is withdrawn. Mirrors SidebarSectionNav's client-leaf-inside-server-rail
 * pattern; copy ("Open it →") is frozen.
 *
 * Route match: usePathname() strips basePath ('/portfolio' in prod) and
 * trailingSlash:true makes the live path `/work/<id>/`, so we compare against
 * `/work/${id}/` with no prefix — correct in both dev and prod.
 */
export function SidebarFeatured({ featured }: { featured: Deliverable | null }) {
  const pathname = usePathname();

  if (!featured) {
    return (
      <Link
        href="/work/"
        className="link-draw inline-block font-serif font-normal text-display-s text-near-black"
      >
        Latest work {'→'}
      </Link>
    );
  }

  const onRoute = pathname === `/work/${featured.id}/`;

  return (
    <Link
      href={`/work/${featured.id}/`}
      aria-label={`Featured deliverable: ${featured.title} — ${featured.role}`}
      aria-current={onRoute ? 'page' : undefined}
      className="group flex flex-col gap-1.5 text-near-black transition-colors duration-fast ease-out"
    >
      {/* Half-rank below the wordmark — one serif crown per rail (HI-3).
          Matches the slot's own fallback rank. */}
      <span className="link-draw inline-block font-serif font-normal text-display-s leading-tight">
        {featured.title}
      </span>
      <span className="rail-trim font-sans text-body-sm text-charcoal">
        {featured.role}
      </span>
      <span
        className={cn(
          'rail-trim font-mono text-meta tracking-label uppercase text-accent-text mt-1 inline-flex items-center gap-1 transition-transform duration-fast ease-out',
          // §7.2: stilled when you're already here — withdraw the translate
          // invitation. Geometry/size unchanged; only the nudge is dropped.
          !onRoute && 'group-hover:translate-x-1 group-focus-visible:translate-x-1',
        )}
      >
        Open it
        <span aria-hidden="true">{'→'}</span>
      </span>
    </Link>
  );
}
