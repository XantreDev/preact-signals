---
"@preact-signals/safe-react": patch
---

Fix of `jsxImportSource` while `@babel/plugin-transform-react-jsx` is trying to use main entry of jsx runtime instead of `jsx-runtime` package.
Changed `jsxImportSource` to satisfy this requirement.

```ts, diff
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { createReactAlias } from "@preact-signals/safe-react/integrations/vite";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    // add react alias
    alias: [createReactAlias()],
  },
  plugins: [
    react({
      // using custom wrapper for jsx runtime and babel plugin for components
      // Previously: jsxImportSource: "@preact-signals/safe-react",
      jsxImportSource: "@preact-signals/safe-react/jsx",
      babel: {
        plugins: ["module:@preact-signals/safe-react/babel"],
      },
    }),
  ],
});
```

For now old style are also working but will be dropped in next minor