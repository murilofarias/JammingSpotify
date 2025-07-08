import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../types.js';

export function errorHandler() {
  return (err: unknown, req: Request, res: Response, _next: NextFunction): void => {
    if (err instanceof HttpError) {
      res.status(err.status).json({
        error: err.message,
        details: err.details ?? null,
        requestId: req.id,
      });
      return;
    }
    const message = err instanceof Error ? err.message : 'internal error';
    // eslint-disable-next-line no-console
    console.error(`[${req.id}]`, err);
    res.status(500).json({ error: message, requestId: req.id });
  };
}

export function notFound() {
  return (req: Request, res: Response): void => {
    res.status(404).json({ error: 'not found', path: req.path, requestId: req.id });
  };
}
