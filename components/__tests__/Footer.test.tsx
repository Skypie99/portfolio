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
    // Column headers — h2 with mono uppercase styling (L6-04: h2, not h3, so the
    // /404/ outline reads h1→h2 with no skipped level; renders identically).
    expect(screen.getByRole('heading', { level: 2, name: 'Site' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'About' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Elsewhere' })).toBeInTheDocument();
  });

  it('renders the studio mark without a © notice (2026-06-10 voice pass)', () => {
    render(<Footer />);
    expect(screen.getByText(/SkyPi Studio — Est\. 2026/)).toBeInTheDocument();
    // The © line was retired with the voice pass — quiet luxury, less is more.
    expect(screen.queryByText(/©/)).not.toBeInTheDocument();
  });

  it('renders the tagline under the name and the Okanagan line, sans status clutter', () => {
    render(<Footer />);
    expect(
      screen.getByText('Small, exact software, documented honestly.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Built in the Okanagan Valley, British Columbia\./),
    ).toBeInTheDocument();
    // "Made with care" + "Open to work" status lines were retired.
    expect(screen.queryByText(/made with care/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/open to work/i)).not.toBeInTheDocument();
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
