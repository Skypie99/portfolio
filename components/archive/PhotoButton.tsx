'use client';

import { useRef, useState } from 'react';

import { processImage, type ProcessedImage } from '@/lib/archive/media';

/**
 * A pigment-sanguine pill that opens the photo picker, processes the file
 * (thumb + display + palette) and hands the result to `onProcessed`. The input
 * is cleared after each pick so re-picking the SAME file works. Shows "saving…"
 * while busy.
 */
export function PhotoButton({
  hasPhoto,
  onProcessed,
  className = 'sa-pill sang',
}: {
  hasPhoto: boolean;
  onProcessed: (processed: ProcessedImage) => Promise<void> | void;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-picking the same file
    if (!file) return;
    setBusy(true);
    try {
      const res = await processImage(file);
      if (res) await onProcessed(res);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onChange} />
      <button className={className} type="button" disabled={busy} onClick={() => inputRef.current?.click()}>
        {busy ? 'saving…' : hasPhoto ? 'replace photo' : 'add photo'}
      </button>
    </>
  );
}
