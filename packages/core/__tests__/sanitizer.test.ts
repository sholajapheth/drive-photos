import { describe, expect, it } from 'vitest';
import {
  sanitizePhotoName,
  validateApiKey,
  validateConfig,
  validateFallbackUrl,
  validateFileId,
  validateRelativeProxyUrl,
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

  it('strips angle brackets and script-like content', () => {
    expect(sanitizePhotoName('<script>alert(1)</script>')).not.toMatch(/[<>]/);
    expect(sanitizePhotoName('photo<script>.jpg')).toBe('photoscript.jpg');
  });
});

describe('validateFallbackUrl', () => {
  it('accepts allowlisted https hosts', () => {
    expect(() => validateFallbackUrl('https://www.googleapis.com/v1/foo')).not.toThrow();
    expect(() => validateFallbackUrl('https://drive.google.com/file')).not.toThrow();
    expect(() => validateFallbackUrl('https://lh3.googleusercontent.com/x')).not.toThrow();
  });

  it('rejects http and unknown hosts', () => {
    expect(() => validateFallbackUrl('http://www.googleapis.com/x')).toThrow(DrivePhotosError);
    expect(() => validateFallbackUrl('https://evil.example/x')).toThrow(DrivePhotosError);
  });
});

describe('validateRelativeProxyUrl', () => {
  it('accepts /api/photos/[id]', () => {
    expect(() => validateRelativeProxyUrl('/api/photos/1234567890abcdefghij')).not.toThrow();
  });

  it('rejects invalid paths', () => {
    expect(() => validateRelativeProxyUrl('/other/1234567890abcdefghij')).toThrow(DrivePhotosError);
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
