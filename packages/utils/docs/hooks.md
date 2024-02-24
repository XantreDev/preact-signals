**Preact signals utils documentation** • [API](README.md)

***

[Preact signals utils documentation](README.md) / hooks

# hooks

## Type Aliases

### AnyRecord

```ts
type AnyRecord: Record<any, any>;
```

#### Source

[hooks/flat-store.ts:6](https://github.com/XantreGodlike/preact-signals/blob/a11836b/packages/utils/src/lib/hooks/flat-store.ts#L6)

***

### UnwrapSignalDeep\<T\>

```ts
type UnwrapSignalDeep<T>: T extends ReadonlySignal<infer V> ? UnwrapSignalDeep<V> : T;
```

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Source

[hooks/useLinkedSignal.ts:8](https://github.com/XantreGodlike/preact-signals/blob/a11836b/packages/utils/src/lib/hooks/useLinkedSignal.ts#L8)

## Functions

### useComputedFlatStore()

```ts
useComputedFlatStore<T>(storeUpdater): Readonly<FlatStore<T>>
```

#### Type parameters

| Type parameter |
| :------ |
| `T` extends [`AnyRecord`](hooks.md#anyrecord) |

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `storeUpdater` | () => `T` |

#### Returns

`Readonly`\<[`FlatStore`](index/README.md#flatstoret)\<`T`\>\>

#### Source

[hooks/flat-store.ts:33](https://github.com/XantreGodlike/preact-signals/blob/a11836b/packages/utils/src/lib/hooks/flat-store.ts#L33)

***

### useComputedOnce()

```ts
useComputedOnce<T>(compute): ReadonlySignal<T>
```

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `compute` | () => `T` | applies only once - on first render, to make function on rerender have short live and be GC-ed with Minor GC. First function can be easily JIT-ed |

#### Returns

`ReadonlySignal`\<`T`\>

static reference computed

#### Source

[hooks/useComputedOnce.ts:9](https://github.com/XantreGodlike/preact-signals/blob/a11836b/packages/utils/src/lib/hooks/useComputedOnce.ts#L9)

***

### useDeepReactive()

```ts
useDeepReactive<T>(creator): UnwrapNestedSignals<T>
```

#### Type parameters

| Type parameter |
| :------ |
| `T` extends `object` |

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `creator` | () => `T` |

#### Returns

[`UnwrapNestedSignals`](index/namespaces/Store.md#unwrapnestedsignalst)\<`T`\>

#### Source

[hooks/store.ts:9](https://github.com/XantreGodlike/preact-signals/blob/a11836b/packages/utils/src/lib/hooks/store.ts#L9)

***

### useDeepSignal()

```ts
useDeepSignal<T>(creator): WrapDeepSignal<T>
```

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `creator` | () => `T` |

#### Returns

[`WrapDeepSignal`](index/README.md#wrapdeepsignalt)\<`T`\>

#### Source

[hooks/store.ts:6](https://github.com/XantreGodlike/preact-signals/blob/a11836b/packages/utils/src/lib/hooks/store.ts#L6)

***

### useFlatStore()

```ts
useFlatStore<T>(storeCreator): readonly [FlatStore<T>, FlatStoreSetter<T>]
```

Create a flat store and its setter.

#### Type parameters

| Type parameter |
| :------ |
| `T` extends [`AnyRecord`](hooks.md#anyrecord) |

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `storeCreator` | () => `T` |

#### Returns

readonly [[`FlatStore`](index/README.md#flatstoret)\<`T`\>, `FlatStoreSetter`\<`T`\>]

#### Source

[hooks/flat-store.ts:11](https://github.com/XantreGodlike/preact-signals/blob/a11836b/packages/utils/src/lib/hooks/flat-store.ts#L11)

***

### useFlatStoreOfSignals()

```ts
useFlatStoreOfSignals<T>(storeCreator): readonly [FlatStore<SetReadonly<{ [TKey in string | number | symbol]: T[TKey] extends ReadonlySignal<TValue> ? TValue : T[TKey] }, keyof { [TKey in string | number | symbol as IfNever<ReadonlyKeysOf<T[TKey]>, never, T[TKey] extends ReadonlySignal<unknown> ? TKey : never>]: T[TKey] }>>, FlatStoreSetter<SetReadonly<{ [TKey in string | number | symbol]: T[TKey] extends ReadonlySignal<TValue> ? TValue : T[TKey] }, keyof { [TKey in string | number | symbol as IfNever<ReadonlyKeysOf<T[TKey]>, never, T[TKey] extends ReadonlySignal<unknown> ? TKey : never>]: T[TKey] }>>]
```

#### Type parameters

| Type parameter |
| :------ |
| `T` extends [`AnyRecord`](hooks.md#anyrecord) |

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `storeCreator` | () => `T` |

#### Returns

readonly [[`FlatStore`](index/README.md#flatstoret)\<`SetReadonly`\<`{ [TKey in string | number | symbol]: T[TKey] extends ReadonlySignal<TValue> ? TValue : T[TKey] }`, keyof `{ [TKey in string | number | symbol as IfNever<ReadonlyKeysOf<T[TKey]>, never, T[TKey] extends ReadonlySignal<unknown> ? TKey : never>]: T[TKey] }`\>\>, `FlatStoreSetter`\<`SetReadonly`\<`{ [TKey in string | number | symbol]: T[TKey] extends ReadonlySignal<TValue> ? TValue : T[TKey] }`, keyof `{ [TKey in string | number | symbol as IfNever<ReadonlyKeysOf<T[TKey]>, never, T[TKey] extends ReadonlySignal<unknown> ? TKey : never>]: T[TKey] }`\>\>]

#### Source

[hooks/flat-store.ts:20](https://github.com/XantreGodlike/preact-signals/blob/a11836b/packages/utils/src/lib/hooks/flat-store.ts#L20)

***

### useInitSignal()

```ts
useInitSignal<T>(init): Signal<T>
```

Allows to create signal function which is called only once, without dependencies tracking

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `init` | () => `T` |

#### Returns

`Signal`\<`T`\>

#### Source

[hooks/utility.ts:16](https://github.com/XantreGodlike/preact-signals/blob/a11836b/packages/utils/src/lib/hooks/utility.ts#L16)

***

### useLinkedSignal()

```ts
useLinkedSignal<T>(value): ReadonlySignal<UnwrapSignalDeep<T>>
```

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `value` | `T` | value that will be unwrapped and linked to result |

#### Returns

`ReadonlySignal`\<[`UnwrapSignalDeep`](hooks.md#unwrapsignaldeept)\<`T`\>\>

#### Example

```tsx
// always linked to value passed to hook
const s1 = useLinkedSignal(Math.random() > 0.5 ? 1 : 0)
// 0 | 1
console.log(s1.peek())

const s2 = useLinkedSignal(Math.random() > 0.5 ? signal(true): false)
// false | true
console.log(s2.peek())

// deeply unwrapping
const s3 = useLinkedSignal(signal(signal(signal(false))))
// false
console.log(s3.peek())
```

#### Source

[hooks/useLinkedSignal.ts:36](https://github.com/XantreGodlike/preact-signals/blob/a11836b/packages/utils/src/lib/hooks/useLinkedSignal.ts#L36)

***

### useReaction()

```ts
useReaction<T>(
   deps, 
   fn, 
   options?): Dispose
```

creates reaction on mount and dispose on unmount

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `deps` | () => `T` |
| `fn` | (`dep`, `options`) => `void` \| `ReactionDispose` |
| `options`? | `ReactionOptions` |

#### Returns

`Dispose`

#### Source

[hooks/useReaction.ts:8](https://github.com/XantreGodlike/preact-signals/blob/a11836b/packages/utils/src/lib/hooks/useReaction.ts#L8)

***

### useResource()

```ts
useResource<TResult, TSource, TRefreshing>(options): CreateResourceReturn<TResult, TRefreshing>
```

#### Type parameters

| Type parameter | Value |
| :------ | :------ |
| `TResult` | - |
| `TSource` extends [`AnyReactive`](index/README.md#anyreactive) | [`Accessor`](index/README.md#accessort)\<`true`\> |
| `TRefreshing` | `boolean` |

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `options` | [`ResourceOptions`](index/README.md#resourceoptionstresulttsourcetrefreshingtsourcedata)\<`TResult`, `TSource`, `TRefreshing`\> | resource are created once, so only first options matter |

#### Returns

[`CreateResourceReturn`](index/README.md#createresourcereturntresulttrefreshing)\<`TResult`, `TRefreshing`\>

#### Source

[hooks/resource.ts:14](https://github.com/XantreGodlike/preact-signals/blob/a11836b/packages/utils/src/lib/hooks/resource.ts#L14)

***

### useShallowReactive()

```ts
useShallowReactive<T>(creator): ShallowReactive<T>
```

#### Type parameters

| Type parameter |
| :------ |
| `T` extends `object` |

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `creator` | () => `T` |

#### Returns

[`ShallowReactive`](index/namespaces/Store.md#shallowreactivet)\<`T`\>

#### Source

[hooks/store.ts:12](https://github.com/XantreGodlike/preact-signals/blob/a11836b/packages/utils/src/lib/hooks/store.ts#L12)

***

### useSignalContext()

```ts
useSignalContext<T>(context): ReadonlySignal<T>
```

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `context` | `Context`\<`T`\> |  |

#### Returns

`ReadonlySignal`\<`T`\>

signal of context value

#### Source

[hooks/utility.ts:51](https://github.com/XantreGodlike/preact-signals/blob/a11836b/packages/utils/src/lib/hooks/utility.ts#L51)

***

### useSignalEffectOnce()

```ts
useSignalEffectOnce(_effect): void
```

Creates effect with with first provided function

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `_effect` | () => `void` \| `Dispose` |

#### Returns

`void`

#### Source

[hooks/utility.ts:59](https://github.com/XantreGodlike/preact-signals/blob/a11836b/packages/utils/src/lib/hooks/utility.ts#L59)

***

### useSignalOfReactive()

```ts
useSignalOfReactive<T>(reactive): ReadonlySignal<GetValue<T>>
```

Creates computed which will subscribe tp reactive value

#### Type parameters

| Type parameter |
| :------ |
| `T` extends [`AnyReactive`](index/README.md#anyreactive) |

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `reactive` | `T` |

#### Returns

`ReadonlySignal`\<[`GetValue`](index/README.md#getvaluet)\<`T`\>\>

#### Source

[hooks/utility.ts:28](https://github.com/XantreGodlike/preact-signals/blob/a11836b/packages/utils/src/lib/hooks/utility.ts#L28)

***

### useSignalOfState()

```ts
useSignalOfState<T>(state): ReadonlySignal<T>
```

Creates signal which state is always equal to state passed to hook

#### Type parameters

| Type parameter |
| :------ |
| `T` |

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `state` | `T` |

#### Returns

`ReadonlySignal`\<`T`\>

#### Source

[hooks/utility.ts:37](https://github.com/XantreGodlike/preact-signals/blob/a11836b/packages/utils/src/lib/hooks/utility.ts#L37)
