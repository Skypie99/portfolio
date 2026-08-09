'use client';

import { useState } from 'react';

import { mediaPresent, shownSups } from '@/lib/archive/catalog';
import type { Artwork, Supply } from '@/lib/archive/types';

import { useArchive } from './ArchiveProvider';
import { Chips } from './Chips';
import { SupplyCard } from './SupplyCard';
import { SupplySheet } from './SupplySheet';

function usedCount(arts: Artwork[], id: string): number {
  return arts.filter((a) => a.supplies.includes(id)).length;
}

function newSupplyDraft(filter: string): Supply {
  return {
    id: '',
    name: '',
    brand: '',
    medium: filter === 'All' ? 'Charcoal' : filter,
    hex: '#a8542f',
    notes: '',
    swatched: false,
  };
}

export function VaultTab() {
  const { state, setSupFilter } = useArchive();
  const [editing, setEditing] = useState<{ draft: Supply; isNew: boolean } | null>(null);

  const list = shownSups(state.supplies, state.supFilter, state.query);

  return (
    <>
      <Chips
        options={mediaPresent(state.supplies)}
        active={state.supFilter}
        onPick={setSupFilter}
        addLabel="+ add colour"
        onAdd={() => setEditing({ draft: newSupplyDraft(state.supFilter), isNew: true })}
      />
      {list.length ? (
        <div className="sa-grid">
          {list.map((s) => (
            <SupplyCard
              key={s.id}
              supply={s}
              usedIn={usedCount(state.arts, s.id)}
              onEdit={() => setEditing({ draft: s, isNew: false })}
            />
          ))}
        </div>
      ) : (
        <div className="sa-empty sa-mono">
          {state.query.trim() ? 'no colours match that search' : 'no colours in this medium yet'}
        </div>
      )}

      {editing && (
        <SupplySheet
          draft={editing.draft}
          isNew={editing.isNew}
          onClose={() => setEditing(null)}
          onDone={() => setEditing(null)}
        />
      )}
    </>
  );
}
