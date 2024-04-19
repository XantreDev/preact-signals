---
"@preact-signals/query": major
---

# Breaking change:

Added `executeOptionsOnReferenceChange` (default: true) to reexectue mutation or query options callback on each reference change (for proper update depending on closuje)
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

Old behavior is can be used with `executeOptionsOnReferenceChange`: false. Options callback will be reexecuted only when deps tracked by reactivity changes

```ts
const [state, setState] = useState(0);
useMutation$(() => ({
  mutationFn,
  executeOptionsOnReferenceChange: false,
  onSuccess: () => {
    // state will be recaptured only if reactive dependency changed (in case without deps it will always be 0)
    console.log(state);
  },
}));
```
