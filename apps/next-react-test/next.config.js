// @ts-check
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    swcPlugins: [
      [
        "@preact-signals/safe-react/swc",
        {
          transformHooks: true,
          mode: "auto"
        },
      ],
    ],
  },
  turbopack: {
    resolveAlias: {
      "@preact/signals-react": "@preact-signals/safe-react",
    },
  },
  reactStrictMode: false,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@preact/signals-react": "@preact-signals/safe-react",
    };

    return config;
  },
};

module.exports = nextConfig;
