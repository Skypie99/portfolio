/**
 * SidebarSectionNav tests (view-transitions 2026-06-05).
 *
 * Covers the scroll-spy active-state logic: the "On this page" landmark + all
 * five section links render; exactly one link gets aria-current when a section
 * is active ON THE HOMEPAGE; and nothing is marked active off-home (the onHome
 * guard) even if the scroll-spy hook reports a section.
 *
 * `next/navigation` (usePathname) and `@/lib/motion` (useActiveSection) are
 * mocked with hoisted, per-test-configurable fns — jsdom provides neither App
 * Router context nor IntersectionObserver. Same mocking approach as
 * HamburgerNav.test.tsx.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

const { pathnameMock, activeMock } = vi.hoisted(() => ({
  pathnameMock: vi.fn(() => '/'),
  activeMock: vi.fn(() => ''),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => pathnameMock(),
}));

vi.mock('@/lib/motion', () => ({
  useActiveSection: () => activeMock(),
}));

import { SidebarSectionNav } from '@/components/SidebarSectionNav';

const LABELS = ['The Work', 'Method', 'A Brief Account', 'Credentials', 'Correspond'];

beforeEach(() => {
  pathnameMock.mockReturnValue('/');
  activeMock.mockReturnValue('');
});

afterEach(() => {
  cleanup();
});

describe('SidebarSectionNav', () => {
  it('renders the "On this page" landmark with all five section links', () => {
    render(<SidebarSectionNav />);
    const nav = screen.getByRole('navigation', { name: /on this page/i });
    expect(nav).toBeInTheDocument();

    for (const label of LABELS) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument();
    }
    expect(screen.getByRole('link', { name: 'The Work' })).toHaveAttribute('href', '/#work');
    expect(screen.getByRole('link', { name: 'A Brief Account' })).toHaveAttribute('href', '/#about');
    expect(screen.getByRole('link', { name: 'Correspond' })).toHaveAttribute('href', '/#contact');
  });

  it('marks nothing active by default (no section in view yet)', () => {
    render(<SidebarSectionNav />);
    for (const label of LABELS) {
      expect(screen.getByRole('link', { name: label })).not.toHaveAttribute('aria-current');
    }
  });

  it('marks exactly the in-view section with aria-current on the homepage', () => {
    activeMock.mockReturnValue('about');
    render(<SidebarSectionNav />);

    expect(screen.getByRole('link', { name: 'A Brief Account' })).toHaveAttribute(
      'aria-current',
      'true',
    );
    // Every other link must NOT carry aria-current.
    for (const label of LABELS.filter((l) => l !== 'A Brief Account')) {
      expect(screen.getByRole('link', { name: label })).not.toHaveAttribute('aria-current');
    }
  });

  it('marks nothing active off the homepage even if a section is reported', () => {
    pathnameMock.mockReturnValue('/about/');
    activeMock.mockReturnValue('about'); // hook wouldn't fire off-home, but guard regardless
    render(<SidebarSectionNav />);

    for (const label of LABELS) {
      expect(screen.getByRole('link', { name: label })).not.toHaveAttribute('aria-current');
    }
  });
});
