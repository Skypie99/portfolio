'use client';

import { useMemo, useState } from 'react';

import { MEDIA } from '@/lib/archive/catalog';
import { isLight, normalizeHex, valueOf } from '@/lib/archive/color';
import type { ProcessedImage } from '@/lib/archive/media';
import { thumbPath } from '@/lib/archive/photos';
import type { Supply } from '@/lib/archive/types';

import { useArchive } from './ArchiveProvider';
import { PhotoButton } from './PhotoButton';
import { Sheet } from './Sheet';
import { useSignedUrl } from './useSignedUrl';

const MEDIA_LIST: readonly string[] = MEDIA;
const HEX6 = /^#[0-9a-fA-F]{6}$/;

/** Colour editor. Medium is free text (chips + invent-new); the colour picker +
 *  hex field stay in sync and the V chip previews value live. A real-swatch photo
 *  can be added/replaced/removed; adding one auto-samples its dominant colour into
 *  the hex field (which you then confirm or tweak) and marks the colour swatched. */
export function SupplySheet({
  draft,
  isNew,
  onClose,
  onDone,
}: {
  draft: Supply;
  isNew: boolean;
  onClose: () => void;
  onDone: () => void;
}) {
  const { saveSupply, attachSwatch, removeSwatch } = useArchive();
  const [name, setName] = useState(draft.name);
  const [brand, setBrand] = useState(draft.brand);
  const [medium, setMedium] = useState(draft.medium);
  const [hex, setHex] = useState(draft.hex);
  const [notes, setNotes] = useState(draft.notes);
  const [swatched, setSwatched] = useState(draft.swatched);
  const [showCustom, setShowCustom] = useState(medium !== '' && !MEDIA_LIST.includes(medium));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // swatch-photo editing: a pending pick (uploaded on save), or a request to drop
  // the existing one. previewSrc is the pending thumb, else the stored swatch.
  const [pendingSwatch, setPendingSwatch] = useState<ProcessedImage | null>(null);
  const [swatchThumbPreview, setSwatchThumbPreview] = useState<string | null>(null);
  const [dropSwatch, setDropSwatch] = useState(false);

  const options = useMemo(() => {
    const base = [...MEDIA] as string[];
    if (medium && !base.includes(medium)) base.push(medium);
    return base;
  }, [medium]);

  const validColor = HEX6.test(hex) ? hex : '#888888';
  const v = valueOf(hex);
  const vfg = isLight(hex) ? 'var(--ink)' : '#f0ede2';

  const showStored = Boolean(draft.swatch_path) && !dropSwatch && !swatchThumbPreview;
  const storedSwatch = useSignedUrl(showStored ? thumbPath(draft.swatch_path as string) : null);
  const swatchPreview = swatchThumbPreview ?? storedSwatch;
  const hasSwatch = Boolean(pendingSwatch) || showStored;

  function clearSwatch() {
    setPendingSwatch(null);
    setSwatchThumbPreview(null);
    setDropSwatch(Boolean(draft.swatch_path)); // only need a delete if one is stored
  }

  async function save() {
    const n = name.trim();
    if (!n) {
      setError('a colour needs a name');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const supply: Supply = {
        id: draft.id || `sup-${crypto.randomUUID().slice(0, 8)}`,
        name: n,
        brand: brand.trim(),
        medium: medium.trim(),
        hex: normalizeHex(hex),
        notes: notes.trim(),
        swatched: swatched || Boolean(pendingSwatch),
        // keep the stored swatch path through the row write; attach/remove below
        // finalise it (mirrors how the artwork editor defers photo work to save).
        swatch_path: dropSwatch ? null : draft.swatch_path,
      };
      await saveSupply(supply);
      if (pendingSwatch) await attachSwatch(supply, pendingSwatch);
      // removeSwatch needs the OLD path to delete the objects, so hand it the
      // original swatch_path (the row was just written with null).
      else if (dropSwatch && draft.swatch_path) await removeSwatch({ ...supply, swatch_path: draft.swatch_path });
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'could not save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet title={isNew ? 'new colour' : 'edit colour'} onClose={onClose}>
      <label className="sa-lbl" htmlFor="sa-es-name">
        name
      </label>
      <input id="sa-es-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Burnt Umber" />

      <label className="sa-lbl" htmlFor="sa-es-brand">
        brand / source
      </label>
      <input
        id="sa-es-brand"
        value={brand}
        onChange={(e) => setBrand(e.target.value)}
        placeholder="e.g. Conté à Paris, foraged…"
      />

      <span className="sa-lbl">medium — tap one, or invent a new one</span>
      <div className="sa-mediumrow">
        {options.map((m) => (
          <button
            key={m}
            type="button"
            className={`sa-chip${medium === m ? ' on' : ' pick'}`}
            aria-pressed={medium === m}
            onClick={() => {
              setMedium(m);
              setShowCustom(false);
            }}
          >
            {m}
          </button>
        ))}
        <button type="button" className="sa-chip add" onClick={() => setShowCustom((s) => !s)}>
          ＋ new
        </button>
      </div>
      {showCustom && (
        <input
          style={{ marginTop: 6 }}
          value={MEDIA_LIST.includes(medium) ? '' : medium}
          onChange={(e) => setMedium(e.target.value)}
          placeholder="name a new medium…"
          aria-label="new medium"
        />
      )}

      <span className="sa-lbl">real swatch — a photo of the mark you made</span>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {swatchPreview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={swatchPreview}
            alt=""
            style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--paperDim)' }}
          />
        ) : (
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 8,
              border: '1px dashed var(--paperDim)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span className="sa-mono" style={{ fontSize: 8, color: 'var(--inkSoft)' }}>
              none
            </span>
          </div>
        )}
        <PhotoButton
          hasPhoto={hasSwatch}
          onProcessed={(res) => {
            setPendingSwatch(res);
            setSwatchThumbPreview(res.thumb);
            setDropSwatch(false);
            setSwatched(true);
            if (res.palette && res.palette[0]) setHex(res.palette[0]); // auto-sample; confirm below
          }}
        />
        {hasSwatch && (
          <button
            type="button"
            className="sa-pill"
            style={{ padding: '8px 12px', border: '1px solid var(--paperDim)', color: 'var(--inkSoft)' }}
            onClick={clearSwatch}
          >
            remove swatch
          </button>
        )}
      </div>

      <label className="sa-lbl" htmlFor="sa-es-hex">
        colour — sampled from your swatch; confirm or tweak
      </label>
      <div className="sa-colorrow">
        <input
          className="sa-colorpick"
          type="color"
          value={validColor}
          onChange={(e) => setHex(e.target.value)}
          aria-label="colour picker"
        />
        <input id="sa-es-hex" value={hex} onChange={(e) => setHex(e.target.value)} placeholder="#a8542f" />
        <span className="sa-vchip sa-mono" style={{ background: validColor, color: vfg }}>
          V {v}
        </span>
      </div>

      <label className="sa-lbl" htmlFor="sa-es-notes">
        notes
      </label>
      <input
        id="sa-es-notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="handling, lightfastness, love letters…"
      />

      <button
        type="button"
        className="sa-checkrow sa-mono"
        aria-pressed={swatched}
        style={{ marginTop: 14, background: '#fbf9f2', border: '1px solid var(--paperDim)', borderRadius: 6, padding: '10px 12px' }}
        onClick={() => setSwatched((s) => !s)}
      >
        <span className={`sa-dot${swatched ? ' on' : ''}`} /> swatched on paper
      </button>

      {error && (
        <p className="sa-error sa-mono" role="alert">
          {error}
        </p>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
        <button
          className="sa-pill"
          type="button"
          style={{ flex: 1, padding: 12, border: '1px solid var(--paperDim)', color: 'var(--inkSoft)' }}
          onClick={onClose}
        >
          cancel
        </button>
        <button
          className="sa-pill sang"
          type="button"
          style={{ flex: 1, padding: 12 }}
          onClick={save}
          disabled={saving || !name.trim()}
        >
          {saving ? 'saving…' : 'save colour'}
        </button>
      </div>
    </Sheet>
  );
}
