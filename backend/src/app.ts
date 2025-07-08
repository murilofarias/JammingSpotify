import cookieParser from 'cookie-parser';
import express, { type Express } from 'express';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { corsMiddleware } from './middleware/cors.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { requestId } from './middleware/requestId.js';
import { sessionMiddleware } from './middleware/session.js';
import { apiRouter } from './routes/api.js';
import { authRouter } from './routes/auth.js';
import { createSessionStore } from './services/session.js';
import { SpotifyClient } from './services/spotify.js';

export interface AppConfig {
  nodeEnv: string;
  corsOrigin: string;
  sessionSecret: string;
  spotifyClientId: string;
  spotifyRedirectUri: string;
  spotifyScopes: string;
  frontendPostLoginUrl: string;
  fixtureMode: boolean;
  cacheTtlSeconds: number;
}

export function buildApp(cfg: AppConfig): Express {
  const app = express();
  const isProd = cfg.nodeEnv === 'production';

  const sessionStore = createSessionStore(cfg.sessionSecret);
  const client = new SpotifyClient({
    clientId: cfg.spotifyClientId,
    redirectUri: cfg.spotifyRedirectUri,
    sessionStore,
    cacheTtlSeconds: cfg.cacheTtlSeconds,
  });

  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(requestId());
  app.use(corsMiddleware(cfg.corsOrigin));
  app.use(express.json({ limit: '256kb' }));
  app.use(cookieParser());
  app.use(sessionMiddleware(sessionStore));
  if (!isProd) app.use(morgan('dev'));

  // Global rate limit — auth endpoints get a tighter bucket.
  app.use(
    rateLimit({
      windowMs: 60_000,
      max: 240,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );
  const authLimiter = rateLimit({ windowMs: 60_000, max: 30 });

  app.use(
    authLimiter,
    authRouter({
      client,
      sessionStore,
      scopes: cfg.spotifyScopes,
      postLoginUrl: cfg.frontendPostLoginUrl,
      fixtureMode: cfg.fixtureMode,
      isProd,
    }),
  );

  app.use(
    '/api',
    apiRouter({
      client,
      sessionStore,
      fixtureMode: cfg.fixtureMode,
    }),
  );

  app.use(notFound());
  app.use(errorHandler());

  return app;
}
