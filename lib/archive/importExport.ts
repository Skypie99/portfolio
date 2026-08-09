/**
 * importExport.ts — the safety net. Import/export is the reason this app exists
 * (Sky has lost work twice to tools with no export), so this is deliberately
 * strict and total.
 *
 * Two accepted shapes:
 *   • v2  — `{ format: 'studio-archive-v2', supplies, artworks, photos }`
 *   • legacy — the prototype's `{ supplies, arts }` (+ optional `fulls`)
 *
 * Every value is validated. Unlike the prototype (which did `S.arts = obj.arts`
 * and injected raw data URLs — an XSS hole on a hostile backup), each image is
 * checked against a strict data-URL allowlist and size cap, and every hex is
 * normalised to the DB's strict `^#[0-9a-f]{6}$` (unreadable → `#888888` + a
 * warning) so an import can never poison the store or violate a DB constraint.
 */

import { z } from 'zod';

import { parseHex } from './color';
import type { ArchiveData, Artwork, Supply } from './types';

export type PhotoPair = { thumb?: string; display?: string };
export type PhotosMap = Record<string, PhotoPair>;
export type ImportResult = { data: ArchiveData; photos: PhotosMap; warnings: string[] };
export type ArchiveExportV2 = {
  format: 'studio-archive-v2';
  exported_at: string;
  supplies: Supply[];
  artworks: Artwork[];
  photos: PhotosMap;
};

/** Only these image data URLs may enter the store or Storage. */
export const DATA_URL_RE = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;
/** ~8 MB per image (data-URL string length). */
export const MAX_DATA_URL_BYTES = 8 * 1024 * 1024;

export function isValidDataUrl(s: unknown): s is string {
  return typeof s === 'string' && s.length <= MAX_DATA_URL_BYTES && DATA_URL_RE.test(s);
}

// ---------------------------------------------------------------- zod shapes

const supplySchema = z.object({
  id: z.string().min(1),
  name: z.string().default(''),
  brand: z.string().default(''),
  medium: z.string().default(''),
  hex: z.string().default('#888888'),
  notes: z.string().default(''),
  swatched: z.boolean().default(false),
});

const v2ArtworkSchema = z.object({
  id: z.string().min(1),
  sort_order: z.number().int(),
  title: z.string().default(''),
  medium: z.string().default(''),
  note: z.string().default(''),
  extras: z.string().default(''),
  palette: z.array(z.string()).default([]),
  supplies: z.array(z.string()).default([]),
  photo_path: z.string().nullable().default(null),
});

const photoPairSchema = z.object({ thumb: z.string().optional(), display: z.string().optional() });

const v2Schema = z.object({
  format: z.literal('studio-archive-v2'),
  exported_at: z.string().optional(),
  supplies: z.array(supplySchema),
  artworks: z.array(v2ArtworkSchema),
  photos: z.record(photoPairSchema).default({}),
});

const legacyArtSchema = z.object({
  id: z.string().min(1),
  order: z.number().default(0),
  title: z.string().default(''),
  medium: z.string().default(''),
  note: z.string().default(''),
  extras: z.string().default(''),
  palette: z.array(z.string()).default([]),
  supplies: z.array(z.string()).default([]),
  thumb: z.string().nullable().default(null),
  hasFull: z.boolean().optional(),
});

const legacySchema = z.object({
  supplies: z.array(supplySchema),
  arts: z.array(legacyArtSchema),
  fulls: z.record(z.string()).optional(),
});

type SupplyInput = z.infer<typeof supplySchema>;

// ---------------------------------------------------------------- normalisers

function firstIssue(err: z.ZodError): string {
  const i = err.issues[0];
  return i ? `${i.path.join('.') || '(root)'}: ${i.message}` : 'unknown validation error';
}

function normSupply(s: SupplyInput, warnings: string[]): Supply {
  const parsed = parseHex(s.hex);
  if (parsed === null) {
    warnings.push(`Colour "${s.name || s.id}" had an unreadable value (${String(s.hex)}) — set to #888888.`);
  }
  return {
    id: s.id,
    name: s.name,
    brand: s.brand,
    medium: s.medium,
    hex: parsed ?? '#888888',
    notes: s.notes,
    swatched: s.swatched,
  };
}

function normPalette(pal: string[], artLabel: string, warnings: string[]): string[] {
  const out: string[] = [];
  for (const c of pal) {
    const parsed = parseHex(c);
    if (parsed === null) {
      warnings.push(`Artwork "${artLabel}" had an unreadable palette colour (${String(c)}) — set to #888888.`);
      out.push('#888888');
    } else {
      out.push(parsed);
    }
  }
  if (out.length > 8) {
    warnings.push(`Artwork "${artLabel}" had ${out.length} palette colours — trimmed to 8.`);
    return out.slice(0, 8);
  }
  return out;
}

function keepImage(url: string | null | undefined, label: string, kind: 'thumbnail' | 'full image', warnings: string[]): string | undefined {
  if (url == null) return undefined;
  if (isValidDataUrl(url)) return url;
  warnings.push(`Dropped an unreadable ${kind} for "${label}".`);
  return undefined;
}

/**
 * Drop any supply id an artwork references that isn't in the backup's own
 * supplies. Done at parse time — BEFORE the destructive import wipes anything —
 * so the artwork_supplies FK can never fail mid-import and strand a wiped
 * catalogue. Mutates each artwork's freshly-built supplies array.
 */
function pruneDanglingSupplies(supplies: Supply[], arts: Artwork[], warnings: string[]): void {
  const ids = new Set(supplies.map((s) => s.id));
  for (const a of arts) {
    const before = a.supplies.length;
    a.supplies = a.supplies.filter((id) => ids.has(id));
    const dropped = before - a.supplies.length;
    if (dropped > 0) {
      warnings.push(`Artwork "${a.title || a.id}" referenced ${dropped} colour(s) not in this backup — those links were dropped.`);
    }
  }
}

function fromV2(obj: Record<string, unknown>): ImportResult {
  const parsed = v2Schema.safeParse(obj);
  if (!parsed.success) throw new Error(`that v2 backup is malformed — ${firstIssue(parsed.error)}`);
  const v = parsed.data;
  const warnings: string[] = [];
  const supplies = v.supplies.map((s) => normSupply(s, warnings));
  const arts: Artwork[] = v.artworks.map((a) => ({
    id: a.id,
    sort_order: a.sort_order,
    title: a.title,
    medium: a.medium,
    note: a.note,
    extras: a.extras,
    palette: normPalette(a.palette, a.title || a.id, warnings),
    supplies: a.supplies,
    photo_path: null,
  }));
  pruneDanglingSupplies(supplies, arts, warnings);
  const photos: PhotosMap = {};
  for (const [artId, pair] of Object.entries(v.photos)) {
    const thumb = keepImage(pair.thumb, artId, 'thumbnail', warnings);
    const display = keepImage(pair.display, artId, 'full image', warnings);
    if (thumb || display) photos[artId] = { ...(thumb ? { thumb } : {}), ...(display ? { display } : {}) };
  }
  return { data: { supplies, arts }, photos, warnings };
}

function fromLegacy(obj: Record<string, unknown>): ImportResult {
  const parsed = legacySchema.safeParse(obj);
  if (!parsed.success) throw new Error(`that backup is malformed — ${firstIssue(parsed.error)}`);
  const v = parsed.data;
  const warnings: string[] = [];
  const supplies = v.supplies.map((s) => normSupply(s, warnings));
  const photos: PhotosMap = {};
  const arts: Artwork[] = v.arts.map((a) => {
    const label = a.title || a.id;
    const thumb = keepImage(a.thumb, label, 'thumbnail', warnings);
    const display = keepImage(v.fulls?.[a.id], label, 'full image', warnings);
    if (thumb || display) photos[a.id] = { ...(thumb ? { thumb } : {}), ...(display ? { display } : {}) };
    return {
      id: a.id,
      sort_order: a.order,
      title: a.title,
      medium: a.medium,
      note: a.note,
      extras: a.extras,
      palette: normPalette(a.palette, label, warnings),
      supplies: a.supplies,
      photo_path: null,
    };
  });
  pruneDanglingSupplies(supplies, arts, warnings);
  return { data: { supplies, arts }, photos, warnings };
}

// ---------------------------------------------------------------- public API

/** Validate + canonicalise a parsed backup object (v2 or legacy). Throws on bad shape. */
export function normalizeBackup(raw: unknown): ImportResult {
  if (!raw || typeof raw !== 'object') {
    throw new Error("couldn't read that — it doesn't look like a Studio Archive backup");
  }
  const obj = raw as Record<string, unknown>;
  if (obj.format === 'studio-archive-v2') return fromV2(obj);
  if (Array.isArray(obj.supplies) && Array.isArray(obj.arts)) return fromLegacy(obj);
  throw new Error("couldn't read that — expected a Studio Archive export (v2 or the original format)");
}

/** Parse backup text (from a file or a paste) into a validated import result. */
export function parseBackup(text: string): ImportResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error("couldn't read that — paste the exact exported text");
  }
  return normalizeBackup(raw);
}

export function buildExportV2(data: ArchiveData, photos: PhotosMap, exportedAt: string): ArchiveExportV2 {
  return {
    format: 'studio-archive-v2',
    exported_at: exportedAt,
    supplies: data.supplies.map((s) => ({ ...s })),
    artworks: data.arts.map((a) => ({
      id: a.id,
      sort_order: a.sort_order,
      title: a.title,
      medium: a.medium,
      note: a.note,
      extras: a.extras,
      palette: [...a.palette],
      supplies: [...a.supplies],
      photo_path: a.photo_path,
    })),
    photos,
  };
}

export function serializeExport(payload: ArchiveExportV2): string {
  return JSON.stringify(payload);
}
