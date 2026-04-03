/**
 * @packageDocumentation
 * Next.js App Router integration for drive-photos (list route, image proxy, middleware).
 */

export { createPhotosRoute, type PhotosRouteConfig } from './photos-route.js';
export {
  assertAllowedImageUrl,
  createPhotoProxyRoute,
  type PhotoProxyRouteConfig,
} from './photo-proxy-route.js';
export { drivePhotosMiddleware, type DrivePhotosMiddlewareConfig } from './middleware.js';
