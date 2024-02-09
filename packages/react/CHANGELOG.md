# @preact-signals/safe-react

## 0.5.3

### Patch Changes

- 0419e8c: Decreased package size by optimizing wasm
- d34885d: Fixed installation in runtimes without wasm support

## 0.5.2

### Patch Changes

- 9b02260: Update README with integration playgrounds

## 0.5.1

### Patch Changes

- 1c96810: Fix vite SWC integration in dev mode

## 0.5.0

### Minor Changes

- 75d8a9f: # Breaking Changes

  This release changes opt-in and opt-out directives to be the same as in `@preact/signals-react`.

  `@trackSignals` -> `@useSignals`
  `@noTrackSignals` -> `@noUseSignals`

  To support new directives, you can just find and replace all instances of the old directives with the new ones.

## 0.4.0

### Minor Changes

- fa41dfe: Added next.js support via swc plugin
- 8d728a5: - added SWC plugin, which behaves the same as Babel plugin.
  - added vite plugin, which for transpiling parts of node_modules.
    Updated information about SWC plugin in README
- 7db50e6: Changed cjs implementation from namespace to named import to align with swc plugin

## 0.3.1

### Patch Changes

- 29c5dbf: Written more comprehensive README.md. Added integration comparsion

## 0.3.0

### Minor Changes

- a1628ba: Added manual tracking option with HOC `withTrackSignals` for unsupported environments.

  ```tsx
  import { withTrackSignals } from "@preact-signals/safe-react/manual";

  const A = withTrackSignals(() => {
    const count = signal(0);
    count.value++;
    return <div>{count.value}</div>;
  });
  ```

- d5fc3f0: Removed incorrect jsx exports importSource `@preact-signals/safe-react` -> `@preact-signals/safe-react/jsx`

### Patch Changes

- 4616c74: Add info about babel transform
- 16ff353: Add troubleshooting section to README

## 0.2.3

### Patch Changes

- 40ee2a3: Remove microtask spam for each `useSignals` - batching it to one `queueMicrotask`

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
