/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ hostname: 'raw.githubusercontent.com' }],
    domains: ['thumbs.dreamstime.com', 'cryptologos.cc'],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/all',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
