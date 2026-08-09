'use client';

import { useCallback, useState } from 'react';

import { getSupabase } from '@/lib/archive/supabaseClient';

import { ArchiveProvider, type Tab, useArchive } from './ArchiveProvider';
import { AuthGate } from './AuthGate';
import { GalleryTab } from './GalleryTab';
import { ImportExportPanel } from './ImportExportPanel';
import { RangeTab } from './RangeTab';
import { SearchBar } from './SearchBar';
import { VaultTab } from './VaultTab';

const TABS: ReadonlyArray<readonly [Tab, string]> = [
  ['archive', 'archive'],
  ['vault', 'supplies'],
  ['map', 'range map'],
];

function SignOut({ className }: { className: string }) {
  const signOut = useCallback(async () => {
    await getSupabase().auth.signOut();
  }, []);
  return (
    <button type="button" className={className} onClick={() => void signOut()}>
      sign out
    </button>
  );
}

function Shell() {
  const { state, setTab } = useArchive();
  const [panel, setPanel] = useState<'export' | 'import' | null>(null);
  const withPhotos = state.arts.filter((a) => a.photo_path).length;

  if (state.status === 'loading') {
    return (
      <div className="sa-status sa-mono sa-dim" role="status" aria-live="polite">
        opening the studio…
      </div>
    );
  }
  if (state.status === 'error') {
    return (
      <div className="sa-status" role="alert">
        <div>
          <p className="sa-mono">could not open the archive</p>
          <p className="sa-serif sa-dim">{state.error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="sa-hdr">
        <div className="sa-hdr-row">
          <div>
            <div className="sa-hdr-title sa-mono">EX. 07 — THE STUDIO ARCHIVE</div>
            <div className="sa-hdr-stats sa-mono">
              {state.arts.length} works · {withPhotos} with photos · {state.supplies.length} colours
            </div>
          </div>
          <SignOut className="sa-signout sa-mono" />
        </div>
        <div className="sa-hdr-lede sa-serif">
          every piece in order · tap to open · attach a photo and the palette reads itself
        </div>
      </header>

      <nav className="sa-tabs" aria-label="Archive sections">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`sa-tab${state.tab === id ? ' on' : ''}`}
            aria-pressed={state.tab === id}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      {state.tab !== 'map' && <SearchBar />}

      {state.tab === 'archive' && <GalleryTab />}
      {state.tab === 'vault' && <VaultTab />}
      {state.tab === 'map' && <RangeTab />}

      <div className="sa-footer">
        <button className="sa-chip" type="button" onClick={() => setPanel('export')}>
          export data
        </button>
        <button className="sa-chip" type="button" onClick={() => setPanel('import')}>
          import data
        </button>
        <SignOut className="sa-signout sa-mono" />
      </div>

      {panel && <ImportExportPanel mode={panel} onClose={() => setPanel(null)} />}
    </>
  );
}

/** Root of the Studio Archive client app: dark studio surface → auth → store → UI. */
export function ArchiveApp() {
  return (
    <div id="studio-archive-root" className="studio-archive">
      <AuthGate>
        <ArchiveProvider>
          <Shell />
        </ArchiveProvider>
      </AuthGate>
    </div>
  );
}
