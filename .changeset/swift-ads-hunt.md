---
"@preact-signals/utils": minor
---

Creates signal that linked to value passed to hook, with unwrapping of signals to avoid `.value.value`

```tsx
// always linked to value passed to hook
const s1 = useLinkedSignal(Math.random() > 0.5 ? 1 : 0);
// 0 | 1
console.log(s1.peek());

const s2 = useLinkedSignal(Math.random() > 0.5 ? signal(true) : false);
// false | true
console.log(s2.peek());

// deeply unwrapping
const s3 = useLinkedSignal(signal(signal(signal(false))));
// false
console.log(s3.peek());
```
