'use client';

import { useEffect, useState } from 'react';

import { getSignedUrl } from '@/lib/archive/photos';

/**
 * A signed URL for a private Storage object path, or null while pending/absent.
 * `bust` forces a re-sign when the object at an UNCHANGED path was replaced
 * (uploadPhoto invalidates the path cache, so the re-sign returns a fresh token
 * URL the browser won't serve from its own cache).
 */
export function useSignedUrl(path: string | null, bust = 0): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    setUrl(null);
    if (!path) return;
    getSignedUrl(path).then((u) => {
      if (active) setUrl(u);
    });
    return () => {
      active = false;
    };
  }, [path, bust]);
  return url;
}
