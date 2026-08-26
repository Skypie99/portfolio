/**
 * LedgerRow smoke tests — Phase A / A15 (THE ROOM instrument furniture).
 *
 * Generalizes CalibrationRecord's row (mono figure · serif title · date /
 * open chip). Renders an <li> — the caller owns the surrounding
 * <ul role="list">, so these tests wrap it in one.
 */
import type { ComponentProps } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { LedgerRow } from '@/components/LedgerRow';

afterEach(() => {
  cleanup();
});

function renderRow(props: ComponentProps<typeof LedgerRow>) {
  return render(
    // role="list" mirrors CalibrationRecord.tsx's own <ul>: Tailwind preflight
    // sets list-style:none, which is exactly the condition that makes
    // Safari/VoiceOver drop list semantics.
    // eslint-disable-next-line jsx-a11y/no-redundant-roles
    <ul role="list">
      <LedgerRow {...props} />
    </ul>,
  );
}

describe('LedgerRow', () => {
  it('renders the numeral (aria-hidden) and title', () => {
    renderRow({ numeral: 'IV', title: 'Round Four' });
    const numeral = screen.getByText('IV');
    expect(numeral).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('Round Four')).toBeInTheDocument();
  });

  it('gives the numeral an sr-only textual equivalent ("Row IV")', () => {
    renderRow({ numeral: 'IV', title: 'Round Four' });
    expect(screen.getByText('Row IV')).toHaveClass('sr-only');
  });

  it('renders the date, right-aligned, as a real <time> element, when open is false', () => {
    renderRow({ numeral: '01', title: 'Round One', date: '2026-05-23' });
    // H1: date now lives in a nested <time> — getByText resolves to the
    // <time> itself (RTL only reads a node's own direct text-node
    // children), so the ml-auto class is asserted on its ancestor span.
    const date = screen.getByText('2026-05-23');
    expect(date.tagName).toBe('TIME');
    expect(date).toHaveAttribute('dateTime', '2026-05-23');
    expect(date.closest('span')).toHaveClass('ml-auto');
    expect(screen.queryByText('open')).not.toBeInTheDocument();
  });

  it('renders the open chip instead of a date when open is true, even if a date is also passed', () => {
    renderRow({ numeral: '05', title: 'Round Five', date: '2026-08-01', open: true });
    expect(screen.getByText('open')).toBeInTheDocument();
    expect(screen.queryByText('2026-08-01')).not.toBeInTheDocument();
  });

  it('renders neither date nor open chip when both are omitted', () => {
    renderRow({ numeral: '06', title: 'Round Six' });
    expect(screen.queryByText('open')).not.toBeInTheDocument();
  });

  it('overrides the sr-only numeral word via numeralLabel (CalibrationRecord uses "Round")', () => {
    renderRow({ numeral: 'IV', title: 'Round Four', numeralLabel: 'Round' });
    expect(screen.getByText('Round IV')).toHaveClass('sr-only');
    expect(screen.queryByText('Row IV')).not.toBeInTheDocument();
  });

  it('renders optional trailing content from `after`, inside the row', () => {
    const { container } = renderRow({
      numeral: '01',
      title: 'Round One',
      after: <span data-testid="counts">53 findings · 53 accounted</span>,
    });
    const after = screen.getByTestId('counts');
    expect(after).toBeInTheDocument();
    expect(container.querySelector('li')).toContainElement(after);
  });
});
