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

async function fetchDriveWith429Backoff(url: string, maxAttempts = 2): Promise<Response> {
  let attempt = 0;
  while (attempt < maxAttempts) {
    const res = await fetch(url);
    if (res.status === 429 && attempt < maxAttempts - 1) {
      const ra = res.headers.get('retry-after');
      const waitMs = ra
        ? Math.min(parseInt(ra, 10) * 1000, 60_000)
        : Math.min(100 * Math.pow(2, attempt), 32_000);
      await new Promise((r) => setTimeout(r, waitMs));
      attempt++;
      continue;
    }
    return res;
  }
  return fetch(url);
}

/**
 * Lists non-image, non-folder files in a folder (for security warnings).
 */
async function listNonImageFilesInFolder(
  config: DriveGalleryConfig,
  folderId: string
): Promise<DrivePhoto[]> {
  const out: DrivePhoto[] = [];
  let nextPageToken: string | undefined;
  const pageSize = Math.min(config.pageSize ?? 1000, 1000);
  const orderBy = `${config.orderBy ?? 'createdTime'} desc`;
  const fields =
    'nextPageToken,files(id,name,mimeType,createdTime,thumbnailLink,webContentLink,size)';

  do {
    const params = new URLSearchParams({
      q: `'${folderId}' in parents and trashed=false`,
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
      res = await fetchDriveWith429Backoff(url);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Network request failed';
      throw new DrivePhotosError('NETWORK_ERROR', stripSensitiveFromText(msg), true);
    }

    const bodyText = await res.text();
    if (!res.ok) {
      return out;
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
      return out;
    }

    for (const f of data.files ?? []) {
      if (!f.id || !f.name || !f.mimeType || !f.createdTime) continue;
      if (f.mimeType === 'application/vnd.google-apps.folder') continue;
      if (f.mimeType.startsWith('image/')) continue;
      out.push({
        id: f.id,
        name: sanitizePhotoName(f.name),
        mimeType: f.mimeType,
        createdTime: f.createdTime,
        thumbnailLink: f.thumbnailLink,
        webContentLink: f.webContentLink,
        size: f.size,
      });
      if (out.length >= 50) {
        return out;
      }
    }

    nextPageToken = data.nextPageToken;
  } while (nextPageToken);

  return out;
}

/**
 * Lists all image files in a folder using Drive API v3 with full pagination.
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
      res = await fetchDriveWith429Backoff(url);
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

  let nonImageFiles: DrivePhoto[] | undefined;
  if (config.warnNonImageFilesInFolder) {
    nonImageFiles = await listNonImageFilesInFolder(config, folderId);
    if (nonImageFiles.length > 0) {
      const sample = nonImageFiles
        .slice(0, 3)
        .map((f) => f.name)
        .join(', ');
      if (typeof console !== 'undefined' && console.warn) {
        console.warn(
          `[drive-photos] Your Google Drive folder contains ${nonImageFiles.length} non-image file(s): ${sample}` +
            (nonImageFiles.length > 3 ? ` and ${nonImageFiles.length - 3} more` : '') +
            '. These may be reachable via your shared folder link — remove sensitive documents.'
        );
      }
    }
  }

  return {
    photos,
    total: photos.length,
    truncated: false,
    ...(nonImageFiles && nonImageFiles.length > 0 ? { nonImageFiles } : {}),
  };
}
