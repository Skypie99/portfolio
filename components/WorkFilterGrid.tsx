'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion';

import { CaseStudyCard } from '@/components/CaseStudyCard';
import { FilterPill } from '@/components/FilterPill';
import { ProjectCard } from '@/components/ProjectCard';
import type { Deliverable } from '@/lib/schema';

type Category = 'accessmap' | 'claude-corp' | 'prompt-library' | 'pacman' | 'mutual';

function toCategory(id: string): Category {
  const map: Record<string, Category> = {
    'accessmap': 'accessmap',
    'claude-corp': 'claude-corp',
    'prompt-library': 'prompt-library',
    'pacman-code-trainer': 'pacman',
    'mutual-mesh': 'mutual',
  };
  return map[id] ?? 'accessmap';
}

type WorkFilterGridProps = {
  deliverables: Deliverable[];
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const },
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
    <div>
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
            <ProjectCard deliverable={featured} wide index={deliverables.indexOf(featured)} />
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
