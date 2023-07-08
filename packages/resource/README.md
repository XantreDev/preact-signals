# `@preact-signals/resource`

`@preact-signals/resource` is a powerful reactive utility for managing data fetching and its related state in React/Preact. By wrapping asynchronous functions with a reactive pattern, it allows you to seamlessly integrate data fetching into your Preact application. 

## Installation

You can install `@preact-signals/resource` using your package manager of choice:

```bash
# npm
npm i @preact-signals/resource
# yarn
yarn i @preact-signals/resource
# pnpm
pnpm i @preact-signals/resource
```

## API Overview

`@preact-signals/resource` provides the following main functions: 

- `createResource`
- `useResource`

### `createResource`

`createResource` is a utility function to wrap a repeated promise in a reactive pattern. It accepts an options object which should at least include a `fetcher` function. This `fetcher` function should return a Promise that fetches the necessary data. Optionally, a `source` can be provided which can trigger the `fetcher` whenever it changes.

The `createResource` function returns an array containing a `ResourceState` object and a set of actions (`mutate`, `refetch`, `dispose`)
```typescript
import { createResource } from "@preact-signals/resource";

const [resource, { mutate, refetch }] = createResource({
  fetcher: () => fetch("https://swapi.dev/api/people/1").then((r) => r.json()),
});

// or with source
const [resource, { mutate, refetch, dispose }] = createResource({
  source: () => userId.value,
  fetcher: (userId) =>
    fetch(`https://swapi.dev/api/people/${userId}`).then((r) => r.json()),
});
```

- `mutate`: allows manually overwriting the resource without calling the fetcher
- `refetch`: re-runs the fetcher without changing the source, and if called with a value, that value will be passed to the fetcher via the `refetching` property on the fetcher's second parameter

### `useResource`

`useResource` is a Preact hook that allows for using resources inside React/Preact components.

```typescript
import { Match, Switch } from "@preact-signals/components";
import { useResource } from "@preact-signals/resource";

const [resource, { refetch }] = useResource({
  fetcher: () =>
    fetch("https://jsonplaceholder.typicode.com/todos").then((response) =>
      response.json()
    ),
});

return (
  <>
    <button onClick={() => refetch()}>Refresh</button>
    <Switch>
      <Match when={() => resource.loading}>Loading...</Match>
      <Match when={() => resource.error}>Error</Match>
      <Match when={() => resource()}>
        {(todos) => (
          <ul>
            {todos().map((todo) => (
              <li key={todo.id}>
                {todo.title}, {todo.completed ? "Completed" : "Not completed"}
              </li>
            ))}
          </ul>
        )}
      </Match>
    </Switch>
  </>
);
```

---

### Example: Creating a Resource that Depends on Another Resource/Signal

```tsx
import { useSignal } from "@preact/signals-react";
import { createResource, useResource } from "@preact-signals/resource";

const Component = () => {
  // Assume that we have a signal that represents the current user ID
  const userId = useSignal(1);

  // Then we create another resource that fetches the user's todos
  // This resource is dependent on the userResource
  const [todosResource] = useResource({
    source: () => userId.value, // Here is the dependency
    fetcher: (userId) =>
      fetch(`https://jsonplaceholder.typicode.com/users/${userId}/todos`).then(
        (response) => response.json()
      ),
  });

  return (
    <>
      <button onClick={() => todosResource.refetch()}>Refresh Todos</button>
      <Switch>
        <Match when={() => todosResource.loading}>Loading...</Match>
        <Match when={() => todosResource.error}>Error</Match>
        <Match when={() => todosResource()}>
          {(todos) => (
            <ul>
              {todos().map((todo) => (
                <li key={todo.id}>
                  {todo.title}, {todo.completed ? "Completed" : "Not completed"}
                </li>
              ))}
            </ul>
          )}
        </Match>
      </Switch>
    </>
  );
};
```

In this example, the `userPostsResource` fetches the posts for the user indicated by the `userId` signal. When the `userId` signal changes, the `userPostsResource` will automatically fetch the new user's posts.

## License

`@preact-signals/resource` is licensed under the [MIT License](./LICENSE).
