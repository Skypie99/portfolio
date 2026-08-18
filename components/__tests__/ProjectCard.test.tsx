/**
 * ProjectCard smoke tests — updated for Wave 1 luxury redesign.
 *
 * ProjectCard now renders:
 *  - An AppMockup (pure CSS/SVG, no img) in the top mockup area
 *  - Multiple CTA links: "View case study", "Live demo", "GitHub"
 *  - A heading (h3) whose accessible name is "<title> — <role>, <year>"
 *    because the link inside carries aria-label with that full string
 *  - A featured badge pill when `featured: true`
 *
 * Tests are updated to match the redesigned DOM without breaking accessibility
 * intent. Gary: image-based tests removed since AppMockup replaces img.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { ProjectCard } from '@/components/ProjectCard';
import type { Deliverable } from '@/lib/schema';

const baseDeliverable: Deliverable = {
  id: 'accessmap',
  title: 'Flagstone',
  summary: 'Privacy-respecting accessibility flagging app for disabled users navigating the city.',
  role: 'Solo builder',
  tech: ['Expo', 'React Native', 'Supabase', 'TypeScript'],
  year: 2026,
  heroImage: {
    src: '/images/deliverables/accessmap/hero.jpg',
    alt: 'Warm-toned mockup of the Flagstone mobile interface',
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

    // Title sits in an <h3> — Wave 1 redesign: the h3 wraps a link whose
    // aria-label is "<title> — <role>, <year>", so the heading's accessible
    // name is the full string. Query with the full name.
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Flagstone.*Solo builder.*2026/i,
      }),
    ).toBeInTheDocument();

    // Role and year share a single metadata line: "Solo builder · 2026".
    expect(
      screen.getByText((content) =>
        content.includes('Solo builder') && content.includes('2026'),
      ),
    ).toBeInTheDocument();
  });

  it('renders a case-study link pointing to /work/<slug>/', () => {
    render(<ProjectCard deliverable={baseDeliverable} />);

    // Wave 1: card has multiple links; the primary one is the case-study link
    // and the title link, both pointing to /work/accessmap/.
    // L6-03 (SC 2.5.3 Label in Name): the CTA's accessible name now leads with
    // its visible label ("View project") — see components/ProjectCard.tsx.
    const caseStudyLink = screen.getByRole('link', {
      name: /view project.*flagstone.*case study/i,
    });
    // Next.js Link normalises trailing slashes in the jsdom test environment.
    expect(caseStudyLink).toHaveAttribute('href', expect.stringContaining('/work/accessmap'));
  });

  it('exposes an accessible name summarising the destination (Alex §4.4)', () => {
    render(<ProjectCard deliverable={baseDeliverable} />);

    // The title link's accessible name is "<title> — <role>, <year>" so
    // screen-reader users hear the same context sighted users see in the card body.
    const link = screen.getByRole('link', {
      name: /flagstone.*solo builder.*2026/i,
    });
    expect(link).toBeInTheDocument();
  });

  it('renders a live demo link when a demo URL is provided', () => {
    const withDemo = {
      ...baseDeliverable,
      links: [
        { label: 'Live demo', href: 'https://access-map-tau.vercel.app', type: 'demo' as const },
      ],
    };
    render(<ProjectCard deliverable={withDemo} />);

    const demoLink = screen.getByRole('link', {
      name: /open live demo for flagstone/i,
    });
    expect(demoLink).toHaveAttribute('href', 'https://access-map-tau.vercel.app');
    expect(demoLink).toHaveAttribute('target', '_blank');
    expect(demoLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders a GitHub link when a github URL is provided', () => {
    const withGithub = {
      ...baseDeliverable,
      links: [
        { label: 'GitHub', href: 'https://github.com/Skypie99/AccessMap', type: 'github' as const },
      ],
    };
    render(<ProjectCard deliverable={withGithub} />);

    const githubLink = screen.getByRole('link', {
      name: /view flagstone source on github/i,
    });
    expect(githubLink).toHaveAttribute('href', 'https://github.com/Skypie99/AccessMap');
  });

  it('renders the Featured badge when featured is true', () => {
    const { rerender } = render(<ProjectCard deliverable={baseDeliverable} />);

    // featured: false → no Featured badge rendered.
    expect(screen.queryByText(/^featured$/i)).not.toBeInTheDocument();

    rerender(
      <ProjectCard deliverable={{ ...baseDeliverable, featured: true }} />,
    );

    // featured: true → uppercase "Featured" label appears.
    expect(screen.getByText(/^featured$/i)).toBeInTheDocument();
  });

  it('renders tech pills limited to maxTech (default 4)', () => {
    render(<ProjectCard deliverable={baseDeliverable} />);

    // baseDeliverable has 4 tech items; all 4 should appear.
    expect(screen.getByText('Expo')).toBeInTheDocument();
    expect(screen.getByText('React Native')).toBeInTheDocument();
    expect(screen.getByText('Supabase')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('respects the maxTech prop', () => {
    render(<ProjectCard deliverable={baseDeliverable} maxTech={2} />);

    expect(screen.getByText('Expo')).toBeInTheDocument();
    expect(screen.getByText('React Native')).toBeInTheDocument();
    expect(screen.queryByText('Supabase')).not.toBeInTheDocument();
    expect(screen.queryByText('TypeScript')).not.toBeInTheDocument();
  });
});
