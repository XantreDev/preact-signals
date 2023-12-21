/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    swcPlugins: [[require.resolve("@preact-signals/safe-react/swc"), {}]],
  },
};

module.exports = nextConfig;
