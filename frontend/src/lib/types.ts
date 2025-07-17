/**
 * Frontend-side types mirror the backend's `types.ts`. Kept as a separate copy
 * (instead of a shared package) because the two apps deploy independently and
 * a shared package would drag a build tool into what is currently a simple
 * monorepo.
 */

export interface SpotifyImage {
  url: string;
  width: number | null;
  height: number | null;
}

export interface ArtistLite {
  id: string;
  name: string;
}

export interface Track {
  id: string;
  name: string;
  artists: ArtistLite[];
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

export interface Me {
  id: string;
  displayName: string;
  images: SpotifyImage[];
}

export interface VibeResult {
  mood: string;
  tags: string[];
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

export interface AuthStatus {
  authenticated: boolean;
  fixtureMode: boolean;
}
