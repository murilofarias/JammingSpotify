/**
 * Minimal signed-cookie session store.
 *
 * The browser only ever receives an opaque session id signed with HMAC-SHA256.
 * Spotify access/refresh tokens stay server-side, keyed by that id. For a real
 * deployment you'd swap the in-memory Map for Redis; the interface is the same.
 */

import crypto from 'node:crypto';
import type { SessionData } from '../types.js';

const sessions = new Map<string, SessionData>();

export interface SessionStore {
  create(data: Omit<SessionData, 'id'>): string;
  get(id: string): SessionData | undefined;
  update(id: string, patch: Partial<Omit<SessionData, 'id'>>): SessionData | undefined;
  destroy(id: string): void;
  sign(id: string): string;
  verify(signed: string): string | null;
}

export function createSessionStore(secret: string): SessionStore {
  if (!secret || secret.length < 16) {
    // Fail early in dev so nobody ships a weak secret by accident.
    throw new Error('SESSION_SECRET must be at least 16 characters');
  }

  function hmac(input: string): string {
    return crypto.createHmac('sha256', secret).update(input).digest('hex');
  }

  return {
    create(data) {
      const id = crypto.randomBytes(24).toString('hex');
      sessions.set(id, { id, ...data });
      return id;
    },
    get(id) {
      return sessions.get(id);
    },
    update(id, patch) {
      const cur = sessions.get(id);
      if (!cur) return undefined;
      const next: SessionData = { ...cur, ...patch };
      sessions.set(id, next);
      return next;
    },
    destroy(id) {
      sessions.delete(id);
    },
    sign(id) {
      return `${id}.${hmac(id)}`;
    },
    verify(signed) {
      const dot = signed.lastIndexOf('.');
      if (dot < 0) return null;
      const id = signed.slice(0, dot);
      const sig = signed.slice(dot + 1);
      const expected = hmac(id);
      // Constant-time compare.
      const a = Buffer.from(sig, 'hex');
      const b = Buffer.from(expected, 'hex');
      if (a.length !== b.length) return null;
      return crypto.timingSafeEqual(a, b) ? id : null;
    },
  };
}

export const SESSION_COOKIE = 'jamming_sid';
