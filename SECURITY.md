# Security Policy

## What is protected

- **API keys**: Never included in error messages, logs, or HTTP responses from this library’s helpers. Prefer server-side routes (`@sholajapheth/drive-photos-next`) and avoid embedding keys in client bundles.
- **Inputs**: Folder ids, file ids, and sizes are validated before any network call. File ids are restricted to safe characters to mitigate path traversal in proxy routes.
- **SSRF**: The image proxy only fetches `https` URLs on an explicit hostname allowlist (`www.googleapis.com`, `drive.google.com`, `lh3.googleusercontent.com`).
- **Rate limiting**: Client-side throttling in `useDriveGallery` and optional Next.js middleware for `/api/photos` routes.

## Reporting a vulnerability

Please contact [Shola Japheth](https://github.com/sholajapheth) privately with reproduction steps and impact (for example via GitHub). Do not open public issues for undisclosed vulnerabilities.

## Supported versions

Security fixes are applied to the latest minor release line. Older lines may not receive backports.

## Known limitations

- Client-side use of `gkey` with direct Drive API access cannot hide the key from end users; use server routes for sensitive deployments.
- Middleware rate limiting uses in-memory state and is best-effort in serverless/edge environments with many instances.
