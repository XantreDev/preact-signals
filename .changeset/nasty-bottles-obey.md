---
"@preact-signals/utils": minor
---

Removed implementation of JSX binding for `$`.
From know `$` has `Signal` in prototype chain.

```tsx
console.log($(() => 10) instanceof Signal); // true
```

It actually compatible with signal in most cases, but it has not value, only callback for calculation.
