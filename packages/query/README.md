# `@preact-signals/query`

`@preact-signals/query` is `@tanstack/query-core` react bindings that uses `@preact/signals` for reactivity. It is drop-in replacement for `@tanstack/react-query`, because it shares tests and source code.

## Installation

You can install `@preact-signals/query` using your package manager of choice:

```bash
# npm
npm i @preact-signals/query
# yarn
yarn i @preact-signals/query
# pnpm
pnpm i @preact-signals/query
```

## API Overview

Truly reactive `@tanstack/react-query`

`@preact-signals/query` has the same api as `@tanstack/react-query`, but provides hooks that plays well with preact signals. This library provides additional hooks that plays well with preact signals. This kind of hooks usually has `$` suffix:

- `useQuery$`, `useInfiniteQuery$`
- `useMutation$`
- `useQueryClient$`
- `useIsFetching$`

Will be implemented later:

- `useQueries$`
- `useIsMutating$`

# Query hooks: `useQuery$, useInfiniteQuery$`

```ts
// returns flat-store
function useQuery$<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
>(
  // options will be executed for first time and then will be used when reactivity is triggered
  options: () => StaticQueryOptions<TQueryFnData, TError, TData, TQueryKey>
): UseQueryResult$<TData, TError>;
```

`useQuery$` is replacement for `useQuery` from `@tanstack/react-query`. It returns flat-store that can be used to subscribe to changes.

Differences from standard `useQuery`:

- Only object syntax supported
- `options` is function that returns `StaticQueryOptions` instead of `QueryOptions`. This is because `options` will be executed only once and then will be used when reactivity is triggered.
- returns flat-store. You shouldn't destructure it
- `suspense` is working on demand. It means that suspense will be triggered in place when `data` field actually read. Internally suspense throws error, so we have `dataSafe` field.
- `useErrorBoundary` also works on demand. It means that error boundary will be triggered in place when `data` field actually read.
- `onError`, `onSettled`, `onSuccess` are deprecated in react-query, so reactive query hooks are not implementing this pattern

### Example

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
      Register
    </button>
    <Show when={() => query.data}>
      {({ data }) => <div>Name: {data.name}</div>}
    </Show>
  </>
);
```

### Example suspense

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

    {/* only this place will suspend */}
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

## `useMutation$`

Works with the same as principals as query$ hooks. But here are gotchas:

- `useErrorBoundary` is not supported yet. And i don't think this feature is helpful

### Example:

```tsx
const mutation = useMutation$(() => ({
  mutationFn: doSomething,
  onError: () => {},
  onSuccess: () => {},
}));

return <button onClick={mutation.mutate}>Mutate</button>;
```

## `useQueryClient$`

Returns client wrapped in signals

## Filter hooks (`useIsFetching$`)

Receives reactive callback that returns filter options. Hook is returning result accessor

```tsx
// returns ReadonlySignal<number>
const isFetching = useIsFetching$(() => null);
const isFetchingByKey = useIsFetching$(() => ({
  queryFn: ["123"],
}));

return (
  <>
    <div>Count of all fetching queries(not optimized): {isFetching.value}</div>

    <div>
      Count of all fetching queries(optimized, no rerenders): {isFetching}
    </div>
    <div>
      Count of fetching queries by key(optimized, no rerenders):{" "}
      {isFetchingByKey}
    </div>
  </>
);
```

### License

`@preact-signals/query` is licensed under the [MIT License](./LICENSE).
