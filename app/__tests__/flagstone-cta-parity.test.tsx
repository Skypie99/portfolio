import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import HomePage from '@/app/page';

/**
 * Portfolio 3.0 Phase 02 · F-014 / RC-005 / GATE-FLAGSTONE-CTA-PARITY.
 *
 * The Flagstone flagship room's "View project" doorway must render through
 * the exact same shared `ProjectDoorwayButton` component/classes as every
 * other homepage row's "View project" pill — no Flagstone-specific visual
 * override. This test fails if the flagship doorway reverts to its old
 * one-off `link-draw` text treatment, or if any homepage doorway instance
 * picks up a per-instance class that the others don't share.
 */

beforeAll(() => {
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});

afterEach(cleanup);

function doorwayPills(container: HTMLElement) {
  // `.border-border-interactive` distinguishes ProjectDoorwayButton's pill
  // from the unrelated `h-11 rounded-pill` IntroSkip control, which uses a
  // different border/background token.
  return Array.from(
    container.querySelectorAll<HTMLAnchorElement>(
      'a.rounded-pill.h-11.border-border-interactive',
    ),
  );
}

describe('GATE-FLAGSTONE-CTA-PARITY — shared ProjectDoorwayButton', () => {
  it('renders exactly 6 doorway pills (5 rows + flagship) sharing one identical className', () => {
    const { container } = render(<HomePage />);

    const pills = doorwayPills(container);
    expect(pills).toHaveLength(6);

    const [first, ...rest] = pills;
    for (const pill of rest) {
      expect(pill.className).toBe(first.className);
    }
  });

  it('gives the flagship its own doorway with no aria-label override and a real tab stop', () => {
    render(<HomePage />);

    const flagshipDoorway = screen.getByRole('link', { name: 'View project' });
    expect(flagshipDoorway).toHaveAttribute('href', expect.stringMatching(/^\/work\/flagstone\/?$/));
    expect(flagshipDoorway).not.toHaveAttribute('tabindex');
    expect(flagshipDoorway.className).not.toMatch(/link-draw/);
  });

  it('keeps the 5 row pills as redundant (tabindex=-1) stops behind their row title link', () => {
    render(<HomePage />);

    const rowPills = screen.getAllByRole('link', { name: /^View project:/i });
    expect(rowPills).toHaveLength(5);
    for (const pill of rowPills) {
      expect(pill).toHaveAttribute('tabindex', '-1');
    }
  });

  it('never lets the flagship room reintroduce the retired link-draw text treatment', () => {
    const source = readFileSync(join(process.cwd(), 'app/page.tsx'), 'utf-8');
    const flagshipRoomStart = source.indexOf('id="flagship"');
    const flagshipRoomEnd = source.indexOf('id="work"', flagshipRoomStart);
    expect(flagshipRoomStart).toBeGreaterThan(-1);
    expect(flagshipRoomEnd).toBeGreaterThan(flagshipRoomStart);

    const flagshipRoomSource = source.slice(flagshipRoomStart, flagshipRoomEnd);
    expect(flagshipRoomSource).toMatch(/<ProjectDoorwayButton\b/);
    expect(flagshipRoomSource).not.toMatch(/link-draw/);
  });

  it('keeps ProjectDoorwayButton free of a className escape hatch (no per-instance overrides possible)', () => {
    const source = readFileSync(
      join(process.cwd(), 'components/ProjectDoorwayButton.tsx'),
      'utf-8',
    );
    expect(source).not.toMatch(/className\s*\?\s*:/);
    expect(source).not.toMatch(/\bclassName\b\s*:/);
  });
});
