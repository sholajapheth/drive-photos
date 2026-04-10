import { DrivePhotosError } from './errors.js';
import {
  validateFallbackUrl,
  validateFileId,
  validateRelativeProxyUrl,
  validateSize,
} from './sanitizer.js';
import type { FallbackLevel } from './types.js';

const LEVEL_LABELS: FallbackLevel[] = ['api-thumbnail', 'public-thumbnail', 'lh3', 'uc-export'];

function getOriginBase(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return 'http://localhost';
}

/**
 * Resolves redirect Location against the request URL.
 */
function resolveRedirectUrl(current: string, location: string): string {
  const base = current.startsWith('/') ? getOriginBase() : current;
  return new URL(location, base).href;
}

/**
 * Validates redirect target before following (SSRF / open-redirect mitigation).
 */
function validateRedirectTarget(href: string, proxyBasePrefix: string): void {
  if (href.startsWith('https://')) {
    validateFallbackUrl(href);
    return;
  }
  if (href.startsWith('/')) {
    validateRelativeProxyUrl(href, proxyBasePrefix);
    return;
  }
  throw new DrivePhotosError('INVALID_REQUEST', 'Unsupported redirect target');
}

export type BuildFallbackUrlsOptions = {
  /** Base path for the first-party image proxy (default `/api/photos`). */
  proxyBase?: string;
};

/**
 * Builds ordered image URL candidates for a Drive file id.
 */
export function buildFallbackUrls(
  fileId: string,
  size: number,
  options?: BuildFallbackUrlsOptions
): string[] {
  validateFileId(fileId);
  const s = validateSize(size);
  const base = (options?.proxyBase ?? '/api/photos').replace(/\/$/, '');
  return [
    `${base}/${fileId}?size=${s}`,
    `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w${s}`,
    `https://lh3.googleusercontent.com/d/${encodeURIComponent(fileId)}=w${s}`,
    `https://drive.google.com/uc?export=view&id=${encodeURIComponent(fileId)}`,
  ];
}

/**
 * Maps index to stable fallback level name for observability.
 */
export function fallbackIndexToLevel(index: number): FallbackLevel {
  return LEVEL_LABELS[index] ?? 'uc-export';
}

function stripSensitive(s: string): string {
  return s.replace(/key=[^&\s]+/gi, 'key=[redacted]');
}

const DEFAULT_PROXY_PREFIX = '/api/photos';

/**
 * Fetches a URL with manual redirect handling; validates each hop against the allowlist.
 * Use for browser-side fallback chain and server-side proxy fetches.
 *
 * @security redirect: 'manual' — does not follow redirects blindly; each Location is validated.
 */
export async function fetchUrlWithSsrfGuard(
  rawUrl: string,
  init: RequestInit & { timeoutMs?: number; proxyBasePrefix?: string } = {}
): Promise<Response> {
  const timeoutMs = init.timeoutMs ?? 8000;
  const proxyBasePrefix = init.proxyBasePrefix ?? DEFAULT_PROXY_PREFIX;
  const restInit = { ...init };
  delete (restInit as { timeoutMs?: number }).timeoutMs;
  delete (restInit as { proxyBasePrefix?: string }).proxyBasePrefix;

  const doFetch = async (url: string, depth: number): Promise<Response> => {
    if (depth > 3) {
      throw new DrivePhotosError('INVALID_REQUEST', 'Too many redirects');
    }
    if (url.startsWith('/')) {
      validateRelativeProxyUrl(url, proxyBasePrefix);
    } else {
      validateFallbackUrl(url);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        ...restInit,
        signal: controller.signal,
        redirect: 'manual',
      });

      if (res.status >= 300 && res.status < 400) {
        const loc = res.headers.get('location');
        if (!loc) {
          return res;
        }
        const next = resolveRedirectUrl(url, loc);
        validateRedirectTarget(next, proxyBasePrefix);
        return doFetch(next, depth + 1);
      }

      return res;
    } finally {
      clearTimeout(timer);
    }
  };

  return doFetch(rawUrl, 0);
}

export type FetchWithFallbackOptions = {
  proxyBasePrefix?: string;
};

/**
 * Fetches a resource by trying each URL until one returns `ok`.
 */
export async function fetchWithFallback(
  urls: string[],
  options?: FetchWithFallbackOptions
): Promise<Response> {
  let lastErr: Error | undefined;
  const proxyBasePrefix = options?.proxyBasePrefix ?? DEFAULT_PROXY_PREFIX;
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i]!;
    try {
      const res = await fetchUrlWithSsrfGuard(url, {
        timeoutMs: 3000,
        proxyBasePrefix,
      });
      if (res.ok) {
        if (typeof console !== 'undefined' && console.log) {
          console.log(`[drive-photos] image fallback succeeded: level=${fallbackIndexToLevel(i)}`);
        }
        return res;
      }
      lastErr = new Error(`HTTP ${res.status}`);
    } catch (e) {
      lastErr = e instanceof Error ? e : new Error(String(e));
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
