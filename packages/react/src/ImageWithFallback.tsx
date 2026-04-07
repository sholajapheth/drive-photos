import { useCallback, useMemo, useState } from 'react';
import {
  buildFallbackUrls,
  sanitizePhotoName,
  type DrivePhoto,
} from '@sholajapheth/drive-photos-core';

/**
 * Props for {@link ImageWithFallback}.
 */
export interface ImageWithFallbackProps {
  photo: DrivePhoto;
  size?: number;
  priority?: boolean;
  onClick?: () => void;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  hover?: boolean;
  /** Base path for the first-party image proxy (default `/api/photos`). */
  proxyBase?: string;
}

/**
 * Image that walks the Drive image fallback chain on load error.
 *
 * @param props - Display options
 */
export function ImageWithFallback({
  photo,
  size = 800,
  priority = false,
  onClick,
  className,
  id,
  style,
  hover,
  proxyBase,
}: ImageWithFallbackProps) {
  const urls = useMemo(
    () => buildFallbackUrls(photo.id, size, { proxyBase: proxyBase ?? '/api/photos' }),
    [photo.id, size, proxyBase]
  );
  const [index, setIndex] = useState(0);
  const [broken, setBroken] = useState(false);
  const src = urls[index] ?? '';

  const handleError = useCallback(() => {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn(
        `[drive-photos] image fallback attempt ${index + 1} of ${urls.length} (no sensitive data)`
      );
    }
    if (index + 1 < urls.length) {
      setIndex((i) => i + 1);
    } else {
      setBroken(true);
    }
  }, [index, urls.length]);

  const alt = sanitizePhotoName(photo.name);

  if (broken) {
    return (
      <div
        className={['drive-photos-placeholder', hover ? 'drive-photos-hover' : '', className ?? '']
          .filter(Boolean)
          .join(' ')}
        id={id}
        style={style}
        onClick={onClick}
        role="presentation"
      />
    );
  }

  return (
    <img
      className={['drive-photos-img', hover ? 'drive-photos-hover' : '', className ?? '']
        .filter(Boolean)
        .join(' ')}
      id={id}
      style={style}
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      onClick={onClick}
      onError={handleError}
    />
  );
}
