/**
 * T7 / SK-01 — the receipted AccessMap count (AccessMapTestReceipt).
 *
 * This strip used to ship a TKTK placeholder. It was reconciled 2026-08-16
 * against an executed run. These guards keep it honest and keep the scaffold
 * retired:
 *   - the count is VISIBLE text (an invisible figure would defeat the point),
 *   - the "method" link resolves to a real in-page anchor (matching id) — not a
 *     broken fragment href the static-integrity test blind-spots,
 *   - the method text carries the measurement DATE and the command that
 *     reproduces it, so the figure is checkable rather than asserted,
 *   - it fabricates no CI URL or receipts artifact,
 *   - the retired placeholder language cannot creep back in,
 *   - it reads as a receipt, not an availability/urgency badge.
 *
 * The accessmap-only gate + the homepage chip literal are verified against the
 * BUILT output in the R2-P4 verification gates (strip present on
 * /work/accessmap/, absent elsewhere), not here — the work detail page is a
 * heavy async server component and the built HTML is the stronger integration
 * check.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';

import { AccessMapTestReceipt } from '@/app/work/[slug]/page';

afterEach(cleanup);

describe('AccessMapTestReceipt (T7 / SK-01 receipt)', () => {
  it('shows the measured count as visible text', () => {
    const { container } = render(<AccessMapTestReceipt />);
    const text = container.textContent ?? '';
    expect(text).toContain('2,971');
    expect(text).toMatch(/tests passing/i);
    // the figure itself must stay exposed to assistive tech
    expect(container.querySelector('p')?.getAttribute('aria-hidden')).toBeNull();
  });

  it('the "method" link resolves to a real in-page anchor', () => {
    const { container } = render(<AccessMapTestReceipt />);
    const link = container.querySelector('a[href^="#"]');
    expect(link).toBeTruthy();
    const targetId = link!.getAttribute('href')!.slice(1); // strip the leading '#'
    expect(
      container.querySelector(`#${targetId}`),
      `the anchor #${targetId} must have a matching element`,
    ).toBeTruthy();
  });

  it('carries the measurement date and a reproduce command', () => {
    const { container } = render(<AccessMapTestReceipt />);
    const text = container.textContent ?? '';
    // a dated figure is checkable; an undated one silently rots
    expect(text).toMatch(/2026-08-16/);
    // the reader can re-derive the number themselves
    expect(text).toContain('npx jest');
    // the composition is stated, not just the headline
    expect(text).toMatch(/0 failing/i);
  });

  it('fabricates no CI URL or receipts artifact', () => {
    const { container } = render(<AccessMapTestReceipt />);
    // no external link masquerading as a real, clickable proof
    expect(container.querySelector('a[href^="http"]')).toBeNull();
  });

  it('keeps the TKTK scaffold retired', () => {
    const { container } = render(<AccessMapTestReceipt />);
    const text = container.textContent ?? '';
    expect(text).not.toMatch(/TKTK/);
    expect(text).not.toMatch(/placeholder|not yet reconciled/i);
  });

  it('reads as a receipt, not an availability/urgency badge', () => {
    const { container } = render(<AccessMapTestReceipt />);
    const text = container.textContent ?? '';
    expect(text).not.toMatch(/available|hire|coming soon|shipping now/i);
  });
});
