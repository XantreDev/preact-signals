---
"@preact-signals/utils": minor
---

Added WritableUncached which receives getter and setter functions.

```ts
const a = signal({ a: 1 });
const aField = $w({
  get() {
    return a().a;
  },
  set(value) {
    a({ a: value });
  },
});

console.log(aField.value); // 1
aField.value = 2;
console.log(aField.value); // 2
console.log(a.value); // { a: 2 }
```
