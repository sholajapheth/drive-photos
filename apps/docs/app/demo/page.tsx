import { DriveGallery } from '@sholajapheth/drive-photos-react';
import '@sholajapheth/drive-photos-react/styles.css';

export default function DemoPage() {
  const gkey = process.env.NEXT_PUBLIC_PLACEHOLDER_GKEY ?? '1234567890abcdefghij';
  const dirId = process.env.NEXT_PUBLIC_PLACEHOLDER_DIR ?? '1234567890abcdefghij';

  return (
    <main style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
      <h1>Demo</h1>
      <p style={{ color: '#6b7280' }}>
        Set <code>NEXT_PUBLIC_PLACEHOLDER_GKEY</code> and <code>NEXT_PUBLIC_PLACEHOLDER_DIR</code>{' '}
        to real values for a live fetch, or use <code>options.listEndpoint</code> with a server
        route.
      </p>
      <DriveGallery
        gkey={gkey}
        dirId={dirId}
        name="demo"
        options={{
          listEndpoint: process.env.NEXT_PUBLIC_LIST_ENDPOINT,
          skeletonCount: 8,
        }}
      />
    </main>
  );
}
