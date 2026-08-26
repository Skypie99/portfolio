/**
 * AuthGate — the sign-in wall's heading contract.
 *
 * WHY THIS FILE EXISTS, AND WHY IT DIDN'T UNTIL NOW
 * ------------------------------------------------
 * The live sign-in card shipped with ZERO headings. axe flagged
 * `page-has-heading-one` on it in both themes — and not one scan in eleven
 * phases of THE ROOM caught it, because of a measurement trap worth writing
 * down:
 *
 *   With no `.env.local`, `getSupabase()` throws inside AuthGate's effect, the
 *   route falls to `app/global-error.tsx` — which DOES carry an <h1> ("Something
 *   went sideways.") — and every local axe run happily scored the error boundary
 *   and reported /archive/ clean. The route "passed" while the page under test
 *   was never rendered at all.
 *
 * It was found by pointing the same rig at production after the deploy, where
 * the real credentials exist. This test closes the loop the other way: it
 * renders the actual component, with no environment at all, so the contract is
 * checked wherever the suite runs.
 *
 * The fix itself was one tag. `.sa-card-kicker` carries font-size, weight and
 * colour, and Tailwind's preflight (globals.css, imported by the root layout
 * /archive sits under) zeroes heading margin and inherits font-size/weight — so
 * div → h1 was pixel-identical, verified by computed-style diff against the
 * live page rather than assumed: 13px / 700 / margin 0 / line-height 19.5px /
 * rect [554, 363, 332, 20] on both sides, only the tag differing.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

// The archive island's only real dependency. Stubbed so this test renders the
// signed-out card deterministically and never reaches the network — which is
// also the exact condition that used to make this page untestable.
vi.mock('@/lib/archive/supabaseClient', () => ({
  getSupabase: () => ({
    auth: {
      getSession: async () => ({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithOtp: async () => ({ error: null }),
      verifyOtp: async () => ({ error: null }),
    },
  }),
}));

import { AuthGate } from '@/components/archive/AuthGate';

afterEach(cleanup);

describe('AuthGate — the sign-in card', () => {
  it('renders exactly one <h1>, and it names the page', async () => {
    render(
      <AuthGate>
        <div>catalogue</div>
      </AuthGate>,
    );
    const h1 = await screen.findByRole('heading', { level: 1 });
    expect(h1).toBeInTheDocument();
    expect(h1.textContent?.trim()).toBe('THE STUDIO ARCHIVE');
    expect(document.querySelectorAll('h1')).toHaveLength(1);
  });

  it('keeps the kicker’s styling hooks on the heading, so the tag change stays cosmetic', async () => {
    render(
      <AuthGate>
        <div>catalogue</div>
      </AuthGate>,
    );
    const h1 = await screen.findByRole('heading', { level: 1 });
    // `.sa-card-kicker` is what carries font-size/weight/colour; `.sa-mono` the
    // family. If either is dropped, div → h1 stops being a no-op and the card
    // renders at the UA's 2em heading size.
    expect(h1.className).toContain('sa-card-kicker');
    expect(h1.className).toContain('sa-mono');
  });

  it('does not gate the catalogue behind the wall once a session exists', async () => {
    // Non-vacuity: proves the card above is the SIGNED-OUT state, not the only
    // thing this component can ever render.
    render(
      <AuthGate>
        <div>catalogue</div>
      </AuthGate>,
    );
    await screen.findByRole('heading', { level: 1 });
    expect(screen.queryByText('catalogue')).not.toBeInTheDocument();
  });
});
