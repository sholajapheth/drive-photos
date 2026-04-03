import type { FetchPhotosResult } from './types.js';

interface Entry<V> {
  value: V;
  expiresAt: number;
}

/**
 * Simple in-memory LRU cache with TTL.
 *
 * @typeParam K - Key type
 * @typeParam V - Value type
 */
export class LRUCache<K, V> {
  private readonly map = new Map<K, Entry<V>>();

  /**
   * @param maxSize - Maximum number of entries
   * @param ttlMs - Time-to-live in milliseconds
   */
  constructor(
    private maxSize: number,
    private ttlMs: number
  ) {}

  /**
   * @param key - Cache key
   * @returns Cached value or undefined if missing/expired
   */
  get(key: K): V | undefined {
    const e = this.map.get(key);
    if (!e) return undefined;
    if (Date.now() > e.expiresAt) {
      this.map.delete(key);
      return undefined;
    }
    this.map.delete(key);
    this.map.set(key, e);
    return e.value;
  }

  /**
   * @param key - Cache key
   * @param value - Value to store
   */
  set(key: K, value: V): void {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, {
      value,
      expiresAt: Date.now() + this.ttlMs,
    });
    while (this.map.size > this.maxSize) {
      const first = this.map.keys().next().value as K | undefined;
      if (first === undefined) break;
      this.map.delete(first);
    }
  }

  /** @param key - Cache key */
  delete(key: K): void {
    this.map.delete(key);
  }

  /** Clears all entries. */
  clear(): void {
    this.map.clear();
  }
}

/**
 * Default cache for {@link import('./fetcher.js').listDrivePhotos} results (folder lists).
 */
export const photoListCache = new LRUCache<string, FetchPhotosResult>(10, 5 * 60 * 1000);
