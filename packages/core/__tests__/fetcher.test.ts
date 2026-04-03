import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { listDrivePhotos } from '../src/fetcher.js';

const validKey = '1234567890abcdefghij';
const validFolder = '1234567890abcdefghij';

describe('listDrivePhotos', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('paginates until done', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            nextPageToken: 'tok',
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
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            files: [
              {
                id: 'f2',
                name: 'b.jpg',
                mimeType: 'image/jpeg',
                createdTime: '2020-01-01T00:00:00.000Z',
              },
            ],
          }),
          { status: 200 }
        )
      );

    const r = await listDrivePhotos({
      apiKey: validKey,
      folderId: validFolder,
    });
    expect(r.photos).toHaveLength(2);
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(2);
  });

  it('maps HTTP 403 to ACCESS_DENIED', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response('{}', { status: 403 }));
    await expect(
      listDrivePhotos({ apiKey: validKey, folderId: validFolder })
    ).rejects.toMatchObject({ code: 'ACCESS_DENIED' });
  });

  it('maps HTTP 429 to RATE_LIMITED', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response('{}', { status: 429 }));
    await expect(
      listDrivePhotos({ apiKey: validKey, folderId: validFolder })
    ).rejects.toMatchObject({ code: 'RATE_LIMITED' });
  });

  it('error messages never include raw api key', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ error: { message: 'bad key=SECRET' } }), { status: 400 })
    );
    try {
      await listDrivePhotos({ apiKey: validKey, folderId: validFolder });
      expect.fail('should throw');
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      expect(msg).not.toContain('SECRET');
      expect(msg).toContain('redacted');
    }
  });
});
