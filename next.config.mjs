/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
    ],
  },
  experimental: {
    serverActions: { bodySizeLimit: '25mb' },
  },
};

export default nextConfig;
