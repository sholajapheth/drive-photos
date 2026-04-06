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

Use the **repository root** as the Vercel project root (Root Directory **`.`** or empty). The app still lives in **`apps/docs`**; the root [`vercel.json`](./vercel.json) runs **`npm ci`** and Turbo from the monorepo root, then **copies** `apps/docs/.next` to **`.next`** at the repo root so Vercel’s Next.js step finds the build output (see [Turborepo on Vercel](https://vercel.com/docs/monorepos/turborepo)).

1. **Root Directory** → **`.`** (or leave empty). Do **not** set Root Directory to **`apps/docs`** unless that path exists in the Git deployment you connected (see below).
2. **Framework preset** can stay **Next.js** (auto or manual).
3. No `apps/docs/vercel.json` — install/build are defined only in the root `vercel.json`.

**If Vercel says Root Directory `apps/docs` “does not exist”**  
That path is resolved from your **connected Git repository**. Typical causes: the project is linked to a **different** repo or branch than the one that contains `apps/docs`, the folder was **never pushed**, or the name **does not match** (case-sensitive on Linux: `Apps/docs` ≠ `apps/docs`). Fix the Git connection or push the monorepo layout, then set Root Directory again if you prefer the “app folder as root” setup.

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
