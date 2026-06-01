/**
 * Footer smoke tests — Cycle 11 (Gary).
 *
 * Footer reads from content/profile.json at render time. Tests use the
 * real profile fixture rather than a hermetic stub so Cycle 9's
 * brand-dot + auto-year polish stays accurate against the same data
 * production renders.
 *
 * next/link is auto-handled by App Router conventions; jsdom renders
 * <Link> as a plain <a>. No mocks needed.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { Footer } from '@/components/Footer';

afterEach(() => {
  cleanup();
});

describe('Footer', () => {
  it('renders all three columns (Site, About, Elsewhere)', () => {
    render(<Footer />);
    // Column headers — h3 with mono uppercase styling.
    expect(screen.getByRole('heading', { level: 3, name: 'Site' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'About' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Elsewhere' })).toBeInTheDocument();
  });

  it('auto-updates the copyright year to current year', () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear().toString();
    // Year sits in the © line — match flexibly so the symbol can change.
    const copyright = screen.getByText((content) =>
      content.includes('©') && content.includes(currentYear),
    );
    expect(copyright).toBeInTheDocument();
  });

  it('renders the "Made with care" line with the WA teal status dot (Phase 5)', () => {
    const { container } = render(<Footer />);
    const madeWithCare = screen.getByText(/made with care/i);
    expect(madeWithCare).toBeInTheDocument();
    // Phase 5 WA palette: status dots changed from terracotta to teal.
    const dot = container.querySelector('span.bg-wa-teal');
    expect(dot).not.toBeNull();
  });

  it('applies link-draw to the email mailto (Cycle 1 editorial link pattern)', () => {
    render(<Footer />);
    const emailLink = screen
      .getAllByRole('link')
      .find((a) => a.getAttribute('href')?.startsWith('mailto:'));
    expect(emailLink).toBeDefined();
    expect(emailLink).toHaveClass('link-draw');
  });
});
