/**
 * Shared backend type definitions. These mirror the subset of the Spotify Web API
 * response shapes that the frontend actually consumes, keeping the wire format
 * small and stable regardless of upstream API drift.
 */

export interface SpotifyImage {
  url: string;
  width: number | null;
  height: number | null;
}

export interface SpotifyArtistLite {
  id: string;
  name: string;
}

export interface Track {
  id: string;
  name: string;
  artists: SpotifyArtistLite[];
  album: {
    id: string;
    name: string;
    images: SpotifyImage[];
  };
  durationMs: number;
  uri: string;
  previewUrl: string | null;
  popularity: number;
  explicit: boolean;
}

export interface Artist {
  id: string;
  name: string;
  genres: string[];
  images: SpotifyImage[];
  popularity: number;
  followers: number;
}

export interface AudioFeatures {
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
  timeSignature: number;
  durationMs: number;
}

export interface CurrentlyPlaying {
  isPlaying: boolean;
  progressMs: number;
  track: Track | null;
}

export type TimeRange = 'short_term' | 'medium_term' | 'long_term';

export interface SessionData {
  id: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // epoch ms
  userId: string | null;
}

export interface VibeResult {
  mood: string; // e.g. "chill · focus · uplifting"
  tags: string[]; // raw tokens
  explanation: string;
  averages: {
    danceability: number;
    energy: number;
    valence: number;
    acousticness: number;
    instrumentalness: number;
    speechiness: number;
    tempo: number;
  };
}

export class HttpError extends Error {
  public readonly status: number;
  public readonly details: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
    this.name = 'HttpError';
  }
}
