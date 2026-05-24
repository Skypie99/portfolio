import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Button } from '@/components/Button';
import { cn } from '@/lib/cn';
import { getDeliverables, getProfile } from '@/lib/content';

type RouteParams = { slug: string };

/**
 * Static export needs every dynamic route enumerated at build time.
 * `output: 'export'` + `generateStaticParams` = each slug becomes its own
 * /work/<slug>/index.html on disk.
 */
export function generateStaticParams(): RouteParams[] {
  return getDeliverables().map((d) => ({ slug: d.id }));
}

export function generateMetadata({
  params,
}: {
  params: RouteParams;
}): Metadata {
  const d = getDeliverables().find((x) => x.id === params.slug);
  if (!d) {
    return { title: 'Work — not found' };
  }
  return {
    title: `${d.title} — Selected Work`,
    description: d.summary,
  };
}

/**
 * /work/[slug] — F-05. Editorial deliverable detail.
 *
 * Server Component. Layout: hero image (top on mobile, left on md+),
 * details on the right. Sections per spec:
 *   1. Back-link "← All work"
 *   2. Hero image / cream-tinted fallback
 *   3. Title + summary + role/year + tech pills (left), links list (right)
 *   4. Optional Gallery (if `gallery` array non-empty)
 *   5. mailto CTA at bottom
 *
 * Per Alex §4.5, external links open in new tab with rel="noopener noreferrer"
 * AND an sr-only "(opens in new tab)" cue.
 */
export default function WorkDetailPage({ params }: { params: RouteParams }) {
  const allDeliverables = getDeliverables();
  const deliverable = allDeliverables.find((d) => d.id === params.slug);
  if (!deliverable) {
    notFound();
  }
  const profile = getProfile();
  const d = deliverable;
  // "Other work" — up to 2 sibling deliverables, prefer same-year + non-self.
  // Cheap quiet recommendation; no algorithm, just neighbours.
  const others = allDeliverables.filter((x) => x.id !== d.id).slice(0, 2);

  return (
    <>
      {/* Back link */}
      <section className="px-gutter pt-16 lg:pt-20 bg-cream">
        <div className="max-w-content mx-auto">
          <Link
            href="/work/"
            className="inline-flex items-center gap-2 font-mono text-label tracking-label uppercase text-accent-text hover:text-near-black transition-colors duration-fast ease-out"
          >
            <span aria-hidden="true">{'←'}</span>
            All work
          </Link>
        </div>
      </section>

      {/* Main content — hero left, details right */}
      <section className="px-gutter py-12 md:py-16 lg:py-24 bg-cream">
        <div className="max-w-content mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-start">
            {/* Hero image / fallback block */}
            <div className="relative w-full aspect-[4/5] bg-blush border border-border-decorative overflow-hidden flex items-center justify-center order-1 md:order-1">
              <img
                src={d.heroImage.src}
                alt={d.heroImage.alt}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <span
                aria-hidden="true"
                className="font-serif font-light text-[2rem] text-umber px-6 text-center"
              >
                {d.title}
              </span>
            </div>

            {/* Details column */}
            <div className="flex flex-col gap-8 order-2 md:order-2 md:sticky md:top-12">
              {d.featured && (
                <p className="font-mono text-meta tracking-label uppercase text-accent-text inline-flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="inline-block w-2 h-2 rounded-full bg-terracotta"
                  />
                  Featured
                </p>
              )}

              <h1 className="font-serif font-light text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.1] text-near-black">
                {d.title}
              </h1>

              <p className="font-sans font-light text-body text-charcoal leading-[1.65]">
                {d.summary}
              </p>

              {/* Role / Year */}
              <dl className="grid grid-cols-2 gap-6 border-t border-border-decorative pt-6">
                <div>
                  <dt className="font-mono text-meta tracking-label uppercase text-text-meta mb-1">
                    Role
                  </dt>
                  <dd className="font-sans text-body text-near-black">
                    {d.role}
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-meta tracking-label uppercase text-text-meta mb-1">
                    Year
                  </dt>
                  <dd className="font-sans text-body text-near-black">
                    {d.year}
                  </dd>
                </div>
              </dl>

              {/* Tech pills */}
              <div>
                <p className="font-mono text-meta tracking-label uppercase text-text-meta mb-3">
                  Tech
                </p>
                <ul className="flex flex-wrap gap-2">
                  {d.tech.map((t) => (
                    <li
                      key={t}
                      className="inline-flex items-center px-3 py-1 rounded-pill bg-sand text-umber font-mono text-meta tracking-label uppercase"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Links list */}
              {d.links && d.links.length > 0 && (
                <div className="border-t border-border-decorative pt-6">
                  <p className="font-mono text-meta tracking-label uppercase text-text-meta mb-3">
                    Links
                  </p>
                  <ul className="flex flex-col gap-2">
                    {d.links.map((l) => (
                      <li key={l.href}>
                        <a
                          href={l.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-sans text-body text-accent-text hover:text-near-black underline underline-offset-4 decoration-1 inline-flex items-center gap-2 transition-colors duration-fast ease-out"
                        >
                          <span className="font-mono text-meta tracking-label uppercase text-text-meta mr-2">
                            {l.type}
                          </span>
                          <span>{l.label}</span>
                          <span aria-hidden="true">{'↗'}</span>
                          <span className="sr-only">(opens in new tab)</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tags */}
              {d.tags.length > 0 && (
                <div className="border-t border-border-decorative pt-6">
                  <p className="font-mono text-meta tracking-label uppercase text-text-meta mb-3">
                    Tags
                  </p>
                  <ul className="flex flex-wrap gap-2">
                    {d.tags.map((tag) => (
                      <li
                        key={tag}
                        className="font-mono text-meta tracking-label uppercase text-sage-text"
                      >
                        #{tag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Optional gallery */}
      {d.gallery && d.gallery.length > 0 && (
        <section className="px-gutter py-16 lg:py-24 bg-blush border-t border-border-decorative">
          <div className="max-w-content mx-auto">
            <p className="font-mono text-label tracking-label uppercase text-text-meta mb-4">
              Gallery
            </p>
            <h2 className="font-serif font-light text-display-m text-near-black mb-12 max-w-2xl leading-tight">
              A closer look.
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              {d.gallery.map((img) => (
                <li key={img.src} className="flex flex-col gap-3">
                  <div className="relative w-full aspect-[4/3] bg-peach-cream border border-border-decorative overflow-hidden flex items-center justify-center">
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                    />
                    <span
                      aria-hidden="true"
                      className="font-serif font-light text-[1.25rem] text-umber px-4 text-center"
                    >
                      {d.title}
                    </span>
                  </div>
                  {img.caption && (
                    <p className="font-sans text-body-sm text-charcoal leading-[1.6]">
                      {img.caption}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Other work */}
      {others.length > 0 && (
        <section
          className={cn(
            'px-gutter py-16 lg:py-24',
            'bg-cream border-t border-border-decorative',
          )}
        >
          <div className="max-w-content mx-auto">
            <p className="font-mono text-label tracking-label uppercase text-text-meta mb-4">
              Other work
            </p>
            <h2 className="font-serif font-light text-display-m text-near-black max-w-2xl leading-tight mb-12">
              Keep reading.
            </h2>

            <ul className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              {others.map((o) => (
                <li key={o.id} className="border-t border-border-decorative pt-6">
                  <Link
                    href={`/work/${o.id}/`}
                    aria-label={`Read about ${o.title} — ${o.role}, ${o.year}`}
                    className="group flex flex-col gap-2 text-near-black hover:text-accent-text transition-colors duration-fast ease-out"
                  >
                    <p className="font-mono text-meta tracking-label uppercase text-text-meta">
                      {o.role} · {o.year}
                    </p>
                    <h3 className="font-serif font-normal text-[1.5rem] leading-tight">
                      {o.title}
                    </h3>
                    <p className="font-sans font-light text-body-sm text-charcoal leading-[1.65] max-w-[540px]">
                      {o.summary}
                    </p>
                    <span className="font-mono text-meta tracking-label uppercase text-accent-text mt-2 inline-flex items-center gap-1 transition-transform duration-fast ease-out group-hover:translate-x-1">
                      Read more
                      <span aria-hidden="true">{'→'}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Closing CTA */}
      <section
        className={cn(
          'px-gutter py-24 lg:py-32',
          'bg-cream border-t border-border-decorative',
        )}
      >
        <div className="max-w-content mx-auto flex flex-col items-start gap-8">
          <h2 className="font-serif font-light text-display-m text-near-black max-w-2xl leading-tight">
            Have a project like this?
            <br />
            Let{'’'}s talk.
          </h2>
          <Button
            href={`mailto:${profile.contactEmail}?subject=About ${encodeURIComponent(d.title)}`}
          >
            Get in touch
          </Button>
        </div>
      </section>
    </>
  );
}
