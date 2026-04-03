import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'drive-photos',
  description: 'Google Drive photo folders in your web app — batteries included',
  authors: [{ name: 'Shola Japheth', url: 'https://github.com/sholajapheth' }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
