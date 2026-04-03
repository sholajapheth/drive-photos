import type { CSSProperties } from 'react';

/**
 * Props for {@link SkeletonGrid}.
 */
export interface SkeletonGridProps {
  count: number;
  columns?: number;
  gap?: number;
}

/**
 * CSS-only animated skeleton placeholders for the gallery grid.
 *
 * @param props - Layout options
 */
export function SkeletonGrid({ count, columns, gap = 8 }: SkeletonGridProps) {
  const style: CSSProperties = {
    display: 'grid',
    gap,
    gridTemplateColumns:
      columns && columns > 0
        ? `repeat(${columns}, minmax(0, 1fr))`
        : 'repeat(auto-fill, minmax(160px, 1fr))',
  };

  return (
    <div className="drive-photos-skeleton-grid" style={style} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="drive-photos-skeleton" style={{ aspectRatio: '4 / 3' }} />
      ))}
    </div>
  );
}
