'use client';

import { useCallback } from 'react';

import { AuthGate } from '@/components/archive/AuthGate';
import { getSupabase } from '@/lib/archive/supabaseClient';

/**
 * Root of the Studio Archive client app. Owns the dark studio surface
 * (#studio-archive-root) and gates everything behind AuthGate.
 *
 * P4 fills the authed region with the real gallery / vault / range-map UI
 * (via ArchiveProvider); for now it is a signed-in placeholder so the route
 * builds and the auth flow can be exercised end-to-end.
 */
export function ArchiveApp() {
  const signOut = useCallback(async () => {
    await getSupabase().auth.signOut();
  }, []);

  return (
    <div id="studio-archive-root" className="studio-archive">
      <AuthGate>
        <div className="sa-placeholder">
          <p className="sa-mono">the studio archive</p>
          <p className="sa-serif sa-dim">signed in — the catalogue UI lands here next.</p>
          <button className="sa-btn sa-btn-ghost" type="button" onClick={signOut}>
            sign out
          </button>
        </div>
      </AuthGate>
    </div>
  );
}
