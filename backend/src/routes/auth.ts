import { Router } from 'express';
import { z } from 'zod';
import { SpotifyClient } from '../services/spotify.js';
import { SESSION_COOKIE, type SessionStore } from '../services/session.js';
import { HttpError } from '../types.js';

interface AuthDeps {
  client: SpotifyClient;
  sessionStore: SessionStore;
  scopes: string;
  postLoginUrl: string;
  fixtureMode: boolean;
  isProd: boolean;
}

// PKCE verifiers keyed by state, short-lived. In memory because a login flow
// completes in seconds; a real deployment might use Redis.
const pendingPkce = new Map<string, { verifier: string; createdAt: number }>();
const PKCE_TTL_MS = 10 * 60 * 1000;

function sweepPending(): void {
  const now = Date.now();
  for (const [state, entry] of pendingPkce) {
    if (now - entry.createdAt > PKCE_TTL_MS) pendingPkce.delete(state);
  }
}

export function authRouter(deps: AuthDeps): Router {
  const r = Router();

  r.get('/auth/login', (_req, res) => {
    sweepPending();
    if (deps.fixtureMode) {
      // Short-circuit: mint a fake session and hand back the post-login URL.
      const id = deps.sessionStore.create({
        accessToken: 'fixture-access',
        refreshToken: 'fixture-refresh',
        expiresAt: Date.now() + 3600 * 1000,
        userId: 'demo_user',
      });
      res.cookie(SESSION_COOKIE, deps.sessionStore.sign(id), {
        httpOnly: true,
        sameSite: 'lax',
        secure: deps.isProd,
        path: '/',
        maxAge: 7 * 24 * 3600 * 1000,
      });
      res.json({ mode: 'fixture', redirectTo: deps.postLoginUrl });
      return;
    }

    const { verifier, challenge, state } = SpotifyClient.generatePkce();
    pendingPkce.set(state, { verifier, createdAt: Date.now() });
    const url = deps.client.buildAuthUrl(deps.scopes, challenge, state);
    res.json({ mode: 'live', authUrl: url, state });
  });

  r.get('/auth/callback', async (req, res, next) => {
    try {
      const schema = z.object({ code: z.string().min(1), state: z.string().min(1) });
      const parsed = schema.safeParse(req.query);
      if (!parsed.success) throw new HttpError(400, 'missing code/state');

      const pending = pendingPkce.get(parsed.data.state);
      if (!pending) throw new HttpError(400, 'unknown or expired state');
      pendingPkce.delete(parsed.data.state);

      const tokens = await deps.client.exchangeCode(parsed.data.code, pending.verifier);
      const id = deps.sessionStore.create({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token ?? '',
        expiresAt: Date.now() + tokens.expires_in * 1000,
        userId: null,
      });
      // Cache the user id so /me/* routes don't have to re-resolve it.
      try {
        const me = await deps.client.me(id);
        deps.sessionStore.update(id, { userId: me.id });
      } catch {
        /* non-fatal */
      }

      res.cookie(SESSION_COOKIE, deps.sessionStore.sign(id), {
        httpOnly: true,
        sameSite: 'lax',
        secure: deps.isProd,
        path: '/',
        maxAge: 7 * 24 * 3600 * 1000,
      });
      res.redirect(deps.postLoginUrl);
    } catch (err) {
      next(err);
    }
  });

  r.post('/auth/refresh', async (req, res, next) => {
    try {
      if (!req.sessionId) throw new HttpError(401, 'no session');
      const session = deps.sessionStore.get(req.sessionId);
      if (!session?.refreshToken) throw new HttpError(401, 'no refresh token');
      if (deps.fixtureMode) {
        deps.sessionStore.update(req.sessionId, {
          expiresAt: Date.now() + 3600 * 1000,
        });
        res.json({ ok: true, mode: 'fixture' });
        return;
      }
      const refreshed = await deps.client.refreshToken(session.refreshToken);
      deps.sessionStore.update(req.sessionId, {
        accessToken: refreshed.access_token,
        expiresAt: Date.now() + refreshed.expires_in * 1000,
        refreshToken: refreshed.refresh_token ?? session.refreshToken,
      });
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  r.post('/auth/logout', (req, res) => {
    if (req.sessionId) deps.sessionStore.destroy(req.sessionId);
    res.clearCookie(SESSION_COOKIE, { path: '/' });
    res.json({ ok: true });
  });

  r.get('/auth/status', (req, res) => {
    const authed = Boolean(req.sessionId && deps.sessionStore.get(req.sessionId));
    res.json({
      authenticated: authed,
      fixtureMode: deps.fixtureMode,
    });
  });

  return r;
}
