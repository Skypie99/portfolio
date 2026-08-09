'use client';

import { useState } from 'react';

import { mediaPresent, shownArts } from '@/lib/archive/catalog';
import type { Artwork } from '@/lib/archive/types';

import { ArtCard } from './ArtCard';
import { ArtSheet } from './ArtSheet';
import { ArtViewer } from './ArtViewer';
import { useArchive } from './ArchiveProvider';
import { Chips } from './Chips';

function newDraft(arts: Artwork[], filter: string): Artwork {
  const maxOrder = arts.reduce((m, a) => Math.max(m, a.sort_order), 0);
  return {
    id: `art-${crypto.randomUUID().slice(0, 8)}`,
    sort_order: maxOrder + 10,
    title: '',
    medium: filter === 'All' ? 'Watercolour' : filter,
    note: '',
    extras: '',
    palette: ['#a8542f'],
    supplies: [],
    photo_path: null,
  };
}

export function GalleryTab() {
  const { state, setArtFilter } = useArchive();
  const [openId, setOpenId] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ draft: Artwork; isNew: boolean } | null>(null);

  const list = shownArts(state.arts, state.artFilter, state.query);
  const openArt = openId ? (state.arts.find((a) => a.id === openId) ?? null) : null;

  return (
    <>
      <Chips
        options={mediaPresent(state.arts)}
        active={state.artFilter}
        onPick={setArtFilter}
        addLabel="+ log artwork"
        onAdd={() => setEditing({ draft: newDraft(state.arts, state.artFilter), isNew: true })}
      />
      {list.length ? (
        <div className="sa-grid">
          {list.map((art, idx) => (
            <ArtCard key={art.id} art={art} index={idx} bust={state.photoBust} onOpen={(a) => setOpenId(a.id)} />
          ))}
        </div>
      ) : (
        <div className="sa-empty sa-mono">
          {state.query.trim() ? 'nothing matches that search' : 'nothing in this medium yet'}
        </div>
      )}

      {editing ? (
        <ArtSheet
          draft={editing.draft}
          isNew={editing.isNew}
          onClose={() => setEditing(null)}
          onDone={(savedId) => {
            setEditing(null);
            setOpenId(savedId);
          }}
        />
      ) : openArt ? (
        <ArtViewer
          art={openArt}
          onClose={() => setOpenId(null)}
          onEdit={() => setEditing({ draft: openArt, isNew: false })}
        />
      ) : null}
    </>
  );
}
