# `@preact-signals/safe-react`

This is community driven preact/signals integration for React, based on official `@preact/signals-react` integration, since it's patching react - there are a lot of problems in different environments and bundlers. This package tries to solve this problem by this steps:

- no runtime react internals patching
- uses babel plugin to subscribe your components to signals (based on official `@preact/signals-react-transform`).
- achieves the same features by bundler aliasing for react

## Alterations

Ignoring updates while rendering same component in render. Since this behavior causes double or infinite rerendering in some cases.

```tsx
const A = () => {
  const count = signal(0);
  count.value++;
  return <div>{count.value}</div>;
};
```

## Signals

Signals is a performant state management library with two primary goals:

1. Make it as easy as possible to write business logic for small up to complex apps. No matter how complex your logic is, your app updates should stay fast without you needing to think about it. Signals automatically optimize state updates behind the scenes to trigger the fewest updates necessary. They are lazy by default and automatically skip signals that no one listens to.
2. Integrate into frameworks as if they were native built-in primitives. You don't need any selectors, wrapper functions, or anything else. Signals can be accessed directly and your component will automatically re-render when the signal's value changes.

Read the [announcement post](https://preactjs.com/blog/introducing-signals/) to learn more about which problems signals solves and how it came to be.

## Installation:

```sh
npm install @preact-signals/safe-react
```

Integrations:

- [Vite](#vite-integration)
- [Vite with `@preact-signals/utils`](#vite-integration-with-preact-signalsutils)
- [react-native](#react-native-integration)

### Vite integration

```ts
// vite.config.ts
import { defineConfig } from "vite";
// using react babel, since preact-signals integration has no swc plugin yet
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
      jsxImportSource: "@preact-signals/safe-react/jsx",
      babel: {
        plugins: ["module:@preact-signals/safe-react/babel"],
      },
    }),
  ],
});
```

### Vite integration with `@preact-signals/utils`

[Integration playground](https://stackblitz.com/edit/vitejs-vite-mhfwge?file=vite.config.ts)

1. Install `vite-plugin-babel`
2. Update config

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import babel from "vite-plugin-babel";
import type { PluginOptions } from "@preact-signals/safe-react/babel";
import { createReactAlias } from "@preact-signals/safe-react/integrations/vite";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: [
      // add react alias
      createReactAlias(),
      // replace @preact/signals-react with @preact-signals/safe-react for @preact-signals/utils
      {
        find: "@preact/signals-react",
        replacement: "@preact-signals/safe-react",
      },
    ],
  },
  plugins: [
    // processing `@preact-signals/utils/components` to enable tracking
    babel({
      filter: /@preact-signals\/utils/,
      babelConfig: {
        plugins: [
          [
            "module:@preact-signals/safe-react/babel",
            {
              mode: "manual",
            } satisfies PluginOptions,
          ],
        ],
      },
    }),
    react({
      // using custom wrapper for jsx runtime and babel plugin for components
      jsxImportSource: "@preact-signals/safe-react/jsx",
      babel: {
        plugins: ["module:@preact-signals/safe-react/babel"],
      },
    }),
  ],
});
```

### React Native integration

```sh
yarn add -D babel-plugin-module-resolver
```

```js
// babel.config.js
module.exports = {
  // or expo-preset or metro-react-native-babel-preset
  presets: ["@rnx-kit/babel-preset-metro-react-native"],
  plugins: [
    [
      "module-resolver",
      {
        alias: [
          {
            "@preact/signals-react": "@preact-signals/safe-react",
          },
        ],
      },
    ],
    "module:@preact-signals/safe-react/babel",
    // transpiling jsx before preset
    [
      "@babel/plugin-transform-react-jsx",
      {
        runtime: "automatic",
        importSource: "@preact-signals/safe-react/jsx",
      },
    ],
  ],
};
```

#### Caveat

Signals unwrapping via `React.createElement` is not supported yet in `react-native`. But since we are not using elements direct - we shouldn't care

```ts
const s = signal(0);
// not working
const Component1 = () => {
  return React.createElement("div", { a: s });
};
// working
const Component2 = () => {
  return React.createElement("div", { a: s.value });
};
// working
const Component3 = () => {
  return <div a={s} />
};
```

- [Guide / API](https://github.com/preactjs/signals/#guide--api)
  - [`signal(initialValue)`](https://github.com/preactjs/signals/#signalinitialvalue)
    - [`signal.peek()`](https://github.com/preactjs/signals/#signalpeek)
  - [`computed(fn)`](https://github.com/preactjs/signals/#computedfn)
  - [`effect(fn)`](https://github.com/preactjs/signals/#effectfn)
  - [`batch(fn)`](https://github.com/preactjs/signals/#batchfn)
  - [`untracked(fn)`](https://github.com/preactjs/signals/#untrackedfn)
- [React Integration](#react-integration-features)
  - [Hooks](#hooks)
- [License](#license)

## React Integration features

> Note: please open an issue here if in some scenario you have problems with this integration.

The React integration can be installed via:

```sh
npm install @preact-signals/safe-react
```

Similar to the Preact integration, the React adapter allows you to access signals directly inside your components and will automatically subscribe to them.

```js
import { signal } from "@preact-signals/safe-react";

const count = signal(0);

function CounterValue() {
  // Whenever the `count` signal is updated, we'll
  // re-render this component automatically for you
  return <p>Value: {count.value}</p>;
}
```

### Hooks

If you need to instantiate new signals inside your components, you can use the `useSignal` or `useComputed` hook.

```js
import { useSignal, useComputed } from "@preact-signals/safe-react";

function Counter() {
  const count = useSignal(0);
  const double = useComputed(() => count.value * 2);

  return (
    <button onClick={() => count.value++}>
      Value: {count.value}, value x 2 = {double.value}
    </button>
  );
}
```

### Rendering optimizations

The React adapter ships with several optimizations it can apply out of the box to skip virtual-dom rendering entirely. If you pass a signal directly into JSX, it will bind directly to the DOM `Text` node that is created and update that whenever the signal changes.

```js
import { signal } from "@preact-signals/safe-react";

const count = signal(0);

// Unoptimized: Will trigger the surrounding
// component to re-render
function Counter() {
  return <p>Value: {count.value}</p>;
}

// Optimized: Will update the text node directly
function Counter() {
  return (
    <p>
      <>Value: {count}</>
    </p>
  );
}
```

To opt into this optimization, simply pass the signal directly instead of accessing the `.value` property.

> **Note**
> The content is wrapped in a React Fragment due to React 18's newer, more strict children types.

### Troubleshooting

### Typescript

> Cannot find module '@preact-signals/safe-react/integration/vite' or its corresponding type declarations
> You should specify moduleResolution: "nodenext" or "bundler" in your tsconfig.json

```json
{
  "compilerOptions": {
    "moduleResolution": "nodenext"
  }
}
```

## License

`MIT`, see the [LICENSE](../../LICENSE) file.
