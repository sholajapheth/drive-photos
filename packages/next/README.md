# @drive-photos/next

Next.js App Router helpers for listing Drive photos and proxying images without exposing API keys to browsers.

## Environment

- `GOOGLE_DRIVE_API_KEY` — server-only API key
- `GOOGLE_DRIVE_FOLDER_ID` — default folder id (optional if using `allowDynamicFolder`)

## Routes

### List: `app/api/photos/route.ts`

```ts
import { createPhotosRoute } from '@drive-photos/next';

export const { GET } = createPhotosRoute({
  apiKey: process.env.GOOGLE_DRIVE_API_KEY!,
  folderId: process.env.GOOGLE_DRIVE_FOLDER_ID!,
  allowDynamicFolder: true,
});
```

### Proxy: `app/api/photos/[id]/route.ts`

```ts
import { createPhotoProxyRoute } from '@drive-photos/next';

export const { GET } = createPhotoProxyRoute({
  apiKey: process.env.GOOGLE_DRIVE_API_KEY!,
});
```

### Middleware: `middleware.ts`

```ts
import { drivePhotosMiddleware } from '@drive-photos/next';

export default drivePhotosMiddleware();
```

## `next.config.js` remote patterns

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'drive.google.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
};
module.exports = nextConfig;
```

## Author

[Shola Japheth](https://sholajapheth.com/) · [GitHub](https://github.com/sholajapheth)
