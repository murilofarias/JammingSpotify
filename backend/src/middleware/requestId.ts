import type { NextFunction, Request, Response } from 'express';
import crypto from 'node:crypto';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

export function requestId() {
  return (req: Request, res: Response, next: NextFunction): void => {
    const incoming = req.header('x-request-id');
    const id = incoming && /^[a-zA-Z0-9-]{4,64}$/.test(incoming)
      ? incoming
      : crypto.randomBytes(8).toString('hex');
    req.id = id;
    res.setHeader('x-request-id', id);
    next();
  };
}
