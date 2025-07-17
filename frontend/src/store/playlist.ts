/**
 * Zustand store holding the playlist-in-progress. Persisted to localStorage so
 * a hard refresh doesn't wipe the user's work before they hit "Save".
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Track } from '../lib/types';

interface PlaylistState {
  name: string;
  tracks: Track[];
  setName: (name: string) => void;
  add: (track: Track) => void;
  addMany: (tracks: Track[]) => void;
  remove: (trackId: string) => void;
  reorder: (fromId: string, toId: string) => void;
  clear: () => void;
  has: (trackId: string) => boolean;
}

export const usePlaylist = create<PlaylistState>()(
  persist(
    (set, get) => ({
      name: 'My Vibe Mix',
      tracks: [],
      setName: (name) => set({ name }),
      add: (track) =>
        set((s) =>
          s.tracks.find((t) => t.id === track.id)
            ? s
            : { tracks: [...s.tracks, track] },
        ),
      addMany: (incoming) =>
        set((s) => {
          const existing = new Set(s.tracks.map((t) => t.id));
          const fresh = incoming.filter((t) => !existing.has(t.id));
          return { tracks: [...s.tracks, ...fresh] };
        }),
      remove: (trackId) =>
        set((s) => ({ tracks: s.tracks.filter((t) => t.id !== trackId) })),
      reorder: (fromId, toId) =>
        set((s) => {
          const from = s.tracks.findIndex((t) => t.id === fromId);
          const to = s.tracks.findIndex((t) => t.id === toId);
          if (from < 0 || to < 0 || from === to) return s;
          const next = s.tracks.slice();
          const [moved] = next.splice(from, 1);
          if (moved) next.splice(to, 0, moved);
          return { tracks: next };
        }),
      clear: () => set({ tracks: [] }),
      has: (trackId) => get().tracks.some((t) => t.id === trackId),
    }),
    { name: 'jamming.playlist.v1' },
  ),
);
