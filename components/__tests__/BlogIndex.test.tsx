/**
 * Blog listing page tests — blog infrastructure (Will).
 *
 * Smoke-tests the /blog index page (app/blog/page.tsx) to confirm it renders
 * post titles and metadata. Content is mocked so the test stays hermetic.
 * Pattern matches Hero.test.tsx and Sidebar.test.tsx.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

const mockGetBlogPosts = vi.fn();

vi.mock('@/lib/content', () => ({
  getProfile: () => ({
    name: 'Sky Halisky',
    wordmarkText: 'Sky Halisky',
    tagline: 'Building thoughtful AI work.',
    location: 'Canada',
    contactEmail: 'sky@example.com',
    socials: [],
  }),
  getBlogPosts: () => mockGetBlogPosts(),
}));

import BlogIndexPage from '@/app/blog/page';

const TWO_POSTS = [
  {
    id: 'building-flagstone',
    title: 'Building Flagstone: A Guide to Accessibility Apps',
    summary: 'How I built a crowdsourced accessibility mapping app.',
    publishedDate: '2026-05-30',
    tags: ['accessibility', 'expo'],
    readingTimeMinutes: 5,
    content: '## Intro\n\nContent here.',
    draft: false,
  },
  {
    id: 'second-post',
    title: 'Second Post About React Native',
    summary: 'A follow-up post exploring React Native patterns.',
    publishedDate: '2026-04-01',
    tags: ['react-native'],
    readingTimeMinutes: 8,
    content: '## Second\n\nMore content.',
    draft: false,
  },
];

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('BlogIndexPage', () => {
  it('renders the page heading', () => {
    mockGetBlogPosts.mockReturnValue(TWO_POSTS);
    render(<BlogIndexPage />);
    expect(screen.getByRole('heading', { level: 1, name: /notes/i })).toBeInTheDocument();
  });

  it('renders all post titles as headings', () => {
    mockGetBlogPosts.mockReturnValue(TWO_POSTS);
    render(<BlogIndexPage />);
    expect(
      screen.getByRole('heading', { name: /building flagstone/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /second post about react native/i }),
    ).toBeInTheDocument();
  });

  it('renders post summaries', () => {
    mockGetBlogPosts.mockReturnValue(TWO_POSTS);
    render(<BlogIndexPage />);
    expect(
      screen.getByText(/crowdsourced accessibility mapping/i),
    ).toBeInTheDocument();
  });

  it('renders links to individual post pages', () => {
    mockGetBlogPosts.mockReturnValue(TWO_POSTS);
    render(<BlogIndexPage />);
    // Card links now take their accessible name from content (no partial
    // aria-label — see label-content-name-mismatch fix); each ends in "Read more".
    const postLinks = screen.getAllByRole('link', { name: /read more/i });
    // Two posts → two links
    expect(postLinks).toHaveLength(2);
    // First link points to building-flagstone.
    // Note: Next.js <Link> in jsdom renders the href without the trailing slash —
    // trailingSlash is a static-export build feature, not a runtime Link behaviour.
    expect(postLinks[0]).toHaveAttribute('href', '/blog/building-flagstone');
  });

  it('shows post count in the eyebrow label', () => {
    mockGetBlogPosts.mockReturnValue(TWO_POSTS);
    render(<BlogIndexPage />);
    expect(screen.getByText(/2 entries/i)).toBeInTheDocument();
  });

  it('renders reading time for each post', () => {
    mockGetBlogPosts.mockReturnValue(TWO_POSTS);
    render(<BlogIndexPage />);
    expect(screen.getByText(/5 min read/i)).toBeInTheDocument();
    expect(screen.getByText(/8 min read/i)).toBeInTheDocument();
  });

  it('renders a back link to home', () => {
    mockGetBlogPosts.mockReturnValue(TWO_POSTS);
    render(<BlogIndexPage />);
    const backLink = screen.getByRole('link', { name: /back to home/i });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute('href', '/');
  });

  it('renders empty state when no posts exist', () => {
    mockGetBlogPosts.mockReturnValue([]);
    render(<BlogIndexPage />);
    expect(screen.getByText(/no posts yet/i)).toBeInTheDocument();
  });
});
