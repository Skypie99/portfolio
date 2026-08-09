'use client';

import { useState } from 'react';

import { mediaPresent, shownSups } from '@/lib/archive/catalog';
import type { Artwork, Supply } from '@/lib/archive/types';

import { useArchive } from './ArchiveProvider';
import { ArtSheet } from './ArtSheet';
import { ArtViewer } from './ArtViewer';
import { Chips } from './Chips';
import { SupplyCard } from './SupplyCard';
import { SupplySheet } from './SupplySheet';
import { SupplyViewer } from './SupplyViewer';

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
    swatch_path: null,
  };
}

export function VaultTab() {
  const { state, setSupFilter } = useArchive();
  const [editing, setEditing] = useState<{ draft: Supply; isNew: boolean } | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  // an artwork opened from a colour's "Used in" list (layers over the viewer)
  const [openArtId, setOpenArtId] = useState<string | null>(null);
  const [editingArt, setEditingArt] = useState<Artwork | null>(null);

  const list = shownSups(state.supplies, state.supFilter, state.query);
  const openSupply = openId ? (state.supplies.find((s) => s.id === openId) ?? null) : null;
  const openArt = openArtId ? (state.arts.find((a) => a.id === openArtId) ?? null) : null;

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
              bust={state.photoBust}
              onOpen={() => setOpenId(s.id)}
              onEdit={() => setEditing({ draft: s, isNew: false })}
            />
          ))}
        </div>
      ) : (
        <div className="sa-empty sa-mono">
          {state.query.trim() ? 'no colours match that search' : 'no colours in this medium yet'}
        </div>
      )}

      {/* Editors + viewers. Precedence: a supply editor sits on top; then the
          artwork editor/viewer opened from the Used-in list; then the colour
          viewer underneath (it reappears when the artwork overlay closes). */}
      {editing ? (
        <SupplySheet
          draft={editing.draft}
          isNew={editing.isNew}
          onClose={() => setEditing(null)}
          onDone={() => setEditing(null)}
        />
      ) : editingArt ? (
        <ArtSheet
          draft={editingArt}
          isNew={false}
          onClose={() => setEditingArt(null)}
          onDone={(savedId) => {
            setEditingArt(null);
            setOpenArtId(savedId);
          }}
        />
      ) : openArt ? (
        <ArtViewer
          art={openArt}
          onClose={() => setOpenArtId(null)}
          onEdit={() => setEditingArt(openArt)}
        />
      ) : openSupply ? (
        <SupplyViewer
          supply={openSupply}
          onClose={() => setOpenId(null)}
          onEdit={() => setEditing({ draft: openSupply, isNew: false })}
          onOpenArt={(a) => setOpenArtId(a.id)}
        />
      ) : null}
    </>
  );
}
