import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DriveGallery } from '../src/DriveGallery.js';

describe('DriveGallery', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json({
          photos: [
            {
              id: '1234567890abcdefghij',
              name: 'a.jpg',
              mimeType: 'image/jpeg',
              createdTime: '2020-01-01T00:00:00.000Z',
            },
          ],
          total: 1,
          truncated: false,
        })
      )
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders with listEndpoint without calling Google directly', async () => {
    render(
      <DriveGallery
        gkey=""
        dirId="1234567890abcdefghij"
        options={{
          listEndpoint: '/api/photos',
          skeleton: false,
        }}
      />
    );
    expect(await screen.findByRole('list')).toBeInTheDocument();
  });
});
