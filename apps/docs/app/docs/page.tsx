import { CodeBlock } from '@/components/CodeBlock';
import { DocsSidebar } from '@/components/DocsSidebar';
import { InstallTabs } from '@/components/InstallTabs';

const reactQuick = `// ⚠️ DEV ONLY: Never ship this to production — the API key will be in your JS bundle.
// For production, use the Next.js proxy pattern below.
import { DriveGallery } from '@sholajapheth/drive-photos-react';

export default function App() {
  return (
    <DriveGallery
      gkey={process.env.NEXT_PUBLIC_GOOGLE_API_KEY!}  // exposed to client!
      dirId="your-folder-id-or-url"
      options={{ onClick: { modal: true }, hover: true }}
    />
  );
}`;

const nextEnv = `GOOGLE_DRIVE_API_KEY=your_key
GOOGLE_DRIVE_FOLDER_ID=your_folder_id`;

const nextPhotosRoute = `import { createPhotosRoute } from '@sholajapheth/drive-photos-next';

export const { GET } = createPhotosRoute({
  apiKey: process.env.GOOGLE_DRIVE_API_KEY!,
  folderId: process.env.GOOGLE_DRIVE_FOLDER_ID!,
});`;

const nextProxyRoute = `import { createPhotoProxyRoute } from '@sholajapheth/drive-photos-next';

export const { GET } = createPhotoProxyRoute({
  apiKey: process.env.GOOGLE_DRIVE_API_KEY!,
});`;

const nextGallery = `// ✅ PRODUCTION: API key stays on the server; list + image proxy go through your app.
<DriveGallery
  gkey=""
  dirId=""
  options={{
    listEndpoint: '/api/photos',
    proxyEndpoint: '/api/photos',
    onClick: { modal: true },
    hover: true,
  }}
/>`;

const hookExample = `// ⚠️ DEV ONLY with NEXT_PUBLIC_* — key is exposed in the browser. Prefer listEndpoint + server routes.
import { useDriveGallery } from '@sholajapheth/drive-photos-react';

const { photos, loading, error, total, refetch } = useDriveGallery({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY!,
  folderId: 'your-folder-id',
  pageSize: 100,
});`;

const validateCode = `// Server-side (createPhotosRoute / core)
validateConfig({ apiKey, folderId, pageSize, mimeTypes, orderBy, includeSharedDrives });
normalizeFolderId(folderId);
validateApiKey(gkey); // client mount when not using listEndpoint`;

export default async function DocsPage() {
  return (
    <div className="docs-layout">
      <DocsSidebar />
      <article className="docs-main">
        <h1>Documentation</h1>
        <p className="lead">
          Reference for <code>@sholajapheth/drive-photos-react</code>,{' '}
          <code>@sholajapheth/drive-photos-core</code>, and{' '}
          <code>@sholajapheth/drive-photos-next</code>.
        </p>

        <h2 id="folder-setup">Folder setup &amp; public access</h2>
        <div
          style={{
            borderLeft: '4px solid var(--accent, #3b82f6)',
            paddingLeft: 16,
            marginBottom: 24,
          }}
        >
          <p>
            <strong>IMPORTANT:</strong> Your Google Drive folder must be publicly accessible for
            this library to work with an API key (no OAuth).
          </p>
          <p>
            drive-photos reads photos using the Google Drive API with an API key — not OAuth. This
            means the folder must be shared as &quot;Anyone with the link can view&quot; for the
            library to access its contents.
          </p>
          <p>
            <strong>How to set this up</strong>
          </p>
          <ol>
            <li>Right-click your folder in Google Drive</li>
            <li>Click &quot;Share&quot;</li>
            <li>
              Under &quot;General access&quot;, change &quot;Restricted&quot; to &quot;Anyone with
              the link&quot;
            </li>
            <li>Make sure the permission is &quot;Viewer&quot; (not Editor)</li>
            <li>Copy the folder link — paste it directly as the dirId prop (we normalize it)</li>
          </ol>
          <p>
            <strong>What this means for security</strong>
          </p>
          <ul>
            <li>Anyone who knows the folder link can view the photos</li>
            <li>Nobody can edit, delete, or add files (Viewer permission)</li>
            <li>Files in this folder are not private — treat it as a public folder</li>
            <li>Any non-image files you put in this folder will also be accessible</li>
          </ul>
          <p>
            <strong>Best practice:</strong> Create a dedicated &quot;website photos&quot; folder
            used only for this purpose. Never put private documents, contracts, or sensitive files
            in this folder. Never share a folder that contains subfolders with sensitive content.
          </p>
          <p>
            <strong>If you do not do this:</strong> The library will return a FOLDER_NOT_FOUND or
            ACCESS_DENIED error, and no photos will display. This is intentional — there is no
            partial access.
          </p>
        </div>

        <h2 id="installation">Installation</h2>
        <InstallTabs />
        <p style={{ marginTop: 16, fontSize: 14 }}>
          Also install <code>@sholajapheth/drive-photos-next</code> if using Next.js (recommended
          for API key security).
        </p>

        <h2 id="quick-start">Quick start — React only (client-side, dev only)</h2>
        <p>
          For local development you can pass an API key from <code>NEXT_PUBLIC_*</code> env vars.
          Never ship a production key to the browser.
        </p>
        <CodeBlock code={reactQuick} language="tsx" filename="App.tsx" />

        <p>
          Pair every dev-only example with the production pattern: server routes and{' '}
          <code>listEndpoint</code> + <code>proxyEndpoint</code>.
        </p>
        <CodeBlock code={nextGallery} language="tsx" filename="page.tsx" />

        <h2 id="migration">Migration guide</h2>
        <p>
          Use the Next.js integration so your Google API key stays on the server. The browser only
          calls your app routes.
        </p>
        <h3>Step 1: Add env vars</h3>
        <CodeBlock code={nextEnv} language="bash" filename=".env.local" />

        <h3>Step 2: Create app/api/photos/route.ts</h3>
        <CodeBlock code={nextPhotosRoute} language="ts" filename="app/api/photos/route.ts" />

        <h3>Step 3: Create app/api/photos/[id]/route.ts</h3>
        <p>
          Proxies image bytes through your server so file access can use your API key safely. Set{' '}
          <code>options.proxyEndpoint</code> to match this route (default <code>/api/photos</code>).
        </p>
        <CodeBlock code={nextProxyRoute} language="ts" filename="app/api/photos/[id]/route.ts" />

        <h3>Step 4: Use with listEndpoint + proxyEndpoint</h3>
        <p>
          With <code>listEndpoint</code>, the gallery loads the photo list from your server route —
          no API key in the client bundle. Use <code>proxyEndpoint</code> so thumbnails and the
          lightbox load through your proxy.
        </p>
        <CodeBlock code={nextGallery} language="tsx" filename="page.tsx" />

        <h2 id="pkg-core">@sholajapheth/drive-photos-core</h2>
        <p>
          Framework-agnostic engine: <code>listDrivePhotos</code>, <code>normalizeFolderId</code>,
          image URL fallbacks, validation, and rate limiting primitives.
        </p>

        <h2 id="pkg-react">@sholajapheth/drive-photos-react</h2>
        <p>
          React components (<code>DriveGallery</code>, <code>ImageWithFallback</code>,{' '}
          <code>PhotoModal</code>), <code>useDriveGallery</code>, and styles.
        </p>

        <h2 id="pkg-next">@sholajapheth/drive-photos-next</h2>
        <p>
          App Router helpers: <code>createPhotosRoute</code>, <code>createPhotoProxyRoute</code>,
          optional <code>drivePhotosMiddleware</code>.
        </p>

        <h2 id="props">DriveGallery props</h2>
        <div className="props-table-wrap">
          <table className="props-table">
            <thead>
              <tr>
                <th>Prop</th>
                <th>Type</th>
                <th>Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  gkey <span className="req-badge">required*</span>
                </td>
                <td>
                  <code>string</code>
                </td>
                <td>—</td>
                <td>
                  Google API key when not using <code>options.listEndpoint</code>. Deprecated for
                  production — exposes the key in the client bundle. Can be empty when the server
                  owns credentials.
                </td>
              </tr>
              <tr>
                <td>
                  dirId <span className="req-badge">required*</span>
                </td>
                <td>
                  <code>string</code>
                </td>
                <td>—</td>
                <td>Folder id or supported Drive URL (normalized by core).</td>
              </tr>
              <tr>
                <td>name</td>
                <td>
                  <code>string | undefined</code>
                </td>
                <td>—</td>
                <td>Optional gallery name for accessibility label.</td>
              </tr>
              <tr>
                <td>options.style</td>
                <td>
                  <code>CSSProperties</code>
                </td>
                <td>—</td>
                <td>Applied to the grid container.</td>
              </tr>
              <tr>
                <td>options.onClick.modal</td>
                <td>
                  <code>boolean | undefined</code>
                </td>
                <td>—</td>
                <td>Open lightbox modal on photo click.</td>
              </tr>
              <tr>
                <td>options.onClick.newWindow</td>
                <td>
                  <code>boolean | undefined</code>
                </td>
                <td>—</td>
                <td>Open Drive file in a new tab.</td>
              </tr>
              <tr>
                <td>options.exclude</td>
                <td>
                  <code>Record&lt;string, boolean&gt;</code>
                </td>
                <td>—</td>
                <td>Hide photos by file name key.</td>
              </tr>
              <tr>
                <td>options.attachClass / attachId</td>
                <td>
                  <code>Record&lt;string, string&gt;</code>
                </td>
                <td>—</td>
                <td>Per-photo className or id.</td>
              </tr>
              <tr>
                <td>options.hover</td>
                <td>
                  <code>boolean | undefined</code>
                </td>
                <td>—</td>
                <td>Hover styles on thumbnails.</td>
              </tr>
              <tr>
                <td>options.pageSize</td>
                <td>
                  <code>number | undefined</code>
                </td>
                <td>—</td>
                <td>Drive list page size (paginated internally).</td>
              </tr>
              <tr>
                <td>options.imageSize</td>
                <td>
                  <code>number | undefined</code>
                </td>
                <td>800</td>
                <td>Requested thumbnail size for fallback chain.</td>
              </tr>
              <tr>
                <td>options.fullscreenSize</td>
                <td>
                  <code>number | undefined</code>
                </td>
                <td>1920</td>
                <td>Modal full image size cap.</td>
              </tr>
              <tr>
                <td>options.skeleton</td>
                <td>
                  <code>boolean | undefined</code>
                </td>
                <td>true</td>
                <td>Show loading skeleton grid.</td>
              </tr>
              <tr>
                <td>options.skeletonCount</td>
                <td>
                  <code>number | undefined</code>
                </td>
                <td>12</td>
                <td>Number of skeleton placeholders.</td>
              </tr>
              <tr>
                <td>options.mimeTypes</td>
                <td>
                  <code>string[] | undefined</code>
                </td>
                <td>—</td>
                <td>Filter by MIME type.</td>
              </tr>
              <tr>
                <td>options.includeSharedDrives</td>
                <td>
                  <code>boolean | undefined</code>
                </td>
                <td>—</td>
                <td>Include shared drives in listing.</td>
              </tr>
              <tr>
                <td>options.orderBy</td>
                <td>
                  <code>&apos;createdTime&apos; | &apos;name&apos; | &apos;modifiedTime&apos;</code>
                </td>
                <td>—</td>
                <td>Drive sort order.</td>
              </tr>
              <tr>
                <td>options.columns</td>
                <td>
                  <code>number | undefined</code>
                </td>
                <td>auto</td>
                <td>Fixed column count; otherwise auto-fill.</td>
              </tr>
              <tr>
                <td>options.gap</td>
                <td>
                  <code>number | undefined</code>
                </td>
                <td>8</td>
                <td>Grid gap in px.</td>
              </tr>
              <tr>
                <td>options.className</td>
                <td>
                  <code>string | undefined</code>
                </td>
                <td>—</td>
                <td>Root class name.</td>
              </tr>
              <tr>
                <td>options.errorComponent</td>
                <td>
                  <code>ReactNode</code>
                </td>
                <td>—</td>
                <td>Replace default error UI.</td>
              </tr>
              <tr>
                <td>options.onPhotoClick</td>
                <td>
                  <code>(photo, index) =&gt; void</code>
                </td>
                <td>—</td>
                <td>Called when a thumbnail is clicked.</td>
              </tr>
              <tr>
                <td>options.onLoad</td>
                <td>
                  <code>(photos) =&gt; void</code>
                </td>
                <td>—</td>
                <td>Called when photos are loaded (visible list).</td>
              </tr>
              <tr>
                <td>options.onError</td>
                <td>
                  <code>(error: DrivePhotosError) =&gt; void</code>
                </td>
                <td>—</td>
                <td>Called on validation or fetch errors.</td>
              </tr>
              <tr>
                <td>options.listEndpoint</td>
                <td>
                  <code>string | undefined</code>
                </td>
                <td>—</td>
                <td>
                  GET JSON list from your server (recommended for production). Keeps the Google API
                  key off the client when used with server routes.
                </td>
              </tr>
              <tr>
                <td>options.proxyEndpoint</td>
                <td>
                  <code>string | undefined</code>
                </td>
                <td>
                  <code>/api/photos</code>
                </td>
                <td>
                  Base path for the image proxy (must match <code>createPhotoProxyRoute</code>).
                  Used for thumbnails and modal images.
                </td>
              </tr>
              <tr>
                <td>options.warnNonImageFilesInFolder</td>
                <td>
                  <code>boolean | undefined</code>
                </td>
                <td>—</td>
                <td>
                  When set (without <code>listEndpoint</code>), runs an extra query to detect
                  non-image files and warn in the console.
                </td>
              </tr>
              <tr>
                <td>options.onNonImageFilesFound</td>
                <td>
                  <code>(files: DrivePhoto[]) =&gt; void</code>
                </td>
                <td>—</td>
                <td>Callback when non-image files are found in the shared folder.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          * Required fields depend on mode: either provide <code>gkey</code> + <code>dirId</code>{' '}
          for client-side Drive API access, or use <code>options.listEndpoint</code> with empty keys
          when the server resolves credentials.
        </p>

        <h2 id="hook">useDriveGallery hook</h2>
        <p>Headless data loading with caching, retries, and rate limiting.</p>
        <CodeBlock
          code={`export interface UseDriveGalleryOptions {
  apiKey?: string;
  folderId: string;
  pageSize?: number;
  mimeTypes?: string[];
  orderBy?: 'createdTime' | 'name' | 'modifiedTime';
  includeSharedDrives?: boolean;
  enabled?: boolean;
  cacheResults?: boolean;
  listEndpoint?: string;
  onError?: (error: DrivePhotosError) => void;
}

export interface UseDriveGalleryReturn {
  photos: DrivePhoto[];
  loading: boolean;
  error: DrivePhotosError | null;
  total: number;
  refetch: () => void;
}`}
          language="ts"
          filename="useDriveGallery.ts"
        />
        <CodeBlock code={hookExample} language="tsx" filename="Gallery.tsx" />

        <h2 id="create-photos-route">createPhotosRoute</h2>
        <p>
          Returns <code>{'{ GET }'}</code> for <code>app/api/.../route.ts</code>. Validates config,
          normalizes folder id, returns JSON <code>{'{ photos, total }'}</code> with cache headers.
          Supports <code>allowDynamicFolder</code> to read <code>?folderId=</code> from the request
          (validated).
        </p>

        <h2 id="create-photo-proxy">createPhotoProxyRoute</h2>
        <p>
          Returns <code>{'{ GET }'}</code> for <code>app/api/photos/[id]/route.ts</code>. Validates
          file ids, fetches image bytes from an allowlisted set of hosts (Drive / Google APIs),
          streams the response with cache headers and security headers (CSP, nosniff, frame denial).
          SVG is not proxied (415).
        </p>

        <h2 id="security">Security model</h2>
        <p>
          drive-photos is designed for public photo folders with a server-side API key. The table
          below summarizes threats and mitigations.
        </p>
        <div className="props-table-wrap">
          <table className="props-table">
            <thead>
              <tr>
                <th>Threat</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Protection</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>API key exposed in client bundle</td>
                <td>Critical</td>
                <td>Protected</td>
                <td>
                  Runtime warning + proxy-first architecture. CI checks the React dist for
                  disallowed patterns.
                </td>
              </tr>
              <tr>
                <td>SSRF via image proxy (CVE-2024-34351, CVE-2025-57822, CVE-2025-6087)</td>
                <td>Critical</td>
                <td>Protected</td>
                <td>
                  Strict file ID validation, HTTPS-only fetches, allowlisted hostnames, manual
                  redirect handling with per-hop validation, private host patterns blocked.
                </td>
              </tr>
              <tr>
                <td>API quota exhaustion / DDoS</td>
                <td>High</td>
                <td>Protected</td>
                <td>
                  Optional Next.js middleware rate limits (list vs proxy), per-IP sliding window;
                  exponential backoff on Google 429 responses in the core fetcher.
                </td>
              </tr>
              <tr>
                <td>Path traversal in proxy route</td>
                <td>Critical</td>
                <td>Protected</td>
                <td>File ID validated before URL construction; encoded slashes rejected.</td>
              </tr>
              <tr>
                <td>npm supply chain (Shai-Hulud, debug/chalk, Axios)</td>
                <td>High</td>
                <td>Mitigated</td>
                <td>
                  Minimal runtime deps in core, lockfile pins, optional Socket.dev in CI, maintainer
                  npm hygiene (see SECURITY.md).
                </td>
              </tr>
              <tr>
                <td>Accidental sensitive file exposure</td>
                <td>Medium</td>
                <td>Shared responsibility</td>
                <td>
                  Console warning when non-image files are detected; users must keep folders
                  dedicated and public-safe.
                </td>
              </tr>
              <tr>
                <td>XSS via file names in captions</td>
                <td>High</td>
                <td>Protected</td>
                <td>
                  File names sanitized before rendering; prefer text nodes in React (no raw HTML).
                </td>
              </tr>
              <tr>
                <td>Open redirect SSRF chaining</td>
                <td>High</td>
                <td>Protected</td>
                <td>
                  <code>redirect: &apos;manual&apos;</code> on fetches; redirect targets
                  re-validated against the allowlist.
                </td>
              </tr>
              <tr>
                <td>SVG-based XSS via proxy</td>
                <td>High</td>
                <td>Protected</td>
                <td>SVG-like content types rejected at the proxy (415).</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          <strong>Important caveat — what we cannot protect you from</strong>
        </p>
        <ol>
          <li>
            <strong>Public folder with sensitive files.</strong> We warn when non-images are
            detected, but we cannot make files private for you. Only put files in this folder that
            you are comfortable exposing.
          </li>
          <li>
            <strong>A compromised Google API key.</strong> If your key leaks (for example in a
            public repo), anyone can use it. Use the Next.js proxy, restrict the key to your HTTP
            referrers, and to the Drive API only.
          </li>
          <li>
            <strong>Supply chain in your own app.</strong> We control these packages; we cannot
            audit your full dependency tree. Run <code>npm audit</code>, pin lockfiles, and use
            additional tooling as needed.
          </li>
          <li>
            <strong>Google Drive platform compromise.</strong> Out of scope for this library; Google
            documents encryption at rest and TLS in transit for Drive.
          </li>
        </ol>

        <p>
          <strong>Additional topics:</strong> API keys, folder IDs, and file IDs are validated
          before network calls. SSRF defenses apply to the photo proxy route. Client hooks include
          throttling; server middleware adds optional rate limits for public API routes.
        </p>
        <CodeBlock code={validateCode} language="ts" filename="validation.ts" />

        <h2 id="api-key-security">Google API key security checklist</h2>
        <p>Configuring your Google API key safely before you deploy:</p>
        <ol>
          <li>
            <strong>Restrict to HTTP referrers.</strong> In Google Cloud Console → APIs &amp;
            Services → Credentials → your key → Application restrictions → HTTP referrers. Add{' '}
            <code>https://yourdomain.com/*</code> and <code>https://www.yourdomain.com/*</code> so a
            stolen key cannot be used from arbitrary origins (when the key must be used from the
            browser for local dev). Server-only keys should not need browser referrers — prefer
            keeping the key on the server only.
          </li>
          <li>
            <strong>Restrict to the Drive API.</strong> API restrictions → Restrict key → Google
            Drive API only. This limits blast radius if the key is compromised.
          </li>
          <li>
            <strong>Set a quota limit.</strong> APIs &amp; Services → Google Drive API → Quotas →
            set a per-day cap appropriate for your traffic.
          </li>
          <li>
            <strong>Billing alert.</strong> Even when Drive usage is free, the same project key
            might enable other billable APIs — set an alert (for example at $1).
          </li>
          <li>
            <strong>Never commit secrets.</strong> Add <code>.env.local</code> to{' '}
            <code>.gitignore</code>. Search history: <code>git log --all -S &quot;AIza&quot;</code>.
            Rotate keys if exposed.
          </li>
          <li>
            <strong>Use the Next.js proxy.</strong> With{' '}
            <code>@sholajapheth/drive-photos-next</code>, the key stays on the server — the client
            bundle does not need the secret.
          </li>
        </ol>
      </article>
    </div>
  );
}
