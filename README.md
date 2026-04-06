# drive-photos

**Google Drive photo folders in your web app — batteries included.**

[![npm version](https://img.shields.io/npm/v/@sholajapheth/drive-photos-react.svg)](https://www.npmjs.com/package/@sholajapheth/drive-photos-react)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Features

| Core                             | React & Next                                                        |
| -------------------------------- | ------------------------------------------------------------------- |
| Strict validation & typed errors | Drop-in `react-gdrive-image-viewer` compatibility (`gkey`, `dirId`) |
| Full Drive Files:list pagination | Pagination-ready lists + LRU caching                                |
| 4-level image URL fallbacks      | Loading skeletons, modal lightbox, hooks                            |
| Client rate limiting             | Next.js route handlers + middleware                                 |
| Zero runtime deps in core        | TypeScript strict, ESM + CJS                                        |

## Quickstart

1. **Install**

   ```bash
   npm install @sholajapheth/drive-photos-react
   ```

2. **Configure secrets on the server** (recommended): set `GOOGLE_DRIVE_API_KEY` and expose a list route using `@sholajapheth/drive-photos-next` (see package README).

3. **Render the gallery**

   ```tsx
   import { DriveGallery } from '@sholajapheth/drive-photos-react';
   import '@sholajapheth/drive-photos-react/styles.css';

   export function Album() {
     return (
       <DriveGallery
         gkey={process.env.NEXT_PUBLIC_DRIVE_KEY!}
         dirId={process.env.NEXT_PUBLIC_DRIVE_FOLDER!}
         options={{ listEndpoint: '/api/photos' }}
       />
     );
   }
   ```

   For local development only, you can omit `listEndpoint` and call Google directly from the browser (not recommended for production).

## Packages

| Package                            | Purpose                                                                          |
| ---------------------------------- | -------------------------------------------------------------------------------- |
| `@sholajapheth/drive-photos-core`  | Drive API listing, normalization, sanitization, caching, fallbacks               |
| `@sholajapheth/drive-photos-react` | `<DriveGallery />`, `useDriveGallery`, UI primitives                             |
| `@sholajapheth/drive-photos-next`  | App Router `createPhotosRoute`, `createPhotoProxyRoute`, `drivePhotosMiddleware` |

## Migrating from `react-gdrive-image-viewer`

| Before                                      | After                                                             |
| ------------------------------------------- | ----------------------------------------------------------------- |
| `import X from 'react-gdrive-image-viewer'` | `import { DriveGallery } from '@sholajapheth/drive-photos-react'` |
| `<Viewer gkey={...} dirId={...} />`         | `<DriveGallery gkey={...} dirId={...} />`                         |
| `options`                                   | Same shape, plus `imageSize`, `listEndpoint`, `skeleton`, etc.    |

## Docs app on Vercel

Use the **repository root** as the Vercel **Root Directory** (`.` or leave empty). The root [`vercel.json`](./vercel.json) runs `npm ci` and `npx turbo run build --filter=drive-photos-docs...` so the monorepo lockfile and workspace packages are available.

Do **not** commit a second `vercel.json` under `apps/docs` that runs `cd ../..` when the project root is already the repo root — that escapes the repo and breaks install.

If you must set **Root Directory** to `apps/docs` only, enable **Include source files outside of the Root Directory in the Build Step** (Project → Settings → General) and set **Install Command** to `cd ../.. && npm ci` in the Vercel dashboard.

## Security

See [SECURITY.md](./SECURITY.md). API keys must never be logged or returned to clients; prefer `@sholajapheth/drive-photos-next` routes and `options.listEndpoint` for production.

## Contributing

Issues and pull requests are welcome. Run `npm test` and `npm run lint` before submitting. For changes that should trigger an npm release, run `npx changeset` and commit the generated file under `.changeset/`.

## Author

[Shola Japheth](https://sholajapheth.com/) — [GitHub](https://github.com/sholajapheth) — [drive-photos.dev](https://drive-photos.dev)

Publishing: see [PUBLISHING.md](./PUBLISHING.md). CI secrets: [.github/SECRETS.md](./.github/SECRETS.md).

## License

MIT
