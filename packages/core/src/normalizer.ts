import { DrivePhotosError } from './errors.js';

const ID_PATTERN = /^[A-Za-z0-9_-]{10,200}$/;

/**
 * Extracts and validates a Drive folder id from raw input (id or common URL shapes).
 *
 * @param input - Folder id or Google Drive folder URL
 * @returns Normalized folder id
 * @throws {DrivePhotosError} INVALID_FOLDER_ID if input cannot be parsed or fails validation
 *
 * @example
 * ```ts
 * normalizeFolderId('https://drive.google.com/drive/folders/abcXYZ123')
 * // 'abcXYZ123'
 * ```
 */
export function normalizeFolderId(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new DrivePhotosError('INVALID_FOLDER_ID', 'Folder id is empty');
  }

  let candidate = trimmed;

  if (!/^https?:\/\//i.test(trimmed) && !trimmed.includes('/') && !trimmed.includes('?')) {
    candidate = trimmed;
  } else {
    try {
      const u = new URL(trimmed);
      const host = u.hostname.toLowerCase();
      if (!host.endsWith('google.com')) {
        throw new DrivePhotosError('INVALID_FOLDER_ID', 'Folder URL must be a Google Drive URL');
      }
      if (u.pathname.includes('/folders/')) {
        const seg = u.pathname.split('/folders/')[1]?.split('/')[0];
        if (seg) candidate = seg.split('?')[0] ?? seg;
      } else if (u.searchParams.has('id')) {
        candidate = u.searchParams.get('id') ?? '';
      } else {
        throw new DrivePhotosError('INVALID_FOLDER_ID', 'Could not extract folder id from URL');
      }
    } catch (e) {
      if (e instanceof DrivePhotosError) throw e;
      throw new DrivePhotosError('INVALID_FOLDER_ID', 'Invalid folder URL');
    }
  }

  const id = candidate.trim();
  if (!ID_PATTERN.test(id)) {
    throw new DrivePhotosError(
      'INVALID_FOLDER_ID',
      'Folder id must be 10-200 characters: letters, numbers, hyphens, underscores'
    );
  }

  return id;
}
