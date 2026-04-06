# @sholajapheth/drive-photos-core

Framework-agnostic utilities for listing Google Drive images, validating inputs, caching, and building image URL fallbacks.

## API

### `listDrivePhotos(config: DriveGalleryConfig): Promise<FetchPhotosResult>`

Paginates through Drive `files.list` for a folder and returns sanitized photos.

### `normalizeFolderId(input: string): string`

Parses raw ids and common Drive folder URLs.

### Validators (`sanitizer.ts`)

| Function            | Purpose                             |
| ------------------- | ----------------------------------- |
| `validateApiKey`    | API key shape                       |
| `validateFileId`    | File id for proxy safety            |
| `validateSize`      | Clamps 100–1920                     |
| `sanitizePhotoName` | Display-safe file names             |
| `validateConfig`    | Aggregates configuration validation |

### `buildFallbackUrls(fileId, size)`

Returns ordered image URLs (proxy path first, then public Google endpoints).

### `fetchWithFallback(urls)`

Tries each URL with a 3s timeout per attempt.

### `LRUCache` / `photoListCache`

In-memory cache for list results (default TTL 5 minutes, max 10 entries).

### `RateLimiter`

Sliding-window limiter for client usage.

## Configuration

| Field                 | Type                                  | Default       | Description                |
| --------------------- | ------------------------------------- | ------------- | -------------------------- |
| `apiKey`              | `string`                              | —             | Google API key             |
| `folderId`            | `string`                              | —             | Folder id or supported URL |
| `pageSize`            | `number`                              | `1000`        | Page size (max 1000)       |
| `orderBy`             | `createdTime \| name \| modifiedTime` | `createdTime` | Sort field                 |
| `mimeTypes`           | `string[]`                            | built-in list | MIME allowlist             |
| `includeSharedDrives` | `boolean`                             | `true`        | Shared drives              |

## Error codes

| Code                  | Meaning              |
| --------------------- | -------------------- |
| `INVALID_API_KEY`     | Malformed key        |
| `INVALID_FOLDER_ID`   | Unparsable folder    |
| `INVALID_FILE_ID`     | Unsafe file id       |
| `INVALID_REQUEST`     | Drive API 400        |
| `ACCESS_DENIED`       | 403 from Drive       |
| `FOLDER_NOT_FOUND`    | 404 from Drive       |
| `RATE_LIMITED`        | 429 from Drive       |
| `NETWORK_ERROR`       | Network/unknown HTTP |
| `IMAGE_NOT_FOUND`     | All fallbacks failed |
| `CONFIGURATION_ERROR` | Invalid options      |

## Author

[Shola Japheth](https://sholajapheth.com/) · [GitHub](https://github.com/sholajapheth)
