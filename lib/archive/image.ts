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
/** Swatch objects nest under a `supply/` segment so a supply id can never collide
 *  with an artwork id at the same key; the first segment stays the uid, so the
 *  existing `{uid}/…` storage RLS still scopes it to the owner. */
export const swatchBase = (uid: string, supplyId: string) => `${uid}/supply/${supplyId}`;
/** Art-supply object photos nest under an `object/` segment (front-of-card image);
 *  first segment stays the uid so the existing `{uid}/…` storage RLS covers it. */
export const objectBase = (uid: string, supplyId: string) => `${uid}/object/${supplyId}`;

/**
 * Upload the display JPEG, then the thumb, to `base`. Returns the base on full
 * success. On thumb failure the display object is removed again so no orphan is
 * left, and the error is rethrown (the row is never written by this function).
 */
async function uploadPair(base: string, processed: ProcessedImage): Promise<string> {
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

/** Upload an artwork's photo. Returns the `{uid}/{artId}` base on full success. */
export async function uploadPhoto(uid: string, artId: string, processed: ProcessedImage): Promise<string> {
  return uploadPair(photoBase(uid, artId), processed);
}

/** Upload a supply's real-swatch photo. Returns the `{uid}/supply/{supplyId}` base. */
export async function uploadSupplySwatch(uid: string, supplyId: string, processed: ProcessedImage): Promise<string> {
  return uploadPair(swatchBase(uid, supplyId), processed);
}

/** Upload a supply's cut-out object photo. Returns the `{uid}/object/{supplyId}` base. */
export async function uploadSupplyObject(uid: string, supplyId: string, processed: ProcessedImage): Promise<string> {
  return uploadPair(objectBase(uid, supplyId), processed);
}

/** Delete both objects for a photo. The caller nulls photo_path first. */
export async function removePhotoObjects(base: string): Promise<void> {
  const storage = getSupabase().storage.from(BUCKET);
  await storage.remove([displayPath(base), thumbPath(base)]).catch(() => {});
  invalidateSignedUrl(displayPath(base));
  invalidateSignedUrl(thumbPath(base));
}
