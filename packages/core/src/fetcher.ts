import { DrivePhotosError } from './errors.js';
import { buildMimeQuery } from './mime.js';
import { SUPPORTED_MIME_TYPES } from './mime.js';
import { normalizeFolderId } from './normalizer.js';
import { sanitizePhotoName, validateConfig } from './sanitizer.js';
import type { DriveGalleryConfig, DrivePhoto, FetchPhotosResult } from './types.js';

function stripSensitiveFromText(text: string): string {
  return text
    .replace(/key=[^&\s]+/gi, 'key=[redacted]')
    .replace(/access_token=[^&\s]+/gi, 'access_token=[redacted]');
}

function parseDriveErrorBody(text: string): string {
  try {
    const j = JSON.parse(text) as { error?: { message?: string } };
    const msg = j.error?.message;
    return msg ? stripSensitiveFromText(msg) : stripSensitiveFromText(text);
  } catch {
    return stripSensitiveFromText(text.slice(0, 500));
  }
}

/**
 * Lists all image files in a folder using Drive API v3 with full pagination.
 *
 * @param config - Gallery configuration (api key is never logged or echoed)
 * @returns All photos across pages
 * @throws {DrivePhotosError} On validation, HTTP, or network errors
 */
export async function listDrivePhotos(config: DriveGalleryConfig): Promise<FetchPhotosResult> {
  validateConfig(config);
  const folderId = normalizeFolderId(config.folderId);
  const mimeTypes = config.mimeTypes?.length ? config.mimeTypes : [...SUPPORTED_MIME_TYPES];
  const mimeQuery = buildMimeQuery(mimeTypes);
  const pageSize = Math.min(config.pageSize ?? 1000, 1000);
  const orderField = config.orderBy ?? 'createdTime';
  const orderBy = `${orderField} desc`;

  const q = `'${folderId}' in parents and trashed=false and ${mimeQuery}`;
  const fields =
    'nextPageToken,files(id,name,mimeType,createdTime,thumbnailLink,webContentLink,size)';

  const photos: DrivePhoto[] = [];
  let nextPageToken: string | undefined;

  do {
    const params = new URLSearchParams({
      q,
      fields,
      orderBy,
      pageSize: String(pageSize),
      supportsAllDrives: 'true',
      includeItemsFromAllDrives: String(config.includeSharedDrives ?? true),
      key: config.apiKey,
    });
    if (nextPageToken) params.set('pageToken', nextPageToken);

    const url = `https://www.googleapis.com/drive/v3/files?${params.toString()}`;

    let res: Response;
    try {
      res = await fetch(url);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Network request failed';
      throw new DrivePhotosError('NETWORK_ERROR', stripSensitiveFromText(msg), true);
    }

    const bodyText = await res.text();

    if (!res.ok) {
      const safeDetail = parseDriveErrorBody(bodyText);
      if (res.status === 400) {
        throw new DrivePhotosError('INVALID_REQUEST', safeDetail || 'Invalid Drive API request');
      }
      if (res.status === 403) {
        throw new DrivePhotosError(
          'ACCESS_DENIED',
          'Check folder permissions and API key restrictions'
        );
      }
      if (res.status === 404) {
        throw new DrivePhotosError('FOLDER_NOT_FOUND', 'Folder does not exist or is not public');
      }
      if (res.status === 429) {
        throw new DrivePhotosError('RATE_LIMITED', 'Google Drive API quota exceeded', true);
      }
      throw new DrivePhotosError(
        'NETWORK_ERROR',
        safeDetail || `Unexpected HTTP ${res.status}`,
        res.status >= 500
      );
    }

    let data: {
      nextPageToken?: string;
      files?: Array<{
        id?: string;
        name?: string;
        mimeType?: string;
        createdTime?: string;
        thumbnailLink?: string;
        webContentLink?: string;
        size?: string;
      }>;
    };
    try {
      data = JSON.parse(bodyText) as typeof data;
    } catch {
      throw new DrivePhotosError('INVALID_REQUEST', 'Invalid JSON from Drive API');
    }

    for (const f of data.files ?? []) {
      if (!f.id || !f.name || !f.mimeType || !f.createdTime) continue;
      photos.push({
        id: f.id,
        name: sanitizePhotoName(f.name),
        mimeType: f.mimeType,
        createdTime: f.createdTime,
        thumbnailLink: f.thumbnailLink,
        webContentLink: f.webContentLink,
        size: f.size,
      });
    }

    nextPageToken = data.nextPageToken;
  } while (nextPageToken);

  return {
    photos,
    total: photos.length,
    truncated: false,
  };
}
