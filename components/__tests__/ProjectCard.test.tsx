/**
 * ProjectCard smoke tests — Cycle 4 (Gary).
 *
 * ProjectCard is the shared deliverable card used on /work (F-04) and
 * anywhere else a deliverable surfaces visually (the "What I'm working on"
 * block on /about, etc.). The component is a pure server-friendly render —
 * no client state, no effects, no router — so these tests use a single
 * inline Deliverable fixture and assert directly on the DOM:
 *
 *   1. Title / role / year render from props.
 *   2. The whole card is one <a> pointing to /work/<slug>/ (matches the
 *      trailing-slash convention used elsewhere in the static export).
 *   3. The link exposes an accessible name summarising the destination
 *      (Alex §4.4 — link text meaningful out of context).
 *   4. The featured visual treatment appears only when `featured: true`
 *      (the "Featured" pill that ProjectCard wraps in a paragraph with the
 *      terracotta dot).
 *
 * The fixture is hand-built rather than imported from content/ so the test
 * is hermetic — it doesn't break when Sky reshuffles the JSON.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { ProjectCard } from '@/components/ProjectCard';
import type { Deliverable } from '@/lib/schema';

const baseDeliverable: Deliverable = {
  id: 'accessmap',
  title: 'AccessMap',
  summary: 'Privacy-respecting accessibility flagging app for disabled users navigating the city.',
  role: 'Solo builder',
  tech: ['Expo', 'React Native', 'Supabase', 'TypeScript'],
  year: 2026,
  heroImage: {
    src: '/images/deliverables/accessmap/hero.jpg',
    alt: 'Warm-toned mockup of the AccessMap mobile interface',
  },
  tags: ['accessibility', 'mobile', 'privacy'],
  featured: false,
};

afterEach(() => {
  cleanup();
});

describe('ProjectCard', () => {
  it('renders title, role, and year from props', () => {
    render(<ProjectCard deliverable={baseDeliverable} />);

    // Title sits in an <h3> — Alex F-C4-2 heading rotor demoted the card
    // title from h2 to h3 so the rotor reads h1 (page) → h2 (sr-only
    // section) → h3 (card). Visible size/weight is unchanged.
    expect(
      screen.getByRole('heading', { level: 3, name: 'AccessMap' }),
    ).toBeInTheDocument();

    // Role and year share a single metadata line: "Solo builder · 2026".
    // Use a function matcher so the middot/whitespace can't make the assertion
    // flaky if Shamus tweaks the separator later.
    expect(
      screen.getByText((content) =>
        content.includes('Solo builder') && content.includes('2026'),
      ),
    ).toBeInTheDocument();
  });

  it('wraps the whole card in a single link to /work/<slug>/', () => {
    render(<ProjectCard deliverable={baseDeliverable} />);

    // One link per card — the entire surface is the click target.
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute('href', '/work/accessmap/');
  });

  it('exposes an accessible name summarising the destination (Alex §4.4)', () => {
    render(<ProjectCard deliverable={baseDeliverable} />);

    // The link's accessible name is "<title> — <role>, <year>" so screen-reader
    // users hear the same context sighted users see in the card body.
    const link = screen.getByRole('link', {
      name: /accessmap.*solo builder.*2026/i,
    });
    expect(link).toBeInTheDocument();
  });

  it('hero <img> carries explicit width/height for CLS (Alex F-C4-3, Cycle 6)', () => {
    render(<ProjectCard deliverable={baseDeliverable} />);
    const img = screen.getByAltText(/warm-toned mockup/i);
    // 800×600 = 4:3, matches the aspect-[4/3] container.
    expect(img).toHaveAttribute('width', '800');
    expect(img).toHaveAttribute('height', '600');
  });

  it('hero <img> opts into the Dani §3.3 hover scale via group-hover (Cycle 2)', () => {
    render(<ProjectCard deliverable={baseDeliverable} />);
    const img = screen.getByAltText(/warm-toned mockup/i);
    // The image scales 1.02 on hover or focus of the parent .work-card link.
    expect(img).toHaveClass('group-hover:scale-[1.02]');
    expect(img).toHaveClass('group-focus-visible:scale-[1.02]');
  });

  it('renders the Featured pill when featured is true', () => {
    const { rerender } = render(<ProjectCard deliverable={baseDeliverable} />);

    // featured: false → no Featured pill rendered.
    expect(screen.queryByText(/^featured$/i)).not.toBeInTheDocument();

    rerender(
      <ProjectCard deliverable={{ ...baseDeliverable, featured: true }} />,
    );

    // featured: true → uppercase "Featured" label appears with the
    // terracotta indicator dot (the dot is aria-hidden, so we only assert
    // on the text label).
    expect(screen.getByText(/^featured$/i)).toBeInTheDocument();
  });
});
