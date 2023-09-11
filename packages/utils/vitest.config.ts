import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "happy-dom",

  },
  define: {
    __DEV__: "process.env.NODE_ENV !== 'production'"
  }
});
