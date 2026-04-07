/**
 * Machine-readable error codes for {@link DrivePhotosError}.
 */
export type DrivePhotosErrorCode =
  | 'INVALID_API_KEY'
  | 'INVALID_FOLDER_ID'
  | 'INVALID_FILE_ID'
  | 'INVALID_REQUEST'
  | 'ACCESS_DENIED'
  | 'FOLDER_NOT_FOUND'
  | 'RATE_LIMITED'
  | 'NETWORK_ERROR'
  | 'IMAGE_NOT_FOUND'
  | 'UNSUPPORTED_MEDIA'
  | 'CONFIGURATION_ERROR';

/**
 * Typed error for all drive-photos operations.
 *
 * @example
 * ```ts
 * try {
 *   await listDrivePhotos(config);
 * } catch (e) {
 *   if (e instanceof DrivePhotosError && e.code === 'RATE_LIMITED') {
 *     // backoff
 *   }
 * }
 * ```
 */
export class DrivePhotosError extends Error {
  /**
   * @param code - Stable machine-readable code.
   * @param message - Human-readable message (must not contain secrets).
   * @param retryable - Whether a retry may succeed.
   */
  constructor(
    public readonly code: DrivePhotosErrorCode,
    message: string,
    public readonly retryable: boolean = false
  ) {
    super(message);
    this.name = 'DrivePhotosError';
    Object.setPrototypeOf(this, DrivePhotosError.prototype);
  }
}
