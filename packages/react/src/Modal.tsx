import { useCallback, useEffect, useId, useRef, type KeyboardEvent } from 'react';
import { sanitizePhotoName, type DrivePhoto } from '@drive-photos/core';
import { ImageWithFallback } from './ImageWithFallback.js';

/**
 * Props for {@link PhotoModal}.
 */
export interface PhotoModalProps {
  open: boolean;
  photos: DrivePhoto[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
  fullscreenSize?: number;
  titleId?: string;
}

/**
 * Accessible lightbox with keyboard navigation and focus management.
 *
 * @param props - Modal state
 */
export function PhotoModal({
  open,
  photos,
  index,
  onClose,
  onIndexChange,
  fullscreenSize = 1920,
  titleId,
}: PhotoModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const autoId = useId();
  const labelId = titleId ?? `drive-photos-modal-${autoId}`;

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const el = dialogRef.current;
    el?.focus();
  }, [open, index]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && index > 0) {
        onIndexChange(index - 1);
      } else if (e.key === 'ArrowRight' && index < photos.length - 1) {
        onIndexChange(index + 1);
      }
    },
    [index, onClose, onIndexChange, photos.length]
  );

  if (!open || photos.length === 0) return null;

  const photo = photos[index]!;

  return (
    <div
      className="drive-photos-modal-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
        tabIndex={-1}
        className="drive-photos-modal"
        onKeyDown={onKeyDown}
      >
        <button type="button" className="drive-photos-modal-close" onClick={onClose}>
          Close
        </button>
        <div className="drive-photos-modal-body">
          <ImageWithFallback
            photo={photo}
            size={fullscreenSize}
            priority
            className="drive-photos-modal-img"
          />
        </div>
        <p id={labelId} className="drive-photos-modal-caption">
          {sanitizePhotoName(photo.name)}
        </p>
      </div>
    </div>
  );
}
