'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/cn';
import { useActiveSection } from '@/lib/motion';

/**
 * SidebarArticleNav — the in-article contents index (§8.3).
 *
 * On long-form routes (a single Note or case study — /blog/<slug>/,
 * /work/<slug>/) this reads the article's `##` section headings (which carry
 * slug ids from renderMarkdownProse) and renders a quiet "On this page" index
 * in the desktop rail, highlighting the section you're reading via the existing
 * IntersectionObserver scroll-spy (`useActiveSection`). Off long-form routes it
 * renders nothing — SidebarSectionNav covers home + the rest of the site, and
 * the two never both show (SidebarSectionNav returns null on these routes).
 *
 * Same visual grammar as SidebarSectionNav (mono label, terracotta active
 * marker, aria-current). Accessibility/no-JS: headings are read client-side, so
 * with JS off this index is simply absent — the article itself, its headings,
 * and the in-page anchors all still work. Reduced motion: the marker's scale
 * transition is snapped by the global rule; active tracking is observer-driven.
 */
const LONGFORM_ROUTE = /^\/(blog|work)\/[^/]+\/?$/;

type Heading = { id: string; label: string };

export function SidebarArticleNav() {
  const pathname = usePathname() ?? '';
  const isLongForm = LONGFORM_ROUTE.test(pathname);
  const [headings, setHeadings] = useState<Heading[]>([]);

  useEffect(() => {
    if (!isLongForm || typeof document === 'undefined') {
      setHeadings([]);
      return;
    }
    const read = () => {
      const els = Array.from(document.querySelectorAll<HTMLElement>('main h2[id]'));
      setHeadings(
        els
          .map((el) => ({ id: el.id, label: el.textContent?.trim() ?? '' }))
          .filter((h) => h.id && h.label),
      );
    };
    read();
    // Re-read once after layout settles — covers client navigation between
    // posts (the persistent rail outlives the page swap / view transition).
    const raf = requestAnimationFrame(read);
    return () => cancelAnimationFrame(raf);
  }, [pathname, isLongForm]);

  const active = useActiveSection(headings.map((h) => h.id));

  if (!isLongForm) return null;
  // Headings are read from the DOM AFTER hydration, so on SSR / first paint the
  // index is empty. Rather than render nothing (which then grows ~155px on
  // hydrate and shoves the rail's NOTES + CTA down — a ~0.005 CLS on the rail at
  // md/768), reserve the index's height with a placeholder. It's gated on
  // scripting:enabled in CSS, so a no-JS visitor — who never gets this
  // client-read index at all — sees no empty gap.
  if (headings.length === 0) {
    // C-42-rider: the reserve must MATCH the route's populated rail, or the swap
    // to the real <nav> on hydrate shifts the rail's NOTES + CTA. Measured (768 +
    // 1440): case studies run to the 4-heading story spine (≈155px, the CSS
    // default) while the long-form Note runs to 5 headings (≈214px). A single
    // fixed value forced the Note to grow ~59px on hydrate — the site's worst CLS
    // (0.00303). Key the reserve off the route so BOTH land at ~0 shift, and so a
    // future C-42 doorway heading only needs its own route's number retuned here.
    const isNote = /^\/blog\/[^/]+\/?$/.test(pathname);
    return (
      <div
        className="sidebar-toc-reserve"
        aria-hidden="true"
        style={isNote ? { minHeight: 214 } : undefined}
      />
    );
  }

  return (
    <nav aria-label="On this page" className="flex flex-col gap-3">
      <span className="font-mono text-label tracking-label uppercase text-text-meta">
        On this page
      </span>
      <ul className="flex flex-col gap-2.5">
        {headings.map((h) => {
          const isActive = active === h.id;
          return (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                aria-current={isActive ? 'true' : undefined}
                className={cn(
                  'group relative inline-flex items-start pl-3',
                  'font-mono text-meta tracking-label uppercase',
                  'transition-colors duration-fast ease-out',
                  isActive ? 'text-near-black' : 'text-text-meta hover:text-near-black',
                )}
              >
                {/* Quiet active marker — 2px terracotta bar; aria-current carries
                    the semantic. Snapped instantly under reduced motion. */}
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute left-0 top-2 h-3.5 w-0.5 origin-center rounded-pill bg-terracotta',
                    'transition-transform duration-fast ease-out',
                    isActive ? 'scale-y-100' : 'scale-y-0',
                  )}
                />
                <span className="transition-transform duration-fast ease-out group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5">
                  {h.label}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
