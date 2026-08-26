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
});
