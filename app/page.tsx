import Link from 'next/link';

import { Button } from '@/components/Button';
import { Hero } from '@/components/Hero';
import { NumberedStep } from '@/components/NumberedStep';
import { ProjectCard } from '@/components/ProjectCard';
import { TagPill } from '@/components/TagPill';
import { cn } from '@/lib/cn';
import { getCertificates, getDeliverables, getProfile } from '@/lib/content';

/**
 * Single-scroll homepage. Server Component — all content at build time, zero
 * client JS except Hero + HamburgerNav + AppMockup (client animation).
 *
 * Section order (all anchor-linked from the hamburger nav):
 *  #hero          — Hero (F-01)
 *  #showcase      — Live Projects stat strip (Wave 2)
 *  #work          — All 4 deliverables as luxury cards (Wave 1)
 *  #process       — Discover / Build / Ship (Wave 3 polish)
 *  #about         — Bio
 *  #certificates  — Credential list
 *  #contact       — Mailto CTA (Wave 3 polish)
 */
export default function HomePage() {
  const profile = getProfile();
  const deliverables = getDeliverables();
  const certificates = getCertificates();

  /** Showcase stat chips — hardcoded per spec */
  const showcaseChips = [
    {
      stat: '789',
      label: 'tests passing',
      project: 'AccessMap',
      tags: ['Mobile', 'WCAG AA', 'Open source'],
    },
    {
      stat: '15',
      label: 'AI agents',
      project: 'Claude Corp',
      tags: ['MCP', 'Real commits'],
    },
    {
      stat: '50+',
      label: 'features shipped',
      project: 'Prompt Library',
      tags: ['No backend', 'Browser-only'],
    },
    {
      stat: 'E2E',
      label: 'encrypted',
      project: 'Mutual Mesh',
      tags: ['Privacy-first', 'Community'],
    },
  ] as const;

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div id="hero">
        <Hero
          eyebrow="AI portfolio — 2026"
          heading={profile.tagline}
          subhead="A small studio of AI-assisted tools, audits, and reference materials. Built slowly. Documented honestly."
          ctaLabel="View the work"
          ctaHref="#work"
        />
      </div>

      {/* ── Live Projects Showcase Strip (Wave 2) ────────────────────── */}
      <section
        id="showcase"
        className={cn(
          'reveal-on-scroll',
          'px-gutter py-16',
          'bg-cream',
          'border-t border-border-decorative',
        )}
      >
        <div className="max-w-content mx-auto">
          {/* Section label */}
          <p className="font-mono text-label text-sage-text uppercase tracking-label mb-3">
            Live Projects
          </p>
          {/* Heading */}
          <h2 className="font-serif font-light text-display-m text-near-black mb-2">
            Built and shipped.
          </h2>
          <p className="font-sans font-light text-body text-charcoal mb-10">
            Four products, live on the internet. Open source and deployed.
          </p>

          {/* 4-col stat grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {showcaseChips.map(({ stat, label, project, tags }) => (
              <div
                key={project}
                className={cn(
                  'bg-blush border border-stone rounded-lg p-5',
                  'hover:-translate-y-0.5 transition-transform duration-base ease-out',
                )}
              >
                <p
                  className="font-serif text-display-m text-terracotta leading-none mb-1"
                  aria-label={`${stat} ${label}`}
                >
                  {stat}
                </p>
                <p className="font-mono text-label text-sage-text uppercase tracking-label mb-3">
                  {label}
                </p>
                <ul className="flex flex-wrap gap-1 mb-3" aria-label={`Tags for ${project}`}>
                  {tags.map((tag) => (
                    <li key={tag}>
                      <TagPill>{tag}</TagPill>
                    </li>
                  ))}
                </ul>
                <p className="font-sans text-body-sm text-charcoal font-light">{project}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Work — Luxury cards with app mockups (Wave 1) ────────────── */}
      <section
        id="work"
        className={cn(
          'reveal-on-scroll',
          'px-gutter',
          'py-24 lg:py-32',
          'bg-cream',
          'border-t border-border-decorative',
        )}
      >
        <div className="max-w-content mx-auto">
          <div className="mb-12">
            <p className="font-mono text-label tracking-label uppercase text-text-meta mb-4">
              Work
            </p>
            <h2 className="font-serif font-light text-display-m text-near-black max-w-2xl leading-tight">
              A handful of recent things, made with intention.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Featured card — full width */}
            {deliverables[0] && (
              <div className="md:col-span-2">
                <ProjectCard deliverable={deliverables[0]} wide />
              </div>
            )}
            {/* Remaining 3 in 2-col grid */}
            {deliverables.slice(1).map((d) => (
              <ProjectCard key={d.id} deliverable={d} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Process — Wave 3 polish ───────────────────────────────────── */}
      <section
        id="process"
        className={cn(
          'reveal-on-scroll',
          'px-gutter',
          'py-24 lg:py-32',
          'bg-cream',
          'border-t border-border-decorative',
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

          {/* Wave 3: wrapped in warm-white panel with border */}
          <div className="bg-warm-white rounded-lg p-8 md:p-12 border border-stone space-y-8">
            <NumberedStep
              number="01"
              title="Discover"
              body="Start with the smallest, most honest version of the problem. Talk to the people who will live with the thing — not just the people who will buy it."
              highlight
            />
            <div className="border-t border-stone" />
            <NumberedStep
              number="02"
              title="Build"
              body="One careful slice at a time. Type-safe, accessible from the first line, instrumented enough to learn from. Refuse to ship what I haven't tried to use."
              highlight
            />
            <div className="border-t border-stone" />
            <NumberedStep
              number="03"
              title="Ship"
              body="Document what changed, what's still rough, and what the next maintainer will need to know. A deliverable is the work plus the story of how it was made."
              highlight
            />
          </div>
        </div>
      </section>

      {/* ── About ────────────────────────────────────────────────────── */}
      <section
        id="about"
        className={cn(
          'reveal-on-scroll',
          'px-gutter',
          'py-24 lg:py-32',
          'bg-cream',
          'border-t border-border-decorative',
        )}
      >
        <div className="max-w-content mx-auto">
          <div className="mb-12">
            <p className="font-mono text-label tracking-label uppercase text-text-meta mb-4">
              About
            </p>
            <h2 className="font-serif font-light text-display-m text-near-black max-w-2xl leading-tight">
              I build AI tools with care.
            </h2>
          </div>

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

      {/* ── Certificates ─────────────────────────────────────────────── */}
      <section
        id="certificates"
        className={cn(
          'reveal-on-scroll',
          'px-gutter',
          'py-24 lg:py-32',
          'bg-cream',
          'border-t border-border-decorative',
        )}
      >
        <div className="max-w-content mx-auto">
          <div className="mb-12">
            <p className="font-mono text-label tracking-label uppercase text-text-meta mb-4">
              Certificates
            </p>
            <h2 className="font-serif font-light text-display-m text-near-black max-w-2xl leading-tight">
              Credentials earned along the way.
            </h2>
          </div>

          <ul className="flex flex-col divide-y divide-border-decorative">
            {certificates.map((c) => (
              <li key={c.id} className="py-8 first:pt-0 last:pb-0">
                <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-12">
                  <p className="font-mono text-meta tracking-label uppercase text-text-meta md:w-40 shrink-0">
                    {c.issuer}
                  </p>
                  <div className="flex-1 flex flex-col gap-1">
                    <h3 className="font-serif font-normal text-[1.25rem] text-near-black leading-tight">
                      {c.title}
                    </h3>
                    <p className="font-mono text-meta tracking-label uppercase text-text-meta">
                      {new Date(c.issuedDate).toLocaleDateString('en-CA', {
                        year: 'numeric',
                        month: 'long',
                      })}
                      {c.expiresDate && (
                        <>
                          {' '}· expires{' '}
                          {new Date(c.expiresDate).toLocaleDateString('en-CA', {
                            year: 'numeric',
                            month: 'long',
                          })}
                        </>
                      )}
                    </p>
                  </div>
                  <Link
                    href={c.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`View credential: ${c.title} from ${c.issuer}`}
                    className="font-mono text-meta tracking-label uppercase text-accent-text inline-flex items-center gap-1 transition-transform duration-fast ease-out hover:translate-x-1 focus-visible:translate-x-1 shrink-0"
                  >
                    View
                    <span aria-hidden="true">{'→'}</span>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Contact — Wave 3 polish ───────────────────────────────────── */}
      <section
        id="contact"
        className={cn(
          'reveal-on-scroll',
          'px-gutter',
          'py-24 lg:py-32',
          'bg-gradient-to-br from-cream via-blush to-peach-cream',
          'border-t border-border-decorative',
          'relative overflow-hidden',
        )}
      >
        {/* Decorative quote mark */}
        <span
          aria-hidden="true"
          className="absolute right-8 top-4 font-serif text-terracotta select-none pointer-events-none leading-none"
          style={{ fontSize: '12rem', opacity: 0.06 }}
        >
          &ldquo;
        </span>

        <div className="max-w-content mx-auto flex flex-col items-start gap-8 relative">
          <h2 className="font-serif font-light text-display-m text-near-black max-w-2xl leading-tight">
            Have an AI project worth building?
            <br />
            Let&apos;s talk.
          </h2>
          <div className="flex flex-col items-start gap-2">
            <Button href={`mailto:${profile.contactEmail}`}>Get in touch</Button>
            {/* Trust signals */}
            <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2">
              {['Open to freelance', 'Based in Vancouver, BC', 'Reply within 48h'].map((s) => (
                <span
                  key={s}
                  className="font-mono text-meta text-sage-text flex items-center gap-1.5"
                  style={{ letterSpacing: '0.06em' }}
                >
                  <span className="text-terracotta" aria-hidden="true">✓</span>{' '}
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
