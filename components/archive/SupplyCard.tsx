'use client';

import { useState } from 'react';

import { isLight, valueOf } from '@/lib/archive/color';
import { thumbPath } from '@/lib/archive/photos';
import type { Supply } from '@/lib/archive/types';

import { useArchive } from './ArchiveProvider';
import { TwoTapButton } from './TwoTapButton';
import { useSignedUrl } from './useSignedUrl';

/** A pigment-stick flip card: front = stick + name/brand/medium + swatched dot;
 *  back = the real swatch photo (when set) + V/hex/name/usage/notes, with paper
 *  toggle, open-details, edit, and two-tap delete. */
export function SupplyCard({
  supply,
  usedIn,
  bust = 0,
  onOpen,
  onEdit,
}: {
  supply: Supply;
  usedIn: number;
  bust?: number;
  onOpen: () => void;
  onEdit: () => void;
}) {
  const { toggleSwatched, removeSupply } = useArchive();
  const [flipped, setFlipped] = useState(false);
  const swatchUrl = useSignedUrl(supply.swatch_path ? thumbPath(supply.swatch_path) : null, bust);

  const v = valueOf(supply.hex);
  const light = isLight(supply.hex);
  const fg = light ? 'var(--ink)' : '#f0ede2';
  const btnBg = light ? 'rgba(0,0,0,.12)' : 'rgba(255,255,255,.2)';
  const grad = `linear-gradient(168deg,${supply.hex} 0%,${supply.hex} 46%,color-mix(in srgb,${supply.hex} 46%,var(--paper)) 80%,color-mix(in srgb,${supply.hex} 20%,var(--paper)) 100%)`;

  return (
    <div className="sa-flipwrap">
      <div className={`sa-flip${flipped ? ' on' : ''}`}>
        <button
          type="button"
          className="sa-face front"
          aria-label={`${supply.name} — flip for details`}
          onClick={() => setFlipped((f) => !f)}
        >
          <div className="sa-stickwrap">
            <div className="sa-stick" style={{ background: supply.hex }} />
          </div>
          <span className="sa-face-name sa-mono">{supply.name}</span>
          {supply.brand && <span className="sa-face-brand sa-serif">{supply.brand}</span>}
          <div className="sa-face-foot">
            <span className="sa-face-medium sa-mono">{supply.medium}</span>
            <span className={`sa-dot${supply.swatched ? ' on' : ''}`} />
          </div>
        </button>

        <div className="sa-face back" style={{ background: grad }}>
          <button type="button" className="sa-cardback-body" onClick={() => setFlipped((f) => !f)}>
            {swatchUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="sa-swatchstrip" src={swatchUrl} alt={`swatch of ${supply.name}`} />
            )}
            <span className="sa-mono" style={{ fontSize: 16, fontWeight: 700, color: fg }}>
              V {v}
            </span>
            <span className="sa-mono" style={{ fontSize: 9, opacity: 0.8, color: fg }}>
              {supply.hex}
            </span>
            <span className="sa-mono" style={{ fontSize: 9, fontWeight: 700, marginTop: 6, color: fg }}>
              {supply.name}
            </span>
            <span className="sa-mono" style={{ fontSize: 8, opacity: 0.85, marginTop: 4, color: fg }}>
              in {usedIn} work{usedIn === 1 ? '' : 's'}
            </span>
            {supply.notes && (
              <span
                className="sa-serif"
                style={{ fontSize: 11, opacity: 0.85, lineHeight: 1.3, marginTop: 4, color: fg }}
              >
                {supply.notes}
              </span>
            )}
          </button>
          <div className="sa-backbtns">
            <button
              type="button"
              className="sa-mono sa-backbtn"
              style={{ background: btnBg, color: fg }}
              onClick={() => void toggleSwatched(supply)}
            >
              {supply.swatched ? 'paper ✓' : 'paper ○'}
            </button>
            <button type="button" className="sa-mono sa-backbtn" style={{ background: btnBg, color: fg }} onClick={onOpen}>
              open
            </button>
            <button type="button" className="sa-mono sa-backbtn" style={{ background: btnBg, color: fg }} onClick={onEdit}>
              edit
            </button>
            <TwoTapButton
              idleLabel="del"
              armedLabel="sure?"
              ariaLabel={`delete ${supply.name}`}
              className="sa-mono sa-backbtn"
              armedClassName="sa-mono sa-backbtn"
              style={{ background: btnBg, color: fg }}
              armedStyle={{ background: 'var(--sang)', color: 'var(--on-sang)' }}
              resetSignal={flipped}
              onConfirm={() => void removeSupply(supply)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
