/**
 * Deterministic fixture data used when SPOTIFY_FIXTURE_MODE=true.
 *
 * This covers ~30 tracks across 6 genres (indie-electro, lo-fi hip-hop, synth-pop,
 * house, ambient, jazz-fusion) with realistic audio-feature ranges, plus 4 artists,
 * a recommendations response, top-tracks / top-artists per time range, and a
 * currently-playing snapshot.
 */

import type {
  Artist,
  AudioFeatures,
  CurrentlyPlaying,
  TimeRange,
  Track,
} from '../types.js';

const img = (url: string): Track['album']['images'] => [
  { url, width: 640, height: 640 },
  { url, width: 300, height: 300 },
  { url, width: 64, height: 64 },
];

// Neutral placeholder covers (unique solid-color SVGs data URIs) so the UI has
// something to render in fixture mode without hot-linking album art.
const cover = (hue: number): string =>
  `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 640'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='hsl(${hue}, 70%, 55%)'/><stop offset='100%' stop-color='hsl(${(hue + 40) % 360}, 70%, 25%)'/></linearGradient></defs><rect width='640' height='640' fill='url(%23g)'/></svg>`;

export const fixtureArtists: Artist[] = [
  {
    id: 'art_aurora',
    name: 'Aurora Vale',
    genres: ['indie-electro', 'dream pop'],
    images: [{ url: cover(210), width: 640, height: 640 }],
    popularity: 71,
    followers: 284_512,
  },
  {
    id: 'art_midnightcafe',
    name: 'Midnight Cafe',
    genres: ['lo-fi hip-hop', 'chillhop'],
    images: [{ url: cover(30), width: 640, height: 640 }],
    popularity: 64,
    followers: 112_980,
  },
  {
    id: 'art_parallax',
    name: 'Parallax',
    genres: ['synth-pop', 'indietronica'],
    images: [{ url: cover(285), width: 640, height: 640 }],
    popularity: 78,
    followers: 512_330,
  },
  {
    id: 'art_stelladrive',
    name: 'Stella Drive',
    genres: ['house', 'deep house'],
    images: [{ url: cover(140), width: 640, height: 640 }],
    popularity: 69,
    followers: 201_045,
  },
];

interface SeedTrack {
  id: string;
  title: string;
  artistId: string;
  albumName: string;
  durationMs: number;
  popularity: number;
  hue: number;
  features: Omit<AudioFeatures, 'id' | 'durationMs'>;
}

const seeds: SeedTrack[] = [
  // --- indie-electro (Aurora Vale) ---
  {
    id: 'tr_001',
    title: 'Glass Horizons',
    artistId: 'art_aurora',
    albumName: 'Glass Horizons',
    durationMs: 214_000,
    popularity: 68,
    hue: 210,
    features: {
      danceability: 0.62,
      energy: 0.58,
      valence: 0.55,
      acousticness: 0.18,
      instrumentalness: 0.12,
      speechiness: 0.05,
      liveness: 0.11,
      tempo: 112,
      key: 5,
      loudness: -7.2,
      mode: 1,
      timeSignature: 4,
    },
  },
  {
    id: 'tr_002',
    title: 'Northern Lantern',
    artistId: 'art_aurora',
    albumName: 'Glass Horizons',
    durationMs: 238_000,
    popularity: 61,
    hue: 215,
    features: {
      danceability: 0.48,
      energy: 0.44,
      valence: 0.42,
      acousticness: 0.35,
      instrumentalness: 0.2,
      speechiness: 0.04,
      liveness: 0.13,
      tempo: 96,
      key: 9,
      loudness: -9.1,
      mode: 0,
      timeSignature: 4,
    },
  },
  {
    id: 'tr_003',
    title: 'Paper Cities',
    artistId: 'art_aurora',
    albumName: 'Paper Cities - EP',
    durationMs: 201_000,
    popularity: 72,
    hue: 205,
    features: {
      danceability: 0.7,
      energy: 0.67,
      valence: 0.66,
      acousticness: 0.12,
      instrumentalness: 0.05,
      speechiness: 0.06,
      liveness: 0.09,
      tempo: 118,
      key: 2,
      loudness: -6.3,
      mode: 1,
      timeSignature: 4,
    },
  },
  {
    id: 'tr_004',
    title: 'Static Bloom',
    artistId: 'art_aurora',
    albumName: 'Paper Cities - EP',
    durationMs: 227_000,
    popularity: 58,
    hue: 220,
    features: {
      danceability: 0.55,
      energy: 0.52,
      valence: 0.48,
      acousticness: 0.22,
      instrumentalness: 0.18,
      speechiness: 0.04,
      liveness: 0.1,
      tempo: 104,
      key: 7,
      loudness: -8.0,
      mode: 1,
      timeSignature: 4,
    },
  },
  {
    id: 'tr_005',
    title: 'Neon Wave',
    artistId: 'art_aurora',
    albumName: 'Paper Cities - EP',
    durationMs: 198_000,
    popularity: 66,
    hue: 200,
    features: {
      danceability: 0.73,
      energy: 0.71,
      valence: 0.72,
      acousticness: 0.09,
      instrumentalness: 0.07,
      speechiness: 0.05,
      liveness: 0.08,
      tempo: 122,
      key: 4,
      loudness: -5.9,
      mode: 1,
      timeSignature: 4,
    },
  },

  // --- lo-fi hip-hop (Midnight Cafe) ---
  {
    id: 'tr_010',
    title: 'Rain on Platform 9',
    artistId: 'art_midnightcafe',
    albumName: 'Slow Hours',
    durationMs: 168_000,
    popularity: 74,
    hue: 30,
    features: {
      danceability: 0.6,
      energy: 0.31,
      valence: 0.4,
      acousticness: 0.62,
      instrumentalness: 0.82,
      speechiness: 0.04,
      liveness: 0.1,
      tempo: 80,
      key: 0,
      loudness: -12.4,
      mode: 1,
      timeSignature: 4,
    },
  },
  {
    id: 'tr_011',
    title: 'Lamplight Study',
    artistId: 'art_midnightcafe',
    albumName: 'Slow Hours',
    durationMs: 182_000,
    popularity: 70,
    hue: 35,
    features: {
      danceability: 0.58,
      energy: 0.27,
      valence: 0.38,
      acousticness: 0.7,
      instrumentalness: 0.88,
      speechiness: 0.03,
      liveness: 0.09,
      tempo: 76,
      key: 3,
      loudness: -13.1,
      mode: 0,
      timeSignature: 4,
    },
  },
  {
    id: 'tr_012',
    title: 'Coffee Steam',
    artistId: 'art_midnightcafe',
    albumName: 'Slow Hours',
    durationMs: 175_000,
    popularity: 76,
    hue: 25,
    features: {
      danceability: 0.63,
      energy: 0.34,
      valence: 0.5,
      acousticness: 0.56,
      instrumentalness: 0.78,
      speechiness: 0.04,
      liveness: 0.08,
      tempo: 82,
      key: 5,
      loudness: -11.8,
      mode: 1,
      timeSignature: 4,
    },
  },
  {
    id: 'tr_013',
    title: 'Midnight Pages',
    artistId: 'art_midnightcafe',
    albumName: 'Slow Hours II',
    durationMs: 192_000,
    popularity: 68,
    hue: 40,
    features: {
      danceability: 0.55,
      energy: 0.24,
      valence: 0.35,
      acousticness: 0.74,
      instrumentalness: 0.9,
      speechiness: 0.03,
      liveness: 0.07,
      tempo: 72,
      key: 7,
      loudness: -14.0,
      mode: 0,
      timeSignature: 4,
    },
  },
  {
    id: 'tr_014',
    title: 'Quiet Avenue',
    artistId: 'art_midnightcafe',
    albumName: 'Slow Hours II',
    durationMs: 188_000,
    popularity: 65,
    hue: 45,
    features: {
      danceability: 0.57,
      energy: 0.29,
      valence: 0.43,
      acousticness: 0.65,
      instrumentalness: 0.85,
      speechiness: 0.03,
      liveness: 0.09,
      tempo: 78,
      key: 10,
      loudness: -12.7,
      mode: 1,
      timeSignature: 4,
    },
  },

  // --- synth-pop (Parallax) ---
  {
    id: 'tr_020',
    title: 'Chromatic Kids',
    artistId: 'art_parallax',
    albumName: 'Chromatic',
    durationMs: 226_000,
    popularity: 82,
    hue: 285,
    features: {
      danceability: 0.78,
      energy: 0.82,
      valence: 0.79,
      acousticness: 0.05,
      instrumentalness: 0.02,
      speechiness: 0.06,
      liveness: 0.12,
      tempo: 126,
      key: 2,
      loudness: -4.8,
      mode: 1,
      timeSignature: 4,
    },
  },
  {
    id: 'tr_021',
    title: 'VHS Heart',
    artistId: 'art_parallax',
    albumName: 'Chromatic',
    durationMs: 208_000,
    popularity: 79,
    hue: 290,
    features: {
      danceability: 0.75,
      energy: 0.77,
      valence: 0.74,
      acousticness: 0.07,
      instrumentalness: 0.03,
      speechiness: 0.05,
      liveness: 0.11,
      tempo: 122,
      key: 4,
      loudness: -5.1,
      mode: 1,
      timeSignature: 4,
    },
  },
  {
    id: 'tr_022',
    title: 'Stereo Sunset',
    artistId: 'art_parallax',
    albumName: 'Chromatic',
    durationMs: 221_000,
    popularity: 77,
    hue: 295,
    features: {
      danceability: 0.8,
      energy: 0.75,
      valence: 0.81,
      acousticness: 0.06,
      instrumentalness: 0.02,
      speechiness: 0.05,
      liveness: 0.1,
      tempo: 120,
      key: 6,
      loudness: -5.3,
      mode: 1,
      timeSignature: 4,
    },
  },
  {
    id: 'tr_023',
    title: 'Neon Rain',
    artistId: 'art_parallax',
    albumName: 'Afterlight',
    durationMs: 234_000,
    popularity: 73,
    hue: 300,
    features: {
      danceability: 0.72,
      energy: 0.8,
      valence: 0.66,
      acousticness: 0.04,
      instrumentalness: 0.03,
      speechiness: 0.06,
      liveness: 0.13,
      tempo: 128,
      key: 1,
      loudness: -4.6,
      mode: 0,
      timeSignature: 4,
    },
  },
  {
    id: 'tr_024',
    title: 'Television Heart',
    artistId: 'art_parallax',
    albumName: 'Afterlight',
    durationMs: 213_000,
    popularity: 75,
    hue: 305,
    features: {
      danceability: 0.77,
      energy: 0.79,
      valence: 0.75,
      acousticness: 0.05,
      instrumentalness: 0.02,
      speechiness: 0.05,
      liveness: 0.1,
      tempo: 124,
      key: 8,
      loudness: -4.9,
      mode: 1,
      timeSignature: 4,
    },
  },

  // --- house (Stella Drive) ---
  {
    id: 'tr_030',
    title: 'Harbour Lights',
    artistId: 'art_stelladrive',
    albumName: 'Harbour',
    durationMs: 325_000,
    popularity: 70,
    hue: 140,
    features: {
      danceability: 0.86,
      energy: 0.84,
      valence: 0.7,
      acousticness: 0.03,
      instrumentalness: 0.35,
      speechiness: 0.04,
      liveness: 0.09,
      tempo: 124,
      key: 9,
      loudness: -5.0,
      mode: 1,
      timeSignature: 4,
    },
  },
  {
    id: 'tr_031',
    title: 'Ocean Drive (Extended)',
    artistId: 'art_stelladrive',
    albumName: 'Harbour',
    durationMs: 402_000,
    popularity: 66,
    hue: 150,
    features: {
      danceability: 0.88,
      energy: 0.82,
      valence: 0.73,
      acousticness: 0.02,
      instrumentalness: 0.5,
      speechiness: 0.03,
      liveness: 0.08,
      tempo: 122,
      key: 11,
      loudness: -4.8,
      mode: 1,
      timeSignature: 4,
    },
  },
  {
    id: 'tr_032',
    title: 'Saltwater',
    artistId: 'art_stelladrive',
    albumName: 'Harbour',
    durationMs: 348_000,
    popularity: 64,
    hue: 160,
    features: {
      danceability: 0.82,
      energy: 0.78,
      valence: 0.68,
      acousticness: 0.04,
      instrumentalness: 0.3,
      speechiness: 0.04,
      liveness: 0.1,
      tempo: 120,
      key: 4,
      loudness: -5.2,
      mode: 1,
      timeSignature: 4,
    },
  },
  {
    id: 'tr_033',
    title: 'Marina',
    artistId: 'art_stelladrive',
    albumName: 'Transit',
    durationMs: 298_000,
    popularity: 62,
    hue: 170,
    features: {
      danceability: 0.84,
      energy: 0.86,
      valence: 0.64,
      acousticness: 0.02,
      instrumentalness: 0.4,
      speechiness: 0.03,
      liveness: 0.09,
      tempo: 126,
      key: 2,
      loudness: -4.7,
      mode: 1,
      timeSignature: 4,
    },
  },
  {
    id: 'tr_034',
    title: 'Causeway',
    artistId: 'art_stelladrive',
    albumName: 'Transit',
    durationMs: 366_000,
    popularity: 60,
    hue: 180,
    features: {
      danceability: 0.85,
      energy: 0.8,
      valence: 0.66,
      acousticness: 0.03,
      instrumentalness: 0.45,
      speechiness: 0.03,
      liveness: 0.08,
      tempo: 123,
      key: 7,
      loudness: -5.0,
      mode: 0,
      timeSignature: 4,
    },
  },

  // --- ambient (Aurora Vale alt) ---
  {
    id: 'tr_040',
    title: 'Dust Motes',
    artistId: 'art_aurora',
    albumName: 'Soft Machines',
    durationMs: 312_000,
    popularity: 52,
    hue: 260,
    features: {
      danceability: 0.2,
      energy: 0.18,
      valence: 0.28,
      acousticness: 0.86,
      instrumentalness: 0.94,
      speechiness: 0.03,
      liveness: 0.1,
      tempo: 68,
      key: 6,
      loudness: -16.2,
      mode: 0,
      timeSignature: 4,
    },
  },
  {
    id: 'tr_041',
    title: 'Long Exposure',
    artistId: 'art_aurora',
    albumName: 'Soft Machines',
    durationMs: 381_000,
    popularity: 49,
    hue: 250,
    features: {
      danceability: 0.22,
      energy: 0.15,
      valence: 0.24,
      acousticness: 0.9,
      instrumentalness: 0.96,
      speechiness: 0.03,
      liveness: 0.09,
      tempo: 62,
      key: 3,
      loudness: -18.0,
      mode: 0,
      timeSignature: 3,
    },
  },
  {
    id: 'tr_042',
    title: 'Blue Hour',
    artistId: 'art_aurora',
    albumName: 'Soft Machines',
    durationMs: 268_000,
    popularity: 55,
    hue: 240,
    features: {
      danceability: 0.25,
      energy: 0.2,
      valence: 0.32,
      acousticness: 0.82,
      instrumentalness: 0.92,
      speechiness: 0.03,
      liveness: 0.08,
      tempo: 70,
      key: 8,
      loudness: -15.5,
      mode: 1,
      timeSignature: 4,
    },
  },

  // --- jazz-fusion (Parallax alt) ---
  {
    id: 'tr_050',
    title: 'Cobalt Breakfast',
    artistId: 'art_parallax',
    albumName: 'Late Session',
    durationMs: 289_000,
    popularity: 57,
    hue: 95,
    features: {
      danceability: 0.5,
      energy: 0.55,
      valence: 0.6,
      acousticness: 0.45,
      instrumentalness: 0.75,
      speechiness: 0.04,
      liveness: 0.22,
      tempo: 108,
      key: 2,
      loudness: -8.4,
      mode: 1,
      timeSignature: 4,
    },
  },
  {
    id: 'tr_051',
    title: 'Velvet Counter',
    artistId: 'art_parallax',
    albumName: 'Late Session',
    durationMs: 303_000,
    popularity: 54,
    hue: 105,
    features: {
      danceability: 0.52,
      energy: 0.58,
      valence: 0.65,
      acousticness: 0.4,
      instrumentalness: 0.7,
      speechiness: 0.04,
      liveness: 0.25,
      tempo: 112,
      key: 5,
      loudness: -8.1,
      mode: 1,
      timeSignature: 4,
    },
  },
  {
    id: 'tr_052',
    title: 'Key Change',
    artistId: 'art_parallax',
    albumName: 'Late Session',
    durationMs: 275_000,
    popularity: 59,
    hue: 115,
    features: {
      danceability: 0.55,
      energy: 0.6,
      valence: 0.68,
      acousticness: 0.38,
      instrumentalness: 0.72,
      speechiness: 0.04,
      liveness: 0.2,
      tempo: 116,
      key: 10,
      loudness: -7.8,
      mode: 1,
      timeSignature: 4,
    },
  },

  // --- bonus indie-electro to round out 30 ---
  {
    id: 'tr_060',
    title: 'Silent Disco',
    artistId: 'art_stelladrive',
    albumName: 'Transit',
    durationMs: 244_000,
    popularity: 63,
    hue: 190,
    features: {
      danceability: 0.83,
      energy: 0.75,
      valence: 0.62,
      acousticness: 0.05,
      instrumentalness: 0.35,
      speechiness: 0.04,
      liveness: 0.1,
      tempo: 121,
      key: 0,
      loudness: -5.5,
      mode: 1,
      timeSignature: 4,
    },
  },
  {
    id: 'tr_061',
    title: 'Low Orbit',
    artistId: 'art_aurora',
    albumName: 'Glass Horizons',
    durationMs: 219_000,
    popularity: 60,
    hue: 225,
    features: {
      danceability: 0.6,
      energy: 0.56,
      valence: 0.5,
      acousticness: 0.2,
      instrumentalness: 0.15,
      speechiness: 0.05,
      liveness: 0.11,
      tempo: 110,
      key: 11,
      loudness: -7.5,
      mode: 0,
      timeSignature: 4,
    },
  },
];

function artistLite(artistId: string): { id: string; name: string }[] {
  const a = fixtureArtists.find((x) => x.id === artistId);
  return a ? [{ id: a.id, name: a.name }] : [];
}

export const fixtureTracks: Track[] = seeds.map((s) => ({
  id: s.id,
  name: s.title,
  artists: artistLite(s.artistId),
  album: {
    id: `alb_${s.id}`,
    name: s.albumName,
    images: img(cover(s.hue)),
  },
  durationMs: s.durationMs,
  uri: `spotify:track:${s.id}`,
  previewUrl: null,
  popularity: s.popularity,
  explicit: false,
}));

export const fixtureAudioFeatures: AudioFeatures[] = seeds.map((s) => ({
  id: s.id,
  durationMs: s.durationMs,
  ...s.features,
}));

export function fixtureSearch(query: string, limit: number): Track[] {
  const q = query.trim().toLowerCase();
  if (!q) return fixtureTracks.slice(0, limit);
  const matches = fixtureTracks.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.album.name.toLowerCase().includes(q) ||
      t.artists.some((a) => a.name.toLowerCase().includes(q)),
  );
  if (matches.length > 0) return matches.slice(0, limit);
  // fall back to a stable slice so the UI always has something to render
  return fixtureTracks.slice(0, Math.min(limit, 8));
}

export function fixtureRecommendations(seedTrackIds: string[], limit: number): Track[] {
  // Pick tracks NOT in the seed list, biased toward similar genres by sharing an
  // artist or neighboring hue in the seed ordering. Deterministic given inputs.
  const seedSet = new Set(seedTrackIds);
  const pool = fixtureTracks.filter((t) => !seedSet.has(t.id));
  if (seedTrackIds.length === 0) return pool.slice(0, limit);
  const seedArtists = new Set(
    fixtureTracks
      .filter((t) => seedSet.has(t.id))
      .flatMap((t) => t.artists.map((a) => a.id)),
  );
  const scored = pool
    .map((t) => {
      const sharesArtist = t.artists.some((a) => seedArtists.has(a.id));
      return { t, score: sharesArtist ? 2 : 1 };
    })
    .sort((a, b) => b.score - a.score || a.t.id.localeCompare(b.t.id));
  return scored.slice(0, limit).map((x) => x.t);
}

export function fixtureTopTracks(range: TimeRange, limit = 20): Track[] {
  // Rotate the ordering based on time range so the three toggles feel distinct.
  const offsets: Record<TimeRange, number> = {
    short_term: 0,
    medium_term: 7,
    long_term: 14,
  };
  const offset = offsets[range];
  const rotated = [...fixtureTracks.slice(offset), ...fixtureTracks.slice(0, offset)];
  return rotated.slice(0, limit);
}

export function fixtureTopArtists(range: TimeRange, limit = 10): Artist[] {
  const offsets: Record<TimeRange, number> = {
    short_term: 0,
    medium_term: 1,
    long_term: 2,
  };
  const offset = offsets[range];
  const rotated = [
    ...fixtureArtists.slice(offset),
    ...fixtureArtists.slice(0, offset),
  ];
  return rotated.slice(0, limit);
}

export function fixtureCurrentlyPlaying(): CurrentlyPlaying {
  const track = fixtureTracks.find((t) => t.id === 'tr_020') ?? fixtureTracks[0] ?? null;
  return {
    isPlaying: true,
    progressMs: 48_300,
    track,
  };
}

export function fixtureAudioFeaturesByIds(ids: string[]): AudioFeatures[] {
  return ids
    .map((id) => fixtureAudioFeatures.find((f) => f.id === id))
    .filter((f): f is AudioFeatures => Boolean(f));
}

export const fixtureUser = {
  id: 'demo_user',
  displayName: 'Demo Listener',
  images: [{ url: cover(340), width: 320, height: 320 }],
};
