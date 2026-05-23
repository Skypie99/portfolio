import Link from 'next/link';

import { Button } from '@/components/Button';
import { Hero } from '@/components/Hero';
import { NumberedStep } from '@/components/NumberedStep';
import { cn } from '@/lib/cn';
import { getDeliverables, getProfile } from '@/lib/content';

/**
 * Homepage. Server Component — reads content at build time, ships zero JS
 * for the static blocks. Hero + HamburgerNav are the only client modules.
 *
 * Layout sequence:
 *  1. Hero (F-01)
 *  2. Selected work — three deliverables, featured one first
 *  3. How I work — Discover / Build / Ship
 *  4. CTA — mailto with the terracotta dot
 */
export default function HomePage() {
  const profile = getProfile();
  const deliverables = getDeliverables();
  // Show up to 3, featured first if present (getDeliverables() returns newest-first by year;
  // we also surface the featured at the top of the selected list).
  const featured = deliverables.find((d) => d.featured);
  const others = deliverables.filter((d) => !d.featured).slice(0, featured ? 2 : 3);
  const selected = featured ? [featured, ...others] : others;

  return (
    <>
      <Hero
        eyebrow="AI portfolio — 2026"
        heading={profile.tagline}
        subhead="A small studio of AI-assisted tools, audits, and reference materials. Built slowly. Documented honestly."
        ctaLabel="View the work"
        ctaHref="/work/"
      />

      {/* Selected work */}
      <section
        className={cn(
          'px-gutter',
          'py-12 md:py-16 lg:py-20',
          'bg-cream',
          'border-t border-border-decorative',
        )}
      >
        <div className="max-w-content mx-auto">
          <div className="mb-12">
            <p className="font-mono text-label tracking-label uppercase text-text-meta mb-4">
              Selected work
            </p>
            <h2 className="font-serif font-light text-display-m text-near-black max-w-2xl leading-tight">
              A handful of recent things, made with intention.
            </h2>
          </div>

          <ul className="flex flex-col gap-12">
            {selected.map((d, idx) => (
              <li key={d.id}>
                <article
                  className={cn(
                    'group',
                    'border-t border-border-decorative pt-12',
                    idx === 0 && 'border-t-0 pt-0',
                  )}
                >
                  <div className="flex flex-col md:flex-row md:items-baseline gap-6 md:gap-12">
                    <span
                      aria-hidden="true"
                      className="font-mono text-display-s tracking-label uppercase text-accent-text w-12 shrink-0"
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1 flex flex-col gap-3">
                      <p className="font-mono text-meta tracking-label uppercase text-text-meta">
                        {d.role} · {d.year}
                      </p>
                      <h3 className="font-serif font-normal text-[1.75rem] md:text-[2rem] text-near-black leading-tight">
                        {d.title}
                        {d.featured && (
                          <span
                            aria-hidden="true"
                            className="inline-block ml-3 align-middle w-2 h-2 rounded-full bg-terracotta"
                          />
                        )}
                      </h3>
                      <p className="font-sans font-light text-body text-charcoal leading-[1.65] max-w-[640px]">
                        {d.summary}
                      </p>
                      <ul className="flex flex-wrap gap-2 mt-2">
                        {d.tech.slice(0, 4).map((t) => (
                          <li
                            key={t}
                            className="inline-flex items-center px-3 py-1 rounded-pill bg-sand text-umber font-mono text-meta tracking-label uppercase"
                          >
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ul>

          <div className="mt-16">
            <Link
              href="/work/"
              className="inline-flex items-center gap-2 font-mono text-label tracking-label uppercase text-near-black hover:text-accent-text transition-colors duration-fast ease-out"
            >
              See all work
              <span aria-hidden="true">{'→'}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* How I work */}
      <section
        className={cn(
          'px-gutter',
          'py-12 md:py-16 lg:py-20',
          'bg-peach-cream',
        )}
      >
        <div className="max-w-content mx-auto">
          <div className="mb-12">
            <p className="font-mono text-label tracking-label uppercase text-text-meta mb-4">
              How I work
            </p>
            <h2 className="font-serif font-light text-display-m text-near-black max-w-2xl leading-tight">
              Three quiet steps, repeated carefully.
            </h2>
          </div>

          <ol className="flex flex-col gap-10">
            <li>
              <NumberedStep
                number="01"
                title="Discover"
                body="Start with the smallest, most honest version of the problem. Talk to the people who will live with the thing — not just the people who will buy it."
              />
            </li>
            <li>
              <NumberedStep
                number="02"
                title="Build"
                body="One careful slice at a time. Type-safe, accessible from the first line, instrumented enough to learn from. Refuse to ship what I haven't tried to use."
              />
            </li>
            <li>
              <NumberedStep
                number="03"
                title="Ship"
                body="Document what changed, what's still rough, and what the next maintainer will need to know. A deliverable is the work plus the story of how it was made."
              />
            </li>
          </ol>
        </div>
      </section>

      {/* Closing CTA */}
      <section
        className={cn(
          'px-gutter',
          'py-12 md:py-16 lg:py-20',
          'bg-cream',
          'border-t border-border-decorative',
        )}
      >
        <div className="max-w-content mx-auto flex flex-col items-start gap-8">
          <h2 className="font-serif font-light text-display-m text-near-black max-w-2xl leading-tight">
            Have an AI project worth building?
            <br />
            Let{'’'}s talk.
          </h2>
          <Button href={`mailto:${profile.contactEmail}`}>Get in touch</Button>
        </div>
      </section>
    </>
  );
}
