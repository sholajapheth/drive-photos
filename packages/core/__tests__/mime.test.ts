import { describe, expect, it } from 'vitest';
import { buildMimeQuery } from '../src/mime.js';
import { DrivePhotosError } from '../src/errors.js';

describe('buildMimeQuery', () => {
  it('builds OR query', () => {
    expect(buildMimeQuery(['image/jpeg', 'image/png'])).toBe(
      "(mimeType='image/jpeg' or mimeType='image/png')"
    );
  });

  it('throws on empty', () => {
    expect(() => buildMimeQuery([])).toThrow(DrivePhotosError);
  });
});
