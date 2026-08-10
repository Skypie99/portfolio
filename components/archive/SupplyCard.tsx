'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

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
  const objectUrl = useSignedUrl(supply.object_path ? thumbPath(supply.object_path) : null, bust);

  // --- per-object hover sizing -------------------------------------------------
  // Every tool should get as BIG as it can on hover without touching the card
  // edges or the label. A pencil is thin and a Conté bar is chunky, so one fixed
  // scale can't do that for both: we solve each object's own best fit from its
  // real aspect ratio. Rotated by θ, an object of height h and aspect r=w/h spans
  //   Wrot = h(r·cosθ + sinθ)   Hrot = h(r·sinθ + cosθ)
  // so the largest h that fits the free area (card minus margins and the compact
  // label) is the min of the two solved bounds. Exposed as a CSS var so the hover
  // rule and the sway keyframes animate it as a transform (cheap + smooth).
  const frontRef = useRef<HTMLButtonElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [hoverScale, setHoverScale] = useState<number | null>(null);

  const fitObject = useCallback(() => {
    const front = frontRef.current;
    const img = imgRef.current;
    if (!front || !img || !img.naturalWidth || !img.naturalHeight) return;
    const ROT = 47; // matches the CSS pose
    const MARGIN_X = 12;
    const MARGIN_Y = 10;
    const LABEL_H = 22; // compact (name-only) label on hover
    const LABEL_GAP = 10;
    const REST_H = 118; // the at-rest height in archive.css
    const th = (ROT * Math.PI) / 180;
    const cos = Math.abs(Math.cos(th));
    const sin = Math.abs(Math.sin(th));
    const availW = front.offsetWidth - 2 * MARGIN_X;
    const availH = front.offsetHeight - LABEL_H - LABEL_GAP - MARGIN_Y;
    if (availW <= 0 || availH <= 0) return;
    const r = img.naturalWidth / img.naturalHeight;
    const h = Math.min(availW / (r * cos + sin), availH / (r * sin + cos));
    setHoverScale(Math.max(1, +(h / REST_H).toFixed(3)));
  }, []);

  useEffect(() => {
    if (!objectUrl) return;
    fitObject();
    window.addEventListener('resize', fitObject);
    return () => window.removeEventListener('resize', fitObject);
  }, [fitObject, objectUrl]);

  const v = valueOf(supply.hex);
  const light = isLight(supply.hex);
  const fg = light ? 'var(--ink)' : '#f0ede2';
  const btnBg = light ? 'rgba(0,0,0,.12)' : 'rgba(255,255,255,.2)';
  const grad = `linear-gradient(168deg,${supply.hex} 0%,${supply.hex} 46%,color-mix(in srgb,${supply.hex} 46%,var(--paper)) 80%,color-mix(in srgb,${supply.hex} 20%,var(--paper)) 100%)`;

  return (
    <div className="sa-flipwrap">
      <div className={`sa-flip${flipped ? ' on' : ''}`}>
        <button
          ref={frontRef}
          type="button"
          className={`sa-face front${objectUrl ? ' has-obj' : ''}`}
          aria-label={`${supply.name} — flip for details`}
          onClick={() => setFlipped((f) => !f)}
          style={hoverScale ? ({ ['--sa-obj-scale' as string]: String(hoverScale) } as React.CSSProperties) : undefined}
        >
          {objectUrl ? (
            <>
              <span className="sa-objglow" aria-hidden="true" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="sa-obj" ref={imgRef} src={objectUrl} alt={supply.name} onLoad={fitObject} />
              <div className="sa-objmeta">
                <span className="sa-face-name sa-mono">{supply.name}</span>
                {supply.brand && <span className="sa-face-brand sa-serif">{supply.brand}</span>}
                <div className="sa-face-foot">
                  <span className="sa-face-medium sa-mono">{supply.medium}</span>
                  <span className={`sa-dot${supply.swatched ? ' on' : ''}`} />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="sa-stickwrap">
                <div className="sa-stick" style={{ background: supply.hex }} />
              </div>
              <span className="sa-face-name sa-mono">{supply.name}</span>
              {supply.brand && <span className="sa-face-brand sa-serif">{supply.brand}</span>}
              <div className="sa-face-foot">
                <span className="sa-face-medium sa-mono">{supply.medium}</span>
                <span className={`sa-dot${supply.swatched ? ' on' : ''}`} />
              </div>
            </>
          )}
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
