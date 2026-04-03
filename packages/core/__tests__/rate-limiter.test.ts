import { describe, expect, it, vi } from 'vitest';
import { RateLimiter } from '../src/rate-limiter.js';

describe('RateLimiter', () => {
  it('allows within window', () => {
    const r = new RateLimiter(2, 1000);
    expect(r.isAllowed()).toBe(true);
    expect(r.isAllowed()).toBe(true);
    expect(r.isAllowed()).toBe(false);
  });

  it('waitTime reflects window', () => {
    vi.useFakeTimers();
    const r = new RateLimiter(1, 1000);
    expect(r.isAllowed()).toBe(true);
    expect(r.waitTime()).toBeGreaterThan(0);
    vi.advanceTimersByTime(1001);
    expect(r.waitTime()).toBe(0);
    vi.useRealTimers();
  });
});
