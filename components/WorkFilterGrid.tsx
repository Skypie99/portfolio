'use client';

import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import { CaseStudyCard } from '@/components/CaseStudyCard';
import { FilterPill } from '@/components/FilterPill';
import { ParallaxWash } from '@/components/ParallaxWash';
import { ProjectCard } from '@/components/ProjectCard';
import { Reveal } from '@/components/Reveal';
import { cardMedia } from '@/lib/media';
import type { Deliverable } from '@/lib/schema';

type Category = 'accessmap' | 'claude-corp' | 'dashboard' | 'prompt-library' | 'ghost' | 'mutual';

function toCategory(id: string): Category {
  const map: Record<string, Category> = {
    'accessmap': 'accessmap',
    'claude-corp': 'claude-corp',
    'dashboard': 'dashboard',
    'prompt-library': 'prompt-library',
    'ghost-code': 'ghost',
    'mutual-mesh': 'mutual',
  };
  return map[id] ?? 'accessmap';
}

type WorkFilterGridProps = {
  deliverables: Deliverable[];
};

export function WorkFilterGrid({ deliverables }: WorkFilterGridProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const featured = deliverables.find((d) => d.featured);
  const rest = deliverables.filter((d) => !d.featured);

  // Only surface filter facets that actually GROUP the catalog (§6 polish). A
  // tag on a single deliverable isolates one card rather than filtering it — with
  // six projects that's noise (the taxonomy was finer than the catalog it sorts).
  // Cards still carry their full tag set; this trims only the filter row to the
  // facets that partition two or more deliverables.
  const tagCounts = deliverables
    .flatMap((d) => d.tags)
    .reduce<Record<string, number>>((acc, t) => {
      acc[t] = (acc[t] ?? 0) + 1;
      return acc;
    }, {});
  const allTags = Object.keys(tagCounts)
    .filter((tag) => tagCounts[tag] >= 2)
    .sort();

  const filteredRest = activeTag
    ? rest.filter((d) => d.tags.includes(activeTag))
    : rest;

  const featuredVisible = !activeTag || (featured && featured.tags.includes(activeTag));

  return (
    <div className="relative isolate">
      {/* drifting golden-hour wash — in its own clipped layer so the -inset
          oversize never clips the cards' hover-lift or shadows. Adds gentle
          scroll-life behind the grid (organic-pass), under the static refraction. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <ParallaxWash depth="far" />
      </div>
      {/* soft wash so the liquid-glass cards have something to refract —
          a warm golden glow + a whisper of cool blue (decorative, static) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            'radial-gradient(38% 36% at 18% 22%, rgb(255 212 158 / 0.17), transparent 62%), radial-gradient(46% 44% at 88% 88%, rgb(150 188 214 / 0.18), transparent 64%)',
        }}
      />
      {/* Filter pills */}
      {allTags.length > 0 && (
        <div
          className="flex flex-wrap gap-2 mb-12"
          role="group"
          aria-label="Filter deliverables by tag"
        >
          <FilterPill
            label="All"
            isActive={activeTag === null}
            onClick={() => setActiveTag(null)}
          />
          {allTags.map((tag) => (
            <FilterPill
              key={tag}
              label={tag}
              isActive={activeTag === tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            />
          ))}
        </div>
      )}

      {/* Featured card — animates out when tag filter excludes it */}
      <AnimatePresence mode="wait">
        {featured && featuredVisible && (
          <motion.div
            key="featured"
            layout={!shouldReduceMotion}
            initial={false}
            exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.98, transition: { duration: 0.18 } }}
            className="mb-24"
          >
            {/* Reveal owns the scroll-entrance (CSS/IO depth-rise) so the
                featured card lands with the same weight as the grid cards —
                kept separate from the Framer layout/filter choreography. */}
            <Reveal variant="depth">
              <ProjectCard deliverable={featured} wide index={deliverables.indexOf(featured)} />
            </Reveal>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Non-featured grid — framer keeps only the layout/exit filter
          choreography; Reveal (CSS/IO) owns the scroll-entrance, the same
          proven contract as the featured card above. REST state is visible:
          reduced-motion and no-JS get the final state via the .reveal floors
          in globals.css — no inline opacity:0 ever reaches the SSR HTML. */}
      {filteredRest.length === 0 && !featuredVisible ? (
        <p className="font-serif font-light text-display-s text-charcoal leading-[1.65]">
          No deliverables match this filter.
        </p>
      ) : filteredRest.length > 0 ? (
        <ul className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          <AnimatePresence mode="popLayout" initial={false}>
            {filteredRest.map((d, i) => (
              <motion.li
                key={d.id}
                layout={!shouldReduceMotion}
                initial={false}
                // An odd trailing card spans both tracks but renders at one
                // track's width, centered — pixel-identical to its siblings,
                // no bare grid cell. Covers every odd filter count (5, 3, 1);
                // JSX-computed because popLayout keeps exiting <li>s in the
                // DOM mid-filter, which would corrupt a CSS :nth-child rule.
                className={
                  i === filteredRest.length - 1 && filteredRest.length % 2 === 1
                    ? 'lg:col-span-2 lg:w-[calc(50%-1.5rem)] lg:justify-self-center'
                    : undefined
                }
                exit={
                  shouldReduceMotion
                    ? undefined
                    : { opacity: 0, scale: 0.96, y: -8, transition: { duration: 0.2 } }
                }
              >
                <Reveal variant="depth" index={i}>
                  <CaseStudyCard
                    title={d.title}
                    category={toCategory(d.id)}
                    description={d.summary}
                    href={`/work/${d.id}/`}
                    media={cardMedia(d)}
                    links={d.links}
                    index={deliverables.findIndex((x) => x.id === d.id)}
                  />
                </Reveal>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      ) : null}
    </div>
  );
}
