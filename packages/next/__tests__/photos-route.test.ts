import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { createPhotosRoute } from '../src/photos-route.js';

describe('createPhotosRoute', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              files: [
                {
                  id: 'f1',
                  name: 'a.jpg',
                  mimeType: 'image/jpeg',
                  createdTime: '2020-01-01T00:00:00.000Z',
                },
              ],
            }),
            { status: 200 }
          )
      )
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns JSON and cache headers on success', async () => {
    const { GET } = createPhotosRoute({
      apiKey: '1234567890abcdefghij',
      folderId: '1234567890abcdefghij',
    });
    const res = await GET(new NextRequest('http://localhost/api/photos'));
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toContain('s-maxage=300');
    const body = await res.json();
    expect(body.photos).toBeDefined();
  });

  it('does not include api key in JSON body', async () => {
    const { GET } = createPhotosRoute({
      apiKey: '1234567890abcdefghij',
      folderId: '1234567890abcdefghij',
    });
    const res = await GET(new NextRequest('http://localhost/api/photos'));
    const text = JSON.stringify(await res.json());
    expect(text).not.toContain('1234567890abcdefghij');
  });

  it('maps folder not found to 404', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('{}', { status: 404 }));
    const { GET } = createPhotosRoute({
      apiKey: '1234567890abcdefghij',
      folderId: '1234567890abcdefghij',
    });
    const res = await GET(new NextRequest('http://localhost/api/photos'));
    expect(res.status).toBe(404);
  });

  it('supports dynamic folder id via query when enabled', async () => {
    const { GET } = createPhotosRoute({
      apiKey: '1234567890abcdefghij',
      folderId: '1234567890abcdefghij',
      allowDynamicFolder: true,
    });
    const res = await GET(
      new NextRequest('http://localhost/api/photos?folderId=abcdefghijkl1234567890')
    );
    expect(res.status).toBe(200);
  });
});
