import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDriveGallery } from '../src/useDriveGallery.js';

describe('useDriveGallery', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json({
          photos: [],
          total: 0,
          truncated: false,
        })
      )
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('loads via listEndpoint', async () => {
    const { result } = renderHook(() =>
      useDriveGallery({
        folderId: '1234567890abcdefghij',
        listEndpoint: '/api/photos',
      })
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.photos).toEqual([]);
  });
});
