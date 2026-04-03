import { DrivePhotosError } from './errors.js';
import { validateFileId, validateSize } from './sanitizer.js';
import type { FallbackLevel } from './types.js';

const LEVEL_LABELS: FallbackLevel[] = ['api-thumbnail', 'public-thumbnail', 'lh3', 'uc-export'];

/**
 * Builds ordered image URL candidates for a Drive file id.
 *
 * @param fileId - Drive file id
 * @param size - Desired width in pixels (clamped)
 * @returns URLs in priority order (proxy path first when used with Next.js)
 * @throws {DrivePhotosError} INVALID_FILE_ID or invalid size
 * @security Validates file id before embedding in paths.
 */
export function buildFallbackUrls(fileId: string, size: number): string[] {
  validateFileId(fileId);
  const s = validateSize(size);
  return [
    `/api/photos/${fileId}?size=${s}`,
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w${s}`,
    `https://lh3.googleusercontent.com/d/${fileId}=w${s}`,
    `https://drive.google.com/uc?export=view&id=${fileId}`,
  ];
}

/**
 * Maps index to stable fallback level name for observability.
 *
 * @param index - Zero-based index in {@link buildFallbackUrls} array
 */
export function fallbackIndexToLevel(index: number): FallbackLevel {
  return LEVEL_LABELS[index] ?? 'uc-export';
}

/**
 * Fetches a resource by trying each URL until one returns `ok`.
 *
 * @param urls - URLs to try in order
 * @returns First successful response
 * @throws {DrivePhotosError} IMAGE_NOT_FOUND if all attempts fail
 */
export async function fetchWithFallback(urls: string[]): Promise<Response> {
  let lastErr: Error | undefined;
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i]!;
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 3000);
    try {
      const res = await fetch(url, { signal: controller.signal });
      if (res.ok) {
        if (typeof console !== 'undefined' && console.log) {
          console.log(`[drive-photos] image fallback succeeded: level=${fallbackIndexToLevel(i)}`);
        }
        return res;
      }
      lastErr = new Error(`HTTP ${res.status}`);
    } catch (e) {
      lastErr = e instanceof Error ? e : new Error(String(e));
    } finally {
      clearTimeout(t);
    }
    if (typeof console !== 'undefined' && console.log) {
      console.log(`[drive-photos] image fallback attempt failed: level=${fallbackIndexToLevel(i)}`);
    }
  }
  throw new DrivePhotosError(
    'IMAGE_NOT_FOUND',
    lastErr?.message ? stripSensitive(String(lastErr.message)) : 'All image fallbacks failed',
    true
  );
}

function stripSensitive(s: string): string {
  return s.replace(/key=[^&\s]+/gi, 'key=[redacted]');
}
