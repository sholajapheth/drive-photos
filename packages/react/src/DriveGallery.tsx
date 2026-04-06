import { useEffect, useMemo, useState } from 'react';
import {
  DrivePhotosError,
  normalizeFolderId,
  validateApiKey,
  type DrivePhoto,
} from '@sholajapheth/drive-photos-core';
import { ImageWithFallback } from './ImageWithFallback.js';
import { PhotoModal } from './Modal.js';
import { SkeletonGrid } from './Skeleton.js';
import { useDriveGallery } from './useDriveGallery.js';

/**
 * Props compatible with `react-gdrive-image-viewer` plus extensions.
 */
export interface DriveGalleryProps {
  gkey: string;
  dirId: string;
  name?: string;
  options?: {
    style?: React.CSSProperties;
    onClick?: {
      modal?: boolean;
      newWindow?: boolean;
    };
    exclude?: Record<string, boolean>;
    attachClass?: Record<string, string>;
    attachId?: Record<string, string>;
    hover?: boolean;
    pageSize?: number;
    imageSize?: number;
    fullscreenSize?: number;
    skeleton?: boolean;
    skeletonCount?: number;
    mimeTypes?: string[];
    includeSharedDrives?: boolean;
    orderBy?: 'createdTime' | 'name' | 'modifiedTime';
    columns?: number;
    gap?: number;
    className?: string;
    errorComponent?: React.ReactNode;
    onPhotoClick?: (photo: DrivePhoto, index: number) => void;
    onLoad?: (photos: DrivePhoto[]) => void;
    onError?: (error: DrivePhotosError) => void;
    /** When set, loads photo list from this URL (recommended for production). */
    listEndpoint?: string;
  };
}

function validateMountProps(gkey: string, dirId: string, listEndpoint?: string): void {
  if (!listEndpoint) {
    validateApiKey(gkey);
  } else if (gkey && gkey.length > 0) {
    validateApiKey(gkey);
  }
  normalizeFolderId(dirId);
}

/**
 * Grid gallery for Google Drive image folders (drop-in compatible with `react-gdrive-image-viewer`).
 *
 * @param props - Viewer configuration
 */
export function DriveGallery({ gkey, dirId, name, options }: DriveGalleryProps) {
  const [propError, setPropError] = useState<DrivePhotosError | null>(null);

  useEffect(() => {
    try {
      validateMountProps(gkey, dirId, options?.listEndpoint);
      setPropError(null);
    } catch (e) {
      const err =
        e instanceof DrivePhotosError
          ? e
          : new DrivePhotosError('CONFIGURATION_ERROR', 'Invalid gallery props');
      setPropError(err);
      options?.onError?.(err);
    }
  }, [gkey, dirId, options?.listEndpoint, options]);

  const { photos, loading, error } = useDriveGallery({
    apiKey: options?.listEndpoint ? undefined : gkey,
    folderId: dirId,
    pageSize: options?.pageSize,
    mimeTypes: options?.mimeTypes,
    orderBy: options?.orderBy,
    includeSharedDrives: options?.includeSharedDrives,
    enabled: !propError,
    listEndpoint: options?.listEndpoint,
    onError: options?.onError,
  });

  const visible = useMemo(() => {
    const ex = options?.exclude ?? {};
    return photos.filter((p) => !ex[p.name]);
  }, [photos, options?.exclude]);

  useEffect(() => {
    if (!loading && !error && visible.length) {
      options?.onLoad?.(visible);
    }
  }, [loading, error, visible, options]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

  const gridStyle: React.CSSProperties = useMemo(
    () => ({
      display: 'grid',
      gap: options?.gap ?? 8,
      gridTemplateColumns:
        options?.columns && options.columns > 0
          ? `repeat(${options.columns}, minmax(0, 1fr))`
          : 'repeat(auto-fill, minmax(160px, 1fr))',
      ...options?.style,
    }),
    [options?.columns, options?.gap, options?.style]
  );

  const showSkeleton = (options?.skeleton ?? true) && loading;

  const err = propError ?? error;

  if (err) {
    return (
      <div className={['drive-photos-root', options?.className].filter(Boolean).join(' ')}>
        {options?.errorComponent ?? <div role="alert">{err.message}</div>}
      </div>
    );
  }

  return (
    <div
      className={['drive-photos-root', options?.className].filter(Boolean).join(' ')}
      aria-busy={showSkeleton ? true : undefined}
      aria-label={name ? `Drive gallery ${name}` : 'Drive photo gallery'}
    >
      {showSkeleton ? (
        <SkeletonGrid
          count={options?.skeletonCount ?? 12}
          columns={options?.columns}
          gap={options?.gap}
        />
      ) : null}

      <div role="list" className="drive-photos-grid" style={gridStyle} hidden={showSkeleton}>
        {visible.map((photo, i) => {
          const onPhotoClick = () => {
            options?.onPhotoClick?.(photo, i);
            if (options?.onClick?.modal) {
              setModalIndex(i);
              setModalOpen(true);
            }
            if (options?.onClick?.newWindow) {
              const url =
                photo.webContentLink ?? `https://drive.google.com/file/d/${photo.id}/view`;
              window.open(url, '_blank', 'noopener,noreferrer');
            }
          };

          return (
            <div
              role="listitem"
              key={photo.id}
              className="drive-photos-item"
              id={options?.attachId?.[photo.name]}
            >
              <ImageWithFallback
                photo={photo}
                size={options?.imageSize ?? 800}
                priority={i < 6}
                hover={options?.hover}
                className={options?.attachClass?.[photo.name]}
                onClick={onPhotoClick}
              />
            </div>
          );
        })}
      </div>

      <PhotoModal
        open={modalOpen}
        photos={visible}
        index={modalIndex}
        onClose={() => setModalOpen(false)}
        onIndexChange={setModalIndex}
        fullscreenSize={options?.fullscreenSize ?? 1920}
      />
    </div>
  );
}
