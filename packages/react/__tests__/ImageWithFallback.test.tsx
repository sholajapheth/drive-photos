import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { ImageWithFallback } from '../src/ImageWithFallback.js';

describe('ImageWithFallback', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(null, { status: 404 }))
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders img with alt from photo name', () => {
    const { container } = render(
      <ImageWithFallback
        photo={{
          id: '1234567890abcdefghij',
          name: 'x.jpg',
          mimeType: 'image/jpeg',
          createdTime: '2020-01-01T00:00:00.000Z',
        }}
      />
    );
    expect(container.querySelector('img')?.getAttribute('alt')).toBe('x.jpg');
  });
});
