import { buildApp } from './app.js';

const port = Number(process.env.PORT ?? 8787);

const cfg = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  sessionSecret:
    process.env.SESSION_SECRET ??
    'dev-only-session-secret-please-override-in-production-32chars',
  spotifyClientId: process.env.SPOTIFY_CLIENT_ID ?? 'fixture-client-id',
  spotifyRedirectUri:
    process.env.SPOTIFY_REDIRECT_URI ?? `http://localhost:${port}/auth/callback`,
  spotifyScopes:
    process.env.SPOTIFY_SCOPES ??
    'user-read-private user-read-email user-top-read user-read-currently-playing playlist-modify-public playlist-modify-private',
  frontendPostLoginUrl:
    process.env.FRONTEND_POST_LOGIN_URL ?? 'http://localhost:5173/app',
  fixtureMode: (process.env.SPOTIFY_FIXTURE_MODE ?? 'true').toLowerCase() === 'true',
  cacheTtlSeconds: Number(process.env.CACHE_TTL_SECONDS ?? 90),
};

const app = buildApp(cfg);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(
    `[jamming-api] listening on :${port} (fixtureMode=${cfg.fixtureMode}, env=${cfg.nodeEnv})`,
  );
});
