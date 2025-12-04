# `@preact-signals/safe-react`

This is community driven preact/signals integration for React, based on official `@preact/signals-react` integration. 

The library differs in a few ways:

- supports SWC based build systems, like **Next.js** and **`@vitejs/plugin-react-swc`** with a Rust based plugin
- uses babel/swc plugin to subscribe your components to signals (based on official `@preact/signals-react-transform`).
- if environment doesn't support babel/swc plugin - exports [HOC](#manual-integration) to subscribe your components to signals

## Signals

Signals is a performant state management library with two primary goals:

1. Make it as easy as possible to write business logic for small up to complex apps. No matter how complex your logic is, your app updates should stay fast without you needing to think about it. Signals automatically optimize state updates behind the scenes to trigger the fewest updates necessary. They are lazy by default and automatically skip signals that no one listens to.
2. Integrate into frameworks as if they were native built-in primitives. You don't need any selectors, wrapper functions, or anything else. Signals can be accessed directly and your component will automatically re-render when the signal's value changes.

Read the [announcement post](https://preactjs.com/blog/introducing-signals/) to learn more about which problems signals solves and how it came to be.

There are two ways of tracking signals:

- `automatic` - using swc/babel plugin to subscribe your components to signals (based on official `@preact/signals-react-transform`).
- `manual` - manual adding tracking to your components with HOC

## Table of Contents

- [React Integration](#react-integration-features)
  - [Tracking](#tracking)
  - [Hooks](#hooks)
  - [Optimization: Put signal into JSX](#optimization-put-signal-into-jsx)
  - [Prop signal unwrapping](#prop-signal-unwrapping)
- [Installation](#installation)

  - automatic
    - [Next.js](#nextjs-integration)
    - [Vite swc](#vite-integration-swc)
    - [Vite babel](#vite-integration-babel)
    - [react-native](#react-native-integration)
  - [Manual (webpack, remix, etc)](#manual-integration)

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

## SWC plugin compatibility table

| `next` | `@preact-signals/safe-react` |  `@swc/core` |
|--------|------------------------------|--------------|
| `^14.0.0`  | `0.7.0`                  | -            |
| `15.0.3..15.1.7`   | `~0.8.0`         | `1.8.0-1.9.2`|
| `15.2.0..16.0.0`   | `~0.9.0`               | `1.11.1`     |
| [`>=16.0.0`*](#next-comments)   | `~0.10.0`               | `1.13.21`     |


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

| Feature             | `@preact/signals-react`            | `@preact-signals/safe-react` (automatic) | `@preact-signals/safe-react` (manual) |
| ------------------- | ---------------------------------- | ---------------------------------------- | ------------------------------------- |
| Monkey patch free   | ✅ (after 2.0.0 with babel plugin) | ✅                                       | ✅                                    |
| Tracking type       | automatic                          | automatic                                | manual with HOC                       |
| Hooks               | ✅                                 | ✅                                       | ✅                                    |
| Prop unwrapping     | ❌ (removed in 2.0.0)              | ✅(deprecated)                           | ❌                                    |
| Put signal into JSX | ✅                                 | ✅                                       | ✅                                    |

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
  - [Next.js](#nextjs-integration)
  - [Vite swc](#vite-integration-swc)
  - [Vite babel](#vite-integration-babel)
  - [Vite with `@preact-signals/utils`](#vite-integration-with-preact-signalsutils)
  - [react-native](#react-native-integration)
- [Manual (next.js, webpack, etc)](#manual-integration)

### Next.js integration

[Integration playground](https://codesandbox.io/p/github/XantreDev/preact-signals-nextjs/main)

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    swcPlugins: [
      [
        "@preact-signals/safe-react/swc",
        {
          // you should use `auto` mode to track only components which uses `.value` access.
          // Can be useful to avoid tracking of server side components
          mode: "auto",
        } /* plugin options here */,
      ],
    ],
  },
};

module.exports = nextConfig;
```

### Vite integration (swc)

[Integration playground](https://codesandbox.io/p/github/XantreDev/preact-signals-vite-swc/main)

```ts
// vite.config.ts
import { defineConfig } from "vite";
import reactSwc from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    reactSwc({
      plugins: [["@preact-signals/safe-react/swc", {}]],
    }),
  ],
});
```

### Vite integration (babel)

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ["module:@preact-signals/safe-react/babel"],
      },
    }),
  ],
});
```

### Vite props unwrapping (deprecated)

```ts
// vite.config.ts
import { defineConfig } from "vite";
// can be used with swc plugin, too
import react from "@vitejs/plugin-react";
import { createReactAlias } from "@preact-signals/safe-react/integrations/vite";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    // add this
    alias: [createReactAlias()],
  },
  plugins: [
    react({
      // add this
      jsxImportSource: "@preact-signals/safe-react/jsx",
      babel: {
        plugins: ["module:@preact-signals/safe-react/babel"],
      },
    }),
  ],
});
```

### Vite integration trackings signals in node_modules

Allows to transpile components that uses `@useSignals` in node_modules (For example: `@preact-signals/utils`)

[Integration playground](https://codesandbox.io/p/github/XantreDev/preact-signals-vite-swc/main)

```ts
// vite.config.ts
import { defineConfig } from "vite";
import reactSwc from "@vitejs/plugin-react-swc";
import { createSWCTransformDepsPlugin } from "@preact-signals/safe-react/integrations/vite";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: [
      // if some lib uses signals it's probably using `@preact/signals-react`
      {
        find: "@preact/signals-react",
        replacement: "@preact-signals/safe-react",
      },
    ],
  },
  plugins: [
    createSWCTransformDepsPlugin({
      filter: (id) => id.includes("node_modules"),
    }),
    reactSwc({
      plugins: [["@preact-signals/safe-react/swc", {}]],
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
  ],
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

- parser plugin. Which transforms your components to subscribe to signals

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

- (**Deprecated**) jsx runtime. Which unwraps signals while it passed as props to elements

```tsx
const sig = signal(0);

// data-a={sig} will be unwrapped and equal to data-a={sig.value}
const A = () => <div data-a={sig}>{sig.value}</div>;
```

#### How parser plugins works

Supported parsers:

- swc
- babel

Parser plugin transforms your components to subscribe to signals. It works in 3 modes:

- `all` (default)

  - Components: will be wrapped with try/finally block to track signals
  - Hooks (if [`transformHooks`](#swc-specific-options): `true`): all hooks that accesses `.value` will be wrapped with try/finally block to track signals

- `auto`

  - Components: components which contains `.value` access will be wrapped with try/finally block to track signals
  - Hooks (if [`transformHooks`](#swc-specific-options) true) that which contains `.value` access will be wrapped with try/finally block to track signals

- `manual` - none of hooks or components are tracked by default. You can use `@useSignals` comment to track signals

```ts
// @useSignals
const Component = () => <div />
```

##### How to options mode

- babel

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

- swc
  ```json
  [
    "@preact-signals/safe-react/swc",
    {
      "mode": "manual"
    }
  ]
  ```

#### SWC specific options

`transformHooks` - default: `true`

- `true` - transform hooks which uses `.value` access
- `false` - don't transform hooks

```json
[
  "@preact-signals/safe-react/swc",
  {
    "transformHooks": false
  }
]
```

##### How parser plugin detects components?

- function starting with capital letter
- function uses jsx syntax

```tsx
// will be transformed
const A = () => <div>{sig.value}</div>;
// will not be transformed
const a = () => <div>{sig.value}</div>;
// will be transformed
/**
 * @useSignals
 */
const b = () => <div>{sig.value}</div>;
```

You can use `@useSignals` to opt-in to tracking for a component that doesn't meet the criteria above.
Or you can use `@noUseSignals` to opt-out of tracking for a component that does meet the criteria above.

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
  Probably your component doesn't meet the criteria from [How parser plugin detects components?](#how-parser-plugin-detects-components) section. You can use `@useSignals` to opt-in to tracking for a component that doesn't meet the criteria above.

#### Automatic integration with Server Components: `Maybe one of these should be marked as a client entry with "use client":`

Some of server side component is transformed to track signals.
Solutions:

- mark it as client side component with `use client` directive

```tsx
"use client";

const A = () => <div>{sig.value}</div>;
```

- opt out from tracking with `@noUseSignals` directive`

```tsx
/**
 * @noUseSignals
 */
const Page = () => (
  <head>
    <title>Page title</title>
  </head>
);
```

- use `auto` mode of plugin, to transform only components which uses `.value` access. [How parser plugin detects components?](#how-parser-plugin-detects-components)

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    swcPlugins: [
      [
        "@preact-signals/safe-react/swc",
        {
          mode: "auto",
        },
      ],
    ],
  },
};

module.exports = nextConfig;
```

- **not recommended because of performance overhead** make component async (since component will be transformed only if it's sync)

```tsx
const Page = async () => (
  <head>
    <title>Page title</title>
  </head>
);
```

#### [Next.js double rendering](https://github.com/XantreDev/preact-signals/issues/87)

```tsx
/**
 * @useSignals
 */
const PureComponent = () => {
  // prints "render" twice on client side and once on server side
  console.log("render");

  return null;
};
```

It's happens because signals tracking uses `useSyncExternalStore` and for some reason it causes double rendering with Next.js strict mode. We can just to turn off strict mode in `next.config.js`

```js
module.exports = {
  // other config
  reactStrictMode: false,
};
```

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
- Add `@noUseSignals` directive to `B` function

```tsx
/**
 * @noUseSignals
 */
const B = () => <button>Some content</button>;
```

#### `Error: Cannot update a component (`Component`) while rendering a different component (`Component2`). To locate the bad setState() call inside `Component2``

This error occurs when you're updating another component in render time of another component. In most case you should ignore this message, since it's just warning

To opt into this optimization, simply pass the signal directly instead of accessing the `.value` property.

> **Note**
> The content is wrapped in a React Fragment due to React 18's newer, more strict children types.

#### Next.js comments

Opt-in and opt-out declarations are unsupported in server components due [to the issue](https://github.com/vercel/next.js/issues/86844). Next.js strips comments for server component files

## License

`MIT`, see the [LICENSE](../../LICENSE) file.
