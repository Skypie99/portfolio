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
 *  #work          — All 4 deliverables
 *  #process       — Discover / Build / Ship
 *  #about         — Bio
 *  #certificates  — Credential list
 *  #contact       — Mailto CTA
 *
 * Dani wave5 homepage polish:
 *  - Section headers get terracotta left-border accent for visual hierarchy
 *  - Contact section uses peach-cream bg for warm closing
 *  - Contact section adds eyebrow label + email address display
 *  - Process/Certificates alternate to bg-warm-white for rhythm
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
          subhead="Four live products. A multi-agent system that ships real commits. An accessibility map shaping how disabled neighbours navigate the city. All open source — and built one careful deliverable at a time."
          ctaLabel="View the work"
          ctaHref="#work"
        />
      </div>

      {/* ── Live Projects Showcase Strip ──────────────────────────────── */}
      <section
        id="showcase"
        className={cn(
          'reveal-on-scroll',
          'px-gutter py-20 lg:py-24',
          'bg-warm-white',
          'border-t border-border-decorative',
        )}
      >
        <div className="max-w-content mx-auto">
          {/* Section label */}
          <p className="font-mono text-label text-sage-text uppercase tracking-label mb-3 flex items-center gap-2">
            <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
            Live Projects
          </p>
          {/* Heading */}
          <h2 className="font-serif font-light text-display-m text-near-black mb-3 max-w-2xl leading-[1.1] text-balance">
            Built and shipped. Open source. Everything in this portfolio is live.
          </h2>
          <p className="font-sans font-light text-body text-charcoal mb-12 max-w-[540px] text-pretty">
            Four products on the open internet. Click any title to open the GitHub repo or the running app.
          </p>

          {/* 4-col stat grid — vertical-rule layout for editorial weight */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-stone/60 border border-stone rounded-lg overflow-hidden">
            {showcaseChips.map(({ stat, label, project, tags }) => (
              <div
                key={project}
                className={cn(
                  'group flex flex-col bg-cream p-6',
                  'transition-colors duration-base ease-out hover:bg-blush',
                )}
              >
                <p
                  className="font-serif font-light text-[clamp(2.5rem,5vw,3.75rem)] text-terracotta leading-none mb-1"
                  style={{ letterSpacing: '-0.03em' }}
                  aria-label={`${stat} ${label}`}
                >
                  {stat}
                </p>
                <p className="font-mono text-label text-sage-text uppercase tracking-label mb-4">
                  {label}
                </p>
                <p className="font-serif text-[1.0625rem] text-near-black mb-3">{project}</p>
                <ul className="flex flex-wrap gap-1.5 mt-auto" aria-label={`Tags for ${project}`}>
                  {tags.map((tag) => (
                    <li key={tag}>
                      <TagPill>{tag}</TagPill>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Work — Luxury cards with app mockups ─────────────────────── */}
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
          {/* Dani wave5: terracotta left-border accent on section headers */}
          <div className="mb-12 pl-4 border-l-2 border-terracotta">
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

      {/* ── Process ──────────────────────────────────────────────────── */}
      <section
        id="process"
        className={cn(
          'reveal-on-scroll',
          'px-gutter',
          'py-24 lg:py-32',
          'bg-warm-white',
          'border-t border-border-decorative',
        )}
      >
        <div className="max-w-content mx-auto">
          <div className="mb-12 pl-4 border-l-2 border-terracotta">
            <p className="font-mono text-label tracking-label uppercase text-text-meta mb-4">
              How I work
            </p>
            <h2 className="font-serif font-light text-display-m text-near-black max-w-2xl leading-[1.1] text-balance">
              Three quiet steps, repeated carefully.
            </h2>
          </div>

          {/* Warm-white panel — hairline rules between steps */}
          <div className="bg-cream rounded-lg p-8 md:p-12 border border-stone space-y-8 shadow-soft">
            <NumberedStep
              number="01"
              title="Discover"
              body="Start with the smallest, most honest version of the problem. Talk to the people who will live with the thing — not just the people who will buy it."
              highlight
            />
            <div className="border-t border-stone/70" />
            <NumberedStep
              number="02"
              title="Build"
              body="One careful slice at a time. Type-safe, accessible from the first line, instrumented enough to learn from. Refuse to ship what I haven't tried to use."
              highlight
            />
            <div className="border-t border-stone/70" />
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
          <div className="mb-12 pl-4 border-l-2 border-terracotta">
            <p className="font-mono text-label tracking-label uppercase text-text-meta mb-4">
              About
            </p>
            <h2 className="font-serif font-light text-display-m text-near-black leading-[1.1] text-balance">
              I build AI tools with care.
            </h2>
          </div>

          <div className="max-w-[640px] flex flex-col gap-6">
            {/* Pull-quote accent — editorial tone-setter */}
            <blockquote
              className={cn(
                'pl-5 border-l-2 border-terracotta',
                'font-serif font-light text-[1.375rem] text-near-black leading-[1.4]',
                'text-balance',
              )}
              style={{ letterSpacing: '-0.01em' }}
            >
              One careful deliverable beats a dozen rough ones.
            </blockquote>

            <p className="font-sans font-light text-[1.0625rem] text-charcoal leading-[1.65] text-pretty">
              Most of what I make starts with a problem worth solving, then a
              small thing that solves it well. I work from {profile.location},
              mostly on AI-assisted tooling, accessibility, and the quiet
              infrastructure that makes a product feel calm to use.
            </p>
            <p className="font-sans font-light text-[1.0625rem] text-charcoal leading-[1.65] text-pretty">
              I keep a written record of how each thing was built and why —
              both for the people who come next and for me, the next time I
              need to remember.
            </p>
            <Link
              href="/about/"
              className="link-draw inline-flex items-center gap-2 font-mono text-label tracking-label uppercase text-near-black mt-2 self-start"
            >
              Read the full story
              <span aria-hidden="true">{'→'}</span>
            </Link>
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
          'bg-warm-white',
          'border-t border-border-decorative',
        )}
      >
        <div className="max-w-content mx-auto">
          <div className="mb-12 pl-4 border-l-2 border-terracotta">
            <p className="font-mono text-label tracking-label uppercase text-text-meta mb-4">
              Certificates
            </p>
            <h2 className="font-serif font-light text-display-m text-near-black max-w-2xl leading-[1.1] text-balance">
              Credentials earned along the way.
            </h2>
          </div>

          <ul className="flex flex-col divide-y divide-stone/70">
            {certificates.map((c) => (
              <li key={c.id} className="py-8 first:pt-0 last:pb-0 group">
                <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-12">
                  <p className="font-mono text-meta tracking-label uppercase text-text-meta md:w-40 shrink-0">
                    {c.issuer}
                  </p>
                  <div className="flex-1 flex flex-col gap-1">
                    <h3 className="font-serif font-normal text-[1.375rem] text-near-black leading-tight transition-colors duration-fast ease-out group-hover:text-accent-text">
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

      {/* ── Contact ──────────────────────────────────────────────────── */}
      <section
        id="contact"
        className={cn(
          'reveal-on-scroll',
          'px-gutter',
          'py-24 lg:py-32',
          // Dani wave5: peach-cream bg — warmer closing, distinct from rhythm
          'bg-peach-cream',
          'border-t border-border-decorative',
          'relative overflow-hidden',
        )}
      >
        <div className="max-w-content mx-auto flex flex-col items-start gap-8">
          {/* Eyebrow label matching other sections */}
          <p className="font-mono text-label tracking-label uppercase text-text-meta flex items-center gap-2">
            <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
            Contact
          </p>
          <h2 className="font-serif font-light text-display-m text-near-black max-w-2xl leading-tight">
            Have an AI project worth building?
            <br />
            Let&apos;s talk.
          </h2>
          {/* Email address as warm secondary cue before CTA */}
          <p className="font-sans font-light text-body-sm text-charcoal -mt-2">
            Reach out at{' '}
            <a
              href={`mailto:${profile.contactEmail}`}
              className="text-accent-text hover:text-terracotta transition-colors duration-fast ease-out"
            >
              {profile.contactEmail}
            </a>
          </p>
          <Button href={`mailto:${profile.contactEmail}`}>Get in touch</Button>
        </div>
      </section>
    </>
  );
}
