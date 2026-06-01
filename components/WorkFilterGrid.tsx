'use client';

import { useState } from 'react';

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

export function WorkFilterGrid({ deliverables }: WorkFilterGridProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null);

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

      {/* Featured card — wide ProjectCard, hidden when tag filter excludes it */}
      {featured && featuredVisible && (
        <div className="mb-12">
          <ProjectCard deliverable={featured} wide />
        </div>
      )}

      {/* Non-featured grid */}
      {filteredRest.length === 0 && !featuredVisible ? (
        <p className="font-serif font-light text-display-s text-charcoal leading-[1.65]">
          No deliverables match this filter.
        </p>
      ) : filteredRest.length > 0 ? (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {filteredRest.map((d) => (
            <li key={d.id}>
              <CaseStudyCard
                title={d.title}
                category={toCategory(d.id)}
                imageUrl={d.heroImage.src}
                imageAlt={d.heroImage.alt}
                description={d.summary}
                href={`/work/${d.id}/`}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
