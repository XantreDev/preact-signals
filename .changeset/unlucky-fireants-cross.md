---
"@preact-signals/utils": minor
---

Renamed `Uncached` -> `ReactiveRef`, `WritableUncached` -> `WritableReactiveRef`.
**Still exported as `Uncached` and `WritableUncached` for backwards compatibility. Can be removed in next versions**
Added `writableRefOfObjectProp` and `writableRefOfArrayProp` to create writable refs for object/array properties.
Improved jsdoc comments.
