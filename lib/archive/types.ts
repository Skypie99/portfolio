/**
 * types.ts — the Studio Archive's client-side domain shapes.
 *
 * These mirror the prototype's in-memory records, adjusted for the cloud model:
 * the prototype's `order` becomes `sort_order`, its `thumb`/`hasFull` photo
 * bookkeeping becomes a single nullable `photo_path` (the object key in the
 * private Storage bucket), and an artwork's `supplies` list is merged in from
 * the `artwork_supplies` join table at load time.
 */

export type Supply = {
  id: string;
  name: string;
  brand: string;
  medium: string;
  hex: string;
  notes: string;
  swatched: boolean;
};

export type Artwork = {
  id: string;
  sort_order: number;
  title: string;
  medium: string;
  note: string;
  extras: string;
  /** 0–8 lowercase hexes; auto-overwritten from a photo when one is attached. */
  palette: string[];
  /** Supply ids, merged from the artwork_supplies join. */
  supplies: string[];
  /** Storage object key `{uid}/{artId}` base, or null when no photo yet. */
  photo_path: string | null;
};

/** The whole catalogue as held in the client store (a load, or an import result). */
export type ArchiveData = {
  supplies: Supply[];
  arts: Artwork[];
};
