import type { Metadata } from 'next';
import Link from 'next/link';

import { AnimatedStepList } from '@/components/AnimatedStepList';
import { ContactEmail } from '@/components/ContactEmail';
import { cn } from '@/lib/cn';
import { getDeliverables, getProfile } from '@/lib/content';

export function generateMetadata(): Metadata {
  const profile = getProfile();
  const description = `About ${profile.name}, an AI builder based in ${profile.location}. ${profile.tagline}`;
  return {
    title: `About — ${profile.name}`,
    description,
    openGraph: {
      type: 'website',
      title: `About — ${profile.name}`,
      description,
      images: [{ url: '/og-image.svg', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `About — ${profile.name}`,
      description,
    },
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
          <p className="font-mono text-label tracking-label uppercase text-text-meta mb-4 flex items-center gap-2">
            <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
            About
          </p>
          <h1
            className="font-serif font-light text-[clamp(2.5rem,6vw,4.5rem)] text-near-black leading-[1.05] max-w-3xl mb-10 text-balance"
            style={{ letterSpacing: '-0.025em' }}
          >
            I build AI tools with care.
          </h1>

          {/* Story paragraphs */}
          <div className="max-w-[640px] flex flex-col gap-6">
            <p className="font-sans font-light text-[1.0625rem] text-charcoal leading-[1.65] text-pretty">
              I started building because I wanted to solve problems that mattered. Most of what I make begins with a real person, a real frustration, and a stubborn belief that technology should make their life easier, not harder. I would rather ship one careful deliverable than a dozen rough ones.
            </p>

            {/* Pull-quote — editorial accent, carries the thesis */}
            <blockquote
              className="pl-5 border-l-2 border-terracotta font-serif font-light text-[1.375rem] text-near-black leading-[1.4] text-balance"
              style={{ letterSpacing: '-0.01em' }}
            >
              Accessibility isn&apos;t an add-on. It&apos;s the starting point.
            </blockquote>

            <p className="font-sans font-light text-[1.0625rem] text-charcoal leading-[1.65] text-pretty">
              Accessibility isn&apos;t an add-on for me — it&apos;s the baseline. I learned early that the features that help people with disabilities make everything easier for everyone. Accessible products are kind products. That shapes every line I write.
            </p>
            <p className="font-sans font-light text-[1.0625rem] text-charcoal leading-[1.65] text-pretty">
              I work from {profile.location}, mostly on AI-assisted tooling, community infrastructure, and the quiet systems that make a product feel calm to use. I favor learning in the open — shipping things, talking about the process, and inviting others into the work before it&apos;s done.
            </p>
            <p className="font-sans font-light text-[1.0625rem] text-charcoal leading-[1.65] text-pretty">
              I keep a written record of how each thing was built and why — both for the people who come next and for me, the next time I need to remember. Documentation is love letter to the future.
            </p>
            <p className="font-sans font-light text-[1.0625rem] text-charcoal leading-[1.65] text-pretty">
              Right now, I&apos;m exploring what happens when accessibility, AI, and community collide. I want to build tools that help people help each other — especially the people who&apos;ve been left behind by most of tech. That&apos;s where I&apos;m headed.
            </p>
          </div>
        </div>
      </section>

      {/* How I work — Cycle 17: Dani §3.6 strict refit. */}
      <section
        className={cn(
          'reveal-on-scroll',
          'px-gutter py-24 lg:py-32',
          // Dani wave4: alternating rhythm — warm-white
          'bg-warm-white border-t border-border-decorative',
        )}
      >
        <div className="max-w-content mx-auto">
          <div className="mb-12">
            <p className="font-mono text-label tracking-label uppercase text-text-meta mb-4 flex items-center gap-2">
              <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
              How I work
            </p>
            <h2 className="font-serif font-light text-display-m text-near-black max-w-2xl leading-[1.1] text-balance">
              Three quiet steps, repeated carefully.
            </h2>
          </div>

          {/* Peach-cream callout panel — Dani §3.6. Hairline dividers
              between steps preserved from Cycle 7 (Stone decorative). */}
          <div className="bg-peach-cream border border-border-decorative rounded-lg p-8 md:p-12">
            <AnimatedStepList
              steps={[
                {
                  number: '01',
                  title: 'Start with Claude Code',
                  body: "I use Claude Code as my primary building environment — it's where most of my projects actually get made. I describe what I want, read the output carefully, and course-correct when something feels off.",
                },
                {
                  number: '02',
                  title: 'Build a team of agents',
                  body: "For bigger projects, I've built Claude Corp — a 14-role multi-agent system where each role has a clear job: design, code, QA, communications. They work from a written Constitution so nothing gets decided by accident.",
                },
                {
                  number: '03',
                  title: "Iterate until it's honest",
                  body: "I don't ship until I've used the thing myself. Then I write down what I learned — what broke, what surprised me, what I'd do differently. The documentation is part of the deliverable.",
                },
              ]}
            />
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
            <p className="font-mono text-label tracking-label uppercase text-text-meta mb-4 flex items-center gap-2">
              <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
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
          // Dani wave4: alternating — warm-white
          'bg-warm-white border-t border-border-decorative',
        )}
      >
        <div className="max-w-content mx-auto">
          <div className="mb-12">
            <p className="font-mono text-label tracking-label uppercase text-text-meta mb-4 flex items-center gap-2">
              <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
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
              <p className="font-mono text-label tracking-label uppercase text-text-meta mb-4 flex items-center gap-2">
                <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
                What I&apos;m working on
              </p>
              <h2 className="font-serif font-light text-display-m text-near-black max-w-2xl leading-[1.1] text-balance">
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
          <ContactEmail label="Get in touch" />

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
