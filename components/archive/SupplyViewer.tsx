'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { isLight, valueOf } from '@/lib/archive/color';
import { displayPath, thumbPath } from '@/lib/archive/photos';
import type { Artwork, Supply } from '@/lib/archive/types';

import { useArchive } from './ArchiveProvider';
import { PhotoButton } from './PhotoButton';
import { useSignedUrl } from './useSignedUrl';

/** One row in the "Used in" list — its own component so the per-row signed-URL
 *  hook is called unconditionally (Rules of Hooks). */
function UsedInRow({ art, bust, onOpen }: { art: Artwork; bust: number; onOpen: () => void }) {
  const thumb = useSignedUrl(art.photo_path ? thumbPath(art.photo_path) : null, bust);
  return (
    <button type="button" className="sa-usedrow" onClick={onOpen}>
      {thumb ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="sa-usedthumb" src={thumb} alt="" />
      ) : (
        <span className="sa-usedthumb" style={{ background: art.palette[0] ?? 'var(--line)' }} />
      )}
      <span className="sa-usedtitle sa-mono">{art.title || art.id}</span>
      <span className="sa-usedorder sa-mono">#{art.sort_order}</span>
    </button>
  );
}

/** Full colour viewer: the real swatch (or a colour block), value/hex/notes, and
 *  the full tappable list of artworks it was used in. Backdrop or Escape closes. */
export function SupplyViewer({
  supply,
  onClose,
  onEdit,
  onOpenArt,
}: {
  supply: Supply;
  onClose: () => void;
  onEdit: () => void;
  onOpenArt: (art: Artwork) => void;
}) {
  const { state, attachSwatch, removeSwatch } = useArchive();
  const [bust, setBust] = useState(0);
  const displayUrl = useSignedUrl(supply.swatch_path ? displayPath(supply.swatch_path) : null, bust);

  const modalRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    modalRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab' || !modalRef.current) return;
      const items = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null);
      if (items.length === 0) {
        e.preventDefault();
        modalRef.current.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === modalRef.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (opener && typeof opener.focus === 'function') opener.focus();
    };
    // Mount-only: focus setup / trap / restore.
  }, []);

  const usedIn = useMemo(
    () => state.arts.filter((a) => a.supplies.includes(supply.id)),
    [state.arts, supply.id],
  );
  const v = valueOf(supply.hex);
  const chipFg = isLight(supply.hex) ? 'var(--ink)' : '#f0ede2';

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      ref={modalRef}
      className="sa-modal"
      role="dialog"
      aria-modal="true"
      aria-label={supply.name}
      tabIndex={-1}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="sa-modalimg">
        {supply.swatch_path ? (
          displayUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={displayUrl} alt={`swatch of ${supply.name}`} />
          ) : (
            <span className="sa-mono sa-dim">fetching the swatch…</span>
          )
        ) : (
          <div
            style={{
              width: '100%',
              maxWidth: 300,
              height: '34vh',
              borderRadius: 10,
              background: supply.hex,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'flex-end',
              padding: 10,
            }}
          >
            <span className="sa-mono" style={{ fontSize: 10, fontWeight: 700, color: chipFg }}>
              V {v}
            </span>
          </div>
        )}
      </div>
      <div className="sa-modalinfo">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div className="sa-mono" style={{ fontSize: 11, color: 'var(--chalk)', fontWeight: 700 }}>
              {supply.name}
            </div>
            <div className="sa-mono" style={{ fontSize: 9, color: 'var(--chalkDim)', marginTop: 4 }}>
              {[supply.brand, supply.medium].filter(Boolean).join(' · ')}
            </div>
          </div>
          <span className="sa-supchip sa-mono" style={{ flexShrink: 0 }}>
            <span className="sa-swd" style={{ background: supply.hex }} />
            {supply.hex} · V {v}
          </span>
        </div>
        {supply.notes && (
          <div className="sa-serif" style={{ fontSize: 13, color: 'var(--chalkDim)', marginTop: 8 }}>
            {supply.notes}
          </div>
        )}

        <div className="sa-mono" style={{ fontSize: 9, color: 'var(--chalkDim)', marginTop: 12, marginBottom: 6 }}>
          used in {usedIn.length} work{usedIn.length === 1 ? '' : 's'}
        </div>
        {usedIn.length > 0 && (
          <div className="sa-usedlist">
            {usedIn.map((a) => (
              <UsedInRow key={a.id} art={a} bust={state.photoBust} onOpen={() => onOpenArt(a)} />
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          <PhotoButton
            hasPhoto={Boolean(supply.swatch_path)}
            onProcessed={async (res) => {
              await attachSwatch(supply, res);
              setBust((b) => b + 1);
            }}
          />
          {supply.swatch_path && (
            <button className="sa-pill ghost" type="button" onClick={() => void removeSwatch(supply)}>
              remove swatch
            </button>
          )}
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
