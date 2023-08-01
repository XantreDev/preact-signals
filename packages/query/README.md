Improved `@preact-signals/query` documentation:

---

# `@preact-signals/query`

`@preact-signals/query` acts as a bridge between the core functionality of `@tanstack/query-core` and the reactivity provided by `@preact/signals`. Designed as a drop-in replacement for `@tanstack/react-query`, this library not only mirrors its counterpart's functionalities but also offers enhanced hooks tailored for preact signals.

## Installation

Fetch `@preact-signals/query` via your preferred package manager:

```bash
# Using npm
npm install @preact-signals/query

# Using yarn
yarn add @preact-signals/query

# Using pnpm
pnpm add @preact-signals/query
```

## API Overview

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
  onError: () => {},
  onSuccess: () => {},
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

## License

`@preact-signals/query` is distributed under the [MIT License](./LICENSE).
