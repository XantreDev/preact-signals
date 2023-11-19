import { defineConfig } from "vitest/config";
import type { PluginOptions } from "./src/babel";
import react from "@vitejs/plugin-react";
import packageJson from "./package.json";

const selfName = packageJson.name;

const exactRegEx = (it: string) => new RegExp(`^${it}$`);

export default defineConfig({
  esbuild: {
    jsx: "preserve",
  },

  test: {
    environment: "happy-dom",
    setupFiles: "./setupVitest.ts",
    cache: false,
    // inspectBrk: true,
    // threads: false,


    alias: [
      {
        find: exactRegEx("react"),
        replacement: require.resolve(packageJson.exports["./react"].default),
      },
      {
        find: exactRegEx(`${selfName}/jsx-runtime`),
        replacement: require.resolve(
          packageJson.exports["./jsx-runtime"].default
        ),
      },
      {
        find: `${selfName}/jsx-dev-runtime`,
        replacement: require.resolve(
          packageJson.exports["./jsx-dev-runtime"].default
        ),
      },
      {
        find: exactRegEx(`${selfName}/tracking`),
        replacement: require.resolve(
          packageJson.exports["./tracking"]["react-native"]
        ),
      },
      {
        find: exactRegEx(selfName),
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
      exclude: ["test/useSignals.test.tsx"],
      babel: {
        plugins: [
          [
            "module:@preact-signals/safe-react/babel",
            { mode: "auto" } satisfies PluginOptions,
          ],
        ],
      },
    }),
    react({
      include: ["test/useSignals.test.tsx"],
      jsxImportSource: selfName,
    }),
  ],
  define: {
    __DEV__: true,
  },
});
