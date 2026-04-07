/** @type {import('next').NextConfig} */
// Dev uses Webpack (`next dev --webpack`) by default — Turbopack can panic with corrupted `.next` cache
// (e.g. static_sorted_file range errors). Fix: `npm run clean` in apps/docs, then `npm run dev` again.
// Opt-in Turbopack: `npm run dev:turbo` in this workspace.
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@sholajapheth/drive-photos-react',
    '@sholajapheth/drive-photos-core',
  ],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'drive.google.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
};

export default nextConfig;
