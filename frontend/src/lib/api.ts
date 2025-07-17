/**
 * Thin wrapper around window.fetch that handles JSON, credentials, and error
 * shape normalization. Every request is same-origin because Vite proxies
 * /api and /auth to the backend, so the browser never holds a token.
 */

import type {
  Artist,
  AudioFeatures,
  AuthStatus,
  CurrentlyPlaying,
  Me,
  TimeRange,
  Track,
  VibeResult,
} from './types';

export class ApiError extends Error {
  public readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    credentials: 'include',
    ...init,
    headers: {
      accept: 'application/json',
      ...(init.body ? { 'content-type': 'application/json' } : {}),
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body?.error) msg = body.error;
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, msg);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  authStatus: (): Promise<AuthStatus> => request('/auth/status'),
  login: (): Promise<{ mode: 'fixture' | 'live'; redirectTo?: string; authUrl?: string }> =>
    request('/auth/login'),
  logout: (): Promise<{ ok: true }> => request('/auth/logout', { method: 'POST' }),

  me: (): Promise<Me> => request('/api/me'),

  search: (q: string, limit = 20): Promise<{ tracks: Track[] }> =>
    request(`/api/search?q=${encodeURIComponent(q)}&type=track&limit=${limit}`),

  audioFeatures: (ids: string[]): Promise<{ features: AudioFeatures[] }> =>
    request('/api/audio-features', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    }),

  recommendations: (seedTracks: string[], limit = 20): Promise<{ tracks: Track[] }> =>
    request(
      `/api/recommendations?seed_tracks=${encodeURIComponent(seedTracks.slice(0, 5).join(','))}&limit=${limit}`,
    ),

  topTracks: (range: TimeRange): Promise<{ tracks: Track[]; timeRange: TimeRange }> =>
    request(`/api/me/top/tracks?time_range=${range}`),

  topArtists: (range: TimeRange): Promise<{ artists: Artist[]; timeRange: TimeRange }> =>
    request(`/api/me/top/artists?time_range=${range}`),

  currentlyPlaying: (): Promise<CurrentlyPlaying> => request('/api/me/currently-playing'),

  createPlaylist: (body: {
    name: string;
    description: string;
    trackIds: string[];
  }): Promise<{ id: string; url: string; saved: number }> =>
    request('/api/playlists', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  vibe: (audioFeatures: AudioFeatures[]): Promise<VibeResult> =>
    request('/api/vibe', {
      method: 'POST',
      body: JSON.stringify({ audioFeatures }),
    }),
};
