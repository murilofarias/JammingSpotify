import type { NextFunction, Request, Response } from 'express';
import { SESSION_COOKIE, type SessionStore } from '../services/session.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      sessionId?: string;
    }
  }
}

/**
 * Pulls the signed session cookie off the request and hydrates `req.sessionId`
 * if (and only if) the signature verifies. Unauthenticated requests pass
 * through untouched; individual routes decide whether they require a session.
 */
export function sessionMiddleware(store: SessionStore) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const signed = req.cookies?.[SESSION_COOKIE];
    if (typeof signed === 'string') {
      const id = store.verify(signed);
      if (id && store.get(id)) req.sessionId = id;
    }
    next();
  };
}
