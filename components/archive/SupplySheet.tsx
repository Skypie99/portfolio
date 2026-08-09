'use client';

import { useMemo, useState } from 'react';

import { MEDIA } from '@/lib/archive/catalog';
import { isLight, normalizeHex, valueOf } from '@/lib/archive/color';
import type { Supply } from '@/lib/archive/types';

import { useArchive } from './ArchiveProvider';
import { Sheet } from './Sheet';

const MEDIA_LIST: readonly string[] = MEDIA;
const HEX6 = /^#[0-9a-fA-F]{6}$/;

/** Colour editor. Medium is free text (chips + invent-new); the colour picker +
 *  hex field stay in sync and the V chip previews value live. */
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
  const { saveSupply } = useArchive();
  const [name, setName] = useState(draft.name);
  const [brand, setBrand] = useState(draft.brand);
  const [medium, setMedium] = useState(draft.medium);
  const [hex, setHex] = useState(draft.hex);
  const [notes, setNotes] = useState(draft.notes);
  const [swatched, setSwatched] = useState(draft.swatched);
  const [showCustom, setShowCustom] = useState(medium !== '' && !MEDIA_LIST.includes(medium));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const options = useMemo(() => {
    const base = [...MEDIA] as string[];
    if (medium && !base.includes(medium)) base.push(medium);
    return base;
  }, [medium]);

  const validColor = HEX6.test(hex) ? hex : '#888888';
  const v = valueOf(hex);
  const vfg = isLight(hex) ? 'var(--ink)' : '#f0ede2';

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
        swatched,
      };
      await saveSupply(supply);
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

      <label className="sa-lbl" htmlFor="sa-es-hex">
        colour — match it to your real swatch
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
