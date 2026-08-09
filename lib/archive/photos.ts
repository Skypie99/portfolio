/**
 * photos.ts — signed-URL cache for reading private photos.
 *
 * The archive fetches all metadata at sign-in but pages IMAGES: a component
 * requests a signed URL for a thumb/display path, requests are batched (~150ms)
 * into one createSignedUrls call, results are cached with a 1h TTL and served
 * from cache until 5 min before expiry (then re-signed). Objects live in a
 * private bucket, so every image load needs a fresh-enough signed URL.
 */

import { getSupabase } from './supabaseClient';

const BUCKET = 'artwork-photos';
const TTL_SECONDS = 3600; // 1 hour
const STALE_BUFFER_MS = 5 * 60 * 1000; // re-sign 5 min before expiry
const FLUSH_MS = 150;

type CacheEntry = { url: string; expiresAt: number };
const cache = new Map<string, CacheEntry>();

type Waiter = (url: string | null) => void;
let queue = new Map<string, Waiter[]>();
let timer: ReturnType<typeof setTimeout> | null = null;

/** `Date.now()` is fine in app code (only workflow scripts ban it). */
const now = () => Date.now();

export const thumbPath = (base: string) => `${base}/thumb.jpg`;
export const displayPath = (base: string) => `${base}/display.jpg`;

async function flush() {
  timer = null;
  const batch = queue;
  queue = new Map();
  const paths = [...batch.keys()];
  if (!paths.length) return;
  try {
    const { data, error } = await getSupabase().storage.from(BUCKET).createSignedUrls(paths, TTL_SECONDS);
    if (error) throw error;
    const signed = new Map<string, string>();
    for (const item of data ?? []) {
      if (item.signedUrl && !item.error && item.path) signed.set(item.path, item.signedUrl);
    }
    for (const [path, waiters] of batch) {
      const url = signed.get(path) ?? null;
      if (url) cache.set(path, { url, expiresAt: now() + TTL_SECONDS * 1000 });
      waiters.forEach((w) => w(url));
    }
  } catch {
    for (const [, waiters] of batch) waiters.forEach((w) => w(null));
  }
}

/** A signed URL for `path`, from cache when fresh, otherwise via a batched sign. */
export function getSignedUrl(path: string): Promise<string | null> {
  const hit = cache.get(path);
  if (hit && hit.expiresAt - now() > STALE_BUFFER_MS) return Promise.resolve(hit.url);
  return new Promise((resolve) => {
    const waiters = queue.get(path) ?? [];
    waiters.push(resolve);
    queue.set(path, waiters);
    if (!timer) timer = setTimeout(flush, FLUSH_MS);
  });
}

export function invalidateSignedUrl(path: string) {
  cache.delete(path);
}
