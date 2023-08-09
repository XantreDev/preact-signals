---
"@preact-signals/utils": minor
---

- fixed flat-store hooks bindings
- implemented typesafe `createFlatStoreOfSignals`

This function wraps provided **signals and value** to flat store. You can pass computed's too and it will be readonly field

```typescript
const [store, setStore] = createFlatStoreOfSignals({
  a: 1,
  b: 2,
  c: signal(10),
  d: computed(() => 10),
});

// ok
setStore({
  a: 10,
  b: 11,
  c: 12,
});

setStore({
  // type error and throws
  d: 10,
});
```

- implemented `useFlatStoreOfSignals` hook binding
