import { DrivePhotosError } from './errors.js';

/**
 * MIME types treated as images when listing Drive folder contents.
 */
export const SUPPORTED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/heic',
  'image/heif',
  'image/bmp',
  'image/tiff',
  'image/svg+xml',
  'image/avif',
  'image/x-raw',
  'image/cr2',
  'image/dng',
  'image/x-canon-cr2',
  'image/x-nikon-nef',
] as const;

/**
 * Builds a Drive API `q` fragment: `(mimeType='a' or mimeType='b' or ...)`.
 *
 * @param types - MIME types to include
 * @returns Parenthesized OR expression for use inside a larger query
 * @throws {import('./errors.js').DrivePhotosError} CONFIGURATION_ERROR if empty
 */
export function buildMimeQuery(types: string[]): string {
  if (types.length === 0) {
    throw new DrivePhotosError('CONFIGURATION_ERROR', 'mimeTypes must not be empty');
  }
  const parts = types.map((t) => `mimeType='${t.replace(/'/g, "\\'")}'`);
  return `(${parts.join(' or ')})`;
}
