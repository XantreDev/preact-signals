import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    // browser: {
    //   name: "chrome",
    //   enabled: true,
    // },
    clearMocks: true,
    setupFiles: ["./vitest-setup.ts"],
    silent: false,
    cache: false,
    globals: true,
    // setupFiles: ["./vitest.setup.ts", "@testing-library/react/dont-cleanup-after-each"],
    alias: {
      "@preact-signals/query": "./src/index.ts",
      "@tanstack/query-core": "./node_modules/@tanstack/query-core/src",
    },
  },
});
