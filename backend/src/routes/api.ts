import { Router } from 'express';
import { z } from 'zod';
import {
  fixtureAudioFeaturesByIds,
  fixtureCurrentlyPlaying,
  fixtureRecommendations,
  fixtureSearch,
  fixtureTopArtists,
  fixtureTopTracks,
  fixtureUser,
} from '../services/fixtures.js';
import type { SpotifyClient } from '../services/spotify.js';
import type { SessionStore } from '../services/session.js';
import { buildVibe } from '../services/vibe.js';
import { HttpError, type AudioFeatures, type TimeRange } from '../types.js';

interface ApiDeps {
  client: SpotifyClient;
  sessionStore: SessionStore;
  fixtureMode: boolean;
}

function requireSession(fixtureMode: boolean, sessionId: string | undefined): string {
  if (fixtureMode) return sessionId ?? 'fixture';
  if (!sessionId) throw new HttpError(401, 'not authenticated');
  return sessionId;
}

const timeRangeSchema = z
  .enum(['short_term', 'medium_term', 'long_term'])
  .default('medium_term');

export function apiRouter(deps: ApiDeps): Router {
  const r = Router();

  r.get('/health', (_req, res) => {
    res.json({ ok: true, fixtureMode: deps.fixtureMode, uptime: process.uptime() });
  });

  r.get('/me', async (req, res, next) => {
    try {
      const sid = requireSession(deps.fixtureMode, req.sessionId);
      if (deps.fixtureMode) {
        res.json(fixtureUser);
        return;
      }
      const me = await deps.client.me(sid);
      res.json(me);
    } catch (err) {
      next(err);
    }
  });

  r.get('/search', async (req, res, next) => {
    try {
      const sid = requireSession(deps.fixtureMode, req.sessionId);
      const schema = z.object({
        q: z.string().min(1),
        type: z.literal('track').optional(),
        limit: z.coerce.number().int().min(1).max(50).default(20),
      });
      const parsed = schema.parse(req.query);
      const tracks = deps.fixtureMode
        ? fixtureSearch(parsed.q, parsed.limit)
        : await deps.client.search(sid, parsed.q, parsed.limit);
      res.json({ tracks });
    } catch (err) {
      next(err);
    }
  });

  r.post('/audio-features', async (req, res, next) => {
    try {
      const sid = requireSession(deps.fixtureMode, req.sessionId);
      const schema = z.object({ ids: z.array(z.string().min(1)).min(1).max(100) });
      const { ids } = schema.parse(req.body);
      const features: AudioFeatures[] = deps.fixtureMode
        ? fixtureAudioFeaturesByIds(ids)
        : await deps.client.audioFeatures(sid, ids);
      res.json({ features });
    } catch (err) {
      next(err);
    }
  });

  r.get('/recommendations', async (req, res, next) => {
    try {
      const sid = requireSession(deps.fixtureMode, req.sessionId);
      const schema = z.object({
        seed_tracks: z.string().min(1),
        limit: z.coerce.number().int().min(1).max(50).default(20),
      });
      const parsed = schema.parse(req.query);
      const ids = parsed.seed_tracks.split(',').map((s) => s.trim()).filter(Boolean);
      const tracks = deps.fixtureMode
        ? fixtureRecommendations(ids, parsed.limit)
        : await deps.client.recommendations(sid, ids, parsed.limit);
      res.json({ tracks });
    } catch (err) {
      next(err);
    }
  });

  r.get('/me/top/tracks', async (req, res, next) => {
    try {
      const sid = requireSession(deps.fixtureMode, req.sessionId);
      const range = timeRangeSchema.parse(req.query.time_range ?? 'medium_term') as TimeRange;
      const tracks = deps.fixtureMode
        ? fixtureTopTracks(range)
        : await deps.client.topTracks(sid, range);
      res.json({ tracks, timeRange: range });
    } catch (err) {
      next(err);
    }
  });

  r.get('/me/top/artists', async (req, res, next) => {
    try {
      const sid = requireSession(deps.fixtureMode, req.sessionId);
      const range = timeRangeSchema.parse(req.query.time_range ?? 'medium_term') as TimeRange;
      const artists = deps.fixtureMode
        ? fixtureTopArtists(range)
        : await deps.client.topArtists(sid, range);
      res.json({ artists, timeRange: range });
    } catch (err) {
      next(err);
    }
  });

  r.get('/me/currently-playing', async (req, res, next) => {
    try {
      const sid = requireSession(deps.fixtureMode, req.sessionId);
      const cp = deps.fixtureMode
        ? fixtureCurrentlyPlaying()
        : await deps.client.currentlyPlaying(sid);
      res.json(cp);
    } catch (err) {
      next(err);
    }
  });

  r.post('/playlists', async (req, res, next) => {
    try {
      const sid = requireSession(deps.fixtureMode, req.sessionId);
      const schema = z.object({
        name: z.string().min(1).max(100),
        description: z.string().max(300).default(''),
        trackIds: z.array(z.string().min(1)).min(1).max(200),
      });
      const parsed = schema.parse(req.body);
      if (deps.fixtureMode) {
        res.json({
          id: `demo_${Date.now()}`,
          url: 'https://open.spotify.com/',
          mode: 'fixture',
          saved: parsed.trackIds.length,
        });
        return;
      }
      const session = deps.sessionStore.get(sid);
      if (!session?.userId) throw new HttpError(400, 'user id missing on session');
      const uris = parsed.trackIds.map((id) => `spotify:track:${id}`);
      const result = await deps.client.createPlaylist(
        sid,
        session.userId,
        parsed.name,
        parsed.description,
        uris,
      );
      res.json({ ...result, saved: uris.length });
    } catch (err) {
      next(err);
    }
  });

  r.post('/vibe', (req, res, next) => {
    try {
      // Sessionless: this is pure computation over audio features the client
      // already holds. No Spotify call required.
      const featureSchema = z.object({
        id: z.string(),
        danceability: z.number(),
        energy: z.number(),
        valence: z.number(),
        acousticness: z.number(),
        instrumentalness: z.number(),
        speechiness: z.number(),
        liveness: z.number(),
        tempo: z.number(),
        key: z.number(),
        loudness: z.number(),
        mode: z.number(),
        timeSignature: z.number(),
        durationMs: z.number(),
      });
      const schema = z.object({ audioFeatures: z.array(featureSchema) });
      const parsed = schema.parse(req.body);
      res.json(buildVibe(parsed.audioFeatures));
    } catch (err) {
      next(err);
    }
  });

  return r;
}
