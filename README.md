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

The Next.js app lives under **`apps/docs`**, so Vercel must treat that folder as the project root (so `.next` is at `./.next`, not `apps/docs/.next` under a repo root).

1. **Root Directory** → **`apps/docs`** (not `.`).
2. Turn **on** **Include source files outside of the Root Directory in the Build Step** (Project → Settings → General) so the full monorepo (and `package-lock.json` at the repo root) is available.
3. [`apps/docs/vercel.json`](./apps/docs/vercel.json) runs **`cd ../.. && npm ci`** and **`cd ../.. && npx turbo run build --filter=drive-photos-docs...`** so install and build execute from the **monorepo root** while the deployment root stays **`apps/docs`**.

The **Deploy Docs** GitHub workflow uses `vercel-action` with **`working-directory: apps/docs`** to match this layout.

**Debugging failed deploys**  
Vercel → your deployment → **Building** → expand **Running "npm install"** (or **installCommand**) to see stderr (peer deps, lockfile, Node version, etc.).

## Security

See [SECURITY.md](./SECURITY.md). API keys must never be logged or returned to clients; prefer `@sholajapheth/drive-photos-next` routes and `options.listEndpoint` for production.

## Contributing

Issues and pull requests are welcome. Run `npm test` and `npm run lint` before submitting. For changes that should trigger an npm release, run `npx changeset` and commit the generated file under `.changeset/`.

## Author

[Shola Japheth](https://sholajapheth.com/) — [GitHub](https://github.com/sholajapheth) — [drive-photos.dev](https://drive-photos.dev)

Publishing: see [PUBLISHING.md](./PUBLISHING.md). CI secrets: [.github/SECRETS.md](./.github/SECRETS.md).

## License

MIT
