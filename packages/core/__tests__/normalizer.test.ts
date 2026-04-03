import { describe, expect, it } from 'vitest';
import { normalizeFolderId } from '../src/normalizer.js';
import { DrivePhotosError } from '../src/errors.js';

describe('normalizeFolderId', () => {
  it('accepts raw id', () => {
    expect(normalizeFolderId('  abcdefghij  ')).toBe('abcdefghij');
  });

  it('handles drive.google.com/drive/folders/ID', () => {
    expect(normalizeFolderId('https://drive.google.com/drive/folders/abcDEF12345ghij')).toBe(
      'abcDEF12345ghij'
    );
  });

  it('handles folders URL with query', () => {
    expect(
      normalizeFolderId('https://drive.google.com/drive/folders/abcDEF12345ghij?usp=sharing')
    ).toBe('abcDEF12345ghij');
  });

  it('handles open?id=', () => {
    expect(normalizeFolderId('https://drive.google.com/open?id=abcDEF12345ghij')).toBe(
      'abcDEF12345ghij'
    );
  });

  it('handles /drive/u/0/folders/', () => {
    expect(normalizeFolderId('https://drive.google.com/drive/u/0/folders/abcDEF12345ghij')).toBe(
      'abcDEF12345ghij'
    );
  });

  it('throws on empty', () => {
    expect(() => normalizeFolderId('   ')).toThrow(DrivePhotosError);
  });

  it('throws on invalid host', () => {
    expect(() => normalizeFolderId('https://evil.com/drive/folders/abcDEF12345ghij')).toThrow(
      DrivePhotosError
    );
  });

  it('throws on too short id', () => {
    expect(() => normalizeFolderId('short')).toThrow(DrivePhotosError);
  });
});
