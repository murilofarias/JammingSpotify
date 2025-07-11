import { describe, expect, it } from 'vitest';
import { TTLCache } from '../services/cache.js';

describe('TTLCache', () => {
  it('stores and retrieves values', () => {
    const c = new TTLCache<number>(60);
    c.set('a', 1);
    expect(c.get('a')).toBe(1);
  });

  it('expires entries after TTL', async () => {
    const c = new TTLCache<number>(0.05); // 50ms
    c.set('a', 1);
    await new Promise((r) => setTimeout(r, 80));
    expect(c.get('a')).toBeUndefined();
  });

  it('no-ops on zero TTL', () => {
    const c = new TTLCache<number>(0);
    c.set('a', 1);
    expect(c.get('a')).toBeUndefined();
  });

  it('evicts oldest when full', () => {
    const c = new TTLCache<number>(60, 2);
    c.set('a', 1);
    c.set('b', 2);
    c.set('c', 3);
    expect(c.size()).toBe(2);
    expect(c.get('a')).toBeUndefined();
    expect(c.get('c')).toBe(3);
  });

  it('clear empties the store', () => {
    const c = new TTLCache<number>(60);
    c.set('a', 1);
    c.clear();
    expect(c.size()).toBe(0);
  });
});
