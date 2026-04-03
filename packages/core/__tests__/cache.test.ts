import { describe, expect, it, vi } from 'vitest';
import { LRUCache } from '../src/cache.js';

describe('LRUCache', () => {
  it('expires entries', () => {
    vi.useFakeTimers();
    const c = new LRUCache<string, string>(10, 1000);
    c.set('a', '1');
    expect(c.get('a')).toBe('1');
    vi.advanceTimersByTime(1001);
    expect(c.get('a')).toBeUndefined();
    vi.useRealTimers();
  });

  it('evicts oldest', () => {
    const c = new LRUCache<string, string>(2, 60_000);
    c.set('a', '1');
    c.set('b', '2');
    c.set('c', '3');
    expect(c.get('a')).toBeUndefined();
    expect(c.get('b')).toBe('2');
  });
});
