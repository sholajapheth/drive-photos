import { Footer } from '@/components/Footer';
import { Nav } from '@/components/Nav';
import type { Metadata, Viewport } from 'next';
import { DM_Sans, DM_Serif_Display, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-dm-serif',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

const fontClass = [dmSans.variable, dmSerif.variable, jetbrains.variable].join(' ');

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://drive-photos.dev'),
  title: 'drive-photos — Google Drive photo folders in your web app',
  description:
    'Drop-in React component and Next.js routes to display Google Drive photo folders in any web app. Zero config, server-side API key protection, 4-level fallback.',
  keywords: ['google-drive', 'react', 'nextjs', 'photo gallery', 'npm package', 'drive-photos'],
  authors: [{ name: 'Shola Japheth', url: 'https://github.com/sholajapheth' }],
  openGraph: {
    title: 'drive-photos — Google Drive photo folders in your web app',
    description:
      'Drop-in React component and Next.js routes to display Google Drive photo folders in any web app.',
    url: 'https://drive-photos.dev',
    siteName: 'drive-photos',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'drive-photos',
    description:
      'Drop-in React component and Next.js routes to display Google Drive photo folders in any web app.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontClass}>
      <body>
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
