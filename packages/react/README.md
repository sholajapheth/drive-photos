# @sholajapheth/drive-photos-react

React components and hooks for Google Drive photo galleries.

## `<DriveGallery />`

### Props

| Prop                          | Type                                  | Default | Description                                         |
| ----------------------------- | ------------------------------------- | ------- | --------------------------------------------------- |
| `gkey`                        | `string`                              | —       | Google API key (`react-gdrive-image-viewer` compat) |
| `dirId`                       | `string`                              | —       | Folder id or URL                                    |
| `name`                        | `string`                              | —       | Accessible name                                     |
| `options.style`               | `CSSProperties`                       | —       | Grid container style                                |
| `options.onClick.modal`       | `boolean`                             | —       | Open lightbox                                       |
| `options.onClick.newWindow`   | `boolean`                             | —       | Open Drive file in new tab                          |
| `options.exclude`             | `Record<string, boolean>`             | —       | Exclude by file name                                |
| `options.attachClass`         | `Record<string, string>`              | —       | Class per file name                                 |
| `options.attachId`            | `Record<string, string>`              | —       | Id per file name                                    |
| `options.hover`               | `boolean`                             | —       | Hover affordance                                    |
| `options.pageSize`            | `number`                              | —       | Drive page size                                     |
| `options.imageSize`           | `number`                              | `800`   | Thumbnail width                                     |
| `options.fullscreenSize`      | `number`                              | `1920`  | Modal image width                                   |
| `options.skeleton`            | `boolean`                             | `true`  | Show skeletons while loading                        |
| `options.skeletonCount`       | `number`                              | `12`    | Skeleton tiles                                      |
| `options.mimeTypes`           | `string[]`                            | —       | MIME override                                       |
| `options.includeSharedDrives` | `boolean`                             | —       | Shared drives                                       |
| `options.orderBy`             | `createdTime \| name \| modifiedTime` | —       | Sort                                                |
| `options.columns`             | `number`                              | auto    | Grid columns                                        |
| `options.gap`                 | `number`                              | `8`     | Grid gap (px)                                       |
| `options.className`           | `string`                              | —       | Root class                                          |
| `options.errorComponent`      | `ReactNode`                           | —       | Error UI                                            |
| `options.onPhotoClick`        | `(photo, index) => void`              | —       | Click handler                                       |
| `options.onLoad`              | `(photos) => void`                    | —       | Loaded photos                                       |
| `options.onError`             | `(error) => void`                     | —       | Error callback                                      |
| `options.listEndpoint`        | `string`                              | —       | `GET` JSON list URL (recommended)                   |

Import styles:

```ts
import '@sholajapheth/drive-photos-react/styles.css';
```

## `useDriveGallery(options)`

Headless data loading with cache + rate limiting. See TypeScript types for full options.

### Examples

**Basic**

```tsx
<DriveGallery gkey={key} dirId={folder} />
```

**With Next.js proxy**

```tsx
<DriveGallery gkey={key} dirId={folder} options={{ listEndpoint: '/api/photos' }} />
```

**Headless**

```tsx
const { photos, loading, error, refetch } = useDriveGallery({
  apiKey: key,
  folderId: folder,
});
```

## Author

[Shola Japheth](https://sholajapheth.com/) · [GitHub](https://github.com/sholajapheth)
