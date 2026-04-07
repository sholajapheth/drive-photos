/**
 * @packageDocumentation
 * React components and hooks for Google Drive photo galleries.
 *
 * **`DriveGalleryProps.gkey`:** Deprecated for production — passing an API key from the client exposes it in
 * your bundle. Use `options.listEndpoint` and `options.proxyEndpoint` with `@sholajapheth/drive-photos-next`
 * instead. See https://drive-photos.dev/docs#api-key-security
 */

export { DriveGallery, type DriveGalleryProps } from './DriveGallery.js';
export { ImageWithFallback, type ImageWithFallbackProps } from './ImageWithFallback.js';
export { PhotoModal, type PhotoModalProps } from './Modal.js';
export { SkeletonGrid, type SkeletonGridProps } from './Skeleton.js';
export {
  useDriveGallery,
  type UseDriveGalleryOptions,
  type UseDriveGalleryReturn,
} from './useDriveGallery.js';

export { DrivePhotosError } from '@sholajapheth/drive-photos-core';
export type { DrivePhoto } from '@sholajapheth/drive-photos-core';
