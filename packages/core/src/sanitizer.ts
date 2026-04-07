import { DrivePhotosError } from './errors.js';
import { normalizeFolderId } from './normalizer.js';
import type { DriveGalleryConfig } from './types.js';

const API_KEY_RE = /^[A-Za-z0-9_-]{10,}$/;

/**
 * Google Drive file IDs are URL-safe strings (typically 25–44 chars; legacy IDs may be shorter).
 * Strict charset + length bounds mitigate path traversal and injection in proxy routes.
 * @security Decode URL encoding before matching so %2F cannot smuggle slashes.
 */
const DRIVE_FILE_ID_RE = /^[A-Za-z0-9_-]{10,44}$/;

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

function decodeFileIdCandidate(id: string): string {
  try {
    return decodeURIComponent(id);
  } catch {
    throw new DrivePhotosError('INVALID_FILE_ID', 'File ID must be a valid string');
  }
}

/**
 * Validates a Drive file id for safe use in URLs and proxy paths.
 *
 * @param id - File id
 * @throws {DrivePhotosError} INVALID_FILE_ID if invalid
 * @security Prevents path traversal and URL-encoded injection in proxy routes.
 */
export function validateFileId(id: string): void {
  if (!id || typeof id !== 'string') {
    throw new DrivePhotosError('INVALID_FILE_ID', 'File ID must be a non-empty string');
  }
  const decoded = decodeFileIdCandidate(id.trim());
  if (decoded.includes('/') || decoded.includes('\\') || decoded.includes('..')) {
    throw new DrivePhotosError('INVALID_FILE_ID', 'File id format is invalid');
  }
  if (!DRIVE_FILE_ID_RE.test(decoded)) {
    throw new DrivePhotosError(
      'INVALID_FILE_ID',
      'File ID contains invalid characters. Expected a Google Drive file id (alphanumeric, hyphen, underscore; length 10–44).'
    );
  }
}

const PRIVATE_HOST_PATTERNS: RegExp[] = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^::1$/,
  /^fc00:/i,
  /^\[::1\]$/,
];

/**
 * Hostnames permitted for outbound image fetches (SSRF allowlist).
 */
const FALLBACK_ALLOWED_HOSTS = new Set([
  'www.googleapis.com',
  'drive.google.com',
  'lh3.googleusercontent.com',
]);

function isBlockedHostname(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return PRIVATE_HOST_PATTERNS.some((p) => p.test(h));
}

/**
 * Validates an absolute HTTPS URL before fetch (SSRF defense in depth).
 *
 * @param rawUrl - Candidate URL string
 * @throws {DrivePhotosError} INVALID_REQUEST if not allowed
 * @security HTTPS-only, hostname allowlist, blocks private/internal host patterns.
 */
export function validateFallbackUrl(rawUrl: string): void {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new DrivePhotosError('INVALID_REQUEST', 'Invalid URL');
  }
  if (parsed.protocol !== 'https:') {
    throw new DrivePhotosError('INVALID_REQUEST', 'Only https URLs are allowed');
  }
  if (!FALLBACK_ALLOWED_HOSTS.has(parsed.hostname)) {
    throw new DrivePhotosError(
      'INVALID_REQUEST',
      `Host ${parsed.hostname} is not in the allowed list for image fetches`
    );
  }
  if (isBlockedHostname(parsed.hostname)) {
    throw new DrivePhotosError('INVALID_REQUEST', 'Internal or private hosts are not permitted');
  }
}

/**
 * Validates a same-origin relative proxy path `/api/photos/[id]` (or custom prefix).
 */
export function validateRelativeProxyUrl(rawUrl: string, proxyBasePrefix = '/api/photos'): void {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl, 'https://placeholder.example');
  } catch {
    throw new DrivePhotosError('INVALID_REQUEST', 'Invalid relative URL');
  }
  const prefix = proxyBasePrefix.replace(/\/$/, '');
  if (!parsed.pathname.startsWith(`${prefix}/`)) {
    throw new DrivePhotosError('INVALID_REQUEST', 'Invalid proxy path');
  }
  const id = parsed.pathname.slice(prefix.length + 1).split('/')[0];
  if (!id) {
    throw new DrivePhotosError('INVALID_REQUEST', 'Missing file id in proxy path');
  }
  validateFileId(id);
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

const XSSY_NAME_CHARS = /[<>&"'`]/g;

/**
 * Sanitizes a photo file name for safe display (strips control chars, XSS-prone characters, truncates).
 */
export function sanitizePhotoName(name: string): string {
  if (!name || typeof name !== 'string') return 'Untitled';
  const noNulls = name.replace(/\0/g, '');
  const noControls = Array.from(noNulls)
    .filter((ch) => {
      const c = ch.codePointAt(0)!;
      return c > 0x1f && c !== 0x7f;
    })
    .join('');
  const stripped = noControls.replace(XSSY_NAME_CHARS, '').trim();
  const t = stripped.length > 255 ? stripped.slice(0, 255) : stripped;
  return t.length > 0 ? t : 'Untitled';
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
