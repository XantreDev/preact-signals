---
"@preact-signals/utils": minor
---

Added options to `reaction` utility.
The memoize property is false by default, but can be turned on, that will memoize deps function

```ts
// will only reexecute reaction if deps result actually changed
reaction(
  () => {
    sig.value;
    return sig2.value;
  },
  () => {},
  {
    memoize: true,
  }
);
```
