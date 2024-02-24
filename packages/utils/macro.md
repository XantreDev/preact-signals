**Preact signals utils documentation** • [API](utils/README.md)

***

[Preact signals utils documentation](utils/README.md) / ../macro

# ../macro

## Functions

### $$()

```ts
$$<T>(value): Uncached<T>
```

This function is compile time shorthand for `$(() => value)`

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `value` | `T` |

#### Returns

[`Uncached`](utils/index/README.md#uncachedt)\<`T`\>

#### Example

```tsx
import { $$ } from "@preact-signals/utils/macro";

// This is equivalent to:
// const a = $(() => 1)
const a = $$(1)
```

#### Example

```tsx
import { $$ } from "@preact-signals/utils/macro";

const a = signal(1)
const sig = signal(1)
const b = $$(a.value + sig.value)

effect(() => {
  console.log(b.value)
})

// logs 3
sig.value = 2

// logs 4
a.value = 2
```

#### Source

[../macro.ts:37](https://github.com/XantreGodlike/preact-signals/blob/a83109b/packages/utils/src/macro.ts#L37)
