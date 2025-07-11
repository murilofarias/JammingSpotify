import { describe, expect, it } from 'vitest';
import {
  fixtureAudioFeatures,
  fixtureAudioFeaturesByIds,
  fixtureCurrentlyPlaying,
  fixtureRecommendations,
  fixtureSearch,
  fixtureTopArtists,
  fixtureTopTracks,
  fixtureTracks,
} from '../services/fixtures.js';

describe('fixtures shape', () => {
  it('exposes ~30 tracks with matching audio features', () => {
    expect(fixtureTracks.length).toBeGreaterThanOrEqual(28);
    expect(fixtureTracks.length).toBeLessThanOrEqual(40);
    expect(fixtureAudioFeatures.length).toBe(fixtureTracks.length);
    const trackIds = new Set(fixtureTracks.map((t) => t.id));
    for (const f of fixtureAudioFeatures) {
      expect(trackIds.has(f.id)).toBe(true);
    }
  });

  it('audio features are in valid ranges', () => {
    for (const f of fixtureAudioFeatures) {
      expect(f.danceability).toBeGreaterThanOrEqual(0);
      expect(f.danceability).toBeLessThanOrEqual(1);
      expect(f.energy).toBeGreaterThanOrEqual(0);
      expect(f.energy).toBeLessThanOrEqual(1);
      expect(f.valence).toBeGreaterThanOrEqual(0);
      expect(f.valence).toBeLessThanOrEqual(1);
      expect(f.tempo).toBeGreaterThan(40);
      expect(f.tempo).toBeLessThan(220);
    }
  });

  it('search returns matching tracks', () => {
    const hits = fixtureSearch('neon', 5);
    expect(hits.length).toBeGreaterThan(0);
    for (const t of hits) {
      expect(t.name.toLowerCase()).toMatch(/neon/);
    }
  });

  it('search falls back to a stable slice on empty match', () => {
    const hits = fixtureSearch('zzzzzzz_no_such_track', 5);
    expect(hits.length).toBeGreaterThan(0);
  });

  it('recommendations exclude seed tracks', () => {
    const seed = [fixtureTracks[0]!.id, fixtureTracks[1]!.id];
    const recs = fixtureRecommendations(seed, 10);
    const recIds = new Set(recs.map((r) => r.id));
    for (const s of seed) expect(recIds.has(s)).toBe(false);
  });

  it('top tracks rotate per time range', () => {
    const short = fixtureTopTracks('short_term', 5).map((t) => t.id);
    const long = fixtureTopTracks('long_term', 5).map((t) => t.id);
    expect(short).not.toEqual(long);
  });

  it('top artists rotate per time range', () => {
    const short = fixtureTopArtists('short_term', 4).map((a) => a.id);
    const long = fixtureTopArtists('long_term', 4).map((a) => a.id);
    expect(short).not.toEqual(long);
  });

  it('currently playing returns a track', () => {
    const cp = fixtureCurrentlyPlaying();
    expect(cp.isPlaying).toBe(true);
    expect(cp.track).not.toBeNull();
  });

  it('audio features by ids filters unknowns', () => {
    const got = fixtureAudioFeaturesByIds([
      fixtureTracks[0]!.id,
      'does_not_exist',
      fixtureTracks[3]!.id,
    ]);
    expect(got.length).toBe(2);
  });
});
