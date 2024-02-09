# `@preact-signals/query`

`@preact-signals/query` acts as a bridge between the core functionality of `@tanstack/query-core` and the reactivity provided by `@preact/signals`. Designed as a drop-in replacement for `@tanstack/react-query`, this library not only mirrors its counterpart's functionalities but also offers enhanced hooks tailored for preact signals.

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

```ts
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
```

## Table of Contents

- [API Overview](#api-overview)
- [Query Hooks: `useQuery$, useInfiniteQuery$`](#query-hooks-usequery-useinfinitequery)
- [Mutation Hooks: `useMutation$`](#mutation-hooks-usemutation)
- [Accessing the Client: `useQueryClient$`](#accessing-the-client-usequeryclient)
- [Filtering with Hooks: `useIsFetching$`](#filtering-with-hooks-useisfetching)
- [Configuring suspense behavior for `useQuery$` and `useInfiniteQuery$`](#configuring-suspense-behavior-for-usequery-and-useinfinitequery)
- [License](#license)

## API Overview

[Doumentation](https://tsdocs.dev/docs/@preact-signals/query)

Experience the reactive elegance of `@tanstack/react-query` with `@preact-signals/query`.

Although `@preact-signals/query` adopts the API of `@tanstack/react-query`, it comes with additional hooks that are specifically optimized for preact signals. You'll recognize these hooks by the appended `$` sign:

- `useQuery$`, `useInfiniteQuery$`
- `useMutation$`
- `useQueryClient$`
- `useIsFetching$`

Awaited hooks include:

- `useQueries$`
- `useIsMutating$`

## Query Hooks: `useQuery$, useInfiniteQuery$`

`useQuery$` stands as the reactive counterpart to `useQuery` from `@tanstack/react-query`. Instead of the usual reactive object, this hook yields a flat-store.

Primary Differences:

- Adopts the object syntax exclusively.
- Requires a function for `options` that returns `StaticQueryOptions`, as they're executed once initially and then reused when reactivity comes into play.
- Results in a flat-store; avoid destructuring.
- Both `suspense` and `useErrorBoundary` are demand-triggered. They're invoked at the exact moment the `data` field is accessed.
- As `onError`, `onSettled`, and `onSuccess` are phased out in `react-query`, these aren't implemented in reactive query hooks.

### Usage

```tsx
const isUserRegistered = useSignal(false);

const query = useQuery$(() => ({
  queryKey: ["user"],
  queryFn: () => fetchUser(),
  enabled: isUserRegistered.value,
}));

return (
  <>
    <button onClick={() => (isUserRegistered.value = !isUserRegistered.value)}>
      Toggle Registration
    </button>
    <Show when={() => query.data}>
      {(data) => <div>Name: {data().name}</div>}
    </Show>
  </>
);
```

### Suspense Mode

```tsx
const query = useQuery$(() => ({
  queryKey: ["key"],
  queryFn: fetchStatistics,
  suspense: true,
}));

return (
  <>
    <Profile />
    <Jokes />

    {/* Here, only this segment will enter suspense mode */}
    <Suspense fallback={<Loader />}>
      <Show when={() => query.data}>
        {(data) => (
          <ul>
            {data().map((item) => (
              <li key={item.label}>{item.data}</li>
            ))}
          </ul>
        )}
      </Show>
    </Suspense>
  </>
);
```

## Mutation Hooks: `useMutation$`

Functionally similar to the query$ hooks, with a couple of nuances:

- Currently, `useErrorBoundary` isn't available. It's under evaluation for its utility.

### Sample Usage

```tsx
const mutation = useMutation$(() => ({
  mutationFn: doSomething,
  onError: (error) => {
    console.error("doSomething failed", error);
  },
  onSuccess: (data) => {
    console.log("wow we've done something", data);
  },
}));

return <button onClick={mutation.mutate}>Execute Mutation</button>;
```

## Accessing the Client: `useQueryClient$`

This hook returns the client, encapsulated in signals.

## Filtering with Hooks: `useIsFetching$`

Accepts a reactive callback returning filter options and provides an accessor for the result.

```tsx
// returns ReadonlySignal<number>
const overallFetching = useIsFetching$(() => null);
const specificFetchCount = useIsFetching$(() => ({
  queryFn: ["123"],
}));

return (
  <>
    <div>Total fetching queries (unoptimized): {overallFetching.value}</div>
    <div>
      Total fetching queries (optimized, no rerenders): {overallFetching}
    </div>
    <div>
      Fetch count by key (optimized, no rerenders): {specificFetchCount}
    </div>
  </>
);
```

## Configuring suspense behavior for `useQuery$` and `useInfiniteQuery$`

If you turn suspense on, the query will fetch after component render (if `data` is not accessed) or on the first access of `data`. But you can alter this behavior with `suspenseBehavior` option (`load-on-access` is default).

- `suspend-eagerly` - executes and suspends the query on mount. Data field will always be loaded. Helpful to be access data without worry about `.data` field will throw a Promise.
- `suspend-on-access` - pre executes a query, but suspends only on first access of `.data` field. Helpful to suspend child components if passing accessor as prop.
- `load-on-access` - executes query on first access of `.data` field or if unused on `useEffect`. Legacy behavior, will be changed to `suspend-on-access` in next major release.

```tsx
const query = useQuery$(() => ({
  queryKey: ["key"],
  queryFn: fetchStatistics,
  suspense: true,
  suspenseBehavior: "suspend-eagerly",
}));
```

## License

`@preact-signals/query` is distributed under the [MIT License](./LICENSE).
