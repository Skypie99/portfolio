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
            I&apos;m learning to build AI tools — and documenting everything along the way.
          </h1>

          {/* Story paragraphs */}
          <div className="max-w-[640px] flex flex-col gap-6">
            <p className="font-sans font-light text-body text-charcoal leading-[1.65]">
              I&apos;m a beginner coder based in {profile.location}. I started
              building because I had problems worth solving and couldn&apos;t
              wait for someone else to solve them. Most days that means
              shipping something small, learning from it, and trying again.
            </p>
            <p className="font-sans font-light text-body text-charcoal leading-[1.65]">
              My projects live at the intersection of AI tooling, accessibility,
              and privacy. I care about who gets left out of software — so the
              things I build try to include them instead.
            </p>
            <p className="font-sans font-light text-body text-charcoal leading-[1.65]">
              I write down how each thing was built and why. Partly for the
              people who come next. Mostly because I forget, and honest
              documentation is the kindest thing you can leave behind.
            </p>
          </div>
        </div>
      </section>

      {/* How I work — Cycle 17: Dani §3.6 strict refit. */}
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
              How I work
            </p>
            <h2 className="font-serif font-light text-display-m text-near-black max-w-2xl leading-tight">
              Claude Code, multi-agent systems, and a lot of iteration.
            </h2>
          </div>

          {/* Peach-cream callout panel — Dani §3.6. Hairline dividers
              between steps preserved from Cycle 7 (Stone decorative). */}
          <div className="bg-peach-cream border border-border-decorative rounded-lg p-8 md:p-12">
            <ol className="flex flex-col divide-y divide-border-decorative">
              <li className="py-8 first:pt-0 last:pb-0">
                <NumberedStep
                  number="01"
                  title="Start with Claude Code"
                  body="I use Claude Code as my primary building environment — it's where most of my projects actually get made. I describe what I want, read the output carefully, and course-correct when something feels off."
                />
              </li>
              <li className="py-8 first:pt-0 last:pb-0">
                <NumberedStep
                  number="02"
                  title="Build a team of agents"
                  body="For bigger projects, I've built Claude Corp — a 14-role multi-agent system where each role has a clear job: design, code, QA, communications. They work from a written Constitution so nothing gets decided by accident."
                />
              </li>
              <li className="py-8 first:pt-0 last:pb-0">
                <NumberedStep
                  number="03"
                  title="Iterate until it's honest"
                  body="I don't ship until I've used the thing myself. Then I write down what I learned — what broke, what surprised me, what I'd do differently. The documentation is part of the deliverable."
                />
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* What I care about */}
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
              What I care about
            </p>
            <h2 className="font-serif font-light text-display-m text-near-black max-w-2xl leading-tight">
              Accessibility, privacy, and code that doesn&apos;t cut corners.
            </h2>
          </div>

          <div className="max-w-[640px] flex flex-col gap-6">
            <p className="font-sans font-light text-body text-charcoal leading-[1.65]">
              Accessibility isn&apos;t an afterthought in my work — it&apos;s
              the starting point. I aim for WCAG 2.2 AA on every interface I
              touch. AccessMap exists specifically because disabled people
              deserve better navigation tools, not retrofitted ones.
            </p>
            <p className="font-sans font-light text-body text-charcoal leading-[1.65]">
              Privacy-first means the user&apos;s data is theirs. My Prompt
              Library stores everything locally — no backend, no account, no
              server that might get breached. Mutual Mesh is built the same
              way. If you don&apos;t need the data to make the product work,
              don&apos;t collect it.
            </p>
            <p className="font-sans font-light text-body text-charcoal leading-[1.65]">
              Clean code over speed. I&apos;d rather take longer and do it
              right than ship fast and apologise. That&apos;s not a principle
              I picked up from a book — it&apos;s one I learned the hard way
              by shipping things that weren&apos;t ready.
            </p>
          </div>
        </div>
      </section>

      {/* What I'm learning */}
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
              What I&apos;m learning
            </p>
            <h2 className="font-serif font-light text-display-m text-near-black max-w-2xl leading-tight">
              Still a beginner. Getting better on purpose.
            </h2>
          </div>

          <div className="max-w-[640px] flex flex-col gap-6">
            <p className="font-sans font-light text-body text-charcoal leading-[1.65]">
              I&apos;m not a trained software engineer. I came to coding
              through building — I had ideas I wanted to exist, so I learned
              enough to make them real. That&apos;s still how I work: I build
              to learn, not the other way around.
            </p>
            <p className="font-sans font-light text-body text-charcoal leading-[1.65]">
              Right now I&apos;m getting better at TypeScript, React Native,
              and designing multi-agent systems that stay safe even when
              they&apos;re running unsupervised. Each project teaches me
              something the last one didn&apos;t.
            </p>
            <p className="font-sans font-light text-body text-charcoal leading-[1.65]">
              I&apos;m looking for collaborators, clients, or employers who
              want someone who will read the docs, ask the right questions,
              and genuinely care how the thing turns out. If that sounds like
              you, let&apos;s talk.
            </p>
          </div>
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
                    <span className="font-mono text-meta tracking-label uppercase text-accent-text mt-2 inline-flex items-center gap-1 transition-transform duration-fast ease-out group-hover:translate-x-1 group-focus-visible:translate-x-1">
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
