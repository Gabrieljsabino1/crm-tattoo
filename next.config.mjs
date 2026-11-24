import nextPWA from '@ducanh2912/next-pwa';

const withPWA = nextPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  cacheStartUrl: false,
  cacheOnFrontEndNav: false,
  // Keep authenticated CRM pages and API responses out of runtime caches.
  workboxOptions: {
    runtimeCaching: [],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default withPWA(nextConfig);
