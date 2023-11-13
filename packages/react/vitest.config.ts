import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import packageJson from "./package.json";

const selfName = packageJson.name;

export default defineConfig({
  esbuild: {
    jsx: "preserve",
  },
  test: {
    environment: "happy-dom",
    setupFiles: "./setupVitest.ts",

    alias: [
      {
        find: /^react$/,
        replacement: packageJson.exports["./react"],
      },
      {
        find: "@preact-signals/react/jsx-runtime",
        replacement: packageJson.exports["./jsx-runtime"],
      },
      {
        find: "@preact-signals/react/jsx-dev-runtime",
        replacement: packageJson.exports["./jsx-dev-runtime"],
      },
      {
        find: selfName,
        replacement: "./src/index.ts",
      },
      {
        find: "@preact/signals-react",
        replacement: "./src/index.ts",
      },
    ],
  },
  plugins: [
    react({
      jsxImportSource: selfName,
      babel: {
        plugins: [
          [
            "module:@preact/signals-react-transform",
            {
              importSource: selfName,
            },
          ],
        ],
      },
    }),
  ],
  define: {
    __DEV__: true,
  },
});
