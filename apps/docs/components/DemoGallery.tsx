'use client';

import { CopyButton } from '@/components/CopyButton';
import { DriveGallery } from '@sholajapheth/drive-photos-react';
import '@sholajapheth/drive-photos-react/styles.css';
import { DrivePhotosError, normalizeFolderId } from '@sholajapheth/drive-photos-core';
import { FolderOpen } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

const LIB_VERSION = '0.1.0';

const DEMO_FOLDER = process.env.NEXT_PUBLIC_DEMO_FOLDER_ID ?? '';
const LIST_ENDPOINT = process.env.NEXT_PUBLIC_LIST_ENDPOINT ?? '';

/** Redact API keys in the code preview (never show full key in the snippet). */
function maskApiKeyForDisplay(key: string): string {
  const t = key.trim();
  if (!t) return '';
  if (t.length <= 8) return '*'.repeat(t.length);
  return `${t.slice(0, 4)}${'*'.repeat(8)}${t.slice(-4)}`;
}

export function DemoGallery() {
  const [folderInput, setFolderInput] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [modal, setModal] = useState(true);
  const [hover, setHover] = useState(false);
  const [skeleton, setSkeleton] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [loadNonce, setLoadNonce] = useState(0);
  const [err, setErr] = useState<DrivePhotosError | null>(null);
  const [count, setCount] = useState(0);

  const detectedId = useMemo(() => {
    const t = folderInput.trim();
    if (!t) return '';
    try {
      return normalizeFolderId(t);
    } catch {
      return '';
    }
  }, [folderInput]);

  const previewCode = useMemo(() => {
    const masked = maskApiKeyForDisplay(apiKey);
    const g = LIST_ENDPOINT ? '""' : masked ? `"${masked.replace(/"/g, '\\"')}"` : '""';
    const d = detectedId ? `"${detectedId}"` : '""';
    const le = LIST_ENDPOINT
      ? `\n    listEndpoint: '${LIST_ENDPOINT}',\n    proxyEndpoint: '/api/photos',`
      : '';
    const prefix = LIST_ENDPOINT
      ? '// ✅ Server routes: listEndpoint keeps the API key off the client\n'
      : '// ⚠️ DEV ONLY: gkey in the browser — use listEndpoint + proxyEndpoint in production\n';
    return `${prefix}<DriveGallery
  gkey={${g}}
  dirId={${d}}
  options={{${le}
    onClick: { modal: ${modal} },
    hover: ${hover},
    skeleton: ${skeleton},
  }}
/>`;
  }, [apiKey, detectedId, modal, hover, skeleton]);

  const load = useCallback(() => {
    setErr(null);
    setCount(0);
    if (!detectedId) {
      setMounted(false);
      setErr(
        new DrivePhotosError(
          'INVALID_FOLDER_ID',
          'Enter a Google Drive folder ID or paste a folder URL, then click Load gallery again.'
        )
      );
      return;
    }
    if (!LIST_ENDPOINT && !apiKey.trim()) {
      setMounted(false);
      setErr(
        new DrivePhotosError(
          'INVALID_API_KEY',
          'Add a Google API key, or configure NEXT_PUBLIC_LIST_ENDPOINT on this host so the gallery can load without exposing a key in the browser.'
        )
      );
      return;
    }
    setLoadNonce((n) => n + 1);
    setMounted(true);
  }, [detectedId, apiKey]);

  const useDemoFolder = useCallback(() => {
    if (!DEMO_FOLDER) {
      window.alert('Set NEXT_PUBLIC_DEMO_FOLDER_ID for the hosted demo folder.');
      return;
    }
    setErr(null);
    setMounted(false);
    setFolderInput(DEMO_FOLDER);
  }, []);

  return (
    <div className="demo-grid">
      <div className="demo-panel">
        <h1>Try it live</h1>
        <p className="sub">Enter a public Google Drive folder ID to see drive-photos in action.</p>

        <div className="form-field">
          <label htmlFor="folder-id">Google Drive Folder ID</label>
          <input
            id="folder-id"
            type="text"
            autoComplete="off"
            placeholder="Enter folder ID or paste a Drive URL"
            value={folderInput}
            onChange={(e) => {
              setFolderInput(e.target.value);
              setMounted(false);
              setErr(null);
            }}
          />
          <p className="hint">The folder must be shared as &apos;Anyone with the link&apos;</p>
          {detectedId ? (
            <p className="detected-id">
              Detected ID: <strong>{detectedId}</strong>
            </p>
          ) : null}
        </div>

        <div className="form-field">
          <label htmlFor="api-key">Google API key (only if not using a list proxy)</label>
          <input
            id="api-key"
            type={showKey ? 'text' : 'password'}
            autoComplete="new-password"
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            data-1p-ignore
            data-lpignore="true"
            data-form-type="other"
            placeholder="AIza..."
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              setMounted(false);
              setErr(null);
            }}
          />
          <p className="hint">
            <button
              type="button"
              onClick={() => setShowKey((s) => !s)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent)',
                cursor: 'pointer',
                padding: 0,
                font: 'inherit',
              }}
            >
              {showKey ? 'Hide' : 'Show'} key
            </button>
            {' · '}
            Not saved — keys stay in memory only for this page session.
          </p>
          <p className="warn">
            ⚠ For demo only. In production, use the Next.js proxy so your API key never ships to the
            browser.
          </p>
        </div>

        <div className="form-field">
          <label>Options</label>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={modal}
              onChange={(e) => {
                setModal(e.target.checked);
                setMounted(false);
              }}
            />
            Modal on click
          </label>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={hover}
              onChange={(e) => {
                setHover(e.target.checked);
                setMounted(false);
              }}
            />
            Hover effect
          </label>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={skeleton}
              onChange={(e) => {
                setSkeleton(e.target.checked);
                setMounted(false);
              }}
            />
            Show skeletons
          </label>
        </div>

        <button type="button" className="btn-primary" style={{ width: '100%' }} onClick={load}>
          Load gallery
        </button>

        <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
          <p className="hint" style={{ marginBottom: 12 }}>
            Want to try without an API key? Use our demo folder:
          </p>
          <button type="button" className="btn-secondary" style={{ width: '100%' }} onClick={useDemoFolder}>
            Use demo folder →
          </button>
        </div>
      </div>

      <div>
        <div className="demo-out">
          {err ? (
            <div className="demo-error" role="alert">
              <strong>{err.code}</strong>
              <p style={{ marginTop: 8 }}>{err.message}</p>
            </div>
          ) : !mounted ? (
            <div className="demo-empty">
              <FolderOpen size={64} strokeWidth={1} color="var(--text-faint)" />
              <p style={{ fontSize: 17, color: 'var(--text)', marginBottom: 8 }}>Your gallery will appear here</p>
              <p style={{ fontSize: 14 }}>Enter a folder ID above and click Load gallery</p>
            </div>
          ) : (
            <>
              <div className="demo-status">
                {count > 0
                  ? `✓ Loaded ${count} photos from folder · @sholajapheth/drive-photos-react v${LIB_VERSION}`
                  : `@sholajapheth/drive-photos-react v${LIB_VERSION}`}
              </div>
              <DriveGallery
                key={`${loadNonce}-${detectedId}-${apiKey}-${LIST_ENDPOINT}-${modal}-${hover}-${skeleton}`}
                gkey={apiKey}
                dirId={detectedId}
                name="demo"
                options={{
                  listEndpoint: LIST_ENDPOINT || undefined,
                  onClick: { modal },
                  hover,
                  skeleton,
                  skeletonCount: 12,
                  errorComponent: <></>,
                  onError: (e) => setErr(e),
                  onLoad: (photos) => {
                    setCount(photos.length);
                    setErr(null);
                  },
                }}
              />
            </>
          )}
        </div>

        <div style={{ marginTop: 24 }} className="code-block">
          <div className="code-block-bar">
            <span className="code-block-filename">Your code</span>
            <span className="code-block-lang">tsx</span>
            <CopyButton text={previewCode} aria-label="Copy snippet (API key redacted)" />
          </div>
          <div className="code-block-scroll">
            <pre
              style={{
                margin: 0,
                padding: '16px',
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                lineHeight: 1.7,
                color: 'var(--text-muted)',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {previewCode}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
