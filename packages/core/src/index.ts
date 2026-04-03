/**
 * @packageDocumentation
 * Core utilities for Google Drive photo listing, validation, caching, and image fallbacks.
 */

export { DrivePhotosError, type DrivePhotosErrorCode } from './errors.js';
export { LRUCache, photoListCache } from './cache.js';
export { buildFallbackUrls, fallbackIndexToLevel, fetchWithFallback } from './fallback.js';
export { listDrivePhotos } from './fetcher.js';
export { buildMimeQuery, SUPPORTED_MIME_TYPES } from './mime.js';
export { normalizeFolderId } from './normalizer.js';
export { RateLimiter } from './rate-limiter.js';
export {
  sanitizePhotoName,
  validateApiKey,
  validateConfig,
  validateFileId,
  validateSize,
} from './sanitizer.js';
export type { DriveGalleryConfig, DrivePhoto, FallbackLevel, FetchPhotosResult } from './types.js';
