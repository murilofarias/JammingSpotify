import cors from 'cors';

/**
 * CORS allow-list. `CORS_ORIGIN` can be a single origin or a comma-separated
 * list. Credentials are enabled so the session cookie flows cross-site in dev
 * (Vite on :5173, API on :8787).
 */
export function corsMiddleware(originEnv: string | undefined) {
  const allow = (originEnv ?? '').split(',').map((o) => o.trim()).filter(Boolean);
  return cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // curl / server-to-server
      if (allow.length === 0 || allow.includes(origin)) return cb(null, true);
      return cb(new Error(`origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['content-type', 'x-request-id'],
  });
}
