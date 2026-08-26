/**
 * CalibrationRecord smoke tests (H1, THE ROOM Phase H).
 *
 * No dedicated test existed before this phase — F4's question ("which test
 * fails if this breaks?") had no answer, so this file is the answer. Covers
 * the one behavior this phase touched (a closed round's date as a real
 * <time> element) plus basic row-shape coverage.
 *
 * Since the Phase H follow-up dedup pass, the row itself is LedgerRow
 * (components/LedgerRow.tsx) — its own suite covers the row-shape mechanics
 * (date-vs-open, the sr-only numeral). These tests stay black-box (render
 * CalibrationRecord, not LedgerRow) so they keep covering the actual wiring:
 * Round -> LedgerRow prop mapping (closed -> date/open) and the counts line.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { CalibrationRecord } from '@/components/CalibrationRecord';
import type { Round } from '@/lib/schema';

afterEach(() => {
  cleanup();
});

const CLOSED: Round = {
  numeral: 'I',
  title: 'Correct',
  closed: '2026-07-09',
  counts: ['53 findings · 53 accounted'],
};
const OPEN: Round = { numeral: 'IV', title: 'Weight', counts: ['15 proposed · 9 chosen'] };

describe('CalibrationRecord', () => {
  it("renders a closed round's date as a real <time> element", () => {
    const { container } = render(<CalibrationRecord rounds={[CLOSED]} />);
    const time = container.querySelector('time');
    expect(time).not.toBeNull();
    expect(time).toHaveAttribute('dateTime', '2026-07-09');
    expect(time?.textContent).toBe('2026-07-09');
  });

  it('renders the open chip, not a date, for an open round', () => {
    const { container } = render(<CalibrationRecord rounds={[OPEN]} />);
    expect(container.querySelector('time')).toBeNull();
    expect(screen.getByText('open')).toBeInTheDocument();
  });

  it('renders one row per round, numbered', () => {
    render(<CalibrationRecord rounds={[CLOSED, OPEN]} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('Correct')).toBeInTheDocument();
    expect(screen.getByText('Weight')).toBeInTheDocument();
  });
});
