/**
 * image.ts — Storage upload/removal orchestration for artwork photos.
 *
 * Object keys are `{uid}/{artId}/thumb.jpg` and `.../display.jpg`; the artwork
 * row's photo_path stores the `{uid}/{artId}` base. Uploads go display → thumb,
 * and photo_path is only set (by the caller) after BOTH succeed — a partial
 * failure removes whatever was uploaded and throws, leaving the row untouched.
 * Removal is the reverse: the caller nulls photo_path first, then this deletes
 * the objects.
 */

import type { ProcessedImage } from './media';
import { displayPath, invalidateSignedUrl, thumbPath } from './photos';
import { getSupabase } from './supabaseClient';

const BUCKET = 'artwork-photos';

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}

export const photoBase = (uid: string, artId: string) => `${uid}/${artId}`;

/**
 * Upload the display JPEG, then the thumb. Returns the base path on full
 * success. On thumb failure the display object is removed again so no orphan is
 * left, and the error is rethrown (the row is never written by this function).
 */
export async function uploadPhoto(uid: string, artId: string, processed: ProcessedImage): Promise<string> {
  const base = photoBase(uid, artId);
  const storage = getSupabase().storage.from(BUCKET);
  const displayBlob = await dataUrlToBlob(processed.display);
  const thumbBlob = await dataUrlToBlob(processed.thumb);

  const up1 = await storage.upload(displayPath(base), displayBlob, { upsert: true, contentType: 'image/jpeg' });
  if (up1.error) throw up1.error;

  const up2 = await storage.upload(thumbPath(base), thumbBlob, { upsert: true, contentType: 'image/jpeg' });
  if (up2.error) {
    await storage.remove([displayPath(base)]).catch(() => {});
    throw up2.error;
  }

  invalidateSignedUrl(displayPath(base));
  invalidateSignedUrl(thumbPath(base));
  return base;
}

/** Delete both objects for a photo. The caller nulls photo_path first. */
export async function removePhotoObjects(base: string): Promise<void> {
  const storage = getSupabase().storage.from(BUCKET);
  await storage.remove([displayPath(base), thumbPath(base)]).catch(() => {});
  invalidateSignedUrl(displayPath(base));
  invalidateSignedUrl(thumbPath(base));
}
