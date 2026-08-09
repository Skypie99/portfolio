'use client';

import { useArchive } from '@/components/archive/ArchiveProvider';

/** Instant, diacritic-folded search across the whole catalogue (both tabs). */
export function SearchBar() {
  const { state, setQuery } = useArchive();
  return (
    <div className="sa-search-wrap">
      <input
        className="sa-search"
        type="search"
        placeholder="search title, note, colour, brand…"
        value={state.query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search artworks and colours"
      />
    </div>
  );
}
