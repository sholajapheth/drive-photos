import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { buildFallbackUrls, fetchWithFallback } from '../src/fallback.js';
import { DrivePhotosError } from '../src/errors.js';

describe('buildFallbackUrls', () => {
  it('returns ordered urls', () => {
    const urls = buildFallbackUrls('1234567890abcdefghij', 800);
    expect(urls[0]).toContain('/api/photos/1234567890abcdefghij');
    expect(urls[1]).toContain('drive.google.com/thumbnail');
    expect(urls[2]).toContain('lh3.googleusercontent.com');
    expect(urls[3]).toContain('uc?export=view');
  });
});

describe('fetchWithFallback', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(null, { status: 404 }))
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('throws when all fail', async () => {
    await expect(fetchWithFallback(['http://a', 'http://b'])).rejects.toThrow(DrivePhotosError);
  });

  it('returns first ok response', async () => {
    vi.mocked(fetch).mockImplementation(async (url) => {
      if (String(url).includes('second')) {
        return new Response(new Uint8Array([1]), { status: 200 });
      }
      return new Response(null, { status: 500 });
    });
    const res = await fetchWithFallback(['http://first', 'http://second']);
    expect(res.ok).toBe(true);
  });
});
