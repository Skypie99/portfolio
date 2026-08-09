'use client';

import { useRef } from 'react';

import { thumbPath } from '@/lib/archive/photos';
import type { Artwork } from '@/lib/archive/types';

import { PaletteBands } from './PaletteBands';
import { useInView } from './useInView';
import { useSignedUrl } from './useSignedUrl';

/** One gallery card. The № badge is the render-time position in the filtered
 *  list (passed in), exactly like the prototype. Thumbs sign lazily on scroll. */
export function ArtCard({
  art,
  index,
  bust,
  onOpen,
}: {
  art: Artwork;
  index: number;
  /** Store-level photo generation; bumps re-sign the thumb after a replace. */
  bust: number;
  onOpen: (art: Artwork) => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const inView = useInView(ref);
  const url = useSignedUrl(inView && art.photo_path ? thumbPath(art.photo_path) : null, bust);

  return (
    <button ref={ref} type="button" className="sa-artcard" onClick={() => onOpen(art)}>
      <div className="sa-artthumb">
        {art.photo_path && url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={art.title} />
        ) : (
          <>
            <PaletteBands palette={art.palette} />
            {!art.photo_path && (
              <div className="sa-nophoto">
                <span className="sa-mono">no photo yet</span>
              </div>
            )}
          </>
        )}
        <span className="sa-num sa-mono">№ {index + 1}</span>
      </div>
      <div className="sa-artmeta">
        <span className="sa-artmeta-title sa-mono">{art.title}</span>
        <span className="sa-artmeta-medium sa-mono">{art.medium}</span>
      </div>
    </button>
  );
}
