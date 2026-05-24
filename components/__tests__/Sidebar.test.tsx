/**
 * Sidebar smoke tests — Cycle 2 (Gary).
 *
 * Sidebar.tsx imports `getProfile` and `getFeaturedDeliverable` from
 * `@/lib/content`, which read JSON off the filesystem with
 * `readFileSync(process.cwd() + '/content/...')`. That works in the Next.js
 * build (cwd is the repo root) AND inside Vitest run from the repo root
 * (same cwd) — but we mock it anyway so the test is hermetic and doesn't
 * regress the day someone changes the content shape.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

vi.mock('@/lib/content', () => ({
  getProfile: () => ({
    name: 'Sky Halisky',
    wordmarkText: 'Sky Halisky',
    tagline: 'Building thoughtful AI work, one careful deliverable at a time.',
    location: 'Canada',
    contactEmail: 'skylerhalisky@gmail.com',
    socials: [],
  }),
  getFeaturedDeliverable: () => ({
    id: 'accessmap',
    title: 'AccessMap',
    summary: 'Privacy-respecting accessibility flagging app.',
    role: 'Solo builder',
    tech: ['Expo', 'React Native', 'Supabase', 'TypeScript'],
    year: 2026,
    heroImage: {
      src: '/images/deliverables/accessmap/hero.jpg',
      alt: 'Warm-toned mockup of the AccessMap mobile interface',
    },
    tags: ['accessibility', 'mobile', 'privacy'],
    featured: true,
  }),
}));

import { Sidebar } from '@/components/Sidebar';

afterEach(() => {
  cleanup();
});

describe('Sidebar', () => {
  it('renders the wordmark as a link to the home page', () => {
    render(<Sidebar />);
    const wordmark = screen.getByRole('link', { name: /sky halisky/i });
    expect(wordmark).toBeInTheDocument();
    expect(wordmark).toHaveAttribute('href', '/');
  });

  it('renders the featured deliverable title', () => {
    render(<Sidebar />);
    // The title appears inside the Featured slot; the heading text should be
    // visible verbatim from the mocked deliverable.
    expect(screen.getByText('AccessMap')).toBeInTheDocument();
    // Featured label proves we hit the populated branch (not the "Latest" fallback).
    expect(screen.getByText(/^featured$/i)).toBeInTheDocument();
  });

  it('uses a navigation landmark with an accessible name', () => {
    render(<Sidebar />);
    const nav = screen.getByRole('navigation', { name: /site navigation/i });
    expect(nav).toBeInTheDocument();
  });

  it('wordmark carries the link-draw editorial hover pattern (Cycle 18)', () => {
    render(<Sidebar />);
    const wordmark = screen.getByRole('link', { name: /sky halisky/i });
    expect(wordmark).toHaveClass('link-draw');
  });
});
