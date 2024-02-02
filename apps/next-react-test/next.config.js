/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    swcPlugins: [[require.resolve("@preact-signals/safe-react/swc"), {}]],
    turbo: {
      resolveAlias: {
        "@preact/signals-react": "@preact-signals/safe-react",
      },
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@preact/signals-react": "@preact-signals/safe-react",
    };

    return config;
  },
};

module.exports = nextConfig;
