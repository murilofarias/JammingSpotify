/**
 * Tiny in-memory TTL cache. Used to dampen repeat Spotify calls for identical
 * queries (search, audio-features, recommendations) during a session.
 */

interface Entry<T> {
  value: T;
  expiresAt: number;
}

export class TTLCache<T> {
  private readonly store = new Map<string, Entry<T>>();
  private readonly ttlMs: number;
  private readonly maxEntries: number;

  constructor(ttlSeconds: number, maxEntries = 500) {
    this.ttlMs = Math.max(0, ttlSeconds) * 1000;
    this.maxEntries = maxEntries;
  }

  get(key: string): T | undefined {
    const hit = this.store.get(key);
    if (!hit) return undefined;
    if (hit.expiresAt < Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    return hit.value;
  }

  set(key: string, value: T): void {
    if (this.ttlMs <= 0) return;
    if (this.store.size >= this.maxEntries) {
      // Evict oldest (insertion order).
      const first = this.store.keys().next().value;
      if (typeof first === 'string') this.store.delete(first);
    }
    this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }

  clear(): void {
    this.store.clear();
  }

  size(): number {
    return this.store.size;
  }
}
