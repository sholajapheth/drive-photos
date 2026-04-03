import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { drivePhotosMiddleware } from '../src/middleware.js';

describe('drivePhotosMiddleware', () => {
  it('adds security headers', async () => {
    const mw = drivePhotosMiddleware({ listPerMinute: 1000, idPerMinute: 1000 });
    const res = await mw(new NextRequest('http://localhost/api/photos'));
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
    expect(res.headers.get('x-frame-options')).toBe('DENY');
  });

  it('passes through non-photo routes', async () => {
    const mw = drivePhotosMiddleware({ listPerMinute: 1000, idPerMinute: 1000 });
    const res = await mw(new NextRequest('http://localhost/'));
    expect(res.status).not.toBe(429);
  });

  it('rate limits after many requests', async () => {
    const mw = drivePhotosMiddleware({ listPerMinute: 2, idPerMinute: 1000 });
    await mw(new NextRequest('http://localhost/api/photos'));
    await mw(new NextRequest('http://localhost/api/photos'));
    const third = await mw(new NextRequest('http://localhost/api/photos'));
    expect(third.status).toBe(429);
    expect(third.headers.get('retry-after')).toBeTruthy();
  });

  it('rate limits image proxy route separately', async () => {
    const mw = drivePhotosMiddleware({ listPerMinute: 1000, idPerMinute: 2 });
    const url = 'http://localhost/api/photos/1234567890abcdefghij';
    await mw(new NextRequest(url));
    await mw(new NextRequest(url));
    const third = await mw(new NextRequest(url));
    expect(third.status).toBe(429);
  });
});
