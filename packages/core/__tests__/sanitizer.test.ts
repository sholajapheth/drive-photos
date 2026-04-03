import { describe, expect, it } from 'vitest';
import {
  sanitizePhotoName,
  validateApiKey,
  validateConfig,
  validateFileId,
  validateSize,
} from '../src/sanitizer.js';
import { DrivePhotosError } from '../src/errors.js';

describe('validateApiKey', () => {
  it('accepts valid keys', () => {
    expect(() => validateApiKey('1234567890ab')).not.toThrow();
  });

  it('rejects short keys', () => {
    expect(() => validateApiKey('short')).toThrow(DrivePhotosError);
  });
});

describe('validateFileId', () => {
  it('accepts valid ids', () => {
    expect(() => validateFileId('fileid123456')).not.toThrow();
  });

  it('rejects path traversal patterns', () => {
    expect(() => validateFileId('../etc/passwd')).toThrow(DrivePhotosError);
  });
});

describe('validateSize', () => {
  it('clamps to range', () => {
    expect(validateSize(50)).toBe(100);
    expect(validateSize(500)).toBe(500);
    expect(validateSize(9999)).toBe(1920);
  });
});

describe('sanitizePhotoName', () => {
  it('strips control chars', () => {
    expect(sanitizePhotoName('a\u0000b')).toBe('ab');
  });

  it('truncates long names', () => {
    const s = 'x'.repeat(300);
    expect(sanitizePhotoName(s).length).toBe(255);
  });
});

describe('validateConfig', () => {
  it('aggregates errors', () => {
    expect(() =>
      validateConfig({
        apiKey: 'bad',
        folderId: 'bad',
        pageSize: 2000,
        mimeTypes: [],
      })
    ).toThrow(DrivePhotosError);
  });

  it('passes valid config', () => {
    expect(() =>
      validateConfig({
        apiKey: '1234567890abcdefghij',
        folderId: '1234567890abcdefghij',
      })
    ).not.toThrow();
  });
});
