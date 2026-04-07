/**
 * A single file returned from Google Drive Files:list for images.
 */
export interface DrivePhoto {
  /** Drive file id. */
  id: string;
  /** Display name (sanitized by this library). */
  name: string;
  mimeType: string;
  createdTime: string;
  thumbnailLink?: string;
  webContentLink?: string;
  size?: string;
}

/**
 * Configuration for listing photos from a Drive folder.
 */
export interface DriveGalleryConfig {
  /** Google API key (never log or expose). */
  apiKey: string;
  /**
   * Folder id or supported Google Drive folder URL.
   * @see normalizeFolderId
   */
  folderId: string;
  /** Page size per request (default 1000, max 1000). */
  pageSize?: number;
  orderBy?: 'createdTime' | 'name' | 'modifiedTime';
  /** Override default image MIME allowlist. */
  mimeTypes?: string[];
  /** Include shared drives (default true). */
  includeSharedDrives?: boolean;
  /**
   * When true, performs an additional Drive listing to detect non-image files in the folder
   * and returns them in {@link FetchPhotosResult.nonImageFiles}. Use for security warnings only;
   * incurs extra API quota.
   */
  warnNonImageFilesInFolder?: boolean;
}

/**
 * Result of listing all pages for a folder.
 */
export interface FetchPhotosResult {
  photos: DrivePhoto[];
  /** Total photos returned (may exceed page size due to pagination). */
  total: number;
  /** True if the Drive API indicated more results exist but were not fetched (should not happen when paginating fully). */
  truncated: boolean;
  /**
   * Present when {@link DriveGalleryConfig.warnNonImageFilesInFolder} was true and non-image files exist.
   */
  nonImageFiles?: DrivePhoto[];
}

/**
 * Named levels in the image URL fallback chain.
 */
export type FallbackLevel = 'api-thumbnail' | 'public-thumbnail' | 'uc-export' | 'lh3';
