import {
  DrivePhotosError,
  listDrivePhotos,
  normalizeFolderId,
  validateConfig,
  type DriveGalleryConfig,
} from '@sholajapheth/drive-photos-core';
import { NextResponse, type NextRequest } from 'next/server';

export type PhotosRouteConfig = DriveGalleryConfig & {
  /** Allow `folderId` query param to override configured folder (validated). */
  allowDynamicFolder?: boolean;
};

function resolveConfig(request: NextRequest, config: PhotosRouteConfig): DriveGalleryConfig {
  const apiKey =
    config.apiKey ||
    (typeof process !== 'undefined' ? process.env.GOOGLE_DRIVE_API_KEY : undefined) ||
    '';
  const envFolder =
    (typeof process !== 'undefined' ? process.env.GOOGLE_DRIVE_FOLDER_ID : undefined) || '';
  const baseFolder = config.folderId || envFolder;

  let folderId = baseFolder;
  if (config.allowDynamicFolder) {
    const q = request.nextUrl.searchParams.get('folderId');
    if (q) folderId = q;
  }

  return {
    apiKey,
    folderId,
    pageSize: config.pageSize,
    orderBy: config.orderBy,
    mimeTypes: config.mimeTypes,
    includeSharedDrives: config.includeSharedDrives,
  };
}

/**
 * Creates a Next.js App Router `GET` handler that lists Drive photos as JSON.
 *
 * @param config - Drive gallery configuration (falls back to env when partial)
 * @returns Route exports `{ GET }`
 * @security Never exposes the API key in responses.
 */
export function createPhotosRoute(config: PhotosRouteConfig) {
  async function GET(request: NextRequest) {
    try {
      const resolved = resolveConfig(request, config);
      validateConfig(resolved);
      resolved.folderId = normalizeFolderId(resolved.folderId);
      const result = await listDrivePhotos(resolved);
      return NextResponse.json(result, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      });
    } catch (e) {
      const err =
        e instanceof DrivePhotosError
          ? e
          : new DrivePhotosError('NETWORK_ERROR', 'Unexpected error');
      const status =
        err.code === 'FOLDER_NOT_FOUND'
          ? 404
          : err.code === 'ACCESS_DENIED'
            ? 403
            : err.code === 'RATE_LIMITED'
              ? 429
              : 500;
      return NextResponse.json({ error: { code: err.code, message: err.message } }, { status });
    }
  }

  return { GET };
}
