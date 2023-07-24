import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "happy-dom",
    alias: {
      "@preact-signals/hooks/shims": "@preact/signals-react",
      "@preact/signals-core": "@preact/signals-react",
    },
  },
});
