import Link from 'next/link';

import { Button } from '@/components/Button';
import { Hero } from '@/components/Hero';
import { NumberedStep } from '@/components/NumberedStep';
import { TagPill } from '@/components/TagPill';
import { cn } from '@/lib/cn';
import { getCertificates, getDeliverables, getProfile } from '@/lib/content';

/**
 * Single-scroll homepage. Server Component — all content at build time, zero
 * client JS except Hero + HamburgerNav.
 *
 * Section order (all anchor-linked from the hamburger nav):
 *  #hero          — Hero (F-01)
 *  #work          — All 4 deliverables
 *  #process       — Discover / Build / Ship
 *  #about         — Bio
 *  #certificates  — Credential list
 *  #contact       — Mailto CTA
 */
export default function HomePage() {
  const profile = getProfile();
  const deliverables = getDeliverables();
  const certificates = getCertificates();

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

      {/* ── Work ─────────────────────────────────────────────────────── */}
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

          <ul className="flex flex-col gap-12">
            {deliverables.map((d, idx) => (
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
                          <li key={t}>
                            <TagPill>{t}</TagPill>
                          </li>
                        ))}
                      </ul>
                      <Link
                        href={`/work/${d.id}/`}
                        aria-label={`Read about ${d.title}`}
                        className="mt-2 inline-flex items-center gap-1 font-mono text-meta tracking-label uppercase text-accent-text transition-transform duration-fast ease-out hover:translate-x-1 focus-visible:translate-x-1"
                      >
                        Read more
                        <span aria-hidden="true">{'→'}</span>
                      </Link>
                      {d.links?.find((l) => l.type === 'github') && (
                        <a
                          href={d.links.find((l) => l.type === 'github')!.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`View ${d.title} source on GitHub`}
                          className="mt-1 inline-flex items-center gap-1 font-mono text-meta tracking-label uppercase text-text-meta transition-transform duration-fast ease-out hover:translate-x-1 focus-visible:translate-x-1"
                        >
                          GitHub
                          <span aria-hidden="true">{'→'}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Process ──────────────────────────────────────────────────── */}
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

          <div className="bg-peach-cream border border-border-decorative rounded-lg p-8 md:p-12">
            <ol className="flex flex-col divide-y divide-border-decorative">
              <li className="py-8 first:pt-0 last:pb-0">
                <NumberedStep
                  number="01"
                  title="Discover"
                  body="Start with the smallest, most honest version of the problem. Talk to the people who will live with the thing — not just the people who will buy it."
                />
              </li>
              <li className="py-8 first:pt-0 last:pb-0">
                <NumberedStep
                  number="02"
                  title="Build"
                  body="One careful slice at a time. Type-safe, accessible from the first line, instrumented enough to learn from. Refuse to ship what I haven't tried to use."
                />
              </li>
              <li className="py-8 first:pt-0 last:pb-0">
                <NumberedStep
                  number="03"
                  title="Ship"
                  body="Document what changed, what's still rough, and what the next maintainer will need to know. A deliverable is the work plus the story of how it was made."
                />
              </li>
            </ol>
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

      {/* ── Contact ──────────────────────────────────────────────────── */}
      <section
        id="contact"
        className={cn(
          'reveal-on-scroll',
          'px-gutter',
          'py-24 lg:py-32',
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
