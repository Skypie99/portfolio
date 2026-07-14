/**
 * T7 / SK-01 — receipt-the-1,680 scaffold (AccessMapTestReceipt).
 *
 * Guards that the placeholder is genuinely a placeholder AND genuinely valid:
 *   - the TKTK token is VISIBLE <code> text (an invisible placeholder would
 *     defeat the whole point of scaffolding the mechanism),
 *   - the "tap to proof" link resolves to a real in-page anchor (matching id) —
 *     not a broken fragment href the static-integrity test blind-spots,
 *   - it fabricates no number-as-final, no CI URL, no receipts artifact,
 *   - it reads as an unfinished scaffold, not an availability/urgency badge.
 *
 * The accessmap-only gate + the untouched "1,680" chip are verified against the
 * BUILT output in the R2-P4 verification gates (token present on
 * /work/accessmap/, absent elsewhere; chip literal unchanged), not here — the
 * work detail page is a heavy async server component and the built HTML is the
 * stronger integration check.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';

import { AccessMapTestReceipt } from '@/app/work/[slug]/page';

afterEach(cleanup);

describe('AccessMapTestReceipt (T7 / SK-01 scaffold)', () => {
  it('shows the TKTK placeholder token as visible <code> text', () => {
    const { container } = render(<AccessMapTestReceipt />);
    const code = container.querySelector('code');
    expect(code).toBeTruthy();
    expect(code?.textContent).toBe('TKTK_ACCESSMAP_TEST_COUNT');
    expect(code).not.toHaveAttribute('aria-hidden');
  });

  it('the "tap to proof" link resolves to a real in-page anchor', () => {
    const { container } = render(<AccessMapTestReceipt />);
    const link = container.querySelector('a[href^="#"]');
    expect(link).toBeTruthy();
    const targetId = link!.getAttribute('href')!.slice(1); // strip the leading '#'
    expect(
      container.querySelector(`#${targetId}`),
      `the anchor #${targetId} must have a matching element`,
    ).toBeTruthy();
  });

  it('fabricates no shipped figure, CI URL, or receipts artifact', () => {
    const { container } = render(<AccessMapTestReceipt />);
    // no external link masquerading as a real, clickable proof
    expect(container.querySelector('a[href^="http"]')).toBeNull();
    const text = container.textContent ?? '';
    // names itself a placeholder and states the contradiction honestly
    expect(text).toMatch(/placeholder/i);
    expect(text).toContain('1,680');
    expect(text).toContain('1,120');
  });

  it('reads as an unfinished scaffold, not an availability/urgency badge', () => {
    const { container } = render(<AccessMapTestReceipt />);
    const text = container.textContent ?? '';
    expect(text).not.toMatch(/available|hire|coming soon|shipping now/i);
  });
});
