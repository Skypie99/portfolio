import type { Metadata } from 'next';
import Link from 'next/link';

import { SettleHeading } from '@/components/HeroSettle';
import { Icon } from '@/components/Icon';
import { ContactEmail } from '@/components/ContactEmail';
import { NumberedStep } from '@/components/NumberedStep';
import { ParallaxWash } from '@/components/ParallaxWash';
import { Reveal } from '@/components/Reveal';
import { cn } from '@/lib/cn';
import { getDeliverables, getProfile } from '@/lib/content';

export function generateMetadata(): Metadata {
  const profile = getProfile();
  const description = 'Sky Halisky. AI developer. Okanagan Valley, British Columbia.';
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
      <section className="px-gutter py-24 lg:py-32 world-surface">
        <div className="max-w-content mx-auto">
          <p className="font-mono text-label tracking-label uppercase text-accent-ink mb-4 flex items-center gap-2">
            <Icon name="about" className="w-3.5 h-3.5 text-terracotta" />
            A Brief Account
          </p>
          <SettleHeading
            className="font-serif font-light text-display ember leading-[1.05] max-w-3xl mb-10 text-balance"
          >
            I build things with AI.
          </SettleHeading>

          {/* Story paragraphs */}
          <div className="max-w-[640px] flex flex-col gap-6">
            <p className="font-sans font-light text-prose text-charcoal leading-[1.65] text-pretty">
              I came to software through problems I wanted to solve. Most of them
              involved accessibility — tools that should have been better but weren&apos;t.
              I decided to make some that were.
            </p>

            {/* Pull-quote — editorial accent, carries the thesis */}
            <blockquote className="pull-quote nums-oldstyle pl-3 font-serif font-light text-step-2 text-near-black leading-[1.4] text-balance">
              Accessibility is not an add-on. It is where you begin.
            </blockquote>
            <span aria-hidden="true" className="rule-ember block h-px w-16 mt-5" />

            <p className="font-sans font-light text-prose text-charcoal leading-[1.65] text-pretty">
              I work from {profile.location}. Mostly on AI-assisted tooling,
              accessibility infrastructure, and community software. I prefer
              learning in public.
            </p>
            <p className="font-sans font-light text-prose text-charcoal leading-[1.65] text-pretty">
              I keep a written record of how each thing was made. The documentation
              is part of the deliverable, not an afterthought.
            </p>
            <p className="font-sans font-light text-prose text-charcoal leading-[1.65] text-pretty">
              Right now: an accessibility map. A multi-agent system that ships real
              commits. A local-first prompt manager. A community mesh built for
              privacy. A command-line trainer. All of them open source.
            </p>
            <p className="font-sans font-light text-prose text-charcoal leading-[1.65] text-pretty">
              
            </p>
          </div>
        </div>
      </section>

      {/* How I work — Cycle 17: Dani §3.6 strict refit. */}
      <section
        className={cn(
          'px-gutter py-24 lg:py-32',
          // Dani wave4: alternating rhythm — warm-white
          'world-surface-alt border-t border-border-decorative',
          'relative overflow-hidden',
        )}
      >
        {/* Golden-hour scroll-depth (teal, to harmonise with the panel) */}
        <ParallaxWash depth="far" tone="teal" />
        <div className="relative z-10 max-w-content mx-auto">
          <Reveal variant="scene" className="mb-12">
            <p className="font-mono text-label tracking-label uppercase text-accent-ink mb-4 flex items-center gap-2">
              <Icon name="about" className="w-3.5 h-3.5 text-terracotta" />
              Method
            </p>
            <h2 className="font-serif font-light text-step-4 ember max-w-2xl leading-[1.1] text-balance">
              Three quiet steps, repeated carefully.
            </h2>
          </Reveal>

          {/* Peach-cream callout panel — Dani §3.6. Hairline dividers
              between steps preserved from Cycle 7 (Stone decorative). */}
          <div className="bg-wa-teal-wash border border-wa-teal-soft/50 rounded-lg p-8 md:p-12">
            <ol className="flex flex-col divide-y divide-border-decorative">
              <li className="py-8 first:pt-0 last:pb-0">
                <Reveal index={0}>
                  <NumberedStep
                    number="01"
                    title="Describe the problem."
                    body="Use Claude Code as the primary building environment. Read the output. Course-correct when something is wrong."
                  />
                </Reveal>
              </li>
              <li className="py-8 first:pt-0 last:pb-0">
                <Reveal index={1}>
                  <NumberedStep
                    number="02"
                    title="Assemble the team."
                    body="For larger work, fifteen agents — each with a defined role, operating from a written constitution. Nothing is decided by accident."
                  />
                </Reveal>
              </li>
              <li className="py-8 first:pt-0 last:pb-0">
                <Reveal index={2}>
                  <NumberedStep
                    number="03"
                    title="Do not ship until you have used it."
                    body="Then write down what broke, what surprised you, and what the next person will need to know."
                  />
                </Reveal>
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* What I care about */}
      <section
        className={cn(
          'px-gutter py-24 lg:py-32',
          'world-surface border-t border-border-decorative',
        )}
      >
        <div className="max-w-content mx-auto">
          <Reveal variant="scene" className="mb-12">
            <p className="font-mono text-label tracking-label uppercase text-accent-ink mb-4 flex items-center gap-2">
              <Icon name="about" className="w-3.5 h-3.5 text-terracotta" />
              Principles
            </p>
            <h2 className="font-serif font-light text-step-4 ember max-w-2xl leading-tight">
              Accessibility. Privacy. No shortcuts.
            </h2>
          </Reveal>

          <Reveal variant="depth" className="max-w-[640px] flex flex-col gap-6">
            <p className="font-sans font-light text-body text-charcoal leading-[1.65]">
              WCAG 2.2 AA on every interface. Not because it is required.
              Because it is correct. AccessMap exists because disabled people
              deserve navigation tools designed for them, not adapted for them.
            </p>
            <p className="font-sans font-light text-body text-charcoal leading-[1.65]">
              The user&apos;s data is theirs. Prompt Library stores everything
              locally — no backend, no account, no server. Mutual Mesh is built
              the same way. If the data is not necessary, do not collect it.
            </p>
            <p className="font-sans font-light text-body text-charcoal leading-[1.65]">
              I would rather take longer and do it correctly than ship fast and
              apologise. This is not a principle from a book. It came from
              shipping things that were not ready.
            </p>
          </Reveal>
        </div>
      </section>

      {/* What I'm learning */}
      <section
        className={cn(
          'px-gutter py-24 lg:py-32',
          // Dani wave4: alternating — warm-white
          'world-surface-alt border-t border-border-decorative',
        )}
      >
        <div className="max-w-content mx-auto">
          <Reveal variant="scene" className="mb-12">
            <p className="font-mono text-label tracking-label uppercase text-accent-ink mb-4 flex items-center gap-2">
              <Icon name="about" className="w-3.5 h-3.5 text-terracotta" />
              Currently
            </p>
            <h2 className="font-serif font-light text-step-4 ember max-w-2xl leading-tight">
              Still a beginner. Getting better on purpose.
            </h2>
          </Reveal>

          <Reveal variant="depth" className="max-w-[640px] flex flex-col gap-6">
            <p className="font-sans font-light text-body text-charcoal leading-[1.65]">
              I am not a trained software engineer. I came to coding through
              building — I had ideas I wanted to exist. That is still how this
              works.
            </p>
            <p className="font-sans font-light text-body text-charcoal leading-[1.65]">
              Right now: TypeScript, React Native, multi-agent systems that
              stay safe unsupervised. Each project teaches something the last
              one did not.
            </p>
            <p className="font-sans font-light text-body text-charcoal leading-[1.65]">
              I am looking for collaborators and clients who read the
              documentation, ask good questions, and care how things turn out.
              Write to me if that sounds like you.
            </p>
          </Reveal>
        </div>
      </section>

      {/* What I'm working on */}
      {recent.length > 0 && (
        <section
          className={cn(
            'px-gutter py-24 lg:py-32',
            'world-surface border-t border-border-decorative',
          )}
        >
          <div className="max-w-content mx-auto">
            <Reveal variant="scene" className="mb-12">
              <p className="font-mono text-label tracking-label uppercase text-accent-ink mb-4 flex items-center gap-2">
                <Icon name="about" className="w-3.5 h-3.5 text-terracotta" />
                The Work
              </p>
              <h2 className="font-serif font-light text-step-4 ember max-w-2xl leading-[1.1] text-balance">
                A handful of things.
              </h2>
            </Reveal>

            <ul className="flex flex-col gap-8 max-w-3xl">
              {recent.map((d, i) => (
                <li
                  key={d.id}
                  className="border-t border-border-decorative pt-6"
                >
                  <Reveal index={i}>
                    <Link
                      href={`/work/${d.id}/`}
                      aria-label={`Read about ${d.title} — ${d.role}, ${d.year}`}
                      className="group flex flex-col gap-2 text-near-black hover:text-accent-text transition-[color,transform] duration-base ease-gh-glide hover:translate-x-0.5"
                    >
                      <p className="font-mono text-meta tracking-label uppercase text-text-meta">
                        {d.role} · {d.year}
                      </p>
                      <h3 className="font-serif font-normal text-step-2 leading-tight">
                        {d.title}
                      </h3>
                      <p className="font-sans font-light text-body text-charcoal leading-[1.65] max-w-[540px]">
                        {d.summary}
                      </p>
                      <span className="font-mono text-meta tracking-label uppercase text-accent-text mt-2 inline-flex items-center gap-1 transition-transform duration-fast ease-out group-hover:translate-x-1 group-focus-visible:translate-x-1">
                        Continue
                        <span aria-hidden="true">{'→'}</span>
                      </span>
                    </Link>
                  </Reveal>
                </li>
              ))}
            </ul>

            <div className="mt-12">
              <Link
                href="/work/"
                className="inline-flex items-center gap-2 font-mono text-label tracking-label uppercase text-near-black hover:text-accent-text transition-colors duration-fast ease-out"
              >
                All the work
                <span aria-hidden="true">{'→'}</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="px-gutter py-24 lg:py-32 world-surface border-t border-border-decorative">
        <Reveal className="max-w-content mx-auto flex flex-col items-start gap-8">
          <h2 className="font-serif font-light text-step-4 ember max-w-2xl leading-tight">
            Want to work together?
            <br />
            Let{'’'}s talk.
          </h2>
          {/* Bot-safe mailto (assembled at runtime) — matches /contact + home. */}
          <ContactEmail />

          <Link
            href="/"
            className="mt-8 inline-flex items-center gap-2 font-mono text-label tracking-label uppercase text-near-black hover:text-accent-text transition-colors duration-fast ease-out"
          >
            <span aria-hidden="true">{'←'}</span>
            Back to home
          </Link>
        </Reveal>
      </section>
    </>
  );
}
