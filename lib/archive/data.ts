/**
 * data.ts — the archive's Supabase data layer.
 *
 * Metadata is fetched in full at sign-in (three small parallel selects merged in
 * the client); mutations are await-then-apply (no optimistic writes, no
 * refetch-the-world — the caller updates local state from what it just wrote).
 * user_id is stamped explicitly so composite-PK upserts target the right row;
 * RLS still guarantees a caller can only ever touch their own rows.
 */

import type { ArchiveData, Artwork, Supply } from './types';
import { getSupabase } from './supabaseClient';

type SupplyRow = Supply & { user_id?: string; swatch_path?: string | null };
type ArtworkRow = {
  id: string;
  sort_order: number;
  title: string;
  medium: string;
  note: string;
  extras: string;
  palette: string[] | null;
  photo_path: string | null;
};
type JoinRow = { artwork_id: string; supply_id: string };

async function currentUid(): Promise<string> {
  const { data, error } = await getSupabase().auth.getUser();
  if (error || !data.user) throw new Error('not signed in');
  return data.user.id;
}

/** Three parallel selects, merged into the client store shape. */
export async function fetchAll(): Promise<ArchiveData> {
  const supabase = getSupabase();
  const [supRes, artRes, joinRes] = await Promise.all([
    supabase.from('supplies').select('*'),
    supabase.from('artworks').select('*').order('sort_order', { ascending: true }),
    supabase.from('artwork_supplies').select('artwork_id, supply_id'),
  ]);
  if (supRes.error) throw supRes.error;
  if (artRes.error) throw artRes.error;
  if (joinRes.error) throw joinRes.error;

  const byArt = new Map<string, string[]>();
  for (const row of (joinRes.data ?? []) as JoinRow[]) {
    const list = byArt.get(row.artwork_id) ?? [];
    list.push(row.supply_id);
    byArt.set(row.artwork_id, list);
  }

  const supplies: Supply[] = ((supRes.data ?? []) as SupplyRow[]).map((r) => ({
    id: r.id,
    name: r.name,
    brand: r.brand,
    medium: r.medium,
    hex: r.hex,
    notes: r.notes,
    swatched: r.swatched,
    swatch_path: r.swatch_path ?? null,
  }));

  const arts: Artwork[] = ((artRes.data ?? []) as ArtworkRow[]).map((r) => ({
    id: r.id,
    sort_order: r.sort_order,
    title: r.title,
    medium: r.medium,
    note: r.note,
    extras: r.extras,
    palette: r.palette ?? [],
    supplies: byArt.get(r.id) ?? [],
    photo_path: r.photo_path ?? null,
  }));

  return { supplies, arts };
}

function artworkRow(a: Artwork, user_id: string) {
  return {
    user_id,
    id: a.id,
    sort_order: a.sort_order,
    title: a.title,
    medium: a.medium,
    note: a.note,
    extras: a.extras,
    palette: a.palette,
    photo_path: a.photo_path,
  };
}

export async function upsertSupply(s: Supply): Promise<void> {
  const user_id = await currentUid();
  const { error } = await getSupabase()
    .from('supplies')
    .upsert({ ...s, user_id }, { onConflict: 'user_id,id' });
  if (error) throw error;
}

export async function deleteSupply(id: string): Promise<void> {
  const { error } = await getSupabase().from('supplies').delete().eq('id', id);
  if (error) throw error;
}

export async function setSwatched(id: string, swatched: boolean): Promise<void> {
  const { error } = await getSupabase().from('supplies').update({ swatched }).eq('id', id);
  if (error) throw error;
}

/** Set (or clear) a supply's real-swatch photo object base. Adding a swatch also
 *  flips `swatched` true; clearing it leaves the paper-swatched flag alone. */
export async function setSupplySwatchPath(id: string, swatchPath: string | null): Promise<void> {
  const patch = swatchPath ? { swatch_path: swatchPath, swatched: true } : { swatch_path: null };
  const { error } = await getSupabase().from('supplies').update(patch).eq('id', id);
  if (error) throw error;
}

/** Replace the join set for one artwork (delete-all-then-insert). */
export async function setArtworkSupplies(artworkId: string, supplyIds: string[]): Promise<void> {
  const user_id = await currentUid();
  const supabase = getSupabase();
  const del = await supabase.from('artwork_supplies').delete().eq('artwork_id', artworkId);
  if (del.error) throw del.error;
  if (supplyIds.length) {
    const rows = supplyIds.map((supply_id) => ({ user_id, artwork_id: artworkId, supply_id }));
    const ins = await supabase.from('artwork_supplies').insert(rows);
    if (ins.error) throw ins.error;
  }
}

export async function upsertArtwork(a: Artwork): Promise<void> {
  const user_id = await currentUid();
  const { error } = await getSupabase()
    .from('artworks')
    .upsert(artworkRow(a, user_id), { onConflict: 'user_id,id' });
  if (error) throw error;
  await setArtworkSupplies(a.id, a.supplies);
}

export async function deleteArtwork(id: string): Promise<void> {
  // artwork_supplies rows cascade via FK; the caller removes storage objects.
  const { error } = await getSupabase().from('artworks').delete().eq('id', id);
  if (error) throw error;
}

export async function setArtworkPhotoPath(id: string, photoPath: string | null): Promise<void> {
  const { error } = await getSupabase().from('artworks').update({ photo_path: photoPath }).eq('id', id);
  if (error) throw error;
}

/** Attaching a photo sets its path AND auto-overwrites the palette, in one write
 *  that never touches the artwork_supplies join. */
export async function setArtworkPhotoAndPalette(
  id: string,
  photoPath: string | null,
  palette: string[],
): Promise<void> {
  const { error } = await getSupabase()
    .from('artworks')
    .update({ photo_path: photoPath, palette })
    .eq('id', id);
  if (error) throw error;
}

/** Delete every row this user owns — the first half of a destructive import. */
export async function wipeAll(): Promise<void> {
  const user_id = await currentUid();
  const supabase = getSupabase();
  const j = await supabase.from('artwork_supplies').delete().eq('user_id', user_id);
  if (j.error) throw j.error;
  const a = await supabase.from('artworks').delete().eq('user_id', user_id);
  if (a.error) throw a.error;
  const s = await supabase.from('supplies').delete().eq('user_id', user_id);
  if (s.error) throw s.error;
}

export async function bulkInsert(data: ArchiveData): Promise<void> {
  const user_id = await currentUid();
  const supabase = getSupabase();
  if (data.supplies.length) {
    const rows = data.supplies.map((s) => ({ ...s, user_id }));
    const { error } = await supabase.from('supplies').insert(rows);
    if (error) throw error;
  }
  if (data.arts.length) {
    const rows = data.arts.map((a) => artworkRow(a, user_id));
    const { error } = await supabase.from('artworks').insert(rows);
    if (error) throw error;
    const joinRows = data.arts.flatMap((a) =>
      a.supplies.map((supply_id) => ({ user_id, artwork_id: a.id, supply_id })),
    );
    if (joinRows.length) {
      const { error: jerr } = await supabase.from('artwork_supplies').insert(joinRows);
      if (jerr) throw jerr;
    }
  }
}

export { currentUid };
