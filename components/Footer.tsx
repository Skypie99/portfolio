import Link from 'next/link';

import { FooterEmail } from '@/components/FooterEmail';
import { Reveal } from '@/components/Reveal';
import { cn } from '@/lib/cn';
import { getProfile } from '@/lib/content';

/** Proper brand casing for social platforms — profile.json's `platform` is
 *  a schema-locked lowercase enum, so the display label is mapped at render
 *  ("Github"/"Linkedin" via CSS `capitalize` read as typos to a careful eye). */
const PLATFORM_LABELS: Record<string, string> = {
  github: 'GitHub',
  linkedin: 'LinkedIn',
  twitter: 'Twitter',
  mastodon: 'Mastodon',
  bluesky: 'Bluesky',
};

/**
 * Footer — F-10. Editorial brand block + three columns.
 *
 * 2026-05-27 polish: prominent wordmark + tagline + availability sits in
 * its own row above the columns. The three columns (Site / About /
 * Elsewhere) preserve the ffern-style nav grid Gary's Cycle 11 test
 * locks in.
 *
 * Alex §4.5: external links open in new tab with rel="noopener noreferrer"
 * AND include a visually-hidden "(opens in new tab)" cue for SR users.
 */
export function Footer() {
  const profile = getProfile();
  const year = new Date().getFullYear();

  return (
    <footer
      className={cn(
        'relative',
        'world-surface-alt border-t border-border-decorative',
        'px-gutter pt-20 pb-8',
      )}
    >
      {/* faint warm hairline-glow marking the footer threshold */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(to right, transparent, rgb(var(--rgb-accent) / 0.4) 50%, transparent)',
        }}
      />
      <Reveal className="max-w-content mx-auto">
        {/* Brand block — sits above the columns */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 pb-10 border-b border-stone/60">
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="link-draw inline-block font-serif font-normal text-step-3 text-near-black leading-none self-start"
            >
              {profile.name}
            </Link>
            <p className="font-mono text-meta tracking-label uppercase text-text-meta inline-flex items-center gap-2">
              <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-wa-teal" />
              {profile.location} · Open to work
            </p>
          </div>
          <p className="font-serif font-light text-step-1 text-charcoal max-w-[36ch] leading-snug text-pretty md:text-right">
            {profile.tagline}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Column 1 — Site */}
          <div className="flex flex-col gap-4">
            <h3 className="font-mono text-label tracking-label uppercase text-text-meta">
              Site
            </h3>
            <ul className="flex flex-col gap-2">
              <li>
                <Link
                  href="/"
                  className="link-draw font-sans text-body-sm text-near-black hover:text-accent-text transition-colors duration-fast ease-out"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/work/"
                  className="link-draw font-sans text-body-sm text-near-black hover:text-accent-text transition-colors duration-fast ease-out"
                >
                  The Work
                </Link>
              </li>
              <li>
                <Link
                  href="/certificates/"
                  className="link-draw font-sans text-body-sm text-near-black hover:text-accent-text transition-colors duration-fast ease-out"
                >
                  Credentials
                </Link>
              </li>
              <li>
                <Link
                  href="/about/"
                  className="link-draw font-sans text-body-sm text-near-black hover:text-accent-text transition-colors duration-fast ease-out"
                >
                  A Brief Account
                </Link>
              </li>
              <li>
                <Link
                  href="/blog/"
                  className="link-draw font-sans text-body-sm text-near-black hover:text-accent-text transition-colors duration-fast ease-out"
                >
                  Notes
                </Link>
              </li>
              <li>
                <Link
                  href="/contact/"
                  className="link-draw font-sans text-body-sm text-near-black hover:text-accent-text transition-colors duration-fast ease-out"
                >
                  Correspond
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2 — About */}
          <div className="flex flex-col gap-4">
            <h3 className="font-mono text-label tracking-label uppercase text-text-meta">
              About
            </h3>
            <p className="font-sans text-body-sm text-charcoal leading-[1.65] text-pretty">
              {profile.name} builds AI tools. Small surfaces, real users,
              documented from the first commit. Built in public, five of six
              live on the open internet.
            </p>
          </div>

          {/* Column 3 — Social + Contact */}
          <div className="flex flex-col gap-4">
            <h3 className="font-mono text-label tracking-label uppercase text-text-meta">
              Elsewhere
            </h3>
            <ul className="flex flex-col gap-2">
              <li>
                <FooterEmail />
              </li>
              {profile.socials.map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'link-draw font-sans text-body-sm inline-flex items-center gap-1',
                      'transition-colors duration-fast ease-out',
                      // GitHub gets terracotta — elevated brand presence (resting);
                      // hover unifies to accent-text in dark so it matches the others.
                      s.platform.toLowerCase() === 'github'
                        ? 'text-accent-text hover:text-terracotta dark:hover:text-accent-text'
                        : 'text-near-black hover:text-accent-text',
                    )}
                  >
                    <span>{PLATFORM_LABELS[s.platform] ?? s.platform}</span>
                    <span aria-hidden="true" className="text-text-meta">
                      {'↗'}
                    </span>
                    <span className="sr-only">(opens in new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="mt-12 pt-6 border-t border-stone flex flex-col md:flex-row gap-2 md:gap-6 justify-between items-start md:items-center">
          <p className="font-mono text-meta tracking-label uppercase text-text-meta">
            SkyPi Studio — Est. 2026 · {'©'} {year}
          </p>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-6">
            <p className="font-mono text-meta tracking-label uppercase text-text-meta">
              Built in the Okanagan Valley, British Columbia.
            </p>
            <p className="font-mono text-meta tracking-label uppercase text-text-meta inline-flex items-center gap-2">
              <span
                aria-hidden="true"
                className="inline-block w-1.5 h-1.5 rounded-full bg-wa-teal"
              />
              Made with care
            </p>
          </div>
        </div>
      </Reveal>
    </footer>
  );
}
