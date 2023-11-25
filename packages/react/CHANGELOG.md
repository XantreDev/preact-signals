# @preact-signals/safe-react

## 0.2.2

### Patch Changes

- 58a8047: Remove irrelevant information from README
- 3909f6c: react-native is supported from now. Added info to readme

## 0.2.1

### Patch Changes

- 5a2abc9: Fix of `jsxImportSource` while `@babel/plugin-transform-react-jsx` is trying to use main entry of jsx runtime instead of `jsx-runtime` package.
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

## 0.2.0

### Minor Changes

- c716069: Now can transform commonjs modules

## 0.1.0

### Minor Changes

- 50214d3: Added vite integration info to README. Enusred stability of work with vite

### Patch Changes

- 7684de9: Fixed typescript issue with `"moduleResolution": "node"`

## 0.0.3

### Patch Changes

- 03679a4: Moved deps for integrations to dependencies

## 0.0.2

### Patch Changes

- f15ddca: Altered babel plugin, altered some tricky behaviours
- 078119f: Fixed recursive rendering problems

## 0.0.1

### Patch Changes

- 1090bd6: Package init
