import { DrivePhotosError } from './errors.js';
import { normalizeFolderId } from './normalizer.js';
import type { DriveGalleryConfig } from './types.js';

const API_KEY_RE = /^[A-Za-z0-9_-]{10,}$/;
const FILE_ID_RE = /^[A-Za-z0-9_-]{10,}$/;

/**
 * Validates a Google API key shape (does not verify network access).
 *
 * @param key - API key string
 * @throws {DrivePhotosError} INVALID_API_KEY if invalid
 * @security Never log the key value.
 */
export function validateApiKey(key: string): void {
  if (!API_KEY_RE.test(key)) {
    throw new DrivePhotosError('INVALID_API_KEY', 'API key format is invalid');
  }
}

/**
 * Validates a Drive file id for safe use in URLs and proxy paths.
 *
 * @param id - File id
 * @throws {DrivePhotosError} INVALID_FILE_ID if invalid
 * @security Prevents path traversal in proxy routes.
 */
export function validateFileId(id: string): void {
  if (!FILE_ID_RE.test(id)) {
    throw new DrivePhotosError('INVALID_FILE_ID', 'File id format is invalid');
  }
}

/**
 * Clamps thumbnail/proxy size to a safe range.
 *
 * @param size - Requested size in pixels
 * @returns Clamped size between 100 and 1920
 */
export function validateSize(size: number): number {
  if (Number.isNaN(size) || !Number.isFinite(size)) {
    return 100;
  }
  return Math.min(1920, Math.max(100, Math.round(size)));
}

/**
 * Sanitizes a photo file name for safe display (strips control chars, truncates).
 *
 * @param name - Raw file name from Drive
 * @returns Safe display string
 */
export function sanitizePhotoName(name: string): string {
  // Strip ASCII control characters and DEL without using a control-char regex (eslint no-control-regex).
  const noControls = Array.from(name)
    .filter((ch) => {
      const c = ch.codePointAt(0)!;
      return c > 0x1f && c !== 0x7f;
    })
    .join('');
  return noControls.length > 255 ? noControls.slice(0, 255) : noControls;
}

/**
 * Validates full gallery configuration, aggregating all validation errors.
 *
 * @param config - User configuration
 * @throws {DrivePhotosError} CONFIGURATION_ERROR with combined messages
 */
export function validateConfig(config: DriveGalleryConfig): void {
  const errors: string[] = [];

  try {
    validateApiKey(config.apiKey);
  } catch (e) {
    if (e instanceof DrivePhotosError) errors.push(e.message);
  }

  try {
    normalizeFolderId(config.folderId);
  } catch (e) {
    if (e instanceof DrivePhotosError) errors.push(e.message);
  }

  const pageSize = config.pageSize ?? 1000;
  if (pageSize < 1 || pageSize > 1000) {
    errors.push('pageSize must be between 1 and 1000');
  }

  if (config.mimeTypes !== undefined && config.mimeTypes.length === 0) {
    errors.push('mimeTypes must not be empty when provided');
  }

  if (errors.length > 0) {
    throw new DrivePhotosError('CONFIGURATION_ERROR', errors.join('; '));
  }
}
