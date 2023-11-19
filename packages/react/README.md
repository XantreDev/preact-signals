# Work in progress, not ready for production

# `@preact-signals/safe-react`

This is community driven preact/signals integration for React, based on official `@preact/signals-react` integration, since it's patching react - there are a lot of problems in different envirements and bundlers. This package tries to solve this problem by this steps:

- no runtime react internals patching
- uses babel plugin to subscribe your components to signals (based on official `@preact/signals-react-transform`).
- achieves the same features by bundler aliasing for react

## Alterations

Ignoring updates while rendering same component in render. Since this behavior causes double rerendering in some cases.

```tsx
const A = () => {
  const count = signal(0);
  count.value++;
  return <div>{count.value}</div>;
};
```

# Signals

Signals is a performant state management library with two primary goals:

1. Make it as easy as possible to write business logic for small up to complex apps. No matter how complex your logic is, your app updates should stay fast without you needing to think about it. Signals automatically optimize state updates behind the scenes to trigger the fewest updates necessary. They are lazy by default and automatically skip signals that no one listens to.
2. Integrate into frameworks as if they were native built-in primitives. You don't need any selectors, wrapper functions, or anything else. Signals can be accessed directly and your component will automatically re-render when the signal's value changes.

Read the [announcement post](https://preactjs.com/blog/introducing-signals/) to learn more about which problems signals solves and how it came to be.

## Installation:

```sh
npm install @preact-signals/safe-react
```

<!-- ### Vite integration -->

- [Guide / API](https://github.com/preactjs/signals/README.md#guide--api)
  - [`signal(initialValue)`](https://github.com/preactjs/signals/README.md#signalinitialvalue)
    - [`signal.peek()`](https://github.com/preactjs/signals/README.md#signalpeek)
  - [`computed(fn)`](https://github.com/preactjs/signals/README.md#computedfn)
  - [`effect(fn)`](https://github.com/preactjs/signals/README.md#effectfn)
  - [`batch(fn)`](https://github.com/preactjs/signals/README.md#batchfn)
  - [`untracked(fn)`](https://github.com/preactjs/signals/README.md#untrackedfn)
- [React Integration](#react-integration)
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

### Trouble shooting

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
