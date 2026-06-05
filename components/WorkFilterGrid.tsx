'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion';

import { CaseStudyCard } from '@/components/CaseStudyCard';
import { FilterPill } from '@/components/FilterPill';
import { ParallaxWash } from '@/components/ParallaxWash';
import { ProjectCard } from '@/components/ProjectCard';
import { Reveal } from '@/components/Reveal';
import { heroMedia } from '@/lib/media';
import type { Deliverable } from '@/lib/schema';

type Category = 'accessmap' | 'claude-corp' | 'prompt-library' | 'ghost' | 'mutual';

function toCategory(id: string): Category {
  const map: Record<string, Category> = {
    'accessmap': 'accessmap',
    'claude-corp': 'claude-corp',
    'prompt-library': 'prompt-library',
    'ghost-code': 'ghost',
    'mutual-mesh': 'mutual',
  };
  return map[id] ?? 'accessmap';
}

type WorkFilterGridProps = {
  deliverables: Deliverable[];
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
};

const cardVariants = {
  // Weighted landing: cards rise + settle from a touch of depth (scale 0.985)
  // on the gh-settle curve — a soft, long-tailed arrival, never poppy.
  hidden: { opacity: 0, y: 28, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: [0.22, 0.9, 0.26, 1] as const },
  },
};

export function WorkFilterGrid({ deliverables }: WorkFilterGridProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const gridRef = useRef<HTMLUListElement>(null);
  const isInView = useInView(gridRef, { once: true, margin: '-80px' });

  const featured = deliverables.find((d) => d.featured);
  const rest = deliverables.filter((d) => !d.featured);

  const allTags = Array.from(new Set(deliverables.flatMap((d) => d.tags))).sort();

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
            className="mb-12"
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

      {/* Non-featured grid — layout animation on filter + stagger on scroll enter */}
      {filteredRest.length === 0 && !featuredVisible ? (
        <p className="font-serif font-light text-display-s text-charcoal leading-[1.65]">
          No deliverables match this filter.
        </p>
      ) : filteredRest.length > 0 ? (
        <motion.ul
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12"
          variants={shouldReduceMotion ? undefined : containerVariants}
          initial={shouldReduceMotion ? undefined : 'hidden'}
          animate={shouldReduceMotion ? undefined : (isInView ? 'visible' : 'hidden')}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {filteredRest.map((d) => (
              <motion.li
                key={d.id}
                layout={!shouldReduceMotion}
                variants={shouldReduceMotion ? undefined : cardVariants}
                exit={
                  shouldReduceMotion
                    ? undefined
                    : { opacity: 0, scale: 0.96, y: -8, transition: { duration: 0.2 } }
                }
              >
                <CaseStudyCard
                  title={d.title}
                  category={toCategory(d.id)}
                  description={d.summary}
                  href={`/work/${d.id}/`}
                  media={heroMedia(d)}
                  index={deliverables.findIndex((x) => x.id === d.id)}
                />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      ) : null}
    </div>
  );
}
