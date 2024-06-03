---
"@preact-signals/utils": minor
---

Implemented `experimental_stateMacrosOptimization` for automatic optimization of state macroses in JSX

Example: 
```tsx
import { $state, $derived } from '@preact-signals/utils/macro'

let a = $state(10)
let b = $state(20)

const c = <>{a * b + 10}</>
```
Will be optimized to: 
```tsx
import { deepSignal as _deepSignal, $ as _$ } from "@preact-signals/utils";

let a = _deepSignal(10);
let b = _deepSignal(20);

const c = <>{_$(() => a.value * b.value + 10)}</>;
```


In result your components will have less rerender when using state bindings
