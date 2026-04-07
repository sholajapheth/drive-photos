import { CodeBlock } from '@/components/CodeBlock';
import { HeroInstall } from '@/components/HeroInstall';
import { MotionSection } from '@/components/MotionSection';
import { FolderOpen, Images, Layers, Monitor, RefreshCw, Server, Shield, Zap } from 'lucide-react';
import Link from 'next/link';

const beforeCode = `import GDImageViewer from 'react-gdrive-image-viewer';

<GDImageViewer data={{
  gkey: "YOUR_API_KEY",
  dirId: "YOUR_FOLDER_ID",
  name: "gallery",
  options: { onClick: { modal: true }, hover: true }
}} />`;

const afterCode = `// ⚠️ DEV ONLY: shipping gkey exposes your key in the JS bundle — use listEndpoint + proxy in production (see /docs).
import { DriveGallery } from '@sholajapheth/drive-photos-react';

<DriveGallery
  gkey="YOUR_API_KEY"
  dirId="YOUR_FOLDER_ID"
  options={{ onClick: { modal: true }, hover: true }}
/>`;

async function MigrationCompare() {
  return (
    <div className="compare-grid">
      <div>
        <span className="compare-label compare-label--before">Before</span>
        <CodeBlock code={beforeCode} language="tsx" filename="Gallery.tsx" />
      </div>
      <div>
        <span className="compare-label compare-label--after">After</span>
        <CodeBlock code={afterCode} language="tsx" filename="Gallery.tsx" />
      </div>
    </div>
  );
}

export default async function HomePage() {
  return (
    <>
      <div className="hero landing-wrap">
        <div className="fade-up hero-pill ">
          ✦ Drop-in replacement for react-gdrive-image-viewer
        </div>
        <h1 className="fade-up delay-1">
          Your Google Drive folder.
          <br />
          In your web app.
          <br />
          Finally done <span className="hero-accent">right.</span>
        </h1>
        <p className="fade-up delay-2 hero-sub">
          Drop-in React component. Next.js server proxy. 4-level image fallback. Full MIME support.
          Zero client-side API key exposure.
        </p>
        <div className="fade-up delay-3 hero-cta">
          <Link href="/docs" className="btn-primary">
            Get started
          </Link>
          <Link href="/demo" className="btn-secondary">
            View demo →
          </Link>
        </div>
        <HeroInstall />
      </div>

      <MotionSection>
        <div className="stats-bar">
          <div className="stat-cell">
            <div className="stat-num">3 packages</div>
            <div className="stat-sub">core · react · next</div>
          </div>
          <div className="stat-cell">
            <div className="stat-num">Zero deps</div>
            <div className="stat-sub">in @drive-photos/core</div>
          </div>
          <div className="stat-cell">
            <div className="stat-num">4-level</div>
            <div className="stat-sub">image fallback chain</div>
          </div>
          <div className="stat-cell">
            <div className="stat-num">100% TypeScript</div>
            <div className="stat-sub">strict mode</div>
          </div>
        </div>
      </MotionSection>

      <MotionSection className="section">
        <div className="section-head">
          <h2>Everything you need</h2>
          <p>
            Built on lessons learned from react-gdrive-image-viewer and real-world production use.
          </p>
        </div>
        <div className="feature-grid">
          <div className="feature-card">
            <Shield className="feature-icon" size={28} strokeWidth={1.5} />
            <h3>API key stays server-side</h3>
            <p>
              Your Google API key never touches the client bundle. The Next.js proxy keeps it on the
              server where it belongs.
            </p>
          </div>
          <div className="feature-card">
            <Images className="feature-icon" size={28} strokeWidth={1.5} />
            <h3>Full MIME type support</h3>
            <p>JPEG, PNG, WebP, HEIC, AVIF, RAW, TIFF and more. No more silently missing photos.</p>
          </div>
          <div className="feature-card">
            <RefreshCw className="feature-icon" size={28} strokeWidth={1.5} />
            <h3>4-level image fallback</h3>
            <p>
              Drive API thumbnail → public thumbnail → lh3 CDN → uc export. Photos load or they
              don&apos;t — no broken image icons.
            </p>
          </div>
          <div className="feature-card">
            <Layers className="feature-icon" size={28} strokeWidth={1.5} />
            <h3>Full pagination</h3>
            <p>
              Google Drive caps results at 100. We paginate through all nextPageToken responses so
              every photo appears.
            </p>
          </div>
          <div className="feature-card">
            <Zap className="feature-icon" size={28} strokeWidth={1.5} />
            <h3>Drop-in compatible</h3>
            <p>
              Use the same gkey and dirId props as react-gdrive-image-viewer. Change your import,
              nothing else.
            </p>
          </div>
          <div className="feature-card">
            <FolderOpen className="feature-icon" size={28} strokeWidth={1.5} />
            <h3>Any folder URL format</h3>
            <p>Raw ID, full /folders/ URL, or ?id= URL — all normalized automatically.</p>
          </div>
        </div>
      </MotionSection>

      <MotionSection className="section">
        <div className="section-head">
          <h2>Migrate in one line</h2>
        </div>
        <MigrationCompare />
        <p style={{ marginTop: 20, color: 'var(--text-muted)', fontSize: 14 }}>
          All existing options still work. New options are additive.
        </p>
      </MotionSection>

      <MotionSection className="section">
        <div className="section-head">
          <h2>How it works</h2>
        </div>
        <div className="how-grid">
          <div className="how-card">
            <span className="how-badge">1</span>
            <FolderOpen
              style={{ color: 'var(--accent)', marginBottom: 12 }}
              size={32}
              strokeWidth={1.5}
            />
            <h3 style={{ fontSize: 16, marginBottom: 8 }}>Google Drive folder</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6 }}>
              Your photos live in any Google Drive folder. Make it shareable — that&apos;s all.
            </p>
          </div>
          <div className="how-arrow">
            <span className="how-arrow-icon">→</span>
            <span>Drive API v3</span>
          </div>
          <div className="how-card">
            <span className="how-badge">2</span>
            <Server
              style={{ color: 'var(--accent)', marginBottom: 12 }}
              size={32}
              strokeWidth={1.5}
            />
            <h3 style={{ fontSize: 16, marginBottom: 8 }}>Server proxy</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6 }}>
              Next.js route handler lists photos and proxies image bytes. API key never leaves the
              server.
            </p>
          </div>
          <div className="how-arrow">
            <span className="how-arrow-icon">→</span>
            <span>JSON + Image bytes</span>
          </div>
          <div className="how-card">
            <span className="how-badge">3</span>
            <Monitor
              style={{ color: 'var(--accent)', marginBottom: 12 }}
              size={32}
              strokeWidth={1.5}
            />
            <h3 style={{ fontSize: 16, marginBottom: 8 }}>Your web app</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6 }}>
              <code>&lt;DriveGallery&gt;</code> renders your photos with fallbacks, lazy loading,
              and lightbox.
            </p>
          </div>
        </div>
      </MotionSection>

      <MotionSection className="section">
        <div className="section-head">
          <h2>Three packages, one install</h2>
        </div>
        <div className="pkg-grid">
          <div className="pkg-card">
            <span className="pkg-tag">Framework agnostic</span>
            <div className="pkg-name">@sholajapheth/drive-photos-core</div>
            <p className="pkg-desc">
              The engine. Fetcher, paginator, normalizer, fallback chain, sanitizer, rate limiter.
              Zero dependencies.
            </p>
            <div className="pkg-install">
              <span>npm i @sholajapheth/drive-photos-core</span>
            </div>
          </div>
          <div className="pkg-card pkg-card--primary">
            <span className="pkg-tag">React 18+ · Start here</span>
            <div className="pkg-name">@sholajapheth/drive-photos-react</div>
            <p className="pkg-desc">
              <code>&lt;DriveGallery&gt;</code> component, useDriveGallery hook, ImageWithFallback,
              Modal lightbox. Drop-in react-gdrive-image-viewer replacement.
            </p>
            <div className="pkg-install" style={{ borderColor: 'var(--accent-border)' }}>
              <span>npm i @sholajapheth/drive-photos-react</span>
            </div>
          </div>
          <div className="pkg-card">
            <span className="pkg-tag">Next.js 14+</span>
            <div className="pkg-name">@sholajapheth/drive-photos-next</div>
            <p className="pkg-desc">
              createPhotosRoute() and createPhotoProxyRoute() App Router handlers. Keeps your API
              key safe.
            </p>
            <div className="pkg-install">
              <span>npm i @sholajapheth/drive-photos-next</span>
            </div>
          </div>
        </div>
      </MotionSection>

      <div className="cta-banner">
        <h2>Ready to ship?</h2>
        <p>Add a Google Drive photo gallery to your app in under 5 minutes.</p>
        <div className="hero-cta">
          <Link href="/docs" className="btn-primary">
            Read the docs
          </Link>
          <Link href="/demo" className="btn-secondary">
            See the demo
          </Link>
        </div>
      </div>
    </>
  );
}
