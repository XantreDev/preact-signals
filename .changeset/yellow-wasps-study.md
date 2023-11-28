---
"@preact-signals/utils": minor
---

Added `rafReaction` for easier integration with raw DOM.

### `rafReaction`

Will execute reaction after deps changed on next animation frame. Return dispose function.

```tsx
const sig = signal(1);
const el = document.createElement("div");

rafReaction(
  // deps
  () => sig.value,
  // effect
  (value) => {
    el.style.transform = `translateX(${value}px)`;
  }
);

sig.value = 10;
```
