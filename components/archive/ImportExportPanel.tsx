'use client';

import { useState } from 'react';

import * as data from '@/lib/archive/data';
import { removePhotoObjects, swatchBase } from '@/lib/archive/image';
import { type ImportResult, parseBackup, type PhotoPair } from '@/lib/archive/importExport';
import { displayPath, thumbPath } from '@/lib/archive/photos';
import { getSupabase } from '@/lib/archive/supabaseClient';

import { useArchive } from './ArchiveProvider';
import { Sheet } from './Sheet';

const BUCKET = 'artwork-photos';

/** Bounded-concurrency pool (default 3). */
async function pool<T>(items: T[], worker: (item: T) => Promise<void>, concurrency = 3): Promise<void> {
  let i = 0;
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (i < items.length) {
      const idx = i;
      i += 1;
      await worker(items[idx]);
    }
  });
  await Promise.all(runners);
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  return (await fetch(dataUrl)).blob();
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 400);
}

const todayStamp = () => new Date().toISOString().slice(0, 10);

async function downloadObject(path: string): Promise<string | null> {
  const { data: blob, error } = await getSupabase().storage.from(BUCKET).download(path);
  if (error || !blob) return null;
  return blobToDataUrl(blob);
}

/** Upload whichever images the pair carries. Bucket is jpeg-only, so we declare
 *  image/jpeg (real archive photos are always JPEG). Returns the base or null. */
async function uploadImportedPhoto(uid: string, artId: string, pair: PhotoPair): Promise<string | null> {
  const base = `${uid}/${artId}`;
  const storage = getSupabase().storage.from(BUCKET);
  // Track each requested image independently: return the base only when EVERY
  // image the pair carries uploaded (a thumb failure after a display success
  // must count as a failure, not a silent half-restore).
  let displayOk = pair.display === undefined;
  let thumbOk = pair.thumb === undefined;
  if (pair.display) {
    const r = await storage.upload(displayPath(base), await dataUrlToBlob(pair.display), {
      upsert: true,
      contentType: 'image/jpeg',
    });
    displayOk = !r.error;
  }
  if (pair.thumb) {
    const r = await storage.upload(thumbPath(base), await dataUrlToBlob(pair.thumb), {
      upsert: true,
      contentType: 'image/jpeg',
    });
    thumbOk = !r.error;
  }
  const hasAny = Boolean(pair.display || pair.thumb);
  return displayOk && thumbOk && hasAny ? base : null;
}

/** Same as uploadImportedPhoto, but writes to a supply's `{uid}/supply/{id}` key. */
async function uploadImportedSwatch(uid: string, supplyId: string, pair: PhotoPair): Promise<string | null> {
  const base = swatchBase(uid, supplyId);
  const storage = getSupabase().storage.from(BUCKET);
  let displayOk = pair.display === undefined;
  let thumbOk = pair.thumb === undefined;
  if (pair.display) {
    const r = await storage.upload(displayPath(base), await dataUrlToBlob(pair.display), {
      upsert: true,
      contentType: 'image/jpeg',
    });
    displayOk = !r.error;
  }
  if (pair.thumb) {
    const r = await storage.upload(thumbPath(base), await dataUrlToBlob(pair.thumb), {
      upsert: true,
      contentType: 'image/jpeg',
    });
    thumbOk = !r.error;
  }
  const hasAny = Boolean(pair.display || pair.thumb);
  return displayOk && thumbOk && hasAny ? base : null;
}

export function ImportExportPanel({ mode, onClose }: { mode: 'export' | 'import'; onClose: () => void }) {
  const { state, reload } = useArchive();
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');

  // import state
  const [pasted, setPasted] = useState('');
  const [parsed, setParsed] = useState<ImportResult | null>(null);
  const [parseError, setParseError] = useState('');
  const [importError, setImportError] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [failures, setFailures] = useState<string[]>([]);
  const [swatchFailures, setSwatchFailures] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  /** Build the v2 backup as Blob PARTS (never one giant string) and download it. */
  async function runExport(withPhotos: boolean) {
    setBusy(true);
    setProgress(withPhotos ? 'gathering photos…' : 'building backup…');
    try {
      const head = JSON.stringify({
        format: 'studio-archive-v2',
        exported_at: new Date().toISOString(),
        supplies: state.supplies,
        artworks: state.arts,
      });
      const parts: BlobPart[] = [head.slice(0, -1), ',"photos":{'];
      if (withPhotos) {
        const withPhoto = state.arts.filter((a) => a.photo_path);
        const collected: Array<[string, PhotoPair]> = [];
        let n = 0;
        await pool(withPhoto, async (a) => {
          const base = a.photo_path as string;
          const pair: PhotoPair = {};
          const t = await downloadObject(thumbPath(base));
          if (t) pair.thumb = t;
          const d = await downloadObject(displayPath(base));
          if (d) pair.display = d;
          if (pair.thumb || pair.display) collected.push([a.id, pair]);
          n += 1;
          setProgress(`gathering photos… ${n}/${withPhoto.length}`);
        });
        collected.forEach(([artId, pair], idx) => {
          parts.push((idx === 0 ? '' : ',') + JSON.stringify(artId) + ':' + JSON.stringify(pair));
        });
      }
      parts.push('},"swatches":{');
      if (withPhotos) {
        const withSwatch = state.supplies.filter((s) => s.swatch_path);
        const collected: Array<[string, PhotoPair]> = [];
        let n = 0;
        await pool(withSwatch, async (s) => {
          const base = s.swatch_path as string;
          const pair: PhotoPair = {};
          const t = await downloadObject(thumbPath(base));
          if (t) pair.thumb = t;
          const d = await downloadObject(displayPath(base));
          if (d) pair.display = d;
          if (pair.thumb || pair.display) collected.push([s.id, pair]);
          n += 1;
          setProgress(`gathering swatches… ${n}/${withSwatch.length}`);
        });
        collected.forEach(([supplyId, pair], idx) => {
          parts.push((idx === 0 ? '' : ',') + JSON.stringify(supplyId) + ':' + JSON.stringify(pair));
        });
      }
      parts.push('}}');
      downloadBlob(new Blob(parts, { type: 'application/json' }), `studio-archive-${todayStamp()}.json`);
    } finally {
      setBusy(false);
      setProgress('');
    }
  }

  function parseInput(text: string) {
    if (!text.trim()) {
      setParsed(null);
      setParseError('');
      return;
    }
    try {
      setParsed(parseBackup(text));
      setParseError('');
    } catch (e) {
      setParsed(null);
      setParseError(e instanceof Error ? e.message : 'could not read that');
    }
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const text = await file.text();
    setPasted(text);
    parseInput(text);
  }

  async function uploadImportPhotos(uid: string, entries: Array<[string, PhotoPair]>): Promise<string[]> {
    const failed: string[] = [];
    let n = 0;
    await pool(entries, async ([artId, pair]) => {
      try {
        const base = await uploadImportedPhoto(uid, artId, pair);
        if (base) await data.setArtworkPhotoPath(artId, base);
        else failed.push(artId);
      } catch {
        failed.push(artId);
      }
      n += 1;
      setProgress(`uploading photos… ${n}/${entries.length}`);
    });
    return failed;
  }

  async function uploadImportSwatches(uid: string, entries: Array<[string, PhotoPair]>): Promise<string[]> {
    const failed: string[] = [];
    let n = 0;
    await pool(entries, async ([supplyId, pair]) => {
      try {
        const base = await uploadImportedSwatch(uid, supplyId, pair);
        if (base) await data.setSupplySwatchPath(supplyId, base);
        else failed.push(supplyId);
      } catch {
        failed.push(supplyId);
      }
      n += 1;
      setProgress(`uploading swatches… ${n}/${entries.length}`);
    });
    return failed;
  }

  async function runImport() {
    if (!parsed) return;
    setBusy(true);
    setDone(false);
    setImportError('');
    try {
      setProgress('backing up your current data first…');
      await runExport(true); // forced fresh backup before anything destructive
      const uid = await data.currentUid();

      setProgress('clearing the old catalogue…');
      // remove old objects derived from the CURRENT rows (no orphans)
      for (const a of state.arts) if (a.photo_path) await removePhotoObjects(a.photo_path).catch(() => {});
      for (const s of state.supplies) if (s.swatch_path) await removePhotoObjects(s.swatch_path).catch(() => {});
      await data.wipeAll();

      setProgress('loading the imported catalogue…');
      await data.bulkInsert({
        supplies: parsed.data.supplies.map((s) => ({ ...s, swatch_path: null })),
        arts: parsed.data.arts.map((a) => ({ ...a, photo_path: null })),
      });

      const failed = await uploadImportPhotos(uid, Object.entries(parsed.photos));
      setFailures(failed);
      const swFailed = await uploadImportSwatches(uid, Object.entries(parsed.swatches));
      setSwatchFailures(swFailed);
      setProgress('');
      setDone(true);
      await reload();
    } catch (e) {
      // A full backup was downloaded (step 1) before anything was touched, so
      // the user can always recover — say so explicitly, and resync the UI with
      // whatever actually landed in the DB.
      const msg = e instanceof Error ? e.message : 'import failed';
      setProgress('');
      setImportError(
        `Import didn't finish (${msg}). A full backup of your previous data was downloaded before anything changed — re-import that file to restore.`,
      );
      await reload().catch(() => {});
    } finally {
      setBusy(false);
    }
  }

  async function retryFailures() {
    if (!parsed || failures.length === 0) return;
    setBusy(true);
    try {
      const uid = await data.currentUid();
      const entries = failures.map((id) => [id, parsed.photos[id]] as [string, PhotoPair]).filter(([, p]) => p);
      const stillFailed = await uploadImportPhotos(uid, entries);
      setFailures(stillFailed);
      setProgress('');
      await reload();
    } finally {
      setBusy(false);
    }
  }

  const title = mode === 'export' ? 'export data' : 'import data';

  return (
    <Sheet title={title} onClose={onClose}>
      {mode === 'export' ? (
        <>
          <p className="sa-notice sa-serif">
            A full backup carries your photos too — a bigger file, but it is your safety net. Keep it somewhere safe.
          </p>
          <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            <button className="sa-pill" type="button" style={{ flex: 1, padding: 12, border: '1px solid var(--paperDim)', color: 'var(--inkSoft)' }} onClick={() => void runExport(false)} disabled={busy}>
              quick (no photos)
            </button>
            <button className="sa-pill sang" type="button" style={{ flex: 1, padding: 12 }} onClick={() => void runExport(true)} disabled={busy}>
              {busy ? progress || 'working…' : 'full backup'}
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="sa-notice sa-serif">
            Import REPLACES everything currently loaded. Your current catalogue is exported first, automatically, before
            anything is changed.
          </p>

          <label className="sa-lbl" htmlFor="sa-import-file">
            choose a backup file
          </label>
          <input id="sa-import-file" type="file" accept="application/json,.json" onChange={onFile} disabled={busy} />

          <label className="sa-lbl" htmlFor="sa-import-paste">
            …or paste backup text
          </label>
          <textarea
            id="sa-import-paste"
            className="sa-textarea"
            placeholder="paste exported backup text here"
            value={pasted}
            onChange={(e) => {
              setPasted(e.target.value);
              parseInput(e.target.value);
            }}
            disabled={busy}
          />

          {parseError && (
            <p className="sa-error sa-mono" role="alert">
              {parseError}
            </p>
          )}

          {importError && (
            <p className="sa-error sa-mono" role="alert">
              {importError}
            </p>
          )}

          {parsed && !done && (
            <>
              <p className="sa-notice sa-serif">
                Ready to import <strong>{parsed.data.supplies.length}</strong> colours and{' '}
                <strong>{parsed.data.arts.length}</strong> artworks
                {[
                  Object.keys(parsed.photos).length ? `${Object.keys(parsed.photos).length} with photos` : '',
                  Object.keys(parsed.swatches).length ? `${Object.keys(parsed.swatches).length} swatches` : '',
                ].filter(Boolean).length
                  ? ` (${[
                      Object.keys(parsed.photos).length ? `${Object.keys(parsed.photos).length} with photos` : '',
                      Object.keys(parsed.swatches).length ? `${Object.keys(parsed.swatches).length} swatches` : '',
                    ]
                      .filter(Boolean)
                      .join(', ')})`
                  : ''}
                .
              </p>
              {parsed.warnings.length > 0 && (
                <ul className="sa-warns">
                  {parsed.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              )}
              <label className="sa-lbl" htmlFor="sa-import-confirm">
                type <strong>replace</strong> to confirm
              </label>
              <input
                id="sa-import-confirm"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="replace"
                disabled={busy}
              />
              <button
                className="sa-pill sang"
                type="button"
                style={{ width: '100%', padding: 12, marginTop: 12 }}
                onClick={() => void runImport()}
                disabled={busy || confirmText.trim().toLowerCase() !== 'replace'}
              >
                {busy ? progress || 'working…' : 'back up, then replace everything'}
              </button>
            </>
          )}

          {done && (
            <>
              <p className="sa-notice sa-serif">
                Imported.{' '}
                {failures.length === 0 && swatchFailures.length === 0
                  ? 'All photos and swatches restored.'
                  : [
                      failures.length ? `${failures.length} photo(s)` : '',
                      swatchFailures.length ? `${swatchFailures.length} swatch(es)` : '',
                    ]
                      .filter(Boolean)
                      .join(' and ') + ' could not be restored.'}
              </p>
              {failures.length > 0 && (
                <button className="sa-pill sang" type="button" style={{ width: '100%', padding: 12 }} onClick={() => void retryFailures()} disabled={busy}>
                  {busy ? progress || 'retrying…' : `retry ${failures.length} photo(s)`}
                </button>
              )}
              <button
                className="sa-pill"
                type="button"
                style={{ width: '100%', padding: 12, marginTop: 8, border: '1px solid var(--paperDim)', color: 'var(--inkSoft)' }}
                onClick={onClose}
              >
                done
              </button>
            </>
          )}
        </>
      )}

      {mode === 'export' && (
        <button
          className="sa-pill"
          type="button"
          style={{ width: '100%', padding: 12, marginTop: 12, border: '1px solid var(--paperDim)', color: 'var(--inkSoft)' }}
          onClick={onClose}
          disabled={busy}
        >
          close
        </button>
      )}
    </Sheet>
  );
}
