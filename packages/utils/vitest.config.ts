import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "happy-dom",
    setupFiles: "./setupVitest.ts",
  },
  define: {
    __DEV__: true,
  },
});
