import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "happy-dom",
    alias: {
      "@preact/signals-react": "@preact/signals-react",
    },
  },
});
