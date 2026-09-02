/**
 * CaseStudyCard smoke tests (H1, THE ROOM Phase H).
 *
 * No dedicated test existed before this phase — CaseStudyCard was only
 * exercised indirectly via GalleryWall.test.tsx, which never passes
 * verifiedDate. F4's question ("which test fails if this breaks?") had no
 * answer for the verifiedDate line, so this file is the answer.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { CaseStudyCard } from '@/components/CaseStudyCard';

afterEach(() => {
  cleanup();
});

const BASE_PROPS = {
  title: 'Flagstone',
  category: 'flagstone' as const,
  description: 'A test description long enough for the card.',
  href: '/work/flagstone/',
};

describe('CaseStudyCard', () => {
  it('renders verifiedDate as a real <time> element, prefixed "Verified"', () => {
    const { container } = render(
      <CaseStudyCard {...BASE_PROPS} status="Live — public, no backend" verifiedDate="2026-08-16" />,
    );
    const time = container.querySelector('time');
    expect(time).not.toBeNull();
    expect(time).toHaveAttribute('dateTime', '2026-08-16');
    expect(time?.textContent).toBe('2026-08-16');
    expect(container.textContent).toContain('Verified 2026-08-16');
  });

  it('renders no verifiedDate line when status is absent, even if verifiedDate is passed', () => {
    const { container } = render(<CaseStudyCard {...BASE_PROPS} verifiedDate="2026-08-16" />);
    expect(container.querySelector('time')).toBeNull();
  });

  it('renders the title as a heading carrying the case-study link', () => {
    render(<CaseStudyCard {...BASE_PROPS} />);
    expect(screen.getByRole('heading', { level: 3, name: /Flagstone/ })).toBeInTheDocument();
  });

  it('uses "View project" as the locked recruiter-facing doorway vocabulary (Cook Out P2 · Part B)', () => {
    render(<CaseStudyCard {...BASE_PROPS} />);
    expect(
      screen.getByRole('link', { name: /view project: flagstone case study/i }),
    ).toBeInTheDocument();
  });

  it('gives the card exactly one keyboard destination for the case study (no duplicate consecutive stops)', () => {
    render(
      <CaseStudyCard
        {...BASE_PROPS}
        links={[
          { label: 'Live demo', href: 'https://flagstone.skypistudio.com', type: 'demo' },
          { label: 'GitHub', href: 'https://github.com/Skypie99/AccessMap', type: 'github' },
        ]}
      />,
    );
    // The title IS the one real keyboard stop for the case study…
    const titleLink = screen.getByRole('link', { name: /flagstone: read the case study/i });
    expect(titleLink).not.toHaveAttribute('tabindex');
    // …the visible "View project" quick link is SR-visible but keyboard-skipped —
    // one stop per card, not two, for the identical destination.
    const viewProject = screen.getByRole('link', { name: /view project: flagstone case study/i });
    expect(viewProject).toHaveAttribute('tabindex', '-1');
    // Demo and GitHub each stay their own, separately actionable stop.
    expect(screen.getByRole('link', { name: /open live demo for flagstone/i })).not.toHaveAttribute('tabindex');
    expect(screen.getByRole('link', { name: /view flagstone source on github/i })).not.toHaveAttribute('tabindex');
  });
});
