# `@preact-signals/utils`

`@preact-signals/utils` is a standard library for Preact Signals, aimed at providing essential utilities for a more comfortable and streamlined usage of Preact Signals. This package contains several entries designed to enhance the flexibility and maintainability of Preact Signal-based projects.

## Installation

You should be sure that [one of preact signals runtimes](https://github.com/preactjs/signals) installed:

- `@preact/signals` for `preact`, it requires [additional step](#preactsignals-additional-step)
- `@preact/signals-react` for `react`

Fetch `@preact-signals/query` via your preferred package manager:

```bash
# Using npm
npm install @preact-signals/query

# Using yarn
yarn add @preact-signals/query

# Using pnpm
pnpm add @preact-signals/query
```

### `@preact/signals` additional step:

You should resolve `@preact/signals-react` as `@preact/signals`
To do it take a look at how to [resolve `react` as `preact`](https://preactjs.com/guide/v10/getting-started#aliasing-react-to-preact) and do it with signals. Plus you need to dedupe `preact`

#### [Vite example](../../apps/preact-test/vite.config.ts):

````ts
import preact from "@preact/preset-vite";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact()],
  resolve: {
    // add this line
    dedupe: ["preact"],
    alias: [
      { find: "react", replacement: "preact/compat" },
      { find: "react-dom/test-utils", replacement: "preact/test-utils" },
      { find: "react-dom", replacement: "preact/compat" },
      { find: "react/jsx-runtime", replacement: "preact/jsx-runtime" },
      // add this line
      { find: "@preact/signals-react", replacement: "@preact/signals" },
    ],
  },
});
`
## Main Entry: `@preact-signals/utils`

### `Uncached`/`$`

The `Uncached` type functions similarly to a Preact signal. It is essentially a wrapper around a function that can be passed into props or JSX. It can be created using the `$` function.

Uncached is just accessor function in object wrapper, that allows to use it in JSX
and use `instanceof` to check if it is Uncached. Main difference with Signal is that you shouldn't follow rules of
hooks while creating it.

```tsx
const sig = signal(1);

<div>{$(() => sig.value * 10)}</div>;
````

Using with component wrapped in `withSignalProps`

```tsx
const C = withSignalProps((props: { a: number }) => {
  return <div>{props.a}</div>;
});

const sig = signal(1);

<C a={$(() => sig.value)} />;
```

### `reaction`

The `reaction` function provides the ability to respond to changes that are tracked within a dependent function. It's particularly useful for managing side-effects or synchronizing with non-reactive parts of your code.
Creates a reactive effect that runs the given function whenever any of the dependencies change.

Enhanced version of:

```ts
effect(() => {
  const value = deps();
  untracked(() => fn(value));
});
```

### `getter`/`setter`

These functions are wrappers creators for signals, providing a convenient way to separate reading and writing responsibilities.

### `resource`

The `resource` type is a signal binding of a promise that includes Preact Signals' reactivity. It can be retried, rejected, or resolved, offering a streamlined way to manage asynchronous operations.

Resource example:

- Creates a resource that wraps a repeated promise in a reactive pattern:
- ```typescript

  ```

- // Without source
- const [resource, { mutate, refetch }] = createResource({
- fetcher: () => fetch("https://swapi.dev/api/people/1").then((r) => r.json()),
- });
- // With source
- const [resource, { mutate, refetch }] = createResource({
- source: () => userId.value,
- fetcher: (userId) => fetch(`https://swapi.dev/api/people/${userId}`).then((r) => r.json()),
- });
- ```

  ```

- @param options - Contains all options for creating resource
-
- @returns ```typescript
- [ResourceState<TResult>, { mutate: Setter<T>, refetch: () => void }]
- ```

  ```

-
- - Setting an `initialValue` in the options will mean that resource will be created in `ready` state
- - `mutate` allows to manually overwrite the resource without calling the fetcher
- - `refetch` will re-run the fetcher without changing the source, and if called with a value, that value will be passed to the fetcher via the `refetching` property on the fetcher's second parameter

### `createFlatStore`

A simplified implementation of a store, when keys values is converting to signals on demand, enabling easy state management.

```typescript
const store = createFlatStore({
  a: 1,
  b: 2,
});

const c = computed(() => store.a + store.b); // 3

store.a = 2;
store.b = 3;

console.log(c.value); // 5
```

## `@preact-signals/utils/hooks`: Hooks for Signals

This entry provides hooks creating to work with signals, enhancing the reactivity and composability in your components.

This hooks includes specific signal creators that is actual for some use cases, and binding of
utility stuff like, reasources, and flatStores.

## `@preact-signals/utils/components`: Reactive Components

This section includes components like `Show`, `Switch`, `Match`, `For`, which allow you to scope reactivity in your JSX. These components help in writing more declarative and readable code.

```tsx
<Show fallback={<p>bebe</p>} when={() => arr.value}>
  {(data) => (
    <ul>
      <For each={data} keyExtractor={(item) => item.id}>
        {(item) => <li>{renderItem(item)}</li>}
      </For>
    </ul>
  )}
</Show>
```

## `@preact-signals/utils/hocs`: High Order Components

High Order Components (HOCs) in this entry allow you to inject signals or `uncached` instances into props. This functionality helps in creating reusable and composable logic across different components.

Examples:

```tsx
const View$ = withSignalProps(View)
const Text$ = withSignalProps(Text)
const a = signal(10)
const b = signal(5)

<View$ hitSlop={useComputed(() => a.value + b.value)}  />
<View$ hitSlop={$(() => a.value + b.value)}  />

const Comp = (props: ReactiveProps<{a: number}>) => (
    <Show when={() => props.a > 10}
        {v => v + 10}
    </Show>
)
const B = reactifyLite(Comp)

<B  a={$(() => a.value + b.value)} />

// is not available yet
const C = reactify(Comp)

<C a$={() => a.value + b.value} />

// JSX transform idea
// use `$$` to pass props like in solidjs
<C a$$={a.value + b.value} />
```

## Installation

To add `@preact-signals/utils` to your project, you can use:

```bash
# npm
npm install @preact-signals/utils
# yarn
yarn add @preact-signals/utils
# pnpm
pnpm add @preact-signals/utils
```

### License

This project is licensed under the [MIT License](LICENSE).
