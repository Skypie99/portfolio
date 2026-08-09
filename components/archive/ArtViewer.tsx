'use client';

import { useEffect, useState } from 'react';

import { displayPath } from '@/lib/archive/photos';
import type { Artwork, Supply } from '@/lib/archive/types';

import { useArchive } from './ArchiveProvider';
import { PaletteBands } from './PaletteBands';
import { PhotoButton } from './PhotoButton';
import { useSignedUrl } from './useSignedUrl';

/** Full-image viewer (the prototype's modal). Backdrop or Escape closes. */
export function ArtViewer({
  art,
  onClose,
  onEdit,
}: {
  art: Artwork;
  onClose: () => void;
  onEdit: () => void;
}) {
  const { state, attachPhoto } = useArchive();
  const [bust, setBust] = useState(0);
  const displayUrl = useSignedUrl(art.photo_path ? displayPath(art.photo_path) : null, bust);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const sups = art.supplies
    .map((id) => state.supplies.find((s) => s.id === id))
    .filter((s): s is Supply => Boolean(s));

  return (
    // Backdrop-click close is a mouse affordance; Escape + the close button
    // serve keyboard/AT, so this div needs no keyboard handler of its own.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div className="sa-modal" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sa-modalimg">
        {art.photo_path ? (
          displayUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={displayUrl} alt={art.title} />
          ) : (
            <span className="sa-mono sa-dim">fetching the full image…</span>
          )
        ) : (
          <div style={{ width: '100%', maxWidth: 340, height: '40vh', borderRadius: 10, overflow: 'hidden' }}>
            <PaletteBands palette={art.palette} />
          </div>
        )}
      </div>
      <div className="sa-modalinfo">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div className="sa-mono" style={{ fontSize: 11, color: 'var(--chalk)', fontWeight: 700 }}>
              {art.title}
            </div>
            <div className="sa-mono" style={{ fontSize: 9, color: 'var(--chalkDim)', marginTop: 4 }}>
              {art.medium} · order {art.sort_order}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            {art.palette.map((p, i) => (
              <span
                key={`${p}-${i}`}
                style={{ width: 18, height: 18, borderRadius: 3, background: p, border: '1px solid rgba(240,237,226,.3)' }}
              />
            ))}
          </div>
        </div>
        {art.note && (
          <div className="sa-serif" style={{ fontSize: 13, color: 'var(--chalkDim)', marginTop: 8 }}>
            {art.note}
          </div>
        )}
        {art.extras && (
          <div className="sa-serif" style={{ fontSize: 12, color: 'var(--chalkDim)', marginTop: 4 }}>
            also used: {art.extras}
          </div>
        )}
        {sups.length > 0 && (
          <div className="sa-supchiprow">
            {sups.map((s) => (
              <span key={s.id} className="sa-supchip sa-mono">
                <span className="sa-swd" style={{ background: s.hex }} />
                {s.name}
              </span>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <PhotoButton
            hasPhoto={Boolean(art.photo_path)}
            onProcessed={async (res) => {
              await attachPhoto(art, res);
              setBust((b) => b + 1);
            }}
          />
          <button className="sa-pill ghost" type="button" onClick={onEdit}>
            edit
          </button>
          <button className="sa-pill ghost" type="button" style={{ marginLeft: 'auto' }} onClick={onClose}>
            close
          </button>
        </div>
      </div>
    </div>
  );
}
