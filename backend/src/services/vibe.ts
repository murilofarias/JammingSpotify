/**
 * Pure, deterministic vibe-fingerprint engine.
 *
 * Takes an array of audio features and produces a 3-word "mood" label plus a
 * short human-readable explanation. No LLM: just rule-based scoring over the
 * averaged features, which makes the output reproducible and unit-testable.
 */

import type { AudioFeatures, VibeResult } from '../types.js';

interface Tag {
  token: string;
  score: number;
  blurb: string;
}

export function averageFeatures(features: AudioFeatures[]): VibeResult['averages'] {
  if (features.length === 0) {
    return {
      danceability: 0,
      energy: 0,
      valence: 0,
      acousticness: 0,
      instrumentalness: 0,
      speechiness: 0,
      tempo: 0,
    };
  }
  const n = features.length;
  const sum = features.reduce(
    (acc, f) => {
      acc.danceability += f.danceability;
      acc.energy += f.energy;
      acc.valence += f.valence;
      acc.acousticness += f.acousticness;
      acc.instrumentalness += f.instrumentalness;
      acc.speechiness += f.speechiness;
      acc.tempo += f.tempo;
      return acc;
    },
    {
      danceability: 0,
      energy: 0,
      valence: 0,
      acousticness: 0,
      instrumentalness: 0,
      speechiness: 0,
      tempo: 0,
    },
  );
  return {
    danceability: round(sum.danceability / n),
    energy: round(sum.energy / n),
    valence: round(sum.valence / n),
    acousticness: round(sum.acousticness / n),
    instrumentalness: round(sum.instrumentalness / n),
    speechiness: round(sum.speechiness / n),
    tempo: round(sum.tempo / n, 1),
  };
}

function round(n: number, digits = 3): number {
  const p = 10 ** digits;
  return Math.round(n * p) / p;
}

/**
 * Score a collection of candidate tags against the averages. Each rule returns
 * a score in [0, 1]; tags with score >= threshold are eligible for the final
 * 3-word label. Tags are ranked by score (descending) with a deterministic
 * tiebreaker on the token name.
 */
export function scoreTags(avg: VibeResult['averages']): Tag[] {
  const tags: Tag[] = [];

  // chill: low energy, moderate-high acousticness/instrumentalness
  tags.push({
    token: 'chill',
    score:
      clamp(1 - avg.energy) * 0.5 +
      clamp(avg.acousticness) * 0.25 +
      clamp(avg.instrumentalness) * 0.25,
    blurb: 'low-energy, mellow textures',
  });

  // hype: high energy + high danceability
  tags.push({
    token: 'hype',
    score: clamp(avg.energy) * 0.6 + clamp(avg.danceability) * 0.4,
    blurb: 'high energy and dance-forward',
  });

  // focus: high instrumentalness + low speechiness + moderate energy
  tags.push({
    token: 'focus',
    score:
      clamp(avg.instrumentalness) * 0.5 +
      clamp(1 - avg.speechiness) * 0.25 +
      clamp(1 - Math.abs(avg.energy - 0.45) * 2) * 0.25,
    blurb: 'mostly instrumental, easy to concentrate to',
  });

  // uplifting: high valence
  tags.push({
    token: 'uplifting',
    score: clamp(avg.valence),
    blurb: 'bright, positive mood',
  });

  // moody: low valence + moderate energy
  tags.push({
    token: 'moody',
    score: clamp(1 - avg.valence) * 0.7 + clamp(avg.energy) * 0.3,
    blurb: 'darker emotional tone',
  });

  // dreamy: high acousticness + low energy + moderate valence
  tags.push({
    token: 'dreamy',
    score:
      clamp(avg.acousticness) * 0.5 +
      clamp(1 - avg.energy) * 0.3 +
      clamp(avg.valence) * 0.2,
    blurb: 'soft, floating, reverb-y',
  });

  // driving: fast tempo + high energy
  tags.push({
    token: 'driving',
    score: clamp((avg.tempo - 100) / 60) * 0.5 + clamp(avg.energy) * 0.5,
    blurb: 'fast tempo, forward momentum',
  });

  // groovy: high danceability, moderate energy, moderate valence
  tags.push({
    token: 'groovy',
    score:
      clamp(avg.danceability) * 0.6 +
      clamp(1 - Math.abs(avg.energy - 0.65) * 2) * 0.2 +
      clamp(avg.valence) * 0.2,
    blurb: 'rhythmic and body-moving',
  });

  // acoustic: very high acousticness
  tags.push({
    token: 'acoustic',
    score: clamp(avg.acousticness),
    blurb: 'acoustic-leaning instrumentation',
  });

  // talkative: high speechiness
  tags.push({
    token: 'talkative',
    score: clamp(avg.speechiness * 3),
    blurb: 'lyric- or spoken-word heavy',
  });

  return tags.sort((a, b) => b.score - a.score || a.token.localeCompare(b.token));
}

function clamp(n: number): number {
  if (Number.isNaN(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

export function buildVibe(features: AudioFeatures[]): VibeResult {
  const avg = averageFeatures(features);
  if (features.length === 0) {
    return {
      mood: 'empty · silent · unknown',
      tags: ['empty', 'silent', 'unknown'],
      explanation: 'Add tracks to your playlist to generate a vibe fingerprint.',
      averages: avg,
    };
  }
  const ranked = scoreTags(avg);
  const top = ranked.slice(0, 3);
  const tokens = top.map((t) => t.token);
  const mood = tokens.join(' · ');

  const tempoStr = `${Math.round(avg.tempo)} BPM`;
  const pct = (n: number): string => `${Math.round(n * 100)}%`;
  const explanation =
    `This playlist leans ${top[0]?.token ?? 'neutral'} — ${top[0]?.blurb ?? ''}. ` +
    `Average energy ${pct(avg.energy)}, danceability ${pct(avg.danceability)}, valence ${pct(avg.valence)}, ` +
    `acousticness ${pct(avg.acousticness)}, instrumentalness ${pct(avg.instrumentalness)}, around ${tempoStr}.`;

  return {
    mood,
    tags: tokens,
    explanation,
    averages: avg,
  };
}
