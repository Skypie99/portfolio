'use client';

import { useMemo, useState } from 'react';

import { MEDIA } from '@/lib/archive/catalog';
import type { ProcessedImage } from '@/lib/archive/media';
import { thumbPath } from '@/lib/archive/photos';
import { foldText } from '@/lib/archive/search';
import type { Artwork } from '@/lib/archive/types';

import { useArchive } from './ArchiveProvider';
import { PhotoButton } from './PhotoButton';
import { Sheet } from './Sheet';
import { TwoTapButton } from './TwoTapButton';
import { useSignedUrl } from './useSignedUrl';

const MEDIA_LIST: readonly string[] = MEDIA;

/**
 * Artwork editor. Medium is free text (preset chips + "invent new"); a newly
 * picked photo is previewed and, on save, uploaded AFTER the row exists (so a
 * brand-new artwork's photo lands under its own id).
 */
export function ArtSheet({
  draft,
  isNew,
  onClose,
  onDone,
}: {
  draft: Artwork;
  isNew: boolean;
  onClose: () => void;
  onDone: (savedId: string | null) => void;
}) {
  const { state, saveArtwork, attachPhoto, removeArtwork } = useArchive();
  const [title, setTitle] = useState(draft.title);
  const [medium, setMedium] = useState(draft.medium);
  const [orderStr, setOrderStr] = useState(String(draft.sort_order));
  const [note, setNote] = useState(draft.note);
  const [extras, setExtras] = useState(draft.extras);
  const [draftSupplies, setDraftSupplies] = useState<Set<string>>(new Set(draft.supplies));
  const [supFilter, setSupFilter] = useState('');
  const [palette, setPalette] = useState<string[]>(draft.palette);
  const [pending, setPending] = useState<ProcessedImage | null>(null);
  const [thumbPreview, setThumbPreview] = useState<string | null>(null);
  const [showCustom, setShowCustom] = useState(medium !== '' && !MEDIA_LIST.includes(medium));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const existingThumb = useSignedUrl(!thumbPreview && draft.photo_path ? thumbPath(draft.photo_path) : null);
  const previewSrc = thumbPreview ?? existingThumb;

  const options = useMemo(() => {
    const base = [...MEDIA] as string[];
    if (medium && !base.includes(medium)) base.push(medium);
    return base;
  }, [medium]);

  const filteredSupplies = useMemo(() => {
    const q = foldText(supFilter);
    if (!q) return state.supplies;
    return state.supplies.filter((s) => foldText(`${s.name} ${s.medium} ${s.brand}`).includes(q));
  }, [state.supplies, supFilter]);

  const toggleSupply = (id: string) =>
    setDraftSupplies((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  async function save() {
    const t = title.trim();
    if (!t) return;
    setSaving(true);
    setError('');
    try {
      const artwork: Artwork = {
        ...draft,
        title: t,
        medium: medium.trim(),
        sort_order: Number(orderStr) || 0,
        note: note.trim(),
        extras: extras.trim(),
        palette,
        supplies: [...draftSupplies],
        photo_path: draft.photo_path,
      };
      await saveArtwork(artwork);
      if (pending) await attachPhoto(artwork, pending);
      onDone(artwork.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'could not save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet title={isNew ? 'log artwork' : 'edit artwork'} onClose={onClose}>
      <span className="sa-lbl">photo</span>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {previewSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewSrc}
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
          hasPhoto={Boolean(previewSrc)}
          onProcessed={(res) => {
            setPending(res);
            setThumbPreview(res.thumb);
            if (res.palette) setPalette(res.palette);
          }}
        />
      </div>

      <label className="sa-lbl" htmlFor="sa-ea-title">
        title
      </label>
      <input id="sa-ea-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Lake Nocturne I" />

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
        <button type="button" className="sa-chip add" onClick={() => setShowCustom((v) => !v)}>
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

      <label className="sa-lbl" htmlFor="sa-ea-order">
        order
      </label>
      <input
        id="sa-ea-order"
        type="number"
        value={orderStr}
        onChange={(e) => setOrderStr(e.target.value)}
        style={{ width: 140 }}
      />

      <label className="sa-lbl" htmlFor="sa-ea-note">
        note
      </label>
      <input id="sa-ea-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="where, when, what you learned…" />

      <label className="sa-lbl" htmlFor="sa-ea-extras">
        other materials — type anything
      </label>
      <input
        id="sa-ea-extras"
        value={extras}
        onChange={(e) => setExtras(e.target.value)}
        placeholder="e.g. glitter, salt, tape mask, lake water…"
      />

      <span className="sa-lbl">supplies used ({draftSupplies.size})</span>
      <input
        value={supFilter}
        onChange={(e) => setSupFilter(e.target.value)}
        placeholder="filter colours…"
        aria-label="filter colours"
        style={{ marginBottom: 6 }}
      />
      <div className="sa-picker">
        {filteredSupplies.map((s) => {
          const on = draftSupplies.has(s.id);
          return (
            <button
              key={s.id}
              type="button"
              className={`sa-checkrow sa-mono${on ? ' on' : ''}`}
              aria-pressed={on}
              onClick={() => toggleSupply(s.id)}
            >
              <span className="sa-swatch" style={{ background: s.hex }} />
              {s.name}
              <span className="sa-ck" aria-hidden="true">
                {on ? '✓' : ''}
              </span>
            </button>
          );
        })}
      </div>

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
        {!isNew && (
          <TwoTapButton
            idleLabel="delete"
            armedLabel="sure?"
            ariaLabel="delete artwork"
            className="sa-pill sa-del"
            armedClassName="sa-pill sang"
            onConfirm={async () => {
              await removeArtwork(draft);
              onDone(null);
            }}
          />
        )}
        <button
          className="sa-pill sang"
          type="button"
          style={{ flex: 1, padding: 12 }}
          onClick={save}
          disabled={saving || !title.trim()}
        >
          {saving ? 'saving…' : 'save'}
        </button>
      </div>
    </Sheet>
  );
}
