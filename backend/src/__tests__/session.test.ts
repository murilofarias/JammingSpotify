import { describe, expect, it } from 'vitest';
import { createSessionStore } from '../services/session.js';

describe('session store', () => {
  it('creates, gets, updates, and destroys sessions', () => {
    const s = createSessionStore('super-secret-dev-key-0000000000000000');
    const id = s.create({
      accessToken: 'a',
      refreshToken: 'r',
      expiresAt: Date.now() + 3600_000,
      userId: 'u',
    });
    expect(s.get(id)?.accessToken).toBe('a');
    s.update(id, { accessToken: 'a2' });
    expect(s.get(id)?.accessToken).toBe('a2');
    s.destroy(id);
    expect(s.get(id)).toBeUndefined();
  });

  it('signs and verifies ids', () => {
    const s = createSessionStore('super-secret-dev-key-0000000000000000');
    const id = s.create({
      accessToken: 'a',
      refreshToken: 'r',
      expiresAt: 0,
      userId: null,
    });
    const signed = s.sign(id);
    expect(s.verify(signed)).toBe(id);
  });

  it('rejects tampered signatures', () => {
    const s = createSessionStore('super-secret-dev-key-0000000000000000');
    const id = s.create({
      accessToken: 'a',
      refreshToken: 'r',
      expiresAt: 0,
      userId: null,
    });
    const signed = s.sign(id);
    const tampered = signed.slice(0, -2) + (signed.endsWith('ff') ? '00' : 'ff');
    expect(s.verify(tampered)).toBeNull();
  });

  it('refuses weak secrets', () => {
    expect(() => createSessionStore('short')).toThrow();
  });
});
