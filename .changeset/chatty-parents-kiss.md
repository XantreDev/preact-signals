---
"@preact-signals/query": major
---

# Breaking change:

Added `useOnlyReactiveUpdates` (default: false) to reexectue mutation options callback on each render (for proper update depending on closuje)
This change is addresses issue that everything is needed to be signal to work properly with `useMutation$`

```ts
const [state, setState] = useState(0);
useMutation$(() => ({
  mutationFn,
  onSuccess: () => {
    // previous behavior - state will be recaptured only if reactive dependency changed (in case without deps it will always be 0)
    // new behavior will be synced with current state value
    console.log(state);
  },
}));
```

Old behavior is can be used with `useOnlyReactiveUpdates`: true

```ts
const [state, setState] = useState(0);
useMutation$(() => ({
  mutationFn,
  useOnlyReactiveUpdate: true,
  onSuccess: () => {
    // state will be recaptured only if reactive dependency changed (in case without deps it will always be 0)
    console.log(state);
  },
}));
```
