import { ImageResponse } from 'next/og';

export const alt = 'drive-photos — Google Drive photo folders in your web app';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0a',
          backgroundImage:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(232,255,71,0.12), transparent 55%)',
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 400,
            color: '#f0f0f0',
            letterSpacing: '-0.03em',
            fontFamily: 'Georgia, ui-serif, serif',
          }}
        >
          drive-photos
        </div>
        <div
          style={{
            marginTop: 16,
            fontSize: 24,
            color: '#888888',
            maxWidth: 720,
            textAlign: 'center',
            lineHeight: 1.4,
          }}
        >
          Google Drive photo folders in your web app
        </div>
        <div
          style={{
            marginTop: 32,
            fontSize: 14,
            color: '#e8ff47',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          React · Next.js · TypeScript
        </div>
      </div>
    ),
    { ...size }
  );
}
