import type { Metadata } from 'next';
import Link from 'next/link';

import { SettleHeading } from '@/components/HeroSettle';
import { renderMarkdownProse } from '@/components/MarkdownProse';
import { cn } from '@/lib/cn';
import { getColophon, getProfile } from '@/lib/content';
import { bindSeparatorDash, bindSoloLetters } from '@/lib/markdown';

export function generateMetadata(): Metadata {
  const profile = getProfile();
  const description =
    'How this site was made — the stack, the type, the golden-hour world, and the quiet systems behind it.';
  return {
    title: `Colophon — ${profile.name}`,
    description,
    openGraph: {
      type: 'website',
      title: `Colophon — ${profile.name}`,
      description,
      images: [{ url: '/og-image.svg', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Colophon — ${profile.name}`,
      description,
    },
  };
}

/**
 * The three typefaces, shown in their own faces — a live specimen of the type
 * system the prose describes. Uses only existing token classes (font-serif /
 * font-sans / font-mono, the ember crown gradient, ink/meta tokens) — no new
 * system, no inline styles, no new colors. Each specimen is captioned with its
 * family + role as real text, so it reads for screen-reader and no-colour users
 * too (the specimen never carries meaning by appearance alone).
 */
const TYPE_SPECIMENS: { sample: string; sampleClass: string; family: string; role: string }[] = [
  {
    sample: 'Built with intention',
    sampleClass: 'font-serif font-light text-step-4 ember',
    family: 'Cormorant Garamond',
    role: 'serif crowns',
  },
  {
    sample: 'Calm, readable body text — kept light so long-form never tires the eye.',
    sampleClass: 'font-sans font-light text-step-1 text-charcoal',
    family: 'DM Sans',
    role: 'body',
  },
  {
    sample: 'LABELS & METADATA',
    sampleClass: 'font-mono text-label tracking-label uppercase text-text-meta',
    family: 'DM Mono',
    role: 'labels & metadata',
  },
];

/**
 * /colophon — F-§8.2. The site documenting itself: stack, type, the day→night
 * world, the quiet design systems, and the build process.
 *
 * Server Component, fully static. Reuses the established long-form chrome
 * (eyebrow + SettleHeading header → renderMarkdownProse body → closer), the
 * same idiom as /about, /accessibility, and /blog/[slug]. Body copy lives in
 * lib/content.getColophon(). Adds one live type-specimen section built from
 * existing tokens. Inherits world / skip link / <main> / footer from the layout.
 */
export default function ColophonPage() {
  const colophon = getColophon();
  const rendered = renderMarkdownProse(colophon, 'blog');

  return (
    <>
      {/* Page header — eyebrow + display title + summary (matches /about, /accessibility) */}
      <section className="px-gutter py-24 lg:py-32 world-surface">
        <div className="max-w-content mx-auto">
          <p className="font-mono text-label tracking-label uppercase text-accent-ink mb-4 flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta"
            />
            Colophon
          </p>
          <SettleHeading className="font-serif font-light text-display ember max-w-3xl mb-16 text-balance">
            {bindSeparatorDash(bindSoloLetters('How this was made.'))}
          </SettleHeading>
          <p className="font-sans font-light text-step-1 text-charcoal max-w-measure-wide text-pretty">
            The stack, the type, the world, and the quiet systems behind it.
          </p>
        </div>
      </section>

      {/* Body prose — shared long-form renderer; .reveal floors carry the
          reduced-motion / no-JS rest state. */}
      <section
        className={cn(
          'px-gutter',
          'py-32 lg:py-50',
          'world-surface-alt',
          'border-t border-border-decorative',
        )}
      >
        <div className="max-w-content mx-auto">
          <article
            aria-label="Colophon"
            className="max-w-measure-wide flex flex-col gap-8"
          >
            {rendered}
          </article>
        </div>
      </section>

      {/* Live type specimen — the type system shown in its own faces. */}
      <section className="px-gutter py-32 lg:py-50 world-surface border-t border-border-decorative">
        <div className="max-w-content mx-auto">
          <h2 className="font-serif font-light text-prose-h2 text-near-black mb-12">
            The type, set live
          </h2>
          <ul className="flex flex-col gap-12 max-w-measure-wide">
            {TYPE_SPECIMENS.map((t) => (
              <li key={t.family} className="flex flex-col gap-3 border-t border-border-decorative pt-8 first:border-t-0 first:pt-0">
                <p className={t.sampleClass}>{t.sample}</p>
                <p className="font-mono text-meta tracking-label uppercase text-text-meta">
                  {t.family} <span aria-hidden="true">·</span> {t.role}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Closer — cross-link to the accessibility statement, plus back home. */}
      <section className="px-gutter py-18 world-surface border-t border-border-decorative">
        <div className="max-w-content mx-auto flex flex-col items-start gap-8">
          <Link
            href="/accessibility/"
            className="group inline-flex items-center gap-2 font-mono text-label tracking-label uppercase text-near-black hover:text-accent-text transition-colors duration-fast ease-out"
          >
            Read the accessibility statement
            <span
              aria-hidden="true"
              className="inline-block transition-transform duration-base ease-gh-glide group-hover:translate-x-1"
            >
              {'→'}
            </span>
          </Link>
          <Link
            href="/"
            className="group inline-flex items-center gap-2 font-mono text-meta tracking-label uppercase text-text-meta hover:text-accent-text transition-colors duration-fast ease-out"
          >
            <span
              aria-hidden="true"
              className="inline-block transition-transform duration-base ease-gh-glide group-hover:-translate-x-1"
            >
              {'←'}
            </span>
            Back to home
          </Link>
        </div>
      </section>
    </>
  );
}
