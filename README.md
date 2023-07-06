# `@preact-signals/components`

`Solidjs` inspired components for React/Preact and signals.

## Installation

You can install the library using npm:

```bash
npm i @preact-signals/components
yarn i @preact-signals/components
pnpm i @preact-signals/components
```

We are peer `@preact/signals-react` as peer dependency, so in case if you're using `preact` you need to resolve it into `@preact/signals`:
[How to do it](https://preactjs.com/guide/v10/getting-started#aliasing-react-to-preact), just repeat it for `@preact/signals-react`. Example:

```json
{
  "alias": {
    "react": "preact/compat",
    "react-dom/test-utils": "preact/test-utils",
    "react-dom": "preact/compat", // Must be below test-utils
    "react/jsx-runtime": "preact/jsx-runtime",
    "@preact/signals-react": "@preact/signals"
  }
}
```

## Usage

To use the components in your Preact application, you can import them from the library:

```jsx
import { Show, Switch } from "@preact-signals/components";

function App() {
  const counter = useSignal(0);

  return (
    <div>
      <Show when={() => counter.value % 2 === 0}>
        <div>Even</div>
      </Show>
      <Switch fallback={<div>Not found</div>}>
        <Match when={() => location.value.pathname === "/"}>
          <div>Home</div>
        </Match>
        <Match when={() => location.value.pathname === "/about"}>
          <div>About</div>
        </Match>
      </Switch>
    </div>
  );
}
```

## Components

### Show

The `Show` component conditionally renders its children based on a signal or accessor. If the signal or accessor returns a truthy value, the children are rendered. Otherwise, the `fallback` prop is rendered (if provided).

```jsx
import { useSignal } from "@preact/signals-react";

const counter = useSignal(0);

<Show when={counter}>{(currentCounter) => <div>{currentCounter}</div>}</Show>;
```

You can also use an accessor function instead of a signal:

```jsx
<Show when={() => counter() % 2 === 0}>
  <div>Even</div>
</Show>
```

### Switch

The `Switch` component conditionally renders its children based on the first `Match` component whose `when` prop matches the current value of the `when` prop which is signal or accessor. If no `Match` components match, the `fallback` prop is rendered (if provided).

```jsx
<Switch fallback={<div>Not found</div>}>
  <Match when={location.pathname === "/"}>
    <div>Home</div>
  </Match>
  <Match when={location.pathname === "/about"}>
    <div>About</div>
  </Match>
</Switch>
```

### Match

The `Match` component is used inside a `Switch` component to define a case that matches a particular value of the `when` prop which is signal or accessor.

```jsx
<Switch fallback={<div>Not found</div>}>
  <Match when={() => location.value.pathname === "/"}>
    <div>Home</div>
  </Match>
  <Match when={useComputed(() => location.value.pathname === "/about")}>
    <div>About</div>
  </Match>
</Switch>
```

This library is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
