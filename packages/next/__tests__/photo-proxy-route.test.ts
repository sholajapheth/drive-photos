import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { assertAllowedImageUrl, createPhotoProxyRoute } from '../src/photo-proxy-route.js';

describe('assertAllowedImageUrl', () => {
  it('allows google hosts', () => {
    expect(assertAllowedImageUrl('https://drive.google.com/thumbnail?id=x&sz=w100').hostname).toBe(
      'drive.google.com'
    );
  });

  it('rejects unknown hosts', () => {
    expect(() => assertAllowedImageUrl('https://evil.com/x')).toThrow();
  });
});

describe('createPhotoProxyRoute', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(new Uint8Array([1, 2, 3]), {
            status: 200,
            headers: { 'content-type': 'image/jpeg' },
          })
      )
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('rejects traversal-like ids', async () => {
    const { GET } = createPhotoProxyRoute({ apiKey: '1234567890abcdefghij' });
    const res = await GET(new NextRequest('http://localhost/api/photos/../x'), {
      params: { id: '../x' },
    });
    expect(res.status).toBe(400);
  });

  it('streams image and sets fallback header', async () => {
    const { GET } = createPhotoProxyRoute({ apiKey: '1234567890abcdefghij' });
    const res = await GET(new NextRequest('http://localhost/api/photos/1234567890abcdefghij'), {
      params: { id: '1234567890abcdefghij' },
    });
    expect(res.status).toBe(200);
    expect(res.headers.get('x-drive-photos-fallback-level')).toBeTruthy();
  });
});
