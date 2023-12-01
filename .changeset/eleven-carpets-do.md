---
"@preact-signals/safe-react": minor
---

Added manual tracking option with HOC `withTrackSignals` for unsupported environments.

```tsx
import { withTrackSignals } from "@preact-signals/safe-react/manual";

const A = withTrackSignals(() => {
  const count = signal(0);
  count.value++;
  return <div>{count.value}</div>;
});
```
