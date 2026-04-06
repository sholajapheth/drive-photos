import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DrivePhotosError,
  listDrivePhotos,
  normalizeFolderId,
  photoListCache,
  RateLimiter,
  validateConfig,
  type DrivePhoto,
  type FetchPhotosResult,
} from '@sholajapheth/drive-photos-core';

/**
 * Options for {@link useDriveGallery}.
 */
export interface UseDriveGalleryOptions {
  /** Google API key (never logged). Omit when using {@link listEndpoint} only. */
  apiKey?: string;
  /** Folder id or supported Drive URL. */
  folderId: string;
  pageSize?: number;
  mimeTypes?: string[];
  orderBy?: 'createdTime' | 'name' | 'modifiedTime';
  includeSharedDrives?: boolean;
  /** When false, skips fetching until set true. */
  enabled?: boolean;
  /** Cache list results in memory (default true). */
  cacheResults?: boolean;
  /**
   * When set, performs `GET` against this URL (with `folderId` query) instead of calling Google from the client.
   * Recommended for production to keep API keys on the server.
   */
  listEndpoint?: string;
  /** Called when an error occurs after retries. */
  onError?: (error: DrivePhotosError) => void;
}

/**
 * Return value of {@link useDriveGallery}.
 */
export interface UseDriveGalleryReturn {
  photos: DrivePhoto[];
  loading: boolean;
  error: DrivePhotosError | null;
  total: number;
  refetch: () => void;
}

const rateLimiter = new RateLimiter(60, 60_000);

/**
 * Headless hook that loads Drive photos with caching, rate limiting, and safe retries.
 *
 * @param options - Configuration
 * @returns Photos, loading state, error, total count, and refetch
 */
export function useDriveGallery(options: UseDriveGalleryOptions): UseDriveGalleryReturn {
  const {
    apiKey,
    folderId,
    pageSize,
    mimeTypes,
    orderBy,
    includeSharedDrives,
    enabled = true,
    cacheResults = true,
    listEndpoint,
    onError,
  } = options;

  const [photos, setPhotos] = useState<DrivePhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<DrivePhotosError | null>(null);
  const [total, setTotal] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const cacheKey = useMemo(() => {
    try {
      const id = normalizeFolderId(folderId);
      return `${id}:${pageSize ?? 1000}:${orderBy ?? 'createdTime'}:${mimeTypes?.join(',') ?? 'default'}:${listEndpoint ?? 'direct'}`;
    } catch {
      return null;
    }
  }, [folderId, pageSize, orderBy, mimeTypes, listEndpoint]);

  const runFetch = useCallback(async () => {
    if (!enabled || cacheKey === null) return;
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);
    setError(null);

    if (!rateLimiter.isAllowed()) {
      const err = new DrivePhotosError('RATE_LIMITED', 'Client rate limit exceeded', true);
      setError(err);
      setLoading(false);
      onError?.(err);
      return;
    }

    if (cacheResults) {
      const cached = photoListCache.get(cacheKey);
      if (cached) {
        setPhotos(cached.photos);
        setTotal(cached.total);
        setLoading(false);
        return;
      }
    }

    const fetchList = async (retryNetwork: boolean): Promise<FetchPhotosResult> => {
      if (listEndpoint) {
        const id = normalizeFolderId(folderId);
        const u = new URL(
          listEndpoint,
          typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
        );
        u.searchParams.set('folderId', id);
        const res = await fetch(u.toString(), { signal: ac.signal });
        if (!res.ok) {
          const text = await res.text();
          throw new DrivePhotosError(
            'NETWORK_ERROR',
            `List endpoint failed: ${res.status} ${text.slice(0, 200)}`,
            res.status >= 500
          );
        }
        return (await res.json()) as FetchPhotosResult;
      }

      if (!apiKey) {
        throw new DrivePhotosError(
          'CONFIGURATION_ERROR',
          'apiKey is required when listEndpoint is not set'
        );
      }

      validateConfig({
        apiKey,
        folderId,
        pageSize,
        mimeTypes,
        orderBy,
        includeSharedDrives,
      });

      try {
        return await listDrivePhotos({
          apiKey,
          folderId,
          pageSize,
          mimeTypes,
          orderBy,
          includeSharedDrives,
        });
      } catch (e) {
        if (
          retryNetwork &&
          e instanceof DrivePhotosError &&
          e.code === 'NETWORK_ERROR' &&
          !ac.signal.aborted
        ) {
          return fetchList(false);
        }
        throw e;
      }
    };

    try {
      const result = await fetchList(true);
      if (ac.signal.aborted) return;
      setPhotos(result.photos);
      setTotal(result.total);
      if (cacheResults && cacheKey) {
        photoListCache.set(cacheKey, result);
      }
    } catch (e) {
      if (ac.signal.aborted) return;
      const err =
        e instanceof DrivePhotosError
          ? e
          : new DrivePhotosError(
              'NETWORK_ERROR',
              e instanceof Error ? e.message : 'Unknown error',
              true
            );
      setError(err);
      onError?.(err);
    } finally {
      if (!ac.signal.aborted) setLoading(false);
    }
  }, [
    apiKey,
    folderId,
    pageSize,
    mimeTypes,
    orderBy,
    includeSharedDrives,
    enabled,
    cacheResults,
    listEndpoint,
    onError,
    cacheKey,
  ]);

  useEffect(() => {
    void runFetch();
    return () => {
      abortRef.current?.abort();
    };
  }, [runFetch]);

  return {
    photos,
    loading,
    error,
    total,
    refetch: () => {
      void runFetch();
    },
  };
}
