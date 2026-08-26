/**
 * Exhibit smoke tests — Phase A / A15 (THE ROOM instrument furniture).
 *
 * Pins the FIG-tag format, that the claim always renders as real text
 * (never leader-line-only — the claim must reach AT), and that leader
 * lines are decorative (aria-hidden) and capped at 2.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { Exhibit } from '@/components/Exhibit';

afterEach(() => {
  cleanup();
});

// A plain <img> test fixture standing in for whatever real capture a caller
// would pass (TactileMedia, <picture>, …) — not real app markup, so the
// next/image lint preference doesn't apply here.
function Capture({ alt = '' }: { alt?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/shot.png" alt={alt} />;
}

describe('Exhibit', () => {
  it('renders the FIG tag as "FIG · scene · theme · captured date"', () => {
    const { container } = render(
      <Exhibit scene="onboarding" theme="dark" capturedDate="2026-08-20" claim="Loads in under 2s.">
        <Capture />
      </Exhibit>,
    );
    // H1: capturedDate now lives in a nested <time> — getNodeText only
    // reads a node's own direct text-node children, so the combined line
    // is only readable off .textContent, not getByText.
    expect(container.textContent).toContain('FIG · onboarding · dark · captured 2026-08-20');
  });

  it('wraps capturedDate in a <time> element with a matching dateTime (H1)', () => {
    const { container } = render(
      <Exhibit scene="onboarding" theme="dark" capturedDate="2026-08-20" claim="Loads in under 2s.">
        <Capture />
      </Exhibit>,
    );
    const time = container.querySelector('time');
    expect(time).not.toBeNull();
    expect(time).toHaveAttribute('dateTime', '2026-08-20');
    expect(time?.textContent).toBe('2026-08-20');
  });

  it('always renders the claim as real text, independent of leader lines', () => {
    render(
      <Exhibit scene="s" theme="t" capturedDate="2026-01-01" claim="The claim this exhibit proves.">
        <Capture />
      </Exhibit>,
    );
    expect(screen.getByText('The claim this exhibit proves.')).toBeInTheDocument();
  });

  it('renders the caller-supplied capture as a child', () => {
    render(
      <Exhibit scene="s" theme="t" capturedDate="2026-01-01" claim="c">
        <Capture alt="the capture" />
      </Exhibit>,
    );
    expect(screen.getByAltText('the capture')).toBeInTheDocument();
  });

  it('renders up to 2 aria-hidden leader lines, decorative only', () => {
    const { container } = render(
      <Exhibit
        scene="s"
        theme="t"
        capturedDate="2026-01-01"
        claim="c"
        leaderLines={[
          { style: { top: '10%', left: '5%' } },
          { style: { top: '40%', left: '60%' } },
        ]}
      >
        <Capture />
      </Exhibit>,
    );
    const leaders = container.querySelectorAll('[aria-hidden="true"].bg-terracotta');
    expect(leaders).toHaveLength(2);
  });

  it('renders zero leader lines when none are given', () => {
    const { container } = render(
      <Exhibit scene="s" theme="t" capturedDate="2026-01-01" claim="c">
        <Capture />
      </Exhibit>,
    );
    expect(container.querySelectorAll('.bg-terracotta')).toHaveLength(0);
  });
});
