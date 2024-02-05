import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "jsdom",
    clearMocks: true,
    setupFiles: ["./vitest-setup.ts"],
    globals: true,
    retry: 2,
    alias: {
      "@preact-signals/query": path.resolve("./src/index.ts"),
      "@tanstack/query-core": path.resolve(
        "./node_modules/@tanstack/query-core/src"
      ),
    },
  },
});
