/**
 * Plate smoke tests — Phase A / A15 (THE ROOM instrument furniture).
 *
 * Plate generalizes the inline museum-plate markup in
 * app/work/[slug]/page.tsx (Flagstone's d.heroPlate block); these tests
 * pin the three-line structure and the smart-punctuation transform on the
 * caption only (matching the inline version, which never transforms
 * claim/placeDate).
 */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { Plate } from '@/components/Plate';

afterEach(() => {
  cleanup();
});

describe('Plate', () => {
  it('renders all three lines: claim, caption, place/date', () => {
    render(
      <Plate
        claim="HIGH severity"
        caption="Confirmed a real barrier."
        placeDate="Kelowna, BC — 2026-08-16"
      />,
    );
    expect(screen.getByText('HIGH severity')).toBeInTheDocument();
    expect(screen.getByText('Confirmed a real barrier.')).toBeInTheDocument();
    expect(screen.getByText('Kelowna, BC — 2026-08-16')).toBeInTheDocument();
  });

  it('smart-punctuates the caption only, not the claim or place/date', () => {
    render(
      <Plate
        claim={'raw "quotes" stay raw'}
        caption={"the app's \"real\" barrier"}
        placeDate={'raw "quotes" stay raw'}
      />,
    );
    // Caption's straight apostrophe + double quotes both become curly.
    expect(screen.getByText('the app’s “real” barrier')).toBeInTheDocument();
    // Claim and place/date are untouched — both straight-quote strings appear verbatim.
    expect(screen.getAllByText('raw "quotes" stay raw')).toHaveLength(2);
  });

  it('threads the signature hue into the --pr-sig CSS var when provided', () => {
    const { container } = render(
      <Plate claim="c" caption="cap" placeDate="p" sig="224 150 90" />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.getPropertyValue('--pr-sig')).toBe('224 150 90');
  });
});
