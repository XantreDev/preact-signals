# `@preact-signals/safe-react`

This is community driven preact/signals integration for React, based on official `@preact/signals-react` integration, since it's patching react - there are a lot of problems in different environments and bundlers. This package tries to solve this problem by this steps:

- no runtime react internals patching
- uses babel plugin to subscribe your components to signals (based on official `@preact/signals-react-transform`).
- if environment doesn't support babel plugin - exports HOC to subscribe your components to signals
- achieves the same features by bundler aliasing for react

## Signals

Signals is a performant state management library with two primary goals:

1. Make it as easy as possible to write business logic for small up to complex apps. No matter how complex your logic is, your app updates should stay fast without you needing to think about it. Signals automatically optimize state updates behind the scenes to trigger the fewest updates necessary. They are lazy by default and automatically skip signals that no one listens to.
2. Integrate into frameworks as if they were native built-in primitives. You don't need any selectors, wrapper functions, or anything else. Signals can be accessed directly and your component will automatically re-render when the signal's value changes.

Read the [announcement post](https://preactjs.com/blog/introducing-signals/) to learn more about which problems signals solves and how it came to be.

There are two ways of tracking signals:

- `automatic` - using babel plugin to subscribe your components to signals (based on official `@preact/signals-react-transform`).
- `manual` - manual adding tracking to your components with HOC

## Table of Contents

- [React Integration](#react-integration-features)
  - [Tracking](#tracking)
  - [Hooks](#hooks)
  - [Optimization: Put signal into JSX](#optimization-put-signal-into-jsx)
  - [Prop signal unwrapping](#prop-signal-unwrapping)
- [Installation](#installation)
  - automatic
    - [Vite](#vite-integration)
    - [Vite with `@preact-signals/utils`](#vite-integration-with-preact-signalsutils)
    - [react-native](#react-native-integration)
  - [Manual (next.js, webpack, etc)](#manual-integration)
- [Guide / API](https://github.com/preactjs/signals/#guide--api)
  - [`signal(initialValue)`](https://github.com/preactjs/signals/#signalinitialvalue)
    - [`signal.peek()`](https://github.com/preactjs/signals/#signalpeek)
  - [`computed(fn)`](https://github.com/preactjs/signals/#computedfn)
  - [`effect(fn)`](https://github.com/preactjs/signals/#effectfn)
  - [`batch(fn)`](https://github.com/preactjs/signals/#batchfn)
  - [`untracked(fn)`](https://github.com/preactjs/signals/#untrackedfn)
- [How it works](#how-it-works)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## React Integration features

> Note: please open an issue here if in some scenario you have problems with this integration.

### Tracking

The React adapter allows you to access signals directly inside your components and will automatically subscribe to them.

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

### Optimization: Put signal into JSX

The React adapter ships with several optimizations it can apply out of the box to minimize virtual-dom diffing. If you pass a signal directly into JSX, it will behave as component which renders value of signal.

```js
import { signal } from "@preact-signals/safe-react";

const count = signal(0);

// Unoptimized: Will trigger the surrounding
// component to re-render
function Counter() {
  return <p>Value: {count.value}</p>;
}

// Optimized: Will diff only value of signal
function Counter() {
  return (
    <p>
      <>Value: {count}</>
    </p>
  );
}
```

### Prop signal unwrapping

If you pass a signal as a prop to a component, it will automatically unwrap it for you. This means you can pass signals directly to DOM elements and they will be bound to the DOM node.

```js
import { signal } from "@preact-signals/safe-react";

const count = signal(0);

// data-count={count} will be unwrapped and equal to data-count={count.value}
const Counter = () => <div data-count={count}>Value: {count.value}</div>;
```

Comparison table:

| Feature             | `@preact/signals-react` | `@preact-signals/safe-react` (automatic) | `@preact-signals/safe-react` (manual) |
| ------------------- | ----------------------- | ---------------------------------------- | ------------------------------------- |
| Monkey patch free   | ❌                      | ✅                                       | ✅                                    |
| Tracking type       | automatic               | automatic                                | manual with HOC                       |
| Hooks               | ✅                      | ✅                                       | ✅                                    |
| Prop unwrapping     | ✅                      | ✅                                       | ❌                                    |
| Put signal into JSX | ✅                      | ✅                                       | ✅                                    |

## Alterations from `@preact/signals-react`

Ignoring updates while rendering same component in render. Since this behavior causes double or infinite rerendering in some cases.

```tsx
const A = () => {
  const count = signal(0);
  count.value++;
  return <div>{count.value}</div>;
};
```

## Installation:

```sh
npm install @preact-signals/safe-react
```

Integrations:

- Automatic
  - [Vite](#vite-integration)
  - [Vite with `@preact-signals/utils`](#vite-integration-with-preact-signalsutils)
  - [react-native](#react-native-integration)
- [Manual (next.js, webpack, etc)](#manual-integration)

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

Signals unwrapping via `React.createElement` is not supported yet in `react-native`. But since we are not using elements direct - we shouldn't care.

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

### Manual integration

```tsx
import { withTrackSignals } from "@preact-signals/safe-react/manual";

const A = withTrackSignals(() => {
  const count = signal(0);
  count.value++;
  return <div>{count.value}</div>;
});
```

### How it works

#### Automatic integration

Magic contains 2 parts:

- babel plugin. Which transforms your components to subscribe to signals

It will be transformed to:

```tsx
const sig = signal(0);
const A = () => <div>{sig.value}</div>;
```

```tsx
import { useSignals } from "@preact-signals/safe-react/tracking";

const sig = signal(0);
const A = () => {
  const store = useSignals();
  try {
    // all signals used in this function will be tracked
    return <div>{sig.value}</div>;
  } finally {
    effectStore[EffectStoreFields.finishTracking]();
  }
};
```

- jsx runtime. Which unwraps signals while it passed as props to elements

```tsx
const sig = signal(0);

// data-a={sig} will be unwrapped and equal to data-a={sig.value}
const A = () => <div data-a={sig}>{sig.value}</div>;
```

#### How babel plugin works

Babel plugin transforms your components to subscribe to signals. It works in 3 modes:

- `all` (default) - all components will be wrapped with try/finally block to track signals
- `manual` - you should wrap your components with `@trackSignals` directive to track signals
- `auto` - all component which contains `.value` access will be wrapped with try/finally block to track signals

##### How to specify mode

```json
{
  "plugins": [
    [
      "module:@preact-signals/safe-react/babel",
      {
        "mode": "manual"
      }
    ]
  ]
}
```

How babel plugin detects components?

- function starting with capital letter
- function uses jsx syntax

```tsx
// will be transformed
const A = () => <div>{sig.value}</div>;
// will not be transformed
const a = () => <div>{sig.value}</div>;
// will be transformed
/**
 * @trackSignals
 */
const b = () => <div>{sig.value}</div>;
```

You can use `@trackSignals` to opt-in to tracking for a component that doesn't meet the criteria above.
Or you can use `@noTrackSignals` to opt-out of tracking for a component that does meet the criteria above.

#### Manual integration

Manual integration wraps your component in try/finally block via HOC. It's equal to:

```tsx
import { withTrackSignals } from "@preact-signals/safe-react/manual";

const A = withTrackSignals(() => {
  const count = useSignal(0);
  count.value++;
  return <div>{count.value}</div>;
});
// equal to
import { useSignals } from "@preact-signals/safe-react/tracking";

const A = () => {
  const store = useSignals();
  try {
    // all signals used in this function will be tracked
    const count = signal(0);
    count.value++;
    return <div>{count.value}</div>;
  } finally {
    effectStore[EffectStoreFields.finishTracking]();
  }
};
```

### Troubleshooting

#### Some of my components are not updating

- Manual integration: you need to wrap your component with `withTrackSignals` HOC
- Automatic integration:
  Probably your component doesn't meet the criteria from [How babel plugin detects components?](#how-babel-plugin-detects-components) section. You can use `@trackSignals` to opt-in to tracking for a component that doesn't meet the criteria above.

#### Automatic integration: `Rendered more hooks than during the previous render`

This error occurs when you're using some component without hooks as render function conditionally.

```tsx
const sig = signal(0);
const A = ({ renderButton }: { renderButton: () => JSX.Element }) =>
  sig.value % 2 ? renderButton() : <div>{sig.value}</div>;

const B = () => <button>Some content</button>;

<A renderButton={B}>
sig.value++; // this will cause error
```

It isn't working, because transform think that `B` is a component, but it's just a function. There're 3 ways to fix this:

- rename `B` to `renderB` and use it as `renderButton={renderB}`. Since transform transforms only function starting with capital letter.
- use `React.createElement(B)` instead of `B()`
- Add `@noTrackSignals` directive to `B` function

```tsx
/**
 * @noTrackSignals
 */
const B = () => <button>Some content</button>;
```

#### `Error: Cannot update a component (`Component`) while rendering a different component (`Component2`). To locate the bad setState() call inside `Component2``

This error occurs when you're updating another component in render time of another component. In most case you should ignore this message, since it's just warning

To opt into this optimization, simply pass the signal directly instead of accessing the `.value` property.

> **Note**
> The content is wrapped in a React Fragment due to React 18's newer, more strict children types.

## License

`MIT`, see the [LICENSE](../../LICENSE) file.
