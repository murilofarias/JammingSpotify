import { describe, expect, it } from 'vitest';
import { averageFeatures, buildVibe, scoreTags } from '../services/vibe.js';
import type { AudioFeatures } from '../types.js';

function feature(overrides: Partial<AudioFeatures>): AudioFeatures {
  return {
    id: 'x',
    danceability: 0.5,
    energy: 0.5,
    valence: 0.5,
    acousticness: 0.5,
    instrumentalness: 0.5,
    speechiness: 0.05,
    liveness: 0.1,
    tempo: 100,
    key: 0,
    loudness: -8,
    mode: 1,
    timeSignature: 4,
    durationMs: 200_000,
    ...overrides,
  };
}

describe('vibe engine', () => {
  it('handles empty feature arrays gracefully', () => {
    const v = buildVibe([]);
    expect(v.tags).toEqual(['empty', 'silent', 'unknown']);
    expect(v.averages.energy).toBe(0);
    expect(v.explanation).toMatch(/add tracks/i);
  });

  it('labels a chill playlist as chill/dreamy/acoustic', () => {
    const tracks = [
      feature({ energy: 0.2, danceability: 0.3, valence: 0.4, acousticness: 0.85, instrumentalness: 0.9, tempo: 72 }),
      feature({ energy: 0.15, danceability: 0.25, valence: 0.35, acousticness: 0.88, instrumentalness: 0.92, tempo: 70 }),
    ];
    const v = buildVibe(tracks);
    expect(v.tags).toContain('chill');
    expect(v.tags).not.toContain('hype');
  });

  it('labels a hype playlist as hype/driving/groovy', () => {
    const tracks = [
      feature({ energy: 0.92, danceability: 0.88, valence: 0.8, tempo: 140, instrumentalness: 0.05 }),
      feature({ energy: 0.9, danceability: 0.85, valence: 0.78, tempo: 138, instrumentalness: 0.03 }),
    ];
    const v = buildVibe(tracks);
    expect(v.tags[0]).toBe('hype');
    expect(v.tags).toContain('driving');
  });

  it('labels a focus playlist as focus-leaning when instrumental + low speech', () => {
    const tracks = [
      feature({ energy: 0.45, instrumentalness: 0.95, speechiness: 0.02, valence: 0.4 }),
      feature({ energy: 0.5, instrumentalness: 0.92, speechiness: 0.03, valence: 0.45 }),
    ];
    const v = buildVibe(tracks);
    expect(v.tags).toContain('focus');
  });

  it('produces different outputs for different inputs', () => {
    const chill = buildVibe([feature({ energy: 0.1, acousticness: 0.9, tempo: 60 })]);
    const hype = buildVibe([feature({ energy: 0.95, danceability: 0.9, tempo: 145 })]);
    expect(chill.mood).not.toBe(hype.mood);
  });

  it('averageFeatures computes per-field means', () => {
    const avg = averageFeatures([
      feature({ energy: 0.2, tempo: 80 }),
      feature({ energy: 0.8, tempo: 120 }),
    ]);
    expect(avg.energy).toBeCloseTo(0.5, 3);
    expect(avg.tempo).toBeCloseTo(100, 1);
  });

  it('scoreTags ranks deterministically for ties', () => {
    const tags1 = scoreTags(averageFeatures([feature({})]));
    const tags2 = scoreTags(averageFeatures([feature({})]));
    expect(tags1.map((t) => t.token)).toEqual(tags2.map((t) => t.token));
  });

  it('clamps bad inputs without throwing', () => {
    const v = buildVibe([feature({ energy: 2, valence: -1, acousticness: Number.NaN })]);
    expect(v.tags.length).toBe(3);
  });
});
