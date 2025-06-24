/**
 * Typed Spotify Web API client.
 *
 * Responsibilities:
 *   - Build requests against https://api.spotify.com/v1/*
 *   - Attach bearer tokens, refresh on 401, retry with backoff on 429/5xx
 *   - Cache hot responses in a tiny TTL map so rapid-fire search/recommendation
 *     clicks don't hammer upstream
 *   - Normalise Spotify's payload into our internal types so the frontend
 *     contract stays small and stable
 */

import { createHash, randomBytes } from 'node:crypto';
import type {
  Artist,
  AudioFeatures,
  CurrentlyPlaying,
  SpotifyImage,
  TimeRange,
  Track,
} from '../types.js';
import { HttpError } from '../types.js';
import { TTLCache } from './cache.js';
import type { SessionStore } from './session.js';

const SPOTIFY_API = 'https://api.spotify.com/v1';
const SPOTIFY_ACCOUNTS = 'https://accounts.spotify.com';

interface SpotifyConfig {
  clientId: string;
  redirectUri: string;
  sessionStore: SessionStore;
  cacheTtlSeconds: number;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

interface RawImage {
  url: string;
  width: number | null;
  height: number | null;
}

interface RawArtistLite {
  id: string;
  name: string;
}

interface RawTrack {
  id: string;
  name: string;
  artists: RawArtistLite[];
  album: { id: string; name: string; images: RawImage[] };
  duration_ms: number;
  uri: string;
  preview_url: string | null;
  popularity: number;
  explicit: boolean;
}

interface RawArtist {
  id: string;
  name: string;
  genres: string[];
  images: RawImage[];
  popularity: number;
  followers: { total: number };
}

interface RawAudioFeatures {
  id: string;
  danceability: number;
  energy: number;
  valence: number;
  acousticness: number;
  instrumentalness: number;
  speechiness: number;
  liveness: number;
  tempo: number;
  key: number;
  loudness: number;
  mode: number;
  time_signature: number;
  duration_ms: number;
}

function normalizeTrack(t: RawTrack): Track {
  return {
    id: t.id,
    name: t.name,
    artists: t.artists.map((a) => ({ id: a.id, name: a.name })),
    album: {
      id: t.album.id,
      name: t.album.name,
      images: t.album.images as SpotifyImage[],
    },
    durationMs: t.duration_ms,
    uri: t.uri,
    previewUrl: t.preview_url,
    popularity: t.popularity,
    explicit: t.explicit,
  };
}

function normalizeArtist(a: RawArtist): Artist {
  return {
    id: a.id,
    name: a.name,
    genres: a.genres,
    images: a.images as SpotifyImage[],
    popularity: a.popularity,
    followers: a.followers?.total ?? 0,
  };
}

function normalizeAudioFeatures(f: RawAudioFeatures): AudioFeatures {
  return {
    id: f.id,
    danceability: f.danceability,
    energy: f.energy,
    valence: f.valence,
    acousticness: f.acousticness,
    instrumentalness: f.instrumentalness,
    speechiness: f.speechiness,
    liveness: f.liveness,
    tempo: f.tempo,
    key: f.key,
    loudness: f.loudness,
    mode: f.mode,
    timeSignature: f.time_signature,
    durationMs: f.duration_ms,
  };
}

export class SpotifyClient {
  private readonly config: SpotifyConfig;
  private readonly cache: TTLCache<unknown>;

  constructor(config: SpotifyConfig) {
    this.config = config;
    this.cache = new TTLCache(config.cacheTtlSeconds);
  }

  // ---------- PKCE helpers ----------

  static generatePkce(): { verifier: string; challenge: string; state: string } {
    const verifier = randomBase64Url(64);
    const challenge = base64UrlSha256(verifier);
    const state = randomBase64Url(16);
    return { verifier, challenge, state };
  }

  buildAuthUrl(scopes: string, challenge: string, state: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      response_type: 'code',
      redirect_uri: this.config.redirectUri,
      code_challenge_method: 'S256',
      code_challenge: challenge,
      state,
      scope: scopes,
    });
    return `${SPOTIFY_ACCOUNTS}/authorize?${params.toString()}`;
  }

  async exchangeCode(code: string, verifier: string): Promise<TokenResponse> {
    const body = new URLSearchParams({
      client_id: this.config.clientId,
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.config.redirectUri,
      code_verifier: verifier,
    });
    const res = await fetch(`${SPOTIFY_ACCOUNTS}/api/token`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body,
    });
    if (!res.ok) {
      throw new HttpError(res.status, 'token exchange failed', await safeJson(res));
    }
    return (await res.json()) as TokenResponse;
  }

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const body = new URLSearchParams({
      client_id: this.config.clientId,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });
    const res = await fetch(`${SPOTIFY_ACCOUNTS}/api/token`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body,
    });
    if (!res.ok) {
      throw new HttpError(res.status, 'token refresh failed', await safeJson(res));
    }
    return (await res.json()) as TokenResponse;
  }

  // ---------- authenticated request core ----------

  private async authedFetch(
    sessionId: string,
    path: string,
    init: RequestInit = {},
  ): Promise<Response> {
    const session = this.config.sessionStore.get(sessionId);
    if (!session) throw new HttpError(401, 'no session');

    // Proactive refresh if we're within 30s of expiry.
    if (session.expiresAt - Date.now() < 30_000 && session.refreshToken) {
      const refreshed = await this.refreshToken(session.refreshToken);
      this.config.sessionStore.update(sessionId, {
        accessToken: refreshed.access_token,
        expiresAt: Date.now() + refreshed.expires_in * 1000,
        // Spotify sometimes rotates the refresh token; use the new one if given.
        refreshToken: refreshed.refresh_token ?? session.refreshToken,
      });
    }

    const doFetch = async (attempt: number): Promise<Response> => {
      // Re-read the session on every attempt so a refresh inside one call
      // feeds the next attempt the new access token.
      const current = this.config.sessionStore.get(sessionId);
      if (!current) throw new HttpError(401, 'session evaporated');

      const res = await fetch(`${SPOTIFY_API}${path}`, {
        ...init,
        headers: {
          ...(init.headers ?? {}),
          authorization: `Bearer ${current.accessToken}`,
          'content-type': 'application/json',
        },
      });

      if (res.status === 401 && attempt === 0 && current.refreshToken) {
        // Reactive refresh, then retry once.
        const refreshed = await this.refreshToken(current.refreshToken);
        this.config.sessionStore.update(sessionId, {
          accessToken: refreshed.access_token,
          expiresAt: Date.now() + refreshed.expires_in * 1000,
          refreshToken: refreshed.refresh_token ?? current.refreshToken,
        });
        return doFetch(attempt + 1);
      }

      if ((res.status === 429 || res.status >= 500) && attempt < 2) {
        const retryAfter = Number(res.headers.get('retry-after') ?? '1');
        const wait = Math.min(5_000, Math.max(250, retryAfter * 1000) * (attempt + 1));
        await new Promise((r) => setTimeout(r, wait));
        return doFetch(attempt + 1);
      }

      return res;
    };

    return doFetch(0);
  }

  private async getJson<T>(sessionId: string, path: string, cacheKey?: string): Promise<T> {
    if (cacheKey) {
      const hit = this.cache.get(cacheKey);
      if (hit !== undefined) return hit as T;
    }
    const res = await this.authedFetch(sessionId, path);
    if (!res.ok) {
      throw new HttpError(res.status, `spotify GET ${path} failed`, await safeJson(res));
    }
    const json = (await res.json()) as T;
    if (cacheKey) this.cache.set(cacheKey, json);
    return json;
  }

  // ---------- typed endpoints ----------

  async search(sessionId: string, query: string, limit: number): Promise<Track[]> {
    const params = new URLSearchParams({ q: query, type: 'track', limit: String(limit) });
    const data = await this.getJson<{ tracks: { items: RawTrack[] } }>(
      sessionId,
      `/search?${params.toString()}`,
      `search:${query}:${limit}`,
    );
    return data.tracks.items.map(normalizeTrack);
  }

  async audioFeatures(sessionId: string, ids: string[]): Promise<AudioFeatures[]> {
    if (ids.length === 0) return [];
    const cacheKey = `af:${ids.slice().sort().join(',')}`;
    const data = await this.getJson<{ audio_features: (RawAudioFeatures | null)[] }>(
      sessionId,
      `/audio-features?ids=${ids.join(',')}`,
      cacheKey,
    );
    return data.audio_features.filter((f): f is RawAudioFeatures => f !== null).map(normalizeAudioFeatures);
  }

  async recommendations(sessionId: string, seedTracks: string[], limit: number): Promise<Track[]> {
    const params = new URLSearchParams({
      seed_tracks: seedTracks.slice(0, 5).join(','),
      limit: String(limit),
    });
    const data = await this.getJson<{ tracks: RawTrack[] }>(
      sessionId,
      `/recommendations?${params.toString()}`,
      `recs:${seedTracks.join(',')}:${limit}`,
    );
    return data.tracks.map(normalizeTrack);
  }

  async topTracks(sessionId: string, range: TimeRange, limit = 20): Promise<Track[]> {
    const params = new URLSearchParams({ time_range: range, limit: String(limit) });
    const data = await this.getJson<{ items: RawTrack[] }>(
      sessionId,
      `/me/top/tracks?${params.toString()}`,
      `top-tracks:${range}:${limit}`,
    );
    return data.items.map(normalizeTrack);
  }

  async topArtists(sessionId: string, range: TimeRange, limit = 10): Promise<Artist[]> {
    const params = new URLSearchParams({ time_range: range, limit: String(limit) });
    const data = await this.getJson<{ items: RawArtist[] }>(
      sessionId,
      `/me/top/artists?${params.toString()}`,
      `top-artists:${range}:${limit}`,
    );
    return data.items.map(normalizeArtist);
  }

  async currentlyPlaying(sessionId: string): Promise<CurrentlyPlaying> {
    const res = await this.authedFetch(sessionId, '/me/player/currently-playing');
    if (res.status === 204) {
      return { isPlaying: false, progressMs: 0, track: null };
    }
    if (!res.ok) {
      throw new HttpError(res.status, 'currently-playing failed', await safeJson(res));
    }
    const data = (await res.json()) as {
      is_playing: boolean;
      progress_ms: number | null;
      item: RawTrack | null;
    };
    return {
      isPlaying: Boolean(data.is_playing),
      progressMs: data.progress_ms ?? 0,
      track: data.item ? normalizeTrack(data.item) : null,
    };
  }

  async me(sessionId: string): Promise<{ id: string; displayName: string; images: SpotifyImage[] }> {
    const data = await this.getJson<{
      id: string;
      display_name: string;
      images: RawImage[];
    }>(sessionId, '/me');
    return {
      id: data.id,
      displayName: data.display_name,
      images: data.images as SpotifyImage[],
    };
  }

  async createPlaylist(
    sessionId: string,
    userId: string,
    name: string,
    description: string,
    trackUris: string[],
  ): Promise<{ id: string; url: string }> {
    const createRes = await this.authedFetch(sessionId, `/users/${userId}/playlists`, {
      method: 'POST',
      body: JSON.stringify({ name, description, public: false }),
    });
    if (!createRes.ok) {
      throw new HttpError(createRes.status, 'create playlist failed', await safeJson(createRes));
    }
    const created = (await createRes.json()) as {
      id: string;
      external_urls: { spotify: string };
    };
    if (trackUris.length > 0) {
      // Spotify caps at 100 URIs per add; chunk if needed.
      for (let i = 0; i < trackUris.length; i += 100) {
        const chunk = trackUris.slice(i, i + 100);
        const addRes = await this.authedFetch(sessionId, `/playlists/${created.id}/tracks`, {
          method: 'POST',
          body: JSON.stringify({ uris: chunk }),
        });
        if (!addRes.ok) {
          throw new HttpError(addRes.status, 'add tracks failed', await safeJson(addRes));
        }
      }
    }
    return { id: created.id, url: created.external_urls.spotify };
  }
}

// ---------- helpers ----------

function randomBase64Url(bytes: number): string {
  return randomBytes(bytes).toString('base64url');
}

function base64UrlSha256(input: string): string {
  return createHash('sha256').update(input).digest('base64url');
}

async function safeJson(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return undefined;
  }
}
