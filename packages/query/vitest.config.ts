import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    clearMocks: true,
    setupFiles: ["./vitest-setup.ts"],
    silent: false,
    cache: false,
    globals: true,
    alias: {
      "@preact-signals/query": "./src/index.ts",
      "@tanstack/query-core": "./node_modules/@tanstack/query-core/src",
    },
  },
});
