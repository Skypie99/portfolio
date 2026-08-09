'use client';

import { createContext, type ReactNode, useCallback, useContext, useEffect, useReducer } from 'react';

import * as data from '@/lib/archive/data';
import { removePhotoObjects, uploadPhoto } from '@/lib/archive/image';
import type { ProcessedImage } from '@/lib/archive/media';
import type { Artwork, Supply } from '@/lib/archive/types';

export type Tab = 'archive' | 'vault' | 'map';
type Status = 'loading' | 'ready' | 'error';

type State = {
  status: Status;
  error: string;
  supplies: Supply[];
  arts: Artwork[];
  tab: Tab;
  artFilter: string;
  supFilter: string;
  query: string;
};

type Action =
  | { type: 'LOADING' }
  | { type: 'LOADED'; supplies: Supply[]; arts: Artwork[] }
  | { type: 'ERROR'; error: string }
  | { type: 'TAB'; tab: Tab }
  | { type: 'ART_FILTER'; medium: string }
  | { type: 'SUP_FILTER'; medium: string }
  | { type: 'QUERY'; query: string }
  | { type: 'UPSERT_SUPPLY'; supply: Supply }
  | { type: 'REMOVE_SUPPLY'; id: string }
  | { type: 'UPSERT_ARTWORK'; artwork: Artwork }
  | { type: 'REMOVE_ARTWORK'; id: string };

export const initialState: State = {
  status: 'loading',
  error: '',
  supplies: [],
  arts: [],
  tab: 'archive',
  artFilter: 'All',
  supFilter: 'All',
  query: '',
};

function upsertById<T extends { id: string }>(list: T[], item: T): T[] {
  const i = list.findIndex((x) => x.id === item.id);
  if (i === -1) return [...list, item];
  const next = list.slice();
  next[i] = item;
  return next;
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOADING':
      return { ...state, status: 'loading', error: '' };
    case 'LOADED':
      return { ...state, status: 'ready', error: '', supplies: action.supplies, arts: action.arts };
    case 'ERROR':
      return { ...state, status: 'error', error: action.error };
    case 'TAB':
      return { ...state, tab: action.tab };
    case 'ART_FILTER':
      return { ...state, artFilter: action.medium };
    case 'SUP_FILTER':
      return { ...state, supFilter: action.medium };
    case 'QUERY':
      return { ...state, query: action.query };
    case 'UPSERT_SUPPLY':
      return { ...state, supplies: upsertById(state.supplies, action.supply) };
    case 'REMOVE_SUPPLY':
      return {
        ...state,
        supplies: state.supplies.filter((s) => s.id !== action.id),
        // a deleted colour also leaves every artwork that referenced it
        arts: state.arts.map((a) =>
          a.supplies.includes(action.id)
            ? { ...a, supplies: a.supplies.filter((id) => id !== action.id) }
            : a,
        ),
      };
    case 'UPSERT_ARTWORK':
      return { ...state, arts: upsertById(state.arts, action.artwork) };
    case 'REMOVE_ARTWORK':
      return { ...state, arts: state.arts.filter((a) => a.id !== action.id) };
    default:
      return state;
  }
}

type ArchiveContextValue = {
  state: State;
  reload: () => Promise<void>;
  setTab: (tab: Tab) => void;
  setArtFilter: (medium: string) => void;
  setSupFilter: (medium: string) => void;
  setQuery: (query: string) => void;
  saveSupply: (s: Supply) => Promise<void>;
  removeSupply: (id: string) => Promise<void>;
  toggleSwatched: (s: Supply) => Promise<void>;
  saveArtwork: (a: Artwork) => Promise<void>;
  removeArtwork: (a: Artwork) => Promise<void>;
  attachPhoto: (a: Artwork, processed: ProcessedImage) => Promise<void>;
  removePhoto: (a: Artwork) => Promise<void>;
};

const ArchiveContext = createContext<ArchiveContextValue | null>(null);

export function useArchive(): ArchiveContextValue {
  const ctx = useContext(ArchiveContext);
  if (!ctx) throw new Error('useArchive must be used within ArchiveProvider');
  return ctx;
}

export function ArchiveProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const reload = useCallback(async () => {
    dispatch({ type: 'LOADING' });
    try {
      const { supplies, arts } = await data.fetchAll();
      dispatch({ type: 'LOADED', supplies, arts });
    } catch (e) {
      dispatch({ type: 'ERROR', error: e instanceof Error ? e.message : 'could not load your archive' });
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const setTab = useCallback((tab: Tab) => dispatch({ type: 'TAB', tab }), []);
  const setArtFilter = useCallback((medium: string) => dispatch({ type: 'ART_FILTER', medium }), []);
  const setSupFilter = useCallback((medium: string) => dispatch({ type: 'SUP_FILTER', medium }), []);
  const setQuery = useCallback((query: string) => dispatch({ type: 'QUERY', query }), []);

  const saveSupply = useCallback(async (s: Supply) => {
    await data.upsertSupply(s);
    dispatch({ type: 'UPSERT_SUPPLY', supply: s });
  }, []);

  const removeSupply = useCallback(async (id: string) => {
    await data.deleteSupply(id);
    dispatch({ type: 'REMOVE_SUPPLY', id });
  }, []);

  const toggleSwatched = useCallback(async (s: Supply) => {
    const next = !s.swatched;
    await data.setSwatched(s.id, next);
    dispatch({ type: 'UPSERT_SUPPLY', supply: { ...s, swatched: next } });
  }, []);

  const saveArtwork = useCallback(async (a: Artwork) => {
    await data.upsertArtwork(a);
    dispatch({ type: 'UPSERT_ARTWORK', artwork: a });
  }, []);

  const removeArtwork = useCallback(async (a: Artwork) => {
    await data.deleteArtwork(a.id); // row first (join cascades)
    if (a.photo_path) await removePhotoObjects(a.photo_path).catch(() => {}); // then objects
    dispatch({ type: 'REMOVE_ARTWORK', id: a.id });
  }, []);

  const attachPhoto = useCallback(async (a: Artwork, processed: ProcessedImage) => {
    const uid = await data.currentUid();
    const base = await uploadPhoto(uid, a.id, processed); // display → thumb, both or nothing
    const palette = processed.palette ?? a.palette; // photo auto-overwrites the palette
    await data.setArtworkPhotoAndPalette(a.id, base, palette); // row set only after uploads
    dispatch({ type: 'UPSERT_ARTWORK', artwork: { ...a, photo_path: base, palette } });
  }, []);

  const removePhoto = useCallback(async (a: Artwork) => {
    await data.setArtworkPhotoPath(a.id, null); // row first
    if (a.photo_path) await removePhotoObjects(a.photo_path).catch(() => {}); // then objects
    dispatch({ type: 'UPSERT_ARTWORK', artwork: { ...a, photo_path: null } });
  }, []);

  const value: ArchiveContextValue = {
    state,
    reload,
    setTab,
    setArtFilter,
    setSupFilter,
    setQuery,
    saveSupply,
    removeSupply,
    toggleSwatched,
    saveArtwork,
    removeArtwork,
    attachPhoto,
    removePhoto,
  };

  return <ArchiveContext.Provider value={value}>{children}</ArchiveContext.Provider>;
}
