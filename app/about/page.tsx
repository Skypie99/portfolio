import type { Metadata } from 'next';
import Link from 'next/link';

import { Button } from '@/components/Button';
import { NumberedStep } from '@/components/NumberedStep';
import { cn } from '@/lib/cn';
import { getDeliverables, getProfile } from '@/lib/content';

export function generateMetadata(): Metadata {
  const profile = getProfile();
  return {
    title: `About — ${profile.name}`,
    description: `About ${profile.name}, an AI builder based in ${profile.location}. ${profile.tagline}`,
  };
}

/**
 * /about — F-07. Sky's story + "How I work" reuses the <NumberedStep />
 * component, then a "What I'm working on" block surfaces the 3 most recent
 * deliverables (linked into /work/[slug]). Restrained ffern-style copy —
 * short sentences, no fluff.
 *
 * Server Component. The placeholder paragraphs below are written in Sky's
 * voice per the brief; he can swap them at any time without touching the
 * layout. Generous line-height (1.65) per Dani §3.
 */
export default function AboutPage() {
  const profile = getProfile();
  // Up to 3 most recent deliverables — featured first if present, otherwise
  // year-desc ordering from getDeliverables(). Quiet list, no images.
  const allDeliverables = getDeliverables();
  const featuredFirst = (() => {
    const f = allDeliverables.find((d) => d.featured);
    const rest = allDeliverables.filter((d) => !d.featured);
    return f ? [f, ...rest] : rest;
  })();
  const recent = featuredFirst.slice(0, 3);

  return (
    <>
      {/* Page header */}
      <section className="px-gutter py-24 lg:py-32 bg-cream">
        <div className="max-w-content mx-auto">
          <p className="font-mono text-label tracking-label uppercase text-text-meta mb-4">
            About
          </p>
          <h1 className="font-serif font-light text-display-l text-near-black leading-tight max-w-3xl mb-8">
            I build AI tools with care.
          </h1>

          {/* Story paragraphs */}
          <div className="max-w-[640px] flex flex-col gap-6">
            <p className="font-sans font-light text-body text-charcoal leading-[1.65]">
              Most of what I make starts with a problem worth solving, then a
              small thing that solves it well. I would rather ship one careful
              deliverable than a dozen rough ones.
            </p>
            <p className="font-sans font-light text-body text-charcoal leading-[1.65]">
              I work from {profile.location}, mostly on AI-assisted tooling,
              accessibility, and the quiet infrastructure that makes a product
              feel calm to use. Long projects, small surfaces, real users.
            </p>
            <p className="font-sans font-light text-body text-charcoal leading-[1.65]">
              I keep a written record of how each thing was built and why —
              both for the people who come next and for me, the next time I
              need to remember.
            </p>
          </div>
        </div>
      </section>

      {/* How I work */}
      <section
        className={cn(
          'reveal-on-scroll',
          'px-gutter py-24 lg:py-32',
          'bg-peach-cream border-t border-border-decorative',
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

          {/* Dani §3.6: hairline dividers between steps as a quiet rhythm marker.
              Stone (#DCDCD6) is purely decorative — exempt from 3:1 per Alex. */}
          <ol className="flex flex-col divide-y divide-border-decorative">
            <li className="py-8 first:pt-0 last:pb-0">
              <NumberedStep
                number="01"
                title="Discover"
                body="Scope an AI project to the smallest honest version of the problem. Talk to the people who'll live with the thing — not just the people who will pay for it."
              />
            </li>
            <li className="py-8 first:pt-0 last:pb-0">
              <NumberedStep
                number="02"
                title="Build"
                body="Loop with agents, iterate fast, ship-and-adjust. Type-safe and accessible from the first line. Refuse to ship what I haven't tried to use."
              />
            </li>
            <li className="py-8 first:pt-0 last:pb-0">
              <NumberedStep
                number="03"
                title="Ship"
                body="Refine in production, learn from use, write down what changed and why. Follow through — a deliverable is the work plus the story of how it was made."
              />
            </li>
          </ol>
        </div>
      </section>

      {/* What I'm working on */}
      {recent.length > 0 && (
        <section
          className={cn(
            'reveal-on-scroll',
            'px-gutter py-24 lg:py-32',
            'bg-cream border-t border-border-decorative',
          )}
        >
          <div className="max-w-content mx-auto">
            <div className="mb-12">
              <p className="font-mono text-label tracking-label uppercase text-text-meta mb-4">
                What I{'’'}m working on
              </p>
              <h2 className="font-serif font-light text-display-m text-near-black max-w-2xl leading-tight">
                A handful of recent things.
              </h2>
            </div>

            <ul className="flex flex-col gap-8 max-w-3xl">
              {recent.map((d) => (
                <li
                  key={d.id}
                  className="border-t border-border-decorative pt-6"
                >
                  <Link
                    href={`/work/${d.id}/`}
                    aria-label={`Read about ${d.title} — ${d.role}, ${d.year}`}
                    className="group flex flex-col gap-2 text-near-black hover:text-accent-text transition-colors duration-fast ease-out"
                  >
                    <p className="font-mono text-meta tracking-label uppercase text-text-meta">
                      {d.role} · {d.year}
                    </p>
                    <h3 className="font-serif font-normal text-[1.5rem] leading-tight">
                      {d.title}
                    </h3>
                    <p className="font-sans font-light text-body text-charcoal leading-[1.65] max-w-[540px]">
                      {d.summary}
                    </p>
                    <span className="font-mono text-meta tracking-label uppercase text-accent-text mt-2 inline-flex items-center gap-1 transition-transform duration-fast ease-out group-hover:translate-x-1">
                      Read more
                      <span aria-hidden="true">{'→'}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-12">
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
      )}

      {/* CTA */}
      <section
        className={cn(
          'reveal-on-scroll',
          'px-gutter py-24 lg:py-32',
          'bg-cream border-t border-border-decorative',
        )}
      >
        <div className="max-w-content mx-auto flex flex-col items-start gap-8">
          <h2 className="font-serif font-light text-display-m text-near-black max-w-2xl leading-tight">
            Want to work together?
            <br />
            Let{'’'}s talk.
          </h2>
          <Button href={`mailto:${profile.contactEmail}?subject=Hello from your portfolio`}>
            Get in touch
          </Button>

          <Link
            href="/"
            className="mt-8 inline-flex items-center gap-2 font-mono text-label tracking-label uppercase text-near-black hover:text-accent-text transition-colors duration-fast ease-out"
          >
            <span aria-hidden="true">{'←'}</span>
            Back to home
          </Link>
        </div>
      </section>
    </>
  );
}
