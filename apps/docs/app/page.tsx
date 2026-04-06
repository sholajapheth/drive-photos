import Link from 'next/link';

export default function Page() {
  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: 32 }}>
      <h1 style={{ fontSize: 40, marginBottom: 8 }}>drive-photos</h1>
      <p style={{ fontSize: 18, color: '#374151' }}>
        Google Drive photo folders in your web app — batteries included.
      </p>
      <ul style={{ marginTop: 24, lineHeight: 1.8 }}>
        <li>
          <Link href="/docs">API reference</Link>
        </li>
        <li>
          <Link href="/demo">Live demo</Link>
        </li>
      </ul>
      <section style={{ marginTop: 32 }}>
        <h2>Quickstart</h2>
        <ol>
          <li>
            <code>npm install @sholajapheth/drive-photos-react</code>
          </li>
          <li>Set server environment variables for the Next.js routes (recommended).</li>
          <li>
            Render <code>{`<DriveGallery gkey="..." dirId="..." />`}</code> (prefer{' '}
            <code>options.listEndpoint</code> in production).
          </li>
        </ol>
      </section>
    </main>
  );
}
