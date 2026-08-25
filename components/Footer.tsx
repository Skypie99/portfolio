import Link from 'next/link';

import { FooterEmail } from '@/components/FooterEmail';
import { Reveal } from '@/components/Reveal';
import { cn } from '@/lib/cn';
import { getProfile } from '@/lib/content';

/** Proper brand casing for social platforms — profile.json's `platform` is
 *  a schema-locked lowercase enum, so the display label is mapped at render
 *  ("Github"/"Linkedin" via CSS `capitalize` read as typos to a careful eye). */
export const PLATFORM_LABELS: Record<string, string> = {
  github: 'GitHub',
  linkedin: 'LinkedIn',
  twitter: 'Twitter',
  mastodon: 'Mastodon',
  bluesky: 'Bluesky',
};

/**
 * Footer — F-10. Editorial brand block + three columns.
 *
 * 2026-06-10 voice pass: prominent wordmark + tagline sit in their own
 * row above the columns — no availability status, no © clutter. The
 * three columns (Site / About / Elsewhere) preserve the ffern-style nav
 * grid Gary's Cycle 11 test locks in.
 *
 * Alex §4.5: external links open in new tab with rel="noopener noreferrer"
 * AND include a visually-hidden "(opens in new tab)" cue for SR users.
 */
export function Footer() {
  const profile = getProfile();
  const linkedin = profile.socials.find((s) => s.platform === 'linkedin');

  return (
    <footer
      // C-71: this <footer> is nested (not a <body> child), so it isn't an
      // implicit contentinfo landmark. The explicit role makes it discoverable to
      // AT landmark nav — NOT the structural sibling move, which would re-center
      // the max-w-content block and stretch the PROTECT alpenglow arc.
      role="contentinfo"
      className={cn(
        'relative',
        'world-surface-alt border-t border-border-decorative',
        // SP-6: threshold approach — 112px below lg (pt-28 = 7rem) stepping to
        // 200px at lg (pt-50 = 12.5rem); pb-12 (3rem/48px) keeps the exit
        // asymmetry. Honest scale (§7.4): numerals now track the rendered size.
        'px-gutter pt-28 lg:pt-50 pb-12',
      )}
    >
      {/* Warm alpenglow seam — the day→night climax crests at the footer
          threshold. Its strength rides --day-night, so it's invisible at golden
          day and peaks as night arrives at the door. Centered on the seam so it
          spills up into the page and down into the footer's top padding (above
          the body text); paints over the footer's translucent surface so the
          climax reads even where the panels are near-opaque. Decorative + inert. */}
      <div
        aria-hidden="true"
        className="footer-alpenglow pointer-events-none absolute inset-x-0 top-0 h-48 -translate-y-1/2"
      />
      {/* crisp warm hairline thread marking the exact threshold */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px footer-threshold"
      />
      <Reveal className="max-w-content mx-auto">
        {/* Brand block — sits above the columns */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-24 pb-16 border-b border-stone/60">
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="link-draw inline-block font-serif font-normal text-step-3 text-ink leading-none self-start"
            >
              {profile.name}
            </Link>
            <p className="font-mono text-meta tracking-label uppercase text-text-meta">
              {profile.tagline}
            </p>
            {/* L8-02: the imprint sits directly beneath the author's wordmark —
                the way a book's title page binds a writer to their press. The
                terracotta sun-dot is the aria-hidden connective mark. Relocated
                here from the bottom strip; zero new words, only adjacency. */}
            <p className="font-mono text-meta tracking-label uppercase text-text-meta inline-flex items-center gap-2">
              <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
              SkyPi Studio — Est. 2026
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Column 1 — Site */}
          <div className="flex flex-col gap-4">
            <h2 className="font-mono text-label tracking-label uppercase text-text-meta">
              Site
            </h2>
            <ul className="flex flex-col gap-2">
              <li>
                <Link
                  href="/"
                  className="link-draw font-sans text-body-sm text-ink hover:text-accent-text transition-colors duration-fast ease-out"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/work/"
                  className="link-draw font-sans text-body-sm text-ink hover:text-accent-text transition-colors duration-fast ease-out"
                >
                  The Work
                </Link>
              </li>
              <li>
                <Link
                  href="/certificates/"
                  className="link-draw font-sans text-body-sm text-ink hover:text-accent-text transition-colors duration-fast ease-out"
                >
                  Credentials
                </Link>
              </li>
              <li>
                <Link
                  href="/about/"
                  className="link-draw font-sans text-body-sm text-ink hover:text-accent-text transition-colors duration-fast ease-out"
                >
                  A Brief Account
                </Link>
              </li>
              <li>
                <Link
                  href="/blog/"
                  className="link-draw font-sans text-body-sm text-ink hover:text-accent-text transition-colors duration-fast ease-out"
                >
                  Notes
                </Link>
              </li>
              {/* B5 (Phase B, THE ROOM G1.3): promoted ahead of the closing CTA —
                  grouped with Notes as the site's other standalone read, rather
                  than trailing last in the column. */}
              <li>
                <Link
                  href="/accessibility/"
                  className="link-draw font-sans text-body-sm text-ink hover:text-accent-text transition-colors duration-fast ease-out"
                >
                  Accessibility
                </Link>
              </li>
              <li>
                <Link
                  href="/colophon/"
                  className="link-draw font-sans text-body-sm text-ink hover:text-accent-text transition-colors duration-fast ease-out"
                >
                  Colophon
                </Link>
              </li>
              <li>
                <Link
                  href="/contact/"
                  className="link-draw font-sans text-body-sm text-ink hover:text-accent-text transition-colors duration-fast ease-out"
                >
                  Let’s talk
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2 — About */}
          <div className="flex flex-col gap-4">
            <h2 className="font-mono text-label tracking-label uppercase text-text-meta">
              About
            </h2>
            <p className="font-sans text-body-sm text-ink-muted leading-body text-pretty">
              {profile.name} builds small, careful AI tools. Accessible by
              default, useful by design, so no one’s left out. Built in
              public, honest about what ships — every one of them live on the open
              internet.
            </p>
            {/* L3-03: the quiet career-document pointer — the fullest history
                lives on LinkedIn. Deliberately NOT a résumé PDF (Sky's
                employer-safe, quiet-search stance). */}
            {linkedin && (
              <a
                href={linkedin.url}
                target="_blank"
                rel="noopener noreferrer"
                className="link-draw font-sans text-body-sm text-ink hover:text-accent-text transition-colors duration-fast ease-out inline-flex items-center gap-1 self-start"
              >
                <span>Full history on LinkedIn</span>
                {/* UP-11: no colour override — the ↗ takes its label's colour.
                    That is the house external-link grammar (C-78, named in
                    CredentialBadge.tsx); the former text-text-meta override was
                    one of only three left in the estate. Rendered census (162 ↗
                    instances, 10 routes × 2 themes) in
                    receipts/p4/glyph-census-*.json. */}
                <span aria-hidden="true">{'↗'}</span>
                <span className="sr-only">(opens in new tab)</span>
              </a>
            )}
          </div>

          {/* Column 3 — Social + Contact */}
          <div className="flex flex-col gap-4">
            <h2 className="font-mono text-label tracking-label uppercase text-text-meta">
              Elsewhere
            </h2>
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
                        : 'text-ink hover:text-accent-text',
                    )}
                  >
                    <span>{PLATFORM_LABELS[s.platform] ?? s.platform}</span>
                    {/* UP-11: the ↗ takes its label's colour (C-78 house
                        grammar) — so GitHub's accent label no longer carries a
                        muted glyph. The RESTING accent above is deliberate and
                        untouched; only the glyph mismatch was in scope. */}
                    <span aria-hidden="true">{'↗'}</span>
                    <span className="sr-only">(opens in new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom strip — the Okanagan postmark stays; the SkyPi Studio
            postmark moved up into the brand block (L8-02, author over imprint). */}
        <div className="mt-24 pt-8 border-t border-stone flex flex-col md:flex-row gap-2 md:gap-8 justify-between items-start md:items-center">
          <p className="font-mono text-meta tracking-label uppercase text-text-meta">
            Built in the Okanagan Valley, British{'\u00A0'}Columbia.
          </p>
          {/* WM-2 \u2014 the privacy postmark. Right-hand mate of the Okanagan line in
              the same justify-between row; a separate <p> so it is its own AT-rotor
              unit (no "Okanagan Valley\u2026 No analytics." run-on). Same mono/meta
              grammar; AA in both themes. NEEDS-SKY COPY \u2014 Sky's exact words, strict
              receipt form: two negated nouns, four words, zero "we", zero adjectives.
              Re-grep the privacy premise before shipping (no analytics deps, no
              document.cookie, no Set-Cookie) so the claim stays true. */}
          <p className="font-mono text-meta tracking-label uppercase text-text-meta">
            No analytics. No cookies.
          </p>
        </div>
      </Reveal>
    </footer>
  );
}
