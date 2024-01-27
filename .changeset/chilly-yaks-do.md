---
"@preact-signals/utils": minor
---

Implemented macros to simplify creation of `ReactiveRef`-s

Without macros:

```ts
import { $ } from "@preact-signals/utils";

const a = $(() => 1);
```

With macros:

```ts
import { $$ } from "@preact-signals/utils/macro";

const a = $$(1);
```

More information about macros setup can be found in [README](https://github.com/XantreGodlike/preact-signals/tree/main/packages/utils#macro-setup)
