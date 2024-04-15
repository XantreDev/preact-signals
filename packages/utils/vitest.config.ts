import { defineConfig } from "vitest/config";
import babel from "vite-plugin-babel";

export default defineConfig({
  test: {
    environment: "happy-dom",
    setupFiles: "./setupVitest.ts",
  },
  define: {
    __DEV__: true,
  },
  resolve: {
    alias: {
      "@preact/signals-react": "@preact-signals/safe-react",
    },
  },
  plugins: [
    // @ts-expect-error
    babel({
      filter: /\.(j|t)sx$/,
      babelConfig: {
        plugins: ["module:@preact-signals/safe-react/babel"],
        parserOpts: {
          plugins: ["jsx", 'typescript'],
        },
      },
    }),
  ],
});
